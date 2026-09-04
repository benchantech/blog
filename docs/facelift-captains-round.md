# Second-pass Captain's Round for the code

(WYS §39). Seventeen questions, re-read against the spec after implementing, and
answered in writing. §39's rule: **"If any answer is yes, fix it before handoff or
explicitly report the unresolved conflict."**

This document is deliberately not a code review. §39 asks whether the build
*betrayed* the thing it was built to prove, and the answer to that is a stamp
decision, not a diff. So each question gets a verdict, the evidence, and — where
the honest answer is "no, but", the "but".

**Result: seventeen answered. Fifteen no. Two "no, but" carrying a live tension
Ben has to settle. One yes was found during this round and fixed before handoff;
it is question 8 and it is written up in full because it was the most serious
finding of the whole build.**

Nothing here is written in Ben's first person.

---

## The seventeen

### 1. Did I accidentally make the AI layer aspirational?

**No.** The one thing that could have made it aspirational — shipping the Coach
as a stub that looks like it is about to work — did not happen.
`lib/wys/coach-schema.ts` exports three **types** and zero values. Nothing imports
it except a test that reads it as text. `coach-schema` appears in **0** of 54
client bundles. There is no button, no placeholder, no "coming soon" anywhere on
the site that implies a coach is arriving.

`/ai-disclosure`'s claim — *"the bundle this site ships to a browser contains no
AI SDK and no chat SDK"* — was checked against the built chunks, not against the
source. It is true.

The nearest thing to aspiration is the appetite pill on Practice, and its own copy
disarms it: **"Nothing unlocks."** A test asserts that nothing anywhere on Practice
branches on the appetite flag to change what is offered.

### 2. Did I collect anything merely because it was easy?

**No, and this is where the build spent its most deliberate effort.** Four keys
travel. Not four categories — four keys: `lesson_index`, `source_period_id`,
`content_version`, `route_type`.

The temptation §39 is pointing at is real and was declined at least three times:

- **A choice-key property would have been trivial** and would have made the
  distribution bars real. It does not exist. **No GA4 event fires on commit at
  all**: `JudgeCard.tsx:140` calls `sendAggregate({ event: "scenario_choice", … })`,
  which is the first-party-only path, and that path is disabled and endpointless,
  so the commit sends nothing anywhere. The two events that *would* carry an
  answer are refused by the GA4 adapter **by name**.
- **`route_type` could have been the raw pathname.** A pathname is a free-text
  field wearing a permitted name. It is a closed eight-value vocabulary instead,
  and the fact that this build authored those eight values (the spec names the
  property, not its values) is reported rather than passed off as spec.
- **A key allowlist alone would have been easier than value domains.** The build
  wrote value domains anyway, because a key allowlist would happily carry a
  learner's sentence under `content_version`.

`wys_view` and `wys_transfer_check_complete` are on the spec's allowlist and have
**no call site**. They were not fired just because they were permitted.

### 3. Did I pass any learner answer into GA4?

**No.** No property in the allowlist can carry one, and the two aggregate-only
events that would are refused by name with their own refusal reason.

The stronger guarantee is at the type level: call sites are typed, so passing a
whole `WysLocalStateV1`, a rulebook array, or a scratch string is a **compile**
error before it can reach a runtime check. The runtime check exists anyway, for
`unknown` values, and is named in tests: *"a whole `WysLocalStateV1` object passed
as a property is rejected"*, *"a rulebook array passed as a property, or as the
whole props object, is rejected"*, *"free text under an allowlisted key is
rejected by the value domain."*

The canary `DO_NOT_SEND_WYS_TEST_9f31` fails all four value domains.

### 4. Did I create a persistent ID that WYS does not need?

**No.** There is no learner ID, no pseudonym, no device ID, no session ID, no
hash of anything. `pseudonym` appears in 0 client chunks. The only identifiers in
`wys:v1` are **content** ids — scenario ids, stop ids, lesson ids — which identify
the curriculum, not the person.

GA4's own client ID exists and is not ours: it is set by the frozen
`GoogleAnalytics.tsx`, only after consent, and this build neither reads it, nor
joins anything to it, nor mentions it as if it were WYS state.

### 5. Did I create a raw telemetry event table?

