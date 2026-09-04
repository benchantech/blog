# Facelift — NEW and UNAPPROVED, for Ben's stamp

Everything on this page is a **visual decision this build made that no approved
artboard settles**, or a **deliberate departure from one that does**. It is kept
separate from `docs/facelift-build-notes.md` so that "what Ben still has to look
at" is one short list rather than something to be excavated from build notes.

Nothing here is written in Ben's first person. Where a source needs Ben's words,
the build renders a labelled empty slot (plan R10).

Opened at Phase 4 (the design system). Later phases append.

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
`scale-line`, `scale-bar` returns `0` across `app/` and `components/`. A line
range would have stranded the `@media (max-width: 700px)` members of each family,
and the className→rule scan only checks one direction, so it could not have
flagged the orphans.

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
