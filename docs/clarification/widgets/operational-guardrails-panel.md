# Operational Guardrails Panel

## Metadata
- Widget ID: `operational_guardrails_panel`
- Parent page(s): `dashboard`
- Owner: Ops workflow owner (to assign in manifest)
- Last clarified: 2026-02-24
- Utility review state: `unreviewed`

## Purpose
- Surface core staffing and risk guardrails with immediate status signals for operational decision-making.

## Data source and transform path
- Weekly metrics: scope-level sums from `weeklyMetricsForLocation`.
- Benchmark thresholds: `SURVEY_BENCHMARKS` labor median and risk band.
- Manager scenario assumptions: plan mode + manager scenario + management share.
- Data confidence status: modeled month count from selected range and `data.month_status`.

## Calculation logic
- Computes weekly labor ratio and classifies guardrail pressure:
  - `good` when below benchmark median
  - `watch` when between median and risk band
  - `risk` when above risk band
- Manager cap card branches for shared-manager vs non-shared scenario.
- Data confidence card branches by presence of modeled months in range.

## Visual logic
- Deterministic card set rendered in order:
  1. Opening rule
  2. Closing rule
  3. Manager cap
  4. Labor pressure
  5. Data confidence
- Each card has status pill class (`status-good|status-watch|status-risk`).

## Interactions and actions
- Reactive to plan/scope/range/manager controls.
- No direct mutation actions from this panel.

## Dependencies and side effects
- Uses benchmark config constants and weekly metric helper functions.
- Render-only (no persistence side effects).

## Known limitations
- Guardrail statuses are threshold-based and may not capture nuanced operational tradeoffs.
- Data confidence card only distinguishes modeled-month presence, not source quality depth.
- No per-card acknowledgement workflow for managers.

## Open questions
- Should guardrail severity thresholds be tenant-configurable?
- Should guardrail cards support escalation workflows when risk persists over time?
- Should data confidence include source freshness and completeness scoring?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2346`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2380`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2396`
