# Facelift build notes

Working notes for `docs/bct-facelift-assimilation-plan.md`. Started at Phase 0.
Measured numbers live in `docs/facelift-baseline.md`; deferrals live in
`docs/facelift-deferred.md` (Phase 12). This file carries the registers, the
contracts and the reported deviations.

Nothing here is written in Ben's first person. Where a source needs Ben's words,
the build renders a labelled empty slot (plan R10).

---

## 1. The deletion contract

**Nothing is deleted. Nothing is renamed.** A rename breaks a URL just as surely
as a deletion.

At every phase gate, both of these must hold:

```sh
scripts/check-no-deletions.sh          # exits 0
npm test                               # tests/preserved-surfaces.test.ts green
```

The script runs exactly the two commands the plan §3.0 gate names, against the
committed range and again against the working tree and index, so the gate is
useful before the phase commit lands as well as after it:

```sh
git diff --name-only -M --diff-filter=D main...HEAD   # must print NOTHING
git diff --name-only -M --diff-filter=R main...HEAD   # must print NOTHING
git diff --name-only -M --diff-filter=DR HEAD         # must print NOTHING
```

**Never use `git diff --stat` as this gate.** `--stat` has no removed-files
field: a deleted route prints as `app/terms/page.tsx | 56 --`, visually identical
to a heavily edited file, so a reviewer following a `--stat` instruction would
pass the gate on a branch that dropped a preserved route. `--stat` is a reading
aid only.

The gate is **removed or renamed files / routes / links — never a line count.** A
token-value rewrite of a 933-line stylesheet legitimately changes many lines.

`tests/preserved-surfaces.test.ts` shells out to the script, so `npm test` fails
on a deletion. It also asserts, independently: 11 route page files, 3 redirects,
7 outbound hrefs (with the two `yymethod.com` hrefs asserted **separately**), and
5 in-page anchor targets plus their referencing side.

**The single intentional line-level removal in the entire build** is
`app/globals.css:1`, the render-blocking Google Fonts `@import`, replaced by
`next/font/google` in Phase 4. If any other removal looks necessary, it is not:
add and keep (plan R7).

---

## 2. UNRESOLVED_CLASSNAMES register

`className` tokens applied in a `.tsx` file with no matching rule anywhere.
Allowlisted in `tests/class-contract.test.ts` (mode 1). **Resolution lands in
Phase 10, which empties this list.** The allowlist is asserted *exactly*: a
stale entry fails the test, so a fix and its de-registration land together.

| Token | Applied at | Finding | Scheduled |
|---|---|---|---|
| `hero-foyer` | `app/page.tsx:8` — `className="hero hero-foyer"` | No `.hero-foyer` rule exists in `app/globals.css` or anywhere else. The class does nothing today. | Phase 10 |
| `secondary` | `app/page.tsx:26` — `className="audience-button secondary"` | `grep -n secondary app/globals.css` returns only `.secondary-results` at `:583`, `:590`, `:595` — a different, live selector. `.audience-button.primary` (`:228`) styles the first hero button and **nothing** styles the second, so the two hero buttons are asymmetric **by accident**, not by design. | Phase 10 |

## 3. ORPHAN_RULES register

Class selectors defined in `app/globals.css` and referenced by no `className` in
any `.tsx`. Allowlisted in `tests/class-contract.test.ts` (mode 3). **Resolution
lands in Phase 10, which empties this list.**

These are a **different kind of finding** from §2 and are deliberately kept in a
separate list. A `className → selector` scan never visits an orphan rule, so an
orphan can never be reported "unresolved"; parked in `UNRESOLVED_CLASSNAMES` it
would sit there forever and let Phase 10's "remove them from the allowlist" step
pass for an item that was never in scope.

| Selector | Defined at | Finding | Scheduled |
|---|---|---|---|
| `.hero-principle` | `app/globals.css:178` | Referenced by no `className` in any `.tsx`. A complete rule block (max-width, margin, font) with no consumer. | Phase 10 |
| `.card-eyebrow` | `app/globals.css:162` | **Measured addition to the plan's one-item list** — see deviation D2 below. One member of the `.welcome-label, .eyebrow, .question-label, .card-eyebrow, .room-number` selector group; the other four are live, this one is referenced nowhere. | Phase 10 |

---

## 4. Decisions settled at their build-now default in Phase 0

### 4.1 The test-runner CSS question (plan Q15 / Phase 0)

**Settled at the build-now default. `package.json` is unchanged and
`tests/css-stub.mjs` was NOT created.**

