import type {
  Season,
  TransitionKey,
  LocationTriggerRules,
  TriggerTiming,
  TriggerGapEvaluation,
  TriggerGapCondition,
  PlaybookMetrics,
} from '../types/index.js';

import { TRANSITION_ORDER } from '../types/index.js';
import { conditionMet, conditionGap } from '../financial/benchmarks.js';

/**
 * Determine season from a month key string "YYYY-MM".
 * From app.js:510-516.
 */
export function seasonFromMonth(monthKey: string): Season {
  const monthNum = Number(String(monthKey).split('-')[1] || 0);
  if (monthNum === 12 || monthNum <= 2) return 'winter';
  if (monthNum <= 5) return 'spring';
  if (monthNum <= 8) return 'summer';
  return 'fall';
}

/**
 * Determine season from a Date object.
 * From staffing-planner.js:709-715.
 */
export function seasonForDate(date: Date): Season {
  const month = date.getMonth() + 1;
  if (month === 12 || month <= 2) return 'winter';
  if (month <= 5) return 'spring';
  if (month <= 8) return 'summer';
  return 'fall';
}

/**
 * Evaluate trigger timing across a set of months for a location.
 * From app.js:2037-2061.
 * Takes a getMetrics callback to avoid coupling to data shape.
 */
export function triggerTimingForLocation(
  rules: LocationTriggerRules,
  monthKeys: string[],
  getMetrics: (monthKey: string) => PlaybookMetrics,
  currentMonth: string | null,
  monthLabels: Record<string, string>,
): TriggerTiming[] {
  return TRANSITION_ORDER.map((ruleKey) => {
    const rule = rules[ruleKey];
    const hits = monthKeys.filter((monthKey) => {
      const metrics = getMetrics(monthKey);
      return rule.conditions.every((cond) =>
        conditionMet(
          (metrics as unknown as Record<string, number>)[cond.metric] ?? 0,
          cond.operator,
          cond.threshold,
        ),
      );
    });

    const hitRate = monthKeys.length ? (hits.length / monthKeys.length) * 100 : 0;
    const currentMet = currentMonth !== null && hits.includes(currentMonth);

    return {
      ruleKey,
      label: rule.label,
      detail: rule.detail,
      firstHit: hits[0] ? (monthLabels[hits[0]] || hits[0]) : 'Not met in selected range',
      lastHit: hits.length ? (monthLabels[hits[hits.length - 1]!] || hits[hits.length - 1]!) : 'Not met',
      hitRate,
      currentMet,
    };
  });
}

/**
 * Find the closest trigger gap for each transition rule.
 * From app.js:2257+.
 */
export function closestTriggerGap(
  rules: LocationTriggerRules,
  metrics: PlaybookMetrics,
): TriggerGapEvaluation[] {
  return TRANSITION_ORDER.map((ruleKey) => {
    const rule = rules[ruleKey];
    const conditions: TriggerGapCondition[] = rule.conditions.map((cond) => {
      const delta = conditionGap(cond, metrics);
      const unmet = delta > 0;
      const denom = Math.max(Math.abs(cond.threshold), 1);
      return {
        ...cond,
        delta,
        unmet,
        normGap: unmet ? delta / denom : 0,
      };
    });

    const unmet = conditions.filter((c) => c.unmet);
    const maxNormGap = unmet.reduce((acc, c) => acc + c.normGap, 0);

    return {
      ruleKey,
      label: rule.label,
      detail: rule.detail,
      unmet,
      maxNormGap,
    };
  });
}
