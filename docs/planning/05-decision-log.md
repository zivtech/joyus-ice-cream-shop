# Decision Log

## 2026-02-24
1. Canonical planning hub is `docs/planning/` in `joyus-ice-cream-shop`.
2. Page-first clarification remains the active approach.
3. Legacy `joyus-fast-casual` content remains archived, not deleted.
4. Data policy: no hourly refresh/rebuild during clarification without explicit approval.
5. Manifest path convention is finalized as nested contracts:
- `packages/ui-manifests/pages/<page-id>/page.manifest.json`
- `packages/ui-manifests/widgets/<widget-id>/widget.manifest.json`
6. Storybook rollout timing is immediate baseline for governed widgets, while legacy runtime remains active during migration.
7. Governance gate baseline for early commits:
- manifest/schema validation
- sitemap route integrity
- token audit
- ADR + version bump check for widget logic changes
8. Naming convergence approach:
- new artifacts use `joyus-ice-cream-shop`
- historical `joyus-fast-casual` names remain in recovered/archive artifacts until superseded.
9. Manifests must explicitly separate observation from approval:
- `validation.basis = as_built_observation` is default for captured runtime behavior.
- Items are not treated as approved design facts until explicitly reviewed and moved to `approved_product_decision` with validated utility.
10. Page manifests now carry explicit lifecycle status (`draft|active|deprecated`) so page-level approval gates are enforced consistently with widgets.
11. API/MCP/script contracts are now tracked with first-class interface manifests under `packages/ui-manifests/interfaces/` and validated with the same observation-vs-approval lifecycle model.
12. Square publish automation preflight now enforces stronger approval/data sanity checks (reviewer metadata, workflow flags, location consistency, overlap detection, max shift duration) before apply/publish actions.
13. Planned-vs-actual variance now exposes explicit expected-source attribution (planned targets vs fallback baseline) at both summary and day-card levels for transparent fallback behavior.
14. Settings page now treats operations controls and compliance placeholder framework as governed widgets (`operations_settings_panel`, `compliance_scaffold_panel`) to support incremental compliance hardening.
15. Recovered planning artifacts are now indexed with provenance and canonical mapping in `docs/planning/recovered/README.md`.
16. Usefulness review Wave 1 is prioritized on planner approvals/publish/compliance flows, with reviewer assignment set to `AlexUA` while items remain `unreviewed` pending explicit judgments.
17. Baseline product constitution established in `docs/planning/00-baseline-constitution.md` to define owner/manager jobs, required outcomes, assumptions, and usefulness criteria before item-level ratification.
18. Constitution amended to include owner comparative-performance needs (year-over-year, store-to-store, portfolio average, industry baseline) and duplication checks in usefulness evaluation.
19. Wave 1 review pass for `shift_planner_day_card` recorded in governance reviews with recommendation `validated_useful` pending explicit confirmation.
20. `shift_planner_day_card` usefulness recommendation was approved by `AlexUA`; manifest validation promoted to `state=validated_useful` and `basis=approved_product_decision` while keeping lifecycle status as `draft`.
21. Wave 1 review pass for `approvals_workbench_panel` recorded and promoted to `validated_useful` / `approved_product_decision`. Follow-ups: consolidate duplicated readiness messaging, add role-aware service-layer enforcement, clarify PTO conflict policy semantics.
22. Wave 1 review pass for `square_schedule_publish` (interface) recorded and promoted. Only governed publish path to Square with comprehensive preflight validation. Follow-ups: structured audit logging, name resolution hardening for multi-store rosters, rollback capability.
23. Wave 1 review pass for `compliance_check` (interface) recorded and promoted. Useful as sole compliance evaluation interface addressing constitutional policy-safety requirement. Caveat: compliance rules require legal statute validation before production reliance. Follow-ups: real statute validation, pass/warn/fail semantics definition, jurisdiction-specific configuration.
24. Wave 1 review pass for `operations_settings_panel` recorded and promoted. Only surface for editing operational assumptions driving planner and economic calculations. Follow-ups: role-based edit restrictions, server-side settings persistence, field validation rules.
25. Wave 1 review pass for `shift_planner` (page) recorded and promoted. Essential central composition surface for plan -> validate -> approve -> publish workflow. Follow-ups: server-side permission enforcement for approve/export, filter persistence behavior.
26. Wave 1 review pass for `settings` (page) recorded and promoted. Only dedicated configuration surface for operational assumptions and compliance scaffolding. Follow-ups: server-side settings persistence, compliance sub-tab implementation prioritization, change audit log.
27. Wave 1 usefulness review complete: 7/7 items promoted to `validated_useful`. Overall backlog: 15/22 items remain `unreviewed` for future waves.
28. Wave 2 usefulness review complete: all remaining 15 items reviewed and promoted to `validated_useful`. Backlog: 0/22 pending. All widgets, pages, and interfaces are now validated.
29. All person-specific "Amy (CEO)" references replaced with role-based "General Manager" / "GM" labels across runtime code, publish script, docs, manifests, and review docs. Approval workflow now uses `requireGMApproval`, `gmApprovalRequiredForNextWeek`, and GM-prefixed UI labels/actions. Breaking change: export JSON flag renamed from `ceoApprovalRequiredForNextWeek` to `gmApprovalRequiredForNextWeek`; existing exported JSON files need re-export.

