<?php

namespace Tests\Feature;

use App\Models\DailyActual;
use App\Models\Employee;
use App\Models\Location;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImportHistoricalDataTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Create a temporary JSON fixture file with sample data.
     */
    private function createFixtureFile(): string
    {
        $data = [
            'daily_actual' => [
                'EP' => [
                    [
                        'date'         => '2024-01-15',
                        'month_key'    => '2024-01',
                        'month_label'  => 'Jan 2024',
                        'weekday'      => 'Mon',
                        'transactions' => 150,
                        'revenue'      => 2345.67,
                        'store_labor'  => 456.78,
                        'gross_profit_72' => 1688.88,
                        'labor_pct'    => 19.47,
                        'doordash_net' => 89.50,
                    ],
                    [
                        'date'         => '2024-01-16',
                        'month_key'    => '2024-01',
                        'month_label'  => 'Jan 2024',
                        'weekday'      => 'Tue',
                        'transactions' => 175,
                        'revenue'      => 2890.12,
                        'store_labor'  => 523.45,
                        'gross_profit_72' => 2080.89,
                        'labor_pct'    => 18.11,
                        'doordash_net' => 102.30,
                    ],
                ],
                'NL' => [
                    [
                        'date'         => '2024-01-15',
                        'month_key'    => '2024-01',
                        'month_label'  => 'Jan 2024',
                        'weekday'      => 'Mon',
                        'transactions' => 120,
                        'revenue'      => 1876.54,
                        'store_labor'  => 345.67,
                        'gross_profit_72' => 1351.11,
                        'labor_pct'    => 18.42,
                        'doordash_net' => 0.0,
                    ],
                ],
            ],
            'employees' => [
                'EP' => ['Alice Johnson', 'Bob Smith'],
                'NL' => ['Charlie Brown', 'Diana Prince'],
                'BOTH' => ['Eve Wilson'],
            ],
        ];

        $path = tempnam(sys_get_temp_dir(), 'milkjawn_test_') . '.json';
        file_put_contents($path, json_encode($data));

        return $path;
    }

    public function test_import_creates_daily_actual_records(): void
    {
        $fixturePath = $this->createFixtureFile();

        try {
            $this->artisan('data:import-historical', ['--file' => $fixturePath])
                ->assertSuccessful();

            $this->assertDatabaseHas('organizations', ['slug' => 'milk-jawn']);

            $org = Organization::where('slug', 'milk-jawn')->first();

            // Check EP location and records
            $this->assertDatabaseHas('locations', [
                'tenant_id' => $org->id,
                'code'      => 'EP',
            ]);
            $epLocation = Location::where('tenant_id', $org->id)->where('code', 'EP')->first();
            $epDailyCount = DailyActual::where('location_id', $epLocation->id)->count();
            $this->assertEquals(2, $epDailyCount);

            // Verify specific record values
            $record = DailyActual::where('tenant_id', $org->id)
                ->where('location_id', $epLocation->id)
                ->whereDate('date', '2024-01-15')
                ->first();
            $this->assertNotNull($record);
            $this->assertEquals(150, $record->transactions);
            $this->assertEquals(2345.67, (float) $record->revenue);
            $this->assertEquals(456.78, (float) $record->store_labor);
            $this->assertEquals(89.50, (float) $record->delivery_net);

            // Check NL location and records
            $nlLocation = Location::where('tenant_id', $org->id)->where('code', 'NL')->first();
            $nlDailyCount = DailyActual::where('location_id', $nlLocation->id)->count();
            $this->assertEquals(1, $nlDailyCount);
        } finally {
            @unlink($fixturePath);
        }
    }

    public function test_import_creates_employee_records(): void
    {
        $fixturePath = $this->createFixtureFile();

        try {
            $this->artisan('data:import-historical', ['--file' => $fixturePath])
                ->assertSuccessful();

            $org = Organization::where('slug', 'milk-jawn')->first();

            // EP-only employees
            $this->assertDatabaseHas('employees', [
                'tenant_id' => $org->id,
                'name'      => 'Alice Johnson',
            ]);
            $this->assertDatabaseHas('employees', [
                'tenant_id' => $org->id,
                'name'      => 'Bob Smith',
            ]);

            // NL-only employees
            $this->assertDatabaseHas('employees', [
                'tenant_id' => $org->id,
                'name'      => 'Charlie Brown',
            ]);

            // BOTH employee
            $eve = Employee::where('tenant_id', $org->id)
                ->where('name', 'Eve Wilson')
                ->first();
            $this->assertNotNull($eve);

            // Eve should be attached to both locations
            $eveLocationCodes = $eve->locations->pluck('code')->sort()->values()->toArray();
            $this->assertEquals(['EP', 'NL'], $eveLocationCodes);
        } finally {
            @unlink($fixturePath);
        }
    }

    public function test_import_is_idempotent(): void
    {
        $fixturePath = $this->createFixtureFile();

        try {
            // Run twice
            $this->artisan('data:import-historical', ['--file' => $fixturePath])
                ->assertSuccessful();
            $this->artisan('data:import-historical', ['--file' => $fixturePath])
                ->assertSuccessful();

            $org = Organization::where('slug', 'milk-jawn')->first();
            $epLocation = Location::where('tenant_id', $org->id)->where('code', 'EP')->first();

            // Should not duplicate records
            $epDailyCount = DailyActual::where('location_id', $epLocation->id)->count();
            $this->assertEquals(2, $epDailyCount);

            // Should not duplicate employees
            $aliceCount = Employee::where('tenant_id', $org->id)
                ->where('name', 'Alice Johnson')
                ->count();
            $this->assertEquals(1, $aliceCount);

            // Organization should not be duplicated
            $orgCount = Organization::where('slug', 'milk-jawn')->count();
            $this->assertEquals(1, $orgCount);
        } finally {
            @unlink($fixturePath);
        }
    }

    public function test_import_fails_with_missing_file(): void
    {
        $this->artisan('data:import-historical', ['--file' => '/nonexistent/path/data.json'])
            ->assertFailed();
    }

    public function test_dry_run_does_not_write_data(): void
    {
        $fixturePath = $this->createFixtureFile();

        try {
            $this->artisan('data:import-historical', [
                '--file'    => $fixturePath,
                '--dry-run' => true,
            ])->assertSuccessful();

            // Nothing should be created
            $this->assertEquals(0, Organization::count());
            $this->assertEquals(0, Location::count());
            $this->assertEquals(0, DailyActual::count());
            $this->assertEquals(0, Employee::count());
        } finally {
            @unlink($fixturePath);
        }
    }
}
