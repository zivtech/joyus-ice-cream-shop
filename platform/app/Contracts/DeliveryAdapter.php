<?php

namespace App\Contracts;

use App\Models\Location;
use Illuminate\Support\Collection;

interface DeliveryAdapter
{
    /** Adapter identifier (e.g. "doordash", "ubereats") */
    public function name(): string;

    /**
     * Import daily delivery aggregates for a date range.
     *
     * Returns Collection of arrays with keys:
     *   date, order_count, gross_revenue, commission, fees, net_revenue
     */
    public function importDailyDeliveries(Location $location, string $startDate, string $endDate): Collection;

    /** Check if the delivery connection is healthy. */
    public function healthCheck(Location $location): bool;
}
