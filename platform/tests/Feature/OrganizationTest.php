<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationTest extends TestCase
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
            'email'           => 'user@example.com',
            'password'        => bcrypt('password'),
            'organization_id' => $org->id,
        ]);
        $user->assignRole($role);

        return [$org, $user];
    }

    public function test_admin_can_view_organization(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');

        $response = $this->actingAs($user)->getJson('/api/organization');

        $response->assertOk()
            ->assertJsonPath('data.id', $org->id)
            ->assertJsonPath('data.name', 'Test Org')
            ->assertJsonPath('data.slug', 'test-org');
    }

    public function test_non_admin_can_view_organization(): void
    {
        [$org, $user] = $this->createOrgAndUser('gm');

        $response = $this->actingAs($user)->getJson('/api/organization');

        $response->assertOk()
            ->assertJsonPath('data.id', $org->id);
    }

    public function test_admin_can_update_organization(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');

        $response = $this->actingAs($user)->patchJson('/api/organization', [
            'name'     => 'Updated Org Name',
            'timezone' => 'America/New_York',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Org Name')
            ->assertJsonPath('data.timezone', 'America/New_York');

        $this->assertDatabaseHas('organizations', [
            'id'       => $org->id,
            'name'     => 'Updated Org Name',
            'timezone' => 'America/New_York',
        ]);
    }

    public function test_non_admin_cannot_update_organization(): void
    {
        [$org, $user] = $this->createOrgAndUser('gm');

        $response = $this->actingAs($user)->patchJson('/api/organization', [
            'name' => 'Hacked Name',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_update_role_labels(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');

        $response = $this->actingAs($user)->patchJson('/api/organization/role-labels', [
            'role_labels' => ['admin' => 'Owner', 'gm' => 'General Manager'],
        ]);

        $response->assertOk();

        $org->refresh();
        $this->assertEquals('Owner', $org->roleLabelFor('admin'));
        $this->assertEquals('General Manager', $org->roleLabelFor('gm'));
    }

    public function test_non_admin_cannot_update_role_labels(): void
    {
        [$org, $user] = $this->createOrgAndUser('store_manager');

        $response = $this->actingAs($user)->patchJson('/api/organization/role-labels', [
            'role_labels' => ['admin' => 'Boss'],
        ]);

        $response->assertForbidden();
    }
}
