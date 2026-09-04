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

---

# Phase 5 — Chrome

**Goal (plan Phase 5):** every existing link survives, the disclosure strip
appears on every page footer, and no governance claim is hardcoded.

## What shipped

| Deliverable | Files |
|---|---|
| Header carrying **both** nav inventories, two tiers, plus the compact mobile menu | `components/SiteHeader.tsx`, `components/SiteHeader.module.css`, `app/layout.tsx` |
| The nav inventories as data, and the footer-door label overlay | `content/nav.ts` |
| Footer: four link groups, all seven legal links, the four doors from `destinations.map()`, the stamp line from `approvalState` | `components/SiteFooter.tsx`, `app/globals.css` (footer block) |
| Disclosure strip, desktop + stacked mobile, on every route | `components/DisclosureStrip.tsx`, `components/DisclosureStrip.module.css` |
| The strip's fourth sentence as approval **state**, not copy | `lib/approval-state.ts` (`disclosureApprovalLine()`) |
| Seven route stubs + the `(shell)` / `(flow)` route-group split | `app/{bridge,standing-orders,ships-log,crew,ben}/page.tsx`, `app/watch-your-step/(shell)/{layout,page}.tsx`, `app/watch-your-step/(flow)/{layout.tsx,start/page.tsx}`, `app/watch-your-step/wys-groups.module.css`, `components/RouteStub.tsx` + module |
| 404 / error / global-error | `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`, `components/StatusPage.tsx` + module |
| Coverage for all of it | `tests/preserved-surfaces.test.ts` (9 new tests), `tests/class-contract.test.ts` (module count 25 → 31) |

`components/ConsentBanner.tsx` was **not edited**. Its restyle is a task row in
this phase, and Phase 4 had already done the whole of it in `globals.css`
(`.consent-banner` and its buttons, plus the `try/catch` hardening from Phase 2).
The task was visual-only by its own terms, so the correct Phase 5 diff for that
file is an empty one. Consent behaviour is byte-identical.

## Escalations recorded here, as the ratification instruction requires

1. **Q1 / SC-1 — the disclosure strip's fourth sentence. ESCALATED TO BEN.**
   The approved `4a` strip ends "Every published word was approved by Ben."
   Nothing is stamped, so the sentence is false today, and R8 forbids fixing a
   false public claim in copy. Shipped at the ratified default: the first three
   sentences render verbatim from `content/claims.ts` (`zero-ai.inline` and
   `ai-assisted-ben-approved.inline`), and the fourth is
   `disclosureApprovalLine()` — a variant selected by `approvalState.stamp`.
   While the stamp is null it reads **"Nothing here is published as Ben's
   position until he stamps it."** followed by a link to the Ship's Log. The
   approved sentence renders automatically the moment a stamp exists; no
   component changes. **Ben has to approve that replacement wording.**
2. **Q9 — mobile navigation and root chrome on course pages. FLAGGED
   NEW/UNAPPROVED** in `docs/facelift-unapproved.md` §F1–F4. Both halves
   shipped: the footer is a complete mobile path to every link regardless of how
   Q9 resolves, and a compact mobile header sits on top of that.
3. **Q8 — the wordmark.** Untouched: "BenChanTech" everywhere, including root
   metadata. Recorded in `docs/facelift-unapproved.md` §G-b.

## Decisions this phase made, with reasons

- **The footer stayed in the legacy layer instead of moving to a CSS Module.**
  §4.1 sends every NEW surface to CSS Modules, and the header's new parts did go
  there. The footer did not, because `.site-footer` is *already* the public API
  of `globals.css` for a preserved surface, and a module rule and a global rule
  competing for the same element resolve by injection order, which is not
  something a component should depend on. New footer-scoped names
  (`.footer-identity`, `.footer-groups`, `.footer-group`, `.footer-group-label`,
  `.footer-stamp`) were added to the legacy layer instead, and they are covered
  by `class-contract` modes 1 and 3 exactly like every other legacy name.
  `.site-footer div` and `.site-footer nav` — two bare descendant selectors that
  would have styled every new group wrapper by accident — were replaced by those
  named classes. No class selector was dropped from the file.
- **Where a module rule must beat a global one it is written with two classes**
  (`.tiers .ecosystemNav`), never as a bare single class. Same reason.
- **Four footer groups, not §3.3's three.** §3.3 lists doors, Reviewers and
  legal; the phase task row separately requires the footer to be a complete
  mobile path to every link "regardless of how Q9 resolves". A THE SHIP group is
  the only way both hold, and superseded turn `2f` shows exactly that structure.
- **The BottomNav is deliberately NOT mounted** in `(shell)/layout.tsx`. Its five
  tabs point at `/today`, `/plan`, `/progress`, `/practice` and `/data`, none of
  which exist until Phase 7 — mounting it now would have created five dead links
  inside the phase whose exit criterion is "no dead links". The layout exists so
  Phase 7 has the anchor, and the route-group split is proven by the build.
- **`app/global-error.tsx` is self-contained.** It replaces the root layout, so
  it cannot use `globals.css` or the `next/font` variables. Its palette values
  are written out literally against a system font stack, and that is called out
  in the file: if the tokens change, this is the one file that needs hand-editing.
- **Stubs may not impersonate the surface they stand in for.** `RouteStub`
  renders an eyebrow, the surface name, a grey `in build` pill and an 11px mono
  line naming the phase that fills it. No summary of an unwritten page, no
  Ben-attributed prose (R9, R10).
- **New-route metadata is title-only plus `alternates.canonical`** (§5.2, §5.2
  "Canonical URLs"). No `description` on any new route, and the four preserved
  pages that export no metadata at all were left exactly as they are. Asserted
  in `tests/preserved-surfaces.test.ts`.

## Measured at the gate

- `npm test` — **178 tests, 178 pass, 0 fail** (169 before this phase).
- `PORT=3999 npm run build` — **19 routes, every one `○ (Static)`, zero `ƒ`**,
  21 static pages generated. Baseline was 12 rows; the seven stubs are the
  difference and nothing regressed from `○`.
- `scripts/check-no-deletions.sh` exits 0 — zero removed files, zero renames.
- **Every link is on every page.** The built HTML for `/privacy` was parsed:
  38 distinct hrefs, including all seven legal links, all six ship links, the
  CTA, `/studio`, `/neon`, **both** `https://yymethod.com` and
  `https://yymethod.com/doctrine`, and the other three doors. `Crew Manifest`,
  `Start Lesson Zero` and the stamp line are present in **all eighteen** built
  HTML files — the strip really is on every page footer.
- The `class-contract` module-import count moved **25 → 31**, updated
  deliberately in the test with the six new imports named.

## Phase 5 gate — verified in a browser, and two defects fixed

The implementer's report closed with "neither breakpoint was opened in a
browser". The gate opened both, against `npx next start` on the real production
build, in headless Chrome.

**Verified, with measurements rather than inspection:**

- **Every pre-facelift href is reachable at 390px and at 1280px** — and at 768px
  and 1024px. The check is a DOM walk over `a[href]` filtered to elements that
  actually have client rects and are not `display:none`/`visibility:hidden`, on
  `/`, `/crew`, `/watch-your-step`, `/watch-your-step/start`, `/privacy`,
  `/system`, `/bridge` and a 404. All 21 required destinations are **visibly
  rendered** at every width — the footer alone carries the whole inventory, so
  the claim does not depend on the mobile menu being opened. Zero missing.
- **No horizontal overflow** on any of those pages at any of those widths
  (`documentElement.scrollWidth === innerWidth`).
- **The disclosure strip renders on every one of them, including the 404**, with
  all four sentences and both links (`/ships-log`, `/crew`).
- **Consent behaviour byte-identical.** Rebuilt with a throwaway measurement ID
  so the banner's render guard opens. `dataLayer` at first paint is
  `js` → `consent default {analytics_storage: denied, ad_storage: denied,
  ad_user_data: denied, ad_personalization: denied, wait_for_update: 500}` →
  `set ads_data_redaction true` → `config <id> {anonymize_ip, send_page_view,
  allow_google_signals: false, allow_ad_personalization_signals: false}`. Body
  copy and the labels "Decline" / "Allow analytics" unchanged. Clicking "Allow
  analytics" writes `bct_analytics_consent = granted` and pushes
  `consent update {analytics_storage: granted, ad_storage: denied,
  ad_user_data: denied, ad_personalization: denied}` — the three `ad_*` denials
  survive a grant, exactly as before.
- The mobile `<details>` panel opens and lists all ten links; the two-column
  mobile footer renders all four groups.

**Two defects the gate found and fixed:**

1. **The header overflowed the document between roughly 700px and 990px.**
   `4a` is drawn at 1280 and the mobile rules start at 700, so the range between
   them was undescribed. Measured at a 768px viewport: `scrollWidth` 910 against
   `innerWidth` 768, i.e. 142px of horizontal page scroll on every route.
   Fixed in `components/SiteHeader.module.css` with a `max-width: 1100px` block
   that lets both tiers wrap and tightens their gaps. Nothing is hidden; the
   header just grows taller. Recorded in `docs/facelift-unapproved.md` §F6.
2. **The "Start Lesson Zero" pill rendered `--body` on `--accent`, about
   1.9:1.** `.shipNav a { color: var(--body) }` (0,1,1) outranked
   `.cta { color: var(--white) }` (0,1,0), so the module's own base rule ate its
   own CTA — and `.shipNav a:hover` additionally underlined the pill and turned
   it `--ink`. Rewritten as `.shipNav .cta` / `.shipNav .cta:hover`. Measured
   after the fix: **4.98:1**, and every other link in the header, footer and
   strip is between 5.47:1 and 16.46:1. This is exactly the failure mode the
   module's own header comment warns about, one selector further in.

**One record corrected.** `docs/facelift-unapproved.md` §G-g claimed
`aria-label="Primary navigation"` had been moved onto the ship tier and the
ecosystem row renamed "Ecosystem navigation". The code does the opposite, and
correctly: the preserved label stays on the preserved `.desktop-nav` element and
the new tier is "Ship navigation" — which is what `tests/preserved-surfaces.test.ts`
asserts. The doc was wrong, not the build; §G-g now describes what ships.

## What this gate still could not verify

**Pixel fidelity against the five approved PNGs.** The gate confirmed structure,
reachability, overflow, contrast and consent behaviour — it did not compare
spacing, type scale or colour against the artboard images side by side. That
remains manual QA under Phase 0's Q15 decision and is Phase 12's check.

---

# Phase 6 — WYS content model and modules

**Goal (plan Phase 6):** Ben's material has somewhere to go; every object
carries status and origin; no canonical string is defined twice; nothing is
invented.

## What shipped

