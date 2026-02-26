import type {
  PTORequest,
  PTOSummary,
  ScheduleDay,
} from '../types/index.js';

/**
 * Normalize a person name for comparison.
 */
function normalizedPersonName(raw: string): string {
  return String(raw || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Check if a PTO request location matches a scope location.
 * From staffing-planner.js:1260-1265.
 */
export function ptoLocationMatches(
  requestLocation: string,
  scopeLocation: string,
): boolean {
  const req = requestLocation === 'EP' || requestLocation === 'NL' ? requestLocation : 'BOTH';
  if (scopeLocation === 'BOTH') return req === 'EP' || req === 'NL' || req === 'BOTH';
  if (req === 'BOTH') return true;
  return req === scopeLocation;
}

/**
 * Check if a PTO request date range overlaps a given range.
 * From staffing-planner.js:1267-1270.
 */
export function ptoDateOverlap(
  request: Pick<PTORequest, 'startDate' | 'endDate'>,
  startDate: string,
  endDate: string,
): boolean {
  if (!request?.startDate || !request?.endDate) return false;
  return request.startDate <= endDate && request.endDate >= startDate;
}

/**
 * Filter PTO requests for a date range and location scope.
 * From staffing-planner.js:1272-1274.
 */
export function ptoRowsForRange(
  requests: PTORequest[],
  scopeLocation: string,
  startDate: string,
  endDate: string,
): PTORequest[] {
  return (requests || []).filter(
    (request) =>
      ptoLocationMatches(request.location, scopeLocation) &&
      ptoDateOverlap(request, startDate, endDate),
  );
}

/**
 * Filter PTO requests for a single day and location scope.
 * From staffing-planner.js:1276-1278.
 */
export function ptoRowsForDay(
  requests: PTORequest[],
  scopeLocation: string,
  dateIso: string,
): PTORequest[] {
  return ptoRowsForRange(requests, scopeLocation, dateIso, dateIso);
}

/**
 * Get the set of assigned people for a day.
 * From staffing-planner.js:1287-1296.
 */
export function assignedPeopleForDay(
  day: Pick<ScheduleDay, 'slots'>,
): Set<string> {
  const assigned = new Set<string>();
  (day.slots || []).forEach((slot) => {
    (slot.assignments || []).forEach((name) => {
      const normalized = normalizedPersonName(name);
      if (normalized) assigned.add(normalized);
    });
  });
  return assigned;
}

/**
 * PTO summary for a specific day, detecting conflicts with assigned staff.
 * From staffing-planner.js:1298-1312.
 */
export function ptoSummaryForDay(
  requests: PTORequest[],
  location: string,
  day: Pick<ScheduleDay, 'date' | 'slots'>,
): PTOSummary {
  const rows = ptoRowsForDay(requests, location, day.date);
  const approved = rows.filter((row) => row.status === 'approved');
  const pending = rows.filter((row) => row.status === 'pending');
  const actionable = rows.filter(
    (row) => row.status === 'approved' || row.status === 'pending',
  );
  const assigned = assignedPeopleForDay(day);
  const conflicts = actionable.filter((row) =>
    assigned.has(normalizedPersonName(row.employee)),
  );

  return {
    total: rows.length,
    approvedCount: approved.length,
    pendingCount: pending.length,
    conflicts,
  };
}
