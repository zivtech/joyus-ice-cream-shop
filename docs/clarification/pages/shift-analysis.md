# Shift Analysis

## Metadata
- Page ID: `shift_analysis`
- Route: `/staffing-planner.html#shift_analysis`
- Primary owner: Ops analytics owner (to assign in manifest)
- Last clarified: 2026-02-24

## Purpose
- Review recent staffing outcomes against expected performance and isolate weather-aligned vs non-weather variance.

## Primary users
- Managers and owners doing retrospective analysis.
- Operators documenting context notes for future planning.

## Inputs and data
- Required: local `data.json` historical daily/weekly metrics.
- Optional live: weather data loaded in planner bootstrap.
- Local note state stored in planner `localStorage` payload.

## Outputs
- Portfolio-level performance attainment summary.
- Location cards and day-level analysis cards.
- Weather alignment summary and explanatory narrative.
- Saved context notes for future planning interpretation.

## Filters and controls
- Store scope (`EP`/`NL`/`BOTH`).
- Analysis window (1-4 weeks).
- Compare mode (`actual_vs_baseline`, `planned_vs_actual`).

## Actions and interactions
- Switch scope/lookback/compare controls.
- Add and save context notes per location-date.

## Dependencies and side effects
- Uses shared weather helper functions and planner state.
- Persists analysis notes to `localStorage`.

## Known issues and constraints
- Expected-value models are heuristic and may need per-tenant calibration.
- Current note model is local-only; no multi-user conflict handling.
- No explicit confidence scoring for weather attribution.

## Open questions
- Should “planned vs actual” use versioned schedule snapshots from approvals?
- What threshold defines explainable variance by weather vs other factors?
- Should notes be workflow-gated (manager vs owner visibility)?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2756`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3530`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3851`
