import type { Metadata } from "next";
import {
  type QuartersTile,
  quartersAudioSlot,
  quartersGridLabel,
  quartersHistoryNote,
  quartersHistorySlot,
  quartersIntro,
  quartersPortraitSlot,
  quartersTiles
} from "@/content/ship/quarters";
import { gateProse } from "@/lib/wys/content-gate";
import { BenSlot } from "@/components/provenance/BenSlot";
import { MediaSlot } from "@/components/provenance/MediaSlot";
import { GridTile, GridTiles } from "@/components/ui/GridTile";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { AudioSlotPill } from "@/components/wys/AudioSlotPill";
import { GatedText } from "@/components/wys/GatedText";
import styles from "./ben.module.css";

/**
 * Captain's Quarters (plan Phase 9, §5.2; mockup `5d`, dc.html:281-296;
 * packet: quarters-selection-rule). Replaces the Phase 5 stub.
 *
 * THIS IS THE PAGE ABOUT BEN, AND IT CONTAINS NOTHING THIS BUILD WROTE ABOUT
 * BEN. Four of its six blocks are Ben's own material, and all four are empty:
 * the portrait, the 60-second recording and Selected history are labelled
 * slots, and the one paragraph on the screen is the artboard's own sentence
 * about how the page is populated. R10 forbids prose in Ben's first person and
 * §6.4 makes that a compile error rather than a review catch — `MediaSlot`,
 * `AudioSlotPill` and `BenSlot` take a label and an awaited-asset descriptor
 * and declare `children`, `text` and `body` as `never`, so no generated
 * sentence can occupy a space Ben has not filled. The page renders the
 * emptiness legibly instead of covering it.
 *
 * EVERY STRING COMES FROM `content/ship/quarters.ts`. Nothing is typed here —
 * not the eyebrow, not the name, not the grid label, not a tile's sub-line. Two
 * of them could not be typed here even if a builder wanted to: the keel tile's
 * version reads from `lib/approval-state.ts` (§6.6, a governance string moves
 * from one typed value), and three tile labels are the `eyebrow` fields of
 * `content/site-config.ts` `destinations[]`, so this grid and the site footer
 * cannot drift apart (§6.8, Standing Order 07).
 *
 * SIX TILES, NOT FOUR (plan Phase 9). The artboard is `1fr 1fr` followed by six
 * tiles; the handoff README calls it a "2×2 grid" while itself listing six
 * items, and transcribing the README over the artboard would contradict R1 and
 * leave two tiles unaccounted for. `GridTiles` is the 2-column grid, so six
 * tiles fall into 2 × 3.
 *
 * THE STUDIO TILE IS UNLINKED, AND THAT IS THE RATIFIED ANSWER (Q5). `/studio`
 * is the preserved Violin for Parents stakeholder page and may not be
 * relabelled the packet's "rented laboratory", so the tile ships with its label
 * and no target until Ben says where it points. `href: null` in the record
 * becomes a `div` rather than an `a` here — an unlinked tile, never a link back
 * to this page and never a dead one.
 *
 * STATIC, AND WITH NO LEARNER IN IT. No `localStorage` read, no client
 * component, no dynamic segment: the route prerenders `○` with the rest of the
 * build. Nothing on this page varies by visitor, because nothing on it is about
 * the visitor.
 */

export const metadata: Metadata = {
  title: "Ben - BenChanTech",
  alternates: { canonical: "/ben" }
};

/**
 * The tiles, widened through the declared interface.
 *
 * `quartersTiles` is an `as const` literal, so `current` — present on exactly
 * one member — does not exist on the inferred union at all. Reading it off the
 * literal is the Phase 6 trap; reading it off `QuartersTile` is the fix, and it
 * keeps "which tile is the current context" a data question.
 */
const tiles: readonly QuartersTile[] = quartersTiles;

/**
 * A slot's optional geometry, or a build failure.
 *
 * `WysBenSlot` types `medium` and `height` optional because most slots need
 * neither, and `wysBenSlotById` returns the widened interface. The portrait
 * declares both, and both are load-bearing: the height is reserved geometry so
 * the page does not reflow on the day Ben's photograph lands. A missing one is
 * a loud failure at build rather than a silently defaulted layout.
 */
function required<T>(value: T | undefined, field: string): T {
  if (value === undefined) throw new Error(`The portrait slot declares no ${field}.`);
  return value;
}

const portraitMedium = required(quartersPortraitSlot.medium, "medium");
const portraitHeight = required(quartersPortraitSlot.height, "height");

export default function BenPage() {
  // The one paragraph on the screen, and the Selected history card's line, both
  // through the gate: a content record cannot reach this page as a bare string.
  const intro = gateProse("general", quartersIntro, quartersIntro.body);
  const history = gateProse("general", quartersHistoryNote, quartersHistoryNote.body);

  return (
    <article className={styles.page}>
      <div className={styles.portrait}>
        <MediaSlot
          label={quartersPortraitSlot.label}
          awaitedAsset={quartersPortraitSlot.awaitedAsset}
          medium={portraitMedium}
          height={portraitHeight}
          tone="dark"
        />
        {/*
          The eyebrow and the name, reversed out over the stripe. They sit
          beside the slot rather than inside it, because a slot has no prop that
          could carry them — which is the rule working, not a workaround.
        */}
        <div className={styles.portraitCaption}>
          <p className={styles.eyebrowOnInk}>{quartersIntro.eyebrow}</p>
          <h1 className={styles.name}>{quartersIntro.name}</h1>
        </div>
      </div>

      <div className={styles.intro}>
        <GatedText content={intro} />
      </div>

      {/*
        One recording, one slot, three surfaces: this is the same
        `slot-hear-ben-60s` record the home instructor band and the Watch Your
        Step landing render, so the pill cannot say one thing here and another
        there. It is inert until Ben selects a clip — a play control for a
        recording that does not exist would be an affordance for nothing.
      */}
      <div className={styles.audio}>
        <AudioSlotPill
          title={quartersAudioSlot.label}
          sub={quartersAudioSlot.awaitedAsset}
          tone="onLight"
        />
      </div>

      <div className={styles.gridHead}>
        <SectionEyebrow breakpoint="mobile">{quartersGridLabel}</SectionEyebrow>
      </div>
      <div className={styles.tiles}>
        <GridTiles>
          {tiles.map((tile) => (
            <GridTile
              key={tile.id}
              title={tile.label}
              meta={tile.subLabel}
              href={tile.href ?? undefined}
              current={tile.current}
            />
          ))}
        </GridTiles>
      </div>

      {/*
        Selected history — a teal dashed slot, and the last block on the page.

        The heading is the slot's own label (the record derives it, so the card
        and the slot cannot be named two different things), and the line under
        it is the artboard's, which describes what is awaited and states the
        rule the packet requires this page to keep. If that record ever stops
        being renderable as canon, the slot falls back to its own build-language
        descriptor rather than printing unlabelled prose inside a Ben slot.
      */}
      <BenSlot
        label={quartersHistoryNote.heading}
        awaitedAsset={
          history.policy.kind === "canon" ? history.text : quartersHistorySlot.awaitedAsset
        }
      />
    </article>
  );
}
