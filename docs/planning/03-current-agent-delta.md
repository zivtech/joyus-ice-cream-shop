# Current Agent Delta (Working Tree vs Last Stable Commit)

Snapshot date: 2026-02-24
Stable base in this repo: `c950cbd`

## Why this exists
The previously documented in-flight governance scaffold changes are now committed as the baseline. This file records the resolved delta for traceability.

## High-level delta
1. Repo has been evolved from a copied static seed to a governed monorepo scaffold.
2. Governance/tooling baseline is now committed as one coherent baseline commit (`c950cbd`).
3. Manifest/schema paths are now standardized to nested and package-oriented layouts.

## Resolved delta summary
### A) Runtime + migration scaffold
- Legacy runtime pages preserved.
- React/Vite shell and widget inspector API added under `apps/ice-cream-ops`.

### B) Storybook + components baseline
- Storybook workspace added under `apps/storybook`.
- Shared governed widgets package added under `packages/ui-components`.
- Lineage package added under `packages/ui-lineage`.

### C) Manifest/schema contract migration
- Flat manifests/schemas removed.
- Nested manifest contract and `packages/ui-schemas/src/*.schema.json` structure adopted.

### D) Governance/tooling baseline
- CI governance workflow added.
- Root workspace scripts/config added.
- Governance docs + ADR baseline added.
- Validation scripts added under `tools/scripts`.

### E) Tokens + sitemap expansion
- Tokens expanded and style-dictionary scaffold added.
- Sitemap package route map + package metadata added.

## Reconcile actions for future implementation
1. Expand widget clarification + manifests beyond the first two governed widgets.
2. Add API/MCP contract docs for sync/export/recompute/compliance checks.
3. Keep `docs/clarification/DATA_POLICY.md` intact regardless of architecture choice.
4. Do not delete recovered planning artifacts until merged into canonical docs.

## Non-negotiable constraints
1. No hourly data rebuild/backfill during planning clarification unless explicitly approved.
2. Maintain read-only archive of legacy `joyus-fast-casual` artifacts until superseded.
