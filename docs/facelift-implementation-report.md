# Final implementation report — Watch Your Step website v0 + BenChanTech facelift

(WYS §38)'s seventeen items, answered in order, at the Phase 12 gate on branch
`bct-facelift-assimilation`. §38's instruction is *"Do not finish with
'implemented' without this audit"*, so nothing below says "implemented" without
the number or the file name behind it.

Nothing here is written in Ben's first person. Where a source needs Ben's words,
the build renders a labelled empty slot (plan R10).

**Companion documents.** `docs/facelift-captains-round.md` is the (WYS §39)
second pass. `docs/facelift-unapproved.md` is the list of every deviation and
every new surface awaiting a stamp. `docs/facelift-deferred.md` is what was not
built. `docs/facelift-qa.md` is the measured evidence. `docs/facelift-baseline.md`
is the before/after numbers. Item 17 below is the one §38 asks for last and this
build considers most important: **where the implementation had to narrow the
spec.**

---

## 1. Files added / changed

Measured with `git diff --name-only --diff-filter=<A|M|D|R> main...HEAD`.

| | Count |
|---|---|
| Files **added** | **212** |
| Files **modified** | **15** |
| Files **deleted** | **0** |
| Files **renamed** | **0** |

Zero deletions and zero renames is the deletion contract (plan §3.0). It is not
asserted here — `scripts/check-no-deletions.sh` runs both `--diff-filter`
commands and exits non-zero on any output, and `tests/preserved-surfaces.test.ts`
shells out to it so `npm test` fails on a deletion.

**Where the 212 additions live:**

| Area | Files |
|---|---|
| `content/watch-your-step/` (+ `_templates/`) | 39 |
| `components/wys/` (+ `LessonZero/`) | 27 |
| `tests/` | 21 |
| `components/ui/` | 14 |
| `components/` (chrome, provenance) | 19 |
| `app/watch-your-step/**` | 30 |
| `app/` ship + machine surfaces | 17 |
| `lib/` (+ `lib/wys/`) | 13 |
| `content/ship/`, `content/canonical/`, other `content/` | 14 |
| `docs/` | 7 |
| `scripts/` | 4 |
| everything else (`types/`, `.env.example`) | 2 |

**The 15 modified files, and why each was touched:**

| File | Change |
|---|---|
| `app/globals.css` | The token-value rewrite (plan §4.4) — the mechanism that restyles every preserved page without editing its markup. The single intentional line-level removal in the whole build is line 1, the render-blocking Google Fonts `@import`, replaced by `next/font/google`. |
| `app/layout.tsx` | Skip link, `next/font`, `SiteHeader` / `SiteFooter` / `DisclosureStrip`. |
| `app/page.tsx` | Q2's resolution: the `4a` composition, with every preserved block appended below it on the same URL. |
| `app/privacy` `/terms` `/cookies` `/copyright` `/accessibility` `/ai-disclosure` | Phase 11's legal refresh, in place, at the same URLs, with the same `<title>`s. |
| `components/ConsentBanner.tsx` | Exactly two changes: `declare global` moved to `types/gtag.d.ts`, and two `try/catch` wraps. The `storageKey` literal, the three-state machine, the `ad_*` denials and the render guard are untouched. |
| `components/SiteFooter.tsx` | The four-group mobile-complete footer (Q9). |
| `.gitignore` | One additive line, `!.env.example`. |
| `AGENTS.md`, `README.md`, `docs/legal-analytics.md` | Documentation, authorised by plan §3.2 ("updated, not frozen"). |

**Byte-frozen and confirmed identical to `main` by SHA-256:**
`components/GoogleAnalytics.tsx`, `content/site-config.ts`, `lib/route-graph.ts`,
`lib/route-resolver.ts`, `next.config.ts`, `tsconfig.json`, `vercel.json`,
`scripts/check-secrets.sh`, `scripts/guard-next-build.mjs`, `.githooks/pre-commit`,
`lib/db/*`, `tests/route-resolver.test.ts`, `.vercelignore`, `next-env.d.ts`.
`public/` (7 assets), `_cases/` and `components/IntentRouter.tsx` do not appear
in the diff at all.

## 2. Route map

40 static pages. **Every route is `○` (Static) or `●` (SSG). There is no `ƒ`.**
That is the §5.3 requirement and the Phase 0 regression floor, and it is checked
against `docs/facelift-baseline.md` §2.1 at every gate.

