<?php

namespace Tests\Feature;

use App\Models\DailyActual;
use App\Models\Location;
use App\Models\Organization;
use App\Models\TenantSetting;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DailyActualApiTest extends TestCase
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

    private function createDailyActual(int $tenantId, int $locationId, string $date, array $overrides = []): DailyActual
    {
        return DailyActual::create(array_merge([
            'tenant_id'   => $tenantId,
            'location_id' => $locationId,
            'date'        => $date,
            'transactions' => 100,
            'revenue'      => 1500.00,
            'store_labor'  => 300.00,
            'delivery_net' => 200.00,
        ], $overrides));
    }

    public function test_list_daily_actuals_with_location_filter(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $loc1 = $this->createLocation($org->id, 'L1');
        $loc2 = $this->createLocation($org->id, 'L2');

        $this->createDailyActual($org->id, $loc1->id, '2026-02-01');
        $this->createDailyActual($org->id, $loc1->id, '2026-02-02');
        $this->createDailyActual($org->id, $loc2->id, '2026-02-01');

        $response = $this->actingAs($user)->getJson("/api/daily-actuals?location_id={$loc1->id}");

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_list_daily_actuals_with_date_range_filter(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $this->createDailyActual($org->id, $location->id, '2026-02-01');
        $this->createDailyActual($org->id, $location->id, '2026-02-15');
        $this->createDailyActual($org->id, $location->id, '2026-02-28');

        $response = $this->actingAs($user)->getJson(
            "/api/daily-actuals?location_id={$location->id}&start_date=2026-02-10&end_date=2026-02-20"
        );

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_get_summary_with_aggregated_metrics(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $this->createDailyActual($org->id, $location->id, '2026-02-01', [
            'revenue'      => 1000.00,
            'store_labor'  => 200.00,
            'delivery_net' => 100.00,
        ]);
        $this->createDailyActual($org->id, $location->id, '2026-02-02', [
            'revenue'      => 2000.00,
            'store_labor'  => 400.00,
            'delivery_net' => 300.00,
        ]);

        $response = $this->actingAs($user)->getJson(
            "/api/daily-actuals/summary?location_id={$location->id}&start_date=2026-02-01&end_date=2026-02-28"
        );

        $response->assertOk();

        $data = $response->json('data');
        $this->assertEquals(3000.00, $data['total_revenue']);
        $this->assertEquals(600.00, $data['total_labor']);
        $this->assertEquals(400.00, $data['total_delivery_net']);
        $this->assertEquals(1500.00, $data['avg_daily_revenue']);
        $this->assertEquals(300.00, $data['avg_daily_labor']);
        $this->assertEquals(20.00, $data['labor_pct']);
        $this->assertEquals(2, $data['day_count']);
    }

    public function test_summary_calculates_gp_correctly_using_gp_margin_factor(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        // Set gpMarginFactor to 0.65
        TenantSetting::create([
            'tenant_id' => $org->id,
            'category'  => 'financial',
            'key_name'  => 'gpMarginFactor',
            'value'     => ['value' => 0.65],
        ]);

        $this->createDailyActual($org->id, $location->id, '2026-02-01', [
            'revenue' => 1000.00,
        ]);

        $response = $this->actingAs($user)->getJson(
            "/api/daily-actuals/summary?location_id={$location->id}&start_date=2026-02-01&end_date=2026-02-28"
        );

        $response->assertOk();
        $this->assertEquals(650.00, $response->json('data.gp_estimate'));
    }
}
