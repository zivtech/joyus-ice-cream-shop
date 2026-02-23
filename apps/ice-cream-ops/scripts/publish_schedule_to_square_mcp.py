#!/usr/bin/env python3
"""Publish approved Milk Jawn staffing plans to Square Scheduled Shifts via MCP.

Safe by default:
- Dry-run unless --apply is provided.
- Does not publish newly created shifts unless --publish is provided.
- Skips exact duplicates already in Square.

Expected input is the exported planner JSON from staffing-planner.html.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import threading
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

ET = ZoneInfo("America/New_York")

LOCATION_IDS = {
    "EP": "LYPJTCTZKM211",
    "NL": "LDBQAYTKVHZAT",
}


def normalize_name(raw: str) -> str:
    txt = (raw or "").strip().lower()
    out = []
    prev_space = False
    for ch in txt:
        if ch.isalnum():
            out.append(ch)
            prev_space = False
        else:
            if not prev_space:
                out.append(" ")
                prev_space = True
    return " ".join("".join(out).split())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--plan-file", required=True, help="Path to exported planner JSON")
    parser.add_argument("--location", choices=["EP", "NL"], help="Override location from plan")
    parser.add_argument("--apply", action="store_true", help="Actually create/update shifts (default: dry-run)")
    parser.add_argument("--dry-run", action="store_true", help="Explicitly run in dry-run mode (default behavior)")
    parser.add_argument("--publish", action="store_true", help="Publish each created shift after creation")
    parser.add_argument("--allow-unmatched-names", action="store_true", help="Skip unresolved names instead of failing")
    parser.add_argument("--force", action="store_true", help="Ignore approval/policy validation failures")
    parser.add_argument("--job-scooper", help="Square job_id override for scooper roles")
    parser.add_argument("--job-key-lead", help="Square job_id override for lead roles")
    parser.add_argument("--job-manager", help="Square job_id override for manager roles")
    parser.add_argument("--report-file", help="Optional JSON report output path")
    parser.add_argument("--verbose", action="store_true")
    return parser.parse_args()


def log(msg: str) -> None:
    print(msg, flush=True)


class MCPClient:
    def __init__(self, url: str, verbose: bool = False):
        self.verbose = verbose
        self.proc = subprocess.Popen(
            ["npx", "-y", "mcp-remote", url],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )
        self.next_id = 1
        self._stderr_thread = threading.Thread(target=self._pump_stderr, daemon=True)
        self._stderr_thread.start()
        self._initialize()

    def _pump_stderr(self) -> None:
        assert self.proc.stderr is not None
        for raw in self.proc.stderr:
            if self.verbose:
                sys.stderr.write(raw)

    def _send(self, msg: dict[str, Any]) -> None:
        assert self.proc.stdin is not None
        self.proc.stdin.write(json.dumps(msg) + "\n")
        self.proc.stdin.flush()

    def _read(self, timeout_sec: int = 180) -> dict[str, Any]:
        assert self.proc.stdout is not None
        start = time.time()
        while time.time() - start < timeout_sec:
            line = self.proc.stdout.readline()
            if not line:
                if self.proc.poll() is not None:
                    raise RuntimeError("mcp-remote process closed")
                time.sleep(0.05)
                continue
            try:
                return json.loads(line)
            except json.JSONDecodeError:
                continue
        raise TimeoutError("Timed out waiting for MCP response")

    def _request(self, method: str, params: dict[str, Any], timeout_sec: int = 180) -> dict[str, Any]:
        req_id = self.next_id
        self.next_id += 1
        self._send({"jsonrpc": "2.0", "id": req_id, "method": method, "params": params})
        while True:
            msg = self._read(timeout_sec=timeout_sec)
            if msg.get("id") != req_id:
                continue
            if "error" in msg:
                raise RuntimeError(f"MCP error on {method}: {msg['error']}")
            return msg["result"]

    def _initialize(self) -> None:
        self._request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "milkjawn-schedule-publish", "version": "0.1"},
            },
        )
        self._send({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}})

    def call_tool(self, name: str, arguments: dict[str, Any], timeout_sec: int = 300) -> dict[str, Any]:
        return self._request(
            "tools/call",
            {
                "name": name,
                "arguments": arguments,
            },
            timeout_sec=timeout_sec,
        )

    def close(self) -> None:
        if self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.proc.kill()


def parse_tool_text_json(result: dict[str, Any]) -> dict[str, Any]:
    content = result.get("content", [])
    if not content:
        return {}
    txt = content[0].get("text", "")
    return json.loads(txt)


def make_api_request(
    mcp: MCPClient,
    service: str,
    method: str,
    request: dict[str, Any] | None,
    characterization: str,
    retries: int = 3,
) -> dict[str, Any]:
    args: dict[str, Any] = {
        "service": service,
        "method": method,
        "characterization": characterization,
    }
    if request is not None:
        args["request"] = request

    wait = 1.0
    for attempt in range(1, retries + 1):
        raw = mcp.call_tool("make_api_request", args)
        payload = parse_tool_text_json(raw)
        if payload.get("errors"):
            if attempt == retries:
                return payload
            time.sleep(wait)
            wait *= 2
            continue
        return payload
    return {"errors": [{"detail": "Unknown error"}]}


@dataclass
class PlannedShift:
    date: str
    role: str
    assigned_name: str
    location_code: str
    location_id: str
    start_at: str
    end_at: str


def parse_local_dt(date_iso: str, hhmm: str) -> datetime:
    y, m, d = [int(x) for x in date_iso.split("-")]
    hh, mm = [int(x) for x in hhmm.split(":")]
    return datetime(y, m, d, hh, mm, 0, tzinfo=ET)


def iso_with_seconds(dt: datetime) -> str:
    return dt.isoformat(timespec="seconds")


def load_plan(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Plan file not found: {path}")
    return json.loads(path.read_text())


def validate_plan(plan: dict[str, Any], force: bool = False) -> list[str]:
    issues: list[str] = []

    next_week = (plan.get("approvals") or {}).get("nextWeek") or {}
    status = (next_week.get("status") or "").lower()
    if status != "approved":
        issues.append("Amy next-week approval is not approved.")

    weeks = plan.get("weeks") or []
    for week_idx, week in enumerate(weeks):
        for day in week.get("days") or []:
            if day.get("pendingRequestId"):
                issues.append(f"Week {week_idx + 1} day {day.get('date')}: pending request exists.")
            if day.get("policyChanged"):
                issues.append(f"Week {week_idx + 1} day {day.get('date')}: unsubmitted policy edits exist.")

    if issues and not force:
        return issues
    return []


def extract_planned_shifts(plan: dict[str, Any], location_code: str) -> tuple[list[PlannedShift], int]:
    location_id = LOCATION_IDS[location_code]
    rows: list[PlannedShift] = []
    unassigned_positions = 0

    for week in plan.get("weeks") or []:
        for day in week.get("days") or []:
            day_date = day.get("date")
            if not day_date:
                continue
            for slot in day.get("slots") or []:
                role = (slot.get("role") or "Scooper").strip()
                start_raw = (slot.get("start") or "").strip()
                end_raw = (slot.get("end") or "").strip()
                if not start_raw or not end_raw:
                    continue

                try:
                    start_dt = parse_local_dt(day_date, start_raw)
                    end_dt = parse_local_dt(day_date, end_raw)
                except Exception:
                    continue

                if end_dt <= start_dt:
                    end_dt = end_dt + timedelta(days=1)

                assignments = slot.get("assignments") or []
                headcount = max(1, int(slot.get("headcount") or len(assignments) or 1))
                for idx in range(headcount):
                    assigned = (assignments[idx] if idx < len(assignments) else "") or ""
                    assigned = assigned.strip()
                    if not assigned:
                        unassigned_positions += 1
                        continue

                    rows.append(
                        PlannedShift(
                            date=day_date,
                            role=role,
                            assigned_name=assigned,
                            location_code=location_code,
                            location_id=location_id,
                            start_at=iso_with_seconds(start_dt),
                            end_at=iso_with_seconds(end_dt),
                        )
                    )

    return rows, unassigned_positions


def fetch_team_members(mcp: MCPClient, location_id: str) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    cursor = ""
    while True:
        req: dict[str, Any] = {
            "query": {
                "filter": {
                    "location_ids": [location_id],
                    "status": "ACTIVE",
                }
            },
            "limit": 100,
        }
        if cursor:
            req["cursor"] = cursor
        payload = make_api_request(
            mcp,
            service="team",
            method="searchMembers",
            request=req,
            characterization="Resolve team members for staffing plan publish",
        )
        out.extend(payload.get("team_members") or [])
        cursor = payload.get("cursor") or ""
        if not cursor:
            break
    return out


def team_member_maps(team_members: list[dict[str, Any]]) -> tuple[dict[str, list[str]], dict[str, str]]:
    by_norm: dict[str, list[str]] = {}
    id_to_name: dict[str, str] = {}
    for tm in team_members:
        tm_id = tm.get("id")
        if not tm_id:
            continue
        given = (tm.get("given_name") or "").strip()
        family = (tm.get("family_name") or "").strip()
        full = f"{given} {family}".strip() or tm_id
        id_to_name[tm_id] = full

        key = normalize_name(full)
        by_norm.setdefault(key, []).append(tm_id)
    return by_norm, id_to_name


def resolve_member_id(name: str, by_norm: dict[str, list[str]], id_to_name: dict[str, str]) -> tuple[str | None, str | None]:
    wanted = normalize_name(name)
    ids = by_norm.get(wanted) or []
    if len(ids) == 1:
        return ids[0], None
    if len(ids) > 1:
        return None, f"Ambiguous name '{name}' matched {len(ids)} active team members"

    # Fuzzy fallback: token containment.
    wanted_tokens = set(wanted.split())
    candidates: list[str] = []
    for tm_id, full in id_to_name.items():
        norm_full = normalize_name(full)
        full_tokens = set(norm_full.split())
        if wanted_tokens and (wanted_tokens.issubset(full_tokens) or full_tokens.issubset(wanted_tokens)):
            candidates.append(tm_id)

    if len(candidates) == 1:
        return candidates[0], None
    if len(candidates) > 1:
        return None, f"Ambiguous fuzzy match for '{name}'"

    return None, f"No active team member match for '{name}'"


def fetch_jobs(mcp: MCPClient) -> list[dict[str, Any]]:
    jobs: list[dict[str, Any]] = []
    cursor = ""
    while True:
        req: dict[str, Any] = {}
        if cursor:
            req["cursor"] = cursor
        payload = make_api_request(
            mcp,
            service="team",
            method="listJobs",
            request=req,
            characterization="Resolve job IDs for staffing plan publish",
        )
        jobs.extend(payload.get("jobs") or [])
        cursor = payload.get("cursor") or ""
        if not cursor:
            break
    return jobs


def build_job_lookup(jobs: list[dict[str, Any]]) -> dict[str, str]:
    out: dict[str, str] = {}
    for job in jobs:
        job_id = job.get("id")
        title = normalize_name(job.get("title") or "")
        if job_id and title:
            out[title] = job_id
    return out


def choose_job_ids(job_lookup: dict[str, str], args: argparse.Namespace) -> dict[str, str]:
    scooper = args.job_scooper or job_lookup.get(normalize_name("Scooper")) or job_lookup.get(normalize_name("Team Member"))
    key_lead = args.job_key_lead or job_lookup.get(normalize_name("Key Lead")) or job_lookup.get(normalize_name("Assistant Manager"))
    manager = args.job_manager or job_lookup.get(normalize_name("Managers")) or job_lookup.get(normalize_name("Shop Manager"))

    missing = []
    if not scooper:
        missing.append("scooper")
    if not key_lead:
        missing.append("key lead")
    if not manager:
        missing.append("manager")
    if missing:
        raise RuntimeError(f"Missing required Square job IDs for: {', '.join(missing)}")

    return {
        "scooper": scooper,
        "key_lead": key_lead,
        "manager": manager,
    }


def role_to_job_id(role: str, job_ids: dict[str, str]) -> str:
    r = normalize_name(role)
    if "manager" in r:
        return job_ids["manager"]
    if "lead" in r:
        return job_ids["key_lead"]
    return job_ids["scooper"]


def fetch_existing_scheduled_shifts(
    mcp: MCPClient,
    location_id: str,
    start_at: str,
    end_at: str,
) -> dict[tuple[str, str, str, str, str], dict[str, Any]]:
    existing: dict[tuple[str, str, str, str, str], dict[str, Any]] = {}
    cursor = ""

    while True:
        req: dict[str, Any] = {
            "query": {
                "filter": {
                    "location_ids": [location_id],
                    "start": {
                        "start_at": start_at,
                        "end_at": end_at,
                    },
                },
                "sort": {
                    "sort_field": "START_AT",
                    "sort_order": "ASC",
                },
            },
            "limit": 100,
        }
        if cursor:
            req["cursor"] = cursor

        payload = make_api_request(
            mcp,
            service="labor",
            method="searchScheduledShifts",
            request=req,
            characterization="Find existing scheduled shifts to prevent duplicates",
        )

        for shift in payload.get("scheduled_shifts") or []:
            details = shift.get("draft_shift_details") or shift.get("published_shift_details") or {}
            if details.get("is_deleted"):
                continue
            key = (
                details.get("team_member_id") or "",
                details.get("location_id") or "",
                details.get("job_id") or "",
                details.get("start_at") or "",
                details.get("end_at") or "",
            )
            if all(key):
                existing[key] = {
                    "id": shift.get("id"),
                    "version": shift.get("version"),
                }

        cursor = payload.get("cursor") or ""
        if not cursor:
            break

    return existing


def deterministic_idempotency(seed: str) -> str:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()[:24]
    return str(uuid.uuid5(uuid.NAMESPACE_URL, digest))


def main() -> None:
    args = parse_args()
    if args.dry_run:
        args.apply = False
    plan_file = Path(args.plan_file).expanduser().resolve()
    plan = load_plan(plan_file)

    location_code = args.location or plan.get("location")
    if location_code not in LOCATION_IDS:
        raise RuntimeError(f"Unknown location code: {location_code}")

    validation_issues = validate_plan(plan, force=args.force)
    if validation_issues:
        raise RuntimeError("Plan validation failed:\n- " + "\n- ".join(validation_issues))

    planned_rows, unassigned_positions = extract_planned_shifts(plan, location_code)
    if unassigned_positions > 0 and not args.force:
        raise RuntimeError(f"Plan contains {unassigned_positions} unassigned positions. Resolve before publish.")

    if not planned_rows:
        log("No assigned shifts to publish.")
        return

    start_at = min(row.start_at for row in planned_rows)
    end_at = max(row.end_at for row in planned_rows)

    mcp = MCPClient("https://mcp.squareup.com/sse", verbose=args.verbose)
    try:
        team_members = fetch_team_members(mcp, LOCATION_IDS[location_code])
        by_norm, id_to_name = team_member_maps(team_members)

        jobs = fetch_jobs(mcp)
        job_lookup = build_job_lookup(jobs)
        job_ids = choose_job_ids(job_lookup, args)

        existing = fetch_existing_scheduled_shifts(mcp, LOCATION_IDS[location_code], start_at, end_at)

        unmatched: list[str] = []
        prepared: list[tuple[PlannedShift, str, str]] = []  # row, team_member_id, job_id
        for row in planned_rows:
            team_member_id, err = resolve_member_id(row.assigned_name, by_norm, id_to_name)
            if not team_member_id:
                unmatched.append(err or f"Unresolved name: {row.assigned_name}")
                continue
            job_id = role_to_job_id(row.role, job_ids)
            prepared.append((row, team_member_id, job_id))

        if unmatched and not args.allow_unmatched_names:
            uniq = sorted(set(unmatched))
            raise RuntimeError("Unresolved team members:\n- " + "\n- ".join(uniq))

        created = 0
        published = 0
        skipped_existing = 0
        skipped_unmatched = len(unmatched)
        errors: list[str] = []

        for row, team_member_id, job_id in prepared:
            key = (team_member_id, row.location_id, job_id, row.start_at, row.end_at)
            if key in existing:
                skipped_existing += 1
                continue

            notes = f"Joyus Ice Cream Shop planner · {row.role}"
            seed = f"{row.location_id}|{team_member_id}|{job_id}|{row.start_at}|{row.end_at}|{row.role}"
            create_idempotency = deterministic_idempotency(seed + "|create")

            if not args.apply:
                log(
                    f"DRY RUN create: {row.date} {row.start_at}->{row.end_at} | {row.assigned_name} | {row.role} | job={job_id}"
                )
                continue

            create_req = {
                "idempotency_key": create_idempotency,
                "scheduled_shift": {
                    "draft_shift_details": {
                        "team_member_id": team_member_id,
                        "location_id": row.location_id,
                        "job_id": job_id,
                        "start_at": row.start_at,
                        "end_at": row.end_at,
                        "notes": notes,
                        "is_deleted": False,
                    }
                },
            }

            create_payload = make_api_request(
                mcp,
                service="labor",
                method="createScheduledShift",
                request=create_req,
                characterization="Create scheduled shifts from approved staffing plan",
            )
            if create_payload.get("errors"):
                errors.append(f"Create failed for {row.assigned_name} {row.start_at}: {create_payload.get('errors')}")
                continue

            created += 1
            scheduled_shift = create_payload.get("scheduled_shift") or {}
            shift_id = scheduled_shift.get("id")
            version = scheduled_shift.get("version")

            if args.publish and shift_id:
                publish_req: dict[str, Any] = {
                    "id": shift_id,
                    "idempotency_key": deterministic_idempotency(seed + "|publish"),
                }
                if isinstance(version, int):
                    publish_req["version"] = version

                publish_payload = make_api_request(
                    mcp,
                    service="labor",
                    method="publishScheduledShift",
                    request=publish_req,
                    characterization="Publish scheduled shifts from approved staffing plan",
                )
                if publish_payload.get("errors"):
                    errors.append(f"Publish failed for shift {shift_id}: {publish_payload.get('errors')}")
                else:
                    published += 1

        report = {
            "generated_at": datetime.now(ET).isoformat(timespec="seconds"),
            "plan_file": str(plan_file),
            "location": location_code,
            "location_id": LOCATION_IDS[location_code],
            "mode": "apply" if args.apply else "dry-run",
            "publish": bool(args.publish),
            "total_assigned_rows": len(planned_rows),
            "prepared_rows": len(prepared),
            "unassigned_positions": unassigned_positions,
            "skipped_unmatched": skipped_unmatched,
            "skipped_existing": skipped_existing,
            "created": created,
            "published": published,
            "errors": errors,
        }

        log(json.dumps(report, indent=2))

        if args.report_file:
            out = Path(args.report_file).expanduser().resolve()
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(json.dumps(report, indent=2))
            log(f"Wrote report to {out}")

        if errors:
            raise RuntimeError(f"Completed with {len(errors)} error(s). See report output above.")

    finally:
        mcp.close()


if __name__ == "__main__":
    main()
