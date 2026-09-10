import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY_EXPERIMENTS, EXPERIMENTS_INDEX_COPY } from "@/content/company/experiments";
import styles from "@/components/company/experiment.module.css";
export const metadata: Metadata = { title: EXPERIMENTS_INDEX_COPY.metadataTitle, description: EXPERIMENTS_INDEX_COPY.metadataDescription, alternates: { canonical: "/experiments" } };
export default function Page(){return <article className={styles.page}><header className={styles.hero}><div className={styles.inner}><p className={styles.eyebrow}>{EXPERIMENTS_INDEX_COPY.eyebrow}</p><h1 className={styles.title}>{EXPERIMENTS_INDEX_COPY.title}</h1><p className={styles.question}>{EXPERIMENTS_INDEX_COPY.introduction}</p></div></header><section className={styles.section}><div className={styles.inner}><ul className={styles.list}>{COMPANY_EXPERIMENTS.map((experiment)=><li key={experiment.slug}><Link href={`/experiments/${experiment.slug}`}>{experiment.title}</Link> · {experiment.status}</li>)}</ul><p><Link className={styles.back} href="/experiments/operating-metrics">{EXPERIMENTS_INDEX_COPY.metricsLabel}</Link></p></div></section></article>}
