<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduleDay extends Model
{
    protected $fillable = [
        'schedule_id',
        'date',
        'policy_changed',
        'pending_request_id',
    ];

    protected $casts = [
        'date' => 'date',
        'policy_changed' => 'boolean',
    ];

    public function schedule(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function slots(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ScheduleSlot::class);
    }

    public function policyExceptionRequests(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PolicyExceptionRequest::class);
    }
}
