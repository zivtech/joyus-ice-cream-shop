import type {
  WeatherRow,
  HourlyWeatherRow,
  WeatherNormals,
  TemperatureDelta,
  WeatherSignal,
  PrecipSignal,
} from '../types/index.js';

/**
 * Format a signed temperature delta for display.
 */
function formatSignedDegrees(value: number | null): string {
  if (!Number.isFinite(Number(value))) return 'N/A';
  const rounded = Math.round(Number(value));
  return `${rounded > 0 ? '+' : ''}${rounded}F`;
}

/**
 * Format an hour number as a 12-hour label (e.g. "8pm").
 */
function formatHourLabel(hour: number): string {
  const h = Number(hour);
  if (!Number.isFinite(h)) return 'unknown time';
  const normalized = ((h % 24) + 24) % 24;
  const meridiem = normalized >= 12 ? 'pm' : 'am';
  const twelveHour = normalized % 12 || 12;
  return `${twelveHour}${meridiem}`;
}

/**
 * Human-readable label for a weather code.
 * From staffing-planner.js:832-844.
 */
export function weatherCodeLabel(code: number): string {
  const val = Number(code);
  if (val === 0) return 'Clear';
  if ([1, 2].includes(val)) return 'Partly Cloudy';
  if (val === 3) return 'Overcast';
  if ([45, 48].includes(val)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(val)) return 'Drizzle';
  if ([61, 63, 65, 66, 67].includes(val)) return 'Rain';
  if ([71, 73, 75, 77].includes(val)) return 'Snow';
  if ([80, 81, 82].includes(val)) return 'Rain Showers';
  if ([85, 86].includes(val)) return 'Snow Showers';
  if ([95, 96, 99].includes(val)) return 'Thunderstorm';
  return 'Mixed';
}

/**
 * Look up the expected temperature for a date from weather normals.
 * From staffing-planner.js:847-851.
 */
