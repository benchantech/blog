# BCT Facelift — Assimilation Build Plan

**Branch:** `bct-facelift-assimilation` (already created off `main`; nothing in this plan lands on `main`).
**Status of this document:** implementation plan. It is not Ben doctrine and does not stamp anything.
**Governing thesis:** order the build by irreversibility, not by visibility.

Palette, layout, routes and telemetry can all be revised later at the cost of a diff. Approval state cannot. Once draft prose has shipped inside a Ben-attributed component with no status field to distinguish it, the record is corrupted and there is no mechanical way to find the corruption again. So the provenance substrate, the local-state serializer and the telemetry allowlist are written, tested and green **before the first content module or renderable screen exists**. Everything after that is assembly on a substrate that already refuses the failure.

---

## 1. Purpose and what is being assimilated

### 1.1 Purpose

Take three source bodies — an approved visual design, a behavioural build spec, and a governance packet — and assimilate them **additively** into the live Next.js 15 site at benchantech.com, so that:

1. The new IBM Plex / ink-and-teal visual identity takes over sitewide.
2. Every surface currently live keeps its URL, its copy, its links and its behaviour.
3. A deterministic, zero-AI-at-runtime, no-account course (Watch Your Step) is added.
4. The Author Ship governance surfaces (Bridge, Standing Orders, Ship's Log, Crew Manifest, Captain's Quarters) are added.
5. Nothing draft or AI-written can render as Ben-authored canon.
6. Legal copy, the Data page and the shipped code agree exactly.

### 1.2 Inventory of `/Users/benchan/yy/bct-facelift`

| Path | Role in this build |
|---|---|
| `WATCH-YOUR-STEP.md` (2,413 lines, 40 sections) | **Authoritative build guide** for Watch Your Step behaviour, data model, telemetry, provenance and acceptance. Cited below as (WYS §N). |
| `BCT_Author_Ship_Master_Planning_Packet_2026-09-03.pdf` (405 pp) | **Authoritative build guide** for the Author Ship / governance layer: purpose, YY Method v2.3 keel, Standing Orders, Bridge, Ship's Log, Crew Manifest, Captain's Quarters, voice constitution, build order. Extracted to plain text at `/private/tmp/.../scratchpad/packet.txt`. Cited as (packet: `<heading>`). **Front matter states: NOT YET GOVERNING.** |
| `design_handoff_bct_facelift/BCT Face Lift.dc.html` (158 KB) | The design canvas. **Approved artboards only:** `5a` (lines 16–74), `5b` (75–149), `5c` (150–212), `5d` (213–316), `4a` (317–484). Everything from line 485 down (`3a`, `2a`–`2f`, `1b`) is a **superseded** exploration — history only. Cited as (mockup 4a / 5b / …). |
| `design_handoff_bct_facelift/README.md` (108 lines) | Design handoff notes: tokens, screen specs, content-status buckets, interaction rules. Cited as (handoff README). **Subordinate to the spec by its own statement.** |
| `design_handoff_bct_facelift/screenshots/*.png` (5 files) | Renders of the approved artboards. Add no information beyond the markup, and are clipped at the 844 px frame — several screens continue below the fold. The iOS status bar, notch and home indicator visible in them are prototype chrome and **must not be reproduced**. |
| `design_handoff_bct_facelift/ios-frame.jsx` | Prototype phone-frame component. **DO NOT PORT.** |
| `design_handoff_bct_facelift/support.js` | Prototype canvas runtime (`<x-import>`, `<sc-if>`, `{{ }}`, `DCLogic`). **DO NOT PORT** — translate the logic it expresses, never the constructs. |
| `design_handoff_bct_facelift/spec/` | Contains the same `WATCH-YOUR-STEP.md`. Use the top-level copy. |

### 1.3 What the approved artboards actually cover

Sixteen screens/states, of which **only the home page has a desktop design**:

- `4a` desktop 1280 px: home page (nav, hero + live demo, instructor band, nine-stop path, Watch/Try/Judge/Carry, anti-features, "How the site is run", disclosure strip, footer).
- `4a` phone 390×844: the `/watch-your-step` landing.
- `5a` ×3 phones: Lesson Zero steps 2, 5, and 7–9 of 10. The third phone is a composite carrying cadence (step 7), time (step 8) and the BEFORE YOU START · DATA card (step 9) on one screen, so **five of ten steps are designed and five are undesigned: 1 (constructive intent), 3 (human source first), 4 (first durable privacy habit), 6 (runtime disclosure) and 10 (plan preview)**. (handoff README:44 agrees — "3 of the 10 steps shown".) One nuance to carry into Phase 7: step 4's habit line is drawn *inside* the step-5 artboard's dark THE FIRST HABIT card, so whether step 4 is a separate screen at all is an open composition question, not a settled omission.
- `5b` ×3 phones: Today, Plan, Progress.
- `5c` ×2 phones: Practice, Data.
- `5d` ×4 phones: Bridge, Standing Orders, Ship's Log, Captain's Quarters.

**No approved artboard exists for:** Crew Manifest (at any width), the mobile home page, any desktop course or ship screen, the mobile site header, the mobile disclosure strip, the terminal Stop H surface, any transfer-check surface, any interaction state (hover/focus/error/empty/loading), or 404/500.

---

## 2. Authority model and conflict-resolution order

These are rules, not guidance. Apply in order.

