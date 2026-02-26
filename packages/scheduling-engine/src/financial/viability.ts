import type {
  DayExpectedProfile,
  ScheduleDay,
  TenantSettings,
  FinancialViability,
} from '../types/index.js';

import { estimatedLaborForDay } from '../scheduling/slots.js';

/**
 * Financial viability check for a schedule day against expected profile.
 * From staffing-planner.js:1895-1947.
 * Uses settings for pay rates, target/watch thresholds, and GP margin factor.
 */
export function dayFinancialViability(
  expected: DayExpectedProfile | null,
  day: Pick<ScheduleDay, 'slots'>,
  settings: TenantSettings,
): FinancialViability {
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
      expectedGp: 0,
    };
  }

  const plannedLabor = estimatedLaborForDay(day, settings.payRates);
  const expectedRevenue = Number(expected.revenue || 0);
  const plannedLaborPct = expectedRevenue > 0 ? (plannedLabor / expectedRevenue) * 100 : 0;
  const expectedGp = expectedRevenue * settings.gpMarginFactor - plannedLabor;
  const target = settings.targetProfile.laborTargetPct;
  const watch = settings.targetProfile.laborWatchPct;

  let tone: FinancialViability['tone'] = 'good';
  let label = 'Likely Healthy';
  if (expectedGp < 0 || plannedLaborPct > watch) {
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
    expectedGp,
  };
}
