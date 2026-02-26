<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\ScheduleDay;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    /**
     * Display a listing of schedules for the tenant.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Schedule::class);

        $query = Schedule::where('tenant_id', $request->user()->organization_id)
            ->with(['location', 'days.slots.assignments']);

        if ($request->has('location_id')) {
            $query->where('location_id', $request->input('location_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('week_start')) {
            $query->where('week_start', $request->input('week_start'));
        }

        return $query->orderByDesc('week_start')->paginate(15);
    }

    /**
     * Store a newly created schedule (draft).
     */
    public function store(Request $request)
    {
        $this->authorize('create', Schedule::class);

        $validated = $request->validate([
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'week_start'  => ['required', 'date'],
            'notes'       => ['sometimes', 'nullable', 'string'],
        ]);

        // Validate week_start is a Monday
        $weekStart = Carbon::parse($validated['week_start']);
        if (! $weekStart->isMonday()) {
            return response()->json([
                'message' => 'The week_start must be a Monday.',
                'errors'  => ['week_start' => ['The week_start must be a Monday.']],
            ], 422);
        }

        $tenantId = $request->user()->organization_id;

        // Check for duplicate schedule for same location+week
        $exists = Schedule::where('tenant_id', $tenantId)
            ->where('location_id', $validated['location_id'])
            ->whereDate('week_start', $weekStart->toDateString())
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'A schedule already exists for this location and week.',
                'errors'  => ['week_start' => ['A schedule already exists for this location and week.']],
            ], 422);
        }

        $schedule = Schedule::create([
            'tenant_id'   => $tenantId,
            'location_id' => $validated['location_id'],
            'week_start'  => $weekStart->toDateString(),
            'status'      => 'draft',
            'notes'       => $validated['notes'] ?? null,
        ]);

        // Auto-create 7 ScheduleDay records (Mon-Sun)
        for ($i = 0; $i < 7; $i++) {
            ScheduleDay::create([
                'schedule_id' => $schedule->id,
                'date'        => $weekStart->copy()->addDays($i)->toDateString(),
            ]);
        }

        $schedule->load('days');

        return response()->json(['data' => $schedule], 201);
    }

    /**
     * Display the specified schedule with all nested data.
     */
    public function show(Request $request, string $id)
    {
        $schedule = Schedule::findOrFail($id);

        $this->authorize('view', $schedule);

        $schedule->load(['location', 'days.slots.assignments.employee', 'reviewer']);

        return response()->json(['data' => $schedule]);
    }

    /**
     * Update schedule metadata. Only while status is 'draft'.
     */
    public function update(Request $request, string $id)
    {
        $schedule = Schedule::findOrFail($id);

        $this->authorize('update', $schedule);

        if ($schedule->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft schedules can be updated.',
            ], 422);
        }

        $validated = $request->validate([
            'notes' => ['sometimes', 'nullable', 'string'],
        ]);

        $schedule->update($validated);

        return response()->json(['data' => $schedule]);
    }

    /**
     * Delete a draft schedule.
     */
    public function destroy(Request $request, string $id)
    {
        $schedule = Schedule::findOrFail($id);

        $this->authorize('delete', $schedule);

        if ($schedule->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft schedules can be deleted.',
            ], 422);
        }

        $schedule->delete();

        return response()->noContent();
    }

    /**
     * Submit schedule for approval (draft -> pending).
     */
    public function submit(Request $request, string $id)
    {
        $schedule = Schedule::findOrFail($id);

        $this->authorize('submit', $schedule);

        if ($schedule->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft schedules can be submitted.',
            ], 422);
        }

        $schedule->update([
            'status'       => 'pending',
            'submitted_at' => now(),
        ]);

        return response()->json(['data' => $schedule]);
    }

    /**
     * Approve a pending schedule (pending -> approved).
     */
    public function approve(Request $request, string $id)
    {
        $schedule = Schedule::findOrFail($id);

        $this->authorize('approve', $schedule);

        if ($schedule->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending schedules can be approved.',
            ], 422);
        }

        $schedule->update([
            'status'      => 'approved',
            'reviewed_at' => now(),
            'reviewer_id' => $request->user()->id,
        ]);

        return response()->json(['data' => $schedule]);
    }

    /**
     * Reject a pending schedule (pending -> rejected).
     */
    public function reject(Request $request, string $id)
    {
        $schedule = Schedule::findOrFail($id);

        $this->authorize('reject', $schedule);

        if ($schedule->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending schedules can be rejected.',
            ], 422);
        }

        $validated = $request->validate([
            'notes' => ['sometimes', 'nullable', 'string'],
        ]);

        $schedule->update([
            'status'      => 'rejected',
            'reviewed_at' => now(),
            'reviewer_id' => $request->user()->id,
            'notes'       => $validated['notes'] ?? $schedule->notes,
        ]);

        return response()->json(['data' => $schedule]);
    }

    /**
     * Publish an approved schedule (approved -> published).
     */
    public function publish(Request $request, string $id)
    {
        $schedule = Schedule::findOrFail($id);

        $this->authorize('publish', $schedule);

        if ($schedule->status !== 'approved') {
            return response()->json([
                'message' => 'Only approved schedules can be published.',
            ], 422);
        }

        $schedule->update([
            'status'       => 'published',
            'published_at' => now(),
        ]);

        return response()->json(['data' => $schedule]);
    }
}
