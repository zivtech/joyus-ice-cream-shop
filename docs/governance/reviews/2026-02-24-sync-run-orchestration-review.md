# Wave 2 Review: `sync_run_orchestration`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Admin decision on when and how to synchronize data from external providers (Square timesheets, sales, PTO).
   - Operator visibility into sync run status for data freshness confidence.

2. What action changes because this exists?
   - Admins can trigger provider sync runs from settings or assistant workflows.
   - Sync run status polling provides visibility into data pipeline health.
   - MCP integration enables assistant-driven sync operations.

3. What risk is reduced?
   - Reduces risk of operating on stale data without awareness of sync status.
   - Formalizes sync run lifecycle (create/poll) so data freshness is observable.

4. What breaks if removed?
   - No governed interface for data synchronization. Sync operations would be ad-hoc scripts without status tracking.
   - Charter integration requirements (#1-3: ingest timesheets, sales, PTO) lose their formal interface definition.

5. Overlap/duplication check
   - No other interface handles provider sync orchestration. The PTO sync endpoint referenced in approvals_workbench is a consumer of sync results, not the orchestration interface itself. No duplication.

## Comparative-owner need alignment
- Infrastructure interface that enables comparative analysis by ensuring data freshness across locations and time periods. Not a direct comparative surface.

## Findings
1. Useful as the formal data synchronization interface — governs the pipeline that feeds all analytics and planning surfaces.
2. Interface shape is captured from recovered planning docs and needs platform/product confirmation.
3. Four contracts (create run, poll status, MCP create, MCP status) provide comprehensive lifecycle coverage.
4. Two consumers (settings integrations, ops console) confirm cross-surface utility.
5. Current data policy (pinned snapshot, no refresh without approval) means this interface is forward-looking.

## Recommendation
- Recommended state: `validated_useful` (as interface specification; implementation governed by data policy).
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Define sync provider adapters (Square is first; extensible to Toast, delivery channels per charter).
  2. Add sync run audit logging for data lineage and troubleshooting.
  3. Define error handling and retry policies for failed sync runs.
  4. Coordinate activation timeline with data policy relaxation when appropriate.

## Source evidence
- `packages/ui-manifests/interfaces/sync_run_orchestration/interface.manifest.json`
- `docs/planning/recovered/joyus-fast-casual-data-sync-foundation-2026-02-21.md`
- `docs/clarification/DATA_POLICY.md`
