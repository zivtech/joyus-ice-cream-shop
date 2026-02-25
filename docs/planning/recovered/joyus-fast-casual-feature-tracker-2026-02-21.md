# Joyus Fast Casual Feature Tracker

Last updated: 2026-02-21

This file is the canonical roadmap for Joyus Fast Casual feature execution.

Related docs:
- `/Users/AlexUA/claude/.worktrees/joyus-fast-casual-exec/spec/plan.md`
- `/Users/AlexUA/claude/.worktrees/joyus-fast-casual-exec/spec/joyus-fast-casual-square-publish.md`
- `/Users/AlexUA/claude/.worktrees/joyus-fast-casual-exec/spec/joyus-fast-casual-data-sync-foundation.md`
- `/Users/AlexUA/claude/.worktrees/milk-jawn-exec/projects/milk-jawn/JOYUS_FAST_CASUAL_SPEC_KITTY_NOTES.md`

## Now (next 2 sprints)

| ID | Feature | Problem | Primary user | Data dependencies | APIs/MCP tools | UI surfaces | Compliance impact | Cost impact | Status | Owner | Target release |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| JFC-NOW-001 | POC UX + A11y stabilization | Planner content leaks into non-planner pages and controls are cluttered | Store Manager, GM | Current `data.json`, planner state | N/A | Shift Planner, Shift Analysis, Settings, Dashboard nav | Medium: clearer risk visibility | Low | In progress | Codex | Sprint 1 |
| JFC-NOW-002 | Excel export API + MCP (`ops_export_excel`) | Operators need downloadable workbook from UI and chat | Manager, Admin | KPI summaries, daypart, seasonal trigger, daily raw | `POST /api/v1/tenants/{tenantId}/exports/excel`; `GET /api/v1/tenants/{tenantId}/exports/{exportId}`; `ops_export_excel` | Dashboard export controls, future Joyus exports panel | Medium: enforce tenant scope + audit | Low | In progress | Platform | Sprint 1 |
| JFC-NOW-003 | Sync run orchestration foundation | Static data path cannot scale to many locations | Admin, Data ops | Square auth tokens, location roster | `POST /api/v1/tenants/{tenantId}/sync-runs`; `GET /api/v1/tenants/{tenantId}/sync-runs/{runId}`; `ops_sync_run_create`; `ops_sync_run_status` | Settings > Integrations, Ops console | Medium: tenant boundary + audit | Medium | Planned | Platform | Sprint 1 |
| JFC-NOW-004 | Connector authorization endpoint | Need provider-level auth initiation for each tenant | Admin | Provider metadata, tenant connector config | `POST /api/v1/tenants/{tenantId}/connectors/{provider}/authorize` | Settings > Integrations | Medium | Low | Planned | Platform | Sprint 1 |
| JFC-NOW-005 | Location KPI API | Planner/analysis should read tenant-scoped computed KPIs | Manager, Admin | Daily sales/labor/profit datasets | `GET /api/v1/tenants/{tenantId}/locations/{locationId}/kpis?start=&end=` | Dashboard, Shift Analysis | Low | Low | Planned | Data | Sprint 2 |
| JFC-NOW-006 | Review-to-shift intelligence v1 | Customer feedback is not tied to staffing outcomes | Owner, Manager | Reviews, shift logs, sales/service metrics | `POST /api/v1/tenants/{tenantId}/reviews/ingest`; `GET /api/v1/tenants/{tenantId}/reviews/correlations`; `ops_review_shift_insights` | Shift Analysis | Medium: moderation and PII handling | Medium | Planned | Product + Data | Sprint 2 |
| JFC-NOW-007 | Recommendation recompute endpoint | Managers need quick reruns after assumption changes | Manager | Forecast inputs, labor rules, weather/events | `POST /api/v1/tenants/{tenantId}/schedules/{scheduleId}/recommendations/recompute`; `ops_recompute_staffing` | Shift Planner | Medium: must preserve legal constraints | Medium | Planned | Decision engine | Sprint 2 |
| JFC-NOW-008 | Compliance check endpoint | Need policy gate before approval/publish | Admin, Compliance | Jurisdiction profile, employee profile, schedule draft | `POST /api/v1/tenants/{tenantId}/compliance/check`; `ops_compliance_check` | Settings > Compliance, Approvals | High | Medium | Planned | Compliance engine | Sprint 2 |

## Next (quarter)

