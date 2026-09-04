/**
 * The nine Standing Orders (mockup `5d`; handoff README "Standing Orders titles").
 *
 * The README puts Standing Orders titles in the **Final copy** bucket — "ship
 * as-is, subject to Ben's stamp" — so each record is `status: "published"`,
 * `origin: "BEN_APPROVED"`, exactly as `content/claims.ts` established in
 * Phase 1. The word "draft" on the page comes from a different axis entirely:
 * `lib/approval-state.ts` renders the grey "Standing Orders · draft" pill from
 * `approvalState.standingOrders.status`, and the stamp is `null`. Content
 * status and approval state are two axes and this is the record that shows why
 * (plan §6.6).
 *
 * ORDER 01 IS THE ONLY ONE WITH A GLOSS, and it is the one the artboard renders
 * ink instead of grey: "AI may execute; only Ben signs." Orders 08 and 09 sit
 * below the screenshot fold and must ship — a reader working from the PNG alone
 * would drop them.
 *
 * `StandingOrderId` is a real type because the `5d` Ship's Log renders `Order
 * 03`, `Order 04`, `Order 05` and `Order 08` as TAGS ON LOG ENTRIES, which are
 * references, not labels. `tests/canonical-text.test.ts` asserts every tag
 * resolves to a record here.
 */

import type { ContentOrigin, ContentStatus } from "@/lib/content-status";
import { approvalState } from "@/lib/approval-state";

export type StandingOrderId =
  | "order-01"
  | "order-02"
  | "order-03"
  | "order-04"
  | "order-05"
  | "order-06"
  | "order-07"
  | "order-08"
  | "order-09";

export const STANDING_ORDER_IDS: readonly StandingOrderId[] = [
  "order-01",
  "order-02",
  "order-03",
  "order-04",
  "order-05",
  "order-06",
  "order-07",
  "order-08",
  "order-09"
];

export interface StandingOrder {
  id: StandingOrderId;
  status: ContentStatus;
  origin: ContentOrigin;
  /** "01".."09" — the mono numeral the card renders. */
  number: string;
  title: string;
  /** Only order 01 carries one, per the artboard. */
  gloss?: string;
  /** The artboard draws 01 ink and 02-09 tint-grey. State as data. */
  emphasis: "ink" | "grey";
  sourceIds: readonly string[];
}

export const standingOrders = [
  {
    id: "order-01",
    status: "published",
    origin: "BEN_APPROVED",
    number: "01",
    title: "Human judgment stays authoritative.",
    gloss: "AI may execute; only Ben signs.",
    emphasis: "ink",
    sourceIds: ["artboard-5d-standing-orders"]
  },
  {
    id: "order-02",
    status: "published",
    origin: "BEN_APPROVED",
    number: "02",
    title: "Deterministic before probabilistic.",
    emphasis: "grey",
    sourceIds: ["artboard-5d-standing-orders"]
  },
  {
    id: "order-03",
    status: "published",
    origin: "BEN_APPROVED",
    number: "03",
    title: "Zero AI required for the learner.",
    emphasis: "grey",
    sourceIds: ["artboard-5d-standing-orders"]
  },
  {
    id: "order-04",
    status: "published",
    origin: "BEN_APPROVED",
    number: "04",
    title: "Minimal trust — asked for, and named.",
    emphasis: "grey",
    sourceIds: ["artboard-5d-standing-orders"]
  },
  {
    id: "order-05",
    status: "published",
    origin: "BEN_APPROVED",
    number: "05",
    title: "Provenance on every claim.",
    emphasis: "grey",
    sourceIds: ["artboard-5d-standing-orders"]
  },
  {
    id: "order-06",
    status: "published",
    origin: "BEN_APPROVED",
    number: "06",
    title: "AI assistance is disclosed. No invisible crew.",
    emphasis: "grey",
    sourceIds: ["artboard-5d-standing-orders"]
  },
  {
    id: "order-07",
    status: "published",
    origin: "BEN_APPROVED",
    number: "07",
    title: "One idea, one canonical definition.",
    emphasis: "grey",
    sourceIds: ["artboard-5d-standing-orders", "packet-one-definition"]
  },
  {
    /** Below the screenshot fold. Ships. */
    id: "order-08",
    status: "published",
    origin: "BEN_APPROVED",
    number: "08",
    title: "History is preserved, never rewritten.",
    emphasis: "grey",
    sourceIds: ["artboard-5d-standing-orders"]
  },
  {
    /** Below the screenshot fold. Ships. */
    id: "order-09",
    status: "published",
    origin: "BEN_APPROVED",
    number: "09",
    title: "Mobile first.",
    emphasis: "grey",
    sourceIds: ["artboard-5d-standing-orders"]
  }
] as const satisfies readonly StandingOrder[];

export function standingOrderById(id: StandingOrderId): StandingOrder {
  const record = standingOrders.find((order) => order.id === id);
  if (!record) throw new Error(`No Standing Order with id "${id}".`);
  return record;
}

/** "Order 03" — the Ship's Log tag form of a record. One node, two presentations. */
export function standingOrderTag(id: StandingOrderId): string {
  return `Order ${standingOrderById(id).number}`;
}

/* -------------------------------------------------------------------------- */
/* The page header (mockup 5d, dc.html:239-241)                               */
/* -------------------------------------------------------------------------- */

/**
 * THE PILL IS DELIBERATELY ABSENT FROM THIS RECORD. "Standing Orders · draft"
 * is approval state, not copy, so the page renders it from
 * `standingOrdersPill()` in `lib/approval-state.ts` (§6.6). Typing it here
 * would be the second definition that module exists to prevent, and
 * `tests/governance-strings.test.ts` is the reason it can stay that way.
 *
 * THE KEEL IS CITED, AND WITHOUT A HASH. The artboard draws "Derived from
 * <keel>" with the keel name in teal; the name is a governance string, so it
 * reads from `approvalState.keel.name` rather than being typed. `citesHash` is
 * data rather than a comment, and it is `false` because (packet: hashing) is
 * freeze -> SHA-256 -> publish on yymethod.com/work -> THEN cite, and Ben has
 * published nothing. Phase 9's exit criterion is "no v2.3 hash printed", so the
 * page shows the keel's name and link and no digest.
 */
export interface StandingOrdersIntro {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  title: string;
  /** Three parts, because the middle one is state and the other two are copy. */
  derivedFrom: { prefix: string; keelName: string; suffix: string };
  /** Where the keel is canonical. Same value the authority chain's first link uses. */
  keelHref: string;
  /** False while `approvalState.keel.sha256` is null. Asserted, not assumed. */
  citesHash: boolean;
  sourceIds: readonly string[];
}

export const standingOrdersIntro = {
  id: "standing-orders-intro",
  status: "published",
  origin: "BEN_APPROVED",
  title: "The rules this site runs on",
  derivedFrom: {
    prefix: "Derived from ",
    keelName: approvalState.keel.name,
    suffix: ". This site cites it; it doesn't rewrite it."
  },
  keelHref: approvalState.keel.url,
  citesHash: approvalState.keel.sha256 !== null,
  sourceIds: ["artboard-5d-standing-orders", "packet-hashing"]
} as const satisfies StandingOrdersIntro;

/** The intro as one sentence, for surfaces that cannot style the keel span. */
export function standingOrdersIntroLine(): string {
  const { prefix, keelName, suffix } = standingOrdersIntro.derivedFrom;
  return `${prefix}${keelName}${suffix}`;
}
