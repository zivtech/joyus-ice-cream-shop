# Wave 2 Review: `historical_trend_panel`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner decision on seasonal staffing timing by revealing month-over-month financial trends.
   - Owner comparative need: year-over-year and scenario-vs-baseline visibility for understanding why a period was better or worse.

2. What action changes because this exists?
   - Operators can spot inflection points in revenue, labor, or GP trends across months.
   - 3-month rolling average smooths noise for strategic planning decisions.
   - Baseline overlay (6-day vs 7-day) supports expansion scenario analysis.

3. What risk is reduced?
   - Reduces risk of making seasonal staffing decisions without historical context.
   - Rolling trend reduces risk of overreacting to single-month anomalies.

4. What breaks if removed?
   - No month-level trend visibility. Operators lose the ability to see directional momentum and seasonal patterns.
   - Constitution's "observe" step in the decision loop loses a key historical analysis surface.

5. Overlap/duplication check
   - Performance intelligence panel covers yearly summaries and best/worst month identification. Historical trend provides continuous monthly series visualization — complementary, not duplicative.

## Comparative-owner need alignment
- Directly supports owner year-over-year and scenario comparison needs through multi-series trend lines.

## Findings
1. High usefulness for strategic and seasonal decision-making through trend visualization.
2. Rolling window is fixed at 3 months — not user-configurable, limiting flexibility.
3. Baseline overlay only appears in 7-day mode; could be useful in all modes for context.
4. No data quality or confidence annotations on trend lines.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Consider making rolling window configurable (2/3/6 months).
  2. Allow baseline overlay toggle in all plan modes, not just 7-day.
  3. Add data quality annotations for months with modeled/incomplete data.

## Source evidence
- `apps/ice-cream-ops/app.js:1807`
- `apps/ice-cream-ops/app.js:1813`
- `apps/ice-cream-ops/app.js:1845`
- `packages/ui-manifests/widgets/historical_trend_panel/widget.manifest.json`
