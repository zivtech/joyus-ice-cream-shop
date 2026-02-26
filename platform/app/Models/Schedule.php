<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    use BelongsToTenant;
    protected $fillable = [
        'tenant_id',
        'location_id',
        'week_start',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewer_id',
        'published_at',
        'notes',
    ];

    protected $casts = [
        'week_start' => 'date',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function days(): HasMany
    {
        return $this->hasMany(ScheduleDay::class);
    }
}
