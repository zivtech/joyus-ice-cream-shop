import { describe, it, expect } from 'vitest';
import {
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
} from './slots.js';
import type { PayRates, SeasonHours } from '../types/index.js';

describe('parseTimeToHours', () => {
  it('parses HH:MM to decimal hours', () => {
    expect(parseTimeToHours('12:00')).toBe(12);
    expect(parseTimeToHours('12:30')).toBe(12.5);
    expect(parseTimeToHours('09:15')).toBe(9.25);
  });

  it('returns 0 for invalid input', () => {
    expect(parseTimeToHours('')).toBe(0);
    expect(parseTimeToHours('abc')).toBe(0);
  });
});

describe('slotHours', () => {
  it('computes hours between start and end', () => {
    expect(slotHours({ start: '12:00', end: '20:00' })).toBe(8);
    expect(slotHours({ start: '17:00', end: '23:00' })).toBe(6);
  });

  it('returns 0 when end is before start', () => {
    expect(slotHours({ start: '20:00', end: '12:00' })).toBe(0);
  });
});

describe('hourToTime', () => {
  it('converts decimal hour to HH:00', () => {
    expect(hourToTime(12)).toBe('12:00');
    expect(hourToTime(9)).toBe('09:00');
    expect(hourToTime(0)).toBe('00:00');
  });

  it('clamps to valid range', () => {
    expect(hourToTime(25)).toBe('23:00');
    expect(hourToTime(-1)).toBe('00:00');
  });
});

describe('makeSlot', () => {
  it('creates a slot with correct structure', () => {
    const slot = makeSlot('12:00', '20:00', 'Opener Lead', 2);
    expect(slot.start).toBe('12:00');
    expect(slot.end).toBe('20:00');
    expect(slot.role).toBe('Opener Lead');
    expect(slot.headcount).toBe(2);
    expect(slot.assignments).toHaveLength(2);
    expect(slot.assignments[0]).toBe('');
    expect(slot.id).toMatch(/^slot_/);
  });

  it('enforces minimum headcount of 1', () => {
    const slot = makeSlot('12:00', '20:00', 'Test', 0);
    expect(slot.headcount).toBe(1);
    expect(slot.assignments).toHaveLength(1);
  });
});

describe('isOpenerRole', () => {
  it('detects opener roles', () => {
    expect(isOpenerRole('Opener Lead')).toBe(true);
    expect(isOpenerRole('opening shift')).toBe(true);
  });

  it('rejects non-opener roles', () => {
    expect(isOpenerRole('Closer Lead')).toBe(false);
    expect(isOpenerRole('Support Scooper')).toBe(false);
  });
});

describe('isCloserRole', () => {
  it('detects closer roles', () => {
    expect(isCloserRole('Closer Lead')).toBe(true);
    expect(isCloserRole('Closer Scooper')).toBe(true);
    expect(isCloserRole('close shift')).toBe(true);
  });

  it('rejects non-closer roles', () => {
    expect(isCloserRole('Opener Lead')).toBe(false);
    expect(isCloserRole('Support Scooper')).toBe(false);
  });
});

describe('isAdjustableRole', () => {
  it('returns true for non-opener non-closer roles', () => {
    expect(isAdjustableRole('Support Scooper')).toBe(true);
    expect(isAdjustableRole('Peak Support')).toBe(true);
  });

  it('returns false for openers and closers', () => {
    expect(isAdjustableRole('Opener Lead')).toBe(false);
    expect(isAdjustableRole('Closer Scooper')).toBe(false);
  });
});

describe('isEveningSlot', () => {
  it('detects evening slots by end time', () => {
    expect(isEveningSlot({ start: '15:00', end: '22:00' })).toBe(true);
  });

  it('detects evening slots by start time', () => {
    expect(isEveningSlot({ start: '17:00', end: '19:00' })).toBe(true);
  });

  it('rejects morning slots', () => {
    expect(isEveningSlot({ start: '11:00', end: '16:00' })).toBe(false);
  });
});

describe('roleRateForSlot', () => {
  const payRates: PayRates = { manager: 28, keyLead: 17, scooper: 15 };

  it('returns manager rate for manager role', () => {
    expect(roleRateForSlot('Shift Manager', payRates)).toBe(28);
  });

  it('returns key lead rate for lead role', () => {
    expect(roleRateForSlot('Opener Lead', payRates)).toBe(17);
  });

  it('returns scooper rate as default', () => {
    expect(roleRateForSlot('Support Scooper', payRates)).toBe(15);
  });
});

describe('estimatedLaborForDay', () => {
  const payRates: PayRates = { manager: 28, keyLead: 17, scooper: 15 };

  it('sums labor cost across slots', () => {
    const day = {
      slots: [
        { id: 's1', start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1, assignments: [''] },
        { id: 's2', start: '15:00', end: '23:00', role: 'Closer Scooper', headcount: 2, assignments: ['', ''] },
      ],
    };
    // Opener Lead: 8hrs * 1 * 17 = 136
    // Closer Scooper: 8hrs * 2 * 15 = 240
    expect(estimatedLaborForDay(day, payRates)).toBeCloseTo(376);
  });
});

describe('seasonHoursFor', () => {
  const seasonHours: SeasonHours = {
    winterOpen: '12:00', winterClose: '22:00',
    springOpen: '12:00', springClose: '22:00',
    summerOpen: '12:00', summerClose: '23:00',
    fallOpen: '12:00', fallClose: '22:00',
  };

  it('returns correct hours for summer', () => {
    const result = seasonHoursFor('summer', seasonHours);
    expect(result.openHour).toBe(12);
    expect(result.closeHour).toBe(23);
  });

  it('returns correct hours for winter', () => {
    const result = seasonHoursFor('winter', seasonHours);
    expect(result.openHour).toBe(12);
    expect(result.closeHour).toBe(22);
  });
});
