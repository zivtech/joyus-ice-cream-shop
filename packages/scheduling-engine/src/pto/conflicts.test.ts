import { describe, it, expect } from 'vitest';
import {
  ptoLocationMatches,
  ptoDateOverlap,
  ptoRowsForRange,
  ptoRowsForDay,
  assignedPeopleForDay,
  ptoSummaryForDay,
} from './conflicts.js';
import type { PTORequest } from '../types/index.js';

describe('ptoLocationMatches', () => {
  it('matches same location', () => {
    expect(ptoLocationMatches('EP', 'EP')).toBe(true);
    expect(ptoLocationMatches('NL', 'NL')).toBe(true);
  });

  it('does not match different locations', () => {
    expect(ptoLocationMatches('EP', 'NL')).toBe(false);
  });

  it('BOTH scope matches any', () => {
    expect(ptoLocationMatches('EP', 'BOTH')).toBe(true);
    expect(ptoLocationMatches('NL', 'BOTH')).toBe(true);
  });

  it('BOTH request location matches any scope', () => {
    expect(ptoLocationMatches('BOTH', 'EP')).toBe(true);
    expect(ptoLocationMatches('BOTH', 'NL')).toBe(true);
  });

  it('unknown location treated as BOTH', () => {
    expect(ptoLocationMatches('UNKNOWN', 'BOTH')).toBe(true);
  });
});

describe('ptoDateOverlap', () => {
  it('detects overlap', () => {
    expect(ptoDateOverlap(
      { startDate: '2025-01-05', endDate: '2025-01-10' },
      '2025-01-08', '2025-01-12',
    )).toBe(true);
  });

  it('detects exact match', () => {
    expect(ptoDateOverlap(
      { startDate: '2025-01-05', endDate: '2025-01-05' },
      '2025-01-05', '2025-01-05',
    )).toBe(true);
  });

  it('detects no overlap', () => {
    expect(ptoDateOverlap(
      { startDate: '2025-01-05', endDate: '2025-01-10' },
      '2025-01-11', '2025-01-15',
    )).toBe(false);
  });

  it('returns false for missing dates', () => {
    expect(ptoDateOverlap(
      { startDate: '', endDate: '' },
      '2025-01-05', '2025-01-10',
    )).toBe(false);
  });
});

describe('ptoSummaryForDay', () => {
  const requests: PTORequest[] = [
    { id: 'p1', employee: 'Alice Smith', startDate: '2025-01-06', endDate: '2025-01-06', location: 'EP', status: 'approved' },
    { id: 'p2', employee: 'Bob Jones', startDate: '2025-01-06', endDate: '2025-01-07', location: 'EP', status: 'pending' },
    { id: 'p3', employee: 'Carol Lee', startDate: '2025-01-08', endDate: '2025-01-08', location: 'EP', status: 'approved' },
  ];

  it('summarizes PTO for a day', () => {
    const day = {
      date: '2025-01-06',
      slots: [
        { id: 's1', start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1, assignments: ['Alice Smith'] },
      ],
    };
    const summary = ptoSummaryForDay(requests, 'EP', day);
    expect(summary.total).toBe(2);
    expect(summary.approvedCount).toBe(1);
    expect(summary.pendingCount).toBe(1);
    expect(summary.conflicts).toHaveLength(1); // Only Alice is both assigned and on PTO
  });

  it('detects no conflicts when no staff assigned', () => {
    const day = {
      date: '2025-01-06',
      slots: [
        { id: 's1', start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1, assignments: [''] },
      ],
    };
    const summary = ptoSummaryForDay(requests, 'EP', day);
    expect(summary.conflicts).toHaveLength(0);
  });

  it('returns empty for day with no PTO', () => {
    const day = {
      date: '2025-01-10',
      slots: [],
    };
    const summary = ptoSummaryForDay(requests, 'EP', day);
    expect(summary.total).toBe(0);
  });
});

describe('assignedPeopleForDay', () => {
  it('collects unique normalized names', () => {
    const day = {
      slots: [
        { id: 's1', start: '11:00', end: '19:00', role: 'Opener', headcount: 2, assignments: ['Alice Smith', 'Bob Jones'] },
        { id: 's2', start: '15:00', end: '23:00', role: 'Closer', headcount: 1, assignments: ['Alice Smith'] },
      ],
    };
    const assigned = assignedPeopleForDay(day);
    expect(assigned.size).toBe(2);
    expect(assigned.has('alice smith')).toBe(true);
    expect(assigned.has('bob jones')).toBe(true);
  });

  it('ignores empty assignments', () => {
    const day = {
      slots: [
        { id: 's1', start: '11:00', end: '19:00', role: 'Opener', headcount: 2, assignments: ['', ''] },
      ],
    };
    expect(assignedPeopleForDay(day).size).toBe(0);
  });
});
