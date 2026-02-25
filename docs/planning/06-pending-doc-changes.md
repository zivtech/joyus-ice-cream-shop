# Pending Documentation & Codebase Changes

Running list of terminology, naming, and content corrections needed across the codebase. Add items as you find them. Claude will batch-execute when ready.

## How to use
- Add items below with enough context to act on (what to find, what it should say, why).
- Mark scope if known: `code`, `docs`, `manifests`, `all`.
- When ready, tell Claude to "process the pending changes" and they'll be executed, validated, and committed.

## Pending

_(none)_

## Completed

| Date | Change | Scope | Commit |
|------|--------|-------|--------|
| 2026-02-24 | "Amy (CEO)" → "General Manager" / "GM" | all | `ac10909` |
| 2026-02-25 | "policy change request" → "exception request" — renamed `policyChanged` → `hasException`, `markPolicyChanged` → `markException`, `unsubmittedPolicyEdits` → `unsubmittedExceptions`, `approvalRequiredForPolicyChanges` → `approvalRequiredForExceptions` across JS, Python, HTML, and 6 docs | all | `f51f7f8` |
| 2026-02-25 | "Operator" → specific role names (GM, Admin, Store Manager) in 11 doc files | docs | `f51f7f8` + `b49941c` |
| 2026-02-25 | Created canonical `docs/governance/roles-and-permissions.md` with 5-role model (Admin, GM, Store Manager, Key Lead, Staff) | docs | `f51f7f8` |
| 2026-02-25 | Resolved old 3-role model references in shift-planner and day-card docs to use 5-role names | docs | `f51f7f8` |
| 2026-02-25 | Added owner feedback sections to all 5 page review docs from QA.md | docs | `b49941c` |
