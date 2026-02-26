import express from 'express';
import type { Request, Response } from 'express';

import {
  weeklyMetricsForLocationAtMonth,
  monthlyMetricsForLocationAtMonth,
  dayValidation,
  dayFinancialViability,
  weatherImpactSignal,
  overstaffAssessment,
  nextWeekChecks,
  triggerTimingForLocation,
} from '../src/index.js';

const app = express();
app.use(express.json());

const PORT = Number(process.env['ENGINE_PORT'] ?? 3100);

// ─── Health ──────────────────────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// ─── Weekly Metrics ──────────────────────────────────────────────────────────

app.post('/compute/weekly-metrics', (req: Request, res: Response) => {
  try {
    const {
      weekdayProfile,
      mondayLabor,
      planKey,
      mondayScenario,
      settings,
      managerActive,
      managerMgmtShare,
      mode,
    } = req.body as {
      weekdayProfile: Parameters<typeof weeklyMetricsForLocationAtMonth>[0];
      mondayLabor: number;
      planKey: string;
      mondayScenario: string;
      settings: Parameters<typeof weeklyMetricsForLocationAtMonth>[4];
      managerActive: boolean;
      managerMgmtShare: number;
      mode: Parameters<typeof weeklyMetricsForLocationAtMonth>[7];
    };
    const result = weeklyMetricsForLocationAtMonth(
      weekdayProfile,
      mondayLabor,
      planKey,
      mondayScenario,
      settings,
      managerActive,
      managerMgmtShare,
      mode,
    );
    res.json(result);
  } catch (err) {
    console.error('[/compute/weekly-metrics]', err);
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Monthly Metrics ─────────────────────────────────────────────────────────

app.post('/compute/monthly-metrics', (req: Request, res: Response) => {
  try {
    const {
      monthlyRow,
      weekdayProfile,
      calendarMonth,
      mondayLabor,
      planKey,
      mondayScenario,
      settings,
      managerActive,
      managerMgmtShare,
      mode,
    } = req.body as {
      monthlyRow: Parameters<typeof monthlyMetricsForLocationAtMonth>[0];
      weekdayProfile: Parameters<typeof monthlyMetricsForLocationAtMonth>[1];
      calendarMonth: Parameters<typeof monthlyMetricsForLocationAtMonth>[2];
      mondayLabor: number;
      planKey: string;
      mondayScenario: string;
      settings: Parameters<typeof monthlyMetricsForLocationAtMonth>[6];
      managerActive: boolean;
      managerMgmtShare: number;
      mode: Parameters<typeof monthlyMetricsForLocationAtMonth>[9];
    };
    const result = monthlyMetricsForLocationAtMonth(
      monthlyRow,
      weekdayProfile,
      calendarMonth,
      mondayLabor,
      planKey,
      mondayScenario,
      settings,
      managerActive,
      managerMgmtShare,
      mode,
    );
    res.json(result);
  } catch (err) {
    console.error('[/compute/monthly-metrics]', err);
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Day Validation ───────────────────────────────────────────────────────────

app.post('/compute/day-validation', (req: Request, res: Response) => {
  try {
    const { day, workflow } = req.body as {
      day: Parameters<typeof dayValidation>[0];
      workflow: Parameters<typeof dayValidation>[1];
    };
    const result = dayValidation(day, workflow);
    res.json(result);
  } catch (err) {
    console.error('[/compute/day-validation]', err);
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Financial Viability ──────────────────────────────────────────────────────

app.post('/compute/financial-viability', (req: Request, res: Response) => {
  try {
    const { expected, day, settings } = req.body as {
      expected: Parameters<typeof dayFinancialViability>[0];
      day: Parameters<typeof dayFinancialViability>[1];
      settings: Parameters<typeof dayFinancialViability>[2];
    };
    const result = dayFinancialViability(expected, day, settings);
    res.json(result);
  } catch (err) {
    console.error('[/compute/financial-viability]', err);
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Weather Impact ───────────────────────────────────────────────────────────

app.post('/compute/weather-impact', (req: Request, res: Response) => {
  try {
    const { normals, dateIso, weatherRow, hourlyForecast, thresholdF } = req.body as {
      normals: Parameters<typeof weatherImpactSignal>[0];
      dateIso: string;
      weatherRow: Parameters<typeof weatherImpactSignal>[2];
      hourlyForecast: Parameters<typeof weatherImpactSignal>[3];
      thresholdF?: number;
    };
    const result = weatherImpactSignal(normals, dateIso, weatherRow, hourlyForecast, thresholdF);
    res.json(result);
  } catch (err) {
    console.error('[/compute/weather-impact]', err);
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Overstaff Assessment ─────────────────────────────────────────────────────

app.post('/compute/overstaff-assessment', (req: Request, res: Response) => {
  try {
    const { expected, actualRevenue, actualLabor, weatherSignal, settings } = req.body as {
      expected: Parameters<typeof overstaffAssessment>[0];
      actualRevenue: number;
      actualLabor: number;
      weatherSignal: Parameters<typeof overstaffAssessment>[3];
      settings: Parameters<typeof overstaffAssessment>[4];
    };
    const result = overstaffAssessment(expected, actualRevenue, actualLabor, weatherSignal, settings);
    res.json(result);
  } catch (err) {
    console.error('[/compute/overstaff-assessment]', err);
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Week Readiness ───────────────────────────────────────────────────────────

app.post('/compute/week-readiness', (req: Request, res: Response) => {
  try {
    const { week, location, ptoRequests, workflow } = req.body as {
      week: Parameters<typeof nextWeekChecks>[0];
      location: string;
      ptoRequests: Parameters<typeof nextWeekChecks>[2];
      workflow: Parameters<typeof nextWeekChecks>[3];
    };
    const result = nextWeekChecks(week, location, ptoRequests, workflow);
    res.json(result);
  } catch (err) {
    console.error('[/compute/week-readiness]', err);
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Trigger Timing ───────────────────────────────────────────────────────────

app.post('/compute/trigger-timing', (req: Request, res: Response) => {
  try {
    const { rules, monthKeys, metrics, currentMonth, monthLabels } = req.body as {
      rules: Parameters<typeof triggerTimingForLocation>[0];
      monthKeys: string[];
      metrics: Record<string, Parameters<typeof triggerTimingForLocation>[2] extends (k: string) => infer R ? R : never>;
      currentMonth: string | null;
      monthLabels: Record<string, string>;
    };
    const getMetrics = (monthKey: string) => metrics[monthKey] ?? ({} as ReturnType<Parameters<typeof triggerTimingForLocation>[2]>);
    const result = triggerTimingForLocation(rules, monthKeys, getMetrics, currentMonth, monthLabels);
    res.json(result);
  } catch (err) {
    console.error('[/compute/trigger-timing]', err);
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`scheduling-engine-server listening on port ${PORT}`);
});
