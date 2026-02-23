'use strict';

const APP_PAGE = (document.body?.dataset?.page || 'dashboard').toLowerCase();

const state = {
  plan: 'current_6_day',
  location: 'EP',
  month: null,
  dateRange: 'last_month',
  mondayScenario: 'base',
  doordashMode: 'include',
  managerScenario: 'current_team',
  managerMgmtShare: 0.3,
  historyMetric: 'revenue',
  exportScope: 'current_view',
  exportLocations: 'current_location',
  playbookSeason: 'summer',
  playbookTargetProfile: 'balanced',
  triggerRules: null,
};

const PLAYBOOK_TRIGGER_STORAGE_KEY = 'mj_playbook_trigger_rules_v1';
const PLAYBOOK_TARGET_PROFILE_STORAGE_KEY = 'mj_playbook_target_profile_v1';

const MONDAY_FACTORS = {
  low: 0.55,
  base: 0.65,
  high: 0.75,
};

const MONDAY_LABELS = {
  low: 'Low (55%)',
  base: 'Base (65%)',
  high: 'High (75%)',
};

const MONDAY_FIELD_BY_KEY = {
  low: 'low_55pct',
  base: 'base_65pct',
  high: 'high_75pct',
};

const PLAYBOOK_SEASONS = ['winter', 'spring', 'summer', 'fall'];

const PLAYBOOK_SEASON_LABELS = {
  winter: 'Winter',
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
};

const PLAYBOOK_SEASON_RULE_KEY = {
  winter: 'down_winter',
  spring: 'up_spring',
  summer: 'up_summer',
  fall: 'down_fall',
};

const PLAYBOOK_TARGET_PROFILES = {
  conservative: {
    label: 'Conservative',
    summary: 'Scale up later and scale down sooner.',
    revenueFactor: 1.08,
    shareDelta: 2,
  },
  balanced: {
    label: 'Balanced',
    summary: 'Historical defaults calibrated from EP/NL trends.',
    revenueFactor: 1,
    shareDelta: 0,
  },
  growth: {
    label: 'Growth',
    summary: 'Scale up earlier and hold higher capacity longer.',
    revenueFactor: 0.92,
    shareDelta: -2,
  },
  custom: {
    label: 'Custom',
    summary: 'Manual threshold edits are active.',
    revenueFactor: 1,
    shareDelta: 0,
  },
};

const SURVEY_BENCHMARKS = {
  sampleSize: 26,
  profitSampleSize: 20,
  medians: {
    ticket: 13.68,
    cogsPct: 26.4,
    laborPct: 27.0,
    rentPct: 8.5,
    totalPct: 61.6,
    profitPct: 15.0,
  },
  bands: {
    laborPct: { p25: 22.0, p50: 27.0, p75: 30.0 },
    cogsPct: { p25: 23.2, p50: 26.4, p75: 28.6 },
    rentPct: { p25: 6.7, p50: 8.5, p75: 10.2 },
    totalPct: { p25: 58.0, p50: 61.6, p75: 66.3 },
    profitPct: { p25: 10.7, p50: 15.0, p75: 17.2 },
    ticket: { p25: 12.22, p50: 13.68, p75: 15.38 },
  },
};

const LOCATION_LABELS = {
  EP: 'East Passyunk',
  NL: 'Northern Liberties',
};

const DATE_RANGE_LABELS = {
  single_month: 'Month to Month',
  last_month: 'Last Month',
  ytd: 'YTD',
  last_52_weeks: 'Last 52 Weeks',
  last_year: 'Last Year',
  full_period: 'Full Period',
};

const DATE_RANGE_OPTIONS = ['single_month', 'last_month', 'ytd', 'last_52_weeks', 'last_year', 'full_period'];

const DOORDASH_MODE_LABELS = {
  include: 'With DoorDash',
  exclude: 'Without DoorDash',
};

const MANAGER_SCENARIO_LABELS = {
  current_team: 'Current Manager Team',
  add_shared_manager: 'Add Shared Manager',
};

const MANAGER_REPLACEMENT_RATE = 15;
const MANAGER_MGMT_MIN = 0.25;
const MANAGER_MGMT_MAX = 0.35;
const STANDARD_STORE_OPEN_HOUR = 12;

const PLAYBOOK_TRANSITION_ORDER = ['up_spring', 'up_summer', 'down_fall', 'down_winter'];

const METRIC_DEFS = {
  avgDailyRevenue: {
    label: 'Avg Daily Revenue',
    step: 50,
    min: 0,
    max: 15000,
    format: (v) => USD.format(v),
  },
  weekendShare: {
    label: 'Fri-Sun Revenue Share',
    step: 0.5,
    min: 0,
    max: 100,
    format: (v) => `${NUM.format(v)}%`,
  },
  peakShare: {
    label: '6-9PM Revenue Share',
    step: 0.5,
    min: 0,
    max: 100,
    format: (v) => `${NUM.format(v)}%`,
  },
};

const HISTORY_METRIC_DEFS = {
  revenue: {
    label: 'Monthly Revenue',
    extract: (row) => row.revenue,
    format: (v) => USD.format(v),
    axisTick: (v) => USD.format(v),
  },
  labor: {
    label: 'Monthly Store Labor',
    extract: (row) => row.labor,
    format: (v) => USD.format(v),
    axisTick: (v) => USD.format(v),
  },
  labor_pct: {
    label: 'Labor %',
    extract: (row) => row.laborPct,
    format: (v) => `${NUM.format(v)}%`,
    axisTick: (v) => `${NUM.format(v)}%`,
  },
  gp72: {
    label: 'Monthly Gross Profit (72%)',
    extract: (row) => row.gp72,
    format: (v) => USD.format(v),
    axisTick: (v) => USD.format(v),
  },
};

const PLAYBOOK_TRIGGER_DEFAULTS = {
  EP: {
    up_spring: {
      label: 'Winter -> Spring',
      detail: 'Scale Up 1',
      conditions: [
        { metric: 'avgDailyRevenue', operator: '>=', threshold: 3450 },
        { metric: 'weekendShare', operator: '>=', threshold: 68 },
      ],
    },
    up_summer: {
      label: 'Spring -> Summer',
      detail: 'Scale Up 2',
      conditions: [
        { metric: 'avgDailyRevenue', operator: '>=', threshold: 5000 },
        { metric: 'peakShare', operator: '>=', threshold: 62 },
      ],
    },
    down_fall: {
      label: 'Summer -> Fall',
      detail: 'Scale Down 1',
      conditions: [{ metric: 'avgDailyRevenue', operator: '<=', threshold: 4350 }],
    },
    down_winter: {
      label: 'Fall -> Winter',
      detail: 'Scale Down 2',
      conditions: [{ metric: 'avgDailyRevenue', operator: '<=', threshold: 2800 }],
    },
  },
  NL: {
    up_spring: {
      label: 'Winter -> Spring',
      detail: 'Scale Up 1',
      conditions: [
        { metric: 'avgDailyRevenue', operator: '>=', threshold: 1950 },
        { metric: 'weekendShare', operator: '>=', threshold: 68 },
      ],
    },
    up_summer: {
      label: 'Spring -> Summer',
      detail: 'Scale Up 2',
      conditions: [
        { metric: 'avgDailyRevenue', operator: '>=', threshold: 3200 },
        { metric: 'peakShare', operator: '>=', threshold: 65 },
      ],
    },
    down_fall: {
      label: 'Summer -> Fall',
      detail: 'Scale Down 1',
      conditions: [{ metric: 'avgDailyRevenue', operator: '<=', threshold: 2900 }],
    },
    down_winter: {
      label: 'Fall -> Winter',
      detail: 'Scale Down 2',
      conditions: [{ metric: 'avgDailyRevenue', operator: '<=', threshold: 1650 }],
    },
  },
};

const PLAYBOOK_RECOMMENDATIONS = {
  winter: {
    EP: {
      focus: 'Protect margin and morale while preserving service standards.',
      bullets: [
        'Keep one opener on most Tue-Thu daytime windows; preserve break coverage.',
        'Keep two-person close every night with one lead-level closer.',
        'Concentrate extra labor on Fri-Sun 5-9PM.',
      ],
    },
    NL: {
      focus: 'Run minimum viable weekday coverage and avoid early-day overstaffing.',
      bullets: [
        'Use lean Tue-Thu daytime staffing and hold two-person close nightly.',
        'Keep weekend evening support but avoid adding early-day float shifts.',
        'Treat Monday as conditional in winter unless demand trend strengthens.',
      ],
    },
  },
  spring: {
    EP: {
      focus: 'Controlled ramp-up as demand climbs.',
      bullets: [
        'Add Thu-Sun evening swing coverage first.',
        'Increase weekend pre-close overlap to reduce close fatigue.',
        'Keep core full-day shifts 7-8 hours before adding more peak-only labor.',
      ],
    },
    NL: {
      focus: 'Ramp in phases, starting with weekend evenings.',
      bullets: [
        'Add Fri-Sun evening swing first, then Thursday once threshold is met.',
        'Move to 3 full-time key leads by March for stable leadership coverage.',
        'Keep weekday opening labor tight until trend confirms.',
      ],
    },
  },
  summer: {
    EP: {
      focus: 'Maximize contribution during peak without burning out closers.',
      bullets: [
        'Keep full-day core shifts intact and layer 5/6-10/11PM peak-only staff.',
        'Prioritize Fri-Sun and hot-weather weekdays for flex coverage.',
        'Cap repeated close frequency per core team member.',
      ],
    },
    NL: {
      focus: 'Push evening capacity with short targeted peak shifts.',
      bullets: [
        'Concentrate flex labor in 6-9PM where demand is most efficient.',
        'Prefer short peak shifts over extending full-day staff into late close.',
        'Use event/weather spikes to trigger same-day flex call-ins.',
      ],
    },
  },
  fall: {
    EP: {
      focus: 'Deliberate de-ramp while protecting weekend performance.',
      bullets: [
        'Remove one weekday peak-only position first.',
        'Hold weekend evening structure through early October.',
        'Transition to winter pattern once demand stays below trigger band.',
      ],
    },
    NL: {
      focus: 'Step down weekday flex first, keep weekend reliability.',
      bullets: [
        'Trim weekday evening flex before touching weekend close coverage.',
        'Maintain Fri-Sun support until downscale trigger is met for 2 weeks.',
        'Shift staffing back toward stable full-day core blocks.',
      ],
    },
  },
};

