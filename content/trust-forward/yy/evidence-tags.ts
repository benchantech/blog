import type { ChoiceLabel, EvidenceTag } from "@/lib/trust-forward/yy/types";
import { RESONANCE_THRESHOLD } from "@/lib/trust-forward/yy/types";

/**
 * Trust Forward Lite — the action-evidence-tag taxonomy for the seventeen
 * YY Method™ checkpoints.
 *
 * WHY THIS FILE EXISTS AND WHY IT IS NOT `types.ts`. The addendum
 * (`TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md` §9.1) lists seven tag
 * names — `investigate_before_commit`, `broaden_verification`,
 * `seek_authority_alignment`, `retain_execution`, `transfer_execution`,
 * `parallelize_investigation`, `accept_short_term_debt_for_velocity` — and then
 * says the thing that governs this module:
 *
 *   "These examples are illustrative. Codex must not invent the final taxonomy
 *    from scratch if it materially changes the meaning of the cases. The
 *    taxonomy should be compiled from the actual 17 Ben-authored choices."
 *
 * So the seven are a register, not a schema. This vocabulary was compiled by
 * reading all sixty-eight Ben-authored choices (17 checkpoints × A–D) and
 * naming what each one DOES. Five of the seven illustrative names survive in
 * substance. Two do not survive as written, and the reason is recorded below
 * rather than smoothed over, because a taxonomy that quietly renames the cases
 * to match its own examples is exactly the failure §9.1 is guarding against.
 *
 * WHAT A TAG IS ALLOWED TO SAY. Only the action. §9.1: tags "describe the
 * selected action, not the learner's identity or motivation"; §9.2 forbids a
 * receipt from inferring intention, virtue, competence, confidence,
 * personality, doctrine or psychological state; §12 forbids identity language
 * ("You are cautious", "You are a verifier") in anything built on top. Every
 * definition here is therefore a verb phrase describing an observable move —
 * `narrow_delivery_scope`, not `is_careful`; `constrain_demand_at_source`, not
 * `has_strong_boundaries`. A tag that could be read as a character trait is a
 * defect, not a shorthand.
 *
 * WHY THE CASE FILES ARE TAG-FREE. `case-1.ts`…`case-5.ts` ship
 * `evidenceTags: []` on every choice deliberately. The choices are
 * `ben_authored` and byte-identical to the canonical source under
 * `docs/trust-forward-compositing-policy.md`; the tags are
 * `deterministic_derivation` (§16 lists "action tags" under that provenance)
 * and are an editorial reading OF that text, not part of it. Keeping them in a
 * separate table means the tag layer can be revised, audited or replaced
 * without a diff ever touching a line of Ben's judgment. The binding is
 * `EVIDENCE_TAGS_BY_CHOICE_ID` below.
 *
 * The compilation was an authoring act and is recorded as one. The RUNTIME
 * behaviour is not: a committed choice id resolves to a fixed list by table
 * lookup, so nothing at run time infers, weighs or scores. That is what makes
 * `deterministic_derivation` honest here.
 *
 * THE TWO ILLUSTRATIVE NAMES THAT DID NOT SURVIVE, AND WHY.
 *
 *  - `parallelize_investigation` has no single referent in the corpus. What
 *    the choices actually contain are two different moves that the one name
 *    would blur: building a clean copy NEXT TO the running system
 *    (`build_clean_version_alongside`, case 2 checkpoint 2 C; case 5
 *    checkpoint 3 A) and running two workstreams CONCURRENTLY
 *    (`split_attention_across_workstreams`, case 2 checkpoints 3 C and 4 C).
 *    Both resonate on their own. Collapsing them would have produced a bigger
 *    number and a less true one.
 *
 *  - `accept_short_term_debt_for_velocity` is narrower than the corpus.
 *    Case 5 checkpoint 1 A is not debt — it is testing in production, an
 *    accepted DEPLOYMENT risk. `accept_known_risk_for_velocity` covers both,
 *    and covers the four checkpoints where the move appears without stretching
 *    the word "debt" past what Ben wrote.
 *
 * SINGLE-CHECKPOINT TAGS ARE KEPT, NOT MERGED. Thirteen of the thirty-six tags
 * are available in exactly one checkpoint, which means they can never satisfy
 * §11's `new Set(supportingCheckpointIds).size >= 2` and can never produce a
 * resonance. They are listed in `SINGLE_CHECKPOINT_TAGS` and they stay. Merging
 * tags until they resonate would be tuning the instrument to make itself look
 * productive, and the whole point of the two-tuning-fork rule (§10) is that the
 * instrument is allowed to stay silent. A tag with one fork is a fact about
 * the corpus — `broaden_verification`, one of the addendum's own examples,
 * exists only in case 1 checkpoint 3 — and reporting that is more useful than
 * hiding it.
 *
 * Two near-neighbours were deliberately NOT merged for the same reason:
 * `transfer_context_through_joint_work` (case 4 checkpoint 2 B) and
 * `prepare_system_for_handoff` (case 5 checkpoint 3 C and D) share a goal —
 * making someone else able to carry the system — but tags name actions, and
 * "generalize it together in a meeting" and "write the documentation and build
 * the environments" are different actions. Merging on shared intent would have
 * manufactured a resonance and would have described motive instead of move.
 *
 * DENOMINATORS. §12 asks for denominator-aware wording ("In 2 of 3 relevant
 * decisions, you chose…") and `YYResonance.relevantCheckpointIds` is the field
 * that carries it. `checkpointIds` on each definition is that denominator: the
 * checkpoints where the tag was AVAILABLE on some choice, whether or not the
 * learner took it. `relevantCheckpointIdsForTag` returns it directly.
 *
 * Pure TypeScript. No React, no JSX, no CSS import — the suite runs as
 * `node --import tsx --test tests/*.test.ts` and cannot load a `.css`
 * specifier.
 */

