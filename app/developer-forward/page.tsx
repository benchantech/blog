import type { Metadata } from "next";
import Link from "next/link";
import { LANDING_FAQ } from "@/content/developer-forward/copy";
import { DEVELOPER_FORWARD_CURRENT_STATUS } from "@/content/developer-forward/current-status";
import { absoluteUrl } from "@/content/canonical-surfaces";
import styles from "./developer-forward.module.css";

function faqStructuredData(): string {
  const payload = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl("/developer-forward")}#faq`,
    mainEntity: LANDING_FAQ.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer }
    }))
  };
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export const metadata: Metadata = {
  title: "Developer Forward — Developer Judgment in the AI Era | BenChanTech",
  description:
    "Developer Forward is Ben Chan Tech's evidence surface for developer judgment in AI-assisted engineering: what to trust, verify, delegate, promise, and take back.",
  alternates: { canonical: "/developer-forward" }
};

export default function DeveloperForwardPage() {
  const status = DEVELOPER_FORWARD_CURRENT_STATUS;

  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqStructuredData() }} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLead}>
            <p className={styles.eyebrowOnInk}>
              <span className={styles.dot} aria-hidden="true" />
              {status.eyebrow}
            </p>
            <h1 className={styles.title}>Developer Forward</h1>
            <p className={styles.prompt}>{status.heading}</p>
            <p className={styles.cardBodyOnInk}>{status.body}</p>
            <div className={styles.ctaRow}>
              <Link className={styles.ctaFilled} href="/developer-forward-lite">
                {status.liteCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.band}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Current direction</p>
          <h2 className={styles.sectionHeading}>{status.futureLabel}</h2>
          <p className={styles.cardBody}>{status.futureBody}</p>
        </div>
      </section>

      <section className={styles.method}>
        <div className={styles.innerSplit}>
          <div>
            <p className={styles.eyebrow}>What remains load-bearing</p>
            <h2 className={styles.sectionHeading}>{status.evidenceHeading}</h2>
          </div>
          <div className={styles.methodBody}>
            <p className={styles.methodLead}>{status.evidenceBody}</p>
            <div className={styles.offer}>
              <p className={styles.offerBridge}>{status.corpusHeading}</p>
              <p className={styles.offerLimit}>{status.corpusBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.band}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Questions Developer Forward answers</p>
          <h2 className={styles.sectionHeading}>Developer judgment for AI-assisted engineering</h2>
          <ul className={styles.faq}>
            {LANDING_FAQ.map((entry) => (
              <li className={styles.faqItem} key={entry.question}>
                <h3 className={styles.faqQuestion}>{entry.question}</h3>
                <p className={styles.faqAnswer}>{entry.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.close}>
        <div className={styles.closeInner}>
          <h2 className={styles.closeHeading}>{status.closeHeading}</h2>
          <p className={styles.closeBody}>{status.closeBody}</p>
          <div className={styles.ctaRowCentred}>
            <Link className={styles.ctaFilled} href="/developer-forward-lite">
              {status.liteCta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
