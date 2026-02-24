# Wave 2 Review: `hour_by_hour_gross_profit`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner decision on which open hours create or destroy gross profit, enabling daypart-level staffing tuning.
   - Manager validation of whether staffing assumptions are financially viable at hourly granularity.

2. What action changes because this exists?
   - Operators can identify unprofitable hours and adjust staffing or operating hours accordingly.
   - Shared-manager cost allocation is visible at the hour level, supporting 7-day expansion analysis.
   - DoorDash revenue impact on hourly GP is togglable for channel mix decisions.

3. What risk is reduced?
   - Reduces risk of operating during hours that consistently destroy gross profit without awareness.
   - Makes the 72% margin assumption and manager allocation explicit rather than hidden.

4. What breaks if removed?
   - No hourly profitability visibility. The dashboard loses its most granular economic signal.
   - Owner "when to shift seasonal operating hours" business question (from charter) loses its primary evidence source.

5. Overlap/duplication check
   - No other widget provides hourly GP analysis. The historical trend panel is monthly, not hourly. Distinct scope.

## Comparative-owner need alignment
- Directly supports owner economic transparency at hourly resolution. Combined-location mode enables cross-store comparison.

## Findings
1. High usefulness — the most granular economic signal on the dashboard, directly answering charter business questions.
2. Fixed 72% margin assumption needs to be configurable per tenant/product mix.
3. Color thresholds ($350/$140/$0) are hardcoded in app.js, not yet tokenized.
4. No confidence interval or variance display for hour buckets.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Tokenize bar color thresholds (currently hardcoded, violates contribution rules for ui-components).
  2. Make the 72% margin assumption configurable via settings.
  3. Add weekday/weekend toggle for more targeted daypart analysis.

## Source evidence
- `apps/ice-cream-ops/app.js:1311`
- `apps/ice-cream-ops/app.js:1319`
- `apps/ice-cream-ops/app.js:1365`
- `packages/ui-manifests/widgets/hour_by_hour_gross_profit/widget.manifest.json`
