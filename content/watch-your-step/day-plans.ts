/**
 * Day plans — what one visit contains (WYS §8.10, §12).
 *
 * (WYS §8.10) types `cadencePaths.days2` and friends as `string[]` and says
 * nothing about what the strings are. (WYS §12) then describes the paths one
 * DAY at a time — "Day 1: human source + one core scenario" — and (plan §5.3)
 * derives the on-screen "visit n of m" from the length of the resolved path. So
 * one element is one visit, and this module is what an element means.
 *
 * Splitting it out rather than inlining segment arrays into every week keeps
 * two things true at once: the Plan and Today screens route from data (WYS §12,
 * "represent it in content data"), and the "Next: an excerpt and one core
 * decision" line the `5b` artboard draws is one string in one place rather than
 * nine copies.
 *
 * `summary` is a fragment, not a sentence: the artboard renders it after
 * "Next: " on Today and after "Day 2 of 3 · " on Plan. Two presentations, one
 * definition (Standing Order 07).
 */

import type { WysPathSegment } from "./types";

export type WysDayPlanId =
  | "day-lesson-zero"
  | "day-human-source"
  | "day-source-and-core"
  | "day-excerpt-and-core"
  | "day-changed-and-carry"
  | "day-excerpt-changed-carry"
  | "day-other-medium"
  | "day-boundary"
  | "day-carry-only"
  | "day-detox"
  | "day-rulebook-and-exit";

export interface WysDayPlan {
  id: WysDayPlanId;
  segments: readonly WysPathSegment[];
  /** Fragment rendered after "Next: " or "Day n of m · ". */
  summary: string;
}

export const wysDayPlans = [
  {
    id: "day-lesson-zero",
    segments: ["core-decision", "carry"],
    summary: "the ten steps, in one sitting"
  },
  {
    id: "day-human-source",
    segments: ["human-source"],
    summary: "the recording, watched whole"
  },
  {
    id: "day-source-and-core",
    segments: ["human-source", "core-decision"],
    summary: "the recording and one core decision"
  },
  {
    id: "day-excerpt-and-core",
    segments: ["source-excerpt", "core-decision"],
    summary: "an excerpt and one core decision"
  },
  {
    id: "day-changed-and-carry",
    segments: ["changed-scenario", "carry"],
    summary: "a changed scenario and the carry"
  },
  {
    id: "day-excerpt-changed-carry",
    segments: ["source-excerpt", "changed-scenario", "carry"],
    summary: "an excerpt, a changed scenario and the carry"
  },
  {
    id: "day-other-medium",
    segments: ["other-medium"],
    summary: "the same call in another medium"
  },
  {
    id: "day-boundary",
    segments: ["boundary"],
    summary: "the case that breaks the rule"
  },
  {
    /**
     * Q24, ratified: (WYS §12)'s 5-day path ends "delayed retrieval or transfer
     * + CARRY", and the transfer-check SURFACE is deferred in v0 — no artboard
     * draws one. Rather than ship a path whose last day renders nothing, day
     * five is the carry alone. Recorded as a narrowing in
     * docs/facelift-unapproved.md; the alternative is a minimal delayed-retrieval
     * surface, which is Ben's call.
     */
    id: "day-carry-only",
    segments: ["carry"],
    summary: "the carry"
  },
  {
    id: "day-detox",
    segments: ["detox"],
    summary: "set your cue, then go"
  },
  {
    id: "day-rulebook-and-exit",
    segments: ["rulebook", "carry"],
    summary: "your rules, then the way out"
  }
] as const satisfies readonly WysDayPlan[];

export const WYS_DAY_PLAN_IDS: readonly WysDayPlanId[] = wysDayPlans.map((plan) => plan.id);

export function wysDayPlanById(id: string): WysDayPlan {
  const record = wysDayPlans.find((plan) => plan.id === id);
  if (!record) throw new Error(`No WYS day plan with id "${id}".`);
  return record;
}
