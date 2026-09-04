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
