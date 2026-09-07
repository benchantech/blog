/**
 * Trust Forward Lite — the five cases, their scenarios, and their eleven
 * decisions (layer 06, `FULL_FIVE_CASES_ALL_TEXT_OPTIONS_VERBATIM.md`).
 *
 * Every learner-facing string below is RECOVERED PRIOR AUTHORING, transcribed
 * from that file and approved by Ben on 2026-09-07
 * (`SC_TF1_APPROVAL_RECORD_2026-09-07.md`). Nothing here was written by the
 * implementation. Where the source supplies no string for a field this module
 * carries `null` rather than a plausible substitute — a missing label is a fact
 * about the authoring, and inventing one would launder implementation prose
 * into approved copy.
 *
 * WHY THE VERBATIM FILE AND NOT LAYER-01 `CASES.md`. The layer-01 synopsis
 * paraphrases the options down to two- and three-word stubs. The extraction
 * guide's one CRITICAL RENDER RULE is the opposite instruction: "Do not shorten
 * the actual scenario/options to the terse paraphrases in layer-01 `CASES.md`."
 * So each option carries BOTH halves the source authored — the bold `label`
 * ("Ask one question before starting") and the `detail` under it ("Ask which
 * records they actually expect the export to contain."). The label alone is a
 * different, weaker product: it is the paraphrase the guide forbids.
 *
 * WHY THERE ARE NO SIGNAL TAGS IN THIS FILE. The source interleaves a
 * `Signals:` block under every option. They are deliberately absent here and
 * live in the signals module instead, because a posture tag sitting next to its
 * option invites exactly the bug the contract warns about: reading a dimension
 * level off the option's A/B/C POSITION. Nine of the 138 recovered tags are
 * non-monotonic — C2D1 is inverted on promise and trust, so option A carries
 * `trust:stewardship` (1.0) — and a reducer that trusted ordering would be
 * wrong on all nine while passing every obvious check. Levels come from
 * `postureValue()` reading the TAG. This module holds prose and ordering only,
 * and holding no tags is what keeps that separation honest.
 *
 * WHAT IS NOT HERE, BECAUSE ANOTHER MODULE OWNS IT. The 27 world-state
 * fragments that compose the 55 deterministic variants (Case 2 ambiguity ×
 * trust, Case 3 verification × risk, Case 4 ownership × trust, Case 5 promise ×
 * risk × ownership), the opening callbacks, the case closes, the cross-case
 * factual replay surfaces, the 729 terminal narratives, and the 33 receipt
 * phrases. What IS here is the part of each scene that is CONSTANT across every
 * variant of its case — Case 2's `scenario` is one line for that reason.
 *
 * WHAT IS NOT HERE, BECAUSE IT IS NOT COPY. The source is a working authoring
 * transcript: it carries "Why this is first", "Core problem", corpus-comparison
 * rationale, `Signals` blocks, the "Case N variant selector" / "Verification
 * state" / "Risk state" / "Ownership" / "Trust" / "Promise layer" routing
 * headings, directives to the implementer ("Do not issue judgment", "No
 * interpretation", "Soft, visually secondary", "Suggested copy"), and stray
 * source filenames from the transcript. None of that is learner-facing. It is
 * not silently dropped either: every judgment call is recorded verbatim in
 * `AUTHORING_NOTES` below, with its disposition, so the exclusions can be
 * audited against the source instead of taken on trust.
 *
 * TITLE vs PROMPT. The source heads a decision with either a question ("Ship?",
 * "How do you delegate?") or a label ("Recovery", "Stakeholder"). The rule
 * applied here is mechanical: a heading that is a question becomes `prompt`; a
 * heading that is not becomes `title`; a question appearing in the body below a
 * label becomes that decision's `prompt`. Nothing is reworded to make the two
 * shapes uniform.
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts`, and a module that
 * reaches a stylesheet takes its whole test file down with
 * `ERR_UNKNOWN_FILE_EXTENSION`. Punctuation is preserved as authored: curly
 * quotes, curly apostrophes, and the em dash in Case 2's scenario line.
 */

import type { CaseNumber, DecisionId, OptionId } from "@/lib/trust-forward/types";

