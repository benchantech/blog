/**
 * The fictional scenario bank (WYS §8.3).
 *
 * EVERY RECORD IN THIS FILE IS A DRAFT PLACEHOLDER. `status: "draft"`,
 * `origin: "IMPLEMENTATION_PLACEHOLDER"` — handoff README bucket 3 requires
 * exactly that for "all fictional scenarios, choice labels, the revealed
 * judgment text, the 18/61/21 answer split, stop titles A-H", and the approved
 * artboards draw the matching mono line, "scenario: draft · implementation
 * placeholder". `IMPLEMENTATION_PLACEHOLDER` rather than `AI_SYNTHESIS` for the
 * whole bank because that is what the artboards label them and because two
 * origins for one class of object would give one concept two labels.
 *
 * CONSEQUENCE, stated rather than discovered later: under the ratified Q21
 * default (`RENDER_MARKED_DRAFT === false`) none of this is public. It
 * compiles, it carries its labels, and `scripts/preview-content.mjs` shows it.
 * Shipping the public course with draft scenario prose is Ben's call.
 *
 * ORDER MATTERS (WYS §35 decision 9, "which fictional scenario bank launches
 * first"): the artboards pre-answer the first two. The client-meeting scenario
 * is the `4a` hero demo and the leaking-pipe repair request is `5a` step 5, so
 * they lead the array. Confirm, do not re-decide.
 *
 * ONE RECORD, TWO PRESENTATIONS (plan §6.8 collapse 1). The `4a` desktop and
 * phone artboards write the client-meeting scenario at two lengths and the
 * phone drops a sentence from the judgment. That is one scenario with a
 * `shortForm`, and one judgment with a `shortCall` — never two records.
 *
 * §25 COVERAGE IS STRUCTURAL. Eight of these carry an `overWithholdingClass`,
 * one per class (WYS §25) names, and `tests/wys-content.test.ts` fails if any
 * class is unrepresented. The feedback line those scenarios render is defined
 * once, in `copy.ts`, and the rule that goes with it is not negotiable: do not
 * shame the learner for over-withholding.
 *
 * NO SCENARIO USES A REAL FILE. Fictional artifacts only (WYS §24), and the
 * artifact bank is deliberately empty in v0 — see `artifacts.ts`.
 */

import type { WysScenario } from "./types";

export type WysScenarioId =
  | "scn-client-meeting"
  | "scn-repair-request"
  | "scn-group-chat"
  | "scn-ow-jurisdiction"
  | "scn-ow-age-range"
  | "scn-ow-error-code"
  | "scn-ow-medium"
  | "scn-ow-sequence"
  | "scn-ow-deadline"
  | "scn-ow-relationship"
  | "scn-ow-over-trimmed"
  | "scn-employer-policy";

export const WYS_SCENARIO_IDS: readonly WysScenarioId[] = [
  "scn-client-meeting",
  "scn-repair-request",
  "scn-group-chat",
  "scn-ow-jurisdiction",
  "scn-ow-age-range",
  "scn-ow-error-code",
  "scn-ow-medium",
  "scn-ow-sequence",
  "scn-ow-deadline",
  "scn-ow-relationship",
  "scn-ow-over-trimmed",
  "scn-employer-policy"
];

/** Every choice key any scenario uses. The serializer's domain (plan §7.2). */
export const WYS_CHOICE_KEYS: readonly string[] = ["A", "B", "C", "D"];

const NO_REAL_FILES = "Do not adapt this to ask the learner to use their own real material.";
const NO_MORAL = "Do not add a moral, a verdict about the fictional person, or a lesson line.";

