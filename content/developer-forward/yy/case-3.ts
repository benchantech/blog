/**
 * Developer Forward Lite — CASE 3, "THE LOGIC IS RIGHT" (role: VERIFY).
 *
 * Four checkpoints, transcribed from `Developer Forward Lite — YY Method Cases 1–5
 * Implementation Source.md` and governed by
 * `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md`. The addendum fixes the
 * count (§ "Case 3 — VERIFY: 4 checkpoints"), and §29 forbids inventing Ben
 * history, so nothing below is authored by the implementation: every string is
 * Ben's, either byte-identical to the source or changed by one substitution he
 * read and approved himself.
 *
 * THE ONE SUBSTITUTION IN THIS FILE.
 * Checkpoint 1's CAPTURE, and nowhere else in the case:
 *
 *   "a mobile app in React Native"
 *     -> "a mobile app on a cross-platform mobile framework"
 *
 * It is registered in `content/developer-forward/yy/approved-blurs.ts` — read that
 * file's header for the whole decision — as one of exactly six across the five
 * cases, each approved by Ben span by span on 2026-09-08. Checkpoint 1 asks
 * where to look first; that answer does not turn on which framework it was, only
 * on the app being one Ben had not worked in, and a deep-linking failure that
 * reproduces in production but not staging is the same class of problem on any
 * cross-platform stack.
 *
 * WHAT AN EARLIER PASS ALSO CHANGED HERE, AND WHY IT WAS REVERTED.
 * That pass composited the narratives far more aggressively and was reverted
 * whole: all five were restored verbatim from Ben's source, and only the six
 * approved substitutions re-applied. One of its edits was in this file —
 * "roughly 15-20% of the catalog" became "roughly a sixth to a fifth of the
 * catalog". It is gone; checkpoint 1 ships Ben's figure.
 *
 * Two reasons, and both are worth keeping because they generalise. First, that
 * substitution NARROWED its source: a sixth to a fifth is 16.7-20%, tighter than
 * 15-20%, and a blur that increases precision is not a blur. Second, and larger:
 * blurring quantities was dropped everywhere, because the same figures appear
 * verbatim in the decision layer, which is preserved by rule. Case 1's options
 * still read "24-48 hour" and "(export 55 columns)". A number that lives in a
 * choice cannot be hidden by editing the story around it — doing so protects
 * nobody and buys a self-contradiction, where the narrative says "roughly fifty"
 * and the option under it says 55. Here the ratio is also the decision pressure
 * itself: a failure on 15-20% of the catalog that never reproduces in staging is
 * what makes the checkpoint hard.
 *
 * PROVENANCE IS `ben_authored` THROUGHOUT, AND THE GUARANTEE IS A DIFF.
 * There is no `ben_authored_composite` in this file, including on checkpoint 1's
 * CAPTURE. Ben reviewed and approved that substitution himself, so the text is
 * his; a composite tag would understate its authority. The check therefore does
 * not live in a tag: `tests/developer-forward-yy-content.test.ts` takes Ben's source,
 * applies exactly the six registered substitutions, and requires the result to
 * equal what ships. A seventh change anywhere — a tightened clause, a dropped
 * subordinate, a "tidied" number — fails the build. That is stronger than the
 * tag it replaces: a tag says something here changed, the diff says precisely
 * this changed and nothing else. The earlier pass's real damage was never
 * mislabelled provenance; it was prose-tightening that deleted decision pressure
 * while every tag stayed correct.
 *
 * THE SEAM, WHICH DID NOT MOVE.
 * `docs/developer-forward-compositing-policy.md` is a Ben authorization, not an
 * inference, and it cuts along one seam: CAPTURE and NEXT CAPTURE narrative may
 * be blurred so real clients cannot be identified; choices A-D, Ben THEN, Ben NOW
 * and conditions may NOT, because THEN and NOW are facts about BEN'S JUDGMENT
 * rather than about any client. Blurring them would protect no one — it would
 * make the product's central claim (that judgment legitimately changes when the
 * tools change) untrue. The same test fails the build if any decision-layer
 * field is ever marked composite, and separately if any decision-layer string is
 * not present verbatim in the source.
 *
 * Party words ("my client", "external clients", "external provider") are left
 * alone throughout. They are role words, not identifiers: replacing them buys no
 * protection and costs readability.
 *
 * Checkpoints 2-4 have no substitutions at all, which is a fact about the source
 * rather than an omission: those three blocks contain no span naming a concrete
 * technology, vertical or era. Cases 2 and 4 are untouched for the same reason,
 * end to end. Nothing was blurred to make a case look handled.
 *
 * TWO PLACES WHERE THE SOURCE SUPPLIES LESS THAN THE SHAPE ALLOWS, RECORDED
 * RATHER THAN FILLED IN.
 *
 *   - Checkpoint 3's Ben THEN is the bare choice "D" with no reasoning. The
 *     source gives none, so `reasoning` is the empty string. A plausible
 *     sentence here would be an invented Ben historical fact (§29) dressed as
 *     `ben_authored`, and it would pass the diff check, because that check
 *     compares narrative — the decision layer is guarded by verbatim presence in
 *     the source instead, which invented prose fails.
 *   - Case 3 carries no "Conditions around alternatives" blocks at all. §1 of
 *     the source says conditions "are shown where Ben supplied them"; he did
 *     not supply them here, so every `conditions` array is empty. An empty
 *     array is the honest record of that.
 *
 * Checkpoint 3 additionally carries an "AI SYNTHESIS — FROM BEN'S REASONING"
 * note in the source ("AI does not replace the consensus step…"). It is
 * deliberately NOT reproduced below: `YYCheckpoint` has no field for it, and
 * the only fields it could be smuggled into are decision-layer fields that must
 * stay Ben's, verbatim. Folding AI-synthesized prose into Ben NOW would launder
 * its provenance. It belongs to whatever surface owns AI synthesis, not here.
 *
 * `evidenceTags` is empty on all sixteen choices by instruction (addendum
 * §9.1): the taxonomy is compiled from all seventeen checkpoints at once, after
 * the fact. A taxonomy invented per-case would quietly reshape the cases to fit
 * the tags.
 *
 * Pure TypeScript. No React, no JSX, no CSS import — the suite runs as
 * `node --import tsx --test tests/*.test.ts` and cannot load a `.css` specifier.
 */

