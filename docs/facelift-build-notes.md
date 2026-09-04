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

---

## 8. Phase 2 — local state substrate

Plan §7.1–§7.5. Two guarantees, both structural rather than procedural: a
learner dossier cannot be persisted, and a `localStorage` read cannot reach the
server render.

### 8.1 What landed

| File | What it is |
|---|---|
| `lib/wys/local-state.ts` | The verbatim `WysLocalStateV1` shape, the write-side allowlist, value-domain validation, `parse` / `migrate` / `serialize` / `validate`, guarded browser access, `restartCourse()` / `clearAllWysData()`, `cadencePathFor()`, and the Data page row mapping. Pure TypeScript — no React, no CSS. |
| `lib/wys/browser-keys.ts` | `BROWSER_KEYS` — the registry §7.5 requires so the Data page key list is generated, not hand-maintained. |
| `components/wys/useWysState.ts` | The hydration-safe hook: `{ loaded: false }` sentinel, `useEffect`-only read, and no `localStorage` reference of its own. |
| `components/ConsentBanner.tsx` | `try/catch` hardening only. |
| `tests/wys-local-state.test.ts` | 33 tests. Suite total 90 → 123, all green. |

### 8.2 The one edit to a preserved surface

`components/ConsentBanner.tsx` gained `try/catch` around its two `localStorage`
calls and nothing else. `const storageKey = "bct_analytics_consent"`, the
three-state `useState<ConsentChoice | null | "unknown">("unknown")` machine, the
`NEXT_PUBLIC_GA_MEASUREMENT_ID` render guard, the three hardcoded `ad_*`
denials, the body copy and the labels `Decline` / `Allow analytics` are
byte-identical. `tests/analytics-frozen.test.ts` still passes unchanged, and
`tests/wys-local-state.test.ts` now also asserts the guarded shape, so a later
phase cannot quietly un-harden it. A throw is read as *no stored choice*, which
is the behaviour an unguarded read produced on every browser that did not throw.

### 8.3 Deviations and additions reported from Phase 2

**1. Value domains are an injected parameter with a fail-closed default.**
§7.2 sources the posture-option domain from `content/watch-your-step/config.ts`,
which does not exist until Phase 6 and carries two open Ben content decisions
(§35.1, §35.2). Rather than invent it early, the serializer takes a
`WysStateDomains` argument (`postureChoiceIds`, `scenarioIds`, `choiceKeys`,
`noticeIds`, `stopIds`) defaulting to `DEFAULT_WYS_STATE_DOMAINS`, in which every
ID list is **empty**. With no content wired, an ID-bearing value is therefore
DROPPED rather than let through. Passing domains as an argument also avoids the
import cycle a `content/*` import would create.

> **Phase 6 must pass the real domains** at the point it wires the hook.
> Forgetting loses a preference — visible — instead of accreting a dossier —
> invisible. That asymmetry is the reason the default is empty rather than
> permissive. The static WYS routes need no content vocabulary and resolve under
> the default; only `/watch-your-step/stop/<id>` depends on `stopIds`.

**2. Two value domains beyond §7.2's enumerated list.** §7.2 names
`postureChoice`, `cadence`, `timeBudget`, `lastRoute`, `dismissedNotices`,
`replayCounts` keys, `localJudgments` keys and choice keys. Two more declared
fields are typed as bare `string` and would otherwise take arbitrary free text:

- the five timestamp fields (`startedAt`, `lastOpenedAt`, `rulebook[].createdAt`
  / `updatedAt`, `localJudgments[].updatedAt`, `appetite.recordedAt`) must be an
  ISO-8601 instant;
- the ID arrays (`completedLessonIds`, `completedScenarioIds`,
  `completedCarryIds`, `transferCheckIds`, `rulebook[].id`) must match
  `/^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/` — **no whitespace**, so a From Memory
  scratch line or a personal situation cannot be persisted under an ID-shaped
  declared key even before Phase 6 supplies the real vocabularies.

These are additions in the direction §7.2 argues for, not narrowings. The ID
arrays deliberately do **not** get a content-vocabulary domain, because that
would empty a learner's progress the moment a stop ID was renamed.

**3. `rulebook[].text` is the one free-text field, and is unbounded.** No length
cap: truncating a learner's own rule silently is worse than storing it. It
round-trips byte-intact, asserted directly. What keeps it off the wire is the
Phase 3 telemetry property allowlist, not this guard.

**4. An unreadable `schemaVersion` resolves to a clean empty state.** `v1` is the
only version that exists. `migrateWysState()` stamps a missing version, passes a
`1` through, and returns `null` for anything else rather than guessing — guessing
is the one path by which a stale or foreign shape could smuggle undeclared keys
past the allowlist. The caller falls back to `emptyWysState()`.

**5. Restart and Clear explanation copy is build-authored.** `RESTART_COURSE_EXPLANATION`
and `CLEAR_ALL_WYS_DATA_EXPLANATION` are factual build description under §2.1 —
no first person, no modal upgrade, no claim about anything outside this browser.
The clearing text states plainly that it does **not** erase hosting logs and does
**not** erase anything already recorded in Google Analytics, and that the
analytics choice lives under a different key and is untouched. Phase 9 renders
these strings; Ben's wording replaces them if he prefers his own.

