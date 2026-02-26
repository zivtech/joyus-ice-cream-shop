import type {
  WeatherSignal,
  ScheduleDay,
  StaffingRecommendation,
  Slot,
} from '../types/index.js';

import { isAdjustableRole, isEveningSlot, makeSlot } from '../scheduling/slots.js';
import { staffingWeatherAction } from './impact.js';

/**
 * Generate a staffing recommendation based on weather signal.
 * From staffing-planner.js:986-1022. Returns recommendation without mutating.
 */
export function dayRecommendation(
  signal: WeatherSignal,
  day: ScheduleDay,
): StaffingRecommendation {
  if (signal.impact === 'neutral') {
    return {
      action: null,
      signal,
      message: staffingWeatherAction(signal),
      canApply: false,
      buttonLabel: '',
      key: '',
    };
  }

  const adjustableSlots = (day.slots || []).filter((slot) => isAdjustableRole(slot.role));
  const action: StaffingRecommendation['action'] =
    signal.impact === 'up' ? 'increase_support' : 'decrease_support';
  const key = `${day.date}:${action}`;
  const alreadyApplied = day.lastAcceptedRecommendationKey === key;
  const canApply = action === 'increase_support' ? true : adjustableSlots.length > 0;

  const buttonLabel =
    action === 'increase_support'
      ? 'Accept Recommendation (+1 Support)'
      : 'Accept Recommendation (-1 Support)';

  return {
    action,
    signal,
    message: staffingWeatherAction(signal),
    canApply: canApply && !alreadyApplied,
    buttonLabel: alreadyApplied ? 'Recommendation Applied' : buttonLabel,
    key,
    alreadyApplied,
  };
}

/**
 * Apply a staffing recommendation to a day, returning a NEW day object (immutable).
 * From staffing-planner.js:1024-1066.
 * Does NOT mutate the input -- returns a new ScheduleDay.
 */
export function applyRecommendationToDay(
  day: ScheduleDay,
  rec: StaffingRecommendation,
): ScheduleDay {
  if (!rec || !rec.action) return { ...day, slots: day.slots.map(cloneSlot) };

  // Deep clone the day
  const newDay: ScheduleDay = {
    ...day,
    slots: day.slots.map(cloneSlot),
  };

  if (rec.action === 'increase_support') {
    const preferred = newDay.slots.find((slot) => /peak/i.test(String(slot.role || '')));
    const fallback = newDay.slots.find((slot) => isAdjustableRole(slot.role));
    const target = preferred || fallback;

    if (target) {
      const count = Math.max(1, Number(target.headcount) || 1);
      target.headcount = Math.min(count + 1, 6);
      target.assignments = Array.from(
        { length: target.headcount },
        (_, idx) => (target.assignments || [])[idx] || '',
      );
    } else {
      newDay.slots = [...newDay.slots, makeSlot('17:00', '22:00', 'Weather Support', 1)];
    }
    newDay.lastAcceptedRecommendationKey = rec.key;
    return newDay;
  }

  if (rec.action === 'decrease_support') {
    const adjustable = newDay.slots.filter((slot) => isAdjustableRole(slot.role));
    if (!adjustable.length) return newDay;

    const eveningPreferred =
      rec.signal?.window === 'evening'
        ? adjustable.filter((slot) => isEveningSlot(slot))
        : adjustable;
    const candidatePool = eveningPreferred.length ? eveningPreferred : adjustable;
    const target =
      candidatePool.find((slot) => /peak|support/i.test(String(slot.role || ''))) ||
      candidatePool[candidatePool.length - 1];

    if (!target) return newDay;

    const count = Number(target.headcount) || 1;
    if (count > 1) {
      target.headcount = count - 1;
      target.assignments = Array.from(
        { length: target.headcount },
        (_, idx) => (target.assignments || [])[idx] || '',
      );
    } else {
      newDay.slots = newDay.slots.filter((slot) => slot.id !== target.id);
    }
    newDay.lastAcceptedRecommendationKey = rec.key;
    return newDay;
  }

  return newDay;
}

/**
 * Deep clone a slot.
 */
function cloneSlot(slot: Slot): Slot {
  return {
    ...slot,
    assignments: [...(slot.assignments || [])],
  };
}
