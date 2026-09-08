/**
 * The roster of CURRENT canonical surfaces (plan Phase 9; packet:
 * crawl-surfaces, llms-txt-role, canonical-node rule).
 *
 * Three machine surfaces need to answer the same question — "what does this
 * site currently publish?" — and before this module they would each have
 * answered it with their own hand-typed list: `app/sitemap.ts`,
 * `/llms.txt` and `/author-ship/state.json`. Three lists is three chances to
 * drift, which is the failure Standing Order 07 names. So the question is
 * answered ONCE, here, and the three surfaces render it.
 *
 * NOTHING IN THIS FILE IS A SECOND DEFINITION OF A LABEL. The six ship names
 * come from `content/nav.ts` `shipNav`, the Lesson Zero label from
 * `lessonZeroCta`, the five course tabs from `content/watch-your-step/tabs.ts`,
 * the per-stop URLs from `WYS_STOP_IDS`, and the two stakeholder routes and
 * four doors from the frozen `content/site-config.ts` by way of `nav.ts`. Only
 * the legal footer set and the two preserved marketing pages are enumerated
 * here, and `tests/machine-surfaces.test.ts` asserts the roster matches the
 * actual `app/` route tree exactly — every `page.tsx` has one entry, every
 * entry has one `page.tsx` — so a route added later fails a test rather than
 * quietly falling out of the map.
 *
 * CURRENT ONLY. `historical` and `superseded` objects are deliberately absent:
 * the packet's rule is that a crawl surface is "a map of current canonical
 * surfaces only — never a corpus dump, never an indiscriminate enumeration of
 * historical alternatives". Superseded material is reachable through the Ship's
 * Log, which is where it belongs, and `agentBootstrap`'s fourth sentence tells
 * a reader what to do with it.
 *
 * REDIRECTS ARE NOT SURFACES. `/about`, `/lab` and `/posts` are preserved
 * redirects in the frozen `next.config.ts`; they keep working and they are not
 * canonical URLs, so they are not listed. Listing a redirect in a sitemap is
 * how a crawler ends up with two nodes for one concept.
 *
 * `/_not-found` is not a canonical surface either, and neither is the
 * `[stopId]` template — the nine concrete stop URLs are.
 *
 * Pure TypeScript. No JSX and no CSS import, so the test runner can load it
 * (plan Phase 0, Q15).
 */

import {
  SHIP_NAV_CONSOLIDATED,
  ecosystemNav,
  lessonZeroCta,
  publicShipNav,
  shipNav,
  trustForwardNav
} from "@/content/nav";
import { WYS_NAV_RETIRED } from "@/content/watch-your-step/config";
import { courseTabs, stopDisplayName } from "@/content/watch-your-step/tabs";
import { WYS_STOP_IDS, wysWeekById } from "@/content/watch-your-step/weeks";

export type CanonicalSurfaceGroup =
  | "home"
  | "ship"
  | "trust-forward"
  | "course"
  | "legal"
  | "preserved"
  | "machine";

export interface CanonicalSurface {
  /** Root-relative path. The canonical URL of exactly one concept. */
  path: string;
  /** The name this node already has in navigation. Never a second name. */
  label: string;
  group: CanonicalSurfaceGroup;
  /**
   * True where the surface is a page a person reads. `false` for the machine
   * mirrors, which are renderings of the same objects rather than second
   * canonical nodes (packet: canonical-node rule).
   */
  human: boolean;
}

/** The seven legal and company links the footer carries, in the footer's order. */
const LEGAL_SURFACES: readonly CanonicalSurface[] = [
  { path: "/privacy", label: "Privacy", group: "legal", human: true },
  { path: "/terms", label: "Terms", group: "legal", human: true },
  { path: "/cookies", label: "Cookies", group: "legal", human: true },
  { path: "/accessibility", label: "Accessibility", group: "legal", human: true },
  { path: "/ai-disclosure", label: "AI Disclosure", group: "legal", human: true },
  { path: "/copyright", label: "Copyright", group: "legal", human: true },
  { path: "/contact", label: "Contact", group: "legal", human: true }
];

/**
 * The two preserved stakeholder pages, labelled exactly as `ecosystemNav`
 * labels them — `/studio` is the Violin for Parents stakeholder page and is not
 * relabelled here (Q5).
 */
