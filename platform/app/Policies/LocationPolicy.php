<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\User;

class LocationPolicy
{
    /**
     * Tenant isolation: deny access if the user's organization doesn't match the location's tenant.
     */
    public function before(User $user, string $ability, mixed ...$args): ?bool
    {
        // For abilities that receive a Location model, enforce tenant isolation
        if (isset($args[0]) && $args[0] instanceof Location) {
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
    public function view(User $user, Location $location): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager', 'key_lead', 'staff']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'gm']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Location $location): bool
    {
        return $user->hasAnyRole(['admin', 'gm']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Location $location): bool
    {
        return $user->hasAnyRole(['admin', 'gm']);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Location $location): bool
    {
        return $user->hasAnyRole(['admin', 'gm']);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Location $location): bool
    {
        return $user->hasAnyRole(['admin', 'gm']);
    }
}
