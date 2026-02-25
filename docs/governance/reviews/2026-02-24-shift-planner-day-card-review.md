# Wave 1 Review: `shift_planner_day_card`

Date: 2026-02-24  
Reviewer: `AlexUA`  
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Manager day-level staffing decisions (slot structure, assignments, weather adjustments).
   - Admin/owner readiness for day-change request approval and export safety.

2. What action changes because this exists?
   - Managers can edit/add/delete slots, assign staff, copy prior-week templates, and submit exception requests.
   - Managers can immediately see viability/weather/PTO context before requesting exceptions.

3. What risk is reduced?
   - Coverage-risk and exception errors are surfaced before request/export (`dayValidation`, pending-request checks).
   - Staffing decisions are less blind by including viability and weather context in-card.

4. What breaks if removed?
   - There is no equivalent day-level editing cockpit for schedule construction.
   - Approvals/export flows lose the primary source of structured day changes.

5. Overlap/duplication check
   - Partial overlap exists with `approvals_workbench_panel` and weekly sidebar on readiness/status messaging.
   - Not a functional duplicate: this widget is the primary edit surface, while approvals is the gate/review surface.

## Comparative-owner need alignment
- This widget is manager-first and does not itself satisfy owner comparative analysis needs (YoY/store-vs-store/portfolio/industry).
- That gap is acceptable at widget level because comparative owner needs are primarily addressed in dashboard/analysis surfaces.

## Findings
1. High usefulness for core manager workflow: strong alignment with plan -> validate -> approve -> publish loop.
2. Information density is high and likely contributes to cognitive load (especially mobile), but this is redesign scope, not removal scope.
3. Role-based action constraints are still weak at runtime; governance/permissions hardening remains a separate requirement.

## Recommendation
- Recommended state: `validated_useful` (with redesign follow-ups).
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Split dense card sections into progressive disclosure (`basic edit` vs `advanced context`).
  2. Reduce duplicated readiness messaging between day card, sidebar, and approvals.
  3. Enforce role-aware controls for request submission/approval actions.

## Source evidence
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2266`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2291`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2420`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2638`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3963`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:4036`
