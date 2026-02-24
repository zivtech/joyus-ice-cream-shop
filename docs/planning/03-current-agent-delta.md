# Current Agent Delta (Working Tree vs Last Stable Commit)

Snapshot date: 2026-02-24
Stable base in this repo: `afb142a`

## Why this exists
Another agent has active, uncommitted work in this repo. This file documents exactly what changed so future work can reconcile intentionally.

## High-level delta
1. Repo is being evolved from a copied static seed to a governed monorepo scaffold.
2. Governance/tooling was introduced but not yet committed as one coherent baseline.
3. Manifest/schema paths are being migrated to nested and package-oriented layouts.

## Observed in-progress changes
### A) Runtime app deltas
Modified:
- `apps/ice-cream-ops/README.md`
- `apps/ice-cream-ops/index.html`
- `apps/ice-cream-ops/seasonal-playbook.html`
- `apps/ice-cream-ops/staffing-planner.html`

Added:
- `apps/ice-cream-ops/package.json`
- `apps/ice-cream-ops/react-shell.html`
- `apps/ice-cream-ops/src/react-shell/*`
- `apps/ice-cream-ops/tsconfig.json`
- `apps/ice-cream-ops/vite.config.ts`
- `apps/ice-cream-ops/widget-inspector.js`
- `apps/ice-cream-ops/widget-spec-api.js`

### B) Storybook and UI packages added
Added:
- `apps/storybook/*`
- `packages/ui-components/*`
- `packages/ui-lineage/*`

### C) Manifest/schema structure migration
Deleted old flat files:
- `packages/ui-manifests/pages/*.json`
- `packages/ui-manifests/widgets/*.json`
- `packages/ui-schemas/page-manifest.schema.json`
- `packages/ui-schemas/widget-manifest.schema.json`

Added new nested/package layout:
- `packages/ui-manifests/pages/<page-id>/page.manifest.json`
- `packages/ui-manifests/widgets/<widget-id>/widget.manifest.json`
- `packages/ui-schemas/src/*.schema.json`
- package-level `README.md` and `package.json` files

### D) Governance/tooling bootstrap added
Added:
- `.github/workflows/governance.yml`
- root `package.json`, `pnpm-workspace.yaml`, `.gitignore`, root `README.md`
- `docs/governance/*`
- `docs/adr/ADR-0001-ui-governance-baseline.md`
- `tools/scripts/*`

### E) Token/sitemap package expansion
Modified:
- `packages/ui-tokens/tokens.json`

Added:
- `packages/ui-tokens/package.json`
- `packages/ui-tokens/style-dictionary.config.cjs`
- `packages/ui-sitemap/README.md`
- `packages/ui-sitemap/package.json`
- `packages/ui-sitemap/route-map.json`

## Reconcile actions for future implementation
1. Decide final manifest path convention and remove the duplicate/legacy shape.
2. Align clarification docs to final manifest/schema paths.
3. Confirm whether Storybook + React shell are phase-1 required or phase-2 optional.
4. Keep `docs/clarification/DATA_POLICY.md` intact regardless of architecture choice.
5. Do not delete recovered planning artifacts until merged into canonical docs.

## Non-negotiable constraints
1. No hourly data rebuild/backfill during planning clarification unless explicitly approved.
2. Maintain read-only archive of legacy `joyus-fast-casual` artifacts until superseded.
