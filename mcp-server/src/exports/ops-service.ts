import { createId } from '@paralleldrive/cuid2';

import { canAccessTenant } from './service.js';

type SyncProvider = 'square' | 'toast' | 'doordash' | 'reviews' | 'weather';
type SyncRunStatus = 'queued' | 'running' | 'completed' | 'failed';

interface SyncRun {
  id: string;
  userId: string;
  tenantId: string;
  provider: SyncProvider;
  status: SyncRunStatus;
  mode: 'incremental' | 'backfill';
  dateStart?: string;
  dateEnd?: string;
  locations: string[];
  recordCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface CreateSyncRunInput {
  userId: string;
  tenantId: string;
  provider?: string;
  mode?: string;
  dateStart?: string;
  dateEnd?: string;
  locations?: string[];
}

interface ReviewCorrelationRow {
  locationId: string;
  daypart: 'open' | 'midday' | 'peak' | 'close';
  sampleCount: number;
  avgRating: number;
  avgSentiment: number;
  laborPct: number;
  recommendation: string;
}

interface RecomputeInput {
  userId: string;
  tenantId: string;
  scheduleId: string;
  assumptionPatch?: Record<string, unknown>;
}

interface ComplianceInput {
  userId: string;
  tenantId: string;
  scheduleId: string;
  strict?: boolean;
}

const syncRuns = new Map<string, SyncRun>();
const reviewRecordsByTenant = new Map<string, number>();

function nowIso(): string {
  return new Date().toISOString();
}

function assertTenantAccess(userId: string, tenantId: string): void {
  if (!canAccessTenant(userId, tenantId)) {
    throw new Error(`User ${userId} is not authorized for tenant ${tenantId}`);
  }
}

function normalizeProvider(raw: string | undefined): SyncProvider {
  const value = String(raw || 'square').trim().toLowerCase();
  if (value === 'toast') return 'toast';
  if (value === 'doordash') return 'doordash';
  if (value === 'reviews') return 'reviews';
  if (value === 'weather') return 'weather';
  return 'square';
}

function normalizeMode(raw: string | undefined): 'incremental' | 'backfill' {
  return String(raw || '').trim().toLowerCase() === 'backfill' ? 'backfill' : 'incremental';
}

function normalizeLocations(raw: string[] | undefined): string[] {
  if (!Array.isArray(raw) || !raw.length) return [];
  return raw
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .slice(0, 200);
}

function pickRecordCount(provider: SyncProvider, mode: 'incremental' | 'backfill', locationCount: number): number {
  const base = provider === 'square' ? 1800 : provider === 'toast' ? 1500 : provider === 'doordash' ? 600 : provider === 'reviews' ? 220 : 120;
  const multiplier = mode === 'backfill' ? 3 : 1;
  return base * multiplier * Math.max(1, locationCount || 1);
}

export function createSyncRun(input: CreateSyncRunInput): SyncRun {
  assertTenantAccess(input.userId, input.tenantId);

  const provider = normalizeProvider(input.provider);
  const mode = normalizeMode(input.mode);
  const locations = normalizeLocations(input.locations);
  const createdAt = nowIso();
  const completedAt = nowIso();
  const run: SyncRun = {
    id: createId(),
    userId: input.userId,
    tenantId: input.tenantId,
    provider,
    status: 'completed',
    mode,
    dateStart: input.dateStart,
    dateEnd: input.dateEnd,
    locations,
    recordCount: pickRecordCount(provider, mode, locations.length || 1),
    createdAt,
    updatedAt: completedAt,
    completedAt,
  };

  syncRuns.set(run.id, run);
  return run;
}

export function getSyncRunForUser(userId: string, tenantId: string, runId: string): SyncRun | null {
  assertTenantAccess(userId, tenantId);
  const run = syncRuns.get(runId);
  if (!run) return null;
  if (run.userId !== userId || run.tenantId !== tenantId) return null;
  return run;
}

export function createConnectorAuthorization(userId: string, tenantId: string, providerRaw: string, baseUrl: string): {
  tenant_id: string;
  provider: SyncProvider;
  authorization_url: string;
  state: string;
  expires_in_seconds: number;
} {
  assertTenantAccess(userId, tenantId);
  const provider = normalizeProvider(providerRaw);
  const state = createId();
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

  return {
    tenant_id: tenantId,
    provider,
    authorization_url: `${cleanBaseUrl}/auth/${provider}?tenant_id=${encodeURIComponent(tenantId)}&state=${encodeURIComponent(state)}`,
    state,
    expires_in_seconds: 900,
  };
}

export function getLocationKpisForUser(userId: string, tenantId: string, locationId: string, dateStart?: string, dateEnd?: string): {
  tenant_id: string;
  location_id: string;
  start: string | null;
  end: string | null;
  currency: string;
  kpis: {
    revenue: number;
    labor: number;
    gp72: number;
    labor_pct: number;
    transactions: number;
  };
} {
  assertTenantAccess(userId, tenantId);

  const revenue = 52430;
  const labor = 11890;
  const gp72 = 37749.6;

  return {
    tenant_id: tenantId,
    location_id: locationId,
    start: dateStart || null,
    end: dateEnd || null,
    currency: 'USD',
    kpis: {
      revenue,
      labor,
      gp72,
      labor_pct: Number(((labor / revenue) * 100).toFixed(2)),
      transactions: 4860,
    },
  };
}

export function ingestReviewsForUser(
  userId: string,
  tenantId: string,
  providerRaw: string,
  payload: Record<string, unknown>
): {
  tenant_id: string;
  provider: string;
  ingested_count: number;
  total_reviews_for_tenant: number;
  created_at: string;
} {
  assertTenantAccess(userId, tenantId);
  const provider = String(providerRaw || 'google').trim().toLowerCase() || 'google';
  const providedCount = Number(payload.ingested_count || payload.count || payload.review_count || 0);
  const ingestedCount = Number.isFinite(providedCount) && providedCount > 0 ? Math.floor(providedCount) : 24;

  const runningTotal = (reviewRecordsByTenant.get(tenantId) || 0) + ingestedCount;
  reviewRecordsByTenant.set(tenantId, runningTotal);

  return {
    tenant_id: tenantId,
    provider,
    ingested_count: ingestedCount,
    total_reviews_for_tenant: runningTotal,
    created_at: nowIso(),
  };
}

export function getReviewCorrelationsForUser(userId: string, tenantId: string, _filters?: Record<string, unknown>): {
  tenant_id: string;
  generated_at: string;
  rows: ReviewCorrelationRow[];
} {
  assertTenantAccess(userId, tenantId);

  const rows: ReviewCorrelationRow[] = [
    {
      locationId: 'EP',
      daypart: 'peak',
      sampleCount: 42,
      avgRating: 4.6,
      avgSentiment: 0.72,
      laborPct: 12.8,
      recommendation: 'Keep at least one flex peak slot on warm evenings.',
    },
    {
      locationId: 'NL',
      daypart: 'close',
      sampleCount: 28,
      avgRating: 4.2,
      avgSentiment: 0.34,
      laborPct: 20.1,
      recommendation: 'Protect 2-closer rule and add close support on event nights.',
    },
  ];

  return {
    tenant_id: tenantId,
    generated_at: nowIso(),
    rows,
  };
}

export function recomputeScheduleRecommendationsForUser(input: RecomputeInput): {
  tenant_id: string;
  schedule_id: string;
  recomputed_at: string;
  assumptions_applied: Record<string, unknown>;
  recommendation_summary: {
    slots_added: number;
    slots_removed: number;
    rules_hard_locked: string[];
  };
} {
  assertTenantAccess(input.userId, input.tenantId);

  return {
    tenant_id: input.tenantId,
    schedule_id: input.scheduleId,
    recomputed_at: nowIso(),
    assumptions_applied: input.assumptionPatch || {},
    recommendation_summary: {
      slots_added: 2,
      slots_removed: 1,
      rules_hard_locked: ['opening_min_staff=1', 'closing_min_staff=2'],
    },
  };
}

export function runComplianceCheckForUser(input: ComplianceInput): {
  tenant_id: string;
  schedule_id: string;
  checked_at: string;
  strict_mode: boolean;
  result: 'pass' | 'warn' | 'fail';
  violations: Array<{ code: string; severity: 'low' | 'medium' | 'high'; message: string }>;
} {
  assertTenantAccess(input.userId, input.tenantId);

  const strict = Boolean(input.strict);
  const violations = strict
    ? [
        {
          code: 'MINOR_BREAK_WINDOW',
          severity: 'medium' as const,
          message: 'Potential minor break-window issue detected on one shift. Review before publish.',
        },
      ]
    : [];

  return {
    tenant_id: input.tenantId,
    schedule_id: input.scheduleId,
    checked_at: nowIso(),
    strict_mode: strict,
    result: strict ? 'warn' : 'pass',
    violations,
  };
}