/* -------------------------------------------------------------------------- */
/* 1. Provenance                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The governed provenance vocabulary. A record's tag says who wrote the words,
 * which is the only question the render layer's draft/approved marking can
 * answer from content alone.
 */
export type TrustForwardProvenance =
  | "ben_canonical"
  | "recovered_prior_authoring"
  | "implementation_authored_under_ben_approved_rule"
  | "learner_authored_verbatim"
  | "deterministic_derived";

/**
 * Every case, scenario, decision and option string in `CASES`. Recovered from
 * the layer-06 verbatim extraction; approved 2026-09-07 under SC-TF1.
 */
export const CASES_PROVENANCE: TrustForwardProvenance = "recovered_prior_authoring";

/**
 * The excluded and borderline annotations in `AUTHORING_NOTES`. Same origin —
 * they are lines of the same recovered transcript — but they are implementation
 * guidance, and the `renderable: false` flag on each note is what keeps them off
 * a learner's screen.
 */
export const AUTHORING_NOTES_PROVENANCE: TrustForwardProvenance = "recovered_prior_authoring";

/** Where every string in this module came from, precisely enough to re-check. */
export const CASES_SOURCE_LOCATOR =
  "TRUST_FORWARD_LITE_CODEX_FINAL_LITE_GATES_RESOLVED_2026-09-07/06_full-five-case-authoring-extraction-2026-09-07/FULL_FIVE_CASES_ALL_TEXT_OPTIONS_VERBATIM.md";

/* -------------------------------------------------------------------------- */
/* 2. Shape                                                                   */
/* -------------------------------------------------------------------------- */

export type CaseId = "C1" | "C2" | "C3" | "C4" | "C5";

export const CASE_IDS: readonly CaseId[] = ["C1", "C2", "C3", "C4", "C5"];

/**
 * The one-word job of each case, as the source titles it. It is a job, not a
 * virtue: "TAKE THE WHEEL" is Case 5's task under an AI completion report, not
 * a verdict that taking the wheel is the right answer there.
 */
export type JobWord = "ACT" | "COMMUNICATE" | "VERIFY" | "DELEGATE" | "TAKE THE WHEEL";

export interface CaseOption {
  id: OptionId;
  /**
   * The bold option label ("Probably, with a boundary"). `null` where the
   * source authored the line itself with no label above it — C2D2 and C5D3,
   * whose options are the message rather than a name for it.
   */
  label: string | null;
  /**
   * The sub-description under the label. `null` only if the source gave a bare
   * label, which never happens across the eleven decisions; the field is
   * nullable so a future decision that does can say so instead of being padded.
   */
  detail: string | null;
}

export interface CaseDecision {
  id: DecisionId;
  caseNumber: CaseNumber;
  /** A non-question heading the source gives this decision, else `null`. */
  title: string | null;
  /**
   * Scene lines shown with this decision and constant across every variant of
   * its case, in source order. Case 1's Screen 2 and Case 4's "Done. Everything
   * looks good." live here rather than on the case, because they arrive with
   * the decision and not before it.
   */
  setup: readonly string[];
  /** The question put to the learner, verbatim. */
  prompt: string | null;
  /** Exactly three, in authored order A, B, C. Order is not rank. */
  options: readonly [CaseOption, CaseOption, CaseOption];
}

export interface CaseReflection {
  /** The optional-writing prompt. Never scored, never interpreted. */
  prompt: string;
  /** Case 1's "Optional. Write as much or as little as you want." */
  optionalNote: string | null;
  /** Case 1's small privacy line under the box. */
  privacyNote: string | null;
}

export interface CaseScenario {
  /** A heading above the scenario where the source gives one. Case 1 only. */
  heading: string | null;
  /**
   * The constant scenario body, one entry per authored line. Empty for Cases 3
   * and 5, whose entire opening is composed from world-state fragments and (for
   * Case 5) the AI report — an empty array is the honest record of that, not a
   * gap waiting to be filled with new prose.
   */
  lines: readonly string[];
}

/** Case 5's completion report. It is meant to look competent, and does. */
export interface AiCompletionReport {
  /** The line introducing the report. */
  lead: string;
  /** The report's headline, capitalised as authored. */
  headline: string;
  /** The five claim lines, in authored order and authored lower case. */
  claims: readonly string[];
}

