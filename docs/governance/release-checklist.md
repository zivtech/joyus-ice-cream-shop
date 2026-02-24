# Release Checklist

1. `pnpm validate` passes.
2. Changed widgets/pages have updated manifests.
3. Any changed page/widget promoted to `active` has:
   - `validation.state = validated_useful`
   - `validation.basis = approved_product_decision`
   - assigned (non-placeholder) reviewer
4. Changed widget visual/calculation logic has ADR link updates and manifest version bump.
5. Storybook includes required state coverage for changed widgets.
6. Accessibility and regression gates are green.
