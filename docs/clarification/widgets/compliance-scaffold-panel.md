# Compliance Scaffold Panel

## Metadata
- Widget ID: `compliance_scaffold_panel`
- Parent page(s): `settings`
- Owner: Compliance + Ops (to assign in manifest)
- Last clarified: 2026-02-24
- Utility review state: `unreviewed`

## Purpose
- Provide a structured placeholder framework for compliance setup across jurisdiction, youth rules, legal feed strategy, and phased implementation.

## Data source and transform path
- Subtab state: `state.complianceSubtab`.
- Operations defaults: `normalizeSettingsProfile(state.settings)` when operations tab is active.
- Content source: inline scaffold lists in `renderComplianceView()`.

## Calculation logic
- Subtab key is normalized to `operations|setup|youth|feeds|overview`.
- Render branch selects deterministic card sets per subtab.
- Subtab switch is controlled from planner subnav actions.

## Visual logic
- Non-operations views render two-card compliance grid with list-based guidance.
- Header copy explicitly marks these sections as placeholders pending legal review.

## Interactions and actions
- `switch-compliance-subtab` updates subtab state and rerenders content.
- Operations subtab delegates editable controls to Operations Settings panel behavior.

## Dependencies and side effects
- Persists subtab and settings state in local planner state.
- No live compliance API or legal rule feed integration yet.

## Known limitations
- Guidance content is descriptive scaffold, not enforced rule logic.
- No jurisdiction-specific computation or violation engine in this panel.
- No evidence-linked compliance decision log yet in UI.

## Open questions
- Which compliance sections should move from placeholder to enforceable checks first?
- How should legal rule updates be versioned and approved?
- What user roles can approve compliance overrides in production?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3586`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3775`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3833`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:4510`