The problem: `package.json:11` runs `node --import tsx --test tests/*.test.ts`.
`tsx` transforms TSX, but Node cannot load a `.css` specifier, so importing any
component that imports a co-located `.module.css` dies with
`ERR_UNKNOWN_FILE_EXTENSION` and takes the whole test file with it. Q15's default
forbids adding a browser harness, so this had to be settled before Phase 1 writes
the provenance tests.

What ships:

- **(a) The load-bearing logic is rendering-free.** `renderPolicyFor()` and the
  `(surfaceKind, origin) → label` mapping live in `lib/content-status.ts` with no
  JSX and no CSS, and are unit-tested there directly (Phase 1).
- **(b) The label is structurally unavoidable at the type level.** `label` is a
  required, non-optional prop derived from the content object, with no
  `children` overload — so the component-level guarantee is a **compile error**,
  not a runtime assertion.
- **(c) The ~10-line CSS stub loader is NOT registered.** It is available if a
  component-level test is still wanted after (a) and (b): a `module.register`
  hook returning `export default {}` for `.css`, added as
  `node --import tsx --import ./tests/css-stub.mjs`. Adding it later is a
  one-line `package.json` change and a new file — no deletion, no rename.

Zero new dependencies either way. `npm run test`'s glob is unchanged.

**Test file placement rule, restated because it is easy to get wrong:**
`tests/*.test.ts` is **not recursive**, and `tests/**/*.test.ts` under `/bin/sh`
expands to `tests/*/*.test.ts`, which matches subdirectories **only** and would
silently drop `tests/route-resolver.test.ts`. **Every new test is a flat file
directly in `tests/`.** Do not change the glob.

### 4.2 Lint (plan Q14)

`npm run lint` is non-functional: `next lint` is deprecated and no eslint config
exists, so it drops into an interactive prompt. **Default taken: lint is not an
acceptance gate**, and this is said plainly rather than quietly skipped. Adding
`eslint.config.mjs` is new scope and needs Ben.

### 4.3 Browser-level tests (plan Q15)

`§29.2`'s six integration flows need a harness (Playwright) that `§37`'s
"no unnecessary dependency" rule discourages. **Default taken: manual QA,
reported as manual.** The pure-module halves ship as automated tests regardless.
This is a genuine tension between two spec sections, reported rather than
resolved silently.

---

## 5. Deviations reported from Phase 0

| # | Deviation | Reason |
|---|---|---|
| **D1** | `.gitignore` gained one additive line, `!.env.example`. Plan §3.2 lists `.gitignore` as "PRESERVED AS-IS — zero edits". | `.gitignore:11` is `.env*`, which ignores `.env.example`, so the Phase 0 deliverable would have been created and then silently never tracked — the deliverable would not exist for anyone who clones. The line adds a negation and removes nothing; `git ls-files --others --exclude-standard` now lists `.env.example`. No other line of `.gitignore` changed. Reversible in one line if Ben prefers the file be named something outside the `.env*` pattern. |
| **D2** | `ORPHAN_RULES` carries **two** entries, not the one (`hero-principle`) the plan's Phase 0 table names. `.card-eyebrow` (`app/globals.css:162`) is the second. | Phase 0's own instruction is "**Measure** the baseline — do not assert it." The orphan scan measured `.card-eyebrow` as genuinely unreferenced. Suppressing a measured finding to match a predicted list would defeat the register. It is registered, scheduled for Phase 10 like the other, and flagged here so the difference from the plan text is visible rather than absorbed. |
| **D3** | `scripts/check-no-deletions.sh` runs a **third** command beyond the two the plan names: `git diff --name-only -M --diff-filter=DR HEAD`. | The plan's two commands compare `main...HEAD`, so they see nothing until a phase commits. The third catches a deletion that exists only in the working tree or index, which is when a phase can still cheaply undo it. It only ever *adds* failures; it can never make a real deletion pass. |

*(No escalations were required in Phase 0. Escalation entries from later phases
go here as they occur.)*

---

## 5b. Phase 0 gate corrections

Recorded so the next phase knows what the gate changed and why, rather than
finding a silent edit.

| # | Correction | Evidence |
|---|---|---|
| **C1** | `docs/facelift-baseline.md` §3 said **57** class selectors and **51** distinct `className` tokens. Both were produced by a scan that differs from the one the test actually uses, so the doc asserted numbers the gate could not reproduce — the exact failure Phase 0 exists to prevent ("measure, do not assert"). Corrected to **56** selectors, **56** distinct tokens, **91** total applications, all produced by the parsers in `tests/class-contract.test.ts`. | A naive `className="…"` regex misses `` className={`plan-room plan-room-${item.number}`} `` (`app/page.tsx:44`) because `[^}]*` stops inside `${…}`, dropping `plan-room` and its four expansions — 51 instead of 56. `grep -o '\.[a-zA-Z][A-Za-z0-9_-]*' app/globals.css \| sort -u \| wc -l` prints 58, of which `.googleapis` and `.com` are `@import`-URL fragments: 56. |

