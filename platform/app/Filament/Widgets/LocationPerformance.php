<?php

namespace App\Filament\Widgets;

use App\Models\DailyActual;
use App\Models\Employee;
use App\Models\Location;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;

class LocationPerformance extends BaseWidget
{
    protected static ?int $sort = 3;

    protected ?string $heading = 'Location Performance (30d)';

    protected function getStats(): array
    {
        $since = Carbon::now()->subDays(30)->toDateString();

        $locations = Location::all();

        $actuals = DailyActual::where('date', '>=', $since)
            ->selectRaw('location_id, SUM(revenue) as total_revenue, SUM(store_labor) as total_labor, SUM(transactions) as total_transactions, COUNT(*) as day_count')
            ->groupBy('location_id')
            ->get()
            ->keyBy('location_id');

        $employeeCounts = Employee::where('status', 'active')
            ->selectRaw('location_id, COUNT(*) as cnt')
            ->groupBy('location_id')
            ->get()
            ->keyBy('location_id');

        $stats = [];

        foreach ($locations as $location) {
            $row = $actuals->get($location->id);

            $revenue = $row ? (float) $row->total_revenue : 0;
            $labor = $row ? (float) $row->total_labor : 0;
            $transactions = $row ? (int) $row->total_transactions : 0;
            $dayCount = $row ? (int) $row->day_count : 1;
            $employees = $employeeCounts->get($location->id)?->cnt ?? 0;

            $laborPct = $revenue > 0 ? round($labor / $revenue * 100, 1) : 0;
            $avgTransactions = $dayCount > 0 ? round($transactions / $dayCount) : 0;

            $stats[] = Stat::make($location->name, '$' . number_format($revenue, 0))
                ->description(
                    'Labor: ' . $laborPct . '% | ' .
                    $employees . ' staff | ' .
                    $avgTransactions . ' txn/day'
                )
                ->descriptionIcon('heroicon-m-map-pin')
                ->color($laborPct <= 30 ? 'success' : 'warning');
        }

        return $stats;
    }
}
