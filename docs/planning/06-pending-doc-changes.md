# Pending Documentation & Codebase Changes

Running list of terminology, naming, and content corrections needed across the codebase. Add items as you find them. Claude will batch-execute when ready.

## How to use
- Add items below with enough context to act on (what to find, what it should say, why).
- Mark scope if known: `code`, `docs`, `manifests`, `all`.
- When ready, tell Claude to "process the pending changes" and they'll be executed, validated, and committed.

## Pending

1. **"policy change request" → "policy exception request"** — Scope: `all`. Day-level requests from managers are exceptions to existing policy (e.g., extra closer for an event), not changes to the policy itself. Rename `policyChanged`, `pendingRequestId`, "policy change request", "policy edits", and related UI copy/variable names to reflect exception semantics. Needs: preferred phrasing confirmed (e.g., "policy exception request" vs "day exception request").

2. **"Operator" used inconsistently as informal catch-all** — Scope: `docs`. Review docs and clarification docs use "operator" loosely to mean anyone using the system. Should be replaced with the specific role being addressed (owner, admin, manager) or a defined term if a generic is needed.

3. **Create canonical roles-and-permissions document** — Scope: `docs`, `manifests`. No single source of truth for roles exists. Current roles scattered across page manifest `permissions` arrays: `owner`, `admin`, `manager`. Need a `docs/governance/roles-and-permissions.md` that defines each role, its capabilities, and which surfaces it can access. Page/widget manifests should reference this as the authority. Note: enforcement is currently front-end only; server-side enforcement is a separate follow-up. (Decision on Drupal or other platform deferred.)

4. **Resolve role model: owner / GM / admin / manager** — Scope: `all`. The approval workflow now references "GM" but GM doesn't exist as a role in the permissions model. "Admin" appears in manifests doing work that should likely be GM. Proposed three-role model pending confirmation:
   - **Owner** — strategic decisions, financial analysis, policy setting (dashboard, seasonal playbook, settings configuration)
   - **General Manager (GM)** — operational approvals, weekly schedule sign-off, export/publish gate, day exception resolution
   - **Manager** — day-to-day scheduling, shift editing, exception requests, retrospective analysis
   - **Admin** — likely a leftover that should be mapped to Owner or GM depending on context, then removed as a role
   - Needs: confirmation of role model before propagating into manifests, code, and docs. This decision blocks items 2 and 3.

## Completed

| Date | Change | Scope | Commit |
|------|--------|-------|--------|
| 2026-02-24 | "Amy (CEO)" → "General Manager" / "GM" | all | `ac10909` |
