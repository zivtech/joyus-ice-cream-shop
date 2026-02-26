<?php

namespace App\Adapters\Pos;

use App\Contracts\PosAdapter;
use App\Models\Location;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ToastAdapter implements PosAdapter
{
    public function name(): string
    {
        return 'toast';
    }

    /**
     * Import daily sales aggregates for a date range.
     *
     * Toast POS API is not yet integrated.
     */
    public function importDailySales(Location $location, string $startDate, string $endDate): Collection
    {
        Log::info("Toast adapter: importDailySales not yet implemented for location {$location->code}");

        return collect();
    }

    /**
     * Import/sync employees from POS.
     *
     * Toast POS API is not yet integrated.
     */
    public function importEmployees(Location $location): Collection
    {
        Log::info("Toast adapter: importEmployees not yet implemented for location {$location->code}");

        return collect();
    }

    /**
     * Publish an approved schedule to POS.
     *
     * Toast POS API is not yet integrated.
     */
    public function publishSchedule(Location $location, array $schedulePayload): array
    {
        Log::info("Toast adapter: publishSchedule not yet implemented for location {$location->code}");

        return [
            'total'     => 0,
            'published' => 0,
            'failed'    => 0,
            'skipped'   => 0,
            'results'   => [],
        ];
    }

    /**
     * Check if the POS connection is healthy.
     *
     * Returns false until API integration is configured.
     */
    public function healthCheck(Location $location): bool
    {
        Log::info("Toast adapter: health check not yet available for location {$location->code}");

        return false;
    }
}
