<?php

namespace App\Filament\Widgets;

use App\Models\DailyActual;
use App\Models\Location;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class RevenueChart extends ChartWidget
{
    protected static ?int $sort = 2;

    protected static ?string $heading = 'Revenue Last 30 Days';

    protected function getData(): array
    {
        $since = Carbon::now()->subDays(29)->startOfDay();
        $dates = [];
        for ($i = 0; $i < 30; $i++) {
            $dates[] = Carbon::now()->subDays(29 - $i)->toDateString();
        }

        $locations = Location::all();

        $actuals = DailyActual::where('date', '>=', $since->toDateString())
            ->get()
            ->groupBy('location_id');

        $datasets = [];
        $colors = [
            'rgb(99, 102, 241)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
        ];

        foreach ($locations as $index => $location) {
            $locationActuals = $actuals->get($location->id, collect())->keyBy(fn ($row) => $row->date->toDateString());

            $data = array_map(fn ($date) => (float) ($locationActuals->get($date)?->revenue ?? 0), $dates);

            $color = $colors[$index % count($colors)];

            $datasets[] = [
                'label' => $location->name,
                'data' => $data,
                'borderColor' => $color,
                'backgroundColor' => str_replace('rgb(', 'rgba(', str_replace(')', ', 0.1)', $color)),
                'fill' => true,
                'tension' => 0.3,
            ];
        }

        return [
            'datasets' => $datasets,
            'labels' => array_map(fn ($d) => Carbon::parse($d)->format('M j'), $dates),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
