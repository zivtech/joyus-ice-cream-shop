<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PolicyExceptionRequest extends Model
{
    protected $fillable = [
        'tenant_id',
        'schedule_day_id',
        'requester_id',
        'reason',
        'status',
        'reviewer_id',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function scheduleDay(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ScheduleDay::class);
    }

    public function requester(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function reviewer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
