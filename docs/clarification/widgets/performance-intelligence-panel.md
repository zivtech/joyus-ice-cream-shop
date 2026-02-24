# Performance Intelligence Panel

## Metadata
- Widget ID: `performance_intelligence_panel`
- Parent page(s): `dashboard`
- Owner: Analytics + Ops (to assign in manifest)
- Last clarified: 2026-02-24
- Utility review state: `unreviewed`

## Purpose
- Summarize top-level monthly, hourly, weekday, and yearly performance signals in one operator-facing narrative block.

## Data source and transform path
- Monthly basis rows: `monthlySeriesForScope(state.plan, state.mondayScenario)`.
- Hour/day summaries: `hourlyInsightsForScope()` and `weekdayInsightsForScope()`.
- Yearly summary: `yearlySummaryForScope('current_6_day', 'base')`.
- Context controls: date range, location scope, plan mode, Monday scenario, DoorDash mode.

## Calculation logic
- Uses revenue-positive month rows when available; otherwise falls back to selected rows.
- Branches card copy for single-month vs multi-month contexts.
- Computes weekend share from Fri/Sat/Sun revenue and peak share from 6-9PM hourly revenue.
- Produces YoY line only when two or more full-year rows exist.

## Visual logic
- Renders 4-card insight grid:
  1. best/current month GP card
  2. weakest/vs-last-month card
  3. peak vs weak hour card
  4. demand-shape share card
- Renders yearly revenue/labor/gp table beneath cards.
- Appends YoY summary sentence under the yearly table.

## Interactions and actions
- Fully reactive to dashboard controls; no direct action buttons in panel.
- Re-renders each time `renderAll()` runs.

## Dependencies and side effects
- Depends on shared dashboard aggregation helpers.
- No write side effects.

## Known limitations
- Narrative logic is deterministic and may hide edge-case context.
- YoY comparison only uses full-year overlap and can skip partial-year useful context.
- No confidence or data-quality badge in-card.

## Open questions
- Should each card expose drill-down links to source tables/charts?
- Should YoY include normalized same-month windows when full-year overlap is absent?
- Should weekend/peak shares be configurable by store operating-hour profile?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:1892`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:1957`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:1969`
