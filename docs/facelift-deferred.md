# Facelift — deferred, scheduled, not forgotten

Plan §14's deliverable. Everything the build decided **not** to do, with the
reason it was not done and the condition that would let it be done. Kept as its
own file because §14 otherwise lives only inside the 1,796-line plan, and a
deferral that is only findable by reading the plan is indistinguishable from an
omission.

Written at the Phase 12 gate. Nothing here is written in Ben's first person; the
notes are factual build description (plan §2.1).

**Three things it is honest to say at the top:**

1. Six of these rows are things the packet or the spec **requires** and this
   build did not ship. They are listed as requirements not met, not as scope
   that was never in view.
2. Four rows are marked **"Ben should confirm"** — the deferral is a judgment
   this build made and does not have the authority to close.
3. One row (`docs/facelift-unapproved.md` PREVIEW) is a Phase 12 task the build
   could not perform at all, because performing it would have broken a hard
   rule. It is the only unexecuted task in the plan's Phase 12 table.

---

## 1. The AI layer, and everything that hangs off it

| Item | Why deferred | What would unblock it |
|---|---|---|
| **AI Coach runtime**, Studio integration, generated replay, personal-input path | (WYS §33 Phase 6) — *"later, only after evidence"*. The whole point of v0 is to find out whether the deterministic curriculum has value on its own. | The `wys_depth_interest` count on Practice, over a real cohort. That is the one signal the build ships for this decision, and it is a count with no identity attached. |
| **The Coach schema** | Not deferred — **shipped, disabled and invisible**, per (WYS §22). `lib/wys/coach-schema.ts` exports three types and zero values; nothing imports it but the test that reads it as text; `coach-schema` appears in **0** client bundles. Listed here so "the Coach is deferred" is not read as "the Coach constraints were skipped". | — |

## 2. Measurement that needs a database

| Item | Why deferred | What would unblock it |
|---|---|---|
| **The first-party aggregate endpoint** (WYS §19.2, §30) | No persistence layer exists, and standing up one is a new vendor relationship (Q12) that (WYS §19.2) says the builder must not make alone. The adapter ships **refusing by name**: `WYS_AGGREGATE_ENABLED` is a build-time `false`, `AGGREGATE_ENDPOINT` is `null`, and `tests/wys-telemetry.test.ts` asserts that *with the flag forced on* `sendAggregate` still makes no call. | Ben's decision on a vendor, then the §30 schema. Until then Data page card 2's aggregate sentence is **absent from the DOM**, not merely false-and-hidden (Q22). |
| **Answer-distribution counters** on the home demo | Same root cause. The 18/61/21 bars ship with the "Example numbers" caption bound inseparably to the data (Q11) — `DistributionBars` takes `caption` as a **required** prop with no default, so a bare number cannot render. | The counter above. |
| **Transfer-check UI** | The data model and the `wys_transfer_check_complete` event are wired; **no artboard draws the surface** and Progress omits its tile. Building it would be unapproved invention. | An artboard, or Ben's instruction to design one. |
| **Day 5 of the 5-day cadence as delayed retrieval / transfer** (Q24) | Consequence of the row above. (WYS §12)'s 5-day path ends *"delayed retrieval or transfer + CARRY"*; v0 ships Day 5 as **CARRY-only**. | The transfer-check UI. Recorded so a deferred feature does not silently shorten a shipped path's last day. |

## 3. Ship / governance surfaces that need Ben, not code

| Item | Why deferred | What would unblock it |
|---|---|---|
| **Snapshots, the christening, Snapshot 0** | (packet §22). The keel is not frozen and no hash exists, so Snapshot 0 cannot be cited yet. The Ship's Log's own forward-looking card says so on the page: *"The first stamped entry becomes Snapshot 0."* | Ben stamping one entry. |
| **Freezing YY Method v2.3 and publishing its SHA-256** | Requires action on `yymethod.com`, a property this repo does not control, and the packet's hashing rule requires publication **before** citation. `/standing-orders` renders the keel as a link with **no digest** and `approvalState.keel.sha256` is `null`; `tests/ship-content.test.ts` asserts no 64-hex string reaches the page. | Publication on yymethod.com. |
| **The Mess** | (packet §22) — recreational surface, explicitly lower authority, no artboard. | An artboard. |
| **The Captain's Stamp as a rendered component** | The `CaptainsStamp` **type** ships (plan §6.6) so the data exists the moment Ben stamps; its rendered form does not, because no approved artboard draws one. | An artboard, or the first stamp. |

## 4. Packet requirements this build did not meet — stated as such

These are the uncomfortable four. Each is a packet hard-structure or identity
requirement, and each is unmet.

