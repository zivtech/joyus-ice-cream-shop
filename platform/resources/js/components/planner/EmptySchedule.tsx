interface EmptyScheduleProps {
  weekStart: string;
  locationId: number | null;
  onCreateClick: () => void;
}

export function EmptySchedule({ weekStart, locationId, onCreateClick }: EmptyScheduleProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow">
      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className="text-sm font-medium text-gray-900 mb-1">No schedule for this week</p>
      <p className="text-xs text-gray-500 mb-4">
        Week of {weekStart}
      </p>
      <button
        type="button"
        disabled={!locationId}
        onClick={onCreateClick}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Create Draft Schedule
      </button>
    </div>
  );
}