/**
 * Case 5's changed condition, revealed AFTER the learner commits to C5D1.
 * Three lines, and the third is load-bearing: nothing has failed in production
 * yet, so the learner is deciding under an intact promise rather than cleaning
 * up an outage.
 */
export interface ChangedCondition {
  lines: readonly string[];
}

export interface LiteCase {
  id: CaseId;
  number: CaseNumber;
  title: string;
  job: JobWord;
  scenario: CaseScenario;
  /** The optional reflection attached to this case, where one was authored. */
  reflection: CaseReflection | null;
  /** Case 5 only. */
  aiReport: AiCompletionReport | null;
  /** Case 5 only. */
  changedCondition: ChangedCondition | null;
  decisions: readonly CaseDecision[];
  provenance: TrustForwardProvenance;
}

/* -------------------------------------------------------------------------- */
/* 3. The five cases                                                          */
/* -------------------------------------------------------------------------- */

export const CASES: readonly LiteCase[] = [
  {
    id: "C1",
    number: 1,
    title: "It’s Just a Small Change",
    job: "ACT",
    scenario: {
      heading: "Become The Developer Clients Keep",
      lines: [
        "You’re finishing another task when a stakeholder messages:",
        "“Can you add an Export button to the account screen? CSV is fine. It should be pretty small.”",
        "The account screen already displays a table of customer activity. You haven’t worked on its export behavior before."
      ]
    },
    reflection: {
      prompt: "Why that move?",
      optionalNote: "Optional. Write as much or as little as you want.",
      privacyNote:
        "Saved only in this browser. Lite will remember your words, but it won’t interpret them."
    },
    aiReport: null,
    changedCondition: null,
    decisions: [
      {
        id: "C1D1",
        caseNumber: 1,
        title: null,
        setup: [],
        prompt: "What do you do first?",
        options: [
          {
            id: "A",
            label: "Start implementing the obvious version",
            detail:
              "Export the rows currently visible in the table. If something turns out to be different, adjust afterward."
          },
          {
            id: "B",
            label: "Ask one question before starting",
            detail: "Ask which records they actually expect the export to contain."
          },
          {
            id: "C",
            label: "Inspect first",
            detail:
              "Look at the table, data source, permissions, and nearby behavior before deciding what the request means technically."
          }
        ]
      },
      {
        id: "C1D2",
        caseNumber: 1,
        title: "New information",
        setup: [
          "You learn that the table can contain filtered results, paginated results, archived records, and information some account roles aren’t allowed to see.",
          "The stakeholder asks:",
          "“Still small?”"
        ],
        prompt: "What do you say?",
        options: [
          {
            id: "A",
            label: "Yes",
            detail: "“Yes. I can get this done.”"
          },
          {
            id: "B",
            label: "Probably, with a boundary",
            detail:
              "“The button itself is small. I need to confirm what should be included before I promise the whole change.”"
          },
          {
            id: "C",
            label: "The request changed materially",
            detail:
              "“There are data and permission decisions hiding inside this. I don’t want to call it small until those are resolved.”"
          }
        ]
      }
    ],
    provenance: "recovered_prior_authoring"
  },

  {
    id: "C2",
    number: 2,
    title: "Tell Them Yet?",
    job: "COMMUNICATE",
    /*
     * One line. The two lines above it in the source's worked example are the
     * ambiguity fragment and the trust fragment — nine openings, composed
     * elsewhere. This is the invariant tail every one of the nine ends on, and
     * it is the whole reason the case is hard: the risk is real and the size of
     * it is unknown.
     */
    scenario: {
      heading: null,
      lines: [
        "You now believe tomorrow’s delivery may be at risk—but you don’t yet know whether the issue will take twenty minutes or two days to resolve."
      ]
    },
    reflection: {
      prompt: "What would make your timing responsible rather than merely early or late?",
      optionalNote: null,
      privacyNote: null
    },
    aiReport: null,
    changedCondition: null,
    decisions: [
      {
        id: "C2D1",
        caseNumber: 2,
        title: null,
        setup: [],
        prompt: "What do you do about the stakeholder?",
        options: [
          {
            id: "A",
            label: "Tell them now",
            detail: "Surface the risk immediately, even though you cannot yet quantify it."
          },
          {
            id: "B",
            label: "Investigate briefly first",
            detail:
              "Spend a bounded amount of time establishing enough evidence to make the conversation more useful, then update them."
          },
          {
            id: "C",
            label: "Resolve the uncertainty first",
            detail:
              "Do not create concern until you know whether the issue actually changes delivery."
          }
        ]
      },
      {
        id: "C2D2",
        caseNumber: 2,
        title: null,
        setup: ["Suppose you do communicate."],
        prompt: "Which message is closest to yours?",
        options: [
          {
            id: "A",
            label: null,
            detail: "“I found a problem. I’m working on it and will update you when I know more.”"
          },
          {
            id: "B",
            label: null,
            detail:
              "“I found something that may affect tomorrow. I don’t yet know whether it does. I’m checking X and Y and I’ll update you by 2:00.”"
          },
          {
            id: "C",
            label: null,
            detail:
              "“New evidence changes the assumption behind tomorrow’s commitment. We should treat the delivery as unresolved until we’ve decided how to handle it.”"
          }
        ]
      }
    ],
    provenance: "recovered_prior_authoring"
  },

  {
    id: "C3",
    number: 3,
    title: "Good Enough to Ship?",
    job: "VERIFY",
    /*
     * Deliberately empty. Case 3's opening is entirely the verification-state
     * fragment plus the risk-state fragment plus the Case 2 callback; the
     * source's only standalone sentence, "The work looks done.", sits under the
     * authoring heading "Core problem" and is recorded in AUTHORING_NOTES.
     */
    scenario: { heading: null, lines: [] },
    reflection: null,
    aiReport: null,
    changedCondition: null,
    decisions: [
      {
        id: "C3D1",
        caseNumber: 3,
        title: null,
        setup: [],
        prompt: "Ship?",
        options: [
          {
            id: "A",
            label: "Ship now",
            detail: "The available evidence is enough for the consequence level."
          },
          {
            id: "B",
            label: "Stage it",
            detail: "Release through the smallest useful reversible path and watch what happens."
          },
          {
            id: "C",
            label: "Hold it",
            detail:
              "Do not ship until the most consequential assumptions have stronger evidence."
          }
        ]
      },
      {
        id: "C3D2",
        caseNumber: 3,
        title: null,
        setup: [],
        prompt: "What’s your next verification move?",
        options: [
          {
            id: "A",
            label: "Smoke check",
            detail: "Confirm the primary flow one more time."
          },
          {
            id: "B",
            label: "Targeted attack",
            detail:
              "Pick the two or three failure modes that would change your decision and test those."
          },
          {
            id: "C",
            label: "Verify the critical invariants",
            detail:
              "Identify what absolutely must remain true and establish stronger evidence for each one."
          }
        ]
      }
    ],
    provenance: "recovered_prior_authoring"
  },

  {
    id: "C4",
    number: 4,
    title: "Who Owns the Next Move?",
    job: "DELEGATE",
    scenario: {
      heading: null,
      lines: [
        "You are already carrying another priority.",
        "Another developer has capacity and can take the next piece of this work.",
        "They ask:",
        "“Want me to own it?”"
      ]
    },
    reflection: {
      prompt: "What exactly would you still want to know even if you weren’t doing the work yourself?",
      optionalNote: null,
      privacyNote: null
    },
    aiReport: null,
    changedCondition: null,
    decisions: [
      {
        id: "C4D1",
        caseNumber: 4,
        title: null,
        setup: [],
        prompt: "How do you delegate?",
        options: [
          {
            id: "A",
            label: "Hand it off",
            detail: "Give them the objective and let them own how to get there."
          },
          {
            id: "B",
            label: "Delegate with checkpoints",
            detail:
              "Give them the objective and authority to work, but agree on the evidence or decision points that come back to you."
          },
          {
            id: "C",
            label: "Keep final decision authority",
            detail: "Let them execute substantially, but keep the consequential judgment with you."
          }
        ]
      },
      {
        id: "C4D2",
        caseNumber: 4,
        title: null,
        setup: ["The developer returns:", "“Done. Everything looks good.”"],
        prompt: "What do you do?",
        options: [
          {
            id: "A",
            label: "Accept the completion report",
            detail: "They own this work and you trust the report."
          },
          {
            id: "B",
            label: "Review the evidence you agreed on",
            detail: "Check the agreed boundary, not every implementation detail."
          },
          {
            id: "C",
            label: "Independently validate the consequential result",
            detail: "Their completion report is input, not your final evidence."
          }
        ]
      }
    ],
    provenance: "recovered_prior_authoring"
  },

  {
    id: "C5",
    number: 5,
    title: "The AI Says It’s Done",
    job: "TAKE THE WHEEL",
    /*
     * Empty for the same reason as Case 3: the opening is the promise ×
     * risk × ownership fragments (27 scenarios), then the callback, then the
     * report below.
     */
    scenario: { heading: null, lines: [] },
    reflection: null,
    aiReport: {
      lead: "The agent reports:",
      headline: "IMPLEMENTATION COMPLETE",
      claims: [
        "requested change implemented",
        "tests passing",
        "edge cases handled",
        "no outstanding issues found",
        "ready to deploy"
      ]
    },
    changedCondition: {
      /*
       * Line 2 is bold in the source; emphasis is a render decision and is not
       * encoded in the string. Line 3 is the case's whole design: the failure is
       * discovered while the promise is still intact, which is what makes the
       * recovery decision a judgment call rather than an emergency.
       */
      lines: [
        "One thing is wrong.",
        "A condition the AI described as tested was not actually covered by the test it cited.",
        "Nothing has failed in production yet."
      ]
    },
    decisions: [
      {
        id: "C5D1",
        caseNumber: 5,
        title: null,
        setup: [],
        prompt: "Accept completion?",
        options: [
          {
            id: "A",
            label: "Accept the report",
            detail: "The AI generated the work, tested it, and reports completion. Proceed."
          },
          {
            id: "B",
            label: "Inspect key claims",
            detail:
              "Identify the few claims that matter most and independently examine those before proceeding."
          },
          {
            id: "C",
            label: "Independently establish the critical evidence",
            detail:
              "Treat the report as a useful claim, not proof of the consequential parts you still own."
          }
        ]
      },
      {
        id: "C5D2",
        caseNumber: 5,
        title: "Recovery",
        setup: [],
        prompt: null,
        options: [
          {
            id: "A",
            label: "Ask AI to fix it",
            detail: "Point out the missing coverage and let the AI repair the implementation and tests."
          },
          {
            id: "B",
            label: "Constrain the repair",
            detail:
              "Tell the AI exactly what failed, require a bounded correction, then verify that correction independently."
          },
          {
            id: "C",
            label: "Take the wheel back",
            detail:
              "Stop delegated execution long enough to independently determine why the claim and evidence diverged, then decide what can safely be delegated again."
          }
        ]
      },
      {
        id: "C5D3",
        caseNumber: 5,
        title: "Stakeholder",
        setup: [],
        prompt: "What do you communicate?",
        options: [
          { id: "A", label: null, detail: "Repair it and report successful completion." },
          {
            id: "B",
            label: null,
            detail:
              "Explain the discrepancy, what was corrected, and what confidence you currently have."
          },
          {
            id: "C",
            label: null,
            detail:
              "Explain that the completion claim was not fully supported and explicitly reopen whatever promise or approval boundary it affects."
          }
        ]
      }
    ],
    provenance: "recovered_prior_authoring"
  }
];

