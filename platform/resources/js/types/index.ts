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

export interface ComplianceRule {
  id: number;
  jurisdiction: string;
  certification_type: string;
  coverage_requirement: 'every_shift' | 'operating_hours' | 'per_location';
  constraint_type: 'hard' | 'soft';
  minimum_certified_count: number;
  expiration_months: number | null;
  active: boolean;
  notes: string | null;
}

export interface ComplianceViolation {
  date: string;
  rule: string;
  required: number;
  found: number;
  constraint_type: 'hard' | 'soft';
}

export interface ComplianceValidation {
  compliant: boolean;
  violations: ComplianceViolation[];
}

export interface PolicyExceptionRequest {
  id: number;
  schedule_day_id: number;
  requester_id: number;
  requester?: User;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_id: number | null;
  reviewer?: User;
  reviewed_at: string | null;
  created_at: string;
}

export interface PtoRequest {
  id: number;
  employee_id: number;
  employee?: Employee;
  location_id: number;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  created_at: string;
}

export interface VarianceDay {
  date: string;
  actual_revenue: number;
  actual_labor: number;
  planned_labor: number;
  variance: number;
  variance_pct: number;
}

export interface LocationRollup {
  location_id: number;
  code: string;
  name: string;
  revenue: number;
  labor: number;
  labor_pct: number;
}

export interface MultiLocationRollup {
  total_revenue: number;
  total_labor: number;
  total_delivery_net: number;
  labor_pct: number;
  gp_estimate: number;
  day_count: number;
  locations: LocationRollup[];
}

export interface CertificationEmployee {
  id: number;
  name: string;
  certifications: string[];
  expiry_dates: string[];
  days_until_expiry: number;
  status: 'valid' | 'expiring_soon' | 'expired';
}

export interface CertificationSummary {
  total_certified: number;
  expiring_soon: number;
  expired: number;
}

export interface OnboardingStep {
  completed: boolean;
  label: string;
  count?: number;
}

export interface OnboardingStatus {
  steps: Record<string, OnboardingStep>;
  current_step: string;
  progress_pct: number;
}

export interface BillingPlan {
  key: string;
  label: string;
  price: number;
  locations: number | string;
  features: string[];
}

export interface BillingStatus {
  plan: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  trial_ends_at: string | null;
  is_active: boolean;
  on_trial: boolean;
  plans: BillingPlan[];
}