**No.** There is no database, no table, no endpoint and no route that could
receive one. `AGGREGATE_ENDPOINT` is `null`; `WYS_AGGREGATE_ENABLED` is a
build-time `false`; the test that matters is *"with the flag FORCED ON,
`sendAggregate` still makes no call"* — the guarantee does not depend on the
flag's value. `lib/db/*` is byte-frozen and nothing in the WYS tree imports it.

### 6. Did I add a vendor that expands the trust surface?

**No.** Runtime dependencies are still exactly three: `next`, `react`,
`react-dom`. `package-lock.json` is untouched by this branch. One third party is
contacted at runtime — `googletagmanager.com` — and it was already there, is
byte-frozen, and only loads with a measurement ID configured.

`@next/third-parties` was deliberately **not** installed, even though it is the
idiomatic choice, because it ships a competing gtag bootstrap that would clobber
the frozen Consent Mode v2 defaults. Fonts are self-hosted at build time by
`next/font`, which *removed* a runtime contact (the render-blocking Google Fonts
`@import` on `app/globals.css:1`).

**The one thing to flag honestly:** the Phase 12 browser measurements were taken
with an external browser driver that is **not** a repo dependency and is not
installed by `npm install`. It expands nothing that ships. Q15 stands: the
harness is deferred, the QA is manual, and it is reported as manual.

### 7. Did I make a local field networked?

**No.** Every field in `wys:v1` stays in the browser. The rulebook — the field
most obviously tempting to sync — is kept off the wire **by the property
allowlist, not by call-site discipline**: there is no allowlisted key it could
travel under, and the value domains would reject it if one were invented.

`FromMemory`'s scratch box is not in the schema at all. It holds its value in one
`useState`, imports no `useWysState`, no `localStorage`, no `fetch` and no
`trackWys`, and clears on route change.

No URL carries learner state (`tests/no-private-state-in-urls.test.ts`).

### 8. Did I make a draft statement look Ben-authored?

**On screen, no — never, and it is enforced rather than reviewed. In the shipped
JavaScript, YES, and it was fixed during this Captain's Round.**

This is the most serious finding of the build and it is written up in full
because the failure mode is the exact one (WYS §7) exists to prevent.

**What was wrong.** `lib/wys/content-gate.ts` closes the *prop* path — a blocked
record's text never reaches a component. It does nothing about the *module* path.
A client component that **imports** a content module pulls that module into a
client chunk whatever it reads from it. Two edges did exactly that:
`content/watch-your-step/domains.ts` imported id lists from `scenarios.ts` and
`weeks.ts`, and `WYS_DOMAINS` is what every course client component hands
`useWysState`; and `CurrentStopGate` reached `weeks.ts` through `current-stop.ts`.

The measured result on the pre-fix build: a 19.8 KB chunk loaded as
`<script async>` on **every page — `/contact` and `/studio` included** — carried
the entire scenario bank verbatim. Settings, decision moments, every choice
label, and the internal authoring notes. All of it `status: "draft"` +
`origin: "IMPLEMENTATION_PLACEHOLDER"`, i.e. **blocked** under Q21's ratified
default. Of the 322 distinct blocked strings the leak audit enumerated,
**141 were in client chunks.** (The gate's own figure below — 583 — is a wider
enumeration: it counts every string on every blocked record, not only the distinct
prose the audit sampled. The two numbers measure different things and both are
reported as measured.)

**The pages whose DOM honestly drew "Implementation placeholder — not Ben's
words" were shipping the withheld words in their own asset graph.** The label was
true of the pixels and false of the page. Anything that reads a page without
running it — view-source, the `.rsc` payload, a crawler, an LLM — got the draft
curriculum.

**How it was fixed** (three parts, each reasoned in code comments): a
`"sideEffects": ["*.css"]` hint so webpack can actually drop the unused record
arrays; `WYS_STOP_IDS` as a literal list rather than a `.map()` over the week
records; and a `currentStopIdFrom(stops, …)` projection so `CurrentStopGate`
takes plain shapes as props and imports no content-record module — the
module-graph twin of the projection the prop path already performed.

**Result: 0 blocked strings in any client bundle**, checked as 583 strings
against 54 bundles.

**And the reason this counts as fixed rather than patched:** the guarantee is now
a **script that runs**, not a rule someone remembers.
`scripts/check-bundle-provenance.mjs` reads `.next/static`, enumerates every
record whose public render policy is `blocked`, and fails the build if any of
their ≥5-word strings appears in a client bundle. It is wired into
`npm run build` and asserted by `tests/client-bundle-provenance.test.ts`. It was
negative-controlled: reverting only the `sideEffects` field makes it fail with
the scenario bank, so it detects the real regression rather than passing
vacuously.

