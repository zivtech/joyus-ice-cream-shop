# ADR-0001: UI Governance Baseline

- Date: 2026-02-24
- Status: Accepted

## Context
Joyus Ice Cream Shop needs a governed UI platform where runtime behavior, page IA, and widget decisions are explainable and enforceable.

## Decision
Adopt the following governance contracts as required:

1. Widget manifests under `packages/ui-manifests/widgets/<widget-id>/widget.manifest.json`.
2. Page manifests under `packages/ui-manifests/pages/<page-id>/page.manifest.json`.
3. JSON schemas under `packages/ui-schemas/src/` with CI validation.
4. Sitemap source under `packages/ui-sitemap/sitemap.yaml` with route integrity checks.
5. Widget lineage metadata under `packages/ui-lineage/widgets/`.
6. Widget inspector API `getWidgetSpec(widgetId)` in runtime code.

## Consequences
- PRs are blocked when governance checks fail.
- Widget explainability is available in runtime and Storybook.
- Changes to logic/thresholds require explicit ownership and ADR traceability.
