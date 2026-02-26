import type {
  DeliveryMode,
  WeekdayProfile,
  WeeklyMetrics,
  MonthlyMetrics,
  MonthlyDataRow,
  CalendarMonth,
  SharedManagerImpact,
  TenantSettings,
} from '../types/index.js';

const OPERATING_DAYS: readonly string[] = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Gross profit = revenue * gpMarginFactor - labor.
 * Replaces hardcoded 0.72 factor from legacy app.js.
 */
export function grossProfit(revenue: number, labor: number, gpMarginFactor: number): number {
  return revenue * gpMarginFactor - labor;
}

/**
 * Labor percentage of revenue.
 */
export function laborPercent(labor: number, revenue: number): number {
  return revenue > 0 ? (labor / revenue) * 100 : 0;
}

/**
 * Revenue adjusted by delivery mode.
 * - 'include': return base revenue as-is
 * - 'exclude': subtract DoorDash component
 * - 'doordash_only': return only DoorDash component
 */
export function revenueWithMode(
  baseRevenue: number,
  doordashComponent: number,
  mode: DeliveryMode,
): number {
  const rev = Number(baseRevenue || 0);
  if (mode === 'exclude') return rev - Number(doordashComponent || 0);
  if (mode === 'doordash_only') return Number(doordashComponent || 0);
  return rev;
}

/**
 * Get Tuesday baseline revenue for a given month, adjusted by delivery mode.
 */
export function tuesdayBaselineForMonth(
  weekdayProfile: WeekdayProfile,
  mode: DeliveryMode,
): number {
  const tue = weekdayProfile.Tue;
  if (!tue) return 0;
  return revenueWithMode(tue.avg_revenue, tue.avg_doordash_net || 0, mode);
}

/**
 * Shared manager weekly impact calculation.
 * From app.js:390-421. Made pure: all config values are parameters.
 */
export function sharedManagerWeeklyImpact(
  active: boolean,
  hourlyRate: number,
  weeklyHours: number,
  mgmtShare: number,
  replacementRate: number,
): SharedManagerImpact {
  if (!active) {
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

  const clampedShare = Math.min(Math.max(mgmtShare, 0), 1);
  const mgmtHours = weeklyHours * clampedShare;
  const floorHours = weeklyHours - mgmtHours;
  const grossCost = weeklyHours * hourlyRate;
  const replacementCredit = floorHours * replacementRate;
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

/**
 * Core weekly financial metrics for a single location at a single month.
 * From app.js:789-842. Uses settings.gpMarginFactor instead of hardcoded 0.72.
 */
export function weeklyMetricsForLocationAtMonth(
  weekdayProfile: WeekdayProfile,
  mondayLabor: number,
  planKey: string,
  mondayScenario: string,
  settings: TenantSettings,
  managerActive: boolean,
  managerMgmtShare: number,
  mode: DeliveryMode,
): WeeklyMetrics {
  let revenue = 0;
  let labor = 0;

  for (const day of OPERATING_DAYS) {
    const dayData = weekdayProfile[day as keyof WeekdayProfile];
    if (dayData) {
      revenue += revenueWithMode(dayData.avg_revenue, dayData.avg_doordash_net || 0, mode);
      labor += dayData.avg_labor;
    }
  }

  let mondayRevenue = 0;
  let mondayLaborOut = 0;

  if (planKey === 'open_7_day') {
    const tuesdayBaseline = tuesdayBaselineForMonth(weekdayProfile, mode);
    const factor = settings.mondayScenarios[mondayScenario as keyof typeof settings.mondayScenarios] ?? settings.mondayScenarios.base;
    mondayRevenue = tuesdayBaseline * factor;
    mondayLaborOut = mondayLabor || 0;
    revenue += mondayRevenue;
    labor += mondayLaborOut;
  }

  let managerAddedLabor = 0;
  let managerFloorHours = 0;
  let managerMgmtHours = 0;

  if (managerActive) {
    const shared = sharedManagerWeeklyImpact(
      true,
      settings.payRates.manager,
      40,
      managerMgmtShare,
      settings.payRates.scooper,
    );
    managerAddedLabor = shared.perStoreLabor;
    managerFloorHours = shared.perStoreFloorHours;
    managerMgmtHours = shared.perStoreMgmtHours;
    labor += managerAddedLabor;
  }

  const gp = grossProfit(revenue, labor, settings.gpMarginFactor);
  const laborPct = laborPercent(labor, revenue);

  return {
    revenue,
    labor,
    gp,
    laborPct,
    mondayRevenue,
    mondayLabor: mondayLaborOut,
    managerAddedLabor,
    managerFloorHours,
    managerMgmtHours,
  };
}

/**
 * Monthly financial metrics for a single location at a single month.
 * From app.js:908-947.
 */
export function monthlyMetricsForLocationAtMonth(
  monthlyRow: MonthlyDataRow,
  weekdayProfile: WeekdayProfile,
  calendarMonth: CalendarMonth,
  mondayLabor: number,
  planKey: string,
  mondayScenario: string,
  settings: TenantSettings,
  managerActive: boolean,
  managerMgmtShare: number,
  mode: DeliveryMode,
): MonthlyMetrics {
  let revenue = revenueWithMode(monthlyRow.revenue, monthlyRow.doordash_net_component || 0, mode);
  let labor = monthlyRow.store_labor;
  let mondayRevenue = 0;
  let mondayLaborOut = 0;

  if (planKey === 'open_7_day') {
    const tuesdayBaseline = tuesdayBaselineForMonth(weekdayProfile, mode);
    const factor = settings.mondayScenarios[mondayScenario as keyof typeof settings.mondayScenarios] ?? settings.mondayScenarios.base;
    const mondayCount = calendarMonth.mondays;
    mondayRevenue = tuesdayBaseline * factor * mondayCount;
    mondayLaborOut = mondayLabor * mondayCount;
    revenue += mondayRevenue;
    labor += mondayLaborOut;
  }

  let managerAddedLabor = 0;
  if (managerActive) {
    const shared = sharedManagerWeeklyImpact(
      true,
      settings.payRates.manager,
      40,
      managerMgmtShare,
      settings.payRates.scooper,
    );
    // Scale to monthly using week factor
    const operatingDays = planKey === 'open_7_day'
      ? (calendarMonth.operating_days_6 + calendarMonth.mondays)
      : calendarMonth.operating_days_6;
    const weekFactor = operatingDays / 7;
    managerAddedLabor = shared.perStoreLabor * weekFactor;
    labor += managerAddedLabor;
  }

  return {
    revenue,
    labor,
    gp: grossProfit(revenue, labor, settings.gpMarginFactor),
    laborPct: laborPercent(labor, revenue),
    mondayRevenue,
    mondayLabor: mondayLaborOut,
    managerAddedLabor,
  };
}

/**
 * Rolling average of a numeric series.
 * From app.js:979-989.
 */
export function rollingAverage(values: number[], windowSize: number): number[] {
  if (!Array.isArray(values) || values.length === 0) return [];
  const out: number[] = [];
  for (let idx = 0; idx < values.length; idx += 1) {
    const start = Math.max(0, idx - windowSize + 1);
    const slice = values.slice(start, idx + 1);
    const sum = slice.reduce((acc, v) => acc + Number(v || 0), 0);
    out.push(sum / slice.length);
  }
  return out;
}
