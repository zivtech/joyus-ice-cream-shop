# Wave 1 Review: `settings` (page)

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Admin/owner decisions on operational configuration: guardrails, workflow approval flags, seasonal opening schedules, target labor percentages, and pay assumptions.
   - Admin visibility into compliance scaffolding and future rule-engine configuration.

2. What action changes because this exists?
   - Admins can modify operational assumptions that propagate into planner behavior, viability calculations, and approval readiness.
   - Admins can review compliance placeholder content and understand the scaffolding path for future compliance hardening.
   - Sub-tab navigation segments operations controls from compliance views.

3. What risk is reduced?
   - Reduces risk of planner operating with unintended assumptions by providing a dedicated configuration surface.
   - Makes guardrail and workflow settings explicit rather than buried in code or undiscoverable.

4. What breaks if removed?
   - Operations assumptions lose their editing surface. Configuration would need to happen through direct state manipulation or code changes.
   - The compliance scaffolding loses its composition page, fragmenting the path to future compliance hardening.

5. Overlap/duplication check
   - This page composes operations_settings_panel and compliance_scaffold_panel — both are unique widgets. No route-level duplication with other pages.
   - Some settings context appears in planner sidebar/header, but only as read-only reflections of values configured here. This page is the only write surface.

## Comparative-owner need alignment
- This page is configuration/control focused. Owner comparative analytics needs are not relevant here. The settings configured on this page influence the assumptions behind comparative calculations elsewhere.

## Findings
1. Useful as the only dedicated configuration surface for operational assumptions and compliance scaffolding.
2. Permission model correctly restricts configure capability to admin, with manager having view-only access.
3. Compliance sub-tabs (overview, setup, youth, feeds) are placeholder content — useful as scaffolding but not yet functional.
4. Settings persistence is local-state only, which limits multi-device and multi-user configuration scenarios.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Migrate settings persistence to server-side storage for durability and multi-device access.
  2. Define which compliance sub-tabs should be prioritized for real implementation vs remain as placeholder.
  3. Add change history/audit log for settings modifications.
  4. Clarify tenant-level vs store-level settings scope for multi-location scenarios.

## Owner feedback (2026-02-25)
- **Settings vs build-time decisions**: The power of the platform is customizability per tenant. Need to make sure the right things go in settings (user-configurable) vs things that are "set and forget" during the build/onboarding process.

## Source evidence
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3548`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3851`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/packages/ui-manifests/pages/settings/page.manifest.json`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/docs/clarification/pages/settings.md`
