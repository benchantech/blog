/**
 * Boundaries and counterexamples (WYS §8.5).
 *
 * A boundary exists to break a rule the learner is about to over-apply. §8.5
 * requires BOTH `overDisclosureRisk` and `overWithholdingRisk` on every record,
 * and that is not symmetry for its own sake: (WYS §25) makes over-withholding a
 * first-class failure mode, and (WYS §39) asks afterwards "did I teach maximal
 * deletion?". A boundary with an empty over-withholding risk is how the course
 * would answer yes without noticing.
 *
 * `externalAuthorityCaveat` is populated wherever a scenario implicates an
 * outside rule (WYS §26). The sentence that outranks everything —
 * "External authority outranks WYS's abstraction exercise." — is defined once,
 * in `copy.ts`, and rendered from there; these are the case-specific caveats
 * that sit beside it.
 *
 * All draft placeholders (`status: "draft"`, `origin:
 * "IMPLEMENTATION_PLACEHOLDER"`). Nothing here is Ben's position.
 */

import type { WysBoundary } from "./types";

export type WysBoundaryId =
  | "bnd-client-meeting-reason"
  | "bnd-repair-request-address"
  | "bnd-container-trim"
  | "bnd-over-withholding"
  | "bnd-jurisdiction-detail"
  | "bnd-synthesis-authority"
  | "bnd-external-authority"
  | "bnd-detox-proof"
  | "bnd-reset-meaning"
  | "bnd-rule-with-exception";

export const WYS_BOUNDARY_IDS: readonly WysBoundaryId[] = [
  "bnd-client-meeting-reason",
  "bnd-repair-request-address",
  "bnd-container-trim",
  "bnd-over-withholding",
  "bnd-jurisdiction-detail",
  "bnd-synthesis-authority",
  "bnd-external-authority",
  "bnd-detox-proof",
  "bnd-reset-meaning",
  "bnd-rule-with-exception"
];

