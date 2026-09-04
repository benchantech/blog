/**
 * Principles (WYS §8.2) — one per stop, plus the first habit Lesson Zero
 * teaches.
 *
 * PROVENANCE. `exactBenStatement` is ABSENT on every record and stays absent
 * until Ben selects a recording and approves an excerpt: (WYS §35 decision 6),
 * "which Ben statements are canonical at launch", is open, and (WYS §11) says
 * plainly "Do not invent Ben stories or quotes." `approvedFormulation` is
 * absent for the same reason — a formulation Ben approved is a fact about Ben,
 * not a convenience field. The split between the two is load-bearing for the
 * provenance UI (plan §6.7), so both are declared and both are empty.
 *
 * Every record is therefore `status: "draft"`, `origin:
 * "IMPLEMENTATION_PLACEHOLDER"`: this is the scaffolding a Ben source will
 * later anchor, drafted during implementation, and it says so. Under the
 * ratified Q21 default (`RENDER_MARKED_DRAFT === false`) none of it renders
 * publicly; it is visible in `scripts/preview-content.mjs`.
 *
 * The one piece of doctrine that is NOT drafted here is the judgment framework
 * itself: TASK -> NECESSITY -> EXPOSURE -> WHY -> WHY-NOT -> JUDGMENT is
 * defined exactly once, in `content/canonical/judgment-framework.ts`, and every
 * record below points at it rather than restating it (Standing Order 07).
 */

import type { WysPrinciple } from "./types";

export type WysPrincipleId =
  | "prn-first-habit"
  | "prn-task-before-prompt"
  | "prn-minimum-necessary"
  | "prn-hidden-exposure"
  | "prn-source-before-synthesis"
  | "prn-delegate-then-verify"
  | "prn-retrieve-before-checking"
  | "prn-correction-outranks-inference"
  | "prn-learner-rules-outrank";

export const WYS_PRINCIPLE_IDS: readonly WysPrincipleId[] = [
  "prn-first-habit",
  "prn-task-before-prompt",
  "prn-minimum-necessary",
  "prn-hidden-exposure",
  "prn-source-before-synthesis",
  "prn-delegate-then-verify",
  "prn-retrieve-before-checking",
  "prn-correction-outranks-inference",
  "prn-learner-rules-outrank"
];

const AWAITING_BEN_STATEMENT =
  "Ben has not selected the excerpt that states this, so no wording is attributed to him (WYS §35 decision 6).";

