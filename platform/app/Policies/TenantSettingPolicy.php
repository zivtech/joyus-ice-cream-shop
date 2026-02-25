<?php

namespace App\Policies;

use App\Models\TenantSetting;
use App\Models\User;

class TenantSettingPolicy
{
    /**
     * Tenant isolation: deny access if the user's organization doesn't match the setting's tenant.
     */
    public function before(User $user, string $ability, mixed ...$args): ?bool
    {
        if (isset($args[0]) && $args[0] instanceof TenantSetting) {
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
        return $user->hasAnyRole(['admin', 'gm', 'store_manager']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TenantSetting $tenantSetting): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TenantSetting $tenantSetting): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TenantSetting $tenantSetting): bool
    {
        return $user->hasRole('admin');
    }
}
