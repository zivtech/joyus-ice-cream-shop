# Contribution Rules

1. Every new reusable widget must have:
   - widget manifest
   - owner
   - Storybook coverage for required states
2. Every page route change must update:
   - page manifest route
   - page manifest status (`draft|active|deprecated`)
   - sitemap node route
   - route integrity check expectations
3. Every governed API/MCP/script change must update:
   - interface manifest in `packages/ui-manifests/interfaces`
   - interface owner and lifecycle status
   - contract operation entries for changed endpoints/tools/scripts
4. Any calculation threshold/visual rule change requires:
   - manifest update
   - manifest version bump
   - ADR reference update
5. Items are facts only after review:
   - `validation.state = validated_useful`
   - `validation.basis = approved_product_decision`
   - non-placeholder `validation.reviewer`
   - `status = active` only after the above are true
6. Hardcoded colors in `packages/ui-components` are disallowed unless tokenized.