**6. `clearAllWysData()` sweeps the `wys:` prefix, not just `wys:v1`.** It
enumerates the store and removes every matching key, so a key added in a later
phase is swept without an edit here. It never touches `bct_analytics_consent` —
wiping that would reset a legally-referenced decision and re-prompt the visitor.
Asserted, with an unrelated third key left in place as a control.

### 8.4 Escalation to Ben — the Data page rows (§7.5, to be carried with §8b.4)

§7.5's rule is that card 1's rows derive from the `WysLocalStateV1` **field set**,
not from `BROWSER_KEYS`, so a field added later surfaces automatically instead of
quietly making "Generated from what's actually stored right now" false. That rule
produces **nine** rows, where artboard `5c` draws five.

| Row | Field | Source |
|---|---|---|
| Onboarding · Pace · time | `onboarding` | artboard `5c` (two lines, one field) |
| Stops · scenarios · carries | `progress` | artboard `5c` |
| Rulebook | `rulebook` | artboard `5c` |
| Deeper-practice interest | `appetite` | artboard `5c` |
| **Local judgments** | `localJudgments` | **NEW — (WYS §20) requires it; `5c` omits it** |
| **Last route · Dismissed notices** | `ui` | **NEW — (WYS §20) requires last route; `5c` omits it** |
| **Schema version** | `schemaVersion` | **NEW — falls out of the bijection rule** |
| **Started** | `startedAt` | **NEW — falls out of the bijection rule** |
| **Last opened** | `lastOpenedAt` | **NEW — falls out of the bijection rule** |

The Data page wording is Final copy (handoff README:18), so all five NEW rows are
a **Final-copy amendment awaiting Ben**, escalated alongside the clearing
footnote in §8b.4. They are marked `source: "new-unapproved"` in the data, not in
a comment, so Phase 9 can render them differently or withhold them on a one-line
change without touching a component.

**The bijection is field-to-row; lines are presentation.** Artboard `5c` draws
"Onboarding" and "Pace · time" as two rows, both from `onboarding`. Collapsing
them would edit approved copy (R1), so a row carries one or more `lines` and the
one-field-one-row mapping still holds. `tests/wys-local-state.test.ts` asserts
the mapping is total in both directions.

### 8b. Phase 2 gate corrections

The gate re-ran `npm test`, `PORT=3999 npm run build` and
`scripts/check-no-deletions.sh`, ran the two `--diff-filter` commands and the
working-tree check directly (all four empty), and then tested the exit criteria
against evidence rather than against the report. Three gaps were found and
fixed. Nothing was reverted.

**1. The dossier guarantee was proven of the serializer, not of the write
paths.** The suite exercised `sanitizeWysState()` and `serializeWysState()`
thoroughly, but `updateWysState` was not even imported, and no test inspected
the bytes that actually land in `localStorage`. "No code path can persist an
undeclared field or scratch text" is a claim about every write path. Two tests
now close it:

- *every exported write path persists sanitized bytes and nothing else* — runs
  one hostile payload (undeclared root/nested keys, an employer, scratch text
  under every declared bare-`string` field, out-of-domain IDs) through
  `writeWysState`, `updateWysState` and `restartCourse`, then reads the stored
  string back out of a fake `Storage` and asserts the sentinels are absent, the
  undeclared keys are gone, the persisted bytes revalidate clean, and
  `rulebook[].text` — the one deliberate exception — survives all three.
- *there is exactly one place that writes `wys:v1`, and it sanitizes first* — a
  source assertion pinning the write chokepoint. A second `setItem` call site is
  a way around the guard that no value-level test would ever see, so it now
  fails the suite instead.

Two smaller hostile-input tests came with them: a `__proto__` payload neither
pollutes `Object.prototype` nor survives the write, and a corrupt or foreign
stored payload (`""`, `"null"`, `"[]"`, `"{"`, a bare string, a number, an
unreadable `schemaVersion`) always reads back as a valid empty state.

**2. The hydration guarantee was proven by reading the source, not by running
it.** The only evidence for "no `localStorage` access during server or first
client render" was a regex over `useWysState.ts`. It now also *runs*: a server
render of the hook via `react-dom/server`'s `renderToStaticMarkup`, with a
`window.localStorage` whose getter counts accesses and throws, asserts zero
touches, `loaded: false`, and an emitted state deep-equal to `emptyWysState()`.
`useWysState.ts` imports no CSS, so it loads under `node --import tsx` with no
stub and no new dependency — which also settles, for hook-shaped modules, the
Phase 0 CSS question recorded at §4.1.

**3. A latent infinite render loop in `useWysState`.** The effect and both
callbacks depended on `[domains]` — the object *identity*. Every real caller
passes a module constant, but a caller passing an inline object literal would
hand the effect a new dependency on every render, and the effect sets a
freshly-parsed state object each time. Fixed by depending on
`wysDomainsKey(domains)`, a content-derived string, with the live domains held
in a ref; the source test now also asserts `[domains]` does not come back.

