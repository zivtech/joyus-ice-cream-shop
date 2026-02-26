import { describe, it, expect } from 'vitest';
import {
  grossProfit,
  laborPercent,
  revenueWithMode,
  tuesdayBaselineForMonth,
  sharedManagerWeeklyImpact,
  weeklyMetricsForLocationAtMonth,
  rollingAverage,
} from './metrics.js';
import type { WeekdayProfile, TenantSettings } from '../types/index.js';
import { DEFAULT_TENANT_SETTINGS } from '../types/index.js';

describe('grossProfit', () => {
  it('computes revenue * factor - labor', () => {
    expect(grossProfit(1000, 200, 0.72)).toBeCloseTo(520);
  });

  it('returns negative when labor exceeds margin', () => {
    expect(grossProfit(100, 500, 0.72)).toBeCloseTo(-428);
  });

  it('uses the factor param instead of hardcoded 0.72', () => {
    expect(grossProfit(1000, 200, 0.5)).toBeCloseTo(300);
  });
});

describe('laborPercent', () => {
  it('computes labor / revenue * 100', () => {
    expect(laborPercent(200, 1000)).toBeCloseTo(20);
  });

  it('returns 0 when revenue is 0', () => {
    expect(laborPercent(200, 0)).toBe(0);
  });

  it('handles zero labor', () => {
    expect(laborPercent(0, 1000)).toBe(0);
  });
});

describe('revenueWithMode', () => {
  it('includes full revenue by default', () => {
    expect(revenueWithMode(1000, 200, 'include')).toBe(1000);
  });

  it('excludes doordash component', () => {
    expect(revenueWithMode(1000, 200, 'exclude')).toBe(800);
  });

  it('returns only doordash component', () => {
    expect(revenueWithMode(1000, 200, 'doordash_only')).toBe(200);
  });

  it('handles zero doordash', () => {
    expect(revenueWithMode(1000, 0, 'exclude')).toBe(1000);
  });
});

describe('tuesdayBaselineForMonth', () => {
  it('returns Tuesday avg_revenue adjusted by mode', () => {
    const profile: WeekdayProfile = {
      Tue: { avg_revenue: 500, avg_labor: 100, avg_doordash_net: 50 },
    };
    expect(tuesdayBaselineForMonth(profile, 'include')).toBe(500);
    expect(tuesdayBaselineForMonth(profile, 'exclude')).toBe(450);
  });

  it('returns 0 when Tuesday is missing', () => {
    expect(tuesdayBaselineForMonth({}, 'include')).toBe(0);
  });
});

describe('sharedManagerWeeklyImpact', () => {
  it('returns zeros when not active', () => {
    const result = sharedManagerWeeklyImpact(false, 28, 40, 0.25, 15);
    expect(result.totalLabor).toBe(0);
    expect(result.perStoreLabor).toBe(0);
  });

  it('computes correct impact when active', () => {
    const result = sharedManagerWeeklyImpact(true, 28, 40, 0.25, 15);
    // mgmtHours = 40 * 0.25 = 10
    // floorHours = 40 - 10 = 30
    // grossCost = 40 * 28 = 1120
    // replacementCredit = 30 * 15 = 450
    // totalLabor = 1120 - 450 = 670
    expect(result.totalLabor).toBeCloseTo(670);
    expect(result.perStoreLabor).toBeCloseTo(335);
    expect(result.totalMgmtHours).toBeCloseTo(10);
    expect(result.totalFloorHours).toBeCloseTo(30);
    expect(result.replacementCredit).toBeCloseTo(450);
  });
});

describe('weeklyMetricsForLocationAtMonth', () => {
  const weekdayProfile: WeekdayProfile = {
    Tue: { avg_revenue: 500, avg_labor: 80, avg_doordash_net: 50 },
    Wed: { avg_revenue: 450, avg_labor: 75, avg_doordash_net: 40 },
    Thu: { avg_revenue: 480, avg_labor: 78, avg_doordash_net: 45 },
    Fri: { avg_revenue: 600, avg_labor: 90, avg_doordash_net: 60 },
    Sat: { avg_revenue: 700, avg_labor: 100, avg_doordash_net: 70 },
    Sun: { avg_revenue: 650, avg_labor: 95, avg_doordash_net: 65 },
  };

  it('computes 6-day metrics correctly', () => {
    const result = weeklyMetricsForLocationAtMonth(
      weekdayProfile,
      0,
      'current_6_day',
      'base',
      DEFAULT_TENANT_SETTINGS,
      false,
      0,
      'include',
    );

    const expectedRevenue = 500 + 450 + 480 + 600 + 700 + 650;
    const expectedLabor = 80 + 75 + 78 + 90 + 100 + 95;

    expect(result.revenue).toBeCloseTo(expectedRevenue);
    expect(result.labor).toBeCloseTo(expectedLabor);
    expect(result.gp).toBeCloseTo(expectedRevenue * 0.72 - expectedLabor);
    expect(result.laborPct).toBeCloseTo((expectedLabor / expectedRevenue) * 100);
    expect(result.mondayRevenue).toBe(0);
    expect(result.mondayLabor).toBe(0);
  });

  it('includes Monday when plan is open_7_day', () => {
    const result = weeklyMetricsForLocationAtMonth(
      weekdayProfile,
      60,
      'open_7_day',
      'base',
      DEFAULT_TENANT_SETTINGS,
      false,
      0,
      'include',
    );

    expect(result.mondayRevenue).toBeGreaterThan(0);
    expect(result.mondayLabor).toBe(60);
    expect(result.revenue).toBeGreaterThan(0);
  });

  it('uses gpMarginFactor from settings', () => {
    const settings: TenantSettings = {
      ...DEFAULT_TENANT_SETTINGS,
      gpMarginFactor: 0.5,
    };
    const result = weeklyMetricsForLocationAtMonth(
      weekdayProfile,
      0,
      'current_6_day',
      'base',
      settings,
      false,
      0,
      'include',
    );
    expect(result.gp).toBeCloseTo(result.revenue * 0.5 - result.labor);
  });
});

describe('rollingAverage', () => {
  it('computes rolling average with window', () => {
    const result = rollingAverage([10, 20, 30, 40, 50], 3);
    expect(result).toHaveLength(5);
    expect(result[0]).toBeCloseTo(10);
    expect(result[1]).toBeCloseTo(15);
    expect(result[2]).toBeCloseTo(20);
    expect(result[3]).toBeCloseTo(30);
    expect(result[4]).toBeCloseTo(40);
  });

  it('returns empty array for empty input', () => {
    expect(rollingAverage([], 3)).toEqual([]);
  });
});
