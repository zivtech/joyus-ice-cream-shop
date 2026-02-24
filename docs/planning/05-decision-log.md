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

## Pending decisions
1. Define cutover criteria for when legacy static runtime pages are removed in favor of React componentized surfaces.
