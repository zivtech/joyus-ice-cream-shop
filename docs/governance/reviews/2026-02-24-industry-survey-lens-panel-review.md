# Wave 2 Review: `industry_survey_lens_panel`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner decision on whether current labor costs are competitive relative to industry benchmarks.
   - Owner understanding of dollar opportunity if labor ratio moved to median or top quartile.

2. What action changes because this exists?
   - Operators can see their labor percentage position against industry peers and act on the delta.
   - Weekly dollar opportunity estimates (delta-to-median, delta-to-top-quartile) give concrete savings targets.
   - Benchmark tone classification (good/watch/risk) provides quick status assessment.

3. What risk is reduced?
   - Reduces risk of operating with labor costs significantly above industry norms without awareness.
   - Provides external reference point beyond internal historical data.

4. What breaks if removed?
   - No industry benchmark comparison. Operators lose the only external reference point for labor cost competitiveness.
   - Constitution's owner need for "industry baseline" comparison loses its surface.

5. Overlap/duplication check
   - Operational guardrails panel also references survey benchmark bands for labor pressure classification, but serves a different purpose (risk alerting vs competitive positioning). The guardrails panel uses the same benchmark data as an internal guardrail; this panel surfaces it as an explicit industry comparison with actionable dollar estimates.

## Comparative-owner need alignment
- Directly addresses owner need for industry baseline comparison — one of the constitution-specified comparative dimensions.

## Findings
1. High usefulness for industry-relative positioning — the only surface addressing the owner's industry baseline comparative need.
2. Three-card layout (peer medians, labor position, action pack) provides clear progression from context to action.
3. Benchmark data is static configuration — needs a path to periodic updates as industry surveys refresh.
4. Dollar opportunity estimates are effective at converting abstract percentages into concrete business impact.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Document benchmark data source and establish refresh cadence for survey constants.
  2. Add date/vintage label to benchmark data so operators know how current the comparison is.
  3. Consider adding segment-specific benchmarks (seasonal vs year-round operators).

## Source evidence
- `apps/ice-cream-ops/app.js:2171`
- `apps/ice-cream-ops/app.js:2191`
- `apps/ice-cream-ops/app.js:2207`
- `packages/ui-manifests/widgets/industry_survey_lens_panel/widget.manifest.json`
