/**
 * Judgments (WYS §8.4).
 *
 * DRAFT PLACEHOLDERS, ALL OF THEM. handoff README bucket 3 puts "the revealed
 * judgment text" in the draft bucket, so every record is `status: "draft"` and
 * every `origin` is `IMPLEMENTATION_PLACEHOLDER` — except the one that is
 * `INSUFFICIENT_SIGNAL`, which is an authored result rather than an error state
 * (plan §6.7).
 *
 * WHY NOT `AI_SYNTHESIS`. (WYS §23) gives judgment × `AI_SYNTHESIS` the label
 * "Coach synthesis based on Ben sources". There is no coach, and there are no
 * approved Ben sources yet, so that label would be false of every body below.
 * §23 supplies no other judgment string, which is why plan §6.3 authored
 * "Implementation placeholder — not Ben's words" and why `types.ts` admits the
 * origin §8.4's literal union omits. The `4a` artboard draws exactly that mark
 * — "draft · implementation placeholder · not Ben's words" — under exactly this
 * body.
 *
 * THE HEADER IS NOT THE LABEL. `components/wys/JudgmentCard.tsx` takes the
 * surface title ("BEN'S JUDGMENT") as page chrome and COMPUTES the provenance
 * label from `origin`. Nothing here can make a body read as Ben's.
 *
 * ONE RECORD, TWO PRESENTATIONS: `call` is the `4a` desktop body and
 * `shortCall` is the `4a` phone body, which drops a sentence. Two lengths of
 * one judgment, not two judgments (plan §6.8 collapse 1).
 *
 * EXTERNAL AUTHORITY (WYS §26): `externalAuthorityNotes` carries the
 * case-specific note. The outranking sentence itself is defined once, in
 * `copy.ts`, and rendered from there — never restated per record.
 */

import type { WysJudgment } from "./types";

export type WysJudgmentId =
  | "jdg-client-meeting"
  | "jdg-repair-request"
  | "jdg-group-chat"
  | "jdg-ow-jurisdiction"
  | "jdg-ow-age-range"
  | "jdg-ow-error-code"
  | "jdg-ow-medium"
  | "jdg-ow-sequence"
  | "jdg-ow-deadline"
  | "jdg-ow-relationship"
  | "jdg-ow-over-trimmed"
  | "jdg-employer-policy";

export const WYS_JUDGMENT_IDS: readonly WysJudgmentId[] = [
  "jdg-client-meeting",
  "jdg-repair-request",
  "jdg-group-chat",
  "jdg-ow-jurisdiction",
  "jdg-ow-age-range",
  "jdg-ow-error-code",
  "jdg-ow-medium",
  "jdg-ow-sequence",
  "jdg-ow-deadline",
  "jdg-ow-relationship",
  "jdg-ow-over-trimmed",
  "jdg-employer-policy"
];

const DISAGREEMENT_IS_FINE = "Disagreeing is a result, not a mistake; nothing here scores agreement.";

