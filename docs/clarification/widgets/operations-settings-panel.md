# Operations Settings Panel

## Metadata
- Widget ID: `operations_settings_panel`
- Parent page(s): `settings`
- Owner: Ops Admin (to assign in manifest)
- Last clarified: 2026-02-24
- Utility review state: `unreviewed`

## Purpose
- Provide editable operational guardrails, seasonal opening milestones, KPI targets, and pay assumptions that influence planner behavior.

## Data source and transform path
- Source state: `state.settings`.
- Default merge: `normalizeSettingsProfile(...)` ensures required keys are present.
- Recommended dates: `RECOMMENDED_OPENING_DATES`.

## Calculation logic
- Settings profile is normalized before render to avoid missing workflow/target fields.
- Input changes route through `updateSettingsValue(section, key, value)`.
- “Use Recommended” buttons apply predefined seasonal dates to opening schedule fields.

## Visual logic
- Operations tab renders deterministic four-card settings grid:
  1. Guardrails + workflow
  2. Store opening schedule
  3. Target profile percentages
  4. Manager pay + assumptions
- Field rows use numeric/date/checkbox controls with helper copy.

## Interactions and actions
- `settings-field` change events persist updated settings and rerender.
- `settings-apply-recommended` applies key-specific recommended seasonal date.

## Dependencies and side effects
- Reads/writes planner local state (`state.settings`).
- No external API dependency in current implementation.

## Known limitations
- No role-based edit restrictions yet.
- No validation against legal or jurisdiction-specific policy constraints.
- Settings are local-state only in current runtime scaffold.

## Open questions
- Which settings are mandatory vs optional for go-live?
- Should workflow guardrails become tenant-level immutable policy with override workflow?
- What migration path is required for centralized backend persistence?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:315`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:354`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3612`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:4443`
