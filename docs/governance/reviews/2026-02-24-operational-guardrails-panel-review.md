# Wave 2 Review: `operational_guardrails_panel`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner decision on whether current operating parameters are within safe bounds (labor pressure, manager capacity, data confidence).
   - Owner awareness of opening/closing staffing rule compliance.

2. What action changes because this exists?
   - Operators see labor pressure status (good/watch/risk) against benchmark bands, triggering cost reduction actions when risk escalates.
   - Manager cap narrative adjusts for shared-manager scenarios with explicit hourly assumptions.
   - Data confidence card flags modeled months, preventing overreliance on estimated data.

3. What risk is reduced?
   - Reduces risk of operating with labor costs in risk zone without awareness.
   - Makes data quality visible so decisions based on modeled data are explicitly flagged.
   - Opening/closing staffing minimums surface charter guardrail compliance.

4. What breaks if removed?
   - No operational risk dashboard. Labor pressure, manager capacity, and data confidence lose their monitoring surface.
   - Constitution's "policy safety" outcome loses its dashboard-level enforcement.

5. Overlap/duplication check
   - Industry survey lens panel uses the same benchmark bands but for competitive positioning. This panel uses them for internal risk alerting. Different purpose — complementary.
   - Operations settings panel configures guardrail values; this panel monitors compliance against them. Producer/consumer relationship.

## Comparative-owner need alignment
- Indirectly supports owner comparative needs by surfacing benchmark-relative labor pressure, though primarily functions as an internal risk monitor.

## Findings
1. High usefulness for risk monitoring — five-card stack covers key operational safety dimensions.
2. Data confidence card is uniquely valuable for preventing false confidence from modeled data.
3. Manager cap narrative adapts well to shared-manager scenarios.
4. Status pill classification (good/watch/risk) provides quick visual triage.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Add historical guardrail status tracking (how often has labor pressure been in risk zone).
  2. Consider adding alerts/notifications when guardrail status changes from good to risk.
  3. Link data confidence card to specific months/metrics that are modeled vs observed.

## Source evidence
- `apps/ice-cream-ops/app.js:2357`
- `apps/ice-cream-ops/app.js:2371`
- `apps/ice-cream-ops/app.js:2380`
- `packages/ui-manifests/widgets/operational_guardrails_panel/widget.manifest.json`
