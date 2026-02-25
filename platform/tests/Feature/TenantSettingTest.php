<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\TenantSetting;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantSettingTest extends TestCase
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

    private function createSetting(int $tenantId, string $category = 'general', string $keyName = 'theme'): TenantSetting
    {
        return TenantSetting::create([
            'tenant_id' => $tenantId,
            'category'  => $category,
            'key_name'  => $keyName,
            'value'     => ['color' => 'blue'],
        ]);
    }

    public function test_admin_can_list_settings(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $this->createSetting($org->id, 'general', 'theme');
        $this->createSetting($org->id, 'notifications', 'email_enabled');

        $response = $this->actingAs($user)->getJson('/api/settings');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_category_filter_returns_matching_settings(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $this->createSetting($org->id, 'general', 'theme');
        $this->createSetting($org->id, 'notifications', 'email_enabled');

        $response = $this->actingAs($user)->getJson('/api/settings?category=general');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.category', 'general');
    }

    public function test_upsert_creates_new_setting(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');

        $response = $this->actingAs($user)->putJson('/api/settings', [
            'category' => 'general',
            'key_name' => 'theme',
            'value'    => ['color' => 'green'],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.category', 'general')
            ->assertJsonPath('data.key_name', 'theme');

        $this->assertDatabaseHas('tenant_settings', [
            'tenant_id' => $org->id,
            'category'  => 'general',
            'key_name'  => 'theme',
        ]);
    }

    public function test_upsert_updates_existing_setting(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $setting = $this->createSetting($org->id, 'general', 'theme');

        $response = $this->actingAs($user)->putJson('/api/settings', [
            'category' => 'general',
            'key_name' => 'theme',
            'value'    => ['color' => 'red'],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.id', $setting->id);

        $this->assertDatabaseHas('tenant_settings', [
            'id'       => $setting->id,
            'tenant_id' => $org->id,
        ]);

        $setting->refresh();
        $this->assertEquals('red', $setting->value['color']);
    }

    public function test_admin_can_delete_setting(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $setting = $this->createSetting($org->id);

        $response = $this->actingAs($user)->deleteJson("/api/settings/{$setting->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('tenant_settings', ['id' => $setting->id]);
    }

    public function test_non_admin_cannot_upsert_setting(): void
    {
        [$org, $user] = $this->createOrgAndUser('gm');

        $response = $this->actingAs($user)->putJson('/api/settings', [
            'category' => 'general',
            'key_name' => 'theme',
            'value'    => ['color' => 'blue'],
        ]);

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_delete_setting(): void
    {
        [$org, $user] = $this->createOrgAndUser('gm');
        $setting = $this->createSetting($org->id);

        $response = $this->actingAs($user)->deleteJson("/api/settings/{$setting->id}");

        $response->assertForbidden();
    }

    public function test_gm_can_view_settings(): void
    {
        [$org, $user] = $this->createOrgAndUser('gm');
        $this->createSetting($org->id);

        $response = $this->actingAs($user)->getJson('/api/settings');

        $response->assertOk();
    }
}
