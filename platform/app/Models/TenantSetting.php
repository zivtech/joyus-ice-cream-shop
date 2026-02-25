<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantSetting extends Model
{
    protected $fillable = [
        'tenant_id',
        'category',
        'key_name',
        'value',
    ];

    protected $casts = [
        'value' => 'array',
    ];
}
