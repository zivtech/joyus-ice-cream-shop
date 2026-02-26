<?php

namespace Tests\Feature;

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

class ScheduleApiTest extends TestCase
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

    private function createDraftSchedule(int $tenantId, int $locationId): Schedule
    {
        $schedule = Schedule::create([
            'tenant_id'   => $tenantId,
            'location_id' => $locationId,
            'week_start'  => '2026-03-02', // a Monday
            'status'      => 'draft',
        ]);

        // Create 7 days
        for ($i = 0; $i < 7; $i++) {
            ScheduleDay::create([
                'schedule_id' => $schedule->id,
                'date'        => now()->parse('2026-03-02')->addDays($i)->toDateString(),
            ]);
        }

        return $schedule;
    }

    // --- Store ---

    public function test_create_draft_schedule(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $response = $this->actingAs($user)->postJson('/api/schedules', [
            'location_id' => $location->id,
            'week_start'  => '2026-03-02', // Monday
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.location_id', $location->id)
            ->assertJsonCount(7, 'data.days');

        $this->assertDatabaseHas('schedules', [
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'status'      => 'draft',
        ]);
    }

    public function test_week_start_must_be_a_monday(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $response = $this->actingAs($user)->postJson('/api/schedules', [
            'location_id' => $location->id,
            'week_start'  => '2026-03-03', // Tuesday
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.week_start.0', 'The week_start must be a Monday.');
    }

    public function test_no_duplicate_schedule_for_same_location_and_week(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        // Create first schedule
        $this->actingAs($user)->postJson('/api/schedules', [
            'location_id' => $location->id,
            'week_start'  => '2026-03-02',
        ]);

        // Try duplicate
        $response = $this->actingAs($user)->postJson('/api/schedules', [
            'location_id' => $location->id,
            'week_start'  => '2026-03-02',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.week_start.0', 'A schedule already exists for this location and week.');
    }

    // --- Show ---

    public function test_show_schedule_with_nested_data(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);
        $schedule = $this->createDraftSchedule($org->id, $location->id);
        $day = $schedule->days()->first();

        $slot = ScheduleSlot::create([
            'schedule_day_id' => $day->id,
            'start_time'      => '09:00',
            'end_time'        => '17:00',
            'role'            => 'scooper',
            'headcount'       => 2,
        ]);

        $employee = $this->createEmployee($org->id, $location->id);
        ShiftAssignment::create([
            'schedule_slot_id' => $slot->id,
            'employee_id'      => $employee->id,
            'position_index'   => 0,
        ]);

        $response = $this->actingAs($user)->getJson("/api/schedules/{$schedule->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $schedule->id)
            ->assertJsonPath('data.location.id', $location->id)
            ->assertJsonCount(7, 'data.days');

        // Verify nested slot and assignment data
        $dayData = collect($response->json('data.days'))->first();
        $this->assertNotEmpty($dayData['slots']);
        $this->assertNotEmpty($dayData['slots'][0]['assignments']);
    }

    // --- Index ---

    public function test_list_schedules_with_location_filter(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $loc1 = $this->createLocation($org->id, 'L1');
        $loc2 = $this->createLocation($org->id, 'L2');

        $this->createDraftSchedule($org->id, $loc1->id);

        Schedule::create([
            'tenant_id'   => $org->id,
            'location_id' => $loc2->id,
            'week_start'  => '2026-03-09',
            'status'      => 'draft',
        ]);

        $response = $this->actingAs($user)->getJson("/api/schedules?location_id={$loc1->id}");

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_list_schedules_with_status_filter(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $this->createDraftSchedule($org->id, $location->id);

        Schedule::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'week_start'  => '2026-03-09',
            'status'      => 'pending',
        ]);

        $response = $this->actingAs($user)->getJson('/api/schedules?status=draft');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    // --- Slots ---

    public function test_add_slot_to_draft_schedule(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);
        $schedule = $this->createDraftSchedule($org->id, $location->id);
        $day = $schedule->days()->first();

        $response = $this->actingAs($user)->postJson('/api/schedule-slots', [
            'schedule_day_id' => $day->id,
            'start_time'      => '09:00',
            'end_time'        => '17:00',
            'role'            => 'scooper',
            'headcount'       => 2,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.role', 'scooper')
            ->assertJsonPath('data.headcount', 2);
    }

    public function test_cannot_add_slot_to_non_draft_schedule(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $schedule = Schedule::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'week_start'  => '2026-03-02',
            'status'      => 'pending',
        ]);

        $day = ScheduleDay::create([
            'schedule_id' => $schedule->id,
            'date'        => '2026-03-02',
        ]);

        $response = $this->actingAs($user)->postJson('/api/schedule-slots', [
            'schedule_day_id' => $day->id,
            'start_time'      => '09:00',
            'end_time'        => '17:00',
            'role'            => 'scooper',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Slots can only be added to draft schedules.');
    }

    // --- Assignments ---

    public function test_assign_employee_to_slot(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);
        $schedule = $this->createDraftSchedule($org->id, $location->id);
        $day = $schedule->days()->first();
        $employee = $this->createEmployee($org->id, $location->id);

        $slot = ScheduleSlot::create([
            'schedule_day_id' => $day->id,
            'start_time'      => '09:00',
            'end_time'        => '17:00',
            'role'            => 'scooper',
        ]);

        $response = $this->actingAs($user)->postJson('/api/shift-assignments', [
            'schedule_slot_id' => $slot->id,
            'employee_id'      => $employee->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.employee_id', $employee->id)
            ->assertJsonPath('data.position_index', 0);
    }

    // --- Submit ---

    public function test_submit_schedule_draft_to_pending(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);
        $schedule = $this->createDraftSchedule($org->id, $location->id);

        $response = $this->actingAs($user)->postJson("/api/schedules/{$schedule->id}/submit");

        $response->assertOk()
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('schedules', [
            'id'     => $schedule->id,
            'status' => 'pending',
        ]);

        $this->assertNotNull($schedule->fresh()->submitted_at);
    }

    public function test_cannot_submit_non_draft_schedule(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $schedule = Schedule::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'week_start'  => '2026-03-02',
            'status'      => 'pending',
        ]);

        $response = $this->actingAs($user)->postJson("/api/schedules/{$schedule->id}/submit");

        // Policy denies because status is not 'draft'
        $response->assertForbidden();
    }

    // --- Approve ---

    public function test_approve_schedule_pending_to_approved(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $schedule = Schedule::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'week_start'  => '2026-03-02',
            'status'      => 'pending',
        ]);

        $response = $this->actingAs($user)->postJson("/api/schedules/{$schedule->id}/approve");

        $response->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $fresh = $schedule->fresh();
        $this->assertNotNull($fresh->reviewed_at);
        $this->assertEquals($user->id, $fresh->reviewer_id);
    }

    // --- Reject ---

    public function test_reject_schedule_with_notes(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $schedule = Schedule::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'week_start'  => '2026-03-02',
            'status'      => 'pending',
        ]);

        $response = $this->actingAs($user)->postJson("/api/schedules/{$schedule->id}/reject", [
            'notes' => 'Need more coverage on Saturday.',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.notes', 'Need more coverage on Saturday.');

        $fresh = $schedule->fresh();
        $this->assertNotNull($fresh->reviewed_at);
        $this->assertEquals($user->id, $fresh->reviewer_id);
    }

    // --- Publish ---

    public function test_publish_schedule_approved_to_published(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $schedule = Schedule::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'week_start'  => '2026-03-02',
            'status'      => 'approved',
        ]);

        $response = $this->actingAs($user)->postJson("/api/schedules/{$schedule->id}/publish");

        $response->assertOk()
            ->assertJsonPath('data.status', 'published');

        $this->assertNotNull($schedule->fresh()->published_at);
    }

    public function test_cannot_approve_non_pending_schedule(): void
    {
        [$org, $user] = $this->createOrgAndUser('admin');
        $location = $this->createLocation($org->id);

        $schedule = Schedule::create([
            'tenant_id'   => $org->id,
            'location_id' => $location->id,
            'week_start'  => '2026-03-02',
            'status'      => 'draft',
        ]);

        $response = $this->actingAs($user)->postJson("/api/schedules/{$schedule->id}/approve");

        // Policy denies because status is not 'pending'
        $response->assertForbidden();
    }

    // --- Role checks ---

    public function test_staff_cannot_create_schedule(): void
    {
        [$org, $user] = $this->createOrgAndUser('staff');
        $location = $this->createLocation($org->id);

        $response = $this->actingAs($user)->postJson('/api/schedules', [
            'location_id' => $location->id,
            'week_start'  => '2026-03-02',
        ]);

        $response->assertForbidden();
    }

    public function test_staff_can_view_schedules(): void
    {
        [$org, $user] = $this->createOrgAndUser('staff');
        $location = $this->createLocation($org->id);
        $this->createDraftSchedule($org->id, $location->id);

        $response = $this->actingAs($user)->getJson('/api/schedules');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
