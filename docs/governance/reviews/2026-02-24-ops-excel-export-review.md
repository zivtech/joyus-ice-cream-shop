# Wave 2 Review: `ops_excel_export`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner/manager need for portable data access: download workbook for offline analysis, reporting, or sharing with stakeholders.
   - Shift planner's need to produce a publish-ready export payload for downstream publish flow.

2. What action changes because this exists?
   - Owners and managers can export current dashboard scope as an Excel workbook for offline review or board reporting.
   - Shift planner can produce structured JSON export for the Square publish pipeline.
   - MCP tool integration allows assistant-driven export workflows.

3. What risk is reduced?
   - Reduces risk of owners and managers lacking portable data access for external stakeholders.
   - Structured export format ensures publish pipeline receives consistent data shapes.

4. What breaks if removed?
   - No export capability from dashboard. Owners and managers would need to manually transcribe data.
   - Planner export payload (consumed by Square publish script) loses its interface definition.

5. Overlap/duplication check
   - The planner_export_payload contract references the same publish script as square_schedule_publish interface. This is a legitimate consumer relationship (export produces the payload, publish sends it to Square), not duplication.
   - Dashboard export and planner export serve different audiences and formats. No functional overlap.

## Comparative-owner need alignment
- Supports owner need for portable data access for comparison and reporting outside the application.

## Findings
1. Useful as the data portability interface serving both dashboard analytics export and planner publish payload production.
2. Three transport modes (API, MCP, script) provide good integration flexibility.
3. Interface contracts are defined but implementation may still be evolving (validation note says "interface finalization pending").
4. Dashboard export and planner export bundled in one interface makes sense given shared export infrastructure.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Finalize interface contracts and document exact payload schemas for each export type.
  2. Add export job tracking with status/progress for large workbooks.
  3. Define data retention policy for generated export files.

## Source evidence
- `packages/ui-manifests/interfaces/ops_excel_export/interface.manifest.json`
- `apps/ice-cream-ops/scripts/publish_schedule_to_square_mcp.py` (consumer)
- `apps/ice-cream-ops/app.js` (dashboard export action)
