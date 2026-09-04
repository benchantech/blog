import type { Metadata } from "next";
import { keelHashLine, standingOrdersPill } from "@/lib/approval-state";
import {
  type StandingOrder,
  standingOrders,
  standingOrdersIntro
} from "@/content/ship/standing-orders";
import { type GateableRecord, gateProse } from "@/lib/wys/content-gate";
import { Pill } from "@/components/ui/Pill";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { NumberedOrderCard, OrderList } from "@/components/wys/NumberedOrderCard";
import styles from "./standing-orders.module.css";

/**
 * `/standing-orders` (plan Phase 9, §5.2; mockup `5d`, dc.html:239-252).
 *
 * Replaces the Phase 5 stub. Nine numbered cards, verbatim, in the artboard's
 * order — **including 08 "History is preserved, never rewritten." and 09
 * "Mobile first.", which sit below the screenshot fold**: a builder working
 * from `screenshots/*.png` alone would drop two Standing Orders, so the record
 * is the source and the screenshot is not.
 *
 * WHAT THIS FILE DOES NOT CONTAIN: a Standing Order, a keel name, a keel
 * version, a keel URL, an approval word, or the page's own headline. Every one
 * of those is read — from `content/ship/standing-orders.ts` (copy, with its
 * status and origin) and from `lib/approval-state.ts` (governance state). The
 * grey pill above the h1 is `standingOrdersPill()`, so the day Ben stamps the
 * Standing Orders it changes here, in the footer, on the Bridge and in the
 * disclosure strip from ONE typed value and no component edit (§6.6). That is
 * also why `tests/governance-strings.test.ts` can keep banning those literals
 * from everything under `app/`.
 *
 * THE KEEL IS CITED WITHOUT A DIGEST — this phase's exit criterion. (packet:
 * hashing) is freeze -> SHA-256 -> publish on yymethod.com/work -> THEN cite,
 * and Ben has published nothing, so `approvalState.keel.sha256` is null,
 * `standingOrdersIntro.citesHash` is false and no hash line renders. The branch
 * that would render one is kept live rather than omitted so that publishing the
 * digest is a data change and not a component change (WYS §35).
 *
 * NO BEN SLOT ON THIS SURFACE. The `5d` Standing Orders screen draws none —
 * the Bridge position slot and the Captain's Quarters slots live on their own
 * pages — so this page renders no dashed slot and, per R10, no prose written in
 * Ben's first person. Every string it paints is an approved artboard string
 * carried as a content record or a state line computed from `approvalState`.
 *
 * STATIC. No dynamic segment, no runtime read, no learner state: the route
 * builds `○` like every other page in this repo.
 */

export const metadata: Metadata = {
  title: "Standing Orders - BenChanTech",
  alternates: { canonical: "/standing-orders" }
};

/**
 * The gate every string on this page passes through (§6.2).
 *
 * §6.2's rule is that the renderer takes the content OBJECT, not a string, so
 * the words can never travel without the policy that governs them. Here the
 * policy is checked and the words are only released if the record resolves to
 * `canon` — Ben-origin at `published` status.
 *
 * A THROW IS THE CORRECT FAILURE, and it is deliberately louder than the
 * course screens' withheld state. A blocked scenario on Today renders its
 * provenance label in place of the prose, which is honest. A Standing Order
 * that quietly vanished from the list of Standing Orders would not be: the
 * page's whole claim is that these are the rules the site runs on, and a list
 * missing its fourth entry states something false about the ship while looking
 * complete. Every call site here is a server component evaluated at build time,
 * so a status change underneath this page fails `next build` instead of
 * shipping a short list. The message is deliberately short: a long literal in a
 * `.tsx` is prose typed outside `content/`, which the provenance spine forbids
 * (tests/canonical-text.test.ts, no-raw-curriculum-prose).
 */
function canonProse(record: GateableRecord, text: string, what: string): string {
  const content = gateProse("general", record, text);
  if (content.policy.kind === "canon") return content.text;

  const why =
    content.policy.kind === "blocked"
      ? content.policy.reason
      : "it resolved to marked, which this surface does not render";
  throw new Error(
    `/standing-orders: ${what} is not canon — ${why}. ` + "The whole list renders, or the build fails."
  );
}

export default function StandingOrdersPage() {
  const { derivedFrom, keelHref } = standingOrdersIntro;

  // One record, four strings, four policy checks. The keel sentence is three
  // fields rather than one because the middle third is governance state read
  // from `approvalState.keel.name` and the artboard paints exactly that third
  // teal — splitting it is what lets one typed value move the keel's name
  // everywhere without a copy edit.
  const title = canonProse(standingOrdersIntro, standingOrdersIntro.title, "the page title");
  const keelPrefix = canonProse(standingOrdersIntro, derivedFrom.prefix, "the keel citation");
  const keelName = canonProse(standingOrdersIntro, derivedFrom.keelName, "the keel name");
  const keelSuffix = canonProse(standingOrdersIntro, derivedFrom.suffix, "the keel citation");

  // Widened through the declared type, exactly as the course screens widen
  // theirs: `standingOrders` is a `const` tuple whose members have different
  // shapes (only 01 carries a gloss today), so reading `gloss` off the union
  // does not type-check. `StandingOrder` is the shape this page is written
  // against, and widening here checks the records against it rather than
  // against whichever literals happen to be typed this week.
  const records: readonly StandingOrder[] = standingOrders;

  // `emphasis` is data, not a style rule: the artboard happens to draw 01 ink
  // and 02-09 grey, and any order may change fill without a component edit.
  // Same for `gloss` — 01 is the only one that carries one today.
  const orders = records.map((order) => ({
    id: order.id,
    number: order.number,
    title: canonProse(order, order.title, `Standing Order ${order.number}`),
    gloss: order.gloss
      ? canonProse(order, order.gloss, `the gloss on Standing Order ${order.number}`)
      : undefined,
    lead: order.emphasis === "ink"
  }));

  return (
    <article className={styles.page}>
      <p className={styles.pillRow}>
        <Pill variant="draft">{standingOrdersPill()}</Pill>
      </p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lead}>
        {keelPrefix}
        <a className={styles.keel} href={keelHref} rel="noreferrer">
          {keelName}
        </a>
        {keelSuffix}
      </p>
      {standingOrdersIntro.citesHash ? (
        <ProvenanceMono className={styles.keelHash}>{keelHashLine()}</ProvenanceMono>
      ) : null}
      <OrderList>
        {orders.map((order) => (
          <NumberedOrderCard
            key={order.id}
            number={order.number}
            title={order.title}
            gloss={order.gloss}
            lead={order.lead}
          />
        ))}
      </OrderList>
    </article>
  );
}
