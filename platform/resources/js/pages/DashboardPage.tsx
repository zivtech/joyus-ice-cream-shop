import { useAuth } from '@/hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();
  const roleLabel = user?.roles[0]
    ? user.roles[0].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      <p className="text-sm text-gray-500 mt-1">
        Welcome back, {user?.name}.
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-200">
            {roleLabel}
          </span>
          <span className="text-sm text-gray-500">{user?.organization?.name}</span>
        </div>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">Dashboard — coming in Phase 4.</span>{' '}
          This page will show shift summaries, labor cost variance, top-line revenue metrics,
          and real-time alerts for the current pay period.
        </p>
      </div>
    </div>
  );
}