/* -------------------------------------------------------------------------- */
/* 1. The vocabulary                                                          */
/* -------------------------------------------------------------------------- */

/**
 * One line per tag, in ACTION terms.
 *
 * Read every one of these as the completion of "the learner chose to …". If a
 * definition can be read as "the learner is …", it is wrong and must be
 * rewritten before it ships.
 */
export const EVIDENCE_TAG_DEFINITIONS_TEXT = {
  /* --- Reducing uncertainty ---------------------------------------------- */
  investigate_before_commit:
    "Close a named unknown before making the commitment or change that depends on it.",
  investigate_from_failure_evidence:
    "Enter an unfamiliar system through its recorded failures and work back to the cause.",
  investigate_from_system_structure:
    "Enter an unfamiliar system through its architecture, code or design rather than its failure record.",
  investigate_from_production_data:
    "Enter the problem through the live data itself rather than through the code that produced it.",

  /* --- Checking before and after the change ------------------------------ */
  broaden_verification:
    "Extend checking beyond the surface immediately in question before the change lands.",
  establish_verification_environment:
    "Build the environment the change could be tested in, where none existed.",
  ship_then_verify: "Put the change into production and do the verifying there.",
  build_clean_version_alongside:
    "Construct a clean version next to the running system instead of altering the running system.",

  /* --- Who decides ------------------------------------------------------- */
  seek_authority_alignment:
    "Convene the party that sets direction or priority, and settle it before proceeding.",
  consult_affected_party:
    "Bring the outside party the change lands on into the decision or the checking.",
  request_handover_from_absent_party:
    "Go to the party holding the missing context or artefacts, who is not currently available.",

  /* --- The terms of the work --------------------------------------------- */
  constrain_demand_at_source:
    "Act on the request itself — its timeline or its scope — to bring it inside capacity.",
  accept_requested_pace: "Take the requester's timeline or pace as given and work to it.",
  commit_under_open_ambiguity:
    "Make the commitment while the unknowns bearing on it are still open.",
  rely_on_existing_control:
    "Depend on a mechanism already in place instead of verifying it before depending on it.",
  narrow_delivery_scope:
    "Deliver less than was asked for, keeping the consequential part out of the change.",
  preserve_data_pending_decision:
    "Keep the unhandled input intact while withholding what depends on it.",
  contain_harm_before_diagnosis:
    "Cut off the ongoing damage first and diagnose the cause afterwards.",
  accept_known_risk_for_velocity:
    "Leave a known structural weakness in place in order to keep delivering.",

  /* --- What to do first -------------------------------------------------- */
  prioritize_durable_fix_over_immediate_relief:
    "Order the work so the lasting fix comes before the visible relief.",
  prioritize_by_failure_incidence: "Order the work by where and how often failures actually occur.",
  prioritize_by_business_value: "Order the work by the revenue or business weight behind each item.",
  prioritize_by_coverage_breadth: "Order the work to cover the widest variation first.",
  prioritize_by_structural_difficulty: "Order the work by depth of difficulty, hardest case first.",

  /* --- Where attention goes ---------------------------------------------- */
  continue_current_workstream: "Stay on the work already in progress rather than switching off it.",
  switch_workstream: "Set the current work down and take up the other one.",
  split_attention_across_workstreams: "Run both workstreams concurrently instead of choosing.",
  commit_to_deferred_work: "Schedule the postponed work as next rather than leaving it open.",
  pause_feature_expansion: "Stop adding capability so the underlying work can be done.",

  /* --- Shape of the fix -------------------------------------------------- */
  generalize_the_fix:
    "Build the general mechanism instead of handling the instances one at a time.",
  fix_narrowest_instance_first: "Handle the specific failing case before generalizing anything.",

  /* --- Who executes ------------------------------------------------------ */
  retain_execution: "Keep or reclaim the implementation work personally.",
  transfer_execution: "Put the implementation work, in whole or in part, into another party's hands.",
  transfer_context_through_joint_work:
    "Do the work alongside the other party so the understanding transfers with the task.",
  prepare_system_for_handoff:
    "Document, harden or instrument the system so someone else can take it over.",
  exit_the_engagement: "End the working relationship rather than continue under these conditions."
} as const satisfies Record<string, string>;

