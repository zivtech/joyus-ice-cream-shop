<?php

namespace App\Adapters\Delivery;

use App\Contracts\DeliveryAdapter;
use App\Models\Location;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class UberEatsAdapter implements DeliveryAdapter
{
    public function name(): string
    {
        return 'ubereats';
    }

    /**
     * Import daily delivery aggregates for a date range.
     *
     * Uber Eats API is not yet integrated.
     */
    public function importDailyDeliveries(Location $location, string $startDate, string $endDate): Collection
    {
        Log::info("UberEats adapter: importDailyDeliveries not yet implemented for location {$location->code}");

        return collect();
    }

    /**
     * Check if the Uber Eats connection is healthy.
     *
     * Returns false until API integration is configured.
     */
    public function healthCheck(Location $location): bool
    {
        Log::info("UberEats adapter: health check not yet available for location {$location->code}");

        return false;
    }
}
