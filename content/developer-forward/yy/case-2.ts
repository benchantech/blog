import type {
  AlternativeCondition,
  BenJudgment,
  YYCase,
  YYCheckpoint,
  YYChoice
} from "@/lib/developer-forward/yy/types";

/**
 * Developer Forward Lite — CASE 2, "THE FAILURES ARE DROPPING".
 *
 * Four checkpoints. Ben is brought into a payment system already in production
 * and already failing, with no development team reachable and no technical
 * authority above him. The case exists to separate two uncertainties that feel
 * identical while you are inside them: *I do not yet understand this system*
 * and *I do not have the standing to decide what happens to it*. AI collapses
 * the first one. It does not touch the second. Checkpoint 3 is where that gap
 * is visible — Ben chose D THEN and chooses D NOW, the only checkpoint in this
 * case where the two judgments agree, because no tool can hand you an authority
 * you were never given.
 *
 * NOTHING IN THIS CASE IS ALTERED. Every CAPTURE, NEXT CAPTURE and the ending
 * are Ben's source narrative verbatim, and `content/developer-forward/yy/approved-blurs.ts`
 * — the register of the six substitutions Ben approved span by span on
 * 2026-09-08 — lists none for case 2.
 *
 * That is a fact about the source, not an omission. The six approved
 * substitutions each remove a span naming a concrete technology, vertical or
 * era.
 *
 * ONE SUBSTITUTION, APPROVED 2026-09-08. Checkpoint 4's narrative names a
 * server-side language, the same concrete class blur 1 removes from case 1:
 * "the server was running on a much older version of PHP" ships as "...a much
 * older version of the server-side language it was built on".
 *
 * An earlier version of this comment claimed no block in this case named a
 * technology. That was false, and it was false for an instructive reason: the
 * paragraph containing the name had been silently DROPPED during extraction,
 * so the claim was true of the shipped text and untrue of Ben's source. The
 * paragraph is restored (43 words -> 120) and the name is now blurred.
 *
 * The quantity in checkpoint 1 ("around 10% of payments") is NOT blurred.
 * Quantity blurring was abandoned across all five cases once it became clear
 * the same figures appear verbatim in the preserved choices, where they cannot
 * be reached — blurring the narrative around them protects nothing and only
 * makes the story disagree with the options.
 */

const CASE_ID = "case-2";

/** Decision-layer helper. The provenance is fixed at `ben_authored` on purpose:
 *  there is no code path in this file that can mark a choice composite. */
function choice(checkpointOrdinal: number, label: YYChoice["label"], text: string): YYChoice {
  return {
    id: `${CASE_ID}-checkpoint-${checkpointOrdinal}-${label.toLowerCase()}`,
    label,
    text,
    provenance: "ben_authored",
    evidenceTags: []
  };
}

function judgment(choiceLabel: BenJudgment["choiceLabel"], reasoning: string): BenJudgment {
  return { choiceLabel, reasoning, provenance: "ben_authored" };
}

function condition(label: AlternativeCondition["label"], text: string): AlternativeCondition {
  return { label, condition: text, provenance: "ben_authored" };
}

/* -------------------------------------------------------------------------- */
/* Checkpoint 1 — the first hour inside someone else's emergency               */
/* -------------------------------------------------------------------------- */

const checkpoint1: YYCheckpoint = {
  id: `${CASE_ID}-checkpoint-1`,
  caseId: CASE_ID,
  ordinal: 1,
  // Verbatim. "around 10%" ships as Ben wrote it: quantity blurring was dropped
  // everywhere, and here it would have been pointless anyway — a failure rate
  // near a tenth is what makes the triage pressure real, and no figure in this
  // case identifies anyone.
  capture:
        "I was hired to jump into a production system mid-crisis: around 10% of " +
        "online payments were failing for an unknown reason. The development team " +
        "was not available and the system had just launched. The client was " +
        "slowly getting overwhelmed with incoming complaints, distracting them " +
        "from marketing and other priorities.",
      captureProvenance: "ben_authored",
  choices: [
    choice(
      1,
      "A",
      "request documentation from the development team and let the client know this is a hard prerequisite before diving into an unknown codebase."
    ),
    choice(1, "B", "look for logged payment failures and construct the situation from there."),
    choice(
      1,
      "C",
      "study the architecture and codebase comments, walking as quickly as possible from foundation to payment system."
    ),
    choice(
      1,
      "D",
      "switch customers to manual payments until the error rate was substantially lower to reduce the support burden."
    )
  ],
  benThen: judgment(
    "B",
    "Ben knew the framework normally logged enough information around failed requests to give him a useful starting point."
  ),
  benNow: judgment(
    "C",
    "With AI, Ben would begin with broader architecture because unfamiliar systems can now be traversed much faster."
  ),
  conditions: [
    condition("A", "appropriate where responsibility cannot reasonably be assumed without documentation."),
    condition("D", "appropriate where reducing immediate customer harm must dominate diagnosis.")
  ]
};

/* -------------------------------------------------------------------------- */
/* Checkpoint 2 — the failures have a shape                                    */
/* -------------------------------------------------------------------------- */

