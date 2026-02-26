import { describe, it, expect } from 'vitest';
import { dayValidation, weekLaborHours } from './validation.js';
import type { WorkflowSettings } from '../types/index.js';

describe('dayValidation', () => {
  const defaultWorkflow: WorkflowSettings = {
    minOpeners: 1,
    minClosers: 2,
    requirePolicyApproval: true,
    requireGMApproval: true,
  };

  it('passes with sufficient openers and closers', () => {
    const day = {
      slots: [
        { id: 's1', start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1, assignments: [''] },
        { id: 's2', start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1, assignments: [''] },
        { id: 's3', start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1, assignments: [''] },
      ],
    };
    const result = dayValidation(day, defaultWorkflow);
    expect(result.ok).toBe(true);
    expect(result.message).toBe('Coverage rules satisfied.');
  });

  it('fails when no opener', () => {
    const day = {
      slots: [
        { id: 's1', start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1, assignments: [''] },
        { id: 's2', start: '16:00', end: '23:00', role: 'Closer Scooper', headcount: 1, assignments: [''] },
      ],
    };
    const result = dayValidation(day, defaultWorkflow);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('opener');
  });

  it('fails when fewer than 2 closers', () => {
    const day = {
      slots: [
        { id: 's1', start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1, assignments: [''] },
        { id: 's2', start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 1, assignments: [''] },
      ],
    };
    const result = dayValidation(day, defaultWorkflow);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('closing');
  });

  // BUG-1 FIX: configurable min openers/closers
  it('uses workflow.minOpeners and workflow.minClosers (BUG-1 fix)', () => {
    const strictWorkflow: WorkflowSettings = {
      minOpeners: 2,
      minClosers: 3,
      requirePolicyApproval: true,
      requireGMApproval: true,
    };

    const day = {
      slots: [
        { id: 's1', start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1, assignments: [''] },
        { id: 's2', start: '15:00', end: '23:00', role: 'Closer Lead', headcount: 2, assignments: ['', ''] },
      ],
    };

    const result = dayValidation(day, strictWorkflow);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('2');
  });

  it('passes with relaxed workflow settings', () => {
    const relaxedWorkflow: WorkflowSettings = {
      minOpeners: 0,
      minClosers: 0,
      requirePolicyApproval: false,
      requireGMApproval: false,
    };
    const day = {
      slots: [
        { id: 's1', start: '15:00', end: '23:00', role: 'Support Scooper', headcount: 1, assignments: [''] },
      ],
    };
    expect(dayValidation(day, relaxedWorkflow).ok).toBe(true);
  });
});

describe('weekLaborHours', () => {
  it('computes total labor hours for a week', () => {
    const week = {
      days: [
        {
          date: '2025-01-06',
          weekday: 'Mon' as const,
          season: 'winter' as const,
          slots: [
            { id: 's1', start: '11:00', end: '19:00', role: 'Opener Lead', headcount: 1, assignments: [''] },
          ],
        },
        {
          date: '2025-01-07',
          weekday: 'Tue' as const,
          season: 'winter' as const,
          slots: [
            { id: 's2', start: '12:00', end: '20:00', role: 'Opener Lead', headcount: 2, assignments: ['', ''] },
          ],
        },
      ],
    };
    // Day 1: 8 hours * 1 = 8
    // Day 2: 8 hours * 2 = 16
    expect(weekLaborHours(week)).toBeCloseTo(24);
  });
});
