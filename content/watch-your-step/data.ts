/**
 * The Data page's own content (plan Phase 8; WYS §18, §20; mockup `5c` Data,
 * dc.html:179-207).
 *
 * (WYS §20) — **"This is a curriculum feature, not merely a settings page."**
 * So the governing constraint on every string in this module is narrower than
 * the usual one: it is not enough that a sentence be approved, or well
 * sourced, or in the right voice. **Every sentence has to be true of the code
 * this repo ships**, checked against the implementation rather than against the
 * artboard (WYS §37: "Data Manifest accurately describes what is actually
 * deployed"; "no privacy claim exceeds implemented fact"). Where the two
 * disagree the fix is architecture, never wording (WYS §34, plan R8) — which is
 * why three of the strings below do not exist as strings at all until the state
 * that makes them true exists:
 *
 *   - the aggregate-counter sentence lives in `./config.ts` behind
 *     `aggregateCounterSentence()` and is absent from the DOM while
 *     `WYS_AGGREGATE_ENABLED` is false (SC-12, Q22);
 *   - the approved "coarse counts" sentence lives in `content/claims.ts` as
 *     `analytics.short` and renders only for a browser that granted analytics,
 *     because `trackWys` sends nothing otherwise (SC-2, Q7);
 *   - what a clear leaves behind is named from `lib/wys/browser-keys.ts`, and
 *     card 1's rows are generated from the declared `wys:v1` field set, so a
 *     key or a field added later surfaces without an edit here (§7.5).
 *
 * THE THREE KINDS OF THING, kept apart exactly as `./copy.ts` and
 * `./progress.ts` keep them:
 *
 *  - CANONICAL RECORDS (`dataCopyRecords`) — every claim the page makes.
 *  - PINNED LABELS (`dataLabels`) — headings, control names and the mono key
 *    line. Short strings that are not claims.
 *  - PROVENANCE PAIRS (`confirmationProvenance`) — the `(status, origin)` the
 *    gate needs for prose whose single definition lives in `lib/`.
 *
 * PROVENANCE MAPPING, unchanged from `content/claims.ts` and `./progress.ts`:
 * text taken verbatim from an approved artboard is `status: "published"`,
 * `origin: "BEN_APPROVED"`. **Text this build authored is
 * `origin: "AI_SYNTHESIS"` at `status: "published"`** — which resolves to
 * `marked`, so it renders with "Drafted during implementation — not Ben's
 * words" and its draft mark rather than as Ben-attributed canon. It is
 * `published` rather than `draft` deliberately: Q21's `RENDER_MARKED_DRAFT`
 * flag exists to stop this build publishing draft BEN doctrine, and a Data page
 * that silently withheld its own account of what a clear removes would be worse
 * than one that shows it labelled. Every authored sentence here is on the
 * Final-copy escalation list in docs/facelift-unapproved.md.
 *
 * NOTHING HERE IS IN BEN'S FIRST PERSON (R10), nothing upgrades a hedge into an
 * assertion (packet 3.4), and no forbidden claim appears: the page never says
 * no tracking, no data collection, zero trust, total privacy, 100% anonymous or
 * impossible re-identification (§8b.3). It says what is stored, what is sent,
 * on what condition, and what clearing does not reach.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";
import type { GateableRecord } from "@/lib/wys/content-gate";
import { WYS_DATA_PAGE_ROWS, WYS_STORAGE_KEY, type WysDataPageRow } from "@/lib/wys/local-state";
import { wysLabels } from "./copy";

/* -------------------------------------------------------------------------- */
/* 1. Canonical records — approved artboard copy                              */
/* -------------------------------------------------------------------------- */

/**
 * The line under the title (dc.html:181), verbatim.
 *
 * "Generated from what's actually stored right now" is a claim about the
 * mechanism, not a flourish, and it is the reason card 1's rows derive from
 * `WYS_DATA_PAGE_ROWS` — the declared `wys:v1` field set — rather than from a
 * hand-written list of five (§7.5). A row per declared field is what keeps the
 * sentence true when a field is added.
 */
