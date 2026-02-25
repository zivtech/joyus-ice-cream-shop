import { createExcelExportJob } from '../../exports/service.js';
import {
  createSyncRun,
  getSyncRunForUser,
  getReviewCorrelationsForUser,
  recomputeScheduleRecommendationsForUser,
  runComplianceCheckForUser,
} from '../../exports/ops-service.js';

interface OpsExecutorContext {
  userId: string;
}

function requireString(input: Record<string, unknown>, key: string): string {
  const value = input[key];
  if (typeof value === 'string' && value.trim()) return value.trim();
  throw new Error(`Missing required parameter: ${key}`);
}

function optionalString(input: Record<string, unknown>, key: string): string | undefined {
  const value = input[key];
  if (typeof value === 'string' && value.trim()) return value.trim();
  return undefined;
}

function optionalStringArray(input: Record<string, unknown>, key: string): string[] | undefined {
  const value = input[key];
  if (!Array.isArray(value)) return undefined;
  return value
    .map((entry) => String(entry || '').trim())
    .filter(Boolean);
}

function optionalObject(input: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const value = input[key];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function optionalBoolean(input: Record<string, unknown>, key: string): boolean | undefined {
  const value = input[key];
  if (typeof value === 'boolean') return value;
  return undefined;
}

export async function executeOpsTool(
  toolName: string,
  input: Record<string, unknown>,
  context: OpsExecutorContext
): Promise<unknown> {
  const tenantId = requireString(input, 'tenant_id');

  if (toolName === 'ops_export_excel') {
    const scope = optionalString(input, 'scope');
    const locations = optionalString(input, 'locations');
    const dateStart = optionalString(input, 'date_start');
    const dateEnd = optionalString(input, 'date_end');
    const scenarioId = optionalString(input, 'scenario_id');

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const { job, downloadUrl } = await createExcelExportJob({
      userId: context.userId,
      tenantId,
      baseUrl,
      request: {
        scope,
        locations,
        date_start: dateStart,
        date_end: dateEnd,
        scenario_id: scenarioId,
      },
    });

    return {
      export_id: job.id,
      tenant_id: job.tenantId,
      status: job.status,
      scope: job.scope,
      locations: job.locations,
      created_at: job.createdAt,
      expires_at: job.downloadExpiresAt,
      file_name: job.fileName,
      file_size_bytes: job.fileSizeBytes,
      download_url: downloadUrl,
    };
  }

  if (toolName === 'ops_sync_run_create') {
    const run = createSyncRun({
      userId: context.userId,
      tenantId,
      provider: optionalString(input, 'provider'),
      mode: optionalString(input, 'mode'),
      dateStart: optionalString(input, 'date_start'),
      dateEnd: optionalString(input, 'date_end'),
      locations: optionalStringArray(input, 'locations'),
    });

    return {
      run_id: run.id,
      tenant_id: run.tenantId,
      provider: run.provider,
      mode: run.mode,
      status: run.status,
      created_at: run.createdAt,
      completed_at: run.completedAt,
      record_count: run.recordCount,
      locations: run.locations,
    };
  }

  if (toolName === 'ops_sync_run_status') {
    const runId = requireString(input, 'run_id');
    const run = getSyncRunForUser(context.userId, tenantId, runId);
    if (!run) {
      throw new Error(`Sync run not found: ${runId}`);
    }

    return {
      run_id: run.id,
      tenant_id: run.tenantId,
      provider: run.provider,
      mode: run.mode,
      status: run.status,
      created_at: run.createdAt,
      updated_at: run.updatedAt,
      completed_at: run.completedAt,
      date_start: run.dateStart,
      date_end: run.dateEnd,
      record_count: run.recordCount,
      locations: run.locations,
    };
  }

  if (toolName === 'ops_review_shift_insights') {
    return getReviewCorrelationsForUser(context.userId, tenantId, {
      location_id: optionalString(input, 'location_id'),
      date_start: optionalString(input, 'date_start'),
      date_end: optionalString(input, 'date_end'),
    });
  }

  if (toolName === 'ops_recompute_staffing') {
    const scheduleId = requireString(input, 'schedule_id');
    return recomputeScheduleRecommendationsForUser({
      userId: context.userId,
      tenantId,
      scheduleId,
      assumptionPatch: optionalObject(input, 'assumption_patch'),
    });
  }

  if (toolName === 'ops_compliance_check') {
    const scheduleId = requireString(input, 'schedule_id');
    return runComplianceCheckForUser({
      userId: context.userId,
      tenantId,
      scheduleId,
      strict: optionalBoolean(input, 'strict'),
    });
  }

  throw new Error(`Unsupported ops tool: ${toolName}`);
}
