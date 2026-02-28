# 11 — Language and Communication Audit

> **Status**: In progress
> **Created**: 2026-02-28
> **Source**: Forge cross-cutting review (baseline session with Alex, CTO)
> **Application**: Milk Jawn demo (`~/zivtech-demos/projects/milk-jawn/`)

---

## Summary

The demo was built from the model out, not the operator in. Every label, description, control, and tooltip speaks the language of the system rather than the language of the operator. This audit catalogs the specific problems and proposes operator-language alternatives.

**Four problem types identified:**
1. Jargon labels — section/widget titles nobody understands
2. System-facing descriptions — explain how the system works, not what the user needs
3. Controls without causality — change numbers without explaining what or why
4. Hidden parameters — assumptions baked into calculations the user can't see

---

## 1. Jargon Labels

These section titles and labels use system/builder language instead of operator language.

| Current label | Problem | Suggested alternative |
|---|---|---|
| Staffing Command Center | Military/technical tone | "Milk Jawn Staffing" or store name |
| Wellbeing Load Signal | Signal? Load? | "Team Health" or "Is anyone overworked?" |
| Scale Timing Monitor | Monitor what? Scale what? | "Seasonal Staffing Check" or "Time to hire?" |
| Trigger Gap Planner | Triggers? Gaps? | "What needs to change before next season" |
| Performance Intelligence | AI buzzword | "How are we doing?" or "Highlights" |
| Industry Survey Lens | Lens? | "How we compare" or "Industry benchmarks" |
| Observed Staff Pools | Observed by whom? | "Who works where" |
| Projected Range Impact | Range of what? | "What opening Mondays would mean" |
| Monday Demand Assumption | Assumption? | "Monday estimate" or "How busy would Mondays be?" |
| Daily Totals Basis | Basis? | "Include DoorDash?" |
| 7-Day Manager Scenario | Scenario? | "Extra manager for Mondays?" |
| Shared Manager Mgmt Time | Mgmt? Allocation? | "How much time managing vs. on the floor?" |
| Expected Shift Viability | Viability? | "Will this shift make money?" |
| Model Notes | Model? | "Assumptions" or "How these numbers work" |
| Plan Mode | Mode? | "Operating schedule" or "6 days vs 7 days" |
| Weekday Economics | Economics? | "Daily revenue and labor" |
| Hour-by-Hour Gross Profit | Technical | "Hourly profit" or "Which hours make money?" |
| Historical Trend Explorer | Explorer? | "Trends over time" |
| Avg Weekly Store Labor | Technical | "Weekly labor cost" |
| Monday Contribution | Contribution to what? | "Monday profit" or "What Mondays would make" |

### Planner-specific labels

| Current label | Problem | Suggested alternative |
|---|---|---|
| Slot-level staffing recommendations | Slots? | "Suggested shifts" |
| Submit Policy Change Request | Policy change? | "Request schedule change" |
| Amy Next-Week Approval | Hardcoded name | Role-based: "GM Approval" or configurable |
| Expected Shift Viability | Viability? | "Shift profitability" or "Will this shift pay for itself?" |
| GP(72) | Formula in a label | "Estimated profit" |
| Baseline Expected | Baseline of what? | "Compared to typical" |
| Planned Expected | Expected by whom? | "Compared to plan" |
| Portfolio Profitability | Portfolio? | "Overall profit" or just "All stores" |
| Data Window | Window? | "Date range" or "Time period" |
| Context Note | Overly formal | "Note" |

---

## 2. System-Facing Descriptions

Descriptions that explain how the system works rather than what the user needs to know.

### App subtitle
**Current:** "Two-store labor strategy with side-by-side 6-day and 7-day operating plans, Monday-open sensitivity, and staffing guardrails that prioritize team happiness."

**Problem:** This is a feature list from a spec document. An operator reads this and learns nothing about what the tool does for her.

**Suggested:** "See how your stores are doing. Plan staffing. Decide whether to open Mondays."

### Widget/section descriptions

| Current description | Problem | Suggested alternative |
|---|---|---|
| "Average day performance under selected plan and scenario." | Under what? What scenario? | "How each day of the week typically performs" |
| "Revenue × 72% margin minus store-floor labor." | Formula | "Your estimated profit after labor costs" |
| "Compact trigger matrix across the selected date range." | Trigger matrix? | "Are the conditions met to change your seasonal staffing?" |
| "Shows the closest threshold and exactly what needs to move next." | Closest threshold of what? | "What needs to happen before you should change staffing levels" |
| "Margin protection should never come at the cost of an exhausted team." | Principle, not a description | "These rules protect your team and your margins" |
| "Limited-sample benchmark from N ice cream operators." | Unsourced | "How other ice cream shops compare (source: [actual source], [date])" |
| "Names observed across loaded history" | Loaded? Observed? | "Employees who've worked at each location" |
| "Recalculates KPIs, charts, annual impact, and exports." | System behavior | "Switch between your current 6-day schedule and what 7-day would look like" |
| "Only changes 7-day Monday-open projections and related scenario outputs." | Completely opaque | "Changes how much revenue you'd expect on Mondays" |
| "Assumed non-floor management allocation. Remaining time is floor coverage split across EP/NL." | Jargon | "What percentage of this manager's time is admin vs. working the floor?" |
| "Expected values source: planned targets with baseline fallback / historical month/weekday baseline" | Incomprehensible | "Comparing to what you planned" / "Comparing to what typically happens this time of year" |
| "Operator workbook with summary, staffing, daypart, triggers, and raw audit rows." | Daypart? Audit rows? | "Download a spreadsheet with your staffing data, costs, and schedule details" |

