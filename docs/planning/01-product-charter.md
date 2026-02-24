# Product Charter (Normalized)

## Source
- `/Users/AlexUA/claude/milkjawn-claude-files/Joyus AI - Ice Cream Store Manager.md`

## Product goal
Build an ice-cream-focused operations system for Milk Jawn and other operators that improves profitability and staffing quality without overworking staff.

## Core outcomes
1. Seasonal staffing scale up/down timing.
2. Per-location profitability visibility.
3. Forward staffing horizon for hiring and capacity planning.
4. Proposed schedule generation from historical schedules, guardrails, and seasonality.
5. Optimization for profitability and team wellbeing.

## Required scheduling guardrails
1. Never fewer than 2 closers.
2. Employees working one hour before close stay through close.
3. Youth labor compliance must account for federal/state/local rules and school constraints.
4. Opening/closing labor and shared manager time must be included in daily economics.

## Workforce model requirements
1. Role and manager designation controls.
2. Ability to allocate manager/admin time percentage across stores.
3. Bench capacity to absorb PTO/sick-outs without overtime spikes.

## Business questions to answer
1. Impact of adding open days (e.g., Monday) on staffing and income.
2. When to shift seasonal operating hours.
3. Manager/key-lead sufficiency and affordability.
4. Peak-time staffing required to maintain service quality.

## Integration requirements
1. Ingest historical timesheets (Square first; extensible).
2. Ingest historical sales (Square, Toast, delivery channels).
3. Ingest PTO requests.
4. Build schedules in-app, approve, then publish to Square.

## AI requirements
1. Natural-language Q&A over tenant data.
2. Controlled intake for widget/feature suggestions (no arbitrary plugin install by end users).

## Settings requirements
1. Guardrails/rules.
2. Youth worker setup.
3. Store hours and seasonal operating calendar.
4. Target profiles and manager assumptions.
