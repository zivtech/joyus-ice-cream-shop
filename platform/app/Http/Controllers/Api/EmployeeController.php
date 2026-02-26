<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Employee::class);

        $query = Employee::where('tenant_id', $request->user()->organization_id);

        if ($request->has('location_id')) {
            $query->where('location_id', $request->input('location_id'));
        }

        return EmployeeResource::collection($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Employee::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'string', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'pay_rate' => ['required', 'numeric', 'min:0'],
            'location_id' => ['sometimes', 'nullable', 'integer', 'exists:locations,id'],
            'certifications' => ['sometimes', 'nullable', 'array'],
            'certification_expiry' => ['sometimes', 'nullable', 'array'],
            'square_employee_id' => ['sometimes', 'nullable', 'string', 'max:100'],
            'availability' => ['sometimes', 'nullable', 'array'],
            'hire_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['required', 'string', 'in:active,inactive,terminated'],
        ]);

        $employee = Employee::create(array_merge($validated, [
            'tenant_id' => $request->user()->organization_id,
        ]));

        return (new EmployeeResource($employee))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $employee = Employee::findOrFail($id);

        $this->authorize('view', $employee);

        return new EmployeeResource($employee);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $employee = Employee::findOrFail($id);

        $this->authorize('update', $employee);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'string', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'pay_rate' => ['sometimes', 'numeric', 'min:0'],
            'location_id' => ['sometimes', 'nullable', 'integer', 'exists:locations,id'],
            'certifications' => ['sometimes', 'nullable', 'array'],
            'certification_expiry' => ['sometimes', 'nullable', 'array'],
            'square_employee_id' => ['sometimes', 'nullable', 'string', 'max:100'],
            'availability' => ['sometimes', 'nullable', 'array'],
            'hire_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', 'string', 'in:active,inactive,terminated'],
        ]);

        $employee->update($validated);

        return new EmployeeResource($employee);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $employee = Employee::findOrFail($id);

        $this->authorize('delete', $employee);

        $employee->delete();

        return response()->noContent();
    }

    /**
     * Get certification status for employees with expiration warnings.
     */
    public function certificationStatus(Request $request)
    {
        $this->authorize('viewAny', Employee::class);

        $tenantId = $request->user()->organization_id;
        $expiringWithinDays = (int) $request->input('expiring_within_days', 90);

        $query = Employee::where('tenant_id', $tenantId)
            ->whereNotNull('certifications');

        if ($request->has('location_id')) {
            $query->where('location_id', $request->input('location_id'));
        }

        $employees = $query->get();

        $now = Carbon::now();
        $threshold = $now->copy()->addDays($expiringWithinDays);

        $results = [];
        $totalCertified = 0;
        $expiringSoon = 0;
        $expired = 0;

        foreach ($employees as $employee) {
            $certifications = $employee->certifications ?? [];
            $expiryDates = $employee->certification_expiry ?? [];

            if (empty($certifications)) {
                continue;
            }

            $totalCertified++;

            // Find the earliest expiry date for this employee
            $earliestExpiry = null;
            $earliestDaysUntil = null;
            $status = 'valid';

            foreach ($expiryDates as $index => $expiryDate) {
                if (! $expiryDate) {
                    continue;
                }

                $expiry = Carbon::parse($expiryDate);
                $daysUntil = (int) $now->diffInDays($expiry, false);

                if ($earliestExpiry === null || $expiry->lt($earliestExpiry)) {
                    $earliestExpiry = $expiry;
                    $earliestDaysUntil = $daysUntil;
                }
            }

            if ($earliestExpiry !== null) {
                if ($earliestExpiry->isPast()) {
                    $status = 'expired';
                    $expired++;
                } elseif ($earliestExpiry->lte($threshold)) {
                    $status = 'expiring_soon';
                    $expiringSoon++;
                }
            }

            // Only include employees that have certification data worth reporting
            if ($status === 'expired' || $status === 'expiring_soon' || $expiringWithinDays >= 36500) {
                $results[] = [
                    'id'               => $employee->id,
                    'name'             => $employee->name,
                    'certifications'   => $certifications,
                    'expiry_dates'     => $expiryDates,
                    'days_until_expiry' => $earliestDaysUntil,
                    'status'           => $status,
                ];
            }
        }

        return response()->json([
            'data' => [
                'employees' => $results,
                'summary'   => [
                    'total_certified' => $totalCertified,
                    'expiring_soon'   => $expiringSoon,
                    'expired'         => $expired,
                ],
            ],
        ]);
    }
}
