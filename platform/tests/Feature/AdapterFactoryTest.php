<?php

namespace Tests\Feature;

use App\Adapters\AdapterFactory;
use App\Adapters\Delivery\DoorDashAdapter;
use App\Adapters\Delivery\GrubhubAdapter;
use App\Adapters\Delivery\UberEatsAdapter;
use App\Adapters\Pos\CloverAdapter;
use App\Adapters\Pos\SquareAdapter;
use App\Adapters\Pos\ToastAdapter;
use App\Contracts\DeliveryAdapter;
use App\Contracts\PosAdapter;
use InvalidArgumentException;
use Tests\TestCase;

class AdapterFactoryTest extends TestCase
{
    public function test_square_adapter_resolves(): void
    {
        $adapter = AdapterFactory::pos('square');

        $this->assertInstanceOf(PosAdapter::class, $adapter);
        $this->assertInstanceOf(SquareAdapter::class, $adapter);
        $this->assertEquals('square', $adapter->name());
    }

    public function test_toast_adapter_resolves(): void
    {
        $adapter = AdapterFactory::pos('toast');

        $this->assertInstanceOf(PosAdapter::class, $adapter);
        $this->assertInstanceOf(ToastAdapter::class, $adapter);
        $this->assertEquals('toast', $adapter->name());
    }

    public function test_clover_adapter_resolves(): void
    {
        $adapter = AdapterFactory::pos('clover');

        $this->assertInstanceOf(PosAdapter::class, $adapter);
        $this->assertInstanceOf(CloverAdapter::class, $adapter);
        $this->assertEquals('clover', $adapter->name());
    }

    public function test_unknown_pos_adapter_throws(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unknown POS adapter: unknown');

        AdapterFactory::pos('unknown');
    }

    public function test_doordash_adapter_resolves(): void
    {
        $adapter = AdapterFactory::delivery('doordash');

        $this->assertInstanceOf(DeliveryAdapter::class, $adapter);
        $this->assertInstanceOf(DoorDashAdapter::class, $adapter);
        $this->assertEquals('doordash', $adapter->name());
    }

    public function test_ubereats_adapter_resolves(): void
    {
        $adapter = AdapterFactory::delivery('ubereats');

        $this->assertInstanceOf(DeliveryAdapter::class, $adapter);
        $this->assertInstanceOf(UberEatsAdapter::class, $adapter);
        $this->assertEquals('ubereats', $adapter->name());
    }

    public function test_grubhub_adapter_resolves(): void
    {
        $adapter = AdapterFactory::delivery('grubhub');

        $this->assertInstanceOf(DeliveryAdapter::class, $adapter);
        $this->assertInstanceOf(GrubhubAdapter::class, $adapter);
        $this->assertEquals('grubhub', $adapter->name());
    }

    public function test_unknown_delivery_adapter_throws(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unknown delivery adapter: unknown');

        AdapterFactory::delivery('unknown');
    }
}
