import { useState, useCallback } from 'react';
import { useDailyActuals, useDailyActualSummary } from '@/api/hooks';
import { LocationSelector } from '@/components/LocationSelector';
import { DateRangeSelector, getThisMonthRange } from '@/components/DateRangeSelector';
import type { DateRange } from '@/components/DateRangeSelector';
import { formatCurrency, formatPercent, formatDate, formatWeekday } from '@/utils/format';
import type { DailyActual } from '@/types';

type SortKey = 'date' | 'transactions' | 'revenue' | 'store_labor' | 'labor_pct' | 'delivery_net';
type SortDir = 'asc' | 'desc';

function sortActuals(rows: DailyActual[], key: SortKey, dir: SortDir): DailyActual[] {
  const sorted = [...rows].sort((a, b) => {
    let av: number;
    let bv: number;
    if (key === 'date') {
      return dir === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    }
    if (key === 'labor_pct') {
      av = a.revenue > 0 ? a.store_labor / a.revenue : 0;
      bv = b.revenue > 0 ? b.store_labor / b.revenue : 0;
    } else {
      av = a[key];
      bv = b[key];
    }
    return dir === 'asc' ? av - bv : bv - av;
  });
  return sorted;
}

export function ShiftAnalysisPage() {
  const [locationId, setLocationId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getThisMonthRange);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleLocationChange = useCallback((id: number) => {
    setLocationId(id);
  }, []);

  const params = {
    location_id: locationId ?? 0,
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
  };

  const { data: actuals, loading, error } = useDailyActuals(params);
  const { data: summary } = useDailyActualSummary(params);

  const sorted = sortActuals(actuals, sortKey, sortDir);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' \u2191' : ' \u2193';
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Shift Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">Review historical shift performance and labor data.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <LocationSelector value={locationId} onChange={handleLocationChange} />
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Daily Breakdown</h2>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No data for the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort('date')}
                  >
                    Date{sortIndicator('date')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Day</th>
                  <th
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort('transactions')}
                  >
                    Transactions{sortIndicator('transactions')}
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort('revenue')}
                  >
                    Revenue{sortIndicator('revenue')}
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort('store_labor')}
                  >
                    Labor{sortIndicator('store_labor')}
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort('labor_pct')}
                  >
                    Labor %{sortIndicator('labor_pct')}
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                    onClick={() => handleSort('delivery_net')}
                  >
                    Delivery Net{sortIndicator('delivery_net')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sorted.map((row) => {
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
                      Totals / Averages ({summary.day_count} days)
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