export const dataManifestIntroText = {
  id: "data-manifest-three-places",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5c-data", "wys-spec-20"],
  variantSources: {
    short: ["artboard-5c-data"],
    full: ["artboard-5c-data"]
  },
  variants: {
    short: "Three places, three different answers. Generated from what's actually stored right now.",
    full: "Three places, three different answers. Generated from what's actually stored right now."
  }
} as const satisfies AnyCanonicalText;

/**
 * Card 3, BEN DOES NOT NEED (dc.html:198), verbatim.
 *
 * Every item is an absence this build can point at: there is no account system,
 * no email field, no name field and no upload anywhere in `app/`; the From
 * Memory scratch box holds one `useState` and is never persisted (WYS §15.1);
 * and the rulebook lives in `wys:v1` with the telemetry property allowlist
 * standing between it and any request (§8.5). The card is `ink` because it is
 * the page's strongest statement, and it is the only one that needs no
 * condition attached.
 */
export const benDoesNotNeedText = {
  id: "data-ben-does-not-need",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5c-data-card-3", "wys-spec-18"],
  variantSources: {
    short: ["artboard-5c-data-card-3"],
    full: ["artboard-5c-data-card-3"]
  },
  variants: {
    short:
      "Your name. An account. Your email. Your situation. Your prompts. Your screenshots. A transcript of your learning. Your From Memory text. Your rulebook.",
    full:
      "Your name. An account. Your email. Your situation. Your prompts. Your screenshots. A transcript of your learning. Your From Memory text. Your rulebook."
  }
} as const satisfies AnyCanonicalText;

/**
 * The clearing footnote (dc.html:207), verbatim and UNCHANGED.
 *
 * Plan Phase 8 asks for the footnote to be "amended to name what survives" and
 * marks the amendment an escalation. It is amended by ADDITION, not by rewrite:
 * this sentence pair is Final copy on an approved artboard, the deletion
 * contract covers preserved copy as well as preserved files, and rewording an
 * approved sentence to insert a clause would delete Ben's words on this build's
 * own authority. So the approved text renders unchanged and
 * `clearingSurvivesText` below carries the addition under its own provenance
 * label, where Ben can see exactly which half is his.
 */
export const clearingFootnoteText = {
  id: "data-clearing-footnote",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5c-data-footnote", "wys-spec-17"],
  variantSources: {
    short: ["artboard-5c-data-footnote"],
    full: ["artboard-5c-data-footnote"]
  },
  variants: {
    short:
      "Clearing removes this browser's copy. It can't erase hosting or analytics logs — and this page won't pretend it did.",
    full:
      "Clearing removes this browser's copy. It can't erase hosting or analytics logs — and this page won't pretend it did."
  }
} as const satisfies AnyCanonicalText;

/* -------------------------------------------------------------------------- */
/* 2. Canonical records — authored by this build, and labelled as such        */
/* -------------------------------------------------------------------------- */

/**
 * The amendment the plan requires: name what survives a clear, and link to
 * /cookies.
 *
 * It is TRUE OF `clearAllWysData()`, which enumerates the store and removes
 * only keys under the `wys:` prefix, leaving `bct_analytics_consent` alone —
 * because silently wiping it would reset a legally-referenced decision and
 * re-prompt the visitor (§7.4).
 *
 * IT DOES NOT PROMISE "you won't be asked again", which is the wording the
 * Phase 8 gate removed. `components/ConsentBanner.tsx` renders whenever NO
 * choice is stored, so for a visitor who has not answered the banner — the
 * visitor whose key row on this very page reads `not set` — "won't ask again"
 * is false, and a page carrying both statements at once contradicts itself.
 * What is true in every state is the narrower claim: a clear does not move
 * that key, so it does not change whether the banner appears. Narrowed, not
 * reworded around (R8).
 *
 * The key itself is NOT typed into this sentence. It is named on screen from
 * `lib/wys/browser-keys.ts` beside its stored value, so a third surviving key
 * would appear without anyone editing this string.
 */
export const clearingSurvivesText = {
  id: "data-clearing-survives",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-17", "wys-spec-20"],
  variantSources: {
    short: ["wys-spec-17"],
    full: ["wys-spec-17"]
  },
  variants: {
    short:
      "Your analytics choice is kept under a separate key that clearing does not touch, so clearing does not change whether this site asks you about cookies.",
    full:
      "Your analytics choice is kept under a separate key that clearing does not touch, so clearing does not change whether this site asks you about cookies."
  }
} as const satisfies AnyCanonicalText;

