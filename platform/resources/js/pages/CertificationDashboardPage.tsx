import { useState, useCallback } from 'react';
import { useCertificationStatus } from '@/api/hooks';
import { LocationSelector } from '@/components/LocationSelector';
import { formatDate } from '@/utils/format';

const statusStyles: Record<string, string> = {
  valid: 'bg-green-100 text-green-700',
  expiring_soon: 'bg-amber-100 text-amber-700',
  expired: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  valid: 'Valid',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
};

export function CertificationDashboardPage() {
  const [locationId, setLocationId] = useState<number | null>(null);

  const handleLocationChange = useCallback((id: number) => {
    setLocationId(id);
  }, []);

  const { data, loading, error } = useCertificationStatus({
    location_id: locationId ?? undefined,
  });

  const summary = data?.summary;
  const employees = data?.employees ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Certification Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track employee certifications and expiration status.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <LocationSelector value={locationId} onChange={handleLocationChange} />
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 border-l-4 border-l-gray-200 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-l-green-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Certified</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{summary.total_certified}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expiring Soon</p>
            <p className="mt-1 text-xl font-semibold text-amber-700">{summary.expiring_soon}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-l-red-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expired</p>
            <p className="mt-1 text-xl font-semibold text-red-700">{summary.expired}</p>
          </div>
        </div>
      ) : null}

      {/* Employee table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Employee Certifications</h2>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No certification data available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Certifications</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Expiry Dates</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Days Until Expiry</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {emp.certifications.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {emp.expiry_dates.map((d) => formatDate(d)).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {emp.days_until_expiry}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[emp.status]}`}>
                        {statusLabels[emp.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