### How-to-use instructions
**Current instruction 3:** "Use assumptions controls (Monday demand, manager scenario, DoorDash basis) to test scenarios, then export the selected view to Excel."

**Problem:** "Assumptions controls"? "Test scenarios"? "Selected view"?

**Suggested:** "Try different Monday staffing plans and see how they'd affect your numbers. Download a spreadsheet when you're ready."

---

## 3. Controls Without Causality

Controls that change numbers without helping the user understand what changed or why.

### Monday Demand: Low (55%) / Base (65%) / High (75%)

**What the user sees:** Three buttons with percentages.
**What the user doesn't know:**
- These are percentages of Tuesday's average revenue
- Why Tuesday is the comparison day
- Why the range caps at 75% (could a Monday actually do 90% of Tuesday?)
- What numbers on the page change when you click a different option
- Whether these percentages are based on any data or are arbitrary

**What it should communicate:** "How busy do you think Mondays would be? We're estimating based on your typical Tuesdays. Pick 'cautious' if you're not sure."

**What should happen visually:** When the user changes this, the numbers that move should be highlighted or animated so the user can see what was affected.

### Shared Manager Mgmt Time: 25% / 30% / 35%

**What the user doesn't know:** What changes when you pick a different percentage.
**What it should communicate:** "This manager splits time between running the store (admin, scheduling, etc.) and working the floor. More floor time = lower labor cost but less management bandwidth."

### Compare modes: Baseline Expected vs Planned Expected

**What the user doesn't know:** The difference between these two modes.
**What it should communicate:**
- "Compare to plan" = How did we do versus what we scheduled?
- "Compare to typical" = How did we do versus what usually happens this time of year?

### Target Profile: Conservative / Balanced / Growth

**Labels are reasonable**, but custom state help text is: "Custom profile is active from manual threshold edits."
**Should say:** "You've customized these thresholds. Reset to go back to a preset."

---

## 4. Hidden Parameters

Assumptions baked into calculations that the user can't see or question.

| Parameter | Where it appears | Problem | What operator needs |
|---|---|---|---|
| **72% margin** | Every GP calculation, KPI cards, charts | Where does 72% come from? Is it actual COGS? Does it vary by season or product? | "We use 72% gross margin based on [source]. Your actual margin may vary." |
| **$28/hr manager rate** | Manager Cap guardrail, economics calculations | Is this current? Same for both stores? | Visible, editable, with note on when it was last verified |
| **40 hrs/week manager hours** | All manager cost calculations | What if the manager works 45? | Visible, editable |
| **Tuesday as Monday baseline** | Monday sensitivity model | Why Tuesday? It's never stated. The CTO didn't know this until the Forge review. | "We estimate Monday revenue based on your Tuesdays because [reason]." |
| **"Modeled" months** | Data Confidence guardrail | What does modeled mean? Who modeled them? How? | "Some months don't have real Square data yet, so we estimated based on [method]." |
| **Weather signal thresholds** | ±10F temperature delta, precipitation timing | Where do these thresholds come from? Why ±10F? | "We flag weather impact when temperature is more than 10 degrees off from normal for this time of year." |
| **55%/65%/75% Monday range** | Monday sensitivity panel | Why these values? Why is max 75%? What evidence? | Show the reasoning: "Based on [data/assumption], we estimate Monday would do 55-75% of Tuesday's business." If no evidence, say so. |

### The provenance principle

Every number in the app should answer three questions:
1. **Where does this come from?** (Square POS, estimate, industry benchmark, user setting)
2. **How current is it?** (real-time, last month, historical average, modeled)
3. **Can I change it?** (fixed assumption, editable setting, calculated from other inputs)

If a number can't answer these three questions, it shouldn't be displayed without a caveat.

---

## Next Steps

- [ ] Review with GM/Owner — do the suggested alternatives match how she actually talks about the business?
- [ ] Identify which hidden parameters should be user-editable settings vs. transparent but fixed
- [ ] Determine real data sources for industry benchmarks (or remove/replace feature)
- [ ] Design visual causality for controls — when a user changes a setting, what moves and how is that shown?
- [ ] Address the 72% margin assumption — is this measured or estimated? Should it be per-store, per-season, or configurable?

---

*Forge cross-cutting review conducted: February 28, 2026*
*Reviewer: Alex Urevick-Ackelsberg (CTO)*
