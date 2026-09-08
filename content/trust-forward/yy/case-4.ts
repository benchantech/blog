/**
 * Trust Forward Lite — YY Method case 4, "THE ONE-OFF BECOMES THE FOUNDATION".
 *
 * Transcribed from the canonical case source (`Trust Forward Lite — YY Method
 * Cases 1–5 Implementation Source.md`, lines 915–1060) under the governing
 * addendum (`TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md`).
 *
 * THIS CASE HAS NO SUBSTITUTIONS. Every string below, narrative included, is
 * Ben's source text character for character. That is a fact about the source
 * rather than an omission on the way out: case 4's three CAPTURE blocks name no
 * technology, no framework, no vertical, no employer, no date and no figure.
 * The pressure is carried entirely by shape — "a large number of categories",
 * "drifted into one-off code blocks", "moving too fast for us to keep up" — and
 * shape is not a fingerprint. There was nothing here that could identify a
 * client, so nothing was changed. Case 4 was untouched even by the
 * over-aggressive pass described below.
 *
 * WHERE THE SUBSTITUTION RECORD LIVES. `content/trust-forward/yy/approved-blurs.ts`
 * holds the six spans Ben approved on 2026-09-08, span by span; all six fall in
 * cases 1, 3 and 5. `tests/trust-forward-yy-content.test.ts` asserts that Ben's
 * source plus exactly those six substitutions equals the shipped narrative. For
 * this file that check reduces to identity — no registry entry carries
 * `caseId: "case-4"`, so these narratives are compared against the source with
 * nothing applied, and a single edited word fails the build.
 *
 * WHY AN EARLIER PASS WAS REVERTED, recorded so the mistake is not repeated. It
 * composited far more widely and, among other things, blurred concrete
 * QUANTITIES: `24-48 hours`, `55 columns`, `10%`, `15-20%`. All of it was
 * reverted. The quantity rule collapsed once the decision layer was read
 * alongside it: that layer is preserved exactly and therefore still states the
 * same figures, so case 1's options read "24-48 hour" and "(export 55 columns)"
 * to this day. Blurring the narrative to "roughly fifty columns" while the
 * option beside it says 55 protects nothing and buys a self-contradiction. A
 * number that lives in the decision layer cannot be hidden by editing the story
 * around it. `docs/trust-forward-compositing-policy.md` still records Ben's
 * authorization and the narrative/decision seam, which stand; its quantity row
 * and its per-field tagging scheme are superseded by the registry and the diff
 * test above.
 *
 * WHY EVERY FIELD READS `ben_authored`. Ben reviewed and approved each shipped
 * substitution himself, so the text is his wherever one was made, and the
 * corpus carries `ben_authored` throughout — `ben_authored_composite` is
 * applied nowhere. In this file the question does not even arise: the text was
 * copied, not altered. Tagging copied text as composite would be a false claim
 * in the one field a reader is meant to be able to trust, and the guarantee
 * that replaced the tag is the diff, not a weaker promise.
 *
 * WHY THE DECISION LAYER IS BYTE-IDENTICAL. Choices A–D, Ben THEN, Ben NOW and
 * the conditions are facts about Ben's judgment rather than about any client
 * (policy, "The seam"). `tests/trust-forward-yy-content.test.ts` fails the build
 * if any of them drifts from the source by a character or is ever marked
 * composite. The lowercase, unpunctuated phrasing of the checkpoint-1 options
 * and the trailing periods on checkpoint 2 are the source's, not an
 * inconsistency to tidy.
 *
 * WHY `conditions` IS EMPTY ON ALL THREE CHECKPOINTS. The addendum shows the
 * conditions block "where Ben supplied them" (§ TIMESTAMP). Ben supplied
 * conditions for cases 1 and 2 only; case 4's source carries no "Conditions
 * around alternatives" section at any checkpoint. An empty array is the honest
 * record of that. Writing plausible conditions here would be inventing Ben's
 * conditional reasoning, which §29 forbids outright.
 *
 * WHY `evidenceTags` IS EMPTY ON EVERY CHOICE. §9.1 — the taxonomy is compiled
 * from all seventeen checkpoints at once, after they exist. Tagging case by case
 * would let a tag invented here reshape cases 1–3 and 5 to fit it, which is the
 * exact failure the addendum names.
 *
 * WHAT THE SOURCE CARRIES THAT THIS FILE DOES NOT. Checkpoint 2's `AI
 * SYNTHESIS` line ("Temporary execution ownership does not necessarily mean
 * permanent ownership.") and the ending's `AI SYNTHESIS — FROM BEN'S REASONING`
 * block (technical debt's meaning depending on business value, opportunity cost,
 * system lifetime and actual maintenance burden). Both are real source content
 * with a DIFFERENT provenance — `ai_synthesis_from_ben_reasoning` — and
 * `YYCheckpoint`/`YYCase` define no field to hold it. They are recorded here
 * rather than silently dropped, and they must not be folded into `capture` or
 * `ending`, which would launder synthesis into Ben-authored text.
 *
 * Pure TypeScript. No React, no JSX, no CSS import — the suite runs as
 * `node --import tsx --test tests/*.test.ts` and cannot load a `.css` specifier.
 */

