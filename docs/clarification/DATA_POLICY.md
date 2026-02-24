# Data Policy (Clarification Phase)

## Policy statements
1. No hourly data refresh/rebuild without explicit approval.
2. `data.json` is a pinned snapshot for clarification work.

## Operational implications
- Do not run `/Users/AlexUA/claude/zivtech-demos/projects/milk-jawn/build_data.py` during clarification tasks.
- Do not trigger Square historical backfill or monthly/hourly data pull jobs during clarification tasks.
- Clarification and manifest work must reference the copied snapshot under:
  - `/Users/AlexUA/claude/joyus-ice-cream-shop/apps/ice-cream-ops/data.json`

## Allowed exceptions
- Approved exception must be explicit in writing in the work thread before any refresh/rebuild action.
