# Usefulness Review Priority Queue

Date: 2026-02-24
Reviewer: `AlexUA`

## Ranking method
All clarification docs currently carry the same number of open-question bullets.

Tie-breaker used:
1. Cross-flow impact (planning -> approval -> publish risk).
2. Compliance/legal exposure if misunderstood.
3. Number of downstream surfaces/contracts affected.

## Wave 1 (start here)
1. `shift_planner_day_card` (widget)
   - Core day-level planning object feeding approvals and export.
2. `approvals_workbench_panel` (widget)
   - Final operational gate before export/publish.
3. `square_schedule_publish` (interface)
   - External side-effect path to Square; mistakes have immediate operational impact.
4. `compliance_check` (interface)
   - Compliance gate definition drives block/pass semantics.
5. `operations_settings_panel` (widget)
   - Upstream assumptions/guardrails that influence planner and approval behavior.
6. `shift_planner` (page)
   - Route-level composition and actions for end-to-end weekly flow.
7. `settings` (page)
   - Route-level control plane for guardrails and compliance scaffolding.

## Review rule
- Evaluate each item against `docs/planning/00-baseline-constitution.md` first.
- Include overlap/duplication assessment so redundant artifacts are flagged for redesign or removal.
- Items remain `validation.state = unreviewed` until explicit usefulness judgment is recorded.
- Promotion to `validated_useful`/`active` requires explicit decision updates in manifest validation fields.
