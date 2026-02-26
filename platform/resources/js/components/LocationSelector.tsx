import { useEffect } from 'react';
import { useLocations } from '@/api/hooks';

interface LocationSelectorProps {
  value: number | null;
  onChange: (id: number) => void;
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const { data: locations, loading } = useLocations();

  useEffect(() => {
    if (!value && locations.length > 0) {
      onChange(locations[0].id);
    }
  }, [value, locations, onChange]);

  if (loading) {
    return (
      <select disabled className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-400">
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
    >
      {locations.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {loc.name}
        </option>
      ))}
    </select>
  );
}
