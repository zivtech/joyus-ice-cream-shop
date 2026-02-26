import { useState, type FormEvent } from 'react';
import client from '@/api/client';
import { useEmployees } from '@/api/hooks';
import type { ScheduleSlot } from '@/types';

interface SlotEditorProps {
  slot: ScheduleSlot | null;
  scheduleDayId: number;
  locationId: number;
  onClose: () => void;
  onSaved: () => void;
}

export function SlotEditor({ slot, scheduleDayId, locationId, onClose, onSaved }: SlotEditorProps) {
  const [startTime, setStartTime] = useState(slot?.start_time ?? '09:00');
  const [endTime, setEndTime] = useState(slot?.end_time ?? '17:00');
  const [role, setRole] = useState(slot?.role ?? '');
  const [headcount, setHeadcount] = useState(slot?.headcount ?? 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data: employees } = useEmployees(locationId);
  const assignedIds = new Set(slot?.assignments.map((a) => a.employee_id) ?? []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (slot) {
        await client.patch(`/schedule-slots/${slot.id}`, {
          start_time: startTime,
          end_time: endTime,
          role,
          headcount,
        });
      } else {
        await client.post('/schedule-slots', {
          schedule_day_id: scheduleDayId,
          start_time: startTime,
          end_time: endTime,
          role,
          headcount,
        });
      }
      onSaved();
    } catch {
      setError('Failed to save slot.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!slot) return;
    setSaving(true);
    setError('');
    try {
      await client.delete(`/schedule-slots/${slot.id}`);
      onSaved();
    } catch {
      setError('Failed to delete slot.');
      setSaving(false);
    }
  }

  async function handleAssign(employeeId: number) {
    if (!slot) return;
    setError('');
    try {
      await client.post('/shift-assignments', {
        schedule_slot_id: slot.id,
        employee_id: employeeId,
      });
      onSaved();
    } catch {
      setError('Failed to assign employee.');
    }
  }

  async function handleUnassign(assignmentId: number) {
    setError('');
    try {
      await client.delete(`/shift-assignments/${assignmentId}`);
      onSaved();
    } catch {
      setError('Failed to unassign employee.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            {slot ? 'Edit Slot' : 'New Slot'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              placeholder="e.g. Scooper, Cashier, Shift Lead"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headcount</label>
            <input
              type="number"
              min={1}
              value={headcount}
              onChange={(e) => setHeadcount(Number(e.target.value))}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {slot && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Employees</label>
              {slot.assignments.length > 0 ? (
                <div className="space-y-1 mb-2">
                  {slot.assignments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm bg-gray-50 rounded px-2 py-1">
                      <span className="text-gray-700">{a.employee?.name ?? `Employee #${a.employee_id}`}</span>
                      <button
                        type="button"
                        onClick={() => void handleUnassign(a.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 mb-2">No employees assigned.</p>
              )}

              <select
                onChange={(e) => {
                  const id = Number(e.target.value);
                  if (id) void handleAssign(id);
                  e.target.value = '';
                }}
                defaultValue=""
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Assign employee...</option>
                {employees
                  .filter((emp) => emp.status === 'active' && !assignedIds.has(emp.id))
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              {slot && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleDelete()}
                  className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                >
                  Delete Slot
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