export type CompiledEvidenceTag = keyof typeof EVIDENCE_TAG_DEFINITIONS_TEXT;

/** The vocabulary, in the declaration order above. Stable; treat as append-only. */
export const EVIDENCE_TAGS = Object.keys(
  EVIDENCE_TAG_DEFINITIONS_TEXT
) as readonly CompiledEvidenceTag[];

/* -------------------------------------------------------------------------- */
/* 2. The compilation table                                                   */
/* -------------------------------------------------------------------------- */

/**
 * One entry per checkpoint, in canonical order, with the tags carried by each
 * of its four Ben-authored choices.
 *
 * The comment beside each label is an abbreviation of the choice text as it
 * stands in `case-N.ts`, kept only so a reviewer can check a tag against the
 * move without opening a second file. The case files remain authoritative:
 * nothing here is learner-facing, and nothing here may be edited to make a tag
 * fit. If a comment and a case file disagree, the case file is right and the
 * tag is wrong.
 */
interface CheckpointTagging {
  checkpointId: string;
  tags: Record<ChoiceLabel, readonly CompiledEvidenceTag[]>;
}

const CHECKPOINT_TAGGING: readonly CheckpointTagging[] = [
  /* ===== CASE 1 — IT'S JUST A SMALL CHANGE (ACT) ========================= */
  {
    checkpointId: "case-1-checkpoint-1",
    tags: {
      // A. accept and move immediately under ambiguity; client locks the window
      A: ["accept_requested_pace", "commit_under_open_ambiguity"],
      // B. reject the deadline, request a meeting with the external client
      B: ["constrain_demand_at_source", "consult_affected_party"],
      // C. internal meeting to hammer out details before committing
      C: ["investigate_before_commit", "seek_authority_alignment"],
      // D. reject the deadline on precedent grounds, ask for time to investigate
      D: ["constrain_demand_at_source", "investigate_before_commit"]
    }
  },
  {
    checkpointId: "case-1-checkpoint-2",
    tags: {
      // A. trust the permission model, export every column it exposes
      A: ["rely_on_existing_control"],
      // B. trust the permission model but hold back the financial columns
      B: ["rely_on_existing_control", "narrow_delivery_scope"],
      // C. more time to investigate the permission model before exporting anything
      C: ["investigate_before_commit"],
      // D. meeting with the external client about their permissions expectations
      D: ["consult_affected_party"]
    }
  },
  {
    checkpointId: "case-1-checkpoint-3",
    tags: {
      // A. ship to production, run similar tests there, then notify the client
      A: ["ship_then_verify"],
      // B. client tests staging, then ship and both sides test again
      B: ["consult_affected_party", "broaden_verification"],
      // C. meet the external client and test staging together first
      C: ["consult_affected_party", "broaden_verification"],
      // D. test all the other active clients on staging first
      D: ["broaden_verification"]
    }
  },

  /* ===== CASE 2 — THE FAILURES ARE DROPPING (COMMUNICATE / TRIAGE) ======= */
  {
    checkpointId: "case-2-checkpoint-1",
    tags: {
      // A. request documentation from the dev team as a hard prerequisite
      A: ["request_handover_from_absent_party", "constrain_demand_at_source"],
      // B. find the logged payment failures and build the picture from them
      B: ["investigate_from_failure_evidence"],
      // C. study architecture and comments from foundation to payment system
      C: ["investigate_from_system_structure"],
      // D. move customers to manual payments until the error rate drops
      D: ["contain_harm_before_diagnosis"]
    }
  },
  {
    checkpointId: "case-2-checkpoint-2",
    tags: {
      // A. focus on the highest frequency errors
      A: ["prioritize_by_failure_incidence"],
      // B. focus on the deepest complexity errors
      B: ["prioritize_by_structural_difficulty"],
      // C. build a clean parallel pathway and compare it against production
      C: ["build_clean_version_alongside"],
      // D. contact the original dev team, keep learning the system meanwhile
      D: ["request_handover_from_absent_party", "investigate_from_system_structure"]
    }
  },
  {
    checkpointId: "case-2-checkpoint-3",
    tags: {
      // A. keep reducing errors, learn the boundaries in the process
      A: ["continue_current_workstream"],
      // B. pause error reduction for the next highest priority
      B: ["switch_workstream"],
      // C. split attention between error reduction and the next priority
      C: ["split_attention_across_workstreams"],
      // D. call a meeting with the client to discuss in depth
      D: ["seek_authority_alignment"]
    }
  },
  {
    checkpointId: "case-2-checkpoint-4",
    tags: {
      // A. fix the payment issues first, then begin the upgrade
      A: ["continue_current_workstream", "commit_to_deferred_work"],
      // B. pause the payment issues and begin the upgrade
      B: ["switch_workstream", "prioritize_durable_fix_over_immediate_relief"],
      // C. keep fixing and begin the upgrade in parallel
      C: ["split_attention_across_workstreams"],
      // D. fix the payment issues first but postpone the upgrade
      D: ["continue_current_workstream", "accept_known_risk_for_velocity"]
    }
  },

  /* ===== CASE 3 — THE LOGIC IS RIGHT (VERIFY) ============================ */
  {
    checkpointId: "case-3-checkpoint-1",
    tags: {
      // A. study the mobile app code around deep linking
      A: ["investigate_from_system_structure"],
      // B. study the CMS code around deep linking
      B: ["investigate_from_system_structure"],
      // C. study the product catalog directly
      C: ["investigate_from_production_data"],
      // D. read the error logs and walk the logic back to the code
      D: ["investigate_from_failure_evidence"]
    }
  },
  {
    checkpointId: "case-3-checkpoint-2",
    tags: {
      // A. normalization layer holding unknown pairs provisionally, keys to a candidate list
      A: ["generalize_the_fix", "preserve_data_pending_decision"],
      // B. review list; affected products may not use new keys until approved; data kept
      B: ["preserve_data_pending_decision", "narrow_delivery_scope"],
      // C. whitelist the current keys; ingest new ones but do not consume them
      C: ["narrow_delivery_scope", "preserve_data_pending_decision"],
      // D. redesign the ingestion process altogether to retrofit and future proof
      D: ["generalize_the_fix", "prioritize_durable_fix_over_immediate_relief"]
    }
  },
  {
    checkpointId: "case-3-checkpoint-3",
    tags: {
      // A. narrow provider-specific normalization to fix the immediate issue
      A: ["fix_narrowest_instance_first"],
      // B. generalize a system-wide normalization layer for a durable fix
      B: ["generalize_the_fix", "prioritize_durable_fix_over_immediate_relief"],
      // C. narrow client-specific normalization, biggest client first
      C: ["fix_narrowest_instance_first"],
      // D. discuss internally to consensus before touching any code
      D: ["seek_authority_alignment"]
    }
  },
  {
    checkpointId: "case-3-checkpoint-4",
    tags: {
      // A. prioritize the fields from the largest catalog clients
      A: ["prioritize_by_coverage_breadth"],
      // B. prioritize the fields from the highest revenue clients
      B: ["prioritize_by_business_value"],
      // C. prioritize the fields causing specific errors system-wide
      C: ["prioritize_by_failure_incidence"],
      // D. prioritize the long-term fix, leaving the affected catalogs shallow
      D: ["prioritize_durable_fix_over_immediate_relief", "narrow_delivery_scope"]
    }
  },

  /* ===== CASE 4 — THE ONE-OFF BECOMES THE FOUNDATION (DELEGATE) ========== */
  {
    checkpointId: "case-4-checkpoint-1",
    tags: {
      // A. delegate to another developer
      A: ["transfer_execution"],
      // B. systematize the templates myself
      B: ["retain_execution", "generalize_the_fix"],
      // C. meet the team to reduce template scope creep
      C: ["seek_authority_alignment", "constrain_demand_at_source"],
      // D. build a template generator for the team
      D: ["generalize_the_fix", "transfer_execution"]
    }
  },
  {
    checkpointId: "case-4-checkpoint-2",
    tags: {
      // A. take the system back and fix it
      A: ["retain_execution"],
      // B. meet the developer and generalize the system together
      B: ["generalize_the_fix", "transfer_context_through_joint_work"],
      // C. write notes to the developer to fix it themselves
      C: ["transfer_execution"],
      // D. meet the marketing team to discuss further
      D: ["seek_authority_alignment"]
    }
  },
  {
    checkpointId: "case-4-checkpoint-3",
    tags: {
      // A. tell marketing to stay inside the scoped categories; build the rest custom
      A: ["constrain_demand_at_source", "fix_narrowest_instance_first"],
      // B. tell the developer to keep generalizing as taught, focus elsewhere myself
      B: ["transfer_execution", "generalize_the_fix"],
      // C. tell the developer to return to the old method; sprawl, but keeps pace
      C: ["transfer_execution", "fix_narrowest_instance_first", "accept_known_risk_for_velocity"],
      // D. deprioritize other responsibilities and double down on marketing's expansion
      D: ["accept_requested_pace", "switch_workstream"]
    }
  },

  /* ===== CASE 5 — THE HELPER BECOMES THE SYSTEM (TAKE THE WHEEL) ========= */
  {
    checkpointId: "case-5-checkpoint-1",
    tags: {
      // A. speed up to keep pace, developing and testing directly in production
      A: ["accept_requested_pace", "accept_known_risk_for_velocity", "ship_then_verify"],
      // B. push back on the speed and enforce deadlines to set expectations
      B: ["constrain_demand_at_source"],
      // C. meet the client to discuss implications and design a technical roadmap
      C: ["seek_authority_alignment"],
      // D. decline to continue; the scope creep made it a different engagement
      D: ["exit_the_engagement"]
    }
  },
  {
    checkpointId: "case-5-checkpoint-2",
    tags: {
      // A. pause and rebuild the helper into an architecturally correct version
      A: ["pause_feature_expansion", "prioritize_durable_fix_over_immediate_relief"],
      // B. continue building in hybrid fashion
      B: ["continue_current_workstream", "accept_known_risk_for_velocity"],
      // C. ask for another developer to help
      C: ["transfer_execution"],
      // D. meet leadership to brainstorm long-term implications
      D: ["seek_authority_alignment"]
    }
  },
  {
    checkpointId: "case-5-checkpoint-3",
    tags: {
      // A. freeze new features and build the replacement from scratch in parallel
      A: [
        "pause_feature_expansion",
        "build_clean_version_alongside",
        "prioritize_durable_fix_over_immediate_relief"
      ],
      // B. ask the other developers to cover the helper's shortcomings in their processes
      B: ["transfer_execution", "accept_known_risk_for_velocity"],
      // C. build local and staging environments, harden the helper for testing and handoff
      C: ["establish_verification_environment", "prepare_system_for_handoff"],
      // D. document the helper, prepare the handoff, terminate the relationship
      D: ["prepare_system_for_handoff", "exit_the_engagement"]
    }
  }
];

