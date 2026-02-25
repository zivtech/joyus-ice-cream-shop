<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Organization;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocationTest extends TestCase
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

    public function test_admin_can_list_locations(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $this->createLocation($org->id, 'L1');
        $this->createLocation($org->id, 'L2');

        $response = $this->actingAs($user)->getJson('/api/locations');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_location(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');

        $response = $this->actingAs($user)->postJson('/api/locations', [
            'code'   => 'MAIN',
            'name'   => 'Main Street',
            'status' => 'active',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.code', 'MAIN')
            ->assertJsonPath('data.name', 'Main Street');

        $this->assertDatabaseHas('locations', [
            'tenant_id' => $org->id,
            'code'      => 'MAIN',
        ]);
    }

    public function test_admin_can_show_location(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $response = $this->actingAs($user)->getJson("/api/locations/{$location->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $location->id);
    }

    public function test_admin_can_update_location(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $response = $this->actingAs($user)->patchJson("/api/locations/{$location->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');
    }

    public function test_admin_can_delete_location(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $response = $this->actingAs($user)->deleteJson("/api/locations/{$location->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('locations', ['id' => $location->id]);
    }

    public function test_tenant_isolation_prevents_cross_org_access(): void
    {
        [$orgA, $userA] = $this->createOrgAndUser('admin', 'a');
        [$orgB, $userB] = $this->createOrgAndUser('admin', 'b');

        $locationB = $this->createLocation($orgB->id, 'LOCB');

        // User A cannot view org B's location
        $response = $this->actingAs($userA)->getJson("/api/locations/{$locationB->id}");

        $response->assertForbidden();
    }

    public function test_tenant_isolation_index_only_returns_own_locations(): void
    {
        [$orgA, $userA] = $this->createOrgAndUser('admin', 'a');
        [$orgB, $userB] = $this->createOrgAndUser('admin', 'b');

        $this->createLocation($orgA->id, 'LOCA');
        $this->createLocation($orgB->id, 'LOCB');

        $response = $this->actingAs($userA)->getJson('/api/locations');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.code', 'LOCA');
    }

    public function test_staff_cannot_create_location(): void
    {
        [$org, $user] = $this->createOrgAndUser('staff');

        $response = $this->actingAs($user)->postJson('/api/locations', [
            'code'   => 'STAFF',
            'name'   => 'Staff Location',
            'status' => 'active',
        ]);

        $response->assertForbidden();
    }
}
