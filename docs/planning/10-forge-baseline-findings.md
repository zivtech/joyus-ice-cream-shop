# 10 — Forge Baseline Findings

> **Status**: In progress
> **Created**: 2026-02-28
> **Session type**: Forge Guided Review — Baseline Session
> **Application under review**: Milk Jawn demo (`~/zivtech-demos/projects/milk-jawn/`)
> **Stakeholders**: Alex Urevick-Ackelsberg (CTO), Amy (GM/Owner — session conducted Feb 28, 2026)
> **Context scenario**: Vibe-coded app — built iteratively with Claude, needs to be understood and made useful for the actual operator

---

## Context

The Milk Jawn demo is a vanilla JS staffing analytics and scheduling tool built across multiple Claude sessions. It's powered by real Square POS data (July 2022 - February 2026) and deployed on GitHub Pages. It has two main surfaces:

- **Dashboard** (index.html) — ~15 analytics widgets for business performance and staffing decisions
- **Shift Planner** (staffing-planner.html) — weekly scheduling with approvals, shift analysis, and settings

A subsequent effort to productize this demo into a multi-tenant platform (`joyus-ice-cream-shop`) produced infrastructure (APIs, multi-tenancy, admin panel, roles) but lost the operator intelligence that made the demo useful. The platform frontend doesn't call the scheduling engine endpoints for weekly metrics, trigger timing, weather impact, or overstaff assessment.

## Key Finding: The Demo Is Built for the Builder, Not the Operator

The CTO built the demo with Claude. The GM/owner — the actual daily user — finds it "extraordinarily confusing." The analytical models underneath are sound. The presentation fails to communicate them to the person who needs them.

This is not a feature problem. It's a communication problem. The app speaks the language of the data model, not the language of the operator.

## Stakeholder Clarification

- **Alex (CTO)**: Built the demo, understands the data model, can explain what widgets do but sometimes couldn't explain their controls (e.g., didn't know Monday %s were relative to Tuesday until this session)
- **Amy (GM/Owner)**: The actual daily user. Participated in a 43-minute guided session on Feb 28, 2026. Confirmed the demo is confusing. Would use the scheduling tool daily if it worked for her. The dashboard/analytics would be periodic (weekly/monthly).

## GM/Owner Direct Session (Feb 28, 2026)

**Format:** Alex guided Amy through the demo page by page, explaining what things were meant to do while capturing her reactions. Not a pure first-impression test — Alex provided context so Amy could react to the *concepts* rather than just the labels. This was appropriate: pure confusion would have only confirmed what the proxy session already found. The guided approach produced new signal.

**Session conditions:** Amy had a significant headache during the session, which affected engagement depth. Despite this, the session produced actionable findings.

### What she confirmed (validates proxy findings)

Every language/comprehension issue identified in the proxy CTO session was confirmed directly:
- Hour-by-hour gross profit: "I'm not sure what this graph is for. What is it measuring? What do the colors mean?"
- Manager time allocation: "What does it mean? One manager day?"
- Template descriptions: "Two Tuesday through Thursday template plus one lead day — I don't know what that means"
- Historical Trend Explorer: "I don't understand what I'm looking at here"
- Performance Intelligence: "peak versus week hour — I have no idea what that is"
- Scale Timing Monitor: doesn't know what the language means
- Trigger Gap Planner: "I don't know what trigger gap planner means"
- 72% margin: confirmed nobody knows the source

### New findings from Amy directly

**1. She understands position-based scheduling.**
"If you do it divorced from people's names, if it's just scooper one, scooper two, scooper three, then you just have to plug in scoopers." She separates template-level planning from person-level assignment naturally. This is more sophisticated than expected and validates the partial-plan/template approach.

**2. Scheduling is pattern-based, not planned from scratch.**
Two weeks out. Based on staff availability (tracked in Square) and recurring patterns. "If somebody's always available on a Tuesday, then they're usually scheduled that day." She doesn't rebuild from zero — she adjusts a pattern. The tool should support pattern carry-forward, not blank-slate scheduling.