/**
 * Card 2's opening, and the reason the approved sentence beneath it is
 * conditional.
 *
 * Two mechanisms with two different conditions are running, and the approved
 * artboard sentence names them in one breath ("Page analytics, and coarse
 * counts: …"), which reads as one promise with one condition. It is not:
 *
 *   - ordinary GA4 page analytics are configured in `GoogleAnalytics.tsx` with
 *     `send_page_view: true`, and Consent Mode v2 keeps sending cookieless page
 *     pings while `analytics_storage` is denied;
 *   - Watch Your Step's own events go through `trackWys`, which refuses to send
 *     anything at all unless `bct_analytics_consent === "granted"` (Q7's
 *     ratified full-suppression default, SC-2).
 *
 * So this sentence states the two conditions, and the approved sentence renders
 * only in the state that makes it true.
 */
export const analyticsConditionsText = {
  id: "data-analytics-conditions",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-19", "wys-spec-20", "docs-legal-analytics"],
  variantSources: {
    short: ["wys-spec-19"],
    full: ["wys-spec-19"]
  },
  variants: {
    short:
      "Two different things run here, on two different conditions. Ordinary page analytics run on every page of this site. Watch Your Step's own counts are a closed list, and none of them leaves a browser where analytics were declined or never allowed.",
    full:
      "Two different things run here, on two different conditions. Ordinary page analytics run on every page of this site. Watch Your Step's own counts are a closed list, and none of them leaves a browser where analytics were declined or never allowed."
  }
} as const satisfies AnyCanonicalText;

/**
 * The build with no measurement id configured.
 *
 * `components/GoogleAnalytics.tsx` returns `null` without
 * `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `components/ConsentBanner.tsx` renders
 * nothing, and `trackWys` refuses on `measurementIdIsSet()`. In that build
 * nothing analytics-shaped exists at all, and card 2 must not describe one.
 * The branch is decided at BUILD time from the environment, so the prerendered
 * HTML of a deployment always matches that deployment's own configuration.
 *
 * IT IS SCOPED TO THE ANALYTICS MECHANISM, not to the page. The Phase 8 gate
 * removed "nothing on this page is counted anywhere": requests still reach a
 * host, which is exactly what the infrastructure paragraph two cards below
 * says, so the absolute form contradicted the approved sentence beneath it and
 * sat one paraphrase away from §8b.3's forbidden "no tracking / no data
 * collection". The claim now names the two things this build can check — no
 * script, no counts — and leaves hosting to the paragraph that discloses it.
 */
export const analyticsUnavailableText = {
  id: "data-analytics-unavailable",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-19", "docs-legal-analytics"],
  variantSources: {
    short: ["wys-spec-19"],
    full: ["wys-spec-19"]
  },
  variants: {
    short:
      "This build has no analytics measurement id configured, so no analytics script loads and Watch Your Step sends none of its counts from any browser.",
    full:
      "This build has no analytics measurement id configured, so no analytics script loads and Watch Your Step sends none of its counts from any browser."
  }
} as const satisfies AnyCanonicalText;

/** The state line for a browser that chose Decline. True of `trackWys`. */
export const analyticsDeclinedText = {
  id: "data-analytics-declined",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-19", "wys-spec-20"],
  variantSources: {
    short: ["wys-spec-19"],
    full: ["wys-spec-19"]
  },
  variants: {
    short:
      "Analytics are declined on this device, so Watch Your Step sends none of its counts from this browser.",
    full:
      "Analytics are declined on this device, so Watch Your Step sends none of its counts from this browser."
  }
} as const satisfies AnyCanonicalText;

/**
 * The state line for a browser with no stored choice — which is also the state
 * a browser that blocks storage lands in, because the consent read fails
 * closed.
 */
