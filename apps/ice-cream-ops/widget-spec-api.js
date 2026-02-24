(function initializeWidgetSpecApi(globalScope) {
  const WIDGET_ALIASES = Object.freeze({
    hourly_gp_chart: "hour_by_hour_gross_profit",
    hourByHourGrossProfit: "hour_by_hour_gross_profit",
    planner_day_card: "shift_planner_day_card",
    shiftPlannerCard: "shift_planner_day_card",
    recentStaffingPanel: "recent_staffing_analysis_panel",
    approvalsPanel: "approvals_workbench_panel"
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

    return {
      requested_id: widgetId,
      widget_id: normalizedId,
      alias_applied: normalizedId !== widgetId ? widgetId : null,
      manifest: clone(base.manifest),
      lineage: clone(base.lineage),
      story_links: clone(base.story_links)
    };
  }

  globalScope.getWidgetSpec = getWidgetSpec;
  globalScope.__JOYUS_WIDGET_IDS = Object.freeze(Object.keys(WIDGET_SPEC_INDEX));
  globalScope.__JOYUS_WIDGET_ALIASES = WIDGET_ALIASES;
})(typeof window !== "undefined" ? window : globalThis);
