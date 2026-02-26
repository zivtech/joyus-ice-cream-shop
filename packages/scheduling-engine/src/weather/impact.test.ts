import { describe, it, expect } from 'vitest';
import {
  weatherCodeLabel,
  expectedTempForDate,
  temperatureDeltaForDate,
  weatherImpactSignal,
  timedPrecipSignal,
} from './impact.js';
import type { WeatherNormals, WeatherRow, HourlyWeatherRow } from '../types/index.js';

describe('weatherCodeLabel', () => {
  it('returns Clear for code 0', () => {
    expect(weatherCodeLabel(0)).toBe('Clear');
  });

  it('returns Rain for rain codes', () => {
    expect(weatherCodeLabel(61)).toBe('Rain');
    expect(weatherCodeLabel(65)).toBe('Rain');
  });

  it('returns Mixed for unknown codes', () => {
    expect(weatherCodeLabel(999)).toBe('Mixed');
  });
});

describe('expectedTempForDate', () => {
  const normals: WeatherNormals = {
    '01-15': 35,
    '07-04': 85,
  };

  it('looks up expected temp by MM-DD key', () => {
    expect(expectedTempForDate(normals, '2025-01-15')).toBe(35);
    expect(expectedTempForDate(normals, '2025-07-04')).toBe(85);
  });

  it('returns null for missing date', () => {
    expect(expectedTempForDate(normals, '2025-03-01')).toBeNull();
  });
});

describe('temperatureDeltaForDate', () => {
  const normals: WeatherNormals = { '07-04': 85 };

  it('computes delta when data is available', () => {
    const result = temperatureDeltaForDate(normals, '2025-07-04', { tempMax: 95 });
    expect(result.available).toBe(true);
    expect(result.delta).toBe(10);
    expect(result.actual).toBe(95);
    expect(result.expected).toBe(85);
  });

  it('returns unavailable when tempMax is missing', () => {
    const result = temperatureDeltaForDate(normals, '2025-07-04', {});
    expect(result.available).toBe(false);
  });
});

describe('weatherImpactSignal', () => {
  const normals: WeatherNormals = { '07-04': 85 };

  it('returns neutral for no weather row', () => {
    const signal = weatherImpactSignal(normals, '2025-07-04', null, []);
    expect(signal.impact).toBe('neutral');
    expect(signal.label).toBe('No weather signal');
  });

  it('returns up signal for high temp delta', () => {
    const signal = weatherImpactSignal(normals, '2025-07-04', { tempMax: 96 }, []);
    expect(signal.impact).toBe('up');
    expect(signal.label).toBe('Demand Lift');
    expect(signal.delta).toBe(11);
  });

  it('returns down signal for low temp delta', () => {
    const signal = weatherImpactSignal(normals, '2025-07-04', { tempMax: 74 }, []);
    expect(signal.impact).toBe('down');
    expect(signal.label).toBe('Demand Risk');
    expect(signal.delta).toBe(-11);
  });

  it('returns neutral for near-expected temp', () => {
    const signal = weatherImpactSignal(normals, '2025-07-04', { tempMax: 88 }, []);
    expect(signal.impact).toBe('neutral');
    expect(signal.label).toBe('Near Expected');
  });

  it('uses custom threshold', () => {
    // Delta is +6, default threshold 10 => neutral, but threshold 5 => up
    const signal = weatherImpactSignal(normals, '2025-07-04', { tempMax: 91 }, [], 5);
    expect(signal.impact).toBe('up');
  });

  it('prioritizes timed precip signal over temperature', () => {
    const hourly: HourlyWeatherRow[] = [
      { hour: 20, precipProb: 80, precipMm: 3 },
      { hour: 21, precipProb: 50 },
    ];
    const signal = weatherImpactSignal(normals, '2025-07-04', { tempMax: 96 }, hourly);
    expect(signal.impact).toBe('down');
    expect(signal.label).toBe('Evening Rain Risk');
    expect(signal.window).toBe('evening');
  });
});

describe('timedPrecipSignal', () => {
  it('returns null when no hourly data', () => {
    expect(timedPrecipSignal([])).toBeNull();
  });

  it('returns null when no evening hours', () => {
    const hourly: HourlyWeatherRow[] = [
      { hour: 14, precipProb: 80 },
      { hour: 15, precipProb: 90 },
    ];
    expect(timedPrecipSignal(hourly)).toBeNull();
  });

  it('detects heavy evening precipitation', () => {
    const hourly: HourlyWeatherRow[] = [
      { hour: 20, precipProb: 80, precipMm: 3 },
    ];
    const result = timedPrecipSignal(hourly);
    expect(result).not.toBeNull();
    expect(result!.impact).toBe('down');
    expect(result!.label).toBe('Evening Rain Risk');
    expect(result!.eventHour).toBe(20);
  });

  it('detects moderate evening precipitation', () => {
    const hourly: HourlyWeatherRow[] = [
      { hour: 21, precipProb: 65, precipMm: 0.5 },
    ];
    const result = timedPrecipSignal(hourly);
    expect(result).not.toBeNull();
    expect(result!.label).toBe('Late Rain Risk');
  });

  it('returns null for low evening precipitation', () => {
    const hourly: HourlyWeatherRow[] = [
      { hour: 20, precipProb: 30, precipMm: 0.2 },
    ];
    expect(timedPrecipSignal(hourly)).toBeNull();
  });
});
