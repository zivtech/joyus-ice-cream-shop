import { useState, useCallback } from 'react';
import { useSchedules, useSchedule } from '@/api/hooks';
import { LocationSelector } from '@/components/LocationSelector';
import { WeekSelector } from '@/components/WeekSelector';
import { ScheduleActions } from '@/components/ScheduleActions';
import { DayColumn } from '@/components/planner/DayColumn';
import { EmptySchedule } from '@/components/planner/EmptySchedule';
import { getMonday, toISODate } from '@/utils/format';
import client from '@/api/client';
import type { Schedule } from '@/types';

export function ShiftPlannerPage() {
  const [locationId, setLocationId] = useState<number | null>(null);
  const [weekStart, setWeekStart] = useState(() => toISODate(getMonday(new Date())));
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleLocationChange = useCallback((id: number) => {
    setLocationId(id);
  }, []);

  const { data: schedules, refresh: refreshList } = useSchedules(
    locationId ? { location_id: locationId, week_start: weekStart } : undefined,
  );

  const activeSchedule = schedules.length > 0 ? schedules[0] : null;
  const { data: schedule, loading, error, refresh: refreshSchedule } = useSchedule(activeSchedule?.id ?? null);

  function handleRefresh() {
    refreshList();
    refreshSchedule();
  }

  async function handleCreateSchedule() {
    if (!locationId) return;
    setCreating(true);
    setCreateError('');
    try {
      await client.post<Schedule>('/schedules', {
        location_id: locationId,
        week_start: weekStart,
      });
      handleRefresh();
    } catch {
      setCreateError('Failed to create schedule.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Shift Planner</h1>
        <p className="text-sm text-gray-500 mt-1">Build and manage weekly shift schedules.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <LocationSelector value={locationId} onChange={handleLocationChange} />
          <WeekSelector value={weekStart} onChange={setWeekStart} />
        </div>
        {schedule && <ScheduleActions schedule={schedule} onAction={handleRefresh} />}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {createError && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {createError}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">Loading schedule...</div>
      ) : schedule ? (
        <div className="grid grid-cols-7 gap-2">
          {schedule.days.map((day) => (
            <DayColumn key={day.id} day={day} schedule={schedule} onSlotChange={handleRefresh} />
          ))}
        </div>
      ) : (
        <EmptySchedule
          weekStart={weekStart}
          locationId={locationId}
          onCreateClick={() => {
            if (!creating) void handleCreateSchedule();
          }}
        />
      )}
    </div>
  );
}
