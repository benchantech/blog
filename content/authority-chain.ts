/**
 * The four-link authority chain, as data (plan Phase 1; packet: authority-chain,
 * hashing).
 *
 * YY Method Professional v2.3 -> BCT Standing Orders -> Author Ship current
 * state -> Ship's Log and snapshots. Each link records where it is canonical
 * and carries a hash field that is PRESENT AND EMPTY: packet: hashing requires
 * freeze -> SHA-256 of canonical UTF-8/LF Markdown -> publish on
 * yymethod.com/work -> THEN cite. Nothing here fabricates a digest, and
 * `tests/canonical-text.test.ts` fails if a hash string renders anywhere while
 * `approvalState.keel.sha256` is null.
 *
 * R5: the planning packet is NOT YET STAMPED and its own Approval Ledger is
 * blank, so no packet-derived material renders as Ben-authored canon. These
 * records are therefore `status: "draft"` with
 * `origin: "IMPLEMENTATION_PLACEHOLDER"` — the chain's structure is packet-
 * derived and the descriptive lines were drafted during implementation. Under
 * the Q21 default (`RENDER_MARKED_DRAFT === false`) that means the chain does
 * not render publicly yet; Phase 9 reports the consequence rather than
 * softening the origin. Repo idiom: exported ID union -> exported object type
 * -> const array closed with `satisfies` (content/site-config.ts:1-77).
 */

import type { ContentOrigin, ContentStatus, SurfaceKind } from "@/lib/content-status";
import { approvalState } from "@/lib/approval-state";

export type AuthorityLinkId = "keel" | "standing-orders" | "current-state" | "log-and-snapshots";

export type AuthorityHash = {
  algorithm: "sha256";
  /** null until the source is frozen and its digest is published. */
  value: string | null;
  /** Where the published digest will be citable from. */
  publishedAt: string | null;
};

export type AuthorityLink = {
  id: AuthorityLinkId;
  /** Every authority link is a renderable content object (lib/content-status.ts). */
  surfaceKind: Extract<SurfaceKind, "general">;
  /** Position in the chain, 1-4. Rendered by the Bridge authority map. */
  order: number;
  name: string;
  /** The canonical location of this link. External for the keel, internal otherwise. */
  href: string;
  scope: "external" | "internal";
  /** The link this one derives its authority from. `null` for the keel. */
  derivesFrom: AuthorityLinkId | null;
  /** Build-language description of what the link governs. Not a Ben position. */
  note: string;
  hash: AuthorityHash;
  status: ContentStatus;
  origin: ContentOrigin;
};

export const authorityChain = [
  {
    id: "keel",
    surfaceKind: "general",
    order: 1,
    name: approvalState.keel.name,
    href: approvalState.keel.url,
    scope: "external",
    derivesFrom: null,
    note: "The governing document. Everything below it derives from it.",
    hash: { algorithm: "sha256", value: approvalState.keel.sha256, publishedAt: null },
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER"
  },
  {
    id: "standing-orders",
    surfaceKind: "general",
    order: 2,
    name: "BCT Standing Orders",
    href: "/standing-orders",
    scope: "internal",
    derivesFrom: "keel",
    note: "The public rules this site runs on, derived from the keel.",
    hash: { algorithm: "sha256", value: null, publishedAt: null },
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER"
  },
  {
    id: "current-state",
    surfaceKind: "general",
    order: 3,
    name: "Author Ship current state",
    href: "/bridge",
    scope: "internal",
    derivesFrom: "standing-orders",
    note: "Where the ship is now. Mirrored for machines at /author-ship/state.json.",
    hash: { algorithm: "sha256", value: null, publishedAt: null },
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER"
  },
  {
    id: "log-and-snapshots",
    surfaceKind: "general",
    order: 4,
    name: "Ship's Log and snapshots",
    href: "/ships-log",
    scope: "internal",
    derivesFrom: "current-state",
    note: "The append-only record of every change, and the snapshots taken of it.",
    hash: { algorithm: "sha256", value: null, publishedAt: null },
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER"
  }
] as const satisfies readonly AuthorityLink[];

/** The chain in order, keel first. */
export function authorityChainInOrder(): readonly AuthorityLink[] {
  return [...authorityChain].sort((a, b) => a.order - b.order);
}

/** True while no link in the chain can cite a published digest. */
export function anyHashPublished(): boolean {
  return authorityChain.some((link) => link.hash.value !== null);
}
