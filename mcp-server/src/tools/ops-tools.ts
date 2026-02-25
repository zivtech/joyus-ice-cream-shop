/**
 * Joyus Fast Casual Tool Definitions
 */

import { ToolDefinition } from './index.js';

export const opsTools: ToolDefinition[] = [
  {
    name: 'ops_export_excel',
    description:
      'Generate a Joyus Fast Casual operator workbook (.xlsx) and return a signed download URL. Supports current-view or full-period scope.',
    inputSchema: {
      type: 'object',
      properties: {
        tenant_id: { type: 'string', description: 'Tenant identifier' },
        scope: {
          type: 'string',
          enum: ['current_view', 'full_period'],
          description: 'Export scope. Defaults to current_view.',
        },
        locations: {
          type: 'string',
          enum: ['current', 'all_accessible'],
          description: 'Location scope. Defaults to current.',
        },
        date_start: { type: 'string', description: 'Optional start date in YYYY-MM-DD' },
        date_end: { type: 'string', description: 'Optional end date in YYYY-MM-DD' },
        scenario_id: { type: 'string', description: 'Optional scenario identifier' },
      },
      required: ['tenant_id'],
    },
  },
  {
    name: 'ops_sync_run_create',
    description: 'Create a tenant-scoped data sync run for a provider (Square first, Toast second).',
    inputSchema: {
      type: 'object',
      properties: {
        tenant_id: { type: 'string', description: 'Tenant identifier' },
        provider: {
          type: 'string',
          enum: ['square', 'toast', 'doordash', 'reviews', 'weather'],
          description: 'Sync provider. Defaults to square.',
        },
        mode: {
          type: 'string',
          enum: ['incremental', 'backfill'],
          description: 'Sync mode. Defaults to incremental.',
        },
        date_start: { type: 'string', description: 'Optional start date in YYYY-MM-DD' },
        date_end: { type: 'string', description: 'Optional end date in YYYY-MM-DD' },
        locations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional location IDs/codes to scope the sync run.',
        },
      },
      required: ['tenant_id'],
    },
  },
  {
    name: 'ops_sync_run_status',
    description: 'Get status for a previously created sync run.',
    inputSchema: {
      type: 'object',
      properties: {
        tenant_id: { type: 'string', description: 'Tenant identifier' },
        run_id: { type: 'string', description: 'Sync run identifier' },
      },
      required: ['tenant_id', 'run_id'],
    },
  },
  {
    name: 'ops_review_shift_insights',
    description: 'Return review-to-shift correlation insights for staffing and customer experience analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        tenant_id: { type: 'string', description: 'Tenant identifier' },
        location_id: { type: 'string', description: 'Optional location scope' },
        date_start: { type: 'string', description: 'Optional start date in YYYY-MM-DD' },
        date_end: { type: 'string', description: 'Optional end date in YYYY-MM-DD' },
      },
      required: ['tenant_id'],
    },
  },
  {
    name: 'ops_recompute_staffing',
    description: 'Recompute staffing recommendations for a schedule using updated assumptions.',
    inputSchema: {
      type: 'object',
      properties: {
        tenant_id: { type: 'string', description: 'Tenant identifier' },
        schedule_id: { type: 'string', description: 'Schedule identifier' },
        assumption_patch: {
          type: 'object',
          description: 'Optional assumption overrides to apply before recompute.',
        },
      },
      required: ['tenant_id', 'schedule_id'],
    },
  },
  {
    name: 'ops_compliance_check',
    description: 'Run compliance checks for a schedule before approval or publish.',
    inputSchema: {
      type: 'object',
      properties: {
        tenant_id: { type: 'string', description: 'Tenant identifier' },
        schedule_id: { type: 'string', description: 'Schedule identifier' },
        strict: {
          type: 'boolean',
          description: 'Enable strict validation mode with warning/violation detail.',
        },
      },
      required: ['tenant_id', 'schedule_id'],
    },
  },
];