| Deliverable | Files |
|---|---|
| The ten §8 interfaces, with `origin` on Ritual/Carry/Week and the container union widened to twelve | `content/watch-your-step/types.ts` |
| Ben's sources and slots — every one a labelled empty slot | `content/watch-your-step/sources.ts` |
| Nine principles, no Ben statement attributed to any of them | `content/watch-your-step/principles.ts` |
| Twelve fictional scenarios, incl. the two the artboards pre-answer and all eight §25 classes | `content/watch-your-step/scenarios.ts` |
| Twelve judgments, one deliberately `INSUFFICIENT_SIGNAL` | `content/watch-your-step/judgments.ts` |
| Ten boundaries, each carrying **both** risk directions | `content/watch-your-step/boundaries.ts` |
| One canonical variant, its invariant a reference rather than a copy | `content/watch-your-step/variants.ts` |
| The artifact type at twelve containers, and an empty bank | `content/watch-your-step/artifacts.ts` |
| Four rituals; the transfer check is data with no surface | `content/watch-your-step/rituals.ts` |
| Nine carries, none requiring reporting, each with an authority boundary | `content/watch-your-step/carries.ts` |
| Lesson Zero + stops A–H, with cadence and time-budget paths as data | `content/watch-your-step/weeks.ts`, `day-plans.ts` |
| Collapsed collisions, the pinned labels, the count-derived prose | `content/watch-your-step/copy.ts` |
| §3.4 judgment framework and the §9.3 completion condition, defined once | `content/canonical/judgment-framework.ts` |
| §35 posture vocabulary, the two Q20 flags, the serializer's domains | `content/watch-your-step/config.ts`, `domains.ts` |
| `CONTENT_VERSION` with its hand-bump rule | `content/watch-your-step/version.ts` |
| The external source-reference registry | `content/source-refs.ts` |
| The twelve §36 authoring templates | `content/watch-your-step/_templates/*.md` |
| Ship content: nine Standing Orders, two log entries + the Captain's Round note, the Bridge, the Crew Manifest, the Quarters | `content/ship/*.ts` |
| The two registries, and the tests that make them mandatory | `content/watch-your-step/index.ts`, `content/ship/index.ts`, `tests/wys-content.test.ts` |
| The governance arrays extended so the eight packet checks see the new modules | `tests/canonical-text.test.ts` |
| The draft preview dump extended to every new record | `scripts/preview-content.mjs` |

`content/site-config.ts` is **byte-identical** (`git diff main...HEAD --name-only`
does not list it). 222 tests pass; `npx tsc --noEmit` is clean; the build
prerenders 21 routes, all `○`.

## The status/origin mapping this phase used, and why

Three buckets, applied consistently, extending the mapping `content/claims.ts`
set in Phase 1:

1. **handoff README bucket 3 — draft placeholders.** Fictional scenarios, choice
   labels, revealed judgment bodies, the 18/61/21 split and stop titles A–H ship
   at `status: "draft"`. Under the ratified Q21 default
   (`RENDER_MARKED_DRAFT === false`) that means **the course content is not
   public**. It compiles, carries its labels, and shows in
   `node scripts/preview-content.mjs`. This is the ratified consequence, not a
   defect, and it is the thing Ben's answer to Q21 decides.
2. **Spec- or artboard-verbatim strings** → `status: "published"`,
   `origin: "BEN_APPROVED"` → `canon`. The §25 feedback line, the §26
   outranking line, the §3.4 framework, the §9.3 completion condition, the nine
   Standing Orders titles, the Bridge page strings and the Quarters intro. Ben
   approved the artboards and wrote the spec; the Captain's Stamp is a separate
   axis and still reads "Not yet stamped" from `lib/approval-state.ts`.
3. **Text this build authored that must still ship** → `status: "published"`,
   `origin: "IMPLEMENTATION_PLACEHOLDER"` → `marked`, so it renders **with** the
   label that says it is not Ben's words. The two Ship's Log entry bodies, the
   Captain's Round note, and every Crew Manifest row. This is the correct use of
   the two axes: bucket 3 is about `draft` status, and these are not draft — they
   are shipped text with a non-Ben origin.

Ben-origin material at `draft` (every source slot) resolves to `blocked`
everywhere, which is what makes a slot safe.

## Decisions this phase made, with reasons

- **`WysJudgment.origin` admits `IMPLEMENTATION_PLACEHOLDER`.** §8.4's literal
  union is four members and its only non-Ben option is `AI_SYNTHESIS`, whose §23
  label is "Coach synthesis based on Ben sources". There is no coach and no
  approved Ben source, so that label would be false of every judgment body in
  the bank — and the `4a` artboard draws "draft · implementation placeholder ·
  not Ben's words" under exactly that body. The type now equals
  `OriginFor<"judgment">`, so label totality is structural.
- **`origin` added to `WysWeek`** as well as to Ritual and Carry. Plan §6.1 names
  only the latter two, but stop titles A–H are bucket 3 and the phase exit is
  "every object carries status, origin and its source references". A week with no
  origin cannot be labelled.
- **Short-form sibling fields, not second records.** §6.8's own prescription for
  the client-meeting collision is "one record, `short`/`full` variants selected
  by breakpoint", so `WysScenario.shortForm`, `choices[].shortLabel` and
  `WysJudgment.shortCall` carry the 390px presentations of the same record.
- **The variant's invariant is a reference, not a copy.** §14 requires it to
  equal the parent's exactly; Standing Order 07 forbids defining the same text
  twice; and `tests/canonical-text.test.ts`'s duplicate-prose check enforces the
  second rule across files. `invariant: wysScenarioById("scn-group-chat").invariant`
  satisfies all three. (This was found by the test, not by review.)
- **Day plans are a declared vocabulary.** §8.10 types the cadence paths as bare
  `string[]`; §12 describes them one day at a time; §5.3 derives "visit n of m"
  from path length. So one element is one visit and `day-plans.ts` says what an
  element means. `timeBudgetPaths` hold `WysPathSegment` values — depth inside a
  session, never more stops.
- **`mostDays` is left undefined on every stop** and falls back to `days5` in the
  serializer. "Most days" changes how often someone returns, not how many visits
  a stop takes — §12 forbids accelerating through multiple source periods in one
  sitting.
- **The domains live in `content/watch-your-step/domains.ts`, not `config.ts`.**
  `lib/wys/aggregate.ts` runs in the browser and imports the aggregate flag from
  `config.ts`; putting the domains there would drag the whole curriculum into the
  client bundle through that one import.
- **An external source-reference registry now exists** (`content/source-refs.ts`).
  `content/claims.ts` already cited `"wys-spec-18"`-shaped ids that resolved to
  nothing, so a typo in a citation was invisible. Every citation now resolves to
  a repo record or a registered ref, or the test fails.

## Escalations recorded here, as the ratification instruction requires

Each is also in `docs/facelift-unapproved.md`.

1. **The raw voice corpus digest is not printed.** Plan §6.12 supplies a
   64-character hash for the corpus source asset;
   `tests/canonical-text.test.ts`'s stale-governance-hash check fails the build
   if any 64-hex string appears under `content/`, `lib/`, `app/` or `components/`
   while `approvalState.keel.sha256` is null. Weakening a live governance guard
   to admit one value nothing renders is the wrong trade, so the record cites the
   packet instead and `hash` is absent. **Ben decides** whether the check should
   distinguish a corpus digest from the keel digest.
2. **No `BEN_AUTHORED_VARIATION` exists, so the `5c` "Ben variant" pill has
   nothing to bind to.** Practice ships "as authored" rows only. The single
   variant is `AI_ADAPTATION` at draft status, authored at build time so §14's
   machinery has something real to check — never generated at runtime.
3. **The Ship's Log and Crew Manifest render with a draft mark on every record.**
   §6.2 rule 2 requires a `DraftMark` alongside the label for
   `IMPLEMENTATION_PLACEHOLDER`, and those pages are entirely that origin. It is
   honest and it is repetitive; Phase 9 may want one mark per section rather than
   one per row, which is a presentation decision, not a provenance one.
4. **The scaffold footnote, the Data page naming, the "Log" → "Ship's Log" chip
   change and the two YY Method labels** are collapsed as §6.8 requires and are
   recorded as data in `canonicalCollisions` (`content/watch-your-step/copy.ts`),
   four of the six flagged `escalated: true`.

## Hazards this phase creates for later phases

- **The public course is empty under Q21's default.** Every scenario, choice
  label, judgment body and stop title is `draft`, so `renderPolicyFor(...,
  "public")` returns `blocked` for all of it. Phase 7 must build the screens
  against that reality and must not "fix" it by changing a status field. One
  constant in `lib/content-status.ts` flips the whole thing when Ben rules.
