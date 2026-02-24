# Dashboard

## Metadata
- Page ID: `dashboard`
- Route: `/index.html`
- Primary owner: Product + Ops (to assign in manifest)
- Last clarified: 2026-02-24

## Purpose
- Provide a control-tower view of labor efficiency and profitability for operating decisions.
- Compare 6-day vs 7-day assumptions, location scope, and date windows.

## Primary users
- Owners/executives reviewing labor % and margin performance.
- Managers validating whether staffing assumptions are financially viable.

## Inputs and data
- Required: local `data.json` fetched at runtime.
- Optional: browser `localStorage` for playbook profile and trigger edits.
- No required live POS calls during normal dashboard render.

## Outputs
- KPI cards (weekly revenue/labor/gross profit/monday contribution/wellbeing signal).
- Weekday economics chart and hour-by-hour gross profit chart.
- Seasonal playbook/trigger summaries and export workbook controls.

## Filters and controls
- Plan mode (`current_6_day` vs `open_7_day`).
- Location focus (`EP`, `NL`, `BOTH`).
- Date range + month picker.
- Monday demand scenario.
- DoorDash include/exclude mode.
- Manager scenario and management time share (7-day mode).
- Excel scope and location scope.

## Actions and interactions
- Re-renders all KPI/charts on control changes.
- Exports XLSX workbook for current view or full period.
- Navigates to planner/playbook/settings pages.

## Dependencies and side effects
- Reads `data.json` via `fetch`.
- Writes/reads trigger and profile values in `localStorage`.
- Uses Chart.js and XLSX browser libs.

## Known issues and constraints
- Current naming/copy still references Milk Jawn in several places and needs tenant abstraction.
- Dashboard is tightly coupled to `data.json` shape.
- No manifest-level explainability yet (this clarification work is adding that).

## Open questions
- Which controls should be policy-locked vs user-editable per tenant role?
- Should trigger editing remain on dashboard or move fully into Seasonal Playbook/settings?
- Which metrics should become auditable with explicit lineage IDs in UI?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/index.html`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:3`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:3545`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2609`
