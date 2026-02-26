import { useState } from 'react';
import { formatWeekday, formatDate, formatTime } from '@/utils/format';
import { SlotEditor } from '@/components/planner/SlotEditor';
import type { Schedule, ScheduleDay, ScheduleSlot } from '@/types';

interface DayColumnProps {
  day: ScheduleDay;
  schedule: Schedule;
  onSlotChange: () => void;
}

export function DayColumn({ day, schedule, onSlotChange }: DayColumnProps) {
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [showNewSlot, setShowNewSlot] = useState(false);
  const isDraft = schedule.status === 'draft';

  return (
    <div className="bg-white rounded-lg shadow p-3 min-h-[300px] flex flex-col">
      <div className="text-center mb-3 pb-2 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-500 uppercase">{formatWeekday(day.date)}</p>
        <p className="text-sm font-semibold text-gray-900">{formatDate(day.date)}</p>
      </div>

      <div className="flex-1 space-y-2">
        {day.slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => isDraft && setEditingSlot(slot)}
            className={`w-full text-left rounded-md border p-2 text-xs transition-colors ${
              isDraft
                ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 cursor-pointer'
                : 'border-gray-200 bg-gray-50 cursor-default'
            }`}
          >
            <p className="font-medium text-gray-900">
              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
            </p>
            <p className="text-gray-600 mt-0.5">
              {slot.role} ({slot.headcount})
            </p>
            {slot.assignments.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {slot.assignments.map((a) => (
                  <p key={a.id} className="text-gray-500 truncate">
                    {a.employee?.name ?? `Employee #${a.employee_id}`}
                  </p>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {isDraft && (
        <button
          type="button"
          onClick={() => setShowNewSlot(true)}
          className="mt-2 w-full rounded-md border border-dashed border-gray-300 py-1.5 text-xs text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          + Add Slot
        </button>
      )}

      {editingSlot && (
        <SlotEditor
          slot={editingSlot}
          scheduleDayId={day.id}
          locationId={schedule.location_id}
          onClose={() => setEditingSlot(null)}
          onSaved={() => {
            setEditingSlot(null);
            onSlotChange();
          }}
        />
      )}

      {showNewSlot && (
        <SlotEditor
          slot={null}
          scheduleDayId={day.id}
          locationId={schedule.location_id}
          onClose={() => setShowNewSlot(false)}
          onSaved={() => {
            setShowNewSlot(false);
            onSlotChange();
          }}
        />
      )}
    </div>
  );
}
