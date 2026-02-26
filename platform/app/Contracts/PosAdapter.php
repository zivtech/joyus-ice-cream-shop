<?php

namespace App\Contracts;

use App\Models\Location;
use Illuminate\Support\Collection;

interface PosAdapter
{
    /** Adapter identifier (e.g. "square", "toast") */
    public function name(): string;

    /**
     * Import daily sales aggregates for a date range.
     *
     * Returns Collection of arrays with keys: date, transactions, revenue, store_labor
     */
    public function importDailySales(Location $location, string $startDate, string $endDate): Collection;

    /**
     * Import/sync employees from POS.
     *
     * Returns Collection of arrays with keys:
     *   external_id, first_name, last_name, email, phone, roles, pay_rate, status
     */
    public function importEmployees(Location $location): Collection;

    /**
     * Publish an approved schedule to POS.
     *
     * Returns array with keys: total, published, failed, skipped, results[]
     */
    public function publishSchedule(Location $location, array $schedulePayload): array;

    /** Check if the POS connection is healthy. */
    public function healthCheck(Location $location): bool;
}
