<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Schedule;
use App\Models\ScheduleDay;
use App\Models\ScheduleSlot;
use App\Models\ShiftAssignment;
use Illuminate\Http\Request;

class ShiftAssignmentController extends Controller
{
    /**
     * Assign an employee to a slot.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_slot_id' => ['required', 'integer', 'exists:schedule_slots,id'],
            'employee_id'      => ['required', 'integer', 'exists:employees,id'],
        ]);

        $slot = ScheduleSlot::findOrFail($validated['schedule_slot_id']);
        $scheduleDay = ScheduleDay::findOrFail($slot->schedule_day_id);
        $schedule = Schedule::findOrFail($scheduleDay->schedule_id);

        $this->authorize('update', $schedule);

        if ($schedule->status !== 'draft') {
            return response()->json([
                'message' => 'Assignments can only be added to draft schedules.',
            ], 422);
        }

        // Validate employee belongs to same tenant
        $employee = Employee::findOrFail($validated['employee_id']);
        if ($employee->tenant_id !== $request->user()->organization_id) {
            return response()->json([
                'message' => 'Employee does not belong to this organization.',
            ], 422);
        }

        // Auto-calculate position_index (next available)
        $maxIndex = ShiftAssignment::where('schedule_slot_id', $slot->id)
            ->max('position_index');
        $positionIndex = $maxIndex !== null ? $maxIndex + 1 : 0;

        $assignment = ShiftAssignment::create([
            'schedule_slot_id' => $validated['schedule_slot_id'],
            'employee_id'      => $validated['employee_id'],
            'position_index'   => $positionIndex,
        ]);

        return response()->json(['data' => $assignment], 201);
    }

    /**
     * Remove an assignment.
     */
    public function destroy(Request $request, string $id)
    {
        $assignment = ShiftAssignment::findOrFail($id);
        $slot = ScheduleSlot::findOrFail($assignment->schedule_slot_id);
        $scheduleDay = ScheduleDay::findOrFail($slot->schedule_day_id);
        $schedule = Schedule::findOrFail($scheduleDay->schedule_id);

        $this->authorize('delete', $schedule);

        if ($schedule->status !== 'draft') {
            return response()->json([
                'message' => 'Assignments can only be removed from draft schedules.',
            ], 422);
        }

        $assignment->delete();

        return response()->noContent();
    }
}