Verified unchanged at the gate: `components/GoogleAnalytics.tsx`,
`content/site-config.ts`, `lib/route-graph.ts`, `lib/route-resolver.ts`,
`next.config.ts`, `tsconfig.json`, `vercel.json`, `scripts/check-secrets.sh`,
`scripts/guard-next-build.mjs` and `.githooks/` are byte-identical to `main`.
`components/ConsentBanner.tsx` differs from `main` only by the two `try/catch`
blocks. Build output is identical to the Phase 0 baseline: 14 static pages,
`/` at 2.77 kB / 109 kB, shared 102 kB, every route `○ Static`.

**Left in place, recorded rather than fixed.** `isWysStorageAvailable()` writes
and immediately removes a transient `wys:probe` key. It is currently unused, and
the key never coexists with a Data page render, so it does not make the
"What this site knows about you" key list false — but if a later phase calls it,
the probe key belongs in `BROWSER_KEYS`. The write-chokepoint test counts it, so
it cannot be forgotten silently.

### 8.5 Hazards this phase creates for later phases

- **Nothing may read `wys:v1` during render.** The hook exists so that rule has
  one implementation. A test asserts `components/wys/useWysState.ts` contains no
  `localStorage` reference of its own and that the read sits inside `useEffect`.
  If a later phase reaches for `window.localStorage` in a component, that test
  will not catch it — the Phase 12 audit must sweep for it.
- **Every `wys:` key literal in `lib/` or `components/` must be added to
  `BROWSER_KEYS` in the same commit.** A test fails otherwise. That is the check,
  not bookkeeping: an unregistered key makes the Data page key list false.
- **`WYS_DATA_PAGE_ROWS` must gain a row in the same commit any field is added
  to `WysLocalStateV1`.** The totality test fails otherwise. Do not add a field
  to the verbatim shape casually — §5.3's visit counter is derived precisely so
  `progress` never grows a `visits` field.
- **Phase 6 wires the real `WysStateDomains`.** Until it does, a posture choice,
  a scenario ID and a stop route are all dropped by design.
- **`restartCourse()` clears `localJudgments` and `ui`** on the reading that both
  are curriculum progress. If Q20's kept/revised judgments should survive a
  restart, that is a one-line change here and a Ben decision, not a component
  change.

---

## 9. Phase 3 — telemetry substrate

Plan §8.2–§8.8 and the Phase 3 task table. The existing GA4 implementation is
preserved unchanged and the WYS adapter layers on top of it.

**Files added:** `types/gtag.d.ts`, `lib/wys/telemetry.ts`, `lib/wys/aggregate.ts`,
`content/watch-your-step/config.ts`, `tests/wys-telemetry.test.ts`,
`tests/no-private-state-in-urls.test.ts`.
**File changed:** `components/ConsentBanner.tsx` — the `declare global` block
removed, nothing else. **`components/GoogleAnalytics.tsx`: zero edits.**

### 9.1 The shape of the refusal

`trackWys` is a refusal before it is a sender. In order:

1. **Event name** against the closed thirteen-name (WYS §19.4) list, verbatim
   and in spec order. The two aggregate-only names get their own refusal reason
   (`aggregate-only-event`) so a mis-wired call is distinguishable from a typo.
2. **Property keys** against the closed four-key (WYS §19.1A) list, snake_case
   only. A camelCase spelling of an allowlisted key is refused, not translated
   (plan §8.2: a mapping shim is a second place a name can be spelled).
3. **Property VALUES** against per-key domains. A key allowlist alone would
   carry a learner's sentence under `content_version`; the value domains are
   what make "never accept free-text properties" true. The canary
   `DO_NOT_SEND_WYS_TEST_9f31` fails all four domains, and is refused as an
   event name, as a property key, as a value under every allowlisted key, and as
   the whole props object.
4. **Gates:** the global kill switch, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, a
   `window`, then consent. All fail closed.

The validated props object is **rebuilt key by key**, never spread, so nothing
unlisted survives even if a later edit forgets a check. Refusals are **loud in
development and silent in production, but DROPPED in both** — and the refusal
message carries the key name, never the refused value, so a refused free-text
value is not echoed into a console either.

### 9.2 Decisions settled at their build-now default in Phase 3

| Q | Default implemented | Where it lives |
|---|---|---|
| **Q7 / SC-2** | Full suppression unless `bct_analytics_consent === "granted"`. Unreadable, absent or thrown all mean do not send. | `analyticsConsentGranted()` in `lib/wys/telemetry.ts` |
| **Q12 / SC-8** | Aggregate counter off; adapter disabled and documented; **no `app/api/wys/aggregate/route.ts`**. `wys_scenario_choice` and `wys_scenario_skip` send nothing at all. | `WYS_AGGREGATE_ENABLED`, `lib/wys/aggregate.ts` |
| **Q22 / SC-12** | The Data page's aggregate sentence is a state-bound string: it renders only while the flag is true. The string and the flag are in one module so copy cannot outrun code. | `aggregateCounterSentence()` in `content/watch-your-step/config.ts` |

**Escalations recorded, per the ratification instruction.** Q7 and Q22 both
concern published sentences whose truth this build changes:

- **Q7 / SC-2.** Lesson Zero step 9 and Data card 2 state flatly that coarse
  counts are sent. With full suppression that is true only for a visitor who
  granted analytics. The copy must be conditioned on consent state when those
  surfaces are built (Phases 7 and 8), not reworded. Ben decides whether WYS
  events should instead fire for a declining visitor under Consent Mode v2's
  cookieless pings.
