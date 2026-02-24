# Governance Scripts

- `validate-manifests.mjs`: validates widget/page manifests against schemas and cross-references.
- `validate-interfaces.mjs`: validates governed API/MCP/script interface manifests against schema and lifecycle rules.
- `check-routes.mjs`: enforces sitemap-to-page route integrity.
- `check-adr-refs.mjs`: enforces ADR references + version bump when widget logic rules change.
- `token-audit.mjs`: blocks unmanaged color literals in shared UI components.
- `report-usefulness-backlog.mjs`: prints all manifests not yet marked `validated_useful` so uncertainty stays explicit.
- `validate-governance.mjs`: runs all governance checks.
