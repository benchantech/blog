/**
 * The `4a` home / landing copy (plan Phase 10; mockup 4a, dc.html:317-484).
 *
 * ONE MODULE, TWO SURFACES. Artboard `4a` is a single design carrying a 1280px
 * home page and a 390px `/watch-your-step` landing, and Q3 (ratified) makes
 * `/watch-your-step` the canonical owner of the pitch while `/` mounts **the
 * same component bound to the same content object** as an explicit reference.
 * That only holds if there is one definition to reference, so the desktop and
 * phone wordings of the same node live here as VARIANTS of one record rather
 * than as two records: `full` is the 1280 wording, `short` is the 390 one
 * (plan §6.8, "one definition, many presentations").
 *
 * WHAT IS A RECORD AND WHAT IS A LABEL, on the same rule `./copy.ts` uses: a
 * claim gets a canonical record with status, origin and per-variant sources; a
 * control name or a section eyebrow of four or five words gets a pinned label.
 * "Free · No account · No AI required" is a claim about the product and is a
 * record. "The whole path" is a heading and is a label.
 *
 * NOTHING HERE IS TYPED TWICE. The stop count and its prose come from
 * `./weeks.ts` through `./copy.ts` (§6.9), the Lesson Zero control name comes
 * from `content/nav.ts`, the Data page link label and the judgment slot strings
 * come from `wysLabels`, and the ship chip labels come from `shipNav`. This
 * module adds the strings the `4a` artboard is the only source for.
 *
 * PROVENANCE MAPPING, unchanged from `./copy.ts`: text drawn verbatim in an
 * approved artboard is `status: "published"`, `origin: "BEN_APPROVED"` — Ben
 * approved the artboards. The Captain's Stamp is a separate axis and the site
 * still says "Not yet stamped" from `lib/approval-state.ts`.
 *
 * THE ONE EXCEPTION IS THE 18/61/21 SPLIT. It is fabricated illustrative data
 * on a live marketing page, so it is a `draft` / `IMPLEMENTATION_PLACEHOLDER`
 * governed object (handoff README bucket 3) and its caption is a FIELD ON THAT
 * OBJECT rather than a record of its own — §6.5 requires the numbers and the
 * sentence that says what they are to be inseparable, and two objects can be
 * separated. Q11 ships them together or not at all.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";
import { lessonZeroCta, shipNav } from "@/content/nav";
import { wysLabels } from "./copy";

/* -------------------------------------------------------------------------- */
/* 1. Canonical records                                                       */
/* -------------------------------------------------------------------------- */

/** The hero badge (dc.html:327 desktop, :436 phone). Identical on both. */
export const landingBadgeText = {
  id: "landing-hero-badge",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-hero", "artboard-4a-hero-mobile"],
  variantSources: {
    short: ["artboard-4a-hero-mobile"],
    full: ["artboard-4a-hero"]
  },
  variants: {
    short: "Free · No account · No AI required",
    full: "Free · No account · No AI required"
  }
} as const satisfies AnyCanonicalText;

/** The H1 (dc.html:328 desktop, :437 phone). Identical on both. */
export const landingHeadlineText = {
  id: "landing-hero-headline",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-hero", "artboard-4a-hero-mobile"],
  variantSources: {
    short: ["artboard-4a-hero-mobile"],
    full: ["artboard-4a-hero"]
  },
  variants: {
    short: "The AI course that never asks you to trust AI.",
    full: "The AI course that never asks you to trust AI."
  }
} as const satisfies AnyCanonicalText;

/**
 * The hero paragraph. TWO LENGTHS OF ONE CLAIM (dc.html:329 / :438).
 *
 * The phone drops the first clause and ends "It ends." where the desktop ends
 * "Finished in weeks, not forever." Same claim, two presentations, so one
 * record — never two, which is how a marketing page ends up promising two
 * different things about the same course.
 */
export const landingLeadText = {
  id: "landing-hero-lead",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-hero", "artboard-4a-hero-mobile"],
  variantSources: {
    short: ["artboard-4a-hero-mobile"],
    full: ["artboard-4a-hero"]
  },
  variants: {
    short:
      "Learn what an AI actually needs to know before you tell it anything. Taught by a person. Practiced on fiction. It ends.",
    full:
      "Watch Your Step teaches one skill first: knowing what an AI actually needs to know before you tell it anything. Taught by a person. Practiced on fiction. Finished in weeks, not forever."
  }
} as const satisfies AnyCanonicalText;