30. Platform reboot plan established (`docs/planning/07-platform-reboot-plan.md`): hosted multi-tenant platform, POS-agnostic with delivery marketplace integration, 5-role model (Admin/GM/Store Manager/Key Lead/Staff) with tenant-configurable labels, jurisdiction-aware compliance engine. Jobs-to-be-done framework with 17 jobs across 7 phased build stages.
31. Backend platform decision: **Laravel** selected after evaluating Drupal, Node/NestJS, Django, Rails, Laravel, and Supabase against 7 criteria (multi-tenant readiness, role/permission flexibility, POS/delivery adapter hosting, compliance storage, development velocity, operational cost, AI-assisted development). Key factors: team PHP expertise, stancl/tenancy for multi-tenancy, spatie/laravel-permission for roles, Horizon for queue management, Sanctum for API auth, ~85-90% AI code generation accuracy, $60-75/month hosting on Forge + DigitalOcean.
32. Delivery platform: DoorDash only (currently), orders on separate tablets (not through Square). DoorDash adapter needed as separate integration from POS adapter.
33. Hosting: Laravel Forge + DigitalOcean within $100-200/month budget.
34. Multi-tenant isolation: stancl/tenancy single-database with row-level tenant_id scoping.
35. API strategy: Laravel REST API (API Resources for CRUD, custom controllers for business operations).
36. React framework: Vite + React with react-router (SPA, no SSR).
37. Transition strategy: Keep current vanilla JS running, build Laravel platform in parallel, switch at feature parity.

38. Forge Baseline Session conducted on demo app (`~/zivtech-demos/projects/milk-jawn/`). Key findings: demo is built for the builder not the operator, language is system-centric, controls lack causality explanation, numbers have no provenance, planner needs months-ahead planning with YoY context, analyst notes should feed future automated planning. Review priority: cross-cutting issues (language, trust, provenance) → dashboard widgets → planner features. Full findings in `docs/planning/10-forge-baseline-findings.md`.
39. Stakeholder clarification: Alex is CTO, not the operator. GM/Owner is the primary daily user and finds the demo "extraordinarily confusing." Future Forge sessions should include her directly.
40. Review priority established: cross-cutting communication issues first (affects everything), then dashboard widget evaluation, then planner feature gaps. Planner is the daily-use tool; dashboard is periodic analytics.

41. **Build target decision:** Patch the demo first (Phase 0 language/provenance/causality fixes), then continue the platform using Forge action plan as operator-facing spec. Existing platform spec (doc 07) remains the foundation. Forge findings add the missing operator lens.
42. **Industry benchmarks:** Self-benchmarking first (EP vs NL, YoY, season-over-season — data already exists in Square POS history). External benchmark data loaded at runtime later from private data source. Same data boundary as Square POS data — real numbers cannot leak into the repo.
43. **72% margin:** Unknown origin — likely AI-generated placeholder from a test worksheet. Two things to build: configurable target margin (owner-controlled setting) and historic actual margin (calculated from real data). Display both together for provenance.
44. **Note persistence:** Database (Laravel + Postgres). Notes stored as records tied to dates and locations. Required for structured tags and pattern detection.
45. **GM session timing:** Conducted informally Feb 28, 2026 — 43-minute guided session with Amy (Otter transcript). Findings incorporated into doc 10. Next formal session: after Phase 0 language fixes are applied.
46. **GM direct findings:** Amy confirmed all language confusion from proxy session. New signal: she understands position-based scheduling ("scooper 1, scooper 2"), scheduling is pattern-based (not from scratch), events are minimal (validates anomaly detection), weather matters only in transition seasons, marketing/Instagram drives sales spikes, and she asked "does Square already do this?" — value proposition needs to be explicit upfront.

## Pending decisions
1. ~~Scheduling engine integration pattern~~ — resolved in doc 07 (Node HTTP service, Express 5 on port 3100)
2. ~~DoorDash commission structure~~ — resolved in doc 07 (EP: 20%, NL: 25%, per-location setting)
3. ~~Filament admin panel~~ — resolved in doc 07 (Filament v3 at /admin with 10 resources)
4. ~~Data source for industry benchmarks~~ — resolved: self-benchmarking first, external at runtime later (decision 42)
5. ~~Event calendar scope~~ → resolved: anomaly detection approach, validated by Amy ("we have so few events")
6. Partial plan model: Amy's input clarifies — position-based templates with person assignment closer to the date. Pattern carry-forward from prior weeks. Plan states: Skeleton → In Progress → Complete → Approved → Published.
7. Holiday assumption settings: Amy confirmed Christmas Eve varies by location and year (open 10-3 at one shop in 2024, closed in 2025). Per-location, per-year settings needed.
8. ~~Note persistence model~~ — resolved: database (decision 44)
9. Seasonal template transitions: Amy provided specific hours (warm: 12-11pm Tue-Sun; cold: 3-10pm Tue-Fri, noon-11pm Sat, noon-10pm Sun). Templates should map to these seasonal patterns.
10. Seasonal planning view design: what does this look like? Amy's session adds context — staffing levels overlaid on seasonal hour patterns with YoY comparison. Needs design work.
11. Marketing/social media as demand signal: Instagram posts and product launches (cookie butter) drive sales spikes. Future integration candidate — not in current build phases.
12. Square availability sync: staff update availability in Square, tool needs to ingest this alongside PTO. Not currently in POS adapter spec.
13. Value proposition framing: Amy asked "does Square already do this?" after 43 minutes. Tool differentiation (DoorDash data, manager salary, proposed schedules, cross-location comparison) needs to be explicit in the UI, not just known to the CTO.
