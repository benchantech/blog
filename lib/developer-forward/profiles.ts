/**
 * Developer Forward Lite — the SHIP profile lookup, and the phrasing guard that
 * travels with it (plan §6.6).
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and Node cannot load
 * a `.css` specifier. No prose is authored here: the 16 bodies come from
 * `@/content/developer-forward/profiles` and the reveal chrome from
 * `@/content/developer-forward/copy`. This module is a lookup and a refusal.
 *
 * SIXTEEN BODIES, KEYED BY THE FOUR BITS. `ShipResult.profileKey` is the key;
 * `ShipResult.code` is the same bits wearing a `SHIP-` prefix. Both are carried
 * so `profileFor` can check them against each other — see the cross-check
 * below. The coarse SHIP reading is not the whole result: the fine-grained
 * statement is the recovered 729-state terminal narrative composed by
 * `./narrative.ts`, and neither substitutes for the other.
 *
 * THE RULE THIS MODULE EXISTS TO ENFORCE. `ROUTING_AND_SCORING.md`:
 *
 *     Never say `You are SHIP-0111.` Use `Your observed developer pattern:
 *     SHIP-0111.` or `We observed this pattern in your answers across five
 *     developer judgment scenarios.`
 *
 * The plan states it twice more — at the reveal step and again in the launch
 * checklist, where a test greps the BUILT output. The distinction is not
 * decorative and it is not tone: "You are SHIP-0111" asserts an identity, and
 * SHIP is eleven answers to five fictional scenarios. `RESULT.disclaimer` in
 * the copy module spends a whole sentence saying SHIP is "not a personality
 * type, diagnosis, validated psychometric measurement, or prediction"; a second
 * -person predicate three lines above it would make that sentence a correction
 * of the page's own headline.
 *
 * So `observedPatternLabel` is the ONLY sanctioned way to put a code in front
 * of a learner in this codebase, it composes the permitted form out of
 * `RESULT.label` rather than restating it, and it checks its own output before
 * returning — a guard that can be bypassed by ignoring it is a comment.
 *
 * "NEW GAME PLUS" IS AN INTERNAL METAPHOR AND MUST NEVER APPEAR. It comes from
 * the internal `SHIP_PROFILES.md` design note ("an internal design metaphor
 * only and must never appear in public UI") and describes how the 16 profile
 * names were conceived. It is on the forbidden list here, next to the identity
 * predicate, because both are caught by the same grep of the built output and
 * both are the kind of thing a component reintroduces in a heading or an
 * aria-label where nobody reads for governance.
 *
 * WHAT IS MISSING FROM CONTENT. The SECOND permitted form — the "We observed
 * this pattern in your answers…" sentence — is learner-facing prose and does
 * not yet exist in `content/developer-forward/copy.ts`. It is not written here:
 * every learner-facing string lives in `content/`, and this module owns none.
 * `TODO_OBSERVED_PATTERN_SENTENCE_MISSING_FROM_CONTENT` below names the gap so
 * it cannot be closed by accident in the wrong file.
 */

import { SHIP_PROFILES, type ShipProfile } from "@/content/developer-forward/profiles";
import { RESULT } from "@/content/developer-forward/copy";
import type { ShipResult } from "@/lib/developer-forward/types";

export type { ShipProfile };

/* -------------------------------------------------------------------------- */
/* 1. The phrasing guard                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The banned second-person predicate, as a prefix rather than a whole sentence
 * so "You are SHIP-0000." and "You are SHIP-1111" are both caught.
 */
export const FORBIDDEN_IDENTITY_PREDICATE = "You are SHIP-";

/** The internal design metaphor. Never public UI, in any casing of the phrase. */
export const FORBIDDEN_INTERNAL_METAPHOR = "New Game Plus";

/**
 * Everything a surface rendering a SHIP result may never contain. Exported as a
 * list so the build-output grep and the unit tests read from one definition
 * instead of two hand-copied string literals.
 */
