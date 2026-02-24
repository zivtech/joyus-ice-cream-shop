# Trigger Gap Planner Panel

## Metadata
- Widget ID: `trigger_gap_planner_panel`
- Parent page(s): `dashboard`
- Owner: Strategy + Ops planning owner (to assign in manifest)
- Last clarified: 2026-02-24

## Purpose
- Identify the closest unmet seasonal transition trigger and quantify what metrics need to move next.

## Data source and transform path
- Trigger rule inputs: `state.triggerRules[loc]` and `PLAYBOOK_TRANSITION_ORDER`.
- Anchor metrics: `monthMetricsForLocation(loc, state.month)`.
- Trigger timing context: `triggerTimingForLocation(loc)` for currently-met triggers.
- Gap narratives: `conditionGap(...)` + `conditionGapLabel(...)`.

## Calculation logic
- For each transition rule:
  - Evaluate each condition against anchor metrics.
  - Compute raw delta to threshold and normalized gap score.
  - Mark rule as met when no conditions are unmet.
- Choose nearest unmet rule by smallest normalized gap score.
- If all rules are currently met, show met-state summary and action guidance from active trigger.

## Visual logic
- Layout: one card per selected location in a `timing-grid`.
- Card branches:
  1. All-met state: met trigger summary + suggested move copy.
  2. Gap state: closest threshold detail + top unmet gap bullet list + suggested move.
- Parent panel title/description clarifies “closest threshold” behavior.

## Interactions and actions
- Updates when month/location/plan context changes.
- Updates when trigger-rule settings change.
- Serves as a directional action planner; does not directly mutate schedules.

## Dependencies and side effects
- Depends on playbook transition rule helpers and month metrics derivation.
- Render-only widget with no direct persistence side effects.

## Known limitations
- Gap ranking uses normalized threshold deltas, not weighted business impact.
- Suggested action text is static by rule key and does not include labor-dollar estimates.
- No explicit confidence signal for trigger reliability by seasonality quality.

## Open questions
- Should gap ranking include estimated profit impact weighting?
- Should gap cards include projected timeline-to-threshold based on current trend slope?
- Should suggested actions produce one-click scenario simulations?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2149`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2257`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2302`
