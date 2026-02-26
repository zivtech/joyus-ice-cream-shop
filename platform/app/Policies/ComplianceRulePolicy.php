<?php

namespace App\Policies;

use App\Models\ComplianceRule;
use App\Models\User;

class ComplianceRulePolicy
{
    /**
     * Tenant isolation: deny access if the user's organization doesn't match the rule's tenant.
     */
    public function before(User $user, string $ability, mixed ...$args): ?bool
    {
        if (isset($args[0]) && $args[0] instanceof ComplianceRule) {
            if ($user->organization_id !== $args[0]->tenant_id) {
                return false;
            }
        }

        return null;
    }

    /**
     * Any authenticated user can view compliance rules.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager', 'key_lead', 'staff']);
    }

    /**
     * Any authenticated user can view a compliance rule.
     */
    public function view(User $user, ComplianceRule $complianceRule): bool
    {
        return $user->hasAnyRole(['admin', 'gm', 'store_manager', 'key_lead', 'staff']);
    }

    /**
     * Only admin and gm can create compliance rules.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'gm']);
    }

    /**
     * Only admin and gm can update compliance rules.
     */
    public function update(User $user, ComplianceRule $complianceRule): bool
    {
        return $user->hasAnyRole(['admin', 'gm']);
    }

    /**
     * Only admin can delete compliance rules.
     */
    public function delete(User $user, ComplianceRule $complianceRule): bool
    {
        return $user->hasRole('admin');
    }
}
