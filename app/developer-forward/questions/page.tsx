import type { Metadata } from "next";
import Link from "next/link";
import { DEVELOPER_FORWARD_ANSWERS } from "@/content/developer-forward/answer-surfaces";
import styles from "@/components/developer-forward/answer-surface.module.css";

export const metadata: Metadata = {
  title: "Developer Judgment Questions | Developer Forward | BenChanTech",
  description: "Evidence-backed answers to practical questions about AI-generated code, verification, delegation, completion, and build-vs-buy judgment.",
  alternates: { canonical: "/developer-forward/questions" }
};

export default function DeveloperForwardQuestionsPage() {
  return (
    <article className={styles.page}>
      <header className={styles.hero}><div className={styles.inner}>
        <p className={styles.eyebrow}>Developer Forward</p>
        <h1 className={styles.title}>Developer judgment questions</h1>
        <p className={styles.answer}>Standalone answers grounded in Ben Chan's real professional cases and current AI-era operating experiments.</p>
      </div></header>
      <section className={styles.section}><div className={styles.inner}>
        <div className={styles.linkGrid}>
          {DEVELOPER_FORWARD_ANSWERS.map((answer) => <Link className={styles.linkCard} style={{ color: "inherit", borderColor: "var(--border-card)" }} href={`/developer-forward/questions/${answer.slug}`} key={answer.slug}>{answer.question}</Link>)}
        </div>
        <Link className={styles.back} style={{ color: "var(--accent-text-on-tint)" }} href="/developer-forward">Developer Forward</Link>
      </div></section>
    </article>
  );
}