const PRESERVED_SURFACES: readonly CanonicalSurface[] = ecosystemNav
  .filter((item) => !item.external)
  .map((item) => ({ path: item.href, label: item.label, group: "preserved" as const, human: true }))
  .concat(
    /*
     * `/system` joined the consolidation on 2026-09-08 and is listed in
     * `CONSOLIDATED_SURFACES` below rather than here. It is the only page
     * outside the ship group that met Ben's rule — *"nothing is reachable that
     * isn't linked in the main pages"* — because the only thing that ever
     * pointed at it was the `/about` redirect. `/studio` and `/neon` stay:
     * both are in the header menu.
     */
    SHIP_NAV_CONSOLIDATED
      ? []
      : [{ path: "/system", label: "System", group: "preserved" as const, human: true }]
  );

/** The two machine mirrors. Renderings of the same objects, not second nodes. */
export const MACHINE_SURFACE_PATHS = {
  llms: "/llms.txt",
  state: "/author-ship/state.json",
  sitemap: "/sitemap.xml",
  robots: "/robots.txt"
} as const;

const MACHINE_SURFACES: readonly CanonicalSurface[] = [
  { path: MACHINE_SURFACE_PATHS.llms, label: "llms.txt", group: "machine", human: false },
  { path: MACHINE_SURFACE_PATHS.state, label: "Author Ship state", group: "machine", human: false }
];

/** Every stop, as a concrete URL. The `[stopId]` template is not a surface. */
const STOP_SURFACES: readonly CanonicalSurface[] = WYS_STOP_IDS.map((id) => ({
  path: `/watch-your-step/stop/${id}`,
  /**
   * "Lesson 0" / "Stop A" — the NAVIGATION name of the stop, from
   * `content/watch-your-step/tabs.ts`. Not the stop title, which is a working
   * scaffold Ben has not settled, and not the raw id.
   */
  label: stopDisplayName(wysWeekById(id)),
  group: "course" as const,
  human: true
}));

const COURSE_SURFACES: readonly CanonicalSurface[] = [
  { path: lessonZeroCta.href, label: lessonZeroCta.label, group: "course", human: true },
  ...courseTabs.map((tab) => ({
    path: tab.href,
    label: tab.label,
    group: "course" as const,
    human: true
  })),
  ...STOP_SURFACES,
  { path: "/watch-your-step/end", label: "End", group: "course", human: true }
];

/**
 * TRUST FORWARD (plan §9). Two human pages.
 *
 * `/tf` is deliberately ABSENT. It is a redirect, and this roster's own rule is
 * that redirects are not surfaces — listing one is how a crawler ends up with
 * two nodes for one concept.
 */
const TRUST_FORWARD_SURFACES: readonly CanonicalSurface[] = [
  { path: trustForwardNav.href, label: trustForwardNav.label, group: "trust-forward", human: true },
  { path: "/trust-forward-lite", label: "Trust Forward Lite", group: "trust-forward", human: true }
];

/**
 * RETIRED SURFACES — routes with a `page.tsx` on disk that a redirect shadows.
 *
 * This register exists because two true things would otherwise contradict each
 * other. `tests/machine-surfaces.test.ts` asserts the roster and the `app/`
 * tree describe the same site; the deletion contract forbids removing any of
 * the 34 files under `app/watch-your-step/`. So a retired course would leave
 * nine `page.tsx` files with no roster entry and fail parity.
 *
 * Naming them here resolves it honestly: they exist, they are not canonical
 * URLs, and the same test asserts every entry has a matching `permanent: false`
 * redirect in `next.config.ts` — so a route cannot be quietly dropped from
 * discovery without also being quietly redirected, which is the failure this
 * register is really guarding against.
 */
/**
 * The six surfaces the 2026-09-08 consolidation withdrew from discovery.
 *
 * Ben's rule was mechanical: *"nothing is reachable that isn't linked in the
 * main pages."* Applied to the roster it selects exactly these — the five ship
 * pages, whose last in-page links went with the "How the site is run" block,
 * and `/system`, which only the `/about` redirect ever pointed at. Everything
 * else in the roster is linked from the header menu, the footer, or
 * `/trust-forward`.
 *
 * RETIRED IS NOT DELETED, AND IT IS NOT "JUST UNLISTED" EITHER. Every page file
 * is still on disk and `tests/preserved-surfaces.test.ts` still asserts all six
 * exist. What changed is that each now has a `permanent: false` redirect in
 * `next.config.ts`, which is what makes "unreachable" true rather than merely
 * claimed: a page that 200s at a known URL is reachable whether or not a
 * sitemap admits it, and dropping it from the sitemap alone would have hidden
 * it from crawlers while leaving it live for anyone with the link.
 * `tests/machine-surfaces.test.ts` enforces the pairing in both directions.
 *
 * `SHIP_NAV_CONSOLIDATED` is the single flag. Flip it and the menu entries, the
 * roster rows and — via this constant — the redirects all come back together.
 */
