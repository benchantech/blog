# Facelift — final-copy diff for Ben (Phase 11)

Plan §8b.4 deliverable: **every final-copy sentence that changed, with the code line that forced the change.** The handoff README marks the Data page wording and the disclosure strip as final copy, so every amendment below is an escalation to you, not a unilateral edit.

Six pages were refreshed **in place**: `/privacy`, `/terms`, `/cookies`, `/copyright`, `/accessibility`, `/ai-disclosure`. All six keep their URL and their metadata title. `/contact` is a footer legal link but is not one of the six and was not touched.

**How to read a row.** Every claim now lives in exactly one content record and every record names the module that makes it true. If a sentence below is wrong, change the record — the page renders it, it does not own it. `tests/legal-claims.test.ts` fails if a page starts typing a claim out for itself.

**Two provenance states appear on these pages now:**

- Records taken from the spec or an approved artboard are `published · BEN_APPROVED`. They render as prose, unlabelled.
- Records this build authored are `published · AI_SYNTHESIS`. They render **with** the line "Drafted during implementation — not Ben's words" and the mono draft mark beneath them. That is visible on the legal pages, deliberately. If you would rather these pages carried no provenance marks, that is a one-line change in `components/LegalProse.tsx` — but it would make a legal page the only surface on the site where an AI-drafted sentence renders unlabelled, so it is put to you rather than decided here.

---

## 1. The only two sentences that were corrected

Everything else in this document is an **addition**. Exactly two clauses stopped being true when `wys:v1` shipped, and both were **narrowed by adding a word**, not rewritten around. Every other word of both paragraphs survives.

### `/privacy` → "Current services"

| | |
|---|---|
| **Was** | "It does not currently provide user accounts, subscriptions, uploads, or personalized user memory." |
| **Now** | "It does not currently provide user accounts, subscriptions, uploads, or **server-side** personalized user memory." |
| **Forced by** | `lib/wys/local-state.ts` — `writeWysState()` persists onboarding choices, curriculum position, kept judgments and the rulebook to `localStorage`. The course does remember a learner; it remembers them in their own browser. |
| **Why not a rewrite** | Three quarters of the sentence is still exactly true, and no route in `app/` collects a free-text field, accepts an upload or authenticates anyone. Deleting a true clause to fix a false one is a bigger change than qualifying it. |

### `/ai-disclosure` → "Current site behavior"

| | |
|---|---|
| **Was** | "It does not currently provide a personalized AI coaching service, user account, or persistent user memory." |
| **Now** | "It does not currently provide a personalized AI coaching service, user account, or **server-side** persistent user memory." |
| **Forced by** | Same line. The preceding sentence — "deterministic local routing and static content" — is still true and is untouched: `lib/route-resolver.ts` is byte-frozen and every route in the build prerenders. |

No other preserved sentence on any of the six pages was altered. No heading was renamed. `tests/legal-claims.test.ts` asserts both the corrected clauses and every preserved heading.

---

## 2. What each page gained

### `/privacy` — Privacy Policy

