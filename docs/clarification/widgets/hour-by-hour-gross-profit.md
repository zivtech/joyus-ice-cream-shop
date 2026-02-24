# Hour-by-Hour Gross Profit

## Metadata
- Widget ID: `hour_by_hour_gross_profit`
- Parent page(s): `dashboard`
- Owner: Analytics + Ops (to assign in manifest)
- Last clarified: 2026-02-24

## Purpose
- Show which open hours create or destroy gross profit so staffing can be tuned by daypart.

## Data source and transform path
- Primary source: `data.hourly_profile[loc][monthKey]` from local `data.json`.
- Row pre-filter: `filterToStandardStoreHours(...)` (excludes non-standard service hours before plotting).
- Revenue basis: `revenueWithMode(row.avg_revenue, row.avg_doordash_net, state.doordashMode)`.
- Aggregation: month-average GP per hour across selected months.
- Multi-location mode: `combineHourlySeries(EP, NL)` sums per-hour values by label.

## Calculation logic
- Base formula per row: `hourGp = hourRevenue * 0.72 - row.avg_labor`.
- Hour aggregation: average `hourGp` per hour bucket.
- Shared-manager scenario adjustment:
  - Calculate net per-store daily manager labor delta.
  - Allocate adjustment across 3PM-9PM buckets (fallback all hours if no target hours).
  - Subtract per-hour allocation from `avg_gp_72`.

## Visual logic
- Chart type: Chart.js bar chart.
- Y-axis currency formatting via `USD`/`USD2` formatters.
- Bar color thresholds from raw GP value:
  - `>= 350`: `rgba(47, 143, 91, 0.9)` (strong positive)
  - `>= 140`: `rgba(154, 211, 178, 0.92)` (moderate positive)
  - `>= 0`: `rgba(247, 190, 117, 0.92)` (low positive/warn)
  - `< 0`: `rgba(198, 37, 37, 0.88)` (negative)
- Tooltip label format: `GP: $X / day`.

## Interactions and actions
- Indirectly updates when user changes:
  - Plan mode
  - Location focus
  - Date range/month
  - DoorDash include/exclude
  - Manager scenario/time share
- No direct click/selection interaction on bars currently.

## Dependencies and side effects
- Depends on Chart.js global loaded in HTML.
- No write side effects; render-only.

## Known limitations
- Uses fixed 72% gross margin assumption for all contexts.
- Color thresholds are hardcoded and not tokenized yet.
- No confidence interval/variance display for each hour bucket.

## Open questions
- Should thresholds be tenant-configurable by margin profile?
- Should the chart split by weekday/weekend toggle?
- Should weather/event overlays be available on hour bars?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:1311`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:1365`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:1386`
