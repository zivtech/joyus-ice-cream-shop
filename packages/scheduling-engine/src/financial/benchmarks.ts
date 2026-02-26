import type {
  HealthSignal,
  HealthTone,
  BenchmarkBand,
  BenchmarkTone,
  ComparisonOperator,
  TriggerCondition,
  PlaybookMetrics,
} from '../types/index.js';

/**
 * Maps labor percentage to a health signal.
 * From app.js:1076-1080. Thresholds are now parameters (defaults match legacy 16/24).
 */
export function healthSignal(
  laborPct: number,
  watchThreshold: number = 16,
  riskThreshold: number = 24,
): HealthSignal {
  if (laborPct <= watchThreshold) return { label: 'Healthy', tone: 'good' };
  if (laborPct <= riskThreshold) return { label: 'Watch', tone: 'watch' };
  return { label: 'High Load', tone: 'risk' };
}

/**
 * Benchmark tone for a value against a band.
 * From app.js:2171-2184.
 */
export function benchmarkTone(
  value: number,
  band: BenchmarkBand,
  lowerIsBetter: boolean,
): BenchmarkTone {
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

/**
 * Generic threshold comparator. Supports all comparison operators.
 * From app.js:726-729, extended to support >, <, ==.
 */
export function conditionMet(
  value: number,
  operator: ComparisonOperator,
  threshold: number,
): boolean {
  switch (operator) {
    case '>=': return value >= threshold;
    case '<=': return value <= threshold;
    case '>':  return value > threshold;
    case '<':  return value < threshold;
    case '==': return value === threshold;
    default:   return value >= threshold;
  }
}

/**
 * Distance from a metric value to the trigger threshold.
 * Positive = unmet gap, negative = headroom.
 * From app.js:2149-2153.
 */
export function conditionGap(condition: TriggerCondition, metrics: PlaybookMetrics): number {
  const value = Number((metrics as unknown as Record<string, number>)[condition.metric] || 0);
  if (condition.operator === '<=') return value - condition.threshold;
  return condition.threshold - value;
}
