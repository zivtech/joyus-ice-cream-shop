# 13 — Planner Feature Review

> **Status**: Complete (initial pass)
> **Created**: 2026-02-28
> **Source**: Forge guided review — planner feature evaluation
> **Application**: Milk Jawn demo (`~/zivtech-demos/projects/milk-jawn/`)

---

## Approach

Evaluated the planner against the GM's actual scheduling workflow across five time stages, from months ahead to after the fact. Identified what works, what's missing, and what needs to change.

---

## Workflow Stage Evaluation

### Stage 1: Months Out — "What's the season going to look like?"

**What the GM needs:**
- How many people do I need this season vs. last?
- Do I need to hire? When do I start posting?
- What's the rough weekly shape?
- What anomalous days are coming from historical patterns?

**Current coverage:** Almost nothing. The horizon selector goes to 52 weeks but just shows 52 copies of the same template. No seasonal view. No YoY comparison. No anomaly awareness.

**What exists elsewhere but isn't connected:** Seasonal Playbook (dashboard) has trigger thresholds and an annual calendar. Staffing recommendations doc has per-season headcount targets. None of this feeds into the planner.

**Verdict:** Major gap. The planner has no seasonal planning surface.

### Stage 2: Weeks Out — "Build the skeleton schedule"

**What the GM needs:**
- A rough template for each week
- Leave positions unfilled to fill later
- Flag weeks that need attention

**Current coverage:** Partial. Template engine generates slot suggestions. Positions can be left unassigned. Gap tracker shows holes.

**What's missing:**
- No "partial plan" concept — everything looks like it should be finished
- No way to mark a week as "skeleton only" vs. "this should be done"
- No anomaly/holiday overlay (see data-driven approach below)
- Templates are month-invariant — same template for January and July, contradicting the seasonal staffing model

**Verdict:** Decent foundation but needs partial plan states and seasonal template awareness.

### Stage 3: Days Before — "Fill in the details"

**What the GM needs:**
- Assign people to shifts
- Check for conflicts
- Validate coverage
- See weather and adjust
- Get approved and publish

**Current coverage:** Strong. This is where the planner works best.
- Slot-by-slot assignment with employee search
- "Assign Next 12 Weeks" for recurring assignments
- PTO conflict detection (Square sync)
- Day validation (coverage rules)
- Weather recommendations with accept/reject
- Financial viability estimate per day
- Approval workflow (currently hardcoded to "Amy")
- Export to Square

**What's missing:**
- YoY context: "Last year on this date we had X people for Y hours"
- Historical pattern: "Tuesdays in March typically need 3 closers"
- No "copy from same week last year" (only copy from last week)
- Hardcoded "Amy" approval name — should be role-based
- No anomaly awareness on specific days

**Verdict:** Works well for the core task. Needs YoY context and pattern overlay. Fix the hardcoded name.

### Stage 4: Day Of — "Something changed"

**What the GM needs:**
- Quick adjustment for call-outs
- Updated weather
- Current viability check

**Current coverage:** Weather updates are live. Day card shows current recommendations. But there's no dedicated day-of adjustment flow — you edit the planner board, same as advance planning.

**Verdict:** Not critical for v1. Different workflow than advance planning, worth distinguishing later.

### Stage 5: After the Fact — "How did it go?"

**What the GM needs:**
- Did we make money today?
- Were we over/understaffed?
- Was the weather recommendation accurate?
- What happened that we should remember?

**Current coverage:** Shift Analysis is mostly solid.
- Per-day performance cards with attainment meters
- Weather context with narrative
- Overstaff assessment
- Compare modes (baseline vs. planned)
- Analyst note field

**Critical gap: Notes don't go anywhere.** Free text in localStorage. No tagging, no persistence beyond the browser, no system learning.

**Verdict:** Analysis is good. Notes pipeline is the big miss.

---

## Feature Gap Detail

### 1. No Seasonal Planning View

The planner only thinks in weeks. The GM needs to see months and compare to history.

**What's needed:**
- A seasonal view that shows: "This season, we're planning X total staff hours per week. Last year same season, we ran Y."
- Connection to the seasonal staffing model (trigger thresholds, template transitions)
- Hiring timeline: "Spring ramp starts Mar 1. You have 4 weeks to fill 2 flex positions."

### 2. No Year-over-Year Context

**What's needed on every scheduled day/week:**
- Always available: "Last year in this week, this store had A people totaling B hours"
- Visually prominent when there's a meaningful delta: "You're planning 30% more labor hours than the same week last year"
- Drillable: what was the revenue, labor %, and GP last year? Did the staffing level work?

