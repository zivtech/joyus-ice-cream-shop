<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PtoRequest;
use Illuminate\Http\Request;

class PtoRequestController extends Controller
{
    /**
     * List PTO requests with optional filters.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', PtoRequest::class);

        $tenantId = $request->user()->organization_id;

        $query = PtoRequest::where('tenant_id', $tenantId)
            ->with(['employee', 'location']);

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->input('employee_id'));
        }

        if ($request->has('location_id')) {
            $query->where('location_id', $request->input('location_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('start_date')) {
            $query->where('start_date', '>=', $request->input('start_date'));
        }

        if ($request->has('end_date')) {
            $query->where('end_date', '<=', $request->input('end_date'));
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Create a PTO request.
     */
    public function store(Request $request)
    {
        $this->authorize('create', PtoRequest::class);

        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'start_date'  => ['required', 'date'],
            'end_date'    => ['required', 'date', 'after_or_equal:start_date'],
            'reason'      => ['sometimes', 'nullable', 'string'],
        ]);

        $ptoRequest = PtoRequest::create(array_merge($validated, [
            'tenant_id' => $request->user()->organization_id,
            'status'    => 'pending',
        ]));

        $ptoRequest->load(['employee', 'location']);

        return response()->json(['data' => $ptoRequest], 201);
    }

    /**
     * Show a single PTO request.
     */
    public function show(Request $request, string $id)
    {
        $ptoRequest = PtoRequest::findOrFail($id);

        $this->authorize('view', $ptoRequest);

        $ptoRequest->load(['employee', 'location']);

        return response()->json(['data' => $ptoRequest]);
    }

    /**
     * Approve a PTO request.
     */
    public function approve(Request $request, string $id)
    {
        $ptoRequest = PtoRequest::findOrFail($id);

        $this->authorize('approve', $ptoRequest);

        $ptoRequest->update(['status' => 'approved']);

        $ptoRequest->load(['employee', 'location']);

        return response()->json(['data' => $ptoRequest]);
    }

    /**
     * Deny a PTO request.
     */
    public function deny(Request $request, string $id)
    {
        $ptoRequest = PtoRequest::findOrFail($id);

        $this->authorize('deny', $ptoRequest);

        $ptoRequest->update(['status' => 'denied']);

        $ptoRequest->load(['employee', 'location']);

        return response()->json(['data' => $ptoRequest]);
    }

    /**
     * Cancel a PTO request. Only the original employee or admin/gm can cancel.
     */
    public function cancel(Request $request, string $id)
    {
        $ptoRequest = PtoRequest::findOrFail($id);

        // Tenant isolation
        if ($request->user()->organization_id !== $ptoRequest->tenant_id) {
            abort(403);
        }

        // Allow admin/gm or the employee who owns the PTO request
        $user = $request->user();
        $isOwner = $ptoRequest->employee && $ptoRequest->employee->email === $user->email;
        $isAdminGm = $user->hasAnyRole(['admin', 'gm']);

        if (! $isOwner && ! $isAdminGm) {
            abort(403);
        }

        $ptoRequest->update(['status' => 'cancelled']);

        $ptoRequest->load(['employee', 'location']);

        return response()->json(['data' => $ptoRequest]);
    }
}
