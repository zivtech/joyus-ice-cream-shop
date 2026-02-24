(function initializeWidgetSpecApi(globalScope) {
  const WIDGET_ALIASES = Object.freeze({
    hourly_gp_chart: "hour_by_hour_gross_profit",
    hourByHourGrossProfit: "hour_by_hour_gross_profit",
    planner_day_card: "shift_planner_day_card",
    shiftPlannerCard: "shift_planner_day_card",
    recentStaffingPanel: "recent_staffing_analysis_panel",
    approvalsPanel: "approvals_workbench_panel",
    historyTrendPanel: "historical_trend_panel",
    triggerGapPlanner: "trigger_gap_planner_panel",
    performanceIntelPanel: "performance_intelligence_panel",
    surveyLensPanel: "industry_survey_lens_panel",
    timingMonitorPanel: "scale_timing_monitor_panel",
    guardrailsPanel: "operational_guardrails_panel"
  });

  const WIDGET_SPEC_INDEX = Object.freeze({
    hour_by_hour_gross_profit: {
      manifest: {
        id: "hour_by_hour_gross_profit",
        version: "1.0.0",
        title: "Hour-by-Hour Gross Profit",
        owner: "ops-analytics",
        source_files: ["apps/ice-cream-ops/app.js"],
        status: "draft"
      },
      lineage: {
        file: "packages/ui-lineage/widgets/hour_by_hour_gross_profit.lineage.json",
        upstreams: ["hourly_profile_snapshot", "dashboard_state"],
        outputs: ["hourly_gp_series"]
      },
      story_links: [
        "/storybook/?path=/docs/widgets-hour-by-hour-gross-profit--docs",
        "/storybook/?path=/story/widgets-hour-by-hour-gross-profit--single-location",
        "/storybook/?path=/story/widgets-hour-by-hour-gross-profit--combined-location"
      ]
    },
    shift_planner_day_card: {
      manifest: {
        id: "shift_planner_day_card",
        version: "1.0.0",
        title: "Shift Planner Day Card",
        owner: "ops-workflow",
        source_files: ["apps/ice-cream-ops/staffing-planner.js"],
        status: "draft"
      },
      lineage: {
        file: "packages/ui-lineage/widgets/shift_planner_day_card.lineage.json",
        upstreams: ["planner_state", "weather_signal", "pto_requests"],
        outputs: ["day_card_state", "approval_request"]
      },
      story_links: [
        "/storybook/?path=/docs/widgets-shift-planner-day-card--docs",
        "/storybook/?path=/story/widgets-shift-planner-day-card--default-state",
        "/storybook/?path=/story/widgets-shift-planner-day-card--pending-request",
        "/storybook/?path=/story/widgets-shift-planner-day-card--approved-request"
      ]
    },
    recent_staffing_analysis_panel: {
      manifest: {
        id: "recent_staffing_analysis_panel",
        version: "1.0.0",
        title: "Recent Staffing Analysis Panel",
        owner: "ops-analytics",
        source_files: ["apps/ice-cream-ops/staffing-planner.js"],
        status: "draft"
      },
      lineage: {
        file: "packages/ui-lineage/widgets/recent_staffing_analysis_panel.lineage.json",
        upstreams: ["daily_actual_rows", "expected_baseline_profile", "weather_context", "analysis_notes"],
        outputs: ["recent_analysis_cards", "saved_context_notes"]
      },
      story_links: []
    },
    approvals_workbench_panel: {
      manifest: {
        id: "approvals_workbench_panel",
        version: "1.0.0",
        title: "Approvals Workbench Panel",
        owner: "ops-workflow",
        source_files: ["apps/ice-cream-ops/staffing-planner.js"],
        status: "draft"
      },
      lineage: {
        file: "packages/ui-lineage/widgets/approvals_workbench_panel.lineage.json",
        upstreams: ["next_week_state", "pto_sync"],
        outputs: ["approvals_subtab_views", "next_week_publish_gate"]
      },
      story_links: []
    },
    historical_trend_panel: {
      manifest: {
        id: "historical_trend_panel",
        version: "1.0.0",
        title: "Historical Trend Panel",
        owner: "ops-analytics",
        source_files: ["apps/ice-cream-ops/app.js"],
        status: "draft"
      },
      lineage: {
        file: "packages/ui-lineage/widgets/historical_trend_panel.lineage.json",
        upstreams: ["monthly_series", "history_metric"],
        outputs: ["historical_trend_chart"]
      },
      story_links: []
    },
    trigger_gap_planner_panel: {
      manifest: {
        id: "trigger_gap_planner_panel",
        version: "1.0.0",
        title: "Trigger Gap Planner Panel",
        owner: "ops-strategy",
        source_files: ["apps/ice-cream-ops/app.js"],
        status: "draft"
      },
      lineage: {
        file: "packages/ui-lineage/widgets/trigger_gap_planner_panel.lineage.json",
        upstreams: ["trigger_rule_profiles", "anchor_month_metrics"],
        outputs: ["trigger_gap_cards"]
      },
      story_links: []
    },
    performance_intelligence_panel: {
      manifest: {
        id: "performance_intelligence_panel",
        version: "1.0.0",
        title: "Performance Intelligence Panel",
        owner: "ops-analytics",
        source_files: ["apps/ice-cream-ops/app.js"],
        status: "draft"
      },
      lineage: {
        file: "packages/ui-lineage/widgets/performance_intelligence_panel.lineage.json",
        upstreams: ["monthly_scope_rows", "hourly_weekday_aggregates", "yearly_summary"],
        outputs: ["performance_intelligence_cards", "yearly_summary_table"]
      },
      story_links: []
    },
    industry_survey_lens_panel: {
      manifest: {
        id: "industry_survey_lens_panel",
        version: "1.0.0",
        title: "Industry Survey Lens Panel",
        owner: "ops-strategy",
        source_files: ["apps/ice-cream-ops/app.js"],
        status: "draft"
      },
      lineage: {
        file: "packages/ui-lineage/widgets/industry_survey_lens_panel.lineage.json",
        upstreams: ["survey_benchmarks", "weekly_scope_metrics"],
        outputs: ["survey_lens_cards"]
      },
      story_links: []
    },
    scale_timing_monitor_panel: {
      manifest: {
        id: "scale_timing_monitor_panel",
        version: "1.0.0",
        title: "Scale Timing Monitor Panel",
        owner: "ops-strategy",
        source_files: ["apps/ice-cream-ops/app.js"],
        status: "draft"
      },
      lineage: {
        file: "packages/ui-lineage/widgets/scale_timing_monitor_panel.lineage.json",
        upstreams: ["trigger_rule_profiles", "observed_month_metrics"],
        outputs: ["scale_timing_matrix"]
      },
      story_links: []
    },
    operational_guardrails_panel: {
      manifest: {
        id: "operational_guardrails_panel",
        version: "1.0.0",
        title: "Operational Guardrails Panel",
        owner: "ops-workflow",
        source_files: ["apps/ice-cream-ops/app.js"],
        status: "draft"
      },
      lineage: {
        file: "packages/ui-lineage/widgets/operational_guardrails_panel.lineage.json",
        upstreams: ["weekly_scope_metrics", "manager_scenario_state", "benchmark_thresholds"],
        outputs: ["guardrail_cards"]
      },
      story_links: []
    }
  });

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function normalizeWidgetId(widgetId) {
    if (typeof widgetId !== "string") return "";
    const trimmed = widgetId.trim();
    return WIDGET_ALIASES[trimmed] || trimmed;
  }

  function getWidgetSpec(widgetId) {
    const normalizedId = normalizeWidgetId(widgetId);
    if (!normalizedId) return null;

    const base = WIDGET_SPEC_INDEX[normalizedId];
    if (!base) return null;

    const manifest = clone(base.manifest);
    if (!manifest.validation) {
      manifest.validation = {
        basis: "as_built_observation",
        state: "unreviewed",
        notes: "Widget spec index entry; usefulness review pending.",
        reviewed_on: "2026-02-24",
        reviewer: "unassigned"
      };
    }

    return {
      requested_id: widgetId,
      widget_id: normalizedId,
      alias_applied: normalizedId !== widgetId ? widgetId : null,
      manifest,
      lineage: clone(base.lineage),
      story_links: clone(base.story_links)
    };
  }

  globalScope.getWidgetSpec = getWidgetSpec;
  globalScope.__JOYUS_WIDGET_IDS = Object.freeze(Object.keys(WIDGET_SPEC_INDEX));
  globalScope.__JOYUS_WIDGET_ALIASES = WIDGET_ALIASES;
})(typeof window !== "undefined" ? window : globalThis);