| ID | Feature | Problem | Primary user | Data dependencies | APIs/MCP tools | UI surfaces | Compliance impact | Cost impact | Status | Owner | Target release |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| JFC-NEXT-001 | Real-time sales pace monitor | Managers lack intraday staffing adjustments | Manager | Near real-time transactions, weather, events | `GET /api/v1/tenants/{tenantId}/locations/{locationId}/pace`; `ops_recompute_staffing` | Dashboard, Shift Planner | Medium | Medium to High | Planned | Data platform | Q2 |
| JFC-NEXT-002 | Constraint-based auto scheduler | Manual schedule drafting is slow and inconsistent | Manager | Availability, role rules, labor goals, compliance rules | `POST /api/v1/tenants/{tenantId}/schedules/auto-build` | Shift Planner | High | Medium | Planned | Scheduling engine | Q2 |
| JFC-NEXT-003 | PTO + availability conflict resolver | Last-minute holes are hard to fill safely | Manager | PTO feed, employee availability, skill matrix | `GET /api/v1/tenants/{tenantId}/schedules/{scheduleId}/conflicts` | Shift Planner, Approvals | High | Low to Medium | Planned | Workforce integrations | Q2 |
| JFC-NEXT-004 | Weather + event demand engine | Forecast adjustments are not systematic | Manager, Owner | Hourly weather, local event feeds, historical sales | `GET /api/v1/tenants/{tenantId}/demand-signals` | Dashboard, Shift Planner | Low | Medium | Planned | Forecasting | Q2 |
| JFC-NEXT-005 | Shift publish hardening to Square/Toast | Need resilient publish with retries and idempotency | Admin | Approved schedules, connector auth, location mapping | `POST /api/v1/tenants/{tenantId}/schedules/{scheduleId}/square/publish`; MCP publish tools | Approvals, Publish history | High | Medium | Planned | Platform | Q2 |
| JFC-NEXT-006 | Playbook target builder | Static targets are not admin-friendly | Owner, Manager | KPI history, user-entered targets | `POST /api/v1/tenants/{tenantId}/targets` | Dashboard | Low | Low | Planned | Product | Q2 |

## Later (post-MVP)

| ID | Feature | Problem | Primary user | Data dependencies | APIs/MCP tools | UI surfaces | Compliance impact | Cost impact | Status | Owner | Target release |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| JFC-LATER-001 | Channel mix margin optimizer | Labor is not allocated by channel contribution | Owner | In-store + delivery + wholesale + COGS | `GET /api/v1/tenants/{tenantId}/channels/margins` | Dashboard strategy views | Medium | Medium | Planned | Finance analytics | Post-MVP |
| JFC-LATER-002 | Prep/inventory + waste planner | Staffing is disconnected from prep load and waste | Ops lead | SKU sales, prep sheets, waste logs | `POST /api/v1/tenants/{tenantId}/prep/forecast` | Ops dashboard | Medium: food safety logs | Medium | Planned | Ops data | Post-MVP |
| JFC-LATER-003 | Multi-location and franchise scorecards | Dozens of locations need benchmarking + hierarchy views | Owner, Franchise parent | Tenant hierarchy, location KPIs, staffing quality metrics | `GET /api/v1/tenants/{tenantId}/benchmark/scorecards` | Dashboard portfolio view | High: strict parent/child policy boundaries | Medium | Planned | Product + Auth | Post-MVP |
| JFC-LATER-004 | Native comments and event journaling | Managers need structured context for future planning | Manager | Shift/day notes, event tags, outcomes | `POST /api/v1/tenants/{tenantId}/operating-notes` | Shift Analysis | Low | Low | Planned | Product | Post-MVP |

## Rejected/Deferred

| ID | Feature | Problem | Primary user | Data dependencies | APIs/MCP tools | UI surfaces | Compliance impact | Cost impact | Status | Owner | Target release |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| JFC-DEF-001 | Browser-side direct publish scripts | Unsafe and bypasses server audit gates | Admin | N/A | N/A | POC only | High risk | Low short-term but high risk | Deferred (do not ship) | Platform | N/A |
| JFC-DEF-002 | Fully automated no-review schedule publish | Removes human approval and legal checks | Owner, Manager | Full workflow automation | N/A | N/A | High risk | Medium | Rejected | Product + Compliance | N/A |
| JFC-DEF-003 | Free-form legal interpretation by LLM | Unreliable legal determinations without policy rules | Compliance | Legal text corpora | N/A | Compliance | High risk | Medium to High | Deferred (rules-first only) | Compliance | N/A |
