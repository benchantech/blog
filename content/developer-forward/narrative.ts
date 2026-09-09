/**
 * Developer Forward Lite - the recovered 729-state terminal narratives, shipped as
 * the 18 clauses they are actually built from.
 *
 * THIS MODULE *USES* THE RECOVERED NARRATIVES. IT DOES NOT REGENERATE THEM.
 * The layer-07 ruling is explicit: "Use the recovered 729 deterministic
 * terminal narratives; do not regenerate them"
 * (07_transition-copy-import-telemetry-resolution-2026-09-07/
 * BEN_APPROVED_RULINGS_2026-09-07.md, "Final profile"). Nothing here is newly
 * worded. Every character below was lifted out of the recovered table
 * `04_reviewed-implementation-plan-2026-09-07/recovered/
 * developer_forward_lite_729_profiles_SHIP_recalculated.csv`, column
 * `deterministic_narrative`, and a test asserts byte-exact reproduction of all
 * 729 rows of that CSV from the three constants exported here. If that test
 * ever fails, this file is wrong and the CSV is right.
 *
 * WHY 18 CLAUSES AND NOT A 729-ROW TABLE. The recovered narratives are fully
 * compositional, which was verified against the CSV rather than assumed: each
 * of the 729 rows is exactly
 *
 *     NARRATIVE_PREFIX
 *   + six clauses joined by "; "
 *   + NARRATIVE_SUFFIX
 *
 * with clause i determined solely by (DIMENSIONS[i], that dimension's recovered
 * posture) - six dimensions x three postures = 18 distinct clauses, and no row
 * anywhere in the table contradicts another on any pair. So the whole table is
 * 18 strings plus a join. The CSV is 830,601 bytes and its narrative column
 * alone is 326,835; the clause set below is about a kilobyte. Shipping the
 * table would push a third of a megabyte of prose that no learner will ever
 * read 728/729ths of into the client bundle, to say the same thing.
 *
 * THE ORDER OF THE JOIN IS `DIMENSIONS`, NOT THE KEY ORDER OF AN OBJECT. The
 * composer must walk `DIMENSIONS` from '@/lib/developer-forward/types'. The trust
 * clauses carry a leading "and you " because trust is last in that order and
 * the recovered sentence closes on it; a composer that reordered the clauses
 * would produce a grammatical sentence with "and you" stranded mid-list and
 * would not fail any check other than the byte-exact one.
 *
 * CLAUSES ARE KEYED BY POSTURE, NEVER BY AN OPTION'S A/B/C POSITION. Levels are
 * read from the recovered posture tag. Nine of the 138 tags are deliberately
 * non-monotonic - C2D1 is inverted on promise and trust - so a lookup that went
 * through option position would return the wrong clause on those nine without
 * failing anything obvious.
 *
 * Provenance: `recovered_prior_authoring`. The 729 deterministic terminal
 * summaries are item 3 of Ben's 2026-09-07 SC-TF1 approval
 * (06_full-five-case-authoring-extraction-2026-09-07/
 * SC_TF1_APPROVAL_RECORD_2026-09-07.md). Being compositional does not make the
 * clauses implementation-authored: decomposing recovered text is not writing
 * it, and the tag must not drift to `ben_canonical` merely because the wording
 * now sits in this repository.
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import - the
 * suite runs as `node --import tsx --test tests/*.test.ts` and cannot load a
 * `.css` specifier. All learner-facing prose lives in `content/`, which is why
 * these strings are here and not in the result component that renders them.
 */

import type { Dimension } from "@/lib/developer-forward/types";

/**
 * The provenance tag for every string in this module. Recovered prior
 * authoring, approved for public rendering on 2026-09-07; not Ben-verbatim
 * canon, not implementation-authored.
 */
export const NARRATIVE_PROVENANCE = "recovered_prior_authoring" as const;

/**
 * The opening of every one of the 729 recovered narratives, including its
 * trailing space. Verbatim, including the colon.
 */
export const NARRATIVE_PREFIX =
  "Your fixed choices leaned toward this pattern: ";

/**
 * The close of every one of the 729 recovered narratives, including the leading
 * "." that terminates the six-clause list. The second sentence is the standing
 * declaration that written reflections are never interpreted; it is part of the
 * recovered narrative and is not a separately authored disclaimer.
 */
export const NARRATIVE_SUFFIX =
  ". This summary is assembled only from fixed choices. Written reflections are preserved verbatim but are not interpreted.";

/** The separator between adjacent clauses. Semicolon and one space. */
export const NARRATIVE_CLAUSE_SEPARATOR = "; ";

/**
 * dimension -> posture -> clause.
 *
 * Postures are listed in the ascending order `POSTURES` declares them in
 * (index 0 -> 0.0, 1 -> 0.5, 2 -> 1.0) so this table can be read against the
 * value mapping, but the lookup is by posture NAME, never by index or by an
 * option's position.
 */
export const NARRATIVE_CLAUSES: Record<Dimension, Record<string, string>> = {
  ambiguity: {
    act: "you move quickly from available requirements",
    clarify: "you clarify decision boundaries before committing",
    investigate: "you inspect surrounding context before committing"
  },
  verification: {
    trust: "you use credible evidence efficiently",
    sample: "you verify with targeted checks",
    prove: "you seek stronger proof for consequential work"
  },
  promise: {
    commit: "you make clear commitments",
    qualify: "you qualify commitments when evidence is incomplete",
    renegotiate: "you reopen commitments when the premise changes"
  },
  risk: {
    move: "you favor momentum when failure is recoverable",
    stage: "you use reversible steps and checkpoints",
    protect: "you raise safeguards as consequence rises"
  },
  ownership: {
    transfer: "you allow responsibility to transfer with delegated work",
    share: "you share execution while preserving checkpoints",
    retain: "you retain final accountability across delegation"
  },
  trust: {
    task: "and you center concrete delivery",
    relationship: "and you protect both delivery and stakeholder decision needs",
    stewardship: "and you treat technical work as stewardship of long-term trust"
  }
};
