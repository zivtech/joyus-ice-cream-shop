# 12 — Dashboard Widget Review

> **Status**: Complete (initial pass)
> **Created**: 2026-02-28
> **Source**: Forge guided review — dashboard widget evaluation
> **Application**: Milk Jawn demo (`~/zivtech-demos/projects/milk-jawn/`)
> **Evaluation criteria**: Baseline constitution usefulness test (doc 00)

---

## Approach

Each widget evaluated against the operator's actual questions, not the system's categories. Widgets mapped to the questions they serve, revealing redundancy, gaps, and misplacement.

## Operator Questions (from baseline session)

1. How's the business doing? (revenue, profit, labor)
2. Should we open Mondays?
3. When do I need to change seasonal staffing?
4. Are my people okay?
5. How do we compare to other shops?

---

## Question 1: "How's the business doing?"

**7 widgets currently serve this question. That's too many.**

| Widget | Keep / Cut / Merge | Reasoning |
|---|---|---|
| KPI: Avg Weekly Revenue | **Keep** | The headline number. Entry point. |
| KPI: Avg Weekly Gross Profit | **Keep** | The bottom line. |
| KPI: Avg Weekly Store Labor | **Keep** | The cost side. Together with revenue and GP, these 3 KPIs answer the question at a glance. |
| Weekday Economics Chart | **Merge** | Overlaps with hourly chart. Consider one chart with daily/hourly toggle. |
| Hour-by-Hour GP Chart | **Merge** | Overlaps with weekday chart. Same recommendation. |
| Historical Trend Explorer | **Keep** | Only widget that shows "trending up or down?" — unique and important. |
| Performance Intelligence | **Cut or simplify** | "Best month", "peak hour", "demand shape" are three unrelated insights. Best/worst overlaps with trend explorer. Peak/weak hour overlaps with hourly chart. Demand shape is interesting but not clearly actionable. |

**Recommendation:** 3 KPI cards + 1 chart (daily/hourly toggle) + trend explorer = 5 elements. Cut Performance Intelligence or extract the one unique insight (demand shape) into a note on the chart.

---

## Question 2: "Should we open Mondays?"

**Decision is still open. 3 dedicated widgets are warranted but should be grouped.**

| Widget | Keep / Cut / Merge | Reasoning |
|---|---|---|
| KPI: Monday Contribution | **Keep** | The headline answer — projected weekly GP from Mondays |
| Monday Open Sensitivity | **Keep but fix** | Right intent (model the risk) but controls are opaque (see language audit). Percentages need explanation. Range needs justification. |
| Projected Range Impact | **Keep but fix** | Annual projection is useful for the owner. Currently labeled "Projected Range Impact" which means nothing. |

**Recommendation:** Group these 3 as a connected section: "Should we open Mondays?" with the KPI as headline, sensitivity as scenario tool, and annual projection as the long view. When the decision is eventually made, this section collapses to a monitoring view: "How are Mondays performing vs. what we expected?"

**Critical fix needed:** The Monday sensitivity model needs transparency:
- State that percentages are relative to Tuesday's average
- Explain why Tuesday is the comparison day
- Justify the 55-75% range (or make it wider — could Monday do 90%?)
- Show what numbers change when the user picks a scenario

---

## Question 3: "When do I need to change seasonal staffing?"

**3 widgets that work well as a set. Keep all, fix naming.**

| Widget | Keep / Cut / Merge | Reasoning |
|---|---|---|
| Scale Timing Monitor | **Keep, rename** | Answers "are conditions met for next season?" — unique and actionable. Name is jargon. |
| Trigger Gap Planner | **Keep, rename** | Answers "what needs to happen first?" — actionable gap analysis. Name is jargon. |
| Seasonal Playbook | **Keep, rename** | Reference for the rules being applied. Name is reasonable but could be clearer. |

**Recommendation:** Group as one section: "Seasonal Staffing" or "Is it time to change staffing levels?" The monitor is the status check, the gap planner is the action list, the playbook is the reference. These work together and should be visually connected.

---

## Question 4: "Are my people okay?"

**Currently underserved. Only 2 widgets, and one is a repackaged labor metric.**

| Widget | Keep / Cut / Merge | Reasoning |
|---|---|---|
| KPI: Wellbeing Load Signal | **Keep but deepen** | Currently just a labor % repackaged as Healthy/Watch/High Load. Real wellbeing needs more signals. |
| Guardrails: Opening + Closing Rules | **Keep** | Safety compliance — are we following staffing rules? |