This is the "both, layered" approach from the baseline session — always there, loud when it matters.

### 3. Data-Driven Anomaly Detection (replaces manual event calendar)

Rather than manually entering events, the system should detect anomalies from historical data.

**Approach:**
1. Pull historical data and identify days that are significantly above or below seasonal baseline
2. Present these to the user: "Dec 25 shows zero sales in 2022, 2023, 2024 — looks like you close on Christmas"
3. **Do not assume outliers repeat.** Flag them, don't auto-apply them. A one-off spike doesn't become a recurring event.
4. Let the user confirm or dismiss: "Yes, we close on Christmas" / "That spike was a one-time event, don't expect it next year"

**Holiday assumptions as settings:**
- A settings section where confirmed patterns become assumptions
- Assumptions can be changed year to year: "In 2024 we were open Christmas Eve morning, in 2025 we weren't"
- Each assumption shows what data it's based on and when it was last confirmed
- The planner references these settings when showing projections

**What this avoids:**
- Hardcoding recurring events that might not recur
- Asking the GM to manually enter things the data already knows
- Making assumptions the operator can't see or change

### 4. Partial Plan States

**What's needed:**
- A plan can be in states: Skeleton → In Progress → Complete → Approved → Published
- Weeks marked as "skeleton" don't trigger assignment gap warnings
- Visual distinction between "this is a rough plan for 3 months out" and "this is next week's schedule and needs to be final"
- Progressive refinement: skeleton → add assignments → validate → approve

### 5. Season-Aware Templates

**What's needed:**
- Templates should change based on season (not month-invariant)
- When the seasonal transition triggers fire, the template should update
- The GM should see: "Template changed to Spring — added Thu-Sun evening swing coverage"
- Override capability: GM can accept the seasonal template or customize

### 6. Structured Note Tags

**First step for the notes-to-planning pipeline.** Keep free text but add structured metadata:

**Tag types:**
- **Weather**: rain, heat, cold, storm (auto-populated from weather data)
- **Event**: local event, store event, neighborhood activity
- **Holiday**: closure, modified hours, special schedule
- **Staffing**: call-out, overstaffed, understaffed, training day
- **Demand**: higher than expected, lower than expected, unusual pattern

**What tags enable:**
- Search: "Show me all days tagged 'event' at EP in December"
- Pattern detection: "Rain on Saturdays in summer — how did we do across all instances?"
- Future reference: "Last time we had a Hot Chocolate Crawl, we added 2 peak staff"
- Eventually: system suggestions based on tagged patterns (not in v1)

**What tags don't do (yet):**
- Auto-create recurring events (future feature)
- Auto-adjust future schedules (future feature)
- Replace human judgment about whether a pattern will repeat

### 7. Hardcoded Names → Role-Based Labels

Replace all "Amy" references with configurable role-based labels:
- "Amy Next-Week Approval" → "GM Approval" or "[configured approver name] Approval"
- "Submit Next Week to Amy (CEO)" → "Submit for Approval"
- All approval status messages should use the role, not a name
- The approver identity should be a setting, not hardcoded

---

## Summary of Recommendations

| Priority | Feature | Effort estimate | Depends on |
|---|---|---|---|
| **High** | YoY context on scheduled days/weeks | Medium | Historical data access |
| **High** | Structured note tags | Low | Note persistence (needs backend, not localStorage) |
| **High** | Fix hardcoded "Amy" → role-based | Low | Nothing |
| **High** | Data-driven anomaly detection + holiday settings | Medium | Historical data analysis |
| **Medium** | Seasonal planning view | High | Seasonal model integration |
| **Medium** | Partial plan states | Medium | Plan lifecycle model |
| **Medium** | Season-aware templates | Medium | Seasonal trigger integration |
| **Low** | "Copy from last year" option | Low | Historical schedule data |
| **Low** | Day-of adjustment flow | Medium | Planner UX redesign |

---

## Open Items

- [ ] Define what the seasonal planning view actually shows — calendar? Summary cards? Comparison table?
- [ ] Determine how YoY data is surfaced — inline on each day card? A separate comparison panel? Both?
- [ ] Design the anomaly detection threshold — how far from baseline is "significant"?
- [ ] Design the holiday settings UX — how does the user confirm/dismiss detected patterns?
- [ ] Define note tag taxonomy — start small, expand based on usage
- [ ] Determine note persistence model — database, synced storage, or file-based?
- [ ] Map seasonal templates to trigger thresholds — when triggers fire, which template activates?
- [ ] Validate all of the above with GM/Owner

---

*Forge planner feature review conducted: February 28, 2026*
*Stakeholder: Alex Urevick-Ackelsberg (CTO)*
