/**
 * The legal / disclosure refresh (plan Phase 11, §8b).
 *
 * `content/claims.ts` holds the nine SHARED claims — the ones that appear on
 * more than one surface, and whose `full` variants the six legal pages render.
 * This module holds the rest: the sentences that belong to exactly one legal
 * page and to nothing else, written last, against frozen code, as §8b.1
 * requires ("Write legal copy last… Writing it earlier is how a page ends up
 * claiming more privacy than the implementation delivers").
 *
 * WHY A SECOND MODULE RATHER THAN A TENTH CLAIM. packet: one-definition names
 * NINE canonical components and plan §6.8 quotes the list; `CLAIM_IDS` is that
 * list and `tests/canonical-text.test.ts` asserts its length. A page-specific
 * correction is not a tenth canonical component of the site's claim vocabulary,
 * it is prose about one page — so it lives here, registered in the same
 * governance arrays, rather than inflating a list the packet fixed.
 *
 * PROVENANCE MAPPING, unchanged from `content/claims.ts` and
 * `content/watch-your-step/data.ts`:
 *
 *   - text taken from the governing spec or an approved artboard is
 *     `published` + `BEN_APPROVED`, cited per variant;
 *   - text this build authored is `published` + `AI_SYNTHESIS`, which resolves
 *     to `marked`, so it renders WITH "Drafted during implementation — not
 *     Ben's words" and its draft mark rather than as anyone's position.
 *
 * `published` rather than `draft` is deliberate and is the Phase 8 reasoning
 * applied again: Q21's `RENDER_MARKED_DRAFT` flag exists to stop this build
 * publishing draft BEN doctrine, and a privacy page that withheld its own
 * account of what the site stores would be a worse surface than one that shows
 * it labelled. Every authored sentence here is on the Final-copy escalation
 * list in docs/facelift-unapproved.md.
 *
 * THE RULE EVERY SENTENCE BELOW IS CHECKED AGAINST (§8b.1, WYS §34, plan R8):
 * no claim may exceed implemented fact, and where copy and code disagree the
 * architecture changes, never the copy alone. Each record's comment names the
 * shipped module that makes it true, and `sourceIds` cites it as a `repo-code`
 * reference so the trace is data rather than a habit.
 *
 * NOTHING HERE IS IN BEN'S FIRST PERSON (R10). No forbidden claim appears
 * (§8b.3) — no "no tracking", no "no data collection", no "zero trust", no
 * "total privacy", no "100% anonymous", no "impossible re-identification".
 * These pages say what is stored, what may be sent, on what condition, and what
 * is not built.
 *
 * Pure TypeScript. No JSX, no CSS import (plan Phase 0, Q15).
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";

/* -------------------------------------------------------------------------- */
/* 1. /privacy                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The "Current services" correction.
 *
 * The preserved sentence says the site "does not currently provide user
 * accounts, subscriptions, uploads, or personalized user memory". Three
 * quarters of that is still exactly true; the fourth became false the moment
 * `lib/wys/local-state.ts` shipped, because the course does remember a learner
 * — in that learner's own browser. The preserved sentence is narrowed on the
 * page to server-side memory, which is true and stays true, and this record
 * carries the enlargement rather than restating the whole paragraph.
 *
 * TRUE OF: no route under `app/` collects a free-text field, accepts an upload
 * or authenticates anyone; `lib/db/client.ts` is an unimported stub whose only
 * function throws.
 */
export const privacyCurrentServicesText = {
  id: "legal-privacy-current-services",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["app-privacy-page", "wys-spec-2-2", "code-wys-local-state"],
  variantSources: {
    full: ["app-privacy-page", "wys-spec-2-2"]
  },
  variants: {
    full:
      "Alongside the routing foyer, the site now carries a finite self-serve course and a set of pages describing how the site is run. None of that added an account, a subscription, an upload, a comment box or any other place to type something that reaches a server."
  }
} as const satisfies AnyCanonicalText;

/**
 * There is no server-side learner state. The strongest structural claim on the
 * page, and the one an architecture, not a sentence, has to earn.
 *
 * TRUE OF: `lib/wys/local-state.ts` is the only writer of course state and it
 * writes to `localStorage`; there is no `app/api` directory; every route in the
 * build is prerendered.
 */