import type { YYCase } from "../../../lib/trust-forward/yy/types";

export const case4: YYCase = {
  id: "case-4",
  ordinal: 4,
  title: "THE ONE-OFF BECOMES THE FOUNDATION",
  role: "DELEGATE",
  emphasis:
    "Ownership follows what becomes load-bearing, not merely what was originally assigned.",

  checkpoints: [
    {
      id: "case-4-checkpoint-1",
      caseId: "case-4",
      ordinal: 1,
      capture:
        "I built a custom checkout for a client who wanted to create landing " +
        "pages for different audiences and products. Their visual templates began " +
        "to transform quickly, as their product spanned a large number of " +
        "categories with unique requirements, and I kept getting pulled into " +
        "meetings and soon became a bottleneck for releasing new landing pages.",
      captureProvenance: "ben_authored",
      choices: [
        {
          id: "case-4-checkpoint-1-a",
          label: "A",
          text: "delegate to another developer",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-4-checkpoint-1-b",
          label: "B",
          text: "systematize the templates myself",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-4-checkpoint-1-c",
          label: "C",
          text: "meet with the team to reduce template scope creep",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-4-checkpoint-1-d",
          label: "D",
          text: "build a template generator for the team",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],
      benThen: {
        choiceLabel: "A",
        reasoning:
          "Ben transferred execution because the work was expanding and the individual implementation requirements appeared delegable.",
        provenance: "ben_authored"
      },
      benNow: {
        choiceLabel: "D",
        reasoning:
          "With AI, Ben would ask how much repeated implementation should require developers at all.",
        provenance: "ben_authored"
      },
      conditions: []
    },

    {
      id: "case-4-checkpoint-2",
      caseId: "case-4",
      ordinal: 2,
      capture:
        "The developer stayed within my initial scope at the beginning. But " +
        "gradually, their system drifted into one-off code blocks that required " +
        "increasing maintenance time and effort, including more frequent meetings " +
        "with the developer and the marketing team to align template designs and " +
        "functionality.",
      captureProvenance: "ben_authored",
      choices: [
        {
          id: "case-4-checkpoint-2-a",
          label: "A",
          text: "take the system back and fix it.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-4-checkpoint-2-b",
          label: "B",
          text: "meet with the developer to generalize the system together.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-4-checkpoint-2-c",
          label: "C",
          text: "write notes to the developer to fix it themselves.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-4-checkpoint-2-d",
          label: "D",
          text: "meet with the marketing team to discuss further.",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],
      benThen: {
        choiceLabel: "B",
        reasoning:
          "Ben wanted the developer to inherit more of the architecture and system patterns through joint work.",
        provenance: "ben_authored"
      },
      benNow: {
        choiceLabel: "A",
        reasoning:
          "With AI, Ben could temporarily reclaim the implementation, harden and clarify it, capture the context, and hand it back.",
        provenance: "ben_authored"
      },
      conditions: []
    },

    {
      id: "case-4-checkpoint-3",
      caseId: "case-4",
      ordinal: 3,
      capture:
        "The system continued to get more complicated beyond what I could " +
        "foresee. This was in part due to the expanding efforts of the marketing " +
        "team into new channels and opportunities. We quickly realized it was " +
        "moving too fast for us to keep up.",
      captureProvenance: "ben_authored",
      choices: [
        {
          id: "case-4-checkpoint-3-a",
          label: "A",
          text: "Tell the marketing team to only use the system for currently scoped categories/channels and build others custom with the developer.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-4-checkpoint-3-b",
          label: "B",
          text: "Tell the developer to continue generalizing the same way I taught them while I continued focusing elsewhere.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-4-checkpoint-3-c",
          label: "C",
          text: "Tell the developer to return to the old method, which creates code sprawl but keeps up with marketing's pace without requiring my time.",
          provenance: "ben_authored",
          evidenceTags: []
        },
        {
          id: "case-4-checkpoint-3-d",
          label: "D",
          text: "Deprioritize other responsibilities and double down with the developer on keeping up with marketing's expansion efforts.",
          provenance: "ben_authored",
          evidenceTags: []
        }
      ],
      benThen: {
        choiceLabel: "C",
        reasoning:
          "Ben knowingly accepted code sprawl because his attention was required elsewhere and the templates still delivered business value.",
        provenance: "ben_authored"
      },
      benNow: {
        choiceLabel: "D",
        reasoning:
          "With AI, Ben would make a larger temporary architectural investment because extracting patterns and transferring context is much cheaper.",
        provenance: "ben_authored"
      },
      conditions: []
    }
  ],

  ending:
    "Marketing was able to continue building out templates with the developer and generate improved revenue. The templates were highly custom, but many were one-off experiments, so much of the technical debt never became long-term maintenance work. Eventually, the custom landing-page and checkout system was retired as e-commerce platforms matured and we chose buy over build.",
  endingProvenance: "ben_authored"
};

export default case4;
