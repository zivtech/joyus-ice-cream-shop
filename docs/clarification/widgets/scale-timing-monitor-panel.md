# Scale Timing Monitor Panel

## Metadata
- Widget ID: `scale_timing_monitor_panel`
- Parent page(s): `dashboard`
- Owner: Strategy + Ops planning owner (to assign in manifest)
- Last clarified: 2026-02-24
- Utility review state: `unreviewed`

## Purpose
- Provide compact visibility into whether seasonal transition triggers are currently met and how often they were met across the selected historical window.

## Data source and transform path
- Trigger rule source: `state.triggerRules[loc]`.
- Observed months: `selectedMonthKeys()` filtered to months with revenue.
- Metric evaluation: `monthMetricsForLocation(loc, monthKey)` + `conditionMet(...)`.

## Calculation logic
- For each transition rule:
  - Determine month hits where all rule conditions are met.
  - Compute `hitRate = hits / observedMonths`.
  - Determine `currentMet` for active anchor month.
  - Determine `firstHit` and `lastHit` labels.
- Layout mode branches on location scope:
  - single-location compact columns
  - dual EP/NL comparison columns.

## Visual logic
- Renders compact timing matrix table.
- “Now” status uses `status-good` for met and `status-watch` for gap.
- Displays first-hit references for traceability across scope.

## Interactions and actions
- Reactive to location/date-range and trigger-rule changes.
- No direct write actions in this panel.

## Dependencies and side effects
- Depends on playbook trigger rule evaluation helpers.
- No persistence side effects.

## Known limitations
- Hit-rate percentages are descriptive only and do not encode transition confidence.
- Table can become dense as rule count grows.
- No explicit drill-down to rule-level month hit logs.

## Open questions
- Should rule-level confidence scoring be added (e.g., weighted by season relevance)?
- Should first-hit links deep-link to month-level evidence cards?
- Should this panel share a single evaluation engine with trigger-gap planner to avoid divergence?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2037`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2063`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2115`
