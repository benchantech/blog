# Trust Forward Lite — implementation report

**Branch:** `main`. **Plan:** `docs/trust-forward-lite-implementation-plan.md` (rev 7).
**Source authority:** `TRUST_FORWARD_LITE_CODEX_FINAL_LITE_GATES_RESOLVED_2026-09-07` (86 files, manifest verified).

## Status

| Gate | Result |
|---|---|
| `npm test` | **690 pass, 0 fail** (baseline was 523; 165 new + 2 governance additions) |
| `npx tsc --noEmit` | clean |
| `npm run build` | succeeds; both routes prerendered static |
| `check-bundle-provenance.mjs` | **OK — 583 withheld strings, none in 58 client bundles** |
| `scripts/check-no-deletions.sh` | **OK — nothing deleted or renamed** |
| `npm run lint` | **NOT A GATE IN THIS REPO** — `next lint` prompts for setup because no ESLint config exists. Pre-existing; see below. |

## What shipped

- **Routes.** `/trust-forward` (1.75 kB) and `/trust-forward-lite` (28.4 kB), both static. `/tf`
  redirects to Studio. The whole five-case run lives at ONE URL — GA4 ships `send_page_view: true`,
  so a path or query carrying learner state would be telemetry leaving the browser.
- **13 modules** under `lib/trust-forward/`, **11** under `content/trust-forward/`, the v1.1.0
  stamp, **12 components**, **7 test files**.
- **WYS retirement** exactly as ruled: out of navigation and discovery, source preserved as a
  non-public stub, old entry routes redirected to `/` with `permanent: false`. All 34 files remain.

## Verified, not assumed

Each of these is an executed check, not a claim:

1. **The layer-05 reachability proof reproduces through the shipped code** — not a standalone
   script. Enumerating all 3^11 = 177,147 sequences through `aggregation.ts` + `scoring.ts`:
   `codes=16 states=465 min=691 max=49785`, matching `SHIP16_REACHABILITY_PROOF.json` exactly.
   The test also asserts the REJECTED averaging rule reaches only 11/16, so a future
   "simplification" back to a mean fails loudly instead of silently making five profiles
   unreachable.
2. **All 729 SHIP rows** reproduce from the weights, every code and percentage.
3. **All 729 recovered narratives reproduce BYTE-EXACT** from 18 composed clauses. This is the
   finding that made the reveal shippable: the recovered table is 830KB and would have gone into
   a client bundle. It is fully compositional — clause i depends only on (dimension i, posture) —
   so the build ships ~2KB and a test proves the output is identical to the recovered artifact.
   It USES the recovered narratives; it does not regenerate them.
4. **The 9 non-monotonic signal tags** are pinned by count and identity. Option position is not
   level index — C2D1 is inverted on promise and trust — and a reducer that derived levels from
   A/B/C would be wrong on nine tags while passing casual review.
5. **43 of 55 variants reachable**, including the two that exist only via the Q-D fallback, with
   the four triggering prefixes (`AAAA`, `ABAA`, `BAAA`, `BBAA`) covered by name. Those are the
   least-exercised paths in the instrument.
6. **The stamp's `AGGREGATION_POLICY_ID` equals the implementation's**, so a reducer change is a
   restamp rather than a silent behaviour swap.

## Governance mechanisms extended, never weakened

Net across the eight edited test files: **+21 assertions, −7** — every removal a value that
legitimately changed (browser keys 2→3, CSS modules 59→68), never a dropped check.

- **Digest rule.** Trust Forward cites artifacts in an external versioned bundle, and between the
  2026-09-07 handoffs two `BEN_APPROVED` files were EDITED IN PLACE rather than superseded — so a
  filename stopped identifying which ruling the build implements. Rather than exempt them, a second
  declared registry (`content/trust-forward/digests.ts`) carries the same obligations: artifact,
  reason, and a test asserting both. An undeclared digest still fails everywhere.
- **dataLayer rule.** Now names a SET of adapters and makes each one earn its place — closed event
  vocabulary, property VALUE domains, ga4-init flush, no prop spreading. The rule was never "one
  file may touch dataLayer"; it was "only through an adapter".
