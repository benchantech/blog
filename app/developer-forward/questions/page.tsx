import type { Metadata } from "next";
import Link from "next/link";
import {
  DEVELOPER_FORWARD_ANSWERS,
  DEVELOPER_FORWARD_QUESTIONS_INDEX
} from "@/content/developer-forward/answer-surfaces";
import styles from "@/components/developer-forward/answer-surface.module.css";

export const metadata: Metadata = {
  title: DEVELOPER_FORWARD_QUESTIONS_INDEX.metadataTitle,
  description: DEVELOPER_FORWARD_QUESTIONS_INDEX.metadataDescription,
  alternates: { canonical: "/developer-forward/questions" }
};

export default function DeveloperForwardQuestionsPage() {
  return (
    <article className={styles.page}>
      <header className={styles.hero}><div className={styles.inner}>
        <p className={styles.eyebrow}>{DEVELOPER_FORWARD_QUESTIONS_INDEX.eyebrow}</p>
        <h1 className={styles.title}>{DEVELOPER_FORWARD_QUESTIONS_INDEX.title}</h1>
        <p className={styles.answer}>{DEVELOPER_FORWARD_QUESTIONS_INDEX.introduction}</p>
      </div></header>
      <section className={styles.section}><div className={styles.inner}>
        <div className={styles.linkGrid}>
          {DEVELOPER_FORWARD_ANSWERS.map((answer) => <Link className={styles.linkCard} style={{ color: "inherit", borderColor: "var(--border-card)" }} href={`/developer-forward/questions/${answer.slug}`} key={answer.slug}>{answer.question}</Link>)}
        </div>
        <Link className={styles.back} style={{ color: "var(--accent-text-on-tint)" }} href="/developer-forward">{DEVELOPER_FORWARD_QUESTIONS_INDEX.backLabel}</Link>
      </div></section>
    </article>
  );
}
