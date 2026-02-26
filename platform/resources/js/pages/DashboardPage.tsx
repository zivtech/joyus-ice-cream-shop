import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDailyActuals, useDailyActualSummary, useRollup } from '@/api/hooks';
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
  const [showPortfolio, setShowPortfolio] = useState(false);

  const handleLocationChange = useCallback((id: number) => {
    setLocationId(id);
    setShowPortfolio(false);
  }, []);

  const summaryParams = {
    location_id: locationId ?? 0,
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
  };

  const { data: summary, loading: summaryLoading, error: summaryError } = useDailyActualSummary(summaryParams);
  const { data: actuals, loading: actualsLoading, error: actualsError } = useDailyActuals(summaryParams);
  const { data: rollup, loading: rollupLoading, error: rollupError } = useRollup({
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
  });

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
        <button
          type="button"
          onClick={() => setShowPortfolio((v) => !v)}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            showPortfolio
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All Locations
        </button>
      </div>

      {/* Portfolio / Multi-Location Rollup */}
      {showPortfolio && (
        <>
          {rollupError && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {rollupError}
            </div>
          )}

          {rollupLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4 border-l-4 border-l-gray-200 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : rollup ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <KpiCard title="Total Revenue" value={rollup.total_revenue} format="currency" />
                <KpiCard title="Total Labor" value={rollup.total_labor} format="currency" />
                <KpiCard
                  title="Labor %"
                  value={rollup.labor_pct}
                  format="percent"
                  tone={laborTone(rollup.labor_pct)}
                />
                <KpiCard
                  title="Gross Profit"
                  value={rollup.gp_estimate}
                  format="currency"
                  tone={gpTone(rollup.gp_estimate)}
                />
                <KpiCard title="Days" value={rollup.day_count} format="currency" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {rollup.locations.map((loc) => (
                  <div key={loc.location_id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{loc.name}</h3>
                        <p className="text-xs text-gray-400">{loc.code}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        loc.labor_pct > 27 ? 'bg-red-100 text-red-700' :
                        loc.labor_pct > 24 ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {formatPercent(loc.labor_pct)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Revenue</p>
                        <p className="font-medium text-gray-900">{formatCurrency(loc.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Labor</p>
                        <p className="font-medium text-gray-900">{formatCurrency(loc.labor)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              No portfolio data available.
            </div>
          )}
        </>
      )}

      {/* Single-location view */}
      {!showPortfolio && (
        <>
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
        </>
      )}
    </div>
  );
}
