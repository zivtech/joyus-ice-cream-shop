# Shift Planner

## Metadata
- Page ID: `shift_planner`
- Route: `/staffing-planner.html#shift_planner`
- Primary owner: Ops scheduling workflow owner (to assign in manifest)
- Last clarified: 2026-02-24

## Purpose
- Build and assign weekly schedules with policy guardrails, weather-aware recommendations, and approval routing.

## Primary users
- Store managers creating and assigning shifts.
- Admin/owner role reviewing readiness and approval gates.

## Inputs and data
- Required: local `data.json` fetched at planner bootstrap.
- Optional live: weather APIs for weather box and recommendation text.
- Optional live: PTO sync endpoint for request/conflict overlays.
- Local state persisted in `localStorage` (`mj_staffing_planner_state_v1`).

## Outputs
- Weekly schedule cards per day with slots, assignments, viability, and weather signal.
- Assignment gap summary and weekly readiness summary.
- Exportable approved plan JSON for downstream publish flow.

## Filters and controls
- Location selector.
- Horizon weeks (2/13/52).
- Week start date.
- Sub-tab controls: `Weekly Plan` and `Approvals`.

## Actions and interactions
- Edit slot time/role/headcount.
- Assign names with search chips.
- Repeat assignment next 12 weeks.
- Add/delete slots.
- Copy last week names/shifts/both.
- Accept weather recommendation.
- Submit policy change request.
- Submit next week for CEO approval.
- Export approved plan JSON.

## Dependencies and side effects
- Live network calls for weather and PTO sync (when available).
- Writes schedule/request/note state into `localStorage`.
- Emits JSON export consumed by Square publish script.

## Known issues and constraints
- Large single-file planner script limits maintainability.
- Validation and workflow logic are front-end only in this implementation.
- Policy/compliance checks are placeholders, not legal-grade enforcement.

## Open questions
- Which edits should be hard-blocked client-side vs service-side?
- Should weather recommendation actions be fully auditable with reason codes?
- How should assignment search scale for larger multi-store rosters?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.html`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:2266`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:3998`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/staffing-planner.js:4556`
