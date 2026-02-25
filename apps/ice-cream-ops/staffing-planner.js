'use strict';

const AUTH_PASSWORD = 'mj2026';
const AUTH_STORAGE_KEY = 'milk_jawn_dashboard_auth_v1';
const STORAGE_KEY = 'mj_staffing_planner_state_v1';

const PLANNER_DAY_DEFS = [
  { weekday: 'Mon', offset: 0 },
  { weekday: 'Tue', offset: 1 },
  { weekday: 'Wed', offset: 2 },
  { weekday: 'Thu', offset: 3 },
  { weekday: 'Fri', offset: 4 },
  { weekday: 'Sat', offset: 5 },
  { weekday: 'Sun', offset: 6 },
];

const LOCATION_LABELS = {
  EP: 'East Passyunk',
  NL: 'Northern Liberties',
};

const SQUARE_LOCATION_IDS = {
  EP: 'LYPJTCTZKM211',
  NL: 'LDBQAYTKVHZAT',
};

const SEASON_LABELS = {
  winter: 'Winter',
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
};

const LOCATION_WEATHER_COORDS = {
  EP: { lat: 39.9332, lon: -75.1648 },
  NL: { lat: 39.9671, lon: -75.1355 },
};

const WEATHER_TIMEZONE = 'America/New_York';
const NORMALS_YEARS_BACK = 6;
const MAX_HIGHLIGHTS_WEEKS = 4;
const DEFAULT_HIGHLIGHTS_WEEKS = 2;
const RECENT_WINDOW_DAYS = MAX_HIGHLIGHTS_WEEKS * 7;
const WEATHER_FORECAST_DAYS = 16;
const TARGET_LABOR_PCT = 24;
const PTO_SYNC_ENDPOINT = '/api/v1/integrations/square/pto';
const REPEAT_ASSIGNMENT_WEEKS = 12;
const DEFAULT_SEASON_HOURS = {
  winterOpen: '12:00',
  winterClose: '22:00',
  springOpen: '12:00',
  springClose: '22:00',
  summerOpen: '12:00',
  summerClose: '23:00',
  fallOpen: '12:00',
  fallClose: '22:00',
};

const DEFAULT_OPERATIONS_SETTINGS = {
  managerPayRate: 28,
  managerWeeklyHours: 40,
  keyLeadPayRate: 17,
  scooperPayRate: 15,
  targetProfile: {
    laborTargetPct: 24,
    laborWatchPct: 27,
    profitFloorPct: 11,
    profitBasePct: 15,
    profitStretchPct: 17,
  },
  workflow: {
    minOpeners: 1,
    minClosers: 2,
    requirePolicyApproval: true,
    requireGMApproval: true,
  },
  openingSchedule: {
    springUpDate: '2026-03-01',
    summerUpDate: '2026-05-15',
    fallDownDate: '2026-09-08',
    winterDownDate: '2026-11-01',
  },
  seasonHours: {
    ...DEFAULT_SEASON_HOURS,
  },
};

