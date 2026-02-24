import { useMemo, useState } from "react";
import { HourByHourGrossProfitWidget, ShiftPlannerDayCardWidget } from "@joyus/ui-components";
import "./app.css";

type WidgetId = "hour_by_hour_gross_profit" | "shift_planner_day_card";

type WidgetSpec = {
  id: string;
  manifest: Record<string, unknown>;
  lineage: Record<string, unknown>;
  story_links: string[];
};

declare global {
  interface Window {
    getWidgetSpec?: (widgetId: string) => WidgetSpec | null;
  }
}

const HOUR_ROWS = [
  { hourLabel: "12 PM", gp72: 412, trend: "high" as const },
  { hourLabel: "1 PM", gp72: 265, trend: "medium" as const },
  { hourLabel: "2 PM", gp72: 138, trend: "low" as const },
  { hourLabel: "3 PM", gp72: -24, trend: "negative" as const }
];

export default function App() {
  const [widgetId, setWidgetId] = useState<WidgetId>("hour_by_hour_gross_profit");
  const [requestState, setRequestState] = useState<"default" | "pending_request" | "approved_request">("default");

  const spec = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.getWidgetSpec?.(widgetId) ?? null;
  }, [widgetId]);

  return (
    <main className="react-shell">
      <header>
        <p className="kicker">Governed React Shell</p>
        <h1>Joyus Widget Governance Preview</h1>
        <p>Vite + React shell for governed widget extraction while legacy runtime remains intact.</p>
      </header>

      <section className="grid">
        <HourByHourGrossProfitWidget title="Hour-by-Hour GP72" rows={HOUR_ROWS} />
        <ShiftPlannerDayCardWidget
          dayLabel="Tuesday"
          viability={{ expectedRevenue: 4200, plannedLabor: 1240, plannedLaborPct: 29.5, expectedGp72: 1784 }}
          weatherSummary="Cool and dry. Keep opening support stable."
          requestState={requestState}
          onRequestStateChange={setRequestState}
        />
      </section>

      <section className="inspector">
        <div className="inspector-header">
          <h2>Widget Inspector API</h2>
          <label>
            Widget
            <select value={widgetId} onChange={(event) => setWidgetId(event.target.value as WidgetId)}>
              <option value="hour_by_hour_gross_profit">hour_by_hour_gross_profit</option>
              <option value="shift_planner_day_card">shift_planner_day_card</option>
            </select>
          </label>
        </div>
        <pre>{JSON.stringify(spec, null, 2)}</pre>
      </section>
    </main>
  );
}
