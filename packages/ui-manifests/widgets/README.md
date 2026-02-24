# Widget Manifests

Each widget manifest must conform to:
- `packages/ui-schemas/src/widget-manifest.schema.json`

Path contract:
- `packages/ui-manifests/widgets/<widget-id>/widget.manifest.json`

Required top-level fields:
- `id`
- `version`
- `title`
- `owner`
- `source_files`
- `data_inputs`
- `calculation_rules`
- `visual_rules`
- `interactions`
- `states`
- `dependencies`
- `adr_refs`
- `status`
- `validation`

`validation` must explicitly mark whether the manifest reflects:
- `as_built_observation` (captured behavior, not endorsed design), or
- `approved_product_decision` (explicitly accepted behavior).