const TEMPLATE_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_BUSINESS_WEEKLY_TEMPLATE = {
  Mon: [
    { start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1 },
    { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
    { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
  ],
  Tue: [
    { start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1 },
    { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
    { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
  ],
  Wed: [
    { start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1 },
    { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
    { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
  ],
  Thu: [
    { start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1 },
    { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
    { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
  ],
  Fri: [
    { start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1 },
    { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
    { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
    { start: '19:00', end: '23:00', role: 'Late Peak PT', headcount: 1 },
  ],
  Sat: [
    { start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1 },
    { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
    { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
    { start: '19:00', end: '23:00', role: 'Late Peak PT', headcount: 1 },
  ],
  Sun: [
    { start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1 },
    { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
    { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
    { start: '19:00', end: '23:00', role: 'Late Peak PT', headcount: 1 },
  ],
};

const LOCATION_WEEKLY_TEMPLATE_OVERRIDES = {
  EP: {
    Mon: [
      { start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '17:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
      { start: '18:00', end: '23:00', role: 'Peak Scooper PT', headcount: 1 },
    ],
    Tue: [
      { start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '17:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
      { start: '18:00', end: '23:00', role: 'Peak Scooper PT', headcount: 1 },
    ],
    Wed: [
      { start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1 },
      { start: '12:00', end: '18:00', role: 'Mid Scooper', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '17:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
      { start: '19:00', end: '23:00', role: 'Late Peak PT', headcount: 1 },
    ],
    Thu: [
      { start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1 },
      { start: '12:00', end: '17:00', role: 'Mid Scooper', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
      { start: '18:00', end: '23:00', role: 'Peak Scooper PT', headcount: 1 },
      { start: '19:00', end: '23:00', role: 'Late Peak PT', headcount: 1 },
    ],
    Fri: [
      { start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1 },
      { start: '12:00', end: '18:00', role: 'Mid Scooper', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
      { start: '18:00', end: '23:00', role: 'Peak Scooper PT', headcount: 1 },
      { start: '19:00', end: '23:00', role: 'Late Peak PT', headcount: 1 },
    ],
    Sat: [
      { start: '11:00', end: '18:00', role: 'Opener Lead', headcount: 1 },
      { start: '12:00', end: '18:00', role: 'Mid Scooper', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
      { start: '17:00', end: '23:00', role: 'Peak Scooper PT', headcount: 1 },
      { start: '19:00', end: '23:00', role: 'Late Peak PT', headcount: 1 },
    ],
    Sun: [
      { start: '11:00', end: '18:00', role: 'Opener Lead', headcount: 1 },
      { start: '12:00', end: '18:00', role: 'Mid Scooper', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
      { start: '17:00', end: '23:00', role: 'Peak Scooper PT', headcount: 1 },
      { start: '19:00', end: '23:00', role: 'Late Peak PT', headcount: 1 },
    ],
  },
  NL: {
    Mon: [
      { start: '12:00', end: '16:00', role: 'Opener Scooper', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
    ],
    Tue: [
      { start: '12:00', end: '16:00', role: 'Opener Scooper', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
    ],
    Wed: [
      { start: '12:00', end: '16:00', role: 'Opener Scooper', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '17:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
    ],
    Thu: [
      { start: '12:00', end: '16:00', role: 'Opener Scooper', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
    ],
    Fri: [
      { start: '12:00', end: '16:00', role: 'Opener Scooper', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
      { start: '19:00', end: '23:00', role: 'Late Peak PT', headcount: 1 },
    ],
    Sat: [
      { start: '12:00', end: '16:00', role: 'Opener Scooper', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
      { start: '19:00', end: '23:00', role: 'Late Peak PT', headcount: 1 },
    ],
    Sun: [
      { start: '12:00', end: '16:00', role: 'Opener Scooper', headcount: 1 },
      { start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1 },
      { start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1 },
      { start: '19:00', end: '23:00', role: 'Late Peak PT', headcount: 1 },
    ],
  },
};

const RECOMMENDED_OPENING_DATES = {
  springUpDate: '2026-03-01',
  summerUpDate: '2026-05-15',
  fallDownDate: '2026-09-08',
  winterDownDate: '2026-11-01',
};

const SQUARE_LOCATION_TO_CODE = Object.fromEntries(Object.entries(SQUARE_LOCATION_IDS).map(([code, id]) => [String(id), code]));

const state = {
  topMenu: 'shift_planner',
  location: 'EP',
  horizonWeeks: 2,
  startDate: '',
  weeks: [],
  plannerPage: 'weekly_plan',
  approvalsSubtab: 'next_week',
  complianceSubtab: 'operations',
  highlightsLookbackWeeks: DEFAULT_HIGHLIGHTS_WEEKS,
  highlightsCompareMode: 'actual_vs_baseline',
  highlightsStoreScope: 'BOTH',
  recentAnalysisNotes: {},
  recentAnalysisDraftNotes: {},
  ptoRequests: [],
  ptoSync: {
    source: 'square',
    status: 'not_connected',
    lastAttemptAt: null,
    lastSuccessAt: null,
    lastError: null,
  },
  requests: [],
  nextWeekApproval: {
    status: 'draft',
    submittedAt: null,
    reviewedAt: null,
    reviewer: 'General Manager',
  },
  settings: JSON.parse(JSON.stringify(DEFAULT_OPERATIONS_SETTINGS)),
};

function normalizeTopMenu(value) {
  return value === 'shift_analysis' || value === 'settings' || value === 'shift_planner' ? value : 'shift_planner';
}

function topMenuFromHash(hash) {
  const key = String(hash || '')
    .replace(/^#/, '')
    .trim()
    .toLowerCase();
  if (key === 'shift_planner' || key === 'shift_analysis' || key === 'settings') return key;
  return null;
}

function syncHashToTopMenu() {
  const desired = `#${normalizeTopMenu(state.topMenu)}`;
  if (window.location.hash !== desired) {
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}${desired}`);
  }
}

function applyTopMenuFromHash() {
  const next = topMenuFromHash(window.location.hash);
  if (!next) return false;
  state.topMenu = next;
  if (next === 'shift_planner') {
    state.plannerPage = normalizePlannerPage(state.plannerPage);
  }
  return true;
}

function normalizePlannerPage(value) {
  return value === 'approvals' || value === 'weekly_plan' ? value : 'weekly_plan';
}

function normalizeComplianceSubtab(value) {
  return value === 'setup' || value === 'youth' || value === 'feeds' || value === 'operations' || value === 'overview' ? value : 'operations';
}

function plannerLocationCodes() {
  const seed = new Set(Object.keys(LOCATION_LABELS));
  const employeeLocations = Object.keys(sourceData?.employees || {});
  employeeLocations.forEach((code) => {
    if (code) seed.add(code);
  });
  return Array.from(seed).sort((a, b) => String(LOCATION_LABELS[a] || a).localeCompare(String(LOCATION_LABELS[b] || b)));
}

function normalizeSettingsProfile(raw) {
  const base = JSON.parse(JSON.stringify(DEFAULT_OPERATIONS_SETTINGS));
  if (!raw || typeof raw !== 'object') return base;

  const next = JSON.parse(JSON.stringify(base));
  next.managerPayRate = Number.isFinite(Number(raw.managerPayRate)) ? Number(raw.managerPayRate) : base.managerPayRate;
  next.managerWeeklyHours = Number.isFinite(Number(raw.managerWeeklyHours)) ? Number(raw.managerWeeklyHours) : base.managerWeeklyHours;
  next.keyLeadPayRate = Number.isFinite(Number(raw.keyLeadPayRate)) ? Number(raw.keyLeadPayRate) : base.keyLeadPayRate;
  next.scooperPayRate = Number.isFinite(Number(raw.scooperPayRate)) ? Number(raw.scooperPayRate) : base.scooperPayRate;

  const targetProfile = raw.targetProfile && typeof raw.targetProfile === 'object' ? raw.targetProfile : {};
  Object.keys(base.targetProfile).forEach((key) => {
    const incoming = Number(targetProfile[key]);
    next.targetProfile[key] = Number.isFinite(incoming) ? incoming : base.targetProfile[key];
  });

  const workflow = raw.workflow && typeof raw.workflow === 'object' ? raw.workflow : {};
  next.workflow.minOpeners = Number.isFinite(Number(workflow.minOpeners)) ? Number(workflow.minOpeners) : base.workflow.minOpeners;
  next.workflow.minClosers = Number.isFinite(Number(workflow.minClosers)) ? Number(workflow.minClosers) : base.workflow.minClosers;
  next.workflow.requirePolicyApproval =
    typeof workflow.requirePolicyApproval === 'boolean' ? workflow.requirePolicyApproval : base.workflow.requirePolicyApproval;
  next.workflow.requireGMApproval =
    typeof workflow.requireGMApproval === 'boolean' ? workflow.requireGMApproval : base.workflow.requireGMApproval;

  const opening = raw.openingSchedule && typeof raw.openingSchedule === 'object' ? raw.openingSchedule : {};
  Object.keys(base.openingSchedule).forEach((key) => {
    const incoming = String(opening[key] || '').trim();
    next.openingSchedule[key] = /^\d{4}-\d{2}-\d{2}$/.test(incoming) ? incoming : base.openingSchedule[key];
  });

  const seasonHours = raw.seasonHours && typeof raw.seasonHours === 'object' ? raw.seasonHours : {};
  Object.keys(base.seasonHours).forEach((key) => {
    const incoming = String(seasonHours[key] || '').trim();
    next.seasonHours[key] = /^([01]\d|2[0-3]):[0-5]\d$/.test(incoming) ? incoming : base.seasonHours[key];
  });

  return next;
}

function updateSettingsValue(section, key, value) {
  if (!state.settings || typeof state.settings !== 'object') {
    state.settings = normalizeSettingsProfile(null);
  }
  if (section === 'root') {
    state.settings[key] = value;
    return;
  }
  if (!state.settings[section] || typeof state.settings[section] !== 'object') return;
  state.settings[section][key] = value;
}

function canonicalWeekday(raw) {
  const key = String(raw || '')
    .trim()
    .slice(0, 3)
    .toLowerCase();
  if (key === 'mon') return 'Mon';
  if (key === 'tue') return 'Tue';
  if (key === 'wed') return 'Wed';
  if (key === 'thu') return 'Thu';
  if (key === 'fri') return 'Fri';
  if (key === 'sat') return 'Sat';
  if (key === 'sun') return 'Sun';
  return '';
}

function cloneTemplateDay(daySlots) {
  return (Array.isArray(daySlots) ? daySlots : []).map((slot) => ({
    start: slot.start,
    end: slot.end,
    role: slot.role,
    headcount: Math.max(1, Number(slot.headcount) || 1),
  }));
}

function normalizeTemplateSlot(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const start = String(raw.start || '').trim();
  const end = String(raw.end || '').trim();
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)) return null;
  if (parseTimeToHours(end) <= parseTimeToHours(start)) return null;
  return {
    start,
    end,
    role: String(raw.role || '').trim() || 'Support Scooper',
    headcount: Math.max(1, Math.min(6, Number(raw.headcount) || 1)),
  };
}

function normalizeTemplateProfile(rawProfile) {
  const normalized = Object.fromEntries(TEMPLATE_WEEKDAYS.map((day) => [day, []]));
  if (!rawProfile || typeof rawProfile !== 'object') return normalized;

  Object.entries(rawProfile).forEach(([rawDay, rawSlots]) => {
    const day = canonicalWeekday(rawDay);
    if (!day || !Array.isArray(rawSlots)) return;
    normalized[day] = rawSlots.map((slot) => normalizeTemplateSlot(slot)).filter(Boolean);
  });

  return normalized;
}

function mergeTemplateProfiles(...profiles) {
  const merged = Object.fromEntries(TEMPLATE_WEEKDAYS.map((day) => [day, []]));
  profiles.forEach((profile) => {
    if (!profile || typeof profile !== 'object') return;
    TEMPLATE_WEEKDAYS.forEach((day) => {
      if (Array.isArray(profile[day]) && profile[day].length) {
        merged[day] = cloneTemplateDay(profile[day]);
      }
    });
  });

  // Monday planning and Monday-open scenarios mirror Tuesday exactly.
  if (merged.Tue.length) {
    merged.Mon = cloneTemplateDay(merged.Tue);
  }

  TEMPLATE_WEEKDAYS.forEach((day) => {
    if (!merged[day].length && merged.Tue.length) {
      merged[day] = cloneTemplateDay(merged.Tue);
    }
  });

  return merged;
}

function sourceTemplateProfilesForLocation(locationCode) {
  const catalog = sourceData?.schedule_template_profiles;
  if (!catalog || typeof catalog !== 'object') return { defaultProfile: null, locationProfile: null };

  const locKey = String(locationCode || '').trim();
  const upperKey = locKey.toUpperCase();
  const lowerKey = locKey.toLowerCase();
  const locationsNode = catalog.locations && typeof catalog.locations === 'object' ? catalog.locations : catalog;

  const defaultProfile =
    (catalog.default && typeof catalog.default === 'object' && !Array.isArray(catalog.default) ? catalog.default : null) ||
    (locationsNode.default && typeof locationsNode.default === 'object' && !Array.isArray(locationsNode.default) ? locationsNode.default : null) ||
    (locationsNode.DEFAULT && typeof locationsNode.DEFAULT === 'object' && !Array.isArray(locationsNode.DEFAULT) ? locationsNode.DEFAULT : null);

  const locationProfile =
    (locationsNode[upperKey] && typeof locationsNode[upperKey] === 'object' && !Array.isArray(locationsNode[upperKey]) ? locationsNode[upperKey] : null) ||
    (locationsNode[locKey] && typeof locationsNode[locKey] === 'object' && !Array.isArray(locationsNode[locKey]) ? locationsNode[locKey] : null) ||
    (locationsNode[lowerKey] && typeof locationsNode[lowerKey] === 'object' && !Array.isArray(locationsNode[lowerKey]) ? locationsNode[lowerKey] : null);

  return { defaultProfile, locationProfile };
}

function weeklyTemplateProfileForLocation(locationCode) {
  const loc = String(locationCode || '').trim().toUpperCase();
  const sourceProfiles = sourceTemplateProfilesForLocation(loc);
  return mergeTemplateProfiles(
    normalizeTemplateProfile(DEFAULT_BUSINESS_WEEKLY_TEMPLATE),
    normalizeTemplateProfile(LOCATION_WEEKLY_TEMPLATE_OVERRIDES[loc] || null),
    normalizeTemplateProfile(sourceProfiles.defaultProfile),
    normalizeTemplateProfile(sourceProfiles.locationProfile)
  );
}

function templateSlotDefsForLocationDay(locationCode, weekday) {
  const profile = weeklyTemplateProfileForLocation(locationCode);
  const day = canonicalWeekday(weekday);
  if (!day) return [];
  const effectiveDay = day === 'Mon' ? 'Tue' : day;
  const slots = profile[effectiveDay] || profile.Tue || [];
  return cloneTemplateDay(slots);
}

function dayHasAnyAssignments(day) {
  return (day?.slots || []).some((slot) => (slot?.assignments || []).some((name) => String(name || '').trim()));
}

function pristineTemplateDay(day) {
  if (!day || typeof day !== 'object') return false;
  if (day.hasException || day.pendingRequestId || day.lastDecision || day.lastAcceptedRecommendationKey) return false;
  if (String(day.note || '').trim()) return false;
  if (dayHasAnyAssignments(day)) return false;
  return true;
}

function slotStructureSignature(slots) {
  return (Array.isArray(slots) ? slots : [])
    .map((slot) => `${String(slot.start || '').trim()}|${String(slot.end || '').trim()}|${String(slot.role || '').trim()}|${Math.max(1, Number(slot.headcount) || 1)}`)
    .join('||');
}

function syncPristineDaysWithTemplateSlots() {
  if (!Array.isArray(state.weeks) || !state.weeks.length) return false;
  let changed = false;

  state.weeks.forEach((week) => {
    (week?.days || []).forEach((day) => {
      if (!pristineTemplateDay(day)) return;
      const dateObj = parseIso(day.date);
      const season = seasonForDate(dateObj);
      const template = buildTemplateSlots(day.weekday, season, state.location);
      if (slotStructureSignature(day.slots) === slotStructureSignature(template)) {
        (day.slots || []).forEach((slot) => ensureAssignments(slot));
        return;
      }
      day.season = season;
      day.slots = template;
      changed = true;
    });
  });

  return changed;
}

function migrateLegacySummerHours(settings) {
  const seasonHours = settings?.seasonHours;
  if (!seasonHours || typeof seasonHours !== 'object') return false;
  const looksLegacyDefault =
    seasonHours.winterOpen === '12:00' &&
    seasonHours.winterClose === '22:00' &&
    seasonHours.springOpen === '12:00' &&
    seasonHours.springClose === '22:00' &&
    seasonHours.summerOpen === '12:00' &&
    seasonHours.summerClose === '22:00' &&
    seasonHours.fallOpen === '12:00' &&
    seasonHours.fallClose === '22:00';
  if (!looksLegacyDefault) return false;
  settings.seasonHours.summerClose = '23:00';
  return true;
}

function normalizeStoreScope(value) {
  const raw = String(value || '').trim();
  if (!raw || raw === 'BOTH') return 'BOTH';
  return plannerLocationCodes().includes(raw) ? raw : 'BOTH';
}

function normalizePtoStatus(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value === 'approved' || value === 'granted') return 'approved';
  if (value === 'pending' || value === 'requested') return 'pending';
  if (value === 'denied' || value === 'rejected') return 'denied';
  if (value === 'cancelled' || value === 'canceled') return 'cancelled';
  return 'pending';
}

function normalizePtoLocation(raw) {
  const value = String(raw || '').trim();
  if (!value) return 'BOTH';
  if (value === 'EP' || value === 'NL' || value === 'BOTH') return value;
  if (SQUARE_LOCATION_TO_CODE[value]) return SQUARE_LOCATION_TO_CODE[value];

  const upper = value.toUpperCase();
  if (upper.includes('EAST') || upper.includes('PASSYUNK')) return 'EP';
  if (upper.includes('NORTHERN') || upper.includes('LIBERT')) return 'NL';
  return 'BOTH';
}

function normalizeIsoDay(raw) {
  const text = String(raw || '');
  const matched = text.match(/\d{4}-\d{2}-\d{2}/);
  return matched ? matched[0] : null;
}

function normalizeIsoDateTime(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function normalizePtoRequest(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const startDate = normalizeIsoDay(raw.start_date || raw.startDate || raw.starts_at || raw.start || raw.date_start || raw.date);
  if (!startDate) return null;

  const endDateRaw = normalizeIsoDay(raw.end_date || raw.endDate || raw.ends_at || raw.end || raw.date_end || raw.date);
  const endDate = endDateRaw && endDateRaw >= startDate ? endDateRaw : startDate;
  const status = normalizePtoStatus(raw.status);
  const employee = String(raw.employee_name || raw.team_member_name || raw.employee || raw.name || 'Unknown').trim() || 'Unknown';
  const location = normalizePtoLocation(raw.location || raw.location_code || raw.location_id);

  return {
    id: String(raw.id || `pto_${startDate}_${employee.replace(/\s+/g, '_').toLowerCase()}`),
    employee,
    location,
    startDate,
    endDate,
    status,
    notes: String(raw.notes || raw.note || '').trim(),
    source: String(raw.source || 'square'),
    submittedAt: normalizeIsoDay(raw.submitted_at || raw.requested_at || raw.created_at) || null,
    updatedAt: normalizeIsoDay(raw.updated_at || raw.modified_at) || null,
  };
}

function normalizePtoSync(raw) {
  const source = String(raw?.source || 'square');
  const statusRaw = String(raw?.status || 'not_connected');
  const status = ['not_connected', 'syncing', 'connected', 'degraded'].includes(statusRaw) ? statusRaw : 'not_connected';
  return {
    source,
    status,
    lastAttemptAt: normalizeIsoDateTime(raw?.lastAttemptAt) || null,
    lastSuccessAt: normalizeIsoDateTime(raw?.lastSuccessAt) || null,
    lastError: raw?.lastError ? String(raw.lastError) : null,
  };
}

function extractPtoRowsFromPayload(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.requests)) return payload.requests;
  if (Array.isArray(payload.ptoRequests)) return payload.ptoRequests;
  if (Array.isArray(payload.pto_requests)) return payload.pto_requests;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.requests)) return payload.data.requests;
  if (payload.result && Array.isArray(payload.result.requests)) return payload.result.requests;
  return [];
}

function dedupeAndNormalizePtoRequests(rows) {
  const byId = new Map();
  (rows || []).forEach((row) => {
    const normalized = normalizePtoRequest(row);
    if (!normalized) return;

    const prior = byId.get(normalized.id);
    if (!prior) {
      byId.set(normalized.id, normalized);
      return;
    }

    const priorStamp = prior.updatedAt || prior.submittedAt || prior.startDate || '';
    const nextStamp = normalized.updatedAt || normalized.submittedAt || normalized.startDate || '';
    if (nextStamp >= priorStamp) {
      byId.set(normalized.id, normalized);
    }
  });

  return Array.from(byId.values()).sort((a, b) => {
    const startCmp = String(a.startDate || '').localeCompare(String(b.startDate || ''));
    if (startCmp !== 0) return startCmp;
    return String(a.employee || '').localeCompare(String(b.employee || ''));
  });
}

let sourceData = null;
const weatherData = {
  EP: { history: {}, forecast: {}, normals: {}, hourly: {} },
  NL: { history: {}, forecast: {}, normals: {}, hourly: {} },
  loaded: false,
  error: null,
};

function esc(raw) {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function isoDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseIso(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function addDays(date, days) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

function toMonday(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7;
  return addDays(d, -offset);
}

function nextMonday(baseDate = new Date()) {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const day = d.getDay();
  const delta = day === 1 ? 0 : (8 - day) % 7;
  return addDays(d, delta);
}

function seasonForDate(dateObj) {
  const month = dateObj.getMonth() + 1;
  if (month === 12 || month <= 2) return 'winter';
  if (month <= 5) return 'spring';
  if (month <= 8) return 'summer';
  return 'fall';
}

function seasonLabel(dateObj) {
  return SEASON_LABELS[seasonForDate(dateObj)] || 'Season';
}

function formatDateLabel(iso) {
  const d = parseIso(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDateFull(iso) {
  const d = parseIso(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function shortWeekdayFromIso(iso) {
  const d = parseIso(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function monthKeyFromIso(iso) {
  return String(iso || '').slice(0, 7);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function toIsoDateLocal(dateObj) {
  return isoDate(new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
}

function makeSlot(start, end, role, headcount) {
  const count = Math.max(1, Number(headcount) || 1);
  return {
    id: `slot_${Math.random().toString(36).slice(2, 10)}`,
    start,
    end,
    role,
    headcount: count,
    assignments: Array.from({ length: count }, () => ''),
  };
}

function ensureAssignments(slot) {
  const target = Math.max(1, Number(slot.headcount) || 1);
  slot.headcount = target;
  const next = Array.from({ length: target }, (_, idx) => slot.assignments[idx] || '');
  slot.assignments = next;
}

function parseTimeToHours(raw) {
  const [h, m] = String(raw || '').split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h + m / 60;
}

function slotHours(slot) {
  const start = parseTimeToHours(slot.start);
  const end = parseTimeToHours(slot.end);
  return Math.max(0, end - start);
}

function hourToTime(hour) {
  const h = Math.max(0, Math.min(23, Number(hour) || 0));
  return `${pad2(h)}:00`;
}

function timeToHour(raw, fallback) {
  const [h] = String(raw || '').split(':').map(Number);
  if (!Number.isFinite(h)) return fallback;
  return Math.max(0, Math.min(23, h));
}

function seasonHoursFor(season) {
  const settings = normalizeSettingsProfile(state.settings);
  const hours = settings?.seasonHours || DEFAULT_SEASON_HOURS;
  const key = String(season || 'fall').toLowerCase();
  if (key === 'winter') {
    return {
      openHour: timeToHour(hours.winterOpen, 12),
      closeHour: timeToHour(hours.winterClose, 22),
    };
  }
  if (key === 'spring') {
    return {
      openHour: timeToHour(hours.springOpen, 12),
      closeHour: timeToHour(hours.springClose, 22),
    };
  }
  if (key === 'summer') {
    return {
      openHour: timeToHour(hours.summerOpen, 12),
      closeHour: timeToHour(hours.summerClose, 23),
    };
  }
  return {
    openHour: timeToHour(hours.fallOpen, 12),
    closeHour: timeToHour(hours.fallClose, 22),
  };
}

function isEveningSlot(slot) {
  const start = parseTimeToHours(slot?.start);
  const end = parseTimeToHours(slot?.end);
  return end >= 20 || start >= 17;
}

function weatherCodeLabel(code) {
  const val = Number(code);
  if (val === 0) return 'Clear';
  if ([1, 2].includes(val)) return 'Partly Cloudy';
  if (val === 3) return 'Overcast';
  if ([45, 48].includes(val)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(val)) return 'Drizzle';
  if ([61, 63, 65, 66, 67].includes(val)) return 'Rain';
  if ([71, 73, 75, 77].includes(val)) return 'Snow';
  if ([80, 81, 82].includes(val)) return 'Rain Showers';
  if ([85, 86].includes(val)) return 'Snow Showers';
  if ([95, 96, 99].includes(val)) return 'Thunderstorm';
  return 'Mixed';
}

function expectedTempForDate(loc, dateIso) {
  const key = String(dateIso || '').slice(5, 10);
  const value = weatherData?.[loc]?.normals?.[key];
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function temperatureDeltaForDate(loc, dateIso, weatherRow) {
  const actual = Number(weatherRow?.tempMax ?? NaN);
  const expected = expectedTempForDate(loc, dateIso);
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) {
    return { available: false, actual: null, expected: expected ?? null, delta: null };
  }
  return {
    available: true,
    actual,
    expected,
    delta: actual - expected,
  };
}

function formatSignedDegrees(value) {
  if (!Number.isFinite(Number(value))) return 'N/A';
  const rounded = Math.round(Number(value));
  return `${rounded > 0 ? '+' : ''}${rounded}F`;
}

function weatherImpactSignal(loc, dateIso, weatherRow) {
  if (!weatherRow) {
    return {
      impact: 'neutral',
      label: 'No weather signal',
      reason: 'Weather data unavailable.',
      delta: null,
      expected: null,
      actual: null,
      window: null,
      eventHour: null,
    };
  }

  const timedSignal = timedPrecipSignal(loc, dateIso);
  if (timedSignal) {
    return {
      impact: timedSignal.impact,
      label: timedSignal.label,
      reason: timedSignal.reason,
      delta: null,
      expected: null,
      actual: Number(weatherRow.tempMax ?? null),
      window: timedSignal.window,
      eventHour: timedSignal.eventHour,
    };
  }

  const deltaInfo = temperatureDeltaForDate(loc, dateIso, weatherRow);
  if (!deltaInfo.available) {
    return {
      impact: 'neutral',
      label: 'No baseline',
      reason: 'Expected temperature baseline unavailable for this date.',
      delta: null,
      expected: deltaInfo.expected,
      actual: deltaInfo.actual,
      window: null,
      eventHour: null,
    };
  }

  if (deltaInfo.delta >= 10) {
    return {
      impact: 'up',
      label: 'Demand Lift',
      reason: `High is ${formatSignedDegrees(deltaInfo.delta)} vs expected ${Math.round(deltaInfo.expected)}F.`,
      delta: deltaInfo.delta,
      expected: deltaInfo.expected,
      actual: deltaInfo.actual,
      window: null,
      eventHour: null,
    };
  }

  if (deltaInfo.delta <= -10) {
    return {
      impact: 'down',
      label: 'Demand Risk',
      reason: `High is ${formatSignedDegrees(deltaInfo.delta)} vs expected ${Math.round(deltaInfo.expected)}F.`,
      delta: deltaInfo.delta,
      expected: deltaInfo.expected,
      actual: deltaInfo.actual,
      window: null,
      eventHour: null,
    };
  }

  return {
    impact: 'neutral',
    label: 'Near Expected',
    reason: `High is ${formatSignedDegrees(deltaInfo.delta)} vs expected ${Math.round(deltaInfo.expected)}F.`,
    delta: deltaInfo.delta,
    expected: deltaInfo.expected,
    actual: deltaInfo.actual,
    window: null,
    eventHour: null,
  };
}

function staffingWeatherAction(signal) {
  if (signal?.impact === 'up') {
    return `Weather recommendation: add +1 peak/support position (${formatSignedDegrees(signal.delta)} vs expected). Keep minimum 1 opener and 2 closers.`;
  }
  if (signal?.impact === 'down') {
    if (signal.window === 'evening') {
      const hourText = Number.isFinite(Number(signal.eventHour)) ? ` around ${formatHourLabel(signal.eventHour)}` : '';
      return `Weather recommendation: trim 1 evening peak/support position${hourText}. Never below 1 opener and 2 closers.`;
    }
    return `Weather recommendation: trim 1 peak/support position (${formatSignedDegrees(signal.delta)} vs expected). Never below 1 opener and 2 closers.`;
  }
  return 'Weather recommendation: keep baseline staffing (temperature within ±10F of expected).';
}

function weatherClass(impact) {
  if (impact === 'up') return 'status-ok';
  if (impact === 'down') return 'status-risk';
  return 'status-pending';
}

function isOpenerRole(role) {
  return /open/i.test(String(role || ''));
}

function isCloserRole(role) {
  return /closer|close/i.test(String(role || ''));
}

function isAdjustableRole(role) {
  const text = String(role || '').toLowerCase();
  return !isOpenerRole(text) && !isCloserRole(text);
}

function dayRecommendation(loc, day) {
  const weatherRow = weatherForDate(loc, day.date);
  const signal = weatherImpactSignal(loc, day.date, weatherRow);
  if (signal.impact === 'neutral') {
    return {
      action: null,
      weather: weatherRow,
      signal,
      message: staffingWeatherAction(signal),
      canApply: false,
      buttonLabel: '',
      key: '',
    };
  }

  const adjustableSlots = (day.slots || []).filter((slot) => isAdjustableRole(slot.role));
  const action = signal.impact === 'up' ? 'increase_support' : 'decrease_support';
  const key = `${day.date}:${action}`;
  const alreadyApplied = day.lastAcceptedRecommendationKey === key;
  const canApply = action === 'increase_support' ? true : adjustableSlots.length > 0;

  const buttonLabel =
    action === 'increase_support'
      ? 'Accept Recommendation (+1 Support)'
      : 'Accept Recommendation (-1 Support)';

  return {
    action,
    weather: weatherRow,
    signal,
    message: staffingWeatherAction(signal),
    canApply: canApply && !alreadyApplied,
    buttonLabel: alreadyApplied ? 'Recommendation Applied' : buttonLabel,
    key,
    alreadyApplied,
  };
}

function applyRecommendationToDay(day, rec) {
  if (!rec || !rec.action) return false;

  if (rec.action === 'increase_support') {
    const preferred = (day.slots || []).find((slot) => /peak/i.test(String(slot.role || '')));
    const fallback = (day.slots || []).find((slot) => isAdjustableRole(slot.role));
    const target = preferred || fallback;

    if (target) {
      target.headcount = clamp((Number(target.headcount) || 1) + 1, 1, 6);
      ensureAssignments(target);
    } else {
      day.slots.push(makeSlot('17:00', '22:00', 'Weather Support', 1));
    }
    day.lastAcceptedRecommendationKey = rec.key;
    return true;
  }

  if (rec.action === 'decrease_support') {
    const adjustable = (day.slots || []).filter((slot) => isAdjustableRole(slot.role));
    if (!adjustable.length) return false;

    const eveningPreferred =
      rec?.signal?.window === 'evening'
        ? adjustable.filter((slot) => isEveningSlot(slot))
        : adjustable;
    const candidatePool = eveningPreferred.length ? eveningPreferred : adjustable;
    const target =
      candidatePool.find((slot) => /peak|support/i.test(String(slot.role || ''))) ||
      candidatePool[candidatePool.length - 1];
    const count = Number(target.headcount) || 1;
    if (count > 1) {
      target.headcount = count - 1;
      ensureAssignments(target);
    } else {
      day.slots = day.slots.filter((slot) => slot.id !== target.id);
    }
    day.lastAcceptedRecommendationKey = rec.key;
    return true;
  }

  return false;
}

function lastWeekReferenceForDay(weekIdx, dayIdx) {
  const priorWeek = state.weeks[weekIdx - 1];
  const priorDay = priorWeek?.days?.[dayIdx];
  if (priorDay) {
    return {
      source: 'previous_week',
      label: `Last ${priorDay.weekday}: ${formatDateFull(priorDay.date)}`,
      slots: priorDay.slots || [],
    };
  }

  return { source: 'none', label: 'No last-week schedule available yet', slots: [] };
}

function cloneSlotsFromReference(slots, includeAssignments) {
  return (slots || []).map((slot) => {
    const next = makeSlot(slot.start, slot.end, slot.role, slot.headcount);
    if (includeAssignments) {
      const names = Array.isArray(slot.assignments) ? slot.assignments : [];
      ensureAssignments(next);
      next.assignments = Array.from({ length: next.headcount }, (_unused, idx) => names[idx] || '');
    }
    return next;
  });
}

function normalizedSlotKey(slot) {
  return `${String(slot.start || '').trim()}|${String(slot.end || '').trim()}|${String(slot.role || '')
    .trim()
    .toLowerCase()}`;
}

function copyAssignmentsIntoCurrentSlots(currentSlots, referenceSlots) {
  if (!Array.isArray(currentSlots) || !currentSlots.length) return false;
  if (!Array.isArray(referenceSlots) || !referenceSlots.length) return false;

  const byKey = new Map();
  referenceSlots.forEach((slot) => {
    const key = normalizedSlotKey(slot);
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(slot);
  });

  let changed = false;

  currentSlots.forEach((slot, idx) => {
    const key = normalizedSlotKey(slot);
    const keyedList = byKey.get(key) || [];
    const refSlot = keyedList.length ? keyedList.shift() : referenceSlots[idx];
    if (!refSlot) return;

    const names = Array.isArray(refSlot.assignments) ? refSlot.assignments : [];
    const headcount = Math.max(1, Number(slot.headcount) || 1);
    const nextAssignments = Array.from({ length: headcount }, (_unused, assignIdx) => names[assignIdx] || '');
    const prior = JSON.stringify(slot.assignments || []);
    const next = JSON.stringify(nextAssignments);
    slot.assignments = nextAssignments;
    if (prior !== next) changed = true;
  });

  return changed;
}

function employeePoolForLocation() {
  if (Array.isArray(sourceData?.employees?.[state.location])) {
    return sourceData.employees[state.location];
  }
  const ep = sourceData?.employees?.EP || [];
  const nl = sourceData?.employees?.NL || [];
  return state.location === 'EP' ? ep : nl;
}

function matchEmployeesByQuery(query, pool, limit = 5) {
  const list = Array.isArray(pool) ? pool : [];
  const needle = normalizedPersonName(query);
  if (!needle) return [];
  const matches = list.filter((name) => normalizedPersonName(name).includes(needle));
  return matches.slice(0, limit);
}

function assignmentMatchChipsHtml(pool, query, weekIdx, dayIdx, slotIdx, assignIdx) {
  const matches = matchEmployeesByQuery(query, pool, 5);
  if (!matches.length) return '';
  return matches
    .map(
      (name) => `<button
        type="button"
        class="match-chip"
        data-action="pick-assignment"
        data-week="${weekIdx}"
        data-day="${dayIdx}"
        data-slot="${slotIdx}"
        data-assign="${assignIdx}"
        data-name="${esc(name)}"
      >${esc(name)}</button>`
    )
    .join('');
}

function paintAssignmentMatchList(inputEl) {
  if (!inputEl) return;
  const wrap = inputEl.closest('.assignment-combobox');
  const matchList = wrap?.querySelector('.assignment-match-list');
  if (!matchList) return;

  const weekIdx = Number(inputEl.dataset.week);
  const dayIdx = Number(inputEl.dataset.day);
  const slotIdx = Number(inputEl.dataset.slot);
  const assignIdx = Number(inputEl.dataset.assign);
  const pool = employeePoolForLocation();
  matchList.innerHTML = assignmentMatchChipsHtml(pool, inputEl.value || '', weekIdx, dayIdx, slotIdx, assignIdx);
}

function assignShiftForward(weekIdx, dayIdx, slotIdx, assignIdx, weeksForward = REPEAT_ASSIGNMENT_WEEKS) {
  const day = getDay(weekIdx, dayIdx);
  const slot = day?.slots?.[slotIdx];
  if (!slot) return { applied: 0, scanned: 0, missingSlot: 0, name: '' };
  const name = String((slot.assignments || [])[assignIdx] || '').trim();
  if (!name) return { applied: 0, scanned: 0, missingSlot: 0, name: '' };

  const normalizedKey = normalizedSlotKey(slot);
  let applied = 0;
  let scanned = 0;
  let missingSlot = 0;
  const maxWeekIdx = Math.min(state.weeks.length - 1, weekIdx + weeksForward);

  for (let nextWeekIdx = weekIdx + 1; nextWeekIdx <= maxWeekIdx; nextWeekIdx += 1) {
    const nextDay = getDay(nextWeekIdx, dayIdx);
    scanned += 1;
    if (!nextDay) {
      missingSlot += 1;
      continue;
    }

    const targetSlot = (nextDay.slots || []).find((candidate) => normalizedSlotKey(candidate) === normalizedKey);
    if (!targetSlot) {
      missingSlot += 1;
      continue;
    }

    ensureAssignments(targetSlot);
    const targetIdx = Math.min(assignIdx, Math.max(0, targetSlot.assignments.length - 1));
    targetSlot.assignments[targetIdx] = name;
    applied += 1;
  }

  return { applied, scanned, missingSlot, name };
}

function buildTemplateSlots(weekday, _season, locationCode = state.location) {
  const defs = templateSlotDefsForLocationDay(locationCode, weekday);
  if (defs.length) {
    return defs.map((slot) => makeSlot(slot.start, slot.end, slot.role, slot.headcount));
  }

  // Fallback if template profile payload is malformed.
  return [makeSlot('11:00', '19:00', 'Opener Lead', 1), makeSlot('15:00', '23:00', 'Closer Lead', 1), makeSlot('16:00', '23:00', 'Closer Scooper', 1)];
}

function dayValidation(day) {
  const openerCount = day.slots
    .filter((slot) => /open/i.test(slot.role))
    .reduce((acc, slot) => acc + (Number(slot.headcount) || 0), 0);

  const closerCount = day.slots
    .filter((slot) => /closer|close/i.test(slot.role))
    .reduce((acc, slot) => acc + (Number(slot.headcount) || 0), 0);

  if (openerCount < 1) {
    return { ok: false, message: 'Need at least one opener shift.' };
  }

  if (closerCount < 2) {
    return { ok: false, message: 'Need at least two closing positions.' };
  }

  return { ok: true, message: 'Coverage rules satisfied.' };
}

function weekLaborHours(week) {
  return week.days.reduce(
    (total, day) => total + day.slots.reduce((sum, slot) => sum + slotHours(slot) * (Number(slot.headcount) || 0), 0),
    0
  );
}

function activePendingRequestForDay(day) {
  if (!day.pendingRequestId) return null;
  const request = state.requests.find((row) => row.id === day.pendingRequestId);
  return request && request.status === 'pending' ? request : null;
}

function ptoLocationMatches(requestLocation, scopeLocation) {
  const req = requestLocation === 'EP' || requestLocation === 'NL' ? requestLocation : 'BOTH';
  if (scopeLocation === 'BOTH') return req === 'EP' || req === 'NL' || req === 'BOTH';
  if (req === 'BOTH') return true;
  return req === scopeLocation;
}

function ptoDateOverlap(request, startDate, endDate) {
  if (!request?.startDate || !request?.endDate) return false;
  return request.startDate <= endDate && request.endDate >= startDate;
}

function ptoRowsForRange(scopeLocation, startDate, endDate) {
  return (state.ptoRequests || []).filter((request) => ptoLocationMatches(request.location, scopeLocation) && ptoDateOverlap(request, startDate, endDate));
}

function ptoRowsForDay(scopeLocation, dateIso) {
  return ptoRowsForRange(scopeLocation, dateIso, dateIso);
}

function normalizedPersonName(raw) {
  return String(raw || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function assignedPeopleForDay(day) {
  const assigned = new Set();
  (day?.slots || []).forEach((slot) => {
    (slot.assignments || []).forEach((name) => {
      const normalized = normalizedPersonName(name);
      if (normalized) assigned.add(normalized);
    });
  });
  return assigned;
}

function ptoSummaryForDay(location, day) {
  const rows = ptoRowsForDay(location, day.date);
  const approved = rows.filter((row) => row.status === 'approved');
  const pending = rows.filter((row) => row.status === 'pending');
  const actionable = rows.filter((row) => row.status === 'approved' || row.status === 'pending');
  const assigned = assignedPeopleForDay(day);
  const conflicts = actionable.filter((row) => assigned.has(normalizedPersonName(row.employee)));

  return {
    total: rows.length,
    approvedCount: approved.length,
    pendingCount: pending.length,
    conflicts,
  };
}

function plannerDateRange() {
  const dates = [];
  (state.weeks || []).forEach((week) => {
    (week.days || []).forEach((day) => {
      if (typeof day?.date === 'string' && day.date) dates.push(day.date);
    });
  });

  if (!dates.length) {
    const start = isoDate(toMonday(parseIso(state.startDate || isoDate(nextMonday(new Date())))));
    const end = isoDate(addDays(parseIso(start), 13));
    return { startDate: start, endDate: end };
  }

  dates.sort();
  return { startDate: dates[0], endDate: dates[dates.length - 1] };
}

function formatDateTime(iso) {
  if (!iso) return 'N/A';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleString();
}

function ptoSyncStatusLabel(sync) {
  const status = sync?.status || 'not_connected';
  if (status === 'connected') return 'Connected';
  if (status === 'syncing') return 'Syncing';
  if (status === 'degraded') return 'Degraded';
  return 'Not Connected';
}

async function syncPtoFromSquare({ silent = false } = {}) {
  const attemptAt = new Date().toISOString();
  state.ptoSync = normalizePtoSync({
    ...state.ptoSync,
    source: 'square',
    status: 'syncing',
    lastAttemptAt: attemptAt,
    lastError: null,
  });
  saveState();
  renderAll();

  const { startDate, endDate } = plannerDateRange();
  const locationIds = [SQUARE_LOCATION_IDS.EP, SQUARE_LOCATION_IDS.NL].filter(Boolean);
  const query = new URLSearchParams({
    date_start: startDate,
    date_end: endDate,
    location_ids: locationIds.join(','),
  });

  try {
    const response = await fetch(`${PTO_SYNC_ENDPOINT}?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Square PTO sync failed (${response.status})`);
    }

    const payload = await response.json();
    const rows = dedupeAndNormalizePtoRequests(extractPtoRowsFromPayload(payload));
    state.ptoRequests = rows;
    state.ptoSync = normalizePtoSync({
      ...(payload?.sync || {}),
      source: 'square',
      status: 'connected',
      lastAttemptAt: attemptAt,
      lastSuccessAt: new Date().toISOString(),
      lastError: null,
    });
    saveState();
    renderAll();
    if (!silent) {
      window.alert(`Square PTO sync complete: ${rows.length} request${rows.length === 1 ? '' : 's'} loaded.`);
    }
    return;
  } catch (err) {
    const fallbackRows = dedupeAndNormalizePtoRequests(extractPtoRowsFromPayload(sourceData));
    state.ptoSync = normalizePtoSync({
      ...state.ptoSync,
      source: 'square',
      status: fallbackRows.length ? 'degraded' : 'not_connected',
      lastAttemptAt: attemptAt,
      lastError: String(err),
      lastSuccessAt: fallbackRows.length ? state.ptoSync?.lastSuccessAt || null : state.ptoSync?.lastSuccessAt || null,
    });
    if (fallbackRows.length) {
      state.ptoRequests = fallbackRows;
    }
    saveState();
    renderAll();

    if (!silent) {
      if (fallbackRows.length) {
        window.alert(`Live PTO sync failed. Loaded ${fallbackRows.length} cached PTO request${fallbackRows.length === 1 ? '' : 's'} from local dataset.`);
      } else {
        window.alert(`Live PTO sync failed: ${String(err)}`);
      }
    }
  }
}

function normalizeWeekDays(week) {
  const desiredWeekdays = new Set(PLANNER_DAY_DEFS.map((def) => def.weekday));
  const existing = Array.isArray(week?.days) ? week.days : [];
  const existingByWeekday = new Map();
  existing.forEach((day) => {
    if (day?.weekday && !existingByWeekday.has(day.weekday)) {
      existingByWeekday.set(day.weekday, day);
    }
  });

  const weekStart = parseIso(week.weekStart);
  return PLANNER_DAY_DEFS.map((def) => {
    const dateObj = addDays(weekStart, def.offset);
    const date = isoDate(dateObj);
    const season = seasonForDate(dateObj);
    const prior = existingByWeekday.get(def.weekday);
    if (prior && desiredWeekdays.has(prior.weekday)) {
      return {
        ...prior,
        date,
        weekday: def.weekday,
        season,
        showLastWeekHelper: typeof prior.showLastWeekHelper === 'boolean' ? prior.showLastWeekHelper : false,
      };
    }
    return {
      date,
      weekday: def.weekday,
      season,
      slots: buildTemplateSlots(def.weekday, season, state.location),
      hasException: false,
      note: '',
      pendingRequestId: null,
      lastDecision: null,
      lastAcceptedRecommendationKey: null,
      showLastWeekHelper: false,
    };
  });
}

function buildWeeks() {
  const start = toMonday(parseIso(state.startDate));
  state.startDate = isoDate(start);

  const weeks = [];
  for (let weekIdx = 0; weekIdx < state.horizonWeeks; weekIdx += 1) {
    const weekStart = addDays(start, weekIdx * 7);

    const days = PLANNER_DAY_DEFS.map((def) => {
      const dateObj = addDays(weekStart, def.offset);
      const season = seasonForDate(dateObj);
      return {
        date: isoDate(dateObj),
        weekday: def.weekday,
        season,
        slots: buildTemplateSlots(def.weekday, season, state.location),
        hasException: false,
        note: '',
        pendingRequestId: null,
        lastDecision: null,
        lastAcceptedRecommendationKey: null,
        showLastWeekHelper: false,
      };
    });

    weeks.push({
      weekStart: isoDate(weekStart),
      days,
    });
  }

  state.weeks = weeks;
  state.requests = [];
  state.nextWeekApproval = {
    status: 'draft',
    submittedAt: null,
    reviewedAt: null,
    reviewer: 'General Manager',
  };
}

function plannerWeeksNeedRebuild() {
  if (!Array.isArray(state.weeks) || state.weeks.length === 0) return true;
  if (state.weeks.length !== Math.max(1, Number(state.horizonWeeks) || 1)) return true;
  const expectedStart = isoDate(toMonday(parseIso(state.startDate)));
  return state.weeks[0]?.weekStart !== expectedStart;
}

function saveState() {
  const payload = {
    topMenu: state.topMenu,
    location: state.location,
    horizonWeeks: state.horizonWeeks,
    startDate: state.startDate,
    weeks: state.weeks,
    plannerPage: state.plannerPage,
    requestTab:
      state.topMenu === 'shift_analysis'
        ? 'highlights'
        : state.topMenu === 'settings'
        ? 'workflow'
        : state.plannerPage === 'approvals'
        ? 'approvals'
        : 'weekly_plan',
    approvalsSubtab: state.approvalsSubtab,
    complianceSubtab: state.complianceSubtab,
    highlightsLookbackWeeks: state.highlightsLookbackWeeks,
    highlightsCompareMode: state.highlightsCompareMode,
    highlightsStoreScope: state.highlightsStoreScope,
    recentAnalysisNotes: state.recentAnalysisNotes,
    recentAnalysisDraftNotes: state.recentAnalysisDraftNotes,
    settings: state.settings,
    ptoRequests: state.ptoRequests,
    ptoSync: state.ptoSync,
    requests: state.requests,
    nextWeekApproval: state.nextWeekApproval,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (_err) {
    // Ignore storage failures.
  }
}

function loadState() {
  let parsed = null;
  try {
    parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch (_err) {
    parsed = null;
  }

  if (!parsed || typeof parsed !== 'object') return;

  state.topMenu = normalizeTopMenu(parsed.topMenu);
  if (typeof parsed.location === 'string' && parsed.location.trim()) state.location = parsed.location.trim();
  if (Number.isFinite(parsed.horizonWeeks)) state.horizonWeeks = Math.max(1, Number(parsed.horizonWeeks));
  if (typeof parsed.startDate === 'string' && parsed.startDate) state.startDate = parsed.startDate;
  if (Array.isArray(parsed.weeks)) state.weeks = parsed.weeks;
  if (
    parsed.plannerPage === 'weekly_plan' ||
    parsed.plannerPage === 'recent_staffing' ||
    parsed.plannerPage === 'approvals' ||
    parsed.plannerPage === 'compliance'
  ) {
    state.plannerPage = normalizePlannerPage(parsed.plannerPage);
  } else if (parsed.requestTab === 'highlights' || parsed.requestTab === 'insights') {
    state.topMenu = 'shift_analysis';
  } else if (parsed.requestTab === 'approvals') {
    state.plannerPage = 'approvals';
  } else if (parsed.requestTab === 'workflow') {
    state.topMenu = 'settings';
  }

  if (!parsed.topMenu) {
    if (parsed.plannerPage === 'recent_staffing') {
      state.topMenu = 'shift_analysis';
    } else if (parsed.plannerPage === 'compliance') {
      state.topMenu = 'settings';
    }
  }
  if (parsed.approvalsSubtab === 'next_week' || parsed.approvalsSubtab === 'day_requests' || parsed.approvalsSubtab === 'pto_requests') {
    state.approvalsSubtab = parsed.approvalsSubtab;
  }
  state.complianceSubtab = normalizeComplianceSubtab(parsed.complianceSubtab);
  if (Number.isFinite(parsed.highlightsLookbackWeeks)) {
    state.highlightsLookbackWeeks = clamp(Number(parsed.highlightsLookbackWeeks), 1, MAX_HIGHLIGHTS_WEEKS);
  }
  if (parsed.highlightsCompareMode === 'planned_vs_actual' || parsed.highlightsCompareMode === 'actual_vs_baseline') {
    state.highlightsCompareMode = parsed.highlightsCompareMode;
  }
  if (typeof parsed.highlightsStoreScope === 'string' && parsed.highlightsStoreScope.trim()) {
    state.highlightsStoreScope = parsed.highlightsStoreScope.trim();
  }
  if (parsed.recentAnalysisNotes && typeof parsed.recentAnalysisNotes === 'object') {
    state.recentAnalysisNotes = parsed.recentAnalysisNotes;
  }
  if (parsed.recentAnalysisDraftNotes && typeof parsed.recentAnalysisDraftNotes === 'object') {
    state.recentAnalysisDraftNotes = parsed.recentAnalysisDraftNotes;
  }
  state.settings = normalizeSettingsProfile(parsed.settings);
  const migratedSummerHours = migrateLegacySummerHours(state.settings);
  if (Array.isArray(parsed.ptoRequests)) {
    state.ptoRequests = dedupeAndNormalizePtoRequests(parsed.ptoRequests);
  }
  state.ptoSync = normalizePtoSync(parsed.ptoSync || state.ptoSync);
  if (Array.isArray(parsed.requests)) state.requests = parsed.requests;
  if (parsed.nextWeekApproval && typeof parsed.nextWeekApproval === 'object') {
    state.nextWeekApproval = {
      status: parsed.nextWeekApproval.status || 'draft',
      submittedAt: parsed.nextWeekApproval.submittedAt || null,
      reviewedAt: parsed.nextWeekApproval.reviewedAt || null,
      reviewer: parsed.nextWeekApproval.reviewer || 'General Manager',
    };
  }

  state.weeks = (state.weeks || []).map((week) => ({
    ...week,
    days: normalizeWeekDays(week),
  }));

  const syncedTemplateDays = syncPristineDaysWithTemplateSlots();

  state.weeks.forEach((week) => {
    (week.days || []).forEach((day) => {
      if (typeof day.showLastWeekHelper !== 'boolean') {
        day.showLastWeekHelper = Boolean(day.showMondayHelper);
      }
      (day.slots || []).forEach((slot) => ensureAssignments(slot));
    });
  });

  if (migratedSummerHours || syncedTemplateDays) {
    saveState();
  }
}

function getDay(weekIdx, dayIdx) {
  const week = state.weeks[weekIdx];
  if (!week) return null;
  return week.days[dayIdx] || null;
}

function weatherForDate(loc, dateIso) {
  const byLoc = weatherData[loc] || { history: {}, forecast: {}, normals: {}, hourly: {} };
  return byLoc.forecast?.[dateIso] || byLoc.history?.[dateIso] || null;
}

function hourlyForecastForDate(loc, dateIso) {
  return weatherData?.[loc]?.hourly?.[dateIso] || [];
}

function formatHourLabel(hour) {
  const h = Number(hour);
  if (!Number.isFinite(h)) return 'unknown time';
  const normalized = ((h % 24) + 24) % 24;
  const meridiem = normalized >= 12 ? 'pm' : 'am';
  const twelveHour = normalized % 12 || 12;
  return `${twelveHour}${meridiem}`;
}

function timedPrecipSignal(loc, dateIso) {
  const rows = hourlyForecastForDate(loc, dateIso);
  if (!rows.length) return null;

  const evening = rows.filter((row) => Number(row.hour) >= 20 && Number(row.hour) <= 23);
  if (!evening.length) return null;

  const heavy = evening.find((row) => Number(row.precipProb || 0) >= 75 || Number(row.precipMm || 0) >= 2);
  if (heavy) {
    return {
      impact: 'down',
      label: 'Evening Rain Risk',
      window: 'evening',
      eventHour: Number(heavy.hour),
      reason: `Heavy precipitation likely after ${formatHourLabel(heavy.hour)} (${Math.round(Number(heavy.precipProb || 0))}% rain chance).`,
    };
  }

  const moderate = evening.find((row) => Number(row.precipProb || 0) >= 60 || Number(row.precipMm || 0) >= 1);
  if (moderate) {
    return {
      impact: 'down',
      label: 'Late Rain Risk',
      window: 'evening',
      eventHour: Number(moderate.hour),
      reason: `Rain risk increases around ${formatHourLabel(moderate.hour)} (${Math.round(Number(moderate.precipProb || 0))}% rain chance).`,
    };
  }

  return null;
}

function weatherLine(loc, dateIso, weatherRow) {
  if (!weatherRow) return 'Forecast pending.';
  const tempLabel = Number.isFinite(Number(weatherRow.tempMax)) ? `${Math.round(Number(weatherRow.tempMax))}F` : 'N/A';
  const deltaInfo = temperatureDeltaForDate(loc, dateIso, weatherRow);
  const deltaLabel = deltaInfo.available
    ? `${formatSignedDegrees(deltaInfo.delta)} vs ${Math.round(deltaInfo.expected)}F avg`
    : 'Avg baseline unavailable';
  const precipLabel = Number.isFinite(Number(weatherRow.precipProb))
    ? `${Math.round(Number(weatherRow.precipProb))}% rain`
    : `${Number(weatherRow.precipMm || 0).toFixed(1)}mm precip`;
  return `${weatherCodeLabel(weatherRow.code)} · High ${tempLabel} · ${deltaLabel} · ${precipLabel}`;
}

function weatherIconSvg(iconKey) {
  const icons = {
    sun: '<path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />',
    'sun-high':
      '<path d="M14.828 14.828a4 4 0 1 0 -5.656 -5.656a4 4 0 0 0 5.656 5.656" /><path d="M6.343 17.657l-1.414 1.414" /><path d="M6.343 6.343l-1.414 -1.414" /><path d="M17.657 6.343l1.414 -1.414" /><path d="M17.657 17.657l1.414 1.414" /><path d="M4 12h-2" /><path d="M12 4v-2" /><path d="M20 12h2" /><path d="M12 20v2" />',
    cloud:
      '<path d="M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878" />',
    'cloud-rain':
      '<path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7" /><path d="M11 13v2m0 3v2m4 -5v2m0 3v2" />',
    'cloud-snow':
      '<path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7" /><path d="M11 15v.01m0 3v.01m0 3v.01m4 -4v.01m0 3v.01" />',
    'cloud-fog':
      '<path d="M7 16a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-12" /><path d="M5 20l14 0" />',
  };
  const body = icons[iconKey] || icons.cloud;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function weatherVisualTokens(loc, dateIso, weatherRow) {
  if (!weatherRow) {
    return {
      skyLabel: 'PENDING',
      skyClass: 'sky-mixed',
      tempLabel: 'DELTA N/A',
      tempClass: 'temp-na',
      iconKey: 'cloud',
    };
  }

  const code = Number(weatherRow.code ?? -1);
  let skyLabel = 'MIXED';
  let skyClass = 'sky-mixed';
  let iconKey = 'cloud';
  if (code === 0) {
    skyLabel = 'SUN';
    skyClass = 'sky-sun';
    iconKey = 'sun';
  } else if ([1, 2].includes(code)) {
    skyLabel = 'PARTIAL';
    skyClass = 'sky-partial';
    iconKey = 'sun-high';
  } else if (code === 3) {
    skyLabel = 'CLOUD';
    skyClass = 'sky-cloud';
    iconKey = 'cloud';
  } else if ([45, 48].includes(code)) {
    skyLabel = 'FOG';
    skyClass = 'sky-fog';
    iconKey = 'cloud-fog';
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    skyLabel = 'SNOW';
    skyClass = 'sky-snow';
    iconKey = 'cloud-snow';
  } else if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)
  ) {
    skyLabel = 'RAIN';
    skyClass = 'sky-rain';
    iconKey = 'cloud-rain';
  }

  const deltaInfo = temperatureDeltaForDate(loc, dateIso, weatherRow);
  let tempLabel = 'DELTA N/A';
  let tempClass = 'temp-na';
  if (deltaInfo.available) {
    const delta = deltaInfo.delta;
    tempLabel = `${formatSignedDegrees(delta)} VS AVG`;
    if (delta >= 10) {
      tempClass = 'temp-above';
    } else if (delta <= -10) {
      tempClass = 'temp-below';
    } else {
      tempClass = 'temp-near';
    }
  }

  return { skyLabel, skyClass, tempLabel, tempClass, iconKey };
}

function latestActualDateForLocation(loc) {
  const rows = sourceData?.daily_actual?.[loc] || [];
  if (!rows.length) return null;

  const todayIso = isoDate(new Date());
  const eligible = rows.filter((row) => row.date <= todayIso);
  return (eligible.length ? eligible[eligible.length - 1] : rows[rows.length - 1]).date;
}

function recentActualRows(loc, lookbackWeeks) {
  const rows = sourceData?.daily_actual?.[loc] || [];
  if (!rows.length) return [];

  const anchorIso = latestActualDateForLocation(loc);
  if (!anchorIso) return [];
  const anchorDate = parseIso(anchorIso);
  const weeks = clamp(Number(lookbackWeeks) || DEFAULT_HIGHLIGHTS_WEEKS, 1, MAX_HIGHLIGHTS_WEEKS);
  const lookbackDays = weeks * 7;
  const start = addDays(anchorDate, -(lookbackDays - 1));
  const startIso = isoDate(start);
  return rows.filter((row) => row.date >= startIso && row.date <= anchorIso);
}

function highlightsLocations(scope) {
  const normalized = normalizeStoreScope(scope);
  if (normalized === 'BOTH') return plannerLocationCodes();
  return [normalized];
}

function latestActualDateForLocations(locations) {
  const dates = locations
    .map((loc) => latestActualDateForLocation(loc))
    .filter((dateIso) => typeof dateIso === 'string' && dateIso.length === 10)
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}

function recentActualRowsForScope(scope, lookbackWeeks) {
  const locations = highlightsLocations(scope);
  const anchorIso = latestActualDateForLocations(locations);
  if (!anchorIso) return [];

  const anchorDate = parseIso(anchorIso);
  const weeks = clamp(Number(lookbackWeeks) || DEFAULT_HIGHLIGHTS_WEEKS, 1, MAX_HIGHLIGHTS_WEEKS);
  const lookbackDays = weeks * 7;
  const startIso = isoDate(addDays(anchorDate, -(lookbackDays - 1)));

  const rows = [];
  locations.forEach((loc) => {
    const locRows = sourceData?.daily_actual?.[loc] || [];
    locRows.forEach((row) => {
      if (row.date >= startIso && row.date <= anchorIso) {
        rows.push({ ...row, location: loc });
      }
    });
  });

  rows.sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return String(a.location).localeCompare(String(b.location));
  });
  return rows;
}

function plannedRowsForLocation(loc) {
  const byPreferred = sourceData?.planned_daily?.[loc];
  const byAlt = sourceData?.daily_planned?.[loc];
  const rows = Array.isArray(byPreferred) ? byPreferred : Array.isArray(byAlt) ? byAlt : [];
  return rows;
}

function hasPlannedHistory(loc) {
  return plannedRowsForLocation(loc).length > 0;
}

function pickNumber(row, keys) {
  for (const key of keys) {
    const value = Number(row?.[key]);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function expectedDayProfile(loc, dateIso) {
  const monthKey = monthKeyFromIso(dateIso);
  const weekday = shortWeekdayFromIso(dateIso);
  const profile = sourceData?.weekday_profile?.[loc]?.[monthKey]?.[weekday];
  if (!profile) return null;
  return {
    revenue: Number(profile.avg_revenue || 0),
    labor: Number(profile.avg_labor || 0),
    grossProfit: Number(profile.avg_gp_72 || 0),
    laborPct: Number(profile.labor_pct || 0),
  };
}

function roleRateForSlot(role) {
  const settings = normalizeSettingsProfile(state.settings);
  const name = String(role || '').toLowerCase();
  if (/manager/.test(name)) return Number(settings.managerPayRate || 28);
  if (/lead/.test(name)) return Number(settings.keyLeadPayRate || 17);
  return Number(settings.scooperPayRate || 15);
}

function estimatedLaborForDay(day) {
  return (day?.slots || []).reduce((sum, slot) => {
    const rate = roleRateForSlot(slot.role);
    return sum + slotHours(slot) * Math.max(1, Number(slot.headcount) || 1) * rate;
  }, 0);
}

function dayFinancialViability(loc, day) {
  const expected = expectedDayProfile(loc, day.date);
  if (!expected) {
    return {
      tone: 'pending',
      label: 'No Baseline',
      summary: 'Missing baseline for this day.',
      expectedRevenue: 0,
      expectedLabor: 0,
      expectedLaborPct: 0,
      plannedLabor: 0,
      plannedLaborPct: 0,
      expectedGp72: 0,
    };
  }

  const settings = normalizeSettingsProfile(state.settings);
  const plannedLabor = estimatedLaborForDay(day);
  const expectedRevenue = Number(expected.revenue || 0);
  const plannedLaborPct = expectedRevenue > 0 ? (plannedLabor / expectedRevenue) * 100 : 0;
  const expectedGp72 = expectedRevenue * 0.72 - plannedLabor;
  const target = Number(settings.targetProfile?.laborTargetPct || 24);
  const watch = Number(settings.targetProfile?.laborWatchPct || 27);

  let tone = 'good';
  let label = 'Likely Healthy';
  if (expectedGp72 < 0 || plannedLaborPct > watch) {
    tone = 'risk';
    label = 'Likely Unprofitable';
  } else if (plannedLaborPct > target) {
    tone = 'watch';
    label = 'Watch Labor Ratio';
  }

  const summary =
    tone === 'risk'
      ? 'Planned labor is high vs expected demand. Reduce support hours or tighten overlap.'
      : tone === 'watch'
      ? 'Schedule is near your labor watch threshold. Monitor weather and demand early.'
      : 'Schedule is within target labor band for expected demand.';

  return {
    tone,
    label,
    summary,
    expectedRevenue,
    expectedLabor: Number(expected.labor || 0),
    expectedLaborPct: Number(expected.laborPct || 0),
    plannedLabor,
    plannedLaborPct,
    expectedGp72,
  };
}

function overstaffAssessment(loc, row) {
  const expected = expectedDayProfile(loc, row.date);
  const actualRevenue = Number(row.revenue || 0);
  const actualLabor = Number(row.store_labor || 0);
  const actualLaborPct = actualRevenue > 0 ? (actualLabor / actualRevenue) * 100 : 0;
  const weatherRow = weatherForDate(loc, row.date);
  const signal = weatherImpactSignal(loc, row.date, weatherRow);

  if (!expected) {
    return {
      expectedRevenue: 0,
      expectedLabor: 0,
      expectedLaborPct: TARGET_LABOR_PCT,
      actualLaborPct,
      overstaffed: false,
      recommendation: 'No month baseline available for this date.',
      weather: weatherRow,
      weatherSignal: signal,
    };
  }

  const revenueMiss = actualRevenue < expected.revenue * 0.9;
  const laborPressure = actualLaborPct > expected.laborPct + 3 || actualLaborPct > TARGET_LABOR_PCT;
  const overstaffed = revenueMiss && laborPressure;

  let recommendation = 'Within expected staffing range.';
  if (overstaffed && signal.impact === 'down') {
    recommendation = 'Demand looked weather-suppressed (10F+ below expected). Next similar day, trim 1 peak/support slot; keep 1 opener + 2 closers.';
  } else if (overstaffed) {
    recommendation = 'Revenue underperformed vs baseline. Trim 1 non-closing support slot next similar day; keep 1 opener + 2 closers.';
  } else if (signal.impact === 'up') {
    recommendation = 'Demand-lift weather (10F+ above expected). Consider pre-adding 1 peak/support slot for similar upcoming days.';
  }

  return {
    expectedRevenue: expected.revenue,
    expectedLabor: expected.labor,
    expectedGrossProfit: expected.grossProfit || 0,
    expectedLaborPct: expected.laborPct,
    actualLaborPct,
    overstaffed,
    recommendation,
    weather: weatherRow,
    weatherSignal: signal,
  };
}

function recentNoteKey(loc, dateIso) {
  return `${loc}|${dateIso}`;
}

function getRecentAnalysisDraftNote(loc, dateIso) {
  const key = recentNoteKey(loc, dateIso);
  const payload = state.recentAnalysisDraftNotes?.[key];
  if (payload == null) return null;
  return String(payload);
}

function getRecentAnalysisNote(loc, dateIso) {
  const key = recentNoteKey(loc, dateIso);
  const payload = state.recentAnalysisNotes?.[key];
  if (!payload) return { text: '', updatedAt: null };
  if (typeof payload === 'string') return { text: payload, updatedAt: null };
  return {
    text: String(payload.note || ''),
    updatedAt: payload.updatedAt || null,
  };
}

function setRecentAnalysisNote(loc, dateIso, noteRaw) {
  const key = recentNoteKey(loc, dateIso);
  const note = String(noteRaw || '').trim();
  if (!state.recentAnalysisNotes || typeof state.recentAnalysisNotes !== 'object') {
    state.recentAnalysisNotes = {};
  }
  if (!note) {
    delete state.recentAnalysisNotes[key];
    return;
  }
  state.recentAnalysisNotes[key] = {
    note,
    updatedAt: new Date().toISOString(),
  };
}

function setRecentAnalysisDraftNote(loc, dateIso, noteRaw) {
  const key = recentNoteKey(loc, dateIso);
  const note = String(noteRaw || '');
  if (!state.recentAnalysisDraftNotes || typeof state.recentAnalysisDraftNotes !== 'object') {
    state.recentAnalysisDraftNotes = {};
  }
  state.recentAnalysisDraftNotes[key] = note;
}

function clearRecentAnalysisDraftNote(loc, dateIso) {
  const key = recentNoteKey(loc, dateIso);
  if (!state.recentAnalysisDraftNotes || typeof state.recentAnalysisDraftNotes !== 'object') return;
  delete state.recentAnalysisDraftNotes[key];
}

function templateSlotSnapshot(weekday, season, locationCode = state.location) {
  return buildTemplateSlots(weekday, season, locationCode).map((slot) => ({
    start: slot.start,
    end: slot.end,
    role: slot.role,
    headcount: Math.max(1, Number(slot.headcount) || 1),
  }));
}

function scaleSlotSnapshotByLabor(baseSlots, factorRaw) {
  const factor = clamp(Number(factorRaw) || 1, 0.4, 2.6);
  return baseSlots
    .map((slot) => {
      const baseCount = Math.max(1, Number(slot.headcount) || 1);
      const scaledCount = isAdjustableRole(slot.role) ? Math.max(0, Math.round(baseCount * factor)) : baseCount;
      return {
        start: slot.start,
        end: slot.end,
        role: slot.role,
        headcount: scaledCount,
      };
    })
    .filter((slot) => Number(slot.headcount) > 0);
}

function slotSnapshotForLabor(weekday, season, targetLabor, baselineLabor, locationCode = state.location) {
  const baseSlots = templateSlotSnapshot(weekday, season, locationCode);
  const baseline = Number.isFinite(Number(baselineLabor)) && Number(baselineLabor) > 0 ? Number(baselineLabor) : 1;
  const target = Number.isFinite(Number(targetLabor)) && Number(targetLabor) > 0 ? Number(targetLabor) : baseline;
  const factor = target / baseline;
  return scaleSlotSnapshotByLabor(baseSlots, factor);
}

function mergedSlotCompareRows(plannedSlots, actualSlots) {
  const map = new Map();

  plannedSlots.forEach((slot) => {
    const key = normalizedSlotKey(slot);
    map.set(key, {
      start: slot.start,
      end: slot.end,
      role: slot.role,
      plannedHeadcount: Number(slot.headcount) || 0,
      actualHeadcount: 0,
    });
  });

  actualSlots.forEach((slot) => {
    const key = normalizedSlotKey(slot);
    const existing = map.get(key);
    if (existing) {
      existing.actualHeadcount = Number(slot.headcount) || 0;
      return;
    }
    map.set(key, {
      start: slot.start,
      end: slot.end,
      role: slot.role,
      plannedHeadcount: 0,
      actualHeadcount: Number(slot.headcount) || 0,
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    const startDiff = parseTimeToHours(a.start) - parseTimeToHours(b.start);
    if (startDiff !== 0) return startDiff;
    return String(a.role).localeCompare(String(b.role));
  });
}

function locationWeatherDateRange(loc) {
  const anchorIso = latestActualDateForLocation(loc) || isoDate(new Date());
  const anchorDate = parseIso(anchorIso);
  const startDate = addDays(anchorDate, -(RECENT_WINDOW_DAYS - 1));
  const normalsStart = `${new Date().getFullYear() - NORMALS_YEARS_BACK}-01-01`;
  const endDate = addDays(new Date(), WEATHER_FORECAST_DAYS - 1);
  return {
    historyStart: isoDate(startDate),
    historyEnd: anchorIso,
    normalsStart,
    forecastEnd: isoDate(endDate),
  };
}

async function fetchWeatherForLocation(loc) {
  const coords = LOCATION_WEATHER_COORDS[loc];
  if (!coords) return;

  const { historyStart, historyEnd, normalsStart } = locationWeatherDateRange(loc);
  const historyUrl =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.lat}&longitude=${coords.lon}` +
    `&start_date=${historyStart}&end_date=${historyEnd}` +
    '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_hours,rain_sum,snowfall_sum' +
    '&temperature_unit=fahrenheit' +
    `&timezone=${encodeURIComponent(WEATHER_TIMEZONE)}`;

  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,rain_sum,snowfall_sum` +
    '&hourly=weathercode,precipitation,precipitation_probability' +
    '&temperature_unit=fahrenheit' +
    `&forecast_days=${WEATHER_FORECAST_DAYS}&timezone=${encodeURIComponent(WEATHER_TIMEZONE)}`;

  const normalsUrl =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.lat}&longitude=${coords.lon}` +
    `&start_date=${normalsStart}&end_date=${historyEnd}` +
    '&daily=temperature_2m_max' +
    '&temperature_unit=fahrenheit' +
    `&timezone=${encodeURIComponent(WEATHER_TIMEZONE)}`;

  const [historyRes, forecastRes, normalsRes] = await Promise.all([
    fetch(historyUrl),
    fetch(forecastUrl),
    fetch(normalsUrl),
  ]);
  if (!historyRes.ok || !forecastRes.ok || !normalsRes.ok) {
    throw new Error(
      `Weather API failed for ${loc}: archive=${historyRes.status} forecast=${forecastRes.status} normals=${normalsRes.status}`
    );
  }

  const history = await historyRes.json();
  const forecast = await forecastRes.json();
  const normals = await normalsRes.json();

  const historyDaily = history?.daily || {};
  const forecastDaily = forecast?.daily || {};
  const forecastHourly = forecast?.hourly || {};
  const normalsDaily = normals?.daily || {};

  const historyMap = {};
  const forecastMap = {};
  const hourlyMap = {};
  const normalBuckets = {};

  (historyDaily.time || []).forEach((dateIso, idx) => {
    historyMap[dateIso] = {
      date: dateIso,
      code: Number((historyDaily.weathercode || [])[idx] ?? 0),
      tempMax: Number((historyDaily.temperature_2m_max || [])[idx] ?? 0),
      tempMin: Number((historyDaily.temperature_2m_min || [])[idx] ?? 0),
      precipMm: Number((historyDaily.precipitation_sum || [])[idx] ?? 0),
      precipHours: Number((historyDaily.precipitation_hours || [])[idx] ?? 0),
      rainMm: Number((historyDaily.rain_sum || [])[idx] ?? 0),
      snowMm: Number((historyDaily.snowfall_sum || [])[idx] ?? 0),
      source: 'history',
    };
  });

  (forecastDaily.time || []).forEach((dateIso, idx) => {
    forecastMap[dateIso] = {
      date: dateIso,
      code: Number((forecastDaily.weathercode || [])[idx] ?? 0),
      tempMax: Number((forecastDaily.temperature_2m_max || [])[idx] ?? 0),
      tempMin: Number((forecastDaily.temperature_2m_min || [])[idx] ?? 0),
      precipMm: Number((forecastDaily.precipitation_sum || [])[idx] ?? 0),
      precipProb: Number((forecastDaily.precipitation_probability_max || [])[idx] ?? 0),
      rainMm: Number((forecastDaily.rain_sum || [])[idx] ?? 0),
      snowMm: Number((forecastDaily.snowfall_sum || [])[idx] ?? 0),
      source: 'forecast',
    };
  });

  (forecastHourly.time || []).forEach((timeIso, idx) => {
    const parts = String(timeIso || '').split('T');
    if (parts.length !== 2) return;
    const dateIso = parts[0];
    const hourRaw = parts[1].split(':')[0];
    const hour = Number(hourRaw);
    if (!Number.isFinite(hour)) return;

    if (!hourlyMap[dateIso]) hourlyMap[dateIso] = [];
    hourlyMap[dateIso].push({
      hour,
      code: Number((forecastHourly.weathercode || [])[idx] ?? 0),
      precipMm: Number((forecastHourly.precipitation || [])[idx] ?? 0),
      precipProb: Number((forecastHourly.precipitation_probability || [])[idx] ?? 0),
    });
  });

  Object.values(hourlyMap).forEach((rows) => rows.sort((a, b) => Number(a.hour) - Number(b.hour)));

  (normalsDaily.time || []).forEach((dateIso, idx) => {
    const key = String(dateIso || '').slice(5, 10);
    const tempMax = Number((normalsDaily.temperature_2m_max || [])[idx] ?? NaN);
    if (key.length !== 5 || key === '02-29' || !Number.isFinite(tempMax)) return;
    if (!normalBuckets[key]) normalBuckets[key] = [];
    normalBuckets[key].push(tempMax);
  });

  const normalsMap = {};
  Object.entries(normalBuckets).forEach(([key, values]) => {
    if (!values.length) return;
    const sum = values.reduce((acc, n) => acc + Number(n || 0), 0);
    normalsMap[key] = sum / values.length;
  });

  weatherData[loc] = {
    history: historyMap,
    forecast: forecastMap,
    normals: normalsMap,
    hourly: hourlyMap,
  };
}

async function loadWeatherData() {
  try {
    await Promise.all(['EP', 'NL'].map((loc) => fetchWeatherForLocation(loc)));
    weatherData.loaded = true;
    weatherData.error = null;
  } catch (err) {
    weatherData.loaded = false;
    weatherData.error = String(err);
    console.warn('Weather load failed', err);
  }
}

function renderPlannerBoard() {
  const container = document.getElementById('plannerBoard');
  if (!container) return;

  const scope = normalizeStoreScope(state.highlightsStoreScope);
  if (scope === 'BOTH') {
    container.innerHTML = `
      <div class="board-head">
        <div>
          <h2>Weekly Plan</h2>
          <p>Both Stores scope is for analysis. Select East Passyunk or Northern Liberties to edit a store-level weekly plan.</p>
        </div>
      </div>
    `;
    return;
  }

  const pool = employeePoolForLocation();

  const weekCards = state.weeks
    .map((week, weekIdx) => {
      const totalHours = weekLaborHours(week);

      const dayCards = week.days
        .map((day, dayIdx) => {
          const validation = dayValidation(day);
          const pendingReq = activePendingRequestForDay(day);
          const dayStatusClass = pendingReq ? 'pending' : day.lastDecision === 'approved' ? 'approved' : '';
          const rec = dayRecommendation(state.location, day);
          const viability = dayFinancialViability(state.location, day);
          const weatherRow = rec.weather;
          const weatherSignal = rec.signal;
          const weatherVisual = weatherVisualTokens(state.location, day.date, weatherRow);
          const ptoSummary = ptoSummaryForDay(state.location, day);
          const heatTintClass =
            weatherVisual.tempClass === 'temp-above'
              ? 'weather-heat-hot'
              : weatherVisual.tempClass === 'temp-below'
              ? 'weather-heat-cold'
              : 'weather-heat-neutral';

          const rows = day.slots
            .map((slot, slotIdx) => {
              const assignmentControls = slot.assignments
                .map(
                  (assigned, assignIdx) => `
                <div class="assignment-combobox">
                  <input
                    type="text"
                    class="assignment-input"
                    placeholder="Type employee name..."
                    value="${esc(assigned || '')}"
                    data-action="slot-assignment-input"
                    data-week="${weekIdx}"
                    data-day="${dayIdx}"
                    data-slot="${slotIdx}"
                    data-assign="${assignIdx}"
                    autocomplete="off"
                  />
                  <div class="assignment-match-list">
                    ${assignmentMatchChipsHtml(pool, assigned, weekIdx, dayIdx, slotIdx, assignIdx)}
                  </div>
                  <button
                    type="button"
                    class="small-btn assignment-repeat-btn"
                    data-action="repeat-assignment-12w"
                    data-week="${weekIdx}"
                    data-day="${dayIdx}"
                    data-slot="${slotIdx}"
                    data-assign="${assignIdx}"
                    ${String(assigned || '').trim() ? '' : 'disabled'}
                  >Assign Next 12 Weeks</button>
                </div>
              `
                )
                .join('');

              return `
              <tr>
                <td>
                  <input
                    type="time"
                    value="${esc(slot.start)}"
                    data-action="slot-field"
                    data-field="start"
                    data-week="${weekIdx}"
                    data-day="${dayIdx}"
                    data-slot="${slotIdx}"
                  />
                  <input
                    type="time"
                    value="${esc(slot.end)}"
                    data-action="slot-field"
                    data-field="end"
                    data-week="${weekIdx}"
                    data-day="${dayIdx}"
                    data-slot="${slotIdx}"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value="${esc(slot.role)}"
                    data-action="slot-field"
                    data-field="role"
                    data-week="${weekIdx}"
                    data-day="${dayIdx}"
                    data-slot="${slotIdx}"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value="${Number(slot.headcount) || 1}"
                    data-action="slot-field"
                    data-field="headcount"
                    data-week="${weekIdx}"
                    data-day="${dayIdx}"
                    data-slot="${slotIdx}"
                  />
                </td>
                <td><div class="slot-assignments">${assignmentControls}</div></td>
                <td>
                  <button
                    type="button"
                    class="small-btn"
                    data-action="delete-slot"
                    data-week="${weekIdx}"
                    data-day="${dayIdx}"
                    data-slot="${slotIdx}"
                  >Delete</button>
                </td>
              </tr>
            `;
            })
            .join('');

          const canSubmit = day.hasException && !pendingReq && validation.ok;
          const lastWeekRef = lastWeekReferenceForDay(weekIdx, dayIdx);
          const lastWeekRows = (lastWeekRef.slots || [])
            .map(
              (slot) =>
                `<tr>
                  <td>${esc(slot.start)}-${esc(slot.end)}</td>
                  <td>${esc(slot.role)}</td>
                  <td>${Number(slot.headcount) || 1}</td>
                  <td>${esc((slot.assignments || []).filter((name) => String(name || '').trim()).join(', ') || 'Unassigned')}</td>
                </tr>`
            )
            .join('');

          return `
            <article class="day-card ${dayStatusClass}">
              <div class="day-head">
                <h3>${day.weekday} · ${formatDateLabel(day.date)}</h3>
                <span class="badge">${SEASON_LABELS[day.season] || day.season}</span>
              </div>
              <p class="day-help">Suggested slots. Managers assign people. Exception requests require approval before export.</p>
              <div class="viability-box viability-${esc(viability.tone)}">
                <p class="viability-label">Expected Shift Viability</p>
                <p class="viability-main">${esc(viability.label)}</p>
                <p class="viability-line"><strong>Expected revenue:</strong> ${USD.format(Math.round(viability.expectedRevenue || 0))} · <strong>Planned labor:</strong> ${USD.format(Math.round(viability.plannedLabor || 0))}</p>
                <p class="viability-line"><strong>Planned labor %:</strong> ${NUM.format(viability.plannedLaborPct || 0)}% · <strong>Expected GP(72):</strong> ${USD.format(Math.round(viability.expectedGp72 || 0))}</p>
                <p class="viability-note">${esc(viability.summary)}</p>
              </div>
              <div class="weather-box ${heatTintClass}">
                <div class="weather-header">
                  <span class="weather-icon ${weatherVisual.skyClass}" aria-hidden="true">${weatherIconSvg(weatherVisual.iconKey)}</span>
                  <div class="weather-copy">
                    <p class="weather-label">${esc(weatherVisual.skyLabel)}</p>
                    <p class="weather-delta ${weatherVisual.tempClass}">${esc(weatherVisual.tempLabel)}</p>
                  </div>
                </div>
                <p class="weather-line"><strong>Weather:</strong> ${esc(weatherLine(state.location, day.date, weatherRow))}</p>
                <p class="weather-line ${weatherClass(weatherSignal.impact)}"><strong>${esc(weatherSignal.label)}:</strong> ${esc(rec.message)}</p>
                ${
                  rec.action
                    ? `<button
                         type="button"
                         class="small-btn weather-rec-btn"
                         data-action="accept-recommendation"
                         data-week="${weekIdx}"
                         data-day="${dayIdx}"
                         ${rec.canApply ? '' : 'disabled'}
                       >${esc(rec.buttonLabel)}</button>`
                    : ''
                }
              </div>
              <div class="last-week-box">
                <p class="last-week-title">Last Week Schedule</p>
                <p class="status-line"><strong>${esc(lastWeekRef.label)}</strong></p>
                <div class="last-week-actions">
                  <button type="button" class="small-btn" data-action="toggle-last-week-helper" data-week="${weekIdx}" data-day="${dayIdx}">
                    ${day.showLastWeekHelper ? 'Hide' : 'View'} Last Week
                  </button>
                  <button
                    type="button"
                    class="small-btn"
                    data-action="copy-last-week"
                    data-copy-mode="names"
                    data-week="${weekIdx}"
                    data-day="${dayIdx}"
                    ${lastWeekRef.slots.length ? '' : 'disabled'}
                  >Copy Names</button>
                  <button
                    type="button"
                    class="small-btn"
                    data-action="copy-last-week"
                    data-copy-mode="shifts"
                    data-week="${weekIdx}"
                    data-day="${dayIdx}"
                    ${lastWeekRef.slots.length ? '' : 'disabled'}
                  >Copy Shifts</button>
                  <button
                    type="button"
                    class="small-btn"
                    data-action="copy-last-week"
                    data-copy-mode="both"
                    data-week="${weekIdx}"
                    data-day="${dayIdx}"
                    ${lastWeekRef.slots.length ? '' : 'disabled'}
                  >Copy Both</button>
                </div>
                ${
                  day.showLastWeekHelper
                    ? `<div class="last-week-preview">
                         ${
                           lastWeekRows
                             ? `<table class="last-week-preview-table">
                                  <thead><tr><th>Time</th><th>Role</th><th>#</th><th>Assigned</th></tr></thead>
                                  <tbody>${lastWeekRows}</tbody>
                                </table>`
                             : '<p class="status-line">No schedule is available for last week on this weekday.</p>'
                         }
                       </div>`
                    : ''
                }
              </div>
              <table class="slot-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Role</th>
                    <th>#</th>
                    <th>Assigned</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>

              <div class="day-actions">
                <button type="button" class="small-btn" data-action="add-slot" data-week="${weekIdx}" data-day="${dayIdx}">+ Add Shift</button>
                <textarea
                  placeholder="Reason for exception request (event, weather, expected demand spike)..."
                  data-action="day-note"
                  data-week="${weekIdx}"
                  data-day="${dayIdx}"
                >${esc(day.note || '')}</textarea>
                <button
                  type="button"
                  class="small-btn"
                  data-action="submit-request"
                  data-week="${weekIdx}"
                  data-day="${dayIdx}"
                  ${canSubmit ? '' : 'disabled'}
                >Submit Exception Request</button>
                <p class="status-line ${validation.ok ? 'status-ok' : 'status-risk'}">${esc(validation.message)}</p>
                ${pendingReq ? `<p class="status-line status-pending">Pending admin approval · request ${esc(pendingReq.id.slice(-6))}</p>` : ''}
                ${day.lastDecision === 'approved' ? '<p class="status-line status-ok">Last change request approved.</p>' : ''}
                ${day.lastDecision === 'rejected' ? '<p class="status-line status-risk">Last change request rejected.</p>' : ''}
                ${day.hasException ? '<p class="status-line status-pending">Unsubmitted exception edits detected.</p>' : ''}
                ${
                  ptoSummary.total
                    ? `<p class="status-line ${ptoSummary.conflicts.length ? 'status-risk' : 'status-pending'}">PTO: ${ptoSummary.approvedCount} approved · ${ptoSummary.pendingCount} pending${
                        ptoSummary.conflicts.length
                          ? ` · conflict${ptoSummary.conflicts.length === 1 ? '' : 's'} with ${esc(ptoSummary.conflicts.map((row) => row.employee).join(', '))}`
                          : ''
                      }</p>`
                    : '<p class="status-line">PTO: No requests on this day.</p>'
                }
              </div>
            </article>
          `;
        })
        .join('');

      return `
        <details class="week-card" ${weekIdx < 2 ? 'open' : ''}>
          <summary>
            Week of ${formatDateFull(week.weekStart)}
            <span class="week-meta">· ${NUM.format(totalHours)} scheduled labor-hours (slots only)</span>
          </summary>
          ${
            weekIdx === 0
              ? `<div class="day-actions" style="margin-top:0.5rem;">
                   <p class="status-line">Next-week acceptance gate: ${nextWeekApprovalBadge()}</p>
                   <button
                     type="button"
                     class="small-btn"
                     data-action="submit-next-week-approval"
                     ${state.nextWeekApproval.status === 'pending' ? 'disabled' : ''}
                   >Submit Next Week to General Manager</button>
                 </div>`
              : ''
          }
          <div class="day-grid">${dayCards}</div>
        </details>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="board-head">
      <div>
        <h2>${LOCATION_LABELS[state.location]} Weekly Plan</h2>
        <p>${state.horizonWeeks} week horizon from ${formatDateFull(state.startDate)}. No auto-assignment is performed. Weekly templates are month-invariant and Monday mirrors Tuesday for 7-day scenarios.</p>
      </div>
    </div>
    ${weekCards}
  `;
}

const NUM = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function assignmentGapSummary(weeksAhead = 4) {
  const maxWeeks = Math.max(0, Number(weeksAhead) || 0);
  const rows = [];

  for (let weekIdx = 0; weekIdx < Math.min(maxWeeks, state.weeks.length); weekIdx += 1) {
    const week = state.weeks[weekIdx];
    if (!week) continue;

    let unassigned = 0;
    let daysWithGaps = 0;
    (week.days || []).forEach((day) => {
      let dayGap = false;
      (day.slots || []).forEach((slot) => {
        const headcount = Math.max(1, Number(slot.headcount) || 1);
        for (let idx = 0; idx < headcount; idx += 1) {
          if (!String((slot.assignments || [])[idx] || '').trim()) {
            unassigned += 1;
            dayGap = true;
          }
        }
      });
      if (dayGap) daysWithGaps += 1;
    });

    if (unassigned > 0) {
      rows.push({
        weekLabel: `Week of ${formatDateLabel(week.weekStart)}`,
        unassigned,
        daysWithGaps,
      });
    }
  }

  return rows;
}

function requestSummaryCounts() {
  const summary = { pending: 0, approved: 0, rejected: 0 };
  state.requests.forEach((req) => {
    if (summary[req.status] != null) summary[req.status] += 1;
  });
  return summary;
}

function nextWeekChecks() {
  const week = state.weeks[0];
  if (!week) {
    return {
      pendingRequests: 0,
      unsubmittedExceptions: 0,
      unassignedPositions: 0,
      invalidCoverageDays: 0,
      ptoConflicts: 0,
    };
  }

  let pendingRequests = 0;
  let unsubmittedExceptions = 0;
  let unassignedPositions = 0;
  let invalidCoverageDays = 0;
  let ptoConflicts = 0;

  week.days.forEach((day) => {
    if (day.pendingRequestId) pendingRequests += 1;
    if (day.hasException) unsubmittedExceptions += 1;
    if (!dayValidation(day).ok) invalidCoverageDays += 1;
    ptoConflicts += ptoSummaryForDay(state.location, day).conflicts.length;

    day.slots.forEach((slot) => {
      const headcount = Math.max(1, Number(slot.headcount) || 1);
      for (let idx = 0; idx < headcount; idx += 1) {
        const assigned = (slot.assignments[idx] || '').trim();
        if (!assigned) unassignedPositions += 1;
      }
    });
  });

  return {
    pendingRequests,
    unsubmittedExceptions,
    unassignedPositions,
    invalidCoverageDays,
    ptoConflicts,
  };
}

function nextWeekApprovalBadge() {
  const status = state.nextWeekApproval?.status || 'draft';
  if (status === 'approved') return '<span class="badge status-ok">GM Approved</span>';
  if (status === 'pending') return '<span class="badge status-pending">GM Review Pending</span>';
  if (status === 'rejected') return '<span class="badge status-risk">GM Rejected</span>';
  return '<span class="badge">Draft</span>';
}

function invalidateNextWeekApproval(weekIdx) {
  if (weekIdx !== 0) return;
  const status = state.nextWeekApproval?.status || 'draft';
  if (status === 'approved') {
    state.nextWeekApproval = {
      status: 'draft',
      submittedAt: null,
      reviewedAt: null,
      reviewer: 'General Manager',
    };
  }
}

function submitNextWeekForGMApproval() {
  const checks = nextWeekChecks();
  if (checks.pendingRequests > 0) {
    window.alert(`Resolve ${checks.pendingRequests} pending policy request(s) in next week before GM review.`);
    return;
  }
  if (checks.unsubmittedExceptions > 0) {
    window.alert(`Submit/resolve ${checks.unsubmittedExceptions} day-level exception edit(s) in next week first.`);
    return;
  }
  if (checks.invalidCoverageDays > 0) {
    window.alert(`Fix coverage issues on ${checks.invalidCoverageDays} next-week day(s) before GM review.`);
    return;
  }
  if (checks.unassignedPositions > 0) {
    window.alert(`Assign all next-week slots first (${checks.unassignedPositions} unassigned positions remaining).`);
    return;
  }
  if (checks.ptoConflicts > 0) {
    window.alert(`Resolve PTO conflicts first (${checks.ptoConflicts} assigned slot${checks.ptoConflicts === 1 ? '' : 's'} overlap with PTO requests).`);
    return;
  }

  state.nextWeekApproval = {
    status: 'pending',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewer: 'General Manager',
  };
  saveState();
  renderAll();
}

function setGMDecision(status) {
  if (!['approved', 'rejected'].includes(status)) return;
  if ((state.nextWeekApproval?.status || 'draft') !== 'pending') return;

  state.nextWeekApproval = {
    status,
    submittedAt: state.nextWeekApproval.submittedAt || new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
    reviewer: 'General Manager',
  };

  if (status === 'rejected' && state.weeks[0]) {
    state.weeks[0].days.forEach((day) => {
      day.hasException = true;
      day.lastDecision = 'rejected';
    });
  }

  saveState();
  renderAll();
}

function renderRecentPerformanceSection() {
  const scope = normalizeStoreScope(state.highlightsStoreScope);
  const scopeLabel = scope === 'BOTH' ? 'Both Stores' : LOCATION_LABELS[scope] || scope;
  const scopeLocations = highlightsLocations(scope);
  const lookbackWeeks = clamp(Number(state.highlightsLookbackWeeks) || DEFAULT_HIGHLIGHTS_WEEKS, 1, MAX_HIGHLIGHTS_WEEKS);
  const compareMode = state.highlightsCompareMode === 'planned_vs_actual' ? 'planned_vs_actual' : 'actual_vs_baseline';
  const compareTitle = compareMode === 'planned_vs_actual' ? 'Expected from Planned Targets' : 'Expected from Historical Baseline';
  const rows = recentActualRowsForScope(scope, lookbackWeeks);
  const weatherNote = weatherData.error
    ? `<p class="help">Weather feed unavailable (${esc(weatherData.error)}). Sales-impact commentary uses profitability/revenue variance only.</p>`
    : '<p class="help">Weather commentary uses day high vs normal (+/-10F) plus evening precipitation timing to estimate demand effect.</p>';

  const plannedByDate = new Map();
  scopeLocations.forEach((loc) => {
    plannedRowsForLocation(loc)
      .filter((row) => row && typeof row === 'object' && typeof row.date === 'string')
      .forEach((row) => plannedByDate.set(`${loc}|${row.date}`, row));
  });

  if (!rows.length) {
    return `
      <h3>Recent Staffing Analysis · ${esc(scopeLabel)} (${lookbackWeeks} Week${lookbackWeeks === 1 ? '' : 's'} · ${compareTitle})</h3>
      <p class="help">Past work only.</p>
      ${weatherNote}
      <p class="help">No recent daily actual rows are available for this location yet.</p>
    `;
  }

  const toPct = (actual, expected) => (expected > 0 ? (actual / expected) * 100 : null);
  const meterWidth = (pct) => {
    if (!Number.isFinite(Number(pct))) return 0;
    return clamp((Number(pct) / 150) * 100, 0, 100);
  };
  const pctLabel = (pct) => (Number.isFinite(Number(pct)) ? `${NUM.format(Number(pct))}%` : 'N/A');
  const gaugeTone = (pct) => {
    if (!Number.isFinite(Number(pct))) return 'tone-neutral';
    if (pct >= 105) return 'tone-strong';
    if (pct >= 95) return 'tone-close';
    if (pct >= 80) return 'tone-watch';
    return 'tone-risk';
  };
  const varianceNarrative = (salesAttainment, signal) => {
    if (!Number.isFinite(Number(salesAttainment))) return 'Expected sales baseline unavailable for this date.';
    const delta = Number(salesAttainment) - 100;
    if (Math.abs(delta) < 8) return 'Sales were close to expected. No strong external variance signal.';
    if (signal?.impact === 'down' && delta <= -8) {
      return `Sales ran ${NUM.format(Math.abs(delta))}% below expected with a weather downside signal (${signal.label}).`;
    }
    if (signal?.impact === 'up' && delta >= 8) {
      return `Sales ran ${NUM.format(delta)}% above expected with a weather lift signal (${signal.label}).`;
    }
    if (delta < 0) return `Sales ran ${NUM.format(Math.abs(delta))}% below expected; likely non-weather factors should be noted.`;
    return `Sales ran ${NUM.format(delta)}% above expected; likely event or promotion uplift beyond weather.`;
  };

  const rowsWithMetrics = rows.map((row) => {
    const loc = row.location;
    const expected = expectedDayProfile(loc, row.date);
    const plannedRow = plannedByDate.get(`${loc}|${row.date}`) || null;
    const expectedRevenueBaseline = Number(expected?.revenue || 0);
    const expectedLaborBaseline = Number(expected?.labor || 0);
    const expectedProfitBaseline = Number(expected?.grossProfit || 0);

    const plannedRevenue = pickNumber(plannedRow, ['planned_revenue', 'revenue', 'sales', 'gross_sales']);
    const plannedLabor = pickNumber(plannedRow, ['planned_labor', 'store_labor', 'labor', 'total_labor']);
    const plannedProfit = pickNumber(plannedRow, ['planned_gross_profit_72', 'gross_profit_72', 'gross_profit', 'gp72']);

    const usePlannedRevenue = compareMode === 'planned_vs_actual' && Number.isFinite(plannedRevenue) && Number(plannedRevenue) > 0;
    const usePlannedLabor = compareMode === 'planned_vs_actual' && Number.isFinite(plannedLabor) && Number(plannedLabor) > 0;
    const usePlannedProfit = compareMode === 'planned_vs_actual' && Number.isFinite(plannedProfit) && Number(plannedProfit) > 0;

    const expectedRevenue = usePlannedRevenue ? Number(plannedRevenue) : expectedRevenueBaseline;
    const expectedLabor = usePlannedLabor ? Number(plannedLabor) : expectedLaborBaseline;
    const expectedProfit = usePlannedProfit ? Number(plannedProfit) : expectedProfitBaseline;

    const fallbackFields = [];
    if (compareMode === 'planned_vs_actual') {
      if (!usePlannedRevenue) fallbackFields.push('revenue');
      if (!usePlannedLabor) fallbackFields.push('labor');
      if (!usePlannedProfit) fallbackFields.push('profit');
    }
    const expectedSource =
      compareMode !== 'planned_vs_actual'
        ? 'historical_baseline'
        : fallbackFields.length === 0
        ? 'planned_targets'
        : fallbackFields.length === 3
        ? 'historical_baseline_fallback'
        : 'mixed_fallback';
    const expectedSourceLabel =
      expectedSource === 'planned_targets'
        ? 'Planned targets'
        : expectedSource === 'historical_baseline'
        ? 'Historical baseline'
        : expectedSource === 'historical_baseline_fallback'
        ? 'Fallback baseline (planned targets missing)'
        : 'Mixed source (partial fallback)';
    const expectedSourceDetail =
      compareMode === 'planned_vs_actual' && fallbackFields.length
        ? `Fallback fields: ${fallbackFields.join(', ')}`
        : compareMode === 'planned_vs_actual'
        ? 'All expected fields sourced from planned targets'
        : 'Expected fields sourced from historical month/weekday profile';

    const actualRevenue = Number(row.revenue || 0);
    const actualLabor = Number(row.store_labor || 0);
    const actualProfitSource = Number(row.gross_profit_72);
    const actualProfit = Number.isFinite(actualProfitSource) ? actualProfitSource : actualRevenue - actualLabor;
    const actualLaborPct = actualRevenue > 0 ? (actualLabor / actualRevenue) * 100 : 0;
    const expectedLaborPct = expectedRevenue > 0 ? (expectedLabor / expectedRevenue) * 100 : TARGET_LABOR_PCT;

    const profitAttainment = toPct(actualProfit, expectedProfit);
    const salesAttainment = toPct(actualRevenue, expectedRevenue);
    const laborAttainment = toPct(actualLaborPct, expectedLaborPct);

    const assessment = overstaffAssessment(loc, row);
    const weatherText = weatherLine(loc, row.date, assessment.weather);
    const weatherVisual = weatherVisualTokens(loc, row.date, assessment.weather);
    const heatTintClass =
      weatherVisual.tempClass === 'temp-above'
        ? 'weather-heat-hot'
        : weatherVisual.tempClass === 'temp-below'
        ? 'weather-heat-cold'
        : 'weather-heat-neutral';
    const note = getRecentAnalysisNote(loc, row.date);
    const noteDraft = getRecentAnalysisDraftNote(loc, row.date);
    const noteText = noteDraft == null ? note.text : noteDraft;

    return {
      row,
      loc,
      expectedRevenue,
      expectedLabor,
      expectedProfit,
      actualRevenue,
      actualLabor,
      actualProfit,
      actualLaborPct,
      expectedLaborPct,
      profitAttainment,
      salesAttainment,
      laborAttainment,
      assessment,
      weatherText,
      weatherVisual,
      heatTintClass,
      note,
      noteText,
      noteKey: recentNoteKey(loc, row.date),
      expectedSource,
      expectedSourceLabel,
      expectedSourceDetail,
    };
  });

  const summaryByLocation = new Map();
  rowsWithMetrics.forEach((item) => {
    if (!summaryByLocation.has(item.loc)) {
      summaryByLocation.set(item.loc, {
        days: 0,
        actualProfit: 0,
        expectedProfit: 0,
        actualRevenue: 0,
        expectedRevenue: 0,
        weatherUps: 0,
        weatherDowns: 0,
      });
    }
    const agg = summaryByLocation.get(item.loc);
    agg.days += 1;
    agg.actualProfit += Number(item.actualProfit || 0);
    agg.expectedProfit += Number(item.expectedProfit || 0);
    agg.actualRevenue += Number(item.actualRevenue || 0);
    agg.expectedRevenue += Number(item.expectedRevenue || 0);
    if (item.assessment.weatherSignal?.impact === 'up') agg.weatherUps += 1;
    if (item.assessment.weatherSignal?.impact === 'down') agg.weatherDowns += 1;
  });

  const portfolioActualProfit = rowsWithMetrics.reduce((sum, item) => sum + Number(item.actualProfit || 0), 0);
  const portfolioExpectedProfit = rowsWithMetrics.reduce((sum, item) => sum + Number(item.expectedProfit || 0), 0);
  const portfolioAttainment = toPct(portfolioActualProfit, portfolioExpectedProfit);
  const weatherAlignedLiftDays = rowsWithMetrics.filter(
    (item) => Number(item.salesAttainment || 0) >= 108 && item.assessment.weatherSignal?.impact === 'up'
  ).length;
  const weatherAlignedDropDays = rowsWithMetrics.filter(
    (item) => Number(item.salesAttainment || 0) <= 92 && item.assessment.weatherSignal?.impact === 'down'
  ).length;
  const unexplainedDropDays = rowsWithMetrics.filter(
    (item) => Number(item.salesAttainment || 0) <= 92 && item.assessment.weatherSignal?.impact !== 'down'
  ).length;
  const plannedSourceDays = rowsWithMetrics.filter((item) => item.expectedSource === 'planned_targets').length;
  const fallbackSourceDays = rowsWithMetrics.filter(
    (item) => item.expectedSource === 'historical_baseline_fallback' || item.expectedSource === 'mixed_fallback'
  ).length;
  const explainedShare =
    rowsWithMetrics.length > 0
      ? ((weatherAlignedLiftDays + weatherAlignedDropDays) / rowsWithMetrics.length) * 100
      : 0;
  const expectedSourceSummary =
    compareMode === 'planned_vs_actual'
      ? `${plannedSourceDays} row${plannedSourceDays === 1 ? '' : 's'} used planned targets; ${fallbackSourceDays} row${
          fallbackSourceDays === 1 ? '' : 's'
        } used baseline fallback.`
      : 'Expected values source: historical month/weekday baseline.';

  const locationCards = scopeLocations
    .map((loc) => {
      const agg = summaryByLocation.get(loc);
      if (!agg) return '';
      const attainment = toPct(agg.actualProfit, agg.expectedProfit);
      const revenueAttainment = toPct(agg.actualRevenue, agg.expectedRevenue);
      const tone = gaugeTone(attainment);
      const gaugePct = Number.isFinite(Number(attainment)) ? clamp(Number(attainment), 0, 150) : 0;
      return `
        <article class="recent-location-card ${tone}">
          <div class="recent-location-head">
            <h4>${esc(LOCATION_LABELS[loc] || loc)}</h4>
            <span class="badge">${agg.days} day${agg.days === 1 ? '' : 's'}</span>
          </div>
          <div class="profit-gauge" style="--pct:${gaugePct.toFixed(1)};">
            <div class="profit-gauge-inner">
              <strong>${pctLabel(attainment)}</strong>
              <span>Profit vs Expected</span>
            </div>
          </div>
          <p class="help">Gross profit: ${USD.format(agg.actualProfit)} actual vs ${USD.format(agg.expectedProfit)} expected.</p>
          <p class="help">Sales attainment: ${pctLabel(revenueAttainment)} · Weather lift days: ${agg.weatherUps} · Weather risk days: ${agg.weatherDowns}</p>
        </article>
      `;
    })
    .join('');

  const dayCards = rowsWithMetrics
    .slice()
    .sort((a, b) => {
      if (a.row.date > b.row.date) return -1;
      if (a.row.date < b.row.date) return 1;
      return String(a.loc).localeCompare(String(b.loc));
    })
    .map((item) => {
      const season = seasonForDate(parseIso(item.row.date));
      const salesNarrative = varianceNarrative(item.salesAttainment, item.assessment.weatherSignal);
      const weatherSummary = item.assessment.weatherSignal?.reason || 'No weather signal detected.';
      const noteUpdated = item.note.updatedAt ? `Saved ${new Date(item.note.updatedAt).toLocaleString()}` : 'No note saved yet';
      const profitTone = gaugeTone(item.profitAttainment);
      const salesTone = gaugeTone(item.salesAttainment);
      const laborTone = Number.isFinite(Number(item.laborAttainment))
        ? Number(item.laborAttainment) <= 100
          ? 'tone-strong'
          : Number(item.laborAttainment) <= 110
          ? 'tone-close'
          : Number(item.laborAttainment) <= 125
          ? 'tone-watch'
          : 'tone-risk'
        : 'tone-neutral';
      return `
        <article class="recent-review-card">
          <div class="day-head">
            <h3>${esc(formatDateFull(item.row.date))}</h3>
            <div class="recent-day-badges">
              <span class="badge">${esc(LOCATION_LABELS[item.loc] || item.loc)}</span>
              <span class="badge">${esc(SEASON_LABELS[season] || season)}</span>
            </div>
          </div>
          <div class="recent-meter-grid">
            <div class="recent-meter ${profitTone}">
              <p><strong>Profitability</strong><span>${pctLabel(item.profitAttainment)}</span></p>
              <div class="recent-meter-track"><span style="width:${meterWidth(item.profitAttainment).toFixed(1)}%"></span></div>
              <p class="help">${USD.format(item.actualProfit)} actual vs ${USD.format(item.expectedProfit)} expected</p>
            </div>
            <div class="recent-meter ${salesTone}">
              <p><strong>Sales</strong><span>${pctLabel(item.salesAttainment)}</span></p>
              <div class="recent-meter-track"><span style="width:${meterWidth(item.salesAttainment).toFixed(1)}%"></span></div>
              <p class="help">${USD.format(item.actualRevenue)} actual vs ${USD.format(item.expectedRevenue)} expected</p>
            </div>
            <div class="recent-meter ${laborTone}">
              <p><strong>Labor Efficiency</strong><span>${pctLabel(item.laborAttainment)}</span></p>
              <div class="recent-meter-track"><span style="width:${meterWidth(item.laborAttainment).toFixed(1)}%"></span></div>
              <p class="help">${NUM.format(item.actualLaborPct)}% actual labor vs ${NUM.format(item.expectedLaborPct)}% expected labor</p>
            </div>
          </div>
          <p class="help"><strong>Expected source:</strong> ${esc(item.expectedSourceLabel)} · ${esc(item.expectedSourceDetail)}</p>
          <div class="weather-box ${item.heatTintClass}">
            <div class="weather-header">
              <span class="weather-icon ${item.weatherVisual.skyClass}" aria-hidden="true">${weatherIconSvg(item.weatherVisual.iconKey)}</span>
              <div class="weather-copy">
                <p class="weather-label">${esc(item.weatherVisual.skyLabel)}</p>
                <p class="weather-delta ${item.weatherVisual.tempClass}">${esc(item.weatherVisual.tempLabel)}</p>
              </div>
            </div>
            <p class="weather-line"><strong>Weather:</strong> ${esc(item.weatherText)}</p>
            <p class="weather-line"><strong>Impact Read:</strong> ${esc(weatherSummary)}</p>
            <p class="weather-line"><strong>Sales Context:</strong> ${esc(salesNarrative)}</p>
          </div>
          <div class="recent-note-box">
            <label for="recent-note-${esc(item.noteKey)}">Context Note</label>
            <textarea
              id="recent-note-${esc(item.noteKey)}"
              data-action="recent-analysis-note-draft"
              data-location="${esc(item.loc)}"
              data-date="${esc(item.row.date)}"
              placeholder="Add context for future review (events, promos, nearby activity, ops issues)..."
            >${esc(item.noteText)}</textarea>
            <div class="note-submit-row">
              <button
                type="button"
                class="small-btn"
                data-action="submit-recent-analysis-note"
                data-location="${esc(item.loc)}"
                data-date="${esc(item.row.date)}"
              >Save Context Note</button>
              <p class="help">${esc(noteUpdated)} · Notes are saved after you click submit.</p>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  return `
    <h3>Recent Staffing Analysis · ${esc(scopeLabel)} (${lookbackWeeks} Week${lookbackWeeks === 1 ? '' : 's'} · ${compareTitle})</h3>
    <p class="help">Visual review of profitability and demand variance. Focus is actual performance against expected outcomes.</p>
    ${weatherNote}
    <article class="analysis-summary-card">
      <h4>Weekly Analysis Summary</h4>
      <p class="help">This section checks whether over/under-performance aligned with weather or likely came from other factors.</p>
      <ul>
        <li>${weatherAlignedLiftDays} day${weatherAlignedLiftDays === 1 ? '' : 's'} showed above-expected sales with warmer/lift weather signals.</li>
        <li>${weatherAlignedDropDays} day${weatherAlignedDropDays === 1 ? '' : 's'} showed below-expected sales with colder/wetter weather signals.</li>
        <li>${unexplainedDropDays} below-expected day${unexplainedDropDays === 1 ? '' : 's'} had no downside weather signal; add context notes for events, outages, or local factors.</li>
        <li>Weather alignment explained about ${NUM.format(explainedShare)}% of location-day variance in this window.</li>
      </ul>
    </article>
    <div class="recent-overview">
      <article class="recent-overview-card">
        <p class="kicker">Portfolio Profitability</p>
        <h4>${pctLabel(portfolioAttainment)} of expected</h4>
        <p class="help">${USD.format(portfolioActualProfit)} actual gross profit vs ${USD.format(portfolioExpectedProfit)} expected across selected scope.</p>
      </article>
      <article class="recent-overview-card">
        <p class="kicker">Data Window</p>
        <h4>${rowsWithMetrics.length} location-day records</h4>
        <p class="help">${esc(expectedSourceSummary)}</p>
      </article>
    </div>
    <div class="recent-location-grid">
      ${locationCards}
    </div>
    <div class="recent-review-grid">
      ${dayCards}
    </div>
  `;
}

function renderTopMenu() {
  const nav = document.getElementById('topMenuNav');
  if (!nav) return;
  const menu = normalizeTopMenu(state.topMenu);
  nav.querySelectorAll('[data-menu]').forEach((el) => {
    const active = el.dataset.menu === menu;
    el.classList.toggle('active', active);
    if (active) {
      el.setAttribute('aria-current', 'page');
    } else {
      el.removeAttribute('aria-current');
    }
  });
}

function renderPlannerSubnav() {
  const nav = document.getElementById('plannerSubnav');
  if (!nav) return;

  const topMenu = normalizeTopMenu(state.topMenu);
  const page = normalizePlannerPage(state.plannerPage);
  const approvalsSubtab =
    state.approvalsSubtab === 'day_requests' || state.approvalsSubtab === 'pto_requests' ? state.approvalsSubtab : 'next_week';
  const complianceSubtab = normalizeComplianceSubtab(state.complianceSubtab);
  const lookbackWeeks = clamp(Number(state.highlightsLookbackWeeks) || DEFAULT_HIGHLIGHTS_WEEKS, 1, MAX_HIGHLIGHTS_WEEKS);
  const compareMode = state.highlightsCompareMode === 'planned_vs_actual' ? 'planned_vs_actual' : 'actual_vs_baseline';
  const scope = normalizeStoreScope(state.highlightsStoreScope);

  if (topMenu === 'shift_analysis') {
    const locationCodes = plannerLocationCodes();
    const scopeControls =
      locationCodes.length <= 2
        ? `
      ${locationCodes
        .map(
          (code) =>
            `<button type="button" class="planner-subnav-btn ${scope === code ? 'active' : ''}" data-action="set-highlights-scope" data-scope="${esc(code)}">${esc(
              LOCATION_LABELS[code] || code
            )}</button>`
        )
        .join('')}
      <button type="button" class="planner-subnav-btn ${scope === 'BOTH' ? 'active' : ''}" data-action="set-highlights-scope" data-scope="BOTH">Both Stores</button>
    `
        : `<label class="planner-subnav-label" for="analysisScopeSelect">Store Scope</label>
           <select id="analysisScopeSelect" data-action="set-highlights-scope-select">
             <option value="BOTH" ${scope === 'BOTH' ? 'selected' : ''}>All Stores</option>
             ${locationCodes
               .map(
                 (code) =>
                   `<option value="${esc(code)}" ${scope === code ? 'selected' : ''}>${esc(LOCATION_LABELS[code] || code)}</option>`
               )
               .join('')}
           </select>`;
    nav.innerHTML = `
      <div class="planner-subnav-main">
        <span class="planner-subnav-label">Shift Analysis Controls</span>
      </div>
      <div class="planner-subnav-secondary planner-subnav-scope">
        <span class="planner-subnav-label">${locationCodes.length <= 2 ? 'Store Scope' : 'Store Group Scope'}</span>
        ${scopeControls}
      </div>
      <div class="planner-subnav-secondary">
        <span class="planner-subnav-label">Analysis Window</span>
        ${[1, 2, 3, 4]
          .map(
            (weeks) =>
              `<button
                 type="button"
                 class="planner-subnav-btn ${lookbackWeeks === weeks ? 'active' : ''}"
                 data-action="set-highlights-lookback"
                 data-weeks="${weeks}"
               >${weeks} Week${weeks === 1 ? '' : 's'}</button>`
          )
          .join('')}
        <span class="planner-subnav-label">Compare</span>
        <button
          type="button"
          class="planner-subnav-btn ${compareMode === 'actual_vs_baseline' ? 'active' : ''}"
          data-action="set-highlights-compare"
          data-mode="actual_vs_baseline"
        >Baseline Expected</button>
        <button
          type="button"
          class="planner-subnav-btn ${compareMode === 'planned_vs_actual' ? 'active' : ''}"
          data-action="set-highlights-compare"
          data-mode="planned_vs_actual"
        >Planned Expected</button>
      </div>
    `;
    return;
  }

  if (topMenu === 'settings') {
    nav.innerHTML = `
      <div class="planner-subnav-main">
        <span class="planner-subnav-label">Settings</span>
      </div>
      <div class="planner-subnav-secondary">
        <span class="planner-subnav-label">Settings Views</span>
        <button
          type="button"
          class="planner-subnav-btn ${complianceSubtab === 'operations' ? 'active' : ''}"
          data-action="switch-compliance-subtab"
          data-subtab="operations"
        >Operations</button>
        <button
          type="button"
          class="planner-subnav-btn ${complianceSubtab === 'overview' ? 'active' : ''}"
          data-action="switch-compliance-subtab"
          data-subtab="overview"
        >Overview</button>
        <button
          type="button"
          class="planner-subnav-btn ${complianceSubtab === 'setup' ? 'active' : ''}"
          data-action="switch-compliance-subtab"
          data-subtab="setup"
        >Business Setup</button>
        <button
          type="button"
          class="planner-subnav-btn ${complianceSubtab === 'youth' ? 'active' : ''}"
          data-action="switch-compliance-subtab"
          data-subtab="youth"
        >Youth Rules</button>
        <button
          type="button"
          class="planner-subnav-btn ${complianceSubtab === 'feeds' ? 'active' : ''}"
          data-action="switch-compliance-subtab"
          data-subtab="feeds"
        >Rule Feeds</button>
      </div>
    `;
    return;
  }

  nav.innerHTML = `
    <div class="planner-subnav-main">
      <button
        type="button"
        class="planner-subnav-btn ${page === 'weekly_plan' ? 'active' : ''}"
        data-action="switch-planner-page"
        data-page="weekly_plan"
      >Weekly Plan</button>
      <button
        type="button"
        class="planner-subnav-btn ${page === 'approvals' ? 'active' : ''}"
        data-action="switch-planner-page"
        data-page="approvals"
      >Approvals</button>
    </div>
    ${
      page === 'approvals'
        ? `<div class="planner-subnav-secondary">
             <span class="planner-subnav-label">Approval Views</span>
             <button
               type="button"
               class="planner-subnav-btn ${approvalsSubtab === 'next_week' ? 'active' : ''}"
               data-action="switch-approvals-subtab"
               data-subtab="next_week"
             >GM Next-Week Approval</button>
             <button
               type="button"
               class="planner-subnav-btn ${approvalsSubtab === 'day_requests' ? 'active' : ''}"
               data-action="switch-approvals-subtab"
               data-subtab="day_requests"
             >Day Change Requests</button>
             <button
               type="button"
               class="planner-subnav-btn ${approvalsSubtab === 'pto_requests' ? 'active' : ''}"
               data-action="switch-approvals-subtab"
               data-subtab="pto_requests"
             >PTO Requests</button>
           </div>`
        : '<div class="planner-subnav-secondary"><span class="planner-subnav-label">Shift Planner</span><span class="planner-subnav-note">Plan and assign shifts by store, then route exception requests through approvals.</span></div>'
    }
  `;
}

function renderPageInstructions() {
  const panel = document.getElementById('pageInstructionPanel');
  if (!panel) return;

  const topMenu = normalizeTopMenu(state.topMenu);
  const page = normalizePlannerPage(state.plannerPage);

  if (topMenu === 'shift_planner' && page === 'weekly_plan') {
    panel.innerHTML = `
      <h2>How To Use Shift Planner</h2>
      <p>Start with location and date, review weather recommendation, then assign names into slots. Use “Assign Next 12 Weeks” for recurring shifts and submit exception requests only when schedule structure needs approval.</p>
      <p class="help">Templates are month-invariant by default. Monday-open scenarios use Tuesday template assumptions.</p>
    `;
    return;
  }

  if (topMenu === 'shift_planner' && page === 'approvals') {
    panel.innerHTML = `
      <h2>How To Use Approvals</h2>
      <p>Review manager changes and next-week readiness first, then route final approval to GM before export. Day-level exception requests and PTO conflicts should be resolved before weekly approval.</p>
    `;
    return;
  }

  if (topMenu === 'shift_analysis') {
    panel.innerHTML = `
      <h2>How To Use Shift Analysis</h2>
      <p>Choose store scope and lookback window, then compare actual vs expected performance and weather impact. Save context notes for anomalies so future staffing recommendations can incorporate real-world events.</p>
    `;
    return;
  }

  panel.innerHTML = `
    <h2>How To Use Settings</h2>
    <p>Configure staffing guardrails, seasonal opening step dates, target percentages, and manager assumptions here. Compliance subsections hold legal-rule placeholders for the future Joyus rules engine.</p>
  `;
}

function renderWeeklySidebar() {
  const panel = document.getElementById('weeklySidebar');
  if (!panel) return;
  const scope = normalizeStoreScope(state.highlightsStoreScope);
  const counts = requestSummaryCounts();
  const nextWeekStatus = state.nextWeekApproval?.status || 'draft';
  const nextWeekChecksState = nextWeekChecks();
  const nextWeekHelp =
    nextWeekStatus === 'approved'
      ? `Approved by GM${state.nextWeekApproval.reviewedAt ? ` on ${new Date(state.nextWeekApproval.reviewedAt).toLocaleString()}` : ''}.`
      : nextWeekStatus === 'pending'
      ? `Submitted${state.nextWeekApproval.submittedAt ? ` on ${new Date(state.nextWeekApproval.submittedAt).toLocaleString()}` : ''}; waiting on GM.`
      : nextWeekStatus === 'rejected'
      ? 'Rejected by GM. Revise schedule and resubmit.'
      : 'Draft. Submit next week for GM approval when ready.';

  const ptoScope = scope === 'BOTH' ? 'BOTH' : scope;
  const range = plannerDateRange();
  const ptoRows = ptoRowsForRange(ptoScope, range.startDate, range.endDate);
  const ptoPending = ptoRows.filter((row) => row.status === 'pending').length;
  const ptoApproved = ptoRows.filter((row) => row.status === 'approved').length;
  const ptoConflicts = scope === 'BOTH' ? 0 : nextWeekChecksState.ptoConflicts;
  const syncStatus = ptoSyncStatusLabel(state.ptoSync);
  const syncToneClass =
    state.ptoSync?.status === 'connected' ? 'status-ok' : state.ptoSync?.status === 'syncing' ? 'status-pending' : 'status-risk';
  const assignmentGaps = assignmentGapSummary(4);

  panel.innerHTML = `
    <div class="request-head">
      <div>
        <h2>Weekly Plan Status</h2>
        <p>${
          scope === 'BOTH'
            ? 'Both Stores scope is active. Select one store for day-by-day edits; PTO sync remains available for both.'
            : 'Use Shift Planner sub tabs above for weekly planning and approvals.'
        }</p>
      </div>
    </div>
    <div class="request-list">
      ${
        scope === 'BOTH'
          ? ''
          : `<article class="request-card">
               <h3>GM Next-Week Approval</h3>
               <p><strong>Status:</strong> ${esc(nextWeekStatus.toUpperCase())}</p>
               <p>${esc(nextWeekHelp)}</p>
               <p>
                 <strong>Readiness:</strong>
                 ${nextWeekChecksState.pendingRequests} pending day requests ·
                 ${nextWeekChecksState.unsubmittedExceptions} unsubmitted edits ·
                 ${nextWeekChecksState.unassignedPositions} unassigned positions ·
                 ${nextWeekChecksState.invalidCoverageDays} invalid coverage days ·
                 ${nextWeekChecksState.ptoConflicts} PTO conflicts
               </p>
             </article>
             <article class="request-card">
               <h3>Request Snapshot</h3>
               <p>Pending ${counts.pending} · Approved ${counts.approved} · Rejected ${counts.rejected}</p>
               <p class="help">Approval actions are on the Approvals page.</p>
             </article>`
      }
      <article class="request-card">
        <h3>Next 4 Weeks Assignment Gaps</h3>
        ${
          assignmentGaps.length
            ? `<ul class="assignment-gap-list">${assignmentGaps
                .map(
                  (row) =>
                    `<li><strong>${esc(row.weekLabel)}</strong>: ${row.unassigned} unassigned position${
                      row.unassigned === 1 ? '' : 's'
                    } across ${row.daysWithGaps} day${row.daysWithGaps === 1 ? '' : 's'}</li>`
                )
                .join('')}</ul>`
            : '<p class="help">No assignment gaps in the next 4 weeks.</p>'
        }
        <p class="help">Use “Assign Next 12 Weeks” on any staffed slot to propagate recurring assignments.</p>
      </article>
      <article class="request-card">
        <h3>Square PTO Sync</h3>
        <p><strong>Status:</strong> <span class="${syncToneClass}">${esc(syncStatus)}</span></p>
        <p>Range ${esc(formatDateLabel(range.startDate))} - ${esc(formatDateLabel(range.endDate))} · Pending ${ptoPending} · Approved ${ptoApproved}${
          ptoConflicts ? ` · Conflicts ${ptoConflicts}` : ''
        }</p>
        <p class="help">Last attempt: ${esc(formatDateTime(state.ptoSync?.lastAttemptAt))} · Last success: ${esc(formatDateTime(state.ptoSync?.lastSuccessAt))}</p>
        ${
          state.ptoSync?.lastError
            ? `<p class="status-line status-risk">Last error: ${esc(state.ptoSync.lastError)}</p>`
            : '<p class="status-line status-ok">PTO requests are up to date for current planning range.</p>'
        }
        <div class="request-actions">
          <button type="button" class="small-btn" data-action="sync-pto" ${state.ptoSync?.status === 'syncing' ? 'disabled' : ''}>Sync PTO from Square</button>
        </div>
      </article>
    </div>
  `;
}

function renderApprovalsPage() {
  const panel = document.getElementById('approvalsView');
  if (!panel) return;

  const nextWeekStatus = state.nextWeekApproval?.status || 'draft';
  const nextWeekChecksState = nextWeekChecks();
  const nextWeekHelp =
    nextWeekStatus === 'approved'
      ? `Approved by GM ${state.nextWeekApproval.reviewedAt ? `on ${new Date(state.nextWeekApproval.reviewedAt).toLocaleString()}` : ''}.`
      : nextWeekStatus === 'pending'
      ? `Submitted ${state.nextWeekApproval.submittedAt ? new Date(state.nextWeekApproval.submittedAt).toLocaleString() : ''}; waiting on GM's approval.`
      : nextWeekStatus === 'rejected'
      ? 'Rejected by GM. Managers should revise next-week schedule and resubmit.'
      : 'Draft. Managers should finalize and submit next week to GM for approval.';

  const renderRequest = (req, includeActions) => {
    return `
      <article class="request-card">
        <h3>${esc(formatDateFull(req.date))} · ${esc(LOCATION_LABELS[req.location] || req.location)}</h3>
        <p><strong>Status:</strong> ${esc(req.status.toUpperCase())}</p>
        <p><strong>Reason:</strong> ${esc(req.reason || 'No note')}</p>
        <p><strong>Proposed:</strong> ${Number(req.slotCount) || 0} shifts · ${Number(req.totalHeadcount) || 0} total positions</p>
        <p><strong>Submitted:</strong> ${esc(new Date(req.submittedAt).toLocaleString())}</p>
        ${
          includeActions
            ? `<div class="request-actions">
                 <button type="button" class="small-btn" data-action="approve-request" data-request-id="${esc(req.id)}">Approve</button>
                 <button type="button" class="small-btn" data-action="reject-request" data-request-id="${esc(req.id)}">Reject</button>
               </div>`
            : ''
        }
      </article>
    `;
  };

  const pending = state.requests.filter((r) => r.status === 'pending');
  const approved = state.requests.filter((r) => r.status === 'approved').slice(0, 8);
  const rejected = state.requests.filter((r) => r.status === 'rejected').slice(0, 8);
  const approvalsSubtab =
    state.approvalsSubtab === 'day_requests' || state.approvalsSubtab === 'pto_requests' ? state.approvalsSubtab : 'next_week';

  const approvalsNextWeekBody = `
    <div class="request-list">
      <article class="request-card">
        <h3>Week of ${state.weeks[0] ? esc(formatDateFull(state.weeks[0].weekStart)) : 'N/A'}</h3>
        <p><strong>Status:</strong> ${esc(nextWeekStatus.toUpperCase())}</p>
        <p>${esc(nextWeekHelp)}</p>
        <p>
          <strong>Readiness:</strong>
          ${nextWeekChecksState.pendingRequests} pending day requests ·
          ${nextWeekChecksState.unsubmittedExceptions} unsubmitted edits ·
          ${nextWeekChecksState.unassignedPositions} unassigned positions ·
          ${nextWeekChecksState.invalidCoverageDays} invalid coverage days ·
          ${nextWeekChecksState.ptoConflicts} PTO conflicts
        </p>
        ${
          nextWeekStatus === 'pending'
            ? `<div class="request-actions">
                 <button type="button" class="small-btn" data-action="gm-approve-next-week">GM Approve</button>
                 <button type="button" class="small-btn" data-action="gm-reject-next-week">GM Reject</button>
               </div>`
            : ''
        }
      </article>
    </div>
  `;

  const approvalsRequestsBody = `
    <div class="request-list">
      <h3>Pending Approval</h3>
      ${pending.length ? pending.map((req) => renderRequest(req, true)).join('') : '<p class="help">No pending requests.</p>'}

      <h3>Recently Approved</h3>
      ${approved.length ? approved.map((req) => renderRequest(req, false)).join('') : '<p class="help">No approved requests yet.</p>'}

      <h3>Recently Rejected</h3>
      ${rejected.length ? rejected.map((req) => renderRequest(req, false)).join('') : '<p class="help">No rejected requests.</p>'}
    </div>
  `;

  const range = plannerDateRange();
  const ptoScope = state.highlightsStoreScope === 'BOTH' ? 'BOTH' : state.location;
  const ptoRows = ptoRowsForRange(ptoScope, range.startDate, range.endDate);
  const ptoStatusOrder = { pending: 0, approved: 1, denied: 2, cancelled: 3 };
  const ptoSorted = ptoRows
    .slice()
    .sort(
      (a, b) =>
        (ptoStatusOrder[a.status] ?? 99) - (ptoStatusOrder[b.status] ?? 99) ||
        String(a.startDate || '').localeCompare(String(b.startDate || '')) ||
        String(a.employee || '').localeCompare(String(b.employee || ''))
    );
  const ptoPendingCount = ptoRows.filter((row) => row.status === 'pending').length;
  const ptoApprovedCount = ptoRows.filter((row) => row.status === 'approved').length;
  const ptoSyncLabel = ptoSyncStatusLabel(state.ptoSync);
  const ptoSyncClass =
    state.ptoSync?.status === 'connected' ? 'status-ok' : state.ptoSync?.status === 'syncing' ? 'status-pending' : 'status-risk';

  const approvalsPtoBody = `
    <div class="request-list">
      <article class="request-card">
        <h3>PTO Sync Status</h3>
        <p><strong>Status:</strong> <span class="${ptoSyncClass}">${esc(ptoSyncLabel)}</span></p>
        <p><strong>Range:</strong> ${esc(formatDateLabel(range.startDate))} - ${esc(formatDateLabel(range.endDate))}</p>
        <p><strong>Requests:</strong> Pending ${ptoPendingCount} · Approved ${ptoApprovedCount} · Total ${ptoRows.length}</p>
        <p class="help">PTO approvals remain system-of-record in Square. This view informs schedule conflict checks.</p>
        <p class="help">Last attempt: ${esc(formatDateTime(state.ptoSync?.lastAttemptAt))} · Last success: ${esc(formatDateTime(state.ptoSync?.lastSuccessAt))}</p>
        ${
          state.ptoSync?.lastError
            ? `<p class="status-line status-risk">Last error: ${esc(state.ptoSync.lastError)}</p>`
            : '<p class="status-line status-ok">No PTO sync errors reported.</p>'
        }
        <div class="request-actions">
          <button type="button" class="small-btn" data-action="sync-pto" ${state.ptoSync?.status === 'syncing' ? 'disabled' : ''}>Sync PTO from Square</button>
        </div>
      </article>
      <article class="request-card">
        <h3>PTO Requests in Scope</h3>
        ${
          ptoSorted.length
            ? ptoSorted
                .map(
                  (row) => `<p><strong>${esc(row.employee)}</strong> · ${esc(row.startDate)}${row.endDate !== row.startDate ? ` to ${esc(row.endDate)}` : ''} · ${esc(
                    row.status.toUpperCase()
                  )} · ${esc(row.location === 'BOTH' ? 'Both Stores' : LOCATION_LABELS[row.location] || row.location)}${
                    row.notes ? ` · ${esc(row.notes)}` : ''
                  }</p>`
                )
                .join('')
            : '<p class="help">No PTO requests were found in the active planning window.</p>'
        }
      </article>
    </div>
  `;

  panel.innerHTML = `
    <div class="request-head">
      <div>
        <h2>Approvals</h2>
        <p>Approve next-week gate and day-level manager requests.</p>
      </div>
    </div>
    ${approvalsSubtab === 'next_week' ? approvalsNextWeekBody : approvalsSubtab === 'day_requests' ? approvalsRequestsBody : approvalsPtoBody}
  `;
}

function renderRecentStaffingView() {
  const panel = document.getElementById('recentStaffingView');
  if (!panel) return;
  panel.innerHTML = `
    <div class="request-head">
      <div>
        <h2>Recent Staffing Analysis</h2>
        <p>Past performance visual review with profitability attainment, weather impact context, and historical notes.</p>
      </div>
    </div>
    <div class="request-list">
      <article class="request-card">
        ${renderRecentPerformanceSection()}
      </article>
    </div>
  `;
}

function renderComplianceView() {
  const panel = document.getElementById('complianceView');
  if (!panel) return;

  const subtab =
    state.complianceSubtab === 'operations' ||
    state.complianceSubtab === 'setup' ||
    state.complianceSubtab === 'youth' ||
    state.complianceSubtab === 'feeds' ||
    state.complianceSubtab === 'overview'
      ? state.complianceSubtab
      : 'operations';

  const header = `
    <div class="request-head">
      <div>
        <h2>${subtab === 'operations' ? 'Operations Settings' : 'Compliance Workspace'}</h2>
        <p>${
          subtab === 'operations'
            ? 'Configure staffing rules, universal weekly templates, targets, and manager assumptions. These values guide planner behavior and review workflows.'
            : 'Placeholder framework for federal + state + local labor rules. Final implementation should be reviewed by employment counsel.'
        }</p>
      </div>
    </div>
  `;

  if (subtab === 'operations') {
    const settings = normalizeSettingsProfile(state.settings);
    panel.innerHTML = `
      ${header}
      <div class="settings-grid">
        <article class="settings-card">
          <h3>Guardrails + Workflow</h3>
          <p class="help">Core staffing rules that should always be enforced by scheduling and approvals.</p>
          <div class="settings-fields">
            <div class="settings-field-row">
              <div class="label-wrap">
                <strong>Minimum Openers</strong>
                <small>Recommended: 1</small>
              </div>
              <div class="settings-input-wrap">
                <input type="number" min="1" max="3" value="${settings.workflow.minOpeners}" data-action="settings-field" data-section="workflow" data-key="minOpeners" />
              </div>
            </div>
            <div class="settings-field-row">
              <div class="label-wrap">
                <strong>Minimum Closers</strong>
                <small>Recommended: 2</small>
              </div>
              <div class="settings-input-wrap">
                <input type="number" min="2" max="4" value="${settings.workflow.minClosers}" data-action="settings-field" data-section="workflow" data-key="minClosers" />
              </div>
            </div>
            <div class="settings-field-row">
              <div class="label-wrap">
                <strong>Require Policy Approval</strong>
                <small>Manager changes require admin approval before applying.</small>
              </div>
              <div class="settings-input-wrap">
                <input type="checkbox" ${settings.workflow.requirePolicyApproval ? 'checked' : ''} data-action="settings-field" data-section="workflow" data-key="requirePolicyApproval" />
              </div>
            </div>
            <div class="settings-field-row">
              <div class="label-wrap">
                <strong>Require GM Next-Week Approval</strong>
                <small>Final gate before publish/export for next week.</small>
              </div>
              <div class="settings-input-wrap">
                <input type="checkbox" ${settings.workflow.requireGMApproval ? 'checked' : ''} data-action="settings-field" data-section="workflow" data-key="requireGMApproval" />
              </div>
            </div>
          </div>
        </article>
        <article class="settings-card">
          <h3>Store Opening Schedule</h3>
          <p class="help">Set seasonal step-up/down dates for operations planning. Weekly shift templates are month-invariant and Monday mirrors Tuesday for expansion scenarios.</p>
          <div class="settings-fields">
            ${[
              ['springUpDate', 'Step Up to Spring', 'Recommended Mar 1'],
              ['summerUpDate', 'Step Up to Summer', 'Recommended May 15'],
              ['fallDownDate', 'Step Down to Fall', 'Recommended Sep 8'],
              ['winterDownDate', 'Step Down to Winter', 'Recommended Nov 1'],
            ]
              .map(
                ([key, label, note]) => `
                <div class="settings-field-row">
                  <div class="label-wrap">
                    <strong>${label}</strong>
                    <small>${note}</small>
                  </div>
                  <div class="settings-input-wrap">
                    <input type="date" value="${esc(settings.openingSchedule[key])}" data-action="settings-field" data-section="openingSchedule" data-key="${key}" />
                    <button type="button" class="small-btn" data-action="settings-apply-recommended" data-key="${key}">Use Recommended</button>
                  </div>
                </div>
              `
              )
              .join('')}
            <div class="settings-field-row">
              <div class="label-wrap">
                <strong>Template Engine Mode</strong>
                <small>All months use the same weekly template profile. Monday assumptions are cloned from Tuesday.</small>
              </div>
              <div class="settings-input-wrap">
                <span class="badge">Universal Weekly Templates</span>
              </div>
            </div>
          </div>
        </article>
        <article class="settings-card">
          <h3>Target Profile Percentages</h3>
          <p class="help">Adjust KPI expectations for planning and review thresholds.</p>
          <div class="settings-fields">
            ${[
              ['laborTargetPct', 'Labor Target %'],
              ['laborWatchPct', 'Labor Watch %'],
              ['profitFloorPct', 'Profit Floor %'],
              ['profitBasePct', 'Profit Base %'],
              ['profitStretchPct', 'Profit Stretch %'],
            ]
              .map(
                ([key, label]) => `
                <div class="settings-field-row">
                  <div class="label-wrap">
                    <strong>${label}</strong>
                  </div>
                  <div class="settings-input-wrap">
                    <input type="number" min="0" max="100" step="0.1" value="${settings.targetProfile[key]}" data-action="settings-field" data-section="targetProfile" data-key="${key}" />
                  </div>
                </div>
              `
              )
              .join('')}
          </div>
        </article>
        <article class="settings-card">
          <h3>Manager Pay + Assumptions</h3>
          <p class="help">Use these assumptions for scenario economics and staffing capacity planning.</p>
          <div class="settings-fields">
            <div class="settings-field-row">
              <div class="label-wrap">
                <strong>Manager Hourly Pay</strong>
                <small>Current assumption: $28/hr.</small>
              </div>
              <div class="settings-input-wrap">
                <input type="number" min="0" step="0.01" value="${settings.managerPayRate}" data-action="settings-field" data-section="root" data-key="managerPayRate" />
              </div>
            </div>
            <div class="settings-field-row">
              <div class="label-wrap">
                <strong>Manager Weekly Hours</strong>
                <small>Current assumption: 40 hrs/week.</small>
              </div>
              <div class="settings-input-wrap">
                <input type="number" min="0" step="0.5" value="${settings.managerWeeklyHours}" data-action="settings-field" data-section="root" data-key="managerWeeklyHours" />
              </div>
            </div>
            <div class="settings-field-row">
              <div class="label-wrap">
                <strong>Key Lead Hourly Pay</strong>
                <small>Used in shift viability estimates.</small>
              </div>
              <div class="settings-input-wrap">
                <input type="number" min="0" step="0.01" value="${settings.keyLeadPayRate}" data-action="settings-field" data-section="root" data-key="keyLeadPayRate" />
              </div>
            </div>
            <div class="settings-field-row">
              <div class="label-wrap">
                <strong>Scooper Hourly Pay</strong>
                <small>Used in shift viability estimates.</small>
              </div>
              <div class="settings-input-wrap">
                <input type="number" min="0" step="0.01" value="${settings.scooperPayRate}" data-action="settings-field" data-section="root" data-key="scooperPayRate" />
              </div>
            </div>
          </div>
          <div class="request-list compact">
            <article class="request-card">
              <h4>Multi-Location Selector Strategy</h4>
              <p>For 1-2 stores, keep simple toggles and single-store editing. For 3+ stores, switch to a searchable “store group scope” selector with All Stores, region/state groups, and favorites.</p>
              <p class="help">Franchise and multi-state owners should see grouped selectors, while single-operator shops keep the current lightweight controls.</p>
            </article>
          </div>
        </article>
      </div>
    `;
    return;
  }

  if (subtab === 'setup') {
    panel.innerHTML = `
      ${header}
      <div class="compliance-grid">
        <article class="request-card compliance-card">
          <h3>Business Jurisdictions</h3>
          <p class="help">Each store should map to: country, state, county/city, and local ordinance zone.</p>
          <ul class="compliance-list">
            <li>Store profile with legal entity, EIN scope, and tax region.</li>
            <li>State-specific labor profile (overtime, breaks, minors, scheduling).</li>
            <li>Local override profile (e.g., predictive scheduling ordinances).</li>
            <li>Effective date ranges and policy version IDs.</li>
          </ul>
        </article>
        <article class="request-card compliance-card">
          <h3>Employee Identity Inputs</h3>
          <p class="help">Required to evaluate age-based and school-day restrictions.</p>
          <ul class="compliance-list">
            <li>Date of birth (required for all staff).</li>
            <li>Minor status auto-derived from DOB by schedule date.</li>
            <li>School enrollment flag and school district calendar source.</li>
            <li>Parent/guardian and permit documentation status for minors.</li>
          </ul>
        </article>
      </div>
    `;
    return;
  }

  if (subtab === 'youth') {
    panel.innerHTML = `
      ${header}
      <div class="compliance-grid">
        <article class="request-card compliance-card">
          <h3>Youth Employment Guardrails</h3>
          <p class="help">Schedule engine should evaluate proposed shifts before manager submission.</p>
          <ul class="compliance-list">
            <li>Age gate by shift date (under 14, 14-15, 16-17, 18+).</li>
            <li>School day vs non-school day hour and window limits.</li>
            <li>Weekly hour caps during school weeks and summer exceptions.</li>
            <li>Restricted duties/equipment by age and jurisdiction.</li>
          </ul>
        </article>
        <article class="request-card compliance-card">
          <h3>School Schedule Workflow</h3>
          <p class="help">For minors, rule evaluation should consider local school calendars and closures.</p>
          <ul class="compliance-list">
            <li>Manager requests school info on onboarding/update.</li>
            <li>Calendar source validation and sync health checks.</li>
            <li>Manual override requests routed for admin approval.</li>
            <li>Audit log of every override decision and rationale.</li>
          </ul>
        </article>
      </div>
    `;
    return;
  }

  if (subtab === 'feeds') {
    panel.innerHTML = `
      ${header}
      <div class="compliance-grid">
        <article class="request-card compliance-card">
          <h3>Rule Feed Architecture</h3>
          <p class="help">Implement versioned rule packs keyed by jurisdiction and effective date.</p>
          <ul class="compliance-list">
            <li>Federal baseline pack (FLSA + youth employment).</li>
            <li>State packs layered on top of federal defaults.</li>
            <li>Local ordinance packs with highest-priority overrides.</li>
            <li>Automated diff alerts when legal source text changes.</li>
          </ul>
        </article>
        <article class="request-card compliance-card">
          <h3>Decision Logging + Evidence</h3>
          <p class="help">Every accepted/rejected schedule change should include compliance evidence snapshot.</p>
          <ul class="compliance-list">
            <li>Store, jurisdiction, rule version, and timestamp.</li>
            <li>Violations detected and blocking severity.</li>
            <li>Exception approval chain (manager, admin, owner/GM).</li>
            <li>Exportable compliance report per week/month.</li>
          </ul>
        </article>
      </div>
    `;
    return;
  }

  panel.innerHTML = `
    ${header}
    <div class="compliance-grid">
      <article class="request-card compliance-card">
        <h3>Compliance Scope</h3>
        <p class="help">This section defines how staffing suggestions and manager edits stay compliant across jurisdictions.</p>
        <ul class="compliance-list">
          <li>Apply most-protective rule when federal, state, and local standards differ.</li>
          <li>Block schedules that violate overtime, minor, or notice requirements.</li>
          <li>Capture reasoned exceptions and route to required approvers.</li>
          <li>Preserve complete audit trail for internal and legal review.</li>
        </ul>
      </article>
      <article class="request-card compliance-card">
        <h3>Implementation Phases</h3>
        <p class="help">Placeholder roadmap for the Joyus Ice Cream Shop compliance engine.</p>
        <ul class="compliance-list">
          <li>Phase 1: profile setup for jurisdiction + employee DOB/school metadata.</li>
          <li>Phase 2: pre-submit checks inside weekly planner and approvals workflow.</li>
          <li>Phase 3: automated legal feed updates, alerts, and compliance exports.</li>
          <li>Phase 4: cross-state franchise rollups and policy templates.</li>
        </ul>
      </article>
    </div>
  `;
}

function renderPageVisibility() {
  const topMenu = normalizeTopMenu(state.topMenu);
  const page = normalizePlannerPage(state.plannerPage);
  const weekly = document.getElementById('weeklyPlanView');
  const recent = document.getElementById('recentStaffingView');
  const approvals = document.getElementById('approvalsView');
  const compliance = document.getElementById('complianceView');
  const controls = document.getElementById('plannerControls');
  const rules = document.getElementById('plannerRules');

  document.body.dataset.topMenu = topMenu;

  const setVisible = (el, visible) => {
    if (!el) return;
    el.hidden = !visible;
    el.style.display = visible ? '' : 'none';
  };

  setVisible(controls, topMenu === 'shift_planner');
  setVisible(rules, topMenu === 'shift_planner');
  setVisible(weekly, topMenu === 'shift_planner' && page === 'weekly_plan');
  setVisible(approvals, topMenu === 'shift_planner' && page === 'approvals');
  setVisible(recent, topMenu === 'shift_analysis');
  setVisible(compliance, topMenu === 'settings');
}

function renderControls() {
  const locationSelect = document.getElementById('locationSelect');
  const horizonSelect = document.getElementById('horizonSelect');
  const startDateInput = document.getElementById('startDateInput');

  if (locationSelect) {
    const codes = plannerLocationCodes();
    const currentOptions = Array.from(locationSelect.options || []).map((opt) => opt.value).join('|');
    const nextOptions = codes.join('|');
    if (currentOptions !== nextOptions) {
      locationSelect.innerHTML = codes.map((code) => `<option value="${esc(code)}">${esc(LOCATION_LABELS[code] || code)}</option>`).join('');
    }
    if (!codes.includes(state.location)) state.location = codes[0] || 'EP';
    locationSelect.value = state.location;
  }
  if (horizonSelect) horizonSelect.value = String(state.horizonWeeks);
  if (startDateInput) startDateInput.value = state.startDate;
}

function renderAll() {
  renderControls();
  renderTopMenu();
  renderPlannerSubnav();
  renderPageInstructions();
  const topMenu = normalizeTopMenu(state.topMenu);
  const page = normalizePlannerPage(state.plannerPage);

  if (topMenu === 'shift_planner' && page === 'weekly_plan') {
    renderPlannerBoard();
    renderWeeklySidebar();
  }
  if (topMenu === 'shift_planner' && page === 'approvals') {
    renderApprovalsPage();
  }
  if (topMenu === 'shift_analysis') {
    renderRecentStaffingView();
  }
  if (topMenu === 'settings') {
    renderComplianceView();
  }

  renderPageVisibility();
}

function markException(day) {
  day.hasException = true;
}

function submitChangeRequest(weekIdx, dayIdx) {
  const day = getDay(weekIdx, dayIdx);
  if (!day) return;

  const pending = activePendingRequestForDay(day);
  if (pending) {
    window.alert('There is already a pending request for this day.');
    return;
  }

  const validation = dayValidation(day);
  if (!validation.ok) {
    window.alert(validation.message);
    return;
  }

  if (!day.hasException) {
    window.alert('No exception changes detected for this day.');
    return;
  }

  const reason = (day.note || '').trim();
  if (!reason) {
    window.alert('Please provide a reason before submitting an exception request.');
    return;
  }

  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const request = {
    id: requestId,
    location: state.location,
    weekStart: state.weeks[weekIdx].weekStart,
    date: day.date,
    reason,
    status: 'pending',
    slotCount: day.slots.length,
    totalHeadcount: day.slots.reduce((sum, slot) => sum + (Number(slot.headcount) || 0), 0),
    submittedAt: new Date().toISOString(),
  };

  state.requests.unshift(request);
  day.pendingRequestId = requestId;
  day.hasException = false;
  day.note = '';

  saveState();
  renderAll();
}

function setRequestStatus(requestId, status) {
  const request = state.requests.find((row) => row.id === requestId);
  if (!request || request.status !== 'pending') return;

  request.status = status;
  request.reviewedAt = new Date().toISOString();

  for (const week of state.weeks) {
    for (const day of week.days) {
      if (day.pendingRequestId === requestId) {
        day.pendingRequestId = null;
        day.lastDecision = status;
        if (status === 'rejected') {
          day.hasException = true;
          day.note = day.note || 'Request rejected. Revise and resubmit for approval.';
        }
      }
    }
  }

  saveState();
  renderAll();
}

function exportApprovedPayload() {
  const pendingCount = state.requests.filter((req) => req.status === 'pending').length;
  if (pendingCount > 0) {
    window.alert(`Resolve ${pendingCount} pending request(s) before exporting an approved plan.`);
    return;
  }

  const nextWeekStatus = state.nextWeekApproval?.status || 'draft';
  if (nextWeekStatus !== 'approved') {
    window.alert('GM must approve next week before export.');
    return;
  }

  let policyEditCount = 0;
  let dayPendingCount = 0;
  let invalidCoverageCount = 0;
  let unassignedPositions = 0;

  state.weeks.forEach((week) => {
    week.days.forEach((day) => {
      if (day.hasException) policyEditCount += 1;
      if (day.pendingRequestId) dayPendingCount += 1;
      if (!dayValidation(day).ok) invalidCoverageCount += 1;
      day.slots.forEach((slot) => {
        const headcount = Math.max(1, Number(slot.headcount) || 1);
        for (let idx = 0; idx < headcount; idx += 1) {
          if (!(slot.assignments[idx] || '').trim()) unassignedPositions += 1;
        }
      });
    });
  });

  if (policyEditCount > 0 || dayPendingCount > 0 || invalidCoverageCount > 0 || unassignedPositions > 0) {
    window.alert(
      `Export blocked. Unsubmitted edits: ${policyEditCount}, pending day requests: ${dayPendingCount}, invalid coverage days: ${invalidCoverageCount}, unassigned positions: ${unassignedPositions}.`
    );
    return;
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    location: state.location,
    locationLabel: LOCATION_LABELS[state.location],
    horizonWeeks: state.horizonWeeks,
    startDate: state.startDate,
    workflow: {
      approvalRequiredForExceptions: true,
      noAutoAssignment: true,
      source: 'joyus-fast-casual-staffing-planner',
      gmApprovalRequiredForNextWeek: true,
    },
    approvals: {
      nextWeek: state.nextWeekApproval,
    },
    pto: {
      sync: state.ptoSync,
      requests: state.ptoRequests,
    },
    square: {
      location_id: SQUARE_LOCATION_IDS[state.location] || null,
      timezone: 'America/New_York',
    },
    weeks: state.weeks,
    approvedRequests: state.requests.filter((req) => req.status === 'approved'),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `staffing-plan-${state.location.toLowerCase()}-${state.startDate}-${state.horizonWeeks}w.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function bindPlannerEvents() {
  const board = document.getElementById('plannerBoard');
  const approvals = document.getElementById('approvalsView');
  const recent = document.getElementById('recentStaffingView');
  const sidebar = document.getElementById('weeklySidebar');

  board.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    if (action === 'submit-next-week-approval') {
      submitNextWeekForGMApproval();
      return;
    }

    const weekIdx = Number(target.dataset.week);
    const dayIdx = Number(target.dataset.day);
    const slotIdx = Number(target.dataset.slot);
    const day = getDay(weekIdx, dayIdx);
    if (!day && action !== 'submit-request') return;

    if (action === 'toggle-last-week-helper') {
      day.showLastWeekHelper = !day.showLastWeekHelper;
      saveState();
      renderAll();
      return;
    }

    if (action === 'copy-last-week') {
      const ref = lastWeekReferenceForDay(weekIdx, dayIdx);
      if (!ref.slots.length) {
        window.alert('No last-week schedule is available to copy for this day.');
        return;
      }
      const mode = target.dataset.copyMode;
      if (mode === 'names') {
        if (!day.slots.length) {
          window.alert('No current shifts to place names into. Use Copy Shifts or Copy Both.');
          return;
        }
        const changed = copyAssignmentsIntoCurrentSlots(day.slots, ref.slots);
        if (!changed) {
          window.alert('No matching or index-aligned shifts were available for name copy.');
          return;
        }
      } else if (mode === 'shifts') {
        day.slots = cloneSlotsFromReference(ref.slots, false);
      } else if (mode === 'both') {
        day.slots = cloneSlotsFromReference(ref.slots, true);
      } else {
        return;
      }
      day.lastAcceptedRecommendationKey = null;
      day.hasException = true;
      day.showLastWeekHelper = true;
      if (!day.note || !day.note.trim()) {
        if (mode === 'names') {
          day.note = `Copied names from ${ref.label} into current shifts.`;
        } else if (mode === 'shifts') {
          day.note = `Copied shift structure from ${ref.label}.`;
        } else {
          day.note = `Copied shifts and names from ${ref.label}.`;
        }
      }
      invalidateNextWeekApproval(weekIdx);
      saveState();
      renderAll();
      return;
    }

    if (action === 'pick-assignment') {
      if (!Number.isInteger(slotIdx) || !day?.slots?.[slotIdx]) return;
      const assignIdx = Number(target.dataset.assign);
      const selectedName = String(target.dataset.name || '').trim();
      if (!Number.isInteger(assignIdx)) return;
      const slot = day.slots[slotIdx];
      ensureAssignments(slot);
      slot.assignments[assignIdx] = selectedName;
      saveState();
      renderAll();
      return;
    }

    if (action === 'repeat-assignment-12w') {
      const assignIdx = Number(target.dataset.assign);
      if (!Number.isInteger(slotIdx) || !Number.isInteger(assignIdx)) return;
      const outcome = assignShiftForward(weekIdx, dayIdx, slotIdx, assignIdx, REPEAT_ASSIGNMENT_WEEKS);
      if (!outcome.name) {
        window.alert('Select an employee name in this slot first.');
        return;
      }
      saveState();
      renderAll();
      window.alert(
        `Assigned ${outcome.name} to ${outcome.applied} matching shift${outcome.applied === 1 ? '' : 's'} over the next ${Math.min(
          REPEAT_ASSIGNMENT_WEEKS,
          outcome.scanned
        )} week${outcome.scanned === 1 ? '' : 's'}${outcome.missingSlot ? ` (${outcome.missingSlot} week/day slots had no matching shift)` : ''}.`
      );
      return;
    }

    if (action === 'add-slot') {
      day.slots.push(makeSlot('17:00', '21:00', 'Flex Scooper', 1));
      day.lastAcceptedRecommendationKey = null;
      markException(day);
      invalidateNextWeekApproval(weekIdx);
      saveState();
      renderAll();
      return;
    }

    if (action === 'delete-slot') {
      if (!Number.isInteger(slotIdx) || !day.slots[slotIdx]) return;
      day.slots.splice(slotIdx, 1);
      day.lastAcceptedRecommendationKey = null;
      markException(day);
      invalidateNextWeekApproval(weekIdx);
      saveState();
      renderAll();
      return;
    }

    if (action === 'accept-recommendation') {
      const rec = dayRecommendation(state.location, day);
      if (!rec.action) {
        window.alert('No actionable recommendation is available for this day.');
        return;
      }
      if (!rec.canApply) {
        if (rec.alreadyApplied) {
          window.alert('Recommendation already applied for this day.');
        } else {
          window.alert('No adjustable support slots available to apply this recommendation.');
        }
        return;
      }

      const applied = applyRecommendationToDay(day, rec);
      if (!applied) {
        window.alert('Unable to apply recommendation while keeping coverage rules.');
        return;
      }

      markException(day);
      if (!day.note || !day.note.trim()) {
        day.note = `Accepted recommendation (${rec.action}) based on weather forecast/signal.`;
      }
      invalidateNextWeekApproval(weekIdx);
      saveState();
      renderAll();
      return;
    }

    if (action === 'submit-request') {
      submitChangeRequest(weekIdx, dayIdx);
    }
  });

  board.addEventListener('change', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const weekIdx = Number(target.dataset.week);
    const dayIdx = Number(target.dataset.day);
    const slotIdx = Number(target.dataset.slot);
    const day = getDay(weekIdx, dayIdx);
    if (!day) return;

    if (action === 'slot-field') {
      const slot = day.slots[slotIdx];
      if (!slot) return;

      const field = target.dataset.field;
      if (field === 'headcount') {
        slot.headcount = Math.max(1, Math.min(6, Number(target.value) || 1));
        ensureAssignments(slot);
      } else {
        slot[field] = target.value;
      }

      day.lastAcceptedRecommendationKey = null;
      markException(day);
      invalidateNextWeekApproval(weekIdx);
      saveState();
      renderAll();
      return;
    }

    if (action === 'slot-assignment-input') {
      const slot = day.slots[slotIdx];
      if (!slot) return;
      const assignIdx = Number(target.dataset.assign);
      slot.assignments[assignIdx] = target.value || '';
      paintAssignmentMatchList(target);
      saveState();
      return;
    }

    if (action === 'day-note') {
      day.note = target.value;
      invalidateNextWeekApproval(weekIdx);
      saveState();
    }
  });

  board.addEventListener('input', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    if (target.dataset.action !== 'slot-assignment-input') return;

    const weekIdx = Number(target.dataset.week);
    const dayIdx = Number(target.dataset.day);
    const slotIdx = Number(target.dataset.slot);
    const assignIdx = Number(target.dataset.assign);
    const slot = getDay(weekIdx, dayIdx)?.slots?.[slotIdx];
    if (!slot || !Number.isInteger(assignIdx)) return;
    ensureAssignments(slot);
    slot.assignments[assignIdx] = target.value || '';
    paintAssignmentMatchList(target);
    saveState();
  });

  if (approvals) {
    approvals.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;

      if (action === 'sync-pto') {
        syncPtoFromSquare();
        return;
      }

      if (action === 'gm-approve-next-week') {
        setGMDecision('approved');
        return;
      }

      if (action === 'gm-reject-next-week') {
        setGMDecision('rejected');
        return;
      }

      const requestId = target.dataset.requestId;
      if (!requestId) return;

      if (action === 'approve-request') {
        setRequestStatus(requestId, 'approved');
        return;
      }

      if (action === 'reject-request') {
        setRequestStatus(requestId, 'rejected');
      }
    });
  }

  if (sidebar) {
    sidebar.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) return;
      if (target.dataset.action !== 'sync-pto') return;
      syncPtoFromSquare();
    });
  }

  if (recent) {
    recent.addEventListener('input', (event) => {
      const target = event.target.closest('[data-action="recent-analysis-note-draft"]');
      if (!target) return;
      const loc = target.dataset.location;
      const dateIso = target.dataset.date;
      if ((loc !== 'EP' && loc !== 'NL') || !/^\d{4}-\d{2}-\d{2}$/.test(String(dateIso || ''))) return;
      setRecentAnalysisDraftNote(loc, dateIso, target.value);
      saveState();
    });

    recent.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) return;
      if (target.dataset.action !== 'submit-recent-analysis-note') return;

      const loc = target.dataset.location;
      const dateIso = target.dataset.date;
      if ((loc !== 'EP' && loc !== 'NL') || !/^\d{4}-\d{2}-\d{2}$/.test(String(dateIso || ''))) return;
      const textarea = recent.querySelector(
        `textarea[data-action=\"recent-analysis-note-draft\"][data-location=\"${loc}\"][data-date=\"${dateIso}\"]`
      );
      const nextNote = textarea ? textarea.value : getRecentAnalysisDraftNote(loc, dateIso) || '';
      setRecentAnalysisNote(loc, dateIso, nextNote);
      clearRecentAnalysisDraftNote(loc, dateIso);
      saveState();
      renderAll();
    });
  }

  const compliance = document.getElementById('complianceView');
  if (compliance) {
    compliance.addEventListener('change', (event) => {
      const target = event.target.closest('[data-action="settings-field"]');
      if (!target) return;
      const section = target.dataset.section;
      const key = target.dataset.key;
      if (!section || !key) return;

      let value;
      if (target.type === 'checkbox') {
        value = Boolean(target.checked);
      } else if (target.type === 'number') {
        const parsed = Number(target.value);
        value = Number.isFinite(parsed) ? parsed : 0;
      } else {
        value = target.value;
      }

      updateSettingsValue(section, key, value);
      if (section === 'seasonHours') {
        syncPristineDaysWithTemplateSlots();
      }
      saveState();
      renderAll();
    });

    compliance.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) return;
      if (target.dataset.action !== 'settings-apply-recommended') return;
      const key = target.dataset.key;
      if (!key || !Object.prototype.hasOwnProperty.call(RECOMMENDED_OPENING_DATES, key)) return;
      updateSettingsValue('openingSchedule', key, RECOMMENDED_OPENING_DATES[key]);
      saveState();
      renderAll();
    });
  }
}

function bindControls() {
  const topMenuNav = document.getElementById('topMenuNav');
  const plannerSubnav = document.getElementById('plannerSubnav');

  if (topMenuNav) {
    topMenuNav.addEventListener('click', (event) => {
      const target = event.target.closest('[data-menu]');
      if (!target) return;
      event.preventDefault();

      const nextMenu = normalizeTopMenu(target.dataset.menu);
      state.topMenu = nextMenu;
      if (nextMenu === 'shift_planner') {
        state.plannerPage = normalizePlannerPage(state.plannerPage);
        state.highlightsStoreScope = state.location;
      }
      syncHashToTopMenu();
      saveState();
      renderAll();
    });
  }

  window.addEventListener('hashchange', () => {
    const next = topMenuFromHash(window.location.hash);
    if (!next || next === normalizeTopMenu(state.topMenu)) return;
    state.topMenu = next;
    if (next === 'shift_planner') {
      state.plannerPage = normalizePlannerPage(state.plannerPage);
      state.highlightsStoreScope = state.location;
    }
    saveState();
    renderAll();
  });

  if (plannerSubnav) {
    plannerSubnav.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      if (action === 'switch-planner-page') {
        const nextPage = target.dataset.page;
        state.plannerPage = normalizePlannerPage(nextPage);
        saveState();
        renderAll();
        return;
      }

      if (action === 'switch-approvals-subtab') {
        const nextSubtab = target.dataset.subtab;
        state.approvalsSubtab =
          nextSubtab === 'day_requests' || nextSubtab === 'pto_requests' ? nextSubtab : 'next_week';
        saveState();
        renderAll();
        return;
      }

      if (action === 'switch-compliance-subtab') {
        const nextSubtab = target.dataset.subtab;
        state.complianceSubtab = normalizeComplianceSubtab(nextSubtab);
        saveState();
        renderAll();
        return;
      }

      if (action === 'set-highlights-lookback') {
        const weeks = clamp(Number(target.dataset.weeks) || DEFAULT_HIGHLIGHTS_WEEKS, 1, MAX_HIGHLIGHTS_WEEKS);
        state.highlightsLookbackWeeks = weeks;
        saveState();
        renderAll();
        return;
      }

      if (action === 'set-highlights-compare') {
        const mode = target.dataset.mode === 'planned_vs_actual' ? 'planned_vs_actual' : 'actual_vs_baseline';
        state.highlightsCompareMode = mode;
        saveState();
        renderAll();
        return;
      }

      if (action === 'set-highlights-scope') {
        const scope = target.dataset.scope;
        state.highlightsStoreScope = normalizeStoreScope(scope);
        if (state.highlightsStoreScope !== 'BOTH') {
          state.location = state.highlightsStoreScope;
        }
        saveState();
        renderAll();
      }
    });

    plannerSubnav.addEventListener('change', (event) => {
      const target = event.target.closest('[data-action="set-highlights-scope-select"]');
      if (!target) return;
      const scope = target.value;
      state.highlightsStoreScope = normalizeStoreScope(scope);
      if (state.highlightsStoreScope !== 'BOTH') {
        state.location = state.highlightsStoreScope;
      }
      saveState();
      renderAll();
    });
  }

  document.getElementById('locationSelect').addEventListener('change', (event) => {
    const nextLocation = event.target.value;
    const changed = state.location !== nextLocation;
    state.location = nextLocation;
    state.highlightsStoreScope = state.location;
    if (changed) {
      buildWeeks();
    }
    saveState();
    renderAll();
  });

  document.getElementById('horizonSelect').addEventListener('change', (event) => {
    state.horizonWeeks = Math.max(1, Number(event.target.value) || 2);
    buildWeeks();
    saveState();
    renderAll();
  });

  document.getElementById('startDateInput').addEventListener('change', (event) => {
    state.startDate = isoDate(toMonday(parseIso(event.target.value)));
    buildWeeks();
    saveState();
    renderAll();
  });

  document.getElementById('generateBtn').addEventListener('click', () => {
    buildWeeks();
    saveState();
    renderAll();
  });

  document.getElementById('exportBtn').addEventListener('click', exportApprovedPayload);
}

async function loadSourceData() {
  const res = await fetch('data.json');
  if (!res.ok) throw new Error(`Failed to load data.json: ${res.status}`);
  sourceData = await res.json();

  const seededPto = dedupeAndNormalizePtoRequests(extractPtoRowsFromPayload(sourceData));
  if (seededPto.length && !(state.ptoRequests || []).length) {
    state.ptoRequests = seededPto;
    state.ptoSync = normalizePtoSync({
      ...state.ptoSync,
      source: 'square',
      status: 'degraded',
      lastSuccessAt: new Date().toISOString(),
      lastError: 'Loaded PTO from static dataset fallback (live Square sync not configured).',
    });
  }
}

function applyAuthGate() {
  const gate = document.getElementById('auth-gate');
  const main = document.getElementById('planner-shell');
  const input = document.getElementById('auth-password');
  const form = document.getElementById('auth-form');
  const error = document.getElementById('auth-error');

  const unlock = async (remember) => {
    if (remember) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, 'ok');
      } catch (_err) {
        // Ignore storage failures.
      }
    }

    gate.style.display = 'none';
    main.style.display = 'grid';

    await bootstrapPlanner();
  };

  let remembered = false;
  try {
    remembered = localStorage.getItem(AUTH_STORAGE_KEY) === 'ok';
  } catch (_err) {
    remembered = false;
  }

  if (remembered) {
    unlock(false).catch((err) => {
      main.innerHTML = `<section class="panel" style="padding:1rem;"><h2>Failed to load planner</h2><p>${esc(String(err))}</p></section>`;
      main.style.display = 'block';
    });
    return;
  }

  const attempt = () => {
    if ((input.value || '').trim() === AUTH_PASSWORD) {
      error.style.display = 'none';
      unlock(true).catch((err) => {
        main.innerHTML = `<section class="panel" style="padding:1rem;"><h2>Failed to load planner</h2><p>${esc(String(err))}</p></section>`;
        main.style.display = 'block';
      });
      return;
    }
    error.style.display = 'block';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    attempt();
  });
  input.focus();
}

async function bootstrapPlanner() {
  if (!sourceData) {
    await loadSourceData();
    await loadWeatherData();
    loadState();
    state.topMenu = normalizeTopMenu(state.topMenu);
    state.plannerPage = normalizePlannerPage(state.plannerPage);
    state.complianceSubtab = normalizeComplianceSubtab(state.complianceSubtab);
    applyTopMenuFromHash();
    if (state.topMenu === 'shift_planner' && state.highlightsStoreScope === 'BOTH') {
      state.highlightsStoreScope = state.location;
    }

    if (!state.startDate) {
      state.startDate = isoDate(nextMonday(new Date()));
    } else {
      state.startDate = isoDate(toMonday(parseIso(state.startDate)));
    }

    if (plannerWeeksNeedRebuild()) {
      buildWeeks();
    }

    bindControls();
    bindPlannerEvents();
  }

  if (!topMenuFromHash(window.location.hash)) {
    syncHashToTopMenu();
  }

  renderAll();
}

applyAuthGate();
