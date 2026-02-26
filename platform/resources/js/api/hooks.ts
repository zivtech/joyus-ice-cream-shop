import { useState, useEffect, useCallback } from 'react';
import client from './client';
import type {
  Location,
  Employee,
  Schedule,
  DailyActual,
  DailyActualSummary,
  ComplianceRule,
  PolicyExceptionRequest,
  PtoRequest,
  VarianceDay,
  MultiLocationRollup,
  CertificationEmployee,
  CertificationSummary,
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

export function useComplianceRules(filters?: {
  jurisdiction?: string;
  active?: boolean;
}): HookResult<ComplianceRule[]> {
  const [data, setData] = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const jurisdiction = filters?.jurisdiction;
  const active = filters?.active;

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (jurisdiction) params.jurisdiction = jurisdiction;
    if (active !== undefined) params.active = String(active);
    client
      .get<ComplianceRule[]>('/compliance-rules', { params })
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load compliance rules.'))
      .finally(() => setLoading(false));
  }, [jurisdiction, active]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useExceptionRequests(filters?: {
  status?: string;
  schedule_id?: number;
}): HookResult<PolicyExceptionRequest[]> {
  const [data, setData] = useState<PolicyExceptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const status = filters?.status;
  const scheduleId = filters?.schedule_id;

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (scheduleId) params.schedule_id = String(scheduleId);
    client
      .get<PolicyExceptionRequest[]>('/exception-requests', { params })
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load exception requests.'))
      .finally(() => setLoading(false));
  }, [status, scheduleId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function usePtoRequests(filters?: {
  employee_id?: number;
  status?: string;
  location_id?: number;
}): HookResult<PtoRequest[]> {
  const [data, setData] = useState<PtoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const employeeId = filters?.employee_id;
  const status = filters?.status;
  const locationId = filters?.location_id;

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    const params: Record<string, string> = {};
    if (employeeId) params.employee_id = String(employeeId);
    if (status) params.status = status;
    if (locationId) params.location_id = String(locationId);
    client
      .get<PtoRequest[]>('/pto-requests', { params })
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load PTO requests.'))
      .finally(() => setLoading(false));
  }, [employeeId, status, locationId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useVariance(params: {
  location_id: number;
  start_date: string;
  end_date: string;
}): HookResult<VarianceDay[]> {
  const [data, setData] = useState<VarianceDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { location_id, start_date, end_date } = params;

  const refresh = useCallback(() => {
    if (!location_id) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const qp: Record<string, string> = {
      location_id: String(location_id),
      start_date,
      end_date,
    };
    client
      .get<VarianceDay[]>('/daily-actuals/variance', { params: qp })
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load variance data.'))
      .finally(() => setLoading(false));
  }, [location_id, start_date, end_date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useRollup(params: {
  start_date?: string;
  end_date?: string;
  month?: string;
}): HookResult<MultiLocationRollup | null> {
  const [data, setData] = useState<MultiLocationRollup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { start_date, end_date, month } = params;

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    const qp: Record<string, string> = {};
    if (start_date) qp.start_date = start_date;
    if (end_date) qp.end_date = end_date;
    if (month) qp.month = month;
    client
      .get<MultiLocationRollup>('/daily-actuals/rollup', { params: qp })
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load rollup data.'))
      .finally(() => setLoading(false));
  }, [start_date, end_date, month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useCertificationStatus(params?: {
  location_id?: number;
  expiring_within_days?: number;
}): HookResult<{ employees: CertificationEmployee[]; summary: CertificationSummary } | null> {
  const [data, setData] = useState<{
    employees: CertificationEmployee[];
    summary: CertificationSummary;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const locationId = params?.location_id;
  const expiringDays = params?.expiring_within_days;

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    const qp: Record<string, string> = {};
    if (locationId) qp.location_id = String(locationId);
    if (expiringDays) qp.expiring_within_days = String(expiringDays);
    client
      .get<{ employees: CertificationEmployee[]; summary: CertificationSummary }>(
        '/employees/certification-status',
        { params: qp },
      )
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load certification data.'))
      .finally(() => setLoading(false));
  }, [locationId, expiringDays]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
