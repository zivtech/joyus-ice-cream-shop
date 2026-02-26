# 07 — Platform Reboot Plan

> **Status**: Active — Phase 4 complete, Phase 5 next
> **Created**: 2026-02-24
> **Purpose**: Comprehensive reference for rebooting the Milk Jawn platform from a single-tenant vanilla JS application to a hosted, multi-tenant operational platform.

---

## Table of Contents

1. [Context and Motivation](#context-and-motivation)
2. [Key Decisions](#key-decisions)
3. [Role Model](#role-model)
4. [Compliance Model](#compliance-model)
5. [Jobs To Be Done](#jobs-to-be-done)
6. [Architecture](#architecture)
7. [Phased Build Plan](#phased-build-plan)
8. [Migration Strategy: What We Keep and What We Leave Behind](#migration-strategy-what-we-keep-and-what-we-leave-behind)
9. [Open Items](#open-items)

---

## Context and Motivation

The current `joyus-ice-cream-shop` repository contains a working vanilla JS product (~8,300 lines of application code) wrapped in premature governance infrastructure (6 packages, 22 manifests, a validation pipeline, and extensive review documents). The product logic is sound but the surrounding structure was built for a scale and process that doesn't yet exist.

The decision is to restructure this repo into a proper hosted multi-tenant platform where Milk Jawn (Joyus Ice Cream) is the first tenant but not the only one. The platform will serve independent food-service operators who need POS-integrated staffing, scheduling, and profitability analytics.

This document is the living reference for that rebuild. It captures the decisions made, the architecture chosen, the jobs the platform must fulfill, and the phased plan for getting there.

---

## Key Decisions

These decisions are final and govern all downstream work.

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **Hosted platform** (not open source) | Revenue model requires control over deployment, billing, and tenant data. Open-source governance overhead is not justified at this stage. |
| 2 | **POS-agnostic from day one** | Square adapter ships first, but the data model and adapter interface must be abstract. Locking into Square limits the addressable market and creates migration debt. |
| 2b | **Delivery marketplace integration** | DoorDash, UberEats, Grubhub, etc. are separate from POS but critical to revenue and staffing. Different economics (15-30% commissions), different demand signals, different labor impact. Must be first-class data sources alongside POS. |
| 3 | **Restructure the existing repo** (`joyus-ice-cream-shop`) | Starting fresh discards git history and working calculation logic. The repo gets restructured, not abandoned. |
| 4 | **Build it right** — no artificial timeline pressure | Quality and correctness over speed. Each phase ships when it's solid, not when a deadline says so. |
| 5 | **React frontend** | React with Vite tooling for the operational UI. Modern component patterns, fast dev experience, large ecosystem. |
| 5b | **Laravel backend** | Evaluated Drupal, Node/NestJS, Django, Rails, Laravel, and Supabase against 7 criteria. Laravel selected for: team PHP expertise, mature multi-tenancy (stancl/tenancy), built-in queue/scheduler (Horizon), strong role/permission packages (spatie), excellent AI-assisted development (~85-90% code accuracy), and $60-75/month hosting cost (Forge + DigitalOcean). |

---

## Role Model

The platform defines five roles. Role names are **editable per tenant** so each business can use terminology that fits their culture. The platform role names below are the internal canonical identifiers; the tenant-facing labels are cosmetic.

| Platform Role | Milk Jawn Label | Purpose |
|---|---|---|
| **Admin** | Owner/Admin | Strategic oversight, platform configuration, financials, full analytics access |
| **GM** | General Manager | Operational approvals, schedule sign-off, publish gate authority |
| **Store Manager** | Store Manager | Day-to-day scheduling, shift editing, exception requests, retrospectives |
| **Key Lead** | Key Lead | On-shift authority, opening/closing duties, compliance certification holder |
| **Staff** | Staff | View schedule, request time off, manage availability |

### Role Design Notes

- **Five roles, not fewer.** The Key Lead role exists specifically for compliance reasons: food safety regulations (ServSafe and equivalents) require a certified person on every shift in most jurisdictions. Collapsing Key Lead into Staff loses the ability to enforce this as a scheduling constraint.
- **Tenant-configurable labels.** A bakery might call their GM a "Head Baker." A food truck might not distinguish Store Manager from GM. The label is cosmetic; the permission set is what matters.
- **Permissions are server-side.** Laravel enforces access control server-side via Policies and spatie/laravel-permission. The React frontend renders based on the authenticated user's permissions but never trusts client-side role checks alone.

---

## Compliance Model

Food safety certification requirements (ServSafe, state-specific equivalents) vary by state and local jurisdiction. The platform cannot hardcode assumptions about what's required.

### Design Principles

1. **Rules engine with jurisdiction presets**, not hardcoded logic.
2. A tenant sets their **state/locality** and receives default rules for that jurisdiction.
3. Tenants can **tighten** rules (require more than the legal minimum) but **cannot loosen** below legal minimums.
4. Rules are consumed as **scheduling constraints**, not just informational displays.
5. Compliance rules are stored as **Eloquent models** with seeded jurisdiction presets.

### What a Compliance Rule Defines

| Field | Description | Example |
|---|---|---|
| `certification_type` | Which certification is required | ServSafe Food Protection Manager |
| `jurisdiction` | State/locality the rule applies to | Pennsylvania, Philadelphia County |
| `coverage_requirement` | When a certified person must be present | Every shift, during operating hours, per location |
| `expiration_tracking` | Whether and how expiration is tracked | 5-year renewal cycle |
| `constraint_type` | Hard constraint (blocks publish) or soft warning | Hard: cannot publish without coverage; Soft: warning only |
| `minimum_certified_count` | How many certified people needed per coverage period | At least 1 per shift |

### How Compliance Integrates with Scheduling

1. **During schedule building**: The planner UI shows coverage gaps as warnings or errors based on rule constraint type.
2. **Pre-publish validation**: Hard constraints block schedule publishing if compliant coverage is missing. The approval workflow surfaces these as "readiness check failures."
3. **Dashboard**: Certification status overview — who's certified, upcoming expirations, coverage gap projections.
4. **Notifications**: Expiration reminders sent to the employee and their manager ahead of the renewal deadline.

---

## Jobs To Be Done

These are the problems the platform must solve, organized by role. Each job has a number for cross-referencing in the phased build plan.

### Owner/Admin Jobs

**Job 1: "Help me understand if I'm making money today/this week/this season."**
- Revenue vs. labor cost visibility with gross profit tracking.
- Real-time (or near-real-time via POS sync) numbers, not end-of-month surprises.
- Seasonal context: "Is this Tuesday better or worse than Tuesdays last February?"

**Job 2: "Help me staff correctly for demand I can predict."**
- Seasonal pattern recognition from historical POS data.
- Trigger-based scheduling: "When daily revenue exceeds $X, staff to Y coverage."
- Reduce both understaffing (lost revenue, burned-out staff) and overstaffing (unnecessary labor cost).

**Job 3: "Help me compare performance across locations and over time."**
- Year-over-year comparisons for the same periods.
- Store-to-store benchmarking for multi-location operators.
- Portfolio-level rollup: "How is the business doing overall?"

**Job 4: "Help me publish schedules without manual POS data entry."**
- POS integration for schedule publishing: build it in the platform, push it to Square (or other POS).
- Eliminate the error-prone manual step of re-entering schedules into the POS system.

**Job 4b: "Help me understand my delivery channel economics."**
- DoorDash, UberEats, Grubhub each take 15-30% commission — gross profit per delivery order is fundamentally different from in-store.
- Channel mix visibility: "What percentage of revenue comes from delivery vs. walk-in? What's the margin on each?"
- Delivery order volume as a demand signal: affects prep staffing, packaging labor, and kitchen throughput differently than walk-in traffic.
- Commission and fee tracking: understand the true cost of each delivery platform.

### GM Jobs

**Job 5: "Help me approve schedules that meet our standards."**
- Approval gate with readiness checks: coverage rules met, compliance satisfied, labor budget within target.
- Clear pass/fail indicators before the GM signs off.
- Reject with notes, approve and publish in one action.

**Job 6: "Help me handle exception requests efficiently."**
- Review and resolve day-level exception requests from Store Managers.
- Batch processing: see all pending requests, approve/deny with context.
- Audit trail: who requested what, who approved, what changed.

### Store Manager Jobs

**Job 7: "Help me build a shift plan that meets coverage rules."**
- Position-based scheduling with min/max coverage constraints.
- Compliance awareness: the planner knows which employees are certified and flags gaps.
- Cost projection: see the labor cost of the schedule before submitting for approval.

**Job 8: "Help me request exceptions when the standard plan doesn't fit."**
- Day-level exception requests for events, weather, holidays, or other anomalies.
- Structured format: what day, what change, why, proposed staffing adjustment.
- Visibility into request status (pending, approved, denied).

**Job 9: "Help me see what actually happened vs. what was planned."**
- Planned-vs-actual variance: scheduled labor vs. actual POS labor data.
- Retrospective learning: "We overstaffed Tuesday afternoons three weeks in a row."
- Feeds back into better future scheduling.

### Key Lead Jobs

**Job 10: "Help me see my shifts and responsibilities."**
- Clear view of assigned shifts with opening/closing duties marked.
- On-shift authority periods: "You are the responsible certified person from 8am to 2pm."

**Job 11: "Help me track my certification status."**
- Expiration dates and renewal reminders.
- Self-service view: "My ServSafe expires in 3 months."

### Staff Jobs

**Job 12: "Help me see when I work."**
- Schedule visibility: upcoming shifts, historical shifts.
- Mobile-friendly: staff primarily access this on their phones.

**Job 13: "Help me request time off."**
- PTO and availability management.
- Submit requests, see status, get notified of approval/denial.

### Platform Jobs (Multi-Tenant)

**Job 14: "Let me connect my POS and start getting insights."**
- Onboarding flow: connect Square (or other POS), authorize API access, import historical data.
- Guided setup: "We found 44 months of transaction data. Importing now."
- Time-to-value: new tenants should see their first dashboard within the onboarding session.

**Job 15: "Let me configure my business rules without coding."**
- Operating hours, positions, pay rates, coverage rules per position, compliance jurisdiction selection, trigger thresholds for demand-based staffing.
- All configurable through the UI, stored as Laravel configuration entities (Eloquent models).

**Job 16: "Let me run this for multiple locations."**
- Multi-location support with per-location configuration.
- Rollup analytics across locations.
- Per-location scheduling with shared employee pools where applicable.

**Job 17: "Let me customize role names for my business."**
- Tenant-configurable role labels (see Role Model section above).
- Does not affect permissions — only display names.

---

## Architecture

### High-Level Stack

```
+-------------------+       +---------------------+       +------------------+
|                   |       |                     |       |                  |
|   React (Vite)    | <---> |   Laravel (API)      | <---> |   POS Adapters   |
|   Operational UI  |  API  |   Sanctum + Horizon  |       |   (Square, ...)  |
|                   |       |                     |       |                  |
+-------------------+       +---------------------+       +------------------+
                                      |                          |
                            +---------------------+   +------------------------+
                            |                     |   |                        |
                            |  Scheduling Engine  |   |  Delivery Marketplace  |
                            |  (pure JS/TS)       |   |  Adapters (DoorDash,   |
                            |                     |   |  UberEats, Grubhub...) |
                            +---------------------+   +------------------------+
```

- **Backend (Laravel)**: User management via Sanctum (API token auth), roles and permissions via spatie/laravel-permission, multi-tenancy via stancl/tenancy (single-database, row-level scoping), Eloquent ORM for tenants/locations/employees/schedules/compliance rules, Horizon for queue monitoring, built-in task scheduler for POS/delivery cron jobs, REST API endpoints for frontend consumption. Hosted on Forge + DigitalOcean (~$60-75/month).
- **Frontend (React + Vite)**: Operational UI — dashboard, shift planner, analytics, settings, onboarding. Communicates with backend exclusively via API.
- **Scheduling Engine (pure JS/TS module)**: Extracted calculation logic with zero UI or framework dependencies. Coverage validation, cost projection, schedule scoring, compliance constraint checking. Testable in isolation.
- **POS Adapters (plugin pattern)**: Square adapter ships first. Abstract interface allows additional adapters (Toast, Clover, Lightspeed, etc.) without modifying core platform code.
- **Delivery Marketplace Adapters (plugin pattern)**: DoorDash, UberEats, Grubhub, etc. Separate from POS adapters because they have different data shapes, different economics (commission structures), and different API patterns. A location may use one POS but multiple delivery platforms simultaneously.
- **Data Pipeline**: Import (POS + delivery marketplace raw data -> normalized platform schema) and Export (platform schedule -> POS-specific API calls).

### POS Adapter Pattern

```
POS Data (Square, Toast, Clover, etc.)
    |
    v [Adapter: normalize]
Platform Schema (transactions, labor, items)
    |
    v [Engine: calculate]
Analytics, Schedules, Projections
    |
    v [Adapter: publish]
POS Scheduling API
```

Each adapter implements a standard interface:

| Method | Input | Output |
|---|---|---|
| `importTransactions(raw)` | Raw POS transaction data | `NormalizedTransaction[]` |
| `importLabor(raw)` | Raw POS labor/timecard data | `NormalizedLaborEntry[]` |
| `importEmployees(raw)` | Raw POS employee roster | `NormalizedEmployee[]` |
| `publishSchedule(schedule)` | Platform schedule object | POS-specific API calls |
| `syncPTO()` | (Fetches from POS) | `NormalizedPTOEntry[]` |

The normalized types are the platform's canonical data model. All calculation logic, analytics, and UI operate on normalized data — never on POS-specific formats. This is what makes the platform POS-agnostic: swap the adapter, keep everything else.

### Delivery Marketplace Adapter Pattern

Delivery platforms (DoorDash, UberEats, Grubhub, etc.) are a **separate adapter category** from POS. Key differences:

- **Multiple simultaneous**: A location typically uses one POS but multiple delivery platforms at the same time.
- **Different economics**: Each platform has its own commission structure (15-30%), service fees, and payout timing.
- **Demand signal, not schedule target**: Delivery data feeds analytics and staffing projections but you don't publish schedules *to* DoorDash.
- **Order flow may or may not go through POS**: Some shops route delivery orders through Square; others get them on a separate tablet. The platform must handle both patterns.

```
Delivery Platform (DoorDash, UberEats, Grubhub, etc.)
    |
    v [Adapter: normalize]
Platform Schema (delivery_orders, commissions, channel_attribution)
    |
    v [Engine: calculate]
Channel Economics, Demand Signals, Staffing Impact
```

Each delivery adapter implements:

| Method | Input | Output |
|---|---|---|
| `importOrders(raw)` | Raw delivery order data | `NormalizedDeliveryOrder[]` (includes commission, fees, net revenue) |
| `importPayouts(raw)` | Raw payout/settlement data | `NormalizedPayout[]` |
| `getMenuSync()` | (Fetches from platform) | Menu item mapping for reconciliation |

The normalized delivery data merges with POS data in the analytics layer, with **channel attribution** so every dollar of revenue is tagged as in-store, DoorDash, UberEats, etc. This is critical for understanding true profitability by channel.

### Multi-Tenant Model

- Each tenant is an **organization** entity in the backend.
- An organization has: `locations[]`, `employees[]`, `roles` (with custom labels), `compliance_jurisdiction`, `pos_connection_config`, `business_rules`.
- Data isolation is enforced via stancl/tenancy's automatic query scoping (single-database, row-level tenant_id filtering). Tenant A never sees Tenant B's data.
- Shared codebase, per-tenant configuration. No per-tenant code forks.
- Multi-location is modeled as multiple location entities under one organization, with rollup analytics aggregating across them.

### Compliance Rules Engine

- Jurisdiction presets are stored as Laravel configuration entities (Eloquent models).
- Each preset defines: required certifications, coverage requirements (when certified person must be present), tracking periods, expiration rules.
- The scheduling engine consumes compliance rules as constraints during schedule validation:
  - **Hard constraints**: Block schedule publishing (e.g., "every shift must have at least one ServSafe-certified person").
  - **Soft constraints**: Generate warnings but allow publishing (e.g., "recommended to have two certified people during peak hours").
- Pre-publish readiness check: "Does every shift in this schedule have required compliant coverage?"
- Dashboard surfaces: certification status by employee, upcoming expirations, projected coverage gaps.

### API Strategy (Preliminary)

The API layer between the React frontend and the backend must support:
- Standard CRUD for entities (organizations, locations, employees, schedules, etc.)
- Complex business operations (validate schedule, publish schedule, run compliance check)
- Role-based access control (filter responses based on authenticated user's permissions)
- Real-time or near-real-time data for dashboard updates

Laravel API Resources provide REST endpoints for standard CRUD. Custom controllers handle business operations (schedule validation, compliance checks, POS publishing). Laravel's built-in route model binding and form request validation enforce contracts.

---

## Phased Build Plan

Each phase builds on the previous one. No phase ships until it's solid. The phases are ordered by dependency and value delivery.

### Phase 0: Preparation (Current Phase)

**Goal**: Document decisions, audit existing code, prepare for the rebuild.

| Task | Description | Status |
|---|---|---|
| Document jobs-to-be-done and architecture | This document | Complete |
| Audit `app.js` calculation logic | Identify pure business logic vs. DOM/UI code | Complete (see `08-calculation-logic-audit.md`) |
| Audit `staffing-planner.js` calculation logic | Identify extractable scheduling logic | Complete (see `08-calculation-logic-audit.md`) |
| Map existing `data.json` fields to normalized schema | Understand what Square data we have and how it maps | Not started |
| Set up Laravel project | `laravel new` with API mode, install stancl/tenancy, spatie/laravel-permission, Sanctum, Horizon | Complete (`platform/`) |
| Define normalized data types | TypeScript interfaces for `NormalizedTransaction`, `NormalizedLaborEntry`, etc. | Not started |
| Audit Milk Jawn's delivery platform usage | Which platforms (DoorDash, UberEats, Grubhub), how orders flow (through POS or separate), commission structures | Not started |

### Phase 1: Foundation — Complete

**Goal**: Standing Laravel backend with user management, multi-tenant entities, and a React shell that authenticates via Sanctum and renders based on permissions.

**Delivers**: The skeleton that everything else builds on. No end-user value yet, but all the plumbing is in place.

**Commits**: `99cb012` (backend), `94399d9` (React shell)

| Task | Description | Jobs Addressed | Status |
|---|---|---|---|
| Laravel project setup | `laravel new --api`, install stancl/tenancy, spatie/laravel-permission, Sanctum, Horizon | Infrastructure | Complete |
| User/role/permission system | Five roles via spatie/laravel-permission, Policies for authorization, server-side enforcement | Role Model | Complete |
| Multi-tenant entity model | Organization, Location, Employee Eloquent models with stancl/tenancy row-level scoping | Job 16, 17 | Complete |
| Configurable role labels per tenant | `role_labels` JSON column on Organization model | Job 17 | Complete |
| API endpoints | Laravel API Resources for CRUD + custom controllers for business operations | Infrastructure | Complete |
| Authentication | Sanctum API tokens for React SPA auth | Infrastructure | Complete |
| React shell | Vite + React with routing, auth integration, role-based rendering | Infrastructure | Complete |

### Phase 2: Scheduling Engine — Complete

**Goal**: Extract and formalize the calculation logic into a standalone, thoroughly tested module.

**Delivers**: The computational core of the platform — reusable, testable, and independent of any UI or backend framework.

**Commit**: `4c61397`

| Task | Description | Jobs Addressed | Status |
|---|---|---|---|
| Extract calculation logic from `staffing-planner.js` | Pure functions for coverage, cost, scoring, weather, templates, PTO, validation | Job 7 | Complete |
| Extract analytics logic from `app.js` | Revenue/labor/profit calculations, benchmarks, seasonal triggers | Jobs 1, 2, 3 | Complete |
| Define scheduling engine API | 461-line TypeScript type system, `TenantSettings` parameterization replacing all hardcoded values | Infrastructure | Complete |
| Comprehensive test suite | 126 tests across 9 test files (financial, scheduling, weather, PTO, seasonal, retrospective) | Quality | Complete |
| Node HTTP service wrapper | Express 5 on port 3100, 8 compute endpoints + health check (resolves Open Item #2) | Infrastructure | Complete |
| Laravel integration | `SchedulingEngineService` singleton, config, 41 PHP tests with `Http::fake()` | Infrastructure | Complete |
| Compliance constraint interface | Engine accepts compliance rules as scheduling constraints | Job 10 | Deferred to Phase 5 |

**Key principle**: This module has zero dependencies on the backend platform, React, or any UI framework. It's pure computation. It can be tested with `node` or in a browser. This isolation is what makes the platform's logic trustworthy and portable.

**Bug fixes**: BUG-1 from calculation audit — `dayValidation()` now reads `workflow.minOpeners`/`minClosers` from settings instead of hardcoded values. `applyRecommendationToDay` converted from mutable to immutable pattern.

**Tracked for future**: (1) Add `storeCount` param to `sharedManagerWeeklyImpact` — currently hardcoded `/2` for per-store split. (2) Add Zod input validation to Node HTTP server before production.

### Phase 3: POS Integration — Complete

**Goal**: Abstract POS adapter interface with a working Square implementation. Import pipeline brings historical data into the normalized schema.

**Delivers**: The data bridge. Without this, the platform has no real data to work with.

**Commit**: `d683644`

| Task | Description | Jobs Addressed | Status |
|---|---|---|---|
| Define abstract POS adapter interface | PHP `PosAdapter` contract + TypeScript `NormalizedDailySales`, `NormalizedEmployee`, `ScheduleForPublish` types | Infrastructure | Complete |
| Implement Square adapter | HTTP facade with pagination, rate-limit retry, orders/labor/team-members import, schedule publishing | Jobs 4, 14 | Complete |
| Import pipeline | `pos:sync` and `delivery:sync` artisan commands with `--dry-run`, audit logging via PosSync/DeliverySync | Job 14 | Complete |
| Migrate Milk Jawn historical data | `data:import-historical` command — upserts DailyActual + Employee records from data.json with BOTH pivot | Validation | Complete |
| POS connection configuration UI | Credentials stored in TenantSetting (category: pos, key: square_access_token) | Job 14 | Backend complete, UI deferred to Phase 4 |
| Define abstract delivery marketplace adapter interface | PHP `DeliveryAdapter` contract + TypeScript `NormalizedDeliveryDay` type | Job 4b | Complete |
| Implement DoorDash adapter | Stub pending API partnership — historical delivery data imports via data:import-historical from doordash_net field | Job 4b | Stub complete |
| Delivery connection configuration UI | Per-tenant, per-location delivery platform credentials | Job 4b | Deferred to Phase 4 |

**Validation milestone**: After this phase, Milk Jawn's existing 44 months of historical data should be importable and produce the same analytics results as the current vanilla JS dashboard. This is the critical regression test.

**Test coverage**: 16 new PHP tests (PosAdapter 7, DeliveryAdapter 4, ImportHistoricalData 5). Total: 57 Laravel + 126 engine = 183 tests.

### Phase 4: Core Operational UI — Complete

**Goal**: The primary user-facing product. Dashboard, shift planner, and schedule publishing with role-based access.

**Delivers**: End-user value. After this phase, the platform is usable for daily operations.

**Commit**: `a9906d9`

| Task | Description | Jobs Addressed | Status |
|---|---|---|---|
| Dashboard | KPI cards (revenue, labor %, GP, avg daily rev), daily actuals table, location/date selectors | Jobs 1, 2, 3, 4b | Complete |
| Shift Planner | 7-column week grid, slot editor modal, employee assignment, schedule CRUD | Job 7 | Complete |
| Schedule Approval Workflow | Submit/approve/reject/publish workflow with SchedulePolicy role enforcement (gm+ for approval) | Job 5 | Complete |
| Schedule Publishing | Status workflow complete (draft→pending→approved→published); POS push deferred to live integration | Job 4 | Workflow complete |
| Shift Analysis | Sortable daily actuals table with location/date filtering and summary footer | Jobs 9 | Complete |
| Role-based permissions in UI | SchedulePolicy + RoleGate components enforce server-side and client-side access | Role Model | Complete |

**Backend**: ScheduleController (CRUD + 4 workflow actions), ScheduleSlotController, ShiftAssignmentController, DailyActualController (index + summary with GP calculation). 21 new tests.

**Frontend**: 15 new React components — DashboardPage, ShiftPlannerPage, ShiftAnalysisPage, SeasonalPlaybookPage, plus shared components (KpiCard, LocationSelector, DateRangeSelector, WeekSelector, StatusBadge, ScheduleActions, DayColumn, SlotEditor, EmptySchedule). API hooks layer, format utilities.

**Test coverage**: 78 Laravel tests (229 assertions) + 126 engine tests = 204 total.

### Phase 5: Compliance and Advanced Features

**Goal**: Compliance rules engine, certification tracking, exception workflows, and variance analysis.

**Delivers**: The features that differentiate this platform from a simple schedule builder.

| Task | Description | Jobs Addressed |
|---|---|---|
| Jurisdiction-aware compliance rules engine | Configurable presets per state/locality | Compliance Model |
| Certification tracking | Employee certification records, expiration tracking | Job 11 |
| Compliance as scheduling constraint | Pre-publish validation blocks uncovered shifts | Compliance Model |
| Exception request workflow | Store Manager requests, GM approval, audit trail | Jobs 6, 8 |
| Planned-vs-actual variance | Scheduled vs. actual labor from POS timecard data | Job 9 |
| Multi-location rollup analytics | Aggregate metrics across locations | Job 16 |
| Certification expiration notifications | Reminders to employees and managers | Job 11 |

### Phase 6: Platform Hardening

**Goal**: Make the platform ready for tenants beyond Milk Jawn.

**Delivers**: Self-service onboarding, configuration UI, billing, and additional POS support.

| Task | Description | Jobs Addressed |
|---|---|---|
| Onboarding flow | Connect POS, import data, configure business, guided setup | Job 14 |
| Business rules configuration UI | Operating hours, positions, pay rates, coverage rules, thresholds | Job 15 |
| Additional POS adapters | Toast, Clover, Lightspeed — as demand warrants | Job 14 |
| Additional delivery marketplace adapters | UberEats, Grubhub, additional platforms — as demand warrants | Job 4b |
| Billing and subscription management | Stripe integration or similar | Platform |
| Performance optimization | Multi-tenant query optimization, caching, CDN | Platform |
| Monitoring and alerting | Application health, error tracking, uptime | Platform |

---

## Migration Strategy: What We Keep and What We Leave Behind

### What We Keep

| Asset | Current Location | Action | Destination |
|---|---|---|---|
| Calculation logic in `app.js` | `apps/ice-cream-ops/app.js` | Extract pure business logic into scheduling engine module | Phase 2 scheduling engine |
| Calculation logic in `staffing-planner.js` | `apps/ice-cream-ops/staffing-planner.js` | Extract pure scheduling logic into scheduling engine module | Phase 2 scheduling engine |
| `data.json` (44 months Square POS data) | `apps/ice-cream-ops/data.json` | Migrate to normalized schema as validation/regression dataset | Phase 3 validation |
| Product charter and baseline constitution | `docs/planning/01-product-charter.md`, `docs/planning/00-baseline-constitution.md` | Edit for multi-tenant context, keep as product documentation | `docs/` |
| `publish_schedule_to_square_mcp.py` concepts | `scripts/` | Generalize into Square POS adapter's `publishSchedule` method | Phase 3 Square adapter |
| `build_data.py` pipeline concepts | `scripts/` | Generalize into POS import pipeline | Phase 3 import pipeline |
| Decision log and this reboot plan | `docs/planning/05-decision-log.md`, this document | Continue as living documents | `docs/planning/` |

### What We Leave Behind

| Asset | Current Location | Reason |
|---|---|---|
| 6-package monorepo structure | `packages/ui-*` | Premature for current scale. The rebuild will introduce packages when they are earned by actual code that needs them. |
| 22 manifest files + governance validation pipeline | `packages/ui-manifests/`, `tools/scripts/` | Replace with standard linting, tests, and Laravel's Eloquent validation. The validation pipeline was solving a problem we don't have yet. |
| Review documents (20 files) | `docs/reviews/` | The value from these reviews is captured in the jobs-to-be-done above and in the decision log. The individual review files are historical. |
| React migration shell | `apps/ice-cream-ops/react-shell.html`, `apps/ice-cream-ops/src/` | Was scaffolding for a migration approach that's been superseded by this full reboot. |
| Storybook setup | `apps/storybook/` | Rebuild when there are actual components to document. Premature without a component library. |
| `ui-tokens`, `ui-schemas`, `ui-lineage`, `ui-sitemap` packages | `packages/` | Premature abstractions. Design tokens, schemas, lineage tracking, and sitemap management will be reintroduced when the platform has enough components and pages to justify them. |
| `pnpm validate` governance pipeline | `tools/scripts/validate-*.mjs` | The manifest-driven governance model is replaced by standard engineering practices: tests, linting, type checking, and Laravel's Form Request validation. |

---

## Open Items

These are decisions that need to be made before or during the relevant phase. They are not blockers for Phase 0 work.

### Resolved Decisions

| # | Decision | Resolution |
|---|---|---|
| 1 | Hosting Infrastructure | Laravel Forge + DigitalOcean (~$60-75/month). Team has experience with all major platforms. |
| 2 | Multi-Tenant Isolation | stancl/tenancy with single-database, row-level tenant_id scoping. Adequate for 5-100+ tenants. |
| 3 | API Strategy | Laravel REST API — API Resources for CRUD, custom controllers for business operations. |
| 4 | React Framework | Vite + React with react-router (SPA). No SSR needed for an operations dashboard. |
| 5 | Transition Period | Keep current vanilla JS running, build new platform in parallel, switch at feature parity. |
| 6 | Delivery Platforms | DoorDash only (currently). Orders arrive on separate tablets, not through Square. DoorDash adapter needed in Phase 3. |
| 7 | Backend Platform | **Laravel**. Evaluated Drupal, Node/NestJS, Django, Rails, Laravel, Supabase against 7 criteria. Laravel selected for team PHP expertise, mature multi-tenancy/permission packages, built-in queue/scheduler, excellent AI code generation, and budget fit. |
| 8 | Scheduling Engine Integration | **Lightweight Node HTTP service** (Express 5 on port 3100). Laravel calls via `Http::post()` through `SchedulingEngineService` singleton. Simplest to develop, test, and debug. |

### Remaining Open Items

### 1. DoorDash Commission Structure

**Question**: What commission rates does DoorDash charge Milk Jawn? Are there different tiers or promotional rates?

**Needed by**: Phase 3 (delivery adapter design — need to model commission accurately for channel economics).

### ~~2. Scheduling Engine Integration Pattern~~ — Resolved

**Decision**: Lightweight Node HTTP service (Express 5 on port 3100). Laravel calls engine via `Http::post()` through `SchedulingEngineService` singleton.

**Implemented in**: Phase 2, commit `4c61397`. See `packages/scheduling-engine/server/` and `platform/app/Services/SchedulingEngineService.php`.

### 3. Filament for Admin Panel

**Question**: Use Filament (Laravel admin panel package) for internal operations tooling?

**Considerations**: Filament gives you a free admin UI for managing compliance presets, debugging tenant data, and creating test tenants. Low effort to set up. Should not be customer-facing.

**Needed by**: Phase 1 (nice-to-have, not blocking).

### 4. Inventory & Order Management

**Need**: Stores must track inventory (ice cream product, supplies like cups/spoons, waffle cone batter, cleaning supplies, etc.) and place orders when stock drops below par levels. Store managers are responsible for ordering. Items have pars (minimum stock thresholds).

**Scope (to be defined)**: Par tracking, reorder triggers, order creation, supplier management, receiving/counting workflows, COGS tie-in to financial model.

**Needed by**: TBD — not in current phased build plan. Requires its own requirements analysis and JTBD pass before scoping into a phase.

---

## Appendix: Cross-Reference of Jobs to Phases

| Job # | Job Summary | Phase |
|---|---|---|
| 1 | Revenue/labor/profit visibility | Phase 4 |
| 2 | Demand-based staffing | Phase 4 |
| 3 | Cross-location/time comparison | Phase 4 |
| 4 | Schedule publishing to POS | Phase 4 |
| 4b | Delivery channel economics | Phase 3 (adapter), Phase 4 (dashboard) |
| 5 | Schedule approval gate | Phase 4 |
| 6 | Exception request handling | Phase 5 |
| 7 | Shift plan with coverage rules | Phase 4 |
| 8 | Exception requests | Phase 5 |
| 9 | Planned-vs-actual variance | Phase 5 |
| 10 | Key Lead shift/responsibility view | Phase 4 |
| 11 | Certification tracking | Phase 5 |
| 12 | Staff schedule view | Phase 4 |
| 13 | Time-off requests | Phase 4 |
| 14 | POS onboarding | Phase 3 (basic), Phase 6 (full flow) |
| 15 | Business rules configuration | Phase 6 |
| 16 | Multi-location support | Phase 5 (analytics), Phase 1 (model) |
| 17 | Custom role names | Phase 1 |
