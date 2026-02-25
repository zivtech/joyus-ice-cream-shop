<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationResource;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    /**
     * Display the current user's organization.
     */
    public function show(Request $request)
    {
        $organization = $request->user()->organization;

        return new OrganizationResource($organization);
    }

    /**
     * Update the organization's name, timezone, or settings.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('admin')) {
            abort(403, 'Only admins can update the organization.');
        }

        $validated = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'timezone' => ['sometimes', 'string', 'max:50'],
            'settings' => ['sometimes', 'nullable', 'array'],
        ]);

        $organization = $user->organization;
        $organization->update($validated);

        return new OrganizationResource($organization);
    }

    /**
     * Update the organization's role labels.
     */
    public function updateRoleLabels(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('admin')) {
            abort(403, 'Only admins can update role labels.');
        }

        $validated = $request->validate([
            'role_labels' => ['sometimes', 'nullable', 'array'],
        ]);

        $organization = $user->organization;
        $organization->update($validated);

        return new OrganizationResource($organization);
    }
}
