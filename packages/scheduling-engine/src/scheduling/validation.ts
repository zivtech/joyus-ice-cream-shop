import type {
  ScheduleDay,
  ScheduleWeek,
  ValidationResult,
  WeekReadinessChecks,
  AssignmentGapRow,
  WorkflowSettings,
  PTORequest,
} from '../types/index.js';

import { slotHours, isOpenerRole, isCloserRole } from './slots.js';
import { ptoSummaryForDay } from '../pto/conflicts.js';

/**
 * Validate day coverage.
 * From staffing-planner.js:1227-1245.
 * BUG-1 FIX: Uses workflow.minOpeners and workflow.minClosers
 * instead of hardcoded 1 and 2.
 */
export function dayValidation(
  day: Pick<ScheduleDay, 'slots'>,
  workflow: WorkflowSettings,
): ValidationResult {
  const openerCount = day.slots
    .filter((slot) => isOpenerRole(slot.role))
    .reduce((acc, slot) => acc + (Number(slot.headcount) || 0), 0);

  const closerCount = day.slots
    .filter((slot) => isCloserRole(slot.role))
    .reduce((acc, slot) => acc + (Number(slot.headcount) || 0), 0);

  if (openerCount < workflow.minOpeners) {
    return {
      ok: false,
      message: `Need at least ${workflow.minOpeners} opener shift${workflow.minOpeners === 1 ? '' : 's'}.`,
    };
  }

  if (closerCount < workflow.minClosers) {
    return {
      ok: false,
      message: `Need at least ${workflow.minClosers} closing position${workflow.minClosers === 1 ? '' : 's'}.`,
    };
  }

  return { ok: true, message: 'Coverage rules satisfied.' };
}

/**
 * Total labor hours for a week.
 * From staffing-planner.js:1247-1252.
 */
export function weekLaborHours(week: Pick<ScheduleWeek, 'days'>): number {
  return week.days.reduce(
    (total, day) =>
      total +
      day.slots.reduce(
        (sum, slot) => sum + slotHours(slot) * (Number(slot.headcount) || 0),
        0,
      ),
    0,
  );
}

/**
 * Readiness checks for the next week.
 * From staffing-planner.js:2638-2678.
 */
export function nextWeekChecks(
  week: ScheduleWeek,
  location: string,
  ptoRequests: PTORequest[],
  workflow: WorkflowSettings,
): WeekReadinessChecks {
  if (!week) {
    return {
      pendingRequests: 0,
      unsubmittedExceptions: 0,
      unassignedPositions: 0,
      invalidCoverageDays: 0,
      ptoConflicts: 0,
    };
  }

  let pendingRequests = 0;
  let unsubmittedExceptions = 0;
  let unassignedPositions = 0;
  let invalidCoverageDays = 0;
  let ptoConflicts = 0;

  week.days.forEach((day) => {
    if (day.pendingRequestId) pendingRequests += 1;
    if (day.hasException) unsubmittedExceptions += 1;
    if (!dayValidation(day, workflow).ok) invalidCoverageDays += 1;

    const ptoSummary = ptoSummaryForDay(ptoRequests, location, day);
    ptoConflicts += ptoSummary.conflicts.length;

    day.slots.forEach((slot) => {
      const headcount = Math.max(1, Number(slot.headcount) || 1);
      for (let idx = 0; idx < headcount; idx += 1) {
        const assigned = ((slot.assignments || [])[idx] || '').trim();
        if (!assigned) unassignedPositions += 1;
      }
    });
  });

  return {
    pendingRequests,
    unsubmittedExceptions,
    unassignedPositions,
    invalidCoverageDays,
    ptoConflicts,
  };
}

/**
 * Assignment gap summary for the first N weeks.
 * From staffing-planner.js:2594-2628.
 */
export function assignmentGapSummary(
  weeks: ScheduleWeek[],
  weeksAhead: number = 4,
): AssignmentGapRow[] {
  const maxWeeks = Math.max(0, Number(weeksAhead) || 0);
  const rows: AssignmentGapRow[] = [];

  for (let weekIdx = 0; weekIdx < Math.min(maxWeeks, weeks.length); weekIdx += 1) {
    const week = weeks[weekIdx];
    if (!week) continue;

    let unassigned = 0;
    let daysWithGaps = 0;

    (week.days || []).forEach((day) => {
      let dayGap = false;
      (day.slots || []).forEach((slot) => {
        const headcount = Math.max(1, Number(slot.headcount) || 1);
        for (let idx = 0; idx < headcount; idx += 1) {
          if (!String((slot.assignments || [])[idx] || '').trim()) {
            unassigned += 1;
            dayGap = true;
          }
        }
      });
      if (dayGap) daysWithGaps += 1;
    });

    if (unassigned > 0) {
      rows.push({
        weekLabel: `Week of ${week.weekStart}`,
        unassigned,
        daysWithGaps,
      });
    }
  }

  return rows;
}
