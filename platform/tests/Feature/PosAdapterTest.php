<?php

namespace Tests\Feature;

use App\Adapters\AdapterFactory;
use App\Adapters\Pos\SquareAdapter;
use App\Contracts\PosAdapter;
use App\Models\Location;
use App\Models\Organization;
use App\Models\TenantSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use Tests\TestCase;

class PosAdapterTest extends TestCase
{
    use RefreshDatabase;

    private function createOrgAndLocation(): array
    {
        $org = Organization::create([
            'name' => 'Test Org',
            'slug' => 'test-org',
        ]);

        $location = Location::create([
            'tenant_id'          => $org->id,
            'code'               => 'TST',
            'name'               => 'Test Location',
            'square_location_id' => 'SQUARE_LOC_123',
            'pos_adapter'        => 'square',
            'status'             => 'active',
        ]);

        TenantSetting::create([
            'tenant_id' => $org->id,
            'category'  => 'pos',
            'key_name'  => 'square_access_token',
            'value'     => 'test-token-abc123',
        ]);

        return [$org, $location];
    }

    public function test_adapter_factory_resolves_square(): void
    {
        $adapter = AdapterFactory::pos('square');

        $this->assertInstanceOf(PosAdapter::class, $adapter);
        $this->assertInstanceOf(SquareAdapter::class, $adapter);
        $this->assertEquals('square', $adapter->name());
    }

    public function test_adapter_factory_throws_on_unknown_adapter(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unknown POS adapter: toast');

        AdapterFactory::pos('toast');
    }

    public function test_square_health_check_returns_true_on_success(): void
    {
        [$org, $location] = $this->createOrgAndLocation();

        Http::fake([
            'connect.squareapis.com/v2/locations/SQUARE_LOC_123' => Http::response([
                'location' => ['id' => 'SQUARE_LOC_123', 'name' => 'Test'],
            ], 200),
        ]);

        $adapter = new SquareAdapter();
        $result = $adapter->healthCheck($location);

        $this->assertTrue($result);
    }

    public function test_square_health_check_returns_false_on_failure(): void
    {
        [$org, $location] = $this->createOrgAndLocation();

        Http::fake([
            'connect.squareapis.com/v2/locations/SQUARE_LOC_123' => Http::response([
                'errors' => [['detail' => 'Not found']],
            ], 500),
        ]);

        $adapter = new SquareAdapter();
        $result = $adapter->healthCheck($location);

        $this->assertFalse($result);
    }

    public function test_square_import_daily_sales(): void
    {
        [$org, $location] = $this->createOrgAndLocation();

        Http::fake([
            'connect.squareapis.com/v2/orders/search' => Http::response([
                'orders' => [
                    [
                        'id'          => 'order1',
                        'created_at'  => '2024-01-15T10:30:00Z',
                        'total_money' => ['amount' => 2500, 'currency' => 'USD'],
                    ],
                    [
                        'id'          => 'order2',
                        'created_at'  => '2024-01-15T14:00:00Z',
                        'total_money' => ['amount' => 1800, 'currency' => 'USD'],
                    ],
                    [
                        'id'          => 'order3',
                        'created_at'  => '2024-01-16T09:00:00Z',
                        'total_money' => ['amount' => 3200, 'currency' => 'USD'],
                    ],
                ],
            ], 200),
            'connect.squareapis.com/v2/labor/shifts/search' => Http::response([
                'shifts' => [
                    [
                        'id'       => 'shift1',
                        'start_at' => '2024-01-15T08:00:00Z',
                        'end_at'   => '2024-01-15T16:00:00Z',
                        'wage'     => ['hourly_rate' => ['amount' => 1500, 'currency' => 'USD']],
                    ],
                ],
            ], 200),
        ]);

        $adapter = new SquareAdapter();
        $result = $adapter->importDailySales($location, '2024-01-15', '2024-01-16');

        $this->assertCount(2, $result);

        $day1 = $result->firstWhere('date', '2024-01-15');
        $this->assertNotNull($day1);
        $this->assertEquals(2, $day1['transactions']);
        $this->assertEquals(43.0, $day1['revenue']); // (2500 + 1800) / 100
        $this->assertEquals(120.0, $day1['store_labor']); // 15.00/hr * 8 hours

        $day2 = $result->firstWhere('date', '2024-01-16');
        $this->assertNotNull($day2);
        $this->assertEquals(1, $day2['transactions']);
        $this->assertEquals(32.0, $day2['revenue']); // 3200 / 100
    }

    public function test_square_import_employees(): void
    {
        [$org, $location] = $this->createOrgAndLocation();

        Http::fake([
            'connect.squareapis.com/v2/team-members/search' => Http::response([
                'team_members' => [
                    [
                        'id'            => 'emp_001',
                        'given_name'    => 'Jane',
                        'family_name'   => 'Doe',
                        'email_address' => 'jane@example.com',
                        'phone_number'  => '215-555-0101',
                        'status'        => 'ACTIVE',
                    ],
                    [
                        'id'            => 'emp_002',
                        'given_name'    => 'John',
                        'family_name'   => 'Smith',
                        'email_address' => 'john@example.com',
                        'status'        => 'ACTIVE',
                    ],
                ],
            ], 200),
        ]);

        $adapter = new SquareAdapter();
        $result = $adapter->importEmployees($location);

        $this->assertCount(2, $result);

        $jane = $result->firstWhere('external_id', 'emp_001');
        $this->assertEquals('Jane', $jane['first_name']);
        $this->assertEquals('Doe', $jane['last_name']);
        $this->assertEquals('jane@example.com', $jane['email']);
        $this->assertEquals('215-555-0101', $jane['phone']);
        $this->assertEquals('active', $jane['status']);

        $john = $result->firstWhere('external_id', 'emp_002');
        $this->assertEquals('John', $john['first_name']);
        $this->assertEquals('Smith', $john['last_name']);
    }

    public function test_square_health_check_returns_false_without_token(): void
    {
        $org = Organization::create([
            'name' => 'No Token Org',
            'slug' => 'no-token',
        ]);

        $location = Location::create([
            'tenant_id'          => $org->id,
            'code'               => 'NT',
            'name'               => 'No Token Location',
            'square_location_id' => 'SQUARE_NO_TOKEN',
            'pos_adapter'        => 'square',
            'status'             => 'active',
        ]);

        $adapter = new SquareAdapter();
        $result = $adapter->healthCheck($location);

        $this->assertFalse($result);
    }
}
