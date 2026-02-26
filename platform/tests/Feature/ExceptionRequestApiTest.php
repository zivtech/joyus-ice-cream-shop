<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Organization;
use App\Models\PolicyExceptionRequest;
use App\Models\Schedule;
use App\Models\ScheduleDay;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExceptionRequestApiTest extends TestCase
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

    private function createScheduleDay(int $tenantId, int $locationId): ScheduleDay
    {
        $schedule = Schedule::create([
            'tenant_id'   => $tenantId,
            'location_id' => $locationId,
            'week_start'  => '2026-03-02',
            'status'      => 'draft',
        ]);

        return ScheduleDay::create([
            'schedule_id' => $schedule->id,
            'date'        => '2026-03-02',
        ]);
    }

    public function test_create_exception_request(): void
    {
        [$org, $user] = $this->createOrgAndUser('store_manager');
        $location = $this->createLocation($org->id);
        $day = $this->createScheduleDay($org->id, $location->id);

        $response = $this->actingAs($user)->postJson('/api/exception-requests', [
            'schedule_day_id' => $day->id,
            'reason'          => 'Short staffed, need to override minimum coverage.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.requester_id', $user->id)
            ->assertJsonPath('data.reason', 'Short staffed, need to override minimum coverage.');
    }

    public function test_approve_exception_request(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);
        $day = $this->createScheduleDay($org->id, $location->id);

        $exceptionRequest = PolicyExceptionRequest::create([
            'tenant_id'       => $org->id,
            'schedule_day_id' => $day->id,
            'requester_id'    => $user->id,
            'reason'          => 'Short staffed.',
            'status'          => 'pending',
        ]);

        $response = $this->actingAs($user)->postJson("/api/exception-requests/{$exceptionRequest->id}/approve");

        $response->assertOk()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.reviewer_id', $user->id);

        $this->assertNotNull($exceptionRequest->fresh()->reviewed_at);
    }

    public function test_reject_exception_request(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);
        $day = $this->createScheduleDay($org->id, $location->id);

        $exceptionRequest = PolicyExceptionRequest::create([
            'tenant_id'       => $org->id,
            'schedule_day_id' => $day->id,
            'requester_id'    => $user->id,
            'reason'          => 'Short staffed.',
            'status'          => 'pending',
        ]);

        $response = $this->actingAs($user)->postJson("/api/exception-requests/{$exceptionRequest->id}/reject", [
            'notes' => 'Cannot override this policy.',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.reviewer_id', $user->id);

        $this->assertNotNull($exceptionRequest->fresh()->reviewed_at);
    }

    public function test_staff_cannot_approve(): void
    {
        [$org, $admin] = $this->createOrgAndUser('admin', 'adm');
        [$org2, $staff] = $this->createOrgAndUser('staff', 'stf');

        // Make staff part of same org
        $staff->organization_id = $org->id;
        $staff->save();

        $location = $this->createLocation($org->id);
        $day = $this->createScheduleDay($org->id, $location->id);

        $exceptionRequest = PolicyExceptionRequest::create([
            'tenant_id'       => $org->id,
            'schedule_day_id' => $day->id,
            'requester_id'    => $admin->id,
            'reason'          => 'Short staffed.',
            'status'          => 'pending',
        ]);

        $response = $this->actingAs($staff)->postJson("/api/exception-requests/{$exceptionRequest->id}/approve");

        $response->assertForbidden();
    }
}
