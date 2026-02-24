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

## Pending decisions
1. Define cutover criteria for when legacy static runtime pages are removed in favor of React componentized surfaces.
