# Facelift — NEW and UNAPPROVED, for Ben's stamp

Everything on this page is a **visual decision this build made that no approved
artboard settles**, or a **deliberate departure from one that does**. It is kept
separate from `docs/facelift-build-notes.md` so that "what Ben still has to look
at" is one short list rather than something to be excavated from build notes.

Nothing here is written in Ben's first person. Where a source needs Ben's words,
the build renders a labelled empty slot (plan R10).

Opened at Phase 4 (the design system). Later phases append. **Closed at the
Phase 12 gate**, with §Z below and the completeness index at the foot.

---

## THE PREVIEW — read this before looking for a URL

**There is no preview URL, and there was never going to be one.**

The plan's Phase 12 table asks for the branch to be pushed to `origin` so Vercel
produces a preview build, and for that URL to sit here at the head of this file
with a deep link beside each screen awaiting a stamp. Its reasoning is sound:
this document hands Ben roughly thirty items requiring **visual** judgment, and
Vercel builds production from `main`, so as written there is no path from this
branch to Ben's eyes.

It did not happen. The build's operating constraints for this branch are *never
push, never open a PR, nothing merges to `main`*, and a hard rule outranks a task
row (plan R6 — the user's constraints override every source, including the plan).
So the task is **recorded as unexecuted** rather than quietly dropped.

**Two things follow, and both need Ben.**

1. **Everything in this file is currently reviewable only by running the branch
   locally** (`npm run build && npx next start`) or by pushing it. Until one of
   those happens, "for Ben's stamp" is aspirational.
2. **The GA scoping question the plan attaches to the push is unanswered and
   must be answered before anyone pushes.** A Vercel preview deployment inherits
   `NEXT_PUBLIC_GA_MEASUREMENT_ID` unless it is scoped per-environment. If it is
   not scoped, **preview traffic lands in the production GA4 stream** — the
   stream user constraint 4 pins byte-for-byte. Before pushing: scope that
   variable to **Production only**, or leave it **unset for Preview**, and
   **record which**, because it changes what the preview build does. This build
   did not inspect or change the Vercel project settings.

Recorded again, with the rest of the deferrals, in `docs/facelift-deferred.md` §7.

---

## A. Whole layers that no artboard contains

### A1. The entire interaction-state layer (plan §4.6)

The approved markup contains **no** `:hover`, `:focus`, `:active`,
`transition`, error, empty or loading state. The only state variation anywhere in
the sixteen screens is the bound selection swap and the disabled Commit fill.

But `/accessibility` already publishes, live, today: "semantic HTML,
keyboard-focusable links and controls, visible focus styles, skip navigation, and
responsive layouts". So the layer has to exist — the alternative is a published
claim the site does not honour, which plan R8 forbids fixing in copy.

What was authored, and the rules it follows:

| Rule | Where it comes from |
|---|---|
| No hover-only functionality — hover never reveals content or a control | handoff README, Interactions & Behavior |
| Touch targets ≥ 44px | handoff README; declared on every interactive rule |
| ~200ms ease-out reveal, honouring `prefers-reduced-motion` | handoff README |
| **No state changes a border WIDTH**, so no hover or selection reflows a sibling | §4.7.1, and the Q18 normalisation below |
| Disabled, empty and error states drawn from the token set only | §4.6 |

**Status: NEW. Unapproved. Needs Ben's stamp.**

### A2. The primitive inventory (plan §4.8)

Twenty-six components were built in `components/ui`, `components/wys` and
`components/provenance`. Their geometry is measured off the approved artboards,
but the *decomposition* — which things are one component with variants, and which
are separate — is this build's judgment, not Ben's. Two calls worth naming:

- **`ProvenanceMono` is the only component permitted to use IBM Plex Mono.**
  Mono is the site's provenance-and-state voice; using it decoratively would stop
  a provenance line reading as one.
- **`DistributionBars` takes `caption` as a required prop with no default.** The
  18/61/21 split is fabricated illustrative data on a live marketing page (Q11),
  so there is deliberately no code path that renders the numbers without the
  sentence saying what they are.

**Status: NEW. Unapproved.**

---

## B. Deliberate departures from an approved artboard

### B1. `--accent-text-on-tint` — the contrast miss (Q23, ratified default (a))

Two approved colour pairs miss WCAG AA for normal text. `/accessibility`
publishes a contrast claim, so this could not ship silently.

Measured, at the real rendered sizes, with the WCAG 2.x relative-luminance
formula (re-measured in full at Phase 12):

| Foreground | Background | Ratio | AA normal text (4.5:1) |
|---|---|---|---|
| `--accent` `#1F7A8C` | `--tint-teal` `#EAF4F6` | **4.45:1** | **fails** |
| `--accent` `#1F7A8C` | `--tint-grey` `#F4F6F8` | 4.59:1 | passes |
| `--accent` `#1F7A8C` | `--white` | 4.98:1 | passes |
| **`--accent-text-on-tint` `#1A6B7B`** | `--tint-teal` | **5.47:1** | **passes** |
| **`--accent-text-on-tint` `#1A6B7B`** | `--tint-grey` | 5.65:1 | passes |
| **`--accent-text-on-tint` `#1A6B7B`** | `--white` | 6.12:1 | passes |
| `--ink` | `--white` | 16.46:1 | passes |
| `--body` | `--white` | 9.37:1 | passes |
| `--muted` | `--white` | 5.47:1 | passes |
| `--muted` | `--tint-teal` | 4.89:1 | passes |
| `--accent-on-dark` `#7FC8D6` | `--ink` | 8.73:1 | passes |
| `--body-on-dark` (75% white on ink) | `--ink` | 9.72:1 | passes |
| `--muted-on-dark` (55% white on ink) | `--ink` | 5.87:1 | passes |
| `--white` | `--accent` (teal fill) | 4.98:1 | passes |
| **`--white`** | `--commit-disabled` over white | **1.69:1** | **fails** |
| `--muted` | `--commit-disabled` over white | 3.23:1 | large-text only |

**What shipped:** a second token, `--accent-text-on-tint: #1A6B7B`, used for
**text on a tint only**. `--accent` `#1F7A8C` is unchanged for fills, bars, the
progress rail, the dashed Ben-slot border and the focus ring — so nothing that
carries the brand colour as a *shape* moved. The affected labels are the hero
badge ("Free · No account · No AI required"), the "See what this site knows about
you" row, and every teal status badge.

**The visible delta is a slightly deeper teal on small text.** That is a
departure from the approved artboards and needs Ben's call: (a) what shipped,
(b) raise those labels to ≥18.66px semibold so the 3:1 large-text threshold
applies, or (c) accept a documented AA miss and say so on `/accessibility`.

**One measured correction to the plan's own table:** the plan records `--accent`
on `--white` as 4.74:1; it measures **4.98:1**. Phase 0's rule is "measure, do
not assert", so the measured number is the one recorded. The finding is unchanged
— that pair passes either way.

**A second, smaller departure inside the same question:** the disabled Commit
label ships in `--muted`, not white. White on the disabled fill measures 1.69:1
and is genuinely unreadable; disabled text is exempt from AA, but shipping an
unreadable label is a worse outcome than a small colour change. `--muted` on the
same fill measures 3.23:1. The fill itself is untouched.

### B2. Commit is ink, not teal (Q17, ratified default)

Commit appears in three colours across the approved set: ink on `5a`, **teal on
`5b` Today**, and state-bound in `4a` (ink enabled, `rgba(22,32,43,.25)`
disabled). All three are approved artboards, so R1 gives no winner.

**Standardised on ink enabled / `rgba(22,32,43,.25)` disabled**, with teal
reserved for the nav CTA and continue/secondary pills. Ink matches two of the
three Commit instances and every other primary pill in the set (Continue, Show my
plan, Download my local data).

**Reported delta: the Today Commit is recoloured from teal to ink.**

### B3. Selection no longer reflows (Q18, ratified default)

`4a`'s demo swaps a 1.5px base border for 2px on select. `5a`'s posture rows and
cadence tiles have **no** base border and gain `2px solid #16202B` on select,
which shifts every row below them by 4px. Both are approved; R1 gives no winner.

Normalised on the `4a` pattern: every selectable row carries a 1.5px border in
its rest state, and selection swaps colour and adds a half-pixel inset ring
rather than widening the box. Rest and selected states still read as the
artboards draw them; only the movement disappears.

**Reported delta: a 2px visual difference on Lesson Zero's rows.**

### B4. `:focus-visible` stays at 3px / 3px

The handoff README suggests "2px `#1F7A8C` outline offset 2px" — its own word is
**suggested**, so this is a choice, not an authority conflict. The repo already
ships `outline: 3px solid; outline-offset: 3px`, and `/accessibility` already
publishes a claim measured against exactly that rule.

**Kept at 3px/3px; only the colour token changed** (`--focus` moves from the
blueprint's ochre `#a06b24` to `--accent` `#1F7A8C`). One rule, one published
claim, nothing to re-measure.

**Reported delta from the README's suggested 2px.**

---

## C. Retired: the blueprint scaffolding (plan §4.4)

Four class families and their markup were retired **together, in one change**,
along with the `tests/class-contract.test.ts` expectations that covered them.

| Family | Markup retired | Rules retired |
|---|---|---|
| `.dimension-line` | `app/page.tsx` — the "Four Stable Doors" rule-and-label bar | every selector in the family, both breakpoints |
| `.plan-foyer` | `app/page.tsx` — the graph-paper compass block ("Foyer / deterministic routing / N") | every selector in the family, both breakpoints |
| `.scale-line` / `.scale-bar` | `app/page.tsx` — the "Scale - intent to room" / "DWG. BenChanTech LLC · A-01" drafting caption | every selector in both families, both breakpoints |

**Why this does not breach the deletion contract.** All three blocks are
decorative, all three carry `aria-hidden="true"`, none carries copy a screen
reader reaches, none carries an `href`, and none appears in metadata. No route,
redirect, outbound link, in-page anchor or metadata title is affected;
`scripts/check-no-deletions.sh` exits 0 and `tests/preserved-surfaces.test.ts` is
green. It is still a **visible change to the approved-as-live home page**, which
is why it is listed here by name.

**Why markup and rules had to go together.** Deleting the rules alone would ship
stray unstyled text inside `aria-hidden` wrappers; deleting the markup alone would
strand orphan rules. "Change no markup" and "replace the blueprint identity"
cannot both hold for these three, and §4.4 resolves it in favour of retiring both.

**Verification:** `grep -c` for each of `dimension-line`, `plan-foyer`,
`scale-line`, `scale-bar` returns `0` for markup and for rules across `app/` and
`components/`. A line range would have stranded the `@media (max-width: 700px)`
members of each family, and the className→rule scan only checks one direction, so
it could not have flagged the orphans.

**Re-measured at the Phase 12 audit, and corrected.** A bare
`grep -rn 'dimension-line\|plan-foyer\|scale-line\|scale-bar' app/ components/`
now returns **2**, not 0 — both hits are `app/page.tsx:51-52`, the explanatory
comment that records this retirement. No `className`, no JSX element and no CSS
selector survives in either directory. The unqualified "returns 0" sentence above
was true when it was written and stopped being true when the comment was added, so
it is qualified rather than defended: the claim is zero markup and zero rules, not
zero occurrences of the string.

**The `.floor-plan` consequence.** With the foyer gone, the four doors no longer
sit either side of a centre column. The grid is now a 2×2 card layout in the new
register, and the original left-column / right-column reading order is preserved
by `grid-area` on `.plan-room-1` … `.plan-room-4`.

---

## D. Smaller reported deltas in the identity swap

| # | Delta | Reason |
|---|---|---|
| **D-a** | **The reading measure of every preserved page widens.** `--max` moves 1120px → 1280px, and the page gutter moves from `calc(100% - 2rem)` (16px) to the design's 56px desktop / 22px mobile. | §4.5's "one deliberate exception": the shared container rule is structural in *mechanism* but not in *value*. Intended, and part of the identity change — but every legal page's line length changes, which is worth seeing before launch. |
| **D-b** | **The caps micro-label group moves from IBM Plex Mono to IBM Plex Sans** (`.welcome-label`, `.eyebrow`, `.question-label`, `.card-eyebrow`, `.room-number`), at 12px/600 in `--accent-text-on-tint`. | §4.4 lists "the uppercase mono micro-labels" among the untokenised blueprint geometry the restyle replaces, and §4.2 sets caps labels in Sans at 12/600. Mono is now reserved for 11–12px provenance and state lines. §4.3's "load the faces, do not rewrite the legacy rules" is still honoured on the point that matters: **all four Mono weights (400/500/600/700) and the Sans italic axis still load**, so nothing renders faux-bold or faux-italic, and restoring any of those declarations needs no font change. |
| **D-c** | **`.site-footer span` (the "Ben Chan Tech LLC" line) is no longer italic.** | It was italic Spectral, a blueprint device. It is now 19px/600 Sans. `.signature-note` on the home page keeps its italic — that one reads as a signature, and it is what keeps the loaded italic axis honest. |
| **D-d** | **The inverted hover treatment is gone.** `.audience-button`, `.plan-room` and `.stakeholder-card` used to flip to `background: var(--ink); color: var(--sheet)` on hover. | The approved register has no inverted hover anywhere. They now shift fill within the palette (§A1). |
| **D-e** | **No divider rule under the header, and none above the footer.** | §4.9: "the only chrome border in the entire approved set is the mobile tab bar's top hairline." |
| **D-f** | **`main { overflow: hidden }` became `main { overflow-x: clip }`.** | §4.5 note 2. It clipped *both* axes on the element wrapping every page, which would cut the demo card's 80px shadow and its deliberate overhang. The page still cannot scroll sideways. |
| **D-g** | **Twelve legacy rule sets lost `text-transform: uppercase`, so preserved copy that used to render in ALL CAPS now renders in the case it is typed in.** The selectors are `.desktop-nav`, `.audience-button span`, `.plan-room em`, `.stepper li`, `.option-grid button`, `.text-button`, `.result-primary a`, `.secondary-results a`, `.detail-link`, `.site-footer`, `.site-footer small` and `.consent-banner button`. Every one of those selectors still exists and still has rules; only the one declaration was dropped. Visible on every preserved route — e.g. `/studio`'s CTA renders "Get help with today's violin situation" where it read "GET HELP WITH TODAY'S VIOLIN SITUATION", `/contact` renders `ben@benchantech.com` where it read `BEN@BENCHANTECH.COM`, `/neon`'s callout renders "Visit benchanviolin.com/library", and the IntentRouter's Back / Reset / Why / Why-Not / Commit labels are no longer capitalised by CSS. | §4.4 names "the uppercase mono micro-labels" among the untokenised blueprint geometry the restyle replaces, and this file's own rule is that **caps are typed in the copy, never applied with `text-transform`** — so the declaration had to go wherever the approved register does not draw caps. **No character of copy changed**: the DOM text is byte-identical on both sides of the diff, and the difference exists only in rendered letter-case (`innerText` reports it; the prerendered HTML does not). It is listed because it is a visible change to approved-as-live preserved pages, which D-a to D-f are also listed for. The caps that survive are typed: the `.welcome-label` / `.eyebrow` / `.question-label` / `.room-number` group (D-b) and the new footer group labels (G-f). |

---

## E. Still open, and deliberately not answered here

- **Q2** — where the preserved home-page blocks finally sit relative to the `4a`
  composition. Phase 4 changed no block order; Phase 10 assimilates the home page.
- **Q8** — the brand wordmark ("BenChanTech" in code and metadata, "Ben Chan
  Tech" in the mockup). Untouched: changing it touches metadata and OG copy.
- **Q5** — where the Captain's Quarters "Studio / rented laboratory" tile points.
  `GridTile` accepts no `href` so the ratified default (leave it unlinked with its
  label) is buildable; nothing is linked yet.

---

# Phase 5 — Chrome

Appended at the Phase 5 gate. Everything below is chrome: header, footer,
disclosure strip, and the three convention surfaces the repo never had.

## F. Whole surfaces no artboard draws

### F1. The compact mobile header (Q9, ratified at its default)

**No artboard designs a mobile site header.** Today `.desktop-nav` is
`display: none` below 700px with **no replacement**, so `/studio`, `/neon` and
yymethod.com are unreachable from mobile chrome at all. Shipping six new ship
surfaces on top of that gap would also break packet build step 11 ("Build mobile
navigation first… Primary ship destinations should be extremely easy to reach").

What ships: a `<details>`/`<summary>` disclosure in the header, opening a panel
carrying **every** link from both tiers — the six ship links, the Start Lesson
Zero CTA, and the three ecosystem links. No client JS, no hover-only behaviour,
no modal trap, and it still opens with JavaScript off. Touch targets ≥ 44px.

**What Ben is being asked to approve:** that a mobile header exists at all, and
that it is a plain disclosure panel rather than a full-screen sheet.

### F2. The footer as the complete mobile path to every link

Independent of F1, and deliberately so: **if the mobile header is rejected, no
link becomes unreachable.** The footer carries four groups — THE SHIP (six links
plus the CTA), DOORS (the four destinations), REVIEWERS (`/studio`, `/neon`, and
the yymethod.com root), LEGAL (the seven preserved legal links) — at both
breakpoints, collapsing to two columns below 700px rather than hiding anything.

Structural precedent is superseded turn `2f`'s stacked mobile footer (disclosure
card, then a two-column THE SHIP grid, then the doors). The visual register is
`5d`'s. **The `4a` footer draws one row of four door labels and a stamp line;
this is materially more footer than the artboard shows.**

### F3. The stacked mobile disclosure strip

The strip exists in the approved set **only** at `4a` desktop. Its flex geometry
(gap 32, two `nowrap` children, 18px body) cannot survive 390px minus 44px of
gutters, and the handoff README requires the strip on **every** page footer. It
stacks below 700px in the `5d` dark-card register (radius 22, padding 18), from
the same DOM — nothing is duplicated and nothing is hidden.

### F4. Root chrome on the course and ship screens (§5.6)

The eleven phone artboards begin straight at content: no site header, no footer,
no strip. The root header, footer and disclosure strip now render on **every**
route, so **every Watch Your Step and ship screen gains vertical chrome its
artboard does not show**. Suppressing the strip on those pages was rejected: it
would break the README requirement and the site's own transparency claim.

### F5. 404, error and global-error

`app/not-found.tsx`, `app/error.tsx` and `app/global-error.tsx` are **new
surfaces, not restyles** — the repo had none of them. No artboard exists for any
of the three. They are deliberately plain: an eyebrow, a headline, a way out,
and no explanation of the failure (a stack or message on a public page is an
information leak). `app/global-error.tsx` replaces the root layout, so it cannot
use `globals.css` or the `next/font` variables; its palette values are written
out literally and must be updated by hand if the tokens change.

### F6. Header behaviour between 700px and the artboard width

`4a` is drawn at 1280px and the mobile rules take over at 700px, so **nothing in
the approved set describes the header between those two widths**. Measured in
Chrome at 768px: the ship tier is 676px wide and the brand is 170px, which with
the 56px gutters and the 32px header gap needs about 990px — below that the
header pushed the document to 910px of scroll width at a 768px viewport.

Nothing may be hidden to fix that (both inventories ship, §3.3, R7), so below
1100px **the two tiers wrap onto additional lines and their gaps tighten**. Same
DOM, same links, same order; the header just grows taller. Found and fixed at
the Phase 5 gate.

## G. Departures from an artboard that does settle it

| # | Departure | Reason |
|---|---|---|
| **G-a** | **The header is two tiers, not one.** `4a` draws one row: six ship links and a teal CTA. The three links the live header carries today (`/studio`, `/neon`, yymethod.com) are added as a quieter second row at 14px `--muted`. | R7: where a source implies replacing an existing surface, add the new and keep the old. Nine links plus a CTA do not fit one 1280px row minus 56px gutters at 15px / gap 32. |
| **G-b** | **The wordmark stays "BenChanTech".** The artboard reads "Ben Chan Tech". | Q8, ratified at its default. Changing it touches root metadata and OG copy, so it is a metadata decision, not a chrome one. |
| **G-c** | **The disclosure strip's fourth sentence is not the approved one while nothing is stamped.** `4a` ends "Every published word was approved by Ben." The strip renders instead: "Nothing here is published as Ben's position until he stamps it." with a link to the Ship's Log. | Q1 / SC-1. Nothing is stamped, and R8 forbids fixing a false public claim in copy. The sentence is a variant selected by `approvalState.stamp`: the approved wording renders automatically the moment a stamp exists. **The replacement wording is escalated to Ben.** |
| **G-d** | **The footer's doctrine door reads "YY Method doctrine", not the `eyebrow` value "YY Method™".** | §3.3's two-distinct-labels rule. Both yymethod.com hrefs now appear in the same footer; rendering the eyebrow for both would give two links one accessible name and two destinations. The other three doors render their `eyebrow` verbatim, ™ included — itself the reported deviation from the artboard's bare "YY Method" label. |
| **G-e** | **The REVIEWERS group carries three rows, not the two §3.3 names.** `/studio`, `/neon`, **and** the yymethod.com site root. | The root link would otherwise have no mobile home (F2). It is exactly the header's tier-2 inventory, mirrored. |
| **G-f** | **The footer group labels are typed in caps** ("THE SHIP", "DOORS", "REVIEWERS", "LEGAL") and no `text-transform` is used anywhere. | §4.2's caps rule, applied to a group of labels the artboard does not draw at all. |
| **G-g** | **A second nav landmark exists in the header.** `aria-label="Primary navigation"` stays exactly where it is today — on the preserved `.desktop-nav` element carrying `/studio`, `/neon` and yymethod.com. The NEW ship tier is labelled "Ship navigation", and the mobile disclosure panel "Mobile navigation". | Two nav landmarks in one header need two distinct names. The additive reading (R7, R9) is that the preserved landmark keeps its accessible name and the new one gets a new name — moving the shipped label onto the new tier would rename a live landmark, which the deletion contract forbids as much as dropping it. Asserted in `tests/preserved-surfaces.test.ts`. |

## H. Phase 6 — content-model departures and escalations

Nothing in this section is a visual change. These are departures from the
governing spec's literal listings, from an approved artboard's implied content,
or from the build plan's own text — recorded because a provenance decision that
nobody wrote down is indistinguishable from an accident.

### H1. Additions to the (WYS §8) interfaces

All additive; nothing in §8 was removed or renamed.

| Addition | Type | Why |
|---|---|---|
| `origin: ContentOrigin` | `WysRitual`, `WysCarry` | Plan §6.1. The spec gives them `status` but no `origin`, and their text renders publicly on Today and Practice. |
| `origin: ContentOrigin` | `WysWeek` | **Beyond §6.1's two.** Stop titles A–H are handoff README bucket 3, and the phase exit requires an origin on every object. A week with no origin cannot be labelled. |
| `type` widened 9 → 13 | `WysFictionalArtifact` | Plan §6.10: §24's twelve containers plus `other`, kept last. Not a parallel `containerType`, which would be two fields for one concept. |
| `IMPLEMENTATION_PLACEHOLDER` | `WysJudgment.origin` | §8.4's only non-Ben option is `AI_SYNTHESIS`, whose §23 label asserts "based on Ben sources" — false of every judgment body in the bank. The `4a` artboard draws the implementation-placeholder mark under exactly that body. |
| `shortForm`, `choices[].shortLabel` | `WysScenario` | §6.8 collapse 1: one record, two presentations selected by breakpoint. |
| `shortCall` | `WysJudgment` | Same collapse. The `4a` phone drops a sentence from the desktop body. |
| `shortTitle` | `WysWeek` | §6.8 collapse 2, for the 15px `repeat(9,1fr)` desktop cells. |
| `optionalPracticeIds` | `WysWeek` | Plan Phase 7's ratified default. (WYS §12) requires Plan to show optional practices; **no approved artboard draws the row**. NEW/unapproved. |
| `overWithholdingClass`, `implicatesExternalAuthority` | `WysScenario` | §25 and §26 coverage is an acceptance box, so it has to be machine-checkable rather than read out of the prose. |
| `emptyReferenceReason` | all | The phase exit permits an empty source reference only with "an explicit recorded reason". A comment is not machine-readable. |
| `offSite`, `terminal` | `WysWeek` | The `5b` Plan row states for F and H, as data rather than a component branch. |
| `principleIds`, `sourceIds` | `WysRitual` | §8.8 lists neither, so a ritual's provenance had nowhere to resolve to. |

### H2. The raw voice corpus digest — resolved at the Phase 6 gate, not escalated

Plan §6.12 says the corpus, if it enters the repo at all, enters as one
`WysSourceAsset` carrying a named 64-character SHA-256. The first Phase 6 pass
dropped that value and escalated the conflict, because
`tests/canonical-text.test.ts` failed the build on **any** 64-hex string under
`content/`, `lib/`, `app/` or `components/` while `approvalState.keel.sha256` is
`null` — the stale-governance-hash check, one of the eight the packet requires.

The gate found the conflict was in the check, not in the plan. Two different
things were being called a hash:

- a **governance digest** — the SHA-256 of the frozen YY Method v2.3 Markdown,
  which (packet: hashing) forbids citing until Ben publishes it on
  `yymethod.com/work`;
- a **content-integrity digest** — which file a provenance record stands for.

§6.8 states the actual requirement as "no hash string **renders** anywhere on
the site", and scanning source text was only ever a proxy for it. So the check
now enforces the requirement directly and the guard got *stronger*, not weaker:

- nothing under `app/`, `components/` or `lib/` may contain a 64-hex string at
  all — no digest can reach a rendered surface;
- `content/` may contain only the digests declared in
  `CONTENT_INTEGRITY_DIGESTS` (`content/watch-your-step/sources.ts`), and only
  in that file;
- a second test asserts every declared digest is a real SHA-256, is not the keel
  digest, carries a written reason, matches the `hash` on its owning record, and
  that the owning record's `allowedSurfaces` is `[]`.

The corpus record therefore carries §6.12's digest, and everything else §6.12
requires is unchanged — one record, `status: "draft"`, `origin: "BEN_AUTHORED"`,
`approvedExcerpts: []`, `allowedSurfaces: []`, and a paraphrase policy
forbidding embedding, chunking, indexing, retrieval and summary. Nothing here
needs Ben.

### H2b. Provenance overclaims found and corrected at the Phase 6 gate

Two defects in the first pass, both of the class the whole plan exists to
prevent, both fixed in architecture rather than in wording (R8).

**1. Authored prose carried the label "Approved by Ben."** Four canonical
records in `content/watch-your-step/copy.ts` and one in `artifacts.ts` shipped a
`full`/`inline` variant that extended an approved sentence with prose appearing
in no source — the spec, the artboards and the packet were all checked. At
`status: "published"` with `origin: "BEN_APPROVED"`, `renderPolicyFor` returns
`canon`, so those sentences would have rendered as Ben-attributed. Five strings
were affected:

| Record | String | Now |
|---|---|---|
| `over-withholding-feedback` | "Removing too much is a miss, not a failing…" | removed; `full` is (WYS §25)'s sentence |
| `external-authority-outranks` | "Where an outside rule already governs…" | removed; `inline` falls back to the §26 sentence |
| `anonymization-not-a-loophole` | "Removing the names does not create a permission…" | removed |
| `disagreement-is-not-the-score` | "Nothing is counted against you…" | removed |
| `carry-then-leave` | "The course regularly tells you to leave…" | removed |
| `fictional-artifacts-only` | both variants (no artboard draws a learner-facing form) | kept, re-origined `draft` / `IMPLEMENTATION_PLACEHOLDER`, so it does not render publicly; **on the Final-copy escalation list for Ben** |

In each case the spec sentence the prose was expanding is an instruction to the
*build*, not a line for the learner, and is now enforced by a test rather than
paraphrased into a rendered variant.

**The mechanism, so it cannot recur:** `sourceIds` is a record-level citation
and is satisfied by one sourced variant however many unsourced ones sit beside
it. A new check in `tests/canonical-text.test.ts` — "every string variant that
may render as Ben-attributed names its own source" — requires a
`variantSources` entry for **every string variant on every record that resolves
to `canon`**. `content/claims.ts` and `content/canonical/judgment-framework.ts`
gained the entries they were missing.

**2. Eleven strings were defined twice.** `wysLabels` restated four node labels
that `content/nav.ts` pins and six slot strings that the slot records in
`content/watch-your-step/sources.ts` carry, and `content/ship/quarters.ts`
retyped four door labels that `content/site-config.ts` already names plus the
"Selected history" slot heading. Standing Order 07 and plan §6.8 forbid the
second definition, and the failure mode is concrete: the Ship's Log could be
renamed in the header and stay "Ship's Log" in the course, from a different
file, with every test green. All eleven now reference their single definition.
The one remaining overlap is deliberate and plan-specified: the Captain's
Quarters tile is labelled "YY Method" per the `5d` artboard and plan Phase 9,
while the header link is "YY Method™" — collapse 6's two-labels-two-nodes rule.

### H3. No `BEN_AUTHORED_VARIATION` exists, so the "Ben variant" pill has nothing to bind to

Artboard `5c` Practice draws a teal "Ben variant" tag on the second Replay row.
(WYS §35) decision 9 is open and Ben has authored no variation, so **v0 ships
"as authored" rows only** — which is what plan Phase 7's "Ben variant where one
exists" allows. One `AI_ADAPTATION` variant exists as data at `status: "draft"`
so (WYS §14)'s invariant machinery has something real to check; it is authored at
build time, never generated at runtime, and it is not public.

### H4. The Ship's Log and Crew Manifest carry a draft mark on every record

Plan §6.2 rule 2 requires a `DraftMark` alongside the provenance label for
`AI_*` and `IMPLEMENTATION_PLACEHOLDER` origins. Both of those pages are
entirely that origin — the entry bodies are factual build records and the crew
rows describe systems, neither written by Ben. The result is honest and
repetitive: at one mark per record the `5d` Log gains two marks and `/crew`
gains five, none of which the artboards draw. Phase 9 may prefer one mark per
section. That is a presentation decision and it does not change any origin.

### H5. The collapsed canonical collisions

Recorded as data in `canonicalCollisions` (`content/watch-your-step/copy.ts`) so
the §38 report and this register render the same rows. Four of the six are
flagged for Ben:

| Collision | Ships as | Ben? |
|---|---|---|
| Client-meeting scenario and judgment at two lengths | One record each, `shortForm` / `shortCall` | no |
| Three stop titles differ between `4a` and `5b` | The `5b` long forms, matching (WYS §11); `shortTitle` carries the cell form | no |
| "Period titles…" (desktop) vs "Stop titles…" (mobile) | **"Stop titles are a working scaffold; Ben is choosing the recordings."** — the desktop wording is retired | **yes** |
| The Data page is named four ways | Q6's default: sitewide title kept, one link label pinned, `bct_analytics_consent` rendered so the title is honest | **yes** |
| `4a` nav says "Ship's Log", the governance chip row says "Log" | **"Ship's Log" everywhere.** The chip row is Final copy, so this is a copy amendment | **yes** |
| "YY Method" names two different URLs | Two nodes, two labels — "YY Method™" (property) and "YY Method doctrine" (document). Neither href dropped | **yes** |

Stop H is a fifth instance of the same class and is collapsed the same way:
`5b` Progress reads "Learner-Owned Rules and Exit" and `5b` Plan reads
"Your Rules. Exit."; those become the record's `title` and `shortTitle`.

### H6. Narrowings recorded rather than hidden

- **Day 5 of the five-day cadence ships CARRY-only (Q24).** (WYS §12)'s path ends
  "delayed retrieval or transfer + CARRY" and the transfer-check **surface** is
  deferred — no artboard draws one. Shipping the path with a day that renders
  nothing would have been worse than saying so. The ritual, the local-state
  field and the `wys_transfer_check_complete` event all exist; only the screen
  does not. A minimal delayed-retrieval surface is Ben's call.
- **The fictional-artifact bank is empty.** Source Period C renders
  "not yet available" rather than an invented screenshot. Artifacts need image
  and audio production (plan §13.1).
- **"Memory Audit later" is not authored.** §8.8 names it; (WYS §2.2) requires
  future concepts to be disabled and invisible in v0, and an authored record is
  one import away from a screen.
- **`mostDays` is undefined on every stop** and falls back to `days5`. "Most
  days" changes return frequency, not the number of visits a stop takes — (WYS
  §12) forbids accelerating through multiple source periods in one sitting.

### H7. Principles ship with neither Ben field filled

`exactBenStatement` and `approvedFormulation` are both absent on all nine
principle records. (WYS §35) decision 6 — which Ben statements are canonical at
launch — is open, and (WYS §11) forbids inventing Ben quotes. The split between
the two fields is load-bearing for the provenance UI, so both are declared and
both are empty. `tests/wys-content.test.ts` fails if either is filled.

---

## I. Phase 7 (shell) — the tab shell, the per-stop route, the JUDGE composite

Everything in this section is either a surface no artboard draws or a
resolution of an artboard-vs-artboard conflict. None of it is a Ben position and
none of it fills a Ben slot.

### I1. The per-stop route is authored end to end

`/watch-your-step/stop/[stopId]` is marked "NEW — required, undesigned" in plan
§5.2: Plan's nine rows and the desktop path strip both link to a per-stop URL,
so it cannot be dropped, and no artboard draws it. What ships is deliberately
thin — the derived stop name ("Stop A" / "Lesson 0"), the derived visit
position, the stop's own title in whatever state its provenance allows, the
scaffold footnote, and two navigation rows into Today and Plan. It is a
signpost, not a second Today: §5.1 allows one canonical node per concept and
Today owns "the visit in front of you".

The four labels it needs — "Lesson 0", "Stop", "Open this stop in Today",
"Back to the plan" — are **authored by this build** and live in
`content/watch-your-step/tabs.ts`, not in the page. They need Ben's stamp with
the rest of the Final-copy list.

### I2. The visit derivation, and one correction to the plan's wording

Plan §5.3 already flags the derivation as authored rather than specified: the
`wys:v1` shape has no `visits` field and may not gain one, so "visit n of m" is
computed from the resolved cadence path plus completed ids and rendered, never
stored. `lib/wys/visit.ts` is that computation.

One refinement, reported because it departs from §5.3's literal wording. §5.3
says to count "steps whose IDs appear in `progress.*`". A cadence-path element
is a **day-plan id** and those ids repeat across stops — `day-human-source` is
day 1 of stop A *and* day 1 of stop B — so counting the bare id would make
finishing stop A's first visit advance stop B's counter. A completed visit is
therefore recorded as `stopId:dayPlanId` (`stop-a:day-human-source`), which is a
legal `wys:v1` id token, needs no new field, and cannot collide.

Two consequences worth stating: the counter **clamps** at `visit m of m`, so
there is no "over" state and nothing to feel behind about; and an off-site stop
(the detox) is one visit at every cadence, because the learner is meant to be
away from the screen.

### I3. Reset renders on mobile (R9, ratified default)

Plan §6.3's third safe-direction override, executed. The `4a` phone draws no
Reset control at all, so the JUDGE machine's specified reset transition has no
affordance on mobile. A state machine with an unreachable transition is a
defect, not a design, so `JudgeCard` renders Reset at both breakpoints.
`RESET_RENDERS_ON_MOBILE` in `content/watch-your-step/judge.ts` records the
decision as data.

### I4. The Commit label is punctuated two ways, and one form is pinned

`4a` reads "Commit — then see Ben's take"; `5b` Today reads "Commit, then see
Ben's take". Both artboards are approved, so R1 gives no winner. The `5b` form
is pinned, on the reasoning collision 2 already used — where a course surface
and a marketing surface disagree about a course string, the course artboard
wins. **The `4a` hero will therefore render an amended Final-copy string.**
Recorded as `collision-commit-label` in `content/watch-your-step/copy.ts`.

### I5. The tab bar's accessible name

The artboards draw an unnamed tab bar. On a page that already carries "Primary
navigation", "Ship navigation" and "Legal and company information", a fourth
unnamed navigation landmark is a defect a screen-reader user meets before anyone
else (WYS §27, §29.3). It is named "Course sections" — authored, and an
addition to the artboard.

### I6. No active tab on the landing or on a stop page

§5.4 already requires the landing to render the bar with no active item; the
same rule is applied to `/watch-your-step/stop/[stopId]`, because marking Today
active there would name a screen the learner is not on. Both live in
`activeCourseTab()`, so the rule is one function rather than six page files
agreeing.

### I7. The course screens' vertical geometry, again

Mockup 5b/5c draw `padding: 70px 22px 110px` on a phone with **no site header
and no footer**. §5.6 mounts the root header, footer and disclosure strip on
every route, so the shared `CourseScreen` container takes a smaller top pad
(48px desktop / 28px mobile) and keeps the artboard's horizontal gutter and its
110px bottom clearance for the fixed tab bar. This is the same Q9 geometry shift
already flagged in F4, now measurable on every course screen.

### I8. What the withheld course actually looks like

Not a departure from an artboard, but the thing Ben will see and should not be
surprised by. Under Q21's ratified default (`RENDER_MARKED_DRAFT === false`)
every scenario, choice label, judgment body and stop title is `draft` +
`IMPLEMENTATION_PLACEHOLDER`, so the shared gate resolves them to `blocked` and
the screens render the provenance label — "Implementation placeholder — not
Ben's words" — **where the artboard draws prose**. The per-stop route already
ships that way today. The machinery, the labels and the layout are all real;
the words are withheld until Ben rules on Q21, and one constant flips them on.

---

## P. Phase 7 (Plan view) — the §12 gap, the pace vocabulary, four authored strings

Appended by the Plan-view builder. Section letter `P` (for Plan) rather than the
next free letter, so the five Phase 7 view builders can append in parallel
without renumbering each other at the merge.

### P1. The optional-practices block is NEW — a spec-vs-artboard gap, resolved by adding

(WYS §12) names **five** things Plan must show: current source period · upcoming
· approximate direction · completed periods · **optional practices**. The
approved `5b` Plan artboard draws four of them. It draws no optional-practices
row at all.

Plan Phase 7's ratified default is to **add the data shape and render the row,
flagged NEW**, because omitting it silently drops a spec requirement (R2: the
spec governs behaviour). The data half already exists —
`WysWeek.optionalPracticeIds`, itself recorded as an addition in H1 — so this
phase adds the rendering half: an `OPTIONAL PRACTICES` eyebrow, the practices
themselves (deduplicated across stops — From Memory is optional at seven stops
and is one practice, not seven) and a link into Practice.

**Three of the block's strings are authored by this build and need Ben's
stamp:** the heading `OPTIONAL PRACTICES`, the link label `Open Practice`, and
the decision to route it to `/watch-your-step/practice`. It is also where
(WYS §12)'s "Replay and From Memory surface outside Practice" is honoured.

Under Q21's default the practice NAMES are withheld like everything else, so the
block currently renders its heading, one provenance line and the link. That is
the honest form of "these exist, their names are not Ben's yet".

### P2. "Change pace or time" points at Lesson Zero

The artboard draws the control with an arrow and no destination, and §5.2's
route table has no pace route. It is wired to `/watch-your-step/start`, because
Lesson Zero's "How often? / How long each time?" step is the only place a pace
is chosen and §5.1 allows one canonical node per concept — a second pace control
on Plan would be a second node for one decision.

**Consequence for the Lesson Zero builder, stated rather than assumed:** a
learner arriving from this control has `onboarding.completed === true` and wants
the pace step, not the ten-step sequence from the top. If Lesson Zero cannot
honour that entry, this control needs a different target and Ben needs to see
the alternative.

### P3. The pace vocabulary is one node with two presentations

`content/watch-your-step/plan.ts` holds the four cadences and the four time
budgets, each with **both** approved forms: Lesson Zero's selectable form
("3 days a week", "About 10 min"; artboard `5a`) and Plan's status-pill form
("3 days · ~10 min"; artboard `5b`). Neither artboard is amended — the two forms
are what the two artboards draw. What is new is that they are **one record**, so
they cannot drift (§6.8 / Standing Order 07).

Two small authored decisions inside it: `"Most days"` keeps its full word in the
pill because the artboards give it no shorter form and inventing one would be a
new claim about frequency; `"20+ min"` takes no tilde, because `~20+ min` hedges
a hedge.

**Lesson Zero must import these labels rather than retype them.** If it types
its own, the pill on Plan can stop describing the choice the learner made, and
no test would catch it.

### P4. "done ✓" is split into a word and an `aria-hidden` glyph

The artboard's tag is the single string `done ✓`. It renders as the word `done`
plus a decorative `✓`, so the row announces "done" rather than "done check
mark". Nothing is removed from the screen; this is a reading of the same tag.

### P5. One provenance line for nine withheld titles

Under Q21's default all nine stop titles resolve to `blocked`, and the rows
render their derived mark (`0`, `A`…`H`) alone. The provenance label is rendered
**once, beneath the list**, not once per row: the nine records share one status
and one origin and therefore one label, and nine identical mono lines would make
provenance decorative in the one place it has to stay readable (WYS §23 —
"do not make AI-generated material look more polished", and its companion, that
a provenance line nobody reads is not provenance).

Nothing withheld reaches the DOM. The grouping is computed, not assumed: the day
one stop title is Ben-approved and the rest are not, `withheldLabels()` renders
both labels rather than quietly picking one.

### P6. The current row's tag, when a stop is two things at once

Stop F is off-site AND, once marked, done; stop H is terminal AND, once marked,
done. The artboard draws one tag per row, so the order is `done` → `off-site` →
`the end`: the state the learner just changed wins over the structure that was
always true. When stop H is the CURRENT stop it renders as the ink card with its
visit position and no "the end" tag — the tag returns the moment it is not
current. Authored; the artboard draws neither collision.


## T. Phase 7 (Today view) — the loop, its completion rule, and six departures

Today is artboard `5b` (dc.html:78-96) plus the four things the artboard does
not draw and the screen cannot work without. Everything below is NEW or a
departure, and every item is a data or config edit rather than a component edit,
per (WYS §35).

### T1. Which stop Today shows is an authored derivation

`WysLocalStateV1` carries no `currentStopId` and §7.1 forbids adding a field, so
`app/watch-your-step/(shell)/today/current-stop.ts` derives it: **the current
stop is the first lettered stop whose derived visit position is not complete;
when they are all complete it is the last.** This sits on the same footing as
§5.3's visit derivation — authored, not specified, and reported. Two
consequences are deliberate: **Lesson Zero is not a Today stop** (it is the flow
at `/watch-your-step/start`, has no recording, and would otherwise be a stop
Today could sit on forever if the flow never wrote its completion id), and
**nothing here can compute a deficit** — the derivation returns a stop and a
clamped position, never a count of missed days.

### T2. The CARRY mark is what advances the visit

Plan Phase 7 requires an explicit "I did it" and (WYS §13) makes an intentional
mark the only thing that counts a CARRY. What the mark writes is the authored
part: besides `progress.completedCarryIds` it writes
`visitId(stopId, dayPlanId)` into `progress.completedLessonIds`, which is the id
the derived counter reads — so the mark is what turns "visit 1 of 3" into
"visit 2 of 3". (WYS §10) makes CARRY the last move of the loop and `5b` ends
Today on the carry card, so it is the one intentional signal that a visit is
over; the JUDGE commit is a scenario fact, not a visit fact. **Authored, not
specified.**

### T3. Three control strings the artboard does not draw

`I did it` · `Marked` · `Marks the visit done.` The `5b` carry card draws no
control at all, so without them the card states a behaviour that nothing can
complete. `Marked` is one word on purpose: it says the mark landed and asks
nothing — no "how did it go", no note field, no follow-up — and it does **not**
say "nothing sent", because a completed stop may fire the coarse
`wys_source_period_complete` count and a label claiming otherwise would be the
§34 error of fixing architecture in copy.

### T4. The lead line is one approved sentence rendered on two lines

`5b` writes "Task Before Prompt — about 10 minutes.", whose first half is the
stop title. Titles A-H are withheld while `RENDER_MARKED_DRAFT` is false (Q21),
so the title renders through the gate and "About 10 minutes." renders beneath
it. No word is added, removed or reordered; the sentence is split because half
of it is not public yet. The minutes are the learner's own time budget, so the
line renders nothing until local state has loaded rather than guessing "10".

### T5. Commit is INK, not the `5b` teal

Q17, ratified. `5b` fills Today's Commit pill teal; every other primary pill in
the approved set is ink, and `ActionPill` standardises on ink enabled /
`rgba(22,32,43,.25)` disabled. **Reported here as the deliberate deviation from
`5b` that the plan requires.** Reset renders on this breakpoint too (the R9
override already recorded at I3).

### T6. Today ships no distribution card, and no continue pill after commit

Two narrowings, both against adding rather than removing. `4a`'s hero draws the
18/61/21 split with its "Example numbers" caption; **Today's artboard draws
none**, the first-party counter is off (Q12) and inventing a second set of
illustrative numbers for a second scenario is what (packet: Proposition K)
forbids. And the post-commit actions carry Reset alone: the CARRY card is
already the next move and is already on the screen, so a continue pill would be
a second answer to one question.

### T7. The transcript is an expandable block over a new Ben slot

`5b` draws "Transcript" as a teal word inside the caption sentence; plan Phase 7
requires "Transcript as an inline expandable block". It ships as a native
`<details>` immediately under the caption — it opens with JavaScript off, and a
link to a transcript route would have been a second canonical node for one
source (§5.1). What it opens onto is a **new Ben slot**,
`slot-today-transcript` in `content/watch-your-step/today.ts`: plan §13.1 says
each clip ships with an approved transcript carrying the same approval status,
`content/watch-your-step/sources.ts` carries no such record, and with no
recording selected there is nothing to transcribe. The block says that rather
than standing empty.

### T8. The play disc is decoration

`5b` draws a 56px ink disc inside the striped slot. No recording is selected, so
a real control would be an affordance for something that does not exist:
`PlayDisc` is `aria-hidden`, the overlay takes no pointer events, and the slot
keeps `MediaSlot`'s single accessible name. The disc renders where the artboard
draws it and the mono caption moves to the foot of the slot to make room —
a wrapper rule scoped to this card, because `MediaSlot` exposes no class hook
and accepts no children by rule (§6.4).

### T9. Stop A's exercise is pinned to the artboard, as data

`5b` Today draws the group-chat exercise even though `scn-client-meeting` leads
stop A's `tryScenarioIds` — the client-meeting exercise is what the `4a` hero
already spends on the marketing page, and one exercise on two surfaces would be
one node drawn twice. `TODAY_CORE_SCENARIO_PINS` is that decision, as data.
(WYS §35 decision 9) is Ben's; this is a confirmation, not a re-decision.

### T10. Every lettered stop's loop is in the page; one is shown

Today is one static URL that must show a different stop to different learners
from state that may not be read during render (§7.3). So the loop is
server-rendered once per stop and `CurrentStopGate` — a client component that
receives `children`, never content — emits exactly one. The route stays `○`, the
curriculum stays out of the client bundle, and every learner's server HTML is
identical. **The consequence, stated:** the flight payload carries all eight
server-rendered trees, so the page is larger than a single-stop screen would be.
Withheld prose does not travel with them — `view.ts` empties the text of a
blocked record before it crosses a client boundary — and that redaction is
asserted by test.

### T11. The CARRY body renders at 16px where `5b` draws 15px

The card uses the shared `GatedText`, which is the only sanctioned way to put a
content record on screen and which sets its own 16px body. Reaching into a
shared component to move one line by a pixel was the worse trade; a `size` prop
on `GatedText` is requested in the build notes instead.

### T12. Marking a carry does not re-animate the screen

`useWysState` gives each component its own snapshot, so the mark shows "Marked"
and the visit counter advances on the next visit rather than under the learner's
hand. That is left as it is rather than worked around: the CARRY card is the end
of the visit and (WYS §10) says "the product should regularly tell the learner
to leave". A shared subscription is requested in the build notes.

### T13. A blocked-storage browser is not sent to Lesson Zero

Today owns §5.4's one state-dependent redirect. It does not fire when
`localStorage` is unavailable (iOS Safari private mode throws): such a visitor
can never record completing onboarding, so redirecting them would loop them
through Lesson Zero forever. They stay on Today at the first stop.

### T14. Phase pills are static, with Watch active

`5b` draws them that way and no phase state exists — nothing on the screen
records which of the four moves the learner is on, and inventing one would be a
progress signal the spec does not ask for.

---

## R. Phase 7 (Practice view) — the replay states, one narrowing, and eleven authored strings

Everything in this section is either a state the `5c` artboard does not draw, a
spec-vs-artboard resolution, or a string this build authored. None of it is a
Ben position and none of it fills a Ben slot.

### R1. "I'd want deeper practice" — the artboard's wording, not the spec's

(WYS §21) writes the appetite signal as **"I want deeper practice"**. Approved
artboard `5c` writes **"I'd want deeper practice"**, and plan Phase 7 quotes the
artboard's form. R1 resolves an on-screen string to the approved artboard, so
the contraction ships. §37's acceptance box is satisfied by the signal existing
as a neutral, email-free, unlock-free control — which it does. Ben confirms the
wording rather than deciding it.

### R2. The scratch notice is two sentences, and the spec mandates one

(WYS §15.1) mandates the label **"This stays in this page and is not sent
anywhere."** Artboard `5c` adds **"It clears when you leave."** Both are true of
the shipped component — the box is React state that no code path writes
anywhere, and a `usePathname` effect clears it on route change in addition to
the unmount — so the artboard's two-sentence form ships as one record citing
both sources. A safe-direction addition (R9): it promises more, and the
implementation delivers it.

### R3. Three replay states the artboard does not draw

`5c` draws one state: three populated rows. The shipped screen has four, and the
three new ones are authored.

- **Empty** — a dashed slot, "Nothing to replay yet · a scenario you have
  already judged". Replay is a re-run of an exercise the learner has already
  committed a judgment on, so a learner who has judged nothing has nothing to
  replay. This is also the state a stateless visitor and the server HTML see,
  because the row list is derived from `wys:v1` and §7.3 forbids reading it
  during render.
- **Withheld** — the row renders its provenance label and a dashed slot,
  "Replay opens when this scenario is published · Ben's ruling on draft
  curriculum text". **This is the state the whole REPLAY section is in today**,
  because every scenario is `draft` + `IMPLEMENTATION_PLACEHOLDER` and Q21's
  ratified default blocks it. A control that opened an exercise with no text in
  it would be worse than saying so.
- **Open** — the row expands into the `ScenarioCard` + `JudgeCard` composite.
  No artboard draws a replay in its opened state at all, so the composition is
  authored: the shared JUDGE composite, no distribution, no continue pill, and
  a "Close this replay" control.

### R4. "I did it" on the From Memory card records nothing — a narrowing

(WYS §8.8)'s `rit-from-memory` record says the app records "that the learner
marked it done. Nothing they wrote." The shipped card **acknowledges the mark
in-page and stores nothing**, and says so: "Marked. Nothing was recorded."

The reason is structural, not a preference. §7.1's `wys:v1` shape is verbatim
from (WYS §17) and may not gain a field, and it holds no field for a ritual
completion. The only arrays that would accept a ritual id are
`progress.completedLessonIds` and its three siblings, which other surfaces read
as counts of lessons, scenarios, carries and transfer checks — writing a ritual
id into one of them would inflate a number another screen presents to the
learner as something else.

**Ben's call.** Recording the mark needs either a new declared field (a change
to a verbatim spec shape) or an agreed reinterpretation of one of the four
existing arrays. Until then the card is honest about doing nothing, which is
consistent with its own promise that nothing on it is kept.

### R5. Eleven authored strings, for the Final-copy list

The artboard draws one populated state; a working screen has several. These are
build-authored, none is a claim, and none is in Ben's voice (R10):

`Replay this` · `Close this replay` · `Nothing to replay yet` · `a scenario you
have already judged` · `Replay opens when this scenario is published` · `Ben's
ruling on draft curriculum text` · `Optional scratch space` (the textarea's
accessible name; the artboard labels it with a placeholder alone) · `Marked.
Nothing was recorded.` · `Recorded in this browser.` · and the three landmark
names `Replay` / `From Memory` / `Deeper practice`.

The three landmark names exist because the visible eyebrows are typed in caps
(the artboard's own form, and `SectionEyebrow` forbids `text-transform`), and an
`aria-label` reading those caps would have a screen reader announce "R E P L A
Y". They are the same nodes in a spoken presentation, not second names for them.
(WYS §27; the same reasoning as I5.)

### R6. The "as authored" tag is ink on white, not the artboard's muted grey

Artboard `5c` sets the tag pill's text at `#5C6B7A` on white; the shared `Pill`
primitive's `white` variant sets it at `--ink`. The "Ben variant" tag matches
the artboard exactly (`--tint-teal` / `--accent-text-on-tint`). One token's
worth of contrast, in the safe direction, taken rather than adding an eighth
Pill variant for a tag that appears on one screen.

### R7. The aloud/paper offers are list items, not controls

`5c` draws them as pills, which reads as a control. Nothing on this site can
know whether someone said something aloud, and a button implies a state change
this card must not make — so they are `<li>`s with the artboard's fill and
radius. The card's only control is "I did it".

### R8. The appetite card renders unconditionally

(WYS §21) says to allow the signal "at meaningful points, especially after the
learner has experienced deterministic value". `5c` puts it on Practice with no
condition, and Practice is itself the post-value surface. It renders
unconditionally, once, on this screen only — no repeat ask anywhere.

### R9. Desktop is extrapolated

Practice has a 390px artboard and no 1280px rendering, like every other course
screen (plan Phase 10's list of fifteen). The reading column widens, the row and
card padding grows by 4px, and the IA does not change.

### R10. The scratch box is resizable

`5c` draws a fixed 70px box. The shipped textarea keeps 70px as a **minimum**
(`rows={2}` sits under it, so the artboard's height is what renders) and allows
vertical resize, because a fixed-height box that scrolls its own content at
390px is a worse retrieval surface than one the learner can open. No horizontal
resize; the field never widens past the column.

### R11. What Practice deliberately does not have

Recorded because their absence is a design decision Ben should see rather than
an omission: no replay count shown to the learner, no "you've practised N
times", no score, no comparison to a model answer, no timer, no distribution
bars, no email field, no chat, no unlock, no second ask after the appetite pill
is answered, and no "optional practices" list duplicating Plan's row.

---

## R. Phase 7 (Progress view) — derived counts, a narrowed row and the rulebook's missing controls

Artboard `5b` Progress is the only design for this screen and there is no
desktop form of it. Everything below is either a derivation the spec names but
does not define, a control (WYS §16) requires and the artboard does not draw, or
a resolution of a collision the artboards create. None of it is a Ben position
and none of it fills a Ben slot.

### R1. Three of the four tile counts are derived by rules this build authored

(WYS §13) names the quantities — "source periods completed", "scenarios
attempted", "replay used" — and defines none of them, and `wys:v1` stores no
count. So each tile is computed, and the rule is written down here because it is
authored:

- **stops completed** — a stop counts when every step of the learner's
  *resolved* cadence path for it is marked complete, using the same
  `visitPositionFor` derivation Today's "visit n of m" uses (plan §5.3, already
  reported as authored at I2). Reused rather than re-derived so a stop cannot
  read "visit 3 of 3" on Today and "not completed" on Progress.
  `completedLessonIds.length` — the obvious alternative — counts VISITS, and half
  a two-day stop is not a stop.
- **judgments committed** — the union of `progress.completedScenarioIds` and the
  keys of `localJudgments`. §13's completion semantics make the committed
  judgment the thing that completes a scenario, so the two sets describe one
  fact. The union keeps the tile true whichever writer ran, including with
  `PERSIST_LOCAL_JUDGMENTS` off, and cannot double-count. See the gate request in
  `docs/facelift-build-notes.md`: `JudgeCard` currently writes only the second of
  the two.
- **replay used** — the sum of `progress.replayCounts`, i.e. replays used rather
  than scenarios replayed. The artboard's own label is "replay used".

**carries taken** is `completedCarryIds.length` and needs no rule: (WYS §13) says
a CARRY counts on an intentional mark and nothing else.

Only the first tile carries a denominator, as drawn. Giving the other three one
would turn three counts into three completion targets, which is what §13's
do-not-show list exists to prevent. The denominator is `weeks.length` (plan §6.9)
and is never typed.

### R2. The judgment row's third form, "B · differs from Ben", is NOT built

The artboard draws three row states: `A · kept`, `C → B · revised` and
`B · differs from Ben`. The first two ship verbatim. The third is a **narrowing,
recorded rather than hidden**, for three reasons that stack:

1. **Nothing in the content model records which choice Ben endorses.**
   `WysJudgment` carries `call` as prose and no choice key, so the comparison
   could only be produced by this build deciding what Ben's answer is — a Ben
   content decision (WYS §35 item 6) and a position asserted in his name, which
   R10 forbids.
2. Under Q21's ratified default there is **no rendered Ben judgment on the site
   to differ from**: every judgment is `draft` + `IMPLEMENTATION_PLACEHOLDER`.
3. (WYS §13) itself asks only for "judgments revised or retained", which is
   exactly what ships.

What a later phase needs: one Ben-supplied field on `WysJudgment` naming the
endorsed choice key. Then the row form is the artboard's, with **no corrective
styling** — it is a status, not a wrong answer.

### R3. "Inspect local data" renders as the pinned Data page link label (Q6)

The `5b` row is drawn as "Inspect local data", which is a **fifth** name for the
Data page beside the page title, the `4a` pill, the Lesson Zero step-9 row and
the tab label. Plan §6.8 collapse 4 and Q6's ratified default pin one page title
and one link label, so this row renders `wysLabels.dataPageLinkLabel` — "See what
this site knows about you". Recorded as a **copy amendment to an approved
artboard**; reversing it is one line in
`content/watch-your-step/progress.ts` and no component edit.

The collapsed-collision register in `content/watch-your-step/copy.ts` should gain
this row; the array and its asserted count are shared files this phase did not
edit, so the request is recorded in `docs/facelift-build-notes.md` instead.

### R4. Six rulebook controls the artboard does not draw

(WYS §16) requires the rulebook to be **editable, exportable as plain text or
JSON, and deletable**, and the artboard draws two static outlined rows, a dashed
"+ Add a rule" and the footnote "Stored here only. Export as text any time." The
footnote is a claim, and (plan R8) fixes a false claim in architecture rather
than in copy — so the controls exist:

| Control | String | Why |
|---|---|---|
| Add | `+ Add a rule` (drawn) opens an inline form | the artboard's own row |
| Field label | `Your rule` | a textarea with no label is not usable |
| Save / Cancel | `Save`, `Cancel` | the form needs both |
| Edit | `Edit` | (WYS §16) editable |
| Delete | `Delete`, then `Confirm delete` | (WYS §16) deletable — two-step, because the learner's own words are not recoverable |
| Export | `Export as text` | (WYS §16) exportable, and the footnote's claim |

All eight strings are **authored by this build** and live in
`content/watch-your-step/progress.ts`. They go on the Final-copy list with the
rest.

### R5. A 240-character cap on a single rule

Authored, and a deliberate narrowing. `rulebook[].text` is the one declared
free-text field the serializer lets through intact (WYS §16), so the only thing
between a rulebook and a pasted document is the field's own limit. A rule is a
sentence the learner can act on. `RULE_MAX_LENGTH` is one constant.

### R6. No transfer-checks tile

(WYS §13) lists "transfer checks completed" among the things Progress may show
and the artboard draws no tile for it. The transfer-check **surface** is deferred
in v0 (Q24, already recorded), so nothing writes `transferCheckIds` and a tile
could only ever read 0. Restated here because Progress is the surface where the
absence is visible.

### R7. Every numeral renders as an em dash until local state has loaded

§7.3 forbids reading `wys:v1` during render, so the server HTML, the first paint
and a crawler all receive "—" where the numeral goes, and the denominator, which
is content-derived and always true. Same rule `VisitCounter` follows (I2): a
count with no numeral is true at every moment; a numeral that is wrong for a
returning learner and then corrects itself is not. For the same reason the
"Nothing committed yet." line does **not** render before the read returns — it is
a statement the screen cannot yet make.

### R8. The section eyebrows use the 12px/600 scale at every width

`SectionEyebrow` has a 15px desktop scale and a 12px mobile one. Progress has
only a phone artboard, and its eyebrows are typed in caps in the copy
("YOUR JUDGMENTS · KEPT OR REVISED"), which the 15px/500 desktop treatment was
not drawn for. The mobile scale renders at every width. Reported as a departure
from the primitive's default rather than from an artboard, since no artboard
draws this screen wide.

### R9. The lead line is rendered inside the screen body, not through `CourseScreen.lead`

The artboard's lead is 15px/`--body`; the shared `GatedText` body is fixed at
16px/`--ink`. `CourseScreen.lead` wraps whatever node it is given, so rendering
the gated line inside the body costs nothing and keeps the artboard's
typography. For the same reason this screen composes its gated prose from
`ProvenanceMarks` and `ProvenanceMono` — the pieces `GatedText` itself is built
from, and what `ProvenanceMarks` was split out for — rather than from
`GatedText`. There is still no path from a content record to prose without its
policy. A request for a size variant on `GatedText`, which would let this screen
use it directly, is recorded for the gate.

### R10. One provenance line for the rulebook list, not one per rule

Every rule carries the same `LEARNER_OWNED` label, "Yours. Stored in this browser
only." Repeating it under each of six rows would make it decorative, which (WYS
§23) forbids as squarely as it forbids dropping it. The set of distinct labels
across the list is computed rather than assumed, so a row whose provenance ever
differed would bring its own line.

---

# Phase 7 (Lesson Zero) — the ten-step onboarding flow

Surface: `/watch-your-step/start`. Sources: artboard `5a` (three phones),
(WYS §9.1 / §9.2 / §9.3), plan Phase 7. Files:
`app/watch-your-step/(flow)/start/page.tsx`,
`components/wys/LessonZero/LessonZeroFlow.tsx`,
`components/wys/LessonZero/lesson-zero.module.css`,
`content/watch-your-step/lesson-zero.ts`.

## LZ1. Five of the ten steps are NEW and no artboard draws them

`5a` draws steps 2, 5 and the 7–9 composite. Steps **1, 3, 4, 6 and 10** exist
only as one line each in (WYS §9.1), so this build composed them in the approved
visual register. Each is a canonical record at `status: "published"`,
`origin: "IMPLEMENTATION_PLACEHOLDER"`, which resolves to `marked` — so **each of
the five renders its prose together with the §23 label "Implementation
placeholder — not Ben's words" and the mono draft mark.** The five undesigned
screens therefore announce themselves as unapproved on the screen, not only in
this document. Ben reads five short passages and either stamps them or replaces
them; nothing else in the flow changes if he replaces all five.

| Step | §9.1 requirement | What ships | Record |
|---|---|---|---|
| 1 | Constructive intent; "do not ask them to justify fear or distrust" | A statement, no question, no control but Continue. Says what the flow is, how long, and that it will not ask why you are wary. | `lesson-zero-constructive-intent` |
| 3 | Human source first | States the ordering rule — the recording is watched whole before anything explains it — then an empty `BenSlot`. Nothing stands in for the recording (§6.4). | `lesson-zero-human-source-first` + `slot-lesson-zero-source` |
| 4 | First durable privacy habit | The `5a` ink THE FIRST HABIT card **on its own screen**, plus one gloss line. | `lesson-zero-first-habit` (approved) + `lesson-zero-first-habit-gloss` (NEW) |
| 6 | Runtime disclosure | The two disclosure-strip sentences, from `content/claims.ts`, plus one authored sentence for §9.1's "unless a surface explicitly says otherwise". | `lesson-zero-runtime-disclosure` |
| 10 | Plan preview | `planIntro()` (count derived, never typed), the nine stops by derived name, one authored line, and the §9.3 takeaway on ink. | `lesson-zero-plan-preview` |

Four screen headings are also authored: "What this is", "The source comes
first", "How this course runs", "Your plan". None makes a claim; each names a
screen.

## LZ2. Step 4 IS a separate screen — decided and recorded

Plan Phase 7 asked for a decision, because the habit line is drawn *inside* step
5's card. It is a separate screen, for two reasons. (WYS §9.1) fixes the
sequence at ten and the artboard counts "5 of 10" on the exercise, so collapsing
4 into 5 would make the artboard's own numbering wrong. And (WYS §9.3) makes the
habit the one thing a learner who leaves must still have — giving it a screen of
its own is the only way it is not competing with a four-option exercise for
attention. The habit line then renders **twice**, once alone and once as the
frame above the exercise exactly as `5a` draws it: two presentations of one
record, never two records (§6.8).

## LZ3. Eight screens, ten steps

`5a`'s third phone is a composite carrying cadence, time and the data card,
counted "7–9 of 10" with the rail at 90%. The step sequence in
`content/watch-your-step/lesson-zero.ts` is the spec's ten; the screens are the
artboard's eight, declared separately, and `tests/wys-lesson-zero.test.ts`
asserts the screens cover every step exactly once in order. The three rail
widths the artboard draws fall out of `step / 10`.

## LZ4. Step 5 is composed borderless, outside the shared `ScenarioCard`

`5b` Today wraps its TRY/JUDGE in the one bordered card on that screen, where a
border means "the live decision surface". `5a` step 5 draws **no border** — the
screen *is* the decision surface. R1 gives the artboard the visual, so the
exercise is composed in `lesson-zero.module.css` rather than through
`components/wys/ScenarioCard.tsx`. A `bordered` prop on the shared card is
requested in `docs/facelift-build-notes.md` so the two surfaces can share one
component after the gate.

## LZ5. The Commit pill is drawn a third way, and the pinned form still wins

`4a` reads "Commit — then see Ben's take", `5b` Today reads "Commit, then see
Ben's take", and **`5a` step 5 reads simply "Commit"**. Three approved artboards,
one control. `content/watch-your-step/judge.ts` already pinned the `5b` form
(collapsed collision `collision-commit-label`); Lesson Zero renders that pinned
form, so `5a`'s shorter label is a third input to the same collapse and a second
Final-copy amendment. If Ben prefers the bare "Commit" here, it is one entry in
`judgeLabels` plus a decision about the other two surfaces — never a per-screen
string.

## LZ6. A teal "Continue" under step 5's Commit — NEW

The artboard's step 5 offers only "Commit", which leaves no way past the
exercise for a learner who does not want to answer, and (WYS §29.3) forbids a
modal trap. A full-width teal Continue sits below the exercise on every render.
Teal, not ink, so the primary action on the screen is still Commit.

## LZ7. The 2×2 pace grid is composed locally, and its selection does not reflow

No shared primitive draws `5a`'s centred 2×2 option tiles (`ChoiceRow` is a
left-aligned row with an optional letter), so `.paceOption` lives in this
surface's own module. Its selected state is the §4.7.1 / Q18 normalisation
already applied to `ChoiceRow`: a 2px ink ring on a pale-teal fill, with the
extra half pixel absorbed by an inset shadow so picking an option does not move
the three beside it. The artboard's own 2px border would shift the row below by
4px.

## LZ8. Time labels follow the artboard, not the spec's longer form

(WYS §9.1) item 8 writes "About 5 minutes / About 10 minutes / About 15 minutes
/ 20+ minutes"; artboard `5a` draws "About 5 min / About 10 min / About 15 min /
20+ min". R1 gives on-screen copy to the artboard. The labels are **imported
from `content/watch-your-step/plan.ts`**, which owns the pace vocabulary and its
second presentation (Plan's "3 days · ~10 min" badge), so Lesson Zero and Plan
cannot describe one choice two ways.

## LZ9. The "Sent: coarse counts" line is state-bound (SC-2, Q7)

Artboard `5a` writes "**Sent:** coarse counts. That someone started, finished a
stop, used replay." as a flat present-tense assertion. Q7's ratified default is
full suppression — `trackWys` sends nothing unless `bct_analytics_consent ===
"granted"`, and it fails closed on an unreadable key — so that sentence is false
for every visitor who declined or has not answered the banner. Plan R8 and (WYS
§34) forbid fixing that in copy, so the card **selects between two records** from
the consent state: the approved line when consent was granted, and an authored
line (`lesson-zero-data-not-sent`) otherwise, naming the same three counts and
saying plainly that none of them is going anywhere. The authored line is the
NEW copy; the switch is the architecture. It defaults to the not-sent line
before hydration, which is the honest default. Same discipline plan §8.8
requires of Data card 2.

## LZ10. Geometry: 48/28px top, centred at 520px

`5a` is `padding: 72px 22px 60px` on a 390px phone with **no site header**. §5.6
mounts the root header, footer and disclosure strip on every route, so the flow
takes 48px (desktop) / 28px (mobile) of top padding and keeps the artboard's
22px gutter and the route group's 60px bottom. The flow is also centred and
capped at 520px, because a 32px title measured for 346px of content becomes a
banner at 1280px and the page is reachable at any width. Same Q9 shift already
flagged in F4 and I7.

## LZ11. Three authored controls and one authored accessible name

- **`postureSkipHint`** — "You can move on without picking one." Continue on
  step 2 is enabled with nothing selected. Forcing an answer would be exactly
  the pressure the drawn footnote ("No wrong answer, nothing to justify")
  promises is absent, and `onboarding.postureChoice` is optional in (WYS §17).
- **`startCourse`** — "Start the first stop", linking to
  `/watch-your-step/today`. The artboard's flow ends at "Show my plan", which
  plan Phase 7 resolves as an advance to step 10; step 10 then needs a way out
  and no artboard draws one.
- **`dataPageArrow`** — the "→" is split from "See the full data page" and
  rendered `aria-hidden`, the treatment `planLabels.doneMark` already uses.
  Nothing is removed from the screen.
- **`progressLabel`** — "Lesson Zero progress", the accessible name of the rail.
  The artboard draws an unnamed bar; an unnamed `progressbar` is a defect a
  screen-reader user meets first (WYS §27).

## LZ12. No resume, and completion flips on arrival at step 10

The flow always opens at step 1. Remembering the step would mean a new field in
`wys:v1`, and §7.1 is explicit that the shape does not grow — the visit counter
is derived for the same reason. Ten short steps is the whole cost of starting
again.

`onboarding.completed` flips **when step 10 is reached**, not when its button is
pressed, and `wys_onboarding_complete` fires at the same moment. Every step that
asks the learner anything is behind them and step 10 has nothing to answer, so a
learner who closes the tab on the last screen is counted as onboarded — which is
what (WYS §9.3) describes. The alternative reading ("completes" means leaves)
would under-count the people the completion condition is written about.

## LZ13. The flow requires JavaScript, and the terminal control is a button

Server HTML carries step 1 and no step control works without JS. That is
inherent to a client-side stepper, and a stepper is what keeps the posture,
cadence, time budget and exercise answer out of `page_location` (§8.5) — a route
per step would put them there, where the preserved GA4 config sends them
automatically. The step-10 control is a `<button>` that navigates rather than an
`<a>`, so it can be reached the same way. **The one link that works without JS
is "See the full data page →"**, which is a real `<a href>`. Reported rather
than fixed: fixing it means either a route per step or a `<form>` in a flow that
must collect nothing.

## LZ14. What the withheld exercise looks like under Q21

Not a departure from an artboard, but the thing Ben will see. Every scenario,
choice label and judgment is `draft` + `IMPLEMENTATION_PLACEHOLDER` and
`RENDER_MARKED_DRAFT` ships `false` (Q21, ratified), so on step 5 the gate
resolves the leaking-pipe setting to `blocked` and the screen renders the
provenance label and the mono "scenario: draft · implementation placeholder"
inside a dashed teal block **where the artboard draws the exercise**. The JUDGE
machine is not rendered at all in that state, deliberately: four lettered
options with no text is not a decision surface, and committing to one would
record an answer to a question nobody was shown. The ink THE FIRST HABIT card
above it renders in full, and so does the §9.3 takeaway on step 10 — so Lesson
Zero still teaches the thing it exists to teach with the exercise withheld.
One constant restores the artboard.

---

# Phase 7 (gate) — section G: the Stop H terminal surface

`/watch-your-step/end` is a declared route in plan §5.2 and in `WYS_ROUTES`, and
it is a Phase 7 task row, but **no artboard draws it**: `5b` ends the Plan
screen at a dashed "the end" row with nothing behind it. It could not be
deferred, because `lib/wys/telemetry.ts` declares `wys_course_complete` as
`firedInV0: true` with "Stop H terminal surface reaches its completed state" as
its firing point — a claim the code could not honour, which R8 says is fixed in
architecture and never in copy.

**No prose was authored for it.** What the end of a finite course says to a
learner is a Ben position, so it renders as a labelled empty slot (R10, §6.4)
and stays empty. Everything below is a name or a control, and nothing on the
screen makes an outcome claim — a test scans for "you have learned", "you now",
"congratulations", "well done", "you're ready", "mastered" and "certified"
(packet: Proposition K).

## G1. The Ben slot — `slot-course-end`

| Field | Value |
|---|---|
| Label | `Ben's closing words` |
| Awaited asset | `slot: Ben's exit copy for Period H` |
| Kind | `dashed` — Period H closes in writing, not with a recording |

**Ben:** confirm the label wording, and write the copy when you are ready. The
slot cannot be filled by this build.

## G2. Five authored names

| String | Where | Why it exists |
|---|---|---|
| `The end` | page `<h1>` and `<title>` | Sentence case of the pinned `wysLabels.terminalTag` ("the end") — the **second presentation of one node** (§6.8), not a second name. Composed from the pinned string, never retyped. |
| `WHAT YOU TAKE WITH YOU` | section eyebrow over the rulebook | (WYS §16) makes the learner-owned rulebook the thing they leave with. Caps typed in the copy, as every other eyebrow is. |
| `No rules written.` | empty rulebook state | A fact. Deliberately not a nudge to go and write some — the screen is an ending. |
| `See your progress` | link | To `/watch-your-step/progress`, an existing canonical node. |
| `Back to the plan` | link | To `/watch-your-step/plan`, an existing canonical node. |
| `Open the end` | on `/stop/stop-h` only | **The one door into the route.** Without it the surface ships unreachable: no artboard draws an entrance and the bottom nav has no sixth tab. Uses the pinned `terminalTag` again so the path and its destination share a word. |

## G3. The completion rule is authored, not specified

`wys_course_complete` fires when `visitPositionFor(terminalStop, …).complete` is
true — the same derivation Today's counter and Progress's first tile use — and
never on arrival at the URL. (WYS §19.4) names the firing point in prose ("the
terminal surface reaches its completed state") but nothing specifies what makes
Stop H complete. This build answers: **every step of the learner's resolved
cadence path for the terminal stop is marked complete**, which is the same
answer Progress's "stops completed" tile already gives. Recorded so the two can
never drift into two definitions of finishing.

## G4. The surface has no artboard geometry at all

It reuses `CourseScreen`, `BenSlot`, `SectionEyebrow`, `LinkRow` and
`ActionPill` and adds **no stylesheet of its own**, so it inherits the course
type scale rather than inventing a layout no source approves. If Ben wants an
ending that looks like an ending, it needs an artboard.

## G5. It sits in `(flow)`, not `(shell)`

No bottom tab bar. An ending is not a tab, and five tabs under it would invite
the learner straight back into a course they have just finished — which is the
opposite of (WYS §13)'s "the product should regularly tell the learner to
leave". Consistent with §5.4's treatment of Lesson Zero.

---

# Phase 8 — the Data page (`/watch-your-step/data`, artboard `5c`)

The handoff README marks the **Data page wording** as Final copy, so every
change below is an escalation rather than an edit. Nothing approved was
reworded: where a sentence had to become conditional, the condition is in the
code and the approved string is unchanged; where something had to be said that
no artboard says, it is a **separate, labelled addition** rendering under
"Drafted during implementation — not Ben's words".

## DM1. The clearing footnote is amended by ADDITION, not by rewrite

Plan Phase 8 asks for the footnote to be "amended to name what survives (the
analytics consent choice) and link to `/cookies`", and marks the change an
escalation. Two ways to do that, and only one of them keeps Ben's sentence:

- rewrite `"Clearing removes this browser's copy. It can't erase hosting or
  analytics logs — and this page won't pretend it did."` to carry the new
  clause — which deletes approved copy on this build's authority;
- ship the approved sentence **unchanged** and add the new clause beside it,
  under its own provenance label.

The second is what shipped. `data-clearing-footnote` is the artboard's text at
`BEN_APPROVED` / `published`, so it renders as canon. `data-clearing-survives`
is the addition, at `AI_SYNTHESIS` / `published`, so it renders with its label
and its draft mark:

> Your analytics choice is kept under a separate key that clearing does not
> touch, so clearing does not change whether this site asks you about cookies.

followed by a link to `/cookies`. It is true of `clearAllWysData()`, which
sweeps the `wys:` prefix and never touches `bct_analytics_consent`.

**The second half was narrowed by the Phase 8 gate.** It shipped as "so this
site won't ask about cookies again", which is false for a visitor who has not
answered the banner: `ConsentBanner` renders whenever NO choice is stored, so
that visitor would be asked — while card 1, two inches above, showed
`bct_analytics_consent · not set`. One screen cannot carry both statements. The
claim now says only what is true in every state, and
`tests/wys-data.test.ts` asserts the promise cannot come back. **The key itself
is not typed into the sentence** — it is named on screen from
`lib/wys/browser-keys.ts` beside its live value, so a third surviving key would
appear with no copy edit.

**Status: the addition needs Ben's stamp. If he prefers one merged sentence,
that is a rewrite of Final copy and his to make.**

## DM2. Card 2's approved sentence is conditioned, not reworded (Q7, SC-2)

Artboard `5c` card 2 asserts flatly: *"Page analytics, and coarse counts:
someone started, finished a stop, used replay, reached a carry, asked for
depth."* `trackWys` sends nothing at all unless `bct_analytics_consent ===
"granted"` — Q7's ratified full suppression — so for a visitor who declined, and
for a visitor who has not answered the banner, that sentence is false.

What ships: the approved sentence is `claims.analytics.short`, written in this
phase exactly as its `awaiting` descriptor said it would be, and it renders
**only for a browser that granted analytics**. Two authored lines cover the
other two states (`data-analytics-declined`, `data-analytics-undecided`), each
saying plainly that no counts leave this browser. Both are NEW copy.

**Difference from LZ9, deliberate.** Lesson Zero's step-9 card defaults to the
not-sent line *before hydration*. This page renders **nothing** until the
consent key has been read, because card 2 already carries an unconditional
opening (DM3) that is true in every state, and because a line that flips after
hydration is worse on the one page whose subject is what this browser holds.
Same discipline, one surface further.

## DM3. Card 2 gains an opening sentence the artboard does not have

Two mechanisms with two different conditions are running, and the approved
sentence names them in one breath, which reads as one promise with one
condition. So `data-analytics-conditions` (authored, labelled) opens the card:

> Two different things run here, on two different conditions. Ordinary page
> analytics run on every page of this site. Watch Your Step's own counts are a
> closed list, and none of them leaves a browser where analytics were declined
> or never allowed.

Ordinary GA4 page analytics are configured with `send_page_view: true` and
Consent Mode v2 keeps sending cookieless page pings while `analytics_storage` is
denied; Watch Your Step's own events do not. Saying so is the only way the
approved sentence's two halves can each be true of the state they describe.

**A fourth variant exists for a build with no measurement id.**
`data-analytics-unavailable` renders instead when
`NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset, because `GoogleAnalytics.tsx` then
returns `null` and there is no analytics to describe at all. The branch is
decided at BUILD time, so a deployment's prerendered HTML always matches that
deployment's own configuration.

## DM4. The event register — an addition, and the reason it is not optional

The approved sentence names five things. The closed (WYS §19.4) allowlist can
fire **eleven**, including `wys_data_manifest_view` for opening this very page.
A page whose entire subject is what gets sent cannot list five of eleven and let
the list read as complete, and (WYS §37) requires the manifest to describe "what
is actually deployed".

So card 2 carries a `<details>` disclosure — closed by default, in the artboard's
own mono voice — listing every allowlisted event this build can fire and when,
**rendered from `WYS_DECISION_USE`**, the adapter's own decision table. Nothing
is typed: the page cannot fall behind the allowlist, and the two deliberately
unfired events (`wys_view`, `wys_transfer_check_complete`) are absent because the
table says they never fire.

The `firesWhen` strings are the adapter's, not a second learner-facing
paraphrase — a second description of what an event means is exactly the
duplication Standing Order 07 forbids. If Ben wants gentler wording, that is one
edit in `lib/wys/telemetry.ts` and it moves both surfaces.

**Status: NEW. Unapproved.**

## DM5. Card 1 renders nine rows where the artboard draws five

Carried forward from the Phase 2 escalation (build notes §8.4) and now visible.
§7.5's rule is that card 1's rows derive from the declared `WysLocalStateV1`
field set, so every persisted field surfaces and "Generated from what's actually
stored right now" cannot quietly become false. The artboard's four rows (five
lines) render **first, in their drawn order**; the five additions follow:

| Added row | Why |
|---|---|
| Local judgments | (WYS §20) requires it; `5c` omits it |
| Last route · Dismissed notices | (WYS §20) requires last route; `5c` omits it |
| Schema version | falls out of the field-to-row bijection |
| Started | same |
| Last opened | same |

They are marked `source: "new-unapproved"` in the DATA, not in a comment, so
withholding them is a one-line change and no component edit.

**Nothing writes `ui.lastRoute` yet**, so that row reads its empty value. That
is a true rendering of the field, and adding a writer is a new persistence
behaviour, not a Phase 8 task.

## DM6. The key register, and why the sitewide title stays honest (Q6)

Q6's ratified default keeps "What this site knows about you" — a claim about the
SITE — and makes it true by listing `bct_analytics_consent` beside `wys:v1`. So
card 1 carries a small register under its rows, generated from `BROWSER_KEYS`:
each key's name in mono, its **current stored value**, and whether a clear
removes it. A third key added in month three appears with no edit to the page.

The heading "Keys in this browser" and the two dispositions ("removed by clear",
"kept by clear") are authored labels. **NEW.**

## DM7. "not read yet" is not "not set", and it is what a no-JS visitor keeps

§7.3 forbids reading `wys:v1` during render, so the server HTML cannot know what
this browser holds. An em dash there would be a **false statement** — "nothing
stored" — on the one page that promises the rows are generated from what is
actually stored. So every value renders `not read yet` until the effect returns,
and a visitor with JavaScript disabled keeps that value.

The row **labels** still render either way, because the set of fields this
browser can hold is (WYS §18)'s own "This browser can store" list and is true at
every moment.

**Status: the token is authored. NEW.**

## DM8. The confirmation step — no artboard draws one

(WYS §17) requires both destructive operations to "explain exactly what happens
before executing", and `5c` draws three pills and nothing else. So each of
Restart and Clear opens an outlined panel carrying its explanation and the only
control that acts; the pill itself never acts. The explanations are
`RESTART_COURSE_EXPLANATION` and `CLEAR_ALL_WYS_DATA_EXPLANATION` from
`lib/wys/local-state.ts`, written in Phase 2 beside the two functions so the
words cannot drift from the behaviour, and they render through the gate under
"Drafted during implementation — not Ben's words".

**Status: the panel is NEW; the seven sentences inside it are on the Final-copy
list and Ben's wording replaces them if he prefers his own.**

## DM9. The post-clear panel is curriculum, and it is authored

(WYS §20) asks the clear-reload-inspect loop to teach three things, so clearing
opens a tint-teal panel carrying `data-cleared-demonstration` and a "Reload this
page" control:

> The rows above are empty because the keys are gone. Reload and they stay
> empty: there was no server copy to restore, which is the whole difference
> between local state and server data. Restarting the course would have kept
> your rulebook; this did not. Neither one reaches a hosting log.

**It deliberately does not say "nothing was sent."** Clearing fires
`wys_local_state_clear`, which reaches GA4 for a browser that granted analytics,
and claiming otherwise on this page would be the exact failure the page exists
to avoid. **NEW.**

## DM10. The blocked-storage variant, and three inert controls

iOS Safari private browsing throws on `localStorage`, and iPhone Safari is the
primary QA target. When `readWysState()` reports `storageBlocked`, card 1 renders
`data-storage-blocked` instead of nine rows of empty values, and all three
actions are disabled — there is nothing to download, restart or clear. **NEW.**

## DM11. Card 3's eyebrow is a local class, not the shared primitive

`SectionEyebrow` paints `--accent-text-on-tint`, which is correct on the two grey
cards and unreadable on card 3's ink slab, where the artboard uses
`--accent-on-dark` (#7FC8D6). Rather than widen a shared primitive from a route
file, card 3 uses a local `.eyebrowOnInk`. **Request recorded for the gate: give
`SectionEyebrow` a `tone` prop.** Same route Progress took for `GatedText` size
variants.

## DM12. Desktop is extrapolated

`5c` draws the Data page at 390px only. The screen inherits `CourseScreen`'s
centred 720px reading column at 1280px; the card stack, the row rhythm and the
three full-width pills are unchanged. No new information is exposed in the
margin and the IA is not redefined. **Unapproved, like the other fourteen
desktop extrapolations.**

---

# Phase 9 — ship and governance content (`content/ship/*`)

The five ship surfaces as data. The pages that render them are recorded
separately; everything below is a decision about the CONTENT — what the objects
say, where each string comes from, and which of them no artboard settles.

## SHC1. The Crew Manifest is NEW in full — no artboard exists at any width

`/crew` is the only ship surface with no artboard in the approved set, and it
cannot be deferred: the disclosure strip on every page links to it, so a missing
manifest is a dead link out of a transparency claim.

Three of its strings are copy **this build authored** (plan §2.1 permits "Crew
Manifest system descriptions"), and they are the header the page needs:

| Field | Ships as |
|---|---|
| pill | "Crew Manifest · current" — mirrors the Bridge's "The Bridge · current" |
| h1 | "Every system that touched this site" |
| intro | "What each one does, what it can reach, and what it is not allowed to decide. Build crew act once, at build time; runtime crew act while you are on a page." |
| role headings | "Build crew — acted before this page existed" / "Runtime crew — act while you are on the site" |

All of it is `origin: "IMPLEMENTATION_PLACEHOLDER"`, so it renders **with** the
label that says it is not Ben's words — the honest state for a page whose whole
subject is who wrote what. The header references Standing Order 06 by id
(`orderTags: ["order-06"]`) instead of restating it, so the same order-tag check
that guards the Ship's Log guards this too.

The five per-system fields themselves are the packet's, not this build's.
**Status: NEW. Unapproved. Needs Ben's stamp — the wording and the fact that a
governance page ships with no approved design.**

## SHC2. The Ship's Log h1 is in Ben's first person, and this build did not write it

Artboard `5d` heads the Log *"I may change my mind. I won't rewrite the record."*
and the plan's Appendix A records it as a string that must survive verbatim, so
R1 puts it on the page and R8 forbids quietly rewording it. It is still the one
string on these five surfaces that R10 would forbid if this build had authored
it.

Rather than leave that tension in a comment, it is **data**: `shipsLogIntro`
carries `firstPerson: true`, and `tests/ship-content.test.ts` asserts it is the
only first-person string anywhere in `content/ship/` — a second one is a test
failure, not a review catch. The page can withhold or relabel it on a one-line
change.

**Escalated to Ben: keep the sentence in his voice, or replace it with a
third-person line the build may author.**

## SHC3. Q25's supersession machinery is built, and this is what it costs

The Bridge intro ships *"Always current; every earlier state lives in the Log"*.
Q25's ratified default makes that true in architecture rather than in copy:

- `supersedePosition()` (`content/ship/bridge.ts`) is the only sanctioned way to
  replace a Bridge position; it returns the old record as `historical` with
  `supersededBy` and `canonical: false` (plan §6.2 rule 4).
- `supersededPositionItems()` and `shipsLogTimeline()`
  (`content/ship/ships-log.ts`) are where the Log picks it up — entries and
  superseded positions in one sequence, newest first.
- The Log renders it through the `archive` surface, so `renderPolicyFor` returns
  `marked`, never `canon`. A superseded position can appear on the Log and can
  never read as a current one.
- A `historical` record missing `supersededBy` **throws** rather than being
  skipped. Silently dropping it would empty the Log of exactly the state the
  Bridge claims lives there.

`bridgePositions` is empty today, because Ben has written no position — so the
Bridge renders the slot and the Log shows two entries. The machinery is
exercised by tests, not by shipped data. **If Ben would rather not carry it in
v0, the intro sentence becomes a fourth SC-11 copy escalation.**

## SHC4. The Studio tile ships unlinked (Q5)

`href: null` — the data form of an open question. Not `""`, which a renderer
would turn into a link to the current page, and not `/studio`, which is the
preserved Violin for Parents stakeholder page and cannot be relabelled.
**Awaiting Ben's answer: where should "Studio / rented laboratory" point?**

## SHC5. The authority chain does not render publicly, and that is a consequence, not a choice

`content/authority-chain.ts` is `draft` / `IMPLEMENTATION_PLACEHOLDER`, because
the planning packet is not stamped (R5) and its descriptive lines were drafted
during implementation. Under Q21's ratified default (`RENDER_MARKED_DRAFT ===
false`) that means **the four-link chain — keel → Standing Orders → current
state → Ship's Log and snapshots — is not shown to a visitor.** Phase 1 asked
Phase 9 to report the consequence rather than soften the origin, so: it is
reported, and the origin is unchanged. What the ship surfaces do show is the
keel cited by name and link on the Standing Orders page, and the Bridge's mono
state block. Flipping Q21, or Ben stamping the packet, makes the chain public
with no code change.

## SHC6. The keel is cited with no digest, on purpose

The Standing Orders intro renders "Derived from " + `approvalState.keel.name` +
". This site cites it; it doesn't rewrite it." — the middle third is state, not
copy, so a new keel version is one typed value. `citesHash` is a field, and it is
`false` while `approvalState.keel.sha256` is null: (packet: hashing) is freeze →
SHA-256 of the canonical Markdown → publish on yymethod.com/work → **then** cite.
No v2.3 hash is printed anywhere on these surfaces.

## SHC7. Section labels and the date form are pinned in content, not typed into pages

The Bridge's three eyebrows ("WORKING ON", "EXPERIMENT UNDERWAY", "OPEN
QUESTIONS") and the Quarters grid label ("WORK & PROPERTIES") are the artboard's
own words, held once in `content/ship/*` so a surface cannot end up with two
names for one section (§6.8). `formatLogDate()` renders the artboard's
"3 Sep 2026" from the ISO date by parsing the string rather than constructing a
`Date` — `new Date("2026-09-03")` is UTC midnight, and a build machine west of
Greenwich would print the previous day. A log date that moves with the renderer's
timezone is a rewritten record, which is what Standing Order 08 forbids.
**Not a Ben decision; recorded because it is a departure from the obvious
implementation.**

## SHC8. Ben's own material on these surfaces is four labelled empty slots

The Bridge position, the Captain's Quarters portrait, the 60-second audio and
Selected history are slot records in `content/watch-your-step/sources.ts`, each
referenced (never re-typed) by the ship modules. All four are `draft` /
`BEN_AUTHORED`, which `renderPolicyFor` blocks on every public surface, and
`components/provenance/*` accepts no body — so nothing generated can occupy one.
The 60-second audio is deliberately the **same record** the home band and the
WYS landing render: one recording, one slot, three surfaces.

---

# Phase 9 — the `/standing-orders` page

The content decisions for these objects are recorded above under SHC1–SHC8.
Everything below is a decision about the RENDERED PAGE: what a visitor sees that
no approved artboard draws.

## SO1. Desktop is extrapolated

`5d` draws Standing Orders at 390px only, and no artboard renders it at 1280.
The page takes the 390 reading column widened to a centred 720px measure inside
the 1280 shell, with the headline at 40px instead of 32px. Nothing is exposed in
the margin, no section is added, dropped or reordered, and the IA is not
redefined. **Unapproved, like the other fourteen desktop extrapolations.**

## SO2. The vertical geometry is not the artboard's

`5d` pads `70px 22px 60px` because the phone frame carries no site chrome. Here
the root layout mounts the header above and the disclosure strip plus the footer
below (§5.6, Q9 at its ratified default), so the page takes 48px (desktop) /
28px (mobile) of top padding and leaves more room at the foot for the strip. The
horizontal gutter is the artboard's. Same deviation, and the same cause, as
every course screen.

## SO3. The keel is a LINK, where the artboard draws a coloured span

dc.html:241 paints "YY Method Professional v2.3" teal and 500 with no `href`.
The page renders the same words, the same colour and the same weight as an
anchor to `approvalState.keel.url` (`https://yymethod.com/work`).

Reported because it is a change to an approved artboard, and taken because R8
puts a transparency claim's truth in the architecture: a governance page that
names its source without reaching it is a citation the reader cannot check.
Safe-direction under R9 — it adds a route to the source, it removes nothing. The
URL is not typed on the page; it is `standingOrdersIntro.keelHref`, which is
`approvalState.keel.url`, so the keel moves in one place.

## SO4. A hash line exists in the page and renders nothing

`standingOrdersIntro.citesHash` is `false` while `approvalState.keel.sha256` is
null, so **no digest is printed** — this phase's exit criterion, and (packet:
hashing)'s order of operations (freeze → SHA-256 → publish on yymethod.com/work
→ **then** cite). The branch that would render `keelHashLine()` is kept live
rather than left out, so that publishing the digest is a data change and not a
component change (WYS §35: "the code should make these content/config changes
cheap"). Nothing about it is visible today. **Not a Ben decision; recorded
because a reader diffing the page against the artboard will find a branch the
artboard has no counterpart for.**

## SO5. Nothing on this page can render short and look complete

Every string the page paints goes through `gateProse("general", record, …)` and
is released only at `canon`. A Standing Order whose status stopped resolving
would **fail `next build`** rather than disappear from the list. That is a
deliberate departure from the course screens, which render the provenance label
in place of withheld prose: a scenario that says "not Ben's words" is honest,
whereas a list of the rules the site runs on that silently drops its fourth rule
is not. **Not a Ben decision; recorded as a behavioural choice a later phase
should not quietly reverse.**

## BR1. `/bridge` at 1280 is an extrapolation — no artboard draws it

`5d` is a 390px phone. Turn `2d` draws a Bridge desktop, but `2d` is a
superseded register and R1 forbids taking a visual from it. So the desktop
Bridge is this build's, not Ben's: the reading column widens from
`min(100% − 2·gutter, 680px)` to 720px, the h1 goes 32px → 40px, the lead 15px →
17px, the question rows 15px → 16px, and the section labels take
`SectionEyebrow`'s **desktop** ramp (15px/500, no tracking) instead of its
mobile one (12px/600). Nothing moves, nothing regroups, no margin metadata is
added — the IA is the artboard's at both widths, per the plan's own limit on
desktop extrapolation ("must not redefine the IA"). One of the fifteen surfaces
Phase 9 requires recorded here.

## BR2. The state block renders six lines, not the artboard's two

dc.html:235 paints four facts on two wrapped lines: "captain's round: none yet ·
snapshot: 0 pending" / "stamp: not yet stamped · governed by YY Method v2.3".
`bridgeStateLines()` (plan §6.6, built in Phase 1) returns **six** — the four
above plus `status: current` and `sha256: pending publication` — and the page
renders them one per line rather than joining them with middots.

Three deviations in one, all reported:

1. **Six lines, not four.** Both extra lines are approval state, and dropping
   them at the renderer would put the page's presentation back in the page and
   out of `lib/approval-state.ts`, which §6.6 exists to prevent. `sha256:
   pending publication` is not a digest and prints none (Phase 9 exit).
2. **Stacked, not joined.** The artboard's pairing holds only while all the
   lines are short; the moment Ben stamps, four of them change length together
   and the two-line pairing breaks. A joined form would be a layout that is
   true only of the unstamped state.
3. **"captain's stamp:" where the artboard says "stamp:".** That prefix is
   `stampStateLine()`'s, and it is data. It is not retyped here.

Ben's call: whether the Bridge's foot should read as the artboard's two dense
lines. Changing it is a change to `lib/approval-state.ts`, not to this page.

## BR3. The three section labels are `<h2>`, where the artboard has styled text

`5d` draws WORKING ON / EXPERIMENT UNDERWAY / OPEN QUESTIONS as 12px/600 teal
divs. The page renders them at the same size, weight, colour and tracking, as
headings, so the document has an outline under its one h1 and a screen-reader
user can reach the three sections (plan §11.4, WYS §27). Visually identical;
semantically different. Caps stay typed in the copy, never `text-transform`.

## BR4. The EXPERIMENT slab is `CardShell fill="ink"` — 20px padding, not 18px

dc.html:229 gives that one card 18px of padding. `CardShell`'s ink fill is 20px,
which is the padding every other ink card in the approved set carries. Restating
the geometry locally to win 2px would fork a shared primitive from a route file.
Deviation reported, not resolved.

## BR5. The Ben-position slot has a second branch nothing can reach today

`currentBridgePosition()` returns `null`, so the page renders the dashed teal
`BenSlot` — the artboard's state, and the state R10 requires. The other branch,
which renders a position Ben has written, is live in the file and gated at
`canon`: a position at any other status renders the slot instead. **Not a Ben
decision; recorded because the page contains a rendering path the artboard has
no counterpart for, and because a reader must be able to confirm that path
cannot be reached by a draft.**

---

# Phase 9 — the Crew Manifest page (`/crew`)

The page half of SHC1. Everything below is a decision about the SURFACE — how
`content/ship/crew-manifest.ts` is drawn — and every one of them is a decision no
artboard settles, because no artboard for this route exists at any width.

## CRW1. The entire visual is NEW, composed from `5d`, and it is the only such ship page

`/crew` is the one ship surface with no approved artboard. It also cannot be
deferred: `components/DisclosureStrip.tsx` links here from the footer of every
page, so a missing manifest is a dead link out of a transparency claim.

Nothing on the page is transcribed. Every value is borrowed from an approved
`5d` surface, and the borrowing is recorded line by line in
`app/crew/crew.module.css`:

| Element | Register borrowed from |
|---|---|
| status pill | the Bridge's tint-teal "The Bridge · current" (dc.html:217) |
| h1 | 600 32px/1.1 at −.025em, margins 16/10 (dc.html:218, :241) |
| intro | 15px/1.5 in `--body` (dc.html:219, :242) |
| section label | 12px/600 accent (dc.html:221, :227) |
| crew card | grey at radius 22, via the shared `CardShell` (dc.html:262, :268) |
| card title | 17px/600 at −.01em (dc.html:264) |
| field value | 14px/1.45 (dc.html:265) |
| order tag | the Ship's Log's small tag pill (dc.html:266) |

**Status: NEW. Unapproved. Needs Ben's stamp — both the composition and the fact
that a governance page ships with no approved design.**

## CRW2. Provenance is marked once per record, which means five marks on one page

The content phase left this to the page (build notes, Phase 9 decision 6): one
provenance mark per record, or one per section? Every record here is `published`
+ `IMPLEMENTATION_PLACEHOLDER`, so `renderPolicyFor` resolves each to `marked`
and each one owes a §23 label and a mono draft mark.

It is marked **once per record, which is once per card.** A crew member is one
content object with five fields; `ProvenanceMarks` exists because "one record's
provenance is one line, not one line per paragraph"; and a per-section mark would
detach the label from the body it qualifies, which §6.2 forbids. So five cards
carry five identical pairs of mono lines, plus a sixth under the header record.

That is repetitive by construction, and it is the honest form on a page whose
whole subject is who wrote what. **Recorded because a later phase reading it as
visual noise might be tempted to collapse it to one page-level statement — which
would be the exact separation of label from body the substrate exists to
prevent.**

## CRW3. The Standing Order tag is inert, not a link

`crewIntro.orderTags` is `["order-06"]`, and the page renders it through
`standingOrderTag()` as a small pill — the same presentation the Ship's Log gives
an order tag, so one referenced order has one presentation across the two
surfaces that reference orders (§6.8).

It is **not** a link. Two reasons: the Standing Orders page carries no per-order
anchor to land on, so a link would deposit a reader at the top of a nine-card
list and leave them to find 06 themselves; and an interactive tag owes a 44px
touch target (plan §4.6) that a 12px pill has no room for without becoming a
button. Standing Orders is one tap away in the site header either way. **Not a
Ben decision; recorded because "make the tag a link" is the obvious later
change and it has a cost.**

## CRW4. Desktop is extrapolated — one of the fifteen

`/crew` is on the plan's list of fifteen surfaces with no rendering at 1280 (and
it is the only one on that list with no rendering at 390 either). The 390 reading
column widens to the same 720px measure every course screen uses, centred; the IA
is identical at both breakpoints and nothing moves into the margin. **Status:
NEW. Unapproved.**

## CRW5. The role headings are real headings, in the eyebrow register

`SectionEyebrow` renders a `<p>`. This page's two role labels are the only thing
naming its two sections, and a page of sections needs headings a screen reader
can list and `aria-labelledby` can point at — so `.sectionHeading` is an `<h2>`
carrying the eyebrow's 12px/600 accent register locally. Same shape, same
reasoning and same escalation as the Data page's `.eyebrowOnInk` (DM11): the
request for a heading level on the shared primitive is recorded in
docs/facelift-build-notes.md rather than made from a route file.

The labels are sentence case, because the content module writes them that way;
caps are typed in copy on this site and never applied with `text-transform`.

## CRW6. A withheld record loses its whole card, and a withheld header fails the build

Two behaviours no artboard could show:

1. **Card level.** Four of the five packet fields are plain string arrays on the
   record. A card that gated only the lead sentence and then printed
   "What it cannot access" underneath would publish exactly the prose its own
   label said was withheld. So the gate is read once per member and the card
   renders either all of it, marked, or the provenance label alone.
2. **Header level.** The pill, the h1 and the intro are three fields of one
   record. If that record ever stops being renderable the page throws rather than
   printing a title whose body has been withheld — the direction
   `app/watch-your-step/(shell)/data` and `shipsLogTimeline()` both take.

No record on this page is blocked today. Both branches exist so a later status
change cannot open the hole quietly. **Not a Ben decision; recorded as a
behavioural choice a later phase should not reverse to "render what we can".**

## SL1. `/ships-log` at 1280 is an extrapolation — no artboard draws it

`5d` is a 390px phone and no approved artboard renders the Log at any other
width. The desktop page is therefore this build's: the reading column is the 390
column widened to a centred 720px measure inside the 1280 shell, the h1 goes
32px → 40px and the lead 15px → 17px. Everything else is the artboard's — the
pill, the h1, the lead, the 12px card stack, the entry geometry, the outlined
chip, the white order tags and the ink card, in that order. Nothing is exposed
in the margin, nothing is regrouped, and the IA is identical at both widths (the
plan's own limit on desktop extrapolation: "must not redefine the IA"). One of
the fifteen surfaces Phase 9 requires recorded here.

## SL2. The vertical geometry is not the artboard's

`5d` pads `70px 22px 60px` because the phone frame carries no site chrome. The
root layout mounts the header above and the disclosure strip plus the footer
below (§5.6), so the page takes 48px (desktop) / 28px (mobile) at the top and
leaves more room at the foot. The horizontal gutter is the artboard's. Same
deviation, same cause and same values as the other ship surfaces and every
course screen.

## SL3. Every log entry carries two mono lines the artboard does not draw

dc.html:265-277 draws each entry as date · chip · title · body · order tags, and
nothing else. The entries are `published` + `IMPLEMENTATION_PLACEHOLDER` —
shipped build records, not Ben's words — so `renderPolicyFor` resolves them to
`marked`, and §6.2 rule 2 makes the provenance label **and** the draft mark
non-optional for that origin. So each card is followed by:

```
Implementation placeholder — not Ben's words
draft · implementation placeholder · not Ben's words
```

Safe-direction under R9: adding a provenance marker an artboard omits is
permitted and required; removing one is not. The same pair renders inside the
ink `NEXT · CAPTAIN'S ROUND` card, in `--muted-on-dark`. **Not a Ben decision on
whether to show them — they are required. What IS worth Ben's eye is that they
say nearly the same thing twice**, and the second line opens with the word
"draft" while the record's status is `published`: the draft mark is selected by
ORIGIN, not by status (`requiresDraftMark()`), so a published record that is not
Ben's words is marked "draft". That is a substrate string, shared with the whole
course, and this page did not change it — see the build note for the same
observation.

## SL4. The marks sit under the card, not inside it

`LogEntryCard` (Phase 4) renders its body as a `<p>` and exposes no provenance
slot, so a mono line passed as its children would nest `<p>` inside `<p>`. The
label and draft mark are therefore siblings of the card, 8px beneath it inside
the same `<li>`. Visually the pair reads as one object; structurally it is a
card plus two lines. The ink card has no such problem — `GatedText` is a child
of `CardShell` there, so its marks are inside the slab. A `provenance` slot on
`LogEntryCard` would make both cases identical, and that shared-component change
is recorded in `docs/facelift-build-notes.md` rather than made in this phase.

## SL5. A superseded Bridge position renders with no order tag and the default chip

Q25's machinery is wired all the way through: `shipsLogTimeline()` merges
`supersededPositionItems()` with the entries, and a superseded position is gated
on the `"archive"` surface, which can return `marked` but never `canon`. Two
consequences a reader should see:

- **No order tag.** The item carries none, and the page authors nothing, so the
  row has no `Order NN` pill where a written entry would. Tagging it would mean
  typing a Standing Order reference that is not in the record.
- **The chip is the site-wide default.** `BridgePosition` declares no
  `approvedBy` / `approvedAt`, so there is no per-record stamp to read; the chip
  renders `entryApprovalLabel()` with no argument. §6.6 asks for per-object
  approval fields on content records, and this record type has none.

`bridgePositions` is empty today, so this branch renders nothing at all. It is
built because the Bridge's claim ("every earlier state lives in the Log") is
made now, and the first supersession must not require a page change to honour it.

## SL6. The h1 has a withheld branch that can never fire today

`shipsLogIntro` is `published` + `BEN_APPROVED`, so its h1 resolves to `canon`
and the words render alone. The page still routes it through the gate, and if
the record's status ever changed the page would lose its `<h1>` rather than
print a heading the gate had emptied. **A Log with no h1 is the intended alarm**,
not a regression to fix by un-gating the heading. Recorded because a reader
diffing the page against the artboard will find a branch the artboard has no
counterpart for. (The sentence itself is Ben's first person and is escalated at
SHC2; this build did not write it.)

---

# Phase 9 (page) — Captain's Quarters (`/ben`, artboard `5d`)

`5d` draws this screen at 390px and the handoff README lists its copy as
approved. Nothing approved was reworded and nothing was added to the page that
`content/ship/quarters.ts` does not define. What follows is every place the
built page differs from the artboard, plus the four blocks that are empty by
rule.

## BQ1. Ben's own material here is four empty slots, and one of them is the page

The portrait, the 60-second recording and Selected history are labelled slots
(`slot-portrait-quarters`, `slot-hear-ben-60s`,
`slot-quarters-selected-history`), and the Studio tile has no target. So the
page **about Ben** carries no sentence about Ben that this build wrote: the one
paragraph on it is the artboard's own sentence about how the page is populated.
That is R10 and §6.4 working as specified — `MediaSlot`, `AudioSlotPill` and
`BenSlot` have no prose-bearing prop — but it is worth Ben seeing what the
surface looks like in that state before launch. Nothing here can be filled by
this build; every one of the four needs Ben.

## BQ2. The portrait carries a pill AND a mono line; the artboard has one mono line

`5d` puts a single 11px mono line ("portrait — Ben-supplied") at the top-left of
the stripe. `MediaSlot` — the shared primitive, and the only thing permitted to
draw a media placeholder — renders the slot's label in a white overlay pill and
its awaited-asset descriptor as a mono line beneath. Two ways to reconcile that:

- restyle the pill to look like the artboard's mono line, which puts the IBM
  Plex Mono face outside `ProvenanceMono`, the one component §4.8 permits it to;
- keep the primitive's treatment and move its mono line to the top-left, under
  the pill.

The second was taken. On screen: a small white "portrait — Ben-supplied" pill,
"300px Captain's Quarters hero" in mono under it, the name reversed out
bottom-left. **A visual deviation from the artboard, in the safe direction — it
adds a provenance marker rather than removing one (R9) — but it is a deviation
and it is the most visible one on the page.**

## BQ3. The 26px portrait radius is restored with an element selector

`MediaSlot` paints `--radius-card-lg` (22px); `5d` draws the portrait at 26px,
which is `--radius-portrait-lg` — a different radius family that §4.2 keeps
deliberately un-normalised. The page re-points it with a rule scoped to
`.portrait`, because the primitive exposes no class hook and takes no children
by rule. **Request recorded for the gate: a `variant="portrait"` or `radius`
prop on `MediaSlot`.**

## BQ4. The eyebrow over the stripe is a local class, not the shared primitive

`SectionEyebrow` paints `--accent-text-on-tint`, which is unreadable on ink;
`5d` uses `--accent-on-dark` (#7FC8D6) for "CAPTAIN'S QUARTERS". The page uses a
local `.eyebrowOnInk` rather than widening a shared primitive from a route file
— identical to DM11 on the Data page, and the same standing request for a `tone`
prop.

## BQ5. The intro renders at the artboard's 15px, through a structural selector

The shared `GatedText` body is 16px/1.45 ink; `5d`'s intro is 15px/1.5
`--body`. The page restores the artboard measure with `.intro > p:first-child`,
which can only ever reach the gated body element — never the 11px mono line a
`marked` or `blocked` record would render beside it, which must keep the
provenance voice at whatever measure the screen uses. **NEW as a technique on
this route; the underlying request (a size variant on `GatedText`) is already
recorded by Progress and Data.**

## BQ6. Selected history: the artboard's line is passed as the awaited-asset descriptor

`5d`'s dashed card is a bold teal "Selected history" and one sentence. `BenSlot`
draws exactly that shape, so the heading is the slot's label (the record derives
it, so the card and the slot cannot be named two different things) and the
sentence is `quartersHistoryNote.body`, which describes what is awaited and
states the packet's selection rule. **The card is still an unfillable slot** —
the component has no `children`, `text` or `body` prop — and the sentence is
gated first: unless the record resolves to `canon`, the slot falls back to its
own build-language descriptor rather than printing unlabelled prose inside a Ben
slot. The rejected alternative was to render the slot descriptor and the note as
two lines, which puts two near-identical sentences on screen.

## BQ7. Desktop is extrapolated

`5d` draws `/ben` at 390px only; it is one of the ten surfaces with a mobile
artboard and no 1280 rendering. The page takes the same centred 720px reading
column every course screen uses, keeps the artboard's 2-column tile grid (six
tiles fall into 2 × 3 at both widths), and exposes **no** new information in the
margin. The portrait keeps its reserved 300px height and the name its 34px
setting at both widths. The IA is not redefined. **Unapproved, like the other
fourteen desktop extrapolations.**

## BQ8. Vertical geometry moves, because the page is not alone on the screen

`5d` is `padding: 70px 22px 60px` with no site header, footer or disclosure
strip. Plan §5.6 mounts all three on every route, so the page takes 48px of top
padding (28px at ≤700px) and the artboard's own top figure is not reproduced.
Same reason, same direction and already flagged under Q9 for every course
screen; recorded here so `/ben` is not read as an exception.

## BQ9. The tab title stays "Ben" while the page is headed "Ben Chan"

`metadata.title` is unchanged from the Phase 5 stub ("Ben - BenChanTech"),
because `shipNav` labels this node "Ben" and a renamed title would be a renamed
surface. The h1 is the name the artboard reverses out over the portrait. The
artboard's own eyebrow supplies the third name for the same node — "CAPTAIN'S
QUARTERS" — which is the surface's name in the packet and in this plan. Three
labels, one node: **flagged rather than collapsed**, since collapsing them means
either renaming a nav link or editing approved artboard copy.

---

# Phase 9 (gate) — the machine surfaces, and the roster of fifteen

## GT1. The fifteen desktop extrapolations, in one place

The plan requires every one of the fifteen surfaces with no 1280 rendering to be
listed here. They were recorded by the builder of each surface, which is the
right place for the reasoning and the wrong place to count them. The roster:

| # | Surface | Artboard at 390 | Artboard at 1280 | Recorded at |
|---|---|---|---|---|
| 1 | Lesson Zero (`/watch-your-step/start`) | `5a` | none | LZ10 |
| 2 | Today | `5b` | none | Phase 7 (Today view), §T |
| 3 | Plan | `5b` | none | Phase 7 (Plan view), §P |
| 4 | Progress | `5b` | none | Phase 7 (Progress view), §R |
| 5 | Practice | `5c` | none | R9 |
| 6 | Data | `5c` | none | DM12 |
| 7 | Bridge | `5d` | none (`2d` is a superseded register) | BR1 |
| 8 | Standing Orders | `5d` | none | SO1 |
| 9 | Ship's Log | `5d` | none | SL1 |
| 10 | Captain's Quarters (`/ben`) | `5d` | none | BQ7 |
| 11 | `/watch-your-step` landing | `4a` phone | none | **HM3** — built and recorded at Phase 10; was "NOT YET" here while the surface was a Phase 5 stub |
| 12 | `/crew` | none at any width | none | CRW1, CRW4 |
| 13 | `/watch-your-step/stop/[stopId]` | none | none | Phase 7 (shell), §I |
| 14 | `/watch-your-step/end` | none | none | G4 |
| 15 | `/not-found` | — | none | A (whole layers), and unchanged since Phase 5 |

Fourteen of the fifteen were drawn and recorded at Phase 9. Row 11 — the one the
plan calls "the highest-stakes one in the set" — could not be extrapolated to
desktop then, because it had not been built at either width. **Phase 10 built it
at both and recorded it at HM3, so all fifteen are now drawn and recorded.**

## GT2. Four machine surfaces exist that no artboard draws, and no artboard could

`/sitemap.xml`, `/robots.txt`, `/llms.txt` and `/author-ship/state.json` are NEW
in full. They are not visual, so there is nothing to compare them to and nothing
for Ben to look at — but they publish text to the open web with no visual
review, which is why the gate added `tests/machine-surfaces.test.ts` rather than
leaving them to inspection. What they say is derived, never authored: every URL
comes from `content/canonical-surfaces.ts`, every governance line from
`lib/approval-state.ts`, every claim from `content/claims.ts`, and the agent
bootstrap from `content/ship/agent-bootstrap.ts`.

## GT3. `state.json` states no mission, because the site has not stated one

The packet's key set opens with `mission`. No canonical record holds one: the
`/watch-your-step` landing is the human node that will own it (Q3) and that
surface is still a stub. Writing a mission sentence into a JSON file would be
this build authoring the site's purpose in a place nobody reviews — the exact
inversion of R10. So the key renders as an `awaiting` descriptor with a pointer
to the human node, and the JSON says so in band. **When the landing is built,
the mission belongs on that page first and in this file second.**

## GT4. `resolved_decisions` renders the Ship's Log, and `deprecated_assumptions` is empty

There is no separate decision register in this repo, and creating one would be a
second canonical node for something the Ship's Log already is. So
`resolved_decisions` renders the Log's entries with their order tags and their
approval chips — which are all "approval pending", so a machine reader is told
that nothing in the list is stamped.

`deprecated_assumptions` renders superseded Bridge positions through the Q25
machinery and is `[]`, because nothing has been superseded yet. Empty and true,
not empty and unimplemented — the same list fills the moment
`supersedePosition()` is used.

## GT5. Two keys are additions to the packet's list

`claims` and `agent_bootstrap`. The first is required by the plan's own
instruction that `state.json`'s claim strings come from `content/claims.ts` and
are never hand-typed; there is no key in the packet's set that would hold them.
The second is there so an agent that fetches only this file still reads the
instruction that stops it treating a superseded decision as current. Both are
additive, both are derived, and both are named here so the divergence from the
packet's key set is Ben's to accept or drop.

## GT6. The sitemap carries no `lastModified`, `priority` or `changeFrequency`

All three are optional, and all three would be assertions this build cannot
support: there is no per-page modification record, so any date would be
generated. On a site whose subject is provenance, an invented freshness date is
the worst kind of small lie. The sitemap carries URLs and nothing else.

`/robots.txt` adds no `disallow` rule for the same reason — every rule it could
add would describe a surface that does not exist.

## GT7. `/watch-your-step` was still a Phase 5 stub — CLOSED at Phase 10

Not a Phase 9 deviation; a Phase 7 task that did not land (plan Phase 7,
"Landing: centred hero, mobile demo card, dark instructor pill…"). It matters
here because Phase 9's surfaces point at it: the nav's first item, the sitemap,
`llms.txt` and `state.json`'s `mission` key all name `/watch-your-step` as a
canonical node, and today that URL renders "in build". Nothing is dead and
nothing claims otherwise, but the highest-traffic entry in the ship nav is a
placeholder. **Flagged for the next phase, not patched here** — writing the
landing at the gate would be writing the pitch, which is exactly the copy R10
reserves.

**Closed at Phase 10.** The landing is built from the `4a` phone artboard, its
copy comes from `content/watch-your-step/landing.ts` (approved artboard text,
`BEN_APPROVED`, cited per variant), and no pitch was written at a gate. See HM3
for the desktop extrapolation and HM5-HM7 for what the surface renders while Q21's
default holds.

## GT8. Three headings in `llms.txt` are authored group names

"The Author Ship", "Watch Your Step", "Ecosystem and infrastructure", "Legal and
disclosure", "Machine mirrors", "Home". They are markdown headings over lists of
links the site already names, not claims, and they are pinned in
`content/canonical-surfaces.ts` so a group cannot end up with two names. Listed
because they are strings this build wrote and nobody approved.

## GT9. `AGENTS.md` gains a section

The four-sentence bootstrap, quoted, plus four pointers to where the things it
names actually live. `AGENTS.md` is a repo file rather than a public surface, so
this is a build-facing addition — but it is copy, it was added by this build,
and `tests/machine-surfaces.test.ts` binds it to
`content/ship/agent-bootstrap.ts` so the two can never disagree.

---

# Phase 10 — `/` and the Watch Your Step landing

## HM1. The home page now carries TWO `<h1>`s, and that is a consequence of Q2

The `4a` hero headline ("The AI course that never asks you to trust AI.") is the
page's primary heading. The preserved foyer keeps the `<h1>` it shipped with
("Come on in - even if you're AI."), because demoting it to `<h2>` would be a
semantic edit to preserved markup and constraint 2 does not distinguish between
editing a word and editing the element that carries it.

Two `<h1>`s is valid HTML and is not a WCAG failure, but it is a real statement
about the page: **there are two pitches on one URL now**, which is exactly what
Q2 asks about. If the answer to Q2 changes — interleaved rather than appended,
or the foyer moved to its own route — this resolves with it.

The `.hero-foyer` rule steps the second headline down from 66px to the 44px
section register so the visual hierarchy says what the DOM cannot, and the
foyer's copy is untouched.

**Status: a consequence, flagged. Ben's call under Q2.**

## HM2. The mobile home page is extrapolated — `4a`'s phone is the OTHER page

`4a` draws a 1280 home page and a 390 `/watch-your-step` landing. **There is no
approved mobile home page**, so everything below 900px on `/` is composed from
the desktop block order plus the landing's own treatment.

One thing the artboards do settle and this build carries across: **the desktop
hero is left-aligned and the mobile hero is centred.** That alignment change is
theirs, not this build's.

What is this build's: the single-column collapse order, the 32px slab padding,
the four-move grid becoming one column, and the nine-cell path row becoming a
horizontally scrolling strip (declared on the shared `.stopStrip` primitive, so
every surface that draws nine cells gets the same behaviour).

**Status: NEW. Unapproved.**

## HM3. `/watch-your-step` at 1280 — row 11 of the GT1 roster, now drawn

The landing was the one surface in the fifteen-item desktop-extrapolation roster
that could not be extrapolated, because it had not been built at either width
(GT1 row 11, GT7). It is built now, and the desktop rendering follows the rule
the other fourteen follow: **the reading column widens inside the 1280 shell and
the composition does not change.** No second column, no re-ordered blocks, no
desktop-only IA. The measure grows from 390 to 640, and the headline from 38px
to 44px.

**Status: NEW. Unapproved.** GT1 row 11 can now be read as recorded here.

## HM4. The Data page link label is the phone's wording on BOTH breakpoints (Q6)

`4a` desktop writes "exactly what this site stores about you" (dc.html:414) and
`4a` phone writes "See what this site knows about you" (dc.html:474). Q6 is
ratified: one pinned link label, and it is the phone's.

So the desktop home page renders a different string from the one drawn in the
approved artboard. That is an **amendment to Final copy**, in the same class as
the Ship's Log chip ("Log" → "Ship's Log") already recorded at the Phase 6 gate,
and for the same reason: one node cannot have two names.

**Status: a deliberate departure from an approved artboard. Needs Ben's stamp.**

## HM5. Nine path cells that cannot show their titles, and what they show instead

Every stop title is `draft` + `IMPLEMENTATION_PLACEHOLDER` — a working scaffold
(WYS §11), not Ben-approved doctrine — so under Q21's ratified default the
`4a` cells cannot render "Start With Distrust", "Task Before Prompt" and the
rest. **They show the derived stop name instead** ("Lesson 0", "Stop A", "Stop
B"), with the scaffold footnote underneath.

The visible cost: a cell reads "A · 3 visits" over "Stop A", which repeats the
letter. The alternatives were an empty cell (reads as broken), the provenance
label at 140px (does not fit and is not a title), or the draft title itself
(which is the thing Q21 decides). The redundancy disappears the moment Ben
answers Q21 — no component changes, the titles simply become renderable.

**Status: a consequence of Q21, flagged.**

## HM6. "A · 3 visits" counts the three-day cadence, on a page with no learner

`4a` writes "A · 3 visits". A visit count needs a cadence, and `/` and
`/watch-your-step` read no local state at all, so there is no visitor pace to
count in. The cells count `cadencePaths.days3`, because that is the path whose
length is the number the approved artboard draws (R1).

Two things this is not: it is not a typed 3 (it is the path's length, so a
curriculum change moves the cell), and it is not a claim that every learner
takes three visits — the hero paragraph directly above says "2 to 5 short
visits", which is the full range.

**Status: an interpretation of an approved number. Reported.**

## HM7. The landing's audio slot is a pill where the artboard draws a text line

`4a`'s phone writes the instructor card's audio affordance as plain text:
"▶ Hear Ben, 60 seconds · Ben source". The landing renders the shared
`AudioSlotPill` instead — the same primitive the desktop instructor band uses —
which carries the **fuller** slot descriptor, "Ben source · slot awaiting
selection".

R9 direction: more provenance than the artboard, never less. The phone's shorter
"· Ben source" reads like an attribution for something that exists; the longer
one says the recording has not been chosen, which is true.

**Status: a safe-direction override of an approved artboard. Reported.**

## HM8. The pre-commit note is desktop-only, exactly as the artboards draw it

`4a` puts "You commit before you see anything. That's the whole method." under
the Commit pill at 1280 and draws nothing there at 390. Unlike the three R9
overrides plan §6.3 names — the `DraftMark`, the distribution caption, the Reset
control, all of which the phone also omits and all of which this build restores
— **this omission removes no provenance mark and makes no state transition
unreachable.** So R1 governs and the artboard is followed as drawn.

Recorded because it is an asymmetry between breakpoints that a reader will
notice and could mistake for an oversight.

## HM9. Two class-contract findings resolved by adding rules, not by editing markup

Phase 0 measured two `className` tokens with no rule (`hero-foyer`, `secondary`)
and two rules with no `className` (`.hero-principle`, `.card-eyebrow`). Phase 10
closes all four, and both registers are now empty and asserted exactly.

The two orphan RULES retire — they had no consumer at all, and no route, `href`,
id, metadata title or word of copy is involved in either.

The two orphan CLASSES gained rules rather than being deleted from `app/page.tsx`.
That is a visual change to the preserved home page, so it is named here:

- **`.hero-foyer`**: no top padding, and the headline drops from the 66px page
  register to the 44px section register — the foyer hero is the second hero on
  the page now.
- **`.audience-button.secondary`**: `--tint-grey` fill, no border, no shadow,
  against the primary's ink. Deliberately not `--tint-teal`, which is reserved
  for "current / next / selected" and neither button is selected. Until now
  nothing styled the "I'm AI" button at all.

**Status: a visual change to an as-live surface. Reported.**

## HM10. The `4a` disclosure strip is the sitewide one, not a second copy

`4a` draws a disclosure strip between "How the site is run" and the footer. The
site already renders `components/DisclosureStrip.tsx` on every route from
`app/layout.tsx` (§5.5), immediately below `<main>` — which is the same place on
the page. No second strip was composed. The block order the visitor sees matches
the artboard; the DOM node belongs to the layout rather than to the page.

## HM11. The committed state of the hero demo ships and cannot currently be reached

The ink judgment card with its mono draft line, the distribution card with its
caption, and the two-button actions row are all built, through the render
policy, on both breakpoints. No screenshot in the handoff shows them, because
the artboard's committed state is behind a prototype conditional.

Under Q21's ratified default they render for nobody: the scenario's own prose is
blocked, so the exercise does not run and there is nothing to commit. **The home
page's demo card is currently a scenario pill and a provenance line.** That is
the honest state of a course whose content Ben has not approved, and it is worth
seeing plainly before deciding Q21 — it is what a visitor gets today.

---

# Phase 11 — the legal and disclosure refresh

Six pages were refreshed in place. The entries below are the parts of that
refresh that Ben has not approved: prose this build authored, one visual
consequence of the provenance substrate, and the two preserved clauses that were
narrowed. Every sentence named here is Final-copy escalation territory, and
`docs/facelift-copy-diff.md` is the written diff plan §8b.4 asks for.

## LG1. Thirteen authored legal paragraphs, all labelled, none approved — eleven in `content/legal.ts`, two moved off Ben's name in `content/claims.ts`

`content/legal.ts` holds thirteen records. **Eleven of them are prose this build
wrote** at `published` + `AI_SYNTHESIS`, so each renders with "Drafted during
implementation — not Ben's words" and its mono draft mark, exactly as the Data
page's authored strings do. Two are spec wording at `published` +
`BEN_APPROVED` and render unlabelled: `legal-terms-non-goals` (WYS §3.5) and
`legal-rulebook-ownership` (WYS §16).

`content/claims.ts` additionally gained seven `full` variants that Phase 11 was
scheduled to write. Five of those sit on `BEN_APPROVED` records and therefore
render as canon, so the rule applied to them was narrow: **a `full` on a
Ben-approved record may state only what its cited sources state**, and each one
names its own source per variant. They are longer presentations of a claim the
artboard or the spec already makes — never a new claim wearing an old record's
origin. That distinction is the whole of the Phase 6 gate's finding, applied
again, and it is worth checking by hand:

| Record | Cited as | What it presents |
|---|---|---|
| `zero-ai.full` | 4a strip · WYS §22 · WYS §28 | no runtime model call; coach is a disabled schema; no AI or chat SDK in the bundle |
| `ai-assisted-ben-approved.full` | 4a strip · 4a how-the-site-is-run · packet Crew Manifest | AI as crew; each system named with access and limits |
| `ai-role-boundaries.full` | 4a how-the-site-is-run · packet Captain's Stamp · lib/approval-state.ts | only a person signs; the state is data; the Log records changes |
| `localStorage.full` | WYS §17 · WYS §18 · lib/wys/local-state.ts | §18's "This browser can store" list, plus the key name |
| `analytics.full` | WYS §18 · WYS §19 · lib/wys/telemetry.ts | §18's "Ben may receive" list, plus the two closed allowlists |

The two remaining records — `provenance` and `privacy-disclosure` — were
authored, so they **moved off** `BEN_APPROVED`: both are now `published` +
`AI_SYNTHESIS` and render labelled. `captain-stamp.full` is still awaiting Ben
and is the only unwritten variant left in the module.

**Status: NEW. Unapproved. Every sentence is in docs/facelift-copy-diff.md.**

## LG2. Provenance marks now appear on legal pages

This is the visible consequence of LG1 and it deserves its own decision.
`/privacy` carries five "Drafted during implementation — not Ben's words" lines
with their draft marks; `/accessibility` carries three; `/cookies`,
`/ai-disclosure`, `/terms` and `/copyright` carry three, two, one and one
(counted in the prerendered HTML, not estimated).

The case for it: the substrate treats a legal claim like every other claim, and
a page that hid the provenance of AI-drafted prose while `/ai-disclosure`
promised provenance on every claim would be the exact contradiction §8b exists
to stop.

The case against it: "draft · implementation placeholder" under a paragraph of a
privacy policy can read as though the *policy* were provisional, which is not
what it means — the policy is in force; the sentence has not been stamped.

**Not resolved by this build.** It ships marked. Changing it is one line in
`components/LegalProse.tsx`, and the alternative worth considering is a single
page-level provenance note rather than a per-section one.

## LG3. Two preserved clauses were narrowed, and that is a copy edit

Plan §3.0 says the only intentional line-level removal in the build is
`app/globals.css:1`. Two clauses on the legal pages are the exception, and both
were **narrowed by adding one word** rather than rewritten:

- `/privacy`: "…uploads, or **server-side** personalized user memory."
- `/ai-disclosure`: "…user account, or **server-side** persistent user memory."

Both became false when `lib/wys/local-state.ts` shipped. §8b.2 uses the word
"Correct" for exactly these two sections, and R8 forbids leaving a false public
claim standing while adding a true sentence beneath it. Every other word of both
paragraphs, and every heading on all six pages, survives verbatim —
`tests/legal-claims.test.ts` asserts both.

**Status: a copy edit to preserved legal text. Reported for Ben's approval.**

## LG4. The Q23 contrast deviation is now published on `/accessibility`

§B1's measured numbers reach the public site: 5.47:1 for the darkened teal on a
tint, 3.23:1 for the muted disabled label, and the 1.69:1 it replaced. The page
had to say something, because it publishes a contrast claim and the claim is
only true because of the deviation. If Ben prefers option (b) or (c) from §B1,
this paragraph changes with the token.

## LG5. `/accessibility` states a rule where §8b.2 asked for a shipped fact

§8b.2 asks the page to describe "transcripts alongside Ben audio" and "text
alternatives for fictional artifacts". Neither has shipped: the artifact bank is
empty and `public/` gained no files. So the page states the rule that is
enforced in the type system — `accessibilityText` is non-optional, a media slot
has no prose prop — instead of claiming an alternative that does not exist. A
claim ahead of the fact is the one thing §8b.1 forbids outright.

## LG6. `content/legal.ts` is a new content module, not a tenth claim

packet: one-definition names nine canonical components and `CLAIM_IDS` is that
list. A correction belonging to one legal page is prose about that page, not a
tenth component of the site's claim vocabulary, so it lives in its own module
and is registered in `tests/canonical-text.test.ts`'s two governance arrays
alongside the rest. **This is a structural addition, reported** — the alternative
was inflating a list the packet fixed.

## LG7. `docs/facelift-legal-diff.md` is a pointer, not a document

The Phase 11 brief named `docs/facelift-legal-diff.md`; plan §8b.4 and the
Phase 11 task table name `docs/facelift-copy-diff.md`. The plan is the contract,
so the diff lives at the plan's filename and the other is a one-line pointer to
it. Two copies of a diff about drift would have been an unfortunate way to
create some.

---

# Z. Phase 12 — the hardening gate's own changes

Four items. Three are changes this gate made to shipped surfaces; one is a task
it could not perform. All four are here because §Z's rule is the same as the rest
of the file's: **a visible change to an approved-as-live surface gets an entry,
even when the change is a correction.**

## Z1. The preview deployment, and the GA scoping decision it hides

See **THE PREVIEW** at the head of this file. Summary: the branch was not pushed
(the constraint outranks the task row), so no preview URL exists, and
**`NEXT_PUBLIC_GA_MEASUREMENT_ID`'s per-environment scoping is unverified and
must be settled before anyone pushes** — an unscoped variable puts preview
traffic into the production GA4 stream that user constraint 4 pins.

**Ben's decision, not a build decision.**

## Z2. Five interactive rules grew to a 44px hit area, and three surfaces moved

`/accessibility` publishes *"Buttons, links in navigation and course controls are
at least forty-four pixels tall."* Measured in a live browser at the Phase 12
pass, five rule sets were below it:

| Rule | Was | Now | Mechanism |
|---|---|---|---|
| `.site-footer a` | 42.5px | **44.5px** | `padding-block: 10px → 11px` |
| `.shipNav a` (header) | 42.5px | **44px** | `min-height: 44px` + `inline-flex` centring |
| `.desktop-nav a` (header ecosystem row) | 41px | **44px** | same |
| `.brand` | 32px | **44px** | same |
| `.summary` — the Data page's `key: wys:v1 · raw JSON ↓` | 16.5px | **44px** | `min-height` + `flex` centring, with `.disclosure`'s 10px top margin dropped to absorb half the growth |

**What moved on screen, measured after:**

- **390px: the header is unchanged at 72.5px.** Its height was already set by the
  44.5px "Menu" button, so the brand growing to 44px cost nothing.
- **1280px: the header grows 3px** (139.5 → **142.5px**), entirely from the
  ecosystem nav row.
- **Footer links gain 2px each** — with seven links in the tallest group, the
  footer is a little taller on every page.
- **The Data page's disclosure card grows 17.5px**, and the drawn gap between the
  key list and the words moves **10px → ~13.75px**.

**Why it is here rather than in the build notes.** These are visible geometry
changes to surfaces `4a`, `5c` and `5d` draw, and to every preserved page's
footer. **No character of copy changed**, and the 11px mono line the artboard
draws for the Data disclosure is unchanged — only the box around it. But plan R8
("a false public claim is fixed in architecture, never in copy") left no other
move: the alternative was narrowing a published accessibility sentence to fit the
CSS, which is exactly what R8 forbids.

**Ben should know one thing about how this was missed.** The test guarding the
claim asserted that `min-height: 44px` appeared *somewhere* in `app/globals.css`.
It was green the whole time four navigation rules sat under 44px. It has been
replaced with a per-rule check that reads each named rule body individually and
does the footer's padding arithmetic inside the assertion; it is
negative-controlled. `docs/facelift-qa.md` §7.3.

## Z3. `package.json` gains a `sideEffects` array, and one module lost a derivation

**Not a visual change — a build-behaviour change, which is why it is reported
rather than left in the build notes.**

The Phase 12 doctrine audit found that the withheld draft curriculum was being
**published in the client JavaScript**: a 19.8 kB chunk loaded as `<script async>`
on **every page, `/contact` and `/studio` included**, carried the entire scenario
bank verbatim — settings, decision moments, every choice label, and the internal
authoring notes — all of it `status: "draft"`, i.e. blocked under Q21. The DOM
drew "Implementation placeholder — not Ben's words" while the page's own asset
graph shipped the words. Full write-up: `docs/facelift-captains-round.md`
question 8.

Three changes closed it, and two of them are worth Ben's attention:

1. **`"sideEffects": ["*.css"]` in `package.json`.** Without it webpack must keep
   whole modules and cannot drop the scenario and week records from a chunk that
   only wanted an id list. `"*.css"` keeps `globals.css` and every CSS module
   side-effectful; **verified after the change** — 9 CSS files / 81,306 bytes
   still emitted, stylesheets linked on every page, `--accent-text-on-tint` and
   `.skip-link` still present, 44/44 module classes on `/practice` still ruled.
   **It adds no package**; `package-lock.json` is untouched.
2. **`WYS_STOP_IDS` is now a literal list** rather than `wysWeeks.map(w => w.id)`.
   This is **not** §6.9's forbidden hardcoded count — `stopCount()` is still
   `wysWeeks.length` and no `9` is typed anywhere — and a new test, *"the stop id
   vocabulary is exactly the stops, in order"*, makes drift a suite failure.
3. `CurrentStopGate` now receives plain stop shapes as a prop and imports no
   content-record module, which is the module-graph twin of the projection the
   prop path already performed.

**And the guarantee is now a script, not a habit.**
`scripts/check-bundle-provenance.mjs` runs as the last step of `npm run build`,
enumerates every record whose render policy is `blocked`, and fails on any of
their ≥5-word strings appearing in a client bundle — **583 withheld strings, 54
bundles, 0 found.** Negative-controlled: reverting only the `sideEffects` field
makes it fail with the scenario bank.

## Z4 (= SL7). The Ship's Log now has three entries where `5d` draws two

A third entry was added at this gate: **"Site rebuilt to the approved design;
nothing removed"**, dated 2026-09-04, at `approval pending` like the other two,
tagged Orders 05 / 08 / 09.

**Why this is not artboard drift.** A log is append-only and time-ordered. The
artboard is a snapshot of the Log on the day it was drawn, not a fixed-height
card, and a Log that cannot gain an entry is not a Log. The facelift build is the
first thing this repo did that the Log exists to record.

**What it costs, stated plainly.** `/ships-log` renders one more card than `5d`
draws; the new entry sorts **first**, because the timeline is newest-first, so it
is the first thing on the page. Its body is factual build description authored by
this build (plan §2.1 names "Ship's Log entry bodies" as copy the build writes),
it is `origin: "IMPLEMENTATION_PLACEHOLDER"`, and it therefore renders **with the
label saying it is not Ben's words**. `/author-ship/state.json` gains a matching
`resolved_decisions` row.

**Ben's call:** whether the entry belongs, and whether its wording is his to
rewrite before it is stamped.

---

# Completeness index — what is on this list, and how to read it

The plan asks that this file list **every deviation from the approved artboards
and every NEW or unapproved surface**. It does. This index exists so that can be
checked rather than trusted.

## Every NEW surface — nothing on this list is drawn by an approved artboard

| Surface | Entry |
|---|---|
| The compact mobile header (`<details>` menu) | **F1** |
| The footer as the complete mobile path to every link | **F2** |
| The stacked mobile disclosure strip | **F3** |
| Root chrome on course and ship screens | **F4** |
| `/_not-found`, `error`, `global-error` | **F5** |
| Header behaviour between 700px and the artboard width | **F6** |
| `/crew` — the Crew Manifest, **NEW in full, at every width** | **CRW1** |
| `llms.txt`, `robots.txt`, `sitemap.xml`, `author-ship/state.json` | **GT2** |
| The whole interaction-state layer (`:hover`, `:focus`, `:active`, transitions, error / empty / loading) | **A1** |
| The twenty-primitive inventory | **A2** |
| Fifteen desktop (1280px) compositions on course and ship screens | **GT1** |
| Lesson Zero steps that no artboard draws (five of ten) | **LZ1** |
| `/watch-your-step/end` — the completion surface, no artboard geometry at all | **G1–G5** |
| Practice's three replay states | **R3** |
| Progress's six rulebook controls | **R4** |
| The Data page's confirmation panels and post-clear panel | **DM8, DM9** |
| The optional-practices block on Plan | **P1** |
| `AGENTS.md`'s new section | **GT9** |

## Every deviation from an artboard that does settle the question

| Deviation | Entry |
|---|---|
| `--accent-text-on-tint` — the Q23 contrast miss | **B1** |
| Commit is ink, not `5b`'s teal (Q17) | **B2**, **T5** |
| Selection no longer reflows (Q18) | **B3** |
| `:focus-visible` stays 3px / 3px | **B4** |
| The blueprint scaffolding retired (six `aria-hidden` lines on `/`) | **C** |
| Seven identity-swap deltas, **D-a** to **D-g** — including **D-g**, the twelve rule sets that lost `text-transform: uppercase` | **D** |
| Departures from an artboard that does settle it | **G** |
| Phase 6 content-model departures and escalations | **H1–H7** |
| The tab shell, per-stop route and JUDGE composite | **I1–I8** |
| Plan view — four authored strings and the §12 gap | **P1–P6** |
| Today — six departures | **T1–T14** |
| Practice — eleven authored strings and one narrowing | **R1–R11** |
| Progress — derived counts and a narrowed row | **R1–R10** (Progress block) |
| Lesson Zero — fourteen | **LZ1–LZ14** |
| Data page — twelve | **DM1–DM12** |
| Standing Orders / Bridge / Crew / Ship's Log / Quarters | **SO1–SO5, BR1–BR5, CRW1–CRW6, SL1–SL7, BQ1–BQ9** |
| Home and the WYS landing | **HM1–HM11** |
| Legal and disclosure refresh | **LG1–LG7** |
| Governance and machine surfaces | **GT1–GT9** |
| **Phase 12's own changes** | **Z1–Z4** |

## What is deliberately NOT here

- **What was not built.** That is `docs/facelift-deferred.md`.
- **Why a thing was built the way it was.** That is
  `docs/facelift-build-notes.md`.
- **Measurements.** Those are `docs/facelift-qa.md` and
  `docs/facelift-baseline.md`.
- **The two preserved sentences that were narrowed by one word.** Those are copy
  edits to live pages, and they live in `docs/facelift-copy-diff.md` §1 — but
  they are named again here so a reader of this file does not conclude no
  preserved copy changed: `/privacy` and `/ai-disclosure` each gained the word
  **"server-side"**, because the unqualified sentence was false.
