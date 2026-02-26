<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComplianceRule;
use App\Models\Employee;
use App\Models\Schedule;
use App\Models\ShiftAssignment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ComplianceRuleController extends Controller
{
    /**
     * List compliance rules for tenant with optional filters.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', ComplianceRule::class);

        $tenantId = $request->user()->organization_id;

        $query = ComplianceRule::where('tenant_id', $tenantId);

        if ($request->has('jurisdiction')) {
            $query->where('jurisdiction', $request->input('jurisdiction'));
        }

        if ($request->has('active')) {
            $query->where('active', filter_var($request->input('active'), FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Create a new compliance rule.
     */
    public function store(Request $request)
    {
        $this->authorize('create', ComplianceRule::class);

        $validated = $request->validate([
            'jurisdiction'            => ['required', 'string', 'max:100'],
            'certification_type'      => ['required', 'string', 'max:150'],
            'coverage_requirement'    => ['required', 'string', 'max:50'],
            'constraint_type'         => ['sometimes', 'string', 'in:hard,soft'],
            'minimum_certified_count' => ['sometimes', 'integer', 'min:1'],
            'expiration_months'       => ['sometimes', 'nullable', 'integer', 'min:1'],
            'notes'                   => ['sometimes', 'nullable', 'string'],
        ]);

        $rule = ComplianceRule::create(array_merge($validated, [
            'tenant_id' => $request->user()->organization_id,
        ]));

        return response()->json(['data' => $rule], 201);
    }

    /**
     * Get a single compliance rule.
     */
    public function show(Request $request, string $id)
    {
        $rule = ComplianceRule::findOrFail($id);

        $this->authorize('view', $rule);

        return response()->json(['data' => $rule]);
    }

    /**
     * Update a compliance rule.
     */
    public function update(Request $request, string $id)
    {
        $rule = ComplianceRule::findOrFail($id);

        $this->authorize('update', $rule);

        $validated = $request->validate([
            'jurisdiction'            => ['sometimes', 'string', 'max:100'],
            'certification_type'      => ['sometimes', 'string', 'max:150'],
            'coverage_requirement'    => ['sometimes', 'string', 'max:50'],
            'constraint_type'         => ['sometimes', 'string', 'in:hard,soft'],
            'minimum_certified_count' => ['sometimes', 'integer', 'min:1'],
            'expiration_months'       => ['sometimes', 'nullable', 'integer', 'min:1'],
            'active'                  => ['sometimes', 'boolean'],
            'notes'                   => ['sometimes', 'nullable', 'string'],
        ]);

        $rule->update($validated);

        return response()->json(['data' => $rule]);
    }

    /**
     * Delete a compliance rule.
     */
    public function destroy(Request $request, string $id)
    {
        $rule = ComplianceRule::findOrFail($id);

        $this->authorize('delete', $rule);

        $rule->delete();

        return response()->noContent();
    }

    /**
     * Return jurisdiction presets (hardcoded starter data).
     */
    public function presets()
    {
        return response()->json([
            'Pennsylvania' => [
                [
                    'certification_type'      => 'ServSafe Food Protection Manager',
                    'coverage_requirement'    => 'every_shift',
                    'constraint_type'         => 'hard',
                    'minimum_certified_count' => 1,
                    'expiration_months'       => 60,
                ],
            ],
            'New Jersey' => [
                [
                    'certification_type'      => 'NJ Food Handler Certificate',
                    'coverage_requirement'    => 'every_shift',
                    'constraint_type'         => 'hard',
                    'minimum_certified_count' => 1,
                    'expiration_months'       => 36,
                ],
            ],
            'New York' => [
                [
                    'certification_type'      => 'NYC Food Protection Certificate',
                    'coverage_requirement'    => 'per_location',
                    'constraint_type'         => 'hard',
                    'minimum_certified_count' => 1,
                    'expiration_months'       => 60,
                ],
            ],
        ]);
    }

    /**
     * Validate a schedule against compliance rules.
     */
    public function validate(Request $request)
    {
        $validated = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'schedule_id' => ['required', 'integer', 'exists:schedules,id'],
        ])->validate();

        $tenantId = $request->user()->organization_id;

        $schedule = Schedule::where('tenant_id', $tenantId)
            ->with(['days.slots.assignments.employee'])
            ->findOrFail($validated['schedule_id']);

        $rules = ComplianceRule::where('tenant_id', $tenantId)
            ->where('active', true)
            ->get();

        $violations = [];

        foreach ($schedule->days as $day) {
            // Collect all assigned employees for this day
            $assignedEmployeeIds = [];
            foreach ($day->slots as $slot) {
                foreach ($slot->assignments as $assignment) {
                    $assignedEmployeeIds[] = $assignment->employee_id;
                }
            }

            $assignedEmployees = Employee::whereIn('id', array_unique($assignedEmployeeIds))->get();

            foreach ($rules as $rule) {
                // Count employees with valid (non-expired) certifications
                $certifiedCount = 0;

                foreach ($assignedEmployees as $employee) {
                    $certifications = $employee->certifications ?? [];
                    $expiryDates = $employee->certification_expiry ?? [];

                    foreach ($certifications as $index => $certName) {
                        if ($certName === $rule->certification_type) {
                            // Check expiry if there's an expiry date for this certification
                            if (isset($expiryDates[$index])) {
                                $expiryDate = Carbon::parse($expiryDates[$index]);
                                if ($expiryDate->isFuture()) {
                                    $certifiedCount++;
                                }
                            } else {
                                // No expiry date means the certification is valid
                                $certifiedCount++;
                            }
                            break; // One match per employee is enough
                        }
                    }
                }

                if ($certifiedCount < $rule->minimum_certified_count) {
                    $violations[] = [
                        'date'            => $day->date->toDateString(),
                        'rule'            => $rule->certification_type,
                        'required'        => $rule->minimum_certified_count,
                        'found'           => $certifiedCount,
                        'constraint_type' => $rule->constraint_type,
                    ];
                }
            }
        }

        return response()->json([
            'compliant'  => count($violations) === 0,
            'violations' => $violations,
        ]);
    }
}
