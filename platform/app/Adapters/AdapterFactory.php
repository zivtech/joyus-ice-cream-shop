<?php

namespace App\Adapters;

use App\Adapters\Delivery\DoorDashAdapter;
use App\Adapters\Pos\SquareAdapter;
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
            default    => throw new InvalidArgumentException("Unknown delivery adapter: {$adapter}"),
        };
    }
}
