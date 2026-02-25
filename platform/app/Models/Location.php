<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Location extends Model
{
    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'timezone',
        'latitude',
        'longitude',
        'square_location_id',
        'pos_adapter',
        'status',
    ];

    public function dailyActuals(): HasMany
    {
        return $this->hasMany(DailyActual::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function scheduleTemplates(): HasMany
    {
        return $this->hasMany(ScheduleTemplate::class);
    }

    public function deliverySyncs(): HasMany
    {
        return $this->hasMany(DeliverySync::class);
    }

    public function posSyncs(): HasMany
    {
        return $this->hasMany(PosSync::class);
    }

    public function multiLocationEmployees(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'employee_locations');
    }
}
