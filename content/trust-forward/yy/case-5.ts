/**
 * Trust Forward Lite — CASE 5, "THE HELPER BECOMES THE SYSTEM" (TAKE THE WHEEL).
 *
 * Canonical source: `Trust Forward Lite — YY Method Cases 1–5 Implementation
 * Source.md`, §CASE 5 (three checkpoints). Governing addendum:
 * `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md` §12 (Case 5 is three
 * checkpoints), §16 (provenance is architectural), §29 (Codex must not invent
 * Ben historical facts, must not merge THEN and NOW, and must not make Case 5's
 * rebuild choice universal doctrine).
 *
 * WHY THIS FILE IS SPLIT DOWN THE MIDDLE. It implements
 * `docs/trust-forward-compositing-policy.md` — a ruling Ben authorized on
 * 2026-09-08 — which draws exactly one seam through the case:
 *
 *   narrative (CAPTURE / NEXT CAPTURE / ending) -> may be blurred span by span,
 *     so a real client cannot be identified from the setting;
 *   decision layer (choices A–D, Ben THEN, Ben NOW, conditions) -> preserved
 *     character for character.
 *
 * The seam is not a stylistic preference. Ben THEN and Ben NOW are facts about
 * BEN'S JUDGMENT, not about any client: Ben really did choose A, then B, then B;
 * he really would now choose C, then D, then A. Rewriting those would make the
 * product's central claim untrue while protecting nobody, and
 * `tests/trust-forward-yy-content.test.ts` fails the build if any decision-layer
 * field drifts from the source or is marked composite.
 *
 * PROVENANCE IS `ben_authored` THROUGHOUT, NARRATIVE INCLUDED. Ben reviewed and
 * approved each substitution below himself, so the shipped text is his; a
 * composite tag would understate its authority. The guarantee therefore lives in
 * a DIFF instead of a tag: `content/trust-forward/yy/approved-blurs.ts` records
 * the six substitutions approved across all five cases, and the same test fails
 * the build unless Ben's source plus exactly those six equals what ships. A
 * seventh change, anywhere, fails it too.
 *
 * WHAT WAS ACTUALLY SUBSTITUTED HERE — two spans, one class, both inside
 * checkpoint 1's CAPTURE:
 *
 *  1. "I built it mostly bash script based with file caches" ->
 *     "I built it mostly out of lightweight scripting with file caches".
 *  2. "so it would run off a micro server" ->
 *     "so it would run off a very small server".
 *
 * Both are the policy's named-technology class ("PHP", "React Native" -> a
 * capability description). The decision never depended on which shell it was
 * written in or which hosting tier it sat on; it depended on the helper being
 * improvised, cache-backed and cheap enough to run on a tiny box — all of which
 * survives. Nothing else in Case 5 was touched: "the client", "my client", "new
 * external clients", "another opportunity with a different client" and
 * "leadership" are party/role words, which the policy explicitly leaves alone;
 * "a very small helper" and "over a short period of time" carry magnitude
 * without a fingerprint. No number, name, place or date was introduced — a
 * substitution that adds specificity is not a blur.
 *
 * AN EARLIER PASS WENT FURTHER AND WAS REVERTED, and the correction is recorded
 * here so it is not repeated. That pass composited whole blocks and tagged them
 * `ben_authored_composite`, and this header claimed a second Case 5
 * substitution — "bash/file-cache helper" -> "scripted file-cache helper" — in
 * a conceptual-evolution line that no field of this file carries (see CAPTURE
 * BOUNDARIES below), and misquoted the first as "file-based caches". All five
 * narratives were restored verbatim from Ben's source and only the six approved
 * spans reapplied. Blurring QUANTITIES was dropped outright, for a reason that
 * generalises: the same figures survive verbatim in the preserved decision
 * layer — Case 1's options still read "24-48 hour" and "(export 55 columns)" —
 * so blurring the narrative around a number protects nothing and buys a
 * self-contradiction between story and option. A number that lives in the
 * decision layer cannot be hidden by editing the prose next to it.
 *
 * CAPTURE BOUNDARIES. Each `capture` is the narrative that PRECEDES its
 * checkpoint and nothing after it: checkpoint 1 gets the opening CAPTURE,
 * checkpoints 2 and 3 get the NEXT CAPTURE that runs before them. The ending —
 * the handoff, the developer who could not carry it, the vow — is held out of
 * every CAPTURE because it is the outcome, and an outcome inside CAPTURE turns
 * the learner's judgment into reading comprehension. For the same reason the
 * conceptual-evolution ladder that follows the source's first NEXT CAPTURE
 * ("bash/file-cache helper -> database-backed hybrid -> source-of-truth system")
 * is not carried either: its last rung is checkpoint 3's situation, disclosed
 * two decisions early. That block is also where the source's other "bash"
 * mention sits, and no substitution reaches it: the span is in text this file
 * does not ship. The source's "AI SYNTHESIS — FROM BEN'S REASONING"
 * blocks are likewise NOT carried in any field: §29 forbids silently converting
 * AI synthesis to Ben authorship, and folding one into a `benNow.reasoning`
 * would do exactly that.
 *
 * `conditions` is empty on all three checkpoints because the canonical source
 * supplies no "Conditions around alternatives" block for Case 5 (only Case 1 and
 * Case 2's first checkpoint carry them). An empty array is the honest record;
 * inventing conditional reasoning would be inventing Ben's judgment.
 *
 * `evidenceTags` is empty on every choice by instruction of addendum §9.1: the
 * taxonomy is compiled from all seventeen checkpoints at once, because a
 * taxonomy invented per-case would quietly reshape the cases to fit it.
 *
 * Pure TypeScript, learner-facing prose only. No React, no JSX, no CSS import —
 * the suite runs as `node --import tsx --test tests/*.test.ts`.
 */

