# Shift Planner Day Card

## Metadata
- Widget ID: `shift_planner_day_card`
- Parent page(s): `shift_planner`
- Owner: Scheduling workflow owner (to assign in manifest)
- Last clarified: 2026-02-24

## Purpose
- Provide a complete day-level planning surface: staffing slots, financial viability, weather guidance, copy-forward tools, and approval-note capture.

## Data source and transform path
- Parent source: `state.weeks[].days[]` planner state model.
- Additional computed inputs:
  - `dayValidation(day)`
  - `dayRecommendation(location, day)`
  - `dayFinancialViability(location, day)`
  - `ptoSummaryForDay(location, day)`
  - `lastWeekReferenceForDay(weekIdx, dayIdx)`
  - `weatherVisualTokens(...)` and `weatherLine(...)`
- Assignment options from `employeePoolForLocation()`.

## Calculation logic
- Validation ensures staffing constraints (openers/closers and slot coherence).
- Viability computes expected revenue, labor, labor%, and expected GP(72).
- Weather signal computes likely uplift/downside guidance and recommended schedule delta action.
- PTO summary computes approved/pending/conflict counts for day context.

## Visual logic
- Card status class changes by request/approval state (`pending`, `approved`, default).
- Includes structured sections in order:
  1. Header (weekday/date + season badge)
  2. Viability box (`viability-{tone}`)
  3. Weather box with heat tint (`weather-heat-hot|cold|neutral`)
  4. Last-week helper block + copy actions
  5. Slot table (time/role/headcount/assigned/action)
  6. Day actions and status lines
- Weather icon rendering via inline SVG helper based on weather code class.

## Interactions and actions
- Edit slot start/end/role/headcount.
- Add/delete slots.
- Assignment input with matching chips.
- Assign-next-12-weeks propagation.
- Accept weather recommendation action.
- Toggle/view/copy last-week schedule (names/shifts/both).
- Enter policy-change note and submit request.
- View PTO conflict context.

## Dependencies and side effects
- Writes to planner state and persists via `saveState()` (`localStorage`).
- May trigger approval state invalidation for next-week gate.
- Uses weather/PT0 helper functions that may rely on live fetch results.
- Export side effect occurs later through plan JSON generation, not directly in card render.

## Known limitations
- Dense single-card interaction model can be cognitively heavy on mobile.
- Front-end-only enforcement can be bypassed without service-level checks.
- No per-field change history at slot level.

## Open questions
- Should viability be shown per slot block in addition to day-level?
- Should card support compact/expanded modes for large horizons?
- Which actions should require role-based permissions (manager vs admin)?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2266`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2290`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2420`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2519`
