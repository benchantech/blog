"use client";

import type { GatedContent } from "@/lib/wys/content-gate";
import { practiceLabels } from "@/content/watch-your-step/practice";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { trackWys } from "@/lib/wys/telemetry";
import { ActionPill } from "@/components/ui/ActionPill";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { GatedText } from "./GatedText";
import { useWysState } from "./useWysState";
import styles from "./practice.module.css";

/**
 * The appetite filter (plan Phase 7; WYS §21; mockup 5c dc.html:170-174).
 *
 * (WYS §21) opens with the constraint the whole component exists under: "Do not
 * launch the website as a disguised Studio acquisition funnel." So this is one
 * outlined pill on the quietest surface in the course, and everything a growth
 * team would add to it is absent BY CONSTRUCTION rather than by restraint:
 *
 *   no email field          — there is no input in this file
 *   no chat                 — there is no chat anywhere in this build
 *   no unlock               — nothing branches on `deeperPracticeInterest`
 *   no feature catalog      — nothing is listed, teased or previewed
 *   no mailing-list consent — the site has no list, and §21 forbids conflating
 *                             the two even when it has one
 *   not visually rewarded   — the recorded state is 11px mono in the muted
 *                             provenance voice, not a tick, a colour change or
 *                             a thank-you
 *
 * WHAT HAPPENS ON CLICK, in order: the interest is recorded locally under the
 * declared `appetite` field, and `wys_depth_interest` is fired **bare**. The
 * event's own decision row in `lib/wys/telemetry.ts` sets the exposure at "The
 * event name. Not the free-text reason" — there is no free-text reason to send
 * because there is no field to type one in. `trackWys` refuses to send unless
 * `bct_analytics_consent === "granted"`, so a visitor who declined analytics
 * produces no network request from this component and their interest stays in
 * their own browser.
 *
 * THE LOCAL RECORD IS WHAT MAKES THE PILL HONEST. "One anonymous count" is true
 * of the analytics event; the local flag is what stops the pill asking twice
 * and what the Data page reads to show the learner their own answer. Both are
 * the same click, and the pill is disabled afterwards so a second click cannot
 * inflate the one number §2.1 says Ben will read.
 *
 * ORDER OF OPERATIONS MATTERS. The local write happens first. If analytics is
 * blocked, declined, or the measurement id is unset, the learner's own record
 * is still made — the browser-local half of this feature does not depend on the
 * telemetry half working.
 *
 * IT IS NOT A KPI. §21: "A high unlock-interest number is not a KPI to maximize
 * through interface pressure." Nothing on this surface repeats the ask, nudges,
 * re-renders it larger, or shows it again after it is answered.
 */
export function AppetiteCard({ explanation }: { explanation: GatedContent }) {
  const { loaded, state, update } = useWysState(WYS_DOMAINS);
  const recorded = loaded && state.appetite?.deeperPracticeInterest === true;

  function record(): void {
    update((current) => ({
      ...current,
      appetite: { ...(current.appetite ?? {}), deeperPracticeInterest: true, recordedAt: new Date().toISOString() }
    }));
    trackWys("wys_depth_interest");
  }

  return (
    <div className={styles.appetite}>
      <div className={styles.appetiteBody}>
        <GatedText content={explanation} />
      </div>

      <ActionPill variant="outlined" full disabled={recorded} onClick={record}>
        {practiceLabels.deeperPractice}
      </ActionPill>

      {recorded ? (
        <div className={styles.appetiteRecorded}>
          <ProvenanceMono>{practiceLabels.appetiteRecorded}</ProvenanceMono>
        </div>
      ) : (
        <p className={styles.appetiteNote}>{practiceLabels.appetiteNote}</p>
      )}
    </div>
  );
}
