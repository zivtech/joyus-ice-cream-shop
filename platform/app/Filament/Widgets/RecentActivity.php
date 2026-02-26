<?php

namespace App\Filament\Widgets;

use App\Models\Employee;
use App\Models\Schedule;
use Filament\Widgets\Widget;
use Illuminate\Support\Collection;

class RecentActivity extends Widget
{
    protected static ?int $sort = 4;

    protected static string $view = 'filament.widgets.recent-activity';

    public function getActivities(): Collection
    {
        $schedules = Schedule::with('location')
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get()
            ->map(fn ($s) => [
                'type' => 'schedule',
                'icon' => 'heroicon-o-calendar',
                'label' => 'Schedule ' . ucfirst($s->status),
                'detail' => ($s->location?->name ?? 'Unknown') . ' — week of ' . $s->week_start->format('M j'),
                'time' => $s->updated_at,
            ]);

        $employees = Employee::with('location')
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get()
            ->map(fn ($e) => [
                'type' => 'employee',
                'icon' => 'heroicon-o-user',
                'label' => $e->status === 'active' ? 'Employee Active' : 'Employee ' . ucfirst($e->status),
                'detail' => $e->name . ' @ ' . ($e->location?->name ?? 'Unassigned'),
                'time' => $e->updated_at,
            ]);

        return $schedules->concat($employees)
            ->sortByDesc('time')
            ->take(5)
            ->values();
    }
}