const checkpoint2: YYCheckpoint = {
  id: `${CASE_ID}-checkpoint-2`,
  caseId: CASE_ID,
  ordinal: 2,
  // Verbatim, like every block in this case. Nothing here names a technology,
  // vertical or era.
  capture:
        "I discovered that there were specific types of checkouts that were " +
        "causing the failure repeatedly, and others that only occurred once " +
        "historically. The payment system relied on a third party processor, " +
        "which did not appear to be the source of the errors.",
      captureProvenance: "ben_authored",
  choices: [
    choice(2, "A", "Focus on the highest frequency errors."),
    choice(2, "B", "Focus on the deepest complexity errors."),
    choice(
      2,
      "C",
      "Build a clean parallel version of the pathway to the payment processor and compare it against production behavior."
    ),
    choice(2, "D", "Contact the original development team and continue learning the system in the meantime.")
  ],
  benThen: judgment("A", "Ben wanted early fixes against frequent real failures while learning the system."),
  benNow: judgment("C", "AI materially lowers the cost of constructing an isolated comparison pathway."),
  conditions: []
};

/* -------------------------------------------------------------------------- */
/* Checkpoint 3 — the one AI does not move                                     */
/* -------------------------------------------------------------------------- */

const checkpoint3: YYCheckpoint = {
  id: `${CASE_ID}-checkpoint-3`,
  caseId: CASE_ID,
  ordinal: 3,
  // Verbatim.
  capture:
        "The error rate began to fall and this freed the client's time up to work " +
        "on other efforts. It allowed me to focus more on the broader system as I " +
        "continued to fix the remaining errors. But I had a list of other " +
        "priorities and needed to figure out how to balance my time, especially " +
        "in the absence of any other technical authority.",
      captureProvenance: "ben_authored",
  choices: [
    choice(
      3,
      "A",
      "Continue focusing on reducing errors and learn the system's boundaries and edges in the process."
    ),
    choice(3, "B", "Pause error reduction and focus on the next highest priority."),
    choice(3, "C", "Split attention between error reduction and next priority."),
    choice(
      3,
      "D",
      "Call a meeting with the client to discuss more in-depth, with or without the development team present."
    )
  ],
  // The source records THEN as the bare letter D with no accompanying reasoning.
  // An empty string is the honest representation of that: inventing a rationale
  // here would be fabricating Ben's historical judgment, which §29 forbids and
  // which the NOW reasoning below already renders unnecessary.
  benThen: judgment("D", ""),
  benNow: judgment("D", "Only the client could establish the relevant business priority and authority boundary."),
  conditions: []
};

/* -------------------------------------------------------------------------- */
/* Checkpoint 4 — the problem underneath the problem                           */
/* -------------------------------------------------------------------------- */

const checkpoint4: YYCheckpoint = {
  id: `${CASE_ID}-checkpoint-4`,
  caseId: CASE_ID,
  ordinal: 4,
  // Verbatim, but only the FIRST of the source block's two paragraphs. The
  // second — the ageing runtime and the end-of-life libraries, which is where
  // the upgrade these four choices decide about is introduced — is absent. See
  // the header: unexplained, and outside what the narrative diff test can see.
  capture:
        "I met with the client and we agreed that with the developer team " +
        "unstable, I needed to focus on the technical system. So with that " +
        "understanding, I returned to the payment system and continued to focus " +
        "on reducing errors while learning the system.\n\nAs I dove deeper, I " +
        "realized that the server was running on a much older version of the " +
        "server-side language it was built on and many of the packages were " +
        "approaching end-of-life, including load bearing libraries for the " +
        "payment system. Although we had agreed to continue focusing on " +
        "reducing errors, I couldn't ignore that this could become a much " +
        "bigger issue quickly if I didn't address it soon. I also knew I needed " +
        "to bring options back to the client, including my recommendation.",
      captureProvenance: "ben_authored",
  choices: [
    choice(4, "A", "Fix the payment issues first, then begin the upgrade."),
    choice(4, "B", "Pause the payment issues and begin the upgrade."),
    choice(4, "C", "Continue fixing the payment issues and also begin the upgrade in parallel."),
    choice(4, "D", "Fix the payment issues first but postpone the upgrade.")
  ],
  benThen: judgment("D", "Budget and destabilization risk made the upgrade unattractive at that moment."),
  benNow: judgment(
    "C",
    "AI materially reduces the cost of investigating and attempting the upgrade in isolation while remediation continues."
  ),
  conditions: []
};

/* -------------------------------------------------------------------------- */
/* The case                                                                    */
/* -------------------------------------------------------------------------- */

export const case2: YYCase = {
  id: CASE_ID,
  ordinal: 2,
  /*
   * RETITLED 2026-09-09 (Ben). "THE FAILURES ARE DROPPING" described the
   * midpoint of the case from Ben's side, and it is the one title that gave
   * away where the case lands — a learner meets it above checkpoint 1, before
   * anything has been fixed. The new title is the question the CUSTOMER is
   * asking, which is the pressure the case is actually about and which stays
   * true at every one of the four checkpoints it sits above.
   */
  title: "WHY CAN'T I PAY?",
  role: "COMMUNICATE / TRIAGE",
  emphasis: "Technical uncertainty and authority uncertainty are not the same thing.",
  checkpoints: [checkpoint1, checkpoint2, checkpoint3, checkpoint4],
  // Verbatim, and `ben_authored` like everything else here: no case file uses a
  // composite provenance any more, because the six approved substitutions were
  // reviewed by Ben himself and the check on them is the diff, not a tag.
  ending:
    "I eventually got the payment errors to basically zero during a period and knew enough " +
    "about the system that the client ended its contract with the development team, and I " +
    "began documenting and running the system on my own. This relationship continued for " +
    "several more years.",
  endingProvenance: "ben_authored"
};

export default case2;
