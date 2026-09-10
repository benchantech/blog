import Link from "next/link";
import type { DeveloperForwardAnswer } from "@/content/developer-forward/answer-surfaces";
import { developerForwardAnswer } from "@/content/developer-forward/answer-surfaces";
import styles from "./answer-surface.module.css";

export function AnswerSurface({ answer }: { answer: DeveloperForwardAnswer }) {
  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Developer Forward · answer surface</p>
          <h1 className={styles.title}>{answer.title}</h1>
          <p className={styles.answer}>{answer.answer}</p>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Evidence</p>
          <h2 className={styles.heading}>{answer.evidenceCase}</h2>
          <ul className={styles.evidenceList}>
            {answer.evidence.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className={`${styles.section} ${styles.tint}`}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>What changes now</p>
          <p className={styles.body}>{answer.currentApplication}</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Boundary</p>
          <p className={styles.body}>{answer.boundary}</p>
          <p className={styles.provenance}>{answer.provenance}</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.ink}`}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Related questions</p>
          <div className={styles.linkGrid}>
            {answer.related.map((slug) => {
              const related = developerForwardAnswer(slug);
              return <Link className={styles.linkCard} href={`/developer-forward/questions/${slug}`} key={slug}>{related.question}</Link>;
            })}
          </div>
          <Link className={styles.back} href="/developer-forward">Developer Forward</Link>
        </div>
      </section>
    </article>
  );
}