**R1 — Visual conflicts resolve to the approved artboards.** Layout, colour, type, spacing, radii and on-screen copy come from `4a` and `5a`–`5d` plus the screenshots. Turns 1–3 are superseded and are consulted only as history (they occasionally show a *structural* precedent worth noting — e.g. `2f`'s stacked mobile footer — but never a visual one).

**R2 — Behavioural conflicts resolve to the spec and the packet.** `WATCH-YOUR-STEP.md` governs Watch Your Step behaviour, data, telemetry, provenance and acceptance. The packet governs ship/governance surfaces.

**R3 — The spec beats the handoff README.** The README says so itself: "Where this README and the spec conflict, the spec wins."

**R4 — WYS §1 SOURCE PRECEDENCE governs anything about the WYS course.**

**R5 — The packet is NOT YET STAMPED.** Its own front matter: "Nothing in this packet becomes authoritative merely because it appears here." Its 18-row Approval Ledger is blank. Therefore approval status is modelled in code (§6 below) and no packet-derived material renders as Ben-authored canon.

**R6 — The user's constraints override every source, including the mockups and the README.** Specifically: new branch; every live surface preserved at its URL with its copy, links and behaviour; the aesthetic changes; the current GA4 + Consent Mode v2 implementation is preserved unchanged and WYS telemetry is layered on top; legal pages are refreshed in place.

**R7 — Where a source implies replacing or dropping an existing surface, ADD the new one and KEEP the old one,** and state how both coexist in navigation.

**R8 — A false public claim is fixed in architecture, never in copy.** (WYS §34: "Do not 'solve' these with copy. Fix the architecture or narrow the feature.") The inverse also holds: where the implementation cannot honour an approved on-screen string, escalate the string to Ben (§12) rather than quietly reword it or quietly ship it false.

**R9 — Safe-direction overrides of an artboard are permitted and must be reported; unsafe-direction ones are not.** Adding a provenance marker the artboard omits is permitted (and required). Removing one, or attributing draft prose to Ben, is not.

**R10 — Do not write prose in Ben's first person anywhere.** Where a source requires Ben's words, render a labelled empty slot. (packet: Voice Constitution 3.5 — "Source precedes style"; WYS §11 — "Do not invent Ben stories or quotes.")

### 2.1 Voice constraints on any copy this build does author

The build authors some new prose (mobile disclosure strip layout copy, 404/error pages, Crew Manifest system descriptions, the amended clearing footnote, Ship's Log entry bodies, deferral notes). All of it is factual build description, never a Ben position, and is subject to (packet: Voice and Reasoning Constitution):

- Contractions and ordinary speech; no institutional inflation (3.3).
- No modal upgrade — never convert a hedge into an assertion (3.4).
- Preserve uncertainty at source strength (1.7).
- "Open question" is a first-class state; do not conclude because a document needs a conclusion (3.10).
- Ration the nautical metaphor — keep the five named ship surfaces the artboards approve and do not extend the metaphor into sub-headings or button labels (3.7).
- No outcome claim without observed evidence (2.13 / Proposition K).

Also forbidden anywhere on the site (WYS §32 launch restraint): "Ben's definitive system for safe AI", "the correct way to use AI", "privacy guaranteed", "AI you can trust" (except as a struck-through anti-feature pill on the home page, which is its approved use), "become AI literate in X days", "expert-certified privacy judgment".

---

## 3. What happens to the existing site

### 3.0 The deletion contract

**Nothing is deleted.** Verifiable at every phase gate:

```
git diff --name-only --diff-filter=D main...HEAD   # must print NOTHING
git diff --name-only --diff-filter=R main...HEAD   # must print NOTHING (a rename breaks a URL too)
```

**Do not use `git diff --stat` for this gate.** `--stat` has no removed-files field: a deleted file appears as an ordinary row (`app/terms/page.tsx | 56 --`), visually identical to a heavily edited one, so a reviewer following a `--stat` instruction literally would pass the gate on a branch that deleted a preserved route. The two `--diff-filter` commands above are the gate.

**Make it executed, not eyeballed.** `scripts/check-no-deletions.sh` runs both commands and exits non-zero on any output; `tests/preserved-surfaces.test.ts` shells out to it so `npm test` fails on a deletion. That script is also the thing every phase Exit and §10 refer to.

plus `tests/preserved-surfaces.test.ts` (built in Phase 0) asserting zero removed routes, zero removed redirects and zero removed outbound hrefs.

The single intentional line-level removal in the whole build is `app/globals.css:1` — the render-blocking Google Fonts `@import` — replaced by `next/font/google`. Note that a token-value rewrite of a 933-line stylesheet legitimately shows many changed lines in `git diff --stat`; that is why `--stat` is a *reading aid only* and the gate is the two `--diff-filter` commands above — **zero removed or renamed files / routes / links**, not a line count.

### 3.1 Routes

| Route | Disposition | Restyling approach |
|---|---|---|
| `/` | **PRESERVED BUT RESTYLED + EXTENDED** | Add the `4a` blocks (hero + live demo, instructor band, nine-stop path, Watch/Try/Judge/Carry, anti-features, "How the site is run", disclosure strip). **Keep below them**, in the new register, the *complete* current page — enumerated so nothing is lost by omission: the foyer hero copy ("Routing foyer · Sheet A-01", "Come on in - even if you're AI.", the hero paragraph, the signature note); the **two audience buttons** ("I'm human" / "I'm AI" with their `small` sub-lines and their live `href="#router"` anchors, whose target is `IntentRouter.tsx:42` `id="router"`); the `.dimension-line` "Four Stable Doors" heading; the `.sr-only` `#destinations-heading` ("The ecosystem has four stable doors."); the four-door destinations grid; the `.plan-foyer` compass block ("Foyer / deterministic routing / N"); the `.scale-line` caption ("Scale - intent to room", "DWG. BenChanTech LLC · A-01"); `<IntentRouter/>`; and the stakeholder section with `#stakeholder-heading`. Nothing removed, nothing relocated. **The three `aria-hidden` blueprint-scaffolding blocks (`dimension-line`, `plan-foyer`, `scale-line`/`scale-bar`) are the one exception under active decision — see the §4.4 resolution.** Final stacking order is Ben question Q2; additive is the build-now default. |
| `/studio` | **PRESERVED BUT RESTYLED** | Token re-point only. `productUrl = "https://benchanviolin.com/violin-for-parents"`, the eyebrow "Studio.com route", the h1, both paragraphs, the CTA (`target="_blank" rel="noopener"`), the four-article `.detail-grid` and the closing paragraph all survive verbatim. **Do not relabel this page** as the packet's "rented laboratory" Studio. |
| `/neon` | **PRESERVED BUT RESTYLED** | Token re-point only. Keeps the callout link to `https://benchanviolin.com/library` and **both** four-article `.detail-grid` blocks. This is the Neon Postgres stakeholder pitch, not a "neon aesthetic" — the packet's ban on "generic neon AI visuals / glowing brains / purple cyberpunk gradients" targets a visual vocabulary that lives in `globals.css`, not this route. Do not rename it. |
| `/system` | **PRESERVED BUT RESTYLED** | Token re-point. Keeps its URL, its copy, and the live `{Object.keys(routeNodes).length}` interpolation. **Do not redirect it to `/bridge`** — `/about → /system` is a live redirect, and `/system` (the inspectable route map) and `/bridge` (Ben's current position) are different objects. |
| `/contact` | **PRESERVED BUT RESTYLED** | Shared `.detail-page` / `.legal-page` shell restyle. `mailto:ben@benchantech.com` survives. |
| `/privacy` | **PRESERVED BUT RESTYLED + REFRESHED** | Shell restyle in Phase 4; accuracy refresh in Phase 11 (§8b). URL and metadata title unchanged. |
| `/terms` | **PRESERVED BUT RESTYLED + REFRESHED** | Same. |
| `/cookies` | **PRESERVED BUT RESTYLED + REFRESHED** | Same. |
| `/copyright` | **PRESERVED BUT RESTYLED + REFRESHED** | Same. |
| `/accessibility` | **PRESERVED BUT RESTYLED + REFRESHED** | Same. Its published claim ("visible focus styles, skip navigation") constrains the restyle. |
| `/ai-disclosure` | **PRESERVED BUT RESTYLED + REFRESHED** | Same. Its "Current site behavior" section becomes wrong the moment WYS ships. |
| `/lab → /neon` | **PRESERVED AS-IS** | `next.config.ts` untouched. |
| `/about → /system` | **PRESERVED AS-IS** | Untouched. |
| `/posts → substack` | **PRESERVED AS-IS** | Untouched. |

**Normalised counts — use these numbers and no others.** 11 `page.tsx` routes exist today (`app/page.tsx` plus 10 route directories). 10 of them are non-home pages. 6 are legal/disclosure pages refreshed under user constraint 5 (`/privacy`, `/terms`, `/cookies`, `/copyright`, `/accessibility`, `/ai-disclosure`). 7 are footer legal links (`components/SiteFooter.tsx:3-11` — those 6 plus `/contact`). `/contact` is a footer legal link but **not** one of the six refreshed pages, and must never be counted twice. 3 redirects (`/lab`, `/about`, `/posts`). The §3.0 deletion contract is verified against exactly these numbers. **Do not assert a prerendered-route count from memory** — capture it in Phase 0 with an actual `npm run build` and use the measured number as the regression floor.

### 3.2 Files

**PRESERVED AS-IS — zero edits:**

`components/GoogleAnalytics.tsx` (renders no markup; every edit risks the Consent Mode v2 contract), `lib/route-graph.ts`, `lib/route-resolver.ts`, `lib/db/client.ts`, `lib/db/schema-notes.md`, `tests/route-resolver.test.ts`, `content/site-config.ts` (its shape is pinned by the test suite and cannot carry a provenance field), `next.config.ts`, `tsconfig.json`, `vercel.json`, `next-env.d.ts`, `.gitignore`, `.vercelignore`, `scripts/check-secrets.sh`, `scripts/guard-next-build.mjs`, `.githooks/pre-commit`, `AGENTS.md`, `public/*` (7 brand assets — if a new mark ships it must keep the same filenames or `app/layout.tsx` icons metadata changes in the same commit), `_cases/*`.

**PRESERVED BUT RESTYLED:**

| File | Approach |
|---|---|
| `app/globals.css` | The one file the identity swap lands in. Token block replaced; **every legacy token NAME kept as an alias**; blueprint identity rules replaced; STRUCTURAL section preserved as a commented block (§4.4). |
| `app/layout.tsx` | `next/font` variables; new header carrying both nav inventories; disclosure strip mounted. Skip link, `aria-label`s, `<main id="main">`, the `<img aria-hidden>` + adjacent-text pairing, and **all root metadata verbatim** (except the brand wordmark, Ben question Q8). |
| `components/SiteFooter.tsx` | Three link groups (§5.4). All seven `legalLinks`, the `aria-label="Legal and company information"` nav, "Ben Chan Tech LLC" and the tagline survive. |
| `components/ConsentBanner.tsx` | **Visual only**, plus `try/catch` hardening. `storageKey = "bct_analytics_consent"`, the three-state machine, the `NEXT_PUBLIC_GA_MEASUREMENT_ID` render guard, the hardcoded `ad_*` denials, the body copy and the labels "Decline" / "Allow analytics" stay byte-identical. The `declare global` block moves out (§8.4) — that is a type-location change, not a behaviour change. |
| `components/IntentRouter.tsx` | Restyled. The four step labels (Capture · Why · Why-Not · Commit), the `active`/`complete` stepper states, the disabled-Back affordance at `history.length === 0`, and every call into `lib/route-resolver.ts` are unchanged. |
| `app/page.tsx` + the 10 non-home pages | Markup wrappers and class names may change; copy, hrefs, metadata and behaviour may not (legal pages additionally get accuracy edits in Phase 11). |
| `docs/legal-analytics.md` | **Updated, not frozen.** The analytics surface it documents gains a second event source; leaving it stale reproduces exactly the code/doc drift constraint 5 exists to prevent. |
| `README.md` (repo root) | **Updated, not frozen — same reasoning.** `README.md:3` describes the site as "the routing foyer for the Ben Chan Tech LLC ecosystem", which is false the moment Watch Your Step and the five ship surfaces ship. Update the one-line description, the stack/scripts section (the new flat test files, the `PORT=3999 npm run build` loop, `scripts/check-no-deletions.sh`) and nothing else. It is not a governance surface and carries no Ben-attributed claim. |

### 3.3 Navigation coexistence

Three inventories must coexist: three live nav links, six approved ship links + a CTA, and (on mobile) nothing at all today.

- **Desktop header, tier 1:** Watch Your Step · Bridge · Standing Orders · Ship's Log · Crew · Ben, plus the teal "Start Lesson Zero" pill (mockup 4a).
- **Desktop header, tier 2 (or grouped):** Violin for Parents (`/studio`) · Neon (`/neon`) · YY Method™ (`https://yymethod.com`, `rel="noreferrer"`, no `target`). Nine links plus a CTA will not fit one 1280 px row minus 56 px gutters at 15 px / gap 32, so a two-tier or grouped arrangement is required.
- **Footer (all breakpoints):** the four properties rendered from `content/site-config.ts` `destinations.map()` — **rendered from the `eyebrow` field**, which gives "YY Method™ · BenChanViolin Library · YY and Me · Resonant Patterns" in the artboard's order, so the four **URLs** are preserved by construction. **The match is not name-for-name:** the artboard footer (dc.html:428) reads "YY Method", `destinations[0].eyebrow` reads "YY Method™". Ship the ™ as a deliberate, reported deviation from the artboard label rather than editing the pinned `site-config.ts` (Q8 territory); if Ben prefers the bare artboard label, add an optional `footerLabel` in a **new** module that overlays `destinations[]` — never a field on `site-config.ts`. A Reviewers group (`/studio`, `/neon`); and the seven legal links unchanged.
- **Two distinct YY Method hrefs must both survive.** `app/layout.tsx:49` links `https://yymethod.com` (label "YY Method™"); `destinations[0].url` is `https://yymethod.com/doctrine` (same eyebrow). Constraint 2 forbids dropping either, so they cannot be collapsed to one node — they get **two distinct labels**: "YY Method™" for the site root in the header, "YY Method doctrine" for the `/doctrine` destination in the footer. Record both in `tests/preserved-surfaces.test.ts` as separate assertions; a single `yymethod.com` substring check would pass while one href was silently dropped.
- **Mobile:** today `.desktop-nav { display: none }` below 700 px with no replacement, so `/studio`, `/neon` and yymethod.com are unreachable from mobile chrome. The footer must therefore carry **every** link on mobile, which alone closes the gap. A mobile header menu is additionally proposed because packet build step 11 is "Build mobile navigation first — Do not begin with desktop wireframes… Primary ship destinations should be extremely easy to reach", and shipping six new ship surfaces with no mobile header would violate it. **Structural precedent:** superseded turn `2f` shows a stacked mobile footer — disclosure card, then a 2-column "THE SHIP" grid, then the doors. Reuse that *structure*; take the visuals from `5d`. Flag the mobile nav as NEW/unapproved. (Ben question Q9.)
- **Course tab bar** (Today · Plan · Progress · Practice · Data) is course-internal navigation only and is never a substitute for site nav (WYS §5.2).

---

## 4. Design system

### 4.1 Styling mechanism decision for this repo

There is no Tailwind, no CSS Modules and no CSS-in-JS today: `app/globals.css` is a single 933-line flat global sheet imported once from `app/layout.tsx`, and the TSX depends on ~47 unscoped kebab-case class names plus two the compiler cannot see.

**Decision:**

1. **`app/globals.css` keeps** (a) the token block, (b) the structural rules, (c) the legacy class layer that styles the 11 preserved routes. Legacy class names are the public API of the new stylesheet.
2. **Every NEW surface and primitive uses CSS Modules** (`*.module.css` — native in Next 15, zero config, zero dependencies). This is forced: `.hero` (defined twice), `.eyebrow`, `.brand`, `.detail-page`, `.section-heading`, `.option-grid`, `.primary`, `.secondary`, `.compact` are already taken globally, and a new component using `className="hero"` would silently inherit blueprint geometry with no compile error.
3. **No Tailwind.** It requires postcss config, a new dependency, and a rewrite of all 933 lines, for artboards that are inline-styled with no class lineage to preserve.
4. **No new runtime dependency.** Runtime deps stay exactly `next`, `react`, `react-dom`. (WYS §28 forbids AI/chat/Studio/auth SDKs in the v0 client bundle.)

### 4.2 The token set (verbatim from handoff README Design Tokens + measured artboard values)

```
/* --- facelift palette --- */
--ink:              #16202B   /* body text, dark slabs, primary CTA, selected ring, active nav */
--body:             #3A4856   /* paragraph/secondary text, desktop nav links */
--muted:            #5C6B7A   /* meta, footnotes, values, inactive nav, mono provenance on light */
--accent:           #1F7A8C   /* option letters, caps eyebrows, links, nav CTA fill,
                                 progress-rail fill, dashed Ben-slot border, focus ring */
--accent-on-dark:   #7FC8D6   /* eyebrows + secondary text INSIDE ink slabs ONLY */
--tint-teal:        #EAF4F6   /* status badges, "current/next" fills, selected-row fill, CARRY card */
--tint-grey:        #F4F6F8   /* neutral rows, cards, stat cards, progress track, stops B–G */
--white:            #FFFFFF

/* --- borders --- */
--border-card:      rgba(22,32,43,.10)   /* 1.5px — demo card, Today TRY card */
--border-row:       rgba(22,32,43,.12)   /* 1.5px — unselected choice row, learner-authored outlined row */
--border-pill:      rgba(22,32,43,.15)   /* 1.5px — outlined pill, struck anti-feature pill */
--border-pill-strong: rgba(22,32,43,.20) /* 1.5px outlined action pill; 1px "approval pending" chip */
--border-dashed:    rgba(22,32,43,.25)   /* 1.5px dashed — terminal "the end" stop */
--border-nav:       rgba(22,32,43,.08)   /* 1px — bottom-nav top hairline */
--border-selected:  2px solid #16202B    /* SELECTED state — never teal */
--dash-ben:         1.5px dashed #1F7A8C /* awaiting-Ben slot */
--dash-scratch:     1.5px dashed rgba(255,255,255,.3)  /* non-persisted scratch box on ink */
--commit-disabled:  rgba(22,32,43,.25)
--body-on-dark:     rgba(255,255,255,.75)

/* --- radii: TWO families, do not normalise to one ramp --- */
mobile:   rows 14 · posture rows / plan rows / property tiles 16 · order cards / plan NOW 18
          · section + dark cards + media 22 · portrait 26 · pills 999
desktop:  demo choice rows 16 · stop cells 18 · judgment / distribution / stat / four-move 20
          · portrait 24 · demo card + disclosure strip 28 · large tinted+dark blocks 32 · pills 999

/* --- shadows: only two exist --- */
--shadow-demo:        0 30px 80px -40px rgba(22,32,43,.35)   /* desktop demo card */
--shadow-demo-mobile: 0 20px 50px -30px rgba(22,32,43,.35)   /* mobile demo card */

/* --- type --- */
IBM Plex Sans 400/500/600 — everything
IBM Plex Mono 400/500 — ONLY provenance/state lines at 11–12px

desktop:  H1 600 66px/1.02 -.03em · H2 600 44px/1.08 -.025em
          · H2-alt 600 40px/1.1 -.025em · H3-alt 600 30px/1.15 -.02em
          · lead 21px/1.5 max-width 540 · body 18px/1.5–1.55 · UI 15–17 · meta 13 · mono 11–12
mobile:   landing H1 600 38px/1.05 -.03em · page H1 600 32px/1.10–1.12 -.025em
          · tab title 600 30px -.02em · Data H1 600 28px/1.15 -.025em
          · stat numeral 600 34px -.03em · body 15–17/1.40–1.50
          · caps label 12px/600 accent · meta 13–14 · mono 11–12

text-wrap: balance on every large headline; text-wrap: pretty on hero paragraphs.

/* --- spacing --- */
desktop gutters 56 · mobile gutters 22 · block gaps 8–14 · section gaps 64–96
mobile page padding-top 70 (course/ship) / 72 (Lesson Zero) / 74 (WYS landing)
mobile page padding-bottom 110 (has tab bar) / 60 (no tab bar)
bottom nav padding 12px 8px 30px → the 30 becomes env(safe-area-inset-bottom)
max content width 1280 desktop; mobile canonical 390

/* --- media placeholders: never an image --- */
dark  (portraits): repeating-linear-gradient(135deg,#243444 0 8px,#1E2C3A 8px 16px)
                   (6px/12px pitch on the 72px disc)
light (video):     repeating-linear-gradient(135deg,#E6ECF0 0 8px,#DDE5EA 8px 16px)
```

**Contrast audit — measured, and it does not all pass (NEW finding, Ben must rule).** `/accessibility` publishes a "sufficient contrast" claim and (WYS §37 UX) has a contrast acceptance box, so the approved palette has to be measured, not assumed. Measured WCAG 2.x ratios:

| Pair | Ratio | AA normal text (4.5:1) |
|---|---|---|
| `--accent` #1F7A8C on `--tint-teal` #EAF4F6 | **4.45:1** | **fails** |
| `--accent` #1F7A8C on `--tint-grey` #F4F6F8 | 4.59:1 | passes |
| `--accent` #1F7A8C on `--white` | 4.74:1 | passes |
| white on `--commit-disabled` rgba(22,32,43,.25) over white | **1.69:1** | **fails** (disabled text is exempt from AA, but it is unreadable) |

The failing pair is the approved treatment for the hero badge ("Free · No account · No AI required", 14 px), the "See what this site knows about you" row (16 px) and every teal status badge — all normal-weight text below 18.66 px. **This is a visual deviation from an approved artboard and cannot be resolved silently.** Options, for Ben (Q23): (a) darken the accent to ≈`#1A6B7B` for *text on tint*, keeping `#1F7A8C` for fills, bars and the focus ring; (b) raise those specific labels to ≥18.66 px semibold, where the 3:1 large-text threshold applies; (c) accept a documented AA miss on badge text and say so on `/accessibility`. Build-now default: **(a)**, as a second token `--accent-text-on-tint`, with the delta reported in `docs/facelift-unapproved.md`. Re-measure and record every pair again in Phase 12.

**Colour usage rules (encode as comments beside the tokens so later work cannot drift):** `--accent` never carries body text and never draws a selection ring. `--accent-on-dark` appears only inside ink slabs. `--tint-teal` is the "current / next / selected" fill. Selection is a **2 px ink ring on a pale-teal fill**. There is **no icon set** — the only glyphs are the literal text characters `▶ → ↓ ✓ ≠ ·`.

**Light-only.** All sixteen approved screens are light-mode; the ink slabs are a compositional device on white, not a theme. Add no `prefers-color-scheme` block, no `data-theme`, no inverted palette. Stated explicitly so nobody later "adds dark mode for parity". (This differs from the usual artifact/theme convention — here light-only is the approved design.)

### 4.3 Fonts

Delete `app/globals.css:1` (the `@import url("https://fonts.googleapis.com/…Spectral…")`). Adopt `next/font/google` in `app/layout.tsx`. **The weight set is decided by the preserved stylesheet, not by the artboards alone.** The artboards need Sans 400/500/600 and Mono 400/500 — but §4.4 aliases `--mono` and `--serif` onto these same faces, and the 933 preserved lines declare Mono at **600 in 10 rules** (`globals.css:127, 199, 263, 352, 376, 404, 467, 523, 552, 599`) and at **700 in 7 rules** (`:166, 239, 393, 479, 579, 693, 800` — `:479` `.stepper span` inherits `--mono` from `.stepper li` at `:467`), plus `--serif` **italic in 2 rules** (`:195, 717`) — **19 declarations in all**. The `@import` being deleted loaded `IBM+Plex+Mono:wght@400;500;600;700` and Spectral with `ital` axes, so those faces exist today. Loading fewer faces produces browser-synthesised faux-bold and faux-italic on every preserved page, with no compile error and no test failure — the regression is invisible to every test this plan proposes, which is why the decision is recorded here rather than left to the implementer.

**Decision — load the faces, do not rewrite the legacy rules:** `IBM_Plex_Sans` weights **400/500/600** with `style: ["normal", "italic"]`, and `IBM_Plex_Mono` weights **400/500/600/700**. Two extra mono weights and one italic axis are a smaller and far more reversible cost than editing 19 legacy declarations the restyle is otherwise not touching, and it keeps the aliasing mechanism honest: re-pointing a token must not silently degrade type. If Ben later wants the weight ramp flattened, that is a separate sweep of those 19 declarations, recorded as its own task. `subsets: ["latin"]`, `display: "swap"`, `variable: "--font-plex-sans"` / `"--font-plex-mono"`, applied via `className` on `<html lang="en">`. Ships with Next 15.5 — no dependency added. A CSS `@import` serialises a second round trip before first paint, which violates (packet: performance) "Nothing below the immediate mobile reading path should delay first meaningful paint." A CSS `@import` must also be the first at-rule in a sheet, so it has to go before any new at-rule is added.

### 4.4 Token aliasing — the mechanism that restyles the preserved pages

All 933 lines reference tokens by name, and `/studio`, `/neon`, `/system`, `/contact` and the six legal pages have essentially no page-specific CSS beyond `.detail-page`, `.legal-page`, `.detail-grid`, `.detail-callout`, `.detail-link` and `.eyebrow`. So **re-pointing token values restyles every preserved route with zero markup edits** — which is the literal meaning of "restyled, not rewritten".

Keep every legacy name as an alias in the same `:root` block. **Never delete a legacy token name.**

```
--paper:        var(--white);      /* body ground */
--sheet:        var(--tint-grey);  /* card / section fill — NOT white, see below */
--plan:         var(--tint-teal);  /* accented block fill */
--ink-soft:     var(--body);
--dimension:    var(--muted);
--blueprint:    var(--accent);
--line:         var(--border-row);
--line-strong:  var(--border-pill-strong);
--serif:        var(--font-plex-sans);
--sans:         var(--font-plex-sans);
--mono:         var(--font-plex-mono);
--focus:        var(--accent);
--ink:          #16202B;      /* redefined, name kept — was #1b2430 */
--max:          1280px;       /* was 1120px */
```

**Figure and ground must not collapse.** The identity being replaced carries its contrast in the *token values*, not in borders or radii: `body` is painted `var(--paper)` (`globals.css:30`) and **19 rules** paint sections, cards, result panels and detail callouts with `var(--sheet)`. Mapping both to `--white` would render the hero, the router card, the result panels and the detail callouts white-on-white and structurally invisible after the aliasing step alone. So the map above preserves the three-step ground → card → accent ramp the legacy rules assume. Say it plainly: **aliasing alone yields a legible intermediate, not the finished restyle** — the geometry task below adds the radii, shadows and inset-slab rhythm on top, and only then does a preserved page look like the artboards.

**Aliasing is necessary but not sufficient.** The blueprint identity is only partly tokenised. A second, explicitly budgeted task must replace:

- ~11 hardcoded colour rules that bypass the tokens (`repeating-linear-gradient` hatch at ~lines 369–371 and 397–412, `rgba(51,64,107,.1)` / `.08` fills, `rgba(236,238,241,.7x)` ecru text);
- the untokenised **geometry**: zero border-radius everywhere (the only radius in the file is `50%` on `.plan-foyer i`), 2 px hard black borders, the graph-paper double-linear-gradient background, the compass marker, the dimension-line rules, the uppercase mono micro-labels, and the inverted `background: var(--ink); color: var(--sheet)` hover treatment on `.audience-button` / `.plan-room` / `.stakeholder-card`.

**The blueprint-scaffolding contradiction, resolved explicitly.** Three of those items are *CSS for markup that `app/page.tsx` still emits*, so "delete the rules" and "change no markup" cannot both hold — delete the rules alone and the page ships stray unstyled text inside `aria-hidden` wrappers. The elements are `.dimension-line` (`app/page.tsx:34`), `.plan-foyer` (`:51`) and `.scale-line`/`.scale-bar` (`:57-58`). All three are decorative, all three are `aria-hidden="true"`, none carries copy that a screen reader reaches, none carries an `href`, and none appears in metadata — so removing them does not touch a route, a link, a metadata title or any content a user or crawler consumes, and does not violate constraint 2 or 3. **Rule: markup and rules retire together in one commit, and `tests/class-contract.test.ts` expectations are updated in that same commit.** Do not leave it implied by "markup wrappers … may change". Because it is still a visible change to the approved-as-live home page, list it in `docs/facelift-unapproved.md` for Ben and name the exact four class families being retired.

**Retire every selector in a family, not a line range.** `.plan-room-N` has **five** rules, not four: `globals.css:316, 323, 329, 335` **plus `:894`**, inside the `@media (max-width: 700px)` block at `:841`. The same applies to `.plan-foyer` (`:288, 358, 375, 380, 385, 888, 898`), `.dimension-line` (`:256, 267, 272, 830, 876`) and `.scale-line`/`.scale-bar` (`:397, 408, 831, 902`). The instruction is **"remove every selector in the family"**, verified with `grep -c 'plan-room-' app/globals.css` (and the same for each family) returning `0`. A line range strands the media-query rule, and the className→rule test only checks one direction so it cannot flag the orphan.

Aliasing gets the palette and type; this task gets the radii (20/22/28/32), the soft shadows, the tinted-block rhythm and the removal of the hatch. Budget it as real work, not a side effect.

### 4.5 Structural rules preserved verbatim

Fence and comment a `STRUCTURAL` section the restyle does not touch. **Only their token values change:**

```
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }       /* globals.css:24-26 — see note 3 */
.sr-only { … }                          /* used by app/page.tsx:39 */
.skip-link { … }  .skip-link:focus { … }
:focus-visible { … }                    /* geometry is NOT verbatim — see note 1 */
@media (prefers-reduced-motion: reduce) { … }
```

Three rules need their status stated rather than assumed:

1. **`:focus-visible` geometry is a decision, not a preservation.** `globals.css:44-47` ships `outline: 3px solid var(--focus); outline-offset: 3px`, while §4.6 quotes the handoff README's 2 px outline at 2 px offset. Both cannot be requirements, and the README's own wording is "**suggested**", so this is not an authority conflict — it is a choice this plan has to make. **Decision: keep the 3 px / 3 px geometry and change only `--focus` to the teal.** It is more visible, it already ships, and `/accessibility` already publishes a claim measured against it. Record the deviation from the README's suggested 2 px in `docs/facelift-unapproved.md`, and remove the 2 px figure from §4.6 so only one number exists in this document.
2. **`main { overflow: hidden }` moves OUT of the fence** (`globals.css:141-143`). It clips **both** axes on the element wrapping every page's content, and §4.9 requires the hero demo card to overhang the text column at both ends carrying `--shadow-demo: 0 30px 80px -40px` — an 80 px blur that `overflow: hidden` cuts at `main`'s box. Its actual purpose is horizontal-overflow suppression only, so change it to `overflow-x: clip` (or scope the horizontal clamp to the sections that need it) as part of the budgeted geometry task. Vertical shadow and overhang then render; the page still cannot scroll sideways.
3. **`html { scroll-behavior: smooth }` stays inside the fence, paired with its override.** The `prefers-reduced-motion` block at `globals.css:921-924` exists *only* to set `scroll-behavior: auto`. Dropping lines 24-26 in the 933-line rewrite makes that reduced-motion rule a no-op override of a default that no longer exists — a silent regression against a published accessibility claim. **Never move one half of this pair without the other:** keep both, or delete both and say so.

**One deliberate exception.** The shared container rule

```
.site-header,.site-footer,.hero,.router-section,.destinations-section,.stakeholder-section,.detail-page {
  width: min(calc(100% - 2rem), var(--max));
  margin-inline: auto;
}
```

is structural in **mechanism** (it is the only thing centring every page) but not in **value**: `calc(100% - 2rem)` gives 16 px gutters, and the design mandates 56 px desktop / 22 px mobile. Keep the single-rule mechanism, change the value to a token-driven gutter, and note the consequence: `--max` moving 1120 → 1280 widens the reading measure of every preserved legal page. That is intended and is part of the identity change.

`--focus` is **replaced, not removed** — `/accessibility` publicly claims visible focus styles.

### 4.6 Interaction states — NEW, unapproved, required

The approved markup contains no `:hover`, `:focus`, `:active`, `transition`, error, empty or loading state. The only state variation anywhere is the bound selection swap and the disabled Commit fill. But `/accessibility` already publishes "semantic HTML, keyboard-focusable links and controls, visible focus styles, skip navigation, and responsive layouts", so this layer must be authored.

Per (handoff README Interactions & Behavior) — the only guidance that exists — and (WYS §27):

- `:focus-visible` → **3 px `#1F7A8C` outline at 3 px offset**, per the §4.5 note 1 decision. The README's "2 px … suggested" is deliberately not adopted; the existing 3 px geometry is kept and only the colour token changes, so `/accessibility`'s published claim is checked against exactly one rule.
- Touch targets ≥ 44 px. No hover-only functionality.
- Reveal ≈ 200 ms ease-out, honouring `prefers-reduced-motion`.
- Author hover, active, disabled, empty and error states from the token set.

Flag the entire layer as NEW/unapproved for Ben's stamp.

### 4.7 Two normalisations of artboard-vs-artboard conflicts

Both are mockup-vs-mockup, so R1 gives no winner. Both are flagged for Ben (Q17, Q18).

1. **Selection must not reflow.** `4a`'s demo swaps a 1.5 px base border for 2 px on select. `5a`'s posture rows and cadence tiles have **no** base border and gain `2px solid #16202B` on select, shifting every row below by 4 px. Normalise on the `4a` pattern: a 1.5 px hairline/transparent base border on every selectable row, or an inset box-shadow ring. Rest and selected states look identical to the artboards; only the reflow disappears. **Report the 2 px visual delta on Lesson Zero.**
2. **One primary-button fill.** Commit appears in three colours: ink on `5a`, teal on `5b` Today, state-bound in `4a` (ink enabled / `rgba(22,32,43,.25)` disabled). Standardise on **ink enabled, `rgba(22,32,43,.25)` disabled**, with teal reserved for the nav CTA and continue/secondary pills — ink matches 2 of 3 Commit instances and every other primary pill in the set (Continue, Show my plan, Download my local data). **Report the Today Commit recolour as a deliberate deviation from `5b`.**

### 4.8 Primitive inventory

Roughly twenty primitives account for nearly every pixel. Three of them — Pill, ChoiceRow, CardShell — plus the JUDGE composite unlock `4a` desktop, `4a` phone, `5a` step 5 and `5b` Today simultaneously. Build in that order.

| Primitive | Notes |
|---|---|
| `Pill` | radius 999. Variants: teal status badge (14/13/12 px), grey draft badge, outlined-on-dark (1 px `#7FC8D6`, `nowrap`), outlined status chip (1 px `rgba(22,32,43,.2)`), white chip, white-on-media overlay, translucent-on-dark. |
| `ActionPill` | Ink primary · teal secondary · outlined 1.5 px · white-on-ink · disabled. Full-width mobile variant is `text-align:center`, padding 16–17. |
| `StruckPill` | Keeps `text-decoration:line-through`. Desktop: 8 labels, flex-wrap, gap 10, `max-width:820`, centred. Mobile: 5 shortened labels, gap 8, left-aligned. |
| `ChoiceRow` | Normalised per §4.7.1. Letter is always `<span>` at `--accent` 600. Rows stack gap 8. Live vs static variants. |
| `CardShell` | Five fills that **encode meaning**: ink (dark punctuation) · tint-teal (current/next/carry) · tint-grey (neutral) · white-with-hairline-border (**a live decision surface** — the only bordered container on Today and in the `4a` hero) · dashed. **Encoding rule — authored guidance for the learner-content surfaces only (Progress's rulebook rows vs its judgment rows), not something read off the artboards:** filled = system-recorded fact, outlined = learner-authored, dashed = empty/awaiting. The approved set contradicts it in at least three places, so the exceptions are listed rather than the rule being generalised: (a) `5d` Bridge OPEN QUESTIONS rows are outlined (`border:1.5px solid rgba(22,32,43,.12)`) and are **Ben's** questions, not learner-authored; (b) `5c` Data's "Restart the course" and "Clear this browser's data" are outlined **action** pills; (c) `5c` Practice's "I'd want deeper practice" is an outlined **action** pill. Do not treat the rule as design authority; where an artboard disagrees, the artboard wins (R1). |
| `MediaSlot` | Never an image. 135° stripe + mono caption + optional overlay pill. **Typed with no prose-bearing prop** (§6.4). |
| `DashedSlot` | Teal dash = awaiting Ben. Grey dash = empty/optional/terminal. White-on-ink dash = non-persisted scratch. **Never mix the inks.** No prose-bearing prop. |
| `ProvenanceMono` | The **only** component permitted to use IBM Plex Mono. 11 px (12 px for the Bridge state block). Enforced by test (§11). |
| `ProvenanceLabel` | **A function of `(surfaceKind, origin)`, not of `origin` alone.** (WYS §23)'s labels are grouped by surface — Human source / Fictional scenario / Judgment — so `origin` alone cannot select one. Never hand-typed. See §6.3 for the full mapping and for the four origins §23 supplies no string for. |
| `DraftMark` | The 11 px mono draft line. Required on **both** breakpoints (§6.4). |
| `JudgmentCard` | Ink, radius 20 desktop / 18 mobile. Header is `flex justify-between`: **left label computed by `ProvenanceLabel("judgment", origin)`** — never a hardcoded "BEN'S JUDGMENT" — right `you chose {pick}` (falls back to `—`). The artboard header reads `BEN'S JUDGMENT · slot awaiting Ben`, which is **two** strings concatenated, not one label: a **surface title** ("BEN'S JUDGMENT", the name of the slot on the page, static chrome) and a **slot-state suffix** ("· slot awaiting Ben") rendered by `BenSlot` while the object's origin is not Ben's. `ProvenanceLabel` supplies neither; it renders the §23 judgment string beneath the body. That is how a computed label and the approved header coexist without the header ever asserting Ben wrote the prose above it. |
| `DistributionBars` | Grid `18px 1fr 40px`, 10 px track, teal fill; collapses on mobile to a single 13 px strip. **Numbers and caption are one inseparable unit** (§6.5). |
| `PlayDisc` | Text `▶` in a 56 px ink circle or 40 px white circle. No SVG, no icon font. |
| `AudioSlotPill` | Two-line: title 15/500 + sub 12 px `--accent-on-dark`. Asymmetric padding `10px 20px 10px 10px`. |
| `StopCard` | Four state fills: ink (Lesson 0) · tint-teal (current) · tint-grey (future) · white + 1.5 px dashed (terminal H). |
| `StatCard` | 34 px numeral + inline 17 px muted denominator. **No ring, no bar, no percentage.** |
| `LinkRow` | Full-width teal row, `justify-between`, literal `→`. |
| `KvRow` | Filled (system fact) / outlined (learner-authored) / bare (Data card 1). |
| `SectionEyebrow` | Desktop 15 px/500; mobile 12 px/600, **typed in caps in the copy**, not `text-transform`. |
| `PhasePills` | Watch/Try/Judge/Carry. Active ink, inactive tint-grey. |
| `ProgressRail` | 6 px, `--tint-grey` track, `--accent` fill, width = step/total. |
| `NumberedOrderCard` | Ink (01, with its optional gloss) / tint-grey (02–09). The gloss is an optional data field, not a style rule. |
| `LogEntryCard` | Meta row + status chip + title + body + optional order-tag row. |
| `GridTile` | Property tiles; the current-context tile is tint-teal. |
| `BottomNav` | White, 1 px top hairline, five equal items, active ink/600. No icons, no badges, no indicator. |
| `DisclosureStrip` | §5.5. |

### 4.9 Per-screen geometry is part of fidelity

(handoff README) sets fidelity as "High… Recreate pixel-close." A class-contract test proves a class resolves to a rule; it does not prove the rule matches the artboard. So each screen task in Phase 7–10 carries its measured geometry, and Phase 12 includes a side-by-side check at 1280 and 390 against the five PNGs. Key desktop values that must survive: hero grid `1fr 520px` / gap 64 / `align-items:center` (the demo card deliberately overhangs the text column at both ends); instructor band `300px 1fr`; stop strip `repeat(9,1fr)` gap 8; every non-white block is an **inset slab** at `margin: 0 56px` — never full-bleed; **no divider rule under the nav or above the footer** (the only chrome border in the entire approved set is the mobile tab bar's top hairline).

---

## 5. Information architecture

### 5.1 The canonical-node rule

(packet: Critical LLM rule) — **"History remains available, but only one state is canonical by default."** Hard rule: **"No concept may have more than one current canonical node."** This governs every routing decision below. Shipping both `/bridge` and `/author-ship/current` would break it.

### 5.2 Route table

| Route | Kind | Status | Source |
|---|---|---|---|
| `/` | marketing | preserved + extended | mockup 4a desktop; existing `app/page.tsx` |
| `/studio` `/neon` `/system` `/contact` | preserved | restyled | existing |
| `/privacy` `/terms` `/cookies` `/copyright` `/accessibility` `/ai-disclosure` | legal | restyled + refreshed | existing + §8b |
| `/watch-your-step` | course landing | NEW | WYS §5.1; mockup 4a phone |
| `/watch-your-step/start` | Lesson Zero, 10 steps | NEW — **route name is an addition** | WYS §9; mockup 5a. **§5.1's route list omits Lesson Zero entirely** even though both CTAs say "Start Lesson Zero". Report as an addition. |
| `/watch-your-step/today` | course | NEW | WYS §5.1; mockup 5b |
| `/watch-your-step/plan` | course | NEW | WYS §5.1; mockup 5b |
| `/watch-your-step/progress` | course | NEW | WYS §5.1; mockup 5b |
| `/watch-your-step/practice` | course | NEW | WYS §5.1; mockup 5c |
| `/watch-your-step/data` | course | NEW | WYS §5.1, §18, §20; mockup 5c |
| `/watch-your-step/stop/[stopId]` | per-stop surface | NEW — **required, undesigned** | See §5.3 |
| `/watch-your-step/end` | Stop H terminal | NEW — **required, undesigned** | WYS §11 Period H; mockup 5b dashed "the end" row |
| `/bridge` | ship | NEW | mockup 5d; packet: Bridge |
| `/standing-orders` | ship | NEW | mockup 5d |
| `/ships-log` | ship | NEW | mockup 5d |
| `/crew` | ship | NEW — **no artboard** | packet: Crew Manifest; Standing Order 06 |
| `/ben` | ship (Captain's Quarters) | NEW | mockup 5d |
| `/author-ship/state.json` | machine mirror | NEW | packet: state.json keys |
| `/sitemap.xml` `/robots.txt` `/llms.txt` | machine | NEW | packet: crawler surfaces |
| `/not-found` | NEW | required | no artboard |
| `app/error.tsx`, `app/global-error.tsx` | **convention files, not routes** | required | no artboard |
| `/watch-your-step/about` | course | **deferred** | (WYS §5.1) lists it as optional; no artboard, no content, nothing on it that the landing does not already carry. Recorded in §14. |
| `/watch-your-step/sources` | course | **deferred in v0, recommended for v1** | (WYS §5.1) optional. It is the natural single canonical node for the ten labelled Ben source slots, their `approvedExcerpts` and the (WYS §27) transcripts — which the current plan scatters across Today, Practice and Captain's Quarters, exactly the Standing Order 07 duplication this build is otherwise careful about. Deferred only because no artboard draws it and no Ben recording exists yet to put on it. **Flag for Ben with the recommendation.** Recorded in §14. |
| `/lab` `/about` `/posts` | redirects | preserved as-is | `next.config.ts` |

**Five approved on-screen controls have no target anywhere else in this plan.** They are inbound links the artboards draw, so they must be wired or they ship dead:

| Control (artboard) | Target |
|---|---|
| "Who is Ben →" — `4a` desktop instructor band (dc.html:371) | `/ben` |
| "or try one question →" — `4a` desktop hero secondary CTA (dc.html:330) | in-page anchor to the hero demo card (`#try-one`), **not** a route |
| "Keep going — Lesson Zero" — post-commit continue pill, both breakpoints (dc.html:359, :458) | `/watch-your-step/start` |
| "See the full data page →" — Lesson Zero step 9 data card (dc.html:68) | `/watch-your-step/data` |
| "exactly what this site stores about you →" — `4a` home anti-features block (dc.html:412) | `/watch-your-step/data` |

Add all five to the new-link half of `tests/preserved-surfaces.test.ts` so none ships dead. The last two are **marketing → course-shell crossings**: they land the visitor inside the `(shell)` route group and therefore inside the bottom-tab chrome. That is acceptable and is the same decision §5.4 already makes for the landing — but state it, because it means the Data page is reachable *from outside the course* while rendering *inside* course chrome.

**Ship-URL scheme — build-now default (recorded as a decision, not left as a blocker):** short human URLs `/bridge`, `/standing-orders`, `/ships-log`, `/crew`, `/ben` are the canonical human nodes; `/author-ship/state.json` is the machine **mirror** of the same canonical objects, documented in-file as a rendering rather than a second canonical node; **no `/author-ship/current` page is created.** If Ben prefers the nested scheme (Q4), it is a rename plus a link sweep — cheap, and it does not block Phase 5. Use `/ships-log` consistently; do not mix `/log` and `/ships-log`.

**Metadata — state the existing convention accurately.** The repo's convention is `title` **only**: every page that exports metadata exports exactly `{ title: "X - BenChanTech" }` with **no `description`** (e.g. `app/accessibility/page.tsx:1-3`), and **four of the eleven pages export no `metadata` at all** (`app/page.tsx`, `app/studio/page.tsx`, `app/system/page.tsx`, `app/neon/page.tsx`), inheriting the root layout's single `description`. So: **every new route gets a `metadata` export with `title` only, matching `"X - BenChanTech"`.** Adding `description` to new routes, or adding `metadata` to the four pages that lack it, changes what search engines and OG cards show for surfaces that are supposed to be preserved verbatim — if either is wanted it is a **new, reported convention**, not a restyle, and it needs Ben. Build-now default: title only on new routes; the four metadata-less pages are left exactly as they are.

**Canonical URLs.** §5.1's "no concept may have more than one current canonical node" is currently enforced only by a content-layer test, which nothing a crawler or an LLM reads can see — and Q3's build-now default deliberately mounts the same hero and demo component on two URLs. So: **every new route exports `metadata.alternates.canonical`**, and the `/` mount of the WYS hero points its canonical at `/watch-your-step`. `/author-ship/state.json` declares itself a mirror **in-band** (a `"canonical_human_node"` key), not only in a code comment. (packet §15) also names structured data as a machine-readability foundation; this plan **explicitly defers JSON-LD** (§14) rather than leaving it unmentioned.

`app/error.tsx` must carry `"use client"`. **`/error` is not a URL** — `app/error.tsx` is a convention file that catches errors in the segments *below* the root layout, so it never appears in a route table and never appears in the prerendered-route list. It also does **not** catch an error thrown by the root layout itself, which is precisely where the new header, the disclosure strip and `next/font` now live. Therefore **`app/global-error.tsx` ships too** (also `"use client"`, and it must render its own `<html>` and `<body>`), in the same phase that rewrites the root layout.

### 5.3 The per-stop route and the visit counter

Today renders "Stop A · visit 1 of 3"; Plan renders nine rows; the path strip renders nine cells. None of that is reachable without a per-stop surface, and `WysLocalStateV1.progress` has no `visits` field.

**Rule:** do not add a field to the verbatim `wys:v1` shape. **Derive** the visit index from content data plus completed IDs: for the current `WysWeek`, `visit = (number of that week's `cadencePaths` steps whose IDs appear in `progress.*`) + 1`, and `of m` = the length of the learner's chosen cadence path. Render it; never store it. **This derivation is authored, not specified — report it.**

**The cadence fallback must be defined, because two of the four paths are optional.** (WYS §8.10) types `cadencePaths` as `{ days2: string[]; days3?: string[]; days5: string[]; mostDays?: string[] }` — `days3` and `mostDays` may be absent — while (WYS §17) allows `cadence?: "2" | "3" | "5" | "most"` and artboard `5a` offers "Most days" as a selectable option. A learner who picks "Most days" against a week that omits `mostDays` gets `undefined.length` and the whole visit counter throws. **Rule:** `mostDays` falls back to `days5`; `days3` falls back to `days2`; the resolver is a single exported function `cadencePathFor(week, cadence)` that never returns `undefined`. Cover it in `tests/wys-local-state.test.ts` with a week that declares only `days2` and `days5` and a learner on each of the four cadences. (The alternative — making both fields required in the content type — is a recorded deviation from §8.10 and is *not* the default here.)

`/watch-your-step/today` renders the current stop's current visit. `/watch-your-step/stop/[stopId]` is the deep-linkable form used by Plan rows and the path strip. Give it `generateStaticParams()` over the stop IDs plus **`export const dynamicParams = false`**, so an unknown `stopId` 404s at build time instead of falling back to on-demand rendering. **Note the build marker it produces:** a `generateStaticParams` route builds as `●  (SSG) prerendered as static HTML`, **not** `○  (Static)`. So the acceptance gate is not "every route Static" — it is **"every route is `○` or `●`; zero `ƒ`"**. That is the wording every phase Exit and §10 use.

### 5.4 Route groups — the Lesson Zero / tab-shell problem

`app/watch-your-step/layout.tsx` carries the persistent bottom nav and `padding-bottom: 110px`. Lesson Zero has **no** bottom nav and `padding: 72px 22px 60px` (mockup 5a). Under App Router a child inherits its parent layout, so this needs structure:

```
app/watch-your-step/
  (shell)/layout.tsx        ← bottom nav + 110px bottom padding
    page.tsx                ← landing
    today/ plan/ progress/ practice/ data/ stop/[stopId]/
  (flow)/layout.tsx         ← progress rail, no bottom nav, 60px bottom padding
    start/ end/
```

Route groups do not affect URLs, so `/watch-your-step/start` is unchanged.

**Landing tab-bar behaviour.** Render the tab bar on the landing with **no active item**. The artboard bolds "Today" for a visitor with zero state, which would drop them into an empty course; (WYS §5.1) requires the primary loop to be one tap from the WYS home, which onboarding satisfies. But routing *every* tab to onboarding is wrong on three counts, so the rule is narrower:

- **Data is exempt, always.** (WYS §18) — "Create a first-class `/watch-your-step/data` page. **Do not bury it as generic legal copy.**" (WYS §20) — "This is a curriculum feature, not merely a settings page." (WYS §2.2) lists both "Data Manifest" and "See what Watch Your Step knows about you" under **Build now**, and artboard `4a`'s phone links straight to it with the "See what this site knows about you" pill *before any onboarding exists*. Burying it behind a ten-step flow contradicts all four. **Data is reachable in one tap from the landing with no local state**, rendering the empty / no-storage variant §7.3 already requires.
- **Prefer empty states to redirects for Plan and Progress too.** Both have honest zero-state renderings (a full plan with nothing marked; four stat tiles reading 0). Reserve the onboarding redirect for **Today** only, which is the one tab that genuinely has nothing to show without a chosen pace.
- **Five tabs pointing at one URL is also an accessibility problem** under (WYS §29.3)'s "no modal traps": a keyboard or screen-reader user tabbing the bar finds five controls with five different names and one destination, which reads as a broken control set, not a guided flow.

**What the server HTML carries (this was undefined and must not be).** §7.3 forbids reading `wys:v1` during render and mandates a `{ loaded: false }` sentinel, so the tabs cannot compute a state-dependent `href` at first paint — which is exactly what a crawler, a no-JS visitor and the first paint all receive, on the one component present on every course page. **Rule: the tabs always render their real destinations (`/watch-your-step/today`, `/plan`, `/progress`, `/practice`, `/data`) in server HTML.** The hrefs are therefore stable across hydration, the site is crawlable, and it works without JS. The state-dependent branch lives in **one** place instead of five: `/watch-your-step/today` redirects a stateless visitor to `/watch-your-step/start` client-side once `loaded === true`. `/data` never redirects.

### 5.5 The disclosure strip — required on every page footer

(handoff README) — "**Required on every page footer.**" Verified: the strip markup appears in the approved set **only** at `4a` desktop. It is absent from all eleven approved phone artboards, and its desktop flex geometry (`gap:32`, two `nowrap` children, 18 px body) cannot survive 390 px minus 44 px of gutters.

- **Desktop:** ink, radius 28, padding 36×40, `display:flex; align-items:center; gap:32`. Outlined teal "Disclosure" pill (`nowrap`), 18 px/1.5 body with the first sentence bold, `nowrap` 15 px `--accent-on-dark` "Crew Manifest →".
- **Mobile (NEW/unapproved):** stacked — pill above, 15–16 px body, "Crew Manifest →" below — reusing the `5d` dark-card treatment (radius 22, padding 18). Structural precedent in superseded turn `2f`; visual register from `5d`.
- **Approval sentence:** the final sentence is **bound to `lib/approval-state.ts`, not hardcoded** (§6.6). See stop condition SC-1.

### 5.6 Root chrome on course and ship pages

The phone artboards show no site header and no footer strip — they begin straight at content. But the README requires the strip on every page footer, and mobile users need site nav somewhere. **Decision:** the root header renders on every route (compact on mobile) and the root footer + disclosure strip render on every route, including course and ship pages. This changes every WYS screen's vertical geometry from the artboard. Flag as NEW/unapproved and include in the Ben stamp list (Q9). Do **not** silently suppress the strip on WYS pages — that would break the README requirement and the site's own transparency claim.

---

## 6. Data and provenance

This is the substrate. It is written and tested before any content module or renderable screen exists.

### 6.1 The two enums

```ts
type ContentStatus =
  | "draft"
  | "ben_reviewed"
  | "published"
  | "historical"
  | "superseded";

type ContentOrigin =
  | "BEN_AUTHORED"
  | "BEN_APPROVED"
  | "BEN_AUTHORED_VARIATION"
  | "FICTIONAL_AUTHORED"
  | "AI_ADAPTATION"
  | "AI_SYNTHESIS"
  | "EXTERNAL_SOURCE"
  | "LEARNER_OWNED"
  | "IMPLEMENTATION_PLACEHOLDER";   // 9th member
```

The ninth member is required by (WYS §7) "Never do this" — "mark origin `AI_SYNTHESIS` or `IMPLEMENTATION_PLACEHOLDER`" — and by (handoff README bucket 3), even though §7's type listing omits it.

Additionally: **add `origin: ContentOrigin` to `WysRitual` and `WysCarry`.** The spec's listings give them `status` but no `origin`, yet their text renders publicly on Today and Practice as draft placeholder copy and must be distinguishable from Ben-authored material.

### 6.2 The render policy is TWO-AXIS, not one boolean

This is the single most important correction in this plan. A one-boolean `isPubliclyRenderable(status)` that permits only `published` empties the entire course: (handoff README bucket 3) **requires** every fictional scenario, choice label, revealed judgment body, the 18/61/21 split and stop titles A–H to ship at `status: "draft"`.

**This reading is a reinterpretation, and it is NOT settled — it is escalated as Q21.** State the tension exactly as it is, because the plan's own rules point the other way:

> (WYS §7) *Public rendering rule* — "Production curriculum may render: `published`; optionally `ben_reviewed` if Ben explicitly chooses that behavior." Then, separately: "Production must not silently render `draft` Ben doctrine as if it were canonical."

The first sentence is a **positive whitelist**. The second is an *additional* prohibition, not a restatement of the whole rule. Reading the second sentence as if it were the whole rule — "anything that isn't silent Ben doctrine may render" — is what produces the two-axis policy below. That reading is defensible on the words "Ben doctrine" and "silently", it is what (handoff README bucket 3) requires, and it is what the approved artboards draw. But **R3 of this plan says the spec beats the handoff README**, and (WYS §33 step 25) agrees with the spec — "Populate only verified/published Ben material." So absent Ben's answer, **the spec's whitelist wins**, and this plan must not present its own reinterpretation as decided.

**Build-now default (Q21):** the two-axis machinery below is built in full — it is the thing that makes the question answerable at all — but whether production *renders* `marked` draft is a single exported constant, `RENDER_MARKED_DRAFT`, alongside `RENDER_BEN_REVIEWED`. **It defaults `false`, matching the spec's literal whitelist.** With it false, README bucket-3 course content still exists in `content/`, still compiles, still carries its labels, and is visible on the dev preview route (§6.11) — it simply is not public. Flipping it to `true` after Ben rules is one line and no component change. Phases 6–10 build every screen and every content object either way; the constant only decides what a production visitor sees. **Say plainly in the §38 report: shipping the public course with draft scenario prose requires Ben's answer to Q21.**

With that recorded, the policy has two axes:

```ts
type RenderPolicy =
  | { kind: "blocked" }                       // must not render at all
  | { kind: "marked"; label: ProvenanceLabel } // renders ONLY with its label
  | { kind: "canon" };                        // may render as Ben-attributed

function renderPolicyFor(obj: { status: ContentStatus; origin: ContentOrigin }): RenderPolicy;
```

Rules:

1. **`canon`** requires `status ∈ {published}` (plus `ben_reviewed` if and only if `RENDER_BEN_REVIEWED === true`, which defaults **false** — WYS §7 makes it Ben's explicit choice, Q13) **and** `origin ∈ {BEN_AUTHORED, BEN_APPROVED, BEN_AUTHORED_VARIATION}`.
2. **`marked`** — non-Ben-origin material (`FICTIONAL_AUTHORED`, `AI_SYNTHESIS`, `AI_ADAPTATION`, `IMPLEMENTATION_PLACEHOLDER`, `EXTERNAL_SOURCE`) may render at `draft` status **only when `RENDER_MARKED_DRAFT === true` (Q21, default `false`) and only when accompanied by its `ProvenanceLabel` and, for `AI_*`/`IMPLEMENTATION_PLACEHOLDER`, a `DraftMark`.** The label is not optional and not stylistic. With the constant `false`, `marked` resolves to `blocked` on public routes and to `marked` on the dev preview route.
3. **`blocked`** — anything Ben-origin that is not `published`/permitted `ben_reviewed`; anything `historical`/`superseded` reached from a current surface.
4. `historical` objects must additionally carry `supersededBy` and `canonical: false` (packet: historical-machine-readable).

**The label must be structurally inseparable from the body.** The renderer takes the content object, not a string: a component cannot receive the prose without also receiving the label. `JudgmentCard`'s header label is **computed** by `ProvenanceLabel` from `origin` — never a hardcoded "BEN'S JUDGMENT".

### 6.3 Provenance labels (verbatim, WYS §23)

§23 groups its seven strings **by surface kind**, not by origin — so `ProvenanceLabel` is `(surfaceKind, origin) => string`, never `origin` alone:

| Surface kind | Origin | §23 string (verbatim) |
|---|---|---|
| `human-source` | `BEN_AUTHORED` | `Ben source` |
| `fictional-scenario` | `FICTIONAL_AUTHORED` | `Fictional practice scenario — authored for Watch Your Step` |
| `fictional-scenario` | `BEN_AUTHORED` / `BEN_AUTHORED_VARIATION` | `Ben-authored fictional scenario` |
| `fictional-scenario` | `AI_ADAPTATION` | `AI adaptation based on Ben's supplied principles` |
| `judgment` | `BEN_AUTHORED` | `Ben's authored judgment` |
| `judgment` | `AI_SYNTHESIS` | `Coach synthesis based on Ben sources` |
| `judgment` | `INSUFFICIENT_SIGNAL` | `Ben has not addressed this closely enough` |

**Four origins §23 supplies no string for, and the `marked` policy needs all four** — these are exactly the origins (handoff README bucket 3) mandates, so without them `JudgmentCard` is unimplementable. They are **new copy this build must author**, and because a provenance label is a claim about who wrote something (not UI chrome), each one **goes on the Final-copy escalation list for Ben's stamp** (§8b.4, Q1):

| Origin | Proposed string (NEW — needs Ben's stamp) |
|---|---|
| `IMPLEMENTATION_PLACEHOLDER` | `Implementation placeholder — not Ben's words` |
| `AI_SYNTHESIS` on a non-judgment surface | `Drafted during implementation — not Ben's words` |
| `EXTERNAL_SOURCE` | `External source — not Ben's words` |
| `LEARNER_OWNED` | `Yours. Stored in this browser only.` |
| `BEN_APPROVED` (Ben approved wording he did not author) | `Approved by Ben` |

`ProvenanceLabel` must be **total**: every `(surfaceKind, origin)` pair either maps to a string above or is a compile error. There is no fallback string and no empty render — a missing mapping is a build failure, not a blank label.

Plus the mono draft marks used in the approved artboards:

```
draft · implementation placeholder · not Ben's words
scenario: draft · implementation placeholder
```

(WYS §23) — **"Do not use a generic sparkle icon as provenance. Do not make AI-generated material look more polished or premium than human source material."**

**Flagged tension (Q19):** artboard `4a` puts AI-drafted prose inside a premium dark card headed "BEN'S JUDGMENT · slot awaiting Ben", while Ben's own source next to it is a grey striped placeholder. The mono draft line mitigates it; it does not resolve whether draft AI prose may sit in a card headed with Ben's name. Ben decides.

**Safe-direction overrides — there are two on the same artboard, not one.** The `4a` phone omits three things the desktop carries, and all three are load-bearing:

1. The **`DraftMark`** (`draft · implementation placeholder · not Ben's words`). It renders on **both** breakpoints. That line is the mechanism keeping AI-drafted judgment text from reading as Ben's; its absence on mobile is a defect, not a design (R9).
2. The **distribution caption and the "totals only" label**. Desktop carries "Example numbers — live totals appear once the first-party counter is on." (dc.html:357) and "totals only · no one is tracked" (dc.html:351); the phone (dc.html:456-458) renders the bare numerals "A 18 · B 61 · C 21" and goes straight to "Keep going — Lesson Zero" with neither string. §6.5 declares the numbers and their caption **inseparable**, so both strings render on mobile too. Same R9 direction, same reason.
3. The **Reset control**. The JUDGE state machine's spec'd reset has no affordance at all on the phone artboard — the desktop has a "Reset" pill (dc.html:359), the phone has none. **Decide and report:** build-now default is to render Reset on mobile as well (a state machine with an unreachable transition is a defect), flagged as a mobile addition.

Report all three in `docs/facelift-unapproved.md`.

### 6.4 Ben slots cannot be filled

`MediaSlot` and `DashedSlot` take a **label** and an **awaited-asset descriptor**. No `children`, no `text`, no `body` prop. A generated string physically cannot occupy a slot the design labels "Ben source". This makes (handoff README bucket 2) "never fill with generated text" a compile error rather than a review catch, and makes the Bridge's own on-screen rule true: *"Awaiting Ben. No draft AI text is shown here, by rule."*

### 6.5 Illustrative data cannot render uncaptioned

`DistributionBars` takes numbers and caption as one object; neither renders without the other. When a real counter exists the caption is **replaced**, not removed. Reason: (packet: Proposition K) — "I should not publicly promise an outcome that I have not observed simply because I hope the system will produce it." The 18/61/21 split is `status: "draft"` per (handoff README bucket 3). (Q11: hide the card entirely until real counts exist?)

### 6.6 Approval state is data, never copy

`lib/approval-state.ts` is the single source for every governance string on screen:

```ts
interface CaptainsStamp {          // packet: Captain's Stamp — five named elements
  approvedBy: "Ben Chan";
  approvedAt: string;               // ISO 8601
  standingOrdersVersion: string;    // version AT TIME OF APPROVAL, not current
  buildId: string;                  // commit / build identifier
  fingerprint?: string;             // cryptographic fingerprint where appropriate
}

export const approvalState = {
  stamp: null as CaptainsStamp | null,   // null renders "not yet stamped"
  lastCaptainsRound: null,          // renders "none yet"
  latestSnapshot: null,             // renders "0 pending"
  standingOrders: { version: "draft", status: "draft" },
  keel: { name: "YY Method Professional v2.3", url: "https://yymethod.com/work", sha256: null },
} as const;
```

**`stamp` is `CaptainsStamp | null`, not the string `"not-yet-stamped"`.** (packet: Captain's Stamp) names five elements — approved by Ben Chan · timestamp · Standing Orders version · commit/build identifier · cryptographic fingerprint where appropriate — and a bare string can represent none of them, so the module could not express a stamp once Ben made one. With the type above, the disclosure strip's approval sentence, the footer stamp line and every Ship's Log chip flip from **one** typed value.

**Per-object approval too.** Add `approvedBy?`, `approvedAt?` and `standingOrdersVersion?` to the provenance fields carried by content objects, so the packet's "missing approval" validation check is answerable **per record** rather than only site-wide.

Drives: the `4a` footer "Designed first for mobile · Not yet stamped"; the grey "Standing Orders · draft" pill; the `5d` "approval pending" chips on every log entry (the **default** entry state); the Bridge mono block "captain's round: none yet · snapshot: 0 pending / stamp: not yet stamped · governed by YY Method v2.3"; and the disclosure strip's final sentence. Ben stamping a section flips all of them without a copy edit.

**No SHA-256 is printed for YY Method v2.3 until Ben publishes one on yymethod.com/work.** (packet: hashing) requires freeze → SHA-256 of canonical UTF-8/LF Markdown → publish on `/work` → *then* cite. The Bridge already renders that as pending.

`tests/governance-strings.test.ts` greps `app/` and `components/` for the literals `Not yet stamped`, `approval pending`, `Standing Orders · draft`, `approved by Ben`, `captain's round` and fails if any appears outside `lib/approval-state.ts` or `content/`. Without it, the module is a convention, not a mechanism.

### 6.7 The authoring object model (WYS §8)

Ten interfaces, copied verbatim from §8.1–§8.10 into `content/watch-your-step/types.ts`, importing the enums from `lib/content-status.ts`, with the spec's narrowed unions preserved (`WysJudgment.origin` includes `"INSUFFICIENT_SIGNAL"`; `WysCanonicalVariant.origin` is `"BEN_AUTHORED_VARIATION" | "AI_ADAPTATION"`), and `origin` added to Ritual and Carry per §6.1:

`WysSourceAsset` · `WysPrinciple` · `WysScenario` · `WysJudgment` · `WysBoundary` · `WysCanonicalVariant` · `WysFictionalArtifact` · `WysRitual` · `WysCarry` · `WysWeek`

Notes that matter downstream:
- `WysPrinciple` splits `exactBenStatement?` from `approvedFormulation?` — that split is load-bearing for provenance UI.
- `WysBoundary` requires **both** `overDisclosureRisk` and `overWithholdingRisk`. Over-withholding is a first-class failure mode (§6.10).
- `WysJudgment` may legitimately be `origin: "INSUFFICIENT_SIGNAL"` — "insufficient source signal" is an authored result, not an error state.
- `WysFictionalArtifact` requires non-optional `accessibilityText` and `generationProvenance`.
- `WysWeek.timeBudgetPaths` / `cadencePaths` are the data-driven routing behind Plan and the visit derivation.

**Repo idiom (follow exactly):** exported string-literal union ID types → exported object types → `const` arrays closed with `satisfies` (not `as`), as in `content/site-config.ts:1-77`. TypeScript only — no JSON, no MDX (there is no MDX pipeline), no CMS. **Never edit `content/site-config.ts`.**

### 6.8 One definition, many presentations

(packet: one-definition) — **"Canonical text is defined once. Every repeated appearance references that canonical source."** This is Ben's own hard constraint and it is rendered on the site as Standing Order 07.

```ts
interface CanonicalText {
  id: string;
  variants: {
    short?: string;      // Data page card, inline card body
    medium?: string;
    full: string;        // legal page prose — the authoritative form
    inline?: string;     // one-sentence inline disclosure
    machine?: string;    // /author-ship/state.json, llms.txt
  };
  status: ContentStatus;
  origin: ContentOrigin;
  sourceIds: string[];
}
```

Five variants, not three. (packet §8) names seven presentations a single source may render as — short, medium, full, FAQ, inline disclosure, technical page, machine-readable representation. FAQ and technical page reuse `full`; the other two need their own slots. **`inline` and `machine` are load-bearing here, not speculative:** the disclosure strip renders an inline claim on every page, and `/author-ship/state.json` (Phase 9) would otherwise hand-type the same claims the legal pages define — which is the drift §6.8 exists to prevent.

The approved artboards violate it four ways; collapse each and **record the collapsed list for Ben**:

1. The client-meeting scenario is written at two lengths, and the mobile judgment body drops one sentence → **one record, `short`/`full` variants selected by breakpoint.**
2. Three stop titles differ between `4a` and `5b` → keep the `5b` long forms, which match (WYS §11): "Minimum Necessary Is Not Minimum Possible", "Delegation and Verification", "Memory, State, and Correction". Add an optional `shortTitle` for the 15 px `repeat(9,1fr)` desktop cells, rendered from the same record.
3. The scaffold footnote is "Period titles…" on desktop and "Stop titles…" on mobile → **"Stop titles are a working scaffold; Ben is choosing the recordings."** ("stop" is what the rest of the approved copy uses; "Period" is residue from the spec's internal vocabulary.)
4. The Data page is named four ways across four surfaces → pin one page title and one link label (Q6).
5. **The Ship's Log is labelled two ways in one artboard set:** the `4a` desktop nav says "Ship's Log" (dc.html:322); the "How the site is run" governance chip row says "Log" (dc.html:420). One node, two labels → pin **"Ship's Log"** everywhere and record the chip-row change as a copy amendment (the chip row is Final copy under handoff README:18).
6. **"YY Method" names two different URLs** — `app/layout.tsx:49` links `https://yymethod.com` labelled "YY Method™"; `destinations[0]` links `https://yymethod.com/doctrine` with the same eyebrow. Constraint 2 forbids dropping either href, so they cannot be collapsed into one node. The honest fix is **two distinct labels for two distinct nodes**: "YY Method™" (the property) in the header, "YY Method doctrine" (the document) in the footer. Record both in the collapsed-strings list for Ben.

Named canonical components (packet: one-definition): minimal-trust · zero-ai · localStorage · analytics · ai-assisted-ben-approved · provenance · captain-stamp · privacy-disclosure · ai-role-boundaries.

`tests/canonical-text.test.ts` implements **all eight** required build checks (packet: governance validation): unresolved component references · duplicate canonical definitions · missing source metadata · invalid current/historical states · more than one current canonical node · missing approval · **stale governance hash** · broken internal provenance links.

**The eighth check is not optional and was the one at risk of being dropped.** "Stale governance hash" is the check that fires the moment Ben publishes the v2.3 SHA-256 on yymethod.com and the site's recorded hash falls behind. Concretely: assert `approvalState.keel.sha256` is either `null` **and no hash string renders anywhere on the site**, or equal to a single recorded expected value; and fail if any content object cites a keel version other than `approvalState.keel.name`.

**Order tags must resolve.** The `5d` Ship's Log renders `Order 03`, `Order 04`, `Order 05`, `Order 08` as tags on log entries — those are **references to Standing Orders records**, not free labels. Type them as `StandingOrderId` and extend this test to assert every referenced order exists in `content/ship/standing-orders.ts`. This is the concrete first use of the "unresolved component references" check the plan already commits to; without it the plan describes them as an "optional order-tag row" that nothing requires to be real. **Duplicate detection is defined concretely:** normalise whitespace, case and punctuation; hash every string literal ≥ 12 words found in `content/**`; fail on any hash appearing in two different content records. Under 12 words is ignored (ordinary UI language is exempt; semantic policy text is not). Add a `no-raw-curriculum-prose` check in the same file: fail if **any `.tsx` under `app/` or `components/`** contains a string literal ≥ 12 words that is not imported from `content/` — otherwise a developer can bypass the entire provenance spine by typing prose straight into JSX with no compile error and no test failure. **Scope it to all of `components/`, not `components/wys/`.** Narrowing it to `app/` + `components/wys/` exempts `components/ui/*`, `components/ship/*`, `components/provenance/*` and `components/DisclosureStrip.tsx` — which is where the ship-surface strings, the provenance strings and the disclosure copy actually live, and Phase 5 as originally written instructed the builder to hardcode three full sentences of Final copy straight into `DisclosureStrip.tsx`, outside both old scopes. Carry a short, explicitly reviewed exemption list in the test file (the preserved legal pages' existing prose, which is not curriculum content and is pinned verbatim by constraint 2) and nothing else.

### 6.9 The stop count is derived, never typed

(WYS §11) — "The engine must support approximately 8–12 source periods **without hardcoding a fixed number**", and the A–H titles are "an implementation scaffold", not Ben doctrine. So "Nine short stops", "Nine stops, one Ben recording each", and Progress's "of 9" are all rendered from `weeks.length`. Never ship `9` as a literal.

**Two rendering modes, declared — not left to the implementer.** The approved copy spells the count out in prose ("Nine short stops. Then it's over." dc.html:381; "Nine stops, one Ben recording each." dc.html:104) and uses the numeral in the stat tile ("1 of 9", dc.html:124). Naive interpolation of `weeks.length` would silently change approved Final copy to "9 short stops." So: a `countWord(n)` number-word renderer (or a `countWord` field on the derived count object) supplies the **prose** surfaces, sentence-capitalised; the raw integer supplies the **stat tile and any `n of m`** surface. Both derive from the same `weeks.length`; neither is typed. Note it in Q10 as a copy consequence — if the count ever stops being nine, the prose changes word, not just digit, and that is a Final-copy change requiring Ben. (Q10 resolves whether Lesson Zero counts as a stop and whether "one Ben recording each" survives, given Lesson Zero has no recording and Stop F is off-site.)

### 6.10 Curriculum doctrine the content model must carry

These are not optional flourishes. Each has an acceptance consequence.

- **§3.4 — the judgment framework.** `TASK → NECESSITY → EXPOSURE → WHY → WHY-NOT → JUDGMENT` is the spec's central pedagogical construct and its rendered form must exist as a canonical content component surfaced in the curriculum. "Do not teach 'remove everything specific.' Teach: **Preserve what the task needs. Remove what the task does not need.** This is a judgment framework, not a blacklist." Note the convergence: the preserved `IntentRouter` already implements Capture / Why / Why-Not / Commit — the same six-beat shape — so the doctrine and the preserved machinery agree.
- **§25 — over-withholding must be taught.** Author at least one scenario in each named class: exact jurisdiction matters · rough age range matters · a technical error code matters · the medium matters · sequence matters · a deadline matters · a relationship category matters · the learner removed so much context the task became ambiguous. Feedback copy, verbatim: *"Caution is allowed. The question is whether the missing detail changes the task."* **Do not shame the learner for over-withholding.** §37 makes this an acceptance box; §39 asks "did I teach maximal deletion?".
- **§26 — external authority.** WYS does not supersede employer policy, client confidentiality, school policy, law, professional duties, platform terms, or medical/legal/financial authority. Where a scenario implicates an outside rule, render: *"**External authority outranks WYS's abstraction exercise.**"* The learner must learn that **anonymization is not a loophole**. Populate `WysJudgment.externalAuthorityNotes`, `WysBoundary.externalAuthorityCaveat` and `WysCarry.authorityBoundary`; without content these fields are dead.
- **§14 — the invariant rule.** Every scenario family has an invariant. Surface details may vary; **the judgment construct must not drift.** "Do not equate visual similarity with conceptual equivalence." Enforce in `tests/wys-content.test.ts`: every `WysCanonicalVariant.invariant` must equal its parent `WysScenario.invariant`, and `judgmentMapping` must cover every parent choice key.
- **§24 — disclosure containers.** (WYS §8.7) **already defines a `type` field** on `WysFictionalArtifact` covering nine of §24's twelve containers (`screenshot | pdf | email | photo | audio | spreadsheet | message-thread | document | other`). Adding a parallel `containerType` would create two fields for one concept — precisely what Standing Order 07 and the packet's one-definition rule forbid, and what §6.8 exists to prevent. **Widen the existing `type` union** to all twelve (add `text-prompt`, `voice-recording`, `pasted-logs`, `mixed-file-bundle`; keep `other` last), and record the widening in the §38 report under "where the implementation narrowed or reordered the spec" as a deliberate deviation from §8.7's literal listing. Carry the reusable pattern: *"Inspect → narrow/extract/trim/crop → anonymize → upload only if allowed."* **Do not make the user practice on their own real sensitive file in v0** — fictional artifacts only.
- **§9.3 — Lesson Zero completion condition.** Someone who leaves immediately after onboarding must still have learned: *"**Define the task first. Then remove what the task doesn't need.**"* This is an acceptance condition on the flow, not a nice-to-have.
- **§9.1 step 3 — human source first.** Present the source before any interpretation; never put "what Ben learned" above Ben's own story.
- **§22 — future Coach, schema only.** Preserve `WysCoachAction` as a **type-only** artifact in `lib/wys/coach-schema.ts` with no runtime calls, plus **all sixteen** of §22's governing rules, verbatim, as comments. Do not ship a subset — the six most easily dropped are the **data-flow** constraints, which are the whole reason for writing the file now:

```
// Coach is explicitly disclosed as AI
// anything intentionally sent to Coach is sent to AI
// no need to chat to complete WYS
// unlock is access only
// activation requires explicit learner choice
// model never infers readiness
// pressure happens only after initial commitment
// scenario provenance and judgment provenance are separate
// canonical Ben variant before AI generation
// synthesis retains source basis
// insufficient signal is valid
// minimal live context
// full transcript not automatically forwarded
// no companion behavior
// no automatic next question
// learner correction outranks inference
```

Several are provenance rules and several constrain what may ever be sent to a future Coach; encoding them now is free and stops the coach architecture drifting later with nothing written down.

**And the §2.2 posture applies to this file.** (WYS §2.2) — "These future concepts may be represented in code schemas or feature flags, but they must be **disabled and invisible** in v0." So: type-only, no runtime call, no import from any component, no config flag that could turn it on, and nothing on any screen that hints a Coach exists. Note the contrast with Q20's two flags, which default **on** to match the artboards: those gate *shipped, approved* features (persisting local judgments, the rulebook) and are visible by design. A §2.2 flag gates a *future* feature and must be off and invisible. Two different postures, spelled out so a later reader does not generalise one into the other.

```ts
type WysCoachAction =
  | "EXPLAIN_CANONICAL"
  | "SYNTHESIZE_JUDGMENT"
  | "GENERATE_REPLAY_VARIANT"
  | "PUSH_BACK"
  | "ARGUE_OTHER_SIDE"
  | "CHANGE_ONE_FACT"
  | "COACH_PROVE_IT"
  | "NO_CLEAN_ANSWER";
```

### 6.11 Draft preview tooling

(WYS §7) — "Use development preview tooling for drafts", and (WYS §33 step 29) — "Keep draft content behind development preview." Build a draft preview listing every content object with its status, origin and computed render policy. **Specify the mechanism — "guarded by `process.env.NODE_ENV !== 'production'`" is not one.** A component that returns `null` still yields a prerendered, publicly reachable URL at `benchantech.com/dev/preview`, still pulls every draft content module into the production build graph, and still inflates the Phase 0 prerendered-route regression floor with a route that should never deploy. That contradicts (WYS §7)'s "Use development preview tooling for drafts" as this plan itself quotes it.

**Build-now default — keep it out of `app/` entirely:** `scripts/preview-content.mjs` prints the table to stdout, and `tests/content-status.test.ts` prints the same table on demand. Zero routes added, zero draft modules in the production graph, and the dev-time need is met. **If a rendered page is genuinely wanted** (it is useful for checking `ProvenanceLabel` output visually), then `app/dev/preview/page.tsx` and `app/dev/primitives/page.tsx` must `import { notFound } from "next/navigation"` and **call `notFound()` at the top of the component when `process.env.NODE_ENV === "production"`**, so `next build` prerenders a 404 and the URL is dead in production — and both routes are recorded in `docs/facelift-baseline.md` so the Static/Dynamic regression check accounts for them. Excluding them via `next.config.ts` `pageExtensions` is cleaner still where it fits the build. Without it, drafts are invisible in development under the published-only default, and the pressure that creates is exactly what makes someone loosen the guard.

### 6.12 The raw voice corpus

If it enters the repo at all, it enters as **exactly one** `WysSourceAsset`: `medium: "transcript"`, `status: "draft"`, `origin: "BEN_AUTHORED"`, `hash: "6011511431dadb977d4e29902614c88c3c0faeef904a80e29921835afa08e532"`, `approvedExcerpts: []`, `allowedSurfaces: []`, `coachParaphrasePolicy` forbidding paraphrase.

**Do not embed, chunk, index or quote it** for any coach, search, retrieval or `llms.txt` surface. Its own front matter says *"It is evidence, not yet doctrine."* It contains private health detail, named family members, employer-confidential material, unverified third-party incident retellings, and uncorrected transcription errors that corrupt Ben's own vocabulary. Ben states on the record that these recordings were not made to be shared, and instructs that anything he claims in them must be independently verified before use. Provenance retrieval is a per-approved-excerpt mechanism, never a corpus-wide index (packet: not-a-rag-dump).

---

## 7. Local state

### 7.1 The shape (verbatim, WYS §17)

Storage key exactly `wys:v1`. This string is user-visible copy on the Data page (`key: wys:v1 · raw JSON ↓`) and must match the implementation exactly.

```ts
interface WysLocalStateV1 {
  schemaVersion: 1;
  startedAt?: string;
  lastOpenedAt?: string;

  onboarding: {
    completed: boolean;
    postureChoice?: string;
    cadence?: "2" | "3" | "5" | "most";
    timeBudget?: "5" | "10" | "15" | "20plus";
  };

  progress: {
    completedLessonIds: string[];
    completedScenarioIds: string[];
    completedCarryIds: string[];
    replayCounts: Record<string, number>;
    transferCheckIds: string[];
  };

  localJudgments?: Record<
    string,
    {
      choiceKey: string;
      revisedChoiceKey?: string;
      updatedAt: string;
    }
  >;

  rulebook: Array<{
    id: string;
    text: string;
    createdAt: string;
    updatedAt: string;
  }>;

  ui: {
    lastRoute?: string;
    dismissedNotices?: string[];
  };

  appetite?: {
    deeperPracticeInterest?: boolean;
    recordedAt?: string;
  };
}
```

### 7.2 Minimization is enforced in the serializer, not at call sites

(WYS §17 Local data minimization) — do not save: free-text From Memory scratch · personal situations · raw pasted prompts · names · employer · emails · screenshots · uploaded files · microphone data.

A TypeScript interface is compile-time only. So `lib/wys/local-state.ts` implements a **write-side key allowlist that drops anything not in the schema**, so a future careless caller physically cannot accrete a learner dossier. Precise formulation of the rule (this is where a naive version contradicts itself):

- The guard is **shape-based**, not "reject any string that looks like free text". `rulebook[].text` **is** learner-authored free text and **must** be stored — it is a declared, learner-owned local field (WYS §16). What guarantees it is never transmitted is the telemetry property allowlist (§8.5), not the storage guard.
- **A key-shape allowlist alone is not enough**, and this is where the naive version fails silently. Two declared fields are typed as bare `string` in the verbatim schema — `onboarding.postureChoice` and `ui.lastRoute` — so a caller can accrete arbitrary free text *under a declared key* and pass the allowlist unvalidated. That is exactly the accretion (WYS §17) and (WYS §9.2) forbid ("personal situations · names · employer · free-text biography · company · job title"). So the serializer also carries **value-domain validation on every free-shaped declared field**:
  - `onboarding.postureChoice` must be one of the declared posture option IDs from `content/watch-your-step/config.ts`;
  - `onboarding.cadence` / `timeBudget` are already closed unions — enforce them at runtime too, not just at compile time;
  - `ui.lastRoute` must match a known WYS route (the same list `tests/no-private-state-in-urls.test.ts` uses);
  - `ui.dismissedNotices[]` must be known notice IDs;
  - `progress.replayCounts` **keys** must be known scenario IDs (values are numbers);
  - `localJudgments` keys must be known scenario IDs and `choiceKey` / `revisedChoiceKey` must be declared choice keys.
  `rulebook[].text` is the one deliberate exception — see above.
- The test therefore asserts: an **undeclared** key passed to the writer is dropped; **an out-of-domain value under a declared key is dropped** (e.g. `postureChoice: "I work at Acme and my daughter is sick"`); a scratch-text field is never persisted under any key; `rulebook[].text` round-trips intact.

### 7.3 Hydration-safe access

Every read and write in `try/catch`, returning a valid empty state on failure. iOS Safari private browsing and "block all cookies" **throw** on `localStorage` access; the primary QA target is iPhone Safari at ~390 CSS px with an audience explicitly likely to have storage restricted. An uncaught throw would break Today/Plan/Progress/Practice/Data outright.

`components/wys/useWysState.ts` mirrors the pattern this repo already proves in `components/ConsentBanner.tsx:25-36`: initialise to a `{ loaded: false }` sentinel, read `window.localStorage` only inside `useEffect`, render a stable placeholder until hydrated. Server HTML and first client HTML are byte-identical, so no `suppressHydrationWarning` is needed and every route stays prerendered.

**No component may read `wys:v1` during render.** Server-render the static curriculum shell (stop titles, phase copy, plan rows, WATCH/TRY/JUDGE/CARRY text) from typed content modules so crawlers never depend on client JS for content (packet: machine-readability — "must never depend on client-side AJAX alone"), and wrap only state-dependent slots (progress numerals, Plan's current-row highlight, Data card 1, judgment kept/revised rows) in client components.

Harden `components/ConsentBanner.tsx`'s two unguarded `localStorage` calls with the same `try/catch` — behaviour-preserving.

### 7.4 Restart vs Clear (WYS §17)

Two distinct operations, each explaining exactly what happens **before** executing:

- **`restartCourse()`** — clears curriculum progress; retains data preferences unless explicitly chosen otherwise; retains the rulebook by default.
- **`clearAllWysData()`** — removes **all `wys:*` keys**; returns a clean onboarding state; **must not claim it erased hosting or GA4 logs**.

Neither touches `bct_analytics_consent` — silently wiping it would reset a legally-referenced decision and re-prompt the visitor. What survives is named on the Data page (§8b, §9 Phase 9).

### 7.5 Browser-key registry

The Data page must be **generated by enumerating the keys the code actually writes**, not by a hand-maintained list of two. Export `BROWSER_KEYS` from a single module (`wys:v1`, `bct_analytics_consent`, and anything added later) and render the **key list** from it. Otherwise a third key added in month three silently makes "What this site knows about you" false again.

**But `BROWSER_KEYS` enumerates storage keys, not the fields inside `wys:v1` — so it does not reach the rows.** (WYS §20) requires the "On this device" panel to show six things: onboarding choices · progress · **local judgments** · rulebook · deeper-practice interest · **last route**. Artboard `5c` card 1 shows only five rows (Onboarding · Pace · time · Stops · scenarios · carries · Rulebook · Deeper-practice interest) and omits both `localJudgments` and `ui.lastRoute` — yet §7.1 persists both, and the artboard's own sub-line promises "Generated from what's actually stored right now."

**Rule: card 1's rows derive from the `WysLocalStateV1` field set, not from the key list.** Every declared top-level field in the schema maps to exactly one row, so a field added later surfaces automatically rather than making the honesty guarantee quietly false. `tests/wys-local-state.test.ts` asserts the mapping is total: **every declared top-level field has a Data page row, and every row maps to a declared field.** The two added rows (local judgments; last route — and `ui.dismissedNotices` if it ever holds anything) are a **Final-copy amendment to Ben**, escalated alongside the clearing footnote in §8b.4, since the Data page wording is Final copy under handoff README:18.

---

## 8. Telemetry

### 8.1 The current implementation is preserved unchanged

`components/GoogleAnalytics.tsx` is **PRESERVED AS-IS, zero edits.** It renders no markup, so there is nothing to restyle, and every edit risks the Consent Mode v2 contract that `/privacy` and `/cookies` publicly describe. It stays exactly as it is:

```js
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);
gtag('config', '<id>', {
  anonymize_ip: true,
  send_page_view: true,
  allow_google_signals: false,
  allow_ad_personalization_signals: false
});
```

Also unchanged: `NEXT_PUBLIC_GA_MEASUREMENT_ID` as the sole gate, the current GA4 stream and property, `storageKey = "bct_analytics_consent"` as the single source of consent truth, the three-state consent machine, the hardcoded `ad_*` denials in both the default and the update, and the button labels "Decline" / "Allow analytics". `docs/legal-analytics.md` is **updated** to describe the added WYS event source (it is documentation, not configuration).

**No second consent store. No second gtag bootstrap. Do not install `@next/third-parties`** — it ships a competing bootstrap that would clobber the Consent Mode v2 defaults.

### 8.2 The event allowlist (verbatim, WYS §19.4)

Coarse GA4 events — the closed list:

```text
wys_view
wys_start
wys_onboarding_complete
wys_source_period_start
wys_source_period_complete
wys_course_complete
wys_replay
wys_carry_reached
wys_transfer_check_complete
wys_data_manifest_view
wys_local_state_clear
wys_restart_course
wys_depth_interest
```

First-party aggregate-only events (not GA4):

```text
wys_scenario_choice
wys_scenario_skip
```

Potential future aggregate events:

```text
wys_scenario_revision
wys_overwithholding_case
```

**Do not send the user's textual reason.**

Allowed GA4 properties, the closed list (WYS §19.1A): `lesson_index`, `source_period_id`, `content_version`, `route_type`. **"Do not include semantic learner answers."**

**snake_case is the wire format.** §19.1A names the properties in snake_case and the allowlist is checked against those exact keys; §19.5's example call is written camelCase. The two are reproduced side by side in the spec without reconciliation, and a property-allowlist test written against §19.1A would reject a call written against §19.5. **Decision: `trackWys` accepts and emits snake_case keys only — no mapping layer.** A camelCase→snake_case shim is a second place a property name can be spelled, which is one more than the allowlist can police. The §8.3 reference call below is written in snake_case accordingly; the test is written before the callers, so this has to be settled here.

### 8.3 The adapter (WYS §19.5)

One central adapter, `lib/wys/telemetry.ts`, so measurement can be audited or replaced:

```ts
trackWys("wys_source_period_complete", { source_period_id, content_version });
```

It must:
- reject unknown event names in development
- reject unknown property keys
- never spread arbitrary objects into analytics
- never serialize localStorage state wholesale
- never accept free-text properties
- be easy to disable globally

**Fail closed in production.** §19.5's "reject… in development" describes where the *loud* failure goes. In production the adapter still **drops** the unlisted event or property; it is simply silent about it. Read literally the other way, an unlisted property would pass through in production, which defeats the allowlist.

**Consent gate.** No-op unless `localStorage["bct_analytics_consent"] === "granted"`, and no-op when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset. **Unreadable, absent, or thrown all mean do not send** — the gate fails closed on a `localStorage` exception. This honours (WYS §19.3) "If the site already has a consent/preferences system, honor it." It is stricter than the site behaves today for its own page views, and it makes the on-screen "Sent: coarse counts" copy conditionally true. See SC-2.

**Emit shape.** Push to `window.dataLayer` rather than calling `window.gtag?.()`. Both GA scripts load `strategy="afterInteractive"`, so an event fired from a first-paint effect can run before `ga4-init` defines `window.gtag`, and `window.gtag?.(...)` would silently drop the first event of every session. `ga4-init` itself does `window.dataLayer = window.dataLayer || []`, so earlier pushes survive.

Use an **arguments-shaped** local shim so the queued entry is byte-identical to what `gtag()` would have pushed — gtag.js consumes `arguments` objects, and pushing a plain array is not equivalent. Write it against the widened ambient type from §8.4 (`dataLayer?: IArguments[]`), **with no `as any` and no unused parameter** — §8.4's own rule is "do not weaken it to `any`", and a rest parameter that is declared but never read (the body uses `arguments`) fails `no-unused-vars` if Q14 ever adds a lint config:

```ts
// no parameter list at all: `arguments` is the payload
function pushGtag() {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(arguments);
}
```

**Verify the arguments-vs-array claim against a real GA4 debug stream before committing to this shape.** The plan asserts non-equivalence; that assertion is worth one DebugView check, and if a plain tuple works identically, prefer `push(args)` with a typed rest parameter, which is simpler and fully typed.

**Flush after `ga4-init` — unconditionally, not only under the loose Q7 branch.** The dataLayer push exists to stop the first event of a session being dropped, but it does not by itself achieve that: `components/GoogleAnalytics.tsx:11-30` loads `ga4-init` at `strategy="afterInteractive"` and only *then* issues `gtag('js')`, `gtag('consent','default',…)` and `gtag('config', measurementId, …)`. gtag.js processes queued `event` commands **with no configured destination** if they precede the `config` command, so a **returning visitor with `bct_analytics_consent === "granted"`** — who passes the consent gate immediately — has `wys_view` / `wys_start` pushed ahead of that config and loses exactly the event the push was meant to save. The consent gate does not cover this case; it only covers undecided visitors.

**Rule:** `trackWys` buffers into a module-local array and drains it **only after `ga4-init` has run** — either an `onReady` callback on the `ga4-init` `<Script>` (which requires no edit to `GoogleAnalytics.tsx`'s inline body) or a sentinel value that `ga4-init` pushes and `trackWys` polls for. Cover it with a unit test asserting **nothing is pushed before the config marker exists**, and that everything buffered is drained in order once it does.

**Consent-ordering note.** gtag.js processes the queue in order, so anything pushed before `ga4-init` is processed *before* the `consent default: denied` command. With the flush rule above, nothing is pushed before `ga4-init` at all, so the ordering hazard is closed by construction rather than by the consent gate alone.

### 8.4 Global type widening (a build-breaker if skipped)

`components/ConsentBanner.tsx:9-13` declares `Window.gtag` as **consent-only**, and that augmentation is repo-wide under `strict: true`. The first `gtag("event", …)` fails `next build` type checking. Move it to `types/gtag.d.ts` with an overloaded signature covering both `("consent","update",params)` and `("event", name, props)`, plus `dataLayer?: IArguments[]` (widened to `IArguments[] | unknown[]` if the debug-stream check in §8.3 shows a plain tuple is equivalent), and remove the `declare global` block from `ConsentBanner`. **Do not weaken it to `any`** — the property allowlist depends on the types.

### 8.5 What is never collected

(WYS §19.3 GA4 guardrails) — with GA4 present, do not add: `user_id` · custom persistent visitor IDs · advertising personalization · remarketing · Google Signals solely for WYS · cross-domain identity linking solely for WYS · raw learner choices · personal text · rulebook content · detailed private state.

**Do not encode private state in URL parameters, page titles, event labels, or custom dimensions.** This is load-bearing here because the preserved GA4 config sets `send_page_view: true`, so `page_location` (including query strings) and `page_title` reach GA4 automatically on every route — outside `trackWys` and outside its allowlist. Therefore:

> **Rule:** no posture choice, cadence, time budget, scenario answer, judgment, rulebook value or any other learner input may ever appear in a path segment, a query parameter, or a page title. Lesson Zero step state is a step **index** only.

`tests/no-private-state-in-urls.test.ts` states this as two **statically decidable** assertions rather than the undecidable "derived from a learner value": (1) **no directory under `app/watch-your-step/` is a dynamic segment other than the allowlisted `[stopId]`**; (2) **no `metadata` object or `generateMetadata` function in that tree references anything imported from `lib/wys/local-state`** (or from `components/wys/useWysState`). Both are regex + `fs` over source, with no rendering required.

Also never collected: from-memory scratch text, personal situations, raw prompts, names, employer, emails, screenshots, uploads, microphone data, a server-side copy of the rulebook, a transcript of the learner's course.

### 8.6 The first-party aggregate endpoint — NOT built in v0

(WYS §19.2) — "Do not add a new analytics/database vendor solely for WYS analytics… If there is no existing persistence layer, ship with GA4/coarse engagement only and leave the aggregate adapter **disabled and documented**." (WYS §30) — "**Only build if the repo already has a suitable database/persistence layer.**"

`lib/db/client.ts` is a two-line stub whose only function throws and which nothing imports; there is no `pg` / `@vercel/postgres` / `@neondatabase/serverless` / `@vercel/kv` in `node_modules`. The precondition is unmet.

**Ship:** `lib/wys/aggregate.ts` exporting the `AggregateEvent` union and a `sendAggregate()` that returns immediately behind a `WYS_AGGREGATE_ENABLED` flag defaulting off. **Do not create `app/api/wys/aggregate/route.ts`** — it would also introduce the first `ƒ (Dynamic)` route into a fully prerendered build.

**Define the flag's scope, or its own test passes for the wrong reason.** `lib/wys/aggregate.ts` runs in the **browser**, and a bare `process.env.WYS_AGGREGATE_ENABLED` is `undefined` at runtime in a client bundle unless the name is `NEXT_PUBLIC_`-prefixed. So a naive reading would ship a stub that is permanently off *by accident*, and the "aggregate-disabled makes no network call" test would pass without proving anything about the flag. **Decision: `WYS_AGGREGATE_ENABLED` is a build-time constant exported from `content/watch-your-step/config.ts`, not an env var.** It is a content/config decision (Q12), it belongs with the other §35-class flags, and it is inspectable by the same tests. If Ben later prefers an env var it becomes `NEXT_PUBLIC_WYS_AGGREGATE_ENABLED` — never the unprefixed name. **Phase 0 also adds `.env.example`** documenting `NEXT_PUBLIC_GA_MEASUREMENT_ID` (the repo has only `.env.local`, which is gitignored, so nothing today tells a new clone which variables exist) and noting that the aggregate flag is deliberately *not* an env var. **The disabled test must assert the flag is the reason:** set the constant true in the test and assert `sendAggregate` still makes no call because no endpoint exists; set it false and assert the early return.

```ts
type AggregateEvent =
  | { event: "scenario_choice"; scenarioId: string; choiceKey: string; contentVersion: string }
  | { event: "scenario_skip";   scenarioId: string; contentVersion: string };
```

**Consequences:** `wys_scenario_choice` and `wys_scenario_skip` send **nothing at all** (handoff README — "otherwise send nothing about the choice"), and the 18/61/21 bars keep their caption.

**And one approved Data page sentence becomes false — this is a third HIT, SC-12.** Artboard `5c` card 2 (dc.html:195) ships, unqualified and in the present tense:

> "Some fictional exercises send only scenario ID + option to a first-party counter — stored as totals, never as your history."

With `sendAggregate()` disabled and no endpoint built, **nothing that could make that sentence true exists.** The plan is emphatic that the hero's 18/61/21 bars keep their "Example numbers" caption for exactly this reason; the same discipline has to reach the stronger claim on the Data page, which is a privacy claim rather than a marketing one. (WYS §20) itself conditions the identical text — its "Aggregate exercise data" block is prefixed **"If enabled:"** — and (WYS §37) requires "Data Manifest accurately describes what is actually deployed" and "no privacy claim exceeds implemented fact". (WYS §34) forbids solving it in copy.

**Build-now default:** render card 2's third sentence **only when `WYS_AGGREGATE_ENABLED` is true**, bound to the same constant as `lib/wys/aggregate.ts`, exactly as §20's "If enabled:" prescribes — so the copy cannot outrun the code. `tests/wys-telemetry.test.ts` asserts **the aggregate sentence cannot render while `sendAggregate()` is disabled** (the string and the flag are read from the same module, and the test flips the flag both ways). Escalated as **Q22** and recorded in Appendix A as a string whose truth is state-bound.

**If Ben later enables it (Q12)** the shape is fixed: `POST /api/wys/aggregate` with `runtime = "nodejs"`; validate exact fields and reject extra keys, over-long strings, unknown scenario IDs, unknown choice keys, arbitrary JSON and user IDs; a single atomic `INSERT … ON CONFLICT … DO UPDATE SET count = count + 1` on `unique(event_type, scenario_id, choice_key, content_version)`; **store counts, not event rows** — "Do not create a raw-event table 'for later analysis.'" No timestamp history per person, no IP column, no user agent column, no referer column, no session cookie, no fingerprint; do not intentionally log request bodies; rate-limit only if abuse requires it and **never** use rate limiting as an excuse to create a persistent learner identifier. The call is strictly fire-and-forget (never awaited, `.catch(() => {})`) so a blocked POST cannot delay the commit-then-reveal interaction. Vercel's own platform logs still record IP and user agent regardless — which is exactly what the Data page's infrastructure paragraph already discloses.

### 8.7 Metrics are diagnostic, not targets

(WYS §31) — record, per allowlisted event, its **decision use**, using the §19 justification chain `TASK → NECESSITY → EXPOSURE → WHY → WHY-NOT → JUDGMENT`. Keep that table in `lib/wys/telemetry.ts` beside the allowlist and reproduce it in the §38 report. **Give every row an upstream source:** (WYS §2.1)'s experiment questions are the stated justification for the allowlist existing at all, so each row names the question it answers — otherwise the table records *what* is sent with no account of *why this event exists*.

**The same table carries the firing point for all thirteen names.** §19.4 lists event *names*; §19.1A lists *categories* ("route/page view", "WYS start", …); neither names a trigger, and "wire only allowlisted events at the points §19.4 names" therefore names nothing. Without this map, `wys_view`, `wys_start` and `wys_carry_reached` have no firing point anywhere in the plan and would simply never be wired.

| Event | Fires when |
|---|---|
| `wys_view` | **Deliberately unused in v0.** The preserved GA4 config sets `send_page_view: true`, so every WYS route already produces a `page_view` with `route_type`; a second event on the same trigger double-counts the same fact and adds no decision. It stays on the allowlist (the list is closed and verbatim) and is asserted **unfired** by test. If Ben wants WYS route views separated from site route views, that is a `route_type` dimension question, not a second event. |
| `wys_start` | The learner opens `/watch-your-step/start` step 1, once per session. |
| `wys_onboarding_complete` | Lesson Zero step 10 completes and `onboarding.completed` flips true. |
| `wys_source_period_start` | First render of a stop's first visit (`stop/[stopId]` or Today), once per `source_period_id`. |
| `wys_source_period_complete` | The stop's cadence path is fully marked complete. |
| `wys_course_complete` | Stop H terminal surface reaches its completed state. |
| `wys_replay` | Practice starts a replay in either deterministic mode. |
| `wys_carry_reached` | The CARRY card renders in its actionable state (reached, **not** marked). |
| `wys_transfer_check_complete` | A transfer check is marked complete — **no UI ships in v0, so this is wired and unfired**; asserted unfired by test alongside `wys_view`. |
| `wys_data_manifest_view` | `/watch-your-step/data` first render per session. |
| `wys_local_state_clear` | `clearAllWysData()` completes. |
| `wys_restart_course` | `restartCourse()` completes. |
| `wys_depth_interest` | The appetite pill is committed. |

(§38 item 5 requires "exact analytics events now sent"; this map is its input, and the two deliberately-unfired rows are part of that answer.) Do not turn metrics into optimization targets. **Do not claim learning efficacy merely because people stay longer, click more, use more features, agree with Ben, like the site, or complete assisted questions.**

### 8.8 The genuine conflict, flagged

The only place the WYS telemetry doctrine and the preserved GA4 setup genuinely collide is **whether WYS events fire for a visitor who declined analytics.** Under Consent Mode v2 with `analytics_storage: 'denied'`, gtag still transmits cookieless pings — so a naive adapter would send `wys_*` events for a declining visitor, while Lesson Zero step 9 and Data card 2 state flatly that coarse counts are sent. Both can be made true; only one can be true at once. The build-now default is full suppression (§8.3). This is Ben question **Q7** and stop condition **SC-2** — it is not resolved in copy.

---

## 8b. Legal / disclosure refresh

### 8b.1 The rule

**Legal copy, the Data page and the shipped code must agree exactly.** No page may make a claim the code does not implement. Where they disagree, change the architecture or narrow the feature — never the copy alone (WYS §34). The Data page **supplements and does not supersede** the legal pages; all six keep their existing URLs and metadata titles.

**Write legal copy last**, after the code is frozen (Phase 11). Writing it earlier is how a page ends up claiming more privacy than the implementation delivers.

**Define each claim once** in `content/claims.ts` as a `CanonicalText` with `short`, `full`, `inline` and `machine` variants: the Data page renders `short`, the legal pages render `full`, the disclosure strip renders `inline`, `/author-ship/state.json` renders `machine`. They then cannot drift.

**Phase placement — this cannot sit in Phase 11.** "Build it before either page's copy is written" and "write legal copy last" are both true, and they resolve by splitting the module from the prose: **`content/claims.ts` — the type plus the shared claim records — is created in Phase 1**, alongside `lib/canonical-text.ts`. Phase 5 then renders `inline` for the disclosure strip, Phase 8 renders `short` on the Data page, Phase 9 renders `machine` into `state.json`, and **Phase 11 keeps only the legal-page prose pass**, writing `full` onto the same records against frozen code. Leaving the module in Phase 11 guarantees the Data page's infrastructure paragraph, clearing footnote and card 2/3 bodies are hand-typed three phases early and then re-derived — which is precisely the drift §6.8 exists to prevent.

### 8b.2 What each page must say

| Page | Must be added / corrected |
|---|---|
| `/privacy` | **Correct** "Current services", which currently says the site "does not currently provide user accounts, subscriptions, uploads, or personalized user memory". **Add:** local-first `wys:v1` browser storage and exactly what it holds (onboarding choices, pace/time, curriculum position, completed fictional exercises, local judgments, the learner rulebook, deeper-practice interest); the closed WYS event allowlist; the first-party aggregate endpoint's **disabled** status; both browser keys by name; a cross-link to the Data page as a supplement. **Reconcile** "not directed to children under 13" with WYS's 13+ design test **without collecting age** — (WYS §4) "Do not collect exact age or date of birth just to enforce the design test." Keep the existing, accurate consent claims verbatim. |
| `/cookies` | **Add** `wys:v1` and `bct_analytics_consent` as non-cookie browser storage alongside GA4 cookies. **Keep** the denied-by-default claim (still exactly true). **Add** what "Clear this browser's data" does and does not remove, word-for-word identical to the Data page footnote. |
| `/ai-disclosure` | **Correct** "Current site behavior" ("deterministic local routing and static content"). **Add:** no AI at runtime in the curriculum — the guarantee the disclosure strip now makes on every page; AI's role as disclosed crew during authoring; what Ben has and has not approved; a link to the Crew Manifest. This section's approval language must match the disclosure strip **word for word** (SC-1). |
| `/terms` | **Add:** the course; the learner-owned rulebook as the learner's own content; fictional scenarios as authored practice material, not advice; and that WYS is not legal, compliance or professional-privacy training (WYS §3.5 non-goals). |
| `/copyright` | **Add:** ownership of scenarios, fictional artifacts and curriculum text; the learner's ownership of their rulebook; the status of Ben's recordings once supplied. |
| `/accessibility` | **Update** to describe what actually shipped: focus visibility, reduced-motion handling, touch-target sizing, transcripts alongside Ben audio, text alternatives for fictional artifacts that "preserve the relevant decision problem without leaking the answer" (WYS §27). The published claim must stay true after the token swap. |

### 8b.3 Forbidden claims audit

Never claim, anywhere on the site (WYS §18, §32; packet: forbidden-privacy-claims): **no tracking · no data collection · zero trust · total privacy · 100% private · 100% anonymous · impossible re-identification · AI-proof · hallucination-proof · privacy guaranteed · "AI you can trust" · "the correct way to use AI" · "Ben's definitive system for safe AI" · "become AI literate in X days" · "expert-certified privacy judgment" · "most trustworthy AI site" · "best-in-class governance."**

The single exception: "AI you can trust" appears as a **struck-through anti-feature pill** on the home page, which is its approved use.

Ben rejected "zero trust" himself because GA4 is in use. The correct positioning is exact claims: quiz answers are not sent to AI · route calculation happens locally · no account required · analytics are limited and disclosed · unavoidable infrastructure data is disclosed separately. And the infrastructure paragraph — which exists in **two** authoritative wordings, so cite them separately rather than attributing one to the other:

- `short` variant, rendered on the Data page — **mockup 5c (dc.html:203), not §18**: *"Watch Your Step still runs on a website. Hosting, security and limited analytics may receive ordinary technical information. Not zero trust — the minimum trust required, and named."*
- `full` variant, rendered on `/privacy` and `/cookies` — **(WYS §18) verbatim**: *"Watch Your Step still runs on a website. Hosting, security, and limited analytics services may receive ordinary technical information needed to deliver or understand use of the site. The point is not 'zero trust.' The point is to ask for the minimum trust required and disclose it."*

One `CanonicalText` record, two declared variants, per §8b.1's own mechanism — a builder told to ship "§18 verbatim" on the Data page would otherwise ship the wrong string. **Audit every Appendix A entry carrying a dual citation the same way:** where a mockup shortens a spec string, the mockup text is the `short` variant and the spec text is the `full` variant, and both are recorded.

### 8b.4 Deliverable

`docs/facelift-copy-diff.md` — every final-copy sentence that changed, with the code line that forced the change. The handoff README marks the Data page wording and the disclosure strip as final copy, so **every amendment is an escalation to Ben, not a unilateral edit.**

---

## 9. Phased build order

**Deviation from (WYS §33) is deliberate and reported.** §33's order is substrate → learning core → measurement → content → hardening, with the Data Manifest at step 6. This plan moves telemetry earlier (into the substrate, because the adapter is a *refusal* that must exist before any component can call it) and the Data page later (into Phase 9, because §18/§20 require it to render the real implementation, and the implementation does not exist at step 6). Record this in the §38 report under "where the implementation narrowed or reordered the spec".

**Build-loop constraints.** `npm run build` refuses to run while `npm run dev` holds port 3000 (`scripts/guard-next-build.mjs`) — stop dev, or use `PORT=3999 npm run build`. Do not modify or bypass the guard. `npm run lint` is non-functional (`next lint` is deprecated and no eslint config exists, so it drops into an interactive prompt) — **lint is not an acceptance gate** unless Ben approves adding `eslint.config.mjs` as new scope (Q14).

**Test file placement.** `package.json` runs `node --import tsx --test tests/*.test.ts`. That glob is **not** recursive, and `tests/**/*.test.ts` under `/bin/sh` expands to `tests/*/*.test.ts` — which matches subdirectories **only** and would silently drop `tests/route-resolver.test.ts`. **Keep every new test as a flat file directly in `tests/`.** Do not change the glob.

---

### Phase 0 — Baseline, guardrails, deletion contract

**Goal:** record the numbers every later acceptance claim is measured against, and install the safety net this repo lacks, before a 933-line stylesheet rewrite.

| Task | Files | Source |
|---|---|---|
| Confirm the branch is `bct-facelift-assimilation`; nothing lands on `main` for the duration. | — | user constraint 1 |
| **Measure** the baseline — do not assert it. Run `npm test` (record the assertion count) and `PORT=3999 npm run build` (record the prerendered route list, the Static/Dynamic marks, shared First Load JS and the home page figure). These become the regression floor. | `docs/facelift-baseline.md` | WYS §37 Engineering |
| Write the preserved-surface fixture: every route, every redirect, every outbound href (`yymethod.com/doctrine`, `benchanviolin.com/library`, `yyandme.benchantech.com`, `benchanviolin.substack.com`, `benchanviolin.com/violin-for-parents`, `yymethod.com` (the bare header href — asserted **separately** from `yymethod.com/doctrine`, since a substring check would pass while one was dropped), `mailto:ben@benchantech.com`) asserted present — **plus the in-page anchor targets the home page depends on**: `#main` (skip link), `#router` (`IntentRouter.tsx:42`, the target of both `href="#router"` audience buttons), `#router-heading`, `#destinations-heading` and `#stakeholder-heading`. An anchor that stops resolving breaks a live control just as surely as a dropped href, and nothing else in the suite would notice. | `tests/preserved-surfaces.test.ts` | user constraint 2 |
| Write the class-contract test in **two directions and three modes**, because one direction and one list cover almost nothing once the new surfaces land (details below). | `tests/class-contract.test.ts` | repo facts: no CSS Modules, no working lint, zero rendering coverage |
| **Decide the test-runner CSS question now, not in Phase 1.** `package.json:11` runs `node --import tsx --test tests/*.test.ts`; `tsx` transforms TSX but Node cannot load a `.css` specifier, so importing any component that imports a co-located `.module.css` fails with `ERR_UNKNOWN_FILE_EXTENSION` and the test file dies. Every provenance-rendering guarantee in this plan depends on tests that import such components, and Q15's default forbids adding a browser harness — so this must be settled before Phase 1 writes those tests. **Build-now default:** (a) keep the load-bearing logic **rendering-free** — `renderPolicyFor()` and the `(surfaceKind, origin) → label` mapping live in `lib/content-status.ts` with no JSX and no CSS, and are unit-tested there; (b) make the label **structurally unavoidable at the type level** — `label` is a required, non-optional prop derived from the content object, with no `children` overload, so the component-level guarantee is a compile error rather than a runtime assertion; (c) register a ~10-line CSS stub loader (`node --import tsx --import ./tests/css-stub.mjs`, a `module.register` hook returning `export default {}` for `.css`) **only if** a component-level test is still wanted after (a) and (b). Zero new dependencies either way. | `package.json`, `tests/css-stub.mjs` (conditional) | plan §11.1; Q15 |
| **Add the analytics freeze test.** §10 lists "GA4 measurement ID, stream, consent defaults and `ad_*` denials are unchanged" as a hard gate but names no file, and `tests/preserved-surfaces.test.ts` is scoped to routes, redirects and hrefs. `components/GoogleAnalytics.tsx` is a plain string template, so a one-character edit to `analytics_storage: 'denied'`, or a dropped `ad_user_data` line, produces no test failure, no type error and no build failure — the same silent-failure class this phase exists to close for CSS. Read both files with `node:fs` and assert the literal presence of `analytics_storage: 'denied'`, `ad_storage`, `ad_user_data`, `ad_personalization`, `wait_for_update: 500`, `ads_data_redaction`, `anonymize_ip`, `send_page_view: true`, `allow_google_signals: false`, `allow_ad_personalization_signals: false`, `const storageKey = "bct_analytics_consent"`, and the button labels `Decline` / `Allow analytics`. Cheap, and it makes user constraint 4 mechanical instead of aspirational. | `tests/analytics-frozen.test.ts` | user constraint 4 |
| **Write the deletion-contract script** the §3.0 gate refers to, so it is executed rather than eyeballed. | `scripts/check-no-deletions.sh`, `tests/preserved-surfaces.test.ts` | user constraint 2 |
| **Add `.env.example`** documenting `NEXT_PUBLIC_GA_MEASUREMENT_ID` and recording that `WYS_AGGREGATE_ENABLED` is deliberately a build-time content constant, not an env var (§8.6). The repo has only a gitignored `.env.local`, so nothing today tells a new clone which variables exist. | `.env.example` | repo fact |
| Record and schedule the three mismatches **in the two lists they actually belong to** — they are not the same kind of finding, and seeding them into one allowlist masks nothing and misdescribes the repo. `UNRESOLVED_CLASSNAMES` = `hero-foyer` (applied at `app/page.tsx:8`, no rule anywhere) and `secondary` (applied at `app/page.tsx:26` as `audience-button secondary`; `grep -n secondary app/globals.css` returns only `.secondary-results` at `:583/:590/:595`, so the two hero buttons are asymmetric by accident). `ORPHAN_RULES` = `.hero-principle` (`globals.css:178`, referenced by no `className` in any `.tsx`) — a className→selector scan **never visits it**, so it can never be reported "unresolved" and would sit in that allowlist forever, letting Phase 10's "remove them from the allowlist" step pass for an item that was never in scope. Resolution lands in Phase 10 and empties both lists. | `docs/facelift-build-notes.md` | repo facts |
| Write the deletion contract: at every phase gate, `scripts/check-no-deletions.sh` exits 0 (both `--diff-filter=D` and `--diff-filter=R` print nothing) and `tests/preserved-surfaces.test.ts` is green. The gate is removed **or renamed** files/routes/links — **not** a line count, and **never** `git diff --stat`, which cannot detect a deletion (§3.0). | `docs/facelift-build-notes.md` | user constraint 2 |
| Note the secret-scan hazard for later content work: `.githooks/pre-commit` is active (`core.hooksPath = .githooks`) and `check-secrets.sh` pattern 3 matches `(api[_-]?key\|secret\|token\|password)` followed by a 24+ character value. Source Period C is *about* leaked credentials. Keep fake credential literals under 24 characters or split them across concatenation. **Never use `--no-verify`.** Keep new binary assets under `public/` (binaries are skipped). | `docs/facelift-build-notes.md` | AGENTS.md; `scripts/check-secrets.sh` |

**The class-contract test, specified.** "Assert each token resolves to a `globals.css` selector **or a CSS Module import**" asserts nothing about the CSS-Module half, and that half is where every new surface lives. Verified: `styles.doesNotExist` in a component importing a real `.module.css` type-checks clean under this `tsconfig` — `next-env.d.ts:1` pulls in Next's loose `{ readonly [key: string]: string }` CSS-module typing — so `npx tsc --noEmit` reports nothing, and a test that extracts `className` **string literals** never sees `className={styles.typo}` at all. Three modes, all regex + `fs`, still zero dependencies:

1. **`className` string literal → `globals.css` selector.** The existing direction. Special-case `plan-room-${item.number}` (`app/page.tsx:44`, values 1–4 from `destinations[].number`) and the `"active"` / `"complete"` stepper states (`IntentRouter.tsx:53`). Failures go to `UNRESOLVED_CLASSNAMES`.
2. **`styles.<key>` member access → sibling `.module.css` class selector.** For every `import styles from "./X.module.css"`, parse `X.module.css` for its class selectors and assert every `styles.<key>` in the sibling `.tsx` exists. Without this, every new WYS and ship surface has **zero** class-name safety — the exact failure mode Phase 0 exists to close.
3. **`globals.css` selector → some `className` token (orphan-rule scan).** The reverse direction, which the other two cannot cover. Needed because the 933-line rewrite can otherwise strand rules with no signal at all. Failures go to `ORPHAN_RULES`.

**Exit:** `npm test` green including the new tests (preserved surfaces, class contract, analytics frozen) · measured baseline written down, including the Static/`ƒ`/SSG marker per route and any dev-only routes · `scripts/check-no-deletions.sh` exits 0 · no visual change yet.

---

### Phase 1 — Provenance substrate

**Goal:** make it structurally impossible for draft or AI-written prose to reach a Ben-authored label — before any content module or renderable component exists.

| Task | Files | Source |
|---|---|---|
| `ContentStatus` + the nine-member `ContentOrigin`. | `lib/content-status.ts` | WYS §7 + its "Never do this" rule; handoff README bucket 3 |
| The **two-axis** `renderPolicyFor()` returning `blocked` / `marked` / `canon`, with `RENDER_BEN_REVIEWED` defaulting **false** as a single exported constant. | `lib/content-status.ts` | WYS §7; §6.2 above |
| The `(surfaceKind, origin) → label` mapping as a **pure function with no JSX and no CSS** (§6.3), including the five NEW label strings and the totality requirement. The *components* that render it move to Phase 4. | `lib/content-status.ts` | WYS §23 |
| The **prop shapes** for `ProvenanceLabel`, `DraftMark`, `BenSlot`, `MediaSlot`, `DashedSlot` as types only: `label` is a required non-optional prop derived from the content object, and none of the slot types has a `children`, `text` or `body` prop, so filling a Ben slot with generated text is a compile error. Components implementing these types are built in Phase 4, after tokens exist. | `components/provenance/types.ts` | handoff README bucket 2; mockup 5d Bridge slot copy |
| `approvalState` — stamp, captain's round, snapshot, Standing Orders status, keel `{version:"2.3", url, sha256: null}`. | `lib/approval-state.ts` | packet: NOT YET GOVERNING + Approval Ledger; mockups 4a footer / 5d Bridge |
| The four-link authority chain as data: YY Method Professional v2.3 (`yymethod.com/work`) → BCT Standing Orders → Author Ship current state → Ship's Log and snapshots, hash field present and empty. | `content/authority-chain.ts` | packet: authority-chain, hashing |
| `CanonicalText` type + resolver with `short`/`medium`/`full` variants. | `lib/canonical-text.ts` | packet: one-definition |
| Type-only Coach schema: `WysCoachAction` + **all sixteen** §22 governing rules as comments (§6.10). No runtime calls, no imports from components, disabled and invisible per §2.2. | `lib/wys/coach-schema.ts` | WYS §22, §2.2 |
| `content/claims.ts` — the `CanonicalText` type plus the shared claim records, **moved here from Phase 11** (§8b.1) so Phases 5, 8 and 9 render `inline`/`short`/`machine` from an existing module. Only the legal-page `full` prose pass stays in Phase 11. | `content/claims.ts` | packet: one-definition; §8b.1 |
| Draft preview **tooling** per §6.11 — a `scripts/preview-content.mjs` dump, not a route. If a rendered page is added instead, it calls `notFound()` in production and is recorded in the baseline. | `scripts/preview-content.mjs` | WYS §7; §33 step 29 |
| **Tests, written before any consumer exists — all against pure modules, no component import, no CSS:** a draft Ben-origin object is `blocked`; an `AI_SYNTHESIS` object is `marked` and cannot resolve to a Ben-authored label; `ben_reviewed` is excluded under the default; **`marked` resolves to `blocked` on public surfaces while `RENDER_MARKED_DRAFT === false` (Q21) and to `marked` on the preview surface**; a `historical` object without `supersededBy`/`canonical:false` fails; the `(surfaceKind, origin)` label map is total and every NEW label string is present. The "rendering `marked` prose without its label fails" guarantee is enforced **at the type level** by the required-`label` prop shape, and re-checked as a component test only if the Phase 0 CSS-stub decision made that runnable. | `tests/content-status.test.ts` | WYS §29.1, §37 Provenance |
| Governance-string grep test (§6.6). | `tests/governance-strings.test.ts` | packet: Approval Ledger |
| Canonical-text + no-raw-prose checks (§6.8), including the ≥12-word duplicate hash rule and the invariant checks from §6.10. | `tests/canonical-text.test.ts` | packet: governance validation; WYS §14 |
| **Do not edit `content/site-config.ts`** — its shape is pinned by `tests/route-resolver.test.ts` and it cannot carry a provenance field. | — | user constraint 2 |

**Exit:** all new modules compile under `strict` · every test green · **no page, component or stylesheet written yet — this phase is pure TypeScript only** (its former component and dev-route tasks now sit in Phase 4, after §4.2's tokens exist, so nothing here can reference a `--accent` or `--muted` that has not been defined) · `content/site-config.ts` byte-identical to `main`.

---

### Phase 2 — Local state substrate

**Goal:** make a learner dossier impossible, and make a `localStorage` read unable to reach the server render.

| Task | Files | Source |
|---|---|---|
| The verbatim `WysLocalStateV1` shape; `parse` / `migrate` / `serialize` / `validate`; pure and React-free. | `lib/wys/local-state.ts` | WYS §17 |
| Write-side **key allowlist** dropping undeclared keys (§7.2), with the `rulebook[].text` clarification. | `lib/wys/local-state.ts` | WYS §17 minimization |
| `try/catch` on every read and write, returning a valid empty state; a blocked-storage state renders correctly rather than crashing. | `lib/wys/local-state.ts` | WYS §29.3; §6 mobile-first |
| `restartCourse()` and `clearAllWysData()` as distinct operations, each explaining itself first; clear scoped to `wys:*`; neither claims to erase hosting/GA4 logs. | `lib/wys/local-state.ts` | WYS §17 |
| `BROWSER_KEYS` registry (§7.5). | `lib/wys/browser-keys.ts` | user constraint 5 |
| The hydration-safe hook: `{loaded:false}` sentinel, `useEffect`-only read. | `components/wys/useWysState.ts` | `ConsentBanner.tsx:25-36`; WYS §28 |
| Harden `ConsentBanner`'s two unguarded `localStorage` calls with `try/catch` — behaviour-preserving. | `components/ConsentBanner.tsx` | user constraint 4 |
| **Value-domain validation** on every free-shaped declared field (§7.2): `postureChoice`, `lastRoute`, `dismissedNotices`, `replayCounts` keys, `localJudgments` keys and choice keys. | `lib/wys/local-state.ts` | WYS §17, §9.2 |
| `cadencePathFor(week, cadence)` with the `mostDays → days5` / `days3 → days2` fallbacks (§5.3), never returning `undefined`. | `lib/wys/local-state.ts` | WYS §8.10, §17 |
| Tests: parse/migrate; **undeclared** key dropped; **out-of-domain value under a declared key dropped**; scratch text never persisted; `rulebook[].text` round-trips; restart vs clear semantics; storage-throws path; **every declared top-level schema field maps to exactly one Data page row and back** (§7.5); the cadence fallback for all four cadences against a week declaring only `days2`/`days5`. | `tests/wys-local-state.test.ts` | WYS §29.1 |

**Exit:** no code path can persist an undeclared field or scratch text · no `localStorage` access during server or first client render · consent behaviour unchanged apart from the guard.

---

### Phase 3 — Telemetry substrate

**Goal:** make it impossible for a component to emit an unlisted event, a free-text property, or an event a declining visitor did not consent to.

| Task | Files | Source |
|---|---|---|
| Move + widen the `Window.gtag` augmentation (§8.4). | `types/gtag.d.ts`; `components/ConsentBanner.tsx` | repo fact + `strict:true` |
| `trackWys` with the closed 13-name event allowlist and 4-key property allowlist; fails **closed** in production, loud in development. | `lib/wys/telemetry.ts` | WYS §19.4, §19.5, §19.1A |
| Consent gate on `bct_analytics_consent === "granted"` and on the measurement ID being set; fails closed on a thrown read. | `lib/wys/telemetry.ts` | WYS §19.3; user constraint 4 |
| `dataLayer` push with an **arguments-shaped** shim (§8.3), plus the consent-ordering note. | `lib/wys/telemetry.ts` | `components/GoogleAnalytics.tsx` |
| Per-event decision-use table beside the allowlist. | `lib/wys/telemetry.ts` | WYS §31, §19 |
| Aggregate adapter as a **disabled documented stub**; **no** `app/api` route. | `lib/wys/aggregate.ts` | WYS §19.2, §30 |
| `components/GoogleAnalytics.tsx` — zero edits. | — | user constraint 4 |
| Tests: unknown event rejected; unknown property rejected; **a camelCase property key is rejected** (snake_case is the wire format, §8.2); **nothing is pushed to `dataLayer` before `ga4-init`'s config marker exists, and the buffer drains in order once it does** (§8.3); **`wys_view` and `wys_transfer_check_complete` are wired-but-unfired** (§8.7); **the Data page's aggregate sentence cannot render while `sendAggregate()` is disabled** (§8.6); free text rejected; **the whole `WysLocalStateV1` object or a rulebook array passed as a property is rejected** (§34's "analytics wrapper serializes local state" stop condition); consent-denied path emits nothing; GA-unset path emits nothing; aggregate payload validation; aggregate-disabled makes no network call; the canary `DO_NOT_SEND_WYS_TEST_9f31` passed anywhere into `trackWys` is rejected and never serialized. | `tests/wys-telemetry.test.ts` | WYS §29.1, §29.2, §34 |
| No-private-state-in-URLs test (§8.5). | `tests/no-private-state-in-urls.test.ts` | WYS §19.3 |

**Exit:** no component can emit an unlisted event or property · `wys_scenario_choice` sends nothing · the live GA4 configuration, measurement ID, consent defaults and stream scope are unchanged · `npm run build` type-checks.

---

### Phase 4 — Design system

**Goal:** swap the identity so all preserved routes restyle with zero markup edits, and prevent name collisions between old and new.

| Task | Files | Source |
|---|---|---|
| `next/font` for both families at the weights §4.3 fixes — **Sans 400/500/600 with `style: ["normal","italic"]`, Mono 400/500/600/700** — so the 17 legacy mono-600/700 rules and the 2 legacy serif-italic rules do not render faux-bold and faux-italic. **Delete `globals.css:1`**. | `app/layout.tsx`, `app/globals.css` | handoff README tokens; packet: performance; `globals.css` audit |
| Add the facelift token set (§4.2) with the usage-rule comments. | `app/globals.css` | handoff README Design Tokens; artboards |
| Alias every legacy token name; redefine `--ink`; `--max` → 1280 (§4.4). | `app/globals.css` | user constraint 3 |
| **The second, budgeted task:** replace the ~11 hardcoded blueprint colour rules and the untokenised geometry — zero radii, 2 px borders, hatch backgrounds, graph-paper `.plan-foyer`, compass marker, dimension lines, inverted hover — with the inset-rounded-slab rhythm. | `app/globals.css` | §4.4; mockup 4a |
| Fence the STRUCTURAL section per §4.5, **including its three notes**: keep `:focus-visible` at 3 px/3 px and change only `--focus` (the README's 2 px is "suggested", not authority); move `main { overflow: hidden }` **out** of the fence and into the geometry task as `overflow-x: clip`, so the demo card's overhang and its 80 px shadow are not clipped; keep `html { scroll-behavior: smooth }` **inside** the fence paired with its `prefers-reduced-motion` override, or delete both together. Update the shared container rule's **value** (56/22 gutters) while keeping its single-rule mechanism. | `app/globals.css` | `/accessibility` published claim; §4.9 |
| Author the interaction-state layer (§4.6); flag as NEW/unapproved. | `app/globals.css`; component modules | handoff README Interactions |
| Ship light-only; add no dark-mode block. | `app/globals.css` | artboards |
| Establish the CSS Modules boundary for new surfaces. | `components/**/**.module.css` | §4.1 |
| **Retire the blueprint scaffolding: markup and CSS together, in one commit** (§4.4). Remove `.dimension-line`, `.plan-foyer`, `.scale-line`/`.scale-bar` markup from `app/page.tsx:34-41, 51-56, 57-61` and **every selector in each family** from `globals.css` (`grep -c` returns 0 for each), and update `tests/class-contract.test.ts` expectations in the same commit. All three are decorative `aria-hidden` blocks with no copy a reader reaches, no href and no metadata. List them in `docs/facelift-unapproved.md`. | `app/page.tsx`, `app/globals.css`, `tests/class-contract.test.ts` | §4.4 |
| **Run the contrast audit** (§4.2) at the real rendered sizes, record the measured table, and ship the `--accent-text-on-tint` build-now default. Two approved pairs fail AA for normal text; this is a visual deviation from an approved artboard and goes to Ben as Q23. | `app/globals.css`, `docs/facelift-unapproved.md` | WYS §27, §37 UX; `/accessibility` |
| **Build the provenance components** whose types Phase 1 fixed: `ProvenanceLabel`, `DraftMark`, `BenSlot`, `MediaSlot`, `DashedSlot`. They land here, not in Phase 1, because they consume `--accent` / `--muted` and the CSS Modules boundary, neither of which exists before this phase. No sparkle icon; AI material never styled more premium than human source. | `components/provenance/*` (+ `.module.css`) | WYS §23; §6.3 |
| Build the primitives (§4.8), starting Pill → ChoiceRow → CardShell → JUDGE composite. Normalise selection and the primary fill per §4.7. | `components/ui/*`, `components/wys/*` | artboards |
| Primitives preview, checked at 390 and 1280, using the §6.11 mechanism: a script dump by default, or a route that calls `notFound()` in production **and is recorded in `docs/facelift-baseline.md`** so the route-marker regression check stays meaningful. | `scripts/preview-primitives.mjs` or `app/dev/primitives/page.tsx` | WYS §6, §7 |

**Exit:** all preserved routes render in the new identity with **zero** copy, href or metadata change · class-contract test green · skip link and `:focus-visible` work · First Load JS at or below the measured baseline · every route is `○` or `●`, zero `ƒ` (§5.3) · exactly one intentional CSS line removed.

---

### Phase 5 — Chrome

**Goal:** every existing link survives, the disclosure strip appears on every page footer, and no governance claim is hardcoded.

| Task | Files | Source |
|---|---|---|
| Header carrying **both** inventories (§3.3), two-tier or grouped. Preserve skip link, `aria-label`s, `<main id="main">`, the `<img aria-hidden>` + text pairing, and all root metadata (brand wordmark is Q8). | `app/layout.tsx`, `components/SiteHeader.module.css` | mockup 4a; user constraint 2 |
| Footer: four properties from `destinations.map()`, a Reviewers group, the seven legal links unchanged, and the stamp line bound to `approvalState`. | `components/SiteFooter.tsx` | mockup 4a footer; `content/site-config.ts` |
| `DisclosureStrip` desktop + **new stacked mobile variant** (§5.5). | `components/DisclosureStrip.tsx` | handoff README:38 |
| **Build-now default for the strip's approval sentence** so the component is writable before Ben answers SC-1: render the first three sentences verbatim ("You're not talking to AI anywhere on this site. No chatbot, no coach, no generated answers. AI did help build the site and draft the copy — as crew, listed in the manifest.") **from `content/claims.ts`, not hardcoded in the component** — they are Final copy, they are a `CanonicalText` `inline` variant, and §6.8's `no-raw-curriculum-prose` check now covers all of `components/`, so hardcoding them would fail the build. The fourth sentence is a **variant selected by `approvalState.stamp`**, which is what §6.6 already requires of the same string. While `stamp === null`, render in place of the fourth a factual line stating that nothing here is published as Ben's position until he stamps it, linking to the Ship's Log. When a stamp exists, render the approved fourth sentence. **Escalate the wording to Ben before launch.** | `components/DisclosureStrip.tsx`, `lib/approval-state.ts` | WYS §34; packet: NOT YET GOVERNING |
| Restyle `ConsentBanner` chrome — visual only. | `components/ConsentBanner.tsx` | user constraint 4 |
| `app/not-found.tsx`, `app/error.tsx` **and `app/global-error.tsx`** (the latter two **must** be `"use client"`; `global-error.tsx` must render its own `<html>` and `<body>`) in the new register; flag all three as NEW surfaces, not restyles. `global-error.tsx` is required *in this phase specifically* because this is the phase that rewrites the root layout — `error.tsx` does not catch a throw from the root layout, so without it a failure in the new header, disclosure strip or `next/font` renders Next's unstyled default in production. | `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx` | repo fact: none exists |
| **Stub seven routes, not five.** The nav mounted in this phase has six items and the CTA points at a seventh, but only five are ship routes — `/watch-your-step` and `/watch-your-step/start` are not created until Phase 7, so as originally sequenced this phase's own "no dead links" exit was unmeetable. Stub `app/{bridge,standing-orders,ships-log,crew,ben}/page.tsx` **plus `app/watch-your-step/(shell)/page.tsx` and `app/watch-your-step/(flow)/start/page.tsx`** as "in build" placeholders. Stubbing the two WYS entries here has a second benefit: it forces §5.4's `(shell)` / `(flow)` route-group structure to be proven before Phase 7 depends on it. (The alternative — defer mounting the ship nav and keep the existing three-link nav through Phase 5 — is recorded as the fallback if the route groups prove contentious.) Real content lands in Phases 7 and 9. | `app/{bridge,standing-orders,ships-log,crew,ben}/page.tsx`, `app/watch-your-step/(shell)/page.tsx`, `app/watch-your-step/(flow)/start/page.tsx` | §5.5; Standing Order 06 |
| Ensure the footer is a complete mobile path to every link regardless of how Q9 resolves. | `components/SiteFooter.tsx` | user constraint 2; packet: mobile-first |

**Exit:** `tests/preserved-surfaces.test.ts` green · every pre-facelift href reachable at 390 and 1280 · the strip renders on every route at both breakpoints with its sentence read from state · **no dead links — all six nav items, the CTA and the strip's "Crew Manifest →" resolve, which requires all seven stubs** · every route still `○` or `●`, zero `ƒ` · consent behaviour byte-identical apart from visuals.

---

### Phase 6 — WYS content model and modules

**Goal:** Ben's material has somewhere to go; every object carries status and origin; no canonical string is defined twice; nothing is invented.

| Task | Files | Source |
|---|---|---|
| The ten interfaces verbatim, plus `origin` on Ritual and Carry, and **`WysFictionalArtifact.type` widened from §8.7's nine members to §24's twelve** — *not* a parallel `containerType` field, which would be two fields for one concept (§6.10). | `content/watch-your-step/types.ts` | WYS §8; §6.1, §6.10 |
| Content modules in the repo idiom (`satisfies`), never editing `site-config.ts`. | `content/watch-your-step/{config,sources,principles,scenarios,judgments,boundaries,variants,artifacts,rituals,carries,weeks}.ts` | WYS §8; `content/site-config.ts` idiom |
| Lesson Zero + Source Periods A–H as `WysWeek` records with `timeBudgetPaths` and `cadencePaths`; count derived, never literal. | `content/watch-your-step/weeks.ts` | WYS §11 |
| The §3.4 judgment framework as a canonical content component. | `content/canonical/judgment-framework.ts` | WYS §3.4 |
| **Over-withholding scenarios** — at least one per named class, with the verbatim feedback line and no shaming copy. | `content/watch-your-step/scenarios.ts`, `boundaries.ts` | WYS §25; §37 Curriculum |
| **External-authority** content: populate `externalAuthorityNotes`, `externalAuthorityCaveat`, `authorityBoundary`; the verbatim outranking line; "anonymization is not a loophole". | `content/watch-your-step/{judgments,boundaries,carries}.ts` | WYS §26 |
| Collapse the four canonical collisions and record the list (§6.8). | `content/watch-your-step/weeks.ts`, `scenarios.ts`, `copy.ts` | Standing Order 07; packet: one-definition |
| Store all fictional scenarios, choice labels, judgment bodies, the 18/61/21 split and stop titles A–H at `status:"draft"`, `origin: AI_SYNTHESIS \| IMPLEMENTATION_PLACEHOLDER`. | `content/watch-your-step/{scenarios,judgments}.ts` | handoff README bucket 3 |
| Model every Ben source as a **labelled empty slot** (`approvedExcerpts: []`, `allowedSurfaces: []`): the Today video (6:40), both "Hear Ben, 60 seconds" pills, the three portraits, the Bridge position, Captain's Quarters "Selected history", the judgment header slot. | `content/watch-your-step/sources.ts`, `content/ship/*` | handoff README bucket 2; WYS §11 |
| Raw voice corpus handling per §6.12, if it enters at all. | `content/watch-your-step/sources.ts` | packet: corpus front matter |
| Single `CONTENT_VERSION` constant with a documented hand-bump rule (bump when a scenario's text or choices change; distributions must never mix versions). | `content/watch-your-step/version.ts` | WYS §19.1B, §30 |
| The **twelve** authoring templates, each ending in a `status` field: source · story · transcript · principle · scenario · judgment · boundary · variant · artifact · ritual · carry · week. | `content/watch-your-step/_templates/*.md` | WYS §36 |
| Ship content modules: standing orders (nine titles verbatim, 01 with its gloss, all draft), Ship's Log (two entries at "approval pending" + the Captain's Round note typed as a **distinct object**, not a log entry), Bridge, Crew Manifest (five fields per system), Captain's Quarters. | `content/ship/*.ts` | mockups 5d; packet: Crew Manifest |
| Fictional-artifact **type + empty bank**; Period C renders "not yet available" rather than an invented screenshot. | `content/watch-your-step/artifacts.ts` | WYS §8.7, §24, §27 |

**Exit:** content compiles under `satisfies` · every object carries status, origin **and its source references** — `sourceIds` / `principleIds` / `primarySourceId` resolve to real records, or carry an explicit recorded reason for being empty while Ben's recordings are unselected (WYS §37 Provenance: "Content objects carry source IDs/status/origin") · nothing claims Ben authorship · duplicate-prose, invariant and order-tag-resolution checks green · §25 and §26 content exists · `site-config.ts` byte-identical.

---

### Phase 7 — The course

**Goal:** the deterministic, zero-AI, no-account loop, built on substrate that already refuses to leak the learner.

| Task | Files | Source |
|---|---|---|
| Route groups `(shell)` / `(flow)` (§5.4); the five-item bottom nav (Today · Plan · Progress · Practice · Data), no "Chat", `env(safe-area-inset-bottom)`. | `app/watch-your-step/(shell)/layout.tsx`, `(flow)/layout.tsx`, `components/wys/BottomNav.tsx` | WYS §5.1, §5.2; mockup 5b/5c |
| Landing: centred hero, mobile demo card, dark instructor pill (72 px disc), 140 px stop peek row, five struck pills, "See what this site knows about you" link row. Tab bar with **no active item**; every tab routes to onboarding until `onboarding.completed`. | `app/watch-your-step/(shell)/page.tsx` | mockup 4a phone; WYS §5.1 |
| Lesson Zero — the fixed 10-step sequence, progress rail, no bottom nav. Includes **step 3 human-source-first** and the **§9.3 completion condition**. Enforce §9.2: no chat box, no microphone, no "tell me your situation", no free-text biography, company, job title, family details, email, full name, exact age, reason for distrust, psychological labels; no superseded "I hate it" option; no diagnostic language. **Five of ten steps are undesigned — steps 1 (constructive intent), 3 (human source first), 4 (first durable privacy habit), 6 (runtime disclosure) and 10 (plan preview). Compose exactly those five and flag each as NEW in `docs/facelift-unapproved.md`.** Steps 2, 5, 7, 8 and 9 are drawn (`5a`'s third phone is a composite carrying 7, 8 and 9). Step 4's habit line is drawn inside step 5's THE FIRST HABIT card, so decide and record whether step 4 is a separate screen at all. **Step 10 is Plan preview** (WYS §9.1 step 10): "show finite direction; more available time creates more depth, not faster consumption of Ben's human-source spine" — and the artboard's terminal **"Show my plan" pill advances to step 10, an in-flow preview; it does not route to `/watch-your-step/plan`.** The spec answers that, so it is not a Ben question. | `app/watch-your-step/(flow)/start/page.tsx`, `components/wys/LessonZero/*` | WYS §9.1, §9.2, §9.3; mockup 5a |
| Step 6 runtime disclosure, worded identically to the disclosure strip. | `.../start/page.tsx` | WYS §9.1 item 6 |
| **WATCH component** — 196 px striped media slot, white "Ben source · video · 6:40" overlay pill, 56 px ink play disc, mono "slot: Ben-selected recording", caption, **Transcript as an inline expandable block**. One primary human source per period; **no interpretation above the human source**. | `components/wys/WatchCard.tsx` | WYS §10 WATCH, §33 step 9, §27; mockup 5b |
| **TRY** — one concrete fictional practice move requiring no personal material. | `components/wys/TryScenario.tsx` | WYS §10 TRY |
| **JUDGE** — the verbatim state machine: single-select, re-selectable only while uncommitted; Commit disabled until a pick; on commit lock choices → reveal judgment → reveal distribution → reveal actions; Reset clears both. Nothing renders before commit. Header label **computed** from origin. Plain `useState`. Note "Disagreeing with Ben is fine. Agreement isn't the score." | `components/wys/JudgeCard.tsx` | mockup 4a `data-dc-script`; WYS §10 JUDGE |
| **CARRY** — explicit "I did it"; **no reporting requirement**; the product regularly tells the learner to leave. | `components/wys/CarryCard.tsx` | WYS §10 CARRY, §13 |
| Today: header + derived "Stop A · visit n of m" (§5.3), phase pills, WATCH card, the **only bordered card** on the screen for TRY/JUDGE, teal CARRY card. | `app/watch-your-step/(shell)/today/page.tsx` | mockup 5b |
| `/stop/[stopId]` with `generateStaticParams()`. | `app/watch-your-step/(shell)/stop/[stopId]/page.tsx` | §5.3 |
| Plan: three row states + dashed terminal row; "F · Independence — off-site"; the scaffold footnote; "Change pace or time". **Plus `optional practices`, the fifth thing (WYS §12) requires Plan to show** — current source period · upcoming · approximate direction · completed periods · **optional practices** — which is also where Replay and From Memory surface outside Practice. The approved `5b` Plan artboard draws no such row, so this is a spec-vs-artboard gap: either add `optionalPracticeIds` to `WysWeek` and render a row for it, flagged NEW/unapproved, or record the narrowing in §14 with its reason. **Build-now default: add the data shape and render the row, flagged NEW** — omitting it silently drops a spec requirement. **No "behind" state, no overdue, no missed, no streak, no percentage, no guilt copy.** Time-budget and cadence routing from content data. | `app/watch-your-step/(shell)/plan/page.tsx` | WYS §12; mockup 5b |
| Progress: four stat tiles with derived denominators; judgments rows where "differs from Ben" is a **status with no corrective styling**; outlined rulebook + dashed "+ Add a rule"; "Inspect local data". **Show none of:** privacy score, AI-literacy percentage, psychological diagnosis, trust score, streak, XP, level, badge, ranking, agreement-with-Ben score. | `app/watch-your-step/(shell)/progress/page.tsx` | WYS §13; mockup 5b |
| Practice: Replay with **exactly two deterministic modes** — "as authored" and "Ben variant" where one exists. **Generate no AI variations in v0.** Enforce the §14 invariant rule. | `app/watch-your-step/(shell)/practice/page.tsx` | WYS §14 |
| From Memory: "Say it aloud" / "Write it on paper" pills, dashed scratch box, "I did it". **No network request, no analytics event containing its content, no persistence, cleared on route change.** Label verbatim: *"This stays in this page and is not sent anywhere. It clears when you leave."* | `components/wys/FromMemory.tsx` | WYS §15.1; mockup 5c |
| Detox / Stop F: single visit, sets a return cue, completes only on explicit mark; **no reporting during the exercise, no engagement reminders**; on return ask a structured retrieval judgment, not a diary entry. **Flag the completion rule as authored, not specified.** | `components/wys/DetoxCard.tsx`; `content/watch-your-step/{weeks,rituals}.ts` | WYS §15.2; mockup 5b |
| Learner-owned rulebook behind a config flag: local only, editable, exportable as plain text or JSON, deletable, **never labelled Ben doctrine, never automatically sent to analytics, no AI rewriting.** | `components/wys/Rulebook.tsx` | WYS §16, §35 |
| Appetite filter after real deterministic value: outlined "I'd want deeper practice", note "One anonymous count. No email. Nothing unlocks." Record locally, fire `wys_depth_interest`. **No email, no chat, no unlock UI, not visually rewarded, not conflated with mailing-list consent, not a KPI to maximise.** | `components/wys/AppetiteCard.tsx` | WYS §21 |
| Stop H terminal surface: rulebook export + a **labelled empty slot** for Ben's exit copy; fires `wys_course_complete` (the one allowlisted event with nothing else to fire it). | `app/watch-your-step/(flow)/end/page.tsx` | WYS §11 Period H; §19.4 |
| Completion semantics: **opening is not completion, scrolling is not completion, time on page is not completion.** A scenario counts on the required judgment; a CARRY counts on an intentional mark; never require private details to prove it. Cover with a unit test. | `lib/wys/local-state.ts`; `tests/wys-completion.test.ts` | WYS §13, §29.1 |
| Transfer checks: wire the data model, local state field and `wys_transfer_check_complete` — **ship no transfer-check UI in v0** (no artboard draws one; Progress's four tiles omit it). **State the consequence rather than leaving it implicit:** (WYS §12)'s 5-day working path ends "Day 5: delayed retrieval or transfer + CARRY", so deferring the surface silently deletes the last day of a shipped cadence path — a 5-day learner's Day 5 would have nothing to render. Build-now default: **the 5-day `cadencePath` ships with Day 5 as CARRY-only**, recorded in §14 and in `docs/facelift-unapproved.md` as a narrowing. The alternative — a minimal delayed-retrieval surface — is Ben's call (Q24). Do not defer the feature and ship the path that depends on it without saying so. | `content/watch-your-step/weeks.ts`; `lib/wys/telemetry.ts` | WYS §8.10, §12, §17, §19.4 |
| Wire only allowlisted events at the points §19.4 names. | course components | WYS §19.4 |

**Exit:** a new learner completes onboarding and one full WATCH → TRY → JUDGE → CARRY session with analytics blocked and **zero** API calls beyond static assets · no account, free text, upload, microphone or chat interface · judgment unreachable before commit · no streak/XP/score/percentage/"behind"/guilt anywhere · scratch canary appears in no analytics call, no request and no `wys:*` key · every course route is `○` or `●`, zero `ƒ` (§5.3).

---

### Phase 8 — The Data page

**Goal:** a page that renders the visitor's actual browser state and whose every sentence is true of the shipped code.

| Task | Files | Source |
|---|---|---|
| The three cards escalating in weight: **1 · THIS BROWSER** (grey, label/value rows from real state, mono "key: wys:v1 · raw JSON ↓" with an inline `<details>` disclosure), **2 · BEN MAY RECEIVE** (grey), **3 · BEN DOES NOT NEED** (ink). A first-class curriculum feature, not buried legal copy. | `app/watch-your-step/(shell)/data/page.tsx` | WYS §18, §20; mockup 5c |
| Render the **key list** from the `BROWSER_KEYS` registry so `bct_analytics_consent` appears alongside `wys:v1` and the sitewide title stays honest (Q6 may instead narrow the title), and render card 1's **rows from the `WysLocalStateV1` field set** (§7.5) so every persisted field surfaces — including the two the artboard omits and (WYS §20) requires: **local judgments** and **last route**. Both added rows go on the Final-copy escalation list with the clearing footnote. | same | user constraint 5; WYS §20; `ConsentBanner.tsx:7` |
| Condition **both** of card 2's unverifiable assertions on the state that would make them true, not on copy. (a) The **coarse-counts** clause is conditioned on actual consent state rather than asserting flatly that counts are sent (§8.8, SC-2). (b) The **aggregate sentence** — "Some fictional exercises send only scenario ID + option to a first-party counter — stored as totals, never as your history" — renders **only when `WYS_AGGREGATE_ENABLED` is true**, bound to the same constant as `lib/wys/aggregate.ts`, exactly as (WYS §20)'s "If enabled:" prescribes (§8.6, SC-12, Q22). With the flag off, the sentence does not exist in the DOM. | same | §8.8; §8.6; WYS §20, §34, §37 |
| Three actions: "Download my local data" (client-side JSON blob — there is no server copy), "Restart the course · keeps rulebook", "Clear this browser's data". Both destructive actions explain themselves first. | same | WYS §17, §18 |
| Amend the clearing footnote to name what survives (the analytics consent choice) and link to `/cookies`. **Escalate the copy change** (README marks it final). | same | WYS §17; user constraint 5 |
| The clear-and-reload demonstration as curriculum: clear → reload → visibly see it gone, teaching that local state is not server data, restart is not deletion, and transparency beats an absolute promise. Design the **post-clear empty state**; this is a teaching interaction, not a QA step. | same | WYS §20; packet: see-what-site-knows |
| A no-storage variant when the browser blocks `localStorage`. | same | §7.3 |
| Infrastructure paragraph — the **`short` variant from mockup 5c**, rendered from `content/claims.ts` (created in Phase 1), *not* (WYS §18)'s longer wording, which is the `full` variant the legal pages render (§8b.3). Forbidden claims absent. | same | mockup 5c; WYS §18; §8b.1 |
| Fire only `wys_data_manifest_view`, `wys_local_state_clear`, `wys_restart_course`. | same | WYS §19.4 |

**Exit:** every sentence true of shipped code · card 1 reflects real browser state including the consent key · clear removes only `wys:*` and says so · no forbidden claim.

---

### Phase 9 — Ship and governance surfaces

**Goal:** fill the five stubbed ship routes; every governance string driven by real approval state; no dead link from a transparency claim.

| Task | Files | Source |
|---|---|---|
| Bridge: "The Bridge · current" pill, h1, the **dashed teal Ben-position slot** ("Awaiting Ben. No draft AI text is shown here, by rule."), WORKING ON rows, ink EXPERIMENT UNDERWAY card, outlined OPEN QUESTIONS rows, mono state footer from `approvalState`. Use `5d` styling — turn `2d` is a superseded register. **Make the Bridge intro's own claim true in architecture, not copy.** dc.html:219 ships "Always current; **every earlier state lives in the Log**", while this plan seeds only two Ship's Log entries, defers Snapshots entirely, and specifies no mechanism that records a Bridge state change as a log entry — so the sentence is false at launch. Same class as SC-1 and the Data page aggregate sentence. **Build-now default: add a supersession rule to `content/ship/bridge.ts`** — every replaced Bridge position becomes a `historical` object carrying `supersededBy` and `canonical: false` (§6.2 rule 4), rendered in the Log — so the claim is made true by the data model rather than by wording. If Ben would rather not carry that machinery in v0, the sentence is a fourth SC-11 escalation (Q25). | `app/bridge/page.tsx`, `content/ship/bridge.ts` | mockup 5d; handoff README:65; packet: Bridge |
| Standing Orders: nine numbered cards verbatim (01 ink + gloss "AI may execute; only Ben signs."; 02–09 grey — **08 "History is preserved, never rewritten." and 09 "Mobile first." are below the screenshot fold and must ship**), grey draft pill from state, keel cited **without a hash**. | `app/standing-orders/page.tsx` | mockup 5d; packet: hashing |
| Ship's Log: append-only entry cards (date as data, "D MMM YYYY"; "approval pending" chip as the **default** state; title; body; order tags) + the ink "NEXT · CAPTAIN'S ROUND" card as a **distinct forward-looking object**. Entries record what was attempted, what changed, which principle governed, what ambiguity surfaced, what was corrected, whether Standing Orders changed, what Ben approved. **Entry bodies are factual build records at draft origin — never Ben opinion, never first person.** | `app/ships-log/page.tsx`, `content/ship/ships-log.ts` | mockup 5d; packet: Ship's Log; R10 |
| **Crew Manifest** — no artboard exists. Compose from `5d` primitives (status pill + h1 + intro + key/value rows) against the packet's five fields per system: what it does · what it can access · what it cannot access · what authority it has · what authority it does not have. Include an honest entry for the Claude session that built this. **Cannot be deferred** — the strip on every page links to it. Flag the visual as NEW. | `app/crew/page.tsx`, `content/ship/crew-manifest.ts` | packet: Crew Manifest; Standing Order 06 |
| Captain's Quarters: image-led 300 px portrait slot with mono "portrait — Ben-supplied" and the name reversed out bottom-left; the "Public by deliberate selection, not by extraction…" intro; the audio slot pill; the WORK & PROPERTIES grid; the dashed "Selected history" slot. **The grid is 2 columns × 3 rows with SIX tiles, not 2×2 with four.** The artboard (dc.html:288-293) is `grid-template-columns:1fr 1fr` followed by six tiles; the handoff README calls it a "2×2 grid" while itself listing six items, and transcribing the README over the artboard contradicts R1 and leaves two tiles unaccounted for. All six, with targets:<br>· **YY Method** / "v2.3 · the keel" → `https://yymethod.com` — and the sub-label **reads from `lib/approval-state.ts` `keel.name`**, not typed, since it is a governance string (§6.6)<br>· **Watch Your Step** / "this site" → `/watch-your-step`, rendered with the **tint-teal current-context fill** the artboard gives it (`#EAF4F6`)<br>· **BenChanViolin Library** / "violin" → `destinations[1].url`<br>· **YY and Me** / "writing" → `destinations[2].url`<br>· **Resonant Patterns** / "writing" → `destinations[3].url`<br>· **Studio** / "rented laboratory" → **Q5** — do not relabel `/studio`, which is the preserved Violin for Parents stakeholder page. Leave unlinked with its label until Ben answers. | `app/ben/page.tsx`, `content/ship/quarters.ts` | mockup 5d; packet: quarters-selection-rule |
| Desktop extrapolation for **fifteen** surfaces, not ten. The ten with mobile artboards (Lesson Zero, Today, Plan, Progress, Practice, Data, Bridge, Standing Orders, Ship's Log, Captain's Quarters) **plus five with no rendering at 1280 at all**: the `/watch-your-step` **landing** (only `4a`'s phone exists, and under Q3's default that URL is the canonical owner of the pitch — this is the highest-stakes one in the set), `/crew` (no artboard at any width), `/watch-your-step/stop/[stopId]` (both widths), `/watch-your-step/end` (both widths), and `/not-found` (desktop). Widen the 390 reading column inside the 1280 shell; the centred reading column stays canonical; desktop may expose secondary metadata in the margin but **must not redefine the IA**. Add every one of the fifteen to `docs/facelift-unapproved.md`. | ship + course `.module.css` | packet: desktop-spillover; handoff README |
| `sitemap.ts`, `robots.ts`, and `/llms.txt` as a **map of current canonical surfaces only** — never a corpus dump, never an indiscriminate enumeration of historical alternatives — carrying the instruction that historical snapshots must not be treated as current. | `app/sitemap.ts`, `app/robots.ts`, and **either `public/llms.txt` generated at build time (preferred) or `app/llms.txt/route.ts` carrying `export const dynamic = "force-static"`** | packet: crawl-surfaces, llms-txt-role |
| `/author-ship/state.json` as the machine mirror, with the packet's key set (`mission`, `current_doctrine`, `standing_orders_version`, `current_experiments`, `resolved_decisions`, `open_questions`, `deprecated_assumptions`, `source_refs`, `tool_roles`, `last_captains_round`, `last_approved_snapshot`), documented **in-band** (a `"canonical_human_node"` key, not only a code comment) as a rendering of the same canonical objects, not a second canonical node. Its claim strings come from `content/claims.ts` `machine` variants (§6.8), never hand-typed.

**Both machine surfaces must not make the build dynamic.** In Next 15 a plain `GET` Route Handler is **not** cached by default — it builds as `ƒ (Dynamic) server-rendered on demand`, which would make these the first non-static routes in a fully prerendered build and fail this plan's own regression gate. That is the same objection §8.6 uses to refuse `app/api/wys/aggregate/route.ts`, so it has to apply here too. **Prefer generating both as static files under `public/` at build time**; if a Route Handler is used instead, it carries `export const dynamic = "force-static"` and no request-dependent code. Either way, add both surfaces to the Phase 0 baseline comparison so the marker check is meaningful. | **Either `public/author-ship/state.json` generated at build time (preferred) or `app/author-ship/state.json/route.ts` carrying `export const dynamic = "force-static"`** | packet: state.json; canonical-node rule |
| Agent bootstrap, verbatim: *"Read the current Author Ship state. Read the Standing Orders. Read the most recent Ship's Log entries relevant to this task. Do not reconstruct superseded decisions from older material when a newer captain-approved state exists."* | `AGENTS.md` (appended section) | packet: agent-bootstrap |

**Exit:** no dead links from nav, strip or governance chips · no Ben-position slot contains generated text · every governance string reads from `approvalState` · every Ship's Log order tag resolves to a real Standing Order · no v2.3 hash printed · one canonical human node per concept, each new route exporting `metadata.alternates.canonical` · **`llms.txt` and `state.json` build as `○`, not `ƒ`** · `/system`, `/about → /system`, `/lab → /neon`, `/posts` all still work.

---

### Phase 10 — Home assimilation and preserved-surface verification

**Goal:** settle `/`, and **verify** — not assume — that the token re-point restyled every preserved page without changing a word.

| Task | Files | Source |
|---|---|---|
| Compose `/`: the `4a` blocks in order, then the preserved foyer sections restyled (hero-foyer copy, four-door grid, `IntentRouter`, stakeholder cards). Nothing deleted, nothing relocated. Stacking order per Q2; additive is the default. | `app/page.tsx`, `app/home.module.css` | mockup 4a; user constraint 2 |
| Resolve the `.plan-room-N` coupling **in one commit**: if the floor-plan visual goes, remove the template-literal `className` (`app/page.tsx:44`) and **every `.plan-room-[1-4]` selector** together — there are **five**, not four: `globals.css:316, 323, 329, 335` **and `:894`**, the last inside the `@media (max-width: 700px)` block at `:841`, which a line range of 316–338 would strand and which the className→rule direction cannot flag. Verify with `grep -c 'plan-room-' app/globals.css` returning 0, and update the class-contract special case in the same commit. If the visual stays, keep both. All four destination URLs remain reachable either way. | `app/page.tsx`, `app/globals.css`, `tests/class-contract.test.ts` | repo coupling (silent failure mode) |
| Resolve the three Phase 0 mismatches and remove them from `KNOWN_UNRESOLVED`. | `app/globals.css`, `app/page.tsx` | Phase 0 |
| Preserve `IntentRouter` behaviour exactly while restyling. | `components/IntentRouter.tsx` | user constraint 2 |
| Extrapolate the **mobile home** (no approved artboard — `4a`'s phone is the WYS landing) from `4a`'s phone plus the desktop block order. Note the alignment change the artboards make explicit: desktop hero is left-aligned, mobile hero is centred. Flag as unapproved. | `app/page.tsx` | artboard audit |
| Ship the hero demo's committed state exactly as designed even though no screenshot shows it: ink judgment card with its mono line, distribution card with its caption, two-button actions row — all through the render policy. | `app/page.tsx`, `components/ui/*` | mockup 4a |
| **Verify by diffing rendered text, not by eye — and by a mechanism that exists.** There is no jsdom, no `react-dom/server` test setup, and Q15's default forbids adding a harness, so "diff the rendered text" needs a stated method. **Use the artifacts the build already produces:** run `PORT=3999 npm run build` on `main` and on the branch, then diff the prerendered HTML in `.next/server/app/*.html` with tags stripped (`sed -e 's/<[^>]*>//g'` or equivalent) for `/studio` (productUrl, four-article grid), `/neon` (callout + **both** grids), `/system` (live `routeNodes.length`), `/contact`, and the seven legal-footer pages. Zero dependencies, genuinely mechanical, and it catches a dropped sentence that no class-contract test can see. Record the diffs in `docs/facelift-qa.md`. | preserved pages; `docs/facelift-qa.md` | user constraints 2 and 3 |

**Exit:** `/` renders the `4a` composition **and** every element of the previous home page at its existing URL · all 8 route-resolver assertions green with `lib/route-graph.ts` and `lib/route-resolver.ts` byte-identical · preserved pages render in the new identity with byte-identical copy and links · zero removed files.

---

### Phase 11 — Legal and disclosure refresh

**Goal:** the six pages describe the enlarged surface exactly, from claims defined once, against frozen code.

| Task | Files | Source |
|---|---|---|
| `content/claims.ts` — every privacy claim once, `short`/`full` (§8b.1). | `content/claims.ts` | packet: one-definition |
| Refresh all six pages in place per the §8b.2 table. | `app/{privacy,cookies,ai-disclosure,terms,copyright,accessibility}/page.tsx` | user constraint 5 |
| Forbidden-claims audit across every surface (§8b.3). | all pages + content | WYS §18, §32 |
| Update `docs/legal-analytics.md` to describe the added WYS event source. | `docs/legal-analytics.md` | user constraint 5 |
| Line-by-line pass; produce the copy diff for Ben. | `docs/facelift-copy-diff.md` | WYS §33 step 35; §37 |

**Exit:** every claim traces to one definition and one line of shipped code · all six keep their URLs and metadata titles · zero forbidden claims · Ben has a written diff of every final-copy change.

---

### Phase 12 — Hardening, audit, Captain's Round

**Goal:** prove the acceptance criteria rather than assert them, and hand Ben a stamp decision rather than a code review.

| Task | Files | Source |
|---|---|---|
| Run the §29.2 integration flows (§11 of this plan); automate what `node:test` reaches, report the browser-level flows as manually verified pending Q15. | `docs/facelift-qa.md` | WYS §29.2 |
| Mobile QA at 390, ~402 (iPhone 17-class), a small Android width, and desktop: no horizontal scrolling, scenario choices readable, Data page readable, media usable, navigation compact, no modal traps, provenance visible without opening a modal. | `docs/facelift-qa.md` | WYS §29.3 |
| Accessibility pass (§10 checklist). | fixes as found | WYS §27 |
| Side-by-side fidelity check against the five PNGs at 1280 and 390 (§4.9). | `docs/facelift-qa.md` | handoff README |
| Performance: no AI/chat/Studio/auth SDK in the client bundle; media lazy-loaded; runtime deps still exactly three; First Load JS against the measured baseline; every route is `○` or `●`, zero `ƒ` (§5.3). | `docs/facelift-baseline.md` | WYS §28; packet: performance |
| Green the gates: `npm test`, `PORT=3999 npm run build`, and a commit passing `.githooks/pre-commit`. | — | WYS §37 |
| The §38 17-item implementation report. | `docs/facelift-implementation-report.md` | WYS §38 |
| The §39 17-question Captain's Round, answered in writing; fix every "yes" or report it as an unresolved conflict. | `docs/facelift-captains-round.md` | WYS §39 |
| First real Ship's Log entries at "approval pending", plus the unapproved-extrapolation list. | `content/ship/ships-log.ts`, `docs/facelift-unapproved.md` | packet: Ship's Log, Captain's Round |
| **Produce a preview Ben can actually look at.** The plan ends at "nothing merged to `main`" and hands Ben ~30 items requiring visual judgment — the unapproved extrapolations, the NEW mobile chrome, the Crew Manifest visual, the amended Final copy — but Vercel builds production from `main` and `vercel.json` is `{"framework":"nextjs"}` with no branch config, so as written there is **no path from the branch to Ben's eyes**. Push `bct-facelift-assimilation` to `origin` to produce a Vercel preview deployment and put its URL at the head of `docs/facelift-unapproved.md`, with a deep link beside each screen awaiting a stamp. **Check the GA scoping before pushing:** a preview deployment inherits `NEXT_PUBLIC_GA_MEASUREMENT_ID` unless it is scoped per-environment, which would send preview traffic into the production stream that user constraint 4 pins. If it is not already scoped, either scope it to Production only or leave it unset for Preview — and record which, since it changes what the preview build does. | `docs/facelift-unapproved.md`; Vercel project settings | user constraints 4; §13 |

**Exit:** every §37 box recorded pass / fail / narrowed-with-reason **with evidence** · report and Captain's Round written · every deviation listed as unapproved · nothing merged to `main`.

---

## 10. Acceptance criteria (WYS §37 — 45 checkboxes, 8 groups)

Record each as pass / fail / narrowed-with-reason, **with evidence**, not just a tick.

**Runtime boundary**
- [ ] A new learner can complete the core without any AI call.
- [ ] No account is required.
- [ ] No personal free text is required.
- [ ] No upload is required.
- [ ] No microphone is required.
- [ ] There is no visible chat interface.

**Curriculum**
- [ ] WATCH → TRY → JUDGE → CARRY is implemented.
- [ ] Learner commits before explanation.
- [ ] Fictional-first practice is implemented.
- [ ] At least one over-withholding case is supported by the scenario model. *(§25 — content authored in Phase 6.)*
- [ ] Mixed-media fictional artifact support exists in the model. *(§24's twelve containers, carried on the widened `WysFictionalArtifact.type` union — not a second field.)*
- [ ] Replay as authored works.
- [ ] CARRY can be completed without reporting personal content.
- [ ] From Memory can be done without transmitting text.

**Provenance**
- [ ] Ben source vs fictional practice is visibly distinct.
- [ ] Draft content cannot silently become Ben-authored.
- [ ] Content objects carry **source IDs** / status / origin — every object with a `sourceIds` / `principleIds` / `primarySourceId` field has non-empty, **resolvable** references, or an explicit recorded reason for being empty while Ben's recordings are unselected. *(`tests/wys-content.test.ts`.)*
- [ ] Production rendering has an explicit status policy. *(§6.2, two-axis.)*

**State**
- [ ] Progress is local-first.
- [ ] Restart and clear data are different actions.
- [ ] Learner can inspect local WYS data.
- [ ] Learner can clear local WYS data.
- [ ] Rulebook content never goes to analytics.

**Telemetry**
- [ ] Telemetry has one audited adapter.
- [ ] Events / properties are allowlisted.
- [ ] Analytics can be disabled without breaking the course.
- [ ] No free text goes to analytics.
- [ ] No localStorage blob is forwarded. *(Has its own named test — §9 Phase 3.)*
- [ ] Scenario answers do not go to GA4.
- [ ] If aggregate answer telemetry exists, it persists counts rather than event rows. *(N/A in v0 — not built.)*
- [ ] Data Manifest accurately describes what is actually deployed.

**Appetite**
- [ ] "I want deeper practice" exists as a neutral signal after real deterministic value is experienced.
- [ ] It does not require email.
- [ ] It does not open chat.
- [ ] It is not visually rewarded.

**UX**
- [ ] 390 px layout works.
- [ ] Keyboard navigation works.
- [ ] Contrast / focus are acceptable.
- [ ] No streaks / guilt / companion cues.
- [ ] No AI depth gamification.

**Engineering**
- [ ] Tests pass.
- [ ] Lint passes. *(Cannot be honestly checked today — see Q14. Either add an eslint flat config as new scope, or record this box as "not applicable, lint non-functional in repo".)*
- [ ] Production build passes, and **every route is `○ (Static)` or `●  (SSG)` with zero `ƒ (Dynamic)`**, measured against the Phase 0 marker list (which includes `llms.txt`, `state.json` and any dev-only route).
- [ ] No unnecessary new vendor / dependency was introduced.
- [ ] No privacy claim exceeds implemented fact.

**Scope (WYS §2.2) — the spec's own scope contract, checked explicitly**
- [ ] Every item on §2.2's **Build now** list is built, narrowed with a recorded reason, or deferred with a reason in §14 — including "Data Manifest" and "See what Watch Your Step knows about you", both of which are Build-now.
- [ ] **Nothing on §2.2's 18-item "Do not build into v0 runtime" list is present in the runtime**: required AI · embedded open-ended chatbot · Studio integration · **server-side learner profiles** · login/account system · **cloud sync** · voice upload · personal-situation intake · AI-generated replay · AI-generated Coach feedback · **pseudonym continuity** · **relationship maps** · **persistent free-text history** · streaks · **gamified lock grids** · companion framing · **AI "readiness" diagnosis** · **automatic personalization from inferred traits**. Six of these (bolded) are covered by neither §28's SDK bans nor §13's no-streak list, which is why the list is reproduced in full rather than cited.
- [ ] Where any of those concepts exists as a **code schema or feature flag** (the §22 Coach schema is the only instance), it is **disabled and invisible** in v0 — no runtime call, no component import, no on-screen hint, no flag that could enable it. Note the deliberate contrast with Q20's two flags, which default **on** because they gate shipped, approved, visible features.

Additional gates from the user's constraints, verified alongside:
- [ ] `scripts/check-no-deletions.sh` exits 0 — `git diff --name-only --diff-filter=D main...HEAD` and `--diff-filter=R` both print nothing. **Not** `git diff --stat`, which cannot detect a deletion.
- [ ] Every pre-facelift route, redirect and outbound href still resolves (`tests/preserved-surfaces.test.ts`).
- [ ] The GA4 measurement ID, stream, consent defaults and `ad_*` denials are unchanged (`tests/analytics-frozen.test.ts` — a named, executed file, not an eyeball check).
- [ ] All six legal pages keep their URLs and metadata titles.
- [ ] No governance string is hardcoded outside `lib/approval-state.ts` (`tests/governance-strings.test.ts`).

---

## 11. Test plan (WYS §29)

### 11.1 Unit tests (§29.1) — flat files in `tests/`, zero new dependencies

| Test | File |
|---|---|
| local state parse / migrate | `tests/wys-local-state.test.ts` |
| restart behaviour | same |
| clean local reset | same |
| undeclared key dropped; scratch never persisted; `rulebook[].text` round-trips | same |
| storage-throws path returns a valid empty state | same |
| content status gating (two-axis: blocked / marked / canon) | `tests/content-status.test.ts` |
| content provenance validation | same |
| no draft Ben content renders as canon in a production build | same |
| scenario completion semantics (commit counts; scroll and dwell do not) | `tests/wys-completion.test.ts` |
| telemetry event allowlist | `tests/wys-telemetry.test.ts` |
| telemetry property allowlist | same |
| analytics-disabled path | same |
| consent-denied and consent-throws paths | same |
| a whole `WysLocalStateV1` / rulebook array passed as a property is rejected | same |
| free-text canary `DO_NOT_SEND_WYS_TEST_9f31` rejected by the adapter | same |
| aggregate-event validation; disabled adapter makes no network call | same |
| duplicate canonical prose; unresolved component refs; more than one current canonical node; missing source metadata; invalid current/historical states | `tests/canonical-text.test.ts` |
| no raw curriculum prose in components (≥12-word literal not imported from `content/`) | same |
| scenario/variant invariant equality; `judgmentMapping` covers every parent choice key | `tests/wys-content.test.ts` |
| every content object carries status and origin | same |
| every `sourceIds` / `principleIds` / `primarySourceId` reference is non-empty and resolves, or carries a recorded empty-reason | same |
| every Ship's Log order tag resolves to a real Standing Order | `tests/canonical-text.test.ts` |
| `approvalState.keel.sha256` is `null` with no hash rendered anywhere, or matches the recorded expected value (stale-governance-hash check) | same |
| no governance string literal outside `lib/approval-state.ts` | `tests/governance-strings.test.ts` |
| no learner value in a route segment, query param or page title | `tests/no-private-state-in-urls.test.ts` |
| every `className` string literal resolves to a `globals.css` rule (with the two dynamic special cases) | `tests/class-contract.test.ts` |
| every `styles.<key>` member access resolves to a class in the sibling `.module.css` | same |
| every `globals.css` class selector is referenced by some `className` (orphan-rule scan) | same |
| the GA4 measurement gate, consent defaults, `ad_*` denials and consent-button labels are byte-present | `tests/analytics-frozen.test.ts` |
| nothing is pushed to `dataLayer` before `ga4-init`'s config marker; the buffer drains in order after it | `tests/wys-telemetry.test.ts` |
| the Data page aggregate sentence cannot render while `sendAggregate()` is disabled | same |
| every declared top-level `WysLocalStateV1` field maps to exactly one Data page row, and back | `tests/wys-local-state.test.ts` |
| an out-of-domain value under a declared key is dropped by the serializer | same |
| the cadence fallback resolves for all four cadences against a week declaring only `days2`/`days5` | same |
| every preserved route, redirect and outbound href present | `tests/preserved-surfaces.test.ts` |
| the 8 existing route-resolver assertions | `tests/route-resolver.test.ts` — **untouched** |

### 11.2 Integration tests (§29.2)

Six flows. The pure-module halves are automated above with zero new dependencies; the browser-level halves are **manual and reported as such** pending Q15 (§29.2 mandates them; §37 forbids unnecessary new dependencies — a genuine tension in this repo, reported rather than resolved silently).

1. **Zero-network curriculum** — with analytics disabled: complete onboarding, complete at least one full WATCH → TRY → JUDGE → CARRY session, inspect progress, replay, use the From Memory scratch, clear local state. *"No API call should be required for curriculum completion except fetching static site/media assets."*
2. **No free-text leak** — type `DO_NOT_SEND_WYS_TEST_9f31` into the scratch box; assert no analytics call contains it, no API request contains it, and no `localStorage` key contains it.
3. **Local state clear** — create progress and a rulebook entry, clear WYS data, assert all `wys:*` keys are gone, and assert the UI does not claim GA4 or hosting data was deleted.
4. **Restart vs erase** — restart the curriculum; rulebook and data preferences behave exactly as documented; clean reset erases local state.
5. **Analytics blocked** — block GA4; the course remains fully functional.
6. **Draft provenance** — a draft AI-generated content object cannot render with a Ben-authored badge.

### 11.3 Mobile QA (§29.3)

Targets: **390 px**, current standard iPhone widths (up to ~402 px, iPhone 17-class — *no separate breakpoint for 17*), a small Android equivalent, desktop. Check: no horizontal scrolling · scenario choices readable · Data page readable · videos usable · navigation compact · no modal traps.

### 11.4 Accessibility (§27)

Semantic headings · keyboard navigation · visible focus · sufficient contrast · alt text / text alternatives for fictional artifacts · no information conveyed only by colour · captions/transcripts for Ben video/audio when available · reduced-motion friendly · readable without hover · controls usable at 200 % zoom · mobile touch targets. **A text alternative for a screenshot scenario must preserve the relevant decision problem without leaking the answer.**

---

## 12. Stop conditions — halt and ask Ben

(WYS §34) — *"Do not 'solve' these with copy. Fix the architecture or narrow the feature."*

The nine spec stop conditions, plus the two this build has already hit:

- **SC-1 (HIT).** *A public privacy/approval claim cannot be made true.* The disclosure strip, required on every page footer, ends "Every published word was approved by Ben." Nothing is stamped: the footer says "Not yet stamped", Standing Orders shows a draft pill, both log entries say "approval pending", the Bridge says "stamp: not yet stamped", the hero judgment carries "draft · implementation placeholder · not Ben's words", and the README **requires** draft prose to ship. The build-now default (Phase 5) renders the first three sentences plus a truthful unstamped line; the final wording is Ben's (Q1).
- **SC-2 (HIT).** *WYS telemetry copy vs the live consent gate.* Lesson Zero step 9 and Data card 2 state flatly that coarse counts are sent, while `analytics_storage` is denied by default and the adapter is gated on `"granted"`. The build-now default is full suppression plus conditioned copy (Q7).
- **SC-3.** The existing site automatically sends form values to analytics. **Checked and clean** — `IntentRouter` is fixed-choice, stores nothing, and fires no analytics. Record the check rather than assuming it.
- **SC-4.** The analytics wrapper serializes component props or local state. Foreclosed by the adapter and its named test; halt if any future change requires it.
- **SC-5.** The proposed content system cannot distinguish draft from published. Foreclosed by Phase 1.
- **SC-6.** A build dependency requires account creation for learners. Halt.
- **SC-7.** A third-party widget would receive learner answers. Halt.
- **SC-8.** Implementing answer distributions requires adding a new invasive vendor. **Hit and resolved by narrowing:** the endpoint is not built (§8.6).
- **SC-9.** The site cannot support local-only state without server sync. Not hit.
- **SC-10.** A static media provider leaks private learner content because a feature unexpectedly accepts uploads. Halt — no upload path exists in v0.
- **SC-11.** Any moment when the only way to make a shipped sentence true is to reword it. Halt and escalate.
- **SC-12 (HIT).** *Data page card 2 asserts a first-party counter that this build deliberately does not create.* Artboard `5c` (dc.html:195) ships, unqualified: "Some fictional exercises send only scenario ID + option to a first-party counter — stored as totals, never as your history." §8.6 builds nothing that could make it true. (WYS §20) conditions the identical text on "**If enabled:**"; (WYS §37) requires "no privacy claim exceeds implemented fact". This is a textbook SC-11 instance and a *stronger* claim than the hero's example numbers, which this plan is careful about. Build-now default: the sentence renders only while `WYS_AGGREGATE_ENABLED` is true, bound to the same constant as the adapter, so copy cannot outrun code. Escalated as **Q22**.
- **SC-13 (HIT, procedural).** *A spec rule was reinterpreted against this plan's own conflict order.* §6.2's two-axis render policy overrides (WYS §7)'s literal public-rendering whitelist on the authority of the handoff README, while R3 subordinates the README to the spec. Recorded rather than resolved: the build proceeds with `RENDER_MARKED_DRAFT` defaulting to the spec's whitelist, and shipping the public course with draft scenario prose requires **Q21**.

**Scope stop conditions from (WYS §2.2).** Halt if any of the following is proposed for the v0 runtime, in any form, however small: required AI · embedded open-ended chatbot · Studio integration · **server-side learner profiles** · login/account system · **cloud sync** · voice upload · personal-situation intake · AI-generated replay · AI-generated Coach feedback · **pseudonym continuity** · **relationship maps** · **persistent free-text history** · streaks · **gamified lock grids** · companion framing · **AI "readiness" diagnosis** · **automatic personalization from inferred traits**. Six of these are covered by neither §28's SDK bans nor §13's no-streak list, which is why the full list is reproduced. Any of them may exist as a schema or flag only if it is **disabled and invisible** in v0.

Additional halt-and-ask points specific to this assimilation:

- Any change that would remove a route, a redirect, an outbound href, a metadata title, or a line of preserved copy.
- Any change to `components/GoogleAnalytics.tsx`, the GA4 measurement ID, the consent defaults, or the `ad_*` denials.
- Any proposal to create a second canonical human node for one concept.
- Any proposal to fill a Ben slot with generated text.
- Any proposal to embed, chunk or index the raw voice corpus.

---

## 13. Open questions for Ben

Each has a build-now default so nothing stalls; each default is reversible at the cost of a small diff.

| # | Question | Build-now default |
|---|---|---|
| **Q1** | The disclosure strip says "Every published word was approved by Ben" and must appear on every page footer, but nothing is stamped and draft prose is required to ship. Amend the sentence, stamp before launch, or ship no draft-origin prose at all (which removes the hero judgment card, Lesson Zero step 5 and the scenario bank)? | Render the first three sentences plus a truthful unstamped line bound to `approvalState`; escalate the wording. |
| **Q2** | Composition of `/`: the `4a` design is a complete home page; the live `/` holds the foyer, the four-door grid, `IntentRouter` and the stakeholder cards. Where do the preserved blocks sit? | Appended below the `4a` composition, restyled, on the same URL. |
| **Q3** | Home and `/watch-your-step` carry the identical H1 and demo card — two canonical nodes for one concept. Which URL owns the pitch? | `/watch-your-step` is canonical; `/` mounts the **same component bound to the same content object** as an explicit reference, not a second copy of the text. |
| **Q4** | Ship-page URLs: flat (`/bridge`, `/standing-orders`, `/ships-log`, `/crew`, `/ben`) or nested (`/author-ship/*`)? | Flat, with `/author-ship/state.json` as the documented machine mirror and no `/author-ship/current`. |
| **Q5** | Where does the Captain's Quarters "Studio / rented laboratory" tile point? `/studio` is the preserved Violin for Parents stakeholder page and cannot be relabelled. | Leave the tile unlinked with its label until you answer. |
| **Q6** | The Data page is titled "What this site knows about you" but the spec titles it "What Watch Your Step knows about you", and four different link labels exist across four surfaces. Pin one page title and one link label. | Keep the sitewide title **and** render `bct_analytics_consent` in card 1 so it is honest; pin "See what this site knows about you" as the link label. |
| **Q7** | Should WYS events fire for a visitor who declined analytics? | Full suppression unless `bct_analytics_consent === "granted"`, with the copy conditioned to match. |
| **Q8** | The brand wordmark is "BenChanTech" in code and metadata, "Ben Chan Tech" in the mockup. Which, and does the metadata title change with it? | Keep "BenChanTech" everywhere until you choose; changing it touches metadata and OG copy. |
| **Q9** | Mobile site navigation does not exist today and no artboard designs one; the root header/footer on course pages also changes every WYS screen's geometry from the artboards. Approve, or preserve the gap? | Footer carries every link on mobile; add a compact mobile header; flag both as NEW/unapproved. |
| **Q10** | "Nine short stops… one Ben recording each" does not add up — nine cells are Lesson 0 + A–H (eight lettered), Lesson Zero has no recording, Stop F is off-site with no visits. Does Lesson Zero count as a stop, and should "one Ben recording each" be reworded? | Derive the count from data; leave the copy as approved until you rule. |
| **Q11** | The 18/61/21 bars are fabricated numbers on a live marketing page. Ship them with the "Example numbers" caption, or hide the distribution card entirely until real counts exist? | Ship with the caption, bound inseparably. |
| **Q12** | Answer-distribution counters need a Postgres/Neon connection — a new vendor relationship the spec says the builder must not make alone. Counters at launch, or off? | Off; adapter disabled and documented. |
| **Q13** | May production render `ben_reviewed`, or `published` only? At launch every object is draft or at best `ben_reviewed`, so this determines what appears on day one. | `published` only, as a single config constant. |
| **Q14** | `npm run lint` is non-functional. Add an eslint flat config as new scope, or drop lint from the acceptance gates? | Drop it from the gates and say so plainly. |
| **Q15** | §29.2's browser-level tests need a harness (Playwright) that §37's "no unnecessary dependency" rule discourages. Harness, or documented manual QA? | Manual QA, reported as manual. Pure-module coverage ships regardless. |
| **Q16** | The spec's own §3.1 hero copy ("WATCH YOUR STEP / Start with distrust. Then learn AI." plus three bullets) appears in no approved artboard — it survives only as the Lesson 0 stop title. Restore it somewhere, or retire it? | Ship the approved `4a` hero; leave §3.1 unrendered and flagged. |
| **Q17** | Today's Commit is teal in `5b`; every other primary pill in the set is ink. Standardise on ink? | Ink. Reported as a deviation from `5b`. |
| **Q18** | `5a`'s selection rows have no base border and grow 4 px on select. Normalise to `4a`'s non-reflowing pattern? | Normalised. The 2 px visual delta is reported. |
| **Q19** | May draft AI prose sit inside a premium ink card headed "BEN'S JUDGMENT · slot awaiting Ben", next to a grey striped Ben slot? §23 says AI material must not look more polished than human source material. | Ship as designed with the mono draft line on both breakpoints; escalate. |
| **Q20** | Two §35 decisions the artboards pre-answer: persisting local judgments (Progress renders "C → B · revised") and shipping the learner rulebook in v0. Confirm both explicitly. | Both built behind config flags, defaulting **on** to match the artboards, flippable without touching components. |
| **Q21** | **May production render any `draft`-status object at all — even non-Ben-origin material — when it is accompanied by its provenance label?** (WYS §7)'s public rendering rule is a positive whitelist ("`published`; optionally `ben_reviewed`"); (handoff README bucket 3) requires every fictional scenario, choice label, revealed judgment body, the 18/61/21 split and stop titles A–H to ship at `draft`; **R3 says the spec beats the README**, and (WYS §33 step 25) agrees with the spec. §6.2's two-axis reading is a reinterpretation, not a settled fact, and it decides what a visitor sees on day one. | `RENDER_MARKED_DRAFT` ships **`false`** — the spec's whitelist — with all README bucket-3 content built, labelled and visible only in the draft preview tooling until you rule. One-line flip, no component change. |
| **Q22** | Data page card 2 states that fictional exercises send scenario ID + option to a first-party counter. That counter is not built (Q12), so the sentence is false at launch. Condition it on the flag, cut it, or build the counter? | Render it **only when `WYS_AGGREGATE_ENABLED` is true**, per (WYS §20)'s own "If enabled:" framing. The sentence is absent from the DOM until the counter exists. |
| **Q23** | Two approved colour pairs miss WCAG AA for normal text: `--accent` on `--tint-teal` measures **4.45:1** (hero badge, the "See what this site knows about you" pill, every teal status badge), and white on the disabled Commit fill measures **1.69:1**. `/accessibility` publishes a contrast claim. Darken the accent for text-on-tint, raise those labels to ≥18.66 px semibold, or accept a documented AA miss? | A second token `--accent-text-on-tint` ≈ `#1A6B7B` for text; `#1F7A8C` stays for fills, bars and the focus ring. Reported as a deviation from the approved artboards. |
| **Q24** | (WYS §12)'s 5-day path ends "Day 5: delayed retrieval or transfer + CARRY", but the transfer-check **UI** is deferred, so a 5-day learner's Day 5 has nothing to render. Ship Day 5 as CARRY-only, or build a minimal delayed-retrieval surface? | Day 5 ships CARRY-only, recorded as a narrowing in §14. |
| **Q25** | The Bridge intro ships "Always current; every earlier state lives in the Log", but Snapshots are deferred and no mechanism records a Bridge state change as a log entry. Add the supersession machinery, or amend the sentence? | Add the machinery (superseded Bridge positions become `historical` objects with `supersededBy`, rendered in the Log), so the claim is true in architecture rather than in copy. |

### 13.2 The (WYS §35) register — all thirteen open Ben content decisions

(WYS §35) — **"Do not manufacture answers to these"** — lists thirteen. This plan previously surfaced two (Q20) plus the source-period count (Q10). All thirteen are recorded here with their current state, so none is answered by accident, and several are answered by the artboards this build is about to ship verbatim — which Ben needs to know.

(WYS §35) also carries a requirement the plan must honour architecturally: **"The code should make these content/config changes cheap."** Encode it as a constraint with an acceptance check: **every item below must be a data or config edit, never a component edit.** If changing one of these thirteen would require touching a `.tsx`, that is a design defect, not a content task.

| # | §35 decision | State | Where it lives / one-line diff |
|---|---|---|---|
| 1 | exact admission wording | **Pre-answered by artboard `5a` step 2** ("Where are you with AI right now?" + "No wrong answer, nothing to justify…"). R1 ships it verbatim. **Confirm.** | `content/watch-your-step/config.ts` |
| 2 | exact posture options | **Pre-answered by artboard `5a` step 2** — the four options ("I've never really used it" / "I've tried it and stopped" / "I use it but I don't trust it" / "I use it a lot and want better judgment"). R1 ships them. **Confirm** — this is the same treatment Q20 gets. | `content/watch-your-step/config.ts` posture array |
| 3 | exact final hero if Ben later revises it | Open. `4a`'s hero ships; §3.1's spec hero is unrendered and flagged (Q16). | `content/claims.ts` / `content/watch-your-step/copy.ts` |
| 4 | actual 8–12 Ben human sources | Open — labelled empty slots (§13.1). | `content/watch-your-step/sources.ts` |
| 5 | exact source-period count | Open — **Q10**. Derived from `weeks.length`, never typed (§6.9). | `content/watch-your-step/weeks.ts` |
| 6 | which Ben statements are canonical at launch | Open — and it is one of the Bridge's own OPEN QUESTIONS rows. Interacts with **Q13** and **Q21**. | `content/watch-your-step/principles.ts` `status` fields |
| 7 | exact Detox timing | Open — Phase 7 flags the Stop F completion rule as authored, not specified. | `content/watch-your-step/{weeks,rituals}.ts` |
| 8 | exact From Memory cadence | Open. | `content/watch-your-step/rituals.ts` |
| 9 | which fictional scenario bank launches first | **Partly pre-answered by the artboards** — the client-meeting scenario (`4a`) and the leaking-pipe scenario (`5a` step 5) ship as the first two. **Confirm**, same as Q20. | `content/watch-your-step/scenarios.ts` order |
| 10 | whether learner local judgments should persist | **Q20** — default on, matching Progress's "C → B · revised". | config flag |
| 11 | whether the local rulebook should appear in v0 | **Q20** — default on, matching Progress and the Data page. | config flag |
| 12 | exact evidence threshold for efficacy claims | Open — no efficacy claim ships, so nothing is blocked. | `content/ship/bridge.ts` open question |
| 13 | exact signal threshold justifying a Studio experiment | Open — it is a Bridge OPEN QUESTIONS row and the `4a` EXPERIMENT UNDERWAY card. | `content/ship/bridge.ts` |

### 13.1 Content slots awaiting Ben

Every one renders as a labelled empty slot; none blocks the build.

- The Today WATCH video ("Ben source · video · 6:40" / "slot: Ben-selected recording").
- Both "Hear Ben, 60 seconds" audio pills ("Ben source · slot awaiting selection").
- Three portraits: desktop 300×340, mobile 72 px disc, Captain's Quarters 300 px hero.
- The Bridge position statement ("BEN'S POSITION · SLOT").
- Captain's Quarters "Selected history".
- The judgment header slot ("BEN'S JUDGMENT · slot awaiting Ben").
- The Stop H exit copy.
- The 8–12 recordings anchoring the stops, with `approvedExcerpts` start/end seconds.
- Fictional artifacts for Source Period C (Hidden Exposure) — these require image production, not text; Period C renders "not yet available" until they exist.
- The actual Crew Manifest inventory.

Per Ben's own rules (packet: corpus): the **recording** is the primary source, not the transcript; each audio slot ships with an approved transcript carrying the same approval status; every clip is reviewed by Ben before display; any clone-voice audio must carry a visible disclosure and may occupy only non-load-bearing scaffolding slots, never a canonical-position slot.

---

## 14. Explicitly deferred / out of scope

Reported as **scheduled, not forgotten**, in `docs/facelift-deferred.md`.

| Item | Reason |
|---|---|
| AI Coach runtime, Studio integration, generated replay, personal-input path | (WYS §33 Phase 6) — "later, only after evidence". Schema-only Coach preserved per §22. |
| The first-party aggregate endpoint | (WYS §19.2, §30) — no persistence layer exists. Adapter shipped disabled and documented. |
| Transfer-check UI | Data model and event wired; no artboard draws it and Progress omits it. |
| Snapshots, the christening / Snapshot 0 | (packet: §22 deferral list). The keel is not frozen and no hash exists, so Snapshot 0 cannot be cited yet. |
| The Mess | (packet: §22) — recreational surface, explicitly lower authority; no artboard. |
| `/faq` and its five named children; `/explain/<component>` | **Scope decision, not a packet deferral.** The packet's §22 defers a *"huge FAQ UI"*, not the FAQ — build steps 26 and 27 ("Build compact FAQ surface", "Build canonical FAQ/explanation pages") sit **inside** the v1 order. They are deferred here because they are outside the approved artboards and the WYS spec, and because the five slugs (`does-this-site-use-ai-on-me`, `what-does-this-site-store`, `how-do-i-clear-local-storage`, `can-i-learn-ai-without-using-ai`, `why-do-you-use-analytics`) overlap the refreshed legal pages and the Data page. Consequence to state plainly: `llms.txt` will map a thinner set of surfaces than the packet's model assumes. **Ben should confirm.** |
| `/llms-full.txt` | The packet itself hedges ("Potentially expose"). |
| Full MCP server; interactive Author Ship maps; large volumes of AI imagery; comments; accounts; cloud-synced learner profiles; embedded chatbot; complicated personalization; Higgsfield-heavy visual content; automated voice imitation; exhaustive Studio archive conversion | (packet: §22) — "Build the authoritative state system first. Everything else can attach to it." |
| Freezing YY Method v2.3 and publishing its SHA-256 | Requires action on yymethod.com, a property this repo does not control, and (packet: hashing) requires publication **before** citation. The Bridge already renders it as pending. |
| The packet's **repeated page grammar** — `claim → source → explanation → boundary → what changed → related record` (packet §19 Structural DNA), and its build step 12 ("typography, spacing, **source blocks**, **diagrams**, **expandable depth**, **stamp**") | **Named deferral, not an omission.** §4.8's twenty-primitive inventory contains no source block, no "what changed" block, no expandable-depth layer, no diagram/chart/timeline primitive and no Captain's Stamp component, because **the approved artboards draw none of them** — so building them would be entirely unapproved invention on a facelift whose fidelity target is "recreate pixel-close". The `CaptainsStamp` **type** ships in Phase 1 (§6.6) so the data exists the moment Ben stamps; its rendered form does not. Silently omitting a packet hard-structure requirement is the one thing this section exists to prevent, so it is recorded here with the reason. Ben should confirm. |
| The packet's **visual identity layer** — one canonical Author Ship illustration that evolves slowly; subtle violin DNA (arching, bridge-like geometry, purfling-like edges, string-line motifs); the shift to diagrams/charts/timelines/source cards/pull quotes after a single AI-assisted hero (packet §12, build steps 35–37) | **Deferred.** The approved artboards contain **no imagery whatsoever** — every media surface in the set is a 135° stripe placeholder — and packet build step 34 puts the visual language behind the keel freeze, which has not happened. So this build ships with **zero new identity assets**: `public/` gains no files, and `brand-mark.png` in the header remains the only image on the site. State that plainly rather than letting "we quoted the prohibition list" stand in for having addressed §12. |
| JSON-LD / structured data | (packet §15) names structured data as a machine-readability foundation. **Explicitly deferred** rather than left unmentioned: `metadata.alternates.canonical` (§5.2) plus `sitemap`, `robots` and `llms.txt` carry the canonical-status signal for v0. Revisit once the ship objects are stamped and stable. |
| `/watch-your-step/about` | (WYS §5.1) optional. No artboard, no content, and nothing on it the landing does not already carry. |
| `/watch-your-step/sources` | (WYS §5.1) optional. **Recommended for v1 and flagged for Ben:** it is the natural single canonical node for the ten labelled Ben source slots, their `approvedExcerpts` and the §27 transcripts, which v0 otherwise duplicates across Today, Practice and Captain's Quarters — the Standing Order 07 problem this build is otherwise careful about. Deferred only because no artboard draws it and no Ben recording exists to put on it yet. |
| Day 5 of the 5-day cadence path as a **delayed-retrieval / transfer** surface | Consequence of deferring the transfer-check UI (Phase 7). (WYS §12)'s 5-day path ends "delayed retrieval or transfer + CARRY"; v0 ships Day 5 as **CARRY-only**. Recorded here so a deferred feature does not silently delete a shipped path's last day. **Q24.** |
| Dark mode | Not in the repo and not in any approved artboard. Do not invent it by inverting tokens. |
| Adding a browser test harness | Pending Q15. |
| Adding an eslint config | Pending Q14 — new scope, not a restyle. |
| Ingesting more voice transcripts, re-transcribing, or expanding the corpus | (packet) — the corpus is frozen for the first contract; "I would not add more transcripts yet." |

---

## Appendix A — Strings that must survive verbatim

**Scope note.** (handoff README:18) names the Final-copy set first as "**hero, bullets, contrast statements, disclosure strip, Data page wording, Standing Orders titles, nav labels. Ship as-is, subject to Ben's stamp.**" The first four categories were previously absent from this appendix, so a builder working from it had no verbatim record of the hero, the anti-feature pills, the nav labels or the Data page cards — and §8b.4's copy diff had nothing to check them against. They are added below, each tagged with its artboard line so the diff can be run mechanically. Where a mockup shortens a spec string, the mockup text is the `short` variant and the spec text is the `full` variant (§8b.3); both are recorded.

**Hero — one `CanonicalText`, two variants selected by breakpoint (§6.8), not two records.**
- Eyebrow, desktop (dc.html:327) / mobile (dc.html:452): *"Free · No account · No AI required"*
- H1, both breakpoints identical (dc.html:328, :453): *"The AI course that never asks you to trust AI."*
- Sub, `full` / desktop (dc.html:329): *"Watch Your Step teaches one skill first: knowing what an AI actually needs to know before you tell it anything. Taught by a person. Practiced on fiction. Finished in weeks, not forever."*
- Sub, `short` / mobile (dc.html:454): *"Learn what an AI actually needs to know before you tell it anything. Taught by a person. Practiced on fiction. It ends."*
- Primary CTA (dc.html:330): *"Start Lesson Zero · 5 min"* · secondary (dc.html:330): *"or try one question →"* · mobile prompt (dc.html:455): *"Try one question ↓"*

**Anti-feature ("contrast statement") pills — struck through, exact labels and order.**
- Desktop, eight (dc.html:409): `A chatbot` · `An account` · `Your email` · `A streak` · `A certificate` · `A privacy score` · `Anything to unlock` · `"AI you can trust"`
- Mobile, five (dc.html:462): `Chatbot` · `Account` · `Streak` · `Certificate` · `Your email`
- Section H2 (dc.html:408): *"What you won't find here"* · closing line (dc.html:412): *"What you will find: exactly what this site stores about you →"*
- **`"AI you can trust"` is load-bearing.** §8b.3 names it a forbidden claim with exactly one sanctioned exception — this pill, struck through, on the home page. Its exact rendering (quotation marks, `text-decoration: line-through`, never as an assertion) is the thing that keeps the exception honest.

**Nav labels (dc.html:322) and CTA (dc.html:323).** `Watch Your Step` · `Bridge` · `Standing Orders` · `Ship's Log` · `Crew` · `Ben`, plus the teal pill `Start Lesson Zero`. Brand wordmark `Ben Chan Tech` (Q8). The governance chip row (dc.html:420) reads `Standing Orders` · `Bridge` · `Log` · `Crew` — **"Log" is pinned to "Ship's Log"** per §6.8 collision 5, which is a recorded copy amendment.

**Demo card chrome (mockup 4a).** Badge (dc.html:333): *"Try one · fictional · nothing about you"* · meta (dc.html:333): *"Lesson Zero, question 1"* · mobile badge (dc.html:457): *"Fictional · nothing about you"* · commit pill (dc.html:340): *"Commit — then see Ben's take"* · commit note (dc.html:341): *"You commit before you see anything. That's the whole method."* · distribution header (dc.html:351): *"How others answered"* / *"totals only · no one is tracked"* · continue pill (dc.html:359, :458): *"Keep going — Lesson Zero"* · reset (dc.html:359): *"Reset"*.

**Watch / Try / Judge / Carry card bodies (mockup 4a, dc.html:400-403).**
- WATCH: *"One Ben recording, whole, before any explanation."*
- TRY: *"One fictional move: crop, trim, generalize — or don't send at all."*
- JUDGE: *"Commit first. Then Ben's call, and where reasonable people differ."*
- CARRY: *"One small thing to do off-site. Nothing to report."*
- Section eyebrow (dc.html:397): *"Every visit, the same four moves"* · H2 (dc.html:398): *"Watch. Try. Judge. Carry."* · body (dc.html:399): *"Ten minutes, give or take. Then the course tells you to leave and go practice on your real life — without reporting back."*

**Path section (mockup 4a).** Eyebrow (dc.html:380): *"The whole path"* · H2 (dc.html:381): *"Nine short stops. Then it's over."* — **count rendered from `weeks.length` as a spelled-out word** (§6.9) · body (dc.html:382): *"Each stop is one Ben recording and a few fictional decisions, at your own pace — 2 to 5 short visits. More time adds depth; it never speeds you through Ben."*

**"How the site is run" block (mockup 4a).** Eyebrow (dc.html:417): *"How the site is run"* · headline (dc.html:418): *"AI can crew the ship. It can't sign the logbook."* · body (dc.html:419): *"Ben is the captain; AI tools draft, code and research as named crew. The rules, his current position, and every change are public: Standing Orders, Bridge, Ship's Log, Crew Manifest."*

**Instructor band (mockup 4a).** Eyebrow (dc.html:368): *"Taught by one person, on the record"* · H2 (dc.html:369): *"Ben Chan. Violinist, CTO, and someone who wanted a course he'd give his own kids at 13."* · body (dc.html:370): *"Every lesson starts with a recording Ben made — unscripted, dated, kept whole. His view comes with its sources attached, and disagreeing with him isn't marked wrong."* · link (dc.html:371): *"Who is Ben →"* · mobile variant (dc.html:459): *"Taught by Ben Chan, on the record"* / *"▶ Hear Ben, 60 seconds · Ben source"*.

**Data page, card headings and bodies (mockup 5c).**
- H1 (dc.html:180): *"What this site knows about you"* (Q6) · sub (dc.html:181): *"Three places, three different answers. Generated from what's actually stored right now."*
- Card 1 heading (dc.html:183): *"1 · THIS BROWSER"*; rows *"Onboarding"*, *"Pace · time"*, *"Stops · scenarios · carries"*, *"Rulebook"*, *"Deeper-practice interest"* — **plus the two rows (WYS §20) requires and the artboard omits: local judgments and last route (§7.5), escalated as a Final-copy amendment.**
- Card 2 heading (dc.html:194): *"2 · BEN MAY RECEIVE"*; body, **two sentences with different truth conditions** (dc.html:195): *"Page analytics, and coarse counts: someone started, finished a stop, used replay, reached a carry, asked for depth."* — conditioned on consent state (SC-2, Q7) — and *"Some fictional exercises send only scenario ID + option to a first-party counter — stored as totals, never as your history."* — **a state-bound string: renders only while `WYS_AGGREGATE_ENABLED` is true (SC-12, Q22).**
- Card 3 heading (dc.html:197): *"3 · BEN DOES NOT NEED"*; body (dc.html:198), verbatim: *"Your name. An account. Your email. Your situation. Your prompts. Your screenshots. A transcript of your learning. Your From Memory text. Your rulebook."*
- Actions (dc.html:205-207): *"Download my local data"* · *"Restart the course · keeps rulebook"* · *"Clear this browser's data"*.

**Lesson Zero data card (mockup 5a, dc.html:63-68).** *"BEFORE YOU START · DATA"* · *"**Stays here:** your pace, progress and choices — this browser only."* · *"**Sent:** coarse counts. That someone started, finished a stop, used replay."* — conditioned per SC-2 · *"**Never:** your name, email, an account, anything you type."* · *"See the full data page →"* · terminal pill *"Show my plan"* (advances to step 10, §9.1). Posture-step sub-line (dc.html:24): *"Stays in this browser. Never sent."*

**Disclosure strip (mockup 4a).** *"You're not talking to AI anywhere on this site. No chatbot, no coach, no generated answers. AI did help build the site and draft the copy — as crew, listed in the manifest. Every published word was approved by Ben."* + "Crew Manifest →" — **final sentence subject to SC-1.**

**Standing Orders 01–09 (mockup 5d).**
```
01  Human judgment stays authoritative.   [ink]   AI may execute; only Ben signs.
02  Deterministic before probabilistic.
03  Zero AI required for the learner.
04  Minimal trust — asked for, and named.
05  Provenance on every claim.
06  AI assistance is disclosed. No invisible crew.
07  One idea, one canonical definition.
08  History is preserved, never rewritten.
09  Mobile first.
```

**Core habit (WYS §3.3).** *"Before you tell AI something, ask: what does it actually need to know?"* · *"Don't paste sensitive information into AI just to ask AI to anonymize it. Anonymize it before you send it."* · *"If you are not allowed to upload it, anonymization is not permission to upload it."*

**Lesson Zero completion condition (WYS §9.3).** *"Define the task first. Then remove what the task doesn't need."*

**Over-withholding feedback (WYS §25).** *"Caution is allowed. The question is whether the missing detail changes the task."*

**External authority (WYS §26).** *"External authority outranks WYS's abstraction exercise."*

**Judgment pattern (WYS §24).** *"Inspect → narrow/extract/trim/crop → anonymize → upload only if allowed"*

**Scratch box (mockup 5c, WYS §15.1).** *"This stays in this page and is not sent anywhere. It clears when you leave."*

**Bridge slot (mockup 5d).** *"Awaiting Ben. No draft AI text is shown here, by rule."*

**Bridge state block (mockup 5d).** *"captain's round: none yet · snapshot: 0 pending / stamp: not yet stamped · governed by YY Method v2.3"*

**Distribution caption (mockup 4a, dc.html:357).** *"Example numbers — live totals appear once the first-party counter is on."* — inseparable from the numerals (§6.5), and **rendered on both breakpoints** including mobile, which omits it (§6.3 override 2). Replaced, never removed, when a real counter exists.

**Data page clearing footnote (mockup 5c).** *"Clearing removes this browser's copy. It can't erase hosting or analytics logs — and this page won't pretend it did."* — **amended in Phase 8 to name the surviving consent key; escalate.**

**Infrastructure paragraph — one record, two variants (§8b.3).**
- `short`, rendered on the Data page — **mockup 5c (dc.html:203), NOT §18**: *"Watch Your Step still runs on a website. Hosting, security and limited analytics may receive ordinary technical information. Not zero trust — the minimum trust required, and named."*
- `full`, rendered on `/privacy` and `/cookies` — **(WYS §18) verbatim**: *"Watch Your Step still runs on a website. Hosting, security, and limited analytics services may receive ordinary technical information needed to deliver or understand use of the site. The point is not 'zero trust.' The point is to ask for the minimum trust required and disclose it."*

The earlier version of this entry cited the mockup's shortened text as "§18 verbatim", which would have shipped the wrong string on either page.

**Plan intro (mockup 5b).** *"Nine stops, one Ben recording each. It ends. Missing days changes nothing."* — count rendered from data; wording subject to Q10.

**Progress subhead (mockup 5b).** *"What you've actually done. No score, no streak, no percentage."*

**Judge note (mockup 5b).** *"Disagreeing with Ben is fine. Agreement isn't the score."*

**Appetite note (mockup 5c).** *"One anonymous count. No email. Nothing unlocks."*

**Ship's Log h1 (mockup 5d).** *"I may change my mind. I won't rewrite the record."*

**Captain's Quarters intro (mockup 5d).** *"Public by deliberate selection, not by extraction — AI organizes this page; it doesn't decide what's on it."*

**Storage key.** `wys:v1` — on-screen as `key: wys:v1 · raw JSON ↓`.

**Free-text canary (WYS §29.2).** `DO_NOT_SEND_WYS_TEST_9f31`

**Agent bootstrap (packet).** *"Read the current Author Ship state. Read the Standing Orders. Read the most recent Ship's Log entries relevant to this task. Do not reconstruct superseded decisions from older material when a newer captain-approved state exists."*

**Voice corpus SHA-256.** `6011511431dadb977d4e29902614c88c3c0faeef904a80e29921835afa08e532`

---

## Appendix B — Decision register

1. Provenance before pixels. `lib/content-status.ts`, `lib/approval-state.ts`, `lib/canonical-text.ts` are written and tested before any token or component, because a mislabelled string is the one defect this repo cannot detect later.
2. The render policy is **two-axis** (`blocked` / `marked` / `canon`), not a single boolean. A published-only boolean would empty the course, since the README requires draft prose to ship.
3. `ContentOrigin` gains `IMPLEMENTATION_PLACEHOLDER`; `WysRitual` and `WysCarry` gain `origin`.
4. Legacy CSS token names are aliased, never deleted — this is what restyles twelve routes with zero markup edits. A second, separately budgeted task handles the untokenised blueprint geometry and the ~11 hardcoded colour rules.
5. CSS Modules for new surfaces; `globals.css` keeps tokens, structural rules and the legacy class layer. No Tailwind.
6. `next/font` replaces the render-blocking `@import` — the only intentional line-level deletion.
7. Runtime dependencies stay exactly `next`, `react`, `react-dom`.
8. Telemetry emits via an arguments-shaped `dataLayer` push, not `window.gtag?.()`, and fails closed in production and on a thrown consent read.
9. The aggregate endpoint is not built; the adapter ships disabled and documented.
10. All routes stay prerendered — `○ (Static)` or `●  (SSG)`, **zero `ƒ (Dynamic)`**; the two Route Handlers carry `export const dynamic = "force-static"`; `wys:v1` is read only inside `useEffect` behind a `loaded:false` sentinel.
11. Every `localStorage` access is `try/catch` wrapped, including the existing `ConsentBanner`.
12. Ink is the single enabled-primary fill; selection never reflows.
13. One canonical string per concept with declared render variants, enforced by a duplicate-prose check and a no-raw-prose check.
14. Stop count, titles and denominators are derived from content data.
15. Light-only.
16. `/system` survives alongside a new `/bridge`; ship URLs default to the flat scheme.
17. The footer's four property links render from `content/site-config.ts`, preserving those URLs by construction.
18. Additive assimilation is verifiable: zero removed **or renamed** files, routes or links, checked at every phase gate by `scripts/check-no-deletions.sh` using `git diff --diff-filter=D/R` — never by `git diff --stat`, which cannot detect a deletion.
19. **Whether draft-status material may render publicly is Ben's, not this plan's** (Q21). The two-axis machinery is built; `RENDER_MARKED_DRAFT` ships defaulting to (WYS §7)'s literal whitelist, because R3 makes the spec beat the handoff README absent Ben's answer.
20. Two shipped sentences are **state-bound, not reworded**: the Data page's first-party-counter claim renders only while the aggregate flag is on (SC-12), and the disclosure strip's approval sentence is a variant of `approvalState.stamp` (SC-1). A false public claim is fixed in architecture (R8).
21. `next/font` loads the weights the **preserved stylesheet** needs (Mono 400/500/600/700, Sans 400/500/600 + italic), not only the weights the artboards need — otherwise the aliasing mechanism silently degrades every preserved page to faux-bold and faux-italic.
22. `--sheet` maps to `--tint-grey`, not `--white`: the identity being replaced carries its contrast in token values, so collapsing figure and ground would render 19 rules' worth of cards invisible.
23. Provenance labels are a function of `(surfaceKind, origin)`, and the four origins §23 supplies no string for get **new, Ben-stamped** strings — a provenance label is a claim, not chrome.
24. Both machine surfaces (`llms.txt`, `state.json`) ship as static files or `force-static` handlers, so the build stays 100% prerendered: `○` or `●`, zero `ƒ`.
25. The Data page is never behind onboarding. (WYS §18)'s "do not bury it" outranks a convenient redirect, and the bottom nav renders real destinations in server HTML so the site works without JS.
