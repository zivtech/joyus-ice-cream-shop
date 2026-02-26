<?php

namespace App\Adapters\Delivery;

use App\Contracts\DeliveryAdapter;
use App\Models\Location;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class GrubhubAdapter implements DeliveryAdapter
{
    public function name(): string
    {
        return 'grubhub';
    }

    /**
     * Import daily delivery aggregates for a date range.
     *
     * Grubhub API is not yet integrated.
     */
    public function importDailyDeliveries(Location $location, string $startDate, string $endDate): Collection
    {
        Log::info("Grubhub adapter: importDailyDeliveries not yet implemented for location {$location->code}");

        return collect();
    }

    /**
     * Check if the Grubhub connection is healthy.
     *
     * Returns false until API integration is configured.
     */
    public function healthCheck(Location $location): bool
    {
        Log::info("Grubhub adapter: health check not yet available for location {$location->code}");

        return false;
    }
}
