<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PosSync extends Model
{
    protected $fillable = [
        'tenant_id',
        'location_id',
        'adapter',
        'period_start',
        'period_end',
        'transactions_synced',
        'employees_synced',
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
