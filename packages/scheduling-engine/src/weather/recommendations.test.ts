import { describe, it, expect } from 'vitest';
import { dayRecommendation, applyRecommendationToDay } from './recommendations.js';
import { makeSlot } from '../scheduling/slots.js';
import type { WeatherSignal, ScheduleDay } from '../types/index.js';

function makeDay(overrides: Partial<ScheduleDay> = {}): ScheduleDay {
  return {
    date: '2026-03-15',
    weekday: 'Sun',
    season: 'spring',
    slots: [
      makeSlot('11:00', '19:00', 'Opener Lead', 1),
      makeSlot('15:00', '23:00', 'Closer Lead', 1),
      makeSlot('16:00', '23:00', 'Peak Scooper', 2),
    ],
    ...overrides,
  };
}

const neutralSignal: WeatherSignal = {
  impact: 'neutral',
  label: 'Near Expected',
  reason: 'Within range.',
  delta: 3,
  expected: 65,
  actual: 68,
  window: null,
  eventHour: null,
};

const upSignal: WeatherSignal = {
  impact: 'up',
  label: 'Demand Lift',
  reason: 'High is +12F vs expected 65F.',
  delta: 12,
  expected: 65,
  actual: 77,
  window: null,
  eventHour: null,
};

const downSignal: WeatherSignal = {
  impact: 'down',
  label: 'Demand Risk',
  reason: 'High is -14F vs expected 65F.',
  delta: -14,
  expected: 65,
  actual: 51,
  window: null,
  eventHour: null,
};

const eveningDownSignal: WeatherSignal = {
  impact: 'down',
  label: 'Evening Rain Risk',
  reason: 'Heavy precipitation likely after 8pm.',
  delta: null,
  expected: null,
  actual: 68,
  window: 'evening',
  eventHour: 20,
};

describe('dayRecommendation', () => {
  it('returns no action for neutral weather', () => {
    const rec = dayRecommendation(neutralSignal, makeDay());
    expect(rec.action).toBeNull();
    expect(rec.canApply).toBe(false);
  });

  it('recommends increase for up signal', () => {
    const rec = dayRecommendation(upSignal, makeDay());
    expect(rec.action).toBe('increase_support');
    expect(rec.canApply).toBe(true);
    expect(rec.key).toBe('2026-03-15:increase_support');
  });

  it('recommends decrease for down signal', () => {
    const rec = dayRecommendation(downSignal, makeDay());
    expect(rec.action).toBe('decrease_support');
    expect(rec.canApply).toBe(true);
  });

  it('marks already applied when key matches', () => {
    const day = makeDay({ lastAcceptedRecommendationKey: '2026-03-15:increase_support' });
    const rec = dayRecommendation(upSignal, day);
    expect(rec.action).toBe('increase_support');
    expect(rec.canApply).toBe(false);
    expect(rec.alreadyApplied).toBe(true);
    expect(rec.buttonLabel).toBe('Recommendation Applied');
  });
});

describe('applyRecommendationToDay', () => {
  it('does not mutate the original day (immutability)', () => {
    const day = makeDay();
    const originalSlotCount = day.slots.length;
    const originalHeadcount = day.slots[2]!.headcount;
    const originalAssignments = [...day.slots[2]!.assignments];

    const rec = dayRecommendation(upSignal, day);
    const newDay = applyRecommendationToDay(day, rec);

    // Original day is unchanged
    expect(day.slots.length).toBe(originalSlotCount);
    expect(day.slots[2]!.headcount).toBe(originalHeadcount);
    expect(day.slots[2]!.assignments).toEqual(originalAssignments);
    expect(day.lastAcceptedRecommendationKey).toBeUndefined();

    // New day has the change
    expect(newDay).not.toBe(day);
    expect(newDay.lastAcceptedRecommendationKey).toBe(rec.key);
  });

  it('increases headcount on preferred peak slot for up signal', () => {
    const day = makeDay();
    const rec = dayRecommendation(upSignal, day);
    const newDay = applyRecommendationToDay(day, rec);

    // Peak Scooper slot (index 2) should have headcount increased
    const peakSlot = newDay.slots.find((s) => /peak/i.test(s.role));
    expect(peakSlot).toBeDefined();
    expect(peakSlot!.headcount).toBe(3); // was 2, now 3
    expect(peakSlot!.assignments.length).toBe(3);
  });

  it('adds Weather Support slot when no adjustable slots exist', () => {
    const day = makeDay({
      slots: [
        makeSlot('11:00', '19:00', 'Opener Lead', 1),
        makeSlot('15:00', '23:00', 'Closer Lead', 1),
      ],
    });
    const rec = dayRecommendation(upSignal, day);
    const newDay = applyRecommendationToDay(day, rec);

    expect(newDay.slots.length).toBe(3); // added Weather Support
    const addedSlot = newDay.slots[2];
    expect(addedSlot!.role).toBe('Weather Support');
  });

  it('decreases headcount for down signal', () => {
    const day = makeDay();
    const rec = dayRecommendation(downSignal, day);
    const newDay = applyRecommendationToDay(day, rec);

    const peakSlot = newDay.slots.find((s) => /peak/i.test(s.role));
    expect(peakSlot).toBeDefined();
    expect(peakSlot!.headcount).toBe(1); // was 2, now 1
  });

  it('removes slot entirely when headcount would reach 0 on decrease', () => {
    const day = makeDay({
      slots: [
        makeSlot('11:00', '19:00', 'Opener Lead', 1),
        makeSlot('15:00', '23:00', 'Closer Lead', 1),
        makeSlot('16:00', '23:00', 'Peak Scooper', 1), // headcount 1
      ],
    });
    const rec = dayRecommendation(downSignal, day);
    const newDay = applyRecommendationToDay(day, rec);

    // Peak Scooper slot should be removed (headcount was 1)
    expect(newDay.slots.length).toBe(2);
    expect(newDay.slots.find((s) => /peak/i.test(s.role))).toBeUndefined();
  });

  it('prefers evening slots for evening down signal', () => {
    const day = makeDay({
      slots: [
        makeSlot('11:00', '19:00', 'Opener Lead', 1),
        makeSlot('12:00', '17:00', 'Midday Support', 2), // not evening
        makeSlot('15:00', '23:00', 'Closer Lead', 1),
        makeSlot('17:00', '23:00', 'Evening Support', 2), // evening
      ],
    });
    const rec = dayRecommendation(eveningDownSignal, day);
    const newDay = applyRecommendationToDay(day, rec);

    // Evening Support should be decreased, Midday Support unchanged
    const eveningSlot = newDay.slots.find((s) => s.role === 'Evening Support');
    const middaySlot = newDay.slots.find((s) => s.role === 'Midday Support');
    expect(eveningSlot!.headcount).toBe(1); // was 2
    expect(middaySlot!.headcount).toBe(2); // unchanged
  });

  it('returns clone when rec has no action', () => {
    const day = makeDay();
    const rec = dayRecommendation(neutralSignal, day);
    const newDay = applyRecommendationToDay(day, rec);

    expect(newDay).not.toBe(day);
    expect(newDay.slots.length).toBe(day.slots.length);
    // Slots are cloned too
    expect(newDay.slots[0]).not.toBe(day.slots[0]);
  });
});
