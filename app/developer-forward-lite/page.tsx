import type { Metadata } from "next";
import { INFO_MARKERS, LITE_INTRO } from "@/content/developer-forward/copy";
import { DEVELOPER_FORWARD_LITE_CURRENT_STATUS } from "@/content/developer-forward/current-status";
import { YYSandbox } from "@/components/developer-forward/yy/YYSandbox";
import styles from "@/components/developer-forward/yy/yy.module.css";

export const metadata: Metadata = {
  title: DEVELOPER_FORWARD_LITE_CURRENT_STATUS.metadataTitle,
  description: DEVELOPER_FORWARD_LITE_CURRENT_STATUS.metadataDescription,
  alternates: { canonical: "/developer-forward-lite" }
};

export default function DeveloperForwardLitePage() {
  return (
    /*
      THE INLINE `<style>` THAT HID THE COUPON IS GONE (2026-09-10).
      It read `[class*="coupon"] { display: none !important }` and was how the
      AI-native pivot dealt with a completion screen still offering a Studio
      coupon. Three things were wrong with it, and this repo already knew all
      three:

        · HIDING IS NOT REMOVING. `tests/developer-forward-yy-reveal.test.ts`
          asserts exactly this for `RevealPanel` — "a rendered-then-hidden panel
          is still in the served HTML" — while this page depended on the
          opposite. The coupon text and its link shipped in the bundle either
          way.
        · IT MATCHED BY SUBSTRING. Any class containing "coupon" disappeared,
          so the honest replacement written today would have been invisible too,
          including the no-upgrade disclosure under it.
        · IT WAS ROUTE-LOCAL. The sandbox renders on one route today; the block
          would have reappeared the moment it rendered on a second.

      The offer is removed at the source instead. See
      `DEVELOPER_FORWARD_LITE_CURRENT_STATUS.completion` and docs/adr/0011.
    */
    <article className={styles.page} id="developer-forward-lite-standalone">
      <YYSandbox>
        <header className={styles.intro}>
          <h1>{LITE_INTRO.heading}</h1>
          <p className={styles.lede}>{LITE_INTRO.lede}</p>
          <p className={styles.time}>{LITE_INTRO.timeEstimate}</p>
          <p className={styles.localOnly}>{INFO_MARKERS.localOnly.label}</p>
        </header>
      </YYSandbox>
    </article>
  );
}
