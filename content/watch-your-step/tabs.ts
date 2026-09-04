/**
 * The course tab bar (plan §5.4; mockup 5b/5c, dc.html:99, :119, :146, :176,
 * :209, :474).
 *
 * Five items, in the artboard's order: Today · Plan · Progress · Practice ·
 * Data. **No "Chat" tab**, and no sixth item — (WYS §5.2) makes this
 * course-internal navigation only and it is never a substitute for site
 * navigation, which is why the labels are bare nouns rather than a second
 * inventory of the ship.
 *
 * WHY THIS IS NOT IN `content/nav.ts`. `nav.ts` holds SITE navigation, and
 * `tests/preserved-surfaces.test.ts` reads every internal href written there
 * and fails if one has no page file behind it — the "nothing new ships dead"
 * half of the deletion contract. That is the right rule for site chrome. The
 * course tabs are a different object: they are the inside of one product, they
 * are asserted against `WYS_ROUTES` (the single list of the course's own URLs)
 * by `tests/wys-shell.test.ts`, and the five screens behind them land with the
 * five Phase 7 view builders rather than with the shell.
 *
 * TAB LABELS ARE NOT PAGE TITLES. "Data" is the tab; the page is titled
 * `wysLabels.dataPageTitle` and linked from outside the course as
 * `wysLabels.dataPageLinkLabel` (Q6, pinned in `./copy.ts`). Three
 * presentations, one node — the tab label is not a fourth name for it, it is
 * the artboard's own word for the tab.
 *
 * No provenance records live here (they are route labels, like `content/nav.ts`),
 * so this module is declared record-free in `./index.ts`.
 */

import type { WysWeek } from "./types";
import { stopLetter } from "./weeks";

export interface WysCourseTab {
  href: string;
  /** The artboard's label, verbatim. */
  label: string;
}

export const courseTabs: readonly WysCourseTab[] = [
  { href: "/watch-your-step/today", label: "Today" },
  { href: "/watch-your-step/plan", label: "Plan" },
  { href: "/watch-your-step/progress", label: "Progress" },
  { href: "/watch-your-step/practice", label: "Practice" },
  { href: "/watch-your-step/data", label: "Data" }
];

export const COURSE_TAB_HREFS: readonly string[] = courseTabs.map((tab) => tab.href);

/**
 * The accessible name of the tab bar's `<nav>` landmark.
 *
 * The artboard draws no name, and an unnamed second navigation landmark on a
 * page that already carries "Primary navigation", "Ship navigation" and
 * "Legal and company information" is a defect a screen-reader user meets
 * before anyone else (WYS §27, §29.3). Authored, and reported as an addition.
 */
export const COURSE_TAB_NAV_LABEL = "Course sections";

/**
 * Which tab, if any, is current for a pathname.
 *
 * Exact match only, and that is the §5.4 rule rather than an implementation
 * shortcut: **the landing renders the tab bar with NO active item.** The
 * artboard bolds "Today" for a visitor with zero state, which would present an
 * empty course as the current place. The per-stop route (`/stop/[stopId]`) is
 * likewise not a tab — it is deep-linked from Plan and from the path strip, and
 * marking Today active there would name a screen the learner is not on.
 */
export function activeCourseTab(pathname: string | null | undefined): string | undefined {
  if (!pathname) return undefined;
  return COURSE_TAB_HREFS.includes(pathname) ? pathname : undefined;
}

/**
 * The per-stop route's own labels (plan §5.3, §5.2).
 *
 * `/watch-your-step/stop/[stopId]` is **required and undesigned**: §5.2 marks
 * it "NEW — required, undesigned", because Plan's nine rows and the path strip
 * both link to a per-stop surface that no artboard draws. So these four strings
 * are AUTHORED by this build, not taken from an artboard, and they are recorded
 * as authored in `docs/facelift-unapproved.md`.
 *
 * They are navigation labels, deliberately: the stop route is a signpost, not a
 * second Today. It says which stop this is, where the learner is in it, and how
 * to get to the surface that does the work. Anything more would be a second
 * canonical node for one concept (§5.1).
 *
 * "Lesson 0" rather than "Lesson Zero" is the artboard's own form for the
 * numbered cell (`5b` Plan's first row, `StopCard`'s `lesson` state); "Lesson
 * Zero" is the name of the onboarding FLOW at `/watch-your-step/start`. Two
 * surfaces, two names, on purpose.
 */
export const stopRouteLabels = {
  lessonZeroName: "Lesson 0",
  /** Composed with the derived letter: "Stop A". The letter is never typed. */
  stopNamePrefix: "Stop",
  openInToday: "Open this stop in Today",
  backToPlan: "Back to the plan"
} as const;

/**
 * "Stop A" / "Lesson 0" — the name of a stop as a NAVIGATION label.
 *
 * Deliberately not the stop's `title`: titles A-H are draft implementation
 * scaffold (WYS §11) and are blocked from public rendering while Q21's default
 * holds, whereas the letter is derived structure and is always true. That is
 * also why a page TITLE and a route CANONICAL may use this and must never use
 * `week.title` — a metadata title is a published string, and publishing a
 * scaffold title would put draft prose in a search result.
 *
 * The letter itself comes from `stopLetter()` in `./weeks.ts` — imported, not
 * re-derived, because the letter is derived structure with one definition
 * (§6.9) and two copies of `String.fromCharCode(64 + order)` is two places to
 * be wrong.
 */
export function stopDisplayName(week: WysWeek): string {
  const letter = stopLetter(week);
  return letter ? `${stopRouteLabels.stopNamePrefix} ${letter}` : stopRouteLabels.lessonZeroName;
}