/**
 * Who teaches the course (dc.html:366 desktop eyebrow, :463 phone title).
 *
 * One node, two presentations again: the desktop band puts it as an eyebrow
 * over Ben's name, the phone pill puts the name in the line itself because the
 * headline below it does not exist at 390.
 */
export const landingInstructorEyebrowText = {
  id: "landing-instructor-eyebrow",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-instructor-band", "artboard-4a-instructor-band-mobile"],
  variantSources: {
    short: ["artboard-4a-instructor-band-mobile"],
    full: ["artboard-4a-instructor-band"]
  },
  variants: {
    short: "Taught by Ben Chan, on the record",
    full: "Taught by one person, on the record"
  }
} as const satisfies AnyCanonicalText;

/**
 * The instructor headline (dc.html:367).
 *
 * Third person, drawn in the approved artboard. It is a statement ABOUT Ben,
 * not prose in Ben's voice, so R10 is satisfied — the same reading `5d`'s
 * Captain's Quarters h1 takes.
 */
export const landingInstructorHeadlineText = {
  id: "landing-instructor-headline",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-instructor-band"],
  variantSources: {
    full: ["artboard-4a-instructor-band"]
  },
  variants: {
    full: "Ben Chan. Violinist, CTO, and someone who wanted a course he'd give his own kids at 13."
  }
} as const satisfies AnyCanonicalText;

/** The instructor paragraph (dc.html:368). Desktop only; the phone has none. */
export const landingInstructorBodyText = {
  id: "landing-instructor-body",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-instructor-band"],
  variantSources: {
    full: ["artboard-4a-instructor-band"]
  },
  variants: {
    full:
      "Every lesson starts with a recording Ben made — unscripted, dated, kept whole. His view comes with its sources attached, and disagreeing with him isn't marked wrong."
  }
} as const satisfies AnyCanonicalText;

/**
 * The path paragraph (dc.html:377).
 *
 * "one Ben recording" is Q10 territory — the count and the recording claim do
 * not add up, Lesson Zero has no recording, and Stop F is off-site. The
 * ratified default is to leave the approved copy as it is until Ben rules, so
 * the sentence ships verbatim and the question stays open in plan §13.
 */
export const landingPathLeadText = {
  id: "landing-path-lead",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-the-path"],
  variantSources: {
    full: ["artboard-4a-the-path"]
  },
  variants: {
    full:
      "Each stop is one Ben recording and a few fictional decisions, at your own pace — 2 to 5 short visits. More time adds depth; it never speeds you through Ben."
  }
} as const satisfies AnyCanonicalText;

/** The four-moves paragraph (dc.html:397). */
export const landingFourMovesLeadText = {
  id: "landing-four-moves-lead",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-four-moves"],
  variantSources: {
    full: ["artboard-4a-four-moves"]
  },
  variants: {
    full:
      "Ten minutes, give or take. Then the course tells you to leave and go practice on your real life — without reporting back."
  }
} as const satisfies AnyCanonicalText;

/** WATCH (dc.html:400). */
export const landingMoveWatchText = {
  id: "landing-move-watch",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-four-moves"],
  variantSources: { full: ["artboard-4a-four-moves"] },
  variants: { full: "One Ben recording, whole, before any explanation." }
} as const satisfies AnyCanonicalText;

/** TRY (dc.html:401). */
export const landingMoveTryText = {
  id: "landing-move-try",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-four-moves"],
  variantSources: { full: ["artboard-4a-four-moves"] },
  variants: { full: "One fictional move: crop, trim, generalize — or don't send at all." }
} as const satisfies AnyCanonicalText;

/** JUDGE (dc.html:402). */
export const landingMoveJudgeText = {
  id: "landing-move-judge",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-four-moves"],
  variantSources: { full: ["artboard-4a-four-moves"] },
  variants: { full: "Commit first. Then Ben's call, and where reasonable people differ." }
} as const satisfies AnyCanonicalText;

/** CARRY (dc.html:403). The ink tile — the only dark one of the four. */
export const landingMoveCarryText = {
  id: "landing-move-carry",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-four-moves"],
  variantSources: { full: ["artboard-4a-four-moves"] },
  variants: { full: "One small thing to do off-site. Nothing to report." }
} as const satisfies AnyCanonicalText;

