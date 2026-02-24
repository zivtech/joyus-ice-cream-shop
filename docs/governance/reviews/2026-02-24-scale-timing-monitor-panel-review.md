# Wave 2 Review: `scale_timing_monitor_panel`

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner decision on seasonal scaling timing by showing historical trigger hit rates and current met/gap status.
   - Owner cross-location comparison of when triggers were historically met at each store.

2. What action changes because this exists?
   - Operators can see how reliably each trigger fires historically (hit rate %) and when it first fired.
   - Dual-location table enables store-by-store scaling readiness comparison.
   - Current met/gap status pills provide at-a-glance scaling state.

3. What risk is reduced?
   - Reduces risk of relying on triggers that historically fire inconsistently.
   - First-hit annotations help calibrate seasonal expectations (e.g., "EP typically triggers in March").

4. What breaks if removed?
   - No historical trigger reliability data. Operators would trust triggers without knowing their track record.
   - Trigger gap planner panel (prospective) loses its complementary retrospective validation surface.

5. Overlap/duplication check
   - Trigger gap planner panel is prospective (gap analysis and suggested actions). This panel is retrospective (historical hit rates and timing). They work as a pair — complementary, not duplicative.

## Comparative-owner need alignment
- Dual-location table directly supports store-to-store comparison of trigger timing — an owner comparative need.

## Findings
1. High usefulness as retrospective validation for the trigger-based scaling model.
2. Compact table format is information-dense but readable with status pill visual cues.
3. Single-location vs combined-location layouts adapt well to different scope contexts.
4. Hit rate percentage provides a simple reliability metric for each trigger rule.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Add trend direction for hit rates (improving/declining reliability over time).
  2. Consider adding a "confidence" indicator combining hit rate with data completeness.
  3. Link trigger monitor rows to historical trend panel for drill-through context.

## Source evidence
- `apps/ice-cream-ops/app.js:2037`
- `apps/ice-cream-ops/app.js:2115`
- `packages/ui-manifests/widgets/scale_timing_monitor_panel/widget.manifest.json`
