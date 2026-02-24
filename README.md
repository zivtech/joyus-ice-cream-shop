# Joyus Ice Cream Shop UI Platform

Governed monorepo bootstrap for runtime UI, Storybook, manifests, schemas, sitemap, tokens, and lineage metadata.

## Workspace

- `apps/ice-cream-ops`: legacy runtime seed plus React/Vite shell
- `apps/storybook`: widget stories and docs scaffold
- `packages/ui-components`: reusable governed widgets
- `packages/ui-manifests`: page/widget manifests
- `packages/ui-schemas`: JSON schema contracts
- `packages/ui-tokens`: design tokens and Style Dictionary config
- `packages/ui-sitemap`: IA source and route map checks
- `packages/ui-lineage`: widget lineage metadata
- `docs/adr`: architecture decision records
- `docs/governance`: contribution and release gates
- `tools/scripts`: governance validation scripts

## Commands

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm validate`

`pnpm validate` runs manifest/schema validation, sitemap route integrity checks, and token audit checks.
