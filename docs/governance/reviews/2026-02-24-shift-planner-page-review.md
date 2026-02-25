# Wave 1 Review: `shift_planner` (page)

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Manager decisions on weekly schedule construction: slot creation, staff assignment, gap resolution, and exception requests.
   - Admin/owner decisions on approval readiness and export safety for the weekly plan.
   - This page is the primary composition surface for the plan -> validate -> approve -> publish decision loop.

2. What action changes because this exists?
   - Managers can build and iterate on weekly schedules with day-level granularity (slots, assignments, viability, weather context).
   - Managers can submit exception requests and next-week approval submissions.
   - Admins can review readiness, approve, and export the schedule payload for downstream publish.
   - Location, horizon, and week-start filters scope the planning context.

3. What risk is reduced?
   - Reduces risk of schedule construction without guardrail/viability feedback.
   - Assignment gap summaries and weekly readiness checks surface coverage problems before approval.
   - Structured export ensures the publish path receives validated data rather than ad-hoc manual entry.

4. What breaks if removed?
   - No scheduling construction surface exists. The entire plan -> approve -> publish workflow loses its starting point.
   - Both child widgets (shift_planner_day_card, approvals_workbench_panel) lose their composition context.

5. Overlap/duplication check
   - The shift_analysis page shares the same HTML file but addresses a different concern (retrospective analysis vs forward planning). No functional overlap.
   - Weekly plan and approvals sub-tabs within this page segment manager-edit and admin-gate workflows cleanly.

## Comparative-owner need alignment
- This page is manager-first workflow focused. Owner comparative needs (YoY, store-vs-store) are addressed on dashboard/analysis surfaces. The page does surface weekly readiness summaries relevant to owner approval decisions.

## Findings
1. Essential page — the central composition surface for the core product workflow.
2. Composes two already-validated-useful widgets (shift_planner_day_card, approvals_workbench_panel), confirming route-level utility.
3. Permission model distinguishes manager (view, edit, submit) and admin (view, edit, approve, export) capabilities, though enforcement is front-end only.
4. Large monolithic JS file (~178KB) drives all page logic, which is a maintainability concern but not a usefulness concern.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Add server-side permission enforcement for approve and export actions (currently front-end only).
  2. Define which filter combinations should be persisted vs reset on page load.
  3. Track progress on React migration to reduce monolithic script risk.

## Owner feedback (2026-02-25)
- **Missing decisions/questions**:
  - How do we create proposed schedules? Can we check if a previous schedule violated guardrails and propose something differently?
  - How does a proposed schedule compare to the same week in a previous year or average years?
  - How do we assign someone a "regular" shift? How do we handle PTO or shift change requests?
  - Need a way to determine what happens when a guardrail conflicts with margin goals, or when a guardrail changes.
- **Permissions**: Already discussed the need for a different set of roles/permissions with associated settings (see `docs/governance/roles-and-permissions.md`).

## Source evidence
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.html`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2266`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3998`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:4556`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/packages/ui-manifests/pages/shift_planner/page.manifest.json`
