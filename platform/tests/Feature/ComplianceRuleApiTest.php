<?php

namespace Tests\Feature;

use App\Models\ComplianceRule;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Organization;
use App\Models\Schedule;
use App\Models\ScheduleDay;
use App\Models\ScheduleSlot;
use App\Models\ShiftAssignment;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ComplianceRuleApiTest extends TestCase
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

    public function test_create_compliance_rule(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');

        $response = $this->actingAs($user)->postJson('/api/compliance-rules', [
            'jurisdiction'         => 'Pennsylvania',
            'certification_type'   => 'ServSafe Food Protection Manager',
            'coverage_requirement' => 'every_shift',
            'constraint_type'      => 'hard',
            'minimum_certified_count' => 1,
            'expiration_months'    => 60,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.jurisdiction', 'Pennsylvania')
            ->assertJsonPath('data.certification_type', 'ServSafe Food Protection Manager')
            ->assertJsonPath('data.coverage_requirement', 'every_shift');

        $this->assertDatabaseHas('compliance_rules', [
            'tenant_id'    => $org->id,
            'jurisdiction' => 'Pennsylvania',
        ]);
    }

    public function test_list_compliance_rules_with_jurisdiction_filter(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');

        ComplianceRule::create([
            'tenant_id'            => $org->id,
            'jurisdiction'         => 'Pennsylvania',
            'certification_type'   => 'ServSafe Food Protection Manager',
            'coverage_requirement' => 'every_shift',
        ]);

        ComplianceRule::create([
            'tenant_id'            => $org->id,
            'jurisdiction'         => 'New Jersey',
            'certification_type'   => 'NJ Food Handler Certificate',
            'coverage_requirement' => 'every_shift',
        ]);

        $response = $this->actingAs($user)->getJson('/api/compliance-rules?jurisdiction=Pennsylvania');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_load_presets(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');

        $response = $this->actingAs($user)->getJson('/api/compliance-rules/presets');

        $response->assertOk()
            ->assertJsonStructure([
                'Pennsylvania',
                'New Jersey',
                'New York',
            ]);

        $this->assertEquals(
            'ServSafe Food Protection Manager',
            $response->json('Pennsylvania.0.certification_type')
        );
    }

    public function test_validate_schedule_compliance_passing(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        // Create a compliance rule
        ComplianceRule::create([
            'tenant_id'               => $org->id,
            'jurisdiction'            => 'Pennsylvania',
            'certification_type'      => 'ServSafe Food Protection Manager',
            'coverage_requirement'    => 'every_shift',
            'constraint_type'         => 'hard',
            'minimum_certified_count' => 1,
        ]);

        // Create a schedule with an employee that has a valid certification
        $schedule = Schedule::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'week_start'  => '2026-03-02',
            'status'      => 'draft',
        ]);

        $day = ScheduleDay::create([
            'schedule_id' => $schedule->id,
            'date'        => '2026-03-02',
        ]);

        $slot = ScheduleSlot::create([
            'schedule_day_id' => $day->id,
            'start_time'      => '09:00',
            'end_time'        => '17:00',
            'role'            => 'scooper',
            'headcount'       => 1,
        ]);

        $employee = Employee::create([
            'tenant_id'           => $org->id,
            'location_id'         => $location->id,
            'name'                => 'Certified Employee',
            'pay_rate'            => 15.00,
            'status'              => 'active',
            'certifications'      => ['ServSafe Food Protection Manager'],
            'certification_expiry' => ['2028-01-01'],
        ]);

        ShiftAssignment::create([
            'schedule_slot_id' => $slot->id,
            'employee_id'      => $employee->id,
            'position_index'   => 0,
        ]);

        $response = $this->actingAs($user)->postJson('/api/compliance-rules/validate', [
            'schedule_id' => $schedule->id,
        ]);

        $response->assertOk()
            ->assertJsonPath('compliant', true)
            ->assertJsonCount(0, 'violations');
    }

    public function test_validate_schedule_compliance_violation(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        // Create a compliance rule
        ComplianceRule::create([
            'tenant_id'               => $org->id,
            'jurisdiction'            => 'Pennsylvania',
            'certification_type'      => 'ServSafe Food Protection Manager',
            'coverage_requirement'    => 'every_shift',
            'constraint_type'         => 'hard',
            'minimum_certified_count' => 1,
        ]);

        // Create schedule with uncertified employee
        $schedule = Schedule::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'week_start'  => '2026-03-02',
            'status'      => 'draft',
        ]);

        $day = ScheduleDay::create([
            'schedule_id' => $schedule->id,
            'date'        => '2026-03-02',
        ]);

        $slot = ScheduleSlot::create([
            'schedule_day_id' => $day->id,
            'start_time'      => '09:00',
            'end_time'        => '17:00',
            'role'            => 'scooper',
            'headcount'       => 1,
        ]);

        $employee = Employee::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'name'        => 'Uncertified Employee',
            'pay_rate'    => 15.00,
            'status'      => 'active',
            'certifications' => [],
        ]);

        ShiftAssignment::create([
            'schedule_slot_id' => $slot->id,
            'employee_id'      => $employee->id,
            'position_index'   => 0,
        ]);

        $response = $this->actingAs($user)->postJson('/api/compliance-rules/validate', [
            'schedule_id' => $schedule->id,
        ]);

        $response->assertOk()
            ->assertJsonPath('compliant', false);

        $violations = $response->json('violations');
        $this->assertNotEmpty($violations);
        $this->assertEquals('ServSafe Food Protection Manager', $violations[0]['rule']);
        $this->assertEquals(1, $violations[0]['required']);
        $this->assertEquals(0, $violations[0]['found']);
    }

    public function test_non_admin_cannot_delete_rule(): void
    {
        [$org, $user] = $this->createOrgAndUser('store_manager');

        $rule = ComplianceRule::create([
            'tenant_id'            => $org->id,
            'jurisdiction'         => 'Pennsylvania',
            'certification_type'   => 'ServSafe Food Protection Manager',
            'coverage_requirement' => 'every_shift',
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/compliance-rules/{$rule->id}");

        $response->assertForbidden();
    }
}
