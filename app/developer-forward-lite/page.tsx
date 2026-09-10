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
    <article className={styles.page} id="developer-forward-lite-standalone">
      <style>{`#developer-forward-lite-standalone [class*="coupon"] { display: none !important; }`}</style>
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