const CONSOLIDATED_SURFACES: readonly string[] = SHIP_NAV_CONSOLIDATED
  ? [...shipNav.filter((item) => item.href !== "/watch-your-step").map((item) => item.href), "/system"]
  : [];

export const RETIRED_SURFACES: readonly string[] = [
  ...(WYS_NAV_RETIRED
    ? [
        "/watch-your-step",
        lessonZeroCta.href,
        ...courseTabs.map((tab) => tab.href),
        ...WYS_STOP_IDS.map((id) => `/watch-your-step/stop/${id}`),
        "/watch-your-step/end"
      ]
    : []),
  ...CONSOLIDATED_SURFACES
];

/**
 * Every current canonical surface, human pages first.
 *
 * The Watch Your Step landing is a ship-nav item AND the course's front door;
 * it appears once, under `ship`, because it has one canonical URL.
 */
export const canonicalSurfaces: readonly CanonicalSurface[] = [
  { path: "/", label: "BenChanTech", group: "home", human: true },
  ...TRUST_FORWARD_SURFACES,
  /*
   * THE MENU AGAIN, BECAUSE THE ROUTES ARE NOW SHADOWED (2026-09-08, second
   * pass).
   *
   * For one commit this mapped the full `shipNav` INVENTORY rather than
   * `publicShipNav`. That was the correct reading of the first instruction:
   * Ben had emptied the menu but the five pages were still served, and mapping
   * the menu would have dropped five live, unredirected URLs out of the sitemap
   * — neither retired nor canonical, the one state a URL must never be in.
   *
   * The second instruction closed that gap from the other end: *"hide the links
   * themselves and update the site map so nothing is reachable that isn't
   * linked in the main pages."* The five now have `permanent: false` redirects
   * in `next.config.ts` and sit in `CONSOLIDATED_SURFACES`, so they are
   * genuinely retired — shadowed AND unlisted — and mapping the menu is right
   * again. Nothing about the invariant changed; the world caught up to it.
   */
  ...publicShipNav
    .filter((item) => item.href !== trustForwardNav.href)
    .map((item) => ({
      path: item.href,
      label: item.label,
      group: "ship" as const,
      human: true
    })),
  ...(WYS_NAV_RETIRED ? [] : COURSE_SURFACES),
  ...PRESERVED_SURFACES,
  ...LEGAL_SURFACES,
  ...MACHINE_SURFACES
];

/**
 * Group headings for the machine surfaces.
 *
 * Pinned here rather than typed into `/llms.txt` for the same reason
 * `content/nav.ts` pins the nav labels: a heading is a name for a group of
 * nodes, and a node must not end up with two names. They are labels, not
 * claims, so they carry no provenance record — the same treatment `wysLabels`
 * gives the course's short strings.
 */
export const CANONICAL_SURFACE_GROUP_LABELS = {
  home: "Home",
  ship: "The Author Ship",
  "trust-forward": "Trust Forward",
  course: "Watch Your Step",
  preserved: "Ecosystem and infrastructure",
  legal: "Legal and disclosure",
  machine: "Machine mirrors"
} as const satisfies Record<CanonicalSurfaceGroup, string>;

export const CANONICAL_SURFACE_GROUP_ORDER: readonly CanonicalSurfaceGroup[] = [
  "home",
  "trust-forward",
  "ship",
  "course",
  "preserved",
  "legal",
  "machine"
];

export function surfacesInGroup(group: CanonicalSurfaceGroup): readonly CanonicalSurface[] {
  return canonicalSurfaces.filter((surface) => surface.group === group);
}

/** The human-readable surfaces only — what a sitemap should carry. */
export function humanCanonicalSurfaces(): readonly CanonicalSurface[] {
  return canonicalSurfaces.filter((surface) => surface.human);
}

export function canonicalSurfacePaths(): readonly string[] {
  return canonicalSurfaces.map((surface) => surface.path);
}

/** The absolute origin every canonical URL is stated against. */
export const SITE_ORIGIN = "https://benchantech.com";

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path === "/" ? "" : path}`;
}
