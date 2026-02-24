# Wave 2 Review: `recent_staffing_analysis_panel`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner/manager decision on whether recent staffing outcomes met expectations and why variances occurred.
   - Owner understanding of why a week was better or worse than expected (constitution decision loop step 6: Learn).

2. What action changes because this exists?
   - Operators can compare actual performance against planned targets or historical baselines with explicit source attribution.
   - Weather-alignment summaries help distinguish weather-driven variance from operational variance.
   - Context notes create institutional memory for future planning cycles.
   - Planned-vs-actual fallback behavior is transparently disclosed per day.

3. What risk is reduced?
   - Reduces risk of repeating staffing mistakes by surfacing retrospective variance analysis.
   - Expected-source attribution prevents false confidence when planned targets are missing and historical baselines are substituted.
   - Weather context reduces risk of misattributing external factors to operational failures.

4. What breaks if removed?
   - No retrospective staffing analysis. The decision loop's "Learn" step loses its primary surface.
   - Planned-vs-actual variance model and transparent fallback disclosure have no other surface.

5. Overlap/duplication check
   - Historical trend panel provides monthly trend lines; this panel provides day-level variance analysis with attribution. Different granularity and purpose.
   - Performance intelligence panel provides superlative identification; this panel provides recent operational review. Complementary.

## Comparative-owner need alignment
- Portfolio-level attainment summaries support cross-store comparison. Location cards enable store-specific retrospective analysis.

## Findings
1. High usefulness for the "Learn" phase of the decision loop — the only retrospective analysis surface with day-level granularity.
2. Expected-source attribution (planned_targets/mixed_fallback/historical_baseline_fallback) is a strong transparency feature.
3. Weather-alignment integration adds context that pure financial analysis cannot provide.
4. Context notes feature creates valuable institutional memory for future planning.
5. Version 1.1.0 indicates this widget has already been enhanced, confirming ongoing investment.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Migrate context notes from localStorage to server-side for multi-user access and durability.
  2. Add confidence scoring for weather attribution strength.
  3. Consider using versioned schedule snapshots from approvals for more precise planned-vs-actual comparison.

## Source evidence
- `apps/ice-cream-ops/staffing-planner.js:1820`
- `apps/ice-cream-ops/staffing-planner.js:2823`
- `apps/ice-cream-ops/staffing-planner.js:2837`
- `apps/ice-cream-ops/staffing-planner.js:2946`
- `packages/ui-manifests/widgets/recent_staffing_analysis_panel/widget.manifest.json`
