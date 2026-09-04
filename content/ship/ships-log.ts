/**
 * The Ship's Log (mockup `5d`; packet: Ship's Log).
 *
 * TWO ENTRIES AND ONE FORWARD-LOOKING NOTE, and the note is a DISTINCT OBJECT
 * rather than a third entry. The artboard draws it as an ink card headed
 * "NEXT · CAPTAIN'S ROUND", which is not a record of something that happened —
 * it is a statement of what happens next. Typing it as a log entry would put a
 * future intention into an append-only record of the past, which is the one
 * thing Standing Order 08 exists to prevent.
 *
 * ENTRY BODIES ARE FACTUAL BUILD RECORDS AT DRAFT ORIGIN (plan Phase 9, R10).
 * `origin: "IMPLEMENTATION_PLACEHOLDER"` — never Ben opinion, never first
 * person. `status: "published"`, because these are shipped text rather than
 * handoff README bucket-3 curriculum placeholders: the two-axis policy then
 * resolves them to `marked`, so they render WITH the label that says they are
 * not Ben's words. That is the correct use of the two axes, and it is why the
 * Log is readable at launch while the scenario bank is not.
 *
 * `approval pending` IS NOT TYPED HERE. It is the default state of every entry
 * and it renders from `lib/approval-state.ts` `entryApprovalLabel()`. An entry
 * gains `approvedAt` / `approvedBy` only when Ben stamps it, and the chip flips
 * from that one value (plan §6.6).
 *
 * DATES ARE DATA. ISO 8601 here; the "3 Sep 2026" form the artboard draws is a
 * presentation, formatted in Phase 9 from this value.
 *
 * `orderTags` are `StandingOrderId` values, not strings, so a tag that resolves
 * to no Standing Order is a compile error and a test failure both.
 */

import type { ContentOrigin, ContentStatus } from "@/lib/content-status";
import type { StandingOrderId } from "./standing-orders";
import { type BridgePosition, bridgePositions } from "./bridge";

export type ShipsLogEntryId = "log-wys-website-first" | "log-planning-packet";

export const SHIPS_LOG_ENTRY_IDS: readonly ShipsLogEntryId[] = [
  "log-wys-website-first",
  "log-planning-packet"
];

export interface ShipsLogEntry {
  id: ShipsLogEntryId;
  status: ContentStatus;
  origin: ContentOrigin;
  /** ISO 8601. The "D MMM YYYY" form is rendered, never stored. */
  date: string;
  title: string;
  body: string;
  orderTags: readonly StandingOrderId[];
  sourceIds: readonly string[];
  /** Set only when Ben stamps the entry. Until then the chip reads from state. */
  approvedBy?: string;
  approvedAt?: string;
  standingOrdersVersion?: string;
  supersededBy?: string;
  canonical?: boolean;
}

export const shipsLogEntries = [
  {
    id: "log-wys-website-first",
    status: "published",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    date: "2026-09-03",
    title: "Watch Your Step moved to website-first",
    body: "De-escalated from a Studio AI Coach launch to a self-serve, no-account course on this site — to learn whether there's appetite before building an AI layer.",
    orderTags: ["order-03", "order-04"],
    sourceIds: ["artboard-5d-ships-log", "packet-ships-log"]
  },
  {
    id: "log-planning-packet",
    status: "published",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    date: "2026-09-03",
    title: "Planning packet assembled",
    body: "Master plan, voice constitution, transcript and raw voice corpus preserved in one packet for section-by-section approval. Corpus hash recorded.",
    orderTags: ["order-05", "order-08"],
    sourceIds: ["artboard-5d-ships-log", "packet-corpus"]
  }
] as const satisfies readonly ShipsLogEntry[];

export function shipsLogEntryById(id: ShipsLogEntryId): ShipsLogEntry {
  const record = shipsLogEntries.find((entry) => entry.id === id);
  if (!record) throw new Error(`No Ship's Log entry with id "${id}".`);
  return record;
}

/**
 * The forward-looking card. A different KIND of object from a log entry:
 * it has no date, it records nothing, and it cannot be stamped.
 */
export interface CaptainsRoundNote {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  eyebrow: string;
  body: string;
  sourceIds: readonly string[];
}

export const captainsRoundNote = {
  id: "next-captains-round",
  status: "published",
  origin: "IMPLEMENTATION_PLACEHOLDER",
  eyebrow: "NEXT · CAPTAIN'S ROUND",
  body: "Reread the Standing Orders → compare the build → fix or clarify → record → Ben stamps. The first stamped entry becomes Snapshot 0.",
  sourceIds: ["artboard-5d-ships-log"]
} as const satisfies CaptainsRoundNote;

/**
 * What an entry is supposed to record (packet: Ship's Log). Kept as data so the
 * template in `content/watch-your-step/_templates/` and any future entry form
 * read the same list rather than two drifting copies.
 */
export const SHIPS_LOG_ENTRY_FIELDS: readonly string[] = [
  "what was attempted",
  "what changed",
  "which principle governed it",
  "what ambiguity surfaced",
  "what was corrected",
  "whether the Standing Orders changed",
  "what Ben approved"
];

/* -------------------------------------------------------------------------- */
/* The page header (mockup 5d, dc.html:261-263)                               */
/* -------------------------------------------------------------------------- */

