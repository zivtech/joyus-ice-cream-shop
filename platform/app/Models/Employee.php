<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    protected $fillable = [
        'tenant_id',
        'location_id',
        'name',
        'email',
        'phone',
        'pay_rate',
        'certifications',
        'certification_expiry',
        'square_employee_id',
        'availability',
        'hire_date',
        'status',
    ];

    protected $casts = [
        'certifications' => 'array',
        'certification_expiry' => 'array',
        'availability' => 'array',
        'hire_date' => 'date',
    ];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class, 'employee_locations');
    }

    public function shiftAssignments(): HasMany
    {
        return $this->hasMany(ShiftAssignment::class);
    }

    public function ptoRequests(): HasMany
    {
        return $this->hasMany(PtoRequest::class);
    }
}
