<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\ScheduleDay;
use App\Models\ScheduleSlot;
use Illuminate\Http\Request;

class ScheduleSlotController extends Controller
{
    /**
     * Add a slot to a schedule day.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_day_id' => ['required', 'integer', 'exists:schedule_days,id'],
            'start_time'      => ['required', 'date_format:H:i'],
            'end_time'        => ['required', 'date_format:H:i'],
            'role'            => ['required', 'string', 'max:100'],
            'headcount'       => ['sometimes', 'integer', 'min:1'],
        ]);

        $scheduleDay = ScheduleDay::findOrFail($validated['schedule_day_id']);
        $schedule = Schedule::findOrFail($scheduleDay->schedule_id);

        $this->authorize('update', $schedule);

        if ($schedule->status !== 'draft') {
            return response()->json([
                'message' => 'Slots can only be added to draft schedules.',
            ], 422);
        }

        $slot = ScheduleSlot::create([
            'schedule_day_id' => $validated['schedule_day_id'],
            'start_time'      => $validated['start_time'],
            'end_time'        => $validated['end_time'],
            'role'            => $validated['role'],
            'headcount'       => $validated['headcount'] ?? 1,
        ]);

        return response()->json(['data' => $slot], 201);
    }

    /**
     * Update a slot's times, role, or headcount.
     */
    public function update(Request $request, string $id)
    {
        $slot = ScheduleSlot::findOrFail($id);
        $scheduleDay = ScheduleDay::findOrFail($slot->schedule_day_id);
        $schedule = Schedule::findOrFail($scheduleDay->schedule_id);

        $this->authorize('update', $schedule);

        if ($schedule->status !== 'draft') {
            return response()->json([
                'message' => 'Slots can only be updated on draft schedules.',
            ], 422);
        }

        $validated = $request->validate([
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time'   => ['sometimes', 'date_format:H:i'],
            'role'       => ['sometimes', 'string', 'max:100'],
            'headcount'  => ['sometimes', 'integer', 'min:1'],
        ]);

        $slot->update($validated);

        return response()->json(['data' => $slot]);
    }

    /**
     * Remove a slot.
     */
    public function destroy(Request $request, string $id)
    {
        $slot = ScheduleSlot::findOrFail($id);
        $scheduleDay = ScheduleDay::findOrFail($slot->schedule_day_id);
        $schedule = Schedule::findOrFail($scheduleDay->schedule_id);

        $this->authorize('delete', $schedule);

        if ($schedule->status !== 'draft') {
            return response()->json([
                'message' => 'Slots can only be removed from draft schedules.',
            ], 422);
        }

        $slot->delete();

        return response()->noContent();
    }
}
