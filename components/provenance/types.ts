/**
 * Provenance component PROP SHAPES (plan Phase 1).
 *
 * Types only. There is no JSX in this file and no CSS import — the components
 * that implement these shapes are built in Phase 4, after §4.2's tokens exist,
 * so nothing here can reference an `--accent` or `--muted` that has not been
 * defined yet.
 *
 * Two guarantees are enforced here at the TYPE level rather than by review:
 *
 * 1. §6.2 — the label is structurally inseparable from the body. `label` is a
 *    required, non-optional `ProvenanceLabel`, which is a branded type only
 *    `provenanceLabelFor()` can produce. A hand-typed "BEN'S JUDGMENT" does not
 *    type-check.
 *
 * 2. §6.4 — Ben slots cannot be filled. `MediaSlot`, `DashedSlot` and `BenSlot`
 *    take a label and an awaited-asset descriptor and nothing else. `children`,
 *    `text` and `body` are declared `never`, so a generated string physically
 *    cannot occupy a slot the design labels "Ben source". That makes handoff
 *    README bucket 2 ("never fill with generated text") a compile error rather
 *    than a review catch, and it makes the Bridge's own on-screen rule true:
 *    "Awaiting Ben. No draft AI text is shown here, by rule."
 */

import type {
  DraftMarkVariant,
  OriginFor,
  ProvenanceLabel,
  RenderPolicy,
  SurfaceKind
} from "@/lib/content-status";

/**
 * `ProvenanceLabel` component props.
 *
 * The renderer takes the computed label, not a string it chose. Pass
 * `provenanceLabelFor(surfaceKind, origin)` — nothing else satisfies the type.
 */
export interface ProvenanceLabelProps<K extends SurfaceKind = SurfaceKind> {
  surfaceKind: K;
  origin: OriginFor<K>;
  label: ProvenanceLabel;
  children?: never;
  text?: never;
  body?: never;
}

/**
 * `DraftMark` component props.
 *
 * The mark string is NOT a prop: the component resolves it from
 * `draftMarkFor(variant)`, so no caller can substitute softer wording.
 */
export interface DraftMarkProps {
  variant: DraftMarkVariant;
  children?: never;
  text?: never;
  body?: never;
}

/**
 * The shared shape of every slot awaiting Ben (§6.4, §13.1).
 *
 * `label` is the on-screen slot label ("Ben source · video · 6:40",
 * "BEN'S POSITION · SLOT"). `awaitedAsset` describes what is being waited for,
 * in build language, for the slot's secondary line and for the preview dump.
 */
export interface SlotPropsBase {
  label: string;
  awaitedAsset: string;
  children?: never;
  text?: never;
  body?: never;
}

/** A slot for a recording, portrait or other media Ben supplies. */
export interface MediaSlotProps extends SlotPropsBase {
  medium: "video" | "audio" | "image" | "transcript";
  /** Reserved geometry, so the page does not reflow when Ben's asset lands. */
  width?: number;
  height?: number;
}

/** A dashed outline standing in for material Ben has not written yet. */
export interface DashedSlotProps extends SlotPropsBase {
  tone?: "light" | "dark";
}

/** A named Ben slot — the Bridge position, the judgment header, Selected history. */
export interface BenSlotProps extends SlotPropsBase {
  tone?: "light" | "dark";
}

/**
 * The shape any component that renders content prose must accept: the policy
 * comes with the text, so a component cannot receive the prose without also
 * receiving what it is allowed to do with it (§6.2).
 */
export interface ProvenancedBodyProps {
  policy: RenderPolicy;
  children?: never;
  text?: never;
  body?: never;
}
