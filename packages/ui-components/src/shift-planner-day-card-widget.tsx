import type { CSSProperties } from "react";

export type ShiftPlannerDayCardRequestState = "default" | "pending_request" | "approved_request";

export type ShiftPlannerDayCardViability = {
  expectedRevenue: number;
  plannedLabor: number;
  plannedLaborPct: number;
  expectedGp72: number;
};

export type ShiftPlannerDayCardWidgetProps = {
  dayLabel: string;
  viability: ShiftPlannerDayCardViability;
  weatherSummary: string;
  requestState: ShiftPlannerDayCardRequestState;
  onRequestStateChange?: (nextState: ShiftPlannerDayCardRequestState) => void;
};

const CARD_STATE_BORDER: Record<ShiftPlannerDayCardRequestState, string> = {
  default: "var(--token-status-default)",
  pending_request: "var(--token-status-pending)",
  approved_request: "var(--token-status-approved)"
};

export function ShiftPlannerDayCardWidget({
  dayLabel,
  viability,
  weatherSummary,
  requestState,
  onRequestStateChange
}: ShiftPlannerDayCardWidgetProps) {
  return (
    <section style={{ ...panelStyle, borderColor: CARD_STATE_BORDER[requestState] }} aria-label={`${dayLabel} planner day card`}>
      <header style={headerStyle}>
        <h2 style={titleStyle}>{dayLabel}</h2>
        <span style={badgeStyle}>{requestState.replace("_", " ")}</span>
      </header>

      <div style={gridStyle}>
        <article style={boxStyle}>
          <h3 style={boxHeadingStyle}>Viability</h3>
          <p style={lineStyle}><strong>Expected revenue:</strong> ${Math.round(viability.expectedRevenue).toLocaleString()}</p>
          <p style={lineStyle}><strong>Planned labor:</strong> ${Math.round(viability.plannedLabor).toLocaleString()}</p>
          <p style={lineStyle}><strong>Labor %:</strong> {viability.plannedLaborPct.toFixed(1)}%</p>
          <p style={lineStyle}><strong>Expected GP72:</strong> ${Math.round(viability.expectedGp72).toLocaleString()}</p>
        </article>

        <article style={boxStyle}>
          <h3 style={boxHeadingStyle}>Weather Signal</h3>
          <p style={lineStyle}>{weatherSummary}</p>
        </article>
      </div>

      <div style={actionsStyle}>
        <button type="button" style={buttonStyle} onClick={() => onRequestStateChange?.("default")}>Default</button>
        <button type="button" style={buttonStyle} onClick={() => onRequestStateChange?.("pending_request")}>Pending</button>
        <button type="button" style={buttonStyle} onClick={() => onRequestStateChange?.("approved_request")}>Approved</button>
      </div>
    </section>
  );
}

const panelStyle: CSSProperties = {
  border: "1px solid",
  borderRadius: 12,
  padding: "0.9rem",
  background: "var(--token-surface-card)",
  minWidth: 300
};

const headerStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const titleStyle: CSSProperties = { margin: 0, fontSize: "1.02rem" };
const badgeStyle: CSSProperties = { fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" };
const gridStyle: CSSProperties = { display: "grid", gap: "0.6rem", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginTop: "0.55rem" };
const boxStyle: CSSProperties = {
  border: "1px solid var(--token-surface-line-subtle)",
  borderRadius: 10,
  padding: "0.55rem"
};
const boxHeadingStyle: CSSProperties = { margin: 0, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em" };
const lineStyle: CSSProperties = { margin: "0.28rem 0", fontSize: "0.82rem" };
const actionsStyle: CSSProperties = { display: "flex", gap: "0.45rem", marginTop: "0.7rem", flexWrap: "wrap" };
const buttonStyle: CSSProperties = {
  borderRadius: 999,
  border: "1px solid var(--token-surface-line-strong)",
  background: "var(--token-surface-button)",
  padding: "0.32rem 0.72rem",
  cursor: "pointer"
};
