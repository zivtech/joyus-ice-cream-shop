# 08 — Calculation Logic Audit

> **Status**: Complete
> **Created**: 2026-02-24
> **Purpose**: Catalog all business logic in `app.js` and `staffing-planner.js`, classify each function by extraction target (ENGINE / BACKEND / FRONTEND / CONFIG), and identify bugs, hardcoded values, and migration considerations for the Laravel + scheduling engine reboot.

---

## Table of Contents

1. [Summary](#summary)
2. [Classification Legend](#classification-legend)
3. [app.js — Dashboard & Analytics](#appjs--dashboard--analytics)
4. [staffing-planner.js — Shift Planning & Scheduling](#staffing-plannerjs--shift-planning--scheduling)
5. [Hardcoded Values Registry](#hardcoded-values-registry)
6. [Bugs & Issues Found](#bugs--issues-found)
7. [Shared Concepts (Cross-File)](#shared-concepts-cross-file)
8. [Extraction Plan Summary](#extraction-plan-summary)

---

## Summary

| File | Total Lines | Functions | ENGINE | BACKEND | FRONTEND | CONFIG |
|------|-------------|-----------|--------|---------|----------|--------|
| `app.js` | ~3,587 | ~95 | ~40% | ~15% | ~35% | ~10% |
| `staffing-planner.js` | ~4,701 | ~130+ | ~30% | ~10% | ~50% | ~10% |
| **Combined** | **~8,288** | **~225+** | **~34%** | **~12%** | **~44%** | **~10%** |

The **ENGINE** functions (~2,800 lines) are the extractable business logic that will become the standalone TypeScript scheduling/analytics engine. The **BACKEND** functions (~1,000 lines) become Laravel controllers, services, and jobs. The **FRONTEND** functions (~3,600 lines) get rewritten in React. The **CONFIG** values (~800 lines) become database-backed tenant settings.

---

## Classification Legend

| Tag | Destination | Meaning |
|-----|------------|---------|
| **ENGINE** | `packages/scheduling-engine/` | Pure calculation logic. No DOM, no HTTP, no framework. Portable TypeScript module with zero dependencies. |
| **BACKEND** | Laravel (PHP) | Server-side operations: persistence, auth, POS integration, export, approval workflow state machine. |
| **FRONTEND** | React components | UI rendering, DOM manipulation, event binding, chart rendering. Rewritten, not ported. |
| **CONFIG** | Database / tenant settings | Hardcoded constants that become configurable tenant-level settings stored in Eloquent models. |

---

## app.js — Dashboard & Analytics

**File**: `apps/ice-cream-ops/app.js` (~3,587 lines)
**Role**: Dashboard, financial analytics, seasonal playbook, Excel export

### ENGINE Functions (extract to scheduling engine)

These are the core financial model. They compute revenue, labor cost, gross profit, and labor percentage from POS data.

#### Core Financial Model

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `weeklyMetricsForLocationAtMonth()` | 789 | **Fundamental financial calculation.** Computes weekly revenue, labor, GP@72%, labor% for a location-month. Handles 6-day vs 7-day plans, Monday scenarios, shared manager impact. | Central to everything. All KPIs derive from this. |
| `weeklyMetricsForLocation()` | 844 | Averages `weeklyMetricsForLocationAtMonth` across selected months. | Aggregation wrapper. |
| `monthlyMetricsForLocationAtMonth()` | 908 | Monthly-grain version: multiplies weekly by month's Monday count, applies manager labor. | Uses `monthWeekFactor` and `data.calendar[monthKey].mondays`. |
| `monthlyMetricsForScopeAtMonth()` | 949 | Sums monthly metrics across all in-scope locations. | Multi-location aggregation. |
| `annualMetricsForLocation()` | 991 | Full-year comparison: current 6-day plan vs hypothetical 7-day plan. | Strategic scenario modeling. |
| `combinedAnnualMetrics()` | 1049 | Combines annual metrics across all locations. | Portfolio view. |
| `rollingAverage()` | 979 | Smoothing function for time-series data. | Generic utility. |

#### Revenue & Labor Helpers

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `revenueWithMode()` | 764 | Adjusts revenue based on DoorDash inclusion mode (`include`, `exclude`, `doordash_only`). | DoorDash adapter logic. |
| `tuesdayBaselineForMonth()` | 770 | Uses Tuesday as Monday revenue proxy (lowest non-Monday day). | Heuristic — document the assumption. |
| `monthWeekFactor()` | 423 | Weeks-per-month for labor projection. | Calendar math. |
| `sharedManagerWeeklyImpact()` | 390 | Calculates per-store labor cost of a shared manager across locations. | Manager scenario modeling. |
| `isSharedManagerActive()` | 386 | Checks if shared manager scenario is in effect. | Configuration check. |
| `managerHourlyRate()` | 378 | Reads manager pay rate from data. | → CONFIG when tenant-configurable. |
| `managerWeeklyHours()` | 382 | Reads manager weekly hours from data. | → CONFIG when tenant-configurable. |
| `isDoorDashIncluded()` | 760 | Checks DoorDash inclusion mode. | DoorDash adapter check. |

#### Seasonal Playbook Engine

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `triggerTimingForLocation()` | 2037 | Evaluates seasonal transition rules against historical data. Calculates hit rates across observed months. | Core seasonal intelligence. |
| `conditionMet()` | 726 | Generic threshold comparator (`>=`, `<=`, `>`, `<`, `==`). | Reusable in compliance engine too. |
| `conditionGap()` | 2149 | Distance between current metric value and trigger threshold. | Decision support. |
| `closestTriggerGap()` | 2257 | Finds which seasonal trigger is nearest to firing for a location. | "What's about to change" signal. |
| `seasonFromMonth()` | 510 | Maps month key to season name. | Calendar utility. |
| `buildTriggerRulesForProfile()` | 639 | Constructs trigger conditions from a named profile (conservative/balanced/growth). | Profile → rules transformation. |
| `profileThresholdFromDefault()` | 628 | Adjusts default thresholds based on profile's revenue factor and share delta. | Profile math. |

#### Benchmarking

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `healthSignal()` | 1076 | Maps labor% to health bands: green (<25%), yellow (25-30%), red (>30%). | Simple threshold logic. |
| `benchmarkTone()` | 2171 | Compares a metric to survey benchmark bands (p25/p50/p75). | Industry comparison. |
| `monthMetricsForLocation()` | 698 | Extracts per-metric values for a location-month from raw data. | Data access layer. |

### BACKEND Functions (migrate to Laravel)

#### Excel Export Pipeline

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `exportWorkbookToExcel()` | 3068 | Orchestrates multi-sheet Excel export using SheetJS. | → Laravel Excel export (Maatwebsite/Excel). |
| `appendSheet()` | 2671 | Creates a worksheet with headers, rows, formatting. | SheetJS utility. |
| `freezeTopRow()` | 2643 | Freezes header row in Excel. | SheetJS utility. |
| `applyColumnFormats()` | 2653 | Applies number/currency/percent formatting. | SheetJS utility. |
| `buildReadmeRows()` | 2740 | Metadata sheet: date range, locations, scenarios. | Export context. |
| `buildKpiSummaryRows()` | 2769 | KPI summary sheet. | Uses ENGINE functions. |
| `buildStaffingPlanRows()` | 2830 | Staffing plan detail sheet. | Uses ENGINE functions. |
| `buildDaypartRows()` | 2898 | Day-part revenue breakdown. | Uses ENGINE functions. |
| `buildTriggerRows()` | 2927 | Seasonal trigger status sheet. | Uses ENGINE functions. |
| `buildDailyRawRows()` | 2955 | Raw daily data export. | Data dump. |
| `buildLocationBenchmarkRows()` | 2988 | Benchmark comparison sheet. | Uses ENGINE + SURVEY_BENCHMARKS. |
| `buildRunCostRows()` | 3040 | Estimated run costs sheet. | Infrastructure costing. |
| `estimateRunCosts()` | 2692 | Calculates Square API costs, worker hours. | Infrastructure costing. |
| `exportContext()` | 2716 | Assembles export metadata (locations, months, scenario settings). | Export context. |
| `exportFileName()` | 3061 | Generates filename from context. | Naming convention. |

### FRONTEND Functions (rewrite in React)

All `render*()` functions, `bindControls()`, `hydrate*()`, chart rendering (`renderWeekdayChart`, `renderHourlyChart`, `renderHistoricalTrendPanel`), and DOM manipulation. ~35% of the file. Not itemized here — they are rewritten, not ported.

Key chart functions to note for React component planning:
- `renderWeekdayChart()` (line 1229) — Chart.js bar chart, weekday revenue/labor
- `renderHourlyChart()` (line 1365) — Chart.js line chart, hourly sales curves
- `renderHistoricalTrendPanel()` (line 1803) — Multi-metric trend lines
- `renderPlaybookPanel()` (line 2416) — Seasonal trigger dashboard
- `renderSurveyPanel()` (line 2186) — Industry benchmark comparison

### CONFIG Values (move to tenant settings)

| Constant | Line | Value | Notes |
|----------|------|-------|-------|
| `MONDAY_FACTORS` | 25 | `{low: 0.55, base: 0.65, high: 0.75}` | Monday revenue as % of Tuesday baseline. |
| `SURVEY_BENCHMARKS` | 86 | Industry medians and bands for ticket, COGS%, labor%, rent%, profit%. | Could be admin-managed reference data. |
| `PLAYBOOK_TARGET_PROFILES` | 59 | Conservative/balanced/growth profiles with revenue factors and share deltas. | Seasonal strategy presets. |
| `PLAYBOOK_TRIGGER_DEFAULTS` | (loaded via `cloneTriggerDefaults`) | Threshold rules for seasonal transitions. | Per-tenant seasonal config. |
| Hardcoded `0.72` GP factor | 828, 898, 944 | `revenue * 0.72` appears 3+ times as the gross profit margin assumption. | **Must become configurable.** COGS varies by tenant. |

---

## staffing-planner.js — Shift Planning & Scheduling

**File**: `apps/ice-cream-ops/staffing-planner.js` (~4,701 lines)
**Role**: Shift planning board, coverage validation, cost projection, weather-demand signals, approval workflow, Square export

### ENGINE Functions (extract to scheduling engine)

#### Coverage & Validation

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `dayValidation()` | 1227 | Validates minimum opener/closer coverage for a day. | **BUG: hardcodes min counts instead of reading from `state.settings.workflow`.** See [Bugs](#bugs--issues-found). |
| `weekLaborHours()` | 1247 | Sums total labor hours across a week's slots. | Simple aggregation. |
| `nextWeekChecks()` | 2638 | Pre-submission validation: pending requests, unsubmitted exceptions, unassigned positions, invalid coverage, PTO conflicts. | Approval gate logic. |
| `assignmentGapSummary()` | 2594 | Counts unassigned positions across upcoming weeks. | Readiness metric. |

#### Financial Viability

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `dayFinancialViability()` | 1895 | Core profitability check. Compares planned labor cost vs expected revenue using configurable target/watch thresholds. Returns tone (good/watch/risk), expected GP@72%. | **Key scheduling constraint.** |
| `estimatedLaborForDay()` | 1888 | Sums labor cost for all slots: `hours * headcount * rate`. | Cost projection. |
| `roleRateForSlot()` | 1880 | Maps role name → pay rate using settings. Falls back to defaults. | Uses regex: `/manager/`, `/lead/`, else scooper rate. |
| `expectedDayProfile()` | 1867 | Looks up historical avg revenue/labor/GP/labor% for a location-weekday-month. | Baseline data access. |
| `overstaffAssessment()` | 1949 | Post-hoc analysis: was a past day overstaffed? Combines revenue miss (actual < 90% expected) with labor pressure (actual labor% > expected+3 or > target). Factors in weather. | Retrospective intelligence. |

#### Weather-Demand Integration

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `weatherImpactSignal()` | 873 | **Core weather engine.** Evaluates temp delta (±10F threshold) and timed precipitation. Returns impact direction (up/down/neutral) with reasoning. | Multi-signal: temp delta + precipitation timing. |
| `temperatureDeltaForDate()` | 853 | Computes actual vs expected temperature difference using 6-year normals. | Uses `weatherNormals` data. |
| `expectedTempForDate()` | 847 | Looks up expected high temperature from normals. | Normals lookup. |
| `timedPrecipSignal()` | 1659 | Checks hourly forecast for rain/snow during business hours. Returns impact with timing window. | Hourly resolution. |
| `staffingWeatherAction()` | 953 | Converts weather signal → specific staffing recommendation ("+1 peak slot" or "trim 1 slot"). | Decision output. |
| `weatherLine()` | 1691 | Generates one-line weather summary for a date. | Display helper but logic-heavy. |
| `weatherCodeLabel()` | 832 | Maps WMO weather codes to human-readable labels. | Reference data. |
| `dayRecommendation()` | 986 | Combines weather signal + historical data → staffing adjustment recommendation for a day. | Orchestrates weather + baseline. |
| `applyRecommendationToDay()` | 1024 | Applies a recommendation by adjusting slot headcounts. | Mutation logic. |

#### Template System

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `buildTemplateSlots()` | 1217 | Creates default shift slots for a weekday from template profiles. | Template → slots. |
| `templateSlotDefsForLocationDay()` | 475 | Resolves template slot definitions for a location-weekday by merging profiles. | Profile merging. |
| `weeklyTemplateProfileForLocation()` | 464 | Resolves the active template profile for a location (custom or default). | Template resolution. |
| `sourceTemplateProfilesForLocation()` | 442 | Returns all template profiles in priority order for a location. | Profile hierarchy. |
| `mergeTemplateProfiles()` | 417 | Merges multiple template profiles with last-wins semantics per weekday. | Deep merge. |
| `normalizeTemplateProfile()` | 404 | Validates/normalizes a template profile's structure. | Input normalization. |
| `normalizeTemplateSlot()` | 390 | Validates a single template slot (start, end, role, headcount). | Input normalization. |
| `slotSnapshotForLabor()` | 2074 | Scales a template snapshot to match a target labor level. | What-if modeling. |
| `scaleSlotSnapshotByLabor()` | 2058 | Adjusts headcounts proportionally to hit a target labor factor. | Scaling math. |
| `templateSlotSnapshot()` | 2049 | Takes a snapshot of template slots for comparison. | Snapshot utility. |

#### Shift Slot Utilities

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `makeSlot()` | 756 | Creates a slot object with start, end, role, headcount, assignments. | Factory. |
| `slotHours()` | 781 | Calculates hours in a slot (handles overnight). | `(end - start)` with wraparound. |
| `parseTimeToHours()` | 775 | Parses "HH:MM" → decimal hours. | Time math. |
| `hourToTime()` | 787 | Converts decimal hours → "HH:MM". | Time math. |
| `isOpenerRole()` / `isCloserRole()` | 973/977 | Tests role name against opener/closer patterns. | Regex classification. |
| `isAdjustableRole()` | 981 | Whether a role's headcount can be auto-adjusted. | Excludes openers/closers. |
| `isEveningSlot()` | 826 | Whether a slot extends past 17:00. | Time classification. |
| `seasonHoursFor()` | 798 | Resolves open/close hours for a given season using settings. | Settings lookup. |

#### PTO & Employee Management

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `ptoSummaryForDay()` | 1298 | Checks assigned employees against PTO requests. Returns conflicts list. | Conflict detection. |
| `ptoRowsForDay()` | 1276 | Filters PTO requests to a specific date. | Date filter. |
| `ptoRowsForRange()` | 1272 | Filters PTO requests to a date range. | Date range filter. |
| `ptoDateOverlap()` | 1267 | Tests if a PTO request overlaps with a date range. | Date math. |
| `ptoLocationMatches()` | 1260 | Tests if PTO applies to a given location (handles `ALL`). | Location matching. |
| `assignedPeopleForDay()` | 1287 | Extracts all assigned employee names from a day's slots. | Deduplication logic. |
| `employeePoolForLocation()` | 1131 | Returns eligible employees for the current location from Square roster. | Data access. |
| `matchEmployeesByQuery()` | 1140 | Fuzzy-matches employee names for assignment autocomplete. | Search/filter. |
| `assignShiftForward()` | 1181 | Repeats an assignment across future weeks (up to REPEAT_ASSIGNMENT_WEEKS=12). | Bulk assignment. |

#### Date & Calendar Utilities

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `toMonday()` | 696 | Snaps a date to its week's Monday. | Week alignment. |
| `nextMonday()` | 702 | Next upcoming Monday from a given date. | Week start calculation. |
| `seasonForDate()` | 709 | Maps a date to a season. | Uses opening schedule settings. |
| `isoDate()` / `parseIso()` / `addDays()` | 681-696 | Date manipulation utilities. | Standard date math. |
| `plannerDateRange()` | 1314 | Calculates the full date range of the planner horizon. | Range calculation. |

### BACKEND Functions (migrate to Laravel)

#### Approval Workflow State Machine

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `submitNextWeekForGMApproval()` | 2701 | Validates readiness (5 checks) then transitions to `pending`. | **Core workflow — must be server-side.** |
| `setGMDecision()` | 2734 | GM approves or rejects. On reject, marks all days as `hasException`. | **Core workflow — must be server-side.** |
| `invalidateNextWeekApproval()` | 2688 | If week 0 was approved and gets edited, resets to `draft`. | Edit-invalidation rule. |
| `markException()` | 3959 | Flags a day as having an unsubmitted exception. | State mutation. |
| `submitChangeRequest()` | 3963 | Creates a policy exception request for a day. | Request creation. |
| `setRequestStatus()` | 4012 | Approves or denies a policy exception request. | Request resolution. |
| `requestSummaryCounts()` | 2630 | Counts pending/approved/denied requests. | Aggregation. |

**Approval State Machine**: `draft` → `pending` (via `submitNextWeekForGMApproval`) → `approved` | `rejected` (via `setGMDecision`). Editing an approved week resets to `draft` (via `invalidateNextWeekApproval`).

#### Persistence

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `saveState()` | 1506 | Serializes entire planner state to localStorage. | → Laravel API (POST /schedules). |
| `loadState()` | 1542 | Deserializes planner state from localStorage with migration logic. | → Laravel API (GET /schedules). |
| `buildWeeks()` | 1458 | Constructs week/day/slot structure for the planning horizon. | Initialization logic. |

#### POS Integration

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `exportApprovedPayload()` | 4036 | Validates, assembles, and downloads approved schedule as JSON for Square publish. | **5 validation gates** before export. → Laravel export endpoint. |

#### Auth

| Function | Line | Purpose | Notes |
|----------|------|---------|-------|
| `applyAuthGate()` | 4611 | Simple password check against hardcoded `AUTH_PASSWORD`. | **Security issue.** → Laravel Sanctum. |

### FRONTEND Functions (rewrite in React)

~50% of the file. Major rendering functions:
- `renderPlannerBoard()` (line 2266) — The main shift board with drag/drop (~300 lines)
- `renderWeeklySidebar()` (line 3325) — Weekly summary sidebar
- `renderApprovalsPage()` (line 3422) — Approval queue UI
- `renderRecentPerformanceSection()` (line 2756) — Recent staffing analysis (~350 lines)
- `renderRecentStaffingView()` (line 3568) — Staffing history view
- `renderComplianceView()` (line 3586) — Compliance check display (~300 lines)
- `renderControls()` (line 3915) — Settings panel
- `renderTopMenu()` / `renderPlannerSubnav()` (line 3110/3125) — Navigation
- `renderPageInstructions()` (line 3287) — Contextual help text
- All `bind*Events()` functions

### CONFIG Values (move to tenant settings)

| Constant | Line | Value | Notes |
|----------|------|-------|-------|
| `AUTH_PASSWORD` | 3 | `'mj2026'` | **SECURITY: Remove immediately.** → Laravel Sanctum auth. |
| `SQUARE_LOCATION_IDS` | 22 | `{EP: 'LYPJTCTZKM211', NL: 'LDBQAYTKVHZAT'}` | Tenant-specific POS config. |
| `LOCATION_LABELS` | 17 | `{EP: 'East Passyunk', NL: 'Northern Liberties'}` | Tenant-specific location names. |
| `LOCATION_WEATHER_COORDS` | 34 | Lat/lon for EP and NL. | Per-location weather coords. |
| `TARGET_LABOR_PCT` | 45 | `24` | → `settings.targetProfile.laborTargetPct`. |
| `DEFAULT_OPERATIONS_SETTINGS` | 59 | Pay rates, labor targets, workflow rules, season hours. | **Already structured as settings** — good migration shape. |
| `DEFAULT_BUSINESS_WEEKLY_TEMPLATE` | 90 | Weekly shift template: roles, times, headcounts. | Per-tenant template config. |
| `PTO_SYNC_ENDPOINT` | 46 | `/api/v1/integrations/square/pto` | API route config. |
| `REPEAT_ASSIGNMENT_WEEKS` | 47 | `12` | Auto-assignment horizon. |
| `WEATHER_FORECAST_DAYS` | 44 | `16` | Weather lookahead window. |
| `NORMALS_YEARS_BACK` | 40 | `6` | Historical weather averaging window. |

---

## Hardcoded Values Registry

Values that appear as magic numbers in calculation logic and must become tenant-configurable:

| Value | Where | Meaning | Target |
|-------|-------|---------|--------|
| `0.72` | app.js:828, 898, 944; planner:1915 | Gross profit margin (1 - COGS%) | `tenant.settings.gpMarginFactor` |
| `0.55 / 0.65 / 0.75` | app.js:26-28 | Monday revenue factors | `tenant.settings.mondayScenarios` |
| `24` | planner:45, DEFAULT_OPERATIONS_SETTINGS | Target labor % | `tenant.settings.targetProfile.laborTargetPct` |
| `27` | DEFAULT_OPERATIONS_SETTINGS | Labor watch % | `tenant.settings.targetProfile.laborWatchPct` |
| `28 / 17 / 15` | DEFAULT_OPERATIONS_SETTINGS | Manager / Key Lead / Scooper pay rates | `tenant.settings.payRates` |
| `10` (degrees) | planner:915, 928 | Weather impact threshold (±10F) | `tenant.settings.weatherThresholdF` |
| `0.9` | planner:1970 | Revenue miss threshold (actual < 90% expected) | `tenant.settings.revenueMissThreshold` |
| `3` | planner:1971 | Labor pressure delta (actual% > expected% + 3) | `tenant.settings.laborPressureDelta` |
| `1 / 2` | planner:1236, 1240 | Min openers / min closers (BUG: should read from settings) | `tenant.settings.workflow.minOpeners/minClosers` |
| `12` | planner:47 | Repeat assignment weeks forward | `tenant.settings.repeatAssignmentWeeks` |
| `6` | planner:40 | Weather normals lookback years | `tenant.settings.weatherNormalsYears` |

---

## Bugs & Issues Found

### BUG-1: `dayValidation()` ignores configurable settings (staffing-planner.js:1227)

**Severity**: Medium
**Description**: `dayValidation()` hardcodes `openerCount < 1` and `closerCount < 2` instead of reading from `state.settings.workflow.minOpeners` and `state.settings.workflow.minClosers`. The settings panel lets users configure these values but the validation function ignores them.

**Current code**:
```javascript
if (openerCount < 1) {
  return { ok: false, message: 'Need at least one opener shift.' };
}
if (closerCount < 2) {
  return { ok: false, message: 'Need at least two closing positions.' };
}
```

**Should be**:
```javascript
const settings = normalizeSettingsProfile(state.settings);
const minOpeners = Number(settings.workflow?.minOpeners ?? 1);
const minClosers = Number(settings.workflow?.minClosers ?? 2);

if (openerCount < minOpeners) {
  return { ok: false, message: `Need at least ${minOpeners} opener shift(s).` };
}
if (closerCount < minClosers) {
  return { ok: false, message: `Need at least ${minClosers} closing position(s).` };
}
```

**Impact**: Users who change min opener/closer settings in the operations panel will see no effect on validation. The system always enforces 1 opener and 2 closers regardless.

### BUG-2: Hardcoded auth password (staffing-planner.js:3)

**Severity**: Critical (for production)
**Description**: `AUTH_PASSWORD = 'mj2026'` is a plaintext password visible in client-side source code. Currently acceptable for internal prototype but must be replaced with Laravel Sanctum before any external access.

### ISSUE-1: GP margin (0.72) hardcoded throughout

**Severity**: Medium (multi-tenant blocker)
**Description**: The `0.72` gross profit factor (assuming 28% COGS) appears in at least 4 locations across both files. Different tenants will have different COGS percentages. This must become `1 - tenant.cogsPct / 100`.

### ISSUE-2: Milk Jawn-specific location data throughout

**Severity**: Low (expected for current state)
**Description**: Location codes (`EP`, `NL`), Square location IDs, weather coordinates, and labels are all Milk Jawn-specific. The multi-tenant architecture must load these from tenant configuration, not constants.

### ISSUE-3: Weather normals data structure is implicit

**Severity**: Low
**Description**: The weather system relies on `weatherNormals` data keyed by location and day-of-year, but the data schema is never formally defined. When building the engine, the normals interface needs explicit TypeScript types.

---

## Shared Concepts (Cross-File)

These concepts appear in both files and need unified definitions in the scheduling engine:

| Concept | app.js Usage | staffing-planner.js Usage | Engine Type |
|---------|-------------|--------------------------|-------------|
| **Location** | `state.location`, `locationsInScope()` | `state.location`, `plannerLocationCodes()` | `Location { code, label, squareId, coords }` |
| **Season** | `seasonFromMonth()`, playbook triggers | `seasonForDate()`, season hours | `Season { name, startDate, endDate, hours }` |
| **Labor %** | `laborPct` in all metrics | `plannedLaborPct` in viability | `number` (0-100) |
| **GP@72%** | `revenue * 0.72 - labor` | `expectedRevenue * 0.72 - plannedLabor` | `gpMargin(revenue, labor, cogsPct)` |
| **Health signal** | `healthSignal(laborPct)` | `dayFinancialViability()` tone | `HealthTone: 'good' | 'watch' | 'risk'` |
| **DoorDash mode** | `revenueWithMode()` | Not directly used (planner doesn't show delivery split) | `DeliveryMode: 'include' | 'exclude' | 'delivery_only'` |
| **Pay rates** | `managerHourlyRate()` from data | `roleRateForSlot()` from settings | `PayRates { [roleName]: number }` |
| **Slot** | N/A | `makeSlot()`, all planner operations | `Slot { start, end, role, headcount, assignments }` |
| **Template** | N/A | Template system (~10 functions) | `TemplateProfile { [weekday]: Slot[] }` |

---

## Extraction Plan Summary

### Phase 0 Deliverable: Scheduling Engine Skeleton

Based on this audit, the scheduling engine should expose these modules:

```
packages/scheduling-engine/
├── src/
│   ├── financial/
│   │   ├── metrics.ts          # weeklyMetrics, monthlyMetrics, annualMetrics
│   │   ├── gp.ts               # grossProfit(revenue, labor, cogsPct)
│   │   ├── labor.ts            # laborPct, estimatedLaborForDay, roleRateForSlot
│   │   └── benchmarks.ts       # healthSignal, benchmarkTone
│   ├── scheduling/
│   │   ├── validation.ts       # dayValidation, nextWeekChecks
│   │   ├── coverage.ts         # opener/closer rules, assignment gaps
│   │   ├── templates.ts        # template resolution, merging, slot building
│   │   └── slots.ts            # makeSlot, slotHours, time math
│   ├── weather/
│   │   ├── impact.ts           # weatherImpactSignal, temperatureDelta
│   │   ├── precipitation.ts    # timedPrecipSignal
│   │   └── recommendations.ts  # dayRecommendation, staffingWeatherAction
│   ├── seasonal/
│   │   ├── triggers.ts         # triggerTimingForLocation, conditionMet
│   │   ├── profiles.ts         # buildTriggerRulesForProfile
│   │   └── calendar.ts         # seasonForDate, seasonFromMonth
│   ├── pto/
│   │   ├── conflicts.ts        # ptoSummaryForDay, ptoDateOverlap
│   │   └── filters.ts          # ptoRowsForDay, ptoRowsForRange
│   ├── delivery/
│   │   └── revenue.ts          # revenueWithMode, delivery margin adjustments
│   ├── retrospective/
│   │   ├── overstaff.ts        # overstaffAssessment
│   │   └── variance.ts         # planned vs actual analysis
│   └── types/
│       ├── location.ts
│       ├── slot.ts
│       ├── metrics.ts
│       ├── weather.ts
│       ├── settings.ts         # TenantSettings with all configurable values
│       └── index.ts
├── package.json
└── tsconfig.json
```

### Migration Priority

1. **Types first** — Define `TenantSettings`, `Slot`, `Location`, `Metrics` types from the hardcoded values registry
2. **Financial core** — `grossProfit()`, `laborPct()`, `weeklyMetrics()` — everything depends on these
3. **Validation** — `dayValidation()` (fix the bug), `nextWeekChecks()`
4. **Weather** — `weatherImpactSignal()`, `dayRecommendation()` — high user value, complex logic
5. **Templates** — Template resolution and merging
6. **Seasonal** — Trigger evaluation and profiles
7. **PTO/Retrospective** — Lower priority, simpler logic

### What Gets Rewritten (Not Ported)

- All `render*()` functions → React components
- All `bind*()` functions → React event handlers
- Chart rendering → React chart library (Recharts or similar)
- `exportWorkbookToExcel()` → Laravel server-side Excel export
- `saveState()` / `loadState()` → Laravel API + React Query
- `applyAuthGate()` → Laravel Sanctum + middleware
- Approval state machine → Laravel service + database state
