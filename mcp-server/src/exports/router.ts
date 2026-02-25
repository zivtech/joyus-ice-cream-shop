import { Router, Request, Response, NextFunction } from 'express';

import { getUserFromToken } from '../auth/verify.js';
import { db, auditLogs } from '../db/client.js';

import {
  createConnectorAuthorization,
  createSyncRun,
  getLocationKpisForUser,
  getReviewCorrelationsForUser,
  getSyncRunForUser,
  ingestReviewsForUser,
  recomputeScheduleRecommendationsForUser,
  runComplianceCheckForUser,
} from './ops-service.js';
import { createExcelExportJob, getExcelExportJobForUser, resolveDownloadToken } from './service.js';
import { ExcelExportRequest } from './types.js';

interface AuthenticatedRequest extends Request {
  authUser?: {
    id: string;
    email: string;
    name: string | null;
  };
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

function inferredBaseUrl(req: Request): string {
  return process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
}

function queryString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) return value[0].trim();
  return undefined;
}

async function writeAudit(
  userId: string,
  tool: string,
  input: Record<string, unknown>,
  success: boolean,
  duration: number,
  error?: string
): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId,
      tool,
      input,
      success,
      duration,
      error,
    });
  } catch (auditError) {
    console.warn('Failed to persist export audit log', auditError);
  }
}

async function requireTokenAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  req.authUser = {
    id: user.id,
    email: user.email,
    name: user.name,
  };
  next();
}

export const exportRouter = Router();

