<?php

namespace App\Console\Commands;

use App\Adapters\AdapterFactory;
use App\Models\DailyActual;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Organization;
use App\Models\PosSync;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncPosData extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'pos:sync
        {locationCode : The location code to sync (e.g. EP, NL)}
        {--start= : Start date (Y-m-d), defaults to yesterday}
        {--end= : End date (Y-m-d), defaults to yesterday}
        {--dry-run : Show what would happen without writing to DB}';

    /**
     * The console command description.
     */
    protected $description = 'Sync daily sales and employee data from POS system';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $locationCode = $this->argument('locationCode');
        $dryRun = $this->option('dry-run');

        $startDate = $this->option('start') ?? Carbon::yesterday()->toDateString();
        $endDate = $this->option('end') ?? Carbon::yesterday()->toDateString();

        // Find the location (scoped to first org for now)
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

        $this->info("Syncing POS data for {$location->name} ({$location->code})");
        $this->info("Period: {$startDate} to {$endDate}");
        $this->info("Adapter: {$location->pos_adapter}");

        if ($dryRun) {
            $this->warn('[DRY RUN] No data will be written.');
        }

        $adapter = AdapterFactory::pos($location->pos_adapter ?? 'square');

        // Import daily sales
        $this->info('Fetching daily sales...');
        $dailySales = $adapter->importDailySales($location, $startDate, $endDate);
        $this->info("Received {$dailySales->count()} daily sales records.");

        $salesSynced = 0;
        foreach ($dailySales as $day) {
            $this->line("  {$day['date']}: {$day['transactions']} txns, \${$day['revenue']} revenue, \${$day['store_labor']} labor");

            if (! $dryRun) {
                DailyActual::updateOrCreate(
                    [
                        'tenant_id'   => $org->id,
                        'location_id' => $location->id,
                        'date'        => $day['date'],
                    ],
                    [
                        'transactions' => $day['transactions'],
                        'revenue'      => $day['revenue'],
                        'store_labor'  => $day['store_labor'],
                        'pos_source'   => $adapter->name(),
                        'synced_at'    => now(),
                    ]
                );
                $salesSynced++;
            }
        }

        // Import employees
        $this->info('Fetching employees...');
        $employees = $adapter->importEmployees($location);
        $this->info("Received {$employees->count()} employee records.");

        $employeesSynced = 0;
        foreach ($employees as $emp) {
            $name = trim(($emp['first_name'] ?? '') . ' ' . ($emp['last_name'] ?? ''));
            $this->line("  {$name} ({$emp['external_id']})");

            if (! $dryRun && $emp['external_id']) {
                Employee::updateOrCreate(
                    [
                        'tenant_id'          => $org->id,
                        'square_employee_id' => $emp['external_id'],
                    ],
                    [
                        'location_id' => $location->id,
                        'name'        => $name,
                        'email'       => $emp['email'],
                        'phone'       => $emp['phone'],
                        'pay_rate'    => $emp['pay_rate'] ?? 15.00,
                        'status'      => $emp['status'] ?? 'active',
                    ]
                );
                $employeesSynced++;
            }
        }

        // Create audit record
        if (! $dryRun) {
            PosSync::create([
                'tenant_id'          => $org->id,
                'location_id'        => $location->id,
                'adapter'            => $adapter->name(),
                'period_start'       => $startDate,
                'period_end'         => $endDate,
                'transactions_synced' => $salesSynced,
                'employees_synced'   => $employeesSynced,
                'status'             => 'completed',
            ]);
        }

        $this->newLine();
        $this->info("POS sync complete: {$salesSynced} daily records, {$employeesSynced} employees synced.");

        return self::SUCCESS;
    }
}