| Item | Why deferred | Ben should confirm |
|---|---|---|
| **The repeated page grammar** — `claim → source → explanation → boundary → what changed → related record` (packet §19 Structural DNA), and build step 12's *"source blocks, diagrams, expandable depth, stamp"* | Plan §4.8's twenty-primitive inventory contains **no** source block, no "what changed" block, no expandable-depth layer, no diagram/chart/timeline primitive and no stamp component — **because the approved artboards draw none of them.** On a facelift whose fidelity target is "recreate pixel-close", building six new primitives would be entirely unapproved invention. | **Yes.** This is a named packet requirement the build did not satisfy. It is here rather than unmentioned because silently omitting it is the one thing §14 exists to prevent. |
| **The visual identity layer** — one canonical Author Ship illustration that evolves slowly; violin DNA (arching, bridge geometry, purfling edges, string-line motifs); the move to diagrams/charts/timelines/source cards/pull quotes after a single AI-assisted hero (packet §12, build steps 35–37) | The approved artboards contain **no imagery whatsoever** — every media surface in the set is a 135° stripe placeholder — and packet build step 34 puts the visual language behind the keel freeze, which has not happened. **This build therefore ships zero new identity assets: `public/` gains no files, and `brand-mark.png` remains the only image on the site.** | **Yes.** Stated plainly rather than letting "we quoted the prohibition list" stand in for having addressed §12. |
| **`/faq` and its five named children; `/explain/<component>`** | A **scope decision, not a packet deferral.** The packet's §22 defers a *"huge FAQ UI"*, not the FAQ — build steps 26 and 27 sit **inside** the v1 order. Deferred here because they are outside the approved artboards and outside the WYS spec, and because the five slugs (`does-this-site-use-ai-on-me`, `what-does-this-site-store`, `how-do-i-clear-local-storage`, `can-i-learn-ai-without-using-ai`, `why-do-you-use-analytics`) overlap the refreshed legal pages and the Data page. | **Yes.** Consequence to state plainly: **`llms.txt` maps a thinner set of surfaces than the packet's model assumes.** |
| **JSON-LD / structured data** (packet §15) | Explicitly deferred rather than left unmentioned. `metadata.alternates.canonical` (plan §5.2) plus `sitemap.xml`, `robots.txt` and `llms.txt` carry the canonical-status signal for v0. | Revisit once the ship objects are stamped and stable. |

## 5. Optional WYS surfaces

| Item | Why deferred | Note |
|---|---|---|
| **`/watch-your-step/sources`** | (WYS §5.1) optional. No artboard, and no Ben recording exists to put on it. | **Recommended for v1 and flagged.** It is the natural single canonical node for the ten labelled Ben source slots, their `approvedExcerpts` and the §27 transcripts, which v0 otherwise duplicates across Today, Practice and Captain's Quarters — the Standing Order 07 problem this build is otherwise careful about. |
| **`/watch-your-step/about`** | (WYS §5.1) optional. No artboard, no content, nothing on it the landing does not already carry. | — |
| **`/llms-full.txt`** | The packet itself hedges (*"Potentially expose"*). | — |

## 6. Infrastructure and tooling

| Item | Why deferred | What would unblock it |
|---|---|---|
| **Full MCP server; interactive Author Ship maps; large volumes of AI imagery; comments; accounts; cloud-synced learner profiles; embedded chatbot; complicated personalization; Higgsfield-heavy visual content; automated voice imitation; exhaustive Studio archive conversion** | (packet §22) — *"Build the authoritative state system first. Everything else can attach to it."* | The state system is now built; these attach to it when Ben wants them. |
| **A browser test harness (Playwright)** | Q15, ratified at its default: manual QA, reported as manual. (WYS §37)'s "no unnecessary dependency" rule and the zero-new-dependency constraint both point the same way. | Ben accepting the dependency. The Phase 12 mobile and reachability passes were run with an **external** browser driver that is not a repo dependency — see `docs/facelift-qa.md` §7 — so the measurements exist without the package.json cost. |
| **An eslint config** | Q14, ratified at its default: drop lint from the gates and say so plainly. `npx next lint` drops into an interactive setup prompt; there is no `eslint.config.*` or `.eslintrc*` in the repo, so there is nothing to run. Adding one is new scope, not a restyle. | Ben accepting the new scope. |
| **Dark mode** | Not in the repo and not in any approved artboard. **Do not invent it by inverting tokens.** | An artboard. |
| **Ingesting more voice transcripts, re-transcribing, or expanding the corpus** | (packet) — the corpus is frozen for the first contract. | Ben. |

## 7. The one Phase 12 task that was not executed

| Item | Status |
|---|---|
| **The Vercel preview deployment**, and its URL at the head of `docs/facelift-unapproved.md` | **Not executed.** The plan's Phase 12 table asks for the branch to be pushed to `origin` so a preview build gives Ben something to look at. The build's operating constraints for this branch are *never push, never open a PR, nothing merges to `main`*, and a hard rule outranks a task row (plan R6 — the user's constraints override every source). So the push did not happen and no preview URL exists. **The GA scoping question the plan attaches to it is unanswered and stays open:** a preview deployment inherits `NEXT_PUBLIC_GA_MEASUREMENT_ID` unless it is scoped per-environment, which would send preview traffic into the production stream that user constraint 4 pins. **Before anyone pushes this branch, scope that variable to Production only (or leave it unset for Preview) and record which.** Recorded in `docs/facelift-unapproved.md` §Z1. |

---

## What this file is not

It is not a backlog and it does not estimate anything. Every row is either
(a) blocked on an artboard, (b) blocked on Ben, (c) blocked on a vendor
decision, or (d) a scope judgment this build made and has flagged for
confirmation. Nothing here is blocked on engineering time.
