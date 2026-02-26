<?php

namespace Tests\Feature;

use App\Models\DailyActual;
use App\Models\Location;
use App\Models\Organization;
use App\Models\Schedule;
use App\Models\TenantSetting;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OnboardingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function createOrgAndUser(string $role = 'admin'): array
    {
        $org = Organization::create([
            'name' => 'Test Org',
            'slug' => 'test-org',
        ]);

        $user = User::create([
            'name'            => 'Test User',
            'email'           => 'admin@example.com',
            'password'        => bcrypt('password'),
            'organization_id' => $org->id,
        ]);
        $user->assignRole($role);

        return [$org, $user];
    }

    public function test_onboarding_status_shows_correct_progress(): void
    {
        [$org, $user] = $this->createOrgAndUser();

        // Fresh org should have organization completed and nothing else
        $response = $this->actingAs($user)->getJson('/api/onboarding/status');

        $response->assertOk()
            ->assertJsonPath('steps.organization.completed', true)
            ->assertJsonPath('steps.locations.completed', false)
            ->assertJsonPath('steps.pos_connected.completed', false)
            ->assertJsonPath('steps.data_imported.completed', false)
            ->assertJsonPath('steps.business_rules.completed', false)
            ->assertJsonPath('steps.first_schedule.completed', false)
            ->assertJsonPath('current_step', 'locations')
            ->assertJsonPath('progress_pct', 17);

        // Add a location
        Location::create([
            'tenant_id' => $org->id,
            'code'      => 'TST',
            'name'      => 'Test Location',
            'status'    => 'active',
        ]);

        $response = $this->actingAs($user)->getJson('/api/onboarding/status');
        $response->assertOk()
            ->assertJsonPath('steps.locations.completed', true)
            ->assertJsonPath('steps.locations.count', 1)
            ->assertJsonPath('progress_pct', 33);
    }

    public function test_connect_pos_stores_credentials(): void
    {
        [$org, $user] = $this->createOrgAndUser();

        $location = Location::create([
            'tenant_id'          => $org->id,
            'code'               => 'TST',
            'name'               => 'Test Location',
            'square_location_id' => 'SQUARE_LOC_123',
            'pos_adapter'        => 'square',
            'status'             => 'active',
        ]);

        Http::fake([
            'connect.squareapis.com/v2/locations/SQUARE_LOC_123' => Http::response([
                'location' => ['id' => 'SQUARE_LOC_123', 'name' => 'Test'],
            ], 200),
        ]);

        $response = $this->actingAs($user)->postJson('/api/onboarding/connect-pos', [
            'location_id'  => $location->id,
            'adapter'      => 'square',
            'access_token' => 'test-token-xyz',
        ]);

        $response->assertOk()
            ->assertJsonPath('connected', true)
            ->assertJsonPath('location.id', $location->id);

        $this->assertDatabaseHas('tenant_settings', [
            'tenant_id' => $org->id,
            'category'  => 'pos',
            'key_name'  => 'square_access_token',
        ]);
    }

    public function test_import_data_creates_daily_actual_records(): void
    {
        [$org, $user] = $this->createOrgAndUser();

        $location = Location::create([
            'tenant_id'          => $org->id,
            'code'               => 'TST',
            'name'               => 'Test Location',
            'square_location_id' => 'SQUARE_LOC_123',
            'pos_adapter'        => 'square',
            'status'             => 'active',
        ]);

        TenantSetting::create([
            'tenant_id' => $org->id,
            'category'  => 'pos',
            'key_name'  => 'square_access_token',
            'value'     => 'test-token-abc',
        ]);

        Http::fake([
            'connect.squareapis.com/v2/orders/search' => Http::response([
                'orders' => [
                    [
                        'id'          => 'order1',
                        'created_at'  => '2025-01-15T10:30:00Z',
                        'total_money' => ['amount' => 2500, 'currency' => 'USD'],
                    ],
                    [
                        'id'          => 'order2',
                        'created_at'  => '2025-01-16T14:00:00Z',
                        'total_money' => ['amount' => 1800, 'currency' => 'USD'],
                    ],
                ],
            ], 200),
            'connect.squareapis.com/v2/labor/shifts/search' => Http::response([
                'shifts' => [],
            ], 200),
            'connect.squareapis.com/v2/team-members/search' => Http::response([
                'team_members' => [
                    [
                        'id'            => 'emp_001',
                        'given_name'    => 'Jane',
                        'family_name'   => 'Doe',
                        'email_address' => 'jane@example.com',
                        'status'        => 'ACTIVE',
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($user)->postJson('/api/onboarding/import-data', [
            'location_id' => $location->id,
            'start_date'  => '2025-01-15',
            'end_date'    => '2025-01-16',
        ]);

        $response->assertOk()
            ->assertJsonPath('days_imported', 2)
            ->assertJsonPath('employees_imported', 1);

        $this->assertDatabaseHas('daily_actuals', [
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
        ]);

        $this->assertDatabaseHas('employees', [
            'tenant_id'          => $org->id,
            'square_employee_id' => 'emp_001',
        ]);

        $this->assertDatabaseHas('pos_syncs', [
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'status'      => 'completed',
        ]);
    }

    public function test_configure_rules_stores_tenant_settings(): void
    {
        [$org, $user] = $this->createOrgAndUser();

        $response = $this->actingAs($user)->postJson('/api/onboarding/configure-rules', [
            'pay_rates'       => ['default' => 15.00, 'lead' => 18.00],
            'operating_hours' => ['open' => '07:00', 'close' => '22:00'],
        ]);

        $response->assertOk()
            ->assertJsonStructure(['data' => ['pay_rates', 'operating_hours']]);

        $this->assertDatabaseHas('tenant_settings', [
            'tenant_id' => $org->id,
            'category'  => 'business_rules',
            'key_name'  => 'pay_rates',
        ]);

        $this->assertDatabaseHas('tenant_settings', [
            'tenant_id' => $org->id,
            'category'  => 'business_rules',
            'key_name'  => 'operating_hours',
        ]);
    }

    public function test_staff_cannot_connect_pos(): void
    {
        [$org, $user] = $this->createOrgAndUser('staff');

        $location = Location::create([
            'tenant_id' => $org->id,
            'code'      => 'TST',
            'name'      => 'Test Location',
            'status'    => 'active',
        ]);

        $response = $this->actingAs($user)->postJson('/api/onboarding/connect-pos', [
            'location_id'  => $location->id,
            'access_token' => 'test-token',
        ]);

        $response->assertForbidden();
    }
}
