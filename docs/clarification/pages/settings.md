# Settings

## Metadata
- Page ID: `settings`
- Route: `/staffing-planner.html#settings`
- Primary owner: Admin/compliance configuration owner (to assign in manifest)
- Last clarified: 2026-02-24

## Purpose
- Configure operational guardrails, workflow approvals, opening schedule assumptions, target profile percentages, and manager pay assumptions.

## Primary users
- Admin/owner roles managing policy defaults.
- Managers consuming resulting constraints in planning.

## Inputs and data
- Required: planner local state defaults and saved overrides.
- Optional: PTO sync metadata shown in approvals/settings context.

## Outputs
- Operations settings controls.
- Compliance placeholder views and future rule-engine scaffolding.
- Workflow gating values that influence planner behavior.

## Filters and controls
- Settings sub-tabs: `operations`, `overview`, `setup`, `youth`, `feeds`.
- Guardrails + workflow fields.
- Seasonal step-up/down dates.
- Pay and target profile assumption fields.

## Actions and interactions
- Edit numeric/date/checkbox settings.
- Apply recommended seasonal dates.
- Persist settings into planner state.

## Dependencies and side effects
- Stored in planner local state and `localStorage` payload.
- Influences planner validation, viability summaries, and approval paths.

## Known issues and constraints
- Compliance tabs are placeholder content only.
- No server-side policy validation or legal data feed enforcement yet.
- Multi-jurisdiction legal constraints are not implemented.

## Open questions
- Which settings should be tenant-level immutable defaults vs store-level overrides?
- Should manager pay assumptions be versioned and time-bound?
- How will legal rule updates be audited and rolled out?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3548`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3851`