| Route | Marker | Kind | Status |
|---|---|---|---|
| `/` | ○ | marketing | preserved URL, recomposed (Q2) |
| `/studio` `/neon` `/system` `/contact` | ○ | preserved | untouched markup, restyled by token |
| `/privacy` `/terms` `/cookies` `/copyright` `/accessibility` `/ai-disclosure` | ○ | legal | refreshed in place (Phase 11) |
| `/watch-your-step` | ○ | course-landing | NEW |
| `/watch-your-step/start` | ○ | course | NEW — Lesson Zero, `(flow)` group |
| `/watch-your-step/today` `/plan` `/progress` `/practice` `/data` | ○ | course | NEW — `(shell)` group, tab bar |
| `/watch-your-step/end` | ○ | course | NEW — `(flow)` group |
| `/watch-your-step/stop/[stopId]` | ● | stop | NEW — 9 prerendered paths |
| `/bridge` `/standing-orders` `/ships-log` `/crew` `/ben` | ○ | ship | NEW (Q4: flat, not `/author-ship/*`) |
| `/author-ship/state.json` `/llms.txt` `/robots.txt` `/sitemap.xml` | ○ | machine | NEW |
| `/_not-found` | ○ | — | NEW `app/not-found.tsx` |

**Redirects — all three preserved, byte-identical in `routes-manifest.json`, and
verified live on `next start`:** `/lab → /neon` (307), `/about → /system` (307),
`/posts → https://benchanviolin.substack.com` (307).

## 3. Content schema

(WYS §8)'s ten object types, in `content/watch-your-step/types.ts`, each
extending a shared `WysProvenanceExtras`:

`WysSourceAsset` · `WysPrinciple` · `WysScenario` (with `WysScenarioChoice`) ·
`WysJudgment` · `WysBoundary` · `WysCanonicalVariant` · `WysFictionalArtifact` ·
`WysRitual` · `WysCarry` · `WysWeek` (with `WysTimeBudgetPaths` and
`WysCadencePathsShape`).

**Every content object carries `status`, `origin` and `sourceIds`**, and every
`sourceIds` entry must resolve against `content/source-refs.ts`. An empty source
list must carry a recorded reason. Both are asserted in
`tests/wys-content.test.ts`.

Two additions to the §8 interfaces, recorded in `docs/facelift-unapproved.md` H1:
`WysOverWithholdingClass` (eight named classes, so §21's over-withholding
requirement is representable rather than aspirational) and a widened
`WysFictionalArtifact.type` union carrying §24's twelve disclosure containers
plus `other` — **widened, not a second field**, so an artifact cannot carry a
container in one place and a contradicting type in another.

Ship and governance objects are their own types in `content/ship/`:
`ShipsLogEntry`, `CaptainsRoundNote`, `BridgePosition`, `StandingOrder`,
`CrewMember`, plus `content/canonical/judgment-framework.ts`.

**Governance, not convention:** `lib/content-status.ts` owns the two enums and
the render policy; `lib/wys/content-gate.ts` is the single chokepoint every
screen goes through — no screen calls `provenanceLabelFor` itself.

## 4. LocalStorage schema

One key: **`wys:v1`**. Shape (`WysLocalStateV1`, `lib/wys/local-state.ts`,
verbatim from WYS §17):

```
schemaVersion: 1
startedAt? lastOpenedAt?                 ISO strings
onboarding  { completed, postureChoice?, cadence?, timeBudget? }
progress    { completedLessonIds[], completedScenarioIds[], completedCarryIds[],
              replayCounts{}, transferCheckIds[] }
localJudgments? { [scenarioId]: { choiceKey, revisedChoiceKey?, updatedAt } }
rulebook    [ { id, text, createdAt, updatedAt } ]
ui          { lastRoute?, dismissedNotices? }
appetite?   { deeperPracticeInterest?, recordedAt? }
```

**Minimization is enforced in the serializer, not at call sites** (plan §7.2).
`WYS_DECLARED_KEYS` is a total allowlist per nesting level; every free-shaped
declared field also carries a **value domain**; `ID_TOKEN` forbids whitespace, so
a sentence cannot be persisted under an id-shaped key. An undeclared key is
dropped, and an out-of-domain value under a *declared* key is dropped too.
`tests/wys-local-state.test.ts`: *"there is exactly one place that writes
`wys:v1`, and it sanitizes first."*

