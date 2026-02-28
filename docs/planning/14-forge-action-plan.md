# 14 — Forge Action Plan

> **Status**: Draft — needs CTO + GM/Owner review
> **Created**: 2026-02-28
> **Source**: Synthesized from Forge review docs 10-13
> **Purpose**: Turn review findings into a prioritized build plan

---

## Strategic Decision: What Are We Building?

The Forge review evaluated the Milk Jawn demo (`~/zivtech-demos/projects/milk-jawn/`). A prior effort to productize this into a multi-tenant platform (`joyus-ice-cream-shop`) built infrastructure (APIs, multi-tenancy, admin panel) but lost the operator intelligence.

**The findings point to a third option:** neither fix the demo as-is nor continue the platform. Instead, rebuild the operator-facing tool with the review findings as the spec, using the demo's analytical models as the foundation and the platform's infrastructure where it makes sense.

**However — this is a strategic decision, not a Forge output.** Forge produces the *what* and *why*. The CTO decides the *how* (demo patch, platform rebuild, new project, etc.).

What follows is the prioritized list of what needs to happen regardless of which path is chosen.

---

## Phase 0: Foundation Fixes (Do First)

These affect everything downstream and should be resolved before any feature work.

### 0.1 Language Rewrite
**Source:** Doc 11 (Language Audit)
**Scope:** Every user-facing label, description, tooltip, and help text
**Effort:** Low-medium (text changes, no logic changes)
**Why first:** Until the app speaks the operator's language, no feature evaluation with the GM/Owner will produce reliable feedback. She can't tell you if a widget is useful if she doesn't understand what it says.

**Deliverables:**
- [ ] Rename all 20+ jargon labels (see doc 11 translations table)
- [ ] Rewrite all 12+ system-facing descriptions
- [ ] Rewrite all control help text to explain what changes and why
- [ ] Replace "Amy" with role-based configurable label
- [ ] Validate translations with GM/Owner before committing

### 0.2 Number Provenance
**Source:** Doc 11 (Hidden Parameters section)
**Scope:** Every displayed number needs a traceable source
**Effort:** Medium
**Why first:** Trust is the foundation. If the GM can't trust one number, she stops trusting all of them.

**Deliverables:**
- [ ] Make 72% margin visible and explain its source. Determine: is it measured from actual COGS data, estimated, or a placeholder? If configurable, move to settings.
- [ ] Make $28/hr manager rate and 40 hrs/week visible as editable settings
- [ ] Explain the Tuesday-as-Monday-baseline assumption and justify it (or change it)
- [ ] Document the 55-75% Monday range — why these bounds? Base on data or make the range wider.
- [ ] Label every "modeled" month with what "modeled" means and how the estimate was produced
- [ ] Add source labels to weather thresholds (±10F trigger, precipitation timing)
- [ ] Implement the provenance principle: every number answers where it comes from, how current it is, and whether it's changeable

### 0.3 Control Causality
**Source:** Doc 11 (Controls Without Causality section)
**Scope:** All controls that change numbers elsewhere on the page
**Effort:** Medium
**Why first:** Controls that change numbers without visible cause undermine trust and make the tool feel unpredictable.

**Deliverables:**
- [ ] When Monday demand scenario changes, highlight which numbers were affected
- [ ] When DoorDash mode toggles, show what changed
- [ ] When manager scenario changes, show the impact
- [ ] Design a consistent visual pattern for "this control changed these numbers" (highlight, animation, callout, etc.)

---

## Phase 1: Dashboard Restructure

**Source:** Doc 12 (Dashboard Widget Review)
**Scope:** Reorganize from 15+ flat widgets to 5 question-driven sections
**Effort:** Medium-high
**Depends on:** Phase 0 (language and provenance fixes)

### 1.1 Section: "How's the Business?"
- 3 KPI cards: Revenue, Labor Cost, Gross Profit (renamed per doc 11)
- 1 chart with daily/hourly toggle (merge Weekday Economics + Hour-by-Hour GP)
- Historical trend view

