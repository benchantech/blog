/**
 * Offline carries (WYS §8.9, §10 CARRY).
 *
 * `origin` is ADDED to §8.9's listing (plan §6.1) — the `behavior` line renders
 * on Today in the teal card and must be distinguishable from Ben's words.
 *
 * TWO RULES SHAPE EVERY RECORD:
 *
 *  - `reportingRequired` is `false` on all of them. (WYS §10): "CARRY should
 *    often have no reporting requirement", and "the product should regularly
 *    tell the learner to leave." Nothing here asks what happened.
 *  - `authorityBoundary` is populated, not left dead (plan §6.10, WYS §26). A
 *    carry sends the learner into a real workplace, school or family situation
 *    where an outside rule may already decide the question, and the field is
 *    where that is said.
 *
 * `doNotSendBack` is the field the components read to keep the promise: it
 * names what the site does not want back, which is the opposite of a reporting
 * prompt.
 *
 * The stop A record is the `5b` Today card, verbatim.
 */

import type { WysCarry } from "./types";

export type WysCarryId =
  | "car-zero-first-habit"
  | "car-a-remove-one-detail"
  | "car-b-notice-the-necessary"
  | "car-c-inspect-the-container"
  | "car-d-ask-for-the-source"
  | "car-e-name-the-rule"
  | "car-f-return-cue"
  | "car-g-inspect-and-correct"
  | "car-h-write-one-rule";

export const WYS_CARRY_IDS: readonly WysCarryId[] = [
  "car-zero-first-habit",
  "car-a-remove-one-detail",
  "car-b-notice-the-necessary",
  "car-c-inspect-the-container",
  "car-d-ask-for-the-source",
  "car-e-name-the-rule",
  "car-f-return-cue",
  "car-g-inspect-and-correct",
  "car-h-write-one-rule"
];

const NOTHING_COMES_BACK = [
  "What you were working on.",
  "Which tool you used.",
  "Anything you removed, kept or wrote."
];