**The second browser key is not ours.** `bct_analytics_consent` is written by the
frozen `components/ConsentBanner.tsx`. `lib/wys/browser-keys.ts` registers both,
records who writes each, and drives the Data page's key list — the list is
**generated by enumerating what the code writes**, never hand-maintained, which
is what keeps "what this site knows about you" true when a third key appears.

## 5. Exact analytics events now sent

The allowlist is thirteen names (verbatim, WYS §19.4). **Eleven have a call site;
two deliberately do not.**

| Event | Fired from |
|---|---|
| `wys_start` | `LessonZeroFlow.tsx:252` |
| `wys_onboarding_complete` | `LessonZeroFlow.tsx:278` |
| `wys_source_period_start` | `StopStartTelemetry.tsx:54` |
| `wys_source_period_complete` | `CarryMark.tsx:105` |
| `wys_carry_reached` | `CarryMark.tsx:76` (on reaching the card, never on marking it) |
| `wys_course_complete` | `CourseCompleteMark.tsx:63` |
| `wys_replay` | `ReplayList.tsx:120` |
| `wys_depth_interest` | `AppetiteCard.tsx:64` |
| `wys_data_manifest_view` | `DataManifestTelemetry.tsx:44` |
| `wys_restart_course` | `DataManifest.tsx:153` |
| `wys_local_state_clear` | `DataManifest.tsx:160` |
| `wys_view` | **no call site — declared, unfired** |
| `wys_transfer_check_complete` | **no call site — the transfer-check UI is deferred** |

**Two names are refused by the adapter, by name:** `wys_scenario_choice` and
`wys_scenario_skip` are aggregate-only (WYS §19.4) and must never reach GA4. They
route to `lib/wys/aggregate.ts`, which is disabled, so in v0 they send nothing at
all. The refusal carries its own reason so a mis-wired call is distinguishable
from a typo.

**Nothing fires unless `bct_analytics_consent === "granted"`** (Q7, full
suppression), the kill switch is off, and a GA4 measurement ID is present.
The consent gate **fails closed** if `localStorage` throws.

## 6. Exact properties on each event

Four keys. That is the whole list.

| Key | Domain |
|---|---|
| `lesson_index` | integer |
| `source_period_id` | a known stop id |
| `content_version` | the build's content version string |
| `route_type` | one of `marketing` `preserved` `legal` `course-landing` `course` `stop` `ship` `machine` |

**The key allowlist is not the safety property — the value domains are.** A key
allowlist alone would happily carry a learner's sentence under `content_version`.
Every value is domain-checked (`telemetry.ts:137-140`), and the outgoing props
object is **rebuilt key by key, never spread**. `route_type`'s closed vocabulary
is authored, not specified — (WYS §19.1A) names the property and not its values
— and is reported as such, because an open string there is a free-text field
wearing a permitted name.

**snake_case is the wire format and there is no mapping shim.** (WYS §19.1A) names
the properties in snake_case and §19.5's example call is camelCase; the two are
reproduced in the spec without reconciliation. The adapter accepts and emits
snake_case only. A shim would be a second place a property name can be spelled,
which is one more than an allowlist can police.

Call sites are typed, so passing a whole `WysLocalStateV1`, a rulebook array or a
scratch string is a **compile** error before it can reach the runtime refusal.
The runtime refusal exists anyway, for values arriving as `unknown`, and
`tests/wys-telemetry.test.ts` names both cases: *"a whole `WysLocalStateV1`
object passed as a property is rejected"*, *"a rulebook array passed as a
property, or as the whole props object, is rejected"*.

## 7. Whether GA4 is present, and what WYS adds to it

**GA4 is present and it is byte-frozen.** `components/GoogleAnalytics.tsx` hashes
identical to `main`: same measurement ID, same Consent Mode v2 defaults, same
hardcoded `ad_*` denials, `ads_data_redaction`, `anonymize_ip`,
`send_page_view: true`, same stream, same property. `components/ConsentBanner.tsx`
carries only the two authorised changes above.

**What WYS adds:** one module, `lib/wys/telemetry.ts`, which layers on top of that
bootstrap. It only *reads* `dataLayer` (to check the GA4 config marker is present)
and pushes `"event"` commands. **It never issues `config`, `consent` or `set`.**
There is no second consent store and no second gtag bootstrap.
`@next/third-parties` is deliberately **not** installed — it ships a competing
bootstrap that would clobber the frozen defaults.

`tests/wys-telemetry.test.ts` asserts *"`lib/wys/telemetry.ts` is the only
`dataLayer` emission site in the shipped tree"* and *"no file outside the adapter
and the two preserved surfaces touches `window.gtag`"*.
`tests/analytics-frozen.test.ts` (7 tests) asserts the frozen literals are still
byte-present.