| Where | Record | Provenance | The sentence, and the code line behind it |
|---|---|---|---|
| after the intro | `privacy-disclosure` | AI_SYNTHESIS | "This site now carries more than a routing foyer. It also carries a finite course, a set of pages describing how the site is run, and state that lives in the browser you are reading this in. This policy covers all of it. The course's own Data page shows the same facts for your browser specifically, and reading it is a supplement to this policy rather than a replacement for it." — §8b.1: the Data page supplements and does not supersede. |
| after "Analytics and cookies" | `analytics` | BEN_APPROVED | "Ben may receive only what is necessary to understand how the course is used, and only what the enabled analytics allow: ordinary page and route analytics, coarse curriculum engagement events, an anonymous signal that someone wants deeper practice, and — only if the first-party aggregate endpoint is ever enabled — aggregate counts for selected structured exercises. The event names are a closed list and the properties they may carry are a closed list, and no entry in either one is a learner's answer." — `WYS_EVENT_NAMES` (13 names) and `WYS_PROPERTY_KEYS` (4 keys) in `lib/wys/telemetry.ts`. This is WYS §18's "Ben may receive" list, and it keeps §18's own conditional on the aggregate clause. |
| " | `data-analytics-conditions` | AI_SYNTHESIS | The two-mechanisms sentence, **shared with the Data page** — one definition, two presentations. Forced by `trackWys`'s consent gate: nothing is sent from a browser that declined or has not chosen. |
| " | `legal-aggregate-not-built` | AI_SYNTHESIS | "The first-party counter that would total up answers to the practice exercises is not built. Its switch is off, it has no address to send to, and there is no route on this site that could receive one, so an answer to a practice question does not leave the browser it was given in." — `WYS_AGGREGATE_ENABLED = false`, `AGGREGATE_ENDPOINT = null`, and there is no `app/api` directory at all. |
| after "Current services" | `legal-privacy-current-services` | AI_SYNTHESIS | "Alongside the routing foyer, the site now carries a finite self-serve course and a set of pages describing how the site is run. None of that added an account, a subscription, an upload, a comment box or any other place to type something that reaches a server." |
| new h2 "Watch Your Step and this browser" | `localStorage` | BEN_APPROVED | "Watch Your Step keeps your course state in this browser, under a single namespaced key called wys:v1. It holds whether you completed onboarding, your selected pace and time preference, where you are in the curriculum, which fictional exercises you completed, the choices you kept, your local rulebook, and whether you asked for deeper practice. Nothing in it is copied to a server, and the course keeps working if the browser refuses to store it at all." — WYS §18's "This browser can store" list. **The key name is composed from `WYS_STORAGE_KEY`, not typed**, so renaming the key changes this page. |
| " | `legal-privacy-no-server-state` | AI_SYNTHESIS | "There is no database behind the course and no login in front of it. A rulebook, a kept choice or a position in the curriculum exists in the browser that made it and nowhere else, which is also why none of it can be restored for you if you clear it." — `lib/db/client.ts` is an unimported stub whose only function throws. |
| " | *generated* | — | Both browser keys by name, with what each holds and whether a clear removes it. Rendered from `lib/wys/browser-keys.ts` by `components/BrowserKeyList.tsx`, so a third key would appear here without an edit (§7.5). |
| " | *link* | — | A link to the Data page, using the pinned link label. |
| new h2 "Technical infrastructure" | `minimal-trust` | BEN_APPROVED | WYS §18 **verbatim**, the `full` wording — not the shorter artboard wording the Data page renders. Both were already recorded on one record in Phase 1; this is the first surface to render the long one. |
| after "Children" | `legal-privacy-thirteen-plus` | AI_SYNTHESIS | "The course is designed so that a learner of thirteen or older could work through it safely, and the site does not ask anyone for an exact age or a date of birth to enforce that. Asking would mean collecting the sort of detail the course spends nine stops teaching people to hand over only when it changes the task." — WYS §4: "Do not collect exact age or date of birth just to enforce the design test." The preserved "not directed to children under 13" sentence is untouched above it. |

### `/cookies` — Cookie Notice

The denied-by-default claim and the retention paragraph are untouched; both are still exactly true.

| Where | Record | Provenance | Note |
|---|---|---|---|
| after "Analytics cookies" | `data-analytics-conditions`, `legal-aggregate-not-built` | AI_SYNTHESIS | The same two records `/privacy` renders. Same definition, no second wording. |
| new h2 "Browser storage that is not a cookie" | `legal-cookies-browser-storage` | AI_SYNTHESIS | "Two things this site keeps in your browser are not cookies at all. They are local storage entries: your browser holds them, they are not attached to any request, and no server ever sees them. They are named below with what each one holds and whether clearing the course removes it." |
| " | `localStorage` | BEN_APPROVED | As on `/privacy`. |
| " | *generated* | — | The same generated key list. |
| new h2 "Clearing this browser's data" | `data-clearing-footnote` | BEN_APPROVED | **The Data page's approved footnote, word for word, because it is the same record** — imported from `content/watch-your-step/data.ts` rather than retyped. §8b.2 asked for word-for-word identity; this is the only way it stays true. |
| " | `data-clearing-survives` | AI_SYNTHESIS | The Phase 8 amendment naming what survives a clear. Also the same record. |
| new h2 "Technical infrastructure" | `minimal-trust` | BEN_APPROVED | WYS §18 verbatim, as on `/privacy`. |

### `/ai-disclosure` — AI Disclosure