export const privacyNoServerStateText = {
  id: "legal-privacy-no-server-state",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-17", "wys-spec-18", "code-wys-local-state"],
  variantSources: {
    full: ["wys-spec-17", "wys-spec-18"]
  },
  variants: {
    full:
      "There is no database behind the course and no login in front of it. A rulebook, a kept choice or a position in the curriculum exists in the browser that made it and nowhere else, which is also why none of it can be restored for you if you clear it."
  }
} as const satisfies AnyCanonicalText;

/**
 * The aggregate endpoint is NOT BUILT — stated outright rather than left as the
 * conditional inside `claims.analytics.full`.
 *
 * TRUE OF: `WYS_AGGREGATE_ENABLED` is `false`
 * (`content/watch-your-step/config.ts`); `AGGREGATE_ENDPOINT` is `null`
 * (`lib/wys/aggregate.ts`); no `app/api/wys/aggregate/route.ts` exists.
 * `tests/wys-telemetry.test.ts` exercises the flag both ways so the refusal is
 * not passing for the wrong reason.
 */
export const aggregateNotBuiltText = {
  id: "legal-aggregate-not-built",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-19", "wys-spec-30", "code-wys-aggregate", "code-wys-config"],
  variantSources: {
    full: ["wys-spec-19", "wys-spec-30"]
  },
  variants: {
    full:
      "The first-party counter that would total up answers to the practice exercises is not built. Its switch is off, it has no address to send to, and there is no route on this site that could receive one, so an answer to a practice question does not leave the browser it was given in."
  }
} as const satisfies AnyCanonicalText;

/**
 * Reconciling "not directed to children under 13" with the 13+ design test,
 * WITHOUT collecting age.
 *
 * (WYS §4): "default design test: suitable for a 13+ learner" and "Do not
 * collect exact age or date of birth just to enforce the design test."
 *
 * TRUE OF: no field anywhere in `app/` asks for an age or a date of birth; the
 * `wys:v1` serializer would drop one, because a caller cannot persist an
 * undeclared key.
 */
export const thirteenPlusText = {
  id: "legal-privacy-thirteen-plus",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-4", "app-privacy-page", "code-wys-local-state"],
  variantSources: {
    full: ["wys-spec-4", "app-privacy-page"]
  },
  variants: {
    full:
      "The course is designed so that a learner of thirteen or older could work through it safely, and the site does not ask anyone for an exact age or a date of birth to enforce that. Asking would mean collecting the sort of detail the course spends nine stops teaching people to hand over only when it changes the task."
  }
} as const satisfies AnyCanonicalText;

/* -------------------------------------------------------------------------- */
/* 2. /cookies                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Browser storage is not a cookie, and this page has to say which is which.
 *
 * The key names themselves are NOT typed into this sentence: /cookies renders
 * them from `lib/wys/browser-keys.ts`, so a third key added in month three
 * appears on the page without anyone editing this string (§7.5).
 *
 * TRUE OF: both keys are written through `localStorage`, which is not sent with
 * a request; `components/GoogleAnalytics.tsx` is the only thing on the site
 * that sets a cookie, and only after consent.
 */
export const cookiesBrowserStorageText = {
  id: "legal-cookies-browser-storage",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["app-cookies-page", "code-wys-browser-keys", "code-wys-local-state"],
  variantSources: {
    full: ["app-cookies-page", "code-wys-browser-keys"]
  },
  variants: {
    full:
      "Two things this site keeps in your browser are not cookies at all. They are local storage entries: your browser holds them, they are not attached to any request, and no server ever sees them. They are named below with what each one holds and whether clearing the course removes it."
  }
} as const satisfies AnyCanonicalText;

/* -------------------------------------------------------------------------- */
/* 3. /terms                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The course, and what its material is and is not.
 *
 * TRUE OF: every scenario in `content/watch-your-step/scenarios.ts` is typed
 * `WysScenario` with a `FICTIONAL_AUTHORED` origin and renders under
 * "Fictional practice scenario — authored for Watch Your Step".
 */
export const termsCourseText = {
  id: "legal-terms-course",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["app-terms-page", "wys-spec-8", "wys-spec-24", "code-wys-scenarios"],
  variantSources: {
    full: ["app-terms-page", "wys-spec-8"]
  },
  variants: {
    full:
      "The site includes Watch Your Step, a finite course about judging what an AI actually needs to know. Its scenarios, documents and artifacts are invented for the course. They are practice material, not descriptions of anyone real and not advice about a situation you are actually in."
  }
} as const satisfies AnyCanonicalText;

