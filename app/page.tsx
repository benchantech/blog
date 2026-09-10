import Link from "next/link";
import { cx } from "@/components/provenance/cx";
import { AI_NATIVE_COMPANY, EVIDENCE_LINKS } from "@/content/ai-native-company";
import { stakeholderRoutes } from "@/content/site-config";
import styles from "./ai-native-home.module.css";

/*
 * The evidence cards moved to `content/ai-native-company.ts` on 2026-09-10,
 * with the section eyebrows and the two Developer Forward cards. Declared here
 * as an `as const` array, they typed as a union in which four members had no
 * `external` property — so `item.external` below failed the production
 * typecheck while `next dev` served the page correctly. `EvidenceLink` names
 * the optional flag once.
 */

export default function Home() {
  const experiment = AI_NATIVE_COMPANY;

  return (
    <article className={styles.page}>
      <section className={cx(styles.section, styles.hero)}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{experiment.eyebrow}</p>
          <h1 className={styles.title}>{experiment.heading}</h1>
          <p className={styles.lede}>{experiment.lede}</p>
        </div>
      </section>

      <section className={cx(styles.section, styles.rule)}>
        <div><div className={styles.cost}>{experiment.costRule.label}</div></div>
        <div>
          <p className={styles.eyebrow}>{experiment.eyebrows.costRule}</p>
          <h2 className={styles.heading}>{experiment.costRule.heading}</h2>
          <p className={styles.body}>{experiment.costRule.body}</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{experiment.eyebrows.experiment}</p>
          <h2 className={styles.heading}>{experiment.experiment.heading}</h2>
          <p className={styles.body}>{experiment.experiment.body}</p>
          <ul className={styles.measureGrid}>
            {experiment.experiment.measures.map((measure) => <li className={styles.measure} key={measure}>{measure}</li>)}
          </ul>
        </div>
      </section>

      <section className={cx(styles.section, styles.inkSection)}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{experiment.eyebrows.operatingModel}</p>
          <h2 className={styles.heading}>{experiment.operatingModel.heading}</h2>
          <p className={styles.body}>{experiment.operatingModel.body}</p>
          <p className={styles.small}>{experiment.operatingModel.rule}</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{experiment.eyebrows.evidence}</p>
          <h2 className={styles.heading}>{experiment.evidence.heading}</h2>
          <p className={styles.body}>{experiment.evidence.body}</p>
          <div className={styles.linkGrid}>
            {EVIDENCE_LINKS.map((item) => (item.external ? (
              <a className={styles.linkCard} href={item.href} key={item.href} target="_blank" rel="noopener noreferrer">
                <span className={styles.linkLabel}>{item.label}</span>
                <span className={styles.linkTitle}>{item.title}</span>
              </a>
            ) : (
              <Link className={styles.linkCard} href={item.href} key={item.href}>
                <span className={styles.linkLabel}>{item.label}</span>
                <span className={styles.linkTitle}>{item.title}</span>
              </Link>
            )))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{experiment.eyebrows.developerForward}</p>
          <h2 className={styles.heading}>{experiment.developerForward.heading}</h2>
          <p className={styles.body}>{experiment.developerForward.body}</p>
          <div className={styles.linkGrid}>
            {experiment.developerForwardLinks.map((item) => (
              <Link className={styles.linkCard} href={item.href} key={item.href}>
                <span className={styles.linkLabel}>{item.label}</span>
                <span className={styles.linkTitle}>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{experiment.eyebrows.questions}</p>
          <h2 className={styles.heading}>{experiment.questions.heading}</h2>
          <ul className={styles.measureGrid}>
            {experiment.questions.items.map((question) => <li className={styles.measure} key={question}>{question}</li>)}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="stakeholder-heading">
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{experiment.eyebrows.reviewers}</p>
          <h2 className={styles.heading} id="stakeholder-heading">{experiment.reviewers.heading}</h2>
          <div className={styles.linkGrid}>
            {stakeholderRoutes.map((route) => (
              <Link className={styles.linkCard} href={route.url} key={route.id}>
                <span className={styles.linkLabel}>{experiment.reviewers.cardLabel}</span>
                <span className={styles.linkTitle}>{route.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={cx(styles.section, styles.inkSection)}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{experiment.eyebrows.principle}</p>
          <p className={styles.principle}>{experiment.principle}</p>
        </div>
      </section>
    </article>
  );
}
