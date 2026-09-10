import Link from "next/link";
import { AI_NATIVE_COMPANY } from "@/content/ai-native-company";
import { stakeholderRoutes } from "@/content/site-config";
import styles from "./ai-native-home.module.css";

const evidenceLinks = [
  { href: "/developer-forward", label: "Developer judgment", title: "Developer Forward" },
  { href: "/developer-forward-lite", label: "Free deterministic experience", title: "Developer Forward Lite" },
  { href: "/neon", label: "Technical case study", title: "Neon / retrieval architecture" },
  { href: "/upwork", label: "Professional evidence", title: "Freelancer to CTO record" },
  { href: "https://yymethod.com", label: "Canonical method", title: "YY Method™", external: true },
  { href: "https://yyandme.benchantech.com", label: "Narrative record", title: "YY & Me", external: true },
  { href: "https://benchanviolin.substack.com", label: "Essays and field notes", title: "Resonant Patterns", external: true }
] as const;

export default function Home() {
  const experiment = AI_NATIVE_COMPANY;

  return (
    <article className={styles.page}>
      <section className={`${styles.section} ${styles.hero}`}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{experiment.eyebrow}</p>
          <h1 className={styles.title}>{experiment.heading}</h1>
          <p className={styles.lede}>{experiment.lede}</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.rule}`}>
        <div><div className={styles.cost}>{experiment.costRule.label}</div></div>
        <div>
          <p className={styles.eyebrow}>The operating constraint</p>
          <h2 className={styles.heading}>{experiment.costRule.heading}</h2>
          <p className={styles.body}>{experiment.costRule.body}</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>The live experiment</p>
          <h2 className={styles.heading}>{experiment.experiment.heading}</h2>
          <p className={styles.body}>{experiment.experiment.body}</p>
          <ul className={styles.measureGrid}>
            {experiment.experiment.measures.map((measure) => <li className={styles.measure} key={measure}>{measure}</li>)}
          </ul>
        </div>
      </section>

      <section className={`${styles.section} ${styles.inkSection}`}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Operating model</p>
          <h2 className={styles.heading}>{experiment.operatingModel.heading}</h2>
          <p className={styles.body}>{experiment.operatingModel.body}</p>
          <p className={styles.small}>{experiment.operatingModel.rule}</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Evidence, not synthetic authority</p>
          <h2 className={styles.heading}>{experiment.evidence.heading}</h2>
          <p className={styles.body}>{experiment.evidence.body}</p>
          <div className={styles.linkGrid}>
            {evidenceLinks.map((item) => item.external ? (
              <a className={styles.linkCard} href={item.href} key={item.href} target="_blank" rel="noopener noreferrer">
                <span className={styles.linkLabel}>{item.label}</span>
                <span className={styles.linkTitle}>{item.title}</span>
              </a>
            ) : (
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
          <p className={styles.eyebrow}>Developer Forward</p>
          <h2 className={styles.heading}>{experiment.developerForward.heading}</h2>
          <p className={styles.body}>{experiment.developerForward.body}</p>
          <div className={styles.linkGrid}>
            <Link className={styles.linkCard} href="/developer-forward">
              <span className={styles.linkLabel}>Indexed evidence surface</span>
              <span className={styles.linkTitle}>Explore Developer Forward</span>
            </Link>
            <Link className={styles.linkCard} href="/developer-forward-lite">
              <span className={styles.linkLabel}>Free · no account · deterministic</span>
              <span className={styles.linkTitle}>Run Developer Forward Lite</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Questions the company is trying to answer</p>
          <h2 className={styles.heading}>{experiment.questions.heading}</h2>
          <ul className={styles.measureGrid}>
            {experiment.questions.items.map((question) => <li className={styles.measure} key={question}>{question}</li>)}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="stakeholder-heading">
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Review routes</p>
          <h2 className={styles.heading} id="stakeholder-heading">Two rooms are built for current reviewers.</h2>
          <div className={styles.linkGrid}>
            {stakeholderRoutes.map((route) => (
              <Link className={styles.linkCard} href={route.url} key={route.id}>
                <span className={styles.linkLabel}>Preserved</span>
                <span className={styles.linkTitle}>{route.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.inkSection}`}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Standing principle</p>
          <p className={styles.principle}>{experiment.principle}</p>
        </div>
      </section>
    </article>
  );
}