/**
 * (WYS §3.5) non-goals, as the disclaimer they already are. Spec wording, so
 * `BEN_APPROVED` — the mapping `content/claims.ts` established in Phase 1 and
 * `content/watch-your-step/artifacts.ts` reused for spec-verbatim copy.
 *
 * TRUE OF: `WYS_DECLARED_KEYS` in `lib/wys/local-state.ts` declares no score,
 * streak, percentage or grade field, so the serializer cannot persist one and
 * "no privacy score, no literacy score and no streak" is a schema fact rather
 * than a promise. The `variantSources` stay spec-only because the WORDING is
 * §3.5's; the code reference is what makes the claim checkable (§8b.1, "one
 * definition and one line of shipped code").
 */
export const termsNonGoalsText = {
  id: "legal-terms-non-goals",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["wys-spec-3-5", "app-terms-page", "code-wys-no-scores"],
  variantSources: {
    full: ["wys-spec-3-5"]
  },
  variants: {
    full:
      "Watch Your Step is not professional privacy-law training, a legal or compliance guarantee, or a promise of de-identification. It is not a chatbot, a companion, a therapist or a confessional surface, and it keeps no privacy score, no literacy score and no streak."
  }
} as const satisfies AnyCanonicalText;

/**
 * The learner-owned rulebook, in (WYS §16)'s own terms. Rendered on /terms and
 * on /copyright — one definition, two presentations (§6.8).
 *
 * TRUE OF: `rulebook[]` is the one declared field in `wys:v1` that holds
 * learner free text; the telemetry property allowlist has no key that could
 * carry it, and `trackWys` refuses an undeclared property outright.
 */
export const rulebookOwnershipText = {
  id: "legal-rulebook-ownership",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["wys-spec-16", "code-wys-rulebook", "code-wys-telemetry"],
  variantSources: {
    full: ["wys-spec-16"]
  },
  variants: {
    full:
      "The rulebook a learner writes in the course belongs to that learner. It is stored locally only, editable, exportable as plain text or JSON, and deletable. It is never labelled as anyone else's doctrine, never sent to analytics, and never rewritten by AI."
  }
} as const satisfies AnyCanonicalText;

/* -------------------------------------------------------------------------- */
/* 4. /copyright                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Ownership of the curriculum, and the honest status of Ben's recordings.
 *
 * TRUE OF: `content/watch-your-step/artifacts.ts` ships an EMPTY bank and
 * `public/` gained no files in this build; every place a recording is expected
 * renders `components/provenance/MediaSlot.tsx`, which has no prose prop and
 * cannot be filled with generated text.
 */
export const copyrightCurriculumText = {
  id: "legal-copyright-curriculum",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["app-copyright-page", "code-wys-artifacts"],
  variantSources: {
    full: ["app-copyright-page", "code-wys-artifacts"]
  },
  variants: {
    full:
      "Course text, invented scenarios, invented documents and the judgment material are owned by Ben Chan Tech LLC or their respective creators, on the same terms as the rest of the site. Recordings and photographs supplied by Ben remain his; none has been supplied yet, and every place one belongs is drawn as an empty labelled outline until it is."
  }
} as const satisfies AnyCanonicalText;

/* -------------------------------------------------------------------------- */
/* 5. /accessibility                                                          */
/* -------------------------------------------------------------------------- */

/**
 * What actually shipped. Measured against `app/globals.css`, not asserted.
 *
 * TRUE OF: `:focus-visible { outline: 3px solid var(--focus); outline-offset:
 * 3px }`; `.skip-link` is the first focusable element in `app/layout.tsx`;
 * `min-height: 44px` on the interactive rules; the `prefers-reduced-motion`
 * block at the foot of the stylesheet, paired with `scroll-behavior: smooth`.
 */
export const accessibilityShippedText = {
  id: "legal-accessibility-shipped",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-27", "app-accessibility-page", "code-globals-css"],
  variantSources: {
    full: ["wys-spec-27", "code-globals-css"]
  },
  variants: {
    full:
      "Focus is drawn as a three-pixel outline set three pixels clear of whatever has it, so it is visible on a control of any colour. The skip link is the first thing keyboard focus reaches on every page. Buttons, links in navigation and course controls are at least forty-four pixels tall. Smooth scrolling and every transition are switched off for anyone whose system asks for reduced motion."
  }
} as const satisfies AnyCanonicalText;