### Guardrails proven non-vacuous at the gate

Each Phase 0 guard was broken on purpose and observed to fail, then reverted. A
green suite that cannot go red is worth nothing.

| Guard | Injected fault | Result |
|---|---|---|
| `tests/class-contract.test.ts` mode 1 | added `bogus-gate-token` to `app/page.tsx:8` | `fail 1` — `'bogus-gate-token (app/page.tsx)'` |
| `tests/preserved-surfaces.test.ts` | rewrote `destinations[0].url` to `…/DROPPED` | `fail 1` — "the footer doctrine door was dropped" |
| `scripts/check-no-deletions.sh` | moved `app/terms/page.tsx` aside | exit 1, "Files DELETED or RENAMED in the working tree / index" |

Every fault was reverted and `git status --porcelain` confirmed clean for the
touched file before the phase commit.

---

## 6. Hazards for later phases

### 6.1 The secret scan will bite content work

`.githooks/pre-commit` is active (`core.hooksPath = .githooks`) and runs
`scripts/check-secrets.sh staged`. Its **pattern 3** matches
`(api[_-]?key|secret|token|password)` followed by `[:=]` and a **24-or-more
character** value.

Watch Your Step Source Period C is *about* leaked credentials, so fictional
artifacts in that period will contain exactly this shape.

- Keep fake credential literals **under 24 characters**, or split them across
  string concatenation so no single line matches.
- **Never use `git commit --no-verify`.** Not once, not "just to check".
- New binary assets go under `public/` — the scan skips binaries
  (`grep -Iq . "$file"`), and `public/*` is a preserved directory whose seven
  brand-asset filenames are pinned by `app/layout.tsx` `icons` metadata. If a new
  mark ships it must keep the same filenames or the metadata changes in the same
  commit.

### 6.2 Build-loop constraints

- **Do not run `npm run dev`** in an agent session — it blocks.
- `npm run build` refuses to run while port 3000 is held
  (`scripts/guard-next-build.mjs`). Use `PORT=3999 npm run build`. **Do not
  modify or bypass the guard.**
- `npm run lint` is non-functional (§4.2).
- `tsconfig.json` sets `"incremental": true`, so running `npx tsc --noEmit` from
  the repo root drops a `tsconfig.tsbuildinfo` build artifact there. It is not
  in `.gitignore` (which is otherwise a zero-edit file, §5 D1), so **delete it
  before `git add -A`** rather than committing a generated file. `next build`
  writes its own copy under `.next/`, which is already ignored.

### 6.3 What the class contract cannot see

`tests/class-contract.test.ts` mode 2 is live but currently checks **zero**
modules, because the repo has no `.module.css` at baseline. The count is asserted
as `0` on purpose, so the first CSS Module that lands forces an update to that
assertion and makes its coverage deliberate.

Dynamic class names are registered in `DYNAMIC_CLASS_EXPANSIONS` in that file.
An **unregistered** dynamic class (`className={`x-${y}`}`) is a hard test
failure by design — later phases must register the value set rather than let the
token silently escape coverage.

### 6.4 The analytics freeze is now mechanical

`components/GoogleAnalytics.tsx` is byte-frozen. `tests/analytics-frozen.test.ts`
asserts the literal presence of the measurement-ID gate, the Consent Mode v2
defaults (`analytics_storage: 'denied'`, all three `ad_*` denials,
`wait_for_update: 500`), `ads_data_redaction`, `anonymize_ip`,
`send_page_view: true`, `allow_google_signals: false`,
`allow_ad_personalization_signals: false`, the
`const storageKey = "bct_analytics_consent";` line, the `Decline` /
`Allow analytics` button labels, and `ConsentBanner`'s hardcoded `ad_*` denials
and render guard.

**If a later phase makes one of these fail, the fix is to revert the edit, not to
relax the assertion.** WYS telemetry layers *on top of* this implementation
(plan §8.1); it does not modify it.

---

## 7. Phase 1 — provenance substrate

Pure TypeScript. No page, component or stylesheet was written in this phase;
the components that render these types are built in Phase 4, after §4.2's
tokens exist, so nothing here can reference an `--accent` or `--muted` that has
not been defined.