- **Retired-surface register.** Every retired route must have a redirect behind it, so a route
  cannot leave discovery without being shadowed, and `permanent: true` is now banned outright.
- **New `constructed-case` surface kind** with no Ben origin at all. Ben approved this material to
  RENDER on 2026-09-07; approval to publish is not a claim of authorship, and collapsing the two is
  the corruption the provenance spine exists to prevent.

## Deliberately not done

- **All five once-unsourced surfaces are closed by layer 09** (`09_final-copy-completion-2026-09-07`,
  6 files, manifest verified). Three were AUTHORED — the landing FAQ answers, the professional-summary
  template, and Case 5's AI explanation body. Two were RULED ABSENT BY DESIGN:

  - **Case 4 has no opening callback.** "Its cross-case resurfacing belongs at the Case 4 close.
    Do not add an opening callback for symmetry."
  - **The SHIP bars carry no endpoint captions.** The bars show a continuous lean while the
    available 0/1 language describes thresholded bit outcomes, so captions "would imply
    unsupported precision."

  All five `TODO_` constants stay exported and `null` — a resolved one as a tombstone pointing at
  where the copy went, a ruled one as a decision record. `TRUST_FORWARD_UNSOURCED_SURFACES` is now
  empty, and the three lists partition cleanly.

  **Both by-design rulings are now GUARDED, and they were not.** An adversarial review found that
  either surface could be restored with the entire suite still green: adding a `caseNumber: 4`
  record to `openingCallbacks`, or passing `axisEndLabels` from the composition root — the `TODO_`
  constants stay `null` in both cases, so nothing noticed. Both are exactly the "fix" a well-meaning
  reader reaches for, because the asymmetry looks like an oversight. Two tests now assert the
  callback set is `[2, 3, 5]` and that no composition root supplies captions, and both were verified
  by reversing each ruling and watching them fail.

  One posture-vocabulary trap, caught before implementation: the approved summary template names
  three postures differently from the canonical vocabulary — `bound` for `investigate`, `target`
  for `sample`, `verify` for `prove`. Orderings and meanings agree, so it maps by position, but a
  key lookup would have silently dropped **3 of 18 clauses** with no error. The clause table is
  written in canonical terms, the composer throws rather than degrading, and a test asserts the
  mapping against the source artifact.

- **The aggregate A/B/C counter ships disabled** (`TF_AGGREGATE_ENABLED = false`) per Ben's Q-E
  ruling. The adapter is built and tested; nothing transmits, because there is no endpoint and no
  persistence layer, and the ruling forbids adding the repo's first backend to activate it.
- **`npm run lint` was never a working gate here.** `next lint` prompts interactively because the
  repo has no ESLint config (the facelift plan's Q14 anticipated this). Pre-existing, out of scope,
  and flagged rather than silently "fixed" by configuring a linter nobody chose.

## Two defects the adversarial review found

Both were silent — no type error, no failing test, nothing visible on screen.

1. **`components/ui/ActionPill` dropped `onClick` whenever `href` was set.** A caller passing both
   got navigation and no callback. Trust Forward's four gated teaser cards are exactly that: links
   to `/tf` that must also fire `tf_full_trust_forward_clicked`. The event never fired. Fixed in the
   primitive rather than worked around at the call site, because the next caller to pass both would
   have hit the same thing. This is a pre-existing defect in a shared component, not a Trust
   Forward one.
2. **The reveal's Export-first offered Markdown, not JSON.** `Start over` destroys the local
   dataset, and JSON is the only artifact carrying the whole ledger — Markdown is the readable
   summary. A completed learner who took the offer would have kept the summary and lost the record.

## Still open — none of it code

- **SC-TF6 external check.** A real Lite-export → Full-import smoke test, once the Full importer
  exists. `validateLiteExport` mirrors all five fail-closed conditions locally and a test drives
  each one, but a local mirror cannot prove Studio accepts the shape.
- **Q-B.** Audit and DISCLOSE the GA4 Enhanced Measurement configuration. Ben's ruling is
  explicitly not to change it for this launch.
- The four unsourced surfaces above, if Ben wants them.
