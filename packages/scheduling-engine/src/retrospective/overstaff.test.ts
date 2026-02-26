import { describe, it, expect } from 'vitest';
import { overstaffAssessment } from './overstaff.js';
import type { DayExpectedProfile, WeatherSignal, TenantSettings } from '../types/index.js';
import { DEFAULT_TENANT_SETTINGS } from '../types/index.js';

const neutralSignal: WeatherSignal = {
  impact: 'neutral',
  label: 'Near Expected',
  reason: 'Test',
  delta: 2,
  expected: 80,
  actual: 82,
  window: null,
  eventHour: null,
};

const downSignal: WeatherSignal = {
  impact: 'down',
  label: 'Demand Risk',
  reason: 'Test',
  delta: -12,
  expected: 80,
  actual: 68,
  window: null,
  eventHour: null,
};

const upSignal: WeatherSignal = {
  impact: 'up',
  label: 'Demand Lift',
  reason: 'Test',
  delta: 15,
  expected: 80,
  actual: 95,
  window: null,
  eventHour: null,
};

const expected: DayExpectedProfile = {
  revenue: 1000,
  labor: 200,
  grossProfit: 520,
  laborPct: 20,
};

describe('overstaffAssessment', () => {
  it('returns not overstaffed when revenue and labor are on target', () => {
    const result = overstaffAssessment(
      expected,
      1000,
      200,
      neutralSignal,
      DEFAULT_TENANT_SETTINGS,
    );
    expect(result.overstaffed).toBe(false);
    expect(result.recommendation).toBe('Within expected staffing range.');
  });

  it('returns overstaffed when revenue misses and labor is high', () => {
    const result = overstaffAssessment(
      expected,
      800, // < 1000 * 0.9 = 900
      250, // laborPct = 31.25% > 20 + 3 = 23
      neutralSignal,
      DEFAULT_TENANT_SETTINGS,
    );
    expect(result.overstaffed).toBe(true);
    expect(result.recommendation).toContain('Trim 1 non-closing support slot');
  });

  it('returns weather-suppressed message when overstaffed and weather is down', () => {
    const result = overstaffAssessment(
      expected,
      800,
      250,
      downSignal,
      DEFAULT_TENANT_SETTINGS,
    );
    expect(result.overstaffed).toBe(true);
    expect(result.recommendation).toContain('weather-suppressed');
  });

  it('returns demand-lift message when weather is up', () => {
    const result = overstaffAssessment(
      expected,
      1000,
      200,
      upSignal,
      DEFAULT_TENANT_SETTINGS,
    );
    expect(result.overstaffed).toBe(false);
    expect(result.recommendation).toContain('Demand-lift');
  });

  it('handles null expected profile', () => {
    const result = overstaffAssessment(
      null,
      1000,
      200,
      neutralSignal,
      DEFAULT_TENANT_SETTINGS,
    );
    expect(result.overstaffed).toBe(false);
    expect(result.recommendation).toContain('No month baseline');
  });

  it('uses settings thresholds instead of hardcoded values', () => {
    const settings: TenantSettings = {
      ...DEFAULT_TENANT_SETTINGS,
      revenueMissThreshold: 0.95, // stricter
      laborPressureDelta: 1,      // stricter
    };
    // Revenue = 940, which is < 1000 * 0.95 = 950 (miss)
    // LaborPct = 940 > 0 ? (210/940)*100 = 22.3% > 20 + 1 = 21 (pressure)
    const result = overstaffAssessment(
      expected,
      940,
      210,
      neutralSignal,
      settings,
    );
    expect(result.overstaffed).toBe(true);
  });
});