export const analyticsUndecidedText = {
  id: "data-analytics-undecided",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-19", "wys-spec-20"],
  variantSources: {
    short: ["wys-spec-19"],
    full: ["wys-spec-19"]
  },
  variants: {
    short:
      "No analytics choice is stored on this device, so Watch Your Step sends none of its counts from this browser.",
    full:
      "No analytics choice is stored on this device, so Watch Your Step sends none of its counts from this browser."
  }
} as const satisfies AnyCanonicalText;

/**
 * The post-clear panel — the interaction (WYS §20) asks to be curriculum
 * rather than a QA step.
 *
 * §20: "let learner clear local state, reload, visibly show that local state
 * disappeared", and "this interaction should itself reinforce the lesson: local
 * state is not the same as server data; restart is not the same as deletion;
 * transparency is better than an absolute promise." All three lessons are in
 * this paragraph, and each is true of the code: there is no server copy of
 * `wys:v1` to restore, `restartCourse()` and `clearAllWysData()` are two
 * different functions with two different footprints, and the rows above are
 * regenerated from the same field set that produced them before the clear.
 *
 * It does NOT claim that nothing was sent. Clearing fires
 * `wys_local_state_clear`, which reaches GA4 for a browser that granted
 * analytics — saying otherwise on the page whose subject is exactly this would
 * be the failure this page exists to avoid.
 */
export const clearedDemonstrationText = {
  id: "data-cleared-demonstration",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-20", "wys-spec-17"],
  variantSources: {
    short: ["wys-spec-20"],
    full: ["wys-spec-20"]
  },
  variants: {
    short:
      "The rows above are empty because the keys are gone. Reload and they stay empty: there was no server copy to restore, which is the whole difference between local state and server data. Restarting the course would have kept your rulebook; this did not. Neither one reaches a hosting log.",
    full:
      "The rows above are empty because the keys are gone. Reload and they stay empty: there was no server copy to restore, which is the whole difference between local state and server data. Restarting the course would have kept your rulebook; this did not. Neither one reaches a hosting log."
  }
} as const satisfies AnyCanonicalText;

/**
 * The no-storage variant (§7.3).
 *
 * iOS Safari private browsing and "block all cookies" THROW on `localStorage`
 * access, and iPhone Safari is the primary QA target. `readWysState()` returns
 * `storageBlocked: true` and a valid empty state, so the page renders this
 * instead of nine rows of em dashes that would read as "you have done nothing"
 * rather than "this browser stores nothing".
 */
export const storageBlockedText = {
  id: "data-storage-blocked",
  surfaceKind: "general",
  status: "published",
  origin: "AI_SYNTHESIS",
  sourceIds: ["wys-spec-17", "wys-spec-20"],
  variantSources: {
    short: ["wys-spec-17"],
    full: ["wys-spec-17"]
  },
  variants: {
    short:
      "This browser blocks local storage, so Watch Your Step has kept nothing here. There is nothing to show, download, restart or clear.",
    full:
      "This browser blocks local storage, so Watch Your Step has kept nothing here. There is nothing to show, download, restart or clear."
  }
} as const satisfies AnyCanonicalText;

export const dataCopyRecords: readonly AnyCanonicalText[] = [
  dataManifestIntroText,
  benDoesNotNeedText,
  clearingFootnoteText,
  clearingSurvivesText,
  analyticsConditionsText,
  analyticsUnavailableText,
  analyticsDeclinedText,
  analyticsUndecidedText,
  clearedDemonstrationText,
  storageBlockedText
];

/* -------------------------------------------------------------------------- */
/* 3. Provenance pairs for prose defined in lib/                              */
/* -------------------------------------------------------------------------- */

/**
 * The provenance the two confirmation explanations render under.
 *
 * NOT a content record, on the same reasoning as `learnerRuleProvenance`: the
 * sentences themselves already have exactly one home —
 * `RESTART_COURSE_EXPLANATION` and `CLEAR_ALL_WYS_DATA_EXPLANATION` in
 * `lib/wys/local-state.ts`, written in Phase 2 beside the two functions they
 * describe so the explanation cannot drift from the behaviour. Copying them
 * into `content/` would create the second definition Standing Order 07 forbids.
 * What is missing there is the `(status, origin)` pair the gate needs, so it is
 * stated here, once.
 *
 * `AI_SYNTHESIS` because this build wrote them, and `published` because a
 * destructive action whose explanation was withheld by a draft flag would be a
 * worse surface than one that shows it labelled. (WYS §17) requires that both
 * operations "explain exactly what happens before executing" — that is a
 * behaviour, not a nicety, so the text cannot be optional.
 */
