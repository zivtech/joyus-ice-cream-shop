import { describe, it, expect } from 'vitest';
import { healthSignal, benchmarkTone, conditionMet, conditionGap } from './benchmarks.js';
import type { BenchmarkBand, TriggerCondition, PlaybookMetrics } from '../types/index.js';

describe('healthSignal', () => {
  it('returns Healthy for low labor', () => {
    const result = healthSignal(10);
    expect(result.label).toBe('Healthy');
    expect(result.tone).toBe('good');
  });

  it('returns Watch for mid-range labor', () => {
    const result = healthSignal(20);
    expect(result.label).toBe('Watch');
    expect(result.tone).toBe('watch');
  });

  it('returns High Load for high labor', () => {
    const result = healthSignal(30);
    expect(result.label).toBe('High Load');
    expect(result.tone).toBe('risk');
  });

  it('respects custom thresholds', () => {
    expect(healthSignal(20, 10, 15).tone).toBe('risk');
    expect(healthSignal(12, 15, 25).tone).toBe('good');
  });

  it('handles boundary values', () => {
    expect(healthSignal(16).tone).toBe('good');
    expect(healthSignal(24).tone).toBe('watch');
    expect(healthSignal(24.01).tone).toBe('risk');
  });
});

describe('benchmarkTone', () => {
  const band: BenchmarkBand = { p25: 10, p50: 20, p75: 30 };

  it('returns Top Quartile for best values (lower is better)', () => {
    const result = benchmarkTone(8, band, true);
    expect(result.label).toBe('Top Quartile');
    expect(result.pill).toBe('status-good');
  });

  it('returns Better Than Median (lower is better)', () => {
    expect(benchmarkTone(15, band, true).label).toBe('Better Than Median');
  });

  it('returns Watch Zone (lower is better)', () => {
    expect(benchmarkTone(25, band, true).label).toBe('Watch Zone');
  });

  it('returns High vs Peers (lower is better)', () => {
    expect(benchmarkTone(35, band, true).label).toBe('High vs Peers');
  });

  it('returns Top Quartile for best values (higher is better)', () => {
    expect(benchmarkTone(35, band, false).label).toBe('Top Quartile');
  });

  it('returns Low vs Peers (higher is better)', () => {
    expect(benchmarkTone(5, band, false).label).toBe('Low vs Peers');
  });
});

describe('conditionMet', () => {
  it('handles >= operator', () => {
    expect(conditionMet(10, '>=', 10)).toBe(true);
    expect(conditionMet(11, '>=', 10)).toBe(true);
    expect(conditionMet(9, '>=', 10)).toBe(false);
  });

  it('handles <= operator', () => {
    expect(conditionMet(10, '<=', 10)).toBe(true);
    expect(conditionMet(9, '<=', 10)).toBe(true);
    expect(conditionMet(11, '<=', 10)).toBe(false);
  });

  it('handles > operator', () => {
    expect(conditionMet(11, '>', 10)).toBe(true);
    expect(conditionMet(10, '>', 10)).toBe(false);
  });

  it('handles < operator', () => {
    expect(conditionMet(9, '<', 10)).toBe(true);
    expect(conditionMet(10, '<', 10)).toBe(false);
  });

  it('handles == operator', () => {
    expect(conditionMet(10, '==', 10)).toBe(true);
    expect(conditionMet(11, '==', 10)).toBe(false);
  });
});

describe('conditionGap', () => {
  it('computes gap for >= condition', () => {
    const cond: TriggerCondition = { metric: 'avgDailyRevenue', operator: '>=', threshold: 500 };
    const metrics: PlaybookMetrics = { avgDailyRevenue: 400, weekendShare: 50, peakShare: 30 };
    expect(conditionGap(cond, metrics)).toBe(100); // threshold - value = 500 - 400
  });

  it('computes gap for <= condition', () => {
    const cond: TriggerCondition = { metric: 'weekendShare', operator: '<=', threshold: 40 };
    const metrics: PlaybookMetrics = { avgDailyRevenue: 400, weekendShare: 50, peakShare: 30 };
    expect(conditionGap(cond, metrics)).toBe(10); // value - threshold = 50 - 40
  });

  it('returns negative when condition is met with headroom', () => {
    const cond: TriggerCondition = { metric: 'avgDailyRevenue', operator: '>=', threshold: 300 };
    const metrics: PlaybookMetrics = { avgDailyRevenue: 400, weekendShare: 50, peakShare: 30 };
    expect(conditionGap(cond, metrics)).toBe(-100);
  });
});
