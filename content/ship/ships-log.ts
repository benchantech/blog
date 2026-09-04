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