export const confirmationProvenance: GateableRecord = {
  status: "published",
  origin: "AI_SYNTHESIS"
};

/* -------------------------------------------------------------------------- */
/* 4. Pinned labels — one node, one name                                      */
/* -------------------------------------------------------------------------- */

/**
 * Headings, control names and the mono key line.
 *
 * `pageTitle` and `dataPageHref` are REFERENCES, not literals: Q6 pins one page
 * title and one link label in `./copy.ts`, and a second copy of either here is
 * the two-homes failure §6.8 exists to stop.
 *
 * `rawJsonSummary` is COMPOSED from `WYS_STORAGE_KEY`. The artboard draws
 * "key: wys:v1 · raw JSON ↓" and plan §7.1 notes that this string is
 * user-visible copy which "must match the implementation exactly" — so it is
 * derived from the implementation rather than typed beside it, and a change to
 * the storage key changes the screen.
 */
export const dataLabels = {
  /** Q6, ratified — the sitewide title, defined once in ./copy.ts. */
  pageTitle: wysLabels.dataPageTitle,

  /** The three card headings (dc.html:183, :194, :198), verbatim. */
  card1Eyebrow: "1 · THIS BROWSER",
  card2Eyebrow: "2 · BEN MAY RECEIVE",
  card3Eyebrow: "3 · BEN DOES NOT NEED",

  /** The mono line under card 1's rows (dc.html:191), composed from the key. */
  rawJsonSummary: `key: ${WYS_STORAGE_KEY} · raw JSON ↓`,

  /** The key list (§7.5). An addition: the artboard names one key, the code writes two. */
  keysHeading: "Keys in this browser",
  keyClearedByClear: "removed by clear",
  keyKeptByClear: "kept by clear",
  keyNotSet: "not set",

  /** The event disclosure. An addition; the closed list is read from the adapter. */
  eventsSummary: "Every event name this build can send ↓",

  /** The three actions (dc.html:203-206), verbatim. */
  downloadLocalData: "Download my local data",
  restartCourse: "Restart the course",
  restartCourseMeta: "· keeps rulebook",
  clearBrowserData: "Clear this browser's data",

  /** The confirmation step. Authored — no artboard draws one. */
  confirmRestart: "Yes, restart",
  confirmClear: "Yes, clear it",
  cancel: "Cancel",
  reloadPage: "Reload this page",

  /** Where the surviving key is explained in full. */
  cookiesHref: "/cookies",
  cookiesLinkLabel: "Cookies and browser storage",

  /** The downloaded file. Plain JSON, built in the browser; there is no server copy. */
  downloadFileName: "watch-your-step-local-data.json",

  /** The value shown for any field the browser has stored nothing in. */
  emptyValue: "—",

  /**
   * The value shown BEFORE the browser has been read, and the value a visitor
   * with JavaScript disabled keeps seeing.
   *
   * Deliberately NOT the em dash. §7.3 forbids reading `wys:v1` during render,
   * so the server HTML cannot know what this browser holds — and an em dash
   * there would be a false statement ("nothing stored") rather than a
   * placeholder, on the one page whose sub-line promises the rows are
   * "generated from what's actually stored right now". The row LABELS still
   * render, because the set of fields this browser can hold is (WYS §18)'s
   * "This browser can store" list and is true at every moment; only the values
   * wait.
   */
  pendingValue: "not read yet"
} as const;

export type DataLabelKey = keyof typeof dataLabels;

/* -------------------------------------------------------------------------- */
/* 5. Derivations — pure, so the page's guarantees are unit-testable          */
/* -------------------------------------------------------------------------- */

