import type { ReactNode } from "react";
import { cx } from "@/components/provenance/cx";
import styles from "./wys-primitives.module.css";

/**
 * NumberedOrderCard (plan §4.8): Standing Order 01 ink, 02-09 tint-grey.
 *
 * The gloss ("AI may execute; only Ben signs.") is an OPTIONAL DATA FIELD, not
 * a style rule — order 01 happens to have one in the artboard, and any order may
 * gain or lose one without a component edit. (WYS §35 requires content and
 * config changes to be cheap; a gloss that only exists because a component
 * hardcodes it for index 0 would fail that.)
 */
export function NumberedOrderCard({
  number,
  title,
  gloss,
  lead = false
}: {
  number: string;
  title: string;
  gloss?: string;
  lead?: boolean;
}) {
  return (
    <li className={cx(styles.order, lead && styles.orderLead)}>
      <div className={styles.orderNumber}>{number}</div>
      <div className={styles.orderTitle}>{title}</div>
      {gloss ? <div className={styles.orderGloss}>{gloss}</div> : null}
    </li>
  );
}

export function OrderList({ children }: { children: ReactNode }) {
  return <ol className={styles.orderList}>{children}</ol>;
}