| Where | Record | Provenance | The sentence |
|---|---|---|---|
| after the corrected "Current site behavior" | `legal-current-site-behavior` | AI_SYNTHESIS | "Routing is still worked out in your browser by a fixed set of rules, and the pages are still built ahead of time rather than generated on request. What changed is that the course keeps its own state in your browser, so it can show you where you left off without a server knowing who you are." |
| new h2 "No AI while you use the site" | `zero-ai` | BEN_APPROVED | "No page on this site calls an AI model while you use it. There is no chatbot, no coach and no generated answer anywhere in the course: the coach that might exist one day is a disabled schema with no runtime call behind it, and the bundle this site ships to a browser contains no AI SDK and no chat SDK." — `lib/wys/coach-schema.ts` is types only (WYS §22, "Do not implement runtime calls yet"); WYS §28 forbids the SDKs. This is the long form of the disclosure strip's first two sentences. |
| after "AI-assisted work" | `ai-assisted-ben-approved` | BEN_APPROVED | "AI tools drafted copy, wrote code and did research for this site, as crew rather than as authors. Each system aboard is named in the Crew Manifest with what it was given access to and what it was not allowed to decide." Plus a link to `/crew`. |
| new h2 "What has been approved" | `ai-role-boundaries` | BEN_APPROVED | "A tool may draft, code or research; only a person can sign something into the record as a position. Which sections have been signed is a stored value rather than a sentence, so it can change without anyone editing this page, and the Ship's Log is where each change is written down." |
| " | *`disclosureApprovalLine()`* | state, not copy | **SC-1.** The approval sentence on this page is the disclosure strip's sentence because it is the *same function call*, in `lib/approval-state.ts`. Neither surface holds the literal. While `approvalState.stamp` is null both read "Nothing here is published as Ben's position until he stamps it." plus a Ship's Log link; the moment you stamp, both change to the approved artboard sentence and the link drops away, with no copy edit anywhere. |
| new h2 "How claims on this site are labelled" | `provenance` | AI_SYNTHESIS | "Every piece of writing on this site carries a record of where it came from, and two fields on that record decide what happens to it: one says how far along it is, the other says who produced it. Together they decide whether it may be shown at all, whether it must be shown with a line naming its author, and whether it may be presented as a person's position. Nothing that fails those checks is quietly published unlabelled; it is withheld, and the label says so in its place." |

### `/terms` — Terms of Use

Nothing corrected. Three additions, before "No professional advice".

| Record | Provenance | The sentence |
|---|---|---|
| `legal-terms-course` | AI_SYNTHESIS | "The site includes Watch Your Step, a finite course about judging what an AI actually needs to know. Its scenarios, documents and artifacts are invented for the course. They are practice material, not descriptions of anyone real and not advice about a situation you are actually in." |
| `legal-terms-non-goals` | BEN_APPROVED | WYS §3.5's non-goals, as the disclaimer they already are: "Watch Your Step is not professional privacy-law training, a legal or compliance guarantee, or a promise of de-identification. It is not a chatbot, a companion, a therapist or a confessional surface, and it keeps no privacy score, no literacy score and no streak." |
| `legal-rulebook-ownership` | BEN_APPROVED | WYS §16: "The rulebook a learner writes in the course belongs to that learner. It is stored locally only, editable, exportable as plain text or JSON, and deletable. It is never labelled as anyone else's doctrine, never sent to analytics, and never rewritten by AI." |

### `/copyright` — Copyright and permitted use

Nothing corrected. Two additions, before "Permitted use".

| Record | Provenance | The sentence |
|---|---|---|
| `legal-copyright-curriculum` | AI_SYNTHESIS | "Course text, invented scenarios, invented documents and the judgment material are owned by Ben Chan Tech LLC or their respective creators, on the same terms as the rest of the site. Recordings and photographs supplied by Ben remain his; none has been supplied yet, and every place one belongs is drawn as an empty labelled outline until it is." |
| `legal-rulebook-ownership` | BEN_APPROVED | The same record `/terms` renders. One definition, two presentations. |

### `/accessibility` — Accessibility Statement

Nothing corrected. **The preserved claim constrained the whole restyle and survived it**: `:focus-visible` kept its 3px outline and 3px offset through Phase 4 and only its colour moved, `.skip-link` is still the first focusable element in `app/layout.tsx`, and the reduced-motion block at the foot of `globals.css` is still paired with `scroll-behavior: smooth`.