- **Q22 / SC-12.** Artboard `5c` card 2's third sentence describes a first-party
  counter that this build deliberately does not create. It is absent from the
  DOM while the flag is off. Ben decides: condition it (shipped default), cut
  it, or build the counter (which is Q12, and a vendor relationship the spec
  says the builder must not make alone).
- **Q12.** The aggregate flag is a **build-time content constant, not an env
  var** — a runtime env var could flip the claim without flipping the
  implementation, which is the false-claim-fixed-in-copy failure R8 forbids. If
  Ben prefers an env var it becomes `NEXT_PUBLIC_WYS_AGGREGATE_ENABLED`, never
  the unprefixed name.

### 9.3 Deviations reported from Phase 3

1. **The arguments-vs-array claim is UNVERIFIED.** Plan §8.3 asks for one GA4
   DebugView check before committing to the arguments-shaped shim. No live GA4
   debug stream was available in this build, so the plan's default shape ships
   unverified: `pushGtagArguments` pushes a real `arguments` object and
   `types/gtag.d.ts` types `dataLayer` as `IArguments[]`. If the check later
   shows a plain tuple is equivalent, this becomes `push(args)` with a typed
   rest parameter and the ambient type widens to `IArguments[] | unknown[]`.
   Nothing else changes. **This check is still owed.**
2. **The flush sentinel is `ga4-init`'s own `config` command, not an `onReady`
   callback.** Plan §8.3 offers both. `onReady` would require adding a prop to
   the `<Script id="ga4-init">` element in `components/GoogleAnalytics.tsx`,
   which the Phase 3 task table freezes at **zero edits**. Polling `dataLayer`
   for an entry whose first argument is `"config"` needs no edit to that file at
   all. `ga4ConfigMarkerPresent()` is the whole mechanism; a partially-run
   `ga4-init` (js / consent / set, no config yet) is asserted **not** to be a
   flush signal.
3. **`route_type`'s vocabulary is authored, not specified.** (WYS §19.1A) names
   the property and not its values. `WYS_ROUTE_TYPES` is a closed eight-value
   list taken from the Kind column of the plan's §5.2 route table. A closed set
   is the point — an open string here is a free-text field wearing a permitted
   name.
4. **Every firing point in the decision-use table is authored.** §19.4 lists
   event names, §19.1A lists categories, and neither names a trigger, so
   "wire the events at the points §19.4 names" names nothing. The table in
   `lib/wys/telemetry.ts` is the map, and it is the input to §38 item 5.
5. **`content/watch-your-step/config.ts` is opened three phases early.** Plan
   §8.6 names that exact file as the home of `WYS_AGGREGATE_ENABLED`, so Phase 3
   creates it carrying **one flag and one state-bound string, and nothing else**.
   Phase 6 owns the rest of the §35-class content flags (Q20's two, the posture
   options, the admission wording); this file must not pre-empt them.

### 9.4 Wired but unfired, on purpose

`wys_view` and `wys_transfer_check_complete` are on the closed list, carry full
decision-use rows, and **fire nowhere in v0** (plan §8.7). `wys_view` would
double-count a fact the preserved `send_page_view: true` config already records;
`wys_transfer_check_complete` measures a surface Q24 defers. Both are asserted
unfired by `tests/wys-telemetry.test.ts`, which greps `app/`, `components/`,
`lib/` and `content/` for a `trackWys("<name>"` call — an assertion that holds
trivially today and keeps holding once Phase 7 lands the course.

### 9.5 Hazards this phase creates for later phases

- **A URL is telemetry.** `send_page_view: true` is preserved, so
  `page_location` (query string included) and `page_title` reach GA4 on every
  route, **outside `trackWys` and outside its allowlist**. No adapter can police
  a URL it never sees. `tests/no-private-state-in-urls.test.ts` is the guard;
  its two assertions are statically decidable, and it proves its own teeth
  against a synthetic violating page because the real course tree does not exist
  until Phase 7. Lesson Zero step state is a step **index** only.
- **`[stopId]` is the only dynamic segment allowed under
  `app/watch-your-step/`.** Adding a second one fails a test. A stop id is
  content data; a posture, a cadence or an answer is not.
- **Do not build `app/api/wys/aggregate/route.ts`** without Ben answering Q12.
  A test asserts its absence, and it would also introduce the first
  `ƒ (Dynamic)` route into a fully prerendered build.
- **Do not import `lib/wys/local-state` into a `metadata` or `generateMetadata`
  export.** A page title built from learner state reaches GA4 as `page_title`.
- **The consent copy is now conditional.** Any surface that says coarse counts
  are sent must render that claim against actual consent state (Phases 7, 8).
