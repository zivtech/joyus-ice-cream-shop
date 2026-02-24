# Wave 1 Review: `operations_settings_panel`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner/admin decisions on operational guardrails (min closers, workflow flags), seasonal opening milestones, labor cost targets, and pay assumptions.
   - These upstream assumptions directly influence planner behavior, viability calculations, and approval readiness.

2. What action changes because this exists?
   - Admins can configure guardrails that constrain planner behavior (e.g., minimum closers, CEO approval requirements).
   - Seasonal date recommendations can be applied with one click, reducing manual date entry for step-up/step-down milestones.
   - Target profile and pay assumptions feed into economic calculations visible in planner and dashboard surfaces.

3. What risk is reduced?
   - Reduces risk of planner operating with incorrect assumptions (wrong opening dates, missing guardrails, stale pay rates).
   - Makes upstream configuration explicit and editable rather than hidden in code constants.

4. What breaks if removed?
   - Guardrail and assumption values would need to be hardcoded or managed outside the application, losing operator control.
   - The constitution's "economic transparency" and "decision clarity" outcomes depend on these assumptions being visible and configurable.

5. Overlap/duplication check
   - The compliance_scaffold_panel widget shares the settings page but covers a different domain (compliance rules vs operational assumptions). No functional overlap.
   - No other widget provides guardrail/assumption editing.

## Comparative-owner need alignment
- This widget is configuration/control focused, not comparative analytics. That is appropriate — it sets the assumptions that comparative analytics depend on.

## Findings
1. High usefulness as the only surface for editing operational assumptions that drive planner and economic calculations.
2. Four-card settings grid provides clear domain grouping (guardrails, opening schedule, target profile, pay assumptions).
3. No role-based edit restrictions yet — any user can modify settings. This is a hardening gap.
4. Settings are local-state only (localStorage), which means they don't persist across browsers/devices and are not auditable.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Add role-based edit restrictions (admin-only for guardrails and pay assumptions).
  2. Migrate settings persistence from localStorage to server-side storage for durability and auditability.
  3. Add validation rules for setting values (e.g., min closers >= 1, target percentages 0-100).
  4. Determine which settings are mandatory for go-live vs optional configuration.

## Source evidence
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:315`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:354`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:4416`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:4445`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/packages/ui-manifests/widgets/operations_settings_panel/widget.manifest.json`
