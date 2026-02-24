# Wave 2 Review: `compliance_scaffold_panel`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Admin decision on compliance implementation roadmap: what compliance domains exist, what their current scaffold state is, and what needs to happen next.
   - Admin awareness of phased compliance hardening path (jurisdiction, youth, feeds, overview).

2. What action changes because this exists?
   - Admins can see the compliance framework scope and phased implementation plan across sub-tabs.
   - Explicit placeholder disclosure prevents treating scaffold content as enforceable compliance.
   - Subtab navigation organizes compliance domains into manageable sections.

3. What risk is reduced?
   - Reduces risk of compliance blind spots by enumerating domains that need future attention (youth, jurisdiction, rule feeds).
   - Placeholder disclosure reduces risk of operators mistakenly treating guidance as legal enforcement.

4. What breaks if removed?
   - Compliance domain overview loses its surface. The settings page would only have operations settings without compliance scaffolding context.
   - Future compliance hardening loses its visual framework for incremental implementation.

5. Overlap/duplication check
   - Operations settings panel shares the settings page but covers operational assumptions, not compliance domains. No functional overlap.
   - Compliance check interface is the evaluation engine; this panel is the configuration/visibility surface. Producer/consumer relationship.

## Comparative-owner need alignment
- This widget is compliance/governance focused, not comparative analytics. That is appropriate for its domain.

## Findings
1. Moderate usefulness — valuable as a compliance domain roadmap and framework placeholder, but currently delivers no enforceable compliance logic.
2. Explicit placeholder disclosure is a strength — transparent about current limitations.
3. Subtab organization (overview, setup, youth, feeds) correctly segments compliance domains.
4. All content is static scaffold copy with no dynamic compliance evaluation yet.

## Recommendation
- Recommended state: `validated_useful` (as scaffold with clear path to hardening).
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Prioritize which compliance sub-tab should become functional first (likely youth labor given charter emphasis).
  2. Connect to compliance_check interface for real pass/warn/fail evaluation when ready.
  3. Add compliance implementation status tracking per domain (scaffold/partial/enforced).

## Source evidence
- `apps/ice-cream-ops/staffing-planner.js:3590`
- `apps/ice-cream-ops/staffing-planner.js:3775`
- `apps/ice-cream-ops/staffing-planner.js:3833`
- `packages/ui-manifests/widgets/compliance_scaffold_panel/widget.manifest.json`