- **`WYS_TELEMETRY_ENABLED` is the global off switch** (WYS §19.5, "be easy to
  disable globally"). One constant, no component change.

### 9.6 Fixed at the Phase 3 gate

Two things the implementer's own tests did not cover. Both are recorded here
because they change how a later phase must verify itself, not only what Phase 3
shipped.

1. **The emission chokepoint was unproved.** The refusal tests show that an
   unlisted event or property cannot get through `trackWys`. On their own they
   say nothing about a component that never calls `trackWys`: `types/gtag.d.ts`
   overload 2 types `window.gtag("event", name: string, props)` with an **open**
   event name, and `window.dataLayer.push(…)` is open to anything. Either path
   emits past the allowlist, past the consent gate and past the ga4-init flush
   rule while every refusal test stays green — so the Exit criterion "no
   component **can** emit an unlisted event or property" was only half met.

   Five assertions were added to `tests/wys-telemetry.test.ts`: no `dataLayer`
   access outside the adapter; no `window.gtag` access outside the adapter and
   the two preserved surfaces; **no `gtag("event", …)` command anywhere at all**
   (the adapter pushes to `dataLayer`, the banner issues only `consent`, and
   `GoogleAnalytics.tsx` issues js / consent / set / config — so the `event`
   command legitimately appears in no source file); exactly one push site in the
   adapter, and it is the arguments-shaped shim; plus a positive control so an
   empty offenders list is proof rather than an artefact of a small tree.

   **The predicates are code-shaped, not bare identifier greps, and that is
   load-bearing.** The first draft used `/\bgtag\b/` and flagged
   `app/privacy/page.tsx:22` — *"BenChanTech may use GA4 through direct gtag.js
   collection"* — which is preserved published prose. A test that fires on
   preserved copy is a test that gets satisfied one day by editing preserved
   copy, which is exactly backwards (R8, user constraint 2). The predicates now
   match a member access or a call, and the positive-control test asserts that
   the live privacy sentence does **not** trip them.

2. **`npx tsc --noEmit` was red on the branch and is green on `main`.**
   `next build` type-checks the app module graph; `npm test` runs through `tsx`,
   which **strips types without checking them**. So a type error inside
   `tests/` passes both phase gates. `tests/wys-telemetry.test.ts` carried two:
   `TS2556` and `TS2554`, both from spreading arguments into a bare
   `(function () { … })` IIFE whose own type is `() => void`. Fixed by giving
   each shim the same annotated-const shape the adapter uses
   (`const push: (...args: unknown[]) => void = function () { … }`).

   **Next phases: `npx tsc --noEmit` is a third gate, and nothing else runs it.**
   `tsconfig.json` includes `**/*.ts`, so `tests/` is in the project; run it
   alongside `npm test` and `PORT=3999 npm run build`. It writes
   `tsconfig.tsbuildinfo`, which is untracked and not gitignored — delete it
   before committing.

Verified at the gate: `scripts/check-no-deletions.sh` exits 0, and both
`--diff-filter=D` and `--diff-filter=R` against `main...HEAD` are empty, as is
the working tree's deletion set; `npm test` is green at **169 tests, 0
failures** (Phase 2 left it at 158; the implementer landed 164, the gate added
5); `npx tsc --noEmit` is clean; `PORT=3999 npm run build` type-checks and emits
the same 14 static pages, `/` at 2.77 kB / 109 kB, shared 102 kB, every route
`○ Static`, zero `ƒ`. `components/GoogleAnalytics.tsx` is byte-identical to
`main`, as are `content/site-config.ts`, `lib/route-graph.ts`,
`lib/route-resolver.ts`, `next.config.ts`, `tsconfig.json`, `vercel.json`,
`scripts/check-secrets.sh` and `scripts/guard-next-build.mjs`;
`components/ConsentBanner.tsx` differs from `main` only by the Phase 2
`try/catch` blocks and the removed `declare global` block.

---

## 10. Phase 4 — design system

The identity swap. This is the phase the whole restyle turns on: after it, all
eleven preserved routes render in the new register with **zero** copy, href or
metadata change.

### 10.1 What landed

| Area | Files |
|---|---|
| Fonts via `next/font/google`; the `@import` at `app/globals.css:1` removed | `app/layout.tsx`, `app/globals.css` |
| Facelift token set + usage-rule comments + the legacy alias block | `app/globals.css` |
| Blueprint geometry replaced; STRUCTURAL section fenced; interaction layer authored | `app/globals.css` |
| Blueprint scaffolding retired — markup and every selector in each family, together | `app/page.tsx`, `app/globals.css`, `tests/class-contract.test.ts` |
| Provenance components whose types Phase 1 fixed | `components/provenance/*` |
| The §4.8 primitive inventory | `components/ui/*`, `components/wys/*` |
| Primitives preview at 1280 and 390, as a script dump, not a route | `scripts/preview-primitives.mjs`, `scripts/css-module-hooks.mjs` |
| Every NEW/unapproved visual decision, in one list for Ben | `docs/facelift-unapproved.md` (new) |

### 10.2 The one intentional line-level removal, executed

`app/globals.css:1` was:

```
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:…&family=Spectral:…");
```

It is gone, and `app/layout.tsx` now loads both families through
`next/font/google`. That is **the single intentional line-level removal in the
whole build** (plan §3.0). A CSS `@import` serialises a second round trip before
first paint, and it must be the first at-rule in a sheet — so it had to go before
any new at-rule could be added.

**The weight set is decided by the preserved stylesheet, not by the artboards.**
Sans **400/500/600 with `style: ["normal","italic"]`**, Mono **400/500/600/700**.
The artboards need less than that. The preserved rules do not: the aliasing in
§4.4 points `--mono` and `--serif` at these same two faces, and loading fewer
weights would produce browser-synthesised faux-bold and faux-italic on every
preserved page — with no compile error, no type error and no test failure. That
regression is invisible to every test in this plan, which is why the decision is
written down rather than inferred.

**Build-loop consequence, recorded because it is new:** `next build` now fetches
the font files from Google on a cold cache. The build output shows
`Retrying 1/3...` lines while it does. A build on a machine with no network will
fail differently from before this phase. The files are cached in `.next` after
the first successful build.

### 10.3 Token aliasing — why figure and ground did not collapse

Every legacy token NAME is kept and re-pointed. The trap the plan flags is real:
`body` is painted `var(--paper)` and 19 rules paint sections, cards, result
panels and detail callouts with `var(--sheet)`. Mapping **both** onto `--white`
would have rendered the hero, the router card, the result panels and the detail
callouts white-on-white and structurally invisible after the aliasing step alone.

What shipped preserves the three-step ground → card → accent ramp the legacy
rules assume:

```
--paper       -> var(--white)       body ground
--sheet       -> var(--tint-grey)   card / section fill  (NOT white)
--plan        -> var(--tint-teal)   accented block fill
--ink-soft    -> var(--body)
--dimension   -> var(--muted)
--blueprint   -> var(--accent)
--line        -> var(--border-row)
--line-strong -> var(--border-pill-strong)
--focus       -> var(--accent)      replaced, never removed
--serif       -> var(--sans)        Spectral retired, name kept
--ink         -> #16202B            redefined, name kept (was #1b2430)
--max         -> 1280px             was 1120px
```

**Aliasing alone yields a legible intermediate, not the finished restyle.** The
second, budgeted task did the rest: the radii, the two shadows, the inset-slab
rhythm, the removal of the graph-paper hatch and the 2px architectural rules, and
the replacement of the inverted hover treatment.

### 10.4 The STRUCTURAL fence, and its three notes

Fenced and commented in `app/globals.css`. Only the token VALUES inside those
rules changed.

1. **`:focus-visible` kept at 3px/3px.** The handoff README's 2px is its own word
   "suggested", so this is a choice, not an authority conflict. The existing
   geometry already ships and `/accessibility` publishes a claim measured against
   it. Only `--focus` changed. Reported in `docs/facelift-unapproved.md` §B4.
2. **`main { overflow: hidden }` moved OUT of the fence** and became
   `overflow-x: clip`. It clipped both axes on the element wrapping every page,
   which would cut `--shadow-demo`'s 80px blur and the demo card's deliberate
   overhang. The page still cannot scroll sideways.
3. **`html { scroll-behavior: smooth }` stayed INSIDE the fence, paired with its
   `prefers-reduced-motion` override.** Both halves carry a comment naming the
   other. Dropping either one alone turns a published accessibility behaviour
   into a silent no-op.

The shared container rule kept its single-rule **mechanism** and changed its
**value**: `width: min(100%, var(--max)); margin-inline: auto;
padding-inline: var(--gutter)`, with `--gutter` at 56px desktop and 22px mobile.
Consequence, intended and reported: the reading measure of every preserved legal
page widens.

### 10.5 Retiring the blueprint scaffolding

`.dimension-line`, `.plan-foyer`, `.scale-line` / `.scale-bar` — **markup and
every selector in each family, in one change**, with the class-contract
expectations updated alongside.

Verified the way §4.4 demands, by family and not by line range:

```sh
for f in dimension-line plan-foyer scale-line scale-bar; do
  grep -rc "$f" app components   # 0 everywhere
done
```

A line range would have stranded each family's `@media (max-width: 700px)`
member, and the className→rule scan visits only one direction, so nothing in the
suite would have flagged the orphans.

All three blocks are decorative and `aria-hidden="true"`, carry no copy a reader
reaches, no `href` and no metadata, so no route, redirect, link or title is
touched. It is still a visible change to the approved-as-live home page, and it
is named in `docs/facelift-unapproved.md` §C.

### 10.6 The CSS Modules boundary

Established, per §4.1. `app/globals.css` keeps the tokens, the structural rules
and the legacy class layer that styles the 11 preserved routes; **every new
surface and primitive uses `*.module.css`**.

This is forced, not stylistic: `.hero` (defined twice historically), `.eyebrow`,
`.brand`, `.detail-page`, `.section-heading`, `.option-grid`, `.primary`,
`.secondary` and `.compact` are already taken globally, and a new component using
one of those names would silently inherit blueprint geometry with no compile
error.

Three shared stylesheets, one per directory — `components/ui/primitives.module.css`,
`components/wys/wys-primitives.module.css`,
`components/provenance/provenance.module.css` — imported by 25 primitives.
`tests/class-contract.test.ts` mode 2 now asserts `modulesChecked === 25`; the
count is exact on purpose, so a later phase updates it deliberately rather than
letting a module fall out of coverage.

**A rule every later phase must follow:** never write a template literal in a
`className` attribute, and never leave a variant comparison inside one. Mode 1
treats every string literal inside `className={…}` as a class token and every
`${` as a dynamic class needing registration, so
`` className={`${a} ${b}`} `` and `className={cx(x, tone === "dark" && y)}` are
both hard test failures **by design**. Compose the class string in a `const`
above the JSX and pass the identifier. `components/provenance/cx.ts` exists for
this and carries the reason in its own doc comment.

### 10.7 The contrast audit, run rather than assumed

Full measured table in `docs/facelift-unapproved.md` §B1, including one
correction to the plan's own figures (`--accent` on white measures **4.98:1**,
not the 4.74:1 the plan records — the finding is unchanged either way).

