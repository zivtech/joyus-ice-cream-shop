# Usefulness Review Gate

This repo separates observed behavior from approved product truth for widgets, pages, and interfaces.

## States and meaning
1. `unreviewed`: captured from runtime as-is. Not an approved design fact.
2. `validated_useful`: reviewed and accepted as useful.
3. `needs_redesign`: reviewed and judged confusing or low-utility.
4. `remove_candidate`: reviewed and should likely be removed.

## Required promotion criteria (`draft` -> `active`)
1. `validation.state = validated_useful`
2. `validation.basis = approved_product_decision`
3. `validation.reviewer` is assigned (not `unassigned`/`tbd`/placeholder)
4. `validation.notes` explains why the item is useful and for whom
5. ADR links exist for changed threshold/calculation decisions

## Review prompts
1. What decision does this item help the user make faster or more accurately?
2. What confusion did reviewers report?
3. Is the displayed metric/action trusted enough to drive operations?
4. Keep, redesign, or remove?

## Operational flow
1. Capture item as `as_built_observation` + `unreviewed` in manifest.
2. Run review with operator/product stakeholders.
3. Update validation fields to final review state.
4. Promote to `active` only if criteria above are met.
5. Run `pnpm validate` to enforce gates and print pending backlog.
