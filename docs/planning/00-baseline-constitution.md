# Baseline Product Constitution

Status: Draft for explicit confirmation  
Date: 2026-02-24  
Primary reviewer: `AlexUA`

## Why this exists
Before accepting page/widget/interface details as product truth, we need a clear baseline for what store owners and managers are trying to accomplish.

This constitution is the evaluation baseline for usefulness reviews.

## Primary users and jobs to be done
1. Store owner jobs:
   - Set operating strategy by season, hours, and labor guardrails.
   - Decide when to scale staffing up/down based on evidence.
   - Control risk exposure (profitability, compliance, overwork).
   - Approve or reject weekly plans with confidence.

2. Store manager jobs:
   - Build and adjust weekly schedules fast.
   - Resolve day-level issues (coverage gaps, PTO conflicts, request changes).
   - Submit a plan that can pass approvals and publish cleanly.
   - Understand why recommendations exist and what changed.

## Core product purpose
The site must help operators make better staffing and operating decisions with transparent tradeoffs, while preserving compliance and team wellbeing.

## Required outcomes (must hold true)
1. Decision clarity: every critical recommendation or status should explain what it means and what action is next.
2. Economic transparency: labor, revenue, and gross-profit implications are visible and traceable.
3. Operational execution: weekly schedules can move from draft -> approval -> publish without hidden blockers.
4. Policy safety: compliance and guardrail risks are surfaced before irreversible actions.
5. Trustworthy fallbacks: when data is missing or modeled, fallback behavior is explicit.

## Decision loop (owner + manager)
1. Observe: review current performance and signals.
2. Plan: draft or adjust staffing for upcoming horizon.
3. Validate: clear guardrail/compliance/readiness checks.
4. Approve: complete role-appropriate review gates.
5. Publish: send approved schedule to downstream system.
6. Learn: capture notes and outcomes to improve future decisions.

## Constitutional assumptions (explicit, pending confirmation)
1. Human approval remains required for high-impact publish decisions.
2. Managers need fast local edits, but owners need clear governance gates.
3. Modeled data can be used for planning, but must be visibly labeled.
4. A useful UI element must support a real decision, not just display information.
5. Compliance scaffolding is acceptable as placeholder only when clearly disclosed.
6. No widget/page/interface is treated as product fact until usefulness is explicitly validated.

## Non-goals right now
1. Full automation with no human approval.
2. Hidden optimization logic without explainability.
3. Treating placeholder legal guidance as production compliance enforcement.
4. Expanding features that do not improve owner/manager decisions.

## Usefulness test for governed artifacts
For each widget/page/interface, ask:
1. Which owner or manager decision does this support?
2. What action changes because this exists?
3. What risk is reduced (profit, staffing quality, compliance, or confusion)?
4. If removed, what would break in the decision loop?

If these answers are weak, classify as `needs_redesign` or `remove_candidate`.

## Governance tie-in
1. This constitution is the baseline for `validation.state` reviews.
2. Promotion to `validated_useful` requires explicit alignment with required outcomes above.
3. Conflicts between detailed artifacts and this constitution should be resolved in favor of this document until amended.

## Amendment rule
Changes to this constitution require:
1. A decision-log entry.
2. Updated downstream review criteria where relevant.
3. Explicit reviewer confirmation.
