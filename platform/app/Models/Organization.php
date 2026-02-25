<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'role_labels',
        'settings',
        'timezone',
        'status',
    ];

    protected $casts = [
        'role_labels' => 'array',
        'settings' => 'array',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class, 'tenant_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'tenant_id');
    }

    /**
     * Get the custom label for a role, or fall back to the default role name.
     */
    public function roleLabelFor(string $role): string
    {
        $labels = $this->role_labels ?? [];

        return $labels[$role] ?? $role;
    }
}
