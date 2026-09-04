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
