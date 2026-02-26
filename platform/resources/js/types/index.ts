export type Role = 'admin' | 'gm' | 'store_manager' | 'key_lead' | 'staff';

export interface Organization {
  id: number;
  name: string;
  slug: string;
  timezone: string;
  status: string;
  role_labels: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  organization: Organization;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  code: string;
  name: string;
  timezone: string;
  square_location_id: string | null;
  pos_adapter: string;
  status: 'active' | 'inactive';
}

export interface Employee {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  pay_rate: number;
  status: 'active' | 'inactive' | 'terminated';
  location_id: number | null;
}

export type ScheduleStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'published';

export interface Schedule {
  id: number;
  location_id: number;
  location?: Location;
  week_start: string;
  status: ScheduleStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewer_id: number | null;
  reviewer?: User;
  published_at: string | null;
  notes: string | null;
  days: ScheduleDay[];
  created_at: string;
  updated_at: string;
}

export interface ScheduleDay {
  id: number;
  schedule_id: number;
  date: string;
  slots: ScheduleSlot[];
}

export interface ScheduleSlot {
  id: number;
  schedule_day_id: number;
  start_time: string;
  end_time: string;
  role: string;
  headcount: number;
  assignments: ShiftAssignment[];
}

export interface ShiftAssignment {
  id: number;
  schedule_slot_id: number;
  employee_id: number;
  employee?: Employee;
  position_index: number;
}

export interface DailyActual {
  id: number;
  location_id: number;
  date: string;
  transactions: number;
  revenue: number;
  store_labor: number;
  delivery_net: number;
  delivery_gross: number | null;
  delivery_commission: number | null;
  delivery_source: string | null;
}

export interface DailyActualSummary {
  total_revenue: number;
  total_labor: number;
  total_delivery_net: number;
  avg_daily_revenue: number;
  avg_daily_labor: number;
  labor_pct: number;
  day_count: number;
  gp_estimate: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  organization_name: string;
}
