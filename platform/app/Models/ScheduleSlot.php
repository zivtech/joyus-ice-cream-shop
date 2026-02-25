<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduleSlot extends Model
{
    protected $fillable = [
        'schedule_day_id',
        'start_time',
        'end_time',
        'role',
        'headcount',
    ];

    public function scheduleDay(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ScheduleDay::class);
    }

    public function assignments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ShiftAssignment::class);
    }
}
