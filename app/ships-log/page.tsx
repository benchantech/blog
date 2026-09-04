import type { Metadata } from "next";
import {
  captainsRoundNote,
  formatLogDate,
  shipsLogIntro,
  shipsLogTimeline,
  type ShipsLogEntry,
  type SupersededPositionItem
} from "@/content/ship/ships-log";
import { standingOrderTag } from "@/content/ship/standing-orders";
import { entryApprovalLabel } from "@/lib/approval-state";
import { allShowable, gateProse, isShowable } from "@/lib/wys/content-gate";
import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { GatedText } from "@/components/wys/GatedText";
import { LogEntryCard } from "@/components/wys/LogEntryCard";
import { ProvenanceMarks } from "@/components/wys/ProvenanceMarks";
import styles from "./ships-log.module.css";

/**
 * The Ship's Log (plan Phase 9; mockup `5d`, dc.html:255-283; packet: Ship's
 * Log). Replaces the Phase 5 stub.
 *
 * WHAT THIS FILE IS ALLOWED TO BE: a renderer. Every string on the screen comes
 * from `content/ship/ships-log.ts`, `content/ship/standing-orders.ts` or
 * `lib/approval-state.ts`. Nothing is typed here — not the pill, not the h1,
 * not an entry body, not a date, and above all not the chip. That is the whole
 * point of §6.6: Ben stamping an entry flips its chip with no edit to this file
 * and no second definition to keep in sync.
 *
 * THE APPEND-ONLY CLAIM IS STRUCTURE, NOT WORDING (Standing Order 08, R8).
 * `shipsLogTimeline()` is the only source of what renders and in what order,
 * and it is where superseded Bridge positions join the entries — so the
 * Bridge's own "every earlier state lives in the Log" is made true by the data
 * model rather than by this page agreeing with it (Q25, ratified). A superseded
 * position is gated on the `"archive"` surface, which returns `marked` and can
 * never return `canon`, so it renders WITH its provenance and can never read as
 * Ben's current position. Today `bridgePositions` is empty, so that branch
 * renders nothing; it is built because the claim is made now and the first
 * supersession must not need a page change to be honoured.
 *
 * FOUR OBJECTS, THREE KINDS. The artboard draws two entry cards and one ink
 * card. The ink card is NOT a third entry: it records nothing, has no date and
 * cannot be stamped, so `captainsRoundNote` is a separate type and sits outside
 * the timeline. Typing a future intention into an append-only record of the
 * past is the exact thing Standing Order 08 exists to prevent.
 *
 * WHY EVERY ENTRY CARRIES TWO MONO LINES. The entries are `published` +
 * `IMPLEMENTATION_PLACEHOLDER` — shipped build records, not Ben's words — so
 * `renderPolicyFor` resolves them to `marked`, which under §6.2 rule 2 means
 * the provenance label AND, for `IMPLEMENTATION_PLACEHOLDER`, the draft mark.
 * The artboard draws neither. Adding them is the permitted direction of
 * override (R9): removing a provenance marker is not, and attributing a drafted
 * build record to Ben is what the marks prevent. They render through
 * `ProvenanceMarks`, once per record rather than once per paragraph.
 *
 * WHY THE MARKS SIT UNDER THE CARD RATHER THAN INSIDE IT. `LogEntryCard`
 * renders its body as a `<p>` and exposes no provenance slot, so a mono line
 * passed as its children would nest `<p>` in `<p>`. The pair is held together
 * by the `<li>` instead. The request for a `provenance` slot on the shared
 * component is recorded in docs/facelift-build-notes.md, not made here.
 *
 * ORDER TAGS ARE REFERENCES, NOT LABELS. `standingOrderTag()` resolves each
 * `StandingOrderId` against `content/ship/standing-orders.ts` and throws on a
 * tag that names no order, so "Order 03" cannot survive the order being
 * renumbered — the Phase 9 exit criterion "every Ship's Log order tag resolves
 * to a real Standing Order" is enforced at build time, not reviewed.
 *
 * NO BEN SLOT ON THIS PAGE. `5d` puts the dashed slot on the Bridge; the Log
 * has none, and nothing here fills one. The h1 IS in Ben's first person — it is
 * approved artboard copy carried verbatim under R1 and Appendix A, flagged as
 * data (`shipsLogIntro.firstPerson`) and escalated in
 * docs/facelift-unapproved.md §SHC2. This build did not write it.
 *
 * STATIC BY CONSTRUCTION. No client component, no `use client`, no state read,
 * no request-dependent value, no date computed at render — `formatLogDate()`
 * parses the stored ISO string, so the page prerenders as `○` and a log date
 * cannot move with the renderer's timezone.
 */

/**
 * Metadata is unchanged from the Phase 5 stub, deliberately: the title is a
 * preserved string and `alternates.canonical` is §5.1's one-canonical-node rule
 * made visible to crawlers. `/ships-log` is the canonical human node for this
 * concept; `/author-ship/state.json` renders the same objects and is not a
 * second one.
 */
