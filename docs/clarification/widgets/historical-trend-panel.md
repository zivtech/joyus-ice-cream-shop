# Historical Trend Panel

## Metadata
- Widget ID: `historical_trend_panel`
- Parent page(s): `dashboard`
- Owner: Analytics + Ops (to assign in manifest)
- Last clarified: 2026-02-24

## Purpose
- Provide month-level trend visibility for key financial metrics with scenario comparison context.

## Data source and transform path
- Base series: `monthlySeriesForScope('current_6_day', state.mondayScenario)`.
- Active series: `monthlySeriesForScope(state.plan, state.mondayScenario)`.
- Metric extraction: `HISTORY_METRIC_DEFS[state.historyMetric].extract(row)`.
- Trend smoothing: `rollingAverage(scenarioVals, 3)`.

## Calculation logic
- Labels come from active scenario month rows.
- Scenario metric values and baseline metric values are built with the selected metric extractor.
- Trend values are 3-month rolling average over scenario values.
- Baseline overlay dataset is rendered only in `open_7_day` plan mode.

## Visual logic
- Chart type: Chart.js line chart.
- Dataset style mapping:
  - Scenario: orange solid line
  - 3-Month Trend: teal dashed line
  - 6-Day Baseline overlay: neutral gray line (only for 7-day mode)
- Axis ticks and tooltip labels use selected metric-specific formatters.
- Subtitle copy dynamically reflects range, location scope, and DoorDash mode.

## Interactions and actions
- Reacts to history metric toggle selection.
- Reacts to plan mode, Monday scenario, location focus, date range, and DoorDash mode changes.
- Rebuilds chart instance on each render (destroy + re-create).

## Dependencies and side effects
- Depends on Chart.js global script.
- No persistence side effects; render-only output.

## Known limitations
- Rolling window fixed to 3 months (not user-configurable).
- No confidence interval or data-quality annotation on trend lines.
- Overlay baseline only visible for 7-day scenario; no explicit toggle.

## Open questions
- Should trend window be user-selectable (e.g., 2/3/6 months)?
- Should additional overlays (weather, events, promotions) be available?
- Should baseline overlay be optionally visible in all plan modes for context?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:1803`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:1813`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:1845`
