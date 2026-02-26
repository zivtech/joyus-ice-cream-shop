<?php

namespace App\Policies;

use App\Models\Schedule;
use App\Models\User;

class SchedulePolicy
{
    /**
     * Tenant isolation: deny access if the user's organization doesn't match the schedule's tenant.
     */
    public function before(User $user, string $ability, mixed ...$args): ?bool
    {
        if (isset($args[0]) && $args[0] instanceof Schedule) {
            if ($user->organization_id !== $args[0]->tenant_id) {
                return false;
            }
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager', 'key_lead', 'staff']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Schedule $schedule): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager', 'key_lead', 'staff']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Schedule $schedule): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Schedule $schedule): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager']);
    }

    /**
     * Determine whether the user can submit the schedule for approval.
     */
    public function submit(User $user, Schedule $schedule): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager'])
            && $schedule->status === 'draft';
    }

    /**
     * Determine whether the user can approve the schedule.
     */
    public function approve(User $user, Schedule $schedule): bool
    {
        return $user->hasAnyRole(['admin', 'gm'])
            && $schedule->status === 'pending';
    }

    /**
     * Determine whether the user can reject the schedule.
     */
    public function reject(User $user, Schedule $schedule): bool
    {
        return $user->hasAnyRole(['admin', 'gm'])
            && $schedule->status === 'pending';
    }

    /**
     * Determine whether the user can publish the schedule.
     */
    public function publish(User $user, Schedule $schedule): bool
    {
        return $user->hasAnyRole(['admin', 'gm'])
            && $schedule->status === 'approved';
    }
}
