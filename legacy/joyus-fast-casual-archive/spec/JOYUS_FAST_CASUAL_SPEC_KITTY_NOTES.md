# Joyus Fast Casual - Spec Kitty Handoff Notes

Last updated: February 21, 2026
Owner context: Milk Jawn is treated as a multi-line business (retail + wholesale/distribution + manufacturing), and this tool should generalize to multi-store fast-casual operators.

Related Joyus specs:
- `/Users/AlexUA/claude/joyus-ai/spec/plan.md`
- `/Users/AlexUA/claude/joyus-ai/spec/joyus-fast-casual-square-publish.md`
- `/Users/AlexUA/claude/joyus-ai/spec/joyus-fast-casual-data-sync-foundation.md`
- `/Users/AlexUA/claude/joyus-ai/spec/joyus-fast-casual-feature-tracker.md`

## 1. Purpose Of This Note
This document captures the current implementation state and planned direction so Spec Kitty can generate a strong PRD for a generalized `joyus-fast-casual` product.

## 2. Current As-Built State (POC)
Current deploy target:
- `/Users/AlexUA/claude/zivtech-demos/projects/milk-jawn`

Main POC surfaces:
1. `index.html` + `app.js`:
- Operating dashboard, month/range analytics, staffing economics.
- DoorDash include/exclude mode in totals.
- Seasonal playbook now read-only reference (no threshold editing in UI).
- Month selector is filtered by selected location focus (only available months shown).
2. `staffing-planner.html` + `staffing-planner.js`:
- Top menu now: `Dashboard` | `Shift Planner` | `Shift Analysis` | `Settings`.
- `Shift Planner`: weekly plan + approvals workflow.
- `Shift Analysis`: visual historical review (profitability vs expected, weather context, saved notes).
- `Settings`: compliance placeholder section with compliance sub-tabs.

Recent deploy commits (zivtech-demos main):
- `ba05496` - documented operating-calendar flexibility requirement.
- `e630eb4` - top-level menu restructure + playbook read-only behavior + month filtering.
- `d7470fe` - visual shift analysis redesign with profitability meters and notes.
- `d8bbf5e` - compliance placeholder submenus and views.

## 3. Core Data/Model State In POC
Data source file:
- `/Users/AlexUA/claude/zivtech-demos/projects/milk-jawn/data.json`

Coverage currently loaded in POC:
- Historical window roughly `2022-07` through `2026-02` (latest month excluded in analytics ranges).

Current key assumptions in dashboard:
1. Manager assumption: `40 hrs/week @ $28/hr`.
2. Scheduling constraints:
- One opener allowed.
- Two closers required.
3. Weather signal logic:
- Uses expected-vs-actual temperature deltas and timing-aware precipitation signals.
4. Shift analysis comparison modes:
- Baseline expected (historical month/weekday baseline).
- Planned expected (planned targets with fallback logic).

## 4. What Is Intentionally Placeholder
Settings -> Compliance is currently conceptual scaffolding only:
- No legal rule engine enforcement yet.
- No jurisdiction-specific blocking/warnings in shift edits yet.
- No integrated school-calendar/permit workflows yet.

## 5. Product Direction For Joyus Migration
Target destination:
- A dedicated `joyus-fast-casual` repo (to be created/migrated later).
- Managed under Joyus architecture (not static-only GitHub Pages).

Migration intent:
1. Keep this POC as UI/logic reference.
2. Move core models + assumptions into Joyus services (tenant-aware).
3. Rebuild planners/analysis pages as Joyus product modules.
4. Add API + MCP operations for chat and programmatic workflows.

## 6. Critical Future Requirement: Operating Calendar Flexibility
Must support per-store operating calendar variability:
1. Open days/hours inferred from historical data OR set via onboarding forms.
2. Seasonal variation:
- Different hours by date range.
- Different open weekday sets by season.
- Full seasonal closures (ex: winter-closed shops).
3. Assumptions/contributions must be configurable by operating period:
- Seasonal staffing assumptions.
- Seasonal/daypart/channel contribution logic.
4. Multi-location and multi-state support must allow different calendars per location.

## 7. Spec Kitty PRD Inputs (Required)
Spec should include detailed onboarding for:
1. Business profile:
- Legal entity/brand structure, timezone defaults, operating model(s).
2. Location setup:
- Address, state/local jurisdiction, seasonal hours/closures, future locations.
3. Labor setup:
- Role taxonomy, wage bands, manager/key lead policies, full-time/part-time targets.
4. Employee profile:
- DOB, status flags for minor rules, availability rules, preferred shift lengths.
5. Compliance setup:
- Jurisdiction mapping and policy profiles (federal/state/local overlays).
6. Channel setup:
- In-store POS, delivery channels (DoorDash, etc.), optional wholesale channels.
7. Planning assumptions:
- Open/close minimums, daypart templates, event overrides, weather policy.

## 8. Architecture Requirements For General Tool
1. Multi-tenant isolation:
- Strong tenant boundaries, scoped auth, per-tenant encryption strategy.
2. Multi-location scale:
- Must handle dozens of locations per brand and franchise parent/child views.
3. Real-time + batch modes:
- Support hourly/daily refresh tiers plus monthly/single-run low-cost tier.
4. Integration interfaces:
- Square, Toast, and MCP-first pathways.
5. Export:
- XLSX operator workbook export from UI + API + MCP tool.
6. Governance:
- Manager suggestion workflow with approval gates and audit trails.

## 9. Open Questions For Spec Kitty To Resolve
1. Final tenant key management approach (tenant-held password/key vs managed KMS blend).
2. Approval model variants (single approver vs conditional multi-approver).
3. Franchise hierarchy permissions and parent drill-down policy.
4. Rule update ownership: legal feed automation vs managed policy library.
5. Scope of planned-vs-actual staffing ingestion from POS/workforce systems.
6. Instance architecture decision:
- Are deployments single shared multi-tenant services, or separate per-customer instances?
- If separate instances, onboarding should generate a refined, tenant-specific spec pack (integrations, policy set, workflows, assumptions) that becomes the contract for each instance.

## 10. Suggested Next Execution Sequence
1. Create `joyus-fast-casual` repo with baseline architecture and module map.
2. Generate PRD via Spec Kitty using this note + current POC code.
3. Define onboarding schema first (especially operating calendar + compliance profiles).
4. Implement backend domain model + APIs before rebuilding front-end flows.
5. Port Shift Planner and Shift Analysis UI after schema/API stabilization.
