/**
 * Developer Forward Lite — CASE 1, "IT'S JUST A SMALL CHANGE".
 *
 * Transcribed from `Developer Forward Lite — YY Method Cases 1-5 Implementation
 * Source.md` (CASE 1, lines 389-556) under the authorization recorded in
 * `docs/developer-forward-compositing-policy.md` — Ben Chan, 2026-09-08, in
 * session. That record is what makes any change to this text lawful rather
 * than a violation of the governing addendum §29 ("Codex must not invent Ben
 * historical facts"). Nothing here was written by the implementation except
 * the three substituted spans listed below, each of which Ben reviewed and
 * approved individually.
 *
 * PROVENANCE IS `ben_authored` THROUGHOUT, NARRATIVE INCLUDED — AND THE
 * GUARANTEE IS A DIFF, NOT A TAG.
 *
 * Ben's instruction was to "narrowly blur but maintain ben authored", and he is
 * right: he approved each substitution span by span, so the shipped text is
 * his. A `ben_authored_composite` tag would understate its authority. But
 * Ben-authored cannot mean unchecked, so the check moved from the tag to a
 * diff. `content/developer-forward/yy/approved-blurs.ts` records the exact six
 * substitutions across all five cases, and
 * `tests/developer-forward-yy-content.test.ts` asserts that Ben's source plus those
 * substitutions equals what ships, exactly. A seventh change anywhere — a
 * tightened clause, a dropped subordinate, a "tidied" number — fails the build.
 * That is strictly stronger than the tag it replaces: a tag says "something
 * here was changed"; the diff says "precisely this was changed, and nothing
 * else".
 *
 * WHERE THE CUT IS, AND WHY IT IS THERE AND NOWHERE ELSE.
 *
 *   CAPTURE / NEXT CAPTURE narrative -> source plus the approved substitutions
 *   choices A-D, Ben THEN, Ben NOW, conditions -> verbatim, no exceptions
 *
 * The narrative is the only layer that names something a real client could be
 * recognised by: the stack, the vertical, the era, the org position. The
 * decision layer names none of that. It names what Ben chose and why — facts
 * about HIS judgment, not about anyone else's business. Substituting there
 * would buy no confidentiality at all and would make the product's central
 * claim ("Ben really chose C; Ben would now choose A") untrue, so the choices,
 * both judgments and every condition below are byte-identical to the source
 * document, and the test fails the build if any of them is ever marked
 * composite.
 *
 * THE THREE SUBSTITUTED SPANS IN THIS CASE. Before -> after, as they ship, so
 * the edit can be audited against the source rather than taken on trust:
 *
 *  1. CP1 "written about a decade ago in an older version of PHP" -> "written
 *     long ago in an older server-side language". A named technology and a
 *     datable marker in one span. The decision never depended on which
 *     language it was; it depended on the system being old, inherited and
 *     load-bearing, and all three survive.
 *  2. CP1 "we were offering a SaaS platform" -> "we were offering a platform
 *     serving external clients". Vertical. "Serving external clients" is the
 *     load-bearing fact — it is why an export request carries permission risk
 *     at all — and it is what the replacement states outright.
 *  3. CP2 "had been with us since before I joined" -> "had been with us since
 *     before I took it over". "Before I joined" dates Ben against an employer.
 *     "Before I took it over" keeps the only thing the decision needs: he
 *     inherited the system rather than building it.
 *
 * NO QUANTITY IN THIS CASE IS BLURRED, AND THAT IS A CORRECTION.
 *
 * "within the next 24-48 hours", "55 columns of which 15 were financially load
 * bearing" and "the resulting 40-column exports" all ship exactly as Ben wrote
 * them. An earlier pass blurred all three and was reverted, for a reason that
 * only became visible once the decision layer was checked against them: those
 * same figures appear VERBATIM in the preserved choices — CP1's options still
 * read "24-48 hour", CP2's still read "(export 55 columns)" and "(export 40
 * columns)". Blurring the narrative while the choice on the same page states
 * the number protects nothing and buys a self-contradiction, where the story
 * says "roughly fifty" and the option says 55. A number that lives in the
 * decision layer cannot be hidden by editing the narrative around it; the only
 * way to remove it would be to move the seam, which is not authorized.
 *
 * One of that pass's other substitutions is recorded here so the mistake is not
 * repeated: it rendered CP2's "since before I joined" as "since long before I
 * took the system over", which added a magnitude claim ("long") that Ben's
 * source does not make. The shipped span (3) drops it. A blur may be as vague
 * as its source and never more specific, and it may not assert anything the
 * source did not.
 *
 * WHAT WAS DELIBERATELY NOT SUBSTITUTED. Every party word — "this client",
 * "my client", "the external client" — stays exactly as Ben wrote it. They are
 * role words, not identifiers; replacing them buys no protection and costs the
 * reader the thread of who is asking whom for what. "No AI tools available yet"
 * also stays: it dates nothing to a year, and it is the precondition that makes
 * the THEN/NOW gap in all three checkpoints legible. The ending is verbatim —
 * no span in it names a technology, a vertical or an era — and claiming a
 * change that was not made would be as false a provenance as hiding one that
 * was.
 *
 * CAPTURE CONTAINS NO LATER FACT. Each `capture` below is the narrative block
 * that PRECEDES its checkpoint in the source — the "CAPTURE" block for
 * checkpoint 1, the "NEXT CAPTURE" block for checkpoints 2 and 3 — and
 * nothing else. No outcome, no Ben THEN, no Ben NOW, no ranking language.
 * CAPTURE's job is to hold the historical decision boundary open; a later fact
 * leaking backward into it silently converts the learner's judgment into a
 * reading-comprehension answer.
 *
 * `evidenceTags` is an empty array on all twelve choices. Addendum §9.1 is
 * explicit that the taxonomy is compiled from the actual seventeen
 * Ben-authored choices once the case UI is stable, not invented per case — a
 * per-case guess would quietly reshape the cases to fit the tags. Empty is the
 * honest state, and it is not a placeholder for something this file should
 * have known.
 *
 * REFLECT has no field here on purpose: the source's prompt is fixed across
 * every checkpoint, it is not part of the frozen YY record, and the type
 * contract carries no slot for it.
 *
 * ID CONVENTION. `case-1`, `case-1-checkpoint-N`, `case-1-checkpoint-N-L`.
 * Checkpoint and choice ids are globally unique because `YYDecisionRecord`
 * and `YYReceipt` reference them across cases.
 *
 * Pure TypeScript. No React, no JSX, no CSS import — the suite runs as
 * `node --import tsx --test tests/*.test.ts` and cannot load a `.css`
 * specifier.
 */