Shipped: **`--accent-text-on-tint: #1A6B7B`** for text on a tint, Q23's ratified
default (a). `--accent` `#1F7A8C` is untouched for fills, bars, the rail, the
dashed Ben-slot border and the focus ring. Re-measure and re-record every pair in
Phase 12.

### 10.8 Escalations recorded from Phase 4

Each was implemented at its ratified build-now default and each needs Ben.

| # | Escalation | Default implemented | Where it is written up |
|---|---|---|---|
| **E1** | **Q23** — two approved colour pairs miss WCAG AA for normal text, and `/accessibility` publishes a contrast claim. | Second token `--accent-text-on-tint` `#1A6B7B` for text on a tint. | `docs/facelift-unapproved.md` §B1 |
| **E2** | **Q17** — Commit is teal on `5b` and ink everywhere else; two approved artboards disagree. | Ink enabled, `rgba(22,32,43,.25)` disabled. Today's Commit is recoloured. | §B2 |
| **E3** | **Q18** — `5a`'s selection rows grow 4px; `4a`'s do not. | Normalised to the non-reflowing `4a` pattern. 2px visual delta on Lesson Zero. | §B3 |
| **E4** | The **entire interaction-state layer** is new work no artboard contains, required by a live `/accessibility` claim. | Authored from the token set under the five rules in §A1. | §A1 |
| **E5** | Retiring the three `aria-hidden` blueprint-scaffolding blocks is a visible change to the approved-as-live home page. | Retired, markup and rules together. | §C |
| **E6** | The disabled Commit **label** ships in `--muted`, not the artboard's white, which measures 1.69:1 and is unreadable. The fill is unchanged. | `--muted` (3.23:1). | §B1 |

