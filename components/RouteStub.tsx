import Link from "next/link";
import { Pill } from "@/components/ui/Pill";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import styles from "./RouteStub.module.css";

/**
 * A route that exists but has no content yet (plan Phase 5).
 *
 * Phase 5 mounts a header with six ship links and a CTA, and a disclosure
 * strip pointing at the Crew Manifest. Seven of those destinations do not get
 * their real content until Phases 7 and 9, so without these stubs the phase's
 * own "no dead links" exit is unmeetable. Stubbing
 * `/watch-your-step` and `/watch-your-step/start` here has a second purpose: it
 * proves §5.4's `(shell)` / `(flow)` route-group split before Phase 7 depends
 * on it.
 *
 * WHAT A STUB MAY NOT DO: claim to be the surface it is standing in for. It
 * carries a grey draft pill, an 11px mono state line naming the phase that
 * fills it, and nothing else. No Ben-attributed prose, no invented position,
 * no summary of a page that has not been written (R9, R10).
 */
export function RouteStub({
  eyebrow,
  title,
  buildPhase
}: {
  eyebrow: string;
  title: string;
  /** e.g. "phase 7". Rendered in the mono state line, never as a promise. */
  buildPhase: string;
}) {
  return (
    <article className={styles.stub}>
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.pillRow}>
        <Pill variant="draft">in build</Pill>
      </p>
      <ProvenanceMono>content lands in {buildPhase}</ProvenanceMono>
      <p className={styles.back}>
        <Link href="/">Back to the foyer →</Link>
      </p>
    </article>
  );
}
