import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RoleGate } from '@/components/RoleGate';
import { StatusBadge } from '@/components/StatusBadge';
import client from '@/api/client';
import type { Schedule } from '@/types';

interface ScheduleActionsProps {
  schedule: Schedule;
  onAction: () => void;
}

export function ScheduleActions({ schedule, onAction }: ScheduleActionsProps) {
  const { user } = useAuth();
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');

  async function handleAction(action: string) {
    setActing(true);
    setError('');
    try {
      await client.post(`/schedules/${schedule.id}/${action}`);
      onAction();
    } catch {
      setError(`Failed to ${action} schedule.`);
    } finally {
      setActing(false);
    }
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <StatusBadge status={schedule.status} />

      {error && <span className="text-sm text-red-600">{error}</span>}

      {schedule.status === 'draft' && (
        <RoleGate roles={['admin', 'gm', 'store_manager']}>
          <button
            type="button"
            disabled={acting}
            onClick={() => void handleAction('submit')}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {acting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </RoleGate>
      )}

      {schedule.status === 'pending' && (
        <RoleGate roles={['admin', 'gm']}>
          <button
            type="button"
            disabled={acting}
            onClick={() => void handleAction('approve')}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={acting}
            onClick={() => void handleAction('reject')}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reject
          </button>
        </RoleGate>
      )}

      {schedule.status === 'approved' && (
        <RoleGate roles={['admin', 'gm']}>
          <button
            type="button"
            disabled={acting}
            onClick={() => void handleAction('publish')}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Publish to POS
          </button>
        </RoleGate>
      )}
    </div>
  );
}
