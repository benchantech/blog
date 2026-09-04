# Facelift QA — the preserved-surface verification

Opened at Phase 10 (plan Phase 10, "**Verify by diffing rendered text, not by
eye — and by a mechanism that exists**"). This file records what was measured,
how, and what came back. It is evidence, not a plan.

The claim being tested is user constraints 2 and 3 as they apply to the ten
non-home preserved routes: **the token re-point restyled every one of them
without changing a word or a link.** Phases 4 to 9 asserted that; nothing had
executed it.

---

## 1. The method, and why this one

There is no jsdom in this repo, no `react-dom/server` test setup, and Q15's
ratified default forbids adding a browser harness — so "diff the rendered text"
needed a mechanism that already exists. It does: `next build` prerenders every
static route to `.next/server/app/*.html`, and both sides of the comparison can
be produced from the same command.

```sh
# baseline — main, in a throwaway worktree with node_modules symlinked in
git worktree add "$SCRATCH/main-baseline" main
ln -s "$REPO/node_modules" "$SCRATCH/main-baseline/node_modules"
( cd "$SCRATCH/main-baseline" && PORT=3999 npm run build )

# branch
PORT=3999 npm run build
```

Each page is then reduced to comparable text:

1. take only what is **inside `<main id="main">`**;
2. drop `<script>…</script>` (the RSC flight payload is a serialisation detail
   and differs by chunk id on every build);
3. replace every remaining tag with a newline, unescape entities, trim, drop
   empty lines;
4. `diff`.

**Why `<main>` and not the whole document.** The header, the footer and the
disclosure strip changed sitewide and deliberately in Phase 5, so a whole-page
diff would be 100% noise and would hide the one thing this check exists to find:
a sentence that went missing from a page nobody was looking at. The chrome is
covered by its own assertions in `tests/preserved-surfaces.test.ts`.

The same extraction is run a second time over `href="…"` attributes only, since
a dropped link is a silent failure that no text diff catches — a link's label
survives while its `href` does not.

---

## 2. Result — ten preserved routes, zero differences

| Route | Text lines compared | Rendered text | In-`main` hrefs |
|---|---|---|---|
| `/studio` | 14 | identical | 1, identical |
| `/neon` | 26 | identical | 1, identical |
| `/system` | 3 | identical | 0, identical |
| `/contact` | 8 | identical | 1, identical |
| `/privacy` | 23 | identical | 0, identical |
| `/terms` | 21 | identical | 0, identical |
| `/cookies` | 9 | identical | 0, identical |
| `/copyright` | 9 | identical | 0, identical |
| `/accessibility` | 9 | identical | 0, identical |
| `/ai-disclosure` | 11 | identical | 0, identical |

Counts are the branch's, re-measured at the Phase 10 gate. **Seven of the ten
carry no `href` inside `<main>` at all** — the legal pages, `/system` and
`/privacy` link only through the footer — so for those seven the href column
records that both sides render zero, which is a real result and not a link that
was found and matched. The three that do carry one (`/studio`'s `productUrl`,
`/neon`'s library callout, `/contact`'s `mailto:`) matched exactly, attribute
for attribute. The gate widened the second extraction from `href` alone to
`href`/`src`/`target`/`rel`/`id`/`aria-label`/`alt`/`title`/`type`/`name`/`value`
so that `target="_blank" rel="noopener"`, the `sr-only` heading ids and the
in-page anchors are compared too; that widened comparison is also identical on
all ten.

**Every preserved page renders byte-identical text and byte-identical in-`main`
links in the new identity.** The restyle is a token re-point, exactly as plan
§4.4 predicted, and the ten pages did not need markup edits to get it.

Two specifics the plan called out by name, checked in the diff rather than
assumed:

- `/system`'s live interpolation still resolves: the page renders "The current
  graph contains **12** route nodes", from `Object.keys(routeNodes).length`, with
  `lib/route-graph.ts` and `lib/route-resolver.ts` byte-frozen.
- `/neon` keeps **both** four-article `.detail-grid` blocks (26 text lines, the
  longest of the ten) and its callout link to `benchanviolin.com/library`;
  `/studio` keeps its `productUrl` CTA with `target="_blank" rel="noopener"`.

---

## 3. Result — `/`, the one page that is supposed to differ

`/` is PRESERVED BUT RESTYLED **+ EXTENDED**, so its diff is expected to be
one-directional: text added above the preserved blocks, nothing removed from
them. Measured:

| Direction | Lines | Verdict |
|---|---|---|
| Added on the branch | 68 lines (58 → 120 total) | the `4a` composition |
| Removed from `main` | 6 | see below — all six retired in **Phase 4**, not here |
| `href`s removed | **0** | — |
| `href`s added | 16 | Lesson Zero, the nine stop routes, the Data page, five ship links |

The six removed lines are `Four Stable Doors` / `Foyer` / `deterministic routing`
/ `N` / `Scale - intent to room` / `DWG. BenChanTech LLC · A-01` — the three
`aria-hidden="true"` blueprint-scaffolding blocks (`.dimension-line`,
`.plan-foyer`, `.scale-line`/`.scale-bar`). They were retired in **Phase 4**
under plan §4.4's explicit resolution — markup and rules in one commit, with
`tests/class-contract.test.ts` updated alongside — because none carried copy a
screen reader reached, an `href`, or a metadata value. They are listed here
because a reader of this diff will see them and should not have to guess which
phase removed them or whether it was deliberate.

Everything else the plan §3.1 enumeration names survives verbatim and in order —
58 baseline text lines in, 120 out (58 − 6 + 68), and every new one of them above
the foyer —
and `tests/home-landing.test.ts` asserts each item, including the ORDER, so the
next edit to this page cannot quietly drop or relocate one.

---

## 4. What this check does NOT cover

Stated plainly, because a QA document that implies more coverage than it has is
the same failure mode as a legal page that claims more privacy than the code
delivers.

- **It compares text and links, not pixels.** Whether the restyle looks like the
  artboards is a visual review, and it is Ben's (Q15: manual QA, reported as
  manual).
- **It compares prerendered HTML, so client-only states are invisible to it** —
  the IntentRouter's stepper, the consent banner, and every `useState` surface
  render their initial state and no other.
- **It does not compare the chrome.** Header, footer and disclosure strip
  changed on purpose in Phase 5.
- **The baseline is `main` at the time of the Phase 10 build.** If `main` moves,
  re-run both halves; do not compare against a stale artifact.

---

## 5. Gate re-run (Phase 10 gate)

The whole of §2 and §3 was **re-executed independently at the gate**, not read.
`main` was rebuilt in a fresh throwaway worktree, the branch was rebuilt, and
both extractions were re-run from a separate script. Results:

- Ten preserved routes: **identical** on both the text extraction and the
  widened attribute extraction. Confirmed.
- `/`: **6 lines removed, 68 added, 0 `href`s removed, 16 `href`s added.**
  Confirmed. The six removals are traced to commit `72ce036` (Phase 4) by
  `git log -S`, and `git diff HEAD -- app/page.tsx` removes **zero** lines at
  Phase 10 — the composition is purely additive.
- `<title>` and `<meta name="description">` compared on all eleven preserved
  routes: **identical**, every one.

Three figures in this file were wrong when the gate re-measured them and have
been corrected in place rather than defended: `/system`'s text-line count (5 →
**3**), the href column (a uniform "1" → the real per-route 1/0), and `/`'s
totals (66 → 129 → the measured **58 → 120**). The verdicts they supported were
right; the numbers under them were not, and a QA file whose numbers do not
reproduce is worth less than no QA file.