/**
 * "How the site is run" (dc.html:419).
 *
 * The headline above it is NOT defined here: it is `content/claims.ts`
 * `ai-role-boundaries`.short, "AI can crew the ship. It can't sign the
 * logbook.", which the Crew Manifest and the legal pages also render.
 */
export const landingHowRunBodyText = {
  id: "landing-how-the-site-is-run",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-how-the-site-is-run"],
  variantSources: {
    full: ["artboard-4a-how-the-site-is-run"]
  },
  variants: {
    full:
      "Ben is the captain; AI tools draft, code and research as named crew. The rules, his current position, and every change are public: Standing Orders, Bridge, Ship's Log, Crew Manifest."
  }
} as const satisfies AnyCanonicalText;

export const landingCopyRecords: readonly AnyCanonicalText[] = [
  landingBadgeText,
  landingHeadlineText,
  landingLeadText,
  landingInstructorEyebrowText,
  landingInstructorHeadlineText,
  landingInstructorBodyText,
  landingPathLeadText,
  landingFourMovesLeadText,
  landingMoveWatchText,
  landingMoveTryText,
  landingMoveJudgeText,
  landingMoveCarryText,
  landingHowRunBodyText
];

/* -------------------------------------------------------------------------- */
/* 2. The illustrative answer split (Q11, §6.5)                               */
/* -------------------------------------------------------------------------- */

export interface WysIllustrativeDistribution {
  id: string;
  status: "draft";
  origin: "IMPLEMENTATION_PLACEHOLDER";
  /** The scenario the split belongs to. It is never a free-floating statistic. */
  scenarioId: string;
  slices: readonly { letter: string; percent: number }[];
  /**
   * INSEPARABLE FROM THE NUMBERS (§6.5). It is a field on this object rather
   * than a canonical record of its own precisely so nothing can render one
   * without the other; `DistributionBars` then requires it as a prop with no
   * default, and the gate blocks the caption and the numerals together.
   */
  caption: string;
  sourceIds: readonly string[];
}

/**
 * The 18/61/21 split from the `4a` hero (dc.html:352-357).
 *
 * `draft` / `IMPLEMENTATION_PLACEHOLDER` because the numbers are fabricated:
 * the first-party counter is off (Q12, `WYS_AGGREGATE_ENABLED === false`) and
 * no real totals exist. When it is switched on, the CAPTION IS REPLACED, not
 * removed (§6.5) — there is no state in which the bars stand alone.
 *
 * (packet: Proposition K) is the reason this is not simply "illustrative UI":
 * an outcome shown without evidence is a promise the site has not observed.
 */
export const heroDemoDistribution = {
  id: "dist-hero-client-meeting",
  status: "draft",
  origin: "IMPLEMENTATION_PLACEHOLDER",
  scenarioId: "scn-client-meeting",
  slices: [
    { letter: "A", percent: 18 },
    { letter: "B", percent: 61 },
    { letter: "C", percent: 21 }
  ],
  caption: "Example numbers — live totals appear once the first-party counter is on.",
  sourceIds: ["artboard-4a-hero-demo", "artboard-4a-hero-demo-mobile"]
} as const satisfies WysIllustrativeDistribution;

/** The registry group. One governed object, and it must not escape the checks. */
export const landingGovernedObjects = [heroDemoDistribution] as const;

/* -------------------------------------------------------------------------- */
/* 3. Pinned labels                                                           */
/* -------------------------------------------------------------------------- */

/**
 * The Lesson Zero duration, defined once.
 *
 * It is drawn twice in `4a` — in the hero CTA (dc.html:330) and in the first
 * path cell (dc.html:381) — and a course whose front door promises 5 minutes in
 * one place and something else in the other is a course that has two answers.
 */
const LESSON_ZERO_DURATION = "5 min";

const shipChipLabel = (href: string): string => {
  const item = shipNav.find((entry) => entry.href === href);
  if (!item) throw new Error(`No ship nav item for "${href}".`);
  return item.label;
};

/** The four governance chips (dc.html:421), in the artboard's order. */
export const landingShipChips: readonly { href: string; label: string }[] = [
  "/standing-orders",
  "/bridge",
  "/ships-log",
  "/crew"
].map((href) => ({ href, label: shipChipLabel(href) }));

