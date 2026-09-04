import Link from "next/link";
import type { ReactNode } from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import styles from "./StatusPage.module.css";

/**
 * The shared 404 / error surface (plan Phase 5, §5.2).
 *
 * NEW SURFACES, NOT RESTYLES: no artboard draws a 404 or a 500, and the repo
 * had neither file before this phase. Flagged in docs/facelift-unapproved.md.
 *
 * Deliberately short. An error page is the one surface most likely to be
 * screenshotted and quoted, so it states what happened and offers a way out,
 * and it makes no claim about the site, the course or Ben (R10).
 */
export function StatusPage({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  /** Controls only — a link out, a retry. Never an explanation of the failure. */
  children?: ReactNode;
}) {
  return (
    <article className={styles.status}>
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        {children}
        <Link className={styles.link} href="/">
          Back to the foyer →
        </Link>
      </div>
    </article>
  );
}