const CHOICE_LABEL_ORDER: readonly ChoiceLabel[] = ["A", "B", "C", "D"];

/* -------------------------------------------------------------------------- */
/* 3. choiceId -> tags                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Canonical choice-id form: `<checkpointId>-<lowercase label>`.
 *
 * Four of the five case files build ids that way; `case-1.ts` currently emits
 * an uppercase suffix (`case-1-checkpoint-1-A`). Rather than encode one file's
 * divergence as data, the record below is keyed canonically and
 * `evidenceTagsForChoiceId` normalises the trailing label segment, so a lookup
 * resolves under either spelling and nothing silently loses its tags if case 1
 * is later brought into line.
 */
export const EVIDENCE_TAGS_BY_CHOICE_ID: Readonly<
  Record<string, readonly CompiledEvidenceTag[]>
> = Object.freeze(
  Object.fromEntries(
    CHECKPOINT_TAGGING.flatMap((checkpoint) =>
      CHOICE_LABEL_ORDER.map(
        (label) =>
          [
            `${checkpoint.checkpointId}-${label.toLowerCase()}`,
            Object.freeze([...checkpoint.tags[label]])
          ] as const
      )
    )
  )
);

const CHOICE_ID_SUFFIX = /-([A-Da-d])$/;

/**
 * Tags for a committed choice, or `undefined` when the id is not one of the
 * sixty-eight canonical choices.
 *
 * The distinction matters: every canonical choice carries at least one tag, so
 * `undefined` always means "unknown id" and never "no tags". A caller that
 * collapses the two would turn a typo into a silently untagged decision.
 */