/**
 * Section headings and control names.
 *
 * THE DATA LINK LABEL IS NOT HERE. `4a` desktop writes "exactly what this site
 * stores about you" (dc.html:414) and `4a` phone writes "See what this site
 * knows about you" (dc.html:474). Q6 pinned the phone's wording as the one
 * link label everywhere, so both breakpoints render `wysLabels.dataPageLinkLabel`
 * and the desktop wording is a Final-copy amendment recorded in
 * docs/facelift-unapproved.md. One node cannot have two names (§6.8).
 *
 * THE SHIP'S LOG CHIP is the same case, already collapsed in `./copy.ts`: the
 * artboard chip reads "Log" and the node is "Ship's Log" everywhere.
 */
export const landingLabels = {
  /** dc.html:330 — the pill, and dc.html:381's first path cell, share it. */
  lessonZeroDuration: LESSON_ZERO_DURATION,
  /** dc.html:330. Composed from the nav CTA so the control has one name. */
  startCta: `${lessonZeroCta.label} · ${LESSON_ZERO_DURATION}`,
  startCtaHref: lessonZeroCta.href,
  /** dc.html:330, the teal text beside the pill. */
  tryOneDesktop: "or try one question →",
  /** dc.html:439, above the phone demo card. */
  tryOneMobile: "Try one question ↓",
  /** dc.html:334 — the desktop demo pill. The phone's is `wysLabels.fictionalPill`. */
  demoPill: "Try one · fictional · nothing about you",
  /** dc.html:334, right of the pill. */
  demoMeta: "Lesson Zero, question 1",
  /** dc.html:358 / :459 — the post-commit continue pill, both breakpoints. */
  continueLabel: "Keep going — Lesson Zero",
  /** dc.html:373. */
  whoIsBen: "Who is Ben →",
  whoIsBenHref: "/ben",
  /** dc.html:376. */
  pathEyebrow: "The whole path",
  /** dc.html:395. */
  fourMovesEyebrow: "Every visit, the same four moves",
  /** dc.html:396. */
  fourMovesHeadline: "Watch. Try. Judge. Carry.",
  /** dc.html:408. */
  antiFeaturesHeadline: "What you won't find here",
  /** dc.html:414, the lead-in before the Data link. */
  whatYouWillFind: "What you will find:",
  /** dc.html:416. */
  howRunEyebrow: "How the site is run",
  /** dc.html:382-390 — the per-cell meta. Composed, never typed whole. */
  visitsSuffix: "visits",
  visitSuffix: "visit"
} as const;

/*
 * NOT DEFINED HERE, deliberately: the `4a` footer note "Designed first for
 * mobile · Not yet stamped" (dc.html:428). `components/SiteFooter.tsx` already
 * renders it on every route, with its second half read from
 * `lib/approval-state.ts` rather than typed. A copy of the first half here
 * would be a second definition of a string the footer owns (Standing Order 07).
 */

export type LandingLabelKey = keyof typeof landingLabels;

/**
 * The struck anti-feature pills.
 *
 * "AI you can trust" is on (WYS §32)'s forbidden-claims list, and this is its
 * ONE approved use: struck through, on the home page, as a thing the site does
 * not offer. It renders nowhere else and it is never rendered unstruck.
 */
export const landingAntiFeatures: readonly string[] = [
  "A chatbot",
  "An account",
  "Your email",
  "A streak",
  "A certificate",
  "A privacy score",
  "Anything to unlock",
  '"AI you can trust"'
];

/** dc.html:472 — the phone's five, in the phone's order. */
export const landingAntiFeaturesMobile: readonly string[] = [
  "Chatbot",
  "Account",
  "Streak",
  "Certificate",
  "Your email"
];

/** The four moves, paired with the record each tile renders (dc.html:399-404). */
export const landingFourMoves = [
  { key: "WATCH", record: landingMoveWatchText },
  { key: "TRY", record: landingMoveTryText },
  { key: "JUDGE", record: landingMoveJudgeText },
  { key: "CARRY", record: landingMoveCarryText }
] as const;

/** Re-exported so a surface never reaches past this module for the link label. */
export const landingDataLinkLabel = wysLabels.dataPageLinkLabel;
export const landingDataHref = "/watch-your-step/data";