### 7.1 What landed

| Module | What it carries |
|---|---|
| `lib/content-status.ts` | The two enums (nine origins), the `(surfaceKind, origin) -> label` map, the draft marks, `RENDER_BEN_REVIEWED`, `RENDER_MARKED_DRAFT`, `renderPolicyFor()`, `validateProvenance()`. No JSX, no CSS import. |
| `components/provenance/types.ts` | Prop shapes only: `ProvenanceLabel`, `DraftMark`, `BenSlot`, `MediaSlot`, `DashedSlot`. |
| `lib/approval-state.ts` | `CaptainsStamp \| null`, captain's round, snapshot, Standing Orders status, the keel record, and every governance string on the site. |
| `content/authority-chain.ts` | The four-link chain, each with a hash field present and empty. |
| `lib/canonical-text.ts` | `CanonicalText`, the five variants, the resolver, per-record validation. |
| `content/claims.ts` | The nine named canonical components from packet: one-definition. |
| `lib/wys/coach-schema.ts` | Type-only `WysCoachAction` plus all sixteen §22 rules as comments. |
| `scripts/preview-content.mjs` | The draft preview dump. Not a route (§6.11). |
| `tests/content-status.test.ts`, `tests/governance-strings.test.ts`, `tests/canonical-text.test.ts` | 59 new test cases, all against pure modules — no component import, no CSS. |

`content/site-config.ts` is byte-identical to `main`.

### 7.2 The two ratified constants

Both are typed `boolean`, not the literal `false`, so flipping either is one
character and no comparison anywhere narrows to a dead branch.

- **`RENDER_BEN_REVIEWED = false`** (Q13 default). Production renders
  `published` only. WYS §7 makes `ben_reviewed` Ben's explicit choice.
- **`RENDER_MARKED_DRAFT = false`** (Q21 default). WYS §7's literal
  public-rendering whitelist wins over handoff README bucket 3, because plan R3
  subordinates the README to the spec and WYS §33 step 25 agrees with the spec.

**ESCALATION (Q21 / SC-13).** Shipping the public course with draft scenario
prose requires Ben's answer. With the constant `false`, every README bucket-3
object still exists, still compiles and still carries its label — it is visible
only through `node scripts/preview-content.mjs`. Flipping it is one line and no
component change. This must appear in the §38 report.

**ESCALATION (Q1 / SC-1).** The disclosure strip's fourth sentence — the one
asserting that every published word was approved by Ben — is deliberately NOT
stored as renderable copy in `content/claims.ts`, and
`tests/canonical-text.test.ts` fails if any record starts storing it. Nothing is
stamped, so the sentence cannot be made true by copy (R8). Phase 5 renders the
first three sentences plus a truthful unstamped line bound to `approvalState`.
The final wording is Ben's.

**ESCALATION (§6.3 / Q1).** Five provenance label strings are NEW copy this
build authored, because WYS §23 supplies none for those origins and the
`marked` policy needs all of them. A provenance label is a claim about who
wrote something, so each goes on the Final-copy escalation list for Ben's stamp:

```
Implementation placeholder — not Ben's words
Drafted during implementation — not Ben's words
External source — not Ben's words
Yours. Stored in this browser only.
Approved by Ben
```

They are exported as `NEW_PROVENANCE_LABELS` so the escalation list cannot
drift from the code.

### 7.3 Deviations reported from Phase 1

1. **A fourth surface kind, `general`.** WYS §23 groups its strings by three
   surface kinds (`human-source`, `fictional-scenario`, `judgment`), but
   `WysRitual`, `WysCarry`, principle bodies, the claim records and the ship
   prose all render publicly and all need a label. `general` is the fourth.
   Safe direction (R9): it adds labels where §23 supplies none, and removes
   none.
2. **A third render surface, `archive`.** §6.2 rule 3 blocks historical and
   superseded material "reached from a current surface", but Q25's ratified
   default makes superseded Bridge positions `historical` objects **rendered in
   the Log** — which is not a current surface. `RenderSurface` therefore has
   three values, and an archive render is `marked`, never `canon`: a superseded
   position must not read as a current one.
3. **`AwaitingCopy` instead of `full: string`.** §6.8's interface types `full`
   as `string`; §8b.1 forbids writing legal copy before the code is frozen.
   They resolve only if an unwritten variant is structurally NOT text — the same
   mechanism §6.4 uses for Ben slots. `resolveVariant()` returns
   `kind: "awaiting"` for those, so no renderer can turn a descriptor into
   prose, and Phase 11 replaces the descriptor with the real `full`.
