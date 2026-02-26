import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RoleGate } from '@/components/RoleGate';
import client from '@/api/client';
import type { Organization } from '@/types';

const DEFAULT_ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  gm: 'General Manager',
  store_manager: 'Store Manager',
  key_lead: 'Key Lead',
  staff: 'Staff',
};

export function SettingsPage() {
  const { user } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [roleLabels, setRoleLabels] = useState<Record<string, string>>({ ...DEFAULT_ROLE_LABELS });

  useEffect(() => {
    client
      .get<Organization>('/organization')
      .then((res) => {
        setOrg(res.data);
        if (res.data.role_labels) {
          setRoleLabels({ ...DEFAULT_ROLE_LABELS, ...res.data.role_labels });
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSaveLabels(e: FormEvent) {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);
    setIsSaving(true);
    try {
      const res = await client.patch<Organization>('/organization/role-labels', {
        role_labels: roleLabels,
      });
      setOrg(res.data);
      setSaveSuccess(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setSaveError(axiosErr.response?.data?.message ?? 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Organization configuration and role management.</p>
      </div>

      {/* Organization info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Organization</h2>
        <dl className="space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500">Name</dt>
            <dd className="text-sm font-medium text-gray-900">{org?.name ?? '—'}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500">Slug</dt>
            <dd className="text-sm font-mono text-gray-700">{org?.slug ?? '—'}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500">Timezone</dt>
            <dd className="text-sm text-gray-900">{org?.timezone ?? '—'}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500">Status</dt>
            <dd>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                org?.status === 'active'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {org?.status ?? '—'}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-500">Your role</dt>
            <dd className="text-sm text-gray-900">
              {user?.roles.map((r) => roleLabels[r] ?? r).join(', ') ?? '—'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Role labels */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Role Labels</h2>
        <p className="text-xs text-gray-500 mb-4">
          Customize how roles appear across the platform. Defaults shown if not overridden.
        </p>

        <div className="space-y-2 mb-5">
          {Object.entries(DEFAULT_ROLE_LABELS).map(([role, defaultLabel]) => {
            const custom = org?.role_labels?.[role];
            return (
              <div key={role} className="flex items-center gap-3 text-sm">
                <span className="w-28 font-mono text-xs text-gray-500">{role}</span>
                <span className="flex-1 text-gray-700">{custom ?? defaultLabel}</span>
                {custom ? (
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">custom</span>
                ) : (
                  <span className="text-xs text-gray-400">default</span>
                )}
              </div>
            );
          })}
        </div>

        <RoleGate roles={['admin']}>
          <form onSubmit={(e) => void handleSaveLabels(e)}>
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Edit labels
            </h3>

            {saveError && (
              <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="mb-3 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                Role labels saved.
              </div>
            )}

            <div className="space-y-3">
              {Object.keys(DEFAULT_ROLE_LABELS).map((role) => (
                <div key={role} className="flex items-center gap-3">
                  <label
                    htmlFor={`role-${role}`}
                    className="w-28 text-xs font-mono text-gray-500 shrink-0"
                  >
                    {role}
                  </label>
                  <input
                    id={`role-${role}`}
                    type="text"
                    value={roleLabels[role] ?? DEFAULT_ROLE_LABELS[role]}
                    onChange={(e) =>
                      setRoleLabels((prev) => ({ ...prev, [role]: e.target.value }))
                    }
                    placeholder={DEFAULT_ROLE_LABELS[role]}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving…' : 'Save labels'}
              </button>
            </div>
          </form>
        </RoleGate>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RoleGate roles={['admin', 'gm']}>
            <Link
              to="/business-rules"
              className="block rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="text-sm font-semibold text-gray-900">Business Rules</h3>
              <p className="text-xs text-gray-500 mt-1">Pay rates, hours, labor targets, workflow</p>
            </Link>
          </RoleGate>
          <RoleGate roles={['admin']}>
            <Link
              to="/billing"
              className="block rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="text-sm font-semibold text-gray-900">Billing</h3>
              <p className="text-xs text-gray-500 mt-1">Subscription management and plans</p>
            </Link>
          </RoleGate>
          <RoleGate roles={['admin', 'gm']}>
            <Link
              to="/compliance"
              className="block rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <h3 className="text-sm font-semibold text-gray-900">Compliance Rules</h3>
              <p className="text-xs text-gray-500 mt-1">Certification and coverage requirements</p>
            </Link>
          </RoleGate>
        </div>
      </div>
    </div>
  );
}