export const metadata: Metadata = {
  title: "Ship's Log - BenChanTech",
  alternates: { canonical: "/ships-log" }
};

/**
 * One entry, gated.
 *
 * Title and body come from the same record, so they share one policy and one
 * provenance line. If that policy is ever `blocked`, the card is not rendered
 * with empty prose — the withheld row below is, carrying the date, the chip and
 * the label that says whose words are missing. `gateProse` has already emptied
 * `text` at that point, so neither string can reach the document.
 */
function LogEntry({ entry }: { entry: ShipsLogEntry }) {
  const title = gateProse("general", entry, entry.title);
  const body = gateProse("general", entry, entry.body);
  const date = formatLogDate(entry.date);
  const chip = entryApprovalLabel(entry);

  if (!allShowable(title, body)) {
    return (
      <div className={styles.withheld}>
        <div className={styles.withheldMeta}>
          <span>{date}</span>
          <Pill variant="outlined" size="sm">
            {chip}
          </Pill>
        </div>
        <GatedText content={body} />
      </div>
    );
  }

  return (
    <>
      <LogEntryCard
        date={date}
        status={chip}
        title={title.text}
        orderTags={entry.orderTags.map((id) => standingOrderTag(id))}
      >
        {body.text}
      </LogEntryCard>
      <ProvenanceMarks content={body} />
    </>
  );
}

/**
 * A superseded Bridge position, rendered on the archive surface.
 *
 * The heading is the item's own build language ("Bridge position superseded")
 * and the body is Ben's statement, gated as `human-source` so the label reads
 * "Ben source" — his words, correctly attributed, and marked rather than canon
 * because `renderPolicyFor` refuses `canon` for anything historical. The chip
 * renders from the same `entryApprovalLabel()` every other row uses: nothing on
 * this site is stamped, and a superseded position is no exception.
 *
 * No order tags. Tagging this row would mean typing a Standing Order reference
 * that is not in the record, and this page authors nothing.
 */
function SupersededPosition({ item }: { item: SupersededPositionItem }) {
  const statement = gateProse("human-source", item.position, item.position.statement, "archive");
  const date = formatLogDate(item.date);
  // No argument: `BridgePosition` declares no `approvedBy` / `approvedAt`, so
  // there is no per-record stamp to read and the chip renders the site-wide
  // default. Recorded in docs/facelift-build-notes.md — the fields belong on the
  // record (§6.6 "per-object approval"), and that is a content-module change.
  const chip = entryApprovalLabel();

  if (!isShowable(statement)) {
    return (
      <div className={styles.withheld}>
        <div className={styles.withheldMeta}>
          <span>{date}</span>
          <Pill variant="outlined" size="sm">
            {chip}
          </Pill>
        </div>
        <GatedText content={statement} />
      </div>
    );
  }

  return (
    <>
      <LogEntryCard date={date} status={chip} title={item.heading}>
        {statement.text}
      </LogEntryCard>
      <ProvenanceMarks content={statement} />
    </>
  );
}

export default function ShipsLogPage() {
  const heading = gateProse("general", shipsLogIntro, shipsLogIntro.title);
  const lead = gateProse("general", shipsLogIntro, shipsLogIntro.body);
  const note = gateProse("general", captainsRoundNote, captainsRoundNote.body);
  const timeline = shipsLogTimeline();

  return (
    <article className={styles.page}>
      <p className={styles.pillRow}>
        <Pill variant="status">{shipsLogIntro.pill}</Pill>
      </p>

      {/*
        The h1 is approved, published, Ben-approved copy, so this resolves to
        `canon` and the words render alone. The withheld branch is not
        decoration: if the record's status ever changes, the page loses its h1
        rather than printing a heading the gate has emptied, and a missing h1 is
        the correct alarm for a Log whose own headline is no longer publishable.
      */}
      {isShowable(heading) ? (
        <h1 className={styles.title}>{heading.text}</h1>
      ) : (
        <GatedText content={heading} />
      )}

      <div className={styles.lead}>
        <GatedText content={lead} />
      </div>

      <ol className={styles.timeline}>
        {timeline.map((item) => (
          <li
            className={styles.item}
            key={item.kind === "entry" ? item.entry.id : item.item.id}
          >
            {item.kind === "entry" ? (
              <LogEntry entry={item.entry} />
            ) : (
              <SupersededPosition item={item.item} />
            )}
          </li>
        ))}
      </ol>

      {/*
        Outside the list on purpose. The ink card is what happens next, not
        something that happened, and the timeline is the record of the past.
      */}
      <div className={styles.note}>
        <CardShell fill="ink">
          <p className={styles.noteEyebrow}>{captainsRoundNote.eyebrow}</p>
          <div className={styles.noteBody}>
            <GatedText content={note} tone="dark" />
          </div>
        </CardShell>
      </div>
    </article>
  );
}
