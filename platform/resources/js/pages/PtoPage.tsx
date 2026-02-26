import { useState, useCallback } from 'react';
import { usePtoRequests, useEmployees, useLocations } from '@/api/hooks';
import { useAuth } from '@/hooks/useAuth';
import { RoleGate } from '@/components/RoleGate';
import client from '@/api/client';
import { formatDate } from '@/utils/format';

type StatusTab = '' | 'pending' | 'approved' | 'denied';

const tabs: { label: string; value: StatusTab }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Denied', value: 'denied' },
];

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  denied: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export function PtoPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusTab>('');
  const [formOpen, setFormOpen] = useState(false);
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formLocationId, setFormLocationId] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formReason, setFormReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { data: requests, loading, error, refresh } = usePtoRequests({
    status: statusFilter || undefined,
  });

  const { data: employees } = useEmployees();
  const { data: locations } = useLocations();

  const handleApprove = useCallback(async (id: number) => {
    try {
      await client.post(`/pto-requests/${id}/approve`);
      refresh();
    } catch {
      /* ignore */
    }
  }, [refresh]);

  const handleDeny = useCallback(async (id: number) => {
    try {
      await client.post(`/pto-requests/${id}/deny`);
      refresh();
    } catch {
      /* ignore */
    }
  }, [refresh]);

  const handleCancel = useCallback(async (id: number) => {
    try {
      await client.post(`/pto-requests/${id}/cancel`);
      refresh();
    } catch {
      /* ignore */
    }
  }, [refresh]);

  const handleSubmit = useCallback(async () => {
    if (!formEmployeeId || !formLocationId || !formStartDate || !formEndDate) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await client.post('/pto-requests', {
        employee_id: Number(formEmployeeId),
        location_id: Number(formLocationId),
        start_date: formStartDate,
        end_date: formEndDate,
        reason: formReason.trim() || null,
      });
      setFormOpen(false);
      setFormEmployeeId('');
      setFormLocationId('');
      setFormStartDate('');
      setFormEndDate('');
      setFormReason('');
      refresh();
    } catch {
      setSubmitError('Failed to create PTO request.');
    } finally {
      setSubmitting(false);
    }
  }, [formEmployeeId, formLocationId, formStartDate, formEndDate, formReason, refresh]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Time Off Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit and manage paid time off requests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setFormOpen(true); setSubmitError(''); }}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          New Request
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* PTO table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No PTO requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Reason</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => {
                  const isOwn = req.employee_id === user?.id;
                  return (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {req.employee?.name ?? `Employee #${req.employee_id}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(req.start_date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(req.end_date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{req.reason ?? '--'}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[req.status]}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {req.status === 'pending' && (
                          <>
                            <RoleGate roles={['admin', 'gm', 'store_manager']}>
                              <button
                                type="button"
                                onClick={() => void handleApprove(req.id)}
                                className="text-green-600 hover:text-green-800 text-sm font-medium mr-2"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeny(req.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium mr-2"
                              >
                                Deny
                              </button>
                            </RoleGate>
                            {isOwn && (
                              <button
                                type="button"
                                onClick={() => void handleCancel(req.id)}
                                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                              >
                                Cancel
                              </button>
                            )}
                          </>
                        )}
                        {req.status === 'approved' && isOwn && (
                          <button
                            type="button"
                            onClick={() => void handleCancel(req.id)}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create form modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">New PTO Request</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              {submitError && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={formLocationId}
                  onChange={(e) => setFormLocationId(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={2}
                  placeholder="Optional reason for time off"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting || !formEmployeeId || !formLocationId || !formStartDate || !formEndDate}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