**3. Historical data usage is seasonal.**
Spring and fall: they actually look back at historical data. Summer and winter: they set a pattern and stick to it. "Other than that, we just kind of set a pattern for winter or summer based on what feels right." Historical context should be prominent during transition seasons, ambient otherwise.

**4. Events are minimal — validates anomaly detection approach.**
"We have so few events that we don't really use a calendar." Google Calendar informally. The big ones: Hot Chocolate Crawl (EP), Ice Cream for Breakfast Day (both), and flavors on the avenue (EP). Northern Liberties events are less important (canceled last year). This confirms that a manual event calendar would be overkill — anomaly detection from historical data is the right approach.

**5. Weather matters only in volatile seasons.**
"In spring and fall, when the season changes are more volatile and unpredictable." Rest of year: last-minute adjustments only (call someone out or in). Weather integration should be contextual, not always-on prominent.

**6. Marketing/social media drives sales spikes.**
Amy specifically noted that Instagram posts and new product launches drive sales — not just weather or events. Cookie butter was the example. "A lot of it is just chance." This is a new input source not previously identified. Potential future integration: Instagram activity, MailChimp campaigns, menu changes as demand signals.

**7. "Does Square already do this?"**
The critical value-proposition question. Amy doesn't understand what this tool gives her that Square doesn't. Alex's answer: Square doesn't build proposed schedules, doesn't include DoorDash data, doesn't include manager salary costs, doesn't do cross-location comparison. **The tool's value proposition needs to be explicit and upfront — not something the CTO has to explain.**

**8. Seasonal hours are specific and structured.**
- Warm months: 12pm-11pm, Tue-Sun
- Cold months: Tue-Fri 3pm-10pm, Sat noon-11pm, Sun noon-10pm
These should be settings that drive the seasonal model.

**9. Approval workflow: suggest, don't override.**
"I don't usually make the changes. I suggest changes." The GM reviews, rejects with notes, and the manager makes the adjustments. Reject-with-notes is the right pattern, not inline editing by the approver.

**10. Christmas Eve varies by location and year.**
Open 10-3 (or similar) at one location, closed at the other. Changed between 2024 and 2025. Validates per-location, per-year holiday settings.

**11. She still doesn't understand the tool's purpose.**
After 43 minutes: "What is the whole purpose of this tool, just to be able to plan it all out for, like, a year in advance or something?" The value proposition never landed. This is the most important finding — the tool needs to lead with WHY before showing HOW.

### Process observation

Alex guided more than observed — explaining what widgets were supposed to do rather than letting Amy react cold. This was the right call: pure confusion ("I don't know what this is" x15) would have only re-confirmed the language audit. By explaining, Alex got Amy to engage with the *underlying concepts* and produced new signal (position-based scheduling, pattern carry-forward, seasonal data usage, marketing as demand driver, Square comparison).

## Findings by Category

### 1. Cross-Cutting Issues (Priority 1)

These affect every part of the application and must be addressed before individual features can be properly evaluated.

#### Language is system-centric, not operator-centric

| What the app says | What the operator thinks |
|-------------------|------------------------|
| "Wellbeing Load Signal" | "Are we burning people out?" |
| "Trigger Gap Planner" | "When do I need to hire for summer?" |
| "Scale Timing Monitor" | "Is it time to change our staffing level?" |
| "Only changes 7-day Monday-open projections and related scenario outputs" | "This changes how much we'd expect to make on Mondays" |
| "Low (55%) / Base (65%) / High (75%)" | ??? (nobody knows what these are percentages of) |

Every label, tooltip, and explanation was generated from the builder's mental model. The app needs to be rewritten in the operator's language.

#### Controls change numbers without explaining causality