export const wysJudgments = [
  {
    /** Artboard 4a hero, desktop body verbatim; `shortCall` is the phone body. */
    id: "jdg-client-meeting",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    scenarioIds: ["scn-client-meeting"],
    call:
      "B is the defensible default: the tone and the reason carry the task; the client's name and the invoice total don't change how you decline. If the reason itself is sensitive, generalize that too. A isn't wrong — it's just more than the task needs.",
    shortCall:
      "B is the defensible default: tone and reason carry the task; name and total don't. A isn't wrong — it's just more than the task needs.",
    alternateDefensibleCalls: ["A, where the recipient already holds all of it and the rewrite is internal."],
    reasoning: [
      "The task is a rewrite, so the inputs that matter are the ones that shape wording.",
      "An account name and a figure identify a relationship without changing a single sentence of the decline."
    ],
    strongestWhy: ["More context sometimes produces a better-fitted draft."],
    strongestWhyNot: ["A name and a total together identify one account, and the rewrite is unaffected."],
    conditionsThatChangeCall: [
      "The tool is inside the same organisation that already holds the account record.",
      "The reason itself is the sensitive part, in which case it is generalized too."
    ],
    reasonableDisagreement: [DISAGREEMENT_IS_FINE],
    sourceIds: ["artboard-4a-hero-demo", "artboard-4a-hero-demo-mobile"],
    emptyReferenceReason:
      "The body is drafted placeholder text; no Ben source is cited because none has been selected."
  },
  {
    id: "jdg-repair-request",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    scenarioIds: ["scn-repair-request"],
    call:
      "A is enough. The building needs the fault and roughly where it is; arrears and the landlord's name change nothing about the pipe.",
    alternateDefensibleCalls: ["B, if the note has to reach a specific landlord and the name is the routing."],
    reasoning: [
      "A repair request is answered by a location and a description of the fault.",
      "D fails the other way: with no location nobody can be sent to fix anything."
    ],
    strongestWhy: ["Everything in the draft is true, and true material feels safe to include."],
    strongestWhyNot: ["Arrears are a lever someone can use against the person asking for a repair."],
    conditionsThatChangeCall: ["The note is going to a named individual rather than to a building office."],
    reasonableDisagreement: [DISAGREEMENT_IS_FINE],
    sourceIds: ["artboard-5a-repair-scenario"],
    emptyReferenceReason:
      "Drafted from the approved artboard; Ben has not recorded a position on this exercise."
  },
  {
    id: "jdg-group-chat",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    scenarioIds: ["scn-group-chat"],
    call:
      "B. One message and a role is the task; eleven other people are along for the ride and were never asked.",
    reasoning: [
      "The question is how to answer one person, so the unit of the task is one message.",
      "C removes the message itself and turns a specific reply into generic advice."
    ],
    strongestWhy: ["Thread tone genuinely shapes a reply, and the thread carries the tone."],
    strongestWhyNot: ["The other participants never agreed to be pasted anywhere."],
    conditionsThatChangeCall: ["The tension is about the group dynamic rather than the one message."],
    reasonableDisagreement: [DISAGREEMENT_IS_FINE],
    sourceIds: ["artboard-5b-today"],
    emptyReferenceReason: "Drafted from the approved artboard; no Ben source is selected."
  },
  {
    id: "jdg-ow-jurisdiction",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    scenarioIds: ["scn-ow-jurisdiction"],
    call: "B. The country changes the answer; the club's name does not.",
    reasoning: ["Retention periods differ by legal region, so the region is part of the question."],
    strongestWhy: ["A location narrows who is asking."],
    strongestWhyNot: ["Without the region the answer is a guess dressed as a rule."],
    conditionsThatChangeCall: ["The club operates across regions, in which case say so instead of picking one."],
    reasonableDisagreement: [DISAGREEMENT_IS_FINE],
    externalAuthorityNotes: [
      "Whatever comes back is not legal advice, and a regulator's rule is not decided by this exercise."
    ],
    sourceIds: ["wys-spec-25", "wys-spec-26"],
    emptyReferenceReason: "Authored for coverage of a §25 class; no Ben source exists for it."
  },
  {
    id: "jdg-ow-age-range",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    scenarioIds: ["scn-ow-age-range"],
    call: "B. A band is what the suggestions turn on; an exact date is what identifies the child.",
    reasoning: ["Reading level tracks an approximate age, not a birthday."],
    strongestWhy: ["Anything about a child invites removing everything."],
    strongestWhyNot: ["With no age at all the suggestions are unusable and the teacher asks again with more."],
    conditionsThatChangeCall: ["A school policy forbids describing individual pupils to outside tools at all."],
    reasonableDisagreement: [DISAGREEMENT_IS_FINE],
    externalAuthorityNotes: ["A school's own policy decides this before any judgment here does."],
    sourceIds: ["wys-spec-25", "wys-spec-26"],
    emptyReferenceReason: "Authored for coverage of a §25 class; no Ben source exists for it."
  },
  {
    id: "jdg-ow-error-code",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    scenarioIds: ["scn-ow-error-code"],
    call: "B. The code is the answerable part; the log around it is the exposure.",
    reasoning: ["A code and the failing step are usually enough to name the fault."],
    strongestWhy: ["Whole logs are quick to paste and occasionally contain the decisive line."],
    strongestWhyNot: ["Logs carry account names, paths and hostnames that have nothing to do with the fault."],
    conditionsThatChangeCall: ["The fault is only visible as a pattern across many lines."],
    reasonableDisagreement: [DISAGREEMENT_IS_FINE],
    sourceIds: ["wys-spec-25"],
    emptyReferenceReason: "Authored for coverage of a §25 class; no Ben source exists for it."
  },
  {
    id: "jdg-ow-medium",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    scenarioIds: ["scn-ow-medium"],
    call: "B. Say what the material is, then hand over only the part the question is about.",
    reasoning: ["Advice about a scan differs from advice about text, so the medium is task-bearing."],
    strongestWhy: ["Sending the image is one step and preserves everything."],
    strongestWhyNot: ["A photograph of a page carries the room it was taken in and the file's own metadata."],
    conditionsThatChangeCall: ["The layout of the page is itself the question."],
    reasonableDisagreement: [DISAGREEMENT_IS_FINE],
    sourceIds: ["wys-spec-24", "wys-spec-25"],
    emptyReferenceReason: "Authored for coverage of a §25 class; no Ben source exists for it."
  },
  {
    id: "jdg-ow-sequence",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    scenarioIds: ["scn-ow-sequence"],
    call: "B. Order is the question here; identities are not.",
    reasoning: ["Whether a deduction is fair often turns entirely on what happened before what."],
    strongestWhy: ["A timeline reads as more detail, and more detail feels riskier."],
    strongestWhyNot: ["Without order the answer addresses a different dispute."],
    conditionsThatChangeCall: ["A tenancy body or a court is already handling it."],
    reasonableDisagreement: [DISAGREEMENT_IS_FINE],
    externalAuthorityNotes: ["Nothing here decides a tenancy question that a tribunal or a contract decides."],
    sourceIds: ["wys-spec-25", "wys-spec-26"],
    emptyReferenceReason: "Authored for coverage of a §25 class; no Ben source exists for it."
  },
  {
    id: "jdg-ow-deadline",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    scenarioIds: ["scn-ow-deadline"],
    call: "B. A one-day window rules out half the options, so it belongs in the question.",
    reasoning: ["Advice that assumes a fortnight is wrong advice when the answer is due in the morning."],
    strongestWhy: ["Timing can be combined with other facts to identify a specific deal."],
    strongestWhyNot: ["Omitting it produces a plan that cannot be executed in the time available."],
    conditionsThatChangeCall: ["The deadline is itself confidential and the question can be asked without it."],
    reasonableDisagreement: [DISAGREEMENT_IS_FINE],
    sourceIds: ["wys-spec-25"],
    emptyReferenceReason: "Authored for coverage of a §25 class; no Ben source exists for it."
  },
  {
    /**
     * Deliberately `INSUFFICIENT_SIGNAL` (WYS §8.4, plan §6.7): an authored
     * result, not a gap. The label (WYS §23) reads "Ben has not addressed this
     * closely enough", which is the true state, and no call is invented to
     * fill the space.
     */
    id: "jdg-ow-relationship",
    status: "draft",
    origin: "INSUFFICIENT_SIGNAL",
    scenarioIds: ["scn-ow-relationship"],
    call: "No call is published for this scenario.",
    reasoning: [
      "The scenario is authored; the position on it is not, and inventing one would be the failure this field exists to prevent."
    ],
    strongestWhy: ["A relationship category is often the only thing that makes wording land correctly."],
    strongestWhyNot: ["Category plus employer plus team frequently resolves to one person."],
    conditionsThatChangeCall: ["Ben selects a source that addresses naming a relationship category."],
    reasonableDisagreement: [DISAGREEMENT_IS_FINE],
    insufficientSignalBoundary:
      "A published call needs a Ben source that speaks to relationship categories; none is selected.",
    sourceIds: ["wys-spec-25", "wys-spec-35"],
    emptyReferenceReason: "Insufficient signal is the recorded result, so no source is cited for a call."
  },
  {
    id: "jdg-ow-over-trimmed",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    scenarioIds: ["scn-ow-over-trimmed"],
    call: "B. Put back the one constraint that ruled out the obvious answer, and nothing else.",
    reasoning: ["The failure is not exposure; it is an answer to a question nobody asked."],
    strongestWhy: ["Every removal feels like progress while the exercise is fresh."],
    strongestWhyNot: ["Restoring the whole request undoes the work and re-exposes what was never needed."],
    conditionsThatChangeCall: ["The constraint is the sensitive part, in which case the tool is the wrong route."],
    reasonableDisagreement: [DISAGREEMENT_IS_FINE],
    sourceIds: ["wys-spec-25"],
    emptyReferenceReason: "Authored for coverage of a §25 class; no Ben source exists for it."
  },
  {
    id: "jdg-employer-policy",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    scenarioIds: ["scn-employer-policy"],
    call: "B. Ask about the general problem and upload nothing, because permission is not something abstraction can grant.",
    reasoning: [
      "The rule governs the act of sending, not the identifiability of what was sent.",
      "Deleting afterwards does not undo a transfer that already happened."
    ],
    strongestWhy: ["The material would genuinely make the answer better."],
    strongestWhyNot: ["Anonymization is not a loophole, and the rule was never about names."],
    conditionsThatChangeCall: ["The employer's own approved tooling covers it, in which case the rule already allows it."],
    reasonableDisagreement: [DISAGREEMENT_IS_FINE],
    externalAuthorityNotes: [
      "Employer policy, client confidentiality and platform terms decide this before the exercise does."
    ],
    sourceIds: ["wys-spec-26"],
    emptyReferenceReason: "Authored for §26 coverage; no Ben source exists for it."
  }
] as const satisfies readonly WysJudgment[];

export function wysJudgmentById(id: WysJudgmentId): WysJudgment {
  const record = wysJudgments.find((judgment) => judgment.id === id);
  if (!record) throw new Error(`No WYS judgment with id "${id}".`);
  return record;
}