export function expectedTempForDate(
  normals: WeatherNormals,
  dateIso: string,
): number | null {
  const key = String(dateIso || '').slice(5, 10);
  const value = normals[key];
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

/**
 * Temperature delta vs expected for a given date.
 * From staffing-planner.js:853-865.
 */
export function temperatureDeltaForDate(
  normals: WeatherNormals,
  dateIso: string,
  weatherRow: WeatherRow,
): TemperatureDelta {
  const actual = Number(weatherRow?.tempMax ?? NaN);
  const expected = expectedTempForDate(normals, dateIso);
  if (!Number.isFinite(actual) || expected === null) {
    return { available: false, actual: null, expected: expected ?? null, delta: null };
  }
  return {
    available: true,
    actual,
    expected,
    delta: actual - expected,
  };
}

/**
 * Detect timed precipitation signals from hourly forecast data.
 * From staffing-planner.js:1659-1689.
 */
export function timedPrecipSignal(
  hourlyForecast: HourlyWeatherRow[],
): PrecipSignal | null {
  if (!hourlyForecast.length) return null;

  const evening = hourlyForecast.filter(
    (row) => Number(row.hour) >= 20 && Number(row.hour) <= 23,
  );
  if (!evening.length) return null;

  const heavy = evening.find(
    (row) => Number(row.precipProb || 0) >= 75 || Number(row.precipMm || 0) >= 2,
  );
  if (heavy) {
    return {
      impact: 'down',
      label: 'Evening Rain Risk',
      window: 'evening',
      eventHour: Number(heavy.hour),
      reason: `Heavy precipitation likely after ${formatHourLabel(heavy.hour)} (${Math.round(Number(heavy.precipProb || 0))}% rain chance).`,
    };
  }

  const moderate = evening.find(
    (row) => Number(row.precipProb || 0) >= 60 || Number(row.precipMm || 0) >= 1,
  );
  if (moderate) {
    return {
      impact: 'down',
      label: 'Late Rain Risk',
      window: 'evening',
      eventHour: Number(moderate.hour),
      reason: `Rain risk increases around ${formatHourLabel(moderate.hour)} (${Math.round(Number(moderate.precipProb || 0))}% rain chance).`,
    };
  }

  return null;
}

/**
 * Comprehensive weather impact signal for a date.
 * From staffing-planner.js:873-951.
 * Uses thresholdF param (default 10) instead of hardcoded value.
 */
export function weatherImpactSignal(
  normals: WeatherNormals,
  dateIso: string,
  weatherRow: WeatherRow | null,
  hourlyForecast: HourlyWeatherRow[],
  thresholdF: number = 10,
): WeatherSignal {
  if (!weatherRow) {
    return {
      impact: 'neutral',
      label: 'No weather signal',
      reason: 'Weather data unavailable.',
      delta: null,
      expected: null,
      actual: null,
      window: null,
      eventHour: null,
    };
  }

  const timedSignal = timedPrecipSignal(hourlyForecast);
  if (timedSignal) {
    return {
      impact: timedSignal.impact,
      label: timedSignal.label,
      reason: timedSignal.reason,
      delta: null,
      expected: null,
      actual: Number(weatherRow.tempMax ?? null) || null,
      window: timedSignal.window,
      eventHour: timedSignal.eventHour,
    };
  }

  const deltaInfo = temperatureDeltaForDate(normals, dateIso, weatherRow);
  if (!deltaInfo.available) {
    return {
      impact: 'neutral',
      label: 'No baseline',
      reason: 'Expected temperature baseline unavailable for this date.',
      delta: null,
      expected: deltaInfo.expected,
      actual: deltaInfo.actual,
      window: null,
      eventHour: null,
    };
  }

  const delta = deltaInfo.delta!;
  const expected = deltaInfo.expected!;

  if (delta >= thresholdF) {
    return {
      impact: 'up',
      label: 'Demand Lift',
      reason: `High is ${formatSignedDegrees(delta)} vs expected ${Math.round(expected)}F.`,
      delta,
      expected,
      actual: deltaInfo.actual,
      window: null,
      eventHour: null,
    };
  }

  if (delta <= -thresholdF) {
    return {
      impact: 'down',
      label: 'Demand Risk',
      reason: `High is ${formatSignedDegrees(delta)} vs expected ${Math.round(expected)}F.`,
      delta,
      expected,
      actual: deltaInfo.actual,
      window: null,
      eventHour: null,
    };
  }

  return {
    impact: 'neutral',
    label: 'Near Expected',
    reason: `High is ${formatSignedDegrees(delta)} vs expected ${Math.round(expected)}F.`,
    delta,
    expected,
    actual: deltaInfo.actual,
    window: null,
    eventHour: null,
  };
}

/**
 * Staffing action text based on weather signal.
 * From staffing-planner.js:953-965.
 * Accepts optional min opener/closer counts to avoid hardcoded values in text.
 */
export function staffingWeatherAction(
  signal: WeatherSignal,
  minOpeners: number = 1,
  minClosers: number = 2,
): string {
  const floor = `${minOpeners} opener${minOpeners === 1 ? '' : 's'} and ${minClosers} closer${minClosers === 1 ? '' : 's'}`;
  if (signal.impact === 'up') {
    return `Weather recommendation: add +1 peak/support position (${formatSignedDegrees(signal.delta)} vs expected). Keep minimum ${floor}.`;
  }
  if (signal.impact === 'down') {
    if (signal.window === 'evening') {
      const hourText = Number.isFinite(Number(signal.eventHour))
        ? ` around ${formatHourLabel(signal.eventHour!)}`
        : '';
      return `Weather recommendation: trim 1 evening peak/support position${hourText}. Never below ${floor}.`;
    }
    return `Weather recommendation: trim 1 peak/support position (${formatSignedDegrees(signal.delta)} vs expected). Never below ${floor}.`;
  }
  return 'Weather recommendation: keep baseline staffing (temperature within expected range).';
}
