# Wave 1 Review: `square_schedule_publish`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner/admin decision to push an approved weekly schedule to Square for operational execution.
   - GM confidence that only approved, validated plans reach the external system.

2. What action changes because this exists?
   - Approved schedules are translated into Square Scheduled Shifts via MCP with preflight validation gates.
   - Dry-run mode allows operators to preview what will be created before committing.
   - Duplicate detection prevents re-publishing identical shifts already in Square.

3. What risk is reduced?
   - Prevents publishing unapproved or incomplete schedules (approval status, reviewer metadata, workflow flag checks).
   - Catches overlapping shifts, excessive shift durations, pending policy requests, and location mismatches before any external write.
   - Idempotency keys prevent accidental double-creation.

4. What breaks if removed?
   - No governed path from approved plan to Square. Operators would need to manually enter shifts or use an unvalidated export, losing all preflight safety checks.
   - The plan -> approve -> publish decision loop loses its terminal step.

5. Overlap/duplication check
   - The HTTP endpoint contract and the Python script contract describe the same logical operation at two transport layers (API and CLI script).
   - This is not harmful duplication — they serve different invocation contexts (service call vs admin CLI). Both should exist.
   - No overlap with other interfaces; this is the only Square publish path.

## Comparative-owner need alignment
- This interface is execution/publish focused, not comparative analytics. That is appropriate — it is the terminal action in the decision loop, not an analysis surface.

## Findings
1. High usefulness as the only governed publish path to Square with comprehensive preflight validation.
2. Preflight checks are thorough: approval status, reviewer validity, workflow flags, location consistency, duplicate dates, pending requests, shift duration limits, overlap detection.
3. The script is safe-by-default (dry-run unless --apply, no publish unless --publish).
4. Name resolution uses fuzzy fallback which could produce false matches for common names in larger rosters.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Add structured audit logging for all publish operations (not just console output).
  2. Harden name resolution for multi-store rosters with disambiguous identifiers (team_member_id passthrough from planner).
  3. Add rollback/undo capability or at minimum a "list recently published" report for error recovery.

## Source evidence
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/scripts/publish_schedule_to_square_mcp.py:1`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/scripts/publish_schedule_to_square_mcp.py:229`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/scripts/publish_schedule_to_square_mcp.py:572`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/packages/ui-manifests/interfaces/square_schedule_publish/interface.manifest.json`