export const wysBoundaries = [
  {
    id: "bnd-client-meeting-reason",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleId: "prn-task-before-prompt",
    temptingRule: "Keep the reason; it always carries the task.",
    counterexample: "The meeting was cancelled because of a colleague's medical emergency.",
    changedFact: "The reason itself is now somebody else's private matter.",
    whyRuleFails: "A rule that protects names while waving through reasons discloses the more sensitive half.",
    revisedNarrowerRule: "Keep the reason at the least specific level that still explains the decline.",
    overDisclosureRisk: "Naming an account and a figure alongside a cancelled meeting identifies a relationship.",
    overWithholdingRisk: "A decline with no reason at all reads as evasive and prompts a second, worse exchange.",
    relatedScenarioIds: ["scn-client-meeting"],
    relatedJudgmentIds: ["jdg-client-meeting"],
    prohibitedExtrapolations: ["Never mention why a meeting was cancelled."]
  },
  {
    id: "bnd-repair-request-address",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleId: "prn-first-habit",
    temptingRule: "Take out the address; an address is personal.",
    counterexample: "The repair crew is being sent to a building with forty units.",
    changedFact: "Location has become the operative instruction rather than an identifier.",
    whyRuleFails: "The category the rule protects and the fact the task needs are the same fact here.",
    revisedNarrowerRule: "Give the location at the resolution the work needs, and no finer.",
    overDisclosureRisk: "Unit, building and arrears together single out one household to a stranger.",
    overWithholdingRisk: "With no location the request cannot be acted on and the leak continues.",
    relatedScenarioIds: ["scn-repair-request"],
    relatedJudgmentIds: ["jdg-repair-request"],
    prohibitedExtrapolations: ["Addresses are always removed."]
  },
  {
    id: "bnd-container-trim",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleId: "prn-hidden-exposure",
    temptingRule: "Crop the screenshot and it is clean.",
    counterexample: "A cropped image still carries the original pixels in some formats, and its metadata regardless.",
    changedFact: "The container, not the visible region, is what was sent.",
    whyRuleFails: "Cropping edits what is displayed, which is not the same as what is transmitted.",
    revisedNarrowerRule: "Extract the content you need into a new object rather than editing the old one.",
    overDisclosureRisk: "A whole workbook, thread or folder travels when only one row was wanted.",
    overWithholdingRisk: "Describing a document instead of quoting the relevant line loses the detail that decides it.",
    relatedScenarioIds: ["scn-group-chat", "scn-ow-medium"],
    relatedJudgmentIds: ["jdg-group-chat", "jdg-ow-medium"],
    prohibitedExtrapolations: ["Never send an image."]
  },
  {
    id: "bnd-over-withholding",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleId: "prn-minimum-necessary",
    temptingRule: "When in doubt, take it out.",
    counterexample: "A request trimmed past its constraint gets a confident answer to a different question.",
    changedFact: "The removed detail was the one the task turned on.",
    whyRuleFails: "Doubt is not evidence about necessity; it is a feeling about risk.",
    revisedNarrowerRule: "Remove what the task does not need, and check that the task still stands after each removal.",
    overDisclosureRisk: "Keeping everything because trimming is hard leaves identifiers in place.",
    overWithholdingRisk: "The answer arrives, sounds right, and addresses something else entirely.",
    relatedScenarioIds: ["scn-ow-over-trimmed", "scn-ow-age-range", "scn-ow-deadline"],
    relatedJudgmentIds: ["jdg-ow-over-trimmed", "jdg-ow-age-range", "jdg-ow-deadline"],
    prohibitedExtrapolations: ["Caution is always the safer answer."]
  },
  {
    id: "bnd-jurisdiction-detail",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleId: "prn-minimum-necessary",
    temptingRule: "Never say where you are.",
    counterexample: "The question is a retention period, and retention periods differ by region.",
    changedFact: "Place has become part of the question rather than a fact about the asker.",
    whyRuleFails: "The rule treats every location as an identifier, when some locations are the subject matter.",
    revisedNarrowerRule: "Give the legal region when the answer varies by region; give nothing finer.",
    overDisclosureRisk: "Town plus organisation plus role usually identifies the person asking.",
    overWithholdingRisk: "A region-free answer is a plausible rule from somewhere else.",
    externalAuthorityCaveat:
      "A regulator or a statute settles retention, and no exercise here changes what either requires.",
    relatedScenarioIds: ["scn-ow-jurisdiction"],
    relatedJudgmentIds: ["jdg-ow-jurisdiction"],
    prohibitedExtrapolations: ["Location is always safe to give once the name is removed."]
  },
  {
    id: "bnd-synthesis-authority",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleId: "prn-source-before-synthesis",
    temptingRule: "If the answer is detailed, it is probably right.",
    counterexample: "A confident summary cites a document that says the opposite.",
    changedFact: "Nobody has looked at the source the answer claims to rest on.",
    whyRuleFails: "Detail is a property of the writing, not evidence about the world.",
    revisedNarrowerRule: "Treat a synthesis as a lead until a source has been read.",
    overDisclosureRisk: "Pasting the whole source to prove a point exposes everything around the relevant line.",
    overWithholdingRisk: "Withholding the diagnostic detail leaves nothing anyone could check.",
    relatedScenarioIds: ["scn-ow-error-code"],
    relatedJudgmentIds: ["jdg-ow-error-code"],
    prohibitedExtrapolations: ["Model answers are never usable."]
  },
  {
    id: "bnd-external-authority",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleId: "prn-delegate-then-verify",
    temptingRule: "If it is anonymized, it is allowed.",
    counterexample: "An employer forbids sending client documents to outside tools at all.",
    changedFact: "The rule is about the act of sending, not about who can be identified.",
    whyRuleFails: "Abstraction changes the content and leaves the permission exactly where it was.",
    revisedNarrowerRule: "Check what the governing rule forbids before deciding what to abstract.",
    overDisclosureRisk: "A redacted upload is still an upload, and it is still logged somewhere.",
    overWithholdingRisk: "Refusing to describe the general problem forfeits help the rule never prohibited.",
    externalAuthorityCaveat:
      "Employer policy, client confidentiality, school policy, law, professional duties and platform terms all outrank this exercise.",
    relatedScenarioIds: ["scn-employer-policy", "scn-ow-sequence"],
    relatedJudgmentIds: ["jdg-employer-policy", "jdg-ow-sequence"],
    prohibitedExtrapolations: ["Anonymizing makes a forbidden upload permitted."]
  },
  {
    id: "bnd-detox-proof",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleId: "prn-retrieve-before-checking",
    temptingRule: "A week without the tool proves the judgment is learned.",
    counterexample: "Someone avoids every situation that would have tested them, then reports success.",
    changedFact: "Nothing was retrieved, so nothing was tested.",
    whyRuleFails: "Abstinence measures avoidance; retrieval measures recall.",
    overDisclosureRisk: "Reporting what happened during the exercise turns a private practice into a disclosure.",
    overWithholdingRisk: "Retrieving nothing and checking nothing leaves the learner with an untested belief.",
    revisedNarrowerRule: "Attempt the recall unaided first, then check, and count only the attempt.",
    relatedScenarioIds: [],
    relatedJudgmentIds: [],
    prohibitedExtrapolations: ["Going without tools is the goal of the course."],
    emptyReferenceReason:
      "Stop F happens away from the site, so this boundary governs a ritual rather than a scenario."
  },
  {
    id: "bnd-reset-meaning",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleId: "prn-correction-outranks-inference",
    temptingRule: "Clearing it here means it is gone.",
    counterexample: "Hosting and analytics logs are not written by this browser and are not cleared by it.",
    changedFact: "The copy being deleted was never the only copy.",
    whyRuleFails: "A local control can only reach local state, whatever the button implies.",
    revisedNarrowerRule: "Say precisely which copy a control removes, and say what it cannot reach.",
    overDisclosureRisk: "Believing a reset was total encourages putting more into the next session.",
    overWithholdingRisk: "Assuming nothing can be corrected stops people correcting the record they can reach.",
    relatedScenarioIds: ["scn-ow-sequence"],
    relatedJudgmentIds: ["jdg-ow-sequence"],
    prohibitedExtrapolations: ["Deleting local data deletes it everywhere."]
  },
  {
    id: "bnd-rule-with-exception",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    principleId: "prn-learner-rules-outrank",
    temptingRule: "I remove names, always.",
    counterexample: "The name is the routing: the message has to reach one particular person.",
    changedFact: "The identifier became the instruction.",
    whyRuleFails: "A rule kept without the case that broke it stops being a judgment and becomes a habit.",
    revisedNarrowerRule: "Keep the rule with the exception attached, and revise it when a new case breaks it.",
    overDisclosureRisk: "An exception written too broadly becomes a standing permission.",
    overWithholdingRisk: "A rule with no exceptions eventually gets applied where it does damage.",
    externalAuthorityCaveat: "A personal rule never overrides an employer, client or legal obligation.",
    relatedScenarioIds: ["scn-ow-relationship"],
    relatedJudgmentIds: ["jdg-ow-relationship"],
    prohibitedExtrapolations: ["Your own rules are the final authority."]
  }
] as const satisfies readonly WysBoundary[];

export function wysBoundaryById(id: WysBoundaryId): WysBoundary {
  const record = wysBoundaries.find((boundary) => boundary.id === id);
  if (!record) throw new Error(`No WYS boundary with id "${id}".`);
  return record;
}