/**
 * THE H1 IS IN BEN'S FIRST PERSON AND IT IS NOT THIS BUILD'S SENTENCE.
 *
 * "I may change my mind. I won't rewrite the record." is drawn on approved
 * artboard `5d` and is listed verbatim in the plan's Appendix A, so R1 puts it
 * on the page and R8 forbids quietly rewording it. It is still the one string
 * on the ship surfaces that R10 would forbid if this build had written it, so
 * `firstPerson` records that fact AS DATA — the page can withhold or relabel it
 * on a one-line change, `tests/ship-content.test.ts` asserts it is the only
 * such string in `content/ship/`, and docs/facelift-unapproved.md escalates the
 * sentence to Ben rather than leaving the tension in a comment.
 *
 * The pill and the "approval pending" chip are approval state and are not typed
 * here; `entryApprovalLabel()` renders the chip (§6.6).
 */
export interface ShipsLogIntro {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  pill: string;
  title: string;
  /** True where the string is written in Ben's voice. R10 escalation flag. */
  firstPerson: boolean;
  body: string;
  sourceIds: readonly string[];
}

export const shipsLogIntro = {
  id: "ships-log-intro",
  status: "published",
  origin: "BEN_APPROVED",
  pill: "Ship's Log · append-only",
  title: "I may change my mind. I won't rewrite the record.",
  firstPerson: true,
  body: "What was attempted, what changed, which rule governed it, what Ben approved.",
  sourceIds: ["artboard-5d-ships-log", "packet-ships-log"]
} as const satisfies ShipsLogIntro;

/* -------------------------------------------------------------------------- */
/* Dates are data; "D MMM YYYY" is a presentation                             */
/* -------------------------------------------------------------------------- */

const MONTH_ABBREVIATIONS: readonly string[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

/**
 * "2026-09-03" -> "3 Sep 2026", the form artboard `5d` draws.
 *
 * Parsed from the string rather than through `new Date()`: `new Date("2026-09-03")`
 * is UTC midnight, and a build machine west of Greenwich would render the
 * previous day. A log date that moves with the renderer's timezone is a
 * rewritten record, which is the one thing Standing Order 08 forbids.
 */
export function formatLogDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Ship's Log dates are ISO 8601 (YYYY-MM-DD); got "${iso}".`);
  const [, year, month, day] = match;
  return `${Number(day)} ${MONTH_ABBREVIATIONS[Number(month) - 1]} ${year}`;
}

/* -------------------------------------------------------------------------- */
/* Superseded Bridge positions render HERE (Q25, ratified)                    */
/* -------------------------------------------------------------------------- */

/**
 * The Bridge intro claims "every earlier state lives in the Log". This is the
 * code that makes the claim true rather than the wording that would have made
 * it false (R8).
 *
 * `supersedePosition()` in `./bridge.ts` produces the `historical` record;
 * this function is where the Log picks it up. The item is a PRESENTATION of a
 * Bridge record, not a second canonical node — it carries a derived id, it is
 * not in `shipRegistry` a second time, and the record it wraps is already
 * registered through `bridgeRecords` (§6.8, and the registry rule in
 * docs/facelift-build-notes.md §7.5).
 *
 * Rendering is the caller's job and it must ask for the `archive` surface:
 * `renderPolicyFor(position, "archive")` returns `marked`, never `canon`, so a
 * superseded position can appear on the Log and can never read as a current
 * one.
 *
 * A malformed record THROWS rather than being skipped. Silently dropping a
 * `historical` position that is missing `supersededBy` would empty the Log of
 * exactly the state the Bridge claims lives here — the failure this machinery
 * exists to prevent.
 */
export interface SupersededPositionItem {
  /** Derived from the position's id. A presentation, not a canonical node. */
  id: string;
  positionId: string;
  /** The date the superseded position was taken. */
  date: string;
  /** Build language. Never a Ben sentence — the position itself carries those. */
  heading: string;
  position: BridgePosition;
}

export function supersededPositionItems(
  positions: readonly BridgePosition[] = bridgePositions
): readonly SupersededPositionItem[] {
  const items: SupersededPositionItem[] = [];

  for (const position of positions) {
    if (position.status !== "historical" && position.status !== "superseded") continue;
    if (!position.supersededBy || position.canonical !== false) {
      throw new Error(
        `Bridge position "${position.id}" is ${position.status} without supersededBy / canonical: false, so the Log cannot record it (plan §6.2 rule 4).`
      );
    }
    items.push({
      id: `log-superseded-${position.id}`,
      positionId: position.id,
      date: position.takenAt,
      heading: "Bridge position superseded",
      position
    });
  }

  return items;
}

/* -------------------------------------------------------------------------- */
/* The rendered order                                                         */
/* -------------------------------------------------------------------------- */

export type ShipsLogItem =
  | { kind: "entry"; date: string; entry: ShipsLogEntry }
  | { kind: "superseded-position"; date: string; item: SupersededPositionItem };

/**
 * Everything the Log renders, newest first, entries and superseded Bridge
 * positions in one sequence. The forward-looking `captainsRoundNote` is NOT in
 * it: it records nothing and has no date, which is why it is a different kind
 * of object.
 */
export function shipsLogTimeline(
  entries: readonly ShipsLogEntry[] = shipsLogEntries,
  positions: readonly BridgePosition[] = bridgePositions
): readonly ShipsLogItem[] {
  const items: ShipsLogItem[] = [
    ...entries.map((entry) => ({ kind: "entry" as const, date: entry.date, entry })),
    ...supersededPositionItems(positions).map((item) => ({
      kind: "superseded-position" as const,
      date: item.date,
      item
    }))
  ];

  return items.sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
}
