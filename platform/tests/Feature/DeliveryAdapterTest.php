<?php

namespace Tests\Feature;

use App\Adapters\AdapterFactory;
use App\Adapters\Delivery\DoorDashAdapter;
use App\Contracts\DeliveryAdapter;
use App\Models\Location;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class DeliveryAdapterTest extends TestCase
{
    use RefreshDatabase;

    public function test_adapter_factory_resolves_doordash(): void
    {
        $adapter = AdapterFactory::delivery('doordash');

        $this->assertInstanceOf(DeliveryAdapter::class, $adapter);
        $this->assertInstanceOf(DoorDashAdapter::class, $adapter);
        $this->assertEquals('doordash', $adapter->name());
    }

    public function test_adapter_factory_throws_on_unknown_delivery_adapter(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unknown delivery adapter: nonexistent');

        AdapterFactory::delivery('nonexistent');
    }

    public function test_doordash_adapter_returns_empty_collection(): void
    {
        $org = Organization::create([
            'name' => 'Test Org',
            'slug' => 'test-org',
        ]);

        $location = Location::create([
            'tenant_id' => $org->id,
            'code'      => 'TST',
            'name'      => 'Test Location',
            'status'    => 'active',
        ]);

        $adapter = new DoorDashAdapter();
        $result = $adapter->importDailyDeliveries($location, '2024-01-01', '2024-01-31');

        $this->assertCount(0, $result);
        $this->assertTrue($result->isEmpty());
    }

    public function test_doordash_health_check_returns_false(): void
    {
        $org = Organization::create([
            'name' => 'Test Org',
            'slug' => 'test-org',
        ]);

        $location = Location::create([
            'tenant_id' => $org->id,
            'code'      => 'TST',
            'name'      => 'Test Location',
            'status'    => 'active',
        ]);

        $adapter = new DoorDashAdapter();
        $result = $adapter->healthCheck($location);

        $this->assertFalse($result);
    }
}
