import { formatWeekRange, toISODate } from '@/utils/format';

interface WeekSelectorProps {
  value: string;
  onChange: (weekStart: string) => void;
}

export function WeekSelector({ value, onChange }: WeekSelectorProps) {
  function shiftWeek(direction: -1 | 1) {
    const current = new Date(value + 'T00:00:00');
    current.setDate(current.getDate() + direction * 7);
    onChange(toISODate(current));
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => shiftWeek(-1)}
        className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 transition-colors"
        aria-label="Previous week"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span className="text-sm font-medium text-gray-900 min-w-[180px] text-center">
        {formatWeekRange(value)}
      </span>
      <button
        type="button"
        onClick={() => shiftWeek(1)}
        className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 transition-colors"
        aria-label="Next week"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
