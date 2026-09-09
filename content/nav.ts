/**
 * Site navigation inventories (plan §3.3, "Navigation coexistence").
 *
 * THREE inventories have to coexist, and none of them may lose a link
 * (user constraint 2):
 *
 *   1. The six approved ship links plus the "Start Lesson Zero" pill
 *      (mockup 4a header, dc.html:322-323).
 *   2. The three links the live header carries today — /studio, /neon and the
 *      bare https://yymethod.com root. These are NOT dropped in favour of the
 *      artboard's six; R7 says add the new and keep the old, so the header
 *      ships two tiers.
 *   3. The four destinations, which are NOT redefined here: they render from
 *      `content/site-config.ts` `destinations[]` (see `footerDoorLabel`).
 *
 * These are route labels and chrome, not curriculum prose: every string is a
 * surface name drawn in the approved artboard or already live in
 * `app/layout.tsx`. Nothing here is written in Ben's first person (R10).
 */

import { type DestinationId, destinations } from "@/content/site-config";
import { WYS_NAV_RETIRED } from "@/content/watch-your-step/config";

export interface NavItem {
  href: string;
  label: string;
  /** Rendered as a plain <a> with rel="noreferrer" and no target. */
  external?: boolean;
}

/**
 * Tier 1 — the six approved ship links (mockup 4a, dc.html:323), in the
 * artboard's order. "Crew" and "Ben" are the artboard's labels; the pages they
 * open are the Crew Manifest and the Captain's Quarters.
 */
export const shipNav: readonly NavItem[] = [
  { href: "/watch-your-step", label: "Watch Your Step" },
  { href: "/bridge", label: "Bridge" },
  { href: "/standing-orders", label: "Standing Orders" },
  { href: "/ships-log", label: "Ship's Log" },
  { href: "/crew", label: "Crew" },
  { href: "/ben", label: "Ben" }
];

/** The teal nav CTA (mockup 4a, dc.html:324). Teal is reserved for it (§4.7.2). */
export const lessonZeroCta: NavItem = {
  href: "/watch-your-step/start",
  label: "Start Lesson Zero"
};

/**
 * Developer Forward — the site's primary product entry (layer-01
 * CURRENT_SITE_INTEGRATION_NOTES, "replace primary Watch Your Step product
 * entry with Developer Forward"). `/developer-forward` is the canonical public route
 * under Ben's 2026-09-07 routes ruling; `/developer-forward-lite` is the sandbox
 * and is reached from it rather than from the chrome.
 */
export const developerForwardNav: NavItem = {
  href: "/developer-forward",
  label: "Developer Forward"
};

/**
/**
 * CONSOLIDATION, 2026-09-08 (Ben): *"remove Bridge, Standing Orders, Ship's
 * Log, Crew, Ben from the top menu … we're consolidating until i can build it
 * out more."*
 *
 * The five ship routes still EXIST and are still served — `/bridge`,
 * `/standing-orders`, `/ships-log`, `/crew` and `/ben` all have page files and
 * `tests/preserved-surfaces.test.ts` still asserts every one of them. What
 * changed is discovery, not existence, which is the same distinction
 * `WYS_NAV_RETIRED` already draws for the course. A separate flag rather than
 * an edit to `shipNav`, for the reason that inventory exists at all: a label is
 * the name of a node, and the way to stop advertising a room is to stop
 * pointing at it, not to forget what it is called.
 *
 * One flag, one line to reverse. The five come back by setting this to `false`.
 */
export const SHIP_NAV_CONSOLIDATED = true;

/**
 * WHAT THE CHROME ACTUALLY RENDERS.
 *
 * `shipNav` and `lessonZeroCta` above are the INVENTORY — the course's names,
 * kept in this file because a label is a name for a node and deleting it would
 * lose that name. These two exports are the PUBLIC VIEW, and they drop the
 * Watch Your Step entry and its CTA while `WYS_NAV_RETIRED` is true and the
 * five remaining ship links while `SHIP_NAV_CONSOLIDATED` is true.
 *
 * The split matters: neither retirement is a deletion, and keeping the
 * inventory intact is what makes each one a constant to reverse.
 */
export const publicShipNav: readonly NavItem[] = SHIP_NAV_CONSOLIDATED
  ? [developerForwardNav]
  : WYS_NAV_RETIRED
    ? [developerForwardNav, ...shipNav.filter((item) => item.href !== "/watch-your-step")]
    : [developerForwardNav, ...shipNav];

/** Null while the course is retired, so no chrome can render a dead CTA. */
export const publicLessonZeroCta: NavItem | null = WYS_NAV_RETIRED ? null : lessonZeroCta;

/**
 * Tier 2 — the inventory the live header carries today, preserved verbatim
 * including the bare `https://yymethod.com` root and its `rel="noreferrer"`,
 * no-`target` treatment (app/layout.tsx before Phase 5).
 *
 * TWO DISTINCT yymethod.com HREFS MUST BOTH SURVIVE (§3.3). This one is the
 * site root, labelled "YY Method™"; `destinations[0].url` is
 * `https://yymethod.com/doctrine`, labelled "YY Method doctrine" in the footer
 * by `footerDoorLabel` below. They are two links, not one, and
 * `tests/preserved-surfaces.test.ts` asserts each separately.
 */
export const ecosystemNav: readonly NavItem[] = [
  { href: "/studio", label: "Violin for Parents" },
  { href: "/neon", label: "Neon" },
  { href: "https://yymethod.com", label: "YY Method™", external: true }
];

/**
 * Footer door labels, as the OVERLAY §3.3 authorises — never a field added to
 * the frozen `content/site-config.ts`.
 *
 * Default: the `eyebrow` field, so the four URLs are preserved by construction
 * and the ™ ships as the reported deviation from the artboard's bare
 * "YY Method" label (dc.html:428).
 *
 * ONE OVERRIDE: `destinations[0]` ("YY Method™" → /doctrine) would otherwise
 * render an identical accessible name to the tier-2 root link in the same
 * footer, two links with one name and two destinations. §3.3's two-distinct-
 * labels rule settles it: "YY Method doctrine" here, "YY Method™" for the root.
 */
const FOOTER_DOOR_LABEL_OVERRIDES: Partial<Record<DestinationId, string>> = {
  method: "YY Method doctrine"
};

export function footerDoorLabel(id: DestinationId, eyebrow: string): string {
  return FOOTER_DOOR_LABEL_OVERRIDES[id] ?? eyebrow;
}

/** The four doors as the footer renders them, in the artboard's order. */
export const footerDoors: readonly NavItem[] = destinations.map((destination) => ({
  href: destination.url,
  label: footerDoorLabel(destination.id, destination.eyebrow),
  external: true
}));
