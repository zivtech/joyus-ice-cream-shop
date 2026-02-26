<?php

namespace App\Adapters\Delivery;

use App\Contracts\DeliveryAdapter;
use App\Models\Location;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class DoorDashAdapter implements DeliveryAdapter
{
    public function name(): string
    {
        return 'doordash';
    }

    /**
     * Import daily delivery aggregates for a date range.
     *
     * DoorDash Merchant Portal API is not yet available.
     * Historical data is imported via ImportHistoricalData command from data.json.
     */
    public function importDailyDeliveries(Location $location, string $startDate, string $endDate): Collection
    {
        Log::info("DoorDash adapter: API import not yet configured for location {$location->code}");

        return collect();
    }

    /**
     * Check if the DoorDash connection is healthy.
     *
     * Returns false until API integration is configured.
     */
    public function healthCheck(Location $location): bool
    {
        Log::info("DoorDash adapter: health check not yet available for location {$location->code}");

        return false;
    }
}
