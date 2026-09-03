# Facelift baseline — measured, not asserted

Phase 0 of `docs/bct-facelift-assimilation-plan.md`. Every later acceptance
claim is measured against the numbers on this page. They were **run**, not
recalled: plan §3.1 says "do not assert a prerendered-route count from memory".

| | |
|---|---|
| Date measured | 2026-09-03 |
| Branch | `bct-facelift-assimilation` |
| Baseline commit | `ad984ab` ("Point Studio route to BenChanViolin app URL") |
| Node | v26.4.0 |
| Next.js | 15.5.20 |
| Build command | `PORT=3999 npm run build` |
| Test command | `npm test` (`node --import tsx --test tests/*.test.ts`) |

`PORT=3999` only moves the port `scripts/guard-next-build.mjs` probes so a dev
server on 3000 does not block the build. The guard is not modified or bypassed.

---

## 1. Test baseline

**Before Phase 0:** `tests 8 · suites 0 · pass 8 · fail 0 · cancelled 0 ·
skipped 0 · todo 0`, all from `tests/route-resolver.test.ts`.

Note on the word "assertion": `node:test` reports `test()` calls, not `assert`
calls. The regression floor is therefore **8 top-level tests must never
decrease**, and `tests/route-resolver.test.ts` is untouched for the whole build.

The 8:

1. destination IDs are unique
2. stakeholder IDs are unique
3. all question options reference existing nodes
4. all result destinations resolve
5. human violin route is deterministic
6. AI doctrine route is deterministic
7. human infrastructure can route to Neon
8. unknown node throws

**After Phase 0:** `tests 31 · pass 31 · fail 0`. The 23 added tests are the
Phase 0 safety net (`preserved-surfaces` 11, `class-contract` 5,
`analytics-frozen` 7). No existing test was edited.

Coverage the suite still does **not** have at Phase 0, recorded so no later
phase mistakes green for covered: no rendering coverage of any component, no
browser-level integration tests (Q15 default: manual QA, reported as manual),
and `npm run lint` is non-functional (Q14 default: dropped from the gates).

---

## 2. Build baseline

Verbatim `PORT=3999 npm run build` output at commit `ad984ab`:

```
   ▲ Next.js 15.5.20
   - Environments: .env.local

   Creating an optimized production build ...
 ✓ Compiled successfully in 680ms
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/14) ...
 ✓ Generating static pages (14/14)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                    2.77 kB         109 kB
├ ○ /_not-found                            999 B         103 kB
├ ○ /accessibility                         147 B         103 kB
├ ○ /ai-disclosure                         147 B         103 kB
├ ○ /contact                               147 B         103 kB
├ ○ /cookies                               147 B         103 kB
├ ○ /copyright                             147 B         103 kB
├ ○ /neon                                  147 B         103 kB
├ ○ /privacy                               147 B         103 kB
├ ○ /studio                                147 B         103 kB
├ ○ /system                                147 B         103 kB
└ ○ /terms                                 147 B         103 kB
+ First Load JS shared by all             102 kB
  ├ chunks/255-3981a3d1f3561bd8.js       46.3 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          1.89 kB


○  (Static)  prerendered as static content
```

### 2.1 Route table with markers — the regression floor

**Every route below is `○ (Static)`. There is no `ƒ` (Dynamic) route, no `●`
(SSG with params) route and no dev-only route in the baseline.** Any later phase
that turns one of these Static marks into Dynamic is a reportable regression,
not an implementation detail.

| Route | Marker | Size | First Load JS |
|---|---|---|---|
| `/` | ○ Static | 2.77 kB | **109 kB** |
| `/_not-found` | ○ Static | 999 B | 103 kB |
| `/accessibility` | ○ Static | 147 B | 103 kB |
| `/ai-disclosure` | ○ Static | 147 B | 103 kB |
| `/contact` | ○ Static | 147 B | 103 kB |
| `/cookies` | ○ Static | 147 B | 103 kB |
| `/copyright` | ○ Static | 147 B | 103 kB |
| `/neon` | ○ Static | 147 B | 103 kB |
| `/privacy` | ○ Static | 147 B | 103 kB |
| `/studio` | ○ Static | 147 B | 103 kB |
| `/system` | ○ Static | 147 B | 103 kB |
| `/terms` | ○ Static | 147 B | 103 kB |

- **Shared First Load JS: 102 kB** (`chunks/255-*` 46.3 kB + `chunks/4bd1b696-*`
  54.2 kB + other shared chunks 1.89 kB).
- **Home page figure: 2.77 kB route size / 109 kB First Load JS.** This is the
  number the facelift is measured against; the home page is the only route that
  ships client JS beyond the shared baseline (`IntentRouter` is a client
  component).
- Chunk filenames contain content hashes and will change on any edit. The
  **sizes** are the floor, not the filenames.

### 2.2 Counts

Use these numbers and no others (plan §3.1):

