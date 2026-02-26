<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Location;
use App\Models\Organization;
use App\Models\PtoRequest;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PtoRequestApiTest extends TestCase
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

    private function createEmployee(int $tenantId, int $locationId): Employee
    {
        return Employee::create([
            'tenant_id'   => $tenantId,
            'location_id' => $locationId,
            'name'        => 'Test Employee',
            'pay_rate'    => 15.00,
            'status'      => 'active',
        ]);
    }

    public function test_create_pto_request(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);
        $employee = $this->createEmployee($org->id, $location->id);

        $response = $this->actingAs($user)->postJson('/api/pto-requests', [
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'start_date'  => '2026-03-15',
            'end_date'    => '2026-03-17',
            'reason'      => 'Family vacation',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.employee_id', $employee->id)
            ->assertJsonPath('data.reason', 'Family vacation');
    }

    public function test_approve_pto_request(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);
        $employee = $this->createEmployee($org->id, $location->id);

        $ptoRequest = PtoRequest::create([
            'tenant_id'   => $org->id,
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'start_date'  => '2026-03-15',
            'end_date'    => '2026-03-17',
            'status'      => 'pending',
        ]);

        $response = $this->actingAs($user)->postJson("/api/pto-requests/{$ptoRequest->id}/approve");

        $response->assertOk()
            ->assertJsonPath('data.status', 'approved');
    }

    public function test_deny_pto_request(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);
        $employee = $this->createEmployee($org->id, $location->id);

        $ptoRequest = PtoRequest::create([
            'tenant_id'   => $org->id,
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'start_date'  => '2026-03-15',
            'end_date'    => '2026-03-17',
            'status'      => 'pending',
        ]);

        $response = $this->actingAs($user)->postJson("/api/pto-requests/{$ptoRequest->id}/deny");

        $response->assertOk()
            ->assertJsonPath('data.status', 'denied');
    }

    public function test_cancel_pto_request(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);
        $employee = $this->createEmployee($org->id, $location->id);

        $ptoRequest = PtoRequest::create([
            'tenant_id'   => $org->id,
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'start_date'  => '2026-03-15',
            'end_date'    => '2026-03-17',
            'status'      => 'pending',
        ]);

        $response = $this->actingAs($user)->postJson("/api/pto-requests/{$ptoRequest->id}/cancel");

        $response->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_list_pto_requests_with_status_filter(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);
        $employee = $this->createEmployee($org->id, $location->id);

        PtoRequest::create([
            'tenant_id'   => $org->id,
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'start_date'  => '2026-03-15',
            'end_date'    => '2026-03-17',
            'status'      => 'pending',
        ]);

        PtoRequest::create([
            'tenant_id'   => $org->id,
            'employee_id' => $employee->id,
            'location_id' => $location->id,
            'start_date'  => '2026-04-01',
            'end_date'    => '2026-04-03',
            'status'      => 'approved',
        ]);

        $response = $this->actingAs($user)->getJson('/api/pto-requests?status=pending');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
