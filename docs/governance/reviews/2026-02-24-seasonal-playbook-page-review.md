# Wave 2 Review: `seasonal_playbook` (page)

Date: 2026-02-24
Reviewer: `AlexUA`
Review mode: Constitution-aligned usefulness pass (recommendation only; manifest state not yet promoted)

## Constitution test
1. Which decision does this support?
   - Owner decision on seasonal staffing scale-up/scale-down timing and trigger threshold configuration.
   - Owner/strategy lead management of target profiles by location and season.

2. What action changes because this exists?
   - Owners and GMs can configure trigger profiles and threshold interpretations for seasonal transitions.
   - Location/date/month filters enable targeted seasonal analysis.
   - Context feeds back to dashboard strategic scaling widgets (trigger gap planner, scale timing monitor).

3. What risk is reduced?
   - Reduces risk of ad-hoc seasonal decisions by providing a dedicated strategy configuration surface.
   - Trigger profile editing is centralized rather than scattered across surfaces.

4. What breaks if removed?
   - Trigger and profile configuration loses its dedicated page. Editing would need to happen on dashboard (where it's currently duplicated).
   - Charter core outcome #1 ("seasonal staffing scale up/down timing") loses its strategic configuration surface.

5. Overlap/duplication check
   - Dashboard currently allows trigger profile editing alongside analytics. This page is intended to be the canonical trigger/profile configuration surface, with dashboard becoming read-only for triggers. This deduplication is a pending design decision.
   - No empty widgets array indicates this page currently renders inline content rather than governed widgets.

## Comparative-owner need alignment
- Supports owner seasonal strategy through per-location trigger configuration and target profile management.

## Findings
1. Useful as the dedicated seasonal strategy surface, but currently has no governed widget composition (empty widgets array).
2. The page shares app.js render pipeline gated by APP_PAGE, which works but limits independent evolution.
3. Trigger editing duplication between dashboard and playbook needs resolution — one surface should be canonical.
4. Seasonal logic remains client-side with no policy engine backing.

## Recommendation
- Recommended state: `validated_useful` (with follow-ups to resolve trigger editing ownership).
- Recommended basis on promotion: `approved_product_decision`.
- Recommended follow-ups:
  1. Resolve trigger editing ownership: dashboard should become read-only for triggers, with this page as the canonical edit surface.
  2. Extract playbook-specific widgets from inline rendering into governed widget manifests.
  3. Add change history for trigger profile modifications.
  4. Define minimum data history required before enabling trigger-based automation.

## Owner feedback (2026-02-25)
- **Data-first approach**: Ingest all historical data first (sales and staffing), analyze how sales changed historically by season, evaluate past margin performance, then recommend different "seasons" based on findings.
- **Season granularity**: Currently assumes 2 step-up and 2 step-down periods — is that sufficient or should we look for more nuance?
- **Guardrail interaction**: Guardrails may not have been in place historically. When guardrails change, may need to rerun the playbook.
- **Page clarity**: Should clearly show what seasonal assumptions are, indicate upcoming actions to prepare for the new season, and show how guardrails affect items.

## Source evidence
- `apps/ice-cream-ops/seasonal-playbook.html`
- `apps/ice-cream-ops/app.js:2416`
- `apps/ice-cream-ops/app.js:2622`
- `packages/ui-manifests/pages/seasonal_playbook/page.manifest.json`
