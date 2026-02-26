<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyActual;
use App\Models\TenantSetting;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DailyActualController extends Controller
{
    /**
     * List daily actuals with filtering.
     */
    public function index(Request $request)
    {
        $request->validate([
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'start_date'  => ['sometimes', 'date'],
            'end_date'    => ['sometimes', 'date'],
            'month'       => ['sometimes', 'string', 'regex:/^\d{4}-\d{2}$/'],
        ]);

        $tenantId = $request->user()->organization_id;

        $query = DailyActual::where('tenant_id', $tenantId)
            ->where('location_id', $request->input('location_id'));

        if ($request->has('month')) {
            $monthStart = Carbon::parse($request->input('month') . '-01')->startOfMonth();
            $monthEnd = $monthStart->copy()->endOfMonth();
            $query->whereBetween('date', [$monthStart->toDateString(), $monthEnd->toDateString()]);
        } else {
            if ($request->has('start_date')) {
                $query->where('date', '>=', $request->input('start_date'));
            }
            if ($request->has('end_date')) {
                $query->where('date', '<=', $request->input('end_date'));
            }
        }

        return $query->orderByDesc('date')->paginate(50);
    }

    /**
     * Aggregated summary for dashboard.
     */
    public function summary(Request $request)
    {
        $request->validate([
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'start_date'  => ['sometimes', 'date'],
            'end_date'    => ['sometimes', 'date'],
            'month'       => ['sometimes', 'string', 'regex:/^\d{4}-\d{2}$/'],
        ]);

        $tenantId = $request->user()->organization_id;

        $query = DailyActual::where('tenant_id', $tenantId)
            ->where('location_id', $request->input('location_id'));

        if ($request->has('month')) {
            $monthStart = Carbon::parse($request->input('month') . '-01')->startOfMonth();
            $monthEnd = $monthStart->copy()->endOfMonth();
            $query->whereBetween('date', [$monthStart->toDateString(), $monthEnd->toDateString()]);
        } else {
            if ($request->has('start_date')) {
                $query->where('date', '>=', $request->input('start_date'));
            }
            if ($request->has('end_date')) {
                $query->where('date', '<=', $request->input('end_date'));
            }
        }

        $actuals = $query->get();
        $dayCount = $actuals->count();

        $totalRevenue = $actuals->sum('revenue');
        $totalLabor = $actuals->sum('store_labor');
        $totalDeliveryNet = $actuals->sum('delivery_net');

        $avgDailyRevenue = $dayCount > 0 ? round($totalRevenue / $dayCount, 2) : 0;
        $avgDailyLabor = $dayCount > 0 ? round($totalLabor / $dayCount, 2) : 0;
        $laborPct = $totalRevenue > 0 ? round(($totalLabor / $totalRevenue) * 100, 2) : 0;

        // Get gpMarginFactor from TenantSetting (default 0.72)
        $gpSetting = TenantSetting::where('tenant_id', $tenantId)
            ->where('key_name', 'gpMarginFactor')
            ->first();
        $gpMarginFactor = $gpSetting ? (float) ($gpSetting->value['value'] ?? 0.72) : 0.72;

        $gpEstimate = round($totalRevenue * $gpMarginFactor, 2);

        return response()->json([
            'data' => [
                'total_revenue'      => (float) round($totalRevenue, 2),
                'total_labor'        => (float) round($totalLabor, 2),
                'total_delivery_net' => (float) round($totalDeliveryNet, 2),
                'avg_daily_revenue'  => (float) $avgDailyRevenue,
                'avg_daily_labor'    => (float) $avgDailyLabor,
                'labor_pct'          => (float) $laborPct,
                'day_count'          => $dayCount,
                'gp_estimate'        => (float) $gpEstimate,
            ],
        ]);
    }
}
