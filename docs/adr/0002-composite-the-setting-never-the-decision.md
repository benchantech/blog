# 0002 — Composite the setting, never the decision

**Status:** ACCEPTED
**Decided:** 2026-09-08 (authorized by Ben in session; seventh blur approved same day)
**Stale when:** Ben withdraws compositing authorization, the cases stop being drawn from real
engagements, or a case narrative is rewritten such that its decision layer no longer matches
`YY_REDO_V1`'s source document.

---

## Context

The five cases are Ben's real professional history, published permanently on the open web on a page
whose FAQ is deliberately an SEO surface. Measured, the identifying surface was thinner than it
felt: **18 concrete spans across 17 narrative blocks**, no client names, no company names, no dates,
no dollar figures. Case 4 contained none at all.

But identification is combinatorial. *"Platform serving external clients, inherited decade-old PHP,
export feature, permission model, 55 columns of which 15 financially load-bearing, before I
joined"* is recognizable to anyone who worked there — and to the client.

Ben's own confidentiality rule (2026-09-07) already permitted it: cases "may be anonymized or
composited … while preserving the underlying decision pressure."

## Decision

The YY grammar has a seam, and compositing cuts there and nowhere else:

| Layer | Treatment |
|---|---|
| CAPTURE / NEXT CAPTURE narrative | **composite** |
| Choices A–D, Ben THEN, Ben NOW, conditions | **preserve exactly** |

**This keeps THEN/NOW true.** Ben really chose C; he really would now choose A because AI collapses
the cost of investigation. Those are facts about *his judgment*, not about a client, and they
survive compositing intact. The product's central claim is undamaged — which is the entire reason
for cutting here.

Seven substitutions are approved, span by span, in `content/developer-forward/yy/approved-blurs.ts`.

## Why the guarantee is a diff, not a provenance tag

The first attempt marked composited narrative `ben_authored_composite`. Ben's instruction was
"narrowly blur but maintain ben authored" — correct, because he reviewed each substitution
individually, so the text is his.

But Ben-authored cannot mean unchecked. So the guarantee became a **diff**: source + exactly the
seven approved substitutions must equal what ships. A seventh change anywhere fails.

That is strictly stronger than the tag it replaced. **A tag says "something changed." A diff says
"precisely this changed, and nothing else"** — and the first pass's real damage was not mislabelled
provenance. Every tag was correct while prose-tightening quietly deleted decision pressure.

## Three findings that shaped the rule

**Quantities cannot be protected by blurring narrative.** `24-48 hours` and `55 columns` appear
*verbatim in the preserved choices*. Blurring the story around them protected nothing and produced a
self-contradiction — narrative saying "roughly fifty" beside an option reading `(export 55
columns)`. All quantity blurring was abandoned.

**A blur must never increase precision.** Two proposals failed their own rule: `long before I took
it over` added a magnitude claim the source did not make, and `a sixth to a fifth` (16.7–20%)
*narrowed* a source range of `15–20%`.

**Never composite into more specificity than the source.** No new number, name, place or date. An
invented specific reads as more real than a vague one, and could accidentally describe a different
real client.

## Consequences

Cases 2 and 4 receive substitutions only where a name actually appears; 4 of 17 captures carry one.
Party words (`the client`, `my client`) are untouched — role words, not identifiers.

## Guard

`tests/developer-forward-yy-content.test.ts`, proven against injected faults:

| Injected | Result |
|---|---|
| Ben THEN marked composite | fails |
| One letter changed in a choice | fails |
| Unregistered "tidy" of a narrative | fails |
| Stale registry entry | fails |
| A registered blur that still ships unblurred | fails |