Sliders and toggles affect displayed numbers, but the user can't trace what changed or why. Three questions must be answerable for every control:
1. What did I just change?
2. What numbers moved because of it?
3. Why do those numbers move that way?

If the operator can't answer all three, the control undermines trust in the entire system.

#### Numbers have no provenance

No number in the app traces back to its source. The CTO said he "would want to confirm them somehow." If the person who built it doesn't trust the numbers blindly, the operator certainly shouldn't be expected to. Every number needs:
- Where it came from (Square POS data, modeled estimate, industry benchmark, etc.)
- What date range it covers
- How it was calculated (at least at a summary level)
- Whether it's actual data or a projection

#### Help text compounded the confusion

An attempt was made to add help text to each widget. The help text was generated by Claude — the same system that built the confusing widgets. The explanations inherited the same assumptions and language that created the confusion in the first place. Help text made things worse, not better.

**Implication for Forge**: Explanations must be written from the operator's perspective, not the builder's. This is exactly why Forge's review process exists — to capture the "why" from the person who needs it, not the person who built it.

#### Data sourcing and attribution

The Industry Survey Lens shows benchmark data (peer medians, labor %, profit margins) but doesn't attribute where it comes from. If the data is fabricated or from a one-off survey, that's a trust problem.

**Action needed**: Identify real data sources for industry benchmarks:
- Paid providers (e.g., industry benchmark services)
- Free public data (BLS, trade association reports, USDA food service data)
- The operator's own historical data as self-benchmarking
- Clear labeling on every number: source, date, sample size

If real benchmark data can't be sourced, the feature should either be removed or clearly labeled as placeholder.

### 2. Dashboard Findings (Priority 2)

#### Information overload with no hierarchy

~15 widgets visible simultaneously. The operator doesn't know:
- Where to start — which widget answers her first question?
- What's important right now — are all 15 equally relevant this week?
- What to do about what she sees — "Labor % is 20.69%" means what? Is that good? Should she do something?

The dashboard treats everything as equally visible all the time. The operator's actual workflow is more like "tell me what needs my attention and let me drill in."

#### Widgets that are misplaced

**Observed Staff Pool** — shows which employees work at EP only, NL only, or cross-location. This is operational scheduling data, not business analytics. It belongs on the planner (when building a schedule: "who can I put at NL this week?"), not on the dashboard.

Other widgets may have similar placement issues. Each widget should be evaluated: does this belong on an analytics surface or an operational surface?

#### Monday scenario modeling is opaque

The Monday Sensitivity Panel lets users pick Low (55%) / Base (65%) / High (75%) scenarios. Problems:
- The percentages are relative to Tuesday's average revenue — this is never stated
- The range caps at 75% — why not 90% or 100%? What evidence sets the upper bound?
- Why Tuesday specifically? Is that the closest comparable day?
- The CTO didn't know what these numbers meant until the Forge baseline session

This widget has the right intent (help decide whether to open Mondays) but the execution is impenetrable.

#### Excel export has no clear job

The export button exists but nobody articulated what specific need it serves. Does the GM need to email a summary to the owner? Does the accountant need labor data for payroll? Without a clear job, the export is a feature without a reason.

### 3. Planner Findings (Priority 3)

#### Planning horizon is too short

The current planner thinks in single weeks. The business needs:
- **Months-ahead planning** — seasonal businesses need to plan staffing well in advance
- **Partial plans** — draft skeletons that get filled in and validated over time
- **Progressive refinement** — a plan 3 months out is rough; 2 weeks out it's detailed; day-of it's confirmed

#### No year-over-year context on recommendations

When the system recommends a staffing level, the GM/owner/manager need to understand it in context:
- "Last year in this season, this store averaged X people totaling Y hours"
- "We're now projecting A people and B hours"
- "Here's why the change is recommended"

When the system recommends a significant change, that's something the GM, owner, AND manager all need to understand. The comparison should be:
- Always available on every scheduled day
- Visually prominent only when there's a meaningful delta from historical pattern

