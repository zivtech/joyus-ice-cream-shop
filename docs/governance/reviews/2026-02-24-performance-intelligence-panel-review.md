# Wave 2 Review: `performance_intelligence_panel`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner understanding of why a period was better or worse: best/worst month identification, peak vs weak hours, demand shape analysis.
   - Owner year-over-year comparison when sufficient data exists.

2. What action changes because this exists?
   - Owners and GMs can identify their strongest and weakest months for targeted staffing adjustments.
   - Weekend revenue share and evening peak share inform schedule weighting decisions.
   - YoY narrative provides growth/decline context for strategic planning.

3. What risk is reduced?
   - Reduces risk of making operating decisions without understanding demand shape patterns.
   - Explicit "insufficient YoY overlap" messaging prevents false confidence from incomplete data.

4. What breaks if removed?
   - No consolidated performance summary with best/worst identification. Owners and GMs would need to manually scan monthly data.
   - YoY narrative and demand shape insights have no other surface.

5. Overlap/duplication check
   - Historical trend panel shows continuous monthly series; this panel provides discrete superlative identification and demand shape metrics. Complementary views of the same data, not functional duplication.

## Comparative-owner need alignment
- Directly addresses owner needs for year-over-year comparison and understanding performance patterns.

## Findings
1. High usefulness for owner strategic decisions through consolidated performance insights.
2. Four-card layout (best/worst month, peak vs weak hour, demand shape, yearly table) provides good information density.
3. YoY narrative correctly guards against insufficient data with explicit messaging.
4. Yearly summary table provides the clearest cross-year revenue/labor/GP comparison.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Add store-to-store comparison view for multi-location owners.
  2. Consider adding portfolio average benchmarks to yearly table.
  3. Add explicit data confidence indicators for months with modeled data.

## Source evidence
- `apps/ice-cream-ops/app.js:1896`
- `apps/ice-cream-ops/app.js:1957`
- `apps/ice-cream-ops/app.js:1969`
- `packages/ui-manifests/widgets/performance_intelligence_panel/widget.manifest.json`