/**
 * Which card-1 rows render, and in which order.
 *
 * §7.5's rule is that the rows derive from the declared `WysLocalStateV1` field
 * set, not from the key registry, so every persisted field surfaces and a field
 * added later cannot quietly make "Generated from what's actually stored right
 * now" false. `WYS_DATA_PAGE_ROWS` already carries that bijection and marks
 * each row `artboard-5c` or `new-unapproved`.
 *
 * ORDER IS THE ONLY THING DECIDED HERE. Declared order puts three added rows
 * (schema version, started, last opened) above the artboard's first row, which
 * would rearrange approved copy (R1). So the four artboard rows render first,
 * in the order `5c` draws them, and the five additions follow. Nothing is
 * withheld: (WYS §20) requires local judgments and last route, and the
 * remaining three fall out of the bijection. All five are a Final-copy
 * amendment escalated in docs/facelift-unapproved.md, marked in the DATA rather
 * than in a component, so withholding them later is a one-line change here.
 */
export const approvedDataPageRows: readonly WysDataPageRow[] = WYS_DATA_PAGE_ROWS.filter(
  (row) => row.source === "artboard-5c"
);

export const addedDataPageRows: readonly WysDataPageRow[] = WYS_DATA_PAGE_ROWS.filter(
  (row) => row.source === "new-unapproved"
);

export const dataPageRowsInRenderOrder: readonly WysDataPageRow[] = [
  ...approvedDataPageRows,
  ...addedDataPageRows
];

/**
 * The consent key, read fail-closed (Q7, §8.3).
 *
 * The same rule `analyticsConsentGranted()` applies, stated once as a pure
 * function so the page and the adapter cannot disagree about what an absent,
 * unreadable or unrecognised value means: it means nothing is being sent.
 */
export type ConsentReading = "granted" | "denied" | "unset";

export function consentReadingFor(stored: string | null | undefined): ConsentReading {
  if (stored === "granted") return "granted";
  if (stored === "denied") return "denied";
  return "unset";
}

/**
 * What card 1 shows beside a key name.
 *
 * A short value is shown as it is — `bct_analytics_consent` holds "granted" or
 * "denied" and hiding it would be absurd on this page. A long one is shown as
 * its length, because `wys:v1` is a whole JSON document and its contents belong
 * in the raw-JSON disclosure below rather than squeezed into a row.
 */
export const BROWSER_KEY_VALUE_INLINE_MAX = 24;

export function browserKeyValueSummary(raw: string | null): string {
  if (raw === null) return dataLabels.keyNotSet;
  if (raw.length <= BROWSER_KEY_VALUE_INLINE_MAX) return raw;
  return `${raw.length} characters`;
}

/**
 * "Download my local data" (WYS §18) — built in the browser, because there is
 * no server copy to request.
 *
 * The file is every key this browser holds for this site, keyed by its real
 * storage key, so what the learner downloads matches what card 1 lists and what
 * `lib/wys/browser-keys.ts` declares. A value that parses as JSON is embedded as
 * JSON so the file is readable; anything else is embedded as the string it is;
 * an absent key is `null` rather than omitted, so the file says the key is
 * empty instead of leaving the reader to notice it is missing.
 *
 * Pure and total: no timestamps, no build id, no browser fingerprint, nothing
 * this build added. A copy of the learner's own bytes.
 */
export interface BrowserKeyReading {
  key: string;
  raw: string | null;
}

export function localDataFile(readings: readonly BrowserKeyReading[]): string {
  const out: Record<string, unknown> = {};
  for (const reading of readings) {
    if (reading.raw === null) {
      out[reading.key] = null;
      continue;
    }
    try {
      out[reading.key] = JSON.parse(reading.raw);
    } catch {
      out[reading.key] = reading.raw;
    }
  }
  return `${JSON.stringify(out, null, 2)}\n`;
}

/**
 * What the `raw JSON ↓` disclosure shows.
 *
 * The RAW STORED BYTES, re-indented if they parse — not a re-serialisation of
 * the in-memory state. The two are normally identical (the write path
 * sanitises, so what is stored is what a read returns), and where they ever
 * differ the learner is entitled to the bytes rather than to this build's
 * reading of them. An unparseable value is shown as it is; an absent key says
 * so instead of drawing an empty box.
 */
export function rawJsonPreview(raw: string | null): string {
  if (raw === null) return dataLabels.keyNotSet;
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
