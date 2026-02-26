<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PolicyExceptionRequest;
use Illuminate\Http\Request;

class PolicyExceptionRequestController extends Controller
{
    /**
     * List exception requests with optional filters.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', PolicyExceptionRequest::class);

        $tenantId = $request->user()->organization_id;

        $query = PolicyExceptionRequest::where('tenant_id', $tenantId)
            ->with(['requester', 'reviewer', 'scheduleDay']);

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('schedule_id')) {
            $query->whereHas('scheduleDay', function ($q) use ($request) {
                $q->where('schedule_id', $request->input('schedule_id'));
            });
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Create a new exception request.
     */
    public function store(Request $request)
    {
        $this->authorize('create', PolicyExceptionRequest::class);

        $validated = $request->validate([
            'schedule_day_id' => ['required', 'integer', 'exists:schedule_days,id'],
            'reason'          => ['required', 'string'],
        ]);

        $exceptionRequest = PolicyExceptionRequest::create([
            'tenant_id'       => $request->user()->organization_id,
            'schedule_day_id' => $validated['schedule_day_id'],
            'requester_id'    => $request->user()->id,
            'reason'          => $validated['reason'],
            'status'          => 'pending',
        ]);

        $exceptionRequest->load(['requester', 'scheduleDay']);

        return response()->json(['data' => $exceptionRequest], 201);
    }

    /**
     * Show a single exception request.
     */
    public function show(Request $request, string $id)
    {
        $exceptionRequest = PolicyExceptionRequest::findOrFail($id);

        $this->authorize('view', $exceptionRequest);

        $exceptionRequest->load(['requester', 'reviewer', 'scheduleDay']);

        return response()->json(['data' => $exceptionRequest]);
    }

    /**
     * Approve an exception request.
     */
    public function approve(Request $request, string $id)
    {
        $exceptionRequest = PolicyExceptionRequest::findOrFail($id);

        $this->authorize('approve', $exceptionRequest);

        $exceptionRequest->update([
            'status'      => 'approved',
            'reviewer_id' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $exceptionRequest->load(['requester', 'reviewer', 'scheduleDay']);

        return response()->json(['data' => $exceptionRequest]);
    }

    /**
     * Reject an exception request.
     */
    public function reject(Request $request, string $id)
    {
        $exceptionRequest = PolicyExceptionRequest::findOrFail($id);

        $this->authorize('reject', $exceptionRequest);

        $validated = $request->validate([
            'notes' => ['sometimes', 'nullable', 'string'],
        ]);

        $updateData = [
            'status'      => 'rejected',
            'reviewer_id' => $request->user()->id,
            'reviewed_at' => now(),
        ];

        if (isset($validated['notes'])) {
            $updateData['reason'] = $validated['notes'];
        }

        $exceptionRequest->update($updateData);

        $exceptionRequest->load(['requester', 'reviewer', 'scheduleDay']);

        return response()->json(['data' => $exceptionRequest]);
    }
}