### 10.9 Deviations reported from Phase 4

| # | Deviation | Reason |
|---|---|---|
| **D4** | The caps micro-label group moved from Mono to Sans, against §4.3's "load the faces, do not rewrite the legacy rules". | §4.3's decision is about **font loading** — it exists so nothing renders faux-bold. §4.4 separately requires the geometry task to replace "the uppercase mono micro-labels", and §4.2 sets caps labels in Sans 12/600. Both are honoured: the labels are restyled **and** all four Mono weights plus the Sans italic axis still load, so restoring any declaration needs no font change and nothing synthesises a face. |
| **D5** | `docs/facelift-unapproved.md` is a **new** file the plan names but Phase 0 did not create. | §4.2, §4.4, §4.5 and §4.6 all say "record it in `docs/facelift-unapproved.md`", and Phase 4 is the first phase with anything to put in it. Additive; nothing was moved out of the build notes. |
| **D6** | The primitives preview needs a Node hook to load `.module.css` (`scripts/css-module-hooks.mjs`). | The alternative was hand-copying each primitive's markup into the preview, which drifts from the components the first time one changes. The hook is **not** registered by `npm test` — Phase 0's decision 4.1 stands unchanged — and it is used by exactly one dev script. Zero new dependencies: `node:module`'s `registerHooks` is built in. |
| **D7** | The preview script sets `globalThis.React` before importing components. | `tsconfig.json` is byte-frozen at `"jsx": "preserve"`, so `tsx` transforms the components with the classic runtime and their output references a bare `React`. Next supplies the automatic runtime in a real build; a dev script has to supply it itself. Process-local, affects nothing that ships. |

### 10.10 Measured at the Phase 4 gate

| | Baseline (Phase 0) | Phase 4 |
|---|---|---|
| `npm test` | 31 tests, 0 fail | **169 tests, 0 fail** |
| Prerendered routes | 14, all `○` | **14, all `○`, zero `ƒ`** |
| Shared First Load JS | 102 kB | **102 kB** |
| `/` First Load JS | 109 kB | **109 kB** |
| `scripts/check-no-deletions.sh` | exit 0 | **exit 0** |

The primitives are not imported by any route yet, so they add nothing to the
bundle — which is the correct reading of "First Load JS at or below the measured
baseline" at this phase, and the number to watch as Phases 5–10 mount them.

### 10.11 Hazards this phase creates for later phases

- **The class-contract rule in §10.6 is the one that will bite.** It is a hard
  failure, not a warning, and the fix is always to hoist the class string — never
  to weaken the extractor.
- **`modulesChecked` is asserted exactly (25).** Adding a primitive without
  updating it fails the suite. That is the design.
- **`.hero-principle` and `.card-eyebrow` are still registered orphans**, and
  `hero-foyer` and `secondary` are still registered unresolved class names. Phase
  4 deliberately resolved **none** of them — that is Phase 10's job, and both
  registers are asserted exactly, so an early fix without a matching
  de-registration fails the suite.
