<?php

namespace App\Filament\Widgets;

use App\Models\Location;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class PlatformOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Organizations', Organization::count()),
            Stat::make('Total Users', User::count()),
            Stat::make('Total Locations', Location::count()),
            Stat::make('Active Subscriptions', Subscription::whereIn('status', ['active', 'trialing'])->count()),
        ];
    }
}
