// ─── Core Entities ──────────────────────────────────────────────────────────

export interface Location {
  code: string;
  label: string;
  squareId?: string;
  coords?: { lat: number; lon: number };
}

export type Season = 'winter' | 'spring' | 'summer' | 'fall';

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const OPERATING_DAYS_6: Weekday[] = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const SEASONS: Season[] = ['winter', 'spring', 'summer', 'fall'];

// ─── Slots & Templates ─────────────────────────────────────────────────────

export interface Slot {
  id: string;
  start: string;       // "HH:MM"
  end: string;         // "HH:MM"
  role: string;
  headcount: number;
  assignments: string[];
}

export interface TemplateSlotDef {
  start: string;
  end: string;
  role: string;
  headcount: number;
}

export type WeeklyTemplateProfile = Record<Weekday, TemplateSlotDef[]>;

// ─── Schedule Day & Week ────────────────────────────────────────────────────

export interface ScheduleDay {
  date: string;        // ISO date "YYYY-MM-DD"
  weekday: Weekday;
  season: Season;
  slots: Slot[];
  note?: string;
  hasException?: boolean;
  pendingRequestId?: string | null;
  lastDecision?: string | null;
  lastAcceptedRecommendationKey?: string | null;
}

export interface ScheduleWeek {
  weekStart: string;   // ISO date of Monday
  days: ScheduleDay[];
}

// ─── Financial Metrics ──────────────────────────────────────────────────────

export interface WeeklyMetrics {
  revenue: number;
  labor: number;
  gp: number;          // grossProfit = revenue * gpMarginFactor - labor
  laborPct: number;
  mondayRevenue: number;
  mondayLabor: number;
  managerAddedLabor: number;
  managerFloorHours: number;
  managerMgmtHours: number;
}

export interface MonthlyMetrics {
  revenue: number;
  labor: number;
  gp: number;
  laborPct: number;
  mondayRevenue: number;
  mondayLabor: number;
  managerAddedLabor: number;
}

export interface AnnualScenarioMetrics {
  revenue: number;
  labor: number;
  gp: number;
  laborPct: number;
  managerAddedLabor?: number;
}

export interface AnnualMetrics {
  current: AnnualScenarioMetrics;
  open: AnnualScenarioMetrics;
}

export interface SharedManagerImpact {
  totalLabor: number;
  perStoreLabor: number;
  totalMgmtHours: number;
  perStoreMgmtHours: number;
  totalFloorHours: number;
  perStoreFloorHours: number;
  replacementCredit: number;
}

export interface DayExpectedProfile {
  revenue: number;
  labor: number;
  grossProfit: number;
  laborPct: number;
}

export interface FinancialViability {
  tone: 'good' | 'watch' | 'risk' | 'pending';
  label: string;
  summary: string;
  expectedRevenue: number;
  expectedLabor: number;
  expectedLaborPct: number;
  plannedLabor: number;
  plannedLaborPct: number;
  expectedGp: number;
}

// ─── Health & Benchmarks ────────────────────────────────────────────────────

export type HealthTone = 'good' | 'watch' | 'risk';

export interface HealthSignal {
  label: string;
  tone: HealthTone;
}

export interface BenchmarkBand {
  p25: number;
  p50: number;
  p75: number;
}

export interface SurveyBenchmarks {
  sampleSize: number;
  profitSampleSize: number;
  medians: {
    ticket: number;
    cogsPct: number;
    laborPct: number;
    rentPct: number;
    totalPct: number;
    profitPct: number;
  };
  bands: {
    laborPct: BenchmarkBand;
    cogsPct: BenchmarkBand;
    rentPct: BenchmarkBand;
    totalPct: BenchmarkBand;
    profitPct: BenchmarkBand;
    ticket: BenchmarkBand;
  };
}

export interface BenchmarkTone {
  pill: string;
  label: string;
}

// ─── Weather ────────────────────────────────────────────────────────────────

export interface WeatherRow {
  tempMax?: number;
  code?: number;
  precipProb?: number;
  precipMm?: number;
}

export interface HourlyWeatherRow {
  hour: number;
  precipProb?: number;
  precipMm?: number;
}

export interface TemperatureDelta {
  available: boolean;
  actual: number | null;
  expected: number | null;
  delta: number | null;
}

export type WeatherImpact = 'up' | 'down' | 'neutral';

export interface WeatherSignal {
  impact: WeatherImpact;
  label: string;
  reason: string;
  delta: number | null;
  expected: number | null;
  actual: number | null;
  window: string | null;
  eventHour: number | null;
}

export interface PrecipSignal {
  impact: WeatherImpact;
  label: string;
  window: string;
  eventHour: number;
  reason: string;
}

export interface StaffingRecommendation {
  action: 'increase_support' | 'decrease_support' | null;
  signal: WeatherSignal;
  message: string;
  canApply: boolean;
  buttonLabel: string;
  key: string;
  alreadyApplied?: boolean;
}

// ─── Seasonal Triggers ──────────────────────────────────────────────────────

export type TransitionKey = 'up_spring' | 'up_summer' | 'down_fall' | 'down_winter';

export const TRANSITION_ORDER: TransitionKey[] = ['up_spring', 'up_summer', 'down_fall', 'down_winter'];

export type ComparisonOperator = '>=' | '<=' | '>' | '<' | '==';

export interface TriggerCondition {
  metric: string;
  operator: ComparisonOperator;
  threshold: number;
}

export interface TriggerRule {
  label: string;
  detail: string;
  conditions: TriggerCondition[];
}

export type LocationTriggerRules = Record<TransitionKey, TriggerRule>;

