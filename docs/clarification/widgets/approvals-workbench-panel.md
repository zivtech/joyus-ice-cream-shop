# Approvals Workbench Panel

## Metadata
- Widget ID: `approvals_workbench_panel`
- Parent page(s): `shift_planner`
- Owner: Scheduling workflow owner (to assign in manifest)
- Last clarified: 2026-02-24

## Purpose
- Centralize all approval decisions for next-week readiness, day-level policy requests, and PTO conflict visibility before schedule publish/export.

## Data source and transform path
- Next-week gate inputs: `state.nextWeekApproval`, `nextWeekChecks()`, and week/day slot coverage state.
- Day requests source: `state.requests` split by status (`pending`, `approved`, `rejected`).
- PTO scope source: `state.ptoSync` + `ptoRowsForRange(scope, startDate, endDate)` with scoped sorting.
- Sync refresh path: `syncPtoFromSquare()` endpoint call with cached-source fallback.

## Calculation logic
- Next-week readiness counters include:
  - pending day requests
  - unsubmitted policy edits
  - unassigned slot positions
  - invalid coverage days
  - PTO conflicts
- Amy gate submission is blocked until all counters reach zero.
- Day-request approval transitions:
  - mark request reviewed
  - clear day pending-request linkage
  - set day decision state
  - re-open edits when rejected.
- PTO panel computes pending/approved totals, sync health class, and sorted request rows in active date range.

## Visual logic
- Subtab body switches by `approvalsSubtab`:
  1. `next_week`
  2. `day_requests`
  3. `pto_requests`
- Status tones use `status-ok`, `status-pending`, and `status-risk` classes.
- Request cards show state-specific actions only where transitions are allowed.

## Interactions and actions
- Amy approval actions: `Amy Approve` / `Amy Reject` for pending next-week submissions.
- Day request actions: `Approve` / `Reject` on pending manager requests.
- PTO sync action: `Sync PTO from Square` refreshes scoped PTO status and rows.
- Subtab selection switches the workbench focus within Approvals page.

## Dependencies and side effects
- Live endpoint dependency: `/api/v1/integrations/square/pto`.
- Mutates planner state (`requests`, `nextWeekApproval`, day request linkage, PTO sync metadata).
- Persists changes through planner `saveState()` and rerenders workflow views.

## Known limitations
- Approval logic is front-end state driven; service-level policy enforcement is not yet authoritative.
- No role/permission hardening at API layer in this implementation.
- PTO sync errors are surfaced in UI but retry/backoff policies are minimal.

## Open questions
- Should Amy approval support delegation and multi-approver fallback?
- Should request reasons be typed/categorized for analytics and policy tuning?
- Should PTO conflicts block only overlapping slots or all next-week submission by default?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:1347`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2638`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3384`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3974`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:4317`