**On the screen half of the question, the answer was always no, and stays no.**
`tests/content-status.test.ts`: *"no non-Ben origin can resolve to a Ben-authored
label"*, *"a draft Ben-origin object is blocked"*, *"BEN_APPROVED never claims Ben
authorship"*. Ben slots cannot be filled at all — `children`, `text` and `body`
are typed `never`. The one slot whose descriptor comes from prose
(`app/ben/page.tsx:168`) is gated on `policy.kind === "canon"` with a fallback to
the record's own build-language descriptor.

**One thing for Ben, not a defect (Q19).** The artboards draw draft AI prose
inside a premium ink card headed "BEN'S JUDGMENT · slot awaiting Ben", beside a
grey striped Ben slot. (WYS §23) says AI material must not look more polished than
human source material. The build shipped it as designed with the mono draft line
on both breakpoints, and escalated the tension rather than resolving it alone.

### 9. Did I teach maximal deletion instead of minimum necessary disclosure?

**No, and the curriculum is built so it cannot drift that way.**
`WysOverWithholdingClass` is eight **named** classes, `scenarios.ts` carries nine
`overWithholdingClass` references, and a test asserts *every named
over-withholding class has at least one scenario*. Over-withholding is a first-
class failure mode in the model, not a caveat in a paragraph.

Source Period B is titled *"Minimum Necessary Is Not Minimum Possible"*, and it
is a stop, not a footnote.

### 10. Did I leak the answer before learner commitment?

**No.** `lib/wys/judge-machine.ts` is a state machine, not a CSS trick: choices
lock on commit and the judgment reveals after. The control says **"Commit, then
see Ben's take."** `JudgeCard.tsx:44` holds the lock, and the locked state keeps
the choices **visible and legible** rather than greying them out — the learner can
still read what they committed to.

The home demo behaves identically, because it is the same component bound to the
same content object (Q3), not a second copy.

### 11. Did I equate agreement with Ben with success?

**No — and this is where the build had to narrow rather than comply.** Progress's
judgment row was designed to render three forms, one of which is *"B · differs
from Ben"*. That row **is not built**, because there is no Ben judgment to differ
from: every judgment body is draft and withheld.

The consequence is the right one for this question: nothing on the site tells a
learner their answer matched or missed. There is no correctness state at all in
`WYS_DECLARED_KEYS`, so one cannot be added by a component.

**Flagged for Ben:** when the real judgments land, that row becomes renderable,
and it is the single place where "agreement = success" could quietly re-enter.
`docs/facelift-unapproved.md` Progress R2 records it.

### 12. Did I use time-on-page as mastery?

**No.** No timer, no dwell measurement, no engagement metric, no `time_on_page`
property. The only time in the system is the learner's **own** declared budget
(5 / 10 / 15 / 20+ minutes), which is an input to how much is offered, never a
measurement of them. It renders as depth, in the learner's own units.

### 13. Did I require reporting after CARRY?

**No.** The home page says it: *"CARRY — One small thing to do off-site. Nothing
to report."* Today says *"No need to report back."* A test asserts *no carry
requires reporting*. The CARRY mark writes one boolean into local progress and
asks for nothing back, and `wys_carry_reached` fires on **reaching** the card,
never on marking it — so the count measures what the site showed, not what the
learner did.

### 14. Did I make restarting sound like deletion?

**No, and they are two controls, not one with a modifier.** Their rendered labels
are *"Restart the course · keeps rulebook"* and *"Clear this browser's data"*.
Restart rebuilds state and **keeps** the rulebook, onboarding and appetite; Clear
sweeps every `wys:` key. Tests assert both halves.

Both explain what will happen **in a confirmation step before executing**, per
(WYS §17), not in a tooltip that a fast tap skips.

### 15. Did I claim anonymity or privacy more strongly than the infrastructure permits?

**No — and two published sentences were narrowed to keep it that way.**
`/privacy` and `/ai-disclosure` each gained the single word **"server-side"**
(`…no uploads, or **server-side** personalized user memory`), because the site
*does* keep personalized memory — in the visitor's own browser — and the
unqualified sentence was false. Recorded in `docs/facelift-copy-diff.md` §1.