/* -------------------------------------------------------------------------- */
/* 4. Lookups                                                                 */
/* -------------------------------------------------------------------------- */

/** All eleven decisions in experience order, flattened. */
export const CASE_DECISIONS: readonly CaseDecision[] = CASES.flatMap((c) => c.decisions);

/** Throws on an unknown number rather than returning `undefined` downstream. */
export function caseByNumber(caseNumber: CaseNumber): LiteCase {
  const found = CASES.find((c) => c.number === caseNumber);
  if (!found) {
    throw new Error(`No Trust Forward Lite case numbered ${caseNumber}.`);
  }
  return found;
}

/** Throws on an unknown id. `DecisionId` makes that unreachable by type. */
export function decisionById(decisionId: DecisionId): CaseDecision {
  const found = CASE_DECISIONS.find((d) => d.id === decisionId);
  if (!found) {
    throw new Error(`No Trust Forward Lite decision "${decisionId}".`);
  }
  return found;
}

export function optionById(decisionId: DecisionId, optionId: OptionId): CaseOption {
  const found = decisionById(decisionId).options.find((o) => o.id === optionId);
  if (!found) {
    throw new Error(`Decision "${decisionId}" has no option "${optionId}".`);
  }
  return found;
}

/* -------------------------------------------------------------------------- */
/* 5. Authoring notes — what was read out of the source and NOT shipped       */
/* -------------------------------------------------------------------------- */

