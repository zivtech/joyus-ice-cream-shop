<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliverySync extends Model
{
    protected $fillable = [
        'tenant_id',
        'location_id',
        'source',
        'period_start',
        'period_end',
        'rows_total',
        'rows_applied',
        'rows_skipped',
        'net_total',
        'status',
        'error_message',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
    ];

    public function location(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
