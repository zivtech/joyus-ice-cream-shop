<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduleTemplate extends Model
{
    protected $fillable = [
        'tenant_id',
        'location_id',
        'name',
        'season',
        'is_default',
        'slots',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'slots' => 'array',
    ];

    public function location(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
