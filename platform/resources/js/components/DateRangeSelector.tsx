import { getMonday, toISODate } from '@/utils/format';

export interface DateRange {
  start_date: string;
  end_date: string;
}

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function getThisWeekRange(): DateRange {
  const monday = getMonday(new Date());
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start_date: toISODate(monday), end_date: toISODate(sunday) };
}

function getThisMonthRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start_date: toISODate(start), end_date: toISODate(end) };
}

function getLastMonthRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return { start_date: toISODate(start), end_date: toISODate(end) };
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(getThisWeekRange())}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        This Week
      </button>
      <button
        type="button"
        onClick={() => onChange(getThisMonthRange())}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        This Month
      </button>
      <button
        type="button"
        onClick={() => onChange(getLastMonthRange())}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Last Month
      </button>
      <div className="flex items-center gap-1 ml-2">
        <input
          type="date"
          value={value.start_date}
          onChange={(e) => onChange({ ...value, start_date: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <span className="text-gray-400 text-sm">to</span>
        <input
          type="date"
          value={value.end_date}
          onChange={(e) => onChange({ ...value, end_date: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}

export { getThisWeekRange, getThisMonthRange };
