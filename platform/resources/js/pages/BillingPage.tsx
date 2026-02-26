import { useState } from 'react';
import { useBillingStatus } from '@/api/hooks';
import client from '@/api/client';
import type { BillingPlan } from '@/types';
import { formatDate } from '@/utils/format';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border border-green-200',
  trialing: 'bg-blue-50 text-blue-700 border border-blue-200',
  past_due: 'bg-amber-50 text-amber-700 border border-amber-200',
  canceled: 'bg-red-50 text-red-700 border border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Past Due',
  canceled: 'Canceled',
};

function PlanCard({
  plan,
  isCurrent,
  onSelect,
  selecting,
}: {
  plan: BillingPlan;
  isCurrent: boolean;
  onSelect: (key: string) => void;
  selecting: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-lg border p-6 flex flex-col ${
        isCurrent ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-200'
      }`}
    >
      <h3 className="text-lg font-semibold text-gray-900">{plan.label}</h3>
      <div className="mt-2 mb-4">
        <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
        <span className="text-sm text-gray-500">/mo</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        {typeof plan.locations === 'number' ? `Up to ${plan.locations} locations` : plan.locations}
      </p>
      <ul className="space-y-2 flex-1 mb-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      {isCurrent ? (
        <span className="block w-full rounded-md bg-indigo-50 px-4 py-2 text-center text-sm font-medium text-indigo-700">
          Current Plan
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onSelect(plan.key)}
          disabled={selecting}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {selecting ? 'Updating...' : 'Select Plan'}
        </button>
      )}
    </div>
  );
}

export function BillingPage() {
  const { data: billing, loading, error, refresh } = useBillingStatus();
  const [selecting, setSelecting] = useState(false);
  const [selectError, setSelectError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  async function handleSelectPlan(planKey: string) {
    setSelecting(true);
    setSelectError('');
    try {
      await client.post('/billing/subscribe', { plan: planKey });
      refresh();
    } catch {
      setSelectError('Failed to update plan. Please try again.');
    } finally {
      setSelecting(false);
    }
  }

  async function handleCancel() {
    setCanceling(true);
    setCancelError('');
    try {
      await client.post('/billing/cancel');
      setShowCancelModal(false);
      refresh();
    } catch {
      setCancelError('Failed to cancel subscription. Please try again.');
    } finally {
      setCanceling(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const plans: BillingPlan[] = billing?.plans ?? [
    {
      key: 'starter',
      label: 'Starter',
      price: 49,
      locations: 1,
      features: ['1 location', 'Basic scheduling', 'POS integration', 'Email support'],
    },
    {
      key: 'professional',
      label: 'Professional',
      price: 99,
      locations: 5,
      features: ['Up to 5 locations', 'Advanced analytics', 'Labor optimization', 'Compliance tools', 'Priority support'],
    },
    {
      key: 'enterprise',
      label: 'Enterprise',
      price: 199,
      locations: 'Unlimited',
      features: ['Unlimited locations', 'Custom integrations', 'Dedicated account manager', 'SLA guarantees', 'API access'],
    },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your subscription and billing details.</p>
      </div>

      {/* Current Plan */}
      {billing && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Current Plan</h2>
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-gray-900 capitalize">{billing.plan}</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                STATUS_STYLES[billing.status] ?? 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {STATUS_LABELS[billing.status] ?? billing.status}
            </span>
          </div>
          {billing.on_trial && billing.trial_ends_at && (
            <p className="text-sm text-gray-500 mt-2">
              Trial ends: {formatDate(billing.trial_ends_at)}
            </p>
          )}
        </div>
      )}

      {/* Plan Comparison */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Choose a Plan</h2>

        {selectError && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {selectError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              isCurrent={billing?.plan === plan.key}
              onSelect={handleSelectPlan}
              selecting={selecting}
            />
          ))}
        </div>
      </div>

      {/* Billing Actions */}
      {billing && billing.status !== 'canceled' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Billing Actions</h2>
          <p className="text-xs text-gray-500 mb-4">
            Stripe integration coming soon — plan changes are recorded locally.
          </p>
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            Cancel Subscription
          </button>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Subscription?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You will lose access to premium features
              at the end of your current billing period.
            </p>
            {cancelError && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {cancelError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                type="button"
                onClick={() => void handleCancel()}
                disabled={canceling}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {canceling ? 'Canceling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
