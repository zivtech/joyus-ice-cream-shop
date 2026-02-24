# Recent Staffing Analysis Panel

## Metadata
- Widget ID: `recent_staffing_analysis_panel`
- Parent page(s): `shift_analysis`
- Owner: Analytics + Ops (to assign in manifest)
- Last clarified: 2026-02-24

## Purpose
- Provide a structured actual-vs-expected performance review with weather context and operator notes for recent shifts.

## Data source and transform path
- Actual rows: `sourceData.daily_actual[loc]` filtered by `recentActualRowsForScope(scope, lookbackWeeks)`.
- Expected baseline profile: `expectedDayProfile(loc, date)` from historical weekday/month profile.
- Planned targets fallback source: `plannedRowsForLocation(loc)` from `planned_daily`/`daily_planned`.
- Weather context: `weatherData` via `weatherForDate(...)` + `weatherImpactSignal(...)`.
- Notes: `state.recentAnalysisDraftNotes` and `state.recentAnalysisNotes`.

## Calculation logic
- Lookback window anchors on latest available actual date across selected scope, then includes `lookbackWeeks * 7` days.
- Compare mode logic:
  - `actual_vs_baseline`: expected values come from historical profile.
  - `planned_vs_actual`: expected values use planned targets when present, otherwise fallback to baseline.
- Expected-source attribution:
  - Each location-day is labeled as `planned targets`, `mixed fallback`, or `fallback baseline`.
  - Fallback details list which expected fields (`revenue`, `labor`, `profit`) used baseline due to missing planned values.
- Attainment metrics per location-day:
  - Profit attainment = `actualProfit / expectedProfit`.
  - Sales attainment = `actualRevenue / expectedRevenue`.
  - Labor efficiency attainment = `actualLaborPct / expectedLaborPct`.
- Portfolio and location summaries aggregate actual vs expected profit/sales and weather-alignment counts.

## Visual logic
- Layout includes:
  1. Weekly analysis summary card
  2. Portfolio overview cards
  3. Location performance cards with attainment gauges
  4. Day-level review cards with three attainment meters + weather context + notes
- Meter tones use `tone-strong`, `tone-close`, `tone-watch`, `tone-risk`, `tone-neutral` classes.
- Weather context tint uses `weather-heat-hot`, `weather-heat-cold`, `weather-heat-neutral`.
- Day cards now show expected-source labels/details so planned-target fallback is visible at row level.

## Interactions and actions
- Shift Analysis controls change scope, lookback weeks, and compare mode.
- Users can draft context notes and submit saved notes per location-day row.
- Notes persist in planner state and survive reload.

## Dependencies and side effects
- Depends on planner weather helpers and Open-Meteo-backed weather data.
- Writes draft/saved notes into planner local state via `saveState()`.

## Known limitations
- Narrative heuristics are threshold-based and may over-simplify non-weather variance drivers.
- Planned-target coverage may be sparse, causing frequent fallback to baseline expected values.
- Source attribution is explicit, but confidence remains heuristic (no statistical confidence score yet).

## Open questions
- Should note taxonomy be structured (event/promo/ops issue) instead of free text?
- Should location-day cards support export into review packets?
- Should expected baseline support seasonality exceptions per event calendar?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:1820`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2756`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2823`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2837`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2946`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:4345`
