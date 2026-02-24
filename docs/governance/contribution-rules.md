# Contribution Rules

1. Every new reusable widget must have:
   - widget manifest
   - owner
   - Storybook coverage for required states
2. Every page route change must update:
   - page manifest route
   - sitemap node route
   - route integrity check expectations
3. Any calculation threshold/visual rule change requires:
   - manifest update
   - manifest version bump
   - ADR reference update
4. Hardcoded colors in `packages/ui-components` are disallowed unless tokenized.