export function evidenceTagsForChoiceId(
  choiceId: string
): readonly CompiledEvidenceTag[] | undefined {
  const direct = EVIDENCE_TAGS_BY_CHOICE_ID[choiceId];
  if (direct) return direct;
  const normalized = choiceId.replace(CHOICE_ID_SUFFIX, (_match, label: string) =>
    `-${label.toLowerCase()}`
  );
  return EVIDENCE_TAGS_BY_CHOICE_ID[normalized];
}

/* -------------------------------------------------------------------------- */
/* 4. tag -> definition, choices, checkpoints                                 */
/* -------------------------------------------------------------------------- */

export interface EvidenceTagDefinition {
  tag: EvidenceTag;
  /** One line, in ACTION terms. Never identity, motive, virtue or competence. */
  definition: string;
  /** Canonical choice ids carrying this tag, in case/checkpoint/label order. */
  choiceIds: readonly string[];
  /**
   * Distinct checkpoints in which this tag is AVAILABLE on some choice.
   *
   * This is the §12 denominator ("in 2 of 3 relevant decisions"), not a count
   * of anything the learner did. It is also the ceiling on the tag's evidence:
   * a resonance needs `RESONANCE_THRESHOLD` distinct supporting checkpoints
   * (§11), so a tag whose availability is one checkpoint can never reach it.
   */
  checkpointIds: readonly string[];
  /**
   * Whether the corpus could ever support a resonance on this tag. `false` is
   * a property of the instrument, not a defect: see the header. Nothing is
   * merged to flip it.
   */
  resonanceCapable: boolean;
}