**Missing signals that the seasonal staffing recommendations document already defines:**
- Is anyone closing more than 3x/week?
- Are close-to-open rest gaps under 11 hours?
- Are people getting breaks on 6+ hour shifts?
- Are core staff in 7-8 hour blocks or being stretched?

These guardrails exist in the planning docs but aren't surfaced in the UI. The "Team Health" section should include them.

**Recommendation:** Expand this into a real "Team Health" section with the labor signal plus the specific guardrails from the staffing recommendations. This is one of the most important operator questions and it has the thinnest UI support.

---

## Question 5: "How do we compare to other shops?"

**1 widget with an unresolved data problem.**

| Widget | Keep / Cut / Merge | Reasoning |
|---|---|---|
| Industry Survey Lens | **Keep if data is real, remove if not** | Shows peer medians (labor %, COGS, profit, ticket) with P25/P75 bands. But where does this data come from? How many operators? When was the survey? |

**Blocked on:** Real data source identification. Options:
- Paid benchmarking service (e.g., Restaurant365, BenchmarkSixty)
- Free public data (BLS food service statistics, USDA, trade association reports)
- Self-benchmarking only (your stores vs. your own history — no peer comparison)

**If real benchmarks can be sourced:** Keep, with clear attribution (source, date, sample size) on every number.
**If not:** Remove the peer comparison. Replace with self-benchmarking: "East Passyunk vs. Northern Liberties" and "This year vs. last year." These comparisons are already possible from the existing data and don't require external sources.

---

## Widgets That Don't Belong on the Dashboard

These widgets should be moved elsewhere or removed.

| Widget | Current location | Recommended action |
|---|---|---|
| **Observed Staff Pools** | Dashboard | **Move to Planner.** This answers "who can I schedule at which location?" — an operational scheduling question, not an analytics question. |
| **Staffing Template Panel** | Dashboard | **Move to Planner or Settings.** Shows role/shift templates. Reference material for schedule building, not business health monitoring. |
| **Model Notes** | Dashboard | **Make accessible but remove from main view.** Provenance/assumptions info. Important for trust but shouldn't take dashboard real estate. Could live in a collapsible footer, settings page, or info panel. |
| **Guardrails: Manager Cap** | Dashboard (guardrails section) | **Move to Settings.** This displays an assumption ($28/hr, 40 hrs/week), not a dynamic status. It's a setting, not a guardrail. |
| **Guardrails: Data Confidence** | Dashboard (guardrails section) | **Move to accessible provenance view.** Important for trust ("how many months are estimates?") but not a daily check. Could be a badge or footnote on the trend chart rather than a full guardrail card. |

---

## Proposed Dashboard Structure

Organize by operator question, not by widget type:

### Section 1: "How's the Business?"
- 3 KPI cards: Revenue, Labor Cost, Gross Profit
- 1 chart with daily/hourly toggle
- Trend over time

### Section 2: "Should We Open Mondays?" (while decision is open)
- Monday profit projection (headline)
- Scenario tool (with transparency fixes from language audit)
- Annual impact view

### Section 3: "Seasonal Staffing"
- Status: are conditions met for next transition?
- Gap: what needs to change?
- Reference: trigger thresholds and calendar

### Section 4: "Team Health"
- Overall signal (expanded beyond just labor %)
- Specific guardrails: close frequency, rest gaps, break compliance, shift length
- Opening/closing rule status

### Section 5: "How We Compare" (if real benchmark data is available)
- Peer benchmarks with clear sourcing
- OR self-benchmarking: EP vs NL, this year vs last year

### Removed from dashboard:
- Observed Staff Pools → Planner
- Staffing Templates → Planner or Settings
- Model Notes → Collapsible/settings
- Manager Cap guardrail → Settings
- Data Confidence → Badge/footnote on relevant charts
- Performance Intelligence → Cut (overlap with other sections)

---

## Open Items

- [ ] Validate proposed structure with GM/Owner — does this match her mental model?
- [ ] Determine if daily/hourly chart merge works or if both views are genuinely needed separately
- [ ] Resolve industry benchmark data sourcing before deciding on Section 5
- [ ] Design the expanded "Team Health" section with real wellbeing guardrails
- [ ] Define what the Monday section looks like after the decision is made (monitoring mode)
- [ ] Determine how "How do we compare?" works without external data (EP vs NL, YoY)

---

*Forge dashboard widget review conducted: February 28, 2026*
*Stakeholder: Alex Urevick-Ackelsberg (CTO)*
