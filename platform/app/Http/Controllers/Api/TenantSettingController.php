<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TenantSettingResource;
use App\Models\TenantSetting;
use Illuminate\Http\Request;

class TenantSettingController extends Controller
{
    /**
     * Display a listing of the tenant's settings, optionally filtered by category.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', TenantSetting::class);

        $query = TenantSetting::where('tenant_id', $request->user()->organization_id);

        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        return TenantSettingResource::collection($query->get());
    }

    /**
     * Display the specified setting.
     */
    public function show(Request $request, string $id)
    {
        $setting = TenantSetting::findOrFail($id);

        $this->authorize('view', $setting);

        return new TenantSettingResource($setting);
    }

    /**
     * Create or update a setting by category + key_name.
     */
    public function upsert(Request $request)
    {
        $this->authorize('create', TenantSetting::class);

        $validated = $request->validate([
            'category' => ['required', 'string', 'max:100'],
            'key_name' => ['required', 'string', 'max:100'],
            'value'    => ['required'],
        ]);

        $tenantId = $request->user()->organization_id;

        $setting = TenantSetting::updateOrCreate(
            [
                'tenant_id' => $tenantId,
                'category'  => $validated['category'],
                'key_name'  => $validated['key_name'],
            ],
            [
                'value' => $validated['value'],
            ]
        );

        $statusCode = $setting->wasRecentlyCreated ? 201 : 200;

        return (new TenantSettingResource($setting))
            ->response()
            ->setStatusCode($statusCode);
    }

    /**
     * Remove the specified setting.
     */
    public function destroy(Request $request, string $id)
    {
        $setting = TenantSetting::findOrFail($id);

        $this->authorize('delete', $setting);

        $setting->delete();

        return response()->noContent();
    }
}
