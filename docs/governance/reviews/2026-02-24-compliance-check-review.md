# Wave 1 Review: `compliance_check`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Admin/owner decision on whether a schedule draft meets compliance policies (youth labor, overtime, notice period) before approval and publish.
   - Store Manager visibility into pass/warn/fail status of policy checks.

2. What action changes because this exists?
   - Approvals workbench can block publish when compliance status is fail.
   - Settings/compliance surface shows policy evaluation outcomes for configuration review.
   - Admins and Store Managers can identify and resolve compliance violations before they reach the external publish path.

3. What risk is reduced?
   - Reduces risk of publishing schedules that violate youth labor laws, overtime rules, or notice period requirements.
   - Makes compliance status an explicit, visible gate rather than an implicit assumption.

4. What breaks if removed?
   - No formal compliance check gate in the approval/publish flow. Admins would rely on manual review to catch policy violations.
   - The constitution's "policy safety" required outcome (#4) loses its enforcement mechanism.

5. Overlap/duplication check
   - The compliance_scaffold_panel widget shows compliance status in the settings UI — that is the display surface, while this interface is the evaluation engine. No functional duplication.
   - The publish script's preflight checks are structural (approval, overlap, duration) not policy-based. This interface covers a distinct compliance domain.

## Comparative-owner need alignment
- This interface is compliance/safety focused, not comparative analytics. That is appropriate — it supports the "policy safety" required outcome in the constitution.

## Findings
1. Useful as the only compliance evaluation interface in the system. Addresses a constitutional requirement directly.
2. Current implementation is scaffold/placeholder — the API endpoint and MCP tool contracts are defined but policy evaluation logic is not yet production-grade.
3. Legal/policy semantics are explicitly flagged as unvalidated in the manifest notes, which is appropriately transparent.
4. The interface is consumed by two downstream surfaces (approvals_workbench, settings_compliance), confirming cross-flow utility.

## Recommendation
- Recommended state: `validated_useful` (with strong caveat that compliance logic requires legal validation before production reliance).
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Compliance evaluation rules must be validated against actual federal/state/local youth labor and overtime statutes before any production reliance.
  2. Policy outcomes (pass/warn/fail) need clear definitions of what each status means for the approval workflow — specifically whether "warn" blocks publish or only alerts.
  3. Add jurisdiction-specific rule configuration so compliance checks adapt to store location.
  4. Add audit trail for compliance check runs tied to schedule versions.

## Source evidence
- `/Users/AlexUA/claude/joyus-ice-cream-shop/packages/ui-manifests/interfaces/compliance_check/interface.manifest.json`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/docs/clarification/widgets/compliance-scaffold-panel.md`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/docs/planning/01-product-charter.md:19` (youth labor compliance guardrail)