export const wysCarries = [
  {
    id: "car-zero-first-habit",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleIds: ["prn-first-habit"],
    behavior: "Before your next prompt, ask what the tool actually needs to know.",
    where: "Wherever you already use AI.",
    duration: "One prompt.",
    aiAllowed: true,
    doNotSendBack: NOTHING_COMES_BACK,
    noticePrompts: ["Whether naming the task changed what you were about to type."],
    reportingRequired: false,
    authorityBoundary: "If a rule at work already covers the prompt, that rule decides it, not this exercise.",
    nextRetrievalCue: "At stop A, from memory."
  },
  {
    /** Artboard 5b Today, the teal CARRY card, verbatim. */
    id: "car-a-remove-one-detail",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleIds: ["prn-task-before-prompt"],
    behavior:
      "Before your next real AI prompt, remove one detail that doesn't change the task. No need to report back.",
    where: "One real prompt, in whatever you normally use.",
    duration: "A few seconds.",
    aiAllowed: true,
    doNotSendBack: NOTHING_COMES_BACK,
    noticePrompts: ["Whether the answer got worse.", "Whether you missed the detail at all."],
    reportingRequired: false,
    authorityBoundary: "An employer or client rule about what may be sent still outranks the exercise.",
    nextRetrievalCue: "Next visit, before the source excerpt."
  },
  {
    id: "car-b-notice-the-necessary",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleIds: ["prn-minimum-necessary"],
    behavior: "Notice one situation where removing more would have made the answer wrong.",
    where: "Anywhere you would normally trim by reflex.",
    duration: "One occasion.",
    aiAllowed: true,
    doNotSendBack: NOTHING_COMES_BACK,
    noticePrompts: ["Which single fact the answer actually turned on."],
    reportingRequired: false,
    authorityBoundary: "Where a rule forbids the detail, the rule decides regardless of how useful it is.",
    nextRetrievalCue: "At stop C, before the container exercise."
  },
  {
    id: "car-c-inspect-the-container",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleIds: ["prn-hidden-exposure"],
    behavior: "Before attaching anything, open it and look at what else is in there.",
    where: "The next file, screenshot or recording you were about to attach anywhere.",
    duration: "One attachment.",
    aiAllowed: true,
    doNotSendBack: NOTHING_COMES_BACK,
    noticePrompts: ["What was in the file that had nothing to do with the question."],
    reportingRequired: false,
    authorityBoundary: "Some material may not leave a device at all; check before you inspect it anywhere else.",
    nextRetrievalCue: "At stop D."
  },
  {
    id: "car-d-ask-for-the-source",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleIds: ["prn-source-before-synthesis"],
    behavior: "Take one answer you were about to repeat and find where it actually came from.",
    where: "Any answer you were going to pass on as settled.",
    duration: "One answer.",
    aiAllowed: true,
    doNotSendBack: NOTHING_COMES_BACK,
    noticePrompts: ["Whether the source said what the summary said it said."],
    reportingRequired: false,
    authorityBoundary: "For medical, legal or financial questions the professional authority decides, not the summary.",
    nextRetrievalCue: "At stop E."
  },
  {
    id: "car-e-name-the-rule",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleIds: ["prn-delegate-then-verify"],
    behavior: "Name the outside rule that governs one thing you were about to delegate.",
    where: "Work, school, or anywhere with a policy you have agreed to.",
    duration: "One decision.",
    aiAllowed: true,
    doNotSendBack: NOTHING_COMES_BACK,
    noticePrompts: ["Whether you knew the rule, or assumed it."],
    reportingRequired: false,
    authorityBoundary: "If you cannot find the rule, treat the material as governed until someone tells you otherwise.",
    nextRetrievalCue: "At stop F, before the detox begins."
  },
  {
    id: "car-f-return-cue",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleIds: ["prn-retrieve-before-checking"],
    behavior: "Set your own return cue, then go and do the stretch without the tool.",
    where: "Away from this site entirely.",
    duration: "Whatever stretch you set.",
    aiAllowed: false,
    doNotSendBack: [...NOTHING_COMES_BACK, "How the stretch went."],
    noticePrompts: ["What you reached for the tool to do without thinking."],
    reportingRequired: false,
    authorityBoundary: "Do not skip something you are obliged to do in order to complete an exercise.",
    nextRetrievalCue: "The cue you set yourself."
  },
  {
    id: "car-g-inspect-and-correct",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleIds: ["prn-correction-outranks-inference"],
    behavior: "Open the settings of one tool you use and read what it says it retains.",
    where: "Any tool that has been remembering things about you.",
    duration: "One tool.",
    aiAllowed: true,
    doNotSendBack: NOTHING_COMES_BACK,
    noticePrompts: ["Whether what it retained matches what you thought it retained."],
    reportingRequired: false,
    authorityBoundary: "Some records are kept for reasons you do not control; knowing that is part of the point.",
    nextRetrievalCue: "At stop H."
  },
  {
    id: "car-h-write-one-rule",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleIds: ["prn-learner-rules-outrank"],
    behavior: "Write one rule you will actually keep, with the exception that already broke it.",
    where: "Your own rulebook, in this browser, or on paper.",
    duration: "One rule.",
    aiAllowed: false,
    doNotSendBack: [...NOTHING_COMES_BACK, "The rule itself."],
    noticePrompts: ["Whether the rule survives the last situation that surprised you."],
    reportingRequired: false,
    authorityBoundary: "A rule you wrote never overrides an employer, client or legal obligation.",
    emptyReferenceReason: "The course ends here, so there is no next retrieval cue."
  }
] as const satisfies readonly WysCarry[];

export function wysCarryById(id: WysCarryId): WysCarry {
  const record = wysCarries.find((carry) => carry.id === id);
  if (!record) throw new Error(`No WYS carry with id "${id}".`);
  return record;
}
