import type {
  Slot,
  ScheduleDay,
  PayRates,
  Season,
  SeasonHours,
} from '../types/index.js';

/**
 * Create a slot with unique id and empty assignments array.
 * From staffing-planner.js:756-766.
 */
export function makeSlot(
  start: string,
  end: string,
  role: string,
  headcount: number,
): Slot {
  const count = Math.max(1, Number(headcount) || 1);
  return {
    id: `slot_${Math.random().toString(36).slice(2, 10)}`,
    start,
    end,
    role,
    headcount: count,
    assignments: Array.from({ length: count }, () => ''),
  };
}

/**
 * Parse a time string "HH:MM" to decimal hours.
 * From staffing-planner.js:775-778.
 */
export function parseTimeToHours(raw: string): number {
  const parts = String(raw || '').split(':').map(Number);
  const h = parts[0];
  const m = parts[1];
  if (h === undefined || m === undefined || !Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h + m / 60;
}

/**
 * Compute the duration of a slot in hours.
 * From staffing-planner.js:781-784.
 */
export function slotHours(slot: Pick<Slot, 'start' | 'end'>): number {
  const start = parseTimeToHours(slot.start);
  const end = parseTimeToHours(slot.end);
  return Math.max(0, end - start);
}

/**
 * Convert a decimal hour to "HH:00" time string.
 * From staffing-planner.js:787-789.
 */
export function hourToTime(hour: number): string {
  const h = Math.max(0, Math.min(23, Number(hour) || 0));
  return `${String(h).padStart(2, '0')}:00`;
}

/**
 * Check if a role name indicates an opener.
 * From staffing-planner.js:973-974.
 */
export function isOpenerRole(role: string): boolean {
  return /open/i.test(String(role || ''));
}

/**
 * Check if a role name indicates a closer.
 * From staffing-planner.js:977-978.
 */
export function isCloserRole(role: string): boolean {
  return /closer|close/i.test(String(role || ''));
}

/**
 * Check if a role is adjustable (not opener or closer).
 * From staffing-planner.js:981-983.
 */
export function isAdjustableRole(role: string): boolean {
  const text = String(role || '').toLowerCase();
  return !isOpenerRole(text) && !isCloserRole(text);
}

/**
 * Check if a slot is an evening slot.
 * From staffing-planner.js:826-830.
 */
export function isEveningSlot(slot: Pick<Slot, 'start' | 'end'>): boolean {
  const start = parseTimeToHours(slot.start);
  const end = parseTimeToHours(slot.end);
  return end >= 20 || start >= 17;
}

/**
 * Get the pay rate for a slot based on role name.
 * From staffing-planner.js:1880-1885. Uses PayRates instead of reading from state.
 */
export function roleRateForSlot(role: string, payRates: PayRates): number {
  const name = String(role || '').toLowerCase();
  if (/manager/.test(name)) return payRates.manager;
  if (/lead/.test(name)) return payRates.keyLead;
  return payRates.scooper;
}

/**
 * Estimated labor cost for a day.
 * From staffing-planner.js:1888-1893.
 */
export function estimatedLaborForDay(
  day: Pick<ScheduleDay, 'slots'>,
  payRates: PayRates,
): number {
  return (day.slots || []).reduce((sum, slot) => {
    const rate = roleRateForSlot(slot.role, payRates);
    return sum + slotHours(slot) * Math.max(1, Number(slot.headcount) || 1) * rate;
  }, 0);
}

/**
 * Helper to parse a time string to its hour component.
 */
function timeToHour(raw: string, fallback: number): number {
  const h = String(raw || '').split(':').map(Number)[0];
  if (h === undefined || !Number.isFinite(h)) return fallback;
  return Math.max(0, Math.min(23, h));
}

/**
 * Get open/close hours for a given season from season hours settings.
 * From staffing-planner.js:798-824.
 */
export function seasonHoursFor(
  season: Season,
  seasonHours: SeasonHours,
): { openHour: number; closeHour: number } {
  const key = String(season || 'fall').toLowerCase();
  if (key === 'winter') {
    return {
      openHour: timeToHour(seasonHours.winterOpen, 12),
      closeHour: timeToHour(seasonHours.winterClose, 22),
    };
  }
  if (key === 'spring') {
    return {
      openHour: timeToHour(seasonHours.springOpen, 12),
      closeHour: timeToHour(seasonHours.springClose, 22),
    };
  }
  if (key === 'summer') {
    return {
      openHour: timeToHour(seasonHours.summerOpen, 12),
      closeHour: timeToHour(seasonHours.summerClose, 23),
    };
  }
  // fall
  return {
    openHour: timeToHour(seasonHours.fallOpen, 12),
    closeHour: timeToHour(seasonHours.fallClose, 22),
  };
}
