/**
 * Node module hooks that make a `.module.css` import loadable, used ONLY by
 * `scripts/preview-primitives.mjs`.
 *
 * Node cannot load a `.css` specifier, so any component importing a co-located
 * stylesheet dies with ERR_UNKNOWN_FILE_EXTENSION (plan Phase 0, Q15). These
 * hooks resolve such a specifier to a synthetic module whose default export is
 * an identity proxy: `styles.pill` returns the string `"pill"`.
 *
 * That is exactly what the preview needs. The class names the components emit
 * are then the raw ones in the `.module.css` file, so the preview can inline
 * that stylesheet verbatim and render the components' REAL markup — not a
 * hand-copied imitation that would drift the first time a primitive changed.
 *
 * These hooks are NOT registered by `npm test`. Phase 0 settled that at its
 * build-now default: the load-bearing provenance logic is rendering-free and is
 * unit-tested directly, and the label guarantee is a compile error rather than a
 * runtime assertion. Nothing here changes that. Zero dependencies.
 */

import { registerHooks } from "node:module";

const IDENTITY_PROXY_SOURCE =
  "export default new Proxy({}, { get: (_t, key) => (typeof key === 'string' ? key : undefined) });";

export function registerCssModuleHooks() {
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier.endsWith(".css")) {
        return {
          url: new URL(specifier, context.parentURL).href,
          shortCircuit: true,
          format: "module"
        };
      }
      return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
      if (url.endsWith(".css")) {
        return { format: "module", shortCircuit: true, source: IDENTITY_PROXY_SOURCE };
      }
      return nextLoad(url, context);
    }
  });
}
