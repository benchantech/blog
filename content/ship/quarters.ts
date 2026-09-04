/**
 * Captain's Quarters (mockup `5d`; packet: quarters-selection-rule).
 *
 * SIX TILES, NOT FOUR. The artboard (dc.html:288-293) is
 * `grid-template-columns:1fr 1fr` followed by six tiles; the handoff README
 * calls it a "2×2 grid" while itself listing six items. Transcribing the README
 * over the artboard would contradict R1 and leave two tiles unaccounted for, so
 * the grid is 2 columns × 3 rows.
 *
 * THE KEEL SUB-LABEL IS NOT TYPED. "v2.3 · the keel" is a governance string, so
 * the version half reads from `lib/approval-state.ts`; only the word "the keel"
 * is copy. Ben publishing a new version changes one typed value.
 *
 * THE STUDIO TILE IS UNLINKED (Q5, ratified). `/studio` is the preserved
 * Violin for Parents stakeholder page and cannot be relabelled, so the tile
 * ships with its label and no target until Ben answers. `href: null` is the
 * data form of "we do not know yet" — not an empty string, which a renderer
 * would happily turn into a link to the current page.
 *
 * THE PORTRAIT, THE AUDIO PILL AND SELECTED HISTORY ARE SLOTS. Their records
 * live in `content/watch-your-step/sources.ts` (`slot-portrait-quarters`,
 * `slot-hear-ben-60s`, `slot-quarters-selected-history`) so a slot is defined
 * once wherever it appears — the audio pill is the same source the home band
 * and the landing render.
 */

import type { ContentOrigin, ContentStatus } from "@/lib/content-status";
import { approvalState } from "@/lib/approval-state";
import { destinations } from "@/content/site-config";
import { wysBenSlotById } from "@/content/watch-your-step/sources";
import { shipNav } from "@/content/nav";

export interface QuartersIntro {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  eyebrow: string;
  name: string;
  body: string;
  sourceIds: readonly string[];
}

export const quartersIntro = {
  id: "quarters-intro",
  status: "published",
  origin: "BEN_APPROVED",
  eyebrow: "CAPTAIN'S QUARTERS",
  name: "Ben Chan",
  body: "What Ben has chosen to put on the record. Public by deliberate selection, not by extraction — AI organizes this page; it doesn't decide what's on it.",
  sourceIds: ["artboard-5d-quarters", "packet-quarters-selection-rule"]
} as const satisfies QuartersIntro;

export type QuartersTileId =
  | "tile-yy-method"
  | "tile-watch-your-step"
  | "tile-violin-library"
  | "tile-yy-and-me"
  | "tile-resonant-patterns"
  | "tile-studio";

export interface QuartersTile {
  id: QuartersTileId;
  status: ContentStatus;
  origin: ContentOrigin;
  label: string;
  subLabel: string;
  /** null while the target is an open question (Q5). Never an empty string. */
  href: string | null;
  /** The artboard fills the current-context tile tint-teal. State as data. */
  current?: boolean;
  sourceIds: readonly string[];
}

/** The ship-nav label for a route. One node, one name (§6.8). */
const navLabel = (href: string): string => {
  const item = shipNav.find((entry) => entry.href === href);
  if (!item) throw new Error(`No ship-nav item for "${href}".`);
  return item.label;
};

type SiteDestinationId = (typeof destinations)[number]["id"];

const destination = (id: SiteDestinationId): (typeof destinations)[number] => {
  const record = destinations.find((entry) => entry.id === id);
  if (!record) throw new Error(`No destination with id "${id}".`);
  return record;
};

const destinationUrl = (id: SiteDestinationId): string => destination(id).url;

/**
 * The tile LABEL is derived too, not only the href.
 *
 * Three of the six tiles name doors that `content/site-config.ts` already
 * names, with the same words — "BenChanViolin Library", "YY and Me",
 * "Resonant Patterns" are the `eyebrow` of `destinations[1..3]`. Typing them
 * again would be one node with two definitions, which Standing Order 07 and
 * plan §6.8 forbid, and would let the footer and this grid drift apart. The
 * artboard is still the authority for WHICH tiles exist and in what order; it
 * agrees with site-config on what they are called, so the name has one home.
 */
const destinationLabel = (id: SiteDestinationId): string => destination(id).eyebrow;

export const quartersTiles = [
  {
    id: "tile-yy-method",
    status: "published",
    origin: "BEN_APPROVED",
    label: "YY Method",
    /** Version from approvalState; "the keel" is the only copy in this string. */
    subLabel: `v${approvalState.keel.version} · the keel`,
    href: "https://yymethod.com",
    sourceIds: ["artboard-5d-quarters"]
  },
  {
    id: "tile-watch-your-step",
    status: "published",
    origin: "BEN_APPROVED",
    label: navLabel("/watch-your-step"),
    subLabel: "this site",
    href: "/watch-your-step",
    current: true,
    sourceIds: ["artboard-5d-quarters"]
  },
  {
    id: "tile-violin-library",
    status: "published",
    origin: "BEN_APPROVED",
    label: destinationLabel("violin"),
    subLabel: "violin",
    href: destinationUrl("violin"),
    sourceIds: ["artboard-5d-quarters"]
  },
  {
    id: "tile-yy-and-me",
    status: "published",
    origin: "BEN_APPROVED",
    label: destinationLabel("human"),
    subLabel: "writing",
    href: destinationUrl("human"),
    sourceIds: ["artboard-5d-quarters"]
  },
  {
    id: "tile-resonant-patterns",
    status: "published",
    origin: "BEN_APPROVED",
    label: destinationLabel("theory"),
    subLabel: "writing",
    href: destinationUrl("theory"),
    sourceIds: ["artboard-5d-quarters"]
  },
  {
    /** Q5: unlinked until Ben answers where it should point. */
    id: "tile-studio",
    status: "published",
    origin: "BEN_APPROVED",
    label: "Studio",
    subLabel: "rented laboratory",
    href: null,
    sourceIds: ["artboard-5d-quarters"]
  }
] as const satisfies readonly QuartersTile[];

export function quartersTileById(id: QuartersTileId): QuartersTile {
  const record = quartersTiles.find((tile) => tile.id === id);
  if (!record) throw new Error(`No Captain's Quarters tile with id "${id}".`);
  return record;
}

/** The dashed Selected history card's own line, verbatim from the artboard. */
export interface QuartersHistoryNote {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  heading: string;
  body: string;
  /** The slot record this card is built around. */
  slotId: string;
  sourceIds: readonly string[];
}

export const quartersHistoryNote = {
  id: "quarters-selected-history",
  status: "published",
  origin: "BEN_APPROVED",
  /** One definition: the heading IS the slot's label (§6.8). */
  heading: wysBenSlotById("slot-quarters-selected-history").label,
  body: "career, performances, interviews, milestones. Slots awaiting Ben's selection; nothing inferred or pulled in automatically.",
  slotId: "slot-quarters-selected-history",
  sourceIds: ["artboard-5d-quarters", "packet-quarters-selection-rule"]
} as const satisfies QuartersHistoryNote;

/** Every quarters record carrying provenance fields, for the governance arrays. */
export const quartersRecords = [quartersIntro, ...quartersTiles, quartersHistoryNote];
