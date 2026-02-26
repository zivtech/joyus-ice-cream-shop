<?php

namespace App\Http\Controllers\Api;

use App\Adapters\AdapterFactory;
use App\Http\Controllers\Controller;
use App\Models\DailyActual;
use App\Models\Employee;
use App\Models\Location;
use App\Models\PosSync;
use App\Models\Schedule;
use App\Models\TenantSetting;
use Carbon\Carbon;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    /**
     * Get current onboarding progress for the tenant.
     */
    public function status(Request $request)
    {
        $tenantId = $request->user()->organization_id;

        $hasOrg = $request->user()->organization !== null;
        $locationCount = Location::where('tenant_id', $tenantId)->count();
        $hasLocations = $locationCount > 0;
        $posConnected = TenantSetting::where('tenant_id', $tenantId)
            ->where('category', 'pos')
            ->exists();
        $dataImported = DailyActual::where('tenant_id', $tenantId)->exists();
        $hasPayRates = TenantSetting::where('tenant_id', $tenantId)
            ->where('key_name', 'pay_rates')
            ->exists();
        $hasOperatingHours = TenantSetting::where('tenant_id', $tenantId)
            ->where('key_name', 'operating_hours')
            ->exists();
        $businessRulesConfigured = $hasPayRates && $hasOperatingHours;
        $firstSchedule = Schedule::where('tenant_id', $tenantId)->exists();

        $steps = [
            'organization'   => ['completed' => $hasOrg, 'label' => 'Organization Created'],
            'locations'      => ['completed' => $hasLocations, 'label' => 'Locations Configured', 'count' => $locationCount],
            'pos_connected'  => ['completed' => $posConnected, 'label' => 'POS Connected'],
            'data_imported'  => ['completed' => $dataImported, 'label' => 'Historical Data Imported'],
            'business_rules' => ['completed' => $businessRulesConfigured, 'label' => 'Business Rules Configured'],
            'first_schedule' => ['completed' => $firstSchedule, 'label' => 'First Schedule Created'],
        ];

        $completedCount = collect($steps)->filter(fn ($s) => $s['completed'])->count();
        $totalSteps = count($steps);
        $progressPct = $totalSteps > 0 ? (int) round(($completedCount / $totalSteps) * 100) : 0;

        // Determine current step (first incomplete)
        $currentStep = null;
        foreach ($steps as $key => $step) {
            if (! $step['completed']) {
                $currentStep = $key;
                break;
            }
        }

        return response()->json([
            'steps'        => $steps,
            'current_step' => $currentStep,
            'progress_pct' => $progressPct,
        ]);
    }

    /**
     * Store POS credentials and verify connection.
     */
    public function connectPos(Request $request)
    {
        $user = $request->user();
        if (! $user->hasAnyRole(['admin', 'gm'])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'location_id'  => ['required', 'integer', 'exists:locations,id'],
            'adapter'      => ['sometimes', 'string', 'in:square,toast,clover'],
            'access_token' => ['required', 'string'],
        ]);

        $tenantId = $user->organization_id;
        $adapterName = $validated['adapter'] ?? 'square';

        $location = Location::where('id', $validated['location_id'])
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        // Store the access token
        TenantSetting::updateOrCreate(
            [
                'tenant_id' => $tenantId,
                'category'  => 'pos',
                'key_name'  => $adapterName . '_access_token',
            ],
            [
                'value' => $validated['access_token'],
            ]
        );

        // Verify connection via adapter health check
        $adapter = AdapterFactory::pos($adapterName);
        $connected = $adapter->healthCheck($location);

        return response()->json([
            'connected' => $connected,
            'location'  => [
                'id'   => $location->id,
                'code' => $location->code,
                'name' => $location->name,
            ],
        ]);
    }

    /**
     * Trigger historical data import from POS.
     */
    public function importData(Request $request)
    {
        $user = $request->user();
        if (! $user->hasAnyRole(['admin', 'gm'])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'start_date'  => ['sometimes', 'date'],
            'end_date'    => ['sometimes', 'date'],
        ]);

        $tenantId = $user->organization_id;

        $location = Location::where('id', $validated['location_id'])
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $endDate = $validated['end_date'] ?? Carbon::today()->toDateString();
        $startDate = $validated['start_date'] ?? Carbon::today()->subMonths(12)->toDateString();

        $adapterName = $location->pos_adapter ?? 'square';
        $adapter = AdapterFactory::pos($adapterName);

        // Import daily sales
        $dailySales = $adapter->importDailySales($location, $startDate, $endDate);
        $daysImported = 0;
        foreach ($dailySales as $day) {
            DailyActual::updateOrCreate(
                [
                    'tenant_id'   => $tenantId,
                    'location_id' => $location->id,
                    'date'        => $day['date'],
                ],
                [
                    'transactions' => $day['transactions'],
                    'revenue'      => $day['revenue'],
                    'store_labor'  => $day['store_labor'],
                    'pos_source'   => $adapterName,
                    'synced_at'    => now(),
                ]
            );
            $daysImported++;
        }

        // Import employees
        $employees = $adapter->importEmployees($location);
        $employeesImported = 0;
        foreach ($employees as $emp) {
            $attributes = [
                'location_id' => $location->id,
                'name'        => trim(($emp['first_name'] ?? '') . ' ' . ($emp['last_name'] ?? '')),
                'email'       => $emp['email'],
                'phone'       => $emp['phone'],
                'status'      => $emp['status'] ?? 'active',
            ];

            if ($emp['pay_rate'] !== null) {
                $attributes['pay_rate'] = $emp['pay_rate'];
            }

            Employee::updateOrCreate(
                [
                    'tenant_id'          => $tenantId,
                    'square_employee_id' => $emp['external_id'],
                ],
                $attributes
            );
            $employeesImported++;
        }

        // Create audit record
        PosSync::create([
            'tenant_id'           => $tenantId,
            'location_id'         => $location->id,
            'adapter'             => $adapterName,
            'period_start'        => $startDate,
            'period_end'          => $endDate,
            'transactions_synced' => $daysImported,
            'employees_synced'    => $employeesImported,
            'status'              => 'completed',
        ]);

        return response()->json([
            'days_imported'      => $daysImported,
            'employees_imported' => $employeesImported,
        ]);
    }

    /**
     * Bulk-set business rules (pay_rates, operating_hours, labor_targets, workflow).
     */
    public function configureRules(Request $request)
    {
        $user = $request->user();
        if (! $user->hasAnyRole(['admin', 'gm'])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'pay_rates'       => ['sometimes', 'array'],
            'operating_hours' => ['sometimes', 'array'],
            'labor_targets'   => ['sometimes', 'array'],
            'workflow'        => ['sometimes', 'array'],
        ]);

        $tenantId = $user->organization_id;
        $saved = [];

        $ruleKeys = ['pay_rates', 'operating_hours', 'labor_targets', 'workflow'];

        foreach ($ruleKeys as $key) {
            if (! isset($validated[$key])) {
                continue;
            }

            $setting = TenantSetting::updateOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'category'  => 'business_rules',
                    'key_name'  => $key,
                ],
                [
                    'value' => $validated[$key],
                ]
            );

            $saved[$key] = $setting->value;
        }

        return response()->json(['data' => $saved]);
    }
}
