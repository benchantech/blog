"use client";

import { usePathname } from "next/navigation";
import { COURSE_TAB_NAV_LABEL, activeCourseTab, courseTabs } from "@/content/watch-your-step/tabs";
import { BottomNav } from "@/components/ui/BottomNav";

/**
 * The course tab bar (plan §5.4; mockup 5b/5c, dc.html:99).
 *
 * Five items — Today · Plan · Progress · Practice · Data. No "Chat", no sixth
 * tab, no icons, no badges, no indicator dot (§4.8). `components/ui/BottomNav`
 * supplies the geometry, including `env(safe-area-inset-bottom)` in place of
 * the artboard's fixed 30px bottom pad; this file supplies the inventory and
 * the current item.
 *
 * **THE HREFS ARE REAL DESTINATIONS IN SERVER HTML, ALWAYS** (§5.4). §7.3
 * forbids reading `wys:v1` during render, so the tabs cannot compute a
 * state-dependent target at first paint — which is exactly what a crawler, a
 * no-JS visitor and the first paint all receive, on the one component present
 * on every course page. So the five hrefs are constant, the markup is identical
 * before and after hydration, and the ONE state-dependent branch in the whole
 * course lives at `/watch-your-step/today`, which sends a stateless visitor to
 * onboarding client-side once `loaded === true`. `/data` never redirects.
 *
 * WHY THIS IS A CLIENT COMPONENT AT ALL. Only to know which tab is current:
 * `usePathname` is the sole reason, it renders during SSR too, and the bar is
 * fully usable with JavaScript off — the active item is a font weight, not a
 * function. The alternative, threading a `currentTab` prop through six page
 * files, would put the same fact in six places and let one of them drift.
 *
 * NO ACTIVE ITEM ON THE LANDING, and none on `/stop/[stopId]` — see
 * `activeCourseTab`, where the rule lives with the inventory rather than here.
 */
export function WysBottomNav() {
  const pathname = usePathname();
  return (
    <BottomNav items={courseTabs} activeHref={activeCourseTab(pathname)} label={COURSE_TAB_NAV_LABEL} />
  );
}