## 8. Whether aggregate scenario telemetry was implemented

**No.** `WYS_AGGREGATE_ENABLED` is a build-time `false`, `AGGREGATE_ENDPOINT` is
`null`, and no route exists that could receive one. The adapter is written and
refuses its two event names by name. The strongest form of the check is the test
*"with the flag FORCED ON, `sendAggregate` still makes no call"* — the guarantee
does not depend on the flag's value.

The consequence is carried in the copy, not hidden: Data page card 2's aggregate
sentence is rendered **only when the flag is true** (Q22), so it is **absent from
the DOM** rather than present and false. `tests/legal-claims.test.ts`: *"the
aggregate endpoint the pages call not built is, in fact, not built."*

## 9. If yes, exact persisted DB schema

Not applicable. **No database. No persistence layer. No table.** The repo's
`lib/db/*` is byte-frozen and untouched by this build, and nothing in the WYS
tree imports it.

## 10. Every third party WYS contacts at runtime

**One, conditionally: `https://www.googletagmanager.com`,** loaded by the frozen
`GoogleAnalytics.tsx`, and only when a measurement ID is configured. WYS adds no
second vendor.

The other five `https://` hosts in the tree are **outbound links a visitor may
click**, not runtime contacts: `benchantech.com`, `yymethod.com`,
`benchanviolin.com`, `benchanviolin.substack.com`, `yyandme.benchantech.com`.

**There is no client-side network call anywhere in the WYS tree.** A corpus grep
over `app/`, `components/`, `lib/` and `content/` for
`fetch(` · `XMLHttpRequest` · `sendBeacon` · `new WebSocket` · `EventSource` ·
`axios` returns **nothing**. There is no `"use server"`, no `app/api`, and both
route handlers are `force-static`. Runtime dependencies are still exactly three:
`next`, `react`, `react-dom` — `git diff main...HEAD -- package.json
package-lock.json` was **0 lines** until Phase 12 added a `sideEffects` array and
one build-script step; the lock file is still untouched and the package count is
unchanged.

Fonts are self-hosted through `next/font/google` at build time, which is why
`app/globals.css:1`'s render-blocking `@import` could go.

## 11. What data remains only local

Everything a learner does. The full `wys:v1` object above never leaves the
browser: onboarding posture, cadence and time budget; every completed lesson,
scenario and carry; replay counts; **every kept judgment and every revision**;
**the rulebook, including its text**; the last course route; dismissed notices;
and the deeper-practice flag.

Two things are stronger than "we don't send it":

- **The rulebook is kept off the wire by the property allowlist, not by call-site
  discipline.** There is no allowlisted key it could travel under, and the value
  domains reject it if one were invented.
- **`FromMemory`'s scratch box is not in the schema at all.** It lives in one
  page-local `useState`, imports no `useWysState`, no `localStorage`, no `fetch`
  and no `trackWys`, and clears on route change. `tests/wys-practice.test.ts`:
  *"FromMemory imports nothing that could persist or transmit."*

**No URL carries learner state** — `tests/no-private-state-in-urls.test.ts`.

## 12. What "restart" clears

`restartCourse()` in `lib/wys/local-state.ts`. It **rebuilds** the state rather
than deleting the key, and it keeps what the learner made:

| Kept | Cleared |
|---|---|
| `rulebook` (the learner's own rules) | `progress` — lessons, scenarios, carries, replay counts, transfer checks |
| `onboarding` (posture, cadence, time budget) | `localJudgments` — every kept judgment and revision |
| `appetite` | `ui` — last route, dismissed notices |
| `startedAt` / `lastOpenedAt` | |
| `bct_analytics_consent` | |

Two options exist for the learner who wants more: `clearRulebook` and
`clearDataPreferences`. Neither is the default, because the default must not
sound like deletion.

## 13. What "clear data" clears

`clearAllWysData()` removes **every browser key starting with `wys:`** — not just
`wys:v1`, so a second key added in month three is swept too. It returns the list
of keys it removed.

**It deliberately does not touch `bct_analytics_consent`.** Silently wiping it
would reset a legally-referenced decision and re-prompt the visitor. The Data
page's key register says so on the page, per key: `wys:v1` reads *"removed by
clear"*, `bct_analytics_consent` reads *"kept by clear"*.

Restart and Clear are **distinct controls with distinct copy** — *"Restart the
course · keeps rulebook"* and *"Clear this browser's data"* — which is (WYS §17)'s
requirement, and both explain what happens **in a confirmation step before
executing**, not in a tooltip.

## 14. Infrastructure data that cannot honestly be described as deleted

This is the item most easily answered dishonestly, so it is answered on the page
as well as here. Clearing local data does **not** erase:

- **Server and CDN request logs** (Vercel), including IP address and user agent.
- **Security and rate-limiting records** held by the host.
- **Google Analytics data already sent**, for any visitor who granted consent
  before clearing. Clearing `wys:v1` does not reach GA4, and this build has no
  mechanism that could.
- **`bct_analytics_consent` itself**, which survives by design (item 13).

The Data page renders this as the amended clearing footnote — *"Clearing removes
this browser's copy. It can't erase hosting or analytics logs — and this page
won't pretend it did."* The amendment was made **by addition**, with the artboard
sentence left intact as its own `BEN_APPROVED` record and the addition carrying
its own separate provenance label (`docs/facelift-unapproved.md` DM1). It is also
the wording on `/cookies` and `/privacy`, and `tests/legal-claims.test.ts` checks
the pages against the implementation rather than against each other.

## 15. Content still awaiting Ben source or approval

**Nothing on this site is stamped.** `lib/approval-state.ts` is the single source
of that fact; every pill and chip reads from it, so one typed value moves every
surface. `tests/governance-strings.test.ts` asserts no governance string is typed
anywhere else. The Ship's Log renders "approval pending" as the **untyped
default**, never as a literal.

**Twelve Ben slots render as labelled empty boxes and none can be filled by
accident:** `children`, `text` and `body` are typed `never` on `SlotPropsBase`,
so a slot with prose in it does not compile.

`slot-today-watch-video` · `slot-today-transcript` · `slot-hear-ben-60s` ·
`slot-lesson-zero-source` · `slot-judgment-header` · `slot-bridge-position` ·
`slot-quarters-selected-history` · `slot-portrait-desktop` ·
`slot-portrait-mobile-disc` · `slot-portrait-quarters` · `slot-stop-h-exit-copy` ·
`slot-course-end`.

**Also awaiting Ben:** the 8–12 recordings anchoring the stops with their
`approvedExcerpts` start/end seconds; the fictional artifacts for Source Period C
(image production, not text — Period C renders "not yet available" until they
exist); and the actual Crew Manifest inventory.

**Withheld, not missing.** With `RENDER_MARKED_DRAFT = false` (Q21) and
`RENDER_BEN_REVIEWED = false` (Q13), every draft-origin record is built,
labelled, tested and **not rendered as prose**. 583 withheld strings exist in the
content modules. On screen they draw *"draft · implementation placeholder · not
Ben's words"*. That is the largest single fact about what a visitor sees today,
and item 17 treats it as a narrowing rather than as a feature.

**73 records resolve to `canon`** — all `published` + `BEN_APPROVED`, all of them
artboard Final-copy or spec-verbatim wording, none of them this build's opinion.

**The (WYS §35) register — thirteen open Ben content decisions — is recorded in
plan §13.2 and none is answered by accident.** §35's architectural requirement is
also met: **every one of the thirteen is a data or config edit, never a component
edit.**

## 16. Tests run, and results

```
npm test          →  tests 523 / pass 523 / fail 0
npx tsc --noEmit  →  exit 0
PORT=3999 npm run build (after rm -rf .next)
                  →  exit 0 · 40 static pages · every route ○ or ● · zero ƒ
                  →  [bundle-provenance] OK — 583 withheld strings,
                     none in 54 client bundles
scripts/check-no-deletions.sh → "Deletion contract OK", exit 0
```

23 flat files in `tests/`, run by `node --import tsx --test`. **Zero new npm
dependencies**; `tsx` was already present.

| File | Tests | | File | Tests |
|---|---|---|---|---|
| `wys-content` | 45 | | `wys-today` | 27 |
| `wys-data` | 43 | | `canonical-text` | 27 |
| `wys-shell` | 41 | | `legal-claims` | 26 |
| `wys-telemetry` | 40 | | `content-status` | 25 |
| `wys-local-state` | 33 | | `wys-progress` | 22 |
| `wys-practice` | 31 | | `preserved-surfaces` | 21 |
| `wys-plan` | 27 | | `machine-surfaces` | 20 |
| `wys-lesson-zero` | 23 | | `home-landing` | 17 |
| `ship-content` | 17 | | `governance-strings` | 9 |
| `route-resolver` | 8 | | `analytics-frozen` | 7 |
| `no-private-state-in-urls` | 6 | | `class-contract` | 5 |
| `client-bundle-provenance` | 3 | | **Total** | **523** |

**Three gates are executed, not eyeballed** — each is a script that
`npm test` or `npm run build` shells out to, so it cannot be satisfied by a
comment:

- `scripts/check-no-deletions.sh` — the deletion contract.
- `scripts/check-bundle-provenance.mjs` — **new at Phase 12.** It enumerates
  every record whose public render policy is `blocked` and fails if any of their
  ≥5-word strings appears in a client bundle. Wired into `npm run build` and
  asserted by `tests/client-bundle-provenance.test.ts`. **Negative control run:**
  reverting only the `sideEffects` field and rebuilding makes it fail with the
  scenario bank, so it detects the real regression rather than passing vacuously.
- `scripts/check-secrets.sh` and `scripts/guard-next-build.mjs` — byte-frozen,
  inherited, still in the pre-commit hook.

**Lint: not run, and not applicable.** Q14's ratified default. `npx next lint`
prints a deprecation notice and then drops into the interactive *"How would you
like to configure ESLint?"* setup prompt; there is no `eslint.config.*` or
`.eslintrc*` in the repo. There is nothing to run, and adding one is new scope.
Said plainly rather than reported as a pass.

**§29.2's six integration flows, §29.3's mobile QA, and the 45-box §37
acceptance record are in `docs/facelift-qa.md` §7–§9 and Appendix A below.**

## 17. Where the implementation had to narrow the spec

§38 asks for this last. It is the part of the report that matters.

### 17.1 The build order was reordered: telemetry earlier, the Data page later

(WYS §33) puts **"Add Data Manifest and local-state inspector" at step 6**, inside
Phase 1 (substrate), and the **telemetry adapter at step 20**, inside Phase 3
(measurement) — then adds **step 24, "Update Data Manifest to match actual
implementation exactly."**

This build did the reverse. The telemetry adapter shipped in **plan Phase 3**,
early, and the Data page in **plan Phase 8**, late.

**Why.** Step 24 exists because step 6's page is written before the thing it
describes, so it must be corrected afterwards — and a page that has to be
*updated to match* is a page that can silently stop matching. Reversing the two
removes the correction step entirely: by the time the Data page is built, the
adapter, the serializer and the browser-key registry all exist, so the page can
**derive** its content from them instead of describing them. Concretely, the
event register on `/watch-your-step/data` is generated from the adapter's own
allowlist, the key list is generated by enumerating the keys the code writes, and
the field rows are generated from the declared schema.
`tests/wys-data.test.ts` (43 tests) includes *"the event register is derived from
the adapter, never listed by hand."*

**What it cost.** Between Phase 3 and Phase 8 the branch had a working telemetry
adapter and no page describing it. That window is closed and never shipped, but
it is the honest cost of the reordering and it is recorded rather than smoothed
over. **The spec's requirement — "Data Manifest accurately describes what is
actually deployed" — is met by construction rather than by a maintenance step.**

### 17.2 The course is not presently completable as content

The largest narrowing, and it is a consequence of a ratified default rather than
a defect. With `RENDER_MARKED_DRAFT = false` (Q21), the TRY scenarios and the
JUDGE prose are **withheld**. The loop itself is complete and works — verified at
the Phase 12 audit by flipping the constant, rebuilding, and reading
`/watch-your-step/today`: full scenario, three choices, *"Commit, then see Ben's
take"*, CARRY. The constant was reverted and `git diff lib/content-status.ts` is
empty. But **as shipped, a learner reaches labelled empty boxes where the
exercises are.** (WYS §37)'s first box — *"a new learner can complete the core
without any AI call"* — is therefore **pass, narrowed**: no AI call is possible,
and there is not yet content to complete.

### 17.3 Nine further narrowings, each recorded where it happened

| # | Narrowing | Where |
|---|---|---|
| 1 | **The appetite signal is placed, not gated.** (WYS §21) wants it "after real deterministic value"; it sits on Practice, the quietest course-internal tab, but is not hard-gated on completion, so a deep link reaches it. The gating is placement. | `docs/facelift-unapproved.md` R8 |
| 2 | **"I did it" on the From Memory card records nothing.** Recording it would create a field for a ritual the spec says is private. | R4 |
| 3 | **Progress's "B · differs from Ben" row is not built** — there is no Ben judgment to differ from, so the third form has nothing to bind to. | Progress R2 |
| 4 | **No transfer-checks tile on Progress**, following the deferred transfer-check UI. | Progress R6 |
| 5 | **Day 5 of the 5-day path ships CARRY-only** (Q24), for the same reason. | plan §14 · `docs/facelift-deferred.md` |
| 6 | **No `BEN_AUTHORED_VARIATION` exists**, so the artboard's "Ben variant" pill has nothing to bind to. | H3 |
| 7 | **Principles ship with neither Ben field filled.** | H7 |
| 8 | **The mixed-media artifact bank is deliberately empty** — the twelve §24 containers are representable in the type; Period C's artifacts need image production, not text. | H1 |
| 9 | **Fifteen desktop layouts are extrapolated.** The approved set is canonical at 390px; `4a` is the only desktop artboard. Every 1280px composition on a course or ship screen is this build's extension of an approved mobile design. | GT1 |

### 17.4 Two places where the spec and an approved artboard disagreed

Reported rather than silently resolved, because R1 and R2 point different ways.

- **Commit is ink, not `5b`'s teal** (Q17). Every other primary pill in the
  approved set is ink; standardising was chosen and the deviation reported.
- **Selection no longer reflows** (Q18). `5a`'s selection rows grow 4px on select;
  normalised to `4a`'s non-reflowing pattern, and the 2px visual delta reported.

### 17.5 One place where an approved colour could not ship as drawn

Q23. Two approved pairs miss WCAG AA for normal text: `--accent` on `--tint-teal`
measures **4.45:1**, and white on the disabled Commit fill measures **1.69:1**.
`/accessibility` publishes a contrast claim, so R8 forbids fixing it in copy. A
second token `--accent-text-on-tint` (**5.47:1**) carries text on tint; `#1F7A8C`
is unchanged for fills, bars and the focus ring; the disabled label ships grey
(**3.23:1**) rather than white. **The deviation is published on `/accessibility`
as a measurement**, not concealed, and the measured table is in
`docs/facelift-unapproved.md` B1.

---

# Appendix A — the (WYS §37) acceptance record

45 boxes, 8 groups, each recorded pass / fail / narrowed-with-reason **with
evidence**. Plus §2.2's three scope boxes and the plan's five additional gates.

**Result: 45 boxes — 44 pass (3 narrowed with reason), 1 narrowed as not
applicable (Lint, Q14 option B), 0 fail. Scope: 3 pass. Additional gates:
5 pass.**

### Runtime boundary — 6/6

| Box | Verdict | Evidence |
|---|---|---|
| Complete the core without any AI call | **pass, narrowed** | Zero network primitives in the corpus; no `"use server"`; no `app/api`; both route handlers `force-static`. Narrowed per §17.2 above. |
| No account required | pass | Rendered `/`: "Free · No account · No AI required"; struck anti-feature pill "An account". `login`/`signin` → 0 client chunks. |
| No personal free text required | pass | Two `<textarea>` in the whole tree. `FromMemory` is page-local, cleared on route change, never persisted. `ProgressView`'s rule field is (WYS §16)'s learner-owned rulebook — the one declared exception (plan §7.2). |
| No upload required | pass | No `<input>` element of any kind in `app/` or `components/`; no `type="file"`. |
| No microphone required | pass | `getUserMedia` · `MediaRecorder` · `SpeechRecognition` → none. |
| No visible chat interface | pass | Only `chat` occurrences are the fictional `scn-group-chat` scenario and the struck pill "A chatbot". The disclosure strip on every page reads "No chatbot, no coach, no generated answers." |

### Curriculum — 8/8 pass

WATCH→TRY→JUDGE→CARRY rendered on `/` and as four phase pills on Today ·
commit-before-explanation (`lib/wys/judge-machine.ts`; choices lock on commit,
judgment reveals after) · fictional-first ("Fictional · nothing about you") ·
eight named over-withholding classes with a test that every class has a scenario ·
twelve §24 containers plus `other` on the artifact type · two replay modes,
neither generative, and a replay never overwrites a kept judgment ·
"No need to report back" with a test that no carry requires reporting ·
From Memory offers aloud/paper and its optional box never transmits.

### Provenance — 4/4 pass

Ben source vs fictional visibly distinct on screen · *"no non-Ben origin can
resolve to a Ben-authored label"*, *"a draft Ben-origin object is blocked"*,
*"BEN_APPROVED never claims Ben authorship"* · every object carries a resolvable
`sourceIds`, `status` and `origin` · the production status policy is two typed
constants and one chokepoint.

### State — 5/5 pass

Local-first with one writer that sanitizes first · **Restart and Clear are
distinct** in code and in copy · the Data page inspects all declared fields, the
key register and raw JSON · clear removes every `wys:` key and leaves consent
alone · the rulebook cannot reach analytics, refused by the property allowlist.

### Telemetry — 8/8 pass

One audited adapter · closed event allowlist **and** closed property allowlist
with value domains · disable-able three ways, failing closed · no free text ·
no localStorage blob forwarded · no scenario answers · aggregate N/A in v0 ·
Data Manifest accuracy derived, not listed.

### Appetite — 4/4 pass (one narrowed)

"I'd want deeper practice · One anonymous count. No email. Nothing unlocks." ·
no email field · no chat · not visually rewarded (11px mono provenance voice;
the pill disables after one click) · *"nothing anywhere on Practice branches on
the appetite flag to change what is offered"*. Narrowed on placement (§17.3 #1).

### UX — 5/5 pass

**Measured in a real browser at the Phase 12 pass** (`docs/facelift-qa.md` §7):
horizontal overflow **0px** on all 26 routes at 360 / 390 / 402 / 1280, zero
unreachable destinations, zero modal traps · every `onClick` in the tree is on a
native `<button>` or a primitive that renders one — no div-onClick, no `tabIndex`
hacks · skip link first focusable on every page · contrast recomputed from the
shipped tokens (ink/white 16.46, body/white 9.37, muted/white 5.47,
white/accent 4.98, body/tint-teal 8.37) · **one defect found and fixed** —
navigation links measured 41–42.5px against a published 44px claim (§7.3 of the
QA doc) · no streaks, scores, percentages or guilt copy, and no field exists that
one could be built from.

### Engineering — 4 pass, 1 not applicable

523/523 tests · lint not applicable (Q14) · build exit 0 with every route `○`/`●`
and zero `ƒ` · zero new dependencies · no privacy claim exceeds implemented fact.

**Watch item, not a box.** Home First Load JS moved **109 kB → 119 kB**
(`docs/facelift-baseline.md` §3c.2). The shared chunk is unchanged at 102 kB.
Incremental builds report an inflated figure (126 kB); only `rm -rf .next`
reproduces the real one.

### Scope (§2.2) — 3/3 pass

Both Build-now items ship (the Data Manifest at `/watch-your-step/data`, and
"See what this site knows about you" on `/`) and every deferral is now recorded
in `docs/facelift-deferred.md` · the 18-item do-not-build list is absent from the
runtime, verified against source **and** built client chunks · the Coach schema
is present, disabled, imported by nothing, and in 0 client bundles.

### Gate addendum — one defect found at the Phase 12 gate itself

Recorded here so this appendix describes the tree that shipped, not the tree the
audits measured.

**A Standing Order 07 breach the duplicate check could not see.**
`claims["localStorage"].short` and `rulebookStorageText` both typed the same
eight words from the same source (`artboard-5b-rulebook-note`) — one artboard
sentence with two canonical nodes, against an order `/standing-orders` publishes
live. Both duplicate checks in `tests/canonical-text.test.ts` skipped anything
under twelve words; the sentence is eight, so they had been green over it since
Phase 6. The dead, never-rendered `short` variant was removed, the rendering
Progress record left as the single owner, and both floors dropped to six words —
negative-controlled by the defect itself, which fails the record-level check on
the pre-fix tree. One repeat that is a (WYS §11) principle **name** rather than a
duplicated claim is exempted singly, by hash, with a self-expiring assertion.
Full write-up: `docs/facelift-build-notes.md` §20.5.

It changes no box verdict above — nothing rendered changed and no preserved copy
was touched — but it is the second time this build found a check that was green
while the thing it guards was false (the first being the 44px claim, §7.3 of the
QA doc, and the third the bundle leak, Captain's Round question 8). That pattern
is the one thing worth carrying forward from this phase.

### Additional gates — 5/5 pass

`check-no-deletions.sh` exit 0 with both filters silent · preserved routes,
redirects and hrefs (21 tests plus a rendered-text diff against a `main` build) ·
GA4 frozen (7 tests) · six legal pages keep their URLs and metadata titles · no
governance string outside `lib/approval-state.ts`.