exportRouter.post('/tenants/:tenantId/exports/excel', requireTokenAuth, async (req: AuthenticatedRequest, res: Response) => {
  const startedAt = Date.now();
  const user = req.authUser;
  const tenantId = req.params.tenantId;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as ExcelExportRequest;

  try {
    const { job, downloadUrl } = await createExcelExportJob({
      userId: user.id,
      tenantId,
      request: body,
      baseUrl: inferredBaseUrl(req),
    });

    await writeAudit(
      user.id,
      'ops_export_excel_api_create',
      {
        tenant_id: tenantId,
        scope: body.scope || 'current_view',
        locations: body.locations || 'current',
        scenario_id: body.scenario_id || null,
      },
      true,
      Date.now() - startedAt
    );

    res.status(201).json({
      export_id: job.id,
      tenant_id: job.tenantId,
      status: job.status,
      scope: job.scope,
      locations: job.locations,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
      download_url: downloadUrl,
      expires_at: job.downloadExpiresAt,
      file_name: job.fileName,
      file_size_bytes: job.fileSizeBytes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export generation failed';

    await writeAudit(
      user.id,
      'ops_export_excel_api_create',
      {
        tenant_id: tenantId,
        scope: body.scope || 'current_view',
        locations: body.locations || 'current',
        scenario_id: body.scenario_id || null,
      },
      false,
      Date.now() - startedAt,
      message
    );

    if (message.includes('not authorized')) {
      res.status(403).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
});

exportRouter.get('/tenants/:tenantId/exports/:exportId', requireTokenAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser;
  const { tenantId, exportId } = req.params;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const job = getExcelExportJobForUser(user.id, tenantId, exportId);
    if (!job) {
      res.status(404).json({ error: 'Export not found' });
      return;
    }

    res.json({
      export_id: job.id,
      tenant_id: job.tenantId,
      status: job.status,
      scope: job.scope,
      locations: job.locations,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
      expires_at: job.downloadExpiresAt,
      file_name: job.fileName,
      file_size_bytes: job.fileSizeBytes,
      error: job.error,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch export';
    if (message.includes('not authorized')) {
      res.status(403).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
});

exportRouter.post('/tenants/:tenantId/sync-runs', requireTokenAuth, async (req: AuthenticatedRequest, res: Response) => {
  const startedAt = Date.now();
  const user = req.authUser;
  const tenantId = req.params.tenantId;
  const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const run = createSyncRun({
      userId: user.id,
      tenantId,
      provider: queryString(body.provider),
      mode: queryString(body.mode),
      dateStart: queryString(body.date_start),
      dateEnd: queryString(body.date_end),
      locations: Array.isArray(body.locations) ? body.locations.map((value) => String(value || '')) : undefined,
    });

    await writeAudit(
      user.id,
      'ops_sync_run_create_api',
      {
        tenant_id: tenantId,
        provider: run.provider,
        mode: run.mode,
      },
      true,
      Date.now() - startedAt
    );

    res.status(201).json({
      run_id: run.id,
      tenant_id: run.tenantId,
      provider: run.provider,
      mode: run.mode,
      status: run.status,
      date_start: run.dateStart,
      date_end: run.dateEnd,
      record_count: run.recordCount,
      locations: run.locations,
      created_at: run.createdAt,
      updated_at: run.updatedAt,
      completed_at: run.completedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create sync run';
    await writeAudit(user.id, 'ops_sync_run_create_api', { tenant_id: tenantId }, false, Date.now() - startedAt, message);
    if (message.includes('not authorized')) {
      res.status(403).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
});

exportRouter.get('/tenants/:tenantId/sync-runs/:runId', requireTokenAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser;
  const { tenantId, runId } = req.params;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const run = getSyncRunForUser(user.id, tenantId, runId);
    if (!run) {
      res.status(404).json({ error: 'Sync run not found' });
      return;
    }

    res.json({
      run_id: run.id,
      tenant_id: run.tenantId,
      provider: run.provider,
      mode: run.mode,
      status: run.status,
      date_start: run.dateStart,
      date_end: run.dateEnd,
      record_count: run.recordCount,
      locations: run.locations,
      created_at: run.createdAt,
      updated_at: run.updatedAt,
      completed_at: run.completedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch sync run';
    if (message.includes('not authorized')) {
      res.status(403).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
});

exportRouter.post('/tenants/:tenantId/connectors/:provider/authorize', requireTokenAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser;
  const { tenantId, provider } = req.params;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const response = createConnectorAuthorization(user.id, tenantId, provider, inferredBaseUrl(req));
    res.status(201).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create connector authorization';
    if (message.includes('not authorized')) {
      res.status(403).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
});

exportRouter.get('/tenants/:tenantId/locations/:locationId/kpis', requireTokenAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser;
  const { tenantId, locationId } = req.params;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const response = getLocationKpisForUser(
      user.id,
      tenantId,
      locationId,
      queryString(req.query.start),
      queryString(req.query.end)
    );
    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch KPIs';
    if (message.includes('not authorized')) {
      res.status(403).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
});

exportRouter.post('/tenants/:tenantId/reviews/ingest', requireTokenAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser;
  const tenantId = req.params.tenantId;
  const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const response = ingestReviewsForUser(user.id, tenantId, queryString(body.provider) || 'google', body);
    res.status(201).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to ingest reviews';
    if (message.includes('not authorized')) {
      res.status(403).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
});

exportRouter.get('/tenants/:tenantId/reviews/correlations', requireTokenAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser;
  const tenantId = req.params.tenantId;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const response = getReviewCorrelationsForUser(user.id, tenantId, {
      location_id: queryString(req.query.location_id),
      date_start: queryString(req.query.date_start),
      date_end: queryString(req.query.date_end),
    });
    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch review correlations';
    if (message.includes('not authorized')) {
      res.status(403).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
});

exportRouter.post('/tenants/:tenantId/schedules/:scheduleId/recommendations/recompute', requireTokenAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser;
  const { tenantId, scheduleId } = req.params;
  const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const response = recomputeScheduleRecommendationsForUser({
      userId: user.id,
      tenantId,
      scheduleId,
      assumptionPatch: body.assumption_patch && typeof body.assumption_patch === 'object' && !Array.isArray(body.assumption_patch)
        ? body.assumption_patch as Record<string, unknown>
        : undefined,
    });
    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to recompute schedule recommendations';
    if (message.includes('not authorized')) {
      res.status(403).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
});

exportRouter.post('/tenants/:tenantId/schedules/:scheduleId/compliance/check', requireTokenAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.authUser;
  const { tenantId, scheduleId } = req.params;
  const body = req.body && typeof req.body === 'object' ? req.body as Record<string, unknown> : {};

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const response = runComplianceCheckForUser({
      userId: user.id,
      tenantId,
      scheduleId,
      strict: typeof body.strict === 'boolean' ? body.strict : undefined,
    });
    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to run compliance check';
    if (message.includes('not authorized')) {
      res.status(403).json({ error: message });
      return;
    }
    res.status(500).json({ error: message });
  }
});

exportRouter.get('/exports/download/:token', async (req: Request, res: Response) => {
  const token = req.params.token;
  const resolved = resolveDownloadToken(token);

  if (!resolved) {
    res.status(404).json({ error: 'Download link is invalid or expired' });
    return;
  }

  const { job, filePath } = resolved;
  const fileName = job.fileName || `${job.id}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.download(filePath, fileName);
});
