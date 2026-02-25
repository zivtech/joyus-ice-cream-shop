<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeTest extends TestCase
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

    private function createLocation(int $tenantId): Location
    {
        return Location::create([
            'tenant_id' => $tenantId,
            'code'      => 'LOC-' . uniqid(),
            'name'      => 'Test Location',
            'status'    => 'active',
        ]);
    }

    private function createEmployee(int $tenantId, ?int $locationId = null): Employee
    {
        return Employee::create([
            'tenant_id'   => $tenantId,
            'location_id' => $locationId,
            'name'        => 'Test Employee',
            'pay_rate'    => 15.00,
            'status'      => 'active',
        ]);
    }

    public function test_admin_can_list_employees(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $this->createEmployee($org->id);
        $this->createEmployee($org->id);

        $response = $this->actingAs($user)->getJson('/api/employees');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_employee(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');

        $response = $this->actingAs($user)->postJson('/api/employees', [
            'name'     => 'Jane Staff',
            'pay_rate' => 18.50,
            'status'   => 'active',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Jane Staff');

        $this->assertDatabaseHas('employees', [
            'tenant_id' => $org->id,
            'name'      => 'Jane Staff',
        ]);
    }

    public function test_admin_can_show_employee(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $employee = $this->createEmployee($org->id);

        $response = $this->actingAs($user)->getJson("/api/employees/{$employee->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $employee->id);
    }

    public function test_admin_can_update_employee(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $employee = $this->createEmployee($org->id);

        $response = $this->actingAs($user)->patchJson("/api/employees/{$employee->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');
    }

    public function test_admin_can_delete_employee(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $employee = $this->createEmployee($org->id);

        $response = $this->actingAs($user)->deleteJson("/api/employees/{$employee->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('employees', ['id' => $employee->id]);
    }

    public function test_location_filter_returns_only_matching_employees(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $loc1 = $this->createLocation($org->id);
        $loc2 = $this->createLocation($org->id);
        $this->createEmployee($org->id, $loc1->id);
        $this->createEmployee($org->id, $loc2->id);

        $response = $this->actingAs($user)->getJson("/api/employees?location_id={$loc1->id}");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.location_id', $loc1->id);
    }

    public function test_tenant_isolation_prevents_cross_org_employee_access(): void
    {
        [$orgA, $userA] = $this->createOrgAndUser('admin', 'a');
        [$orgB, $userB] = $this->createOrgAndUser('admin', 'b');

        $employeeB = $this->createEmployee($orgB->id);

        $response = $this->actingAs($userA)->getJson("/api/employees/{$employeeB->id}");

        $response->assertForbidden();
    }

    public function test_tenant_isolation_index_only_returns_own_employees(): void
    {
        [$orgA, $userA] = $this->createOrgAndUser('admin', 'a');
        [$orgB, $userB] = $this->createOrgAndUser('admin', 'b');

        $this->createEmployee($orgA->id);
        $this->createEmployee($orgB->id);

        $response = $this->actingAs($userA)->getJson('/api/employees');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