#### Analyst notes are training data, not journals

The shift analysis "analyst notes" are currently treated as free-text journaling. They should be structured inputs for future automated planning:

**Recurring events** that affect scheduling:
- East Passyunk Hot Chocolate Crawl (EP only)
- Ice Cream for Breakfast Day (both locations)
- Other local events that predictably change demand

**Holiday calendars**:
- Closed: Thanksgiving, Christmas
- Early close: Christmas Eve
- Other modified schedules

**Pattern annotations**: Any note that implies "do this again next time this happens" should feed forward into the planning system, not just sit in a text field.

## Cross-Cutting Review Results

Full audit captured in `docs/planning/11-language-and-communication-audit.md`. Summary:

**Four problem types identified across the entire application:**

1. **Jargon labels** (20+ instances) — Section titles use system language: "Wellbeing Load Signal", "Trigger Gap Planner", "Scale Timing Monitor", "Performance Intelligence", "Expected Shift Viability". Operator translations proposed for each.

2. **System-facing descriptions** (12+ instances) — Help text and descriptions explain how the system works rather than what the user needs. App subtitle is a spec document feature list. Widget descriptions contain formulas ("Revenue × 72%") instead of plain-language explanations.

3. **Controls without causality** (4 major instances) — Monday demand percentages are relative to Tuesday (never stated, CTO didn't know). Shared manager time split doesn't explain what changes. Compare modes in Shift Analysis are incomprehensible. When controls change numbers, nothing visual shows what moved.

4. **Hidden parameters** (7 instances) — 72% margin used everywhere with no source. $28/hr manager rate hardcoded. Tuesday as Monday baseline never justified. "Modeled" months not explained. 55-75% Monday range has no stated evidence.

**The provenance principle** (proposed): every number should answer three questions — where does it come from, how current is it, can I change it?

## Review Queue (Proposed)

Based on this baseline session, the guided review should proceed:

1. **Cross-cutting issues** — language audit, provenance model, control causality — **COMPLETED (see doc 11)**
2. **Dashboard widgets** — evaluate each against "what decision does this help the operator make?" — **COMPLETED (see doc 12)**
3. **Planner features** — months-ahead planning, YoY context, event calendars, note-to-planning pipeline — **COMPLETED (see doc 13)**

## Open Items for Future Sessions

- [x] Session with GM/Owner directly — **DONE (Feb 28, 2026)** — see GM/Owner Direct Session above
- [x] Dashboard widget-by-widget review — **DONE** — see doc 12
- [x] Planner workflow mapping — **DONE** — see doc 13, plus Amy's session confirmed pattern-based scheduling, 2-week horizon, Square availability sync
- [x] Event calendar requirements — **RESOLVED** — events are minimal, anomaly detection approach validated
- [x] Resolve the 72% margin assumption — **RESOLVED** — unknown origin, will be configurable target + historic actual
- [ ] Data source investigation for industry benchmarks — self-benchmarking first, external data loaded at runtime later
- [ ] Define what "partial plan" means operationally — Amy's input: position-based templates ("scooper 1, scooper 2") with person assignment closer to the date
- [ ] Design visual causality for controls — how should changed numbers be highlighted?
- [ ] Marketing/social media as demand signal — new requirement from Amy's session. Instagram posts and product launches drive sales. Future integration candidate.
- [ ] Value proposition framing — Amy asked "does Square already do this?" after 43 minutes. The tool's differentiation needs to be explicit upfront.
- [ ] Square availability sync — Amy confirmed staff update availability in Square, conflicts surface there. Tool needs to ingest this.
- [ ] Strategic question: are "Lore" workflows and "Forge" workflows subtasks of the same tool, or different tools? (See Forge open questions.)

---

*Forge Baseline Session conducted: February 28, 2026*
*Stakeholder: Alex Urevick-Ackelsberg (CTO)*
*Next session: Include GM/Owner for validation and additional perspective*
