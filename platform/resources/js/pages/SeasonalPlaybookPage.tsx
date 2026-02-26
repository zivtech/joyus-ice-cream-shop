import { useState, useCallback } from 'react';
import { LocationSelector } from '@/components/LocationSelector';

interface SeasonCard {
  name: string;
  months: string;
  icon: string;
  description: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const SEASONS: SeasonCard[] = [
  {
    name: 'Winter',
    months: 'Dec - Feb',
    icon: '\u2744',
    description: 'Reduced hours, skeleton crew scheduling. Focus on maintenance, training, and catering prep.',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-700',
  },
  {
    name: 'Spring',
    months: 'Mar - May',
    icon: '\uD83C\uDF31',
    description: 'Ramp-up period. Hiring and onboarding for summer, weekend-heavy scheduling begins.',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    textClass: 'text-green-700',
  },
  {
    name: 'Summer',
    months: 'Jun - Aug',
    icon: '\u2600',
    description: 'Peak season. Maximum staffing, extended hours, event coverage, and delivery surge.',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-700',
  },
  {
    name: 'Fall',
    months: 'Sep - Nov',
    icon: '\uD83C\uDF42',
    description: 'Wind-down period. Reduce hours gradually, seasonal menu transitions, staff performance reviews.',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
    textClass: 'text-orange-700',
  },
];

export function SeasonalPlaybookPage() {
  const [locationId, setLocationId] = useState<number | null>(null);

  const handleLocationChange = useCallback((id: number) => {
    setLocationId(id);
  }, []);

  // Suppress unused variable warning — locationId will be used when the settings API is wired
  void locationId;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Seasonal Playbook</h1>
        <p className="text-sm text-gray-500 mt-1">Staffing strategies and targets by season.</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <LocationSelector value={locationId} onChange={handleLocationChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {SEASONS.map((season) => (
          <div
            key={season.name}
            className={`rounded-lg border ${season.borderClass} ${season.bgClass} p-6`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl" role="img" aria-label={season.name}>
                {season.icon}
              </span>
              <div>
                <h3 className={`text-base font-semibold ${season.textClass}`}>{season.name}</h3>
                <p className="text-xs text-gray-500">{season.months}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">{season.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <p className="text-sm font-medium text-gray-900 mb-1">Full Seasonal Playbook Coming Soon</p>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Configurable staffing targets per season, demand forecasts from historical data,
          and recommended shift templates will be available in a future update.
        </p>
      </div>
    </div>
  );
}