4. **`variantSources` on `CanonicalText`.** The `minimal-trust` record's `short`
   is artboard `5c` and its `full` is WYS §18 verbatim (§8b.3). Without
   per-variant source metadata the record could not record that honestly.
5. **`approvalState.keel` carries `name`, `shortName` and `version`.** The
   artboards render the keel three ways ("YY Method Professional v2.3",
   "YY Method v2.3", "v2.3 · the keel"). One record, three presentations —
   §6.8's own mechanism, not three definitions.

### 7.4 The handoff-README provenance mapping

Recorded because every later content phase depends on it:

| Handoff README bucket | status | origin |
|---|---|---|
| "Final copy" (hero, bullets, contrast statements, disclosure strip, Data page wording, Standing Orders titles, nav labels) | `published` | `BEN_APPROVED` |
| "Slots awaiting Ben" | never text — `components/provenance/types.ts` | — |
| "Draft placeholders" (fictional scenarios, choice labels, revealed judgment text, 18/61/21, stop titles A-H) | `draft` | `AI_SYNTHESIS` / `IMPLEMENTATION_PLACEHOLDER` |

**`status` and the Captain's Stamp are two different axes.** "Final copy" is
`published` because the handoff says "Ship as-is"; the site still says
"Not yet stamped", from `approvalState.stamp === null`. Conflating them would
either block the whole site or claim an approval nothing evidences.

`content/authority-chain.ts` is `draft` / `IMPLEMENTATION_PLACEHOLDER`, because
the packet is NOT YET STAMPED (R5) and the descriptive lines were drafted during
implementation. Under the Q21 default that means the chain does not render
publicly. **Phase 9 must report that consequence rather than soften the
origin.**

### 7.5 Hazards this phase creates for later phases

- `tests/governance-strings.test.ts` fails if `Not yet stamped`,
  `approval pending`, `Standing Orders · draft`, `approved by Ben` or
  `captain's round` appears anywhere in `app/` or `components/`. The fix is
  always to render it from `lib/approval-state.ts` — never to add an exemption.
- `tests/canonical-text.test.ts` fails if any `.tsx` under `app/` or
  `components/` carries a >= 12-word string literal or JSX text run that is not
  imported from `content/`. The exemption list is the 16 preserved surfaces
  frozen at Phase 0. **It may shrink; it may never grow.**
- The same test fails if a 64-hex digest appears anywhere in `app/`,
  `components/`, `content/` or `lib/` while `approvalState.keel.sha256` is
  `null`. That is the stale-governance-hash check, and it is the one that fires
  the moment Ben publishes the v2.3 SHA-256 on yymethod.com/work.
- `provenanceLabelFor()` is total by type. A `(surfaceKind, origin)` pair with
  no declared label is a **compile error at the call site**, not a blank label.
  Adding a pair means adding a string, and a new string is an escalation.
- The label is a branded type. A component prop typed `ProvenanceLabel` cannot
  be satisfied by a hand-typed string, so `JudgmentCard`'s header can never be a
  hardcoded "BEN'S JUDGMENT".
- **`tests/canonical-text.test.ts` only sees what it imports.** `canonicalRecords`
  is `claims` today and `contentObjects` is `claims` + `authorityChain`. All
  eight governance checks run over those two arrays and nothing else, so a
  content module added in Phase 6 or 9 that is not added to those two constants
  escapes every check silently. **Extend both in the same commit that adds a
  content module** — that is not optional bookkeeping, it is the check.
- **`judgment` × `LEARNER_OWNED` is deliberately unmapped and will be a compile
  error in Phase 7.** The `5c` Practice screen draws a learner-authored outlined
  row, so a learner's own committed judgment will need that pair. The string
  already exists (`Yours. Stored in this browser only.`) and is already on the
  Ben escalation list, so the fix is a one-line addition to the label table plus
  a line in the deviation register — not a new escalation.
- **`LEARNER_OWNED` objects must be constructed at `status: "published"`.** At
  `draft` they are `blocked` under the Q21 default, which would empty the
  learner's own rulebook. Learner material is not draft Ben doctrine; it is the
  learner's, and it renders `marked` with its own label.
- **`AwaitingCopy.writtenBy` is `"ben" | "phase-8" | "phase-11"`.** Gate fix:
  the `analytics` record's `short` descriptor said it was written in Phase 8
  while its `writtenBy` claimed Phase 11. In a module whose entire purpose is
  not letting a claim drift from its source, that had to agree.