- **`--accent` vs `--accent-text-on-tint` is a real distinction, not a synonym.**
  Text on a tint takes the second; fills, bars, rails, dashes and the focus ring
  take the first. Using `--accent` for a 14px label on `--tint-teal` reintroduces
  the 4.45:1 miss with nothing to catch it.
- **Light-only is a decision, not an omission.** No `prefers-color-scheme` block,
  no `data-theme`, no inverted palette. All sixteen approved screens are
  light-mode and the ink slabs are a compositional device on white.

### 10.12 Fixed at the Phase 4 gate

The gate re-ran every Exit criterion against evidence rather than the
implementer's report. Everything the report claimed was reproduced: `npm test`
169/169, `PORT=3999 npm run build` 14/14 static with zero `ƒ` and zero `●`,
shared First Load JS 102 kB and `/` at 2.77 kB / 109 kB — identical to the Phase
0 floor, not merely at or below it — `scripts/check-no-deletions.sh` exit 0, and
both `--diff-filter=D` and `--diff-filter=R` empty against `main...HEAD` and
against the working tree.

Three things were checked that the report asserted rather than showed, and all
three held:

- **Zero legacy token names dropped.** Comparing the `--name:` declaration sets
  of `git show HEAD:app/globals.css` and the new file, the difference is
  additive only: 38 new names, **none removed**.
- **Zero class selectors dropped beyond the four authorised families.**
  Comparing selector sets the same way, the only losses are `.dimension-line`,
  `.plan-foyer`, `.scale-line`, `.scale-bar` — plus `.com` and `.googleapis`,
  which were never selectors, only fragments of the deleted line-1 `@import`
  URL. That is the one intentional line-level removal, visible as its own
  artefact in the selector diff.
- **The contrast figures were re-derived, not trusted.** `--accent` on `--white`
  **4.975:1**, on `--tint-teal` **4.447:1**, on `--tint-grey` **4.593:1**;
  `--accent-text-on-tint` `#1A6B7B` on `--tint-teal` **5.467:1**, on `--white`
  **6.117:1**; white on the disabled fill over white **1.694:1**, `--muted` on
  it **3.229:1**. Every number in §10.7 and `docs/facelift-unapproved.md` §B1 is
  correct, including the correction to the plan's own 4.74:1.

Two corrections were made at the gate:

1. **`.option-grid button[aria-pressed="true"]` reflowed, and its comment said
   it could not.** It set `border: var(--border-selected)` — a 1.5px → 2px
   border swap, which grows the row by 1px — under a comment asserting the
   opposite. It now uses the same technique `.choiceSelected` uses in
   `components/ui/primitives.module.css`: the border width stays 1.5px and the
   missing half pixel is drawn as `inset 0 0 0 0.5px`, so §4.7.1's normalisation
   is true of the legacy layer as well as the modules. The comment now also
   records that the preserved `IntentRouter` never sets `aria-pressed` —
   choosing an option advances the step — so this rule states the normalisation
   for the legacy layer rather than driving a live state. Consequence worth
   naming: `--border-selected` is now referenced by no rule. It stays defined,
   because §4.2 fixes the token set verbatim and §4.7.1 explicitly allows the
   inset ring as the way to render it.
2. **`docs/facelift-baseline.md` §3b.1 under-counted `app/globals.css`.** It
   recorded 1161 lines against an actual 1176. On a page whose title is
   "measured, not asserted", a stale count is the one defect that matters.
   Corrected.

**Measured and left alone, recorded so Phase 12 has the number.** The preserved
`IntentRouter` Back button in its disabled state (`history.length === 0`) draws
its label in `--commit-disabled`, **1.694:1** on white. The baseline treatment
(`--ink` at `opacity: .35` on the old `#d6dbe2` paper) was in the same range, so
this is not a regression, and disabled controls are exempt from WCAG AA. It was
deliberately **not** raised to `--muted` — the ActionPill's disabled label sits
on a grey fill and reads at 3.229:1, but the same colour on bare white reads at
5.47:1 and would make a disabled control look enabled, which is a worse defect
than the one it fixes. The state stays distinguishable by two channels, colour
and the dropped underline.

**Font faces, checked against their own justification.** §4.3 loads Mono
600/700 because the preserved sheet declared them. After D4 moved the caps
micro-labels to Sans, `var(--mono)` survives in exactly three rules, all at 400.
The extra Mono weights are therefore loaded and currently unused. They stay:
§4.3 ratifies the load, flattening the ramp is its own recorded sweep, and the
build emits **6 preloaded woff2 files** against a baseline that fetched Spectral
plus four Mono weights over a render-blocking cross-origin `@import`. The Sans
italic axis is **not** idle — `globals.css:375` still uses it.

**What the gate could not verify.** The primitives preview was generated and its
markup inspected (`node scripts/preview-primitives.mjs` exits 0 and emits both
the 1280px and the 390px column with every primitive rendered through its real
component and its real module classes), but **nobody looked at it in a browser**.
Pixel fidelity against the five PNGs at 1280 and 390 remains manual QA under
Phase 0's Q15 decision, and is Phase 12's side-by-side check.
