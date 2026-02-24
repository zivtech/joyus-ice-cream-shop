# Wave 1 Review: `approvals_workbench_panel`

Date: 2026-02-24  
Reviewer: `AlexUA`  
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner/admin gate decisions for next-week approval and publish readiness.
   - Admin decisions on manager day-change requests and PTO conflict handling.

2. What action changes because this exists?
   - Approver can accept/reject next-week submission (`Amy Approve` / `Amy Reject`).
   - Approver can resolve pending day policy requests.
   - Operator can refresh PTO sync and evaluate conflict state before approvals.

3. What risk is reduced?
   - Prevents export/publish progression when readiness counters indicate unresolved planning risk.
   - Makes approval state and unresolved blockers visible in one place.

4. What breaks if removed?
   - Approval decisions become fragmented and less auditable.
   - Next-week gate decisions and request queue handling lose their dedicated control surface.

5. Overlap/duplication check
   - Some readiness/status information is duplicated in weekly sidebar and day-card status lines.
   - Core approval actions are not duplicated elsewhere; this panel is still the primary action surface.

## Comparative-owner need alignment
- This panel is workflow/gate focused rather than comparative analytics focused.
- That is acceptable for this artifact because comparative owner needs are primarily dashboard/analysis responsibilities.

## Findings
1. High usefulness for approval governance and publish-safety gate.
2. Action ownership is clear, but role controls are mostly UI/state based and need service-side hardening.
3. Readiness summaries are repeated across surfaces, increasing cognitive noise.

## Recommendation
- Recommended state: `validated_useful` (with redesign/hardening follow-ups).
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Consolidate duplicated readiness messaging with a single source-of-truth summary component.
  2. Add role-aware enforcement at service/API layer for approve/reject actions.
  3. Clarify PTO conflict policy semantics (block all vs block overlapping slots only).

## Source evidence
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2638`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2701`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3422`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3463`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:4012`