| Record | Provenance | The sentence |
|---|---|---|
| `legal-accessibility-shipped` | AI_SYNTHESIS | "Focus is drawn as a three-pixel outline set three pixels clear of whatever has it, so it is visible on a control of any colour. The skip link is the first thing keyboard focus reaches on every page. Buttons, links in navigation and course controls are at least forty-four pixels tall. Smooth scrolling and every transition are switched off for anyone whose system asks for reduced motion." |
| `legal-accessibility-contrast` | AI_SYNTHESIS | **The Q23 deviation, published.** "Text contrast was measured rather than assumed, and two colour pairs in the approved design did not reach the usual 4.5-to-1 ratio for text at ordinary size. Small text on a tinted background therefore ships in a slightly deeper teal, which measures 5.47 to 1, and the label on a disabled button ships in grey rather than white, which measures 3.23 to 1 instead of 1.69. The full measured table is kept with the build notes and will be measured again before launch." |
| `legal-accessibility-media` | AI_SYNTHESIS | "No photograph, recording or screenshot has shipped on this site yet, so there is no transcript to publish. The place a recording will sit is drawn as a labelled outline that a screen reader announces, and the type behind an invented document cannot be filled in at all without a written alternative that preserves the decision the exercise is asking for without giving away the answer." |

---

## 3. What was deliberately NOT said

Four things §8b.2 asked for that the implementation cannot support, narrowed rather than written (R8, WYS §34 — fix the architecture, never the copy):

1. **"Transcripts alongside Ben audio."** No audio has been supplied and `public/` gained no files, so the page states the *rule* (a media slot cannot be filled without a text alternative; `accessibilityText` is a non-optional field) instead of claiming a transcript that does not exist.
2. **"Text alternatives for fictional artifacts."** `content/watch-your-step/artifacts.ts` ships an empty bank. Same treatment: the rule is stated, the shipped fact is not overstated.
3. **The aggregate-counter sentence.** WYS §18's own wording says "if the first-party aggregate endpoint is enabled". `/privacy` keeps that conditional and then says plainly that it is not built. The approved artboard sentence describing the counter is *absent from the DOM entirely* while the flag is false — it lives behind `aggregateCounterSentence()` in `content/watch-your-step/config.ts`.
4. **"Every published word was approved by Ben."** Nothing is stamped, so `/ai-disclosure` renders the truthful unstamped line from `lib/approval-state.ts`, exactly as the disclosure strip does. This is Q1, still open, still your call.

## 4. Forbidden-claims audit (§8b.3)

Swept over **every string variant of every canonical record on the site** and over every `.tsx`/`.ts` under `app/` and `components/` with comments stripped. Result: **zero**.

Phrases checked: no tracking · no data collection · zero trust · total privacy · 100% private · 100% anonymous · impossible re-identification · AI-proof · hallucination-proof · privacy guaranteed · "AI you can trust" · "the correct way to use AI" · "definitive system for safe AI" · "become AI literate" · expert-certified · most trustworthy · best-in-class governance.

Two sanctioned appearances, both asserted by test rather than allowed by convention:

- **"zero trust"** appears only inside the approved infrastructure paragraph's *denial* of it — "Not zero trust — the minimum trust required, and named." and WYS §18's "The point is not 'zero trust.'"
- **"AI you can trust"** appears only as the struck-through anti-feature pill on the home page (plan §2.1's one approved use), defined once in `content/watch-your-step/landing.ts` and rendered through `StruckPill`.

`tests/legal-claims.test.ts` runs both sweeps on every `npm test`.

## 5. What needs your decision

Everything in section 2 marked **AI_SYNTHESIS** is prose this build wrote. It renders labelled, it is on the Final-copy escalation list in `docs/facelift-unapproved.md`, and none of it is published as your position. The specific questions:

1. **Do provenance marks belong on legal pages at all?** They are there because the substrate treats a legal claim like every other claim. It is defensible and it is unusual. One-line change either way.
2. **The Q23 contrast deviation is now public** on `/accessibility`. If you would rather ship option (b) — raise those labels to ≥18.66px semibold — or option (c) — accept the AA miss and say so — the page copy changes with the token.
3. **The two added qualifiers** in section 1 — "server-side personalized user memory" on `/privacy`, and "server-side persistent user memory" on `/ai-disclosure` — are the only preserved words this phase altered. If you would rather the whole clause were rewritten, say so; it was narrowed on the principle that a true clause should not be deleted to fix a false one.
4. **Q1, the disclosure strip's fourth sentence**, now appears on `/ai-disclosure` too. Wording still open.
