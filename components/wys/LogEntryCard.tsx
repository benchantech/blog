import type { ReactNode } from "react";
import { Pill } from "@/components/ui/Pill";
import styles from "./wys-primitives.module.css";

/**
 * LogEntryCard (plan §4.8): meta row + status chip + title + body + optional
 * order-tag row.
 *
 * `status` is passed as a string because APPROVAL STATE IS DATA, NEVER COPY
 * (§6.6). Every governance label on screen is rendered from
 * lib/approval-state.ts — this component takes whatever that module computes and
 * never types one itself, which is why the string does not appear in this file.
 */
export function LogEntryCard({
  date,
  status,
  title,
  children,
  orderTags = []
}: {
  date: string;
  status: string;
  title: string;
  children: ReactNode;
  orderTags?: readonly string[];
}) {
  return (
    <article className={styles.logEntry}>
      <div className={styles.logMeta}>
        <span>{date}</span>
        <Pill variant="outlined" size="sm">
          {status}
        </Pill>
      </div>
      <h3 className={styles.logTitle}>{title}</h3>
      <p className={styles.logBody}>{children}</p>
      {orderTags.length > 0 ? (
        <div className={styles.logTags}>
          {orderTags.map((tag) => (
            <Pill variant="white" size="sm" key={tag}>
              {tag}
            </Pill>
          ))}
        </div>
      ) : null}
    </article>
  );
}
