<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Location::class);

        $locations = Location::where('tenant_id', $request->user()->organization_id)->get();

        return LocationResource::collection($locations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Location::class);

        $tenantId = $request->user()->organization_id;

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:20'],
            'name' => ['required', 'string', 'max:255'],
            'timezone' => ['sometimes', 'string', 'max:50'],
            'latitude' => ['sometimes', 'nullable', 'numeric'],
            'longitude' => ['sometimes', 'nullable', 'numeric'],
            'square_location_id' => ['sometimes', 'nullable', 'string', 'max:100'],
            'pos_adapter' => ['sometimes', 'string', 'max:50'],
            'status' => ['sometimes', 'string', 'in:active,inactive'],
        ]);

        // Validate code uniqueness within tenant
        $exists = Location::where('tenant_id', $tenantId)
            ->where('code', $validated['code'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'The code has already been taken for this organization.',
                'errors' => ['code' => ['The code has already been taken for this organization.']],
            ], 422);
        }

        $location = Location::create(array_merge($validated, [
            'tenant_id' => $tenantId,
        ]));

        return (new LocationResource($location))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $location = Location::findOrFail($id);

        $this->authorize('view', $location);

        return new LocationResource($location);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $location = Location::findOrFail($id);

        $this->authorize('update', $location);

        $validated = $request->validate([
            'code' => ['sometimes', 'string', 'max:20'],
            'name' => ['sometimes', 'string', 'max:255'],
            'timezone' => ['sometimes', 'string', 'max:50'],
            'latitude' => ['sometimes', 'nullable', 'numeric'],
            'longitude' => ['sometimes', 'nullable', 'numeric'],
            'square_location_id' => ['sometimes', 'nullable', 'string', 'max:100'],
            'pos_adapter' => ['sometimes', 'string', 'max:50'],
            'status' => ['sometimes', 'string', 'in:active,inactive'],
        ]);

        // If code is being changed, validate uniqueness within tenant
        if (isset($validated['code']) && $validated['code'] !== $location->code) {
            $exists = Location::where('tenant_id', $location->tenant_id)
                ->where('code', $validated['code'])
                ->where('id', '!=', $location->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'The code has already been taken for this organization.',
                    'errors' => ['code' => ['The code has already been taken for this organization.']],
                ], 422);
            }
        }

        $location->update($validated);

        return new LocationResource($location);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $location = Location::findOrFail($id);

        $this->authorize('delete', $location);

        $location->delete();

        return response()->noContent();
    }
}
