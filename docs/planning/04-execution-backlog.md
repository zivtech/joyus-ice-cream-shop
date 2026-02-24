# Execution Backlog (Now / Next / Later)

## Source references
- `docs/planning/recovered/joyus-fast-casual-feature-tracker-2026-02-21.md`
- `/Users/AlexUA/claude/joyus-ai/spec/joyus-fast-casual-square-publish.md`

## Now
1. Stabilize one manifest/schema structure and commit it as baseline. (Completed: `c950cbd`)
2. Complete page-by-page clarification for all top-level surfaces. (Completed: canonical docs exist for dashboard, shift-planner, shift-analysis, seasonal-playbook, settings)
3. Expand widget clarification for remaining critical widgets. (Wave 1 completed: `recent_staffing_analysis_panel`, `approvals_workbench_panel`; Wave 2 completed: `historical_trend_panel`, `trigger_gap_planner_panel`; Wave 3 completed: `performance_intelligence_panel`, `industry_survey_lens_panel`; Wave 4 completed: `scale_timing_monitor_panel`, `operational_guardrails_panel`)
4. Preserve and link recovered planning artifacts.
5. Keep data policy enforced (`data.json` snapshot, no rebuild).

## Next
1. Formalize API/MCP interfaces for sync, export, recompute, compliance checks. (Wave 1 baseline complete: interface schema + validation + draft manifests for `sync_run_orchestration`, `ops_excel_export`, `staffing_recompute`, `compliance_check`)
2. Harden approvals flow and publish gates for Square. (Wave 1 baseline complete: publish interface manifest + stricter preflight checks in `publish_schedule_to_square_mcp.py`)
3. Add planned-vs-actual staffing variance model with transparent fallbacks.
4. Add compliance scaffolding for youth/overtime/notice rules.

## Later
1. Full multi-location franchise hierarchy support.
2. Channel mix optimization and prep/waste planning.
3. Rich scenario simulation and adaptive staffing templates.
4. Operational journaling and event correlation at scale.