| Count | Value | Source |
|---|---|---|
| `page.tsx` routes | **11** | `app/page.tsx` + 10 route directories |
| Non-home pages | **10** | |
| Legal/disclosure pages refreshed in Phase 11 | **6** | `/privacy` `/terms` `/cookies` `/copyright` `/accessibility` `/ai-disclosure` |
| Footer legal links | **7** | the 6 above **plus `/contact`** — `/contact` is a footer legal link but **not** a refreshed page, and must never be counted twice |
| Redirects | **3** | `/lab → /neon`, `/about → /system`, `/posts → substack` (all `permanent: false`) |
| Routes in `.next/prerender-manifest.json` | **12** | the 11 pages + `/_not-found` |
| Route rows printed by `next build` | **12** | same |
| "Generating static pages (n/n)" | **14** | Next's internal page count (it includes entries with no route row); recorded so the 12-vs-14 gap is not later mistaken for two lost routes |

### 2.3 Outbound hrefs in the baseline

Asserted by `tests/preserved-surfaces.test.ts`. The two `yymethod.com` hrefs are
**distinct objects** and are asserted separately — a bare `yymethod.com`
substring check passes while one of them is dropped.

| href | Where it lives today | Label today |
|---|---|---|
| `https://yymethod.com` | `app/layout.tsx:49` (header) | YY Method™ |
| `https://yymethod.com/doctrine` | `content/site-config.ts` `destinations[0].url` | YY Method™ (eyebrow) |
| `https://benchanviolin.com/library` | `content/site-config.ts` `destinations[1].url` **and** `app/neon/page.tsx:23` | BenChanViolin Library |
| `https://yyandme.benchantech.com` | `content/site-config.ts` `destinations[2].url` | YY and Me |
| `https://benchanviolin.substack.com` | `content/site-config.ts` `destinations[3].url` **and** the `/posts` redirect | Resonant Patterns |
| `https://benchanviolin.com/violin-for-parents` | `app/studio/page.tsx:1` (`target="_blank" rel="noopener"`) | — |
| `mailto:ben@benchantech.com` | `app/contact/page.tsx:12` | — |

### 2.4 In-page anchor targets in the baseline

An anchor that stops resolving breaks a live control as surely as a dropped
href, and nothing else in the suite would notice.

| id | Defined at | Referenced by |
|---|---|---|
| `main` | `app/layout.tsx` `<main id="main">` | `href="#main"` skip link |
| `router` | `components/IntentRouter.tsx:42` | **both** `href="#router"` audience buttons (`app/page.tsx:22`, `:26`) |
| `router-heading` | `components/IntentRouter.tsx` | `aria-labelledby` on `.router-section` |
| `destinations-heading` | `app/page.tsx` (`.sr-only` h2) | `aria-labelledby` on `.destinations-section` |
| `stakeholder-heading` | `app/page.tsx` | `aria-labelledby` on `.stakeholder-section` |

---

## 3. Stylesheet baseline

| | |
|---|---|
| `app/globals.css` | **933 lines** |
| Class selectors in it | **56** distinct |
| Distinct `className` tokens applied in `.tsx` | **56** (dynamic `plan-room-${n}` expanded to 1–4) |
| Total `className` token applications in `.tsx` | **91** |
| Render-blocking `@import` | `app/globals.css:1` — Google Fonts (Spectral + IBM Plex Mono) |

`app/globals.css:1` is **the single intentional line-level removal in the whole
build**, replaced by `next/font/google` in Phase 4. Everything else in this
build is additive or a value rewrite. A token-value rewrite of a 933-line
stylesheet legitimately shows many changed lines in `git diff --stat`; that is
why `--stat` is a reading aid only and the gate is
`scripts/check-no-deletions.sh` (plan §3.0).

Measured with the parsers in `tests/class-contract.test.ts` (`cssClassSelectors`
for the stylesheet, the balanced-brace `className` extractor for the `.tsx`
side), so the doc and the gate cannot drift apart. Cross-check:
`grep -o '\.[a-zA-Z][a-zA-Z0-9_-]*' app/globals.css | sort -u | wc -l` prints
**58** — the two extras are `.googleapis` and `.com`, fragments of the line-1
`@import` URL, which the parser correctly refuses to treat as selectors. The two
sides overlap but are not the same 56: the `.tsx` side includes `hero-foyer` and
`secondary` (§2 of `docs/facelift-build-notes.md`) which have no rule, and the
stylesheet side includes `.hero-principle` and `.card-eyebrow` (§3 there) which
have no consumer.

There are **no CSS Modules in the repo at baseline** (`modulesChecked === 0` in
`tests/class-contract.test.ts` mode 2). That zero is measured and asserted, so
the first module that lands is noticed.

---

## 4. How to re-measure

```sh
cd /Users/benchan/yy/benchantech
npm test                      # 31 tests at the end of Phase 0
PORT=3999 npm run build       # never `npm run dev` — it blocks
scripts/check-no-deletions.sh # exits 0; both --diff-filter=D and =R print nothing
```