import type { YYCase } from "../../../lib/developer-forward/yy/types";

const CASE_ID = "case-3";

export const case3: YYCase = {
  id: CASE_ID,
  ordinal: 3,
  /*
   * RETITLED 2026-09-09 (Ben). "THE LOGIC IS RIGHT" was a verdict, and the
   * case is about whether that verdict is enough. "TOO MANY KEYS" names the
   * thing on screen — the metadata keys arriving from the upstream systems —
   * without telling the learner what to conclude about them.
   */
  title: "TOO MANY KEYS",
  role: "VERIFY",
  emphasis: "The burden of proof belongs to the consequence, not the test count.",

  checkpoints: [
    /* ---------------------------------------------------------------------- */
    /* Checkpoint 1 — where to look first                                     */
    /* ---------------------------------------------------------------------- */
    {
      id: "case-3-checkpoint-1",
      caseId: CASE_ID,
      ordinal: 1,
      capture:
        "My client was running a mobile app on a cross-platform mobile framework with products " +
        "imported from external systems and a CMS for admin. I had participated " +
        "in the CMS but not the mobile app until we ran into a critical issue: " +
        "deep-linking wasn't working for a portion of our products. It worked in " +
        "staging tests but didn't work on production for roughly 15-20% of the " +
        "catalog.",
      captureProvenance: "ben_authored",
      choices: [
        {
          id: "case-3-checkpoint-1-a",
          label: "A",
          text: "Study the mobile app code around deep linking.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-3-checkpoint-1-b",
          label: "B",
          text: "Study the CMS code around deep linking.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-3-checkpoint-1-c",
          label: "C",
          text: "Study the product catalog directly.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-3-checkpoint-1-d",
          label: "D",
          text: "Look at the error logs and walk the logic back to the code",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],
      benThen: {
        choiceLabel: "C",
        reasoning:
          "I chose C because I could grab and group the production data for catalog to see patterns without having to review the full CMS or database up front.",
        provenance: "ai_synthesis_from_ben_reasoning"
      },
      benNow: {
        choiceLabel: "D",
        reasoning:
          "I would choose D with AI because it's very good at generating plausible causes while helping eliminate large groups of noise",
        provenance: "ai_synthesis_from_ben_reasoning"
      },
      conditions: []
    },

    /* ---------------------------------------------------------------------- */
    /* Checkpoint 2 — what to do about unbounded ingested keys                */
    /* ---------------------------------------------------------------------- */
    {
      id: "case-3-checkpoint-2",
      caseId: CASE_ID,
      ordinal: 2,
      capture:
        "I quickly realized that catalog metadata was declared in the original " +
        "systems and then imported into our system, but each key was imported " +
        "verbatim. This meant over time that we could ingest thousands of unique " +
        "keys with increasing velocity as we expanded external clients and " +
        "originating systems.",
      captureProvenance: "ben_authored",
      choices: [
        {
          id: "case-3-checkpoint-2-a",
          label: "A",
          text: "Create a normalization layer that preserves unknown key-value pairs under a provisional `_misc` object while adding the keys to a candidate list.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-3-checkpoint-2-b",
          label: "B",
          text: "Add new keys to a review list and prevent affected products from using those keys until approved, while preserving the ingested data.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-3-checkpoint-2-c",
          label: "C",
          text: "Reduce the affected code to a whitelist of current keys and ingest but do not consume new keys.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-3-checkpoint-2-d",
          label: "D",
          text: "Redesign the metadata ingestion process altogether to retrofit and future proof.",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],
      benThen: {
        choiceLabel: "B",
        reasoning:
          "I chose B so that we could observe which systems produced which categories of new keys before making any architectural decisions while preserving the ingested data.",
        provenance: "ai_synthesis_from_ben_reasoning"
      },
      benNow: {
        choiceLabel: "D",
        reasoning:
          "With AI I would choose D because it's something we missed in the original design that could be retrofitted and future proofed at a much lower cost and in reduced timeframe.",
        provenance: "ai_synthesis_from_ben_reasoning"
      },
      conditions: []
    },

    /* ---------------------------------------------------------------------- */
    /* Checkpoint 3 — narrow fix, general fix, or consensus first             */
    /* ---------------------------------------------------------------------- */
    {
      id: "case-3-checkpoint-3",
      caseId: CASE_ID,
      ordinal: 3,
      capture:
        "I discovered that only a small subset of clients were materially " +
        "introducing the metadata key bloat, and they happened to all be using a " +
        "single external provider that the others weren't using. They were a mix " +
        "of active and semi-active, and one of them had a very large catalog.",
      captureProvenance: "ben_authored",
      choices: [
        {
          id: "case-3-checkpoint-3-a",
          label: "A",
          text: "Create a narrow provider-specific normalization layer to fix the immediate issue first.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-3-checkpoint-3-b",
          label: "B",
          text: "Generalize a system-wide normalization layer for a more durable fix.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-3-checkpoint-3-c",
          label: "C",
          text: "Create a narrow client-specific normalization to handle the biggest client first.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-3-checkpoint-3-d",
          label: "D",
          text: "Spend time discussing internally to come to consensus before touching any code",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],
      benThen: {
        choiceLabel: "D",
        // The source supplies the choice and no reasoning. Left empty on
        // purpose; see the header note on §29.
        reasoning: "",
        provenance: "ai_synthesis_from_ben_reasoning"
      },
      benNow: {
        choiceLabel: "D",
        reasoning:
          "D remains the governing authority decision.\n\nWith AI, Ben would also attempt A, B, and C in isolated branches as experiments while consensus continued.",
        provenance: "ai_synthesis_from_ben_reasoning"
      },
      conditions: []
    },

    /* ---------------------------------------------------------------------- */
    /* Checkpoint 4 — what to normalize first                                 */
    /* ---------------------------------------------------------------------- */
    {
      id: "case-3-checkpoint-4",
      caseId: CASE_ID,
      ordinal: 4,
      capture:
        "After consulting the team, we decided to generalize a system-wide " +
        "normalization layer so we could nip the problem in the bud earlier. We " +
        "also created a whitelist of normalized metadata keys that the " +
        "deep-linking logic was allowed to consume, so the non-uniform products " +
        "could still deep link, but only to a less-specific destination than the " +
        "external clients wanted.",
      captureProvenance: "ben_authored",
      choices: [
        {
          id: "case-3-checkpoint-4-a",
          label: "A",
          text: "prioritize the fields from the largest catalog clients",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-3-checkpoint-4-b",
          label: "B",
          text: "prioritize the fields from the highest revenue clients.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-3-checkpoint-4-c",
          label: "C",
          text: "prioritize the fields that were causing specific errors system-wide.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-3-checkpoint-4-d",
          label: "D",
          text: "prioritize the longterm fix leaving the affected catalogs shallow",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],
      benThen: {
        choiceLabel: "B",
        reasoning:
          "I chose to prioritize by business value as those were items that were most visible in the ecosystem that were currently shallow and could benefit the most views.",
        provenance: "ai_synthesis_from_ben_reasoning"
      },
      benNow: {
        choiceLabel: "A",
        reasoning:
          "With AI I would have chosen A because it would cover the most variation up front",
        provenance: "ai_synthesis_from_ben_reasoning"
      },
      conditions: []
    }
  ],

  ending:
    "Although prioritizing the high-value fields improved revenue modestly, it still required us to go back and solve the other issues, which was time-consuming. But it allowed us to reinvest that revenue earlier and continue pushing outward into the broader market with less uncertainty about our system's stability.",
  endingProvenance: "ben_authored"
};