export const wysPrinciples = [
  {
    id: "prn-first-habit",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    shortName: "Ask what it needs to know",
    rationale:
      "Lesson Zero has to leave one durable habit behind even for someone who never returns.",
    appliesWhen: ["Any moment before typing into an AI tool.", "Any moment before attaching a file."],
    strongestWhy: ["A single question is small enough to survive without the course."],
    strongestWhyNot: [
      "A habit stated once can harden into a slogan that replaces thinking about the case in front of you."
    ],
    knownExceptions: ["Situations where an outside rule already decides the answer."],
    commonMisreadings: ["Reading it as an instruction to say as little as possible."],
    prohibitedSimplifications: ["Remove everything specific."],
    sourceIds: ["wys-spec-9-3", "artboard-5a-first-habit"],
    relatedScenarioIds: ["scn-repair-request"],
    relatedBoundaryIds: ["bnd-repair-request-address"],
    emptyReferenceReason: AWAITING_BEN_STATEMENT
  },
  {
    id: "prn-task-before-prompt",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    shortName: "Define the task before the prompt",
    rationale:
      "Naming the job first is what makes a detail testable: a fact either changes the job or it does not.",
    appliesWhen: ["Drafting, rewriting or summarising with a tool.", "Deciding what to paste in."],
    strongestWhy: ["Without a stated task there is no standard against which any detail is necessary."],
    strongestWhyNot: ["Some tasks are genuinely unclear until part of the material is in front of you."],
    knownExceptions: ["Exploratory questions where the point is to find out what the task is."],
    commonMisreadings: ["Treating the task statement as a form to fill in rather than a decision."],
    prohibitedSimplifications: ["Always write a one-line task before every prompt."],
    sourceIds: ["src-stop-a-recording", "wys-spec-11", "repo-intent-router"],
    relatedScenarioIds: ["scn-client-meeting", "scn-group-chat"],
    relatedBoundaryIds: ["bnd-client-meeting-reason"],
    emptyReferenceReason: AWAITING_BEN_STATEMENT
  },
  {
    id: "prn-minimum-necessary",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    shortName: "Minimum necessary is not minimum possible",
    rationale:
      "A course that answers every question with less becomes useless, and its learners quietly stop using it.",
    appliesWhen: ["Any time the honest answer is that a specific fact does change the outcome."],
    strongestWhy: ["Withholding a fact the task needs produces a confident answer to the wrong question."],
    strongestWhyNot: ["A detail that changes the task can still be too costly to disclose here."],
    knownExceptions: ["Where an outside rule forbids the detail regardless of how useful it is."],
    commonMisreadings: ["Hearing it as permission to include anything that might help."],
    prohibitedSimplifications: ["More context is always better."],
    sourceIds: ["src-stop-b-recording", "wys-spec-25"],
    relatedScenarioIds: [
      "scn-ow-jurisdiction",
      "scn-ow-age-range",
      "scn-ow-error-code",
      "scn-ow-medium",
      "scn-ow-sequence",
      "scn-ow-deadline",
      "scn-ow-relationship",
      "scn-ow-over-trimmed"
    ],
    relatedBoundaryIds: ["bnd-over-withholding", "bnd-jurisdiction-detail"],
    emptyReferenceReason: AWAITING_BEN_STATEMENT
  },
  {
    id: "prn-hidden-exposure",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    shortName: "What the container carries",
    rationale:
      "A file discloses more than the sentence a person meant to send, and the extra travels silently.",
    appliesWhen: ["Attaching a screenshot, document, spreadsheet, recording or bundle of files."],
    strongestWhy: ["A combination of ordinary details can identify someone when no single one does."],
    strongestWhyNot: ["Trimming a container can destroy the evidence that made the question answerable."],
    knownExceptions: ["Where the medium itself is the subject of the question."],
    commonMisreadings: ["Believing a crop removes what was cropped from the file."],
    prohibitedSimplifications: ["Never upload a screenshot."],
    sourceIds: ["src-stop-c-recording", "wys-spec-24"],
    relatedScenarioIds: ["scn-ow-medium"],
    relatedBoundaryIds: ["bnd-container-trim"],
    emptyReferenceReason: AWAITING_BEN_STATEMENT
  },
  {
    id: "prn-source-before-synthesis",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    shortName: "Capability is not authority",
    rationale:
      "That a system can produce an answer says nothing about whether it is the thing that decides.",
    appliesWhen: ["Any answer that will be repeated to someone else as though it were settled."],
    strongestWhy: ["A synthesis with no traceable source cannot be checked by anyone who doubts it."],
    strongestWhyNot: ["Insisting on a primary source for every trivial question stops the work."],
    knownExceptions: ["Low-stakes phrasing help where nothing is being asserted."],
    commonMisreadings: ["Treating fluency, length or confidence as evidence."],
    prohibitedSimplifications: ["Never trust a model's answer."],
    sourceIds: ["src-stop-d-recording", "wys-spec-11"],
    relatedScenarioIds: ["scn-ow-error-code"],
    relatedBoundaryIds: ["bnd-synthesis-authority"],
    emptyReferenceReason: AWAITING_BEN_STATEMENT
  },
  {
    id: "prn-delegate-then-verify",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    shortName: "Delegation carries a verification cost",
    rationale:
      "Handing a step to a tool moves the work rather than removing it, and the move has a price.",
    appliesWhen: ["Any step whose output will be acted on without being read closely."],
    strongestWhy: ["Unverified delegation fails quietly, and it fails at the moment it matters."],
    strongestWhyNot: ["Verifying everything costs more than the delegation saved."],
    knownExceptions: ["Reversible steps whose failure is cheap and visible."],
    commonMisreadings: ["Reading verification as re-doing the whole task by hand."],
    prohibitedSimplifications: ["Check everything twice."],
    sourceIds: ["src-stop-e-recording", "wys-spec-26"],
    relatedScenarioIds: ["scn-ow-deadline", "scn-employer-policy"],
    relatedBoundaryIds: ["bnd-external-authority"],
    emptyReferenceReason: AWAITING_BEN_STATEMENT
  },
  {
    id: "prn-retrieve-before-checking",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    shortName: "Retrieve before you check",
    rationale:
      "Assisted success feels identical to learned judgment, and only unassisted retrieval separates them.",
    appliesWhen: ["Any moment the learner could reach for the tool instead of for the memory."],
    strongestWhy: ["Recall that has never been attempted unaided has never been tested."],
    strongestWhyNot: ["Refusing help on a real deadline is a way of paying for a lesson twice."],
    knownExceptions: ["Genuine emergencies, and anything with a real cost to being slow."],
    commonMisreadings: ["Hearing it as an argument against using tools."],
    prohibitedSimplifications: ["Go without AI for a week and you will have learned something."],
    sourceIds: ["src-stop-f-recording", "wys-spec-15-2"],
    relatedScenarioIds: [],
    relatedBoundaryIds: ["bnd-detox-proof"],
    emptyReferenceReason:
      "Stop F is done away from the site, so it anchors a ritual rather than a scenario."
  },
  {
    id: "prn-correction-outranks-inference",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    shortName: "Correction outranks inference",
    rationale:
      "When a system's guess and the person's own correction disagree, the person is the one who knows.",
    appliesWhen: ["Anywhere a tool has recorded, remembered or inferred something about the learner."],
    strongestWhy: ["A record nobody can correct becomes a claim nobody can dispute."],
    strongestWhyNot: ["People also misremember, and a correction is not automatically accurate."],
    knownExceptions: ["Records kept for reasons the learner does not control, such as an audit trail."],
    commonMisreadings: ["Reading it as a promise that deleting locally deletes everywhere."],
    prohibitedSimplifications: ["Reset means gone."],
    sourceIds: ["src-stop-g-recording", "wys-spec-17"],
    relatedScenarioIds: ["scn-ow-sequence"],
    relatedBoundaryIds: ["bnd-reset-meaning"],
    emptyReferenceReason: AWAITING_BEN_STATEMENT
  },
  {
    id: "prn-learner-rules-outrank",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    shortName: "Your rules, kept with their exceptions",
    rationale:
      "A rule a learner wrote and can revise survives longer than one they were handed and agreed with.",
    appliesWhen: ["The end of the course, and every situation the course did not cover."],
    strongestWhy: ["A rule stored with the exception that broke it is one the learner can still use."],
    strongestWhyNot: ["Self-authored rules can encode a mistake and then defend it."],
    knownExceptions: ["Anywhere an employer, client or legal rule already governs."],
    commonMisreadings: ["Treating the rulebook as a certificate of competence."],
    prohibitedSimplifications: ["Write your rules and you are done."],
    sourceIds: ["src-stop-h-recording", "wys-spec-16"],
    relatedScenarioIds: ["scn-ow-relationship"],
    relatedBoundaryIds: ["bnd-rule-with-exception"],
    emptyReferenceReason: AWAITING_BEN_STATEMENT
  }
] as const satisfies readonly WysPrinciple[];

export function wysPrincipleById(id: WysPrincipleId): WysPrinciple {
  const record = wysPrinciples.find((principle) => principle.id === id);
  if (!record) throw new Error(`No WYS principle with id "${id}".`);
  return record;
}
