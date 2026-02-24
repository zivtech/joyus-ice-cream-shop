# Wave 2 Review: `staffing_recompute`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Manager decision on schedule recommendations after changing assumptions (staffing rules, targets, operating parameters).
   - Owner what-if analysis through scenario simulations with updated inputs.

2. What action changes because this exists?
   - Planner can re-generate schedule recommendations when assumptions change rather than manually adjusting each slot.
   - Scenario analysis surface can run what-if staffing simulations with different parameters.
   - MCP integration enables assistant-driven recompute workflows.

3. What risk is reduced?
   - Reduces risk of schedule recommendations becoming stale after assumption changes.
   - Reduces manual effort of propagating assumption changes across all schedule slots.

4. What breaks if removed?
   - Schedule recommendations after assumption changes would need manual reconstruction.
   - What-if simulation capability loses its triggering interface.

5. Overlap/duplication check
   - No other interface handles recommendation recomputation. The current planner does inline recalculation, but this interface formalizes it as a first-class operation. Not duplicative — it governs existing behavior.

## Comparative-owner need alignment
- Supports owner scenario analysis through what-if simulations. Not directly a comparative interface but enables the data that feeds comparative views.

## Findings
1. Useful as the formalization of recommendation recomputation — governs a behavior that currently exists ad-hoc in the planner.
2. Interface shape is extracted from recovered planning docs and needs product/engine review before implementation.
3. Two consumers defined (shift_planner, scenario_analysis), confirming cross-surface utility.
4. No production implementation yet — this is a forward-looking interface definition.

## Recommendation
- Recommended state: `validated_useful` (as interface specification; implementation pending).
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Define exact recomputation scope: which assumptions trigger which recommendation changes.
  2. Add versioning for recommendation sets so before/after comparison is possible.
  3. Define latency expectations for recompute operations.

## Source evidence
- `packages/ui-manifests/interfaces/staffing_recompute/interface.manifest.json`
- `docs/planning/recovered/joyus-fast-casual-data-sync-foundation-2026-02-21.md`
- `docs/planning/recovered/joyus-fast-casual-feature-tracker-2026-02-21.md`
