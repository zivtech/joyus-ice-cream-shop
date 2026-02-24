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

## Pending decisions
1. Define cutover criteria for when legacy static runtime pages are removed in favor of React componentized surfaces.
