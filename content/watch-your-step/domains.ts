/**
 * The serializer's declared vocabularies, composed from content (plan §7.2).
 *
 * `lib/wys/local-state.ts` takes its value domains as a PARAMETER with a
 * fail-closed default — every list empty — precisely so that Phase 2 could ship
 * before any content existed and so that `content/*` importing the state types
 * would not create a cycle. This module is the Phase 6 half of that
 * arrangement: it wires the real vocabularies, which LOOSENS the guard, and
 * `tests/wys-local-state.test.ts` plus `tests/wys-content.test.ts` check that
 * every id in it resolves to a record.
 *
 * WHY IT IS NOT IN `config.ts`. `lib/wys/aggregate.ts` runs in the browser and
 * imports `WYS_AGGREGATE_ENABLED` from `config.ts`. If the domains lived there,
 * every scenario, week and judgment would be pulled into the client bundle by
 * that one import. Keeping them here means a component that needs the domains
 * asks for them and a module that needs the flag does not pay for the
 * curriculum.
 */

import type { WysStateDomains } from "@/lib/wys/local-state";
import { POSTURE_OPTION_IDS, WYS_NOTICE_IDS } from "./config";
import { WYS_CHOICE_KEYS, WYS_SCENARIO_IDS } from "./scenarios";
import { WYS_STOP_IDS } from "./weeks";

/**
 * The one object every hydration-safe reader passes to the serializer.
 *
 * It is a module-level constant rather than a function result so
 * `wysDomainsKey()` gets a stable identity: `components/wys/useWysState.ts`
 * depends on that key, and an inline object literal would hand the effect a new
 * dependency on every render — an infinite loop in the one place a course
 * screen cannot survive one.
 */
export const WYS_DOMAINS: WysStateDomains = {
  postureChoiceIds: POSTURE_OPTION_IDS,
  scenarioIds: WYS_SCENARIO_IDS,
  choiceKeys: WYS_CHOICE_KEYS,
  noticeIds: WYS_NOTICE_IDS,
  stopIds: WYS_STOP_IDS
};
