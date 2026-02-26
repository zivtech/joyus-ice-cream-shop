<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Subscription;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingApiTest extends TestCase
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

    public function test_billing_status_creates_default_trial_subscription(): void
    {
        [$org, $user] = $this->createOrgAndUser();

        $this->assertDatabaseMissing('subscriptions', ['tenant_id' => $org->id]);

        $response = $this->actingAs($user)->getJson('/api/billing/status');

        $response->assertOk()
            ->assertJsonPath('plan', 'starter')
            ->assertJsonPath('status', 'trialing')
            ->assertJsonPath('is_active', true)
            ->assertJsonPath('on_trial', true)
            ->assertJsonStructure(['plans']);

        $this->assertDatabaseHas('subscriptions', [
            'tenant_id' => $org->id,
            'plan'      => 'starter',
            'status'    => 'trialing',
        ]);
    }

    public function test_subscribe_updates_plan(): void
    {
        [$org, $user] = $this->createOrgAndUser();

        // First get status to create default subscription
        $this->actingAs($user)->getJson('/api/billing/status');

        $response = $this->actingAs($user)->postJson('/api/billing/subscribe', [
            'plan' => 'professional',
        ]);

        $response->assertOk()
            ->assertJsonPath('plan', 'professional')
            ->assertJsonPath('status', 'active')
            ->assertJsonPath('is_active', true);

        $this->assertDatabaseHas('subscriptions', [
            'tenant_id' => $org->id,
            'plan'      => 'professional',
            'status'    => 'active',
        ]);
    }

    public function test_cancel_sets_status_to_canceled(): void
    {
        [$org, $user] = $this->createOrgAndUser();

        // Create subscription first
        $this->actingAs($user)->getJson('/api/billing/status');

        $response = $this->actingAs($user)->postJson('/api/billing/cancel');

        $response->assertOk()
            ->assertJsonPath('status', 'canceled')
            ->assertJsonPath('is_active', false);

        $this->assertDatabaseHas('subscriptions', [
            'tenant_id' => $org->id,
            'status'    => 'canceled',
        ]);
    }

    public function test_non_admin_cannot_subscribe(): void
    {
        [$org, $user] = $this->createOrgAndUser('gm');

        $response = $this->actingAs($user)->postJson('/api/billing/subscribe', [
            'plan' => 'professional',
        ]);

        $response->assertForbidden();
    }

    public function test_non_admin_cannot_cancel(): void
    {
        [$org, $user] = $this->createOrgAndUser('gm');

        $response = $this->actingAs($user)->postJson('/api/billing/cancel');

        $response->assertForbidden();
    }
}
