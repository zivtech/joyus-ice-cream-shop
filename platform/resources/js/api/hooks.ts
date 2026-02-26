import { useState, useEffect, useCallback } from 'react';
import client from './client';
import type {
  Location,
  Employee,
  Schedule,
  DailyActual,
  DailyActualSummary,
} from '@/types';

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface HookResult<T> {
  data: T;
  loading: boolean;
  error: string;
  refresh: () => void;
}

export function useLocations(): HookResult<Location[]> {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    client
      .get<PaginatedResponse<Location>>('/locations')
      .then((res) => setData(res.data.data))
      .catch(() => setError('Failed to load locations.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useEmployees(locationId?: number): HookResult<Employee[]> {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (locationId) params.location_id = String(locationId);
    client
      .get<PaginatedResponse<Employee>>('/employees', { params })
      .then((res) => setData(res.data.data))
      .catch(() => setError('Failed to load employees.'))
      .finally(() => setLoading(false));
  }, [locationId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useSchedules(filters?: {
  location_id?: number;
  status?: string;
  week_start?: string;
}): HookResult<Schedule[]> {
  const [data, setData] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const locationId = filters?.location_id;
  const status = filters?.status;
  const weekStart = filters?.week_start;

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (locationId) params.location_id = String(locationId);
    if (status) params.status = status;
    if (weekStart) params.week_start = weekStart;
    client
      .get<PaginatedResponse<Schedule>>('/schedules', { params })
      .then((res) => setData(res.data.data))
      .catch(() => setError('Failed to load schedules.'))
      .finally(() => setLoading(false));
  }, [locationId, status, weekStart]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useSchedule(id: number | null): HookResult<Schedule | null> {
  const [data, setData] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    client
      .get<Schedule>(`/schedules/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load schedule.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useDailyActuals(params: {
  location_id: number;
  start_date?: string;
  end_date?: string;
  month?: string;
}): HookResult<DailyActual[]> {
  const [data, setData] = useState<DailyActual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { location_id, start_date, end_date, month } = params;

  const refresh = useCallback(() => {
    if (!location_id) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const qp: Record<string, string> = { location_id: String(location_id) };
    if (start_date) qp.start_date = start_date;
    if (end_date) qp.end_date = end_date;
    if (month) qp.month = month;
    client
      .get<PaginatedResponse<DailyActual>>('/daily-actuals', { params: qp })
      .then((res) => setData(res.data.data))
      .catch(() => setError('Failed to load daily actuals.'))
      .finally(() => setLoading(false));
  }, [location_id, start_date, end_date, month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useDailyActualSummary(params: {
  location_id: number;
  start_date?: string;
  end_date?: string;
  month?: string;
}): HookResult<DailyActualSummary | null> {
  const [data, setData] = useState<DailyActualSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { location_id, start_date, end_date, month } = params;

  const refresh = useCallback(() => {
    if (!location_id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const qp: Record<string, string> = { location_id: String(location_id) };
    if (start_date) qp.start_date = start_date;
    if (end_date) qp.end_date = end_date;
    if (month) qp.month = month;
    client
      .get<DailyActualSummary>('/daily-actuals/summary', { params: qp })
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load summary.'))
      .finally(() => setLoading(false));
  }, [location_id, start_date, end_date, month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
