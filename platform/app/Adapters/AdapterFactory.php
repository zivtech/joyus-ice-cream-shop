<?php

namespace App\Adapters;

use App\Adapters\Delivery\DoorDashAdapter;
use App\Adapters\Delivery\GrubhubAdapter;
use App\Adapters\Delivery\UberEatsAdapter;
use App\Adapters\Pos\CloverAdapter;
use App\Adapters\Pos\SquareAdapter;
use App\Adapters\Pos\ToastAdapter;
use App\Contracts\DeliveryAdapter;
use App\Contracts\PosAdapter;
use InvalidArgumentException;

class AdapterFactory
{
    /**
     * Resolve a POS adapter by name.
     */
    public static function pos(string $adapter): PosAdapter
    {
        return match ($adapter) {
            'square' => new SquareAdapter(),
            'toast'  => new ToastAdapter(),
            'clover' => new CloverAdapter(),
            default  => throw new InvalidArgumentException("Unknown POS adapter: {$adapter}"),
        };
    }

    /**
     * Resolve a delivery adapter by name.
     */
    public static function delivery(string $adapter): DeliveryAdapter
    {
        return match ($adapter) {
            'doordash' => new DoorDashAdapter(),
            'ubereats' => new UberEatsAdapter(),
            'grubhub'  => new GrubhubAdapter(),
            default    => throw new InvalidArgumentException("Unknown delivery adapter: {$adapter}"),
        };
    }
}
