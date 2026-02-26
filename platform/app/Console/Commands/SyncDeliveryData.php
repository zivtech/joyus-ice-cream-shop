<?php

namespace App\Console\Commands;

use App\Adapters\AdapterFactory;
use App\Models\DailyActual;
use App\Models\DeliverySync;
use App\Models\Location;
use App\Models\Organization;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SyncDeliveryData extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'delivery:sync
        {locationCode : The location code to sync (e.g. EP, NL)}
        {--source=doordash : Delivery source adapter (e.g. doordash, ubereats)}
        {--start= : Start date (Y-m-d), defaults to yesterday}
        {--end= : End date (Y-m-d), defaults to yesterday}
        {--dry-run : Show what would happen without writing to DB}';

    /**
     * The console command description.
     */
    protected $description = 'Sync delivery data from third-party delivery platforms';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $locationCode = $this->argument('locationCode');
        $source = $this->option('source');
        $dryRun = $this->option('dry-run');

        $startDate = $this->option('start') ?? Carbon::yesterday()->toDateString();
        $endDate = $this->option('end') ?? Carbon::yesterday()->toDateString();

        // Find the location
        $org = Organization::first();
        if (! $org) {
            $this->error('No organization found. Run data:import-historical first.');
            return self::FAILURE;
        }

        $location = Location::where('tenant_id', $org->id)
            ->where('code', $locationCode)
            ->first();

        if (! $location) {
            $this->error("Location '{$locationCode}' not found for org '{$org->name}'.");
            return self::FAILURE;
        }

        $this->info("Syncing delivery data for {$location->name} ({$location->code})");
        $this->info("Source: {$source}");
        $this->info("Period: {$startDate} to {$endDate}");

        if ($dryRun) {
            $this->warn('[DRY RUN] No data will be written.');
        }

        $adapter = AdapterFactory::delivery($source);

        // Import daily deliveries
        $this->info('Fetching delivery data...');
        $deliveries = $adapter->importDailyDeliveries($location, $startDate, $endDate);
        $this->info("Received {$deliveries->count()} delivery records.");

        $rowsApplied = 0;
        $rowsSkipped = 0;
        $netTotal = 0.0;

        foreach ($deliveries as $day) {
            $this->line("  {$day['date']}: {$day['order_count']} orders, net \${$day['net_revenue']}");

            if (! $dryRun) {
                // Update matching DailyActual record
                $dailyActual = DailyActual::where('tenant_id', $org->id)
                    ->where('location_id', $location->id)
                    ->where('date', $day['date'])
                    ->first();

                if ($dailyActual) {
                    $dailyActual->update([
                        'delivery_net'        => $day['net_revenue'],
                        'delivery_gross'      => $day['gross_revenue'],
                        'delivery_commission' => $day['commission'],
                        'delivery_source'     => $adapter->name(),
                    ]);
                    $rowsApplied++;
                    $netTotal += $day['net_revenue'];
                } else {
                    $this->warn("  No DailyActual found for {$day['date']}, skipping.");
                    $rowsSkipped++;
                }
            }
        }

        // Create audit record
        if (! $dryRun) {
            DeliverySync::create([
                'tenant_id'    => $org->id,
                'location_id'  => $location->id,
                'source'       => $adapter->name(),
                'period_start' => $startDate,
                'period_end'   => $endDate,
                'rows_total'   => $deliveries->count(),
                'rows_applied' => $rowsApplied,
                'rows_skipped' => $rowsSkipped,
                'net_total'    => $netTotal,
                'status'       => 'completed',
            ]);
        }

        $this->newLine();
        $this->info("Delivery sync complete: {$rowsApplied} applied, {$rowsSkipped} skipped.");

        return self::SUCCESS;
    }
}
