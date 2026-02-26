<?php

namespace App\Filament\Widgets;

use App\Models\DailyActual;
use App\Models\Employee;
use App\Models\Schedule;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;

class PlatformOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected int | string | array $columnSpan = 'full';

    protected function getStats(): array
    {
        $since = Carbon::now()->subDays(30)->toDateString();

        $totalRevenue = DailyActual::where('date', '>=', $since)->sum('revenue');
        $avgDailyRevenue = $totalRevenue > 0
            ? '$' . number_format($totalRevenue / 30, 0)
            : '$0';

        $laborRows = DailyActual::where('date', '>=', $since)
            ->where('revenue', '>', 0)
            ->selectRaw('SUM(store_labor) as total_labor, SUM(revenue) as total_revenue')
            ->first();
        $laborPct = ($laborRows && $laborRows->total_revenue > 0)
            ? round($laborRows->total_labor / $laborRows->total_revenue * 100, 1)
            : 0;

        $activeEmployees = Employee::where('status', 'active')->count();

        $pendingSchedules = Schedule::whereIn('status', ['pending', 'draft'])->count();

        return [
            Stat::make('Total Revenue (30d)', '$' . number_format($totalRevenue, 0))
                ->description('Avg ' . $avgDailyRevenue . ' / day')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success'),

            Stat::make('Avg Labor Cost %', $laborPct . '%')
                ->description($laborPct <= 30 ? 'Within target' : 'Above 30% target')
                ->descriptionIcon($laborPct <= 30 ? 'heroicon-m-check-circle' : 'heroicon-m-exclamation-triangle')
                ->color($laborPct <= 30 ? 'success' : 'warning'),

            Stat::make('Active Employees', $activeEmployees)
                ->description('Across all locations')
                ->descriptionIcon('heroicon-m-user-group')
                ->color('info'),

            Stat::make('Pending Schedules', $pendingSchedules)
                ->description($pendingSchedules > 0 ? 'Needs attention' : 'All clear')
                ->descriptionIcon($pendingSchedules > 0 ? 'heroicon-m-clock' : 'heroicon-m-check-circle')
                ->color($pendingSchedules > 0 ? 'warning' : 'success'),
        ];
    }
}