/**
 * The audit trail for the exclusions.
 *
 * The source is a working transcript, so deciding what is copy is a judgment
 * every time. Recording each call — with the line verbatim and the reason —
 * costs nothing and makes the alternative failure impossible: a reviewer
 * comparing this module against the source can see that a missing line was
 * DECIDED about, not overlooked. Nothing in here renders; `renderable` is false
 * on every note and there is no path from this object to a learner's screen.
 */
export interface AuthoringNote {
  caseId: CaseId | null;
  decisionId: DecisionId | null;
  /** The line as it stands in the source. */
  text: string;
  /** Why it landed in this bucket. */
  disposition: string;
  renderable: false;
}

export const AUTHORING_NOTES: {
  readonly sourceLocator: string;
  readonly excludedAsRoutingOrInstruction: readonly AuthoringNote[];
  readonly borderlineIncludedInCases: readonly AuthoringNote[];
  readonly borderlineHeldBack: readonly AuthoringNote[];
} = {
  sourceLocator: CASES_SOURCE_LOCATOR,

  /* Named by the extraction guide as implementation guidance, or plainly so. */
  excludedAsRoutingOrInstruction: [
    {
      caseId: "C1",
      decisionId: null,
      text: "Why this is first",
      disposition:
        "Authoring rationale heading; the guide names it as an annotation. The paragraphs under it compare Lite against corpus cases and are not part of the fiction.",
      renderable: false
    },
    {
      caseId: "C1",
      decisionId: "C1D2",
      text: "Regardless of choice:",
      disposition:
        "Routing instruction — it tells the implementer that Screen 2 is reached from all three C1D1 options. The learner never sees a branch to be told is absent.",
      renderable: false
    },
    {
      caseId: "C1",
      decisionId: null,
      text: "Do not issue judgment.",
      disposition: "Named instruction. Belongs to the Case 1 close module's behaviour, not to its copy.",
      renderable: false
    },
    {
      caseId: "C1",
      decisionId: null,
      text: "Soft, visually secondary.",
      disposition: "Named instruction — a styling note on the gated card.",
      renderable: false
    },
    {
      caseId: "C2",
      decisionId: null,
      text: "Core problem",
      disposition: "Authoring rationale heading; the paragraph under it is corpus comparison.",
      renderable: false
    },
    {
      caseId: "C2",
      decisionId: null,
      text: "No interpretation.",
      disposition: "Named instruction on the opening callback.",
      renderable: false
    },
    {
      caseId: "C2",
      decisionId: null,
      text: "Case 2 variant selector",
      disposition:
        "Routing heading. The 3 × 3 construction it introduces is the fragments module's business; the fragment text itself is not this module's to carry.",
      renderable: false
    },
    {
      caseId: "C2",
      decisionId: "C2D1",
      text: "None is labeled correct.",
      disposition:
        "Instruction to the implementer. It is a true and load-bearing property of the product, but it is enforced by there being no correctness marking anywhere — not by printing the sentence.",
      renderable: false
    },
    {
      caseId: "C2",
      decisionId: null,
      text: "Again inert.",
      disposition: "Instruction: the Case 2 reflection is stored and never interpreted.",
      renderable: false
    },
    {
      caseId: "C3",
      decisionId: null,
      text: "Verification state",
      disposition: "Routing heading over the three verification fragments. Named by the guide.",
      renderable: false
    },
    {
      caseId: "C3",
      decisionId: null,
      text: "Risk state",
      disposition: "Routing heading over the three risk fragments. Named by the guide.",
      renderable: false
    },
    {
      caseId: "C3",
      decisionId: null,
      text: "But Lite keeps this case non-AI so Case 5 still has somewhere to go.",
      disposition: "Design rationale for the case sequence.",
      renderable: false
    },
    {
      caseId: "C4",
      decisionId: null,
      text: "Ownership",
      disposition: "Routing heading over the three ownership fragments. Named by the guide.",
      renderable: false
    },
    {
      caseId: "C4",
      decisionId: null,
      text: "Trust",
      disposition:
        "Routing heading over the three trust fragments. Named by the guide. Note that Case 2's equivalent axis is keyed `reliance` in the contract, so this label cannot be used as an axis key.",
      renderable: false
    },
    {
      caseId: "C4",
      decisionId: null,
      text: "The exact implications vary by the nine-state selector.",
      disposition:
        "Routing note closing the Case 4 scenario. It describes the composition rule; it is not a line of the scene.",
      renderable: false
    },
    {
      caseId: "C4",
      decisionId: null,
      text: "This becomes excellent export material later. / Still inert.",
      disposition: "Instructions on the Case 4 reflection.",
      renderable: false
    },
    {
      caseId: "C5",
      decisionId: null,
      text: "Promise layer",
      disposition: "Routing heading over the three promise fragments. Named by the guide.",
      renderable: false
    },
    {
      caseId: "C5",
      decisionId: null,
      text: "It provides a concise, technically plausible explanation of what it changed.",
      disposition:
        "Describes a surface the AI report should have without authoring its words. Shipping the description as if it were the report would put implementation prose in the learner's mouth as the agent's; the explanation itself is genuinely unauthored (see the TODO constant below).",
      renderable: false
    },
    {
      caseId: "C5",
      decisionId: null,
      text: "No cartoonishly suspicious AI output. / It should look competent.",
      disposition: "Instruction about the report's register.",
      renderable: false
    },
    {
      caseId: "C5",
      decisionId: null,
      text:
        "This is important. / Do not make AI explode dramatically. / The educational signal is stronger when the system was mostly competent and confidently incomplete.",
      disposition: "Design rationale for the changed condition.",
      renderable: false
    },
    {
      caseId: "C5",
      decisionId: "C5D2",
      text:
        "This should not imply C is universally correct. / Low consequence can legitimately favor A or B.",
      disposition:
        "Instruction. It is the reason C5D2 must never be scored by option position, which the signals module and `postureValue()` enforce.",
      renderable: false
    },
    {
      caseId: "C5",
      decisionId: "C5D3",
      text: "task → relationship → stewardship / not / bad → okay → good",
      disposition:
        "A signal note and the sharpest statement of the non-monotonic rule. It belongs with the tags, not the copy.",
      renderable: false
    },
    {
      caseId: null,
      decisionId: null,
      text: "Signals: / Signals primarily: / Signals strongly:",
      disposition:
        "Every posture tag under every option. Excluded from this module by design — see the header. They belong to the signals module keyed by decision and option.",
      renderable: false
    },
    {
      caseId: null,
      decisionId: null,
      text:
        "Pasted text(20260905-183210).txt / Pasted markdown(20260906-105840).md / Pasted text(20260906-000238).txt / Pasted text(20260905-182124).txt / Pasted text(20260905-183019).txt / Pasted markdown(20260906-111644).md / YY_Method_for_Violin_App_Blueprint_90_Step_Curriculum_Routing.pdf",
      disposition:
        "Source filenames left in the working transcript by the original paste. Provenance debris, never copy.",
      renderable: false
    }
  ],

  /* Judgment calls that went the other way: shipped in CASES, recorded here. */
  borderlineIncludedInCases: [
    {
      caseId: "C1",
      decisionId: null,
      text: "Become The Developer Clients Keep",
      disposition:
        "SHIPPED as `CASES[0].scenario.heading`. It sits under the 'Screen 1' heading in the source, so it is the first thing the learner reads. It is also the product's closing CTA headline, so a marketing/CTA module may legitimately carry the same string; a duplicate is safe, dropping it here is not.",
      renderable: false
    },
    {
      caseId: "C1",
      decisionId: null,
      text: "Saved only in this browser. Lite will remember your words, but it won’t interpret them.",
      disposition:
        "SHIPPED as `CASES[0].reflection.privacyNote`. The 'Small privacy copy:' label above it is the annotation; the sentence is learner-facing and is a disclosure, which makes losing it the worse error. It may also belong to a global reflection-UI module — duplication is acceptable, silent loss is not.",
      renderable: false
    },
    {
      caseId: null,
      decisionId: null,
      text: "Why that move? / What would make your timing responsible…? / What exactly would you still want to know…?",
      disposition:
        "SHIPPED as each case's `reflection.prompt`. The reflection prompts are learner-facing and attach to a case, so they travel with the case; the surrounding 'Optional reflection' heading and the 'inert' instructions did not.",
      renderable: false
    },
    {
      caseId: "C5",
      decisionId: "C5D2",
      text: "Recovery",
      disposition:
        "SHIPPED as `title`, with `prompt: null`. The source heads this decision 'Decision 2 — Recovery' and never asks a question. Writing one would be invented copy; the render layer can head the screen with the label as authored.",
      renderable: false
    }
  ],

  /* Held back, and the reason is not 'annotation' — see each entry. */
  borderlineHeldBack: [
    {
      caseId: "C3",
      decisionId: null,
      text: "The work looks done.",
      disposition:
        "The only standalone sentence that could serve as a Case 3 scenario, but it stands under the authoring heading 'Core problem' among corpus comparisons. `CASES[2].scenario.lines` is therefore empty: Case 3's opening is the verification and risk fragments plus the Case 2 callback, and an empty array records that faithfully.",
      renderable: false
    },
    {
      caseId: "C5",
      decisionId: null,
      text:
        "Earlier evidence already forced you to revise the original expectation once… / The change affects consequential customer data where silent failure would be expensive. / You explicitly kept final approval authority…",
      disposition:
        "The source's worked 'Example high-consequence path'. Not shipped here — these are fragment compositions, owned by the fragments module. FLAG FOR THAT MODULE: this example's risk line reads 'consequential customer data where silent failure would be expensive', dropping the 'or a workflow' clause the canonical PROTECT fragment carries. The canonical fragment is the one to trust; the example is an abbreviation inside a worked illustration.",
      renderable: false
    },
    {
      caseId: null,
      decisionId: null,
      text: "Screen 1 / Screen 2 — New information",
      disposition:
        "Structural labels. 'Screen 1' and 'Screen 2' are dropped as chrome; the descriptive half of the second, 'New information', is shipped as `C1D2.title` because it names the beat rather than numbering it.",
      renderable: false
    }
  ]
};

