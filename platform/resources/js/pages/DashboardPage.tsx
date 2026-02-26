import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDailyActuals, useDailyActualSummary } from '@/api/hooks';
import { LocationSelector } from '@/components/LocationSelector';
import { DateRangeSelector, getThisMonthRange } from '@/components/DateRangeSelector';
import type { DateRange } from '@/components/DateRangeSelector';
import { KpiCard } from '@/components/KpiCard';
import { formatCurrency, formatPercent, formatDate, formatWeekday } from '@/utils/format';

function laborTone(pct: number): 'good' | 'watch' | 'risk' {
  if (pct < 24) return 'good';
  if (pct <= 27) return 'watch';
  return 'risk';
}

function gpTone(gp: number): 'good' | 'risk' {
  return gp > 0 ? 'good' : 'risk';
}

export function DashboardPage() {
  const { user } = useAuth();
  const [locationId, setLocationId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getThisMonthRange);

  const handleLocationChange = useCallback((id: number) => {
    setLocationId(id);
  }, []);

  const summaryParams = {
    location_id: locationId ?? 0,
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
  };

  const { data: summary, loading: summaryLoading, error: summaryError } = useDailyActualSummary(summaryParams);
  const { data: actuals, loading: actualsLoading, error: actualsError } = useDailyActuals(summaryParams);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {user?.name}. Here is your location performance overview.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <LocationSelector value={locationId} onChange={handleLocationChange} />
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {summaryError && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {summaryError}
        </div>
      )}

      {summaryLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 border-l-4 border-l-gray-200 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <KpiCard title="Revenue" value={summary.total_revenue} format="currency" />
          <KpiCard title="Labor Cost" value={summary.total_labor} format="currency" />
          <KpiCard
            title="Labor %"
            value={summary.labor_pct}
            format="percent"
            tone={laborTone(summary.labor_pct)}
          />
          <KpiCard
            title="Gross Profit"
            value={summary.gp_estimate}
            format="currency"
            tone={gpTone(summary.gp_estimate)}
          />
          <KpiCard title="Avg Daily Rev" value={summary.avg_daily_revenue} format="currency" />
        </div>
      ) : (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
          Select a location to view performance data.
        </div>
      )}

      {actualsError && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {actualsError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Daily Actuals</h2>
        </div>

        {actualsLoading ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">Loading...</div>
        ) : actuals.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No data for the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Day</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Transactions</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Labor</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Labor %</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {actuals.map((row) => {
                  const rowLaborPct = row.revenue > 0 ? (row.store_labor / row.revenue) * 100 : 0;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(row.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatWeekday(row.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{row.transactions}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(row.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(row.store_labor)}</td>
                      <td className={`px-4 py-3 text-sm text-right font-medium ${
                        rowLaborPct > 27 ? 'text-red-600' : rowLaborPct > 24 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {formatPercent(rowLaborPct)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(row.delivery_net)}</td>
                    </tr>
                  );
                })}
              </tbody>
              {summary && (
                <tfoot>
                  <tr className="bg-gray-50 font-medium">
                    <td className="px-4 py-3 text-sm text-gray-900" colSpan={2}>
                      Totals ({summary.day_count} days)
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">--</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(summary.total_revenue)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(summary.total_labor)}</td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      summary.labor_pct > 27 ? 'text-red-600' : summary.labor_pct > 24 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {formatPercent(summary.labor_pct)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(summary.total_delivery_net)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