export interface TriggerTiming {
  ruleKey: TransitionKey;
  label: string;
  detail: string;
  firstHit: string;
  lastHit: string;
  hitRate: number;
  currentMet: boolean;
}

export interface TriggerGapCondition extends TriggerCondition {
  delta: number;
  unmet: boolean;
  normGap: number;
}

export interface TriggerGapEvaluation {
  ruleKey: TransitionKey;
  label: string;
  detail: string;
  unmet: TriggerGapCondition[];
  maxNormGap: number;
}

export interface TargetProfile {
  label: string;
  summary: string;
  revenueFactor: number;
  shareDelta: number;
}

// ─── PTO ────────────────────────────────────────────────────────────────────

export interface PTORequest {
  id: string;
  employee: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'approved' | 'pending' | 'denied' | 'cancelled';
}

export interface PTOSummary {
  total: number;
  approvedCount: number;
  pendingCount: number;
  conflicts: PTORequest[];
}

// ─── Delivery ───────────────────────────────────────────────────────────────

export type DeliveryMode = 'include' | 'exclude' | 'doordash_only';

// ─── Retrospective ─────────────────────────────────────────────────────────

export interface OverstaffAssessment {
  expectedRevenue: number;
  expectedLabor: number;
  expectedGrossProfit?: number;
  expectedLaborPct: number;
  actualLaborPct: number;
  overstaffed: boolean;
  recommendation: string;
  weatherSignal: WeatherSignal;
}

export interface ActualDayRow {
  date: string;
  revenue: number;
  store_labor: number;
  location?: string;
}

// ─── Validation ─────────────────────────────────────────────────────────────

export interface ValidationResult {
  ok: boolean;
  message: string;
}

export interface WeekReadinessChecks {
  pendingRequests: number;
  unsubmittedExceptions: number;
  unassignedPositions: number;
  invalidCoverageDays: number;
  ptoConflicts: number;
}

export interface AssignmentGapRow {
  weekLabel: string;
  unassigned: number;
  daysWithGaps: number;
}

// ─── Tenant Settings (replaces all hardcoded CONFIG values) ─────────────────

export interface PayRates {
  manager: number;
  keyLead: number;
  scooper: number;
}

export interface TargetProfileSettings {
  laborTargetPct: number;
  laborWatchPct: number;
  profitFloorPct: number;
  profitBasePct: number;
  profitStretchPct: number;
}

export interface WorkflowSettings {
  minOpeners: number;
  minClosers: number;
  requirePolicyApproval: boolean;
  requireGMApproval: boolean;
}

export interface SeasonHours {
  winterOpen: string;
  winterClose: string;
  springOpen: string;
  springClose: string;
  summerOpen: string;
  summerClose: string;
  fallOpen: string;
  fallClose: string;
}

export interface MondayScenarios {
  low: number;
  base: number;
  high: number;
}

export interface TenantSettings {
  gpMarginFactor: number;          // default 0.72 (1 - COGS%)
  mondayScenarios: MondayScenarios;
  payRates: PayRates;
  targetProfile: TargetProfileSettings;
  workflow: WorkflowSettings;
  seasonHours: SeasonHours;
  weatherThresholdF: number;       // default 10
  revenueMissThreshold: number;    // default 0.9
  laborPressureDelta: number;      // default 3
  repeatAssignmentWeeks: number;   // default 12
  weatherNormalsYears: number;     // default 6
}

export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  gpMarginFactor: 0.72,
  mondayScenarios: { low: 0.55, base: 0.65, high: 0.75 },
  payRates: { manager: 28, keyLead: 17, scooper: 15 },
  targetProfile: {
    laborTargetPct: 24,
    laborWatchPct: 27,
    profitFloorPct: 11,
    profitBasePct: 15,
    profitStretchPct: 17,
  },
  workflow: { minOpeners: 1, minClosers: 2, requirePolicyApproval: true, requireGMApproval: true },
  seasonHours: {
    winterOpen: '12:00', winterClose: '22:00',
    springOpen: '12:00', springClose: '22:00',
    summerOpen: '12:00', summerClose: '23:00',
    fallOpen: '12:00', fallClose: '22:00',
  },
  weatherThresholdF: 10,
  revenueMissThreshold: 0.9,
  laborPressureDelta: 3,
  repeatAssignmentWeeks: 12,
  weatherNormalsYears: 6,
};

// ─── Data Access Interfaces ─────────────────────────────────────────────────
// These abstract over the raw data.json shape so the engine doesn't depend on it.

export interface WeekdayProfileDay {
  avg_revenue: number;
  avg_labor: number;
  avg_doordash_net?: number;
  avg_gp_72?: number;
  labor_pct?: number;
}

export type WeekdayProfile = Partial<Record<Weekday, WeekdayProfileDay>>;

export interface MonthlyDataRow {
  revenue: number;
  store_labor: number;
  doordash_net_component?: number;
  avg_daily_revenue?: number;
  avg_daily_doordash_net?: number;
}

export interface CalendarMonth {
  mondays: number;
  operating_days_6: number;
}

export interface LocationMonthlyData {
  weekday_profile: Record<string, WeekdayProfile>;
  monthly: Record<string, MonthlyDataRow>;
  monday_labor: Record<string, number>;
}

export interface WeatherNormals {
  [dayKey: string]: number;  // "MM-DD" -> expected high temp
}

export interface LocationWeatherData {
  normals: WeatherNormals;
}

// ─── Seasonal Playbook Metrics ──────────────────────────────────────────────

export interface PlaybookMetrics {
  avgDailyRevenue: number;
  weekendShare: number;
  peakShare: number;
}