The forbidden phrases are absent: "privacy guaranteed", "AI you can trust"
(except as the struck-through anti-feature pill, which is its approved use),
"expert-certified privacy judgment".

The clearing footnote says what cannot be deleted, on the page: *"Clearing
removes this browser's copy. It can't erase hosting or analytics logs — and this
page won't pretend it did."* Server logs, security records, GA4 data already sent,
and the consent key itself all survive a clear, and the Data page says so.

**One claim was found false during this round and fixed in the architecture, not
the copy** (plan R8). `/accessibility` publishes *"Buttons, links in navigation
and course controls are at least forty-four pixels tall."* Measured in a real
browser at 390px and 1280px: footer navigation links were **42.5px**, the header
brand was **32px**, the desktop ecosystem nav was **41px**, and the Data page's
raw-JSON disclosure control was **16.5px**. Four rule sets were corrected; the
header's drawn height is unchanged at 390px and grows 3px at 1280px. The old test
had passed the whole time because it only asked whether `min-height: 44px`
appeared *somewhere* in the stylesheet, so it was replaced with a **per-rule**
check that fails on each named rule individually — negative-controlled.

### 16. Did I make WYS harder to leave?

**No.** Leaving costs one tap. There is no account to close, no email to
unsubscribe from, no export to request first, and no "are you sure you want to
lose your progress" framing. The Data page offers **Download my local data**
before it offers either destructive control, so a learner leaves with their own
material. Clear does not ask why. Nothing re-prompts.

`/watch-your-step/end` — the completion surface — asks for nothing.

### 17. Did I add complexity that does not help answer the website experiment?

**No, but this is one of the two answers Ben should push on.**

The experiment is *"does the deterministic curriculum have value on its own?"*
Measured against that, most of the build earns its place: the curriculum, the
local state, the Data page, the four coarse counts, the appetite signal.

Three things are heavier than that question strictly needs, and each is here for
a stated reason rather than because it was interesting to build:

- **The five ship / governance surfaces** (`/bridge`, `/standing-orders`,
  `/ships-log`, `/crew`, `/ben`) are approved artboard `5d`. They answer the
  packet's experiment, not the WYS one. R1 puts them on the site.
- **The four machine surfaces** (`llms.txt`, `robots.txt`, `sitemap.xml`,
  `author-ship/state.json`) are packet requirements that no artboard could draw.
  Recorded as new and unapproved (`docs/facelift-unapproved.md` GT2).
- **Q25's supersession machinery** exists because the Bridge publishes *"every
  earlier state lives in the Log"*, and R8 says a false claim is fixed in
  architecture. It is machinery that ships to make one sentence true. That is the
  right trade under R8 and it is still complexity, so it is named here.

**What was declined:** no CMS, no state manager, no styling library, no icon set,
no animation library, no test framework beyond `node:test`, no ESLint config, and
no browser harness. Twenty primitives, plain CSS Modules, three runtime
dependencies.

---

## The two answers that are "no, but"

Both are live tensions rather than defects, and both need Ben rather than a
commit.

**A. Question 8's escalation (Q19).** The build ships draft AI prose in a premium
ink card headed with Ben's name-as-slot, next to a grey striped Ben slot, exactly
as the approved artboard draws it — while (WYS §23) says AI material must not look
more polished than human source material. R1 says ship the artboard; §23 says the
hierarchy is wrong. **Both sources are authoritative and they disagree.** The
build shipped as drawn, added the mono draft line on both breakpoints, and
escalated rather than choosing.

**B. Question 17's ship surfaces.** Five of the eleven new public pages exist to
answer the packet's experiment, not the website experiment §40 names. That is a
defensible reading of R1 and it doubles the surface area a first cohort sees.

---

## What this round is asking Ben to do

Not to review code. Four things:

1. **Stamp or reject the approved-artboard surfaces as built.** They are faithful
   to `4a` and `5a`–`5d`; where they are not, `docs/facelift-unapproved.md` says
   so, item by item.
2. **Rule on Q21.** `RENDER_MARKED_DRAFT` is `false`, so the course ships with its
   exercises withheld behind their labels. It is a one-line flip and it is the
   single biggest fact about what a visitor sees on day one.
3. **Settle the two tensions above.**
4. **Decide what gets stamped first.** The Ship's Log's own forward-looking card
   says the first stamped entry becomes Snapshot 0, and nothing else in the
   governance chain can move until one does.

Everything else in this build is either measured, tested, or written down as
unapproved.
