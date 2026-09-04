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

## 2. Result — ten preserved routes, zero differences (measured at Phase 10)

> **Scope stamp added at the Phase 12 audit.** This table is a **Phase 10**
> measurement and it is left as measured. **Phase 11 then refreshed six of these
> ten pages in place** under user constraint 5, so the "identical" verdicts and
> the line counts below no longer reproduce for `/privacy`, `/terms`, `/cookies`,
> `/copyright`, `/accessibility` and `/ai-disclosure`. §6 carries the Phase 12
> re-measure and is the current result. The four pages this file's table covers
> that Phase 11 did not touch — `/studio`, `/neon`, `/system`, `/contact` — are
> still identical, re-verified in §6.

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

---

## 6. Phase 12 audit re-measure — the current result

§2 and §3 were re-executed a third time at the Phase 12 preservation audit, on
the same method, against `main` at `ad984ab` rebuilt in a fresh worktree. Two
things changed since §5: Phase 11 refreshed six legal pages, and the audit added
a live-browser pass §5 did not have.

### 6.1 Rendered text, in-`main`, prerendered HTML

| Route | main lines | branch lines | Removed from main | Added | Verdict |
|---|---|---|---|---|---|
| `/studio` | 14 | 14 | 0 | 0 | identical |
| `/neon` | 26 | 26 | 0 | 0 | identical |
| `/system` | 3 | 3 | 0 | 0 | identical |
| `/contact` | 8 | 8 | 0 | 0 | identical |
| `/terms` | 21 | 29 | **0** | 8 | additive only |
| `/cookies` | 9 | 32 | **0** | 19 | additive only |
| `/copyright` | 9 | 15 | **0** | 6 | additive only |
| `/accessibility` | 9 | 20 | **0** | 7 | additive only |
| `/privacy` | 23 | 51 | **1** | 21 | one narrowed sentence |
| `/ai-disclosure` | 11 | 27 | **1** | 15 | one narrowed sentence |
| `/` | 58 | 120 | **6** | 68 | the Phase 4 scaffolding retirement |

The two "removed" lines on `/privacy` and `/ai-disclosure` are the two clauses
`docs/facelift-copy-diff.md` §1 records, each **narrowed by inserting the single
word "server-side"**. Every other word of both paragraphs survives, and no other
preserved sentence on any of the six refreshed pages was altered. The six on `/`
are the `aria-hidden` blueprint scaffolding, retired in Phase 4 (§3 above,
`docs/facelift-unapproved.md` §C).

### 6.2 Whole-document scan, not just `<main>`

