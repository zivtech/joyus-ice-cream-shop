<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    private const PLANS = [
        [
            'key'       => 'starter',
            'label'     => 'Starter',
            'price'     => 49,
            'locations' => 1,
            'features'  => ['Dashboard', 'Scheduling', 'POS Sync'],
        ],
        [
            'key'       => 'professional',
            'label'     => 'Professional',
            'price'     => 99,
            'locations' => 3,
            'features'  => ['Everything in Starter', 'Compliance', 'Multi-location', 'Variance Analysis'],
        ],
        [
            'key'       => 'enterprise',
            'label'     => 'Enterprise',
            'price'     => 199,
            'locations' => 'unlimited',
            'features'  => ['Everything in Professional', 'Priority Support', 'Custom Integrations', 'API Access'],
        ],
    ];

    /**
     * Get current billing status and available plans.
     */
    public function status(Request $request)
    {
        $tenantId = $request->user()->organization_id;

        $subscription = Subscription::where('tenant_id', $tenantId)->first();

        // Create a default trial subscription if none exists
        if (! $subscription) {
            $subscription = Subscription::create([
                'tenant_id'            => $tenantId,
                'plan'                 => 'starter',
                'status'               => 'trialing',
                'trial_ends_at'        => Carbon::now()->addDays(30),
                'current_period_start' => Carbon::now(),
                'current_period_end'   => Carbon::now()->addDays(30),
            ]);
        }

        return response()->json([
            'plan'          => $subscription->plan,
            'status'        => $subscription->status,
            'trial_ends_at' => $subscription->trial_ends_at?->toDateString(),
            'is_active'     => $subscription->isActive(),
            'on_trial'      => $subscription->onTrial(),
            'plans'         => self::PLANS,
        ]);
    }

    /**
     * Update subscription plan.
     */
    public function subscribe(Request $request)
    {
        $user = $request->user();
        if (! $user->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'plan' => ['required', 'string', 'in:starter,professional,enterprise'],
        ]);

        $tenantId = $user->organization_id;

        $subscription = Subscription::where('tenant_id', $tenantId)->first();

        if (! $subscription) {
            $subscription = Subscription::create([
                'tenant_id'            => $tenantId,
                'plan'                 => $validated['plan'],
                'status'               => 'active',
                'current_period_start' => Carbon::now(),
                'current_period_end'   => Carbon::now()->addMonth(),
            ]);
        } else {
            $subscription->update([
                'plan'   => $validated['plan'],
                'status' => 'active',
            ]);
        }

        return response()->json([
            'plan'          => $subscription->plan,
            'status'        => $subscription->status,
            'trial_ends_at' => $subscription->trial_ends_at?->toDateString(),
            'is_active'     => $subscription->isActive(),
            'on_trial'      => $subscription->onTrial(),
        ]);
    }

    /**
     * Cancel subscription.
     */
    public function cancel(Request $request)
    {
        $user = $request->user();
        if (! $user->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $tenantId = $user->organization_id;

        $subscription = Subscription::where('tenant_id', $tenantId)->first();

        if (! $subscription) {
            return response()->json(['message' => 'No active subscription.'], 404);
        }

        $subscription->update(['status' => 'canceled']);

        return response()->json([
            'plan'          => $subscription->plan,
            'status'        => $subscription->status,
            'trial_ends_at' => $subscription->trial_ends_at?->toDateString(),
            'is_active'     => $subscription->isActive(),
            'on_trial'      => $subscription->onTrial(),
        ]);
    }
}
