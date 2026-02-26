<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'tenant_id',
        'stripe_subscription_id',
        'stripe_customer_id',
        'plan',
        'status',
        'trial_ends_at',
        'current_period_start',
        'current_period_end',
    ];

    protected $casts = [
        'trial_ends_at'        => 'datetime',
        'current_period_start' => 'datetime',
        'current_period_end'   => 'datetime',
    ];

    /**
     * Check if the subscription is active (active or trialing).
     */
    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trialing']);
    }

    /**
     * Check if the subscription is currently on trial.
     */
    public function onTrial(): bool
    {
        return $this->status === 'trialing' && $this->trial_ends_at?->isFuture();
    }
}
