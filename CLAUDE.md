# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Joyus Ice Cream Shop is an operations platform (Milk Jawn) for ice cream shop staffing, scheduling, and profitability analytics. It's a pnpm monorepo with a legacy vanilla JS runtime being incrementally migrated to React/Vite.

## Commands

```bash
pnpm dev          # Vite dev server for @joyus/ice-cream-ops
pnpm build        # Build all packages in parallel
pnpm test         # Run tests across all packages (stubs currently)
pnpm lint         # Lint all packages (stubs currently)
pnpm typecheck    # tsc --noEmit across TS-configured packages
pnpm validate     # Governance validation (CI-enforced) — manifests, schemas, routes, ADR refs, tokens, usefulness backlog
```

Run a single package: `pnpm --filter @joyus/ice-cream-ops <script>`

Package manager: `pnpm@10.5.2`. Node 22. CI runs `pnpm validate` on all PRs and pushes to main.

## Architecture

### Workspace Layout

- **`apps/ice-cream-ops`** — Primary runtime app. Legacy vanilla JS (`app.js`, `staffing-planner.js`) plus a React/Vite migration shell (`react-shell.html` + `src/`). Multi-entry Vite build: dashboard, staffing_planner, seasonal_playbook, react_shell.
- **`apps/storybook`** — Widget stories and docs. Visual regression via Chromatic and Backstop.
- **`packages/ui-components`** — Governed React widgets consumed by the app via `workspace:*`.
- **`packages/ui-manifests`** — Registry of widget, page, and interface manifests (JSON). Source of truth for governance state.
- **`packages/ui-schemas`** — JSON Schema contracts for widget/page/interface manifests. Validated by AJV.
- **`packages/ui-tokens`** — Design tokens built with Style Dictionary 4.
- **`packages/ui-sitemap`** — Information architecture: `sitemap.yaml` and `route-map.json`.
- **`packages/ui-lineage`** — Widget data lineage metadata (maps widgets to data sources and calculations).
- **`tools/scripts`** — Governance validation scripts (ESM `.mjs`): manifest validation, interface checks, route integrity, ADR refs, token audit, usefulness backlog reporting.
- **`docs/`** — ADRs, governance rules, planning docs, clarification specs.
- **`legacy/`** — Read-only archive of joyus-fast-casual artifacts.

### Data Flow

1. `apps/ice-cream-ops/data.json` is a **pinned Square/POS snapshot (~1.3MB)**. Do not refresh or rebuild without explicit written approval (see `docs/clarification/DATA_POLICY.md`).
2. `app.js` (dashboard) and `staffing-planner.js` (shift planner) read `data.json` and render the legacy UI.
3. `widget-spec-api.js` exposes `getWidgetSpec(widgetId)` globally, wiring manifests + lineage + Storybook links at runtime.
4. Approved schedules publish to Square via `scripts/publish_schedule_to_square_mcp.py`.

## Governance Model

This is the most important system to understand. All widgets, pages, and interfaces follow a strict manifest-driven lifecycle enforced by `pnpm validate` in CI.

### Validation States

| State | Meaning |
|---|---|
| `unreviewed` | Captured from runtime as-is. Not an approved fact. |
| `validated_useful` | Reviewed and accepted as useful. |
| `needs_redesign` | Reviewed and judged confusing or low-utility. |
| `remove_candidate` | Reviewed and should likely be removed. |

### Promotion Rules (`draft` -> `active`)

All five must be true:
1. `validation.state = validated_useful`
2. `validation.basis = approved_product_decision`
3. `validation.reviewer` is a real name (not `unassigned`/`tbd`/placeholder)
4. `validation.notes` explains usefulness
5. ADR links exist for any threshold/calculation changes

### Contribution Requirements

- New widgets require: widget manifest, owner, Storybook coverage (see `apps/storybook/README.md` for required doc sections).
- Page route changes must update: page manifest route + status, sitemap node, route integrity expectations.
- Interface/API/MCP/script changes must update: interface manifest, owner, lifecycle status, contract operation entries.
- Threshold/visual rule changes require: manifest update, version bump, ADR reference.
- **Hardcoded colors in `packages/ui-components` are disallowed** — use token references from `packages/ui-tokens`.

### CI Enforcement

`pnpm validate` chains: validate-manifests -> validate-interfaces -> check-routes -> check-adr-refs -> token-audit -> report-usefulness-backlog. It enforces minimum manifest counts (>=2 widgets, >=5 pages, >=4 interfaces), schema conformance, state/basis consistency, and future-date rejection.
