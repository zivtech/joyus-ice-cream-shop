<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplianceRule extends Model
{
    protected $fillable = [
        'tenant_id',
        'jurisdiction',
        'certification_type',
        'coverage_requirement',
        'constraint_type',
        'minimum_certified_count',
        'expiration_months',
        'active',
        'notes',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
