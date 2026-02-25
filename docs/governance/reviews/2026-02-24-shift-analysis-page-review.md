# Wave 2 Review: `shift_analysis` (page)

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Manager/owner decision on whether recent staffing outcomes met expectations and what drove variances.
   - Constitution decision loop step 6 ("Learn"): capture outcomes to improve future decisions.

2. What action changes because this exists?
   - Managers and owners can switch between actual-vs-baseline and planned-vs-actual compare modes to isolate variance causes.
   - Lookback window (1-4 weeks) allows targeted analysis of recent performance.
   - Context notes create institutional memory for future planning interpretation.

3. What risk is reduced?
   - Reduces risk of repeating staffing mistakes by providing a dedicated retrospective analysis surface.
   - Store scope filter ensures analysis can be location-specific or portfolio-wide.

4. What breaks if removed?
   - The recent_staffing_analysis_panel widget loses its composition page.
   - No dedicated retrospective analysis surface — the "Learn" step in the decision loop has no landing page.

5. Overlap/duplication check
   - Dashboard is owner-facing strategic analysis; this page is operational retrospective analysis. Different purpose and audience emphasis.
   - Shares the staffing-planner.html file with shift_planner and settings but occupies a distinct hash route (#shift_analysis).

## Comparative-owner need alignment
- Supports owner understanding of "why was this week better or worse" through variance analysis and weather attribution. Store scope filter enables store-to-store retrospective comparison.

## Findings
1. High usefulness as the dedicated retrospective analysis surface completing the decision loop.
2. Clean composition: single widget (recent_staffing_analysis_panel) with page-level filters for scope, lookback, and compare mode.
3. Permission model allows both manager and owner access with appropriate capabilities (annotate vs review).
4. Context notes are valuable institutional memory but local-only — needs server migration for multi-user scenarios.

## Recommendation
- Recommended state: `validated_useful`.
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Migrate context notes to server-side storage for multi-user visibility.
  2. Consider adding export capability for analysis summaries.
  3. Define whether manager notes should be visible to owners and vice versa.

## Owner feedback (2026-02-25)
- **Analytics usefulness**: Need to make sure the various analytics are determined to be useful before implementing.
- **AI summary**: Want an AI bot to create a summary of what changed in each analysis period.
- **Guardrail indicators**: Need to account for guardrails by giving some sort of indication when a shift appears a certain way (e.g., violated a guardrail).

## Source evidence
- `apps/ice-cream-ops/staffing-planner.js:2756`
- `apps/ice-cream-ops/staffing-planner.js:3530`
- `packages/ui-manifests/pages/shift_analysis/page.manifest.json`
