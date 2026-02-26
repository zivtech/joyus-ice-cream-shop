<?php

namespace Tests\Feature;

use App\Models\DailyActual;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Organization;
use App\Models\Schedule;
use App\Models\ScheduleDay;
use App\Models\ScheduleSlot;
use App\Models\ShiftAssignment;
use App\Models\TenantSetting;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VarianceApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function createOrgAndUser(string $role = 'admin', string $suffix = ''): array
    {
        $slug = 'test-org' . ($suffix ? '-' . $suffix : '');
        $org = Organization::create([
            'name' => 'Test Org ' . $suffix,
            'slug' => $slug,
        ]);

        $email = 'user' . ($suffix ? '-' . $suffix : '') . '@example.com';
        $user = User::create([
            'name'            => 'Test User',
            'email'           => $email,
            'password'        => bcrypt('password'),
            'organization_id' => $org->id,
        ]);
        $user->assignRole($role);

        return [$org, $user];
    }

    private function createLocation(int $tenantId, string $code = 'LOC1'): Location
    {
        return Location::create([
            'tenant_id' => $tenantId,
            'code'      => $code,
            'name'      => 'Test Location ' . $code,
            'status'    => 'active',
        ]);
    }

    public function test_get_variance_with_schedule_and_actual_data(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        // Set a default pay rate
        TenantSetting::create([
            'tenant_id' => $org->id,
            'category'  => 'scheduling',
            'key_name'  => 'defaultPayRate',
            'value'     => ['value' => 15.00],
        ]);

        // Create schedule with a slot
        $schedule = Schedule::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'week_start'  => '2026-03-02',
            'status'      => 'published',
        ]);

        $day = ScheduleDay::create([
            'schedule_id' => $schedule->id,
            'date'        => '2026-03-02',
        ]);

        ScheduleSlot::create([
            'schedule_day_id' => $day->id,
            'start_time'      => '09:00',
            'end_time'        => '17:00',
            'role'            => 'scooper',
            'headcount'       => 2,
        ]);

        // Create actual data for that day
        DailyActual::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'date'        => '2026-03-02',
            'transactions' => 100,
            'revenue'      => 2000.00,
            'store_labor'  => 260.00,
            'delivery_net' => 100.00,
        ]);

        $response = $this->actingAs($user)->getJson(
            "/api/daily-actuals/variance?location_id={$location->id}&start_date=2026-03-02&end_date=2026-03-02"
        );

        $response->assertOk();

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('2026-03-02', $data[0]['date']);
        $this->assertEquals(2000.00, $data[0]['actual_revenue']);
        $this->assertEquals(260.00, $data[0]['actual_labor']);
        // 8 hours * 2 headcount * $15 = $240 planned labor
        $this->assertEquals(240.00, $data[0]['planned_labor']);
        $this->assertEquals(20.00, $data[0]['variance']); // 260 - 240
    }

    public function test_get_multi_location_rollup(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $loc1 = $this->createLocation($org->id, 'EP');
        $loc2 = $this->createLocation($org->id, 'NL');

        // Rename locations for clarity
        $loc1->update(['name' => 'East Passyunk']);
        $loc2->update(['name' => 'NoLibs']);

        DailyActual::create([
            'tenant_id'    => $org->id,
            'location_id'  => $loc1->id,
            'date'         => '2026-03-01',
            'transactions' => 100,
            'revenue'      => 3000.00,
            'store_labor'  => 600.00,
            'delivery_net' => 200.00,
        ]);

        DailyActual::create([
            'tenant_id'    => $org->id,
            'location_id'  => $loc2->id,
            'date'         => '2026-03-01',
            'transactions' => 80,
            'revenue'      => 2000.00,
            'store_labor'  => 400.00,
            'delivery_net' => 100.00,
        ]);

        $response = $this->actingAs($user)->getJson(
            '/api/daily-actuals/rollup?start_date=2026-03-01&end_date=2026-03-31'
        );

        $response->assertOk();

        $data = $response->json('data');
        $this->assertEquals(5000.00, $data['total_revenue']);
        $this->assertEquals(1000.00, $data['total_labor']);
        $this->assertEquals(300.00, $data['total_delivery_net']);
        $this->assertEquals(20.00, $data['labor_pct']);
        $this->assertCount(2, $data['locations']);
    }

    public function test_get_certification_status(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        // Employee with expiring certification (within 90 days from 2026-02-26)
        Employee::create([
            'tenant_id'            => $org->id,
            'location_id'          => $location->id,
            'name'                 => 'Alice',
            'pay_rate'             => 15.00,
            'status'               => 'active',
            'certifications'       => ['ServSafe Food Protection Manager'],
            'certification_expiry' => ['2026-05-01'],
        ]);

        // Employee with valid certification (far future)
        Employee::create([
            'tenant_id'            => $org->id,
            'location_id'          => $location->id,
            'name'                 => 'Bob',
            'pay_rate'             => 15.00,
            'status'               => 'active',
            'certifications'       => ['ServSafe Food Protection Manager'],
            'certification_expiry' => ['2028-01-01'],
        ]);

        // Employee with no certifications
        Employee::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'name'        => 'Charlie',
            'pay_rate'    => 15.00,
            'status'      => 'active',
        ]);

        $response = $this->actingAs($user)->getJson(
            "/api/employees/certification-status?location_id={$location->id}&expiring_within_days=90"
        );

        $response->assertOk();

        $data = $response->json('data');
        $this->assertEquals(2, $data['summary']['total_certified']);
        // Alice is expiring within 90 days
        $this->assertGreaterThanOrEqual(1, $data['summary']['expiring_soon']);
    }
}
