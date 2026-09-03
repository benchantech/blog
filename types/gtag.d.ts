/**
 * Ambient `window.gtag` / `window.dataLayer` types (plan Phase 3, §8.4).
 *
 * This augmentation used to live inside `components/ConsentBanner.tsx:9-13`,
 * where it declared `gtag` as CONSENT-ONLY:
 *
 *     gtag?: (command: "consent", action: "update", params: Record<string, string>) => void;
 *
 * That augmentation is repo-wide under `strict: true`, so the first
 * `gtag("event", …)` anywhere in the codebase fails `next build` type checking.
 * Moving it here and widening it is a TYPE-LOCATION change, not a behaviour
 * change: `components/ConsentBanner.tsx` calls exactly the same function with
 * exactly the same arguments, and `components/GoogleAnalytics.tsx` is untouched.
 *
 * **Do not weaken this to `any`.** The telemetry property allowlist in
 * `lib/wys/telemetry.ts` leans on these types; `any` would silently re-open the
 * "spread an arbitrary object into analytics" path that (WYS §19.5) forbids.
 */

/**
 * The value type a GA4 event property may carry.
 *
 * Deliberately narrow: no `object`, no `unknown`, no index signature over
 * `any`. Passing a `WysLocalStateV1`, a rulebook array or any other structure
 * is a compile error before it is ever a runtime refusal (WYS §34, SC-4).
 */
type GtagPropertyValue = string | number | boolean;

declare global {
  interface Window {
    /**
     * Overloaded, covering both commands this repo issues.
     *
     * Overload 1 is the preserved Consent Mode v2 update issued by
     * `components/ConsentBanner.tsx` — byte-identical in shape to the
     * declaration it replaces.
     *
     * Overload 2 is the WYS event command. `lib/wys/telemetry.ts` does not in
     * fact call it (it pushes to `dataLayer` instead, §8.3), but the overload
     * has to exist or any future direct call is a build breaker again.
     */
    gtag?: {
      (command: "consent", action: "update", params: Record<string, string>): void;
      (command: "event", name: string, props: Record<string, GtagPropertyValue>): void;
    };

    /**
     * `components/GoogleAnalytics.tsx:10` does `window.dataLayer = window.dataLayer || []`
     * and its `gtag()` shim pushes the raw `arguments` object. gtag.js consumes
     * `arguments` objects, so the queue element type is `IArguments`, not a
     * tuple.
     *
     * **Unverified against a live GA4 debug stream** (plan §8.3 asks for one
     * DebugView check before committing to this shape; no live stream was
     * available in this build). Recorded in `docs/facelift-build-notes.md`. If
     * the check later shows a plain tuple is equivalent, widen this to
     * `IArguments[] | unknown[]` and simplify the shim — nothing else changes.
     */
    dataLayer?: IArguments[];
  }
}

export {};
