<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyActual;
use App\Models\Location;
use App\Models\Schedule;
use App\Models\TenantSetting;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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
     * Aggregated summary for dashboard (cached for 5 minutes).
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
        $locationId = $request->input('location_id');
        $startDate = $request->input('start_date', '');
        $endDate = $request->input('end_date', '');
        $month = $request->input('month', '');

        $cacheKey = "daily_actual_summary_{$tenantId}_{$locationId}_{$startDate}_{$endDate}_{$month}";

        return Cache::remember($cacheKey, 300, function () use ($request, $tenantId, $locationId, $month, $startDate, $endDate) {
            $query = DailyActual::where('tenant_id', $tenantId)
                ->where('location_id', $locationId);

            if ($month) {
                $monthStart = Carbon::parse($month . '-01')->startOfMonth();
                $monthEnd = $monthStart->copy()->endOfMonth();
                $query->whereBetween('date', [$monthStart->toDateString(), $monthEnd->toDateString()]);
            } else {
                if ($startDate) {
                    $query->where('date', '>=', $startDate);
                }
                if ($endDate) {
                    $query->where('date', '<=', $endDate);
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
        });
    }

    /**
     * Variance: compare scheduled labor vs actual labor per day.
     */
    public function variance(Request $request)
    {
        $request->validate([
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'start_date'  => ['required', 'date'],
            'end_date'    => ['required', 'date'],
        ]);

        $tenantId = $request->user()->organization_id;
        $locationId = $request->input('location_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Get actuals for the date range
        $actuals = DailyActual::where('tenant_id', $tenantId)
            ->where('location_id', $locationId)
            ->whereDate('date', '>=', $startDate)
            ->whereDate('date', '<=', $endDate)
            ->get()
            ->keyBy(fn ($a) => $a->date->toDateString());

        // Get schedules that overlap with the date range
        $schedules = Schedule::where('tenant_id', $tenantId)
            ->where('location_id', $locationId)
            ->with(['days.slots'])
            ->get();

        // Get pay rate settings
        $payRateSetting = TenantSetting::where('tenant_id', $tenantId)
            ->where('key_name', 'defaultPayRate')
            ->first();
        $defaultPayRate = $payRateSetting ? (float) ($payRateSetting->value['value'] ?? 15.00) : 15.00;

        // Build a map of date -> planned labor from schedule slots
        $plannedLaborByDate = [];
        foreach ($schedules as $schedule) {
            foreach ($schedule->days as $day) {
                $dateStr = $day->date->toDateString();
                if ($dateStr >= $startDate && $dateStr <= $endDate) {
                    $dayPlannedLabor = 0;
                    foreach ($day->slots as $slot) {
                        $startTime = Carbon::parse($slot->start_time);
                        $endTime = Carbon::parse($slot->end_time);
                        $hours = abs($startTime->diffInMinutes($endTime)) / 60;
                        $headcount = $slot->headcount ?? 1;
                        $dayPlannedLabor += $hours * $headcount * $defaultPayRate;
                    }
                    $plannedLaborByDate[$dateStr] = ($plannedLaborByDate[$dateStr] ?? 0) + $dayPlannedLabor;
                }
            }
        }

        // Build per-day comparison
        $period = CarbonPeriod::create($startDate, $endDate);
        $data = [];

        foreach ($period as $date) {
            $dateStr = $date->toDateString();
            $actual = $actuals->get($dateStr);

            if (! $actual && ! isset($plannedLaborByDate[$dateStr])) {
                continue;
            }

            $actualRevenue = $actual ? (float) $actual->revenue : 0;
            $actualLabor = $actual ? (float) $actual->store_labor : 0;
            $plannedLabor = (float) ($plannedLaborByDate[$dateStr] ?? 0);
            $variance = round($actualLabor - $plannedLabor, 2);
            $variancePct = $plannedLabor > 0 ? round(($variance / $plannedLabor) * 100, 2) : 0;

            $data[] = [
                'date'           => $dateStr,
                'actual_revenue' => round($actualRevenue, 2),
                'actual_labor'   => round($actualLabor, 2),
                'planned_labor'  => round($plannedLabor, 2),
                'variance'       => $variance,
                'variance_pct'   => $variancePct,
            ];
        }

        return response()->json(['data' => $data]);
    }

    /**
     * Rollup: multi-location aggregate of daily actuals.
     */
    public function rollup(Request $request)
    {
        $request->validate([
            'start_date' => ['sometimes', 'date'],
            'end_date'   => ['sometimes', 'date'],
            'month'      => ['sometimes', 'string', 'regex:/^\d{4}-\d{2}$/'],
        ]);

        $tenantId = $request->user()->organization_id;

        $query = DailyActual::where('tenant_id', $tenantId);

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

        $totalRevenue = $actuals->sum('revenue');
        $totalLabor = $actuals->sum('store_labor');
        $totalDeliveryNet = $actuals->sum('delivery_net');
        $dayCount = $actuals->unique('date')->count();
        $laborPct = $totalRevenue > 0 ? round(($totalLabor / $totalRevenue) * 100, 2) : 0;

        // Get gpMarginFactor from TenantSetting (default 0.72)
        $gpSetting = TenantSetting::where('tenant_id', $tenantId)
            ->where('key_name', 'gpMarginFactor')
            ->first();
        $gpMarginFactor = $gpSetting ? (float) ($gpSetting->value['value'] ?? 0.72) : 0.72;
        $gpEstimate = round($totalRevenue * $gpMarginFactor, 2);

        // Per-location breakdown
        $locations = Location::where('tenant_id', $tenantId)->get();
        $actualsGrouped = $actuals->groupBy('location_id');

        $locationData = [];
        foreach ($locations as $location) {
            $locActuals = $actualsGrouped->get($location->id);
            if (! $locActuals) {
                continue;
            }

            $locRevenue = $locActuals->sum('revenue');
            $locLabor = $locActuals->sum('store_labor');
            $locLaborPct = $locRevenue > 0 ? round(($locLabor / $locRevenue) * 100, 2) : 0;

            $locationData[] = [
                'location_id' => $location->id,
                'code'        => $location->code,
                'name'        => $location->name,
                'revenue'     => (float) round($locRevenue, 2),
                'labor'       => (float) round($locLabor, 2),
                'labor_pct'   => (float) $locLaborPct,
            ];
        }

        return response()->json([
            'data' => [
                'total_revenue'      => (float) round($totalRevenue, 2),
                'total_labor'        => (float) round($totalLabor, 2),
                'total_delivery_net' => (float) round($totalDeliveryNet, 2),
                'labor_pct'          => (float) $laborPct,
                'gp_estimate'        => (float) $gpEstimate,
                'day_count'          => $dayCount,
                'locations'          => $locationData,
            ],
        ]);
    }
}