import type { YYCase } from "@/lib/developer-forward/yy/types";

export const case1: YYCase = {
  id: "case-1",
  ordinal: 1,
  title: "IT'S JUST A SMALL CHANGE",
  role: "ACT — triage before acceleration",
  emphasis:
    "This case tests what the learner does with uncertainty before increasing blast radius.",

  checkpoints: [
    /* ---------------------------------------------------------------- */
    /* Checkpoint 1 — accept the window, or find out what is under it?   */
    /* ---------------------------------------------------------------- */
    {
      id: "case-1-checkpoint-1",
      caseId: "case-1",
      ordinal: 1,
      capture:
        "So this client and I knew each other pretty well. We'd been working " +
        "together for a few years, and they were generally reasonable about " +
        "deadlines I'd set based on the work they needed me to do. At one point, " +
        "we were offering a platform serving external clients, and one of the " +
        "bigger external clients asked us for an export feature. They said they " +
        "needed it within the next 24-48 hours. I had inherited the system which " +
        "was written long ago in an older server-side language. No AI tools " +
        "available yet. I knew there were likely some unexpected landmines " +
        "lurking underneath. But I also knew that the system was live, had been " +
        "running that long with positive revenue, and served active clients.",
      captureProvenance: "ben_authored",

      choices: [
        {
          id: "case-1-checkpoint-1-a",
          label: "A",
          text:
            "accept and move immediately under ambiguity to close the gap, allowing the client to lock in the 24-48 hour request.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-1-checkpoint-1-b",
          label: "B",
          text: "reject the deadline and request a meeting with the external client to discuss.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-1-checkpoint-1-c",
          label: "C",
          text: "ask for an internal meeting to hammer out the details before committing to the deadline.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-1-checkpoint-1-d",
          label: "D",
          text:
            "reject the deadline because 24-48 hours sets a bad precedent for future work and ask for time to investigate first.",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],

      benThen: {
        choiceLabel: "C",
        reasoning:
          "Ben wanted enough internal context to understand what was actually being requested before committing to the external deadline.",
        provenance: "ai_synthesis_from_ben_reasoning"
      },
      benNow: {
        choiceLabel: "A",
        reasoning:
          "With AI, Ben would be more willing to accept the short window initially because the cost of rapidly investigating and closing important ambiguity is much lower.",
        provenance: "ai_synthesis_from_ben_reasoning"
      },

      conditions: [
        {
          label: "A",
          condition:
            "reasonable when the relationship and revenue opportunity justify moving immediately and the unknowns can be bounded quickly.",
          provenance: "ben_authored"
        },
        {
          label: "B",
          condition:
            "reasonable when direct negotiation with the external client is necessary and appropriate.",
          provenance: "ben_authored"
        },
        {
          label: "D",
          condition:
            "reasonable when precedent, boundary-setting, or the cost of investigation makes the requested timeline irresponsible.",
          provenance: "ben_authored"
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    /* Checkpoint 2 — how far does an inherited permission model carry?  */
    /* ---------------------------------------------------------------- */
    {
      id: "case-1-checkpoint-2",
      caseId: "case-1",
      ordinal: 2,
      capture:
        "In the internal meeting, my client explained that this client had been " +
        "with us since before I took it over, and they had a simple org chart. " +
        "The request was for an export of a permission-based system where admins " +
        "could export everything and lower levels were limited to what they could " +
        "see. I read that as a need for the export to respect the same permission " +
        "model already governing what each role could access in the application. " +
        "When I checked, there were 55 columns of which 15 were financially load " +
        "bearing.",
      captureProvenance: "ben_authored",

      choices: [
        {
          id: "case-1-checkpoint-2-a",
          label: "A",
          text:
            "Trust the permissions model and allow the user to export all columns they can see (export 55 columns).",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-1-checkpoint-2-b",
          label: "B",
          text: "Trust the permissions model but exclude financials (export 40 columns).",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-1-checkpoint-2-c",
          label: "C",
          text:
            "Ask for more time to investigate the permissions model before committing to exporting anything.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-1-checkpoint-2-d",
          label: "D",
          text:
            "Ask for a meeting with the external client to discuss whether they had concerns about current permissions behavior.",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],

      benThen: {
        choiceLabel: "B",
        reasoning:
          "Ben trusted the long-running permission model enough to move forward, but treated the financially load-bearing columns as sufficiently consequential to exclude them until they could receive more scrutiny.",
        provenance: "ai_synthesis_from_ben_reasoning"
      },
      benNow: {
        choiceLabel: "C",
        reasoning:
          "With AI, the cost of investigating the authorization model is much lower, so Ben would close that uncertainty before committing to the export behavior.",
        provenance: "ai_synthesis_from_ben_reasoning"
      },

      conditions: [
        {
          label: "A",
          condition:
            "reasonable when the existing authorization layer is highly trusted and incremental risk is acceptable.",
          provenance: "ben_authored"
        },
        {
          label: "D",
          condition:
            "reasonable when the external client has relevant knowledge about intended access behavior.",
          provenance: "ben_authored"
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    /* Checkpoint 3 — representative tests passed. Is that verification? */
    /* ---------------------------------------------------------------- */
    {
      id: "case-1-checkpoint-3",
      caseId: "case-1",
      ordinal: 3,
      capture:
        "I prepared the export feature and tested it on staging using a snapshot " +
        "of the external client's real data. I tested one representative account " +
        "for each user role and verified that the resulting 40-column exports " +
        "matched the expected permissions for those test accounts. I felt " +
        "confident that it was the right implementation based on my tests.",
      captureProvenance: "ben_authored",

      choices: [
        {
          id: "case-1-checkpoint-3-a",
          label: "A",
          text: "ship to production, run similar tests, then notify the client to test.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-1-checkpoint-3-b",
          label: "B",
          text: "ask the client to test staging, then ship and have both sides test again.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-1-checkpoint-3-c",
          label: "C",
          text: "ask for a meeting with the external client to test in staging together first.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-1-checkpoint-3-d",
          label: "D",
          text: "test all of the other active clients on staging first to ensure they're all still stable.",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],

      benThen: {
        choiceLabel: "A",
        reasoning:
          "Ben considered the representative role testing sufficient to move the feature into production and verify it there.",
        provenance: "ai_synthesis_from_ben_reasoning"
      },
      benNow: {
        choiceLabel: "D",
        reasoning:
          "With AI, broader cross-client verification is much cheaper, so Ben would test the wider active-client surface before shipping.",
        provenance: "ai_synthesis_from_ben_reasoning"
      },

      conditions: [
        {
          label: "B",
          condition: "strong when the client is willing and available to participate.",
          provenance: "ben_authored"
        },
        {
          label: "C",
          condition: "strong when direct verification with the external client is appropriate.",
          provenance: "ben_authored"
        }
      ]
    }
  ],

  ending:
    "The external client was grateful that we met the deadline, though they " +
    "were a little disappointed that the financials did not make it in time " +
    "for their next big meeting. But with this trust we were able to test " +
    "staging with them on a few calls and they eventually understood why that " +
    "specific piece had been delayed. After additional testing across all " +
    "clients, we were able to release the full export capability a few weeks " +
    "later.",
  endingProvenance: "ben_authored"
};

export default case1;
