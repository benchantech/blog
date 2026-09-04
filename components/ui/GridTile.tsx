import type { ReactNode } from "react";
import { cx } from "@/components/provenance/cx";
import styles from "./primitives.module.css";

/**
 * GridTile (plan §4.8): the WORK & PROPERTIES tiles. The current-context tile
 * is tint-teal, per the "current / next / selected" fill rule.
 *
 * `href` is optional on purpose. Q5 is open — the Captain's Quarters "Studio /
 * rented laboratory" tile has nowhere correct to point, because `/studio` is the
 * preserved Violin for Parents stakeholder page and cannot be relabelled — and
 * the ratified default is to leave that tile UNLINKED with its label until Ben
 * answers. An unlinked tile has to be expressible, or the default is unbuildable.
 */
export function GridTile({
  title,
  meta,
  href,
  current = false
}: {
  title: string;
  meta?: string;
  href?: string;
  current?: boolean;
}) {
  const className = cx(styles.tile, current && styles.tileCurrent);
  const body = (
    <>
      <span className={styles.tileTitle}>{title}</span>
      {meta ? <span className={styles.tileMeta}>{meta}</span> : null}
    </>
  );
  if (!href) return <div className={className}>{body}</div>;
  return (
    <a className={className} href={href}>
      {body}
    </a>
  );
}

export function GridTiles({ children }: { children: ReactNode }) {
  return <div className={styles.tileGrid}>{children}</div>;
}
