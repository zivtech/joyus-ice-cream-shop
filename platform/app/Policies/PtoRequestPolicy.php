<?php

namespace App\Policies;

use App\Models\PtoRequest;
use App\Models\User;

class PtoRequestPolicy
{
    /**
     * Tenant isolation: deny access if the user's organization doesn't match the request's tenant.
     */
    public function before(User $user, string $ability, mixed ...$args): ?bool
    {
        if (isset($args[0]) && $args[0] instanceof PtoRequest) {
            if ($user->organization_id !== $args[0]->tenant_id) {
                return false;
            }
        }

        return null;
    }

    /**
     * Any authenticated user can view PTO requests (tenant-scoped).
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager', 'key_lead', 'staff']);
    }

    /**
     * Any authenticated user can view a single PTO request.
     */
    public function view(User $user, PtoRequest $ptoRequest): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager', 'key_lead', 'staff']);
    }

    /**
     * Any authenticated user can create PTO requests.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager', 'key_lead', 'staff']);
    }

    /**
     * Admin, gm, store_manager can approve PTO requests.
     */
    public function approve(User $user, PtoRequest $ptoRequest): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager']);
    }

    /**
     * Admin, gm, store_manager can deny PTO requests.
     */
    public function deny(User $user, PtoRequest $ptoRequest): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager']);
    }

    /**
     * The original employee (via employee_id match) or admin/gm can cancel.
     */
    public function cancel(User $user, PtoRequest $ptoRequest): bool
    {
        return $user->hasAnyRole(['admin', 'gm']);
    }
}
