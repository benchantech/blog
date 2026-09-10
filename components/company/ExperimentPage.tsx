import Link from "next/link";
import type { CompanyExperiment } from "@/content/company/experiments";
import styles from "./experiment.module.css";

export function ExperimentPage({ experiment }: { experiment: CompanyExperiment }) {
  return <article className={styles.page}>
    <header className={styles.hero}><div className={styles.inner}>
      <p className={styles.eyebrow}>Ben Chan Tech · experiment · {experiment.status}</p>
      <h1 className={styles.title}>{experiment.title}</h1>
      <p className={styles.question}>{experiment.question}</p>
      <p className={styles.date}>Observed {experiment.date}</p>
    </div></header>
    <section className={styles.section}><div className={styles.inner}><p className={styles.eyebrow}>Observation</p><p className={styles.body}>{experiment.observation}</p></div></section>
    <section className={`${styles.section} ${styles.tint}`}><div className={styles.inner}><p className={styles.eyebrow}>Evidence</p><ul className={styles.list}>{experiment.evidence.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
    <section className={styles.section}><div className={styles.inner}><p className={styles.eyebrow}>Current conclusion</p><p className={styles.body}>{experiment.currentConclusion}</p><h2 className={styles.heading}>Still unresolved</h2><p className={styles.body}>{experiment.unresolvedBoundary}</p><Link className={styles.back} href="/experiments">All experiments</Link></div></section>
  </article>;
}