Widened from §2's in-`main` scope so the chrome is covered too. Across all
eleven preserved routes plus `/_not-found`, every `href`, `id`,
`aria-labelledby`, `aria-label`, `target`, `rel` and `<img>` tag that renders on
`main` still renders on the branch: **zero losses, on every page.** Links that
moved file (the header's three, now in `components/SiteHeader.tsx`) are found by
the corpus-wide scan, which is why it is corpus-wide.

`<title>` and every `<meta>` on all eleven preserved routes: **identical**, with
one addition, `next-size-adjust`, which `next/font` emits.

`/_not-found` is the one page whose rendered title and body text changed:
Next's framework default (`404: This page could not be found.`) is replaced by
`app/not-found.tsx` (`Page not found - BenChanTech` / "That page isn't here."),
which plan §2.1 authorises and `docs/facelift-unapproved.md` F5 records.

### 6.3 Redirects, live

`next start` on both builds, `curl -I`:

| | main | branch |
|---|---|---|
| `/lab` | 307 → `/neon` | 307 → `/neon` |
| `/about` | 307 → `/system` | 307 → `/system` |
| `/posts` | 307 → `https://benchanviolin.substack.com/` | 307 → `https://benchanviolin.substack.com/` |

`.next/routes-manifest.json` redirect entries are byte-identical, `statusCode`
and `regex` included.

### 6.4 Live browser, 390px and 1280px — the check §4 said this file did not have

Run against `next start` on both builds. At each width, every `<a href>` on the
page was classed **visible** (has client rects) or **reachable** (inside a
`<details>` whose `<summary>` is visible — the mobile menu opens with no JS).

- **1280px, all eleven preserved routes:** horizontal overflow **0px**. Every
  preserved outbound href visible. `#main` and both `href="#router"` buttons
  present, and both anchor targets resolve.
- **390px, all eleven preserved routes:** horizontal overflow **0px**. **Zero
  unreachable links, and in fact zero non-visible links** — the four-group
  footer renders every destination at mobile width.
- **Overflow sweep on `/`** at 360, 390, 402, 700, 768, 900, 1024, 1070, 1280
  and 1440: **0px at every width.** The 700–1070 band the `SiteHeader.module.css`
  comment warns about wraps as designed rather than overflowing.
- **The one mobile-reachability delta is an improvement, not a regression.** On
  `main` at 390px the header's `https://yymethod.com` link was **unreachable** —
  `.desktop-nav` is `display:none` below 700px and the old footer carried only
  the legal links. On the branch it is reachable twice, from the mobile menu and
  from the footer's REVIEWERS group.

### 6.5 What §4's limits still cover

§4 stands, minus its second and fourth bullets. Client-only state is no longer
invisible: §6.4 measured the hydrated pages, and a hydrated `innerText` diff of
all eleven routes found **no changed word** — only rendered letter-case, from
the twelve legacy rule sets that lost `text-transform: uppercase`
(`docs/facelift-unapproved.md` D-g). The baseline was rebuilt for this pass, so
it is not stale. Pixel fidelity is still Ben's visual review (Q15).

---

## 7. Phase 12 — mobile QA and the accessibility pass (WYS §29.3, §27)

§1–§6 answer *"did the preserved surfaces survive?"*. This section answers a
different question: **does the site this build added work at the widths it was
designed for?** It covers the 15 NEW routes as well as the 11 preserved ones.

### 7.1 Method

`PORT=3999 npm run build` on a clean `.next`, then `next start`, then a real
Chromium driven over CDP. **The driver is not a repo dependency and is not
installed by `npm install`** — Q15 defers the harness, and this pass takes the
measurements without paying the package.json cost for them. Every number below
is read out of the live document (`scrollWidth − clientWidth`,
`getBoundingClientRect`, `getClientRects`, `elementFromPoint`), not estimated
from CSS.

Widths: **360** (small Android), **390** (the artboards' canonical width),
**402** (iPhone 17-class), **1280** (the desktop max). Twenty-six routes.

### 7.2 Result — 26 routes × 4 widths

| Check | Result |
|---|---|
| Horizontal overflow (`scrollWidth − clientWidth`) | **0px on every route at every width.** |
| Unreachable destinations | **Zero.** Every `href` hidden at a given width (the desktop nav below 700px) renders **visibly elsewhere on the same page** — the `<details>` menu or the four-group footer. Measured as *destinations*, not elements: hidden `<a>` elements exist, orphaned hrefs do not. |
| Modal traps | **Zero.** No `<dialog open>` and no `[aria-modal]` anywhere. The mobile menu is a `<details>` disclosure — it opens with JS off, traps nothing, and closes on Escape by the platform. |
| Deliberate horizontal scrollers | 2 on `/`, 1 on `/watch-your-step`. Each is a `.stopStrip` / path rail with `overflow-x: auto` and its own scroll container (e.g. `scrollWidth` 436 inside `clientWidth` 346 at 390px). The **page** never scrolls sideways; the rail does, which is the intended behaviour. |
| Scenario choices readable at 390 | Yes — `ChoiceRow` is a full-width `<button>` with 15/18px padding; no truncation, no ellipsis, no fixed width. |
| Data page readable at 390 | Yes — all 11 declared field rows, the key register and the raw-JSON disclosure fit without overflow; the three controls stack full-width. |
| Media usable | The only image on the site is `brand-mark.png`. Every media surface is a labelled slot awaiting Ben, so there is no video control to test. Stated rather than passed. |
| Navigation compact | Header at 390px is 72.5px tall: brand + a single 44.5px "Menu" disclosure. The tab bar is `position: fixed; bottom: 0` with the shell carrying `padding-bottom: 110px` to clear it; at full scroll **nothing in the footer or disclosure strip is occluded** (`elementFromPoint` over every visible link returned the link itself on every route). |

### 7.3 One defect found, and fixed in the architecture

**`/accessibility` published a claim that was 1.5px to 27.5px false.** The
sentence is *"Buttons, links in navigation and course controls are at least
forty-four pixels tall."* Measured:

| Rule | Before | Why |
|---|---|---|
| `.site-footer a` | **42.5px** | `padding-block: 10px` + a 22.5px line box. The rule's own comment said "touch targets >= 44px" and the arithmetic did not reach it. |
| `.shipNav a` (header, desktop) | **42.5px** | same pattern |
| `.desktop-nav a` (header ecosystem row) | **41px** | same pattern at 14px, so padding-derived height was font-size dependent |
| `.brand` | **32px** | never had a target rule |
| `.summary` (Data page, `key: wys:v1 · raw JSON ↓`) | **16.5px** | a course control drawn as an 11px mono line |

Every `<button>` on every route already passed. So did the mobile menu (48px)
and the menu button (44.5px).

**Fixed, per plan R8 — architecture, never copy.** `min-height: 44px` is now
declared on `.desktop-nav a`, `.shipNav a`, `.brand` and `.summary`;
`.site-footer a` moves `padding-block: 10px → 11px` (44.5px). Drawn-geometry
cost, measured after:

- **390px: the header is unchanged at 72.5px** — its height was already set by
  the 44.5px menu button.
- **1280px: the header grows 3px** (139.5 → 142.5), from the ecosystem row.
- **Footer links gain 2px each**; the Data page's disclosure card grows 17.5px,
  absorbed by dropping `.disclosure`'s 10px top margin, so the drawn gap moves
  10px → ~13.75px. No copy changed anywhere.

Recorded in `docs/facelift-unapproved.md` §Z2.

**The test that should have caught it did not, so it was replaced.** The old
assertion was `css.includes("min-height: 44px")` — true of the stylesheet as a
whole, and therefore true while four navigation rules were under 44px. It is now
a **per-rule** check (`tests/legal-claims.test.ts`, *"every navigation rule the
/accessibility sentence names declares its own 44px"*), which reads each named
rule body individually and does the footer's padding arithmetic in the
assertion rather than in a comment. **Negative-controlled:** reverting only
`padding-block` to 10px makes it fail.

### 7.4 The rest of the §27 checklist

| Check | Result |
|---|---|
| Skip link first focusable | Yes, `app/layout.tsx:89`, on every page. |
| Focus visible | `3px solid var(--focus)` with `3px` offset, geometry preserved against the published claim. |
| No fake controls | **Every `onClick` in the tree is on a native `<button>` or on `ActionPill` / `ChoiceRow`, which render `<button>`.** No div-onClick, no `tabIndex` hack, no `role="button"` on a non-button. |
| Contrast | Recomputed from the shipped tokens: ink/white **16.46**, body/white **9.37**, muted/white **5.47**, white/accent **4.98**, accent/white **4.98**, body/tint-teal **8.37** — all ≥ AA. The one sub-AA pair (accent on tint-teal, **4.45**) is designed around by `--accent-text-on-tint` (**5.47**), and all four `color: var(--accent)` uses were checked individually and sit on white. |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` at the foot of the stylesheet, paired with `scroll-behavior: smooth`. |

*(One cosmetic inaccuracy left as-is: `standing-orders.module.css:63` comments
the accent/white ratio as 4.74; it computes to 4.98. Conservative, passes either
way — a comment number that does not reproduce, not a shipped value.)*

---

## 8. Phase 12 — the (WYS §29.2) integration flows

Six flows. **All six were executed in a live browser**, not asserted from unit
tests. The unit coverage exists too and is named beside each flow.

Setup: clean `next start` build, fresh browser profile at 390×844. **This build
ships with no GA4 measurement ID configured**, so `window.gtag` is `undefined`
and `dataLayer.length` is `0` throughout — the "analytics blocked" condition is
this build's default state rather than something simulated.

### 8.1 Zero-network curriculum

Walked end to end: all ten Lesson Zero steps → cadence "3 days a week" + time
"About 10 min" → "Show my plan" → "Start the first stop" → `/today` → marked the
CARRY → Progress → Practice → Data.

**129 network requests over the whole flow. Every one of them:**

- same-origin (`localhost:4111`) — **zero third-party requests, GA4 included**;
- **GET** — zero POST, PUT, PATCH or DELETE;
- a static asset, a document, or an RSC prefetch — `_next/static/*` chunks, CSS,
  six self-hosted `.woff2` faces, `brand-mark.png`, `favicon-32x32.png`.

**No API call is required for curriculum progress.** State is written to
`localStorage` and nothing else.

### 8.2 No free text leak

Typed the spec's canary — `DO_NOT_SEND_WYS_TEST_9f31` — into the From Memory
scratch box on `/practice`, then navigated away and back.

| Assertion | Result |
|---|---|
| No analytics call contains it | **Pass** — no analytics call exists at all; `dataLayer` is empty. |
| No API request contains it | **Pass** — the string appears in **0** of the 129 request URLs, and there are no request bodies because there are no non-GET requests. |
| No `localStorage` key contains it | **Pass** — `wys:v1` is byte-unchanged after typing; a scan of every value in `localStorage` **and** `sessionStorage` for the canary returns `false`. |
| It is intentionally ephemeral | **Pass** — after `/practice → /progress → /practice` the box is empty. |

Unit coverage: `tests/wys-practice.test.ts` *"FromMemory imports nothing that
could persist or transmit"*; `tests/wys-telemetry.test.ts` *"free text under an
allowlisted key is rejected by the value domain"* (the same canary fails all four
domains).

### 8.3 Local state clear

Built real state first: onboarding complete, one carry marked
(`completedCarryIds: ["car-a-remove-one-detail"]`, `completedLessonIds:
["stop-a:day-human-source"]`), one rulebook entry
(`RULEBOOK_CANARY_9f31 never paste a client name`). Then set
`bct_analytics_consent = "granted"` so the "does clear touch consent?" question
had something to answer.

The control opens a **confirmation step**, not a tooltip, and the panel says:

> Clearing removes every `wys:` key this course stored in this browser, including
> your rulebook, and returns you to a clean onboarding state. · Your analytics
> choice is stored under a different key and is not touched, so clearing does not
> change whether this site asks you about cookies. · **This clears this browser
> only. It does not erase hosting logs, and it does not erase anything already
> recorded in Google Analytics.**

After "Yes, clear it": `localStorage` holds **`["bct_analytics_consent"]`** and
nothing else. `wys:v1` is `null`. Consent is still `"granted"`.

**The spec's "do not claim GA4/hosting data was deleted" is satisfied on the
page, before the action, in the panel's own third sentence.**

### 8.4 Restart vs erase

Same state as 8.3. The restart control opens its own confirmation panel:

> Restart clears your curriculum progress in this browser: completed stops,
> scenarios and carries, replay counts, and the judgments you kept. · Your pace,
> time and posture preferences stay, unless you choose to clear them here too. ·
> Your rulebook stays, unless you choose to clear it here too.

After "Yes, restart", read out of `localStorage`:

| Field | Before | After |
|---|---|---|
| `progress.completedLessonIds` | `["stop-a:day-human-source"]` | `[]` |
| `progress.completedCarryIds` | `["car-a-remove-one-detail"]` | `[]` |
| `rulebook` | 1 entry | **1 entry, byte-identical, same `id` and `createdAt`** |
| `onboarding` | `{completed, cadence:"3", timeBudget:"10"}` | **unchanged** |
| `startedAt` | set | **unchanged** |

**Restart and erase behave exactly as documented, and they are two separate
controls with two separate panels** — not one control with a modifier.

### 8.5 Analytics blocked

The course was completed above with `window.gtag === undefined` and
`dataLayer.length === 0` for the whole run. Onboarding, the stop loop, the CARRY
mark, Progress, the rulebook, Practice, Restart and Clear all worked.
**Nothing on the course is gated on analytics, and nothing degraded.**

The build's own route table is the second half of this evidence: this very build
renders the no-measurement-ID branch and still produces all 40 pages.

### 8.6 Draft provenance

Read off `/watch-your-step/today` in the live browser, with Q21's ratified
default in force:

> Stop A · visit 1 of 3 · **Implementation placeholder — not Ben's words** ·
> About 10 minutes. · Watch Try Judge Carry · **Ben source · video · 6:40** ·
> *slot: Ben-selected recording* · Transcript · **Fictional · nothing about
> you** · Implementation placeholder — not Ben's words · Carry · then leave ·
> Implementation placeholder — not Ben's words · **No need to report back.**

Three distinct provenance registers on one screen — a **Ben slot** (labelled,
empty, awaiting a recording), a **fictional** marker, and **draft placeholders**
— and no draft object rendered with a Ben-authored badge anywhere.

Unit coverage: `tests/content-status.test.ts` *"no non-Ben origin can resolve to a
Ben-authored label"*, *"a draft Ben-origin object is blocked"*, *"BEN_APPROVED
never claims Ben authorship"*.

**And the flow's real teeth are at the bundle level, not the DOM level.** The
Phase 12 doctrine audit found that a DOM which drew "Implementation placeholder"
was nonetheless shipping the withheld scenario bank verbatim inside a client
chunk loaded on **every page**. That is fixed, and it is now an executed gate:
`scripts/check-bundle-provenance.mjs` fails the build on any blocked record's
prose appearing in a client bundle (**583 withheld strings checked against 54
bundles, 0 found**), negative-controlled so it cannot pass vacuously. See
`docs/facelift-captains-round.md` question 8.

---

## 9. Phase 12 — fidelity against the five approved PNGs

The plan asks for a side-by-side against
`design_handoff_bct_facelift/screenshots/*.png` at 1280 and 390. **What this
section can and cannot settle needs saying first.**

**It can settle structure.** Full-page captures at 390 were taken of every
artboard-backed screen and compared block by block against the reference PNGs:
does each block exist, in the drawn order, with the drawn copy, in the drawn
register?

**It cannot settle pixels.** Q15 defers the harness, so there is no reference
overlay and no pixel-diff. Colour, type, spacing and radii come from tokens the
plan transcribed from the handoff README's own values (plan §4.2), which is why
the token table rather than a screenshot is the fidelity artefact. **Final visual
judgment is Ben's**, which is what the whole stamp decision is for.

**And two structural differences are by design, not drift**, so a naive
side-by-side reads as a mismatch:

1. **State.** The artboards draw a *used* course. `5c` Practice shows three
   replay rows; the shipped page shows *"NOTHING TO REPLAY YET · a scenario you
   have already judged"*, because a first visitor has judged nothing
   (`docs/facelift-unapproved.md` Practice R3). `5c` Data card 1 shows filled
   values; a first visitor sees em dashes (Data R7).
2. **Q21.** Every scenario, choice label and judgment body in the artboards is
   bucket-3 draft content, and it is **withheld**. Where `5b` draws a scenario,
   the build draws its provenance label.

### 9.1 Structural result

| Artboard | Screen(s) | Verdict |
|---|---|---|
| `4a` | `/` (desktop + mobile), `/watch-your-step` | All eight blocks present in order: hero (badge / H1 / sub / CTA pill / "or try one question →"), live demo card, instructor band, the path (9 cells), Watch·Try·Judge·Carry, "What you won't find here" pills, "How the site is run", disclosure strip, footer. Two recorded departures: the six `aria-hidden` blueprint lines retired in Phase 4 (§C), and the preserved blocks appended below (Q2, §HM). |
| `5a` | `/watch-your-step/start` | Ten steps across eight screens; the 2×2 pace grid composed locally; selection does not reflow (Q18). Recorded: LZ1–LZ14. |
| `5b` | `/today`, `/plan`, `/progress` | Four phase pills, Ben-source slot with play disc, transcript block, CARRY with "No need to report back". Recorded departures: Commit is ink not teal (Q17/T5), no distribution card on Today (T6), CARRY body at 16px where `5b` draws 15px (T11). |
| `5c` | `/practice`, `/data` | Practice: REPLAY / FROM MEMORY sections, the aloud-paper offers, the scratch notice, "I did it", the appetite line. Data: all three cards, the infrastructure paragraph, the three controls, the amended footnote, "Cookies and browser storage →". Recorded: R1–R11, DM1–DM12. |
| `5d` | `/bridge`, `/standing-orders`, `/ships-log`, `/ben`, `/crew` | All present. **`/crew` is NEW in full — no artboard exists at any width** (CRW1), composed from `5d`'s register. Recorded: BR1–BR5, SO1–SO5, SL1–SL6, BQ1–BQ9, CRW1–CRW6. |

**Desktop is the standing caveat.** The approved set is canonical at 390px and
`4a` is the only desktop artboard, so **fifteen 1280px compositions on course and
ship screens are this build's extrapolation** from an approved mobile design.
They are enumerated in one place — `docs/facelift-unapproved.md` GT1 — precisely
so a desktop review is a single list rather than a hunt.