/* -------------------------------------------------------------------------- */
/* 6. The one string the source does not supply                               */
/* -------------------------------------------------------------------------- */

/**
 * Case 5's AI report is specified to carry "a concise, technically plausible
 * explanation of what it changed" underneath the five claim lines. The source
 * describes that paragraph and never writes it, and writing it here would be
 * implementation-authored prose sitting inside an approved, recovered scene —
 * in the agent's voice, in the case whose entire point is a confident claim
 * that outruns its evidence. So it is declared missing instead.
 *
 * Resolve by authoring the paragraph under a Ben-approved rule and moving it
 * into `CASES[4].aiReport` with its own provenance tag. Until then the render
 * layer shows the five claim lines and no explanation body.
 *
 * IT IS `null`, NOT A DESCRIPTION OF ITSELF. An earlier draft held a sentence
 * explaining what was missing, which is exactly the failure mode: a string here
 * is a sentence a renderer can print, and the one place it would print is inside
 * the AI's own report — in the case whose entire subject is a confident claim
 * that outruns its evidence. The explanation belongs in this comment, where no
 * renderer can reach it. Same mechanism as `AwaitingCopy` elsewhere in the repo.
 */
/**
 * RESOLVED 2026-09-07 — the body is authored and lives in `./copy.ts` as
 * `C5_AI_EXPLANATION_BODY`. Tombstone kept so a reader who searches for the old
 * name finds where it went.
 */
export const TODO_C5_AI_EXPLANATION_BODY_UNSOURCED = null;