const PLAYBOOK_CALENDAR = [
  { when: 'Feb 15', action: 'Begin spring flex hiring and training.' },
  { when: 'Mar 1', action: 'Move to spring template.' },
  { when: 'May 15', action: 'Move to summer template and add peak-only shifts.' },
  { when: 'Post-Labor Day', action: 'First fall step-down on weekdays.' },
  { when: 'Nov 1', action: 'Move to winter template.' },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const OPERATING_DAYS_6 = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

let data = null;
let weekdayChart = null;
let hourlyChart = null;
let historyTrendChart = null;

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const USD2 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const NUM = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

function locationsInScope() {
  return state.location === 'BOTH' ? ['EP', 'NL'] : [state.location];
}

function monthStatusLabel(monthKey) {
  const status = data.month_status[monthKey];
  return status === 'actual' ? 'Actual Month' : 'Modeled Month';
}

function periodLabel() {
  if (!data || !data.months || data.months.length === 0) return 'Current Period';
  const first = data.months[0];
  const last = data.months[data.months.length - 1];
  return `${data.month_labels[first]} to ${data.month_labels[last]}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function managerHourlyRate() {
  return Number(data?.manager_assumptions?.hourly_rate || 28);
}

function managerWeeklyHours() {
  return Number(data?.manager_assumptions?.weekly_hours || 40);
}

function isSharedManagerActive(planKey = state.plan, managerScenario = state.managerScenario) {
  return planKey === 'open_7_day' && managerScenario === 'add_shared_manager';
}

function sharedManagerWeeklyImpact(planKey, managerScenario, managerMgmtShare) {
  if (!isSharedManagerActive(planKey, managerScenario)) {
    return {
      totalLabor: 0,
      perStoreLabor: 0,
      totalMgmtHours: 0,
      perStoreMgmtHours: 0,
      totalFloorHours: 0,
      perStoreFloorHours: 0,
      replacementCredit: 0,
    };
  }

  const rate = managerHourlyRate();
  const weeklyHours = managerWeeklyHours();
  const mgmtShare = clamp(Number(managerMgmtShare || 0), MANAGER_MGMT_MIN, MANAGER_MGMT_MAX);
  const mgmtHours = weeklyHours * mgmtShare;
  const floorHours = weeklyHours - mgmtHours;
  const grossCost = weeklyHours * rate;
  const replacementCredit = floorHours * MANAGER_REPLACEMENT_RATE;
  const totalLabor = grossCost - replacementCredit;

  return {
    totalLabor,
    perStoreLabor: totalLabor / 2,
    totalMgmtHours: mgmtHours,
    perStoreMgmtHours: mgmtHours / 2,
    totalFloorHours: floorHours,
    perStoreFloorHours: floorHours / 2,
    replacementCredit,
  };
}

function monthWeekFactor(monthKey, planKey) {
  if (planKey !== 'open_7_day') return 1;
  const cal = data.calendar[monthKey];
  const operatingDays = (cal?.operating_days_6 || 0) + (cal?.mondays || 0);
  return operatingDays / 7;
}

function latestMonthKey() {
  return data.months[data.months.length - 1];
}

function monthsForLocationFocus(locFocus = state.location) {
  if (!data || !Array.isArray(data.months)) return [];
  const locations = locFocus === 'BOTH' ? ['EP', 'NL'] : [locFocus];
  const available = data.months.filter((monthKey) =>
    locations.every((loc) => data.monthly?.[loc] && data.monthly[loc][monthKey])
  );
  return available;
}

function analysisMonthKeys() {
  const months = monthsForLocationFocus(state.location);
  if (!months.length) return [];
  if (months.length === 1) return months.slice();
  // Exclude the latest partial month from all analytical ranges.
  return months.slice(0, -1);
}

function normalizeDateRange(range) {
  return DATE_RANGE_OPTIONS.includes(range) ? range : 'last_month';
}

function normalizeAnalysisMonth(monthKey, months = analysisMonthKeys()) {
  if (!months.length) return null;
  if (monthKey && months.includes(monthKey)) return monthKey;
  return months[months.length - 1];
}

function selectedMonthKeys() {
  const months = analysisMonthKeys();
  if (!months.length) return [];
  const latest = months[months.length - 1];
  const latestYear = Number(latest.split('-')[0]);
  const range = normalizeDateRange(state.dateRange);

  if (range === 'single_month') {
    return [normalizeAnalysisMonth(state.month, months)];
  }

  if (range === 'last_month') {
    return [latest];
  }

  if (range === 'ytd') {
    const inYear = months.filter((monthKey) => Number(monthKey.split('-')[0]) === latestYear);
    return inYear.length ? inYear : [latest];
  }

  if (range === 'last_52_weeks') {
    return months.slice(Math.max(0, months.length - 12));
  }

  if (range === 'last_year') {
    const priorYear = latestYear - 1;
    const priorMonths = months.filter((monthKey) => Number(monthKey.split('-')[0]) === priorYear);
    return priorMonths.length ? priorMonths : [latest];
  }

  return months.slice();
}

function rangeLabel() {
  const months = selectedMonthKeys();
  const range = normalizeDateRange(state.dateRange);
  if (!months.length) return DATE_RANGE_LABELS[range] || 'Current Range';
  if (months.length === 1) return `${DATE_RANGE_LABELS[range]} (${data.month_labels[months[0]]})`;
  return `${DATE_RANGE_LABELS[range]} (${data.month_labels[months[0]]} to ${data.month_labels[months[months.length - 1]]})`;
}

function applyRangeAnchorMonth() {
  state.month = normalizeAnalysisMonth(state.month);
  const months = selectedMonthKeys();
  if (!months.length) return;
  state.month = normalizeAnalysisMonth(months[months.length - 1]);
  state.playbookSeason = seasonFromMonth(state.month);
}

function seasonFromMonth(monthKey) {
  const monthNum = Number(String(monthKey).split('-')[1] || 0);
  if (monthNum === 12 || monthNum <= 2) return 'winter';
  if (monthNum <= 5) return 'spring';
  if (monthNum <= 8) return 'summer';
  return 'fall';
}

function cloneTriggerDefaults() {
  return JSON.parse(JSON.stringify(PLAYBOOK_TRIGGER_DEFAULTS));
}

function stepDecimals(step) {
  const text = String(step || '1');
  if (!text.includes('.')) return 0;
  return text.split('.')[1].length;
}

function metricControlBounds(metric) {
  const def = METRIC_DEFS[metric] || {};
  return {
    min: Number.isFinite(def.min) ? def.min : 0,
    max: Number.isFinite(def.max) ? def.max : 100,
    step: Number.isFinite(def.step) ? def.step : 1,
  };
}

function normalizeThreshold(metric, value, fallback = 0) {
  const bounds = metricControlBounds(metric);
  const parsed = Number(value);
  let next = Number.isFinite(parsed) ? parsed : Number(fallback || 0);
  next = clamp(next, bounds.min, bounds.max);
  if (bounds.step > 0) {
    next = Math.round(next / bounds.step) * bounds.step;
  }
  const decimals = stepDecimals(bounds.step);
  return Number(next.toFixed(decimals));
}

function sanitizeTriggerRules(raw) {
  const defaults = cloneTriggerDefaults();
  const safe = cloneTriggerDefaults();
  if (!raw || typeof raw !== 'object') return safe;

  ['EP', 'NL'].forEach((loc) => {
    PLAYBOOK_TRANSITION_ORDER.forEach((ruleKey) => {
      const defRule = defaults[loc][ruleKey];
      const incomingRule = raw?.[loc]?.[ruleKey];
      if (!incomingRule || !Array.isArray(incomingRule.conditions)) return;

      safe[loc][ruleKey].conditions = defRule.conditions.map((defCond, idx) => {
        const incoming = incomingRule.conditions[idx];
        const threshold = normalizeThreshold(defCond.metric, incoming?.threshold, defCond.threshold);
        return {
          metric: defCond.metric,
          operator: defCond.operator,
          threshold,
        };
      });
    });
  });

  return safe;
}

function normalizeProfileKey(value) {
  return Object.prototype.hasOwnProperty.call(PLAYBOOK_TARGET_PROFILES, value) ? value : 'balanced';
}

function loadPlaybookTargetProfile() {
  try {
    const raw = localStorage.getItem(PLAYBOOK_TARGET_PROFILE_STORAGE_KEY);
    return normalizeProfileKey(String(raw || 'balanced'));
  } catch (_err) {
    return 'balanced';
  }
}

function savePlaybookTargetProfile() {
  try {
    localStorage.setItem(PLAYBOOK_TARGET_PROFILE_STORAGE_KEY, normalizeProfileKey(state.playbookTargetProfile));
  } catch (_err) {
    // Ignore storage errors.
  }
}

function loadTriggerRulesFromStorage() {
  try {
    const raw = localStorage.getItem(PLAYBOOK_TRIGGER_STORAGE_KEY);
    if (!raw) return cloneTriggerDefaults();
    return sanitizeTriggerRules(JSON.parse(raw));
  } catch (_err) {
    return cloneTriggerDefaults();
  }
}

function saveTriggerRulesToStorage() {
  try {
    localStorage.setItem(PLAYBOOK_TRIGGER_STORAGE_KEY, JSON.stringify(sanitizeTriggerRules(state.triggerRules)));
  } catch (_err) {
    // Ignore storage errors.
  }
}

function setTriggerThreshold(loc, ruleKey, condIdx, rawValue) {
  if (!state.triggerRules?.[loc]?.[ruleKey]) return;
  const condition = state.triggerRules[loc][ruleKey].conditions?.[condIdx];
  if (!condition) return;

  const next = normalizeThreshold(condition.metric, rawValue, condition.threshold);
  if (next === condition.threshold) return;
  condition.threshold = next;
  state.playbookTargetProfile = 'custom';
  saveTriggerRulesToStorage();
  savePlaybookTargetProfile();
  renderAll();
}

function profileThresholdFromDefault(defaultCond, profileKey) {
  const profile = PLAYBOOK_TARGET_PROFILES[normalizeProfileKey(profileKey)];
  let next = Number(defaultCond.threshold || 0);
  if (defaultCond.metric === 'avgDailyRevenue') {
    next *= Number(profile.revenueFactor || 1);
  } else {
    next += Number(profile.shareDelta || 0);
  }
  return normalizeThreshold(defaultCond.metric, next, defaultCond.threshold);
}

function buildTriggerRulesForProfile(profileKey) {
  const normalized = normalizeProfileKey(profileKey);
  const defaults = cloneTriggerDefaults();
  const nextRules = cloneTriggerDefaults();

  ['EP', 'NL'].forEach((loc) => {
    PLAYBOOK_TRANSITION_ORDER.forEach((ruleKey) => {
      nextRules[loc][ruleKey].conditions = defaults[loc][ruleKey].conditions.map((cond) => ({
        metric: cond.metric,
        operator: cond.operator,
        threshold: profileThresholdFromDefault(cond, normalized),
      }));
    });
  });

  return sanitizeTriggerRules(nextRules);
}

function applyTriggerProfile(profileKey) {
  const normalized = normalizeProfileKey(profileKey);
  state.playbookTargetProfile = normalized;
  state.triggerRules = buildTriggerRulesForProfile(normalized);
  saveTriggerRulesToStorage();
  savePlaybookTargetProfile();
  renderAll();
}

function resetAllTriggerThresholds() {
  state.triggerRules = cloneTriggerDefaults();
  state.playbookTargetProfile = 'balanced';
  saveTriggerRulesToStorage();
  savePlaybookTargetProfile();
  renderAll();
}

function resetSeasonTriggerThresholds(seasonKey) {
  const ruleKey = PLAYBOOK_SEASON_RULE_KEY[seasonKey];
  if (!ruleKey) return;
  const defaults = cloneTriggerDefaults();
  ['EP', 'NL'].forEach((loc) => {
    state.triggerRules[loc][ruleKey].conditions = defaults[loc][ruleKey].conditions.map((cond) => ({ ...cond }));
  });
  state.playbookTargetProfile = 'custom';
  saveTriggerRulesToStorage();
  savePlaybookTargetProfile();
  renderAll();
}

function isStandardStoreHour(hour24) {
  const hour = Number(hour24);
  return Number.isFinite(hour) && hour >= STANDARD_STORE_OPEN_HOUR;
}

function filterToStandardStoreHours(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const filtered = list.filter((row) => isStandardStoreHour(row.hour));
  return filtered.length ? filtered : list;
}

function monthMetricsForLocation(loc, monthKey) {
  const monthData = data.monthly[loc][monthKey];
  const weekday = data.weekday_profile[loc][monthKey];
  const hourly = filterToStandardStoreHours(data.hourly_profile[loc][monthKey] || []).filter((row) => row.avg_revenue > 0);

  const tueSunRevenue = OPERATING_DAYS_6.reduce(
    (acc, day) => acc + revenueWithMode(weekday[day]?.avg_revenue || 0, weekday[day]?.avg_doordash_net || 0, state.doordashMode),
    0
  );
  const weekendRevenue = ['Fri', 'Sat', 'Sun'].reduce(
    (acc, day) => acc + revenueWithMode(weekday[day]?.avg_revenue || 0, weekday[day]?.avg_doordash_net || 0, state.doordashMode),
    0
  );
  const peakRevenue = hourly
    .filter((row) => row.hour >= 18 && row.hour <= 21)
    .reduce((acc, row) => acc + revenueWithMode(row.avg_revenue, row.avg_doordash_net || 0, state.doordashMode), 0);
  const totalHourlyRevenue = hourly.reduce(
    (acc, row) => acc + revenueWithMode(row.avg_revenue, row.avg_doordash_net || 0, state.doordashMode),
    0
  );

  return {
    avgDailyRevenue: revenueWithMode(monthData.avg_daily_revenue || 0, monthData.avg_daily_doordash_net || 0, state.doordashMode),
    weekendShare: tueSunRevenue > 0 ? (weekendRevenue / tueSunRevenue) * 100 : 0,
    peakShare: totalHourlyRevenue > 0 ? (peakRevenue / totalHourlyRevenue) * 100 : 0,
  };
}

function conditionMet(value, operator, threshold) {
  if (operator === '<=') return value <= threshold;
  return value >= threshold;
}

function formatMetric(metric, value) {
  const def = METRIC_DEFS[metric];
  return def ? def.format(value) : String(value);
}

function formatThreshold(metric, operator, threshold) {
  return `${operator} ${formatMetric(metric, threshold)}`;
}

function setActiveButton(groupId, attrName, value) {
  const root = document.getElementById(groupId);
  if (!root) return;
  root.querySelectorAll(`[${attrName}]`).forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute(attrName) === value);
  });
}

function hourLabel(hour24) {
  const h = Number(hour24);
  if (Number.isNaN(h)) return '';
  const suffix = h >= 12 ? 'PM' : 'AM';
  const converted = h % 12 === 0 ? 12 : h % 12;
  return `${converted}${suffix}`;
}

function sumForScope(fn) {
  return locationsInScope().reduce((acc, loc) => acc + fn(loc), 0);
}

function isDoorDashIncluded(mode = state.doordashMode) {
  return mode !== 'exclude';
}

function revenueWithMode(baseRevenue, doordashComponent = 0, mode = state.doordashMode) {
  const rev = Number(baseRevenue || 0);
  if (isDoorDashIncluded(mode)) return rev;
  return rev - Number(doordashComponent || 0);
}

function tuesdayBaselineForMonth(loc, monthKey, mode = state.doordashMode) {
  const tue = data.weekday_profile[loc][monthKey]?.Tue;
  if (!tue) return 0;
  return revenueWithMode(tue.avg_revenue, tue.avg_doordash_net || 0, mode);
}

function allAccessibleLocations() {
  return ['EP', 'NL'];
}

function exportLocationCodes() {
  if (state.exportLocations === 'all_accessible') return allAccessibleLocations();
  return state.location === 'BOTH' ? allAccessibleLocations() : [state.location];
}

function exportMonthKeys() {
  return state.exportScope === 'full_period' ? analysisMonthKeys() : selectedMonthKeys();
}

function weeklyMetricsForLocationAtMonth(
  loc,
  monthKey,
  planKey,
  mondayScenario,
  managerScenario = state.managerScenario,
  managerMgmtShare = state.managerMgmtShare,
  doordashMode = state.doordashMode
) {
  const wk = data.weekday_profile[loc][monthKey];
  let revenue = 0;
  let labor = 0;

  OPERATING_DAYS_6.forEach((day) => {
    revenue += revenueWithMode(wk[day].avg_revenue, wk[day].avg_doordash_net || 0, doordashMode);
    labor += wk[day].avg_labor;
  });

  let mondayRevenue = 0;
  let mondayLabor = 0;

  if (planKey === 'open_7_day') {
    mondayRevenue = tuesdayBaselineForMonth(loc, monthKey, doordashMode) * MONDAY_FACTORS[mondayScenario];
    mondayLabor = data.monday_labor[loc][monthKey] || 0;
    revenue += mondayRevenue;
    labor += mondayLabor;
  }

  let managerAddedLabor = 0;
  let managerFloorHours = 0;
  let managerMgmtHours = 0;
  if (isSharedManagerActive(planKey, managerScenario)) {
    const shared = sharedManagerWeeklyImpact(planKey, managerScenario, managerMgmtShare);
    managerAddedLabor = shared.perStoreLabor;
    managerFloorHours = shared.perStoreFloorHours;
    managerMgmtHours = shared.perStoreMgmtHours;
    labor += managerAddedLabor;
  }

  const gp72 = revenue * 0.72 - labor;
  const laborPct = revenue > 0 ? (labor / revenue) * 100 : 0;

  return {
    revenue,
    labor,
    gp72,
    laborPct,
    mondayRevenue,
    mondayLabor,
    managerAddedLabor,
    managerFloorHours,
    managerMgmtHours,
  };
}

function weeklyMetricsForLocation(loc) {
  const months = selectedMonthKeys();
  if (!months.length) {
    return weeklyMetricsForLocationAtMonth(
      loc,
      state.month,
      state.plan,
      state.mondayScenario,
      state.managerScenario,
      state.managerMgmtShare,
      state.doordashMode
    );
  }

  const totals = months.reduce(
    (acc, monthKey) => {
      const row = weeklyMetricsForLocationAtMonth(
        loc,
        monthKey,
        state.plan,
        state.mondayScenario,
        state.managerScenario,
        state.managerMgmtShare,
        state.doordashMode
      );
      acc.revenue += row.revenue;
      acc.labor += row.labor;
      acc.gp72 += row.gp72;
      acc.mondayRevenue += row.mondayRevenue;
      acc.mondayLabor += row.mondayLabor;
      acc.managerAddedLabor += row.managerAddedLabor || 0;
      acc.managerFloorHours += row.managerFloorHours || 0;
      acc.managerMgmtHours += row.managerMgmtHours || 0;
      return acc;
    },
    {
      revenue: 0,
      labor: 0,
      gp72: 0,
      mondayRevenue: 0,
      mondayLabor: 0,
      managerAddedLabor: 0,
      managerFloorHours: 0,
      managerMgmtHours: 0,
    }
  );

  const count = months.length;
  const revenue = totals.revenue / count;
  const labor = totals.labor / count;

  return {
    revenue,
    labor,
    gp72: revenue * 0.72 - labor,
    laborPct: revenue > 0 ? (labor / revenue) * 100 : 0,
    mondayRevenue: totals.mondayRevenue / count,
    mondayLabor: totals.mondayLabor / count,
    managerAddedLabor: totals.managerAddedLabor / count,
    managerFloorHours: totals.managerFloorHours / count,
    managerMgmtHours: totals.managerMgmtHours / count,
  };
}

function monthlyMetricsForLocationAtMonth(
  loc,
  monthKey,
  planKey,
  mondayScenario,
  managerScenario = state.managerScenario,
  managerMgmtShare = state.managerMgmtShare,
  doordashMode = state.doordashMode
) {
  const month = data.monthly[loc][monthKey];
  let revenue = revenueWithMode(month.revenue, month.doordash_net_component || 0, doordashMode);
  let labor = month.store_labor;
  let mondayRevenue = 0;
  let mondayLabor = 0;

  if (planKey === 'open_7_day') {
    const mondayCount = data.calendar[monthKey].mondays;
    mondayRevenue = tuesdayBaselineForMonth(loc, monthKey, doordashMode) * MONDAY_FACTORS[mondayScenario] * mondayCount;
    mondayLabor = data.monday_labor[loc][monthKey] * mondayCount;
    revenue += mondayRevenue;
    labor += mondayLabor;
  }

  let managerAddedLabor = 0;
  if (isSharedManagerActive(planKey, managerScenario)) {
    const shared = sharedManagerWeeklyImpact(planKey, managerScenario, managerMgmtShare);
    managerAddedLabor = shared.perStoreLabor * monthWeekFactor(monthKey, planKey);
    labor += managerAddedLabor;
  }

  return {
    revenue,
    labor,
    mondayRevenue,
    mondayLabor,
    managerAddedLabor,
    gp72: revenue * 0.72 - labor,
    laborPct: revenue > 0 ? (labor / revenue) * 100 : 0,
  };
}

function monthlyMetricsForScopeAtMonth(
  monthKey,
  planKey,
  mondayScenario,
  managerScenario = state.managerScenario,
  managerMgmtShare = state.managerMgmtShare,
  doordashMode = state.doordashMode
) {
  return locationsInScope().reduce(
    (acc, loc) => {
      const row = monthlyMetricsForLocationAtMonth(
        loc,
        monthKey,
        planKey,
        mondayScenario,
        managerScenario,
        managerMgmtShare,
        doordashMode
      );
      acc.revenue += row.revenue;
      acc.labor += row.labor;
      acc.mondayRevenue += row.mondayRevenue;
      acc.mondayLabor += row.mondayLabor;
      acc.managerAddedLabor += row.managerAddedLabor || 0;
      return acc;
    },
    { revenue: 0, labor: 0, mondayRevenue: 0, mondayLabor: 0, managerAddedLabor: 0 }
  );
}

function rollingAverage(values, windowSize) {
  if (!Array.isArray(values) || values.length === 0) return [];
  const out = [];
  for (let idx = 0; idx < values.length; idx += 1) {
    const start = Math.max(0, idx - windowSize + 1);
    const slice = values.slice(start, idx + 1);
    const sum = slice.reduce((acc, v) => acc + Number(v || 0), 0);
    out.push(sum / slice.length);
  }
  return out;
}

function annualMetricsForLocation(loc, monthKeys = data.months) {
  let currentRevenue = 0;
  let currentLabor = 0;

  let openRevenue = 0;
  let openLabor = 0;
  let openManagerAddedLabor = 0;

  monthKeys.forEach((monthKey) => {
    const currentRow = monthlyMetricsForLocationAtMonth(
      loc,
      monthKey,
      'current_6_day',
      state.mondayScenario,
      'current_team',
      state.managerMgmtShare,
      state.doordashMode
    );
    const openRow = monthlyMetricsForLocationAtMonth(
      loc,
      monthKey,
      'open_7_day',
      state.mondayScenario,
      state.managerScenario,
      state.managerMgmtShare,
      state.doordashMode
    );

    currentRevenue += currentRow.revenue;
    currentLabor += currentRow.labor;
    openRevenue += openRow.revenue;
    openLabor += openRow.labor;
    openManagerAddedLabor += openRow.managerAddedLabor || 0;
  });

  const currentGp = currentRevenue * 0.72 - currentLabor;
  const currentLaborPct = currentRevenue > 0 ? (currentLabor / currentRevenue) * 100 : 0;

  const openGp = openRevenue * 0.72 - openLabor;
  const openLaborPct = openRevenue > 0 ? (openLabor / openRevenue) * 100 : 0;

  return {
    current: {
      revenue: currentRevenue,
      labor: currentLabor,
      gp72: currentGp,
      laborPct: currentLaborPct,
    },
    open: {
      revenue: openRevenue,
      labor: openLabor,
      gp72: openGp,
      laborPct: openLaborPct,
      managerAddedLabor: openManagerAddedLabor,
    },
  };
}

function combinedAnnualMetrics(monthKeys = data.months) {
  const ep = annualMetricsForLocation('EP', monthKeys);
  const nl = annualMetricsForLocation('NL', monthKeys);

  const currentRevenue = ep.current.revenue + nl.current.revenue;
  const currentLabor = ep.current.labor + nl.current.labor;
  const openRevenue = ep.open.revenue + nl.open.revenue;
  const openLabor = ep.open.labor + nl.open.labor;
  const openManagerAddedLabor = (ep.open.managerAddedLabor || 0) + (nl.open.managerAddedLabor || 0);

  return {
    current: {
      revenue: currentRevenue,
      labor: currentLabor,
      gp72: currentRevenue * 0.72 - currentLabor,
      laborPct: currentRevenue > 0 ? (currentLabor / currentRevenue) * 100 : 0,
    },
    open: {
      revenue: openRevenue,
      labor: openLabor,
      gp72: openRevenue * 0.72 - openLabor,
      laborPct: openRevenue > 0 ? (openLabor / openRevenue) * 100 : 0,
      managerAddedLabor: openManagerAddedLabor,
    },
  };
}

function healthSignal(laborPct) {
  if (laborPct <= 16) return { label: 'Healthy', klass: 'status-good' };
  if (laborPct <= 24) return { label: 'Watch', klass: 'status-watch' };
  return { label: 'High Load', klass: 'status-risk' };
}

function renderHeaderBadges() {
  const generated = document.getElementById('lastUpdatedBadge');
  if (generated) generated.innerHTML = `<span>Generated</span><strong>${data.generated_on}</strong>`;
  const periodBadge = document.getElementById('dataWindowBadge');
  if (periodBadge) periodBadge.textContent = `${periodLabel()} (Actual Pulls)`;
}

function renderKpis() {
  const container = document.getElementById('kpiGrid');

  const weeklyRevenue = sumForScope((loc) => weeklyMetricsForLocation(loc).revenue);
  const weeklyLabor = sumForScope((loc) => weeklyMetricsForLocation(loc).labor);
  const weeklyGp = sumForScope((loc) => weeklyMetricsForLocation(loc).gp72);
  const weeklyLaborPct = weeklyRevenue > 0 ? (weeklyLabor / weeklyRevenue) * 100 : 0;
  const weeklyManagerAddedLabor = sumForScope((loc) => weeklyMetricsForLocation(loc).managerAddedLabor || 0);
  const weeklyManagerFloorHours = sumForScope((loc) => weeklyMetricsForLocation(loc).managerFloorHours || 0);
  const weeklyManagerMgmtHours = sumForScope((loc) => weeklyMetricsForLocation(loc).managerMgmtHours || 0);

  const mondayRevenue = sumForScope((loc) => weeklyMetricsForLocation(loc).mondayRevenue);
  const mondayLabor = sumForScope((loc) => weeklyMetricsForLocation(loc).mondayLabor);
  const mondayGp = mondayRevenue * 0.72 - mondayLabor;

  const months = selectedMonthKeys();
  const statusLabel =
    months.length === 1
      ? monthStatusLabel(months[0])
      : `${months.length} months`;
  const locationLabel =
    state.location === 'EP'
      ? 'East Passyunk'
      : state.location === 'NL'
      ? 'Northern Liberties'
      : 'Both Stores';

  const health = healthSignal(weeklyLaborPct);
  const dd = data.doordash_integration || null;
  const ddLabel = dd && dd.enabled
    ? state.doordashMode === 'include'
      ? `DoorDash included (${USD2.format(dd.net_applied_total)} net loaded)`
      : 'DoorDash excluded from totals'
    : 'DoorDash net not available';
  const managerScenarioLabel =
    state.plan === 'open_7_day' && state.managerScenario === 'add_shared_manager'
      ? `Shared manager active (${Math.round(state.managerMgmtShare * 100)}% mgmt / ${Math.round(
          (1 - state.managerMgmtShare) * 100
        )}% floor)`
      : 'Current manager team';
  const laborSub =
    state.plan === 'open_7_day' && state.managerScenario === 'add_shared_manager'
      ? `${NUM.format(weeklyLaborPct)}% of revenue · includes ${USD2.format(weeklyManagerAddedLabor)} net shared-manager labor`
      : `${NUM.format(weeklyLaborPct)}% of revenue · ${locationLabel}`;

  const cards = [
    {
      title: 'Avg Weekly Revenue',
      value: USD.format(weeklyRevenue),
      sub: `${rangeLabel()} · ${statusLabel} · ${ddLabel}`,
    },
    {
      title: 'Avg Weekly Store Labor',
      value: USD.format(weeklyLabor),
      sub: laborSub,
    },
    {
      title: 'Avg Weekly Gross Profit',
      value: USD.format(weeklyGp),
      sub: 'Revenue × 72% minus store-floor labor',
    },
    {
      title: 'Monday Contribution',
      value: state.plan === 'open_7_day' ? USD.format(mondayGp) : 'Closed',
      sub:
        state.plan === 'open_7_day'
          ? `${MONDAY_LABELS[state.mondayScenario]} scenario · ${managerScenarioLabel}`
          : 'Not included in 6-day plan',
      trend: state.plan === 'open_7_day' ? (mondayGp >= 0 ? 'up' : 'down') : null,
    },
    {
      title: 'Wellbeing Load Signal',
      value: `<span class="status-pill ${health.klass}">${health.label}</span>`,
      sub:
        state.plan === 'open_7_day' && state.managerScenario === 'add_shared_manager'
          ? `7 operating days · 2 closers rule · shared manager: ${NUM.format(weeklyManagerFloorHours)} floor hrs + ${NUM.format(
              weeklyManagerMgmtHours
            )} mgmt hrs/week`
          : `${state.plan === 'open_7_day' ? '7 operating days' : '6 operating days'} · 2 closers rule enforced`,
      rawHtml: true,
    },
  ];

  container.innerHTML = cards
    .map(
      (card) => `
      <article class="kpi">
        <p class="kpi-title">${card.title}</p>
        <p class="kpi-value ${card.trend === 'up' ? 'pulse-up' : card.trend === 'down' ? 'pulse-down' : ''}">${card.value}</p>
        <p class="kpi-sub">${card.sub}</p>
      </article>
    `
    )
    .join('');
}

function weekdaySeriesForLocation(loc) {
  const labels = state.plan === 'open_7_day' ? WEEKDAYS : OPERATING_DAYS_6;
  const months = selectedMonthKeys();
  const sums = labels.map(() => ({ revenue: 0, labor: 0 }));

  months.forEach((monthKey) => {
    const wk = data.weekday_profile[loc][monthKey];
    labels.forEach((day, idx) => {
      if (day === 'Mon') {
        sums[idx].revenue += tuesdayBaselineForMonth(loc, monthKey, state.doordashMode) * MONDAY_FACTORS[state.mondayScenario];
        sums[idx].labor += data.monday_labor[loc][monthKey];
      } else {
        sums[idx].revenue += revenueWithMode(wk[day].avg_revenue, wk[day].avg_doordash_net || 0, state.doordashMode);
        sums[idx].labor += wk[day].avg_labor;
      }
    });
  });

  const divisor = months.length || 1;
  const revenue = sums.map((row) => row.revenue / divisor);
  const labor = sums.map((row) => row.labor / divisor);

  if (isSharedManagerActive(state.plan, state.managerScenario) && labels.length > 0) {
    const shared = sharedManagerWeeklyImpact(state.plan, state.managerScenario, state.managerMgmtShare);
    const perDay = shared.perStoreLabor / labels.length;
    for (let idx = 0; idx < labor.length; idx += 1) {
      labor[idx] += perDay;
    }
  }

  const gp = revenue.map((val, idx) => val * 0.72 - labor[idx]);

  return { labels, revenue, labor, gp };
}

function combineWeekdaySeries(a, b) {
  return {
    labels: a.labels,
    revenue: a.revenue.map((v, i) => v + b.revenue[i]),
    labor: a.labor.map((v, i) => v + b.labor[i]),
    gp: a.gp.map((v, i) => v + b.gp[i]),
  };
}

function renderWeekdayChart() {
  const ctx = document.getElementById('weekdayChart');

  let series;
  if (state.location === 'BOTH') {
    series = combineWeekdaySeries(weekdaySeriesForLocation('EP'), weekdaySeriesForLocation('NL'));
  } else {
    series = weekdaySeriesForLocation(state.location);
  }

  if (weekdayChart) weekdayChart.destroy();

  weekdayChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: series.labels,
      datasets: [
        {
          label: 'Revenue',
          data: series.revenue,
          backgroundColor: 'rgba(202, 84, 36, 0.25)',
          borderColor: 'rgba(202, 84, 36, 0.95)',
          borderWidth: 1.4,
          borderRadius: 6,
          yAxisID: 'y',
        },
        {
          label: 'Store Labor',
          data: series.labor,
          type: 'line',
          borderColor: 'rgba(15, 108, 117, 0.95)',
          backgroundColor: 'rgba(15, 108, 117, 0.25)',
          borderWidth: 2,
          pointRadius: 2.8,
          tension: 0.24,
          yAxisID: 'y',
        },
        {
          label: 'Gross Profit (72%)',
          data: series.gp,
          type: 'line',
          borderColor: 'rgba(47, 143, 91, 0.95)',
          backgroundColor: 'rgba(47, 143, 91, 0.2)',
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 2.4,
          tension: 0.22,
          yAxisID: 'y',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            boxWidth: 12,
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctxTip) => `${ctxTip.dataset.label}: ${USD2.format(ctxTip.parsed.y)}`,
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (val) => USD.format(val),
          },
          grid: { color: 'rgba(31, 26, 22, 0.08)' },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  });
}

function hourlySeriesForLocation(loc) {
  const months = selectedMonthKeys();
  const hourMap = new Map();

  months.forEach((monthKey) => {
    const rows = filterToStandardStoreHours((data.hourly_profile[loc][monthKey] || []).slice());
    rows.forEach((row) => {
      const prev = hourMap.get(row.hour) || { gp: 0, count: 0 };
      const hourRevenue = revenueWithMode(row.avg_revenue, row.avg_doordash_net || 0, state.doordashMode);
      const hourGp = hourRevenue * 0.72 - row.avg_labor;
      prev.gp += hourGp;
      prev.count += 1;
      hourMap.set(row.hour, prev);
    });
  });

  const rows = Array.from(hourMap.entries())
    .map(([hour, agg]) => ({
      hour,
      avg_gp_72: agg.count ? agg.gp / agg.count : 0,
    }))
    .sort((a, b) => a.hour - b.hour);

  if (isSharedManagerActive(state.plan, state.managerScenario) && rows.length > 0) {
    const shared = sharedManagerWeeklyImpact(state.plan, state.managerScenario, state.managerMgmtShare);
    const dailyNet = shared.perStoreLabor / 7;
    const targetHours = rows.filter((row) => row.hour >= 15 && row.hour <= 21);
    const weightCount = targetHours.length || rows.length;
    const perHour = dailyNet / weightCount;
    rows.forEach((row) => {
      if (targetHours.length === 0 || (row.hour >= 15 && row.hour <= 21)) {
        row.avg_gp_72 -= perHour;
      }
    });
  }

  return {
    labels: rows.map((r) => hourLabel(r.hour)),
    gp: rows.map((r) => r.avg_gp_72),
  };
}

function combineHourlySeries(a, b) {
  const merged = new Map();

  a.labels.forEach((label, idx) => merged.set(label, (merged.get(label) || 0) + a.gp[idx]));
  b.labels.forEach((label, idx) => merged.set(label, (merged.get(label) || 0) + b.gp[idx]));

  return {
    labels: Array.from(merged.keys()),
    gp: Array.from(merged.values()),
  };
}

function renderHourlyChart() {
  const ctx = document.getElementById('hourlyChart');

  let series;
  if (state.location === 'BOTH') {
    series = combineHourlySeries(hourlySeriesForLocation('EP'), hourlySeriesForLocation('NL'));
  } else {
    series = hourlySeriesForLocation(state.location);
  }

  if (hourlyChart) hourlyChart.destroy();

  hourlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: series.labels,
      datasets: [
        {
          label: 'Avg Gross Profit by Hour',
          data: series.gp,
          borderRadius: 6,
          backgroundColor: (ctxBar) => {
            const v = Number(ctxBar.raw || 0);
            if (v >= 350) return 'rgba(47, 143, 91, 0.9)';
            if (v >= 140) return 'rgba(154, 211, 178, 0.92)';
            if (v >= 0) return 'rgba(247, 190, 117, 0.92)';
            return 'rgba(198, 37, 37, 0.88)';
          },
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctxTip) => `GP: ${USD2.format(ctxTip.parsed.y)} / day`,
          },
        },
      },
      scales: {
        y: {
          ticks: { callback: (v) => USD.format(v) },
          grid: { color: 'rgba(31, 26, 22, 0.08)' },
        },
        x: {
          grid: { display: false },
          ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 12 },
        },
      },
    },
  });
}

function templateMarkup(title, templateObj) {
  const cards = Object.entries(templateObj)
    .map(
      ([block, bullets]) => `
      <article class="template-card">
        <h3>${block}</h3>
        <ul>${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
      </article>
    `
    )
    .join('');

  return `
    <div>
      <h3 class="section-title">${title}</h3>
      <p class="section-sub">Full-day core shifts first, then selective peak support.</p>
      <div class="template-grid">${cards}</div>
    </div>
  `;
}

function renderTemplatePanel() {
  const panel = document.getElementById('templatePanel');
  const plan = data.plan_templates[state.plan];

  if (state.plan === 'current_6_day') {
    let blocks = '';
    if (state.location === 'BOTH') {
      blocks += templateMarkup('East Passyunk', plan.ep);
      blocks += templateMarkup('Northern Liberties', plan.nl);
    } else if (state.location === 'EP') {
      blocks += templateMarkup('East Passyunk', plan.ep);
    } else {
      blocks += templateMarkup('Northern Liberties', plan.nl);
    }

    panel.innerHTML = `
      <div class="panel-head">
        <h2>${plan.name}</h2>
        <p>${plan.description}</p>
      </div>
      <div class="template-grid">${blocks}</div>
    `;
    return;
  }

  const mondayCards = [
    { title: 'Winter Monday', rows: plan.winter_monday },
    { title: 'Spring/Fall Monday', rows: plan.spring_fall_monday },
    { title: 'Summer Monday', rows: plan.summer_monday },
  ]
    .map(
      (c) => `
      <article class="template-card">
        <h3>${c.title}</h3>
        <ul>${c.rows.map((r) => `<li>${r}</li>`).join('')}</ul>
      </article>
    `
    )
    .join('');

  let managerBlock = '';
  if (isSharedManagerActive(state.plan, state.managerScenario)) {
    const shared = sharedManagerWeeklyImpact(state.plan, state.managerScenario, state.managerMgmtShare);
    managerBlock = `
      <div class="monday-summary" style="margin-bottom:0.75rem;">
        <div class="monday-summary-row"><span>Shared Manager Net Labor / Week (Both Stores)</span><strong>${USD.format(shared.totalLabor)}</strong></div>
        <div class="monday-summary-row"><span>Floor Coverage / Week</span><strong>${NUM.format(shared.totalFloorHours)} hrs</strong></div>
        <div class="monday-summary-row"><span>Management Time / Week</span><strong>${NUM.format(shared.totalMgmtHours)} hrs</strong></div>
      </div>
    `;
  }

  panel.innerHTML = `
    <div class="panel-head">
      <h2>${plan.name}</h2>
      <p>${plan.description}</p>
    </div>
    ${managerBlock}
    <div class="template-grid">${mondayCards}</div>
  `;
}

function renderMondayPanel() {
  const panel = document.getElementById('mondayPanel');
  const months = selectedMonthKeys();
  const shared = sharedManagerWeeklyImpact(state.plan, state.managerScenario, state.managerMgmtShare);
  const sharedActive = isSharedManagerActive(state.plan, state.managerScenario);

  const cards = ['low', 'base', 'high']
    .map((key) => {
      const revSum = months.reduce(
        (acc, monthKey) =>
          acc + sumForScope((loc) => tuesdayBaselineForMonth(loc, monthKey, state.doordashMode) * MONDAY_FACTORS[key]),
        0
      );
      const rev = revSum / (months.length || 1);
      return `
      <div class="monday-card ${state.mondayScenario === key ? 'active' : ''}">
        <p>${MONDAY_LABELS[key]}</p>
        <strong>${USD.format(rev)}</strong>
      </div>
    `;
    })
    .join('');

  const selectedRev =
    months.reduce(
      (acc, monthKey) =>
        acc +
        sumForScope((loc) => tuesdayBaselineForMonth(loc, monthKey, state.doordashMode) * MONDAY_FACTORS[state.mondayScenario]),
      0
    ) / (months.length || 1);
  const selectedLabor =
    state.plan === 'open_7_day'
      ? months.reduce((acc, monthKey) => acc + sumForScope((loc) => data.monday_labor[loc][monthKey]), 0) /
        (months.length || 1)
      : 0;
  const selectedGp = selectedRev * 0.72 - selectedLabor;

  panel.innerHTML = `
    <div class="panel-head">
      <h2>Monday Open Sensitivity</h2>
      <p>${rangeLabel()} · avg weekly Monday contribution · manager capped at 40h/week${sharedActive ? ' plus shared-manager split coverage.' : '.'}</p>
    </div>
    <div class="monday-cards">${cards}</div>
    <div class="monday-summary">
      <div class="monday-summary-row"><span>Selected Monday Revenue (Avg/Week)</span><strong>${USD.format(selectedRev)}</strong></div>
      <div class="monday-summary-row"><span>Projected Monday Labor (Avg/Week)</span><strong>${state.plan === 'open_7_day' ? USD.format(selectedLabor) : 'Closed in 6-day plan'}</strong></div>
      <div class="monday-summary-row"><span>Projected Monday GP (72%)</span><strong>${state.plan === 'open_7_day' ? USD.format(selectedGp) : 'N/A'}</strong></div>
      ${
        sharedActive
          ? `<div class="monday-summary-row"><span>Shared Manager Net Labor (Avg/Week)</span><strong>${USD.format(shared.totalLabor)}</strong></div>`
          : ''
      }
    </div>
  `;
}

function renderTeamPanel() {
  const panel = document.getElementById('teamPanel');

  const ep = data.employees.EP;
  const nl = data.employees.NL;
  const both = data.employees.BOTH;
  const epOnly = ep.filter((name) => !both.includes(name));
  const nlOnly = nl.filter((name) => !both.includes(name));

  const showEP = state.location !== 'NL';
  const showNL = state.location !== 'EP';
  const showBoth = state.location === 'BOTH';

  function compactTagList(names) {
    const clean = (names || []).filter(Boolean);
    if (!clean.length) return '<p class="section-sub">No names in current pool.</p>';
    const primary = clean.slice(0, 5).map((n) => `<span class="tag">${n}</span>`).join('');
    if (clean.length <= 5) return `<div class="tag-list">${primary}</div>`;

    const rest = clean.slice(5).map((n) => `<span class="tag">${n}</span>`).join('');
    return `
      <div class="tag-list">${primary}</div>
      <details class="tag-more">
        <summary>See ${clean.length - 5} more</summary>
        <div class="tag-list">${rest}</div>
      </details>
    `;
  }

  panel.innerHTML = `
    <div class="panel-head">
      <h2>Observed Staff Pools</h2>
      <p>Names observed across loaded history (${periodLabel()}); this list is location-filtered but not date-range filtered.</p>
    </div>
    <div class="team-grid">
      <article class="team-col" style="display:${showEP ? 'block' : 'none'}">
        <h3>EP-only</h3>
        ${compactTagList(epOnly)}
      </article>
      <article class="team-col" style="display:${showNL ? 'block' : 'none'}">
        <h3>NL-only</h3>
        ${compactTagList(nlOnly)}
      </article>
      <article class="team-col" style="display:${showBoth ? 'block' : 'none'}">
        <h3>Cross-Location Flex</h3>
        ${compactTagList(both)}
      </article>
    </div>
  `;
}

function renderAnnualPanel() {
  const panel = document.getElementById('annualPanel');
  const months = selectedMonthKeys();

  const annual =
    state.location === 'BOTH'
      ? combinedAnnualMetrics(months)
      : annualMetricsForLocation(state.location, months);

  const revDelta = annual.open.revenue - annual.current.revenue;
  const gpDelta = annual.open.gp72 - annual.current.gp72;
  const sharedActive = isSharedManagerActive(state.plan, state.managerScenario);
  const openLabel = sharedActive ? '7-Day + Shared Manager' : '7-Day Monday Open';
  const sharedLine =
    sharedActive && (annual.open.managerAddedLabor || 0) > 0
      ? `<p class="section-sub" style="margin-top:0.35rem;">Shared manager net labor in range: <strong>${USD.format(
          annual.open.managerAddedLabor
        )}</strong> (${Math.round(state.managerMgmtShare * 100)}% mgmt time).</p>`
      : '';

  panel.innerHTML = `
    <div class="panel-head">
      <h2>Projected Range Impact</h2>
      <p>${rangeLabel()} using selected Monday demand scenario and manager rule (${managerHourlyRate()}/hr, ${managerWeeklyHours()} hrs/week).</p>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Plan</th>
          <th>Revenue</th>
          <th>Store Labor</th>
          <th>Labor %</th>
          <th>Gross Profit (72%)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Current 6-Day</td>
          <td>${USD.format(annual.current.revenue)}</td>
          <td>${USD.format(annual.current.labor)}</td>
          <td>${NUM.format(annual.current.laborPct)}%</td>
          <td>${USD.format(annual.current.gp72)}</td>
        </tr>
        <tr>
          <td>${openLabel}</td>
          <td>${USD.format(annual.open.revenue)}</td>
          <td>${USD.format(annual.open.labor)}</td>
          <td>${NUM.format(annual.open.laborPct)}%</td>
          <td>${USD.format(annual.open.gp72)}</td>
        </tr>
      </tbody>
    </table>
    ${sharedLine}
    <p class="section-sub" style="margin-top:0.7rem;">
      Revenue delta:
      <span class="${revDelta >= 0 ? 'delta-positive' : 'delta-negative'}">${revDelta >= 0 ? '+' : ''}${USD.format(revDelta)}</span>
      · GP delta:
      <span class="${gpDelta >= 0 ? 'delta-positive' : 'delta-negative'}">${gpDelta >= 0 ? '+' : ''}${USD.format(gpDelta)}</span>
    </p>
  `;
}

function monthlySeriesForScope(
  planKey,
  mondayScenario,
  managerScenario = state.managerScenario,
  managerMgmtShare = state.managerMgmtShare,
  doordashMode = state.doordashMode
) {
  return selectedMonthKeys().map((monthKey) => {
    const totals = monthlyMetricsForScopeAtMonth(
      monthKey,
      planKey,
      mondayScenario,
      managerScenario,
      managerMgmtShare,
      doordashMode
    );
    const revenue = totals.revenue;
    const labor = totals.labor;
    return {
      monthKey,
      label: data.month_labels[monthKey],
      revenue,
      labor,
      gp72: revenue * 0.72 - labor,
      laborPct: revenue > 0 ? (labor / revenue) * 100 : 0,
      mondayRevenue: totals.mondayRevenue,
      mondayLabor: totals.mondayLabor,
    };
  });
}

function yearlySummaryForScope(planKey, mondayScenario) {
  const yearMap = new Map();

  monthlySeriesForScope(planKey, mondayScenario).forEach((row) => {
    const year = row.monthKey.split('-')[0];
    const bucket = yearMap.get(year) || { year, months: 0, revenue: 0, labor: 0, gp72: 0 };
    bucket.months += 1;
    bucket.revenue += row.revenue;
    bucket.labor += row.labor;
    bucket.gp72 += row.gp72;
    yearMap.set(year, bucket);
  });

  return Array.from(yearMap.values())
    .sort((a, b) => Number(a.year) - Number(b.year))
    .map((row) => ({
      ...row,
      laborPct: row.revenue > 0 ? (row.labor / row.revenue) * 100 : 0,
    }));
}

function hourlyInsightsForScope() {
  const monthKeys = selectedMonthKeys();
  const hourMap = new Map();

  monthKeys.forEach((monthKey) => {
    const monthHourMap = new Map();
    locationsInScope().forEach((loc) => {
      filterToStandardStoreHours(data.hourly_profile[loc][monthKey] || []).forEach((row) => {
        const prev = monthHourMap.get(row.hour) || { revenue: 0, labor: 0, gp72: 0 };
        const revenue = revenueWithMode(row.avg_revenue, row.avg_doordash_net || 0, state.doordashMode);
        prev.revenue += revenue;
        prev.labor += row.avg_labor;
        prev.gp72 += revenue * 0.72 - row.avg_labor;
        monthHourMap.set(row.hour, prev);
      });
    });

    monthHourMap.forEach((hourRow, hour) => {
      const agg = hourMap.get(hour) || { hour, count: 0, revenue: 0, labor: 0, gp72: 0 };
      agg.count += 1;
      agg.revenue += hourRow.revenue;
      agg.labor += hourRow.labor;
      agg.gp72 += hourRow.gp72;
      hourMap.set(hour, agg);
    });
  });

  return Array.from(hourMap.values())
    .map((row) => ({
      hour: row.hour,
      avgRevenue: row.count ? row.revenue / row.count : 0,
      avgLabor: row.count ? row.labor / row.count : 0,
      avgGp72: row.count ? row.gp72 / row.count : 0,
    }))
    .sort((a, b) => a.hour - b.hour);
}

function weekdayInsightsForScope() {
  const monthKeys = selectedMonthKeys();
  const dayMap = new Map();

  monthKeys.forEach((monthKey) => {
    WEEKDAYS.forEach((day) => {
      const dayRow = locationsInScope().reduce(
        (acc, loc) => {
          const wk = data.weekday_profile[loc][monthKey][day];
          const revenue = revenueWithMode(wk.avg_revenue, wk.avg_doordash_net || 0, state.doordashMode);
          acc.revenue += revenue;
          acc.labor += wk.avg_labor;
          acc.gp72 += revenue * 0.72 - wk.avg_labor;
          return acc;
        },
        { revenue: 0, labor: 0, gp72: 0 }
      );

      const agg = dayMap.get(day) || { day, count: 0, revenue: 0, labor: 0, gp72: 0 };
      agg.count += 1;
      agg.revenue += dayRow.revenue;
      agg.labor += dayRow.labor;
      agg.gp72 += dayRow.gp72;
      dayMap.set(day, agg);
    });
  });

  return WEEKDAYS.map((day) => {
    const row = dayMap.get(day) || { count: 0, revenue: 0, labor: 0, gp72: 0 };
    const avgRevenue = row.count ? row.revenue / row.count : 0;
    const avgLabor = row.count ? row.labor / row.count : 0;
    return {
      day,
      avgRevenue,
      avgLabor,
      avgGp72: row.count ? row.gp72 / row.count : 0,
      laborPct: avgRevenue > 0 ? (avgLabor / avgRevenue) * 100 : 0,
    };
  });
}

function renderHistoricalTrendPanel() {
  const ctx = document.getElementById('historyTrendChart');
  if (!ctx) return;

  const metricDef = HISTORY_METRIC_DEFS[state.historyMetric] || HISTORY_METRIC_DEFS.revenue;
  const baselineRows = monthlySeriesForScope('current_6_day', state.mondayScenario);
  const scenarioRows = monthlySeriesForScope(state.plan, state.mondayScenario);
  const labels = scenarioRows.map((row) => row.label);
  const baselineVals = baselineRows.map((row) => metricDef.extract(row));
  const scenarioVals = scenarioRows.map((row) => metricDef.extract(row));
  const trendVals = rollingAverage(scenarioVals, 3);

  const titleSub = document.querySelector('.history-panel .panel-head p');
  if (titleSub) {
    const scopeLabel = state.location === 'BOTH' ? 'Combined Stores' : LOCATION_LABELS[state.location];
    titleSub.textContent = `${rangeLabel()} · ${scopeLabel} · ${DOORDASH_MODE_LABELS[state.doordashMode]} · dynamic to plan/monday/trigger inputs.`;
  }

  if (historyTrendChart) historyTrendChart.destroy();

  const datasets = [
    {
      label: metricDef.label,
      data: scenarioVals,
      borderColor: 'rgba(202, 84, 36, 0.95)',
      backgroundColor: 'rgba(202, 84, 36, 0.12)',
      borderWidth: 2.2,
      pointRadius: 2.8,
      tension: 0.24,
    },
    {
      label: '3-Month Trend',
      data: trendVals,
      borderColor: 'rgba(15, 108, 117, 0.95)',
      backgroundColor: 'rgba(15, 108, 117, 0.12)',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.28,
      borderDash: [5, 4],
    },
  ];

  if (state.plan === 'open_7_day') {
    datasets.push({
      label: 'Current 6-Day Baseline',
      data: baselineVals,
      borderColor: 'rgba(91, 84, 76, 0.72)',
      backgroundColor: 'rgba(91, 84, 76, 0.08)',
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.2,
    });
  }

  historyTrendChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            boxWidth: 12,
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctxTip) => `${ctxTip.dataset.label}: ${metricDef.format(ctxTip.parsed.y)}`,
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (v) => metricDef.axisTick(v),
          },
          grid: { color: 'rgba(31, 26, 22, 0.08)' },
        },
        x: {
          grid: { display: false },
          ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 14 },
        },
      },
    },
  });
}

function renderInsightPanel() {
  const panel = document.getElementById('insightPanel');
  if (!panel) return;

  const rows = monthlySeriesForScope(state.plan, state.mondayScenario);
  const activeRows = rows.filter((row) => row.revenue > 0);
  const basis = activeRows.length ? activeRows : rows;

  const bestMonth = basis.length ? basis.reduce((best, row) => (row.gp72 > best.gp72 ? row : best), basis[0]) : null;
  const worstMonth = basis.length ? basis.reduce((worst, row) => (row.gp72 < worst.gp72 ? row : worst), basis[0]) : null;
  const singleMonthView = basis.length === 1;
  const useSuperlatives = basis.length >= 3;
  const currentMonth = singleMonthView ? basis[0] : null;

  let priorMonthLabel = null;
  let priorMonth = null;
  if (currentMonth) {
    const idx = data.months.indexOf(currentMonth.monthKey);
    if (idx > 0) {
      const priorMonthKey = data.months[idx - 1];
      priorMonthLabel = data.month_labels[priorMonthKey];
      priorMonth = monthlyMetricsForScopeAtMonth(
        priorMonthKey,
        state.plan,
        state.mondayScenario,
        state.managerScenario,
        state.managerMgmtShare,
        state.doordashMode
      );
    }
  }

  const signedUSD = (value) => `${value >= 0 ? '+' : '-'}${USD.format(Math.abs(value))}`;
  const signedPts = (value) => `${value >= 0 ? '+' : '-'}${NUM.format(Math.abs(value))} pts`;

  const cardOneTitle = singleMonthView ? 'Current Month (GP)' : useSuperlatives ? 'Best Month (GP)' : 'Higher GP Month';
  const cardOneStrong = singleMonthView ? (currentMonth ? currentMonth.label : 'N/A') : bestMonth ? bestMonth.label : 'N/A';
  const cardOneBody = singleMonthView
    ? currentMonth
      ? `${USD.format(currentMonth.gp72)} gross profit at ${NUM.format(currentMonth.laborPct)}% labor.`
      : 'No revenue months in range.'
    : bestMonth
      ? `${USD.format(bestMonth.gp72)} gross profit at ${NUM.format(bestMonth.laborPct)}% labor.`
      : 'No revenue months in range.';

  const cardTwoTitle = singleMonthView ? 'Vs Last Month' : useSuperlatives ? 'Weakest Month (GP)' : 'Lower GP Month';
  const cardTwoStrong = singleMonthView ? (priorMonth ? `${currentMonth.label} vs ${priorMonthLabel}` : 'No prior month') : worstMonth ? worstMonth.label : 'N/A';
  const cardTwoBody = singleMonthView
    ? priorMonth && currentMonth
      ? `${signedUSD(currentMonth.gp72 - priorMonth.gp72)} GP, ${signedUSD(currentMonth.revenue - priorMonth.revenue)} revenue, ${signedPts(
          currentMonth.laborPct - priorMonth.laborPct
        )} labor vs ${priorMonthLabel}.`
      : 'Need at least one prior month to calculate month-over-month change.'
    : worstMonth
      ? `${USD.format(worstMonth.gp72)} gross profit at ${NUM.format(worstMonth.laborPct)}% labor.`
      : 'No revenue months in range.';

  const hourly = hourlyInsightsForScope().filter((row) => row.avgRevenue > 0);
  const bestHour = hourly.reduce((best, row) => (row.avgGp72 > best.avgGp72 ? row : best), hourly[0] || null);
  const worstHour = hourly.reduce((worst, row) => (row.avgGp72 < worst.avgGp72 ? row : worst), hourly[0] || null);

  const weekdays = weekdayInsightsForScope().filter((row) => row.avgRevenue > 0);
  const bestDay = weekdays.reduce((best, row) => (row.avgGp72 > best.avgGp72 ? row : best), weekdays[0] || null);
  const toughestDay = weekdays.reduce((worst, row) => (row.laborPct > worst.laborPct ? row : worst), weekdays[0] || null);

  const totalDayRevenue = weekdays.reduce((acc, row) => acc + row.avgRevenue, 0);
  const weekendRevenue = weekdays
    .filter((row) => ['Fri', 'Sat', 'Sun'].includes(row.day))
    .reduce((acc, row) => acc + row.avgRevenue, 0);
  const weekendShare = totalDayRevenue > 0 ? (weekendRevenue / totalDayRevenue) * 100 : 0;

  const totalHourlyRevenue = hourly.reduce((acc, row) => acc + row.avgRevenue, 0);
  const peakRevenue = hourly
    .filter((row) => row.hour >= 18 && row.hour <= 21)
    .reduce((acc, row) => acc + row.avgRevenue, 0);
  const peakShare = totalHourlyRevenue > 0 ? (peakRevenue / totalHourlyRevenue) * 100 : 0;

  const yearlyRows = yearlySummaryForScope('current_6_day', 'base');
  const fullYears = yearlyRows.filter((row) => row.months >= 12);
  let yoyLine = 'Not enough full-year overlap in this selected range for a clean YoY comparison.';
  if (fullYears.length >= 2) {
    const prior = fullYears[fullYears.length - 2];
    const latest = fullYears[fullYears.length - 1];
    const revYoY = prior.revenue > 0 ? ((latest.revenue - prior.revenue) / prior.revenue) * 100 : 0;
    const gpYoY = prior.gp72 !== 0 ? ((latest.gp72 - prior.gp72) / Math.abs(prior.gp72)) * 100 : 0;
    yoyLine = `${latest.year} vs ${prior.year}: revenue ${revYoY >= 0 ? '+' : ''}${NUM.format(revYoY)}%, GP ${gpYoY >= 0 ? '+' : ''}${NUM.format(gpYoY)}%.`;
  }

  panel.innerHTML = `
    <div class="panel-head">
      <h2>Performance Intelligence</h2>
      <p>All cards below are dynamic to date range, location, plan mode, Monday assumptions, and ${DOORDASH_MODE_LABELS[state.doordashMode].toLowerCase()}. Hour-level metrics use 12PM+ service hours.</p>
    </div>
    <div class="insight-grid">
      <article class="insight-card">
        <h3>${cardOneTitle}</h3>
        <strong>${cardOneStrong}</strong>
        <p>${cardOneBody}</p>
      </article>
      <article class="insight-card">
        <h3>${cardTwoTitle}</h3>
        <strong>${cardTwoStrong}</strong>
        <p>${cardTwoBody}</p>
      </article>
      <article class="insight-card">
        <h3>Peak vs Weak Hour</h3>
        <strong>${bestHour ? hourLabel(bestHour.hour) : 'N/A'} / ${worstHour ? hourLabel(worstHour.hour) : 'N/A'}</strong>
        <p>${bestHour && worstHour ? `${USD.format(bestHour.avgGp72)} vs ${USD.format(worstHour.avgGp72)} avg GP/day.` : 'Hour-level trend unavailable.'}</p>
      </article>
      <article class="insight-card">
        <h3>Demand Shape</h3>
        <strong>${NUM.format(weekendShare)}% weekend · ${NUM.format(peakShare)}% 6-9PM</strong>
        <p>${bestDay && toughestDay ? `Best day: ${bestDay.day} (${USD.format(bestDay.avgGp72)} GP/day). Toughest labor day: ${toughestDay.day} (${NUM.format(toughestDay.laborPct)}%).` : 'Day-level pattern unavailable.'}</p>
      </article>
    </div>
    <table class="insight-table">
      <thead>
        <tr>
          <th>Year</th>
          <th>Months</th>
          <th>Revenue</th>
          <th>Labor %</th>
          <th>GP (72%)</th>
        </tr>
      </thead>
      <tbody>
        ${yearlyRows
          .map(
            (row) => `
          <tr>
            <td>${row.year}</td>
            <td>${row.months}</td>
            <td>${USD.format(row.revenue)}</td>
            <td>${NUM.format(row.laborPct)}%</td>
            <td>${USD.format(row.gp72)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    <p class="section-sub" style="margin-top:0.6rem;">${yoyLine}</p>
  `;
}

function triggerTimingForLocation(loc) {
  const observedMonths = selectedMonthKeys().filter((monthKey) => (data.monthly[loc][monthKey]?.revenue || 0) > 0);
  const rules = state.triggerRules[loc];

  return PLAYBOOK_TRANSITION_ORDER.map((ruleKey) => {
    const rule = rules[ruleKey];
    const hits = observedMonths.filter((monthKey) => {
      const metrics = monthMetricsForLocation(loc, monthKey);
      return rule.conditions.every((cond) => conditionMet(metrics[cond.metric], cond.operator, cond.threshold));
    });

    const hitRate = observedMonths.length ? (hits.length / observedMonths.length) * 100 : 0;
    const currentMet = hits.includes(state.month);

    return {
      ruleKey,
      label: rule.label,
      detail: rule.detail,
      firstHit: hits[0] ? data.month_labels[hits[0]] : 'Not met in selected range',
      lastHit: hits.length ? data.month_labels[hits[hits.length - 1]] : 'Not met',
      hitRate,
      currentMet,
    };
  });
}

function renderTimingPanel() {
  const panel = document.getElementById('timingPanel');
  if (!panel) return;
  const locations = state.location === 'BOTH' ? ['EP', 'NL'] : [state.location];
  const timingByLoc = Object.fromEntries(locations.map((loc) => [loc, triggerTimingForLocation(loc)]));

  const rows = PLAYBOOK_TRANSITION_ORDER.map((ruleKey, idx) => {
    const detail = timingByLoc[locations[0]][idx].detail;

    if (locations.length === 1) {
      const row = timingByLoc[locations[0]][idx];
      return `
        <tr>
          <td>${detail}</td>
          <td>
            <div class="timing-status">
              <span class="status-pill ${row.currentMet ? 'status-good' : 'status-watch'}">${row.currentMet ? 'Met' : 'Gap'}</span>
            </div>
          </td>
          <td>${NUM.format(row.hitRate)}%</td>
          <td>${row.firstHit}</td>
        </tr>
      `;
    }

    const ep = timingByLoc.EP[idx];
    const nl = timingByLoc.NL[idx];
    return `
      <tr>
        <td>${detail}</td>
        <td>
          <div class="timing-status">
            <span class="status-pill ${ep.currentMet ? 'status-good' : 'status-watch'}">${ep.currentMet ? 'Met' : 'Gap'}</span>
            <small>${NUM.format(ep.hitRate)}%</small>
          </div>
        </td>
        <td>
          <div class="timing-status">
            <span class="status-pill ${nl.currentMet ? 'status-good' : 'status-watch'}">${nl.currentMet ? 'Met' : 'Gap'}</span>
            <small>${NUM.format(nl.hitRate)}%</small>
          </div>
        </td>
        <td>
          <div class="timing-first-hit">
            <span>EP: ${ep.firstHit}</span>
            <span>NL: ${nl.firstHit}</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const headingRow =
    locations.length === 1
      ? `
        <tr>
          <th>Transition</th>
          <th>Now</th>
          <th>Hit Rate</th>
          <th>First Met</th>
        </tr>
      `
      : `
        <tr>
          <th>Transition</th>
          <th>EP</th>
          <th>NL</th>
          <th>First Met</th>
        </tr>
      `;

  panel.innerHTML = `
    <div class="panel-head">
      <h2>Scale Timing Monitor</h2>
      <p>Compact trigger matrix across the selected date range.</p>
    </div>
    <div class="timing-compact">
      <table class="insight-table">
        <thead>${headingRow}</thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="timing-note">Hit rate = % of observed months where each trigger condition set was met.</p>
    </div>
  `;
}

function conditionGap(cond, metrics) {
  const value = Number(metrics?.[cond.metric] || 0);
  if (cond.operator === '<=') return value - cond.threshold;
  return cond.threshold - value;
}

function conditionGapLabel(cond, delta) {
  const need = Math.max(0, delta);
  const metricLabel = METRIC_DEFS[cond.metric]?.label || cond.metric;

  if (cond.metric === 'avgDailyRevenue') {
    const amount = USD.format(Math.round(need));
    return cond.operator === '<='
      ? `Reduce avg daily revenue by ${amount}.`
      : `Increase avg daily revenue by ${amount}.`;
  }

  return cond.operator === '<='
    ? `Reduce ${metricLabel} by ${NUM.format(need)} pts.`
    : `Increase ${metricLabel} by ${NUM.format(need)} pts.`;
}

function benchmarkTone(value, band, lowerIsBetter) {
  const v = Number(value || 0);
  if (lowerIsBetter) {
    if (v <= band.p25) return { pill: 'status-good', label: 'Top Quartile' };
    if (v <= band.p50) return { pill: 'status-good', label: 'Better Than Median' };
    if (v <= band.p75) return { pill: 'status-watch', label: 'Watch Zone' };
    return { pill: 'status-risk', label: 'High vs Peers' };
  }

  if (v >= band.p75) return { pill: 'status-good', label: 'Top Quartile' };
  if (v >= band.p50) return { pill: 'status-good', label: 'Better Than Median' };
  if (v >= band.p25) return { pill: 'status-watch', label: 'Watch Zone' };
  return { pill: 'status-risk', label: 'Low vs Peers' };
}

function renderSurveyPanel() {
  const panel = document.getElementById('surveyPanel');
  if (!panel) return;

  const b = SURVEY_BENCHMARKS;
  const weeklyRevenue = sumForScope((loc) => weeklyMetricsForLocation(loc).revenue);
  const weeklyLabor = sumForScope((loc) => weeklyMetricsForLocation(loc).labor);
  const currentLaborPct = weeklyRevenue > 0 ? (weeklyLabor / weeklyRevenue) * 100 : 0;
  const laborTone = benchmarkTone(currentLaborPct, b.bands.laborPct, true);
  const deltaToMedian = currentLaborPct - b.bands.laborPct.p50;
  const deltaToP25 = currentLaborPct - b.bands.laborPct.p25;

  const laborAction =
    deltaToMedian > 0
      ? `Reduce labor by ${NUM.format(deltaToMedian)} pts to reach the peer median (${NUM.format(b.bands.laborPct.p50)}%).`
      : `You are ${NUM.format(Math.abs(deltaToMedian))} pts better than the peer median labor ratio.`;

  const quartileAction =
    deltaToP25 > 0
      ? `To reach top-quartile labor efficiency, reduce another ${NUM.format(deltaToP25)} pts.`
      : `You are at or above top-quartile labor efficiency in this benchmark lens.`;
  const weeklyOpportunityToMedian = deltaToMedian > 0 ? ((deltaToMedian / 100) * weeklyRevenue) : 0;
  const weeklyOpportunityToP25 = deltaToP25 > 0 ? ((deltaToP25 / 100) * weeklyRevenue) : 0;

  panel.innerHTML = `
    <div class="panel-head">
      <h2>Industry Survey Lens</h2>
      <p>Limited-sample benchmark from ${b.sampleSize} ice cream operators (${b.profitSampleSize} with profit data).</p>
    </div>
    <div class="survey-grid">
      <article class="survey-card">
        <h3>Peer Medians</h3>
        <p><strong>Ticket:</strong> ${USD2.format(b.medians.ticket)} (P25 ${USD2.format(b.bands.ticket.p25)} / P75 ${USD2.format(b.bands.ticket.p75)})</p>
        <p><strong>COGS:</strong> ${NUM.format(b.medians.cogsPct)}% (P25 ${NUM.format(b.bands.cogsPct.p25)} / P75 ${NUM.format(b.bands.cogsPct.p75)})</p>
        <p><strong>Labor:</strong> ${NUM.format(b.medians.laborPct)}% (P25 ${NUM.format(b.bands.laborPct.p25)} / P75 ${NUM.format(b.bands.laborPct.p75)})</p>
        <p><strong>Rent:</strong> ${NUM.format(b.medians.rentPct)}% (P25 ${NUM.format(b.bands.rentPct.p25)} / P75 ${NUM.format(b.bands.rentPct.p75)})</p>
        <p><strong>Profit:</strong> ${NUM.format(b.medians.profitPct)}% (P25 ${NUM.format(b.bands.profitPct.p25)} / P75 ${NUM.format(b.bands.profitPct.p75)})</p>
      </article>
      <article class="survey-card">
        <h3>Your Labor Benchmark Position</h3>
        <p><strong>Current labor ratio:</strong> ${NUM.format(currentLaborPct)}%</p>
        <span class="status-pill ${laborTone.pill}">${laborTone.label}</span>
        <p>${laborAction}</p>
        <p>${quartileAction}</p>
      </article>
      <article class="survey-card">
        <h3>Benchmark Action Pack</h3>
        <ul>
          <li><strong>Labor guardrails:</strong> target ${NUM.format(b.bands.laborPct.p50)}%, flag above ${NUM.format(b.bands.laborPct.p75)}%.</li>
          <li><strong>Profit targets:</strong> floor ${NUM.format(b.bands.profitPct.p25)}%, base ${NUM.format(b.bands.profitPct.p50)}%, stretch ${NUM.format(b.bands.profitPct.p75)}%.</li>
          <li><strong>Ticket test band:</strong> keep ${USD2.format(b.bands.ticket.p25)}-${USD2.format(b.bands.ticket.p75)} and run add-on tests when below median ticket.</li>
          <li><strong>Weekly labor opportunity:</strong> ${
            weeklyOpportunityToMedian > 0
              ? `${USD.format(Math.round(weeklyOpportunityToMedian))} to reach peer median, ${USD.format(Math.round(weeklyOpportunityToP25))} to reach top quartile.`
              : 'At or better than peer median today.'
          }</li>
          <li>Treat benchmarks as directional; sample is limited and self-reported.</li>
        </ul>
      </article>
    </div>
  `;
}

function scaleActionForRule(ruleKey) {
  if (ruleKey === 'up_spring') return 'Prepare spring ramp: add weekend-close overlap and start flex training.';
  if (ruleKey === 'up_summer') return 'Prepare summer peak: schedule 5/6-10/11 PM flex blocks.';
  if (ruleKey === 'down_fall') return 'Start fall de-ramp: trim weekday flex first while protecting close coverage.';
  if (ruleKey === 'down_winter') return 'Move to winter lean template and keep breaks/close coverage protected.';
  return 'Hold current template and continue monitoring.';
}

function closestTriggerGap(loc) {
  const metrics = monthMetricsForLocation(loc, state.month);
  const rules = state.triggerRules[loc];

  const evaluations = PLAYBOOK_TRANSITION_ORDER.map((ruleKey) => {
    const rule = rules[ruleKey];
    const conditions = rule.conditions.map((cond) => {
      const delta = conditionGap(cond, metrics);
      const unmet = delta > 0;
      const denom = Math.max(Math.abs(cond.threshold), 1);
      return {
        ...cond,
        delta,
        unmet,
        normGap: unmet ? delta / denom : 0,
      };
    });
    const unmet = conditions.filter((cond) => cond.unmet);
    return {
      ruleKey,
      label: rule.label,
      detail: rule.detail,
      unmet,
      met: unmet.length === 0,
      normScore: unmet.reduce((acc, cond) => acc + cond.normGap, 0),
    };
  });

  const unmetRules = evaluations.filter((rule) => !rule.met).sort((a, b) => a.normScore - b.normScore);
  if (!unmetRules.length) {
    return {
      allMet: true,
      metrics,
      evaluations,
    };
  }

  return {
    allMet: false,
    metrics,
    next: unmetRules[0],
    evaluations,
  };
}

function renderScaleActionPanel() {
  const panel = document.getElementById('scaleActionPanel');
  if (!panel) return;

  const locations = state.location === 'BOTH' ? ['EP', 'NL'] : [state.location];
  const cards = locations.map((loc) => {
    const gap = closestTriggerGap(loc);
    const anchorMonth = data.month_labels[state.month];
    const active = triggerTimingForLocation(loc).filter((row) => row.currentMet);
    const activeLabel = active.length ? active.map((row) => row.detail).join(', ') : 'None';

    if (gap.allMet) {
      return `
        <article class="timing-col gap-card">
          <h3>${LOCATION_LABELS[loc]} Trigger Gap Planner</h3>
          <p>${anchorMonth} anchor · all configured triggers are met.</p>
          <p><strong>Current met triggers:</strong> ${activeLabel}</p>
          <p>${scaleActionForRule(active[0]?.ruleKey)}</p>
        </article>
      `;
    }

    const upcoming = gap.next;
    const gapLines = upcoming.unmet.slice(0, 3).map((cond) => `<li>${conditionGapLabel(cond, cond.delta)}</li>`).join('');

    return `
      <article class="timing-col gap-card">
        <h3>${LOCATION_LABELS[loc]} Trigger Gap Planner</h3>
        <p>${anchorMonth} anchor · closest threshold: <strong>${upcoming.detail}</strong> (${upcoming.label}).</p>
        <ul class="gap-list">${gapLines}</ul>
        <p><strong>Suggested move:</strong> ${scaleActionForRule(upcoming.ruleKey)}</p>
      </article>
    `;
  }).join('');

  panel.innerHTML = `
    <div class="panel-head">
      <h2>Trigger Gap Planner</h2>
      <p>Shows the closest threshold and exactly what needs to move next.</p>
    </div>
    <div class="timing-grid">${cards}</div>
  `;
}

function renderGuardrails() {
  const wrapper = document.getElementById('guardrailList');
  const months = selectedMonthKeys();
  const weeklyRevenue = sumForScope((loc) => weeklyMetricsForLocation(loc).revenue);
  const weeklyLabor = sumForScope((loc) => weeklyMetricsForLocation(loc).labor);
  const weeklyLaborPct = weeklyRevenue > 0 ? (weeklyLabor / weeklyRevenue) * 100 : 0;
  const laborMedian = SURVEY_BENCHMARKS.bands.laborPct.p50;
  const laborRisk = SURVEY_BENCHMARKS.bands.laborPct.p75;
  const shared = sharedManagerWeeklyImpact(state.plan, state.managerScenario, state.managerMgmtShare);
  const sharedActive = isSharedManagerActive(state.plan, state.managerScenario);

  const modeledCount = months.filter((monthKey) => data.month_status[monthKey] === 'modeled').length;

  const cards = [
    {
      title: 'Opening Rule',
      text: 'Single-person opening allowed only when prep load is light and breaks are protected.',
      status: 'good',
    },
    {
      title: 'Closing Rule',
      text: 'Two closers minimum every night; one must be Manager or Key Lead.',
      status: 'good',
    },
    {
      title: 'Manager Cap',
      text: sharedActive
        ? `Base managers + shared manager active. Shared manager modeled at ${managerHourlyRate()}/hr, ${managerWeeklyHours()} hrs/week with ${Math.round(
            state.managerMgmtShare * 100
          )}% management time and ${NUM.format(shared.totalFloorHours)} floor hrs/week across both stores.`
        : `Modeled at ${managerHourlyRate()}/hr and ${managerWeeklyHours()} hours/week. Monday-open incremental labor excludes manager overtime.`,
      status: 'good',
    },
    {
      title: 'Labor Pressure',
      text: `Current weekly labor ratio ${NUM.format(weeklyLaborPct)}%. Survey benchmark median is ${NUM.format(
        laborMedian
      )}% and risk band starts near ${NUM.format(laborRisk)}%.`,
      status: weeklyLaborPct > laborRisk ? 'risk' : weeklyLaborPct > laborMedian ? 'watch' : 'good',
    },
    {
      title: 'Data Confidence',
      text:
        modeledCount > 0
          ? `${modeledCount} month(s) in this range are modeled. Use for planning, then replace with direct pulls.`
          : 'All selected months are directly sourced from available month files.',
      status: modeledCount > 0 ? 'watch' : 'good',
    },
  ];

  const statusMap = {
    good: ['status-good', 'On Track'],
    watch: ['status-watch', 'Watch'],
    risk: ['status-risk', 'Risk'],
  };

  wrapper.innerHTML = cards
    .map((card) => {
      const [klass, label] = statusMap[card.status];
      return `
      <article class="guardrail">
        <h3>${card.title}</h3>
        <p>${card.text}</p>
        <span class="status-pill ${klass}">${label}</span>
      </article>
    `;
    })
    .join('');
}

function renderPlaybookPanel() {
  const panel = document.getElementById('playbookPanel');
  const season = state.playbookSeason || seasonFromMonth(state.month);
  const monthLabel = data.month_labels[state.month];
  const monthStatus = monthStatusLabel(state.month);
  const profileKey = normalizeProfileKey(state.playbookTargetProfile);
  const profileMeta = PLAYBOOK_TARGET_PROFILES[profileKey];

  const seasonButtons = PLAYBOOK_SEASONS.map(
    (key) => `<button type="button" class="seg-btn" data-playbook-season="${key}">${PLAYBOOK_SEASON_LABELS[key]}</button>`
  ).join('');
  const profileButtons = ['conservative', 'balanced', 'growth']
    .map((key) => `<button type="button" class="seg-btn" data-playbook-profile="${key}">${PLAYBOOK_TARGET_PROFILES[key].label}</button>`)
    .join('');

  const recommendations = ['EP', 'NL']
    .map((loc) => {
      const rec = PLAYBOOK_RECOMMENDATIONS[season][loc];
      return `
      <article class="playbook-rec ${loc === 'EP' ? 'playbook-ep' : 'playbook-nl'}">
        <h3>${LOCATION_LABELS[loc]} · ${PLAYBOOK_SEASON_LABELS[season]}</h3>
        <p>${rec.focus}</p>
        <ul>${rec.bullets.map((line) => `<li>${line}</li>`).join('')}</ul>
      </article>
    `;
    })
    .join('');

  const triggerColumns = ['EP', 'NL']
    .map((loc) => {
      const metrics = monthMetricsForLocation(loc, state.month);
      const rules = state.triggerRules[loc];

      const cards = PLAYBOOK_TRANSITION_ORDER.map((ruleKey) => {
        const rule = rules[ruleKey];
        const conditionRows = rule.conditions
          .map((cond, condIdx) => {
            const current = metrics[cond.metric];
            const met = conditionMet(current, cond.operator, cond.threshold);
            const metricDef = METRIC_DEFS[cond.metric];
            const bounds = metricControlBounds(cond.metric);
            const decimals = stepDecimals(bounds.step);
            const threshold = Number(cond.threshold || 0).toFixed(decimals);

            return `
            <div class="trigger-cond">
              <div class="trigger-cond-label">
                <span>${metricDef.label}</span>
                <small>Current: ${formatMetric(cond.metric, current)}</small>
              </div>
              <div class="trigger-cond-control">
                <span class="operator">Target ${cond.operator}</span>
                <div class="trigger-target-editor">
                  <input
                    type="range"
                    class="trigger-slider"
                    min="${bounds.min}"
                    max="${bounds.max}"
                    step="${bounds.step}"
                    value="${threshold}"
                    data-action="set-trigger-threshold"
                    data-loc="${loc}"
                    data-rule="${ruleKey}"
                    data-cond-index="${condIdx}"
                  />
                  <input
                    type="number"
                    class="trigger-number"
                    min="${bounds.min}"
                    max="${bounds.max}"
                    step="${bounds.step}"
                    value="${threshold}"
                    data-action="set-trigger-threshold"
                    data-loc="${loc}"
                    data-rule="${ruleKey}"
                    data-cond-index="${condIdx}"
                  />
                </div>
                <span class="trigger-chip ${met ? 'is-met' : 'is-miss'}">${met ? 'Met' : 'Not Met'}</span>
              </div>
            </div>
          `;
          })
          .join('');

        const ready = rule.conditions.every((cond) => conditionMet(metrics[cond.metric], cond.operator, cond.threshold));

        return `
          <article class="trigger-card">
            <div class="trigger-card-head">
              <h4>${rule.label}</h4>
              <span class="status-pill ${ready ? 'status-good' : 'status-watch'}">${rule.detail}</span>
            </div>
            <p class="trigger-rule">Trigger: ${rule.conditions
              .map((cond) => `${METRIC_DEFS[cond.metric].label} ${formatThreshold(cond.metric, cond.operator, cond.threshold)}`)
              .join(' and ')}</p>
            <div class="trigger-conditions">${conditionRows}</div>
          </article>
        `;
      }).join('');

      return `
        <article class="trigger-column">
          <div class="trigger-column-head">
            <h3>${LOCATION_LABELS[loc]} Trigger Reference</h3>
            <p>Editable trigger targets using ${monthLabel} (${monthStatus}) and range context ${rangeLabel()}.</p>
          </div>
          ${cards}
        </article>
      `;
    })
    .join('');

  const calendarChips = PLAYBOOK_CALENDAR.map(
    (item) => `<div class="calendar-chip"><strong>${item.when}</strong><span>${item.action}</span></div>`
  ).join('');

  panel.innerHTML = `
    <div class="panel-head">
      <h2>Seasonal Playbook</h2>
      <p>Recommendations plus owner-tunable scale timing targets calibrated from historical EP/NL performance.</p>
    </div>

    <div class="playbook-toolbar">
      <div class="control-group">
        <label>Recommendation Season</label>
        <div class="segmented" id="playbookSeasonToggle">${seasonButtons}</div>
      </div>
      <div class="control-group">
        <label>Target Profile</label>
        <div class="segmented" id="playbookProfileToggle">${profileButtons}</div>
        <p class="control-help playbook-profile-help">${
          profileKey === 'custom'
            ? 'Custom profile is active from manual threshold edits.'
            : profileMeta.summary
        }</p>
      </div>
      <div class="playbook-actions">
        <button type="button" class="ghost-btn" data-action="reset-season-targets">Reset ${PLAYBOOK_SEASON_LABELS[season]} Targets</button>
        <button type="button" class="ghost-btn" data-action="reset-all-targets">Reset All Targets</button>
      </div>
    </div>
    <p class="playbook-save-note">Targets start from historical defaults (recalibrated Feb 20, 2026). Active profile: <strong>${profileMeta.label}</strong>. Adjust sliders/inputs to fit your business and staffing risk tolerance; changes save locally and flow into trigger analysis and Excel exports.</p>

    <div class="playbook-yoy">
      <strong>EP year-over-year sanity check</strong>
      <p>The selected model keeps the same directional pattern seen in prior benchmarks: strong weekend concentration and a spring/summer efficiency lift. Use this as a planning baseline and swap in direct monthly pulls as they become available.</p>
    </div>

    <div class="playbook-rec-grid">${recommendations}</div>

    <div class="playbook-trigger-grid">${triggerColumns}</div>

    <div class="playbook-calendar">
      <h3>Annual Scale Calendar</h3>
      <div class="calendar-chip-row">${calendarChips}</div>
      <p class="playbook-footnote">Scale-down rules in the report call for two straight weeks below threshold; this dashboard view uses current month-level data as a directional proxy.</p>
    </div>
  `;

  setActiveButton('playbookSeasonToggle', 'data-playbook-season', season);
  setActiveButton('playbookProfileToggle', 'data-playbook-profile', profileKey);
}

function renderNotes() {
  const panel = document.getElementById('notePanel');
  const notes = data.notes || [];
  const mgr = data.manager_assumptions;
  const sharedActive = isSharedManagerActive(state.plan, state.managerScenario);
  const shared = sharedManagerWeeklyImpact(state.plan, state.managerScenario, state.managerMgmtShare);
  const managerScenarioLine = sharedActive
    ? `Shared manager scenario is active for 7-day mode: ${Math.round(state.managerMgmtShare * 100)}% management time, ${NUM.format(
        shared.totalFloorHours
      )} floor hrs/week, ${USD2.format(shared.totalLabor)} net weekly labor across both stores.`
    : 'Shared manager scenario is off (current manager team baseline).';
  const dd = data.doordash_integration || null;
  const ddLine = dd
    ? dd.enabled
      ? `DoorDash overlay: ${dd.hourly_file} (${dd.rows_applied_to_base_dates} hourly rows applied, ${USD2.format(dd.net_applied_total)} net). Current totals mode: ${DOORDASH_MODE_LABELS[state.doordashMode]}.`
      : `DoorDash overlay missing: expected ${dd.hourly_file}.`
    : 'DoorDash overlay metadata unavailable.';

  panel.innerHTML = `
    <strong>Model Notes</strong>
    <ul>
      ${notes.map((n) => `<li>${n}</li>`).join('')}
      <li>Manager assumption: ${mgr.hourly_rate}/hr at ${mgr.weekly_hours} hrs/week.</li>
      <li>${managerScenarioLine}</li>
      <li>${ddLine}</li>
    </ul>
  `;
}

function renderAll() {
  const rangeSelect = document.getElementById('dateRangeSelect');
  if (rangeSelect) rangeSelect.value = state.dateRange;
  hydrateMonthSelect();
  hydrateMonthPicker();
  setActiveButton('doorDashModeToggle', 'data-doordash-mode', state.doordashMode);
  setActiveButton('historyMetricToggle', 'data-history-metric', state.historyMetric);
  setActiveButton('managerScenarioToggle', 'data-manager-scenario', state.managerScenario);
  const managerMgmtShareSelect = document.getElementById('managerMgmtShareSelect');
  if (managerMgmtShareSelect) managerMgmtShareSelect.value = String(Math.round(state.managerMgmtShare * 100));
  refreshAssumptionControlState();
  renderHeaderBadges();

  if (APP_PAGE === 'seasonal_playbook') {
    renderPlaybookPanel();
    return;
  }

  renderKpis();
  renderWeekdayChart();
  renderHourlyChart();
  renderTemplatePanel();
  renderMondayPanel();
  renderTeamPanel();
  renderAnnualPanel();
  renderHistoricalTrendPanel();
  renderInsightPanel();
  renderTimingPanel();
  renderScaleActionPanel();
  renderGuardrails();
  renderSurveyPanel();
  renderNotes();
}

function freezeTopRow(ws) {
  ws['!freeze'] = {
    xSplit: 0,
    ySplit: 1,
    topLeftCell: 'A2',
    activePane: 'bottomLeft',
    state: 'frozen',
  };
}

function applyColumnFormats(ws, headers, formatByHeader) {
  const ref = ws['!ref'];
  if (!ref) return;

  const range = XLSX.utils.decode_range(ref);
  headers.forEach((header, idx) => {
    const fmt = formatByHeader[header];
    if (!fmt) return;

    for (let rowIdx = 1; rowIdx <= range.e.r; rowIdx += 1) {
      const address = XLSX.utils.encode_cell({ r: rowIdx, c: idx });
      const cell = ws[address];
      if (!cell || typeof cell.v !== 'number') continue;
      cell.z = fmt;
    }
  });
}

function appendSheet(workbook, name, headers, rows, options = {}) {
  const wsRows = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsRows);

  if (options.colWidths) {
    ws['!cols'] = options.colWidths.map((w) => ({ wch: w }));
  }

  if (rows.length > 0) {
    ws['!autofilter'] = { ref: ws['!ref'] };
  }

  freezeTopRow(ws);

  if (options.formats) {
    applyColumnFormats(ws, headers, options.formats);
  }

  XLSX.utils.book_append_sheet(workbook, ws, name);
}

function estimateRunCosts() {
  const mini = {
    inputPerM: 0.25,
    cachedInputPerM: 0.025,
    outputPerM: 2.0,
  };

  const profiles = [
    { name: 'Small Narrative', input: 12000, cachedInput: 0, output: 3000 },
    { name: 'Medium Narrative', input: 40000, cachedInput: 10000, output: 8000 },
    { name: 'Large Narrative', input: 90000, cachedInput: 25000, output: 20000 },
  ];

  return profiles.map((row) => {
    const total =
      (row.input * mini.inputPerM + row.cachedInput * mini.cachedInputPerM + row.output * mini.outputPerM) / 1000000;

    return {
      ...row,
      estimatedCost: total,
    };
  });
}

function exportContext() {
  const locations = exportLocationCodes();
  const months = exportMonthKeys();
  const periodLabel =
    state.exportScope === 'full_period'
      ? `${data.month_labels[months[0]]} to ${data.month_labels[months[months.length - 1]]}`
      : `${data.month_labels[state.month]}`;

  return {
    generatedOn: new Date().toISOString(),
    locations,
    months,
    periodLabel,
    plan: state.plan,
    mondayScenario: state.mondayScenario,
    doordashMode: state.doordashMode,
    managerScenario: state.managerScenario,
    managerMgmtShare: state.managerMgmtShare,
    playbookTargetProfile: normalizeProfileKey(state.playbookTargetProfile),
    monthScope: state.exportScope,
    locationScope: state.exportLocations,
  };
}

function buildReadmeRows(ctx) {
  const manager = data.manager_assumptions || {};
  const notes = data.notes || [];

  const rows = [
    ['Export Name', 'Joyus Ice Cream Shop Operator Workbook'],
    ['Generated (UTC)', ctx.generatedOn],
    ['Plan Mode', ctx.plan === 'open_7_day' ? '7-Day Monday Open' : 'Current 6-Day'],
    ['Monday Scenario', MONDAY_LABELS[ctx.mondayScenario]],
    ['Daily Totals Basis', DOORDASH_MODE_LABELS[ctx.doordashMode] || ctx.doordashMode],
    ['Manager Scenario', MANAGER_SCENARIO_LABELS[ctx.managerScenario] || ctx.managerScenario],
    ['Manager Mgmt Time', `${Math.round((ctx.managerMgmtShare || 0) * 100)}%`],
    ['Playbook Target Profile', PLAYBOOK_TARGET_PROFILES[ctx.playbookTargetProfile]?.label || ctx.playbookTargetProfile],
    ['Month Scope', ctx.monthScope],
    ['Location Scope', ctx.locationScope],
    ['Included Locations', ctx.locations.map((loc) => LOCATION_LABELS[loc] || loc).join(', ')],
    ['Included Months', ctx.months.map((m) => data.month_labels[m]).join(', ')],
    ['Manager Assumption', `${manager.hourly_rate || 28}/hr at ${manager.weekly_hours || 40} hrs/week`],
    ['Workbook Style', 'Values-first, operator-oriented, no required formulas'],
    ['Daily Raw Grain', 'Weekday-average reconstructed rows by month/location'],
  ];

  notes.forEach((note, idx) => {
    rows.push([`Model Note ${idx + 1}`, note]);
  });

  return rows;
}

function buildKpiSummaryRows(ctx) {
  const rows = [];

  ctx.locations.forEach((loc) => {
    let locRevenue = 0;
    let locLabor = 0;
    let locGp = 0;
    let locManagerAddedLabor = 0;

    ctx.months.forEach((monthKey) => {
      const metrics = weeklyMetricsForLocationAtMonth(
        loc,
        monthKey,
        ctx.plan,
        ctx.mondayScenario,
        ctx.managerScenario,
        ctx.managerMgmtShare,
        ctx.doordashMode
      );
      const operatingDays = ctx.plan === 'open_7_day' ? 7 : 6;

      rows.push([
        LOCATION_LABELS[loc] || loc,
        data.month_labels[monthKey],
        data.month_status[monthKey],
        ctx.plan,
        operatingDays,
        metrics.revenue,
        metrics.labor,
        metrics.gp72,
        metrics.laborPct / 100,
        metrics.mondayRevenue,
        metrics.mondayLabor,
        metrics.managerAddedLabor || 0,
      ]);

      locRevenue += metrics.revenue;
      locLabor += metrics.labor;
      locGp += metrics.gp72;
      locManagerAddedLabor += metrics.managerAddedLabor || 0;
    });

    rows.push([
      LOCATION_LABELS[loc] || loc,
      'TOTAL',
      '-',
      ctx.plan,
      '-',
      locRevenue,
      locLabor,
      locGp,
      locRevenue > 0 ? locLabor / locRevenue : 0,
      '',
      '',
      locManagerAddedLabor,
    ]);
  });

  return rows;
}

function buildStaffingPlanRows(ctx) {
  const rows = [];
  const manager = data.manager_assumptions || {};

  rows.push([
    'All',
    'Manager Rule',
    'Manager',
    `${manager.hourly_rate || 28}/hr`,
    `${manager.weekly_hours || 40} hrs/week`,
    manager.notes || 'Manager hours fixed for planning consistency.',
  ]);
  rows.push(['All', 'Coverage Rule', 'Opening', '1 person allowed', '', 'Allowed when prep load is manageable.']);
  rows.push(['All', 'Coverage Rule', 'Closing', '2 people required', '', 'At least one Lead or Manager at close.']);

  if (ctx.plan === 'current_6_day') {
    ctx.locations.forEach((loc) => {
      const template = data.plan_templates.current_6_day[loc === 'EP' ? 'ep' : 'nl'] || {};
      Object.entries(template).forEach(([block, bullets]) => {
        bullets.forEach((bullet) => {
          rows.push([LOCATION_LABELS[loc] || loc, 'Template', block, '', '', bullet]);
        });
      });
    });
  } else {
    const template = data.plan_templates.open_7_day || {};
    const map = [
      ['Winter Monday', template.winter_monday || []],
      ['Spring/Fall Monday', template.spring_fall_monday || []],
      ['Summer Monday', template.summer_monday || []],
    ];

    if (ctx.managerScenario === 'add_shared_manager') {
      const shared = sharedManagerWeeklyImpact(ctx.plan, ctx.managerScenario, ctx.managerMgmtShare);
      rows.push([
        'All',
        'Manager Scenario',
        'Shared Manager',
        `${manager.hourly_rate || 28}/hr`,
        `${manager.weekly_hours || 40} hrs/week`,
        `Cross-store manager with ${Math.round(ctx.managerMgmtShare * 100)}% management time and ${Math.round(
          (1 - ctx.managerMgmtShare) * 100
        )}% floor coverage.`,
      ]);
      rows.push([
        'All',
        'Manager Scenario',
        'Shared Manager Split',
        `${NUM.format(shared.totalFloorHours)} floor hrs/week`,
        `${NUM.format(shared.totalMgmtHours)} mgmt hrs/week`,
        `Net added labor: ${USD2.format(shared.totalLabor)} per week across both stores (after replacing floor labor at ${USD2.format(
          MANAGER_REPLACEMENT_RATE
        )}/hr).`,
      ]);
    }

    ctx.locations.forEach((loc) => {
      map.forEach(([block, bullets]) => {
        bullets.forEach((bullet) => {
          rows.push([LOCATION_LABELS[loc] || loc, 'Template', block, '', '', bullet]);
        });
      });
    });
  }

  return rows;
}

function buildDaypartRows(ctx) {
  const rows = [];

  ctx.locations.forEach((loc) => {
    ctx.months.forEach((monthKey) => {
      const hourly = filterToStandardStoreHours((data.hourly_profile[loc][monthKey] || []).slice()).sort(
        (a, b) => a.hour - b.hour
      );
      hourly.forEach((row) => {
        const avgRevenue = revenueWithMode(row.avg_revenue, row.avg_doordash_net || 0, ctx.doordashMode);
        const avgGp72 = avgRevenue * 0.72 - row.avg_labor;
        rows.push([
          LOCATION_LABELS[loc] || loc,
          data.month_labels[monthKey],
          hourLabel(row.hour),
          row.hour,
          avgRevenue,
          row.avg_labor,
          avgGp72,
          avgRevenue > 0 ? row.avg_labor / avgRevenue : 0,
          row.avg_doordash_net || 0,
        ]);
      });
    });
  });

  return rows;
}

function buildTriggerRows(ctx) {
  const rows = [];

  ctx.locations.forEach((loc) => {
    ctx.months.forEach((monthKey) => {
      const metrics = monthMetricsForLocation(loc, monthKey);
      PLAYBOOK_TRANSITION_ORDER.forEach((ruleKey) => {
        const rule = state.triggerRules[loc][ruleKey];
        rule.conditions.forEach((cond) => {
          const current = metrics[cond.metric];
          rows.push([
            LOCATION_LABELS[loc] || loc,
            data.month_labels[monthKey],
            `${rule.label} (${rule.detail})`,
            METRIC_DEFS[cond.metric].label,
            cond.operator,
            cond.threshold,
            current,
            conditionMet(current, cond.operator, cond.threshold) ? 'YES' : 'NO',
          ]);
        });
      });
    });
  });

  return rows;
}

function buildDailyRawRows(ctx) {
  const rows = [];

  ctx.locations.forEach((loc) => {
    ctx.months.forEach((monthKey) => {
      const weekday = data.weekday_profile[loc][monthKey];
      WEEKDAYS.forEach((day) => {
        const profile = weekday[day];
        const dayCount = profile.days || 0;
        const avgRevenue = revenueWithMode(profile.avg_revenue, profile.avg_doordash_net || 0, ctx.doordashMode);
        const avgGp72 = avgRevenue * 0.72 - profile.avg_labor;

        rows.push([
          LOCATION_LABELS[loc] || loc,
          data.month_labels[monthKey],
          day,
          dayCount,
          avgRevenue,
          profile.avg_labor,
          avgGp72,
          avgRevenue > 0 ? profile.avg_labor / avgRevenue : 0,
          profile.avg_doordash_net || 0,
          avgRevenue * dayCount,
          profile.avg_labor * dayCount,
          avgGp72 * dayCount,
        ]);
      });
    });
  });

  return rows;
}

function buildLocationBenchmarkRows(ctx) {
  const rows = [];

  ctx.locations.forEach((loc) => {
    let revenue = 0;
    let labor = 0;
    let gp = 0;
    let operatingDays = 0;
    let mondayRevenue = 0;
    let mondayLabor = 0;
    let managerAddedLabor = 0;

    ctx.months.forEach((monthKey) => {
      const metrics = weeklyMetricsForLocationAtMonth(
        loc,
        monthKey,
        ctx.plan,
        ctx.mondayScenario,
        ctx.managerScenario,
        ctx.managerMgmtShare,
        ctx.doordashMode
      );
      const calendar = data.calendar[monthKey];

      revenue += metrics.revenue;
      labor += metrics.labor;
      gp += metrics.gp72;
      mondayRevenue += metrics.mondayRevenue;
      mondayLabor += metrics.mondayLabor;
      managerAddedLabor += metrics.managerAddedLabor || 0;
      operatingDays += ctx.plan === 'open_7_day' ? calendar.operating_days_6 + calendar.mondays : calendar.operating_days_6;
    });

    rows.push([
      LOCATION_LABELS[loc] || loc,
      ctx.periodLabel,
      revenue,
      labor,
      gp,
      revenue > 0 ? labor / revenue : 0,
      operatingDays,
      operatingDays > 0 ? revenue / operatingDays : 0,
      mondayRevenue,
      mondayLabor,
      managerAddedLabor,
    ]);
  });

  rows.sort((a, b) => Number(b[2]) - Number(a[2]));
  return rows.map((row, idx) => [idx + 1, ...row]);
}

function buildRunCostRows(ctx) {
  const estimates = estimateRunCosts();
  const modelRows = estimates.map((row) => [
    'GPT-5 mini',
    row.name,
    row.input,
    row.cachedInput,
    row.output,
    row.estimatedCost,
    'Optional narrative layer',
  ]);

  const deterministicRow = ['Deterministic', 'No LLM', 0, 0, 0, 0, 'Core planning engine'];

  return [
    [ctx.plan, `Scope: ${ctx.monthScope}`, `Locations: ${ctx.locationScope}`, '', '', '', ''],
    deterministicRow,
    ...modelRows,
  ];
}

function exportFileName(ctx) {
  const locPart = ctx.locations.length > 1 ? 'all-locations' : ctx.locations[0].toLowerCase();
  const periodPart = ctx.monthScope === 'full_period' ? 'full-period' : ctx.months[0];
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  return `joyus-fast-casual-operator-${locPart}-${periodPart}-${stamp}.xlsx`;
}

function exportWorkbookToExcel() {
  if (typeof XLSX === 'undefined') {
    throw new Error('Excel library is unavailable. Please reload and try again.');
  }

  const ctx = exportContext();
  const workbook = XLSX.utils.book_new();

  appendSheet(
    workbook,
    'README',
    ['Field', 'Value'],
    buildReadmeRows(ctx),
    { colWidths: [26, 120] }
  );

  appendSheet(
    workbook,
    'KPI_Summary',
    [
      'location',
      'month',
      'month_status',
      'plan',
      'operating_days',
      'weekly_revenue',
      'weekly_labor',
      'weekly_gp_72',
      'weekly_labor_pct',
      'monday_revenue',
      'monday_labor',
      'manager_added_labor',
    ],
    buildKpiSummaryRows(ctx),
    {
      colWidths: [22, 14, 14, 16, 14, 16, 16, 16, 14, 16, 16, 18],
      formats: {
        weekly_revenue: '"$"#,##0.00',
        weekly_labor: '"$"#,##0.00',
        weekly_gp_72: '"$"#,##0.00',
        weekly_labor_pct: '0.00%',
        monday_revenue: '"$"#,##0.00',
        monday_labor: '"$"#,##0.00',
        manager_added_labor: '"$"#,##0.00',
      },
    }
  );

  appendSheet(
    workbook,
    'Staffing_Plan',
    ['location', 'category', 'block', 'rate_or_value', 'hours_or_limit', 'detail'],
    buildStaffingPlanRows(ctx),
    { colWidths: [22, 16, 24, 18, 20, 70] }
  );

  appendSheet(
    workbook,
    'Daypart_Hourly',
    ['location', 'month', 'hour_label', 'hour_24', 'avg_revenue', 'avg_labor', 'avg_gp_72', 'labor_pct', 'avg_doordash_net'],
    buildDaypartRows(ctx),
    {
      colWidths: [22, 14, 12, 8, 14, 14, 14, 12, 16],
      formats: {
        avg_revenue: '"$"#,##0.00',
        avg_labor: '"$"#,##0.00',
        avg_gp_72: '"$"#,##0.00',
        labor_pct: '0.00%',
        avg_doordash_net: '"$"#,##0.00',
      },
    }
  );

  appendSheet(
    workbook,
    'Seasonal_Triggers',
    ['location', 'month', 'transition', 'metric', 'operator', 'threshold', 'current_value', 'met'],
    buildTriggerRows(ctx),
    { colWidths: [22, 14, 34, 26, 10, 12, 14, 8] }
  );

  appendSheet(
    workbook,
    'Daily_Raw',
    [
      'location',
      'month',
      'weekday',
      'days_in_month_for_weekday',
      'avg_revenue',
      'avg_labor',
      'avg_gp_72',
      'labor_pct',
      'avg_doordash_net',
      'est_revenue_for_weekday',
      'est_labor_for_weekday',
      'est_gp_for_weekday',
    ],
    buildDailyRawRows(ctx),
    {
      colWidths: [22, 14, 12, 20, 14, 14, 14, 12, 16, 20, 18, 18],
      formats: {
        avg_revenue: '"$"#,##0.00',
        avg_labor: '"$"#,##0.00',
        avg_gp_72: '"$"#,##0.00',
        labor_pct: '0.00%',
        avg_doordash_net: '"$"#,##0.00',
        est_revenue_for_weekday: '"$"#,##0.00',
        est_labor_for_weekday: '"$"#,##0.00',
        est_gp_for_weekday: '"$"#,##0.00',
      },
    }
  );

  if (ctx.locations.length > 1) {
    appendSheet(
      workbook,
      'Location_Benchmark',
      [
        'rank',
        'location',
        'period',
        'revenue',
        'labor',
        'gp_72',
        'labor_pct',
        'operating_days',
        'revenue_per_operating_day',
        'monday_revenue',
        'monday_labor',
        'manager_added_labor',
      ],
      buildLocationBenchmarkRows(ctx),
      {
        colWidths: [8, 22, 24, 14, 14, 14, 12, 14, 22, 14, 14, 18],
        formats: {
          revenue: '"$"#,##0.00',
          labor: '"$"#,##0.00',
          gp_72: '"$"#,##0.00',
          labor_pct: '0.00%',
          revenue_per_operating_day: '"$"#,##0.00',
          monday_revenue: '"$"#,##0.00',
          monday_labor: '"$"#,##0.00',
          manager_added_labor: '"$"#,##0.00',
        },
      }
    );
  }

  appendSheet(
    workbook,
    'Run_Costs',
    ['model', 'profile', 'input_tokens', 'cached_input_tokens', 'output_tokens', 'estimated_cost_usd', 'notes'],
    buildRunCostRows(ctx),
    {
      colWidths: [16, 20, 14, 20, 14, 18, 42],
      formats: {
        estimated_cost_usd: '"$"#,##0.0000',
      },
    }
  );

  XLSX.writeFile(workbook, exportFileName(ctx));
}

function hydrateExportControls() {
  const scopeSelect = document.getElementById('exportScopeSelect');
  const locationSelect = document.getElementById('exportLocationsSelect');
  if (scopeSelect) scopeSelect.value = state.exportScope;
  if (locationSelect) locationSelect.value = state.exportLocations;
}

function refreshAssumptionControlState() {
  const doordashGroup = document.getElementById('doordashModeGroup');
  if (doordashGroup) {
    const ddEnabled = Boolean(data?.doordash_integration?.enabled);
    doordashGroup.style.opacity = ddEnabled ? '1' : '0.55';
    doordashGroup.querySelectorAll('[data-doordash-mode]').forEach((btn) => {
      btn.disabled = !ddEnabled;
    });
    if (!ddEnabled) state.doordashMode = 'include';
  }

  const mondayGroup = document.getElementById('mondayAssumptionGroup');
  if (mondayGroup) {
    const mondayEnabled = state.plan === 'open_7_day';
    mondayGroup.style.opacity = mondayEnabled ? '1' : '0.55';
  }

  const managerScenarioGroup = document.getElementById('managerScenarioGroup');
  if (managerScenarioGroup) {
    const managerEnabled = state.plan === 'open_7_day';
    managerScenarioGroup.style.opacity = managerEnabled ? '1' : '0.55';
    managerScenarioGroup.querySelectorAll('[data-manager-scenario]').forEach((btn) => {
      btn.disabled = !managerEnabled;
    });
  }

  const managerMgmtGroup = document.getElementById('managerMgmtShareGroup');
  const managerMgmtSelect = document.getElementById('managerMgmtShareSelect');
  if (managerMgmtGroup && managerMgmtSelect) {
    const mgmtEnabled = isSharedManagerActive(state.plan, state.managerScenario);
    managerMgmtGroup.style.opacity = mgmtEnabled ? '1' : '0.55';
    managerMgmtSelect.disabled = !mgmtEnabled;
  }

  const monthPicker = document.getElementById('monthPicker');
  const monthPrevBtn = document.getElementById('monthPrevBtn');
  const monthNextBtn = document.getElementById('monthNextBtn');
  const monthMode = normalizeDateRange(state.dateRange) === 'single_month';
  const months = analysisMonthKeys();
  const selected = normalizeAnalysisMonth(state.month, months);
  const selectedIdx = months.indexOf(selected);

  if (monthPicker) monthPicker.disabled = !monthMode;
  if (monthPrevBtn) monthPrevBtn.disabled = !monthMode || selectedIdx <= 0;
  if (monthNextBtn) monthNextBtn.disabled = !monthMode || selectedIdx < 0 || selectedIdx >= months.length - 1;
}

function bindControls() {
  const doorDashModeToggle = document.getElementById('doorDashModeToggle');
  if (doorDashModeToggle) {
    doorDashModeToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-doordash-mode]');
      if (!btn || !data?.doordash_integration?.enabled) return;
      state.doordashMode = btn.dataset.doordashMode;
      setActiveButton('doorDashModeToggle', 'data-doordash-mode', state.doordashMode);
      renderAll();
    });
  }

  const planToggle = document.getElementById('planToggle');
  if (planToggle) {
    planToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-plan]');
      if (!btn) return;
      state.plan = btn.dataset.plan;
      setActiveButton('planToggle', 'data-plan', state.plan);
      refreshAssumptionControlState();
      renderAll();
    });
  }

  const locationToggle = document.getElementById('locationToggle');
  if (locationToggle) {
    locationToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-location]');
      if (!btn) return;
      state.location = btn.dataset.location;
      applyRangeAnchorMonth();
      setActiveButton('locationToggle', 'data-location', state.location);
      renderAll();
    });
  }

  const mondayToggle = document.getElementById('mondayToggle');
  if (mondayToggle) {
    mondayToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-monday]');
      if (!btn) return;
      state.mondayScenario = btn.dataset.monday;
      setActiveButton('mondayToggle', 'data-monday', state.mondayScenario);
      renderAll();
    });
  }

  const managerScenarioToggle = document.getElementById('managerScenarioToggle');
  if (managerScenarioToggle) {
    managerScenarioToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-manager-scenario]');
      if (!btn || state.plan !== 'open_7_day') return;
      state.managerScenario = btn.dataset.managerScenario;
      setActiveButton('managerScenarioToggle', 'data-manager-scenario', state.managerScenario);
      refreshAssumptionControlState();
      renderAll();
    });
  }

  const managerMgmtShareSelect = document.getElementById('managerMgmtShareSelect');
  if (managerMgmtShareSelect) {
    managerMgmtShareSelect.addEventListener('change', (e) => {
      const value = Number(e.target.value);
      if (!Number.isFinite(value)) return;
      state.managerMgmtShare = clamp(value / 100, MANAGER_MGMT_MIN, MANAGER_MGMT_MAX);
      renderAll();
    });
  }

  const dateRangeSelect = document.getElementById('dateRangeSelect');
  if (dateRangeSelect) {
    dateRangeSelect.addEventListener('change', (e) => {
      state.dateRange = normalizeDateRange(e.target.value);
      applyRangeAnchorMonth();
      renderAll();
    });
  }

  const monthSelect = document.getElementById('monthSelect');
  if (monthSelect) {
    monthSelect.addEventListener('change', (e) => {
      state.month = normalizeAnalysisMonth(e.target.value);
      state.dateRange = 'single_month';
      applyRangeAnchorMonth();
      renderAll();
    });
  }

  const monthPicker = document.getElementById('monthPicker');
  if (monthPicker) {
    monthPicker.addEventListener('change', (e) => {
      const value = String(e.target.value || '').trim();
      if (!/^\d{4}-\d{2}$/.test(value)) return;
      state.month = normalizeAnalysisMonth(value);
      state.dateRange = 'single_month';
      applyRangeAnchorMonth();
      renderAll();
    });
  }

  const monthPrevBtn = document.getElementById('monthPrevBtn');
  if (monthPrevBtn) {
    monthPrevBtn.addEventListener('click', () => {
      const months = analysisMonthKeys();
      const current = normalizeAnalysisMonth(state.month, months);
      const idx = months.indexOf(current);
      if (idx <= 0) return;
      state.month = months[idx - 1];
      state.dateRange = 'single_month';
      applyRangeAnchorMonth();
      renderAll();
    });
  }

  const monthNextBtn = document.getElementById('monthNextBtn');
  if (monthNextBtn) {
    monthNextBtn.addEventListener('click', () => {
      const months = analysisMonthKeys();
      const current = normalizeAnalysisMonth(state.month, months);
      const idx = months.indexOf(current);
      if (idx < 0 || idx >= months.length - 1) return;
      state.month = months[idx + 1];
      state.dateRange = 'single_month';
      applyRangeAnchorMonth();
      renderAll();
    });
  }

  const historyMetricToggle = document.getElementById('historyMetricToggle');
  if (historyMetricToggle) {
    historyMetricToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-history-metric]');
      if (!btn) return;
      state.historyMetric = btn.dataset.historyMetric;
      setActiveButton('historyMetricToggle', 'data-history-metric', state.historyMetric);
      renderHistoricalTrendPanel();
    });
  }

  const playbookPanel = document.getElementById('playbookPanel');
  if (playbookPanel) {
    playbookPanel.addEventListener('click', (e) => {
      const seasonBtn = e.target.closest('[data-playbook-season]');
      if (seasonBtn) {
        state.playbookSeason = seasonBtn.dataset.playbookSeason;
        renderPlaybookPanel();
        return;
      }

      const profileBtn = e.target.closest('[data-playbook-profile]');
      if (profileBtn) {
        applyTriggerProfile(profileBtn.dataset.playbookProfile);
        return;
      }

      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;

      if (actionBtn.dataset.action === 'reset-all-targets') {
        resetAllTriggerThresholds();
        return;
      }

      if (actionBtn.dataset.action === 'reset-season-targets') {
        resetSeasonTriggerThresholds(state.playbookSeason || seasonFromMonth(state.month));
      }
    });

    playbookPanel.addEventListener('change', (e) => {
      const input = e.target.closest('[data-action="set-trigger-threshold"]');
      if (!input) return;

      const loc = input.dataset.loc;
      const ruleKey = input.dataset.rule;
      const condIdx = Number(input.dataset.condIndex);
      if (!['EP', 'NL'].includes(loc) || !PLAYBOOK_TRANSITION_ORDER.includes(ruleKey) || !Number.isInteger(condIdx)) return;

      setTriggerThreshold(loc, ruleKey, condIdx, input.value);
    });
  }

  const exportScopeSelect = document.getElementById('exportScopeSelect');
  if (exportScopeSelect) {
    exportScopeSelect.addEventListener('change', (e) => {
      state.exportScope = e.target.value;
    });
  }

  const exportLocationsSelect = document.getElementById('exportLocationsSelect');
  if (exportLocationsSelect) {
    exportLocationsSelect.addEventListener('change', (e) => {
      state.exportLocations = e.target.value;
    });
  }

  const exportExcelBtn = document.getElementById('exportExcelBtn');
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', () => {
      const btn = document.getElementById('exportExcelBtn');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Building workbook...';

      try {
        exportWorkbookToExcel();
      } catch (err) {
        console.error('Excel export failed', err);
        window.alert(`Excel export failed: ${String(err)}`);
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }
}

function hydrateRangeSelect() {
  const select = document.getElementById('dateRangeSelect');
  if (select) select.value = normalizeDateRange(state.dateRange);
}

function hydrateMonthSelect() {
  const select = document.getElementById('monthSelect');
  if (!select) return;

  const months = analysisMonthKeys();
  const selected = normalizeAnalysisMonth(state.month, months);
  const currentOptions = Array.from(select.options || []).map((opt) => opt.value).join('|');
  const nextOptions = months
    .slice()
    .reverse()
    .map((monthKey) => monthKey)
    .join('|');

  if (currentOptions !== nextOptions) {
    select.innerHTML = months
      .slice()
      .reverse()
      .map((monthKey) => `<option value="${monthKey}">${data.month_labels[monthKey] || monthKey}</option>`)
      .join('');
  }

  if (selected) select.value = selected;

  const monthGroup = document.getElementById('monthSelectGroup');
  const monthMode = normalizeDateRange(state.dateRange) === 'single_month';
  select.disabled = !monthMode;
  if (monthGroup) monthGroup.style.opacity = monthMode ? '1' : '0.55';
}

function hydrateMonthPicker() {
  const input = document.getElementById('monthPicker');
  if (!input) return;
  const selected = normalizeAnalysisMonth(state.month);
  if (selected) input.value = selected;
}

async function init() {
  const res = await fetch('data.json');
  data = await res.json();
  state.playbookTargetProfile = loadPlaybookTargetProfile();
  let hasStoredTriggerRules = false;
  try {
    hasStoredTriggerRules = Boolean(localStorage.getItem(PLAYBOOK_TRIGGER_STORAGE_KEY));
  } catch (_err) {
    hasStoredTriggerRules = false;
  }
  state.triggerRules = loadTriggerRulesFromStorage();
  if (!hasStoredTriggerRules && state.playbookTargetProfile !== 'balanced' && state.playbookTargetProfile !== 'custom') {
    state.triggerRules = buildTriggerRulesForProfile(state.playbookTargetProfile);
  }
  if (!hasStoredTriggerRules && state.playbookTargetProfile === 'custom') {
    state.playbookTargetProfile = 'balanced';
  }
  state.dateRange = normalizeDateRange(state.dateRange);

  state.month = normalizeAnalysisMonth(latestMonthKey(), analysisMonthKeys());
  applyRangeAnchorMonth();

  hydrateRangeSelect();
  hydrateMonthSelect();
  hydrateExportControls();
  bindControls();

  setActiveButton('planToggle', 'data-plan', state.plan);
  setActiveButton('locationToggle', 'data-location', state.location);
  setActiveButton('mondayToggle', 'data-monday', state.mondayScenario);
  setActiveButton('doorDashModeToggle', 'data-doordash-mode', state.doordashMode);
  setActiveButton('managerScenarioToggle', 'data-manager-scenario', state.managerScenario);
  setActiveButton('historyMetricToggle', 'data-history-metric', state.historyMetric);
  const managerMgmtShareSelect = document.getElementById('managerMgmtShareSelect');
  if (managerMgmtShareSelect) managerMgmtShareSelect.value = String(Math.round(state.managerMgmtShare * 100));
  refreshAssumptionControlState();

  renderAll();
}

init().catch((err) => {
  console.error('Dashboard failed to load', err);
  document.body.innerHTML = `<main class="shell"><section class="panel" style="padding:1rem;"><h2>Dashboard failed to load</h2><p>${String(err)}</p></section></main>`;
});
