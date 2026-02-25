# Joyus Fast Casual Data and Sync Foundation

Status: Implemented as API/MCP scaffolding in `joyus-ai-mcp-server`.

## Purpose
Move sync and analytics primitives out of the static POC and into Joyus services.

## Implemented API Endpoints

All routes are mounted under `/api/v1` and require bearer auth.

1. `POST /api/v1/tenants/{tenantId}/sync-runs`
- Creates a sync run for `square|toast|doordash|reviews|weather`.
- Supports `mode` (`incremental|backfill`), date range, and location list.

2. `GET /api/v1/tenants/{tenantId}/sync-runs/{runId}`
- Returns run status and metadata.

3. `POST /api/v1/tenants/{tenantId}/connectors/{provider}/authorize`
- Returns provider auth URL/state for connector onboarding.

4. `GET /api/v1/tenants/{tenantId}/locations/{locationId}/kpis?start=&end=`
- Returns tenant-scoped KPI snapshot for dashboard/planner use.

5. `POST /api/v1/tenants/{tenantId}/reviews/ingest`
- Ingests review batches and updates tenant review counters.

6. `GET /api/v1/tenants/{tenantId}/reviews/correlations`
- Returns review-to-shift correlation summary rows.

7. `POST /api/v1/tenants/{tenantId}/schedules/{scheduleId}/recommendations/recompute`
- Recomputes staffing recommendations from assumption overrides.

8. `POST /api/v1/tenants/{tenantId}/schedules/{scheduleId}/compliance/check`
- Runs compliance checks and returns pass/warn/fail details.

9. `POST /api/v1/tenants/{tenantId}/exports/excel`
- Creates Excel export job and returns signed download URL.

10. `GET /api/v1/tenants/{tenantId}/exports/{exportId}`
- Returns export status metadata.

## Implemented MCP Tools

1. `ops_export_excel`
2. `ops_sync_run_create`
3. `ops_sync_run_status`
4. `ops_review_shift_insights`
5. `ops_recompute_staffing`
6. `ops_compliance_check`

## Notes

- Current implementation is deterministic scaffolding with tenant access checks and audit logs.
- Production connector implementations should replace placeholder data generation in `src/exports/ops-service.ts`.
- This document pairs with:
  - `spec/joyus-fast-casual-feature-tracker.md`
  - `spec/joyus-fast-casual-square-publish.md`
