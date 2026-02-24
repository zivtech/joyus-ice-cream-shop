# 07 — Platform Reboot Plan

> **Status**: Active planning document
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
| 5b | **Backend platform: to be evaluated** | The backend choice (Drupal, Node/Express, Django, Rails, Laravel, Supabase, custom, etc.) is a significant architectural decision that must be evaluated on its merits — not defaulted based on familiarity. See Open Item #7. |

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
- **Permissions are server-side.** Whatever backend is chosen must enforce access control server-side. The React frontend renders based on the authenticated user's permissions but never trusts client-side role checks alone.

---

## Compliance Model

Food safety certification requirements (ServSafe, state-specific equivalents) vary by state and local jurisdiction. The platform cannot hardcode assumptions about what's required.

### Design Principles

1. **Rules engine with jurisdiction presets**, not hardcoded logic.
2. A tenant sets their **state/locality** and receives default rules for that jurisdiction.
3. Tenants can **tighten** rules (require more than the legal minimum) but **cannot loosen** below legal minimums.
4. Rules are consumed as **scheduling constraints**, not just informational displays.
5. Compliance rules are stored as **backend configuration entities** — the specific storage mechanism depends on the backend platform choice (see Open Item #7).

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
- All configurable through the UI, stored as backend configuration entities.

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
|   React (Vite)    | <---> |   Backend Platform   | <---> |   POS Adapters   |
|   Operational UI  |  API  |   (see Open Item #7) |       |   (Square, ...)  |
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

- **Backend (platform TBD — see Open Item #7)**: User management, roles and permissions, entity/data model for tenants/locations/employees, multi-tenant configuration, compliance rules storage, REST API endpoints for frontend consumption. Candidates include Drupal, Node/Express+Postgres, Django, Rails, Laravel, Supabase, and others — to be evaluated.
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
- Data isolation is enforced at the backend level. Tenant A never sees Tenant B's data. The specific isolation mechanism (row-level security, entity access, schema separation, etc.) depends on the backend platform choice.
- Shared codebase, per-tenant configuration. No per-tenant code forks.
- Multi-location is modeled as multiple location entities under one organization, with rollup analytics aggregating across them.

### Compliance Rules Engine

- Jurisdiction presets are stored as backend configuration entities.
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

The specific API approach (REST, GraphQL, tRPC, JSON:API, etc.) depends on the backend platform choice. See Open Items #4 and #7.

---

## Phased Build Plan

Each phase builds on the previous one. No phase ships until it's solid. The phases are ordered by dependency and value delivery.

### Phase 0: Preparation (Current Phase)

**Goal**: Document decisions, audit existing code, prepare for the rebuild.

| Task | Description | Status |
|---|---|---|
| Document jobs-to-be-done and architecture | This document | Complete |
| Audit `app.js` calculation logic | Identify pure business logic vs. DOM/UI code | Not started |
| Audit `staffing-planner.js` calculation logic | Identify extractable scheduling logic | Not started |
| Map existing `data.json` fields to normalized schema | Understand what Square data we have and how it maps | Not started |
| Evaluate backend platform options | Drupal, Node/Express, Django, Rails, Laravel, Supabase, etc. — see Open Item #7 | Not started |
| Define normalized data types | TypeScript interfaces for `NormalizedTransaction`, `NormalizedLaborEntry`, etc. | Not started |
| Audit Milk Jawn's delivery platform usage | Which platforms (DoorDash, UberEats, Grubhub), how orders flow (through POS or separate), commission structures | Not started |

### Phase 1: Foundation

**Goal**: Standing backend with user management, multi-tenant entities, and a React shell that authenticates and renders based on permissions.

**Delivers**: The skeleton that everything else builds on. No end-user value yet, but all the plumbing is in place.

| Task | Description | Jobs Addressed |
|---|---|---|
| Backend platform setup | Install and configure chosen backend (see Open Item #7) with API layer | Infrastructure |
| User/role/permission system | Five platform roles with server-side permission enforcement | Role Model |
| Multi-tenant entity model | Organization, Location, Employee data models with tenant isolation | Job 16, 17 |
| Configurable role labels per tenant | Custom labels stored as organization-level config | Job 17 |
| API endpoints | Entity CRUD + custom endpoints for business operations | Infrastructure |
| Authentication | Token-based auth (OAuth2 or JWT) | Infrastructure |
| React shell | Vite + React with routing, auth integration, role-based rendering | Infrastructure |

### Phase 2: Scheduling Engine

**Goal**: Extract and formalize the calculation logic into a standalone, thoroughly tested module.

**Delivers**: The computational core of the platform — reusable, testable, and independent of any UI or backend framework.

| Task | Description | Jobs Addressed |
|---|---|---|
| Extract calculation logic from `staffing-planner.js` | Pure functions for coverage, cost, scoring | Job 7 |
| Extract analytics logic from `app.js` | Revenue/labor/profit calculations | Jobs 1, 2, 3 |
| Define scheduling engine API | Clear function signatures, input/output types | Infrastructure |
| Comprehensive test suite | Test against known Milk Jawn data for regression validation | Quality |
| Compliance constraint interface | Engine accepts compliance rules as scheduling constraints | Job 10 |

**Key principle**: This module has zero dependencies on the backend platform, React, or any UI framework. It's pure computation. It can be tested with `node` or in a browser. This isolation is what makes the platform's logic trustworthy and portable.

### Phase 3: POS Integration

**Goal**: Abstract POS adapter interface with a working Square implementation. Import pipeline brings historical data into the normalized schema.

**Delivers**: The data bridge. Without this, the platform has no real data to work with.

| Task | Description | Jobs Addressed |
|---|---|---|
| Define abstract POS adapter interface | TypeScript interface with the five methods described above | Infrastructure |
| Implement Square adapter | Import transactions, labor, employees; publish schedules; sync PTO | Jobs 4, 14 |
| Import pipeline | Square raw data -> normalized platform schema, stored in backend entities | Job 14 |
| Migrate Milk Jawn historical data | 44 months of Square data imported and validated against current `data.json` | Validation |
| POS connection configuration UI | Secure storage of API credentials per tenant | Job 14 |
| Define abstract delivery marketplace adapter interface | TypeScript interface for order import, payout import, menu sync | Job 4b |
| Implement DoorDash adapter (if Milk Jawn uses it) | Import delivery orders with commission/fee data, channel attribution | Job 4b |
| Delivery connection configuration UI | Per-tenant, per-location delivery platform credentials | Job 4b |

**Validation milestone**: After this phase, Milk Jawn's existing 44 months of historical data should be importable and produce the same analytics results as the current vanilla JS dashboard. This is the critical regression test.

### Phase 4: Core Operational UI

**Goal**: The primary user-facing product. Dashboard, shift planner, and schedule publishing with role-based access.

**Delivers**: End-user value. After this phase, the platform is usable for daily operations.

| Task | Description | Jobs Addressed |
|---|---|---|
| Dashboard | Revenue, labor cost, gross profit, seasonal comparisons, channel mix (in-store vs. delivery) | Jobs 1, 2, 3, 4b |
| Shift Planner | Schedule building with coverage rules, cost projection | Job 7 |
| Schedule Approval Workflow | GM approval gate with readiness checks | Job 5 |
| Schedule Publishing | Approved schedule -> POS via adapter | Job 4 |
| Staff Schedule View | Mobile-friendly schedule visibility | Jobs 10, 12 |
| Role-based permissions in UI | Render based on authenticated user's server-side permissions | Role Model |

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
| 22 manifest files + governance validation pipeline | `packages/ui-manifests/`, `tools/scripts/` | Replace with standard linting, tests, and the chosen backend's configuration management. The validation pipeline was solving a problem we don't have yet. |
| Review documents (20 files) | `docs/reviews/` | The value from these reviews is captured in the jobs-to-be-done above and in the decision log. The individual review files are historical. |
| React migration shell | `apps/ice-cream-ops/react-shell.html`, `apps/ice-cream-ops/src/` | Was scaffolding for a migration approach that's been superseded by this full reboot. |
| Storybook setup | `apps/storybook/` | Rebuild when there are actual components to document. Premature without a component library. |
| `ui-tokens`, `ui-schemas`, `ui-lineage`, `ui-sitemap` packages | `packages/` | Premature abstractions. Design tokens, schemas, lineage tracking, and sitemap management will be reintroduced when the platform has enough components and pages to justify them. |
| `pnpm validate` governance pipeline | `tools/scripts/validate-*.mjs` | The manifest-driven governance model is replaced by standard engineering practices: tests, linting, type checking, and the chosen backend's built-in validation. |

---

## Open Items

These are decisions that need to be made before or during the relevant phase. They are not blockers for Phase 0 work.

### 1. Hosting Infrastructure

**Options**:
- PaaS (Vercel, Railway, Render, Fly.io, Platform.sh, Pantheon, Acquia)
- IaaS (AWS/GCP/Azure with custom infrastructure)
- BaaS (Supabase Cloud, Firebase)

**Considerations**: Depends heavily on the backend platform choice (Open Item #7). PaaS reduces DevOps overhead. IaaS gives full control but requires investment. Some backend choices constrain hosting options (e.g., Drupal → Pantheon/Acquia; Supabase → Supabase Cloud or self-hosted). Cost, scaling needs, and operational complexity are the key tradeoffs.

**Needed by**: Phase 1.

### 2. Multi-Tenant Isolation Strategy

**Options**:
- Row-level security (shared database, tenant ID on every row)
- Schema-per-tenant (separate database schemas)
- Database-per-tenant (strongest isolation, most operational overhead)
- Application-level access control (e.g., Drupal Group module, Django organizations)

**Considerations**: Row-level security is the simplest for a hosted platform with many small tenants. Schema/database-per-tenant provides stronger isolation but adds operational complexity. The choice may be influenced by the backend platform's native multi-tenancy patterns.

**Needed by**: Phase 1.

### 3. API Strategy

**Options**:
- REST (most universal, well-understood)
- GraphQL (flexible querying, good for complex data relationships)
- tRPC (end-to-end type safety if backend is TypeScript/Node)
- JSON:API (if Drupal, built-in and standards-compliant)

**Considerations**: Complex operations like "validate and publish a schedule" need custom endpoints regardless of approach. The choice should align with the backend platform and the team's strengths. A pragmatic starting point is REST or tRPC for business operations, with the option to add GraphQL later if query flexibility becomes a bottleneck.

**Needed by**: Phase 1.

### 4. React Framework Choice

**Options**:
- Plain Vite + React with react-router (SPA)
- Next.js (SSR/SSG, adds a Node server layer)
- Remix (loader/action model, adds a server layer)

**Considerations**: The operational UI is a client-side application that talks to a backend API — it doesn't need SSR or SEO optimization. Plain Vite + React is likely sufficient. However, if the backend is Node-based, Next.js or Remix could share infrastructure. Evaluate based on the backend choice.

**Needed by**: Phase 1.

### 5. Transition Period Strategy

**Question**: How do we handle the period between starting the rebuild and having a usable new platform?

**Options**:
- Keep current vanilla JS running as-is, build new platform in parallel
- Freeze current codebase, focus entirely on new platform
- Incremental migration (replace pieces of the current app one at a time)

**Considerations**: The current vanilla JS app works. Milk Jawn can continue using it while the new platform is built. Incremental migration was the previous plan (React migration shell) and proved to be more complex than a clean rebuild. The recommendation is: keep the current app running, build the new platform to feature parity, then switch over.

**Needed by**: Phase 0 (decision), Phase 4 (execution).

### 6. Delivery Platform Audit

**Question**: Which delivery platforms does Milk Jawn currently use, and how do orders flow?

**Details needed**:
- Which platforms? (DoorDash, UberEats, Grubhub, others)
- Do delivery orders route through Square or arrive on separate tablets?
- What commission structures are in place?
- Is delivery data currently tracked anywhere, or is it a blind spot?

**Needed by**: Phase 0 (informs adapter design in Phase 3).

### 7. Backend Platform Evaluation (Critical Decision)

This is the most consequential architectural decision in the project. The backend platform affects every other open item and most phases of the build plan.

**Candidates** (non-exhaustive):

| Option | Strengths | Considerations |
|---|---|---|
| **Drupal** | Mature role/permission system, entity/field model, configurable content types, large module ecosystem, strong multi-tenant patterns (Group module), built-in JSON:API | PHP ecosystem, heavier runtime for a headless API, Drupal-specific hosting often needed, learning curve for non-Drupal developers |
| **Node/Express + Postgres** | Same language as frontend (JS/TS), lightweight, tRPC for type safety, large ecosystem, flexible hosting | Build auth/roles/permissions/multi-tenancy from scratch or with libraries, more DIY |
| **Django (Python)** | Excellent ORM, built-in admin, strong auth/permissions, mature ecosystem, good for data-heavy apps | Separate language from frontend, Django REST Framework adds some complexity |
| **Rails** | Convention-over-configuration, rapid development, strong ActiveRecord ORM, built-in auth patterns | Ruby ecosystem smaller than Node/Python, deployment can be opinionated |
| **Laravel (PHP)** | Eloquent ORM, built-in auth/authorization, multi-tenancy packages (Tenancy for Laravel), modern PHP | PHP ecosystem (same as Drupal but different paradigm), less "enterprise" perception |
| **Supabase** | Postgres with row-level security, auth built-in, real-time subscriptions, auto-generated API, minimal backend code needed | Less control over business logic layer, vendor coupling, Edge Functions for custom logic |
| **NestJS + Postgres** | TypeScript, opinionated structure, built-in auth/guards, good for enterprise patterns | Heavier than Express, more boilerplate |

**Evaluation criteria** (proposed):
1. **Multi-tenant readiness** — How well does the platform support tenant isolation, configurable roles, and per-tenant customization out of the box?
2. **Role/permission flexibility** — Can we model 5 roles with tenant-configurable labels and server-side enforcement without excessive custom code?
3. **POS/delivery adapter hosting** — Can the platform run scheduled data imports, webhook receivers, and outbound API calls to POS/delivery platforms?
4. **Compliance rules storage** — Can we model jurisdiction-specific compliance rules as configurable entities?
5. **Development velocity** — How quickly can we reach Phase 4 (usable product) given the team's skills?
6. **Operational cost** — Hosting, maintenance, and scaling cost at 10 tenants, 100 tenants, 1000 tenants?
7. **AI-assisted development** — How well do AI coding tools (Claude, Copilot) support the platform? (Pragmatic consideration for a small team.)

**Needed by**: Phase 0 (blocks Phase 1).

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
