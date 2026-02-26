import type {
  TriggerCondition,
  TargetProfile,
  LocationTriggerRules,
} from '../types/index.js';

import { TRANSITION_ORDER } from '../types/index.js';

/**
 * Compute a threshold for a condition adjusted by a target profile.
 * From app.js:628-637.
 */
export function profileThresholdFromDefault(
  defaultCondition: TriggerCondition,
  profile: TargetProfile,
): number {
  let next = Number(defaultCondition.threshold || 0);
  if (defaultCondition.metric === 'avgDailyRevenue') {
    next *= Number(profile.revenueFactor || 1);
  } else {
    next += Number(profile.shareDelta || 0);
  }
  return next;
}

/**
 * Build trigger rules for a given profile key, applying profile adjustments
 * to default trigger rules for each location.
 * From app.js:639-655.
 */
export function buildTriggerRulesForProfile(
  profileKey: string,
  defaults: Record<string, LocationTriggerRules>,
  profiles: Record<string, TargetProfile>,
  locations: string[],
): Record<string, LocationTriggerRules> {
  const profile = profiles[profileKey] || profiles['balanced'];
  if (!profile) return { ...defaults };

  const nextRules: Record<string, LocationTriggerRules> = {};

  locations.forEach((loc) => {
    const locDefaults = defaults[loc];
    if (!locDefaults) return;

    const locRules = {} as LocationTriggerRules;
    TRANSITION_ORDER.forEach((ruleKey) => {
      const defRule = locDefaults[ruleKey];
      locRules[ruleKey] = {
        label: defRule.label,
        detail: defRule.detail,
        conditions: defRule.conditions.map((cond) => ({
          metric: cond.metric,
          operator: cond.operator,
          threshold: profileThresholdFromDefault(cond, profile),
        })),
      };
    });

    nextRules[loc] = locRules;
  });

  return nextRules;
}
