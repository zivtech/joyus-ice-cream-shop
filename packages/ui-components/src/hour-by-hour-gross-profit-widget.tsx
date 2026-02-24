import type { CSSProperties } from "react";

export type HourByHourGrossProfitTrend = "high" | "medium" | "low" | "negative";

export type HourByHourGrossProfitRow = {
  hourLabel: string;
  gp72: number;
  trend: HourByHourGrossProfitTrend;
};

export type HourByHourGrossProfitWidgetProps = {
  title: string;
  rows: HourByHourGrossProfitRow[];
};

const BAR_COLORS: Record<HourByHourGrossProfitTrend, string> = {
  high: "var(--token-color-chart-gp-high)",
  medium: "var(--token-color-chart-gp-medium)",
  low: "var(--token-color-chart-gp-low)",
  negative: "var(--token-color-chart-gp-negative)"
};

export function HourByHourGrossProfitWidget({ title, rows }: HourByHourGrossProfitWidgetProps) {
  const maxMagnitude = Math.max(1, ...rows.map((row) => Math.abs(row.gp72)));

  return (
    <section style={panelStyle} aria-label={title}>
      <header style={headerStyle}>
        <h2 style={titleStyle}>{title}</h2>
        <p style={subtitleStyle}>Token-governed threshold colors, state-ready for Storybook.</p>
      </header>
      <ul style={listStyle}>
        {rows.map((row) => {
          const widthPct = Math.max(8, Math.round((Math.abs(row.gp72) / maxMagnitude) * 100));
          return (
            <li key={row.hourLabel} style={rowStyle}>
              <div style={metaStyle}>
                <strong>{row.hourLabel}</strong>
                <span>{row.gp72 >= 0 ? "$" : "-$"}{Math.abs(row.gp72).toLocaleString()}</span>
              </div>
              <div style={trackStyle}>
                <div
                  style={{
                    ...fillStyle,
                    width: `${widthPct}%`,
                    background: BAR_COLORS[row.trend]
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const panelStyle: CSSProperties = {
  border: "1px solid var(--token-surface-line)",
  borderRadius: 12,
  padding: "0.9rem",
  background: "var(--token-surface-card)",
  minWidth: 300
};

const headerStyle: CSSProperties = { marginBottom: "0.65rem" };
const titleStyle: CSSProperties = { margin: 0, fontSize: "1.02rem" };
const subtitleStyle: CSSProperties = { margin: "0.3rem 0 0", fontSize: "0.8rem", opacity: 0.8 };
const listStyle: CSSProperties = { listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.45rem" };
const rowStyle: CSSProperties = { display: "grid", gap: "0.3rem" };
const metaStyle: CSSProperties = { display: "flex", justifyContent: "space-between", fontSize: "0.82rem" };
const trackStyle: CSSProperties = {
  background: "var(--token-surface-track)",
  borderRadius: 999,
  height: 10,
  overflow: "hidden"
};
const fillStyle: CSSProperties = { height: "100%", borderRadius: 999, transition: "width 220ms ease" };
