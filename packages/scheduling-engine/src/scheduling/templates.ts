import type {
  Slot,
  TemplateSlotDef,
  WeeklyTemplateProfile,
  Weekday,
} from '../types/index.js';

import { WEEKDAYS } from '../types/index.js';
import { makeSlot, parseTimeToHours } from './slots.js';

/**
 * Normalize a raw template slot definition.
 * From staffing-planner.js:390-401.
 */
export function normalizeTemplateSlot(raw: unknown): TemplateSlotDef | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const start = String(r.start || '').trim();
  const end = String(r.end || '').trim();
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)) return null;
  if (parseTimeToHours(end) <= parseTimeToHours(start)) return null;
  return {
    start,
    end,
    role: String(r.role || '').trim() || 'Support Scooper',
    headcount: Math.max(1, Math.min(6, Number(r.headcount) || 1)),
  };
}

/**
 * Canonicalize a weekday string to the Weekday type.
 */
function canonicalWeekday(raw: string): Weekday | '' {
  const key = String(raw || '').trim().slice(0, 3).toLowerCase();
  if (key === 'mon') return 'Mon';
  if (key === 'tue') return 'Tue';
  if (key === 'wed') return 'Wed';
  if (key === 'thu') return 'Thu';
  if (key === 'fri') return 'Fri';
  if (key === 'sat') return 'Sat';
  if (key === 'sun') return 'Sun';
  return '';
}

/**
 * Clone an array of template slot defs.
 */
function cloneTemplateDay(daySlots: TemplateSlotDef[]): TemplateSlotDef[] {
  return (Array.isArray(daySlots) ? daySlots : []).map((slot) => ({
    start: slot.start,
    end: slot.end,
    role: slot.role,
    headcount: Math.max(1, Number(slot.headcount) || 1),
  }));
}

/**
 * Normalize a raw template profile into a WeeklyTemplateProfile.
 * From staffing-planner.js:404-415.
 */
export function normalizeTemplateProfile(rawProfile: unknown): WeeklyTemplateProfile {
  const normalized = Object.fromEntries(
    WEEKDAYS.map((day) => [day, [] as TemplateSlotDef[]]),
  ) as WeeklyTemplateProfile;

  if (!rawProfile || typeof rawProfile !== 'object') return normalized;

  const profile = rawProfile as Record<string, unknown>;
  Object.entries(profile).forEach(([rawDay, rawSlots]) => {
    const day = canonicalWeekday(rawDay);
    if (!day || !Array.isArray(rawSlots)) return;
    normalized[day] = rawSlots
      .map((slot) => normalizeTemplateSlot(slot))
      .filter((s): s is TemplateSlotDef => s !== null);
  });

  return normalized;
}

/**
 * Merge multiple template profiles. Last-wins per weekday.
 * Monday mirrors Tuesday.
 * From staffing-planner.js:417-440.
 */
export function mergeTemplateProfiles(
  ...profiles: (WeeklyTemplateProfile | null)[]
): WeeklyTemplateProfile {
  const merged = Object.fromEntries(
    WEEKDAYS.map((day) => [day, [] as TemplateSlotDef[]]),
  ) as WeeklyTemplateProfile;

  profiles.forEach((profile) => {
    if (!profile || typeof profile !== 'object') return;
    WEEKDAYS.forEach((day) => {
      if (Array.isArray(profile[day]) && profile[day].length) {
        merged[day] = cloneTemplateDay(profile[day]);
      }
    });
  });

  // Monday mirrors Tuesday
  if (merged.Tue.length) {
    merged.Mon = cloneTemplateDay(merged.Tue);
  }

  // Fill empty days from Tuesday
  WEEKDAYS.forEach((day) => {
    if (!merged[day].length && merged.Tue.length) {
      merged[day] = cloneTemplateDay(merged.Tue);
    }
  });

  return merged;
}

/**
 * Build concrete Slot[] from a template profile for a given weekday.
 * Simplified from staffing-planner.js:1217-1225.
 */
export function buildTemplateSlots(
  weekday: Weekday,
  templateProfile: WeeklyTemplateProfile,
): Slot[] {
  const defs = templateProfile[weekday];
  if (defs && defs.length) {
    return defs.map((slot) => makeSlot(slot.start, slot.end, slot.role, slot.headcount));
  }

  // Fallback if template profile is empty for this day
  return [
    makeSlot('11:00', '19:00', 'Opener Lead', 1),
    makeSlot('15:00', '23:00', 'Closer Lead', 1),
    makeSlot('16:00', '23:00', 'Closer Scooper', 1),
  ];
}
