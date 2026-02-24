# Wave 2 Review: `dashboard` (page)

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner strategic decisions: labor efficiency, profitability analysis, scenario comparison, industry benchmarking, seasonal scaling, and guardrail monitoring.
   - This is the primary "Observe" surface in the constitution's decision loop.

2. What action changes because this exists?
   - Owners can review KPIs (revenue, labor, GP, wellbeing), hourly profitability, monthly trends, industry benchmarks, trigger gaps, and guardrail status in one surface.
   - Scenario comparison (6-day vs 7-day, DoorDash on/off, manager scenarios) enables what-if analysis.
   - Excel export provides data portability for offline analysis.
   - Navigation to planner/playbook/settings enables drill-through to action surfaces.

3. What risk is reduced?
   - Reduces risk of making strategic decisions without consolidated evidence.
   - Multi-widget composition ensures no single metric is viewed in isolation.

4. What breaks if removed?
   - No owner strategic analysis surface. All 7 composed widgets lose their composition context.
   - The decision loop's "Observe" step has no landing page.

5. Overlap/duplication check
   - This is the only owner-facing analytics page. Shift analysis is manager/retrospective focused. Seasonal playbook is strategy/trigger focused. No route-level duplication.

## Comparative-owner need alignment
- This page is the primary surface for all four owner comparative dimensions: year-over-year (historical trend + performance intelligence), store-to-store (location filters), portfolio average (combined scope), and industry baseline (survey lens).

## Findings
1. Essential page — the primary owner decision surface composing 7 validated-useful widgets.
2. Rich filter set (plan mode, location, date range, DoorDash, manager scenario) enables comprehensive what-if analysis.
3. Permission model distinguishes owner (view, export, configure) from manager (view, export).
4. Tightly coupled to data.json shape — migration to API-driven data will need careful planning.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Determine which controls should be policy-locked vs user-editable per tenant role.
  2. Add explicit lineage IDs to key metrics for auditability.
  3. Plan data.json decoupling for multi-tenant API-driven data access.

## Source evidence
- `apps/ice-cream-ops/index.html`
- `apps/ice-cream-ops/app.js:3`
- `apps/ice-cream-ops/app.js:2609`
- `apps/ice-cream-ops/app.js:3545`
- `packages/ui-manifests/pages/dashboard/page.manifest.json`