import type { YYCase } from "@/lib/trust-forward/yy/types";

const CASE_ID = "case-5";

export const case5: YYCase = {
  id: CASE_ID,
  ordinal: 5,
  title: "THE HELPER BECOMES THE SYSTEM",
  role: "TAKE THE WHEEL",
  emphasis:
    "A system can outgrow the assumptions under which its original judgment was made.\n\n" +
    "TIMESTAMP is especially important here because the historical judgment was understandable in context but became dangerous when the context changed.",

  checkpoints: [
    /* ---------------------------------------------------------------------- */
    /* Checkpoint 1 — accept the pace, or govern it first                     */
    /* ---------------------------------------------------------------------- */
    {
      id: `${CASE_ID}-checkpoint-1`,
      caseId: CASE_ID,
      ordinal: 1,

      // Both of Case 5's approved substitutions live in this block: "I built it
      // mostly bash script based with file caches" -> "I built it mostly out of
      // lightweight scripting with file caches", and "so it would run off a
      // micro server" -> "so it would run off a very small server". Everything
      // else is the source sentence for sentence.
      capture:
        "I was hired to build a very small helper to assist a vendor-supplied " +
        "CMS. I built it mostly out of lightweight scripting with file caches so " +
        "it would run off a very small server, as the client was still in early " +
        "stages. Over a short period of time, their requests came faster and " +
        "faster, and I realized that this little helper would have to morph into " +
        "something much more robust. However, the client was moving so fast on " +
        "onboarding new external clients and generating new revenue that I needed " +
        "to move quickly to keep up with their pace.",
      captureProvenance: "ben_authored",

      choices: [
        {
          id: `${CASE_ID}-checkpoint-1-a`,
          label: "A",
          text: "Speed up to keep pace, including developing and testing changes directly in production instead of running them through local and staging first.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: `${CASE_ID}-checkpoint-1-b`,
          label: "B",
          text: "Push back on the speed and enforce deadlines to set expectations.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: `${CASE_ID}-checkpoint-1-c`,
          label: "C",
          text: "Meet with the client to discuss the implications and design a technical roadmap.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: `${CASE_ID}-checkpoint-1-d`,
          label: "D",
          text: "Decline to continue working on the project because the scope creep caused a materially different long-term situation.",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],

      benThen: {
        choiceLabel: "A",
        reasoning:
          "Ben knowingly accepted deployment risk because he could not otherwise keep pace with the client's expansion.\n\n" +
          "The choice was not technically safe.",
        provenance: "ben_authored"
      },
      benNow: {
        choiceLabel: "C",
        reasoning:
          "With AI, Ben would establish the roadmap and authority boundary first, then use AI-assisted implementation speed.",
        provenance: "ben_authored"
      },

      conditions: []
    },

    /* ---------------------------------------------------------------------- */
    /* Checkpoint 2 — the helper starts being asked to be authoritative       */
    /* ---------------------------------------------------------------------- */
    {
      id: `${CASE_ID}-checkpoint-2`,
      caseId: CASE_ID,
      ordinal: 2,

      // Verbatim — no substitution applies. That is a fact about the source,
      // not an omission: nothing here names a concrete technology, vertical or
      // era. "Database server", "hybrid", "local or staging" and "leadership"
      // are category and role words, which the policy leaves alone.
      capture:
        "The requests became more and more intense, and at one point I determined " +
        "that we had to build a database server and transition into it. The " +
        "system became a hybrid without a local or staging but was very fast to " +
        "deploy and hand-authored well enough for me to triage and repair/extend " +
        "at a rapid pace. But it soon became clear that the leadership wanted my " +
        "system to begin owning the source of truth.",
      captureProvenance: "ben_authored",

      choices: [
        {
          id: `${CASE_ID}-checkpoint-2-a`,
          label: "A",
          text: "Pause and rebuild the helper into an architecturally correct version.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: `${CASE_ID}-checkpoint-2-b`,
          label: "B",
          text: "Continue building in hybrid fashion.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: `${CASE_ID}-checkpoint-2-c`,
          label: "C",
          text: "Ask for another developer to help.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: `${CASE_ID}-checkpoint-2-d`,
          label: "D",
          text: "Meet with leadership to brainstorm long-term implications.",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],

      benThen: {
        choiceLabel: "B",
        reasoning:
          "Ben continued optimizing for revenue velocity without adding substantial immediate cost.",
        provenance: "ben_authored"
      },
      benNow: {
        choiceLabel: "D",
        reasoning:
          "Once the helper is becoming authoritative, the question is no longer purely implementation.\n\n" +
          "Leadership needs to establish what the system is becoming.",
        provenance: "ben_authored"
      },

      conditions: []
    },

    /* ---------------------------------------------------------------------- */
    /* Checkpoint 3 — business-critical, hybrid, and now everyone's dependency */
    /* ---------------------------------------------------------------------- */
    {
      id: `${CASE_ID}-checkpoint-3`,
      caseId: CASE_ID,
      ordinal: 3,

      // Verbatim — again with nothing to substitute: no span names a concrete
      // technology, vertical or era. "The vendor system" and "more developers"
      // are role words.
      capture:
        "Soon thereafter, my helper became the source of truth and the vendor " +
        "system became a downstream secondary store. There was still no local or " +
        "staging build to test. The client continued to expand and more " +
        "developers joined to help build out parallel processes that depended on " +
        "the helper. As it became a bigger operation, the helper became more and " +
        "more business critical in its hybrid state.",
      captureProvenance: "ben_authored",

      choices: [
        {
          id: `${CASE_ID}-checkpoint-3-a`,
          label: "A",
          text: "Freeze new feature development on the helper and build its replacement from scratch in parallel.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: `${CASE_ID}-checkpoint-3-b`,
          label: "B",
          text: "Ask the other developers to build out their processes to begin covering the helper's shortcomings.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: `${CASE_ID}-checkpoint-3-c`,
          label: "C",
          text: "Build out local and staging environments and begin hardening the existing helper for testing and handoff.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: `${CASE_ID}-checkpoint-3-d`,
          label: "D",
          text: "Document the helper and prepare for a handoff and terminate the relationship.",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],

      benThen: {
        choiceLabel: "B",
        reasoning:
          "Ben tried to distribute responsibility because the hybrid system had exceeded what he could personally keep supporting.",
        provenance: "ben_authored"
      },
      benNow: {
        // §29: this must not become universal doctrine. The last two lines are
        // Ben's own fence around the answer and are part of the record.
        choiceLabel: "A",
        reasoning:
          "With AI, Ben would freeze feature expansion and build a parallel replacement because he possessed unusually deep context and could see the target architecture.\n\n" +
          "This is case-specific judgment.\n\n" +
          "It is not doctrine that rewrites are generally preferable.",
        provenance: "ben_authored"
      },

      conditions: []
    }
  ],

  /**
   * The ending carries the outcome that no CAPTURE is allowed to carry, plus the
   * technical record the addendum names as Case 5's technical invariants (§28).
   * Verbatim, and untouched by the six: no span here names a technology,
   * vertical or era. The vow and the AI turn are Ben's own words about his own
   * judgment, which the policy would preserve even if they did.
   */
  ending:
    "Eventually, I was offered another opportunity with a different client that I felt would be a big career move. I documented and prepared the system and handed it off to another developer before leaving. But they were unable to handle the implementation as it stood. The helper caused a great deal of pain for the client and I vowed never to do it that way ever again.\n\n" +
    "When AI entered the picture, I realized I didn't have to make that compromise anymore and I taught myself how to build foundations rapidly based on principles built from judgment over multiple decades. This is the pattern I choose to operate with today.\n\n" +
    "Technical record:\n\n" +
    "- unit tests existed\n" +
    "- documentation existed\n" +
    "- no reproducible local environment\n" +
    "- no staging environment\n" +
    "- production-centered operating process\n" +
    "- growing source-of-truth responsibility\n" +
    "- expanding dependency surface\n" +
    "- excessive dependence on Ben's tacit context remained",
  endingProvenance: "ben_authored"
};

export default case5;
