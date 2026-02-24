# Governance Scripts

- `validate-manifests.mjs`: validates widget/page manifests against schemas and cross-references.
- `check-routes.mjs`: enforces sitemap-to-page route integrity.
- `check-adr-refs.mjs`: enforces ADR references + version bump when widget logic rules change.
- `token-audit.mjs`: blocks unmanaged color literals in shared UI components.
- `validate-governance.mjs`: runs all governance checks.