- **Two registries are now the governance boundary.** A new module under
  `content/watch-your-step/` or `content/ship/` must be added to its
  `index.ts` registry (or to the module's record-free list) in the same commit.
  `tests/wys-content.test.ts` fails otherwise. That test is what turns
  §7.5's warning into a mechanism.
- **`tests/canonical-text.test.ts`'s duplicate-prose check now has real content
  to bite on.** Any ≥12-word sentence repeated across two files under `content/`
  fails the suite. The fix is always a reference, never a second copy.
- **Every citation must resolve.** Adding a new `sourceIds` entry means adding it
  to `content/source-refs.ts` first, unless it names a `WysSourceAsset`.
- **`CONTENT_VERSION` must be hand-bumped** when a scenario's rendered text or
  choice set changes, or a judgment's reveal changes. Distributions must never
  mix versions. Nothing bumps it automatically, by design.
- **The stop count is derived.** `stopCount()` and `stopCountWord()` are the only
  ways to render it. `tests/wys-content.test.ts` fails on a typed "Nine stops" or
  `"n of 9"` literal in `content/`; Phase 7 must not reintroduce one in a
  component.
- **The artifact bank is empty and stop C says so.** Phase 7 renders
  `ARTIFACT_BANK_EMPTY_REASON` rather than an invented screenshot.
- **Slot records live in `content/watch-your-step/sources.ts`, including the ones
  the ship pages use.** `content/ship/quarters.ts` and `bridge.ts` reference them
  by id so a slot has one definition wherever it appears.

## Corrections made at the Phase 6 gate

The gate re-ran `npm test`, `npx tsc --noEmit`, `PORT=3999 npm run build`,
`scripts/check-no-deletions.sh` and `scripts/check-secrets.sh`, then checked each
exit criterion against the files rather than against the report. Three things
failed and were fixed rather than reported.

**1. Authored prose was labelled "Approved by Ben."** Five string variants across
`content/watch-your-step/copy.ts` and `artifacts.ts` extended an approved
sentence with wording that appears in no source, while carrying `status:
"published"` + `origin: "BEN_APPROVED"` — which `renderPolicyFor` resolves to
`canon`, meaning "may render as Ben-attributed". The exit criterion "nothing
claims Ben authorship" was therefore not met. Every one of them was expanding a
spec sentence that is an instruction to the *build*, not a line for the learner
("Do not shame the learner", "The product should regularly tell the learner to
leave"), so the wording is gone and a test enforces the instruction instead.
`fictional-artifacts-only` was wholly build-authored and now ships at `draft` /
`IMPLEMENTATION_PLACEHOLDER`, on the Final-copy escalation list.

The mechanism that stops the recurrence is new and is the important part:
`sourceIds` is a **record-level** citation, so one sourced variant satisfies it
however many unsourced ones sit beside it. `tests/canonical-text.test.ts` now
requires a `variantSources` entry for **every string variant on every record
that resolves to `canon`** — the citation is per rendered string. It does not
prove the words are in the source, but an invented string can no longer be added
without writing down a checkable source, which is the difference between
provenance and a habit of writing plausible ids.

**2. Eleven strings had two definitions.** `wysLabels` restated four node labels
`content/nav.ts` pins and six slot strings the records in
`content/watch-your-step/sources.ts` carry; `content/ship/quarters.ts` retyped
four door labels `content/site-config.ts` names and the "Selected history" slot
heading. The duplicate-prose check did not catch them because it only fires at
≥12 words, and short labels are exactly where a node quietly acquires two names.
All eleven now reference their single definition. Later phases: **a label is
never retyped** — `navLabel()`, `footerDoorLabel()`, `destination().eyebrow` and
`wysBenSlotById()` are the ways to get one.

**3. The stale-governance-hash check conflated two kinds of digest**, which is
why the first pass had to drop the corpus SHA-256 plan §6.12 names. A governance
digest (the frozen keel) and a content-integrity digest (which file a record
stands for) are different objects. §6.8's requirement is that no hash **renders**
on the site; scanning source text was a proxy for it. The check now enforces the
requirement itself — zero 64-hex strings under `app/`, `components/` or `lib/`,
and in `content/` only the digests declared in `CONTENT_INTEGRITY_DIGESTS`, in
the one file that declares them, on a record whose `allowedSurfaces` is `[]`.
The guard is stricter than before and §6.12 is satisfied. Nothing was escalated.

Result: 224 tests pass (222 before the gate, +2 new governance checks),
`tsc --noEmit` clean, build green at 21 routes all `○`, deletion contract empty
in both directions, `content/site-config.ts` byte-identical to `main`.

---

# Phase 7 (shell) — route group, per-stop route, shared course primitives

**Scope:** the SHARED half of plan Phase 7 only. Today, Plan, Progress,
Practice, Lesson Zero and Data are built by five other builders on top of what
landed here; nothing in this phase renders one of those screens.

## What shipped

| Deliverable | Files |
|---|---|
| The five-item bottom nav, mounted once on the `(shell)` group | `components/wys/BottomNav.tsx`, `app/watch-your-step/(shell)/layout.tsx` |
| The tab inventory, the no-active-item rule, the per-stop labels | `content/watch-your-step/tabs.ts` |
| The per-stop route: `generateStaticParams()` + `dynamicParams = false` | `app/watch-your-step/(shell)/stop/[stopId]/page.tsx` |
| The derived visit counter, pure and its client renderer | `lib/wys/visit.ts`, `components/wys/VisitCounter.tsx` |
| The JUDGE state machine, pure | `lib/wys/judge-machine.ts` |
| The JUDGE composite | `components/wys/JudgeCard.tsx` |
| The scenario card, the course screen container, the provenance marks | `components/wys/ScenarioCard.tsx`, `CourseScreen.tsx`, `ProvenanceMarks.tsx`, `GatedText.tsx` |
| The one way a screen turns a content record into renderable prose | `lib/wys/content-gate.ts` |
| The JUDGE surface copy, defined once for four surfaces | `content/watch-your-step/judge.ts` |
| `wys_source_period_start` at the point §19.4 names | `components/wys/StopStartTelemetry.tsx` |
| The shell's own checks | `tests/wys-shell.test.ts` |

254 tests pass; `npx tsc --noEmit` is clean; the build prerenders 30 static
pages across 20 routes — 19 `○` and the stop route as `●` over nine ids, **zero
`ƒ`**. The deletion contract is empty in both directions.

## What the five view builders import (the shared surface, in one list)

- `CourseScreen` — title, right-hand meta node, optional lead, children.
- `GatedText` / `ProvenanceMarks` — prose that cannot render without its label.
- `ScenarioCard` — the white 1.5px card, the fictional pill, one provenance line
  for the setting and the decision moment together.
- `JudgeCard` — choices, Commit, judgment, distribution, continue/reset. Give it
  `judgeLabels.commit` and `judgeLabels.reset`; do not type either.
- `VisitCounter` — "Stop A · visit 1 of 3", derived.
- `StopStartTelemetry` — mount it on Today as well as the stop route.
- `WysBottomNav` — already mounted in the layout; do not mount a second one.
- `gateProse` / `gatedCanonicalText` — **the only sanctioned way** to get text
  out of a content record and onto a screen.
- `courseTabs`, `activeCourseTab`, `stopDisplayName`, `stopRouteLabels`,
  `visitId`, `visitPositionFor`, `visitLabel`.

## Decisions this phase made, with reasons

- **The state machine is a pure module, not `useState` inside the card.** The
  product's whole claim is "nothing is revealed before commit", and this suite
  has no DOM and no renderer (Q15). Keeping the four transitions in
  `lib/wys/judge-machine.ts` makes the invariant a unit test over every reachable
  state instead of a promise about a component. `JudgeCard` is the plain
  `useState` shell WYS §10 asks for.
- **The judgment is a conditional render, not hidden markup.** No CSS
  visibility, no `<details>`: pre-commit the judgment is not in the DOM at all,
  which is what a crawler, a no-JS visitor and the first paint receive.
- **The tab inventory lives in `content/watch-your-step/`, not `content/nav.ts`.**
  `tests/preserved-surfaces.test.ts` reads every internal href in `nav.ts` and
  fails if one has no page file — the right rule for site chrome, and the wrong
  one for a shell whose five screens land with five other builders. The tabs are
  asserted against `WYS_ROUTES` instead, which is the same list the URL-privacy
  test and the serializer's `ui.lastRoute` domain use.
- **The tab bar is a client component for exactly one reason:** `usePathname`,
  to know which item is current. The hrefs are constant in server HTML (§5.4),
  the bar works with JavaScript off, and the active item is a font weight.
- **One bar, mounted on the `(shell)` layout.** It must not remount between
  tabs, and putting it in the layout makes "no active item on the landing" a
  property of the route rather than of six page files agreeing.
- **The visit id is qualified by its stop** (`stop-a:day-human-source`). See
  `docs/facelift-unapproved.md` I2 — the bare day-plan id repeats across stops
  and would advance the wrong counter. No new field; the shape stays verbatim.
- **`JudgeCard` persists the pick itself.** Q20 ships `PERSIST_LOCAL_JUDGMENTS`
  ON because `5b` Progress draws "C → B · revised", which needs the earlier
  choice to still exist. A server page cannot pass a callback to a client
  component, so putting the write inside the card is what keeps every JUDGE
  surface consistent without five wrapper components. A second commit writes
  `revisedChoiceKey` and leaves `choiceKey` alone; `persist={false}` is there for
  a replay that must not overwrite the kept judgment (WYS §14).
- **The commit fires `sendAggregate`, never `trackWys`.** `wys_scenario_choice`
  is aggregate-only (WYS §19.4) and `trackWys` refuses it by name. In v0 the
  adapter is disabled and has no endpoint, so the call sends nothing — it is
  wired so the firing point is recorded rather than invented later.
- **`wys_source_period_start` is guarded by a module-level `Set`, not
  `sessionStorage`.** A session key would be more precise across reloads and
  would also be a third browser key that `lib/wys/browser-keys.ts` and the Data
  page would both have to declare. A small overcount is a diagnostic
  imprecision; an undeclared key is a broken promise about what this site
  stores.
- **`DistributionBars` gained a required `heading` prop and lost its hardcoded
  one.** It used to type "How others answered" into the strip layout while `4a`
  drew the same words plus "totals only · no one is tracked" beside them — one
  label with two definitions, below the ≥12-word duplicate check's threshold.
  Both strings now come from `content/watch-your-step/judge.ts`. Nothing was
  dropped; the strip still reads the same words, from one definition.
- **The blocked state is a first-class rendering.** `GatedText` renders the
  provenance label *in place of* the prose when a record is blocked, so a screen
  built against Q21's default is honest rather than empty.

## Hazards this phase creates for later phases

- **The public course renders labels, not prose.** Under Q21's default every
  scenario, judgment and stop title resolves to `blocked`. Build screens against
  that. Do **not** "fix" a blank-looking screen by editing a `status` field —
  one constant in `lib/content-status.ts` flips the whole course when Ben rules.
- **`tests/class-contract.test.ts`'s CSS-module import count is now 35.** Every
  new primitive or screen that imports a `.module.css` updates that number
  deliberately. That is what the assertion is for.
- **`canonicalCollisions` is now seven rows** and `tests/wys-content.test.ts`
  asserts the count. Adding a collapsed collision means updating it.
- **A new module under `content/watch-your-step/` must be registered** in
  `./index.ts` — in `wysRegistry`, in `wysCanonicalRecords`, or in
  `WYS_NON_RECORD_MODULES`. `judge.ts` and `tabs.ts` took the last two routes.
- **The five tab destinations do not exist yet.** `/today`, `/plan`,
  `/progress`, `/practice` and `/data` are linked by the bar and land with the
  five view builders. Until they do, the bar links to routes that 404 — which is
  why the tab hrefs are asserted against `WYS_ROUTES` rather than against page
  files, and why the *next* phase to touch `tests/preserved-surfaces.test.ts`
  should add them to the served-URL assertions once they exist.
- **`/watch-your-step/today` owns the one state-dependent redirect** (§5.4). The
  tabs must never grow a second one; `/data` never redirects.
- **`JudgeCard` pulls `content/watch-your-step/domains.ts` into the client
  bundle** (through `useWysState`), and with it the scenario, stop and posture
  id arrays. That is the intended path for every state-reading component, but it
  is the reason the course bundle is larger than the ship pages'.

---

# Phase 7 (Plan view) — the finite horizon

**Scope:** `/watch-your-step/plan` only (artboard `5b` Plan, WYS §12). Built on
the Phase 7 shell; nothing shared was edited except the two registries a new
module and a new stylesheet are required to update.

## What shipped

| Deliverable | Files |
|---|---|
| The Plan screen: pace pill, intro, nine rows, footnote, optional practices, "Change pace or time" | `app/watch-your-step/(shell)/plan/page.tsx` |
| The three row states, pure and unit-tested | `app/watch-your-step/(shell)/plan/plan-model.ts` |
| The content half — gating, derived marks, day-plan summaries | `app/watch-your-step/(shell)/plan/plan-content.ts` |
| The two state-dependent slots | `app/watch-your-step/(shell)/plan/PlanStops.tsx` |
| The route's own stylesheet | `app/watch-your-step/(shell)/plan/plan.module.css` |
| The pace vocabulary and the Plan row labels | `content/watch-your-step/plan.ts` |
| 27 checks, including the negative ones | `tests/wys-plan.test.ts` |

`/watch-your-step/plan` builds `○` (Static). `npx tsc --noEmit` is clean and
`scripts/check-no-deletions.sh` is empty in both directions.

## Decisions this phase made, with reasons

- **Three row states, and the model has no clock.** (WYS §12)'s prohibitions —
  no artificial "behind", no guilt for missed days, no punishment for using the
  site less — are enforced by the shape of `planRows()`, which takes no
  timestamp and computes no ratio, not by careful copy (R8). A learner who
  disappears for a year gets byte-identical rows to one who was here this
  morning, and `tests/wys-plan.test.ts` asserts exactly that with two states
  differing only in `lastOpenedAt`.
- **Current is the FIRST INCOMPLETE stop, not the furthest reached.** A
  "furthest" model has to call the stops behind it something, and every word for
  that is a word (WYS §12) forbids. Finishing stop D out of order marks D done
  and leaves the learner at Lesson Zero, with nothing marked skipped.
- **Unread state renders the whole plan with nothing marked.** §7.3 forbids
  reading `wys:v1` during render, so the server HTML, the first client render
  and a no-JS visitor all get §5.4's honest zero state — every row a live link,
  no dark card, no numerals. The alternative (guess a current stop, then correct
  it) is wrong for exactly the people with the most state.
- **The page is a server component; two small client components read state.**
  `PlanStops` (row states) and `PlanPacePill` (the "3 days · ~10 min" pill).
  Splitting the content half into `plan-content.ts` keeps the gating on the
  server, where it cannot be skipped, and — because that module imports no CSS
  and no JSX — makes the whole screen testable without a renderer (Q15).
- **Every row links to the per-stop route, including the done ones.** §5.3 calls
  `/stop/[stopId]` "the deep-linkable form used by Plan rows", and this is the
  first surface that links to it. A finished stop stays reachable: replay
  (WYS §14) and From Memory (WYS §15.1) both depend on going back.
- **One provenance line for nine withheld titles** (see
  `docs/facelift-unapproved.md` P5), computed from the distinct labels rather
  than assumed to be one.
- **The pace vocabulary lives in `content/watch-your-step/plan.ts` with both of
  its approved presentations**, so Lesson Zero and Plan cannot describe one
  choice two ways. See P3 — **Lesson Zero must import it.**

## Requests for the gate (shared files this phase did NOT change)

- **`components/wys/CourseScreen.tsx` renders `<p>{meta}</p>` whenever `meta` is
  passed**, so a client `meta` that returns `null` before hydration leaves an
  empty paragraph in the header row. It is harmless (zero-width, no gap
  collapse) and was left alone rather than edited. If a later phase touches the
  shell, rendering the `<p>` only when the node produces output would be the
  tidier form.
- **Nothing else shared was needed.** `CourseScreen`, `GatedText`,
  `ProvenanceMarks`, `LinkRow`, `Pill`, `SectionEyebrow`, `ProvenanceMono`,
  `gateProse`, `gatedCanonicalText`, `visitPositionFor`, `visitLabel`,
  `visitId`, `stopDisplayName`, `stopLetter` and `wysLabels` were all imported
  as they stand.

## Hazards this phase creates for later phases

- **`content/watch-your-step/plan.ts` is the single home of the pace labels.**
  Lesson Zero's "How often? / How long each time?" step imports
  `wysCadenceOptions` / `wysTimeBudgetOptions` and renders `optionLabel`. Typing
  those strings again would pass every test and silently break the Plan pill.
- **"Change pace or time" targets `/watch-your-step/start`.** Lesson Zero has to
  cope with an entry from a learner who has already completed onboarding (P2).
- **`WysWeek.optionalPracticeIds` is now rendered, not just declared.** A stop
  that lists a ritual id renders a row for it on Plan; a ritual removed from
  `rituals.ts` while still referenced fails `wysRitualById` at build time, which
  is the intended direction.
- **The forbidden-vocabulary check in `tests/wys-plan.test.ts` strips comments
  before scanning.** It is deliberately scoped to the Plan route and
  `content/watch-your-step/plan.ts`. A sitewide version of the same check is
  worth having at the Phase 12 audit; do not narrow this one to make a new
  screen pass.
- **The CSS-module import total is 47.** The Plan view adds two (page.tsx and
  PlanStops.tsx). It was re-measured, not incremented, per the merge note in
  `tests/class-contract.test.ts`.


# Phase 7 (Today view) — the WATCH → TRY → JUDGE → CARRY loop

**Scope:** the Today surface only (artboard `5b`, dc.html:78-96; WYS §10). The
shared course shell, the JUDGE composite, the visit derivation and the content
gate already existed and were imported, not rebuilt.

## What shipped

| Deliverable | Files |
|---|---|
| The route, static, with the metadata convention | `app/watch-your-step/(shell)/today/page.tsx` |
| Which stop Today shows — pure, and unit-tested | `app/watch-your-step/(shell)/today/current-stop.ts` |
| The per-stop view model, gated, with the blocked-prose redaction | `app/watch-your-step/(shell)/today/view.ts` |
| WATCH — 196px slot, overlay pill, decorative disc, caption, transcript disclosure | `app/watch-your-step/(shell)/today/WatchCard.tsx` |
| CARRY — teal card, the "then leave" sentence, the mark | `app/watch-your-step/(shell)/today/CarryCard.tsx`, `CarryMark.tsx` |
| One stop shown out of eight rendered | `app/watch-your-step/(shell)/today/CurrentStopGate.tsx` |
| §5.4's one state-dependent redirect | `app/watch-your-step/(shell)/today/OnboardingRedirect.tsx` |
| "About 10 minutes." | `app/watch-your-step/(shell)/today/TimeBudgetNote.tsx` |
| The screen's geometry | `app/watch-your-step/(shell)/today/today.module.css` |
| The WATCH caption, the transcript slot, the control labels, the scenario pin | `content/watch-your-step/today.ts` |
| 26 checks | `tests/wys-today.test.ts` |

TRY/JUDGE has no file of its own: it is `ScenarioCard` wrapping `JudgeCard`,
both from `components/wys/`, with content passed in. That is what the shell was
for.

`npx tsc --noEmit` is clean, `PORT=3999 npm run build` prerenders
`/watch-your-step/today` as `○` with zero `ƒ`, and
`scripts/check-no-deletions.sh` is clean in both directions.

## Decisions this phase made, with reasons

- **The loop is server-rendered once per stop and gated client-side.** Today is
  one static URL that has to show a different stop to different learners, from
  state §7.3 forbids reading during render. The two alternatives both fail: a
  server component cannot know the stop, and a client component that BUILT the
  loop would have to receive every stop's prose as props — which would put
  withheld draft text into the flight payload, the one place `GatedText`'s
  blocked branch exists to keep it out of. `CurrentStopGate` receives
  `children`, never content.
- **Blocked prose is redacted before it crosses a client boundary.**
  `JudgeCard` is a client component, so `judgment.content` is serialized whether
  or not it renders. `view.ts`'s `withheld()` empties the text of a blocked
  record on the way out. It is a redaction and not a constructor — it spreads an
  existing gated object, so the branded `ProvenanceLabel` and the policy stay
  the ones `gateProse` computed.
- **The stop, not the visit, is what the gate compares.** The visit position is
  already derived by `lib/wys/visit.ts`; Today needed one more derivation and no
  more, so `current-stop.ts` is forty lines over that same function and is
  covered by unit tests at each position a learner can be in.
- **`wys_carry_reached` fires on render, `wys_source_period_complete` on the
  mark.** That split is `lib/wys/telemetry.ts`'s own decision table, not a
  choice made here: "fire on RENDER, not on 'marked done' — a self-marked
  completion would be a weaker fact dressed as a stronger one." The mark fires
  the completion event only when it finishes the stop's whole cadence path.
- **The reached-event guard is a module-level `Set`,** the same trade
  `StopStartTelemetry` documents: a small overcount is a diagnostic imprecision,
  an undeclared browser key is a broken promise about what this site stores.
- **Client components receive a stop PROJECTION, never the week record.**
  `{ id, offSite, cadencePaths }` is everything `visitPositionFor` needs;
  passing the whole `WysWeek` would serialize its draft title and purpose into
  the payload for no gain.
- **The screen's title comes off `courseTabs`.** "Today" is the tab label and
  the screen name — one node, two presentations (§6.8) — so the page reads it
  rather than becoming a third place the word is written.

## Requests for shared files — NOT made here, for the gate

Each of these needs a change to a file this phase does not own. Today ships
correctly without them; each is a sharpening, and the first two are the two most
worth doing.

1. **`components/wys/JudgeCard.tsx` should write
   `progress.completedScenarioIds` on commit.** (WYS §13): "a scenario counts on
   the required judgment." `JudgeCard` already persists `localJudgments` for
   Q20, so it is the only component that knows a commit happened, and it exposes
   no callback a screen could hang the write on. Today therefore records the
   carry and the visit but not the scenario, and `tests/wys-completion.test.ts`
   (plan Phase 7) will want the scenario half.
2. **`components/wys/useWysState.ts` should share one subscription.** Every
   instance holds its own snapshot, so a write in `CarryMark` does not reach the
   `VisitCounter` or the `CurrentStopGate` on the same screen — the counter
   advances on the next visit rather than under the learner's hand (recorded as
   T12; it reads acceptably, but it is a fact about the hook rather than a
   design). A module-level store with `useSyncExternalStore` would fix it for
   every course screen at once, and would also collapse ~30 redundant
   `localStorage` reads on Today's mount into one.
3. **`lib/wys/content-gate.ts` should export the `withheld()` redaction.** Today
   carries a local copy in `view.ts`. Every screen that hands gated content to a
   client component needs the same three lines, and a screen that forgets them
   silently ships blocked prose in its payload — exactly the failure mode a
   shared gate exists to make impossible.
4. **`components/wys/GatedText.tsx` could take a body size.** `5b` draws the
   CARRY body at 15px and the WATCH caption at 16px; `GatedText` sets 16px, so
   the carry card is a pixel out (T11). A `size` prop is the honest fix; a
   wrapper rule reaching into the component's `<p>` is not.
5. **`tests/preserved-surfaces.test.ts` should add the course tabs to its
   served-URL assertions** once all five exist. The shell's hazard note asks the
   *next* phase to do it; Today alone cannot, because the assertion has to name
   all five and Today is one of them.

## Hazards this phase creates for later phases

- **`tests/class-contract.test.ts`'s CSS-module import count moved to 46.**
  Today adds five imports of one module (`page.tsx`, `WatchCard`, `CarryCard`,
  `CarryMark`, `TimeBudgetNote`). The baseline moved twice while this phase was
  in flight, because four other course views were landing at the same time — the
  number is asserted exactly on purpose, so whoever lands last re-runs the test
  and sets it.
- **`content/watch-your-step/today.ts` is registered in TWO places.** It carries
  a canonical record (`todayCopyRecords`) and a governed object
  (`todayBenSlots`), so it appears in `wysCanonicalRecords` AND in `wysRegistry`
  — and therefore NOT in `WYS_NON_RECORD_MODULES`. A module with both kinds of
  record needs both entries or half of it escapes the governance checks.
- **Today assumes the Lesson Zero flow writes `onboarding.completed`.** It is
  the only thing that stops the redirect at `/watch-your-step/start`, and a flow
  that completes without setting it would bounce every learner back into
  onboarding. It does NOT assume the flow writes a Lesson Zero visit id: the
  current-stop derivation skips `stop-zero` entirely for that reason.
- **The carry mark is the only writer of a visit id.** If a later surface wants
  to complete a visit some other way, it must use `visitId(stopId, dayPlanId)`
  from `lib/wys/visit.ts` — a bare day-plan id repeats across stops and would
  advance the wrong counter.
- **Stop F renders WATCH and CARRY with no TRY/JUDGE.** It declares no scenario
  bank because it happens off-site (WYS §15.2). The detox surface the plan
  schedules for it is a different component and is not built here; until it
  lands, Stop F's Today is the loop minus the exercise, which is truthful but is
  not the detox screen §15.2 describes.

---

# Phase 7 (Practice view) — replay, From Memory, appetite

**Scope:** the Practice view only (artboard `5c` phone 1; WYS §14, §15.1, §21).
Built on the Phase 7 shell — `CourseScreen`, `GatedText`, `ScenarioCard`,
`JudgeCard`, `gateProse`/`gatedCanonicalText`, `WysBottomNav`. Nothing shared
was rebuilt and no shared component was edited.

## What shipped

| Deliverable | Files |
|---|---|
| The route: three sections in the artboard's order, all server-rendered | `app/watch-your-step/(shell)/practice/page.tsx` |
| Practice's four canonical records, its pinned labels, and the two §14 replay modes with the invariant rule enforced at the point of use | `content/watch-your-step/practice.ts` |
| REPLAY rows — mode tags, the withheld state, the empty state, `wys_replay`, `progress.replayCounts` | `components/wys/ReplayList.tsx` |
| FROM MEMORY — the ink card, the never-persisted scratch box, "I did it" | `components/wys/FromMemory.tsx` |
| The appetite filter — one outlined pill, local record, `wys_depth_interest` | `components/wys/AppetiteCard.tsx` |
| The eyebrow-and-landmark pairing, once | `components/wys/PracticeSection.tsx` |
| The view's own stylesheet | `components/wys/practice.module.css` |
| 31 checks, including the (WYS §29.2) `DO_NOT_SEND_WYS_TEST_9f31` canary | `tests/wys-practice.test.ts` |

`/watch-your-step/practice` builds as `○ (Static)`. No draft scenario prose
appears anywhere in the generated HTML — verified by grepping the built page for
seven distinct scenario strings, all zero.

## Decisions this phase made, with reasons

- **A blocked record's words are stripped before they cross into a client
  component.** `GatedContent` carries `text` even when `policy.kind ===
  "blocked"`. In a server component that is harmless — nothing prints it — but
  a blocked string passed to a client component travels in the RSC payload and
  lands in the document. "The words are not in the DOM" has to mean the payload
  too, so `redactIfBlocked()` empties it at the boundary and a scenario that may
  not render is serialized with **no exercise object at all**. See the gate
  request below: this belongs in the substrate, not in one view.
- **The replay list is learner state, so it is client state.** A replay is a
  re-run of an exercise the learner has already judged; listing the whole bank
  would turn Practice into a browsable answer key and would show a stateless
  visitor material they have not reached. The filter is `localJudgments` ∪
  `progress.completedScenarioIds`, which means server HTML shows the empty
  state and the rows arrive on hydration (§7.3). That is why the empty state is
  a designed state here rather than a fallback.
- **A `BEN_AUTHORED_VARIATION` origin is the only thing the "Ben variant" tag
  can bind to.** The one shipped variant is `AI_ADAPTATION`, which is neither of
  §14's two modes; tagging it "Ben variant" would attribute machine-drafted
  prose to Ben (R9's unsafe direction). So v0 renders "as authored" rows only,
  exactly as plan Phase 7 allows and as `tests/wys-content.test.ts` already
  asserts of the bank.
- **The §14 invariant rule is checked twice, at authoring and at use.**
  `assertReplayInvariant()` throws if a variant's invariant has drifted from its
  parent's or its `judgmentMapping` no longer covers every parent choice key. It
  runs in a server component at build time, so drift fails `next build` instead
  of shipping a "replay" that quietly asks a different question.
- **`wys_replay` and `wys_depth_interest` are both fired bare.** Their own
  decision rows in `lib/wys/telemetry.ts` set the exposure at "the event name"
  — not the scenario, the choice, the revision or a reason. `trackWys` refuses
  to send without granted consent, so a visitor who declined analytics produces
  no request from either component.
- **The appetite card writes locally BEFORE it fires.** If analytics is blocked,
  declined or unconfigured, the learner's own record is still made; the
  browser-local half of the feature does not depend on the telemetry half.
- **The pill disables itself once recorded.** A second click would inflate the
  one number (WYS §2.1) says Ben will read, and §21 forbids treating it as a KPI
  to maximise. The recorded state is 11px mono in the muted provenance voice —
  §37's "not visually rewarded", made literal.
- **From Memory has no write path at all.** No `useWysState`, no `update`, no
  `localStorage`, no `fetch`, no `trackWys` — read the import list. The scratch
  value is one `useState` referenced in exactly two expressions (the binding and
  the textarea's `value`), and `tests/wys-practice.test.ts` counts them.
- **"Say it aloud" and "Write it on paper" are list items, not buttons.**
  Nothing on this site can know whether someone said something aloud, and a
  button implies a record.
- **The scratch box cannot render without §15.1's label.** `notice` is a
  required prop and the textarea is gated on `isShowable(notice)`. There is no
  code path that draws an unlabelled scratch box — the difference between the
  promise being kept and the promise being printed.
- **Practice renders no distribution.** The 18/61/21 split is illustrative data
  belonging to the `4a` hero and shipped only with its caption (§6.5, Q11). A
  practice surface has no counts to show and an uncaptioned bar here would be
  the §6.5 failure exactly. Asserted.

## Shared files this phase DID change, and why it had no choice

- `content/watch-your-step/index.ts` — `practice.ts` is registered in
  `wysCanonicalRecords` and in `WYS_NON_RECORD_MODULES`. §7.5's rule is that an
  unregistered content module escapes every governance check silently, and the
  registry's own header says "Add a content module, add it here, in the same
  commit." Additive only: one import, one spread, one list entry.
- `tests/class-contract.test.ts` — the CSS-module import count. Four new
  imports of `components/wys/practice.module.css`. **The number is a TOTAL that
  all five Phase 7 view builders contribute to**; a merge that keeps one
  builder's figure and drops another's fails the assertion rather than silently
  losing a stylesheet from coverage. Re-measure at the gate.

## Requests for the gate (shared files this phase did NOT change)

1. **`lib/wys/content-gate.ts` should empty `text` on a blocked policy.** Every
   view that hands gated content to a client component has the payload problem
   described above, and every one of them will have to remember to redact. One
   line in `gateProse`/`gateCanonical` would make it structural, the way the
   rest of that module is. Practice redacts locally in the meantime.
2. **`lib/wys/local-state.ts`: the four completed-id arrays are shape-checked,
   not vocabulary-checked.** `completedLessonIds`, `completedScenarioIds`,
   `completedCarryIds` and `transferCheckIds` accept any id token, so a
   whitespace-free free string could be persisted there by a careless caller.
   Not a defect for this view — From Memory has no write path — but the
   `domains` argument already exists and could carry these lists too. Recorded
   with a test that pins the current behaviour both ways.
3. **`tests/preserved-surfaces.test.ts` should gain the five course routes**
   once all five views have landed. The shell phase flagged this; Practice does
   not take it unilaterally because the assertion is a count over all of them.
4. **§7.1 holds no field for a ritual completion.** If Ben wants From Memory's
   "I did it" recorded rather than acknowledged in-page, that is a schema
   decision about a verbatim spec shape, not a component change. See
   docs/facelift-unapproved.md R4.

## Hazards this phase creates for later phases

- **The Progress "replay used" tile reads `progress.replayCounts`, which this
  view is the only writer of.** Opening a replay row increments it once. If the
  Progress builder derives that tile from anything else, the two will disagree.
- **Under Q21's default no replay is runnable**, so `wys_replay` cannot fire in
  v0 and the JUDGE composite inside a replay row has never rendered on a real
  screen. The machinery is built, unit-tested and wired; the first time it draws
  will be the first time the constant is flipped, and it should be looked at
  then rather than assumed.
- **When Q21 flips, the whole scenario bank's prose enters the RSC payload of
  this route** — the exercise objects are built server-side for every scenario
  and filtered client-side. That is fictional practice material rather than
  learner data, but it is a curriculum-forward leak and a later phase may want
  to key replay rows to a route segment instead.
- **`ReplayList` and `AppetiteCard` both mount `useWysState`,** which pulls
  `content/watch-your-step/domains.ts` into the client bundle. That is the
  intended path for a state-reading component and is why this route's first-load
  JS sits with Today's and Progress's rather than with the ship pages'.

---

# Phase 7 (Progress view) — evidence, not a score

**Scope:** `/watch-your-step/progress` only (plan Phase 7, the Progress row;
mockup `5b` Progress, dc.html:121-145; WYS §13). Built on the Phase 7 shell;
nothing shared was edited.

## What shipped

| Deliverable | Files |
|---|---|
| The route: static, no redirect, no dynamic segment | `app/watch-your-step/(shell)/progress/page.tsx` |
| The whole state-dependent screen — tiles, judgment rows, rulebook | `app/watch-your-step/(shell)/progress/ProgressView.tsx` |
| Its geometry | `app/watch-your-step/(shell)/progress/progress.module.css` |
| Two canonical records, the pinned labels, the four tiles, the pure derivations | `content/watch-your-step/progress.ts` |
| Registration | `content/watch-your-step/index.ts` (`wysCanonicalRecords` + `WYS_NON_RECORD_MODULES`) |
| 22 checks | `tests/wys-progress.test.ts` |

`/watch-your-step/progress` builds `○` (Static). `npx tsc --noEmit` is clean for
these files.

## Decisions this phase made, with reasons

- **§13's do-not-show list is held as an ABSENCE, not as a rule a component
  remembers.** Nothing in `content/watch-your-step/progress.ts` divides one count
  by another, and `tests/wys-progress.test.ts` asserts that there is no division
  operator left in the module once comments, import paths and string literals are
  removed. A percentage cannot be rendered by a screen whose data layer cannot
  compute one. The same test scans the view and the stylesheet for `%`, "streak",
  "XP", "badge", "ranking", "behind", "overdue" and "on track".
- **"stops completed" reuses `visitPositionFor`.** The alternative,
  `completedLessonIds.length`, counts visits: a half-finished two-day stop would
  have read as a completed stop, and Today's "visit 2 of 3" would have disagreed
  with Progress on the same browser.
- **"judgments committed" is a union, so the tile is true whichever writer ran.**
  §13's completion semantics make the committed judgment the thing that completes
  a scenario, so `completedScenarioIds` and the keys of `localJudgments` describe
  one fact. See the gate request below — `JudgeCard` writes only the second.
- **The whole body is one client component.** Every mark on the screen except the
  title and the denominators comes from `wys:v1`. Splitting it would have meant
  three components each calling `useWysState`, three reads, and three chances to
  disagree about `loaded`.
- **A blocked record's prose is stripped before it crosses the client boundary.**
  `withheldTextRemoved` in `page.tsx`. Props of a client component are serialised
  into the RSC payload, which ships inside the HTML and is public page source —
  so "`GatedText` never renders it" and "it is not published" are different
  promises. Verified on the built page: `progress.html` contains none of the
  twelve draft scenario titles and twelve provenance labels in their place.
- **The learner's rulebook goes through the same gate as everything else,**
  constructed at `published` + `LEARNER_OWNED` (`learnerRuleProvenance`). Q21's
  flag is about *Ben's* unapproved prose; blanking a learner's own rules with it
  would be absurd, and `published` is literally true — nobody is waiting to
  approve them.
- **Both Q20 flags gate their own section.** With `PERSIST_LOCAL_JUDGMENTS` false
  nothing can ever write a judgment row, so the section does not render; with
  `SHIP_LEARNER_RULEBOOK` false the rulebook, its footnote and its export do not
  render. Both default ON, matching the artboard. Config edits, not component
  edits (WYS §35).
- **Delete is two-step.** One tap next to Edit on a 44px target would otherwise
  destroy something the learner wrote and cannot recover. `Delete` →
  `Confirm delete` / `Cancel`.
- **The export is client-side and is the learner's lines only** — no header, no
  ids, no timestamps, no branding. `rulebookAsText` decides that, so the shape of
  the file is a unit test rather than a browser check.
- **Progress fires no telemetry.** No allowlisted event names this screen as its
  firing point (WYS §19.4), and (WYS §16) forbids sending the rulebook to
  analytics at all. Asserted by test: the view and the page contain no
  `trackWys`, no `sendAggregate`, no `fetch(` and no `sendBeacon`.

## Requests for the gate — shared files this phase did NOT edit

1. **`GatedText` needs a size/tone variant.** It renders one fixed body (16px
   `--ink`); the `5b` Progress lead is 15px `--body` and its rulebook footnote is
   13px `--muted`. This screen composes `ProvenanceMarks` + `ProvenanceMono`
   directly instead (see `GatedLine` in `ProgressView.tsx`, and R9). With a
   variant prop it would use the shared component and delete its helper.
2. **`KvRow` cannot hold a block-level provenance line.** It renders its label
   inside a `<span>`, and a withheld title renders as `ProvenanceMono`, which is
   a `<p>`. Progress restates `KvRow`'s geometry to the pixel rather than ship
   invalid nesting. A node-tolerant container (or a `block` variant) would let
   this screen and the Data page use the shared row.
3. **`JudgeCard` does not record scenario completion.** It writes
   `localJudgments[scenarioId]` but not `progress.completedScenarioIds`, while
   (WYS §13)'s completion semantics make the committed judgment the thing that
   completes a scenario. Progress takes the union of the two so its tile is true
   today; the completion record still belongs at the point of commit.
4. **`canonicalCollisions` should gain the "Inspect local data" row** (see R3):
   the Data page is named a fifth way on `5b` Progress, and this screen collapses
   it to the Q6-pinned link label. The register and its asserted count are in
   `content/watch-your-step/copy.ts` and `tests/wys-content.test.ts`.
5. **`tests/preserved-surfaces.test.ts` should add `/watch-your-step/progress`**
   to the served-URL assertions now that the route exists — the shell recorded
   this for whichever phase touches that file.
6. **The RSC-payload exposure is general.** Any server page handing a blocked
   `GatedContent` to a client component publishes the withheld prose in the page
   source; `JudgeCard`'s `judgment.content` prop has the same shape. Consider
   moving the strip into `lib/wys/content-gate.ts` so it cannot be forgotten.

## Hazards this phase creates for later phases

- **The CSS-module import count is a shared TOTAL.** This view adds ONE:
  `ProgressView.tsx`. Re-measure at the gate; do not average the figures the five
  view builders each wrote.
- **The Data page (Phase 8) and Progress both render the rulebook's existence.**
  Progress owns the rows and the controls; the Data page should render the COUNT
  from `WYS_DATA_PAGE_ROWS` and link here, not grow a second editor (§5.1).
- **`content/watch-your-step/progress.ts` is imported by a client component.** It
  deliberately does not import `./weeks.ts` — the stops arrive as a projection
  from the server page — so that the curriculum, with its draft prose, stays out
  of the browser bundle. Keep it that way.

---

# Phase 7 (Lesson Zero) — the ten-step onboarding flow

Surface owned: `/watch-your-step/start` only. Everything shared was imported,
not rebuilt: `CourseScreen` is deliberately **not** used (Lesson Zero has its
own chrome — the pill, the counter and the rail — and no title/meta header),
but `JudgeCard`, `ProvenanceMarks`, `ChoiceRow`, `ActionPill`, `Pill`,
`ProgressRail`, `BenSlot`, `DraftMark`, `ProvenanceMono`, `useWysState`,
`lib/wys/content-gate.ts` and `lib/wys/telemetry.ts` all are.

## What shipped

- `content/watch-your-step/lesson-zero.ts` — the ten steps and the eight screens
  as data, eleven canonical records, one Ben slot, the pinned labels, and the
  two scenario/judgment id pins. Registered in `./index.ts` in `wysRegistry`
  (the slot) and in `wysCanonicalRecords` (the copy), in the same commit, per
  §7.5.
- `components/wys/LessonZero/LessonZeroFlow.tsx` — the whole flow as one client
  component: the step index, the three selections, the JUDGE mount and the two
  telemetry firing points.
- `components/wys/LessonZero/lesson-zero.module.css` — the flow's own geometry
  and the four compositions no shared primitive draws (the ink habit card, the
  2×2 pace grid, the BEFORE YOU START · DATA card, the step-10 takeaway).
- `app/watch-your-step/(flow)/start/page.tsx` — the server half. Gates every
  string at build time and hands the client `GatedContent` objects.
- `tests/wys-lesson-zero.test.ts` — 23 checks: the §9.1 sequence, the screen
  cover, the artboard's three rail widths and its counter strings, the whole
  §9.2 prohibition list as regexes over the flow's three source files, "no
  `<input>` / `<textarea>` / `contentEditable` / `<form>` anywhere", the §9.3
  takeaway resolving to `canon`, the habit line character for character,
  provenance and registration for every record, R10 (no first person), the slot
  being unfillable, the pace vocabulary being imported rather than retyped, the
  consent-bound data line, the two allowlisted events and nothing else, and the
  absence of streak/XP/badge/behind/overdue vocabulary.

Measured at the gate: `npx tsc --noEmit` clean · `npm test` 385/385 ·
`PORT=3999 npm run build` green, **`/watch-your-step/start` builds `○ (Static)`**
at 3.65 kB / 127 kB first load, zero `ƒ` in the whole route table ·
`scripts/check-no-deletions.sh` clean · no `tsconfig.tsbuildinfo`.

## Decisions this phase made, with reasons

All fourteen are in `docs/facelift-unapproved.md` under "Phase 7 (Lesson
Zero)". The four that other phases need to know about:

1. **Step 4 is its own screen** (LZ2). The sequence is ten and the artboard
   counts "5 of 10" on the exercise; the habit renders twice, from one record.
2. **Ten steps, eight screens** (LZ3), because `5a`'s third phone is a
   composite. Steps and screens are declared separately and the test asserts
   the cover.
3. **The exercise renders borderless** (LZ4), because `5a` draws no border. This
   is the one place Lesson Zero re-implements something a shared component
   nearly does — see the change request below.
4. **The "Sent: coarse counts" line is selected from the consent state** (LZ9),
   not asserted flatly. Phase 8 owns the same sentence on Data card 2 and should
   use the same two records rather than adding a third.

## Change requests for the gate — NOT made here

This phase edited no shared component and no shared test. Two changes would be
improvements and both belong to whoever owns the shared surface:

- **`components/wys/ScenarioCard.tsx` wants a `bordered` prop** (default
  `true`). `5b` Today draws the hairline; `5a` step 5 does not. With the prop,
  Lesson Zero drops `.scenarioBody` / `.scenarioDecision` / `.exercisePill` from
  its own module and both surfaces render from one component. Without it, two
  files describe the same card.
- **`tests/class-contract.test.ts`'s CSS-module import count.** Lesson Zero
  contributes **exactly one** import — `components/wys/LessonZero/LessonZeroFlow.tsx`
  importing `./lesson-zero.module.css`. The page file imports no module. At the
  time of writing the assertion reads 48 and the measured count is 48, so the
  number is already correct with this surface in it; if a later merge changes
  it, Lesson Zero's contribution is 1.

## Hazards this phase creates for later phases

- **`/watch-your-step/today` is now a real destination.** Step 10's terminal
  control links there and `onboarding.completed` is true by the time it is
  pressed, so the §5.4 "stateless visitor redirects to `/start`" branch must not
  bounce a learner who has just finished. Today owns that check; Lesson Zero
  only guarantees the flag is written first.
- **`Change pace or time` on Plan points back here** (`planLabels.changePaceHref`).
  The flow always opens at step 1 (LZ12), so a learner sent from Plan re-walks
  the ten steps. If that becomes unacceptable it is a Plan-side decision about a
  different destination, not a new `wys:v1` field.
- **Two more `wys:*` writers exist.** Lesson Zero writes `startedAt`,
  `lastOpenedAt`, `onboarding.postureChoice`, `onboarding.cadence`,
  `onboarding.timeBudget` and `onboarding.completed`. The Data page renders all
  six from `WYS_TOP_LEVEL_FIELDS`; nothing new needs listing.
- **`wys_start` and `wys_onboarding_complete` are now wired** and are the only
  two events this surface fires. The §19.4 decision table's "wired but unfired"
  set is unchanged (`wys_view`, `wys_transfer_check_complete`).
- **Eleven new canonical records** are in `wysCanonicalRecords`, five of them at
  `IMPLEMENTATION_PLACEHOLDER`. Anything that counts records, or that asserts
  "every canon record names its variant sources", sees them.

---

# Phase 7 — gate

The gate re-ran everything, verified each Exit criterion against build artifacts
rather than against the implementers' reports, and fixed four things. The
implementers' six reports are above and remain accurate except where this
section corrects them.

## What was verified, and with what evidence

| Exit criterion | Evidence |
|---|---|
| A new learner completes onboarding and one full WATCH → TRY → JUDGE → CARRY session | Verified as capability by building with `RENDER_MARKED_DRAFT = true` and reading the prerendered `today.html`: **3 choice buttons, 1 Commit pill, the CARRY card, and no judgment and no distribution in the pre-commit HTML.** The constant was restored to `false` immediately. Under the ratified Q21 default the TRY/JUDGE half is withheld on every surface — see "The one criterion that is narrowed" below. |
| Analytics blocked, **zero** API calls beyond static assets | `grep -rnE "fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|axios" app components lib content` → **no matches**. The only chunks containing `fetch(` are `main-*.js` and the shared framework chunk — Next.js's own router prefetching `.rsc` files, which are static. `sendAggregate` returns `{sent:false,reason:"disabled"}` and there is no endpoint; `app/api/` does not exist. |
| No account, free text, upload, microphone or chat interface | Rendered-DOM scan of all 33 prerendered pages for `<input> <form> contenteditable type="file" <audio> <video> getUserMedia MediaRecorder` → **one hit: the `<textarea>` on `/watch-your-step/practice`**, which is (WYS §15.1)'s mandated scratch box. `components/wys/FromMemory.tsx` holds one `useState` and a `usePathname` clear — no `useWysState`, no `localStorage`, no `trackWys`, no network. The Progress rulebook `<textarea>` is (WYS §16)'s single declared learner-authored field, capped at 240 chars, local-only. No sign-in, sign-up, password, email or account string anywhere on a course surface. |
| The judgment is unreachable before commit | `judgeReveal(state).judgment === state.committed`, unit-tested over every reachable state; `JudgeCard` renders the whole revealed block conditionally, not with CSS. Confirmed in the served HTML with Q21 flipped: choices and Commit present, `BEN'S JUDGMENT` and `How others answered` **absent**. |
| No streak / XP / score / percentage / "behind" / guilt copy | Rendered-DOM regex over all 33 pages for `streak\|xp\|badge\|leaderboard\|ranking\|level N\|behind\|overdue\|missed\|trust score\|privacy score\|\d+%`. Two hits, both benign and checked in context: Progress's approved **denial** "No score, no streak, no percentage.", and an inline `style="width:10%"` on Lesson Zero's progress rail (a CSS value, not copy). |
| The scratch canary appears in no analytics call, no request and no `wys:*` key | `tests/wys-practice.test.ts` drives `DO_NOT_SEND_WYS_TEST_9f31` through the **real** `validateWysEvent` and the **real** `sanitizeWysState`: rejected under every allowlisted property key, rejected as an event name, and stripped from `postureChoice`, `replayCounts`, `localJudgments`, `lastRoute` and `dismissedNotices`. It survives only in `rulebook[].text`, which is correct — that is the one declared learner-authored field. |
| Every course route is `○` or `●`, zero `ƒ` | 35 static pages, 25 routes: 24 `○`, 1 `●` over 9 stop ids, **zero `ƒ`**. No `export const dynamic`, no `force-dynamic`, no `revalidate` anywhere in `app/`. |
| Deletion contract | `scripts/check-no-deletions.sh` clean; `git diff --name-only --diff-filter=D main...HEAD` and `--diff-filter=R` both empty, working tree included. |

## What the gate fixed

**1 · Withheld prose was published in the page source (three surfaces).**
Every course screen is a server component that hands `GatedContent` to a client
component, and React serialises every client prop into the RSC flight payload
that Next.js inlines into the prerendered `.html`. Three of the six Phase 7
surfaces wrote a local `redactIfBlocked` / `withheldTextRemoved` for this; the
three that did not shipped the leak. Found by grepping the built HTML, not by
review:

- `plan.html` — all nine draft stop titles, in full, in the payload;
- `start.html` — the leaking-pipe scenario's setting, decision moment and four
  choice labels;
- `stop/*.html` — the **whole `WysStop` record**, title and purpose included,
  because `VisitCountableStop` is structurally typed and a wide object satisfies
  it without complaint.

Fixed at the chokepoint rather than a fourth time locally: `gateProse` and
`gateCanonical` now empty `text` when `policy.kind === "blocked"`
(`withoutBlockedProse` in `lib/wys/content-gate.ts`). `label`, `origin`,
`surfaceKind` and `policy.reason` all survive, so the withheld state still says
whose words are missing. The `"preview"` surface (§6.11) still resolves `marked`
and still sees the prose, so the draft preview tooling is unaffected, and
flipping Q21 restores the words with no component change. The three local
helpers were removed — one canonical definition (§5.1 applied to code) — and
`lib/wys/visit.ts` gained `visitCountableStop()`, a named projection that
`/stop/[stopId]`, Today and Progress all pass their stops through.

**2 · Today rendered four bare draft choice labels under a provenance line
saying the words were missing.** The §6.2 failure exactly, and visible on
screen, not just in the payload. Today gated `setting` and `decisionMoment` but
`WysScenario.choices[].label` is a bare string on its way to `ChoiceRow`, so it
went through ungated. A scenario cannot be half-withheld: the honest states are
the whole exercise or none of it. `allShowable()` now states that rule in the
gate; `TodayJudgeView` gained an `exercise: {...} | null` field with the same
shape Practice already serialises; the TRY card still renders and says what it
is waiting for. Lesson Zero already applied this rule and its own comment gives
the reason — "four lettered options with no text is not a decision surface" —
so all three surfaces now agree.

**3 · The Stop H terminal surface did not exist.** `/watch-your-step/end` is a
declared route in §5.2 and in `WYS_ROUTES`, it is a Phase 7 task row, and
`lib/wys/telemetry.ts`'s decision table declares `wys_course_complete` as
`firedInV0: true` with "Stop H terminal surface reaches its completed state" as
its firing point. Shipping the table without the surface left the build claiming
a measurement it could not take — an R8 problem, fixed in architecture. Built:
`content/watch-your-step/end.ts` (one Ben slot, five pinned names, **no
prose**), `app/watch-your-step/(flow)/end/page.tsx` (static, `(flow)` group so
no tab bar) and `CourseCompleteMark.tsx`. The event fires on the terminal stop's
**derived completed state**, never on arrival — opening is not completion. The
route was unreachable, so the terminal stop's own page now carries the one door
into it (`week.terminal ? <LinkRow href="/watch-your-step/end">`).

**4 · The rulebook export had one definition and needed two surfaces.**
`downloadRulebook` moved out of `ProgressView` into
`components/wys/RulebookExport.tsx`; Progress and the terminal surface now share
it, so the two screens cannot export two different shapes of the same file.

Test count 385 → 395. `tests/wys-shell.test.ts` gained the gate invariants (a
blocked record carries no prose; the preview surface still does; no surface
keeps a second redaction helper; a stop crosses as a projection) and the
terminal-surface suite. `tests/wys-today.test.ts`, `tests/wys-practice.test.ts`
and `tests/wys-progress.test.ts` had their boundary tests rewritten from
"grep this file for a local helper" to behavioural assertions against the real
gate and the real content. `tests/wys-plan.test.ts`'s optional-practice dedup
test now compares ids rather than rendered text, which is what it always meant.

## The one criterion that is narrowed, and why

**"A new learner completes … one full WATCH → TRY → JUDGE → CARRY session" is
not true of the shipped default, and cannot be made true without answering
Q21.** Every scenario, choice label and judgment body in
`content/watch-your-step/` is `draft` + `IMPLEMENTATION_PLACEHOLDER` (handoff
README bucket 3 requires that), and Q21 ships `RENDER_MARKED_DRAFT = false` —
the spec's literal whitelist, ratified. So WATCH and CARRY render, and TRY/JUDGE
renders as a labelled withheld card on Today, Lesson Zero and Practice alike.

This is not fixed with copy and it is not fixed by editing a `status` field. The
machine is built, unit-tested over every reachable state, and **verified working
end to end** by the temporary flip recorded in the table above. One constant in
`lib/content-status.ts` turns the course on. **Shipping the public course with
draft scenario prose requires Ben's answer to Q21** — restated here because it
is now the only thing between this build and a runnable loop.

## Hazards this gate hands to the next phase

**1 · Draft curriculum prose is in the client JS bundle, and the gate did not
fix it.** The rendered DOM and every RSC payload are clean (verified above), but
two shared client chunks carry **77 draft strings** — every stop title and
purpose, every scenario setting, and every choice label. Reproduce with:

```
rm -rf .next && PORT=3999 npm run build
grep -c "Task Before Prompt" .next/static/chunks/*.js      # weeks.ts prose
grep -c "Declining a client meeting" .next/static/chunks/*.js  # scenarios.ts prose
```

The cause is four import edges from client-reachable content modules into the
two modules that hold the prose:

| Edge | Reaches the client through |
|---|---|
| `domains.ts` → `scenarios.ts`, `weeks.ts` | `WYS_DOMAINS`, imported by ~10 client components |
| `copy.ts` → `weeks.ts` (`stopCount`, `countWord`) | `today.ts` / `progress.ts` → `CarryMark`, `TimeBudgetNote`, `ProgressView` |
| `tabs.ts` → `weeks.ts` (`stopLetter`) | `BottomNav` |
| `variants.ts` → `scenarios.ts` | `practice.ts` → `ReplayList`, `AppetiteCard`, `FromMemory` |

`domains.ts`'s own header comment already argues this exact point about
`config.ts` and then does the same thing itself. The fix is a prose-free
`content/watch-your-step/ids.ts` that `weeks.ts` and `scenarios.ts` import
**from** (so the derived-count rule of §6.9 still holds and drift is a build
failure), with `domains.ts`, `copy.ts`, `tabs.ts` and `variants.ts` pointed at
it. That is a deliberate refactor of committed Phase 6 substrate across eight
modules; the gate measured it, scoped it and left it rather than half-doing it
on a green tree. **It is not an exit criterion and it falsifies no public
claim today** — the strings are labelled placeholder curriculum, not Ben's
words and not learner data — but Q21's stated posture is that draft material
"simply is not public", and a JS chunk served to every visitor is public. Do
this before the Data page makes any claim about what the site serves.

**2 · The judgment body will be in the RSC payload before commit once Q21
flips.** `JudgeCard` must hold the judgment client-side to reveal it with no
network call, so when `RENDER_MARKED_DRAFT` becomes `true` the body ships in the
payload while the on-screen invariant still holds. "Not in the DOM before
commit" stays true; "not in the page source" does not. Architecturally
unavoidable without a request, which the zero-API-calls criterion forbids.
State it; do not discover it.

**3 · `/watch-your-step/data` is still a dead tab.** The five-item bottom nav
ships as the plan requires and the Data tab 404s until Phase 8 lands
`app/watch-your-step/(shell)/data/page.tsx`. Add all five tab URLs to
`preserved-surfaces.test.ts`'s served-URL assertions in that phase.

**4 · `/watch-your-step/end` is reachable only from `/stop/stop-h`.** No
artboard draws a door into it — `5b`'s dashed "the end" row has nothing behind
it. If Plan should link the terminal row instead, that is a one-line change in
`PlanStops.tsx` and a Ben question about the row's behaviour.

**5 · Five strings on the terminal surface are authored** and are on the
Final-copy list (`docs/facelift-unapproved.md` §G). The screen makes no outcome
claim, tested for.

---

# Phase 8 — the Data page

Plan Phase 8, (WYS §18), (WYS §20), artboard `5c`. The screen the whole
provenance substrate was built to make possible: it renders the visitor's real
browser state, and **every sentence on it is checked against the shipped code
rather than against the artboard**.

## What shipped

| File | What it is |
|---|---|
| `content/watch-your-step/data.ts` | Ten canonical records, the page labels, the `(status, origin)` pair the two lib-defined confirmation explanations render under, and five pure derivations (`dataPageRowsInRenderOrder`, `consentReadingFor`, `browserKeyValueSummary`, `localDataFile`, `rawJsonPreview`). Registered in `wysCanonicalRecords` and in `WYS_NON_RECORD_MODULES`. |
| `app/watch-your-step/(shell)/data/page.tsx` | The server screen. Resolves every record through the gate, decides the two build-time branches, and hands the client only what needs state. |
| `.../DataManifest.tsx` | Card 1, the three actions, the two confirmation panels, the post-clear panel and the footnote. Owns the one `useWysState` instance. |
| `.../AnalyticsReceipt.tsx` | Card 2's consent-conditioned line. |
| `.../DataManifestTelemetry.tsx` | `wys_data_manifest_view`, once per session. Renders nothing. |
| `.../DataText.tsx` | `DataText` / `DataLines` — gated prose in this screen's type scale. No `text` prop. |
| `.../data.module.css` | The card stack, the key register, the two disclosures, the confirmation and post-clear panels. |
| `tests/wys-data.test.ts` | 39 tests. Suite total 395 → 435, all green. |
| `content/claims.ts` | `analytics.short` WRITTEN — the variant whose `AwaitingCopy` descriptor said `writtenBy: "phase-8"`. |
| `content/source-refs.ts` | Five new refs; one locator corrected. |
| `content/watch-your-step/index.ts` | `data.ts` registered. |
| `tests/preserved-surfaces.test.ts` | All five course-tab URLs asserted served (Phase 7 gate hazard 3). |
| `tests/class-contract.test.ts` | `modulesChecked` 48 → 51. |
| `tests/canonical-text.test.ts` | The `analytics` awaiting assertion moved to a record that is still awaiting. |

`/watch-your-step/data` builds `○ (Static)`. 36 static pages, 26 routes, **zero
`ƒ`**. Shared First Load JS unchanged at 102 kB.

## The one rule this screen was built against

(WYS §37): "Data Manifest accurately describes what is actually deployed" and
"no privacy claim exceeds implemented fact". (WYS §34) and plan R8: a false
public claim is fixed in architecture, never in copy. So **three sentences do
not exist as strings until the state that makes them true exists**, and one
list is generated rather than written:

1. **The first-party-counter sentence** (Q22, SC-12) comes from
   `aggregateCounterSentence()` in `content/watch-your-step/config.ts`, bound to
   the same `WYS_AGGREGATE_ENABLED` constant as `lib/wys/aggregate.ts`. It
   returns `null`, so the string is never constructed and **is absent from the
   rendered HTML and from every client chunk** — verified by grep over
   `.next/server/app/**/*.html` and `.next/static/chunks/*.js`. It survives only
   inside the server bundle as an unreferenced module constant, which is not the
   DOM. `tests/wys-data.test.ts` flips the flag both ways against the same
   function and asserts the page renders the function, never the constant.
2. **The approved "coarse counts" sentence** (Q7, SC-2) renders only for a
   browser that granted analytics; two authored lines cover declined and
   undecided. See `docs/facelift-unapproved.md` DM2.
3. **Card 2's opening** switches on `measurementIdIsSet()` at BUILD time: with
   no `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `GoogleAnalytics.tsx` returns `null` and
   there is no analytics to describe. A deployment's prerendered HTML therefore
   matches that deployment's own configuration. **Note for the gate: this repo's
   `.env.local` does not set the variable, so a local build renders the
   "no measurement id configured" branch. Both branches were built and read.**
4. **The event register** is rendered from `WYS_DECISION_USE`, so the page
   cannot claim a shorter list than the allowlist can fire. DM4.

## Decisions this phase made, with reasons

**1 · The clearing footnote is amended by ADDITION.** "Nothing is deleted"
covers preserved copy, and rewording an approved Final-copy sentence to insert a
clause would delete Ben's words on this build's authority. The approved sentence
renders unchanged as canon; the new clause is a separate record at
`AI_SYNTHESIS` / `published`, rendering with its label and draft mark, plus a
link to `/cookies`. Ben can see exactly which half is his. (DM1.)

**2 · Build-authored prose on this page is `published` + `AI_SYNTHESIS`, not
`draft`.** Under Q21's ratified default a `draft` non-Ben record is `blocked`, so
a draft footnote, a draft confirmation panel or a draft blocked-storage notice
would be **withheld** — and a destructive control whose explanation is withheld
is worse than one whose explanation is labelled. `RENDER_MARKED_DRAFT` exists to
stop this build publishing draft **Ben doctrine**; none of these sentences is
Ben's, and each renders saying so. Same reasoning `learnerRuleProvenance` uses
for the rulebook, one surface further.

**3 · One hook instance owns the interaction.** `useWysState` holds its snapshot
in `useState`, so two components calling it hold two snapshots: a clear fired
from an actions component would leave a rows component showing pre-clear state —
the page lying about the browser in the exact moment it teaches the learner not
to take its word for it. So `DataManifest` owns the hook and takes cards 2 and 3
and the infrastructure paragraph as **slots**, which keeps them server-rendered.
The infrastructure paragraph is a separate slot from `children` because the
artboard puts it outside the 12px card stack and above the actions.

**4 · "not read yet" is a different statement from "not set".** An em dash in
the server HTML would assert "nothing stored" on the page that promises the rows
are generated from what is actually stored, and a no-JS visitor would keep that
assertion forever. The row labels still render, because the field set is (WYS
§18)'s own "This browser can store" list. (DM7.)

**5 · The download is every key in `BROWSER_KEYS`, not just `wys:v1`.** What the
learner downloads then matches what card 1 lists and what the registry declares,
and a third key is included with no edit. `localDataFile()` is pure and adds
nothing: no timestamp, no build id, no fingerprint. Asserted.

**6 · The consent read is stated once as a pure function.**
`consentReadingFor()` and `analyticsConsentGranted()` are the same fail-closed
rule, and the test drives both over the same inputs — including a throwing
`localStorage` — so the page cannot promise a send the adapter refuses.

**7 · Telemetry is exactly three events, fired after the local operation.**
`wys_data_manifest_view` (bare but for the allowlisted `route_type`),
`wys_local_state_clear` and `wys_restart_course`. The view guard is a
module-level boolean, not `sessionStorage`: a session flag would be a **third
browser key** that this very page would then have to list, which is the wrong
trade for slightly better diagnostic precision. Order matters — the local
operation runs first, so a browser with analytics blocked still gets it.

## Requests for the gate — shared files this phase did NOT edit

- **`SectionEyebrow` needs a `tone` prop.** Card 3's eyebrow is
  `--accent-on-dark` on an ink slab and the primitive paints
  `--accent-text-on-tint`. A local `.eyebrowOnInk` class ships instead of
  widening a shared primitive from a route file. (DM11.)
- **`GatedText` still needs a size variant.** Third route to compose its own
  `DataText` around `ProvenanceMarks` for a type scale the fixed 16px body does
  not fit. The composition is honest — no path from a record to prose without
  its policy — but three copies of it is a primitive waiting to be written.
- **`KvRow` still renders its label inside a `<span>`.** Progress recorded this;
  card 1 gets away with it because its labels are plain strings, but a withheld
  value would need a block element.

## Hazards this phase creates for later phases

**1 · `/privacy` and `/cookies` must now agree with this page word for word.**
Plan §8b.2 requires the `/cookies` refresh to state "what 'Clear this browser's
data' does and does not remove, **word-for-word identical to the Data page
footnote**". That footnote is now two records — `data-clearing-footnote`
(approved, canon) and `data-clearing-survives` (authored, marked) — and Phase 11
must render the same pair or the same `full` variants, not retype them. The
`analytics` claim's `full` variant is still `AwaitingCopy` with
`writtenBy: "phase-11"` and is the right home for the longer legal wording.

**2 · The Data page is now the site's most load-bearing truth surface, and it is
checked by tests that read source text.** `tests/wys-data.test.ts` asserts, among
other things, that no `wys_` event-name literal appears in `page.tsx`, that no
key literal appears in `DataManifest.tsx`, and that exactly three `trackWys`
calls exist in the route. A later phase that adds an event, a key or a literal
here fails the suite — that is the check, not bookkeeping.

**3 · The claim record `analytics` is now `published` + `BEN_APPROVED`.** It was
`draft` + `IMPLEMENTATION_PLACEHOLDER`, and anything that counted draft claims
or asserted `renderCanonicalText(claimById("analytics"), "short")` was
`awaiting` sees the change. One such assertion in
`tests/canonical-text.test.ts` was moved to `claimById("provenance")`, which is
still genuinely awaiting.

**4 · Phase 7 gate hazard 1 was considered and deliberately not actioned.** Draft
curriculum prose still sits in two shared client chunks, and that hazard says to
fix it "before the Data page makes any claim about what the site serves". **No
sentence on this page makes such a claim** — card 1 is about this browser's
storage, cards 2 and 3 are about what reaches Ben, and the infrastructure
paragraph is about hosting and analytics. None is falsified by a labelled
placeholder string in a JS chunk. The `content/watch-your-step/ids.ts` refactor
across eight committed modules therefore stays scoped to its own task rather
than being half-done inside this phase; it is unchanged and still owed.

**5 · A build with no `NEXT_PUBLIC_GA_MEASUREMENT_ID` renders a different card
2.** Any later phase that diffs prerendered HTML between builds (Phase 10's
preserved-page text diff, Phase 12's screenshot pass) must hold that variable
constant across both sides or it will see a spurious difference on this one
route.

---

# Phase 8 — gate

Ran `npm test`, `npx tsc --noEmit`, `PORT=3999 npm run build` and
`scripts/check-no-deletions.sh`, then checked each Exit criterion against the
prerendered HTML, the RSC payloads and the client chunks rather than against the
phase report.

## What was verified, and with what evidence

**The deletion contract.** `git diff --name-only --diff-filter=D main...HEAD`
and `--diff-filter=R` both print nothing, working tree included;
`scripts/check-no-deletions.sh` exits 0.

**Card 1 reflects real browser state including the consent key.** Rows are
`WYS_DATA_PAGE_ROWS.flatMap(...)` over the declared `wys:v1` field set — eleven
lines from nine declared fields, the artboard's five first and in its drawn
order — and the key register is `BROWSER_KEYS.map(...)`, so `wys:v1` and
`bct_analytics_consent` both appear with their live values and their clear
disposition. Confirmed in `data.html`: no value literal in the server HTML, only
`not read yet` until the effect returns.

**Clear removes only `wys:*` and says so.** `clearAllWysData()` enumerates the
store and removes only the `wys:` prefix; `tests/wys-local-state.test.ts` proves
`bct_analytics_consent` and an unrelated control key both survive. The screen
says so twice — the registry's `kept by clear` beside the key, and the
`data-clearing-survives` addition.

**The aggregate sentence is absent from the DOM (Q22, SC-12).** `grep
"first-party counter"` over `.next/static` and over both prerendered
`data.html` / `data.rsc` returns nothing; the string exists only inside the
server-side compiled module, which no browser receives. The only "zero trust"
occurrences on the site are the approved paragraph's own denial.

**The approved coarse-counts sentence is state-bound (Q7, SC-2).** It is in the
RSC payload as a prop — unavoidable, since `AnalyticsReceipt` decides with no
network call — and reaches the DOM only for a browser that read
`bct_analytics_consent === "granted"`.

**Both card-2 branches were built and read.** A build with
`NEXT_PUBLIC_GA_MEASUREMENT_ID` set renders the two-conditions opening and the
eleven-row event register; a build without it renders the no-measurement-id
line and no register. Every one of the eleven `firedInV0: true` rows has a real
`trackWys` call site in `app/` or `components/` — checked one by one — so the
register over-states nothing.

**Forbidden claims (§8b.3).** All fourteen phrases swept over the rendered HTML
and the client chunks: zero hits outside the approved denial.

## What the gate fixed

Three sentences shipped that were **not true of the code in every state the
build can reach**. Each was narrowed to the true claim (R8: narrow the feature,
never soften the wording), and each is now locked by a test that asserts the
comfortable wording cannot return.

**1 · "so this site won't ask about cookies again"**
(`data-clearing-survives`, and the same promise in
`CLEAR_ALL_WYS_DATA_EXPLANATION`). `ConsentBanner` renders whenever no choice
is stored, so for a visitor who has not answered the banner the promise is
false — while card 1 shows `bct_analytics_consent · not set` on the same
screen. Now: "so clearing does not change whether this site asks you about
cookies", which is true in all three consent states.

**2 · "nothing on this page is counted anywhere"**
(`data-analytics-unavailable`, the no-measurement-id branch). A page load still
reaches a host, which is exactly what the infrastructure paragraph two cards
below discloses — so the absolute form contradicted an approved sentence on its
own screen and sat one paraphrase from §8b.3's forbidden "no data collection".
Now scoped to the two things the build can check: "no analytics script loads and
Watch Your Step sends none of its counts from any browser."

**3 · "Nothing is sent anywhere, and nothing outside this browser changes"**
(`RESTART_COURSE_EXPLANATION`, rendered in the restart confirm panel). The
button directly beneath it calls `trackWys("wys_restart_course")`. This is the
worst of the three: a false denial of sending, one tap above a send, on the page
that exists to refuse exactly that. Both explanations now name their own event,
hedged to the two conditions `trackWys` actually checks:

> If analytics are running and allowed on this device, this site counts that a
> restart happened — the count only, with nothing about you in it.

`CLEAR_ALL_WYS_DATA_EXPLANATION` gained the matching line, so the asymmetry
cannot be read as "clear sends nothing".

**4 · A comment corrected.** `DataManifestTelemetry` described its call as
"BARE" while passing `route_type`. The decision row's declared exposure *is*
"the event name and route_type", so the call is right and the word was wrong.

Four new tests in `tests/wys-data.test.ts` (439 pass, was 435), and the
forbidden-claims sweep now also reaches the two `lib/`-defined confirmation
explanations, which render on this screen but lived outside the sweep.

## What the gate examined and deliberately left

- **`RESTART_COURSE_EXPLANATION`'s "unless you choose to clear them here too".**
  The restart panel offers no such option; the Clear control directly beneath it
  is the way to choose it, and `restartCourse(options)` genuinely retains unless
  told otherwise (WYS §17). True as written, and adding per-restart checkboxes
  is a new control the plan does not ask for. Recorded, not changed.
- **`ui.lastRoute` has no writer**, so that row renders its empty value forever.
  A true rendering of the field; adding a writer is new persistence behaviour.
- **Phase 7 gate hazard 1 (draft prose in two shared client chunks) is still
  open.** Re-checked against every sentence this screen ships, including the
  three the gate rewrote: none makes a claim about what JS the site serves. The
  `content/watch-your-step/ids.ts` refactor across eight committed modules stays
  its own task and is still owed.
- **The double provenance line under marked prose** ("Drafted during
  implementation — not Ben's words", then "draft · implementation placeholder ·
  not Ben's words") reads oddly under a `published` + `AI_SYNTHESIS` record,
  since it is not draft. The mark string is verbatim approved artboard copy and
  `requiresDraftMark()` is Phase 1 substrate shipped on `/watch-your-step/start`
  already, so changing either here would be a substrate edit made from a route.
  **Request for a later phase: a mark variant for authored-but-not-draft
  material**, or Ben's ruling that the existing one is close enough.

## Hazards this gate hands to the next phase

**1 · `/cookies` must match the corrected wording, not the reported wording.**
Plan §8b.2 requires `/cookies` to state what a clear does and does not remove
**word-for-word identical to the Data page footnote**. That footnote is now
three things: `data-clearing-footnote` (approved, canon),
`data-clearing-survives` (authored, marked, **narrowed by this gate**) and the
`/cookies` link. Phase 11 renders the same records; it does not retype them, and
the pre-gate sentence is wrong.

**2 · The two confirmation explanations are now five and four lines**, not four
and three. Anything asserting a length, or diffing the panels, sees it.

**3 · The `no-measurement-id` card-2 branch is unchanged in kind.** A later
phase that diffs prerendered HTML between builds must hold
`NEXT_PUBLIC_GA_MEASUREMENT_ID` constant across both sides.
