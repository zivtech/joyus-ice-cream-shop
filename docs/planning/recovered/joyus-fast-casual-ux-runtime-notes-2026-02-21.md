# Joyus Fast Casual UX and Runtime Notes

## Purpose
Capture implementation decisions from the Milk Jawn command center that should be carried into Joyus Fast Casual product work.

## Adopted UX Decisions

1. Menu model
- Use menu-style tabs, not chip buttons, for primary and secondary navigation.
- Primary section tabs: `Weekly Plan`, `Recent Staffing`, `Approvals`.
- Secondary tab groups render in place with JS; do not route to separate pages.

2. Section-level store scope
- Keep store scope selector at section level so it persists across subpages.
- `East Passyunk`, `Northern Liberties`, and `Both Stores` should be available to manager/admin roles.

3. Highlights compare controls
- Recent staffing view must support:
  - `Actual vs Baseline`
  - `Planned vs Actual`
- When planned history is missing, backfill estimates for up to the previous 4 weeks so compare mode remains usable.

4. Approvals separation
- Approval workflows live on the `Approvals` subpage.
- Weekly planner should show recommendation and "accept recommendation" actions, but final approval remains in `Approvals`.

5. Weather signal treatment
- Weather impact should use event timing by daypart and temperature delta vs expected norms.
- Staffing recommendations never violate minimum coverage rules:
  - opener minimum: 1
  - closer minimum: 2

6. Default date behavior
- Default operational view excludes current partial month for KPI summaries.
- Planner default remains the next 2 weeks for staffing execution.

## Runtime and Product Notes

1. Multi-location scale
- Support dozens of locations per tenant and parent-child franchise rollups.
- Keep calculations deterministic where possible; reserve LLM usage for narrative overlays.

2. Cost tiers
- Provide explicit tiers:
  - single run
  - monthly refresh
  - weekly refresh
  - near real-time monitoring
- Surface run cost estimates in product and exports.

3. Export contract
- Keep `ops_export_excel` and `/api/v1/tenants/{tenantId}/exports/*` as first-class integration points.
- Workbook remains manager-first values export, not a formula-heavy planning workbook.

## Recommended Next Build Steps

1. Implement shared Operations UI Kit primitives in the Phase 3 web app:
- `PrimaryTabs`
- `SectionTabs`
- `ScopeSelector`
- `CompareSelector`

2. Add persisted planner state per user+tenant:
- selected subtab
- store scope
- compare mode
- lookback window

3. Add staffing variance service for historical backfill:
- derive estimated planned values when explicit planned data is missing
- tag estimated rows for transparency in UI and export
