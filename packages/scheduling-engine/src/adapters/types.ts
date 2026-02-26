/**
 * Adapter types — normalized data shapes that POS and delivery adapters produce.
 *
 * These are the contracts between external data sources (Square, Toast, DoorDash, etc.)
 * and the platform's internal data model. All adapters normalize their source-specific
 * formats into these shapes before storage.
 */

// ─── POS Normalized Types ──────────────────────────────────────────────────

/** Daily sales aggregate from any POS system. Maps to DailyActual DB row. */
export interface NormalizedDailySales {
  date: string;              // ISO date YYYY-MM-DD
  locationCode: string;      // tenant-local location code (e.g. "EP", "NL")
  transactions: number;      // total transaction count for the day
  revenue: number;           // gross revenue (dollars)
  storeLaborCost: number;    // total labor cost (dollars)
}

/** Employee record from any POS system. */
export interface NormalizedEmployee {
  externalId: string;        // POS-specific employee ID
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  roles: string[];           // POS job titles (e.g. "Team Member", "Key Lead")
  payRate?: number | null;   // hourly rate if available from POS
  locationCodes: string[];   // locations this employee is assigned to
  status: 'active' | 'inactive';
}

// ─── Delivery Normalized Types ─────────────────────────────────────────────

/** Daily delivery aggregate from any marketplace. Maps to DailyActual delivery fields. */
export interface NormalizedDeliveryDay {
  date: string;              // ISO date YYYY-MM-DD
  locationCode: string;
  source: string;            // adapter name: "doordash", "ubereats", "grubhub"
  orderCount: number;
  grossRevenue: number;      // before commissions/fees
  commission: number;        // marketplace commission
  fees: number;              // other marketplace fees
  netRevenue: number;        // grossRevenue - commission - fees
}

// ─── Schedule Publishing Types ─────────────────────────────────────────────

/** A single shift to publish to a POS system. */
export interface ShiftForPublish {
  date: string;              // ISO date YYYY-MM-DD
  startTime: string;         // "HH:MM" (24-hour)
  endTime: string;           // "HH:MM" (24-hour)
  role: string;              // position name
  employeeName?: string;     // for fuzzy-matching to POS employee
  employeeExternalId?: string; // direct POS employee ID if known
}

/** Full schedule payload for POS publishing. */
export interface ScheduleForPublish {
  locationCode: string;
  locationExternalId: string; // POS-specific location ID
  weekStart: string;         // ISO date of Monday
  shifts: ShiftForPublish[];
}

/** Result of publishing a single shift. */
export interface PublishShiftResult {
  shift: ShiftForPublish;
  success: boolean;
  externalShiftId?: string;  // POS-assigned ID for the created shift
  error?: string;
}

/** Aggregate result of publishing a full schedule. */
export interface PublishResult {
  locationCode: string;
  totalShifts: number;
  published: number;
  failed: number;
  skipped: number;           // e.g. duplicates detected
  results: PublishShiftResult[];
}

// ─── Adapter Configuration ─────────────────────────────────────────────────

/** Connection configuration for a POS adapter instance. */
export interface PosConnectionConfig {
  adapter: string;           // "square", "toast", "clover"
  locationExternalId: string; // POS-specific location ID
  credentials: Record<string, string>; // adapter-specific (e.g. { accessToken: "..." })
}

/** Connection configuration for a delivery marketplace adapter instance. */
export interface DeliveryConnectionConfig {
  adapter: string;           // "doordash", "ubereats", "grubhub"
  locationCode: string;
  credentials: Record<string, string>;
}

// ─── Sync Tracking ─────────────────────────────────────────────────────────

/** Result of a sync operation, for audit logging. */
export interface SyncResult {
  adapter: string;
  locationCode: string;
  periodStart: string;       // ISO date
  periodEnd: string;         // ISO date
  recordsSynced: number;
  recordsSkipped: number;
  status: 'completed' | 'failed';
  error?: string;
}
