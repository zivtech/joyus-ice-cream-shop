import { useState, useCallback } from 'react';
import { useExceptionRequests } from '@/api/hooks';
import { useAuth } from '@/hooks/useAuth';
import { RoleGate } from '@/components/RoleGate';
import client from '@/api/client';
import { formatDate } from '@/utils/format';

type StatusTab = '' | 'pending' | 'approved' | 'rejected';

const tabs: { label: string; value: StatusTab }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export function ExceptionRequestsPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusTab>('');
  const [formOpen, setFormOpen] = useState(false);
  const [formDayId, setFormDayId] = useState('');
  const [formReason, setFormReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { data: requests, loading, error, refresh } = useExceptionRequests({
    status: statusFilter || undefined,
  });

  const handleApprove = useCallback(async (id: number) => {
    try {
      await client.post(`/exception-requests/${id}/approve`);
      refresh();
    } catch {
      /* ignore */
    }
  }, [refresh]);

  const handleReject = useCallback(async (id: number) => {
    try {
      await client.post(`/exception-requests/${id}/reject`);
      refresh();
    } catch {
      /* ignore */
    }
  }, [refresh]);

  const handleSubmit = useCallback(async () => {
    if (!formDayId || !formReason.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await client.post('/exception-requests', {
        schedule_day_id: Number(formDayId),
        reason: formReason.trim(),
      });
      setFormOpen(false);
      setFormDayId('');
      setFormReason('');
      refresh();
    } catch {
      setSubmitError('Failed to create exception request.');
    } finally {
      setSubmitting(false);
    }
  }, [formDayId, formReason, refresh]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Exception Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Request and manage policy exceptions for scheduled shifts.
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

      {/* Requests table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No exception requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Requester</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Reason</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Reviewer</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(req.created_at.split('T')[0])}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{req.requester?.name ?? `User #${req.requester_id}`}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{req.reason}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[req.status]}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {req.reviewer?.name ?? (req.reviewed_at ? `User #${req.reviewer_id}` : '--')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {req.status === 'pending' && (
                        <RoleGate roles={['admin', 'gm']}>
                          <button
                            type="button"
                            onClick={() => void handleApprove(req.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium mr-3"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleReject(req.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </RoleGate>
                      )}
                    </td>
                  </tr>
                ))}
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
              <h2 className="text-base font-semibold text-gray-900">New Exception Request</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              {submitError && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Day ID</label>
                <input
                  type="number"
                  value={formDayId}
                  onChange={(e) => setFormDayId(e.target.value)}
                  placeholder="Enter schedule day ID"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why an exception is needed"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {user && (
                <p className="text-xs text-gray-400">Requesting as {user.name}</p>
              )}
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
                disabled={submitting || !formDayId || !formReason.trim()}
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
