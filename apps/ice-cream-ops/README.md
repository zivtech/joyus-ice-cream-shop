# Staffing Dashboard (GitHub Pages)

## What this is
Static dashboard for Milk Jawn staffing strategy:
- 6-day current model vs 7-day Monday-open model
- East Passyunk, Northern Liberties, or combined view
- Date-range analytics views: Month-to-Month, Last Month, YTD, Last 52 Weeks, Last Year, Full Period
- Monday demand sensitivity (55/65/75% of Tuesday)
- Weekly and annual projection comparisons
- Staffing templates and guardrails
- Seasonal playbook section with read-only scale-up/scale-down trigger references
- Dedicated slot-based planner page (`staffing-planner.html`) for manager assignments and admin approval workflow
- Historical actual pull window currently built from `2022-07` through `2026-02`
- Manager assumption enforced in model: `40 hrs/week @ $28/hr`

## Spec Kitty Handoff
- For the latest as-built and future-plan notes intended for PRD generation, see:
  - `/Users/AlexUA/claude/zivtech-demos/projects/milk-jawn/JOYUS_FAST_CASUAL_SPEC_KITTY_NOTES.md`

## Files
- `index.html`
- `styles.css`
- `app.js`
- `data.json`
- `build_data.py` (rebuilds `data.json` from local CSVs)
- `SEASONAL_STAFFING_RECOMMENDATIONS_2026.md` (seasonal scale-up/down strategy with trigger thresholds)
- `staffing-planner.html`, `staffing-planner.css`, `staffing-planner.js` (weekly slot planner + approval queue)
- `widget-spec-api.js`, `widget-inspector.js` (runtime widget explainability API + inspector panel)
- `react-shell.html`, `src/react-shell/*` (React + Vite migration shell for governed widget extraction)
- `scripts/publish_schedule_to_square_mcp.py` (publishes approved planner exports to Square scheduled shifts via MCP)

## Publish on GitHub Pages
Option A (recommended):
1. Push the repo to GitHub.
2. In repository settings, open **Pages**.
3. Set source to **Deploy from a branch**.
4. Choose your main branch and `/docs` folder.
5. Save. The dashboard will be available at `https://<user>.github.io/<repo>/dashboard/`.

Option B:
- If your Pages source is repository root, copy this folder to `<repo>/dashboard/` and use that path.

## Local preview
From repo root:

```bash
python3 -m http.server 8799 --directory docs
```

Open:
- `http://127.0.0.1:8799/dashboard/`

## Rebuild data
If source CSVs change:

```bash
python3 docs/dashboard/build_data.py
```

## Include DoorDash net in dashboard revenue
If you want DoorDash net contribution merged into dashboard metrics:

```bash
export DOORDASH_JWT="your_token_here"
./scripts/run_doordash_sync.sh 2025-01-01 2025-12-31
python3 docs/dashboard/build_data.py
```

Notes:
- DoorDash merge reads `/data/revenue/doordash/unified_hourly.csv`.
- DoorDash rows are applied when they map to available source month dates in the active dataset.

## Publish Planner To Square
1. Use `staffing-planner.html` to finalize assignments.
2. Submit next week for General Manager approval.
3. Export plan JSON from planner.
4. Dry run:

```bash
python3 apps/ice-cream-ops/scripts/publish_schedule_to_square_mcp.py --plan-file /path/to/exported-plan.json --dry-run
```

5. Apply + publish:

```bash
python3 apps/ice-cream-ops/scripts/publish_schedule_to_square_mcp.py --plan-file /path/to/exported-plan.json --apply --publish
```

Safety notes:
- Publish preflight now fails when approval reviewer metadata is missing, required workflow flags are off, location metadata is inconsistent, assignment windows overlap, or any slot exceeds the max shift duration (`--max-shift-hours`, default `14`).
- Use `--force` only when bypassing these checks intentionally, and inspect `validation_issues` in the output report.

## Future Architecture Note: Operating Calendar Flexibility
Add an operating-calendar layer to assumptions so each store can define when it is open, how hours change seasonally, and whether it closes for part of the year.

Requirements to carry forward:
1. Determine open days/hours from either:
- historical POS data inference, or
- onboarding form inputs (store-specific calendar setup).
2. Support seasonal operating patterns:
- different hours by season/date range,
- different open/closed weekdays by season,
- full seasonal closures (example: winter shutdown for some ice cream shops).
3. Make assumptions/contributions configurable by operating period:
- staffing assumptions by season/daypart,
- contribution logic by season/daypart/channel (so planning math reflects when a store is actually open).
4. Keep these as tenant/store-level settings so multi-store brands can mix patterns across locations.
