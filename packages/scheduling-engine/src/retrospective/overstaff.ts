import type {
  DayExpectedProfile,
  WeatherSignal,
  TenantSettings,
  OverstaffAssessment,
} from '../types/index.js';

/**
 * Overstaffing assessment for a day comparing actual vs expected.
 * From staffing-planner.js:1949-1994.
 * Uses settings.revenueMissThreshold (0.9) and settings.laborPressureDelta (3)
 * instead of hardcoded values.
 */
export function overstaffAssessment(
  expected: DayExpectedProfile | null,
  actualRevenue: number,
  actualLabor: number,
  weatherSignal: WeatherSignal,
  settings: TenantSettings,
): OverstaffAssessment {
  const actualLaborPct = actualRevenue > 0 ? (actualLabor / actualRevenue) * 100 : 0;

  if (!expected) {
    return {
      expectedRevenue: 0,
      expectedLabor: 0,
      expectedLaborPct: settings.targetProfile.laborTargetPct,
      actualLaborPct,
      overstaffed: false,
      recommendation: 'No month baseline available for this date.',
      weatherSignal,
    };
  }

  const revenueMiss = actualRevenue < expected.revenue * settings.revenueMissThreshold;
  const laborPressure =
    actualLaborPct > expected.laborPct + settings.laborPressureDelta ||
    actualLaborPct > settings.targetProfile.laborTargetPct;
  const overstaffed = revenueMiss && laborPressure;

  let recommendation = 'Within expected staffing range.';
  if (overstaffed && weatherSignal.impact === 'down') {
    recommendation =
      'Demand looked weather-suppressed (10F+ below expected). Next similar day, trim 1 peak/support slot; keep 1 opener + 2 closers.';
  } else if (overstaffed) {
    recommendation =
      'Revenue underperformed vs baseline. Trim 1 non-closing support slot next similar day; keep 1 opener + 2 closers.';
  } else if (weatherSignal.impact === 'up') {
    recommendation =
      'Demand-lift weather (10F+ above expected). Consider pre-adding 1 peak/support slot for similar upcoming days.';
  }

  return {
    expectedRevenue: expected.revenue,
    expectedLabor: expected.labor,
    expectedGrossProfit: expected.grossProfit || 0,
    expectedLaborPct: expected.laborPct,
    actualLaborPct,
    overstaffed,
    recommendation,
    weatherSignal,
  };
}
