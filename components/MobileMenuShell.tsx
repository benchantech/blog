"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * The mobile menu's interactive shell — and ONLY the shell.
 *
 * WHY THIS FILE EXISTS AT ALL. `components/SiteHeader.tsx` is a server
 * component rendered in the root layout on every page, and its `<details>`
 * menu was chosen precisely so the header would need no client JavaScript: it
 * works with JS off, it is keyboard-operable for free, and it traps nothing.
 * Ben asked for the menu to close when you press outside it or pick an option,
 * and `<details>` alone cannot do either — a disclosure closes only when its own
 * summary is pressed again.
 *
 * So the shell is a client component and NOTHING ELSE MOVED. The links, their
 * `aria-label`, and the nav inventories stay in `SiteHeader.tsx` and arrive here
 * as `children`, already rendered on the server. That is not tidiness: the
 * header's structure is asserted by name in
 * `tests/preserved-surfaces.test.ts` — the preserved landmark, the brand, the
 * wordmark, and that both inventories are rendered — and those assertions read
 * `SiteHeader.tsx`. Moving the markup here would have made a guard about the
 * chrome quietly stop looking at the chrome.
 *
 * STILL A `<details>`, which is the second half of the same decision. This adds
 * behaviour to the native element rather than reimplementing it: with JS
 * disabled the menu still opens and closes on its summary, and every
 * enhancement below is a listener that closes something already closable.
 *
 * NOT A MODAL, DELIBERATELY. No focus trap, no inert background, no
 * `aria-modal`. It is a disclosure in the page's flow, and trapping focus in it
 * would be a promise the layout does not keep — a screen-reader user can and
 * should be able to walk straight past it.
 */
export function MobileMenuShell({
  className,
  summaryClassName,
  label,
  children
}: {
  className: string;
  summaryClassName: string;
  /** The button's text. Authored in `SiteHeader.tsx`, like every other label. */
  label: string;
  /** The `<nav>` and its links, rendered on the server. */
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const menu = ref.current;
    if (!menu) return;

    /*
     * `pointerdown`, not `click`, and on the CAPTURE phase.
     *
     * A `click` listener fires after the press completes, so a learner who
     * presses outside the menu watches it stay open for the length of their
     * own gesture. Capture matters for the second case: a press that lands on
     * a control which stops propagation — anything in the page below — would
     * never reach a bubbling listener, and the menu would sit open over a page
     * that had just responded to them.
     */
    const onPointerDown = (event: PointerEvent) => {
      if (!menu.open) return;
      const target = event.target;
      if (target instanceof Node && menu.contains(target)) return;
      menu.open = false;
    };

    /*
     * Escape closes and RETURNS FOCUS TO THE SUMMARY. Closing alone would drop
     * focus to `<body>`, which sends a keyboard user back to the top of the
     * document to reach anything — the same defect the checkpoint transition in
     * `YYSandbox` was fixed for.
     */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !menu.open) return;
      menu.open = false;
      menu.querySelector("summary")?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  /*
   * Closing on a chosen option, handled on the container rather than on each
   * link: the links are `children` rendered by the server component, so there
   * is nothing here to attach a handler to. `closest("a")` rather than a target
   * check, because a press can land on the external-arrow span inside a link.
   *
   * It fires for external links too, which open in a new tab: leaving the menu
   * standing open over the page someone has just navigated away from is the
   * same defect with a slower reveal.
   */
  const onSelect = (event: React.MouseEvent<HTMLDivElement>) => {
    const menu = ref.current;
    if (!menu || !(event.target instanceof Element)) return;
    if (event.target.closest("a")) menu.open = false;
  };

  return (
    <details className={className} ref={ref}>
      <summary className={summaryClassName}>{label}</summary>
      <div onClick={onSelect}>{children}</div>
    </details>
  );
}
