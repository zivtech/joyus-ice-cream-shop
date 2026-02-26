<?php

namespace App\Console\Commands;

use App\Models\DailyActual;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Organization;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ImportHistoricalData extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'data:import-historical
        {--file= : Path to data.json file}
        {--tenant= : Organization slug (defaults to milk-jawn)}
        {--dry-run : Show what would happen without writing to DB}';

    /**
     * The console command description.
     */
    protected $description = 'Import historical Milk Jawn data from data.json into the database';

    /**
     * Square location ID mapping.
     */
    private const LOCATION_MAP = [
        'EP' => [
            'name'               => 'East Passyunk',
            'square_location_id' => 'LYPJTCTZKM211',
        ],
        'NL' => [
            'name'               => 'NoLibs',
            'square_location_id' => 'LDBQAYTKVHZAT',
        ],
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $tenantSlug = $this->option('tenant') ?? 'milk-jawn';

        // Resolve file path
        $filePath = $this->option('file')
            ?? base_path('../apps/ice-cream-ops/data.json');

        if (! file_exists($filePath)) {
            $this->error("Data file not found: {$filePath}");
            return self::FAILURE;
        }

        $this->info("Reading data from: {$filePath}");

        $raw = file_get_contents($filePath);
        $data = json_decode($raw, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Failed to parse JSON: ' . json_last_error_msg());
            return self::FAILURE;
        }

        if ($dryRun) {
            $this->warn('[DRY RUN] No data will be written.');
        }

        // Find or create Organization
        $org = $dryRun
            ? Organization::where('slug', $tenantSlug)->first()
            : Organization::firstOrCreate(
                ['slug' => $tenantSlug],
                ['name' => 'Milk Jawn', 'status' => 'active']
            );

        if (! $org) {
            if ($dryRun) {
                $this->info('[DRY RUN] Would create organization: Milk Jawn');
                $this->info('[DRY RUN] Skipping remaining operations (no org ID available).');
                $this->printSummary($data);
                return self::SUCCESS;
            }
            $this->error('Failed to create organization.');
            return self::FAILURE;
        }

        $this->info("Organization: {$org->name} (ID: {$org->id})");

        // Create locations
        $locations = [];
        foreach (self::LOCATION_MAP as $code => $info) {
            if ($dryRun) {
                $location = Location::where('tenant_id', $org->id)->where('code', $code)->first();
                if (! $location) {
                    $this->info("[DRY RUN] Would create location: {$info['name']} ({$code})");
                    continue;
                }
            } else {
                $location = Location::firstOrCreate(
                    [
                        'tenant_id' => $org->id,
                        'code'      => $code,
                    ],
                    [
                        'name'               => $info['name'],
                        'square_location_id' => $info['square_location_id'],
                        'pos_adapter'        => 'square',
                        'status'             => 'active',
                    ]
                );
            }
            $locations[$code] = $location;
            $this->info("Location: {$location->name} ({$location->code}, ID: {$location->id})");
        }

        // Import daily actuals
        $dailyCounts = [];
        $dailyActuals = $data['daily_actual'] ?? [];

        foreach ($dailyActuals as $locCode => $records) {
            if (! isset($locations[$locCode])) {
                $this->warn("Skipping unknown location code: {$locCode}");
                continue;
            }

            $location = $locations[$locCode];
            $count = 0;

            foreach ($records as $record) {
                if ($dryRun) {
                    $count++;
                    continue;
                }

                DailyActual::updateOrCreate(
                    [
                        'tenant_id'   => $org->id,
                        'location_id' => $location->id,
                        'date'        => Carbon::parse($record['date']),
                    ],
                    [
                        'transactions' => $record['transactions'] ?? 0,
                        'revenue'      => $record['revenue'] ?? 0,
                        'store_labor'  => $record['store_labor'] ?? 0,
                        'delivery_net' => $record['doordash_net'] ?? 0,
                        'pos_source'   => 'square',
                        'synced_at'    => now(),
                    ]
                );
                $count++;
            }

            $dailyCounts[$locCode] = $count;
            $this->info("  {$locCode}: {$count} daily records " . ($dryRun ? '(would import)' : 'imported'));
        }

        // Import employees
        $employeesData = $data['employees'] ?? [];
        $allEmployees = [];
        $bothEmployeeNames = $employeesData['BOTH'] ?? [];

        // Process location-specific employees
        foreach (['EP', 'NL'] as $locCode) {
            $names = $employeesData[$locCode] ?? [];
            foreach ($names as $name) {
                if (! isset($allEmployees[$name])) {
                    $allEmployees[$name] = [];
                }
                $allEmployees[$name][] = $locCode;
            }
        }

        // Employees in BOTH work at both locations
        foreach ($bothEmployeeNames as $name) {
            $allEmployees[$name] = ['EP', 'NL'];
        }

        $employeeCount = 0;
        foreach ($allEmployees as $name => $locCodes) {
            // Determine primary location (first listed, or EP for BOTH)
            $primaryLocCode = $locCodes[0] ?? 'EP';
            $primaryLocation = $locations[$primaryLocCode] ?? null;

            if (! $primaryLocation) {
                continue;
            }

            if ($dryRun) {
                $locLabels = implode(', ', $locCodes);
                $this->line("  [DRY RUN] Would create employee: {$name} ({$locLabels})");
                $employeeCount++;
                continue;
            }

            $employee = Employee::firstOrCreate(
                [
                    'tenant_id' => $org->id,
                    'name'      => $name,
                ],
                [
                    'location_id' => $primaryLocation->id,
                    'status'      => 'active',
                ]
            );

            // Attach to all locations via pivot table
            $locationIds = [];
            foreach ($locCodes as $lc) {
                if (isset($locations[$lc])) {
                    $locationIds[] = $locations[$lc]->id;
                }
            }
            $employee->locations()->syncWithoutDetaching($locationIds);

            $employeeCount++;
        }

        $this->newLine();
        $this->info('Import complete:');
        foreach ($dailyCounts as $locCode => $count) {
            $this->info("  {$locCode}: {$count} daily records");
        }
        $this->info("  Employees: {$employeeCount}");

        return self::SUCCESS;
    }

    /**
     * Print a dry-run summary from the data structure.
     */
    private function printSummary(array $data): void
    {
        $dailyActuals = $data['daily_actual'] ?? [];
        foreach ($dailyActuals as $locCode => $records) {
            $this->info("  {$locCode}: " . count($records) . ' daily records (would import)');
        }

        $employees = $data['employees'] ?? [];
        $total = 0;
        foreach ($employees as $locCode => $names) {
            if ($locCode !== 'BOTH') {
                $total += count($names);
            }
        }
        // BOTH employees overlap, count unique
        $bothCount = count($employees['BOTH'] ?? []);
        $this->info("  Employees: ~{$total} location-specific + {$bothCount} multi-location");
    }
}