export const FORBIDDEN_RESULT_PHRASINGS: readonly string[] = [
  FORBIDDEN_IDENTITY_PREDICATE,
  FORBIDDEN_INTERNAL_METAPHOR
];

/**
 * True when a string contains a forbidden phrasing. Case-insensitive: "you are
 * SHIP-0111" inside a sentence is the same claim as at the start of one, and
 * "new game plus" in an aria-label is the same leak as in a heading.
 */
export function containsForbiddenResultPhrasing(text: string): boolean {
  const haystack = text.toLowerCase();
  return FORBIDDEN_RESULT_PHRASINGS.some((phrase) => haystack.includes(phrase.toLowerCase()));
}

/**
 * The permitted form, composed: `Your observed developer pattern: SHIP-0111.`
 *
 * The label half comes from `RESULT.label`; this function contributes the colon,
 * the code and the full stop, which is punctuation rather than prose. It
 * validates its own output so that a future edit to `RESULT.label` cannot turn
 * the one sanctioned constructor into a producer of banned copy.
 */
export function observedPatternLabel(code: string): string {
  const label = `${RESULT.label}: ${code}.`;
  if (containsForbiddenResultPhrasing(label)) {
    throw new Error(`Refused to render a forbidden SHIP phrasing: "${label}".`);
  }
  return label;
}

/**
 * THE GAP, named. ROUTING_AND_SCORING.md permits a second form — the sentence
 * beginning "We observed this pattern in your answers…" — and no content module
 * carries it. It must be added to `RESULT` in
 * `content/developer-forward/copy.ts` (as e.g. `observedPatternSentence`, verbatim
 * from ROUTING_AND_SCORING.md), after which this constant is deleted and a
 * `observedPatternSentence()` reader replaces it. Do not satisfy this TODO by
 * typing the sentence into `lib/`, `app/` or `components/`.
 */
export const TODO_OBSERVED_PATTERN_SENTENCE_MISSING_FROM_CONTENT =
  "content/developer-forward/copy.ts RESULT carries no observed-pattern sentence; " +
  "the second permitted form from ROUTING_AND_SCORING.md must be added there " +
  "before any surface renders it.";

/* -------------------------------------------------------------------------- */
/* 2. The lookup                                                              */
/* -------------------------------------------------------------------------- */

/** The four SHIP bits, "0000" through "1111", in ascending binary order. */
export const SHIP_PROFILE_KEYS: readonly string[] = Array.from({ length: 16 }, (_, i) =>
  i.toString(2).padStart(4, "0")
);

/**
 * The body for a four-bit key. Throws rather than returning `undefined`.
 *
 * A missing key is never a rendering fallback case: all 16 exist and every one
 * of the 729 terminal states resolves to one of them, so an absent key means
 * the reducer produced a bit string it should not have, and the honest response
 * is to fail loudly rather than to render a blank profile.
 */
export function profileForKey(profileKey: string): ShipProfile {
  const profile = SHIP_PROFILES[profileKey];
  if (!profile) {
    throw new Error(`No SHIP profile for key "${profileKey}".`);
  }
  return profile;
}

/**
 * The body for a computed SHIP result, with a cross-check.
 *
 * `ShipResult` carries the bits twice — as `profileKey` and inside `code` — and
 * the content body carries `code` a third time. Comparing them costs nothing
 * and catches the one bug that would otherwise be invisible: a result whose
 * displayed code and whose profile body disagree, which reads as a perfectly
 * plausible page.
 */
export function profileFor(ship: ShipResult): ShipProfile {
  const profile = profileForKey(ship.profileKey);
  if (profile.code !== ship.code) {
    throw new Error(
      `SHIP result code "${ship.code}" does not match profile "${profile.code}" ` +
        `for key "${ship.profileKey}".`
    );
  }
  return profile;
}

/** Every key in `SHIP_PROFILE_KEYS` that the content module does not carry. */
export function missingProfileKeys(): readonly string[] {
  return SHIP_PROFILE_KEYS.filter((key) => !SHIP_PROFILES[key]);
}
