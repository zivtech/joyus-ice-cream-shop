<?php

namespace Database\Seeders;

use App\Models\ComplianceRule;
use App\Models\DailyActual;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Organization;
use App\Models\Schedule;
use App\Models\ScheduleDay;
use App\Models\ScheduleSlot;
use App\Models\Subscription;
use App\Models\TenantSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    /**
     * Seed the Milk Jawn demo tenant with realistic data for all platform features.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // ---------------------------------------------------------------
            // 1. Organization
            // ---------------------------------------------------------------
            $org = Organization::firstOrCreate(
                ['slug' => 'milk-jawn'],
                [
                    'name'        => 'Milk Jawn',
                    'timezone'    => 'America/New_York',
                    'status'      => 'active',
                    'role_labels' => [
                        'admin'         => 'Owner/Admin',
                        'gm'            => 'General Manager',
                        'store_manager' => 'Store Manager',
                        'key_lead'      => 'Key Lead',
                        'staff'         => 'Staff',
                    ],
                ]
            );

            $tenantId = $org->id;

            // ---------------------------------------------------------------
            // 2. Users (one per role)
            // ---------------------------------------------------------------
            $usersData = [
                ['name' => 'Alex',  'email' => 'alex@milkjawn.com',  'role' => 'admin'],
                ['name' => 'Sarah', 'email' => 'sarah@milkjawn.com', 'role' => 'gm'],
                ['name' => 'Mike',  'email' => 'mike@milkjawn.com',  'role' => 'store_manager'],
                ['name' => 'Lisa',  'email' => 'lisa@milkjawn.com',  'role' => 'key_lead'],
                ['name' => 'Jake',  'email' => 'jake@milkjawn.com',  'role' => 'staff'],
            ];

            foreach ($usersData as $userData) {
                $user = User::firstOrCreate(
                    ['email' => $userData['email']],
                    [
                        'name'            => $userData['name'],
                        'password'        => Hash::make('password'),
                        'tenant_id'       => $tenantId,
                        'organization_id' => $org->id,
                    ]
                );

                // Update tenant/org on existing records too
                $user->tenant_id       = $tenantId;
                $user->organization_id = $org->id;
                $user->save();

                if (! $user->hasRole($userData['role'])) {
                    $user->assignRole($userData['role']);
                }
            }

            // ---------------------------------------------------------------
            // 3. Locations
            // ---------------------------------------------------------------
            $ep = Location::firstOrCreate(
                ['tenant_id' => $tenantId, 'code' => 'EP'],
                [
                    'name'               => 'East Passyunk',
                    'timezone'           => 'America/New_York',
                    'square_location_id' => 'LYPJTCTZKM211',
                    'pos_adapter'        => 'square',
                    'status'             => 'active',
                ]
            );

            $nl = Location::firstOrCreate(
                ['tenant_id' => $tenantId, 'code' => 'NL'],
                [
                    'name'               => 'NoLibs',
                    'timezone'           => 'America/New_York',
                    'square_location_id' => 'LDBQAYTKVHZAT',
                    'pos_adapter'        => 'square',
                    'status'             => 'active',
                ]
            );

            // ---------------------------------------------------------------
            // 4. Employees
            // ---------------------------------------------------------------
            $epEmployees = [
                ['name' => 'Emma S.',   'email' => 'emma@milkjawn.com',   'pay_rate' => 17.00, 'square_employee_id' => 'emp_001'],
                ['name' => 'Carlos R.', 'email' => 'carlos@milkjawn.com', 'pay_rate' => 15.50, 'square_employee_id' => null],
                ['name' => 'Priya K.',  'email' => 'priya@milkjawn.com',  'pay_rate' => 16.00, 'square_employee_id' => null],
                ['name' => 'David L.',  'email' => 'david@milkjawn.com',  'pay_rate' => 14.50, 'square_employee_id' => null],
            ];

            $nlEmployees = [
                ['name' => 'Aisha M.',  'email' => 'aisha@milkjawn.com',  'pay_rate' => 17.50, 'square_employee_id' => 'emp_002'],
                ['name' => 'Tyler W.',  'email' => 'tyler@milkjawn.com',  'pay_rate' => 15.00, 'square_employee_id' => null],
                ['name' => 'Sofia G.',  'email' => 'sofia@milkjawn.com',  'pay_rate' => 16.50, 'square_employee_id' => null],
                ['name' => 'Marcus J.', 'email' => 'marcus@milkjawn.com', 'pay_rate' => 14.00, 'square_employee_id' => null],
            ];

            foreach ($epEmployees as $data) {
                Employee::firstOrCreate(
                    ['tenant_id' => $tenantId, 'email' => $data['email']],
                    [
                        'location_id'        => $ep->id,
                        'name'               => $data['name'],
                        'pay_rate'           => $data['pay_rate'],
                        'square_employee_id' => $data['square_employee_id'],
                        'status'             => 'active',
                        'hire_date'          => Carbon::now()->subMonths(rand(6, 24)),
                    ]
                );
            }

            foreach ($nlEmployees as $data) {
                Employee::firstOrCreate(
                    ['tenant_id' => $tenantId, 'email' => $data['email']],
                    [
                        'location_id'        => $nl->id,
                        'name'               => $data['name'],
                        'pay_rate'           => $data['pay_rate'],
                        'square_employee_id' => $data['square_employee_id'],
                        'status'             => 'active',
                        'hire_date'          => Carbon::now()->subMonths(rand(6, 24)),
                    ]
                );
            }

            // ---------------------------------------------------------------
            // 5. DailyActuals — last 30 days for both locations
            // ---------------------------------------------------------------
            foreach ([$ep, $nl] as $location) {
                for ($i = 1; $i <= 30; $i++) {
                    $date    = Carbon::today()->subDays($i);
                    $isWeekend = in_array($date->dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY]);

                    $revenue      = $isWeekend
                        ? round(rand(1800, 2500) + (rand(0, 99) / 100), 2)
                        : round(rand(800, 1600) + (rand(0, 99) / 100), 2);
                    $avgTicket    = rand(8, 15);
                    $transactions = (int) round($revenue / $avgTicket);
                    $storeLabor   = round($revenue * (rand(22, 30) / 100), 2);
                    $deliveryNet  = $i <= 20 ? round(rand(50, 300) + (rand(0, 99) / 100), 2) : 0.00;

                    DailyActual::firstOrCreate(
                        [
                            'tenant_id'   => $tenantId,
                            'location_id' => $location->id,
                            'date'        => $date->toDateString(),
                        ],
                        [
                            'transactions' => $transactions,
                            'revenue'      => $revenue,
                            'store_labor'  => $storeLabor,
                            'delivery_net' => $deliveryNet,
                            'pos_source'   => 'square',
                            'synced_at'    => Carbon::now(),
                        ]
                    );
                }
            }

            // ---------------------------------------------------------------
            // 6. Compliance Rules (PA jurisdiction)
            // ---------------------------------------------------------------
            ComplianceRule::firstOrCreate(
                [
                    'tenant_id'          => $tenantId,
                    'certification_type' => 'ServSafe Food Protection Manager',
                ],
                [
                    'jurisdiction'            => 'Pennsylvania',
                    'coverage_requirement'    => 'every_shift',
                    'constraint_type'         => 'hard',
                    'minimum_certified_count' => 1,
                    'expiration_months'       => 60,
                    'active'                  => true,
                    'notes'                   => 'PA requires at least one ServSafe-certified person per shift.',
                ]
            );

            ComplianceRule::firstOrCreate(
                [
                    'tenant_id'          => $tenantId,
                    'certification_type' => 'PA Food Handler Card',
                ],
                [
                    'jurisdiction'            => 'Pennsylvania',
                    'coverage_requirement'    => 'every_shift',
                    'constraint_type'         => 'soft',
                    'minimum_certified_count' => 1,
                    'expiration_months'       => 36,
                    'active'                  => true,
                    'notes'                   => 'Recommended that all staff hold a current PA food handler card.',
                ]
            );

            // ---------------------------------------------------------------
            // 7. TenantSettings
            // ---------------------------------------------------------------
            $settings = [
                ['category' => 'business_rules', 'key_name' => 'pay_rates',       'value' => ['scooper' => 14, 'shift_lead' => 16, 'manager' => 20]],
                ['category' => 'business_rules', 'key_name' => 'operating_hours',  'value' => ['open' => '11:00', 'close' => '22:00']],
                ['category' => 'business_rules', 'key_name' => 'labor_targets',    'value' => ['target_pct' => 25, 'warning_pct' => 30]],
                ['category' => 'business_rules', 'key_name' => 'workflow',         'value' => ['auto_approve' => false, 'require_manager_review' => true]],
                ['category' => 'pos',            'key_name' => 'square_access_token', 'value' => 'demo-token-placeholder'],
                ['category' => 'delivery',       'key_name' => 'doordash_commission_ep', 'value' => 0.20],
                ['category' => 'delivery',       'key_name' => 'doordash_commission_nl', 'value' => 0.25],
            ];

            foreach ($settings as $setting) {
                TenantSetting::firstOrCreate(
                    [
                        'tenant_id' => $tenantId,
                        'category'  => $setting['category'],
                        'key_name'  => $setting['key_name'],
                    ],
                    ['value' => $setting['value']]
                );
            }

            // ---------------------------------------------------------------
            // 8. Subscription
            // ---------------------------------------------------------------
            Subscription::firstOrCreate(
                ['tenant_id' => $tenantId],
                [
                    'plan'                 => 'professional',
                    'status'               => 'active',
                    'current_period_start' => Carbon::now()->startOfMonth(),
                    'current_period_end'   => Carbon::now()->endOfMonth(),
                ]
            );

            // ---------------------------------------------------------------
            // 9. Sample Schedule — current week, EP location
            // ---------------------------------------------------------------
            $weekStart = Carbon::now()->startOfWeek(Carbon::MONDAY)->startOfDay();

            $schedule = Schedule::firstOrCreate(
                [
                    'tenant_id'   => $tenantId,
                    'location_id' => $ep->id,
                    'week_start'  => $weekStart->toDateString(),
                ],
                [
                    'status' => 'draft',
                    'notes'  => 'Demo schedule — current week.',
                ]
            );

            for ($d = 0; $d < 7; $d++) {
                $day = ScheduleDay::firstOrCreate(
                    [
                        'schedule_id' => $schedule->id,
                        'date'        => $weekStart->copy()->addDays($d)->toDateString(),
                    ],
                    ['policy_changed' => false]
                );

                // Morning slot 11:00 – 16:00
                ScheduleSlot::firstOrCreate(
                    [
                        'schedule_day_id' => $day->id,
                        'start_time'      => '11:00',
                        'end_time'        => '16:00',
                    ],
                    [
                        'role'      => 'scooper',
                        'headcount' => 2,
                    ]
                );

                // Evening slot 16:00 – 22:00
                ScheduleSlot::firstOrCreate(
                    [
                        'schedule_day_id' => $day->id,
                        'start_time'      => '16:00',
                        'end_time'        => '22:00',
                    ],
                    [
                        'role'      => 'scooper',
                        'headcount' => 2,
                    ]
                );
            }
        });
    }
}