### 1.2 Section: "Should We Open Mondays?"
- Monday profit projection (headline KPI)
- Scenario tool with transparency fixes (explain what % means, what it's relative to, why the range)
- Annual impact view
- **Future:** When decision is made, collapse to monitoring view

### 1.3 Section: "Seasonal Staffing"
- Status: are conditions met for next seasonal transition? (rename from "Scale Timing Monitor")
- Gap: what needs to change? (rename from "Trigger Gap Planner")
- Reference: trigger thresholds and annual calendar (from Seasonal Playbook)

### 1.4 Section: "Team Health"
- Expanded wellbeing signal with real guardrails:
  - Close frequency per person (no one closing >3x/week)
  - Close-to-open rest gaps (minimum 11 hours)
  - Break compliance on 6+ hour shifts
  - Core staff in 7-8 hour blocks
- Opening/closing rule compliance

### 1.5 Section: "How We Compare"
- **If real benchmark data sourced:** Peer benchmarks with clear attribution (source, date, sample size)
- **If not:** Self-benchmarking — EP vs NL, this year vs last year, this season vs same season prior year
- Clearly labeled data sources on every number

### Widgets removed from dashboard:
- Observed Staff Pools → move to Planner
- Staffing Template Panel → move to Planner or Settings
- Model Notes → collapsible footer or settings
- Manager Cap guardrail → Settings
- Data Confidence → badge/footnote on relevant charts
- Performance Intelligence → cut (overlaps with other sections)

---

## Phase 2: Planner Upgrades

**Source:** Doc 13 (Planner Feature Review)
**Scope:** Transform from a week-at-a-time scheduling tool to a multi-horizon planning system
**Effort:** High
**Depends on:** Phase 0 (language fixes), partially on Phase 1 (dashboard sections inform planner context)

### 2.1 Year-over-Year Context (High Priority)
- Every scheduled day/week shows what happened in the same period last year
- Always available, visually prominent when there's a meaningful delta
- "Last year this week: X people, Y hours, $Z revenue. You're planning A people, B hours."
- Drillable: revenue, labor %, GP from the comparison period

### 2.2 Structured Note Tags (High Priority, Low Effort)
- Keep free text analyst notes
- Add structured tag selection: Weather, Event, Holiday, Staffing, Demand
- Tags enable search, pattern detection, future reference
- **Prerequisite:** Notes must move from localStorage to persistent backend storage

### 2.3 Data-Driven Anomaly Detection + Holiday Settings (High Priority)
- Analyze historical data to identify days significantly above/below seasonal baseline
- Present detected patterns to user: "Looks like you close on Thanksgiving (zero sales 2022-2025)"
- User confirms or dismisses each pattern
- Confirmed patterns become holiday assumptions in Settings
- Assumptions are changeable year-to-year (e.g., "open Christmas Eve AM in 2024, closed in 2025")
- **Do not assume outliers repeat.** Flag, don't auto-apply.

### 2.4 Role-Based Approval Labels (High Priority, Low Effort)
- Replace all "Amy" references with configurable role-based labels
- Approver identity becomes a setting
- All approval status messages use the role, not a name

### 2.5 Seasonal Planning View (Medium Priority, High Effort)
- New view that shows staffing levels by season with YoY comparison
- Connection to seasonal model: trigger thresholds, template transitions
- Hiring timeline: "Spring ramp starts Mar 1. You have X weeks to fill Y positions."

### 2.6 Partial Plan States (Medium Priority)
- Plan states: Skeleton → In Progress → Complete → Approved → Published
- Weeks marked "skeleton" don't trigger assignment gap warnings
- Visual distinction between rough future plans and near-term finalized schedules

### 2.7 Season-Aware Templates (Medium Priority)
- Templates change based on season, not month-invariant
- When seasonal triggers fire, template updates with notification to GM
- GM can accept seasonal template or customize

---

## Phase 3: Validation with GM/Owner

**This should happen at multiple points, not just at the end.**

### After Phase 0:
- Walk the GM through the renamed/rewritten app
- "Does this language match how you think about the business?"
- "Can you tell what each number means and where it comes from?"
- "When you change this control, can you tell what happened?"

### After Phase 1:
- "When you open this dashboard, can you find the answer to [specific question]?"
- "Is anything here that you'd never look at? Anything missing?"
- "Is this organized the way you think about your business?"

### After Phase 2:
- "Walk me through how you plan next month's schedule."
- "Does the YoY context help you make decisions?"
- "Would the anomaly detection have flagged the right days?"

---

## Data Dependencies

Several features require data work before they can be built:

| Feature | Data needed | Current state |
|---|---|---|
| YoY context | Historical schedules (who worked, hours, results) | Square timecard data exists back to 2022 in data.json |
| Anomaly detection | Historical daily revenue with seasonal baselines | Available in data.json |
| Holiday detection | Multi-year daily sales data to find zero-sale or low-sale days | Available in data.json |
| Industry benchmarks | Real benchmark data from a named source | **Not available.** Need to identify source or replace with self-benchmarking. |
| 72% margin validation | Actual COGS data by period | **Unknown.** Need to determine if this is measured or estimated. |
| Note persistence | Backend storage for notes + tags | **Doesn't exist.** Currently localStorage only. |

---

## Pending Decisions for CTO

1. **Build target:** Fix the demo, continue the platform, or start fresh?
2. **Industry benchmarks:** Invest in finding a real data source, or replace with self-benchmarking for now?
3. **72% margin:** Is this measured from actual COGS? Can it vary by season/product? Should it be a setting?
4. **Note persistence:** What backend stores the notes? Database, file system, or integration with existing platform?
5. **GM session timing:** When to involve the GM/Owner — after Phase 0, or now?
6. **Scope of "seasonal planning view":** What does this actually look like? Calendar? Summary cards? Comparison table? Needs design work.

---

## Relationship to Forge Process

This action plan is the output of the first complete Forge guided review. It demonstrates:

1. **Context gathering worked** — ingesting existing docs + scanning the app before the conversation gave Forge a prepared starting point
2. **Baseline session surfaced the critical insight early** — "the app is built for the builder, not the operator" came out before any widget-by-widget review
3. **Output went back to project docs** — 5 documents created/updated in the ice cream shop repo, not in a Forge silo
4. **The review produced actionable findings** — specific labels to rename, specific widgets to move, specific features to build, in priority order

**What the Forge process didn't cover (yet):**
- Direct session with the GM/Owner (CTO represented her perspective)
- Mockup generation to validate understanding visually
- Multi-stakeholder reconciliation (CTO view vs. GM view vs. shift manager view)
- DOM highlighting / element-by-element walkthrough in the browser (the extension doesn't exist yet)

**What this tells us about the Forge spec:**
The process works without the browser extension. Context gathering + conversational baseline + structured review + output to project docs is the core loop. The extension adds DOM highlighting and in-browser interaction, but the process is valuable without it.

---

*Forge action plan synthesized: February 28, 2026*
*Source: Forge review documents 10-13*
*Next: CTO review of pending decisions, then GM/Owner validation session*