function buildDefinitions(): readonly EvidenceTagDefinition[] {
  const choiceIds = new Map<CompiledEvidenceTag, string[]>();
  const checkpointIds = new Map<CompiledEvidenceTag, string[]>();

  for (const checkpoint of CHECKPOINT_TAGGING) {
    for (const label of CHOICE_LABEL_ORDER) {
      const choiceId = `${checkpoint.checkpointId}-${label.toLowerCase()}`;
      for (const tag of checkpoint.tags[label]) {
        const choices = choiceIds.get(tag) ?? [];
        choices.push(choiceId);
        choiceIds.set(tag, choices);

        const checkpoints = checkpointIds.get(tag) ?? [];
        if (!checkpoints.includes(checkpoint.checkpointId)) {
          checkpoints.push(checkpoint.checkpointId);
        }
        checkpointIds.set(tag, checkpoints);
      }
    }
  }

  return Object.freeze(
    EVIDENCE_TAGS.map((tag) => {
      const supportingCheckpoints = checkpointIds.get(tag) ?? [];
      return Object.freeze({
        tag,
        definition: EVIDENCE_TAG_DEFINITIONS_TEXT[tag],
        choiceIds: Object.freeze(choiceIds.get(tag) ?? []),
        checkpointIds: Object.freeze(supportingCheckpoints),
        resonanceCapable: supportingCheckpoints.length >= RESONANCE_THRESHOLD
      });
    })
  );
}

