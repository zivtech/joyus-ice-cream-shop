<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyActual extends Model
{
    protected $fillable = [
        'tenant_id',
        'location_id',
        'date',
        'transactions',
        'revenue',
        'store_labor',
        'delivery_net',
        'delivery_gross',
        'delivery_commission',
        'delivery_source',
        'pos_source',
        'synced_at',
    ];

    protected $casts = [
        'date' => 'date',
        'synced_at' => 'datetime',
    ];

    public function location(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