/**
 * The Q23 deviation, published because /accessibility publishes a contrast
 * claim and the deviation is what makes that claim true.
 *
 * TRUE OF: `--accent-text-on-tint: #1A6B7B` in `app/globals.css`, used for text
 * on a tint only; `--accent` `#1F7A8C` is unchanged for fills, bars and the
 * focus ring. The measured table is in docs/facelift-unapproved.md §B1 and is
 * re-measured in full at Phase 12.
 *
 * The ratios are stated as measurements, not as a compliance claim: this build
 * measured the pairs it ships and says what it found (packet 2.13 — no outcome
 * claim without observed evidence).
 */
export const accessibilityContrastText = {
  id: "legal-accessibility-contrast",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-27", "docs-facelift-unapproved", "code-globals-css"],
  variantSources: {
    full: ["wys-spec-27", "docs-facelift-unapproved"]
  },
  variants: {
    full:
      "Text contrast was measured rather than assumed, and two colour pairs in the approved design did not reach the usual 4.5-to-1 ratio for text at ordinary size. Small text on a tinted background therefore ships in a slightly deeper teal, which measures 5.47 to 1, and the label on a disabled button ships in grey rather than white, which measures 3.23 to 1 instead of 1.69. The full measured table is kept with the build notes and will be measured again before launch."
  }
} as const satisfies AnyCanonicalText;

/**
 * Text alternatives and transcripts: the RULE that is enforced, and the honest
 * statement that nothing needing one has shipped yet.
 *
 * (WYS §27): a text alternative for a screenshot scenario "must preserve the
 * relevant decision problem without leaking the answer."
 *
 * TRUE OF: `WysFictionalArtifact.accessibilityText` is non-optional in
 * `content/watch-your-step/types.ts`, the bank in `artifacts.ts` is `[]`, and
 * `MediaSlot` renders a labelled stripe with an `aria-label` rather than an
 * image. Claiming shipped transcripts would exceed implemented fact.
 */
export const accessibilityMediaText = {
  id: "legal-accessibility-media",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-27", "code-wys-artifacts"],
  variantSources: {
    full: ["wys-spec-27", "code-wys-artifacts"]
  },
  variants: {
    full:
      "No photograph, recording or screenshot has shipped on this site yet, so there is no transcript to publish. The place a recording will sit is drawn as a labelled outline that a screen reader announces, and the type behind an invented document cannot be filled in at all without a written alternative that preserves the decision the exercise is asking for without giving away the answer."
  }
} as const satisfies AnyCanonicalText;

/* -------------------------------------------------------------------------- */
/* 6. /ai-disclosure                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The "Current site behavior" correction.
 *
 * The preserved sentence says the public site "currently uses deterministic
 * local routing and static content" and provides no "persistent user memory".
 * The first half is still true — `lib/route-resolver.ts` is untouched and every
 * route prerenders. The second half became false with `wys:v1`, and is narrowed
 * on the page to server-side memory, which is true and stays true.
 */
export const currentSiteBehaviorText = {
  id: "legal-current-site-behavior",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["app-ai-disclosure-page", "wys-spec-17", "code-wys-local-state"],
  variantSources: {
    full: ["app-ai-disclosure-page", "wys-spec-17"]
  },
  variants: {
    full:
      "Routing is still worked out in your browser by a fixed set of rules, and the pages are still built ahead of time rather than generated on request. What changed is that the course keeps its own state in your browser, so it can show you where you left off without a server knowing who you are."
  }
} as const satisfies AnyCanonicalText;

/* -------------------------------------------------------------------------- */
/* Registry                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Every record in this module, in one array.
 *
 * `tests/canonical-text.test.ts` folds this into `canonicalRecords` and
 * `contentObjects`. A module that is not reachable from those two arrays
 * escapes all eight governance checks silently
 * (docs/facelift-build-notes.md §7.5), so adding a record above without adding
 * it here is the one mistake this file can make quietly —
 * `tests/legal-claims.test.ts` fails on it.
 */
export const legalCopyRecords: readonly AnyCanonicalText[] = [
  privacyCurrentServicesText,
  privacyNoServerStateText,
  aggregateNotBuiltText,
  thirteenPlusText,
  cookiesBrowserStorageText,
  termsCourseText,
  termsNonGoalsText,
  rulebookOwnershipText,
  copyrightCurriculumText,
  accessibilityShippedText,
  accessibilityContrastText,
  accessibilityMediaText,
  currentSiteBehaviorText
];
