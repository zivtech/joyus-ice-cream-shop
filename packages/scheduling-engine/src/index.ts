// ─── Types ──────────────────────────────────────────────────────────────────
export * from './types/index.js';

// ─── Financial ──────────────────────────────────────────────────────────────
export {
  grossProfit,
  laborPercent,
  revenueWithMode,
  tuesdayBaselineForMonth,
  sharedManagerWeeklyImpact,
  weeklyMetricsForLocationAtMonth,
  monthlyMetricsForLocationAtMonth,
  rollingAverage,
} from './financial/metrics.js';

export {
  healthSignal,
  benchmarkTone,
  conditionMet,
  conditionGap,
} from './financial/benchmarks.js';

export {
  dayFinancialViability,
} from './financial/viability.js';

// ─── Scheduling ─────────────────────────────────────────────────────────────
export {
  makeSlot,
  parseTimeToHours,
  slotHours,
  hourToTime,
  isOpenerRole,
  isCloserRole,
  isAdjustableRole,
  isEveningSlot,
  roleRateForSlot,
  estimatedLaborForDay,
  seasonHoursFor,
} from './scheduling/slots.js';

export {
  dayValidation,
  weekLaborHours,
  nextWeekChecks,
  assignmentGapSummary,
} from './scheduling/validation.js';

export {
  normalizeTemplateSlot,
  normalizeTemplateProfile,
  mergeTemplateProfiles,
  buildTemplateSlots,
} from './scheduling/templates.js';

// ─── Weather ────────────────────────────────────────────────────────────────
export {
  weatherCodeLabel,
  expectedTempForDate,
  temperatureDeltaForDate,
  weatherImpactSignal,
  timedPrecipSignal,
  staffingWeatherAction,
} from './weather/impact.js';

export {
  dayRecommendation,
  applyRecommendationToDay,
} from './weather/recommendations.js';

// ─── Seasonal ───────────────────────────────────────────────────────────────
export {
  seasonFromMonth,
  seasonForDate,
  triggerTimingForLocation,
  closestTriggerGap,
} from './seasonal/triggers.js';

export {
  profileThresholdFromDefault,
  buildTriggerRulesForProfile,
} from './seasonal/profiles.js';

// ─── PTO ────────────────────────────────────────────────────────────────────
export {
  ptoLocationMatches,
  ptoDateOverlap,
  ptoRowsForRange,
  ptoRowsForDay,
  assignedPeopleForDay,
  ptoSummaryForDay,
} from './pto/conflicts.js';

// ─── Retrospective ─────────────────────────────────────────────────────────
export {
  overstaffAssessment,
} from './retrospective/overstaff.js';

// ─── Delivery ───────────────────────────────────────────────────────────────
export { revenueWithMode as deliveryRevenueWithMode } from './delivery/revenue.js';

// ─── Adapter Contracts ──────────────────────────────────────────────────────
export type {
  NormalizedDailySales,
  NormalizedEmployee,
  NormalizedDeliveryDay,
  ShiftForPublish,
  ScheduleForPublish,
  PublishShiftResult,
  PublishResult,
  PosConnectionConfig,
  DeliveryConnectionConfig,
  SyncResult,
} from './adapters/types.js';
