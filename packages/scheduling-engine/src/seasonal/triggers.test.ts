import { describe, it, expect } from 'vitest';
import {
  seasonFromMonth,
  seasonForDate,
  triggerTimingForLocation,
  closestTriggerGap,
} from './triggers.js';
import { conditionMet } from '../financial/benchmarks.js';
import type { LocationTriggerRules, PlaybookMetrics } from '../types/index.js';

describe('seasonFromMonth', () => {
  it('returns winter for Dec, Jan, Feb', () => {
    expect(seasonFromMonth('2025-12')).toBe('winter');
    expect(seasonFromMonth('2025-01')).toBe('winter');
    expect(seasonFromMonth('2025-02')).toBe('winter');
  });

  it('returns spring for Mar-May', () => {
    expect(seasonFromMonth('2025-03')).toBe('spring');
    expect(seasonFromMonth('2025-05')).toBe('spring');
  });

  it('returns summer for Jun-Aug', () => {
    expect(seasonFromMonth('2025-06')).toBe('summer');
    expect(seasonFromMonth('2025-08')).toBe('summer');
  });

  it('returns fall for Sep-Nov', () => {
    expect(seasonFromMonth('2025-09')).toBe('fall');
    expect(seasonFromMonth('2025-11')).toBe('fall');
  });
});

describe('seasonForDate', () => {
  it('returns correct season from Date object', () => {
    expect(seasonForDate(new Date(2025, 0, 15))).toBe('winter');  // Jan
    expect(seasonForDate(new Date(2025, 3, 15))).toBe('spring');  // Apr
    expect(seasonForDate(new Date(2025, 6, 15))).toBe('summer');  // Jul
    expect(seasonForDate(new Date(2025, 9, 15))).toBe('fall');    // Oct
    expect(seasonForDate(new Date(2025, 11, 15))).toBe('winter'); // Dec
  });
});

describe('conditionMet (re-exported integration)', () => {
  it('works with >= operator', () => {
    expect(conditionMet(500, '>=', 400)).toBe(true);
    expect(conditionMet(300, '>=', 400)).toBe(false);
  });

  it('works with <= operator', () => {
    expect(conditionMet(30, '<=', 40)).toBe(true);
    expect(conditionMet(50, '<=', 40)).toBe(false);
  });
});

describe('triggerTimingForLocation', () => {
  const rules: LocationTriggerRules = {
    up_spring: {
      label: 'Spring Ramp',
      detail: 'Spring scale-up',
      conditions: [
        { metric: 'avgDailyRevenue', operator: '>=', threshold: 500 },
      ],
    },
    up_summer: {
      label: 'Summer Peak',
      detail: 'Summer scale-up',
      conditions: [
        { metric: 'avgDailyRevenue', operator: '>=', threshold: 800 },
      ],
    },
    down_fall: {
      label: 'Fall De-ramp',
      detail: 'Fall scale-down',
      conditions: [
        { metric: 'avgDailyRevenue', operator: '<=', threshold: 600 },
      ],
    },
    down_winter: {
      label: 'Winter Lean',
      detail: 'Winter scale-down',
      conditions: [
        { metric: 'avgDailyRevenue', operator: '<=', threshold: 400 },
      ],
    },
  };

  const monthLabels: Record<string, string> = {
    '2025-01': 'Jan 2025',
    '2025-02': 'Feb 2025',
    '2025-06': 'Jun 2025',
  };

  it('evaluates trigger timing across months', () => {
    const getMetrics = (monthKey: string): PlaybookMetrics => {
      if (monthKey === '2025-01') return { avgDailyRevenue: 350, weekendShare: 40, peakShare: 30 };
      if (monthKey === '2025-02') return { avgDailyRevenue: 550, weekendShare: 45, peakShare: 35 };
      return { avgDailyRevenue: 900, weekendShare: 50, peakShare: 40 };
    };

    const result = triggerTimingForLocation(
      rules,
      ['2025-01', '2025-02', '2025-06'],
      getMetrics,
      '2025-06',
      monthLabels,
    );

    expect(result).toHaveLength(4);

    // up_spring: 500+ met by Feb (550) and Jun (900) => 2/3
    const spring = result.find((r) => r.ruleKey === 'up_spring')!;
    expect(spring.firstHit).toBe('Feb 2025');
    expect(spring.hitRate).toBeCloseTo(66.67, 1);
    expect(spring.currentMet).toBe(true);

    // down_winter: <=400 met by Jan (350) => 1/3
    const winter = result.find((r) => r.ruleKey === 'down_winter')!;
    expect(winter.firstHit).toBe('Jan 2025');
    expect(winter.hitRate).toBeCloseTo(33.33, 1);
    expect(winter.currentMet).toBe(false);
  });

  it('handles empty months', () => {
    const result = triggerTimingForLocation(
      rules,
      [],
      () => ({ avgDailyRevenue: 0, weekendShare: 0, peakShare: 0 }),
      null,
      {},
    );
    expect(result).toHaveLength(4);
    result.forEach((r) => {
      expect(r.hitRate).toBe(0);
      expect(r.currentMet).toBe(false);
    });
  });
});

describe('closestTriggerGap', () => {
  const rules: LocationTriggerRules = {
    up_spring: {
      label: 'Spring Ramp',
      detail: 'Spring scale-up',
      conditions: [
        { metric: 'avgDailyRevenue', operator: '>=', threshold: 500 },
        { metric: 'weekendShare', operator: '>=', threshold: 45 },
      ],
    },
    up_summer: {
      label: 'Summer Peak',
      detail: 'Summer scale-up',
      conditions: [
        { metric: 'avgDailyRevenue', operator: '>=', threshold: 800 },
      ],
    },
    down_fall: {
      label: 'Fall De-ramp',
      detail: 'Fall scale-down',
      conditions: [
        { metric: 'avgDailyRevenue', operator: '<=', threshold: 600 },
      ],
    },
    down_winter: {
      label: 'Winter Lean',
      detail: 'Winter scale-down',
      conditions: [
        { metric: 'avgDailyRevenue', operator: '<=', threshold: 400 },
      ],
    },
  };

  it('identifies unmet conditions with gap details', () => {
    const metrics: PlaybookMetrics = {
      avgDailyRevenue: 450,
      weekendShare: 40,
      peakShare: 30,
    };
    const result = closestTriggerGap(rules, metrics);
    expect(result.length).toBe(4);

    // up_spring: revenue needs 50 more, weekend needs 5 more
    const spring = result.find((r) => r.ruleKey === 'up_spring')!;
    expect(spring.unmet.length).toBe(2);
    expect(spring.unmet[0]!.delta).toBe(50); // 500 - 450
    expect(spring.unmet[1]!.delta).toBe(5);  // 45 - 40
  });
});
