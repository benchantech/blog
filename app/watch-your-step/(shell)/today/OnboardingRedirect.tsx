"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { useWysState } from "@/components/wys/useWysState";

/**
 * The course's ONE state-dependent redirect (plan §5.4).
 *
 * §5.4 is explicit about where the branch lives: the five tabs always render
 * their real destinations in server HTML, and "the state-dependent branch lives
 * in ONE place instead of five: `/watch-your-step/today` redirects a stateless
 * visitor to `/watch-your-step/start` client-side once `loaded === true`".
 * `/data` never redirects; Plan and Progress have honest zero states. This
 * component is that one place and no other course screen may grow a second.
 *
 * WHY TODAY IS THE EXCEPTION. Today is the one tab with nothing to show without
 * a chosen pace: the visit counter's denominator is the learner's cadence path,
 * so a visitor who has not chosen one has no "visit n of m" to be at. Plan and
 * Progress render truthfully at zero; Today would have to invent a cadence.
 *
 * CLIENT-SIDE, AND `replace` NOT `push`: the route stays statically prerendered
 * (§5.3's "every course route is `○` or `●`, zero `ƒ`"), and a learner who is
 * sent to Lesson Zero and presses Back goes where they came from rather than
 * bouncing between two screens.
 *
 * It renders nothing, and it never redirects a learner who HAS completed
 * onboarding — including one whose storage is blocked, who is left on Today
 * rather than pushed into a flow that could not remember finishing either.
 */
export function OnboardingRedirect() {
  const router = useRouter();
  const { loaded, state, storageBlocked } = useWysState(WYS_DOMAINS);
  const completed = state.onboarding.completed;

  useEffect(() => {
    if (!loaded || storageBlocked) return;
    if (completed) return;
    router.replace("/watch-your-step/start");
  }, [loaded, storageBlocked, completed, router]);

  return null;
}
