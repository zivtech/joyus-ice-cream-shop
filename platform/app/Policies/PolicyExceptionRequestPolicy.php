<?php

namespace App\Policies;

use App\Models\PolicyExceptionRequest;
use App\Models\User;

class PolicyExceptionRequestPolicy
{
    /**
     * Tenant isolation: deny access if the user's organization doesn't match the request's tenant.
     */
    public function before(User $user, string $ability, mixed ...$args): ?bool
    {
        if (isset($args[0]) && $args[0] instanceof PolicyExceptionRequest) {
            if ($user->organization_id !== $args[0]->tenant_id) {
                return false;
            }
        }

        return null;
    }

    /**
     * Admin, gm, store_manager can view exception requests.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager']);
    }

    /**
     * Admin, gm, store_manager can view a single exception request.
     */
    public function view(User $user, PolicyExceptionRequest $request): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager']);
    }

    /**
     * Admin, gm, store_manager can create exception requests.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager']);
    }

    /**
     * Only admin and gm can approve exception requests.
     */
    public function approve(User $user, PolicyExceptionRequest $request): bool
    {
        return $user->hasAnyRole(['admin', 'gm']);
    }

    /**
     * Only admin and gm can reject exception requests.
     */
    public function reject(User $user, PolicyExceptionRequest $request): bool
    {
        return $user->hasAnyRole(['admin', 'gm']);
    }
}
