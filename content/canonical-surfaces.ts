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

import { ecosystemNav, lessonZeroCta, shipNav, trustForwardNav } from "@/content/nav";
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
  .concat([{ path: "/system", label: "System", group: "preserved" as const, human: true }]);

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
export const RETIRED_SURFACES: readonly string[] = WYS_NAV_RETIRED
  ? [
      "/watch-your-step",
      lessonZeroCta.href,
      ...courseTabs.map((tab) => tab.href),
      ...WYS_STOP_IDS.map((id) => `/watch-your-step/stop/${id}`),
      "/watch-your-step/end"
    ]
  : [];

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
   * THE INVENTORY, NOT THE MENU (changed 2026-09-08 with
   * `SHIP_NAV_CONSOLIDATED`).
   *
   * This mapped `publicShipNav` — the filtered view the chrome renders — which
   * was right while the two lists agreed. They stopped agreeing when Ben pulled
   * Bridge, Standing Orders, Ship's Log, Crew and Ben out of the top menu:
   * `publicShipNav` went down to Trust Forward alone, and mapping it here would
   * have dropped five LIVE, UNREDIRECTED pages out of the sitemap and
   * /llms.txt in the same edit. Not retired, not canonical, still served —
   * the one state a URL must never be in, and the state
   * `tests/machine-surfaces.test.ts` exists to make impossible.
   *
   * A menu is a discovery decision for humans. This roster is the site's URL
   * inventory, and the two are allowed to differ: `RETIRED_SURFACES` is how a
   * URL leaves the inventory, and it requires a redirect to actually shadow the
   * page. Nothing redirects these five, so they stay.
   *
   * Watch Your Step is the exception, filtered for the opposite reason: it IS
   * retired and IS shadowed, and the same test fails if a route is both retired
   * and canonical.
   */
  ...shipNav
    .filter((item) => item.href !== trustForwardNav.href)
    .filter((item) => !(WYS_NAV_RETIRED && item.href === "/watch-your-step"))
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