export const wysScenarios = [
  {
    /** Artboard 4a, the interactive hero demo. Ships first (WYS §35 decision 9). */
    id: "scn-client-meeting",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    title: "Declining a client meeting",
    principleIds: ["prn-task-before-prompt"],
    invariant:
      "A rewrite task needs the tone and the reason; identifying particulars that do not change the rewrite are surplus.",
    setting:
      "A fictional coworker asks AI to soften a message declining a client meeting. The draft names the client, the invoice total, and why the meeting was cancelled.",
    decisionMoment: "What does the rewrite actually need?",
    shortForm: {
      setting:
        "A fictional coworker asks AI to soften a message declining a client meeting. The draft names the client, the invoice total, and the reason.",
      decisionMoment: "What does the rewrite need?"
    },
    necessaryFacts: ["That the message declines a meeting.", "The tone wanted.", "The reason, at whatever specificity is safe."],
    unnecessaryFacts: ["The client's name.", "The invoice total."],
    inferenceClues: ["A named client plus an invoice figure identifies an account, not just a meeting."],
    pressures: ["The draft already contains everything, so trimming feels like extra work."],
    choices: [
      {
        key: "A",
        label: "Keep everything — context makes the rewrite better",
        shortLabel: "Keep everything"
      },
      {
        key: "B",
        label: "Keep the tone and the reason; drop the name and the total",
        shortLabel: "Keep tone and reason; drop name and total"
      },
      {
        key: "C",
        label: "Strip every specific and ask for a generic decline",
        shortLabel: "Strip every specific"
      }
    ],
    difficulty: 2,
    canonicalVariantIds: [],
    judgmentIds: ["jdg-client-meeting"],
    boundaryIds: ["bnd-client-meeting-reason"],
    prohibitedAdaptations: [
      NO_REAL_FILES,
      "Do not change the option count; the three options are drawn in the approved artboard."
    ]
  },
  {
    /** Artboard 5a step 5, inside Lesson Zero. Ships second. */
    id: "scn-repair-request",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    title: "Repair request",
    principleIds: ["prn-first-habit"],
    invariant:
      "A maintenance request needs the fault and its location; the requester's standing with the landlord does not change the repair.",
    setting:
      "A fictional neighbor wants AI to draft a note asking the building to fix a leaking pipe. The draft includes their full name, unit number, landlord's name, and that they're behind on rent.",
    decisionMoment: "The task is a repair request. What does it need?",
    necessaryFacts: ["That there is a leak.", "Roughly where the leak is."],
    unnecessaryFacts: ["The landlord's name.", "That the neighbour is behind on rent."],
    inferenceClues: ["Unit number plus building plus arrears identifies one household."],
    pressures: ["Every detail in the draft is true, which makes removing any of it feel dishonest."],
    choices: [
      { key: "A", label: "The leak, and roughly where it is" },
      { key: "B", label: "The leak plus the landlord's name" },
      { key: "C", label: "All of it — it's all true" },
      { key: "D", label: "Nothing specific at all" }
    ],
    difficulty: 1,
    canonicalVariantIds: [],
    judgmentIds: ["jdg-repair-request"],
    boundaryIds: ["bnd-repair-request-address"],
    prohibitedAdaptations: [NO_REAL_FILES, NO_MORAL]
  },
  {
    /** Artboard 5b, the Today screen's TRY/JUDGE card. */
    id: "scn-group-chat",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    title: "The group chat",
    principleIds: ["prn-task-before-prompt", "prn-hidden-exposure"],
    invariant:
      "Answering one message needs that message and the relationship; the other eleven participants are not part of the task.",
    setting:
      "A fictional friend pastes a whole group chat into AI to ask \"how do I reply to this?\" Twelve people's names, one message that matters.",
    decisionMoment: "What does the question need?",
    necessaryFacts: ["The one message being replied to.", "Who the reply is to, by role."],
    unnecessaryFacts: ["Eleven other participants' names.", "Everything said before the message."],
    inferenceClues: ["A named group of twelve is a small, findable set of people."],
    pressures: ["Pasting the whole thread is one action; extracting one message is several."],
    choices: [
      { key: "A", label: "The whole thread — tone matters" },
      { key: "B", label: "The one message, names swapped for roles" },
      { key: "C", label: "Just \"how do I reply to a tense message?\"" }
    ],
    difficulty: 2,
    canonicalVariantIds: ["var-group-chat-school"],
    judgmentIds: ["jdg-group-chat"],
    boundaryIds: ["bnd-container-trim"],
    prohibitedAdaptations: [NO_REAL_FILES, NO_MORAL],
    overWithholdingClass: "context-removed-task-ambiguous"
  },

  /* ---------------------------------------------------------------------- */
  /* WYS §25 — over-withholding, one scenario per named class               */
  /* ---------------------------------------------------------------------- */

  {
    id: "scn-ow-jurisdiction",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    title: "Which country's rules",
    principleIds: ["prn-minimum-necessary"],
    invariant: "Where a rule applies is part of the question when the answer differs by place.",
    setting:
      "A fictional volunteer asks how long a small club must keep its membership records. They remove the country, thinking a location is personal.",
    decisionMoment: "Does removing the country make the answer safer, or wrong?",
    necessaryFacts: ["The country, or at least the legal region."],
    unnecessaryFacts: ["The club's name.", "The volunteer's role in it."],
    inferenceClues: ["A named small club plus a town identifies its officers."],
    pressures: ["Naming a place feels like naming yourself."],
    choices: [
      { key: "A", label: "Leave the country out — it's personal" },
      { key: "B", label: "Give the country, drop the club's name" },
      { key: "C", label: "Give everything, including the club" }
    ],
    difficulty: 3,
    canonicalVariantIds: [],
    judgmentIds: ["jdg-ow-jurisdiction"],
    boundaryIds: ["bnd-jurisdiction-detail"],
    prohibitedAdaptations: [NO_REAL_FILES, "Do not name a real statute; the scenario is about necessity, not law."],
    overWithholdingClass: "exact-jurisdiction",
    implicatesExternalAuthority: true
  },
  {
    id: "scn-ow-age-range",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    title: "How old, roughly",
    principleIds: ["prn-minimum-necessary"],
    invariant: "An approximate age band can be necessary where an exact birth date never is.",
    setting:
      "A fictional teacher asks for reading suggestions for a struggling pupil and removes every hint of age, in case it identifies the child.",
    decisionMoment: "Does a rough age band change the suggestions?",
    necessaryFacts: ["A rough age range."],
    unnecessaryFacts: ["The child's date of birth.", "The child's name.", "The school."],
    inferenceClues: ["A named school plus one pupil's exact age is close to a name."],
    pressures: ["Anything about a child feels like something to withhold entirely."],
    choices: [
      { key: "A", label: "No age at all" },
      { key: "B", label: "A rough band, nothing else" },
      { key: "C", label: "Exact age and year group" }
    ],
    difficulty: 2,
    canonicalVariantIds: [],
    judgmentIds: ["jdg-ow-age-range"],
    boundaryIds: ["bnd-over-withholding"],
    prohibitedAdaptations: [NO_REAL_FILES, NO_MORAL],
    overWithholdingClass: "rough-age-range",
    implicatesExternalAuthority: true
  },
  {
    id: "scn-ow-error-code",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    title: "The error code",
    principleIds: ["prn-minimum-necessary", "prn-source-before-synthesis"],
    invariant: "A diagnostic string is the task; the surrounding log is not.",
    setting:
      "A fictional support volunteer describes a crash in their own words and leaves out the error code, because the log looked like it held personal data.",
    decisionMoment: "Is the code the identifying part, or the answerable part?",
    necessaryFacts: ["The error code and the failing operation."],
    unnecessaryFacts: ["The rest of the log.", "The machine name.", "The account in the stack trace."],
    inferenceClues: ["Log lines carry usernames, paths and internal hostnames beside the code."],
    pressures: ["Pasting the whole log is easier than finding the one line."],
    choices: [
      { key: "A", label: "Describe it in words, no code" },
      { key: "B", label: "The code and the failing step only" },
      { key: "C", label: "Paste the whole log" }
    ],
    difficulty: 2,
    canonicalVariantIds: [],
    judgmentIds: ["jdg-ow-error-code"],
    boundaryIds: ["bnd-synthesis-authority"],
    prohibitedAdaptations: [
      NO_REAL_FILES,
      "Do not include a credential-shaped string; keep fictional secrets short and obviously fake."
    ],
    overWithholdingClass: "technical-error-code"
  },
  {
    id: "scn-ow-medium",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    title: "Which container it came in",
    principleIds: ["prn-hidden-exposure"],
    invariant: "How material arrived changes what it carries, so the medium is sometimes part of the task.",
    setting:
      "A fictional office manager asks for help summarising a policy and does not say it arrived as a scanned photograph of a printed page.",
    decisionMoment: "Does the medium change the advice they get?",
    necessaryFacts: ["That the source is a scan rather than text."],
    unnecessaryFacts: ["The scanner's file name.", "Who sent it.", "The rest of the folder."],
    inferenceClues: ["A photograph of a page carries a desk, a hand, a room, and file metadata."],
    pressures: ["Describing the medium feels like a technicality rather than a fact."],
    choices: [
      { key: "A", label: "Just the words, no mention of the scan" },
      { key: "B", label: "Say it is a scan, crop to the paragraph" },
      { key: "C", label: "Upload the photograph as it is" }
    ],
    difficulty: 3,
    canonicalVariantIds: [],
    judgmentIds: ["jdg-ow-medium"],
    boundaryIds: ["bnd-container-trim"],
    prohibitedAdaptations: [NO_REAL_FILES, NO_MORAL],
    overWithholdingClass: "medium"
  },
  {
    id: "scn-ow-sequence",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    title: "What happened first",
    principleIds: ["prn-correction-outranks-inference"],
    invariant: "Order of events can be the whole question, and removing it removes the answer.",
    setting:
      "A fictional tenant asks whether a deposit deduction is fair and, to keep it short, lists what happened without saying in what order.",
    decisionMoment: "Does the order of events change the answer?",
    necessaryFacts: ["The order the events happened in."],
    unnecessaryFacts: ["The other party's full name.", "The exact address."],
    inferenceClues: ["A dated sequence plus an address is a public record waiting to be matched."],
    pressures: ["Summarising feels tidier than a timeline."],
    choices: [
      { key: "A", label: "A short summary, no order" },
      { key: "B", label: "The order, with names removed" },
      { key: "C", label: "Everything, in order, named" }
    ],
    difficulty: 3,
    canonicalVariantIds: [],
    judgmentIds: ["jdg-ow-sequence"],
    boundaryIds: ["bnd-reset-meaning"],
    prohibitedAdaptations: [NO_REAL_FILES, NO_MORAL],
    overWithholdingClass: "sequence",
    implicatesExternalAuthority: true
  },
  {
    id: "scn-ow-deadline",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    title: "When it is due",
    principleIds: ["prn-delegate-then-verify"],
    invariant: "A deadline changes which options are available, so removing it changes the advice.",
    setting:
      "A fictional freelancer asks how to renegotiate a contract and leaves out that the response is due tomorrow morning.",
    decisionMoment: "Does the deadline change what they should do?",
    necessaryFacts: ["That the response is due within a day."],
    unnecessaryFacts: ["The counterparty's name.", "The contract value."],
    inferenceClues: ["A named counterparty plus a date narrows to one contract."],
    pressures: ["The deadline feels like a detail about them, not about the work."],
    choices: [
      { key: "A", label: "No timing at all" },
      { key: "B", label: "Say it is due tomorrow, name nobody" },
      { key: "C", label: "Full detail, including the counterparty" }
    ],
    difficulty: 2,
    canonicalVariantIds: [],
    judgmentIds: ["jdg-ow-deadline"],
    boundaryIds: ["bnd-over-withholding"],
    prohibitedAdaptations: [NO_REAL_FILES, NO_MORAL],
    overWithholdingClass: "deadline"
  },
  {
    id: "scn-ow-relationship",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    title: "Who they are to you",
    principleIds: ["prn-learner-rules-outrank"],
    invariant: "The category of a relationship shapes the reply; the identity of the person does not.",
    setting:
      "A fictional graduate asks how to word a difficult message and removes any hint of who it is going to, including that it is their manager.",
    decisionMoment: "Does the category of the relationship change the wording?",
    necessaryFacts: ["That the recipient is their manager."],
    unnecessaryFacts: ["The manager's name.", "The employer.", "The team."],
    inferenceClues: ["Employer plus role plus team is often one identifiable person."],
    pressures: ["Naming a category feels one step away from naming the person."],
    choices: [
      { key: "A", label: "No relationship at all" },
      { key: "B", label: "The category only — my manager" },
      { key: "C", label: "Name and employer included" }
    ],
    difficulty: 2,
    canonicalVariantIds: [],
    judgmentIds: ["jdg-ow-relationship"],
    boundaryIds: ["bnd-rule-with-exception"],
    prohibitedAdaptations: [NO_REAL_FILES, NO_MORAL],
    overWithholdingClass: "relationship-category"
  },
  {
    id: "scn-ow-over-trimmed",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    title: "Trimmed until it broke",
    principleIds: ["prn-minimum-necessary"],
    invariant: "A question stripped past the task returns a confident answer to a different question.",
    setting:
      "A fictional learner removes so much from a request that the tool cannot tell what is being asked, and answers something else confidently.",
    decisionMoment: "Which removed detail was the one the task needed?",
    necessaryFacts: ["The task itself.", "The one constraint that ruled out the obvious answer."],
    unnecessaryFacts: ["Everything else that was removed."],
    inferenceClues: ["A confident answer to the wrong question is hard to notice."],
    pressures: ["Removing more feels like doing the exercise better."],
    choices: [
      { key: "A", label: "Keep trimming — it is safer" },
      { key: "B", label: "Put back the constraint, nothing else" },
      { key: "C", label: "Restore the original request" }
    ],
    difficulty: 4,
    canonicalVariantIds: [],
    judgmentIds: ["jdg-ow-over-trimmed"],
    boundaryIds: ["bnd-over-withholding"],
    prohibitedAdaptations: [NO_REAL_FILES, NO_MORAL],
    overWithholdingClass: "context-removed-task-ambiguous"
  },

  /* ---------------------------------------------------------------------- */
  /* WYS §26 — external authority                                           */
  /* ---------------------------------------------------------------------- */

  {
    id: "scn-employer-policy",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    title: "The document you are not allowed to upload",
    principleIds: ["prn-delegate-then-verify"],
    invariant: "Where an outside rule forbids the upload, abstraction does not create permission.",
    setting:
      "A fictional analyst is not allowed to put client documents into outside tools, and wonders whether removing the names makes it permitted.",
    decisionMoment: "Does anonymizing it change what the rule allows?",
    necessaryFacts: ["That an employer or client rule governs the document."],
    unnecessaryFacts: ["The document's contents, at any level of abstraction."],
    inferenceClues: ["Structure, headings and figures identify a document even with names removed."],
    pressures: ["The exercise has just taught abstraction, which makes it feel like the answer."],
    choices: [
      { key: "A", label: "Anonymize it and upload" },
      { key: "B", label: "Ask about the general problem, upload nothing" },
      { key: "C", label: "Upload it and delete it afterwards" }
    ],
    difficulty: 4,
    canonicalVariantIds: [],
    judgmentIds: ["jdg-employer-policy"],
    boundaryIds: ["bnd-external-authority"],
    prohibitedAdaptations: [
      NO_REAL_FILES,
      "Do not restate any employer's actual policy; the scenario is about who decides, not what the rule says."
    ],
    implicatesExternalAuthority: true
  }
] as const satisfies readonly WysScenario[];

export function wysScenarioById(id: WysScenarioId): WysScenario {
  const record = wysScenarios.find((scenario) => scenario.id === id);
  if (!record) throw new Error(`No WYS scenario with id "${id}".`);
  return record;
}
