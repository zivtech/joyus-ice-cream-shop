# Wave 2 Review: `trigger_gap_planner_panel`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner decision on when to scale staffing up/down based on configurable trigger thresholds.
   - Owner understanding of how close current metrics are to the next scaling transition.

2. What action changes because this exists?
   - Owners and GMs can see the nearest unmet trigger and the specific condition gap that must close before the next scaling move.
   - Suggested action copy guides the scaling decision with concrete threshold targets.
   - Per-location cards enable store-specific timing decisions.

3. What risk is reduced?
   - Reduces risk of missing seasonal scaling windows by quantifying the gap to trigger thresholds.
   - Reduces guesswork in scale-up/down timing by normalizing gap severity across conditions.

4. What breaks if removed?
   - No trigger gap analysis. Owners and GMs would need to manually compare metrics against thresholds to determine scaling readiness.
   - Charter core outcome #1 ("seasonal staffing scale up/down timing") loses its primary decision support surface.

5. Overlap/duplication check
   - Scale timing monitor panel shows historical trigger hit rates and met/gap status. This panel shows forward-looking gap analysis with suggested actions. Complementary: monitor is retrospective, this is prospective.

## Comparative-owner need alignment
- Supports owner strategic scaling decisions. Per-location cards enable store-to-store comparison of scaling readiness.

## Findings
1. High usefulness — directly supports charter core outcome #1 with quantified gap analysis and suggested actions.
2. Normalized gap scoring across conditions provides fair comparison of different threshold types.
3. All-met vs gap states provide clear binary status at a glance.
4. Trigger rules are UI-state only — no server-side persistence or approval workflow for threshold changes.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Add change tracking for trigger rule modifications (who changed what, when).
  2. Consider adding confidence intervals to gap estimates based on data volatility.
  3. Add historical accuracy tracking (how often did trigger-based timing recommendations prove correct).

## Source evidence
- `apps/ice-cream-ops/app.js:2149`
- `apps/ice-cream-ops/app.js:2257`
- `apps/ice-cream-ops/app.js:2306`
- `packages/ui-manifests/widgets/trigger_gap_planner_panel/widget.manifest.json`
