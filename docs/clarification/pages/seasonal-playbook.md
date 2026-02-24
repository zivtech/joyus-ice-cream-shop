# Seasonal Playbook

## Metadata
- Page ID: `seasonal_playbook`
- Route: `/seasonal-playbook.html`
- Primary owner: Strategy + Ops planning owner (to assign in manifest)
- Last clarified: 2026-02-24

## Purpose
- Manage seasonal trigger interpretation and target profile context used to time scale up/down decisions.

## Primary users
- Owners and operations leads setting strategy thresholds.
- Managers consuming recommended season transitions.

## Inputs and data
- Required: local `data.json` monthly/seasonal metrics.
- Optional: persisted trigger/profile overrides from `localStorage`.

## Outputs
- Seasonal trigger panel and transition monitoring.
- Target profile controls and recommendations by location/season.
- Context for dashboard strategic scaling decisions.

## Filters and controls
- Location focus.
- Date range view.
- Month focus.
- DoorDash mode toggle.

## Actions and interactions
- Update trigger profile and threshold interpretations.
- Navigate back to dashboard/planner/settings with shared context.

## Dependencies and side effects
- Uses shared `app.js` render pipeline gated by `APP_PAGE`.
- Reads/writes trigger/profile values in browser storage.

## Known issues and constraints
- Current implementation remains mostly read-only for core rule execution.
- Seasonal logic is still client-side and not policy-engine-backed.

## Open questions
- Which trigger edits should require approval/change history?
- How should seasonal recommendations vary by tenant operating calendar patterns?
- What minimum data history is required before enabling trigger automation?

## Source references
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/seasonal-playbook.html:114`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2416`
- `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/app.js:2622`
