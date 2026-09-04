import type { Metadata } from "next";
import {
  BRIDGE_POSITION_SLOT_ID,
  bridgeExperiment,
  bridgeIntro,
  bridgeOpenQuestions,
  bridgeSectionLabels,
  bridgeWorkItems,
  currentBridgePosition
} from "@/content/ship/bridge";
import { wysBenSlotById } from "@/content/watch-your-step/sources";
import { bridgeStateLines } from "@/lib/approval-state";
import { type GateableRecord, type GatedContent, gateProse, isShowable } from "@/lib/wys/content-gate";
import { CardShell } from "@/components/ui/CardShell";
import { KvList, KvRow } from "@/components/ui/KvRow";
import { Pill } from "@/components/ui/Pill";
import { BenSlot } from "@/components/provenance/BenSlot";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { ProvenanceMarks } from "@/components/wys/ProvenanceMarks";
import styles from "./bridge.module.css";

/**
 * `/bridge` (plan Phase 9, §5.2; mockup `5d`, dc.html:215-235; packet: Bridge).
 *
 * THE SLOT IS THE POINT OF THE PAGE. The dashed teal card is a `BenSlot`, which
 * takes a label and an awaited-asset descriptor and declares `children`, `text`
 * and `body` as `never` (§6.4). So the sentence it renders — "no draft AI text
 * is shown here, by rule" — is enforced by the type system rather than by this
 * file's restraint: there is no prop through which generated prose could reach
 * it. `currentBridgePosition()` returns null while Ben has written nothing, and
 * the other branch renders his words only when `renderPolicyFor` says `canon`.
 *
 * EVERY GOVERNANCE STRING COMES FROM `lib/approval-state.ts` (§6.6). The state
 * block at the foot of the page is `bridgeStateLines()`, rendered line for
 * line; nothing about the ship's approval state is typed here, so Ben stamping
 * a section moves this page with no copy edit.
 * `tests/governance-strings.test.ts` enforces that by grepping this directory.
 *
 * EVERY PROSE STRING COMES FROM `content/ship/bridge.ts` (§6.2, §6.8), through
 * `gateProse`, so no sentence reaches the DOM without the policy that governs
 * it. Today every Bridge record is `published` + `BEN_APPROVED`, so every gate
 * resolves to `canon` and `ProvenanceMarks` renders nothing — which is why the
 * page looks exactly like the artboard. If a record's status ever changes, its
 * label appears with it or its row does not render at all; neither outcome
 * needs an edit here.
 *
 * WHAT THIS PAGE DELIBERATELY DOES NOT ADD. No summary of the open questions,
 * no gloss on the experiment, no "last updated" line, no nautical sub-headings
 * beyond the artboard's three eyebrows (packet 3.7 rations the metaphor), and
 * not one sentence written in Ben's own voice (plan rule 10).
 *
 * STATIC. A server component with no local-state read during render (§7.3) and
 * no request-dependent code, so the route builds `○` with the rest of the site.
 */

export const metadata: Metadata = {
  title: "Bridge - BenChanTech",
  alternates: { canonical: "/bridge" }
};

/** One gate per string, so the label can never be separated from the body. */
function gate(record: GateableRecord, text: string): GatedContent {
  return gateProse("general", record, text);
}

/**
 * A row and its gate, keeping the two together through the filter.
 *
 * Blocked rows are dropped rather than emptied: `blocked` means "must not
 * render at all" (§6.2 rule 3), and a bare outline where a question used to be
 * would be a claim of its own.
 */
interface GatedRow {
  id: string;
  gate: GatedContent;
}

function gatedRows<T extends GateableRecord & { id: string }>(
  records: readonly T[],
  text: (record: T) => string
): GatedRow[] {
  return records
    .map((record) => ({ id: record.id, gate: gate(record, text(record)) }))
    .filter((row) => isShowable(row.gate));
}

export default function BridgePage() {
  const intro = gate(bridgeIntro, bridgeIntro.body);
  if (!isShowable(intro)) {
    throw new Error("Bridge intro is not renderable — check status and origin.");
  }

  // The slot record is defined once, in content/watch-your-step/sources.ts, and
  // referenced by id (§6.8). This page names no slot copy of its own.
  const slot = wysBenSlotById(BRIDGE_POSITION_SLOT_ID);
  const position = currentBridgePosition();
  const positionGate = position ? gateProse("human-source", position, position.statement) : null;

  const work = bridgeWorkItems.map((item) => ({ item, gate: gate(item, item.label) }));
  const shownWork = work.filter((row) => isShowable(row.gate));
  const questions = gatedRows(bridgeOpenQuestions, (record) => record.question);
  const experiment = gate(bridgeExperiment, bridgeExperiment.body);

  return (
    <article className={styles.bridge}>
      <p className={styles.pillRow}>
        <Pill variant="status">{bridgeIntro.pill}</Pill>
      </p>
      <h1 className={styles.title}>{bridgeIntro.title}</h1>
      <p className={styles.lead}>{intro.text}</p>
      <ProvenanceMarks content={intro} />

      <section className={styles.positionSection}>
        {positionGate && isShowable(positionGate) ? (
          <>
            <p className={styles.position}>{positionGate.text}</p>
            <ProvenanceMarks content={positionGate} />
          </>
        ) : (
          <BenSlot label={slot.label} awaitedAsset={slot.awaitedAsset} />
        )}
      </section>

      {shownWork.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionHead}>{bridgeSectionLabels.workingOn}</h2>
          <KvList>
            {shownWork.map((row) => (
              <div key={row.item.id}>
                <KvRow label={row.gate.text} value={row.item.workStatus} />
                <div className={styles.rowMarks}>
                  <ProvenanceMarks content={row.gate} />
                </div>
              </div>
            ))}
          </KvList>
        </section>
      ) : null}

      {isShowable(experiment) ? (
        <section className={styles.section}>
          <h2 className={styles.sectionHead}>{bridgeSectionLabels.experiment}</h2>
          <CardShell fill="ink">
            <p className={styles.experiment}>
              <b>{bridgeExperiment.lead}</b> {experiment.text}
            </p>
            <ProvenanceMarks content={experiment} tone="dark" />
          </CardShell>
        </section>
      ) : null}

      {questions.length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionHead}>{bridgeSectionLabels.openQuestions}</h2>
          <ul className={styles.questions}>
            {questions.map((row) => (
              <li className={styles.question} key={row.id}>
                {row.gate.text}
                <ProvenanceMarks content={row.gate} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className={styles.state}>
        {bridgeStateLines().map((line) => (
          <ProvenanceMono key={line} size="12">
            {line}
          </ProvenanceMono>
        ))}
      </div>
    </article>
  );
}