export const EVIDENCE_TAG_DEFINITIONS: readonly EvidenceTagDefinition[] = buildDefinitions();

export const EVIDENCE_TAG_INDEX: Readonly<Record<string, EvidenceTagDefinition>> = Object.freeze(
  Object.fromEntries(EVIDENCE_TAG_DEFINITIONS.map((definition) => [definition.tag, definition]))
);

/**
 * The §12 denominator for a tag: every checkpoint where the learner could have
 * taken this action. Empty for an unknown tag.
 */
export function relevantCheckpointIdsForTag(tag: EvidenceTag): readonly string[] {
  return EVIDENCE_TAG_INDEX[tag]?.checkpointIds ?? [];
}

/* -------------------------------------------------------------------------- */
/* 5. What the instrument can and cannot hear                                 */
/* -------------------------------------------------------------------------- */

/** Tags available in `RESONANCE_THRESHOLD` or more distinct checkpoints. */
export const RESONANCE_CAPABLE_TAGS: readonly EvidenceTag[] = Object.freeze(
  EVIDENCE_TAG_DEFINITIONS.filter((definition) => definition.resonanceCapable).map(
    (definition) => definition.tag
  )
);

/**
 * Tags available in exactly one checkpoint. One tuning fork sounds; it does not
 * resonate (§10). These are reported, never merged away.
 */
export const SINGLE_CHECKPOINT_TAGS: readonly EvidenceTag[] = Object.freeze(
  EVIDENCE_TAG_DEFINITIONS.filter((definition) => !definition.resonanceCapable).map(
    (definition) => definition.tag
  )
);

/** Every canonical choice id, in case/checkpoint/label order. Sixty-eight of them. */
export const TAGGED_CHOICE_IDS: readonly string[] = Object.freeze(
  Object.keys(EVIDENCE_TAGS_BY_CHOICE_ID)
);

/** Every canonical checkpoint id, in case order. Seventeen of them. */
export const TAGGED_CHECKPOINT_IDS: readonly string[] = Object.freeze(
  CHECKPOINT_TAGGING.map((checkpoint) => checkpoint.checkpointId)
);
