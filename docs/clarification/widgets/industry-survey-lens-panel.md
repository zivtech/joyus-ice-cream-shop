# Industry Survey Lens Panel

## Metadata
- Widget ID: `industry_survey_lens_panel`
- Parent page(s): `dashboard`
- Owner: Strategy + Ops (to assign in manifest)
- Last clarified: 2026-02-24
- Utility review state: `unreviewed`

## Purpose
- Compare current labor economics against peer survey quartiles and surface directional action targets.

## Data source and transform path
- Benchmark source: static `SURVEY_BENCHMARKS` constants.
- Current values: weekly revenue/labor sums from `sumForScope(weeklyMetricsForLocation)`.
- Positioning helper: `benchmarkTone(currentLaborPct, bands.laborPct, true)`.

## Calculation logic
- Current labor ratio = `weeklyLabor / weeklyRevenue`.
- Delta calculations:
  - `deltaToMedian` and `deltaToP25` vs labor bands.
  - Weekly dollar opportunity computed from delta percentages and weekly revenue.
- Benchmark action copy branches based on whether current labor is above or below benchmark targets.

## Visual logic
- 3-card layout:
  1. Peer medians + quartile bands
  2. Current labor benchmark position with status pill
  3. Action pack with guardrails and opportunity estimates
- Status pill class sourced from benchmark tone (`status-good`, `status-watch`, `status-risk`).

## Interactions and actions
- Reactive only; updates with scope/date/plan controls.
- No direct editing actions inside this panel.

## Dependencies and side effects
- Uses benchmark constants and in-memory weekly metrics.
- No persistence side effects.

## Known limitations
- Survey sample is limited and self-reported.
- Benchmark values are static in code and not externally versioned.
- Action recommendations are directional, not causal predictions.

## Open questions
- Should benchmark datasets be versioned and externally managed?
- Should location-specific benchmark profiles be supported?
- Should this panel include confidence intervals and sample-composition metadata?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2171`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2186`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2207`
