"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/components/provenance/cx";
import styles from "./case.module.css";

/**
 * The one disclosure pattern for the whole of Trust Forward Lite
 * (`UX_COPY.md` "## Global rule", quoted whole because every line of it is a
 * requirement rather than a preference):
 *
 *   > **Shallow by default, deeper on demand.** Use one consistent info
 *   > marker/popover. Tap/click is primary; hover only enhances desktop
 *   > behavior.
 *
 * ONE COMPONENT, NOT A FAMILY. The intro's two `[info]` expansions
 * (`INFO_MARKERS.localOnly`, `INFO_MARKERS.deterministic`), the reflection
 * disclosure and the result page's SHIP explanation are all this component
 * with different props. A second disclosure treatment anywhere in the run
 * breaks "one consistent info marker" as surely as a tooltip would.
 *
 * WHY `<details>`/`<summary>` AND NOT A BUTTON PLUS STATE. The plan's primary
 * QA target is iPhone Safari at ~390 CSS px, and the guarantee that has to
 * survive everything is that TAPPING OPENS IT. `<details>` gives that with no
 * client JavaScript at all: it opens on tap and on click, it is in the tab
 * order without a `tabindex`, it responds to Enter and Space, it announces its
 * expanded state to a screen reader, and it works when hydration fails or is
 * still pending. `components/SiteHeader.tsx` already ships this pattern for the
 * mobile menu for exactly the same reasons.
 *
 * THE CLIENT EFFECT ONLY EVER CLOSES. Escape and an outside pointer close the
 * panel; nothing in this file opens it. That is what keeps the JavaScript
 * genuinely additive — with the effect dead, the marker still opens, still
 * closes on a second tap, and still reads correctly. A component whose OPEN
 * depended on an effect would have made hydration a precondition of the
 * privacy expansion being legible at all.
 *
 * NO HOVER-ONLY CONTENT, ANYWHERE. Hover is styled in `case.module.css` behind
 * `@media (hover: hover) and (pointer: fine)` and it changes the MARKER'S OWN
 * appearance only — border, fill, label colour. It never reveals the
 * expansion. That is the only reading of "hover only enhances" that a touch
 * device can honour, and it is why there is no `onMouseEnter` in this file.
 *
 * THE COMPONENT HOLDS NO WORDS. The trigger and the expansion arrive as props
 * — as one `marker` record, or as the two fields. The strings
 * live in `content/trust-forward/copy.ts` — `INFO_MARKERS`,
 * `REFLECTION.disclosure`, `RESULT.shipExplanation` — because
 * `tests/canonical-text.test.ts` fails on any prose of twelve words or more
 * typed into `app/` or `components/`, and that test is the mechanism behind
 * "all learner-facing prose is governed content". `INFO_MARKERS.localOnly` is
 * the privacy promise for the entire product; it must have exactly one
 * definition, and it is not in this file.
 */
/**
 * The content of one marker: a visible trigger and what it reveals. A marker is
 * a LABEL PLUS AN EXPANSION and never a bare icon — `UX_COPY.md`'s global rule
 * makes tap/click primary, and a marker whose meaning lives in an icon has
 * nothing to announce and nothing to read.
 */
export interface InfoMarkerContent {
  /** The visible trigger text. */
  label: string;
  /**
   * What the disclosure reveals. A node, not a string, so a caller with a list
   * or a nested marker is not forced to flatten it into one paragraph.
   */
  expansion: ReactNode;
}

/**
 * Either the whole record or its two fields, never a mixture.
 *
 * `INFO_MARKERS.localOnly` and `INFO_MARKERS.deterministic` are already
 * `{ id, label, expansion }` records in `content/trust-forward/copy.ts`, so the
 * intro passes `marker={INFO_MARKERS[key]}` and the pairing cannot be split by
 * a caller. The reflection disclosure and `RESULT.shipExplanation` are bare
 * strings on their own surfaces and have no record to pass, so those callers
 * give `label` and `expansion` directly. The union is what stops a third shape
 * — a record AND an overriding label — from existing at all.
 */
type InfoMarkerProps = (
  | { marker: InfoMarkerContent; label?: never; expansion?: never }
  | (InfoMarkerContent & { marker?: never })
) & {
  /** Optional DOM id for the revealed panel, where a caller needs to name it. */
  panelId?: string;
  /** Layout hook for the caller's container. Never a colour or a state. */
  className?: string;
};

export function InfoMarker(props: InfoMarkerProps) {
  const { marker, panelId, className } = props;
  const label = marker ? marker.label : props.label;
  const expansion = marker ? marker.expansion : props.expansion;

  const markerRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const node = markerRef.current;
    if (!node) return;

    const close = () => {
      if (node.open) node.open = false;
    };

    /* Escape closes and RETURNS FOCUS to the summary. Without the second half
       a keyboard user's focus would be left on a node that just left the
       accessible tree, which is the standard disclosure failure. */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !node.open) return;
      close();
      node.querySelector("summary")?.focus();
    };

    /* `pointerdown`, not `click`: it fires for mouse, touch and pen alike, and
       it fires before focus moves, so a tap on another marker closes this one
       and opens that one in the same gesture. */
    const onPointerDown = (event: PointerEvent) => {
      if (!node.open) return;
      const target = event.target;
      if (target instanceof Node && node.contains(target)) return;
      close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <details className={cx(styles.marker, className)} ref={markerRef}>
      <summary className={styles.markerSummary}>
        {label}
        {/* Decorative. The expanded/collapsed state is already announced by
            `<details>` itself, so the glyph must not be read a second time.
            `↓` is one of the six literal characters this build's glyph set
            allows (globals.css §1a); there is no icon set. */}
        <span className={styles.markerGlyph} aria-hidden="true">
          ↓
        </span>
      </summary>
      <div className={styles.markerPanel} id={panelId}>
        {typeof expansion === "string" ? <p className={styles.markerText}>{expansion}</p> : expansion}
      </div>
    </details>
  );
}
