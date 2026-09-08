# 0004 — A verifier may not share a parser with what it verifies

**Status:** ACCEPTED
**Decided:** 2026-09-08
**Stale when:** content stops being derived from an external document — if the source ever lives in
the repo as structured data, extraction and verification collapse into one step and this ADR retires.

---

## Context — the mistake

Case narratives were extracted from a markdown source with:

```
/(?:### CAPTURE[^\n]*|## NEXT CAPTURE[^\n]*)\n\n> (.+)/
```

Ben's source separates paragraphs *inside* a blockquote with a bare `>` — no trailing space. The
pattern required `"> "`, so it stopped at that line.

**Case 2's checkpoint 4 shipped 43 words instead of 120.** The lost paragraph carried the packages
approaching end-of-life and *"I needed to bring options back to the client, including my
recommendation"* — decision pressure, gone.

It survived every check because **the extraction that built the content and the verification that
approved it used the same regex.** They agreed with each other while both were wrong. Three separate
verification passes reported the narratives correct.

A second instance, same day: a diff comparing only narrative blocks led to the conclusion "the
compositing deleted decision pressure." It had not — the clauses were intact in the *decision*
layer, which the diff never read. A conclusion was reported that the evidence did not support.

## Decision

**A verifier must reach its evidence by a different path than the thing it verifies.**

In practice, one of:

1. **Different parser** — the verifier reads the raw artifact, not the extractor's output.
2. **Different artifact** — compare against a committed fixture (see [0003](0003-a-guard-that-can-skip-is-not-a-guard.md)).
3. **Different property** — check an invariant the extractor cannot satisfy by accident: word
   counts, structural counts, round-trip identity.

And: **a check must read every layer its conclusion covers.** A diff over narrative cannot support a
claim about decisions.

## Consequences

- `collectSourceNarratives` in the YY guard now parses the raw blockquote, including bare-`>`
  continuation lines, and carries a comment explaining why.
- A dedicated **truncation guard** exists, separate from the equality check that already implies it
  — because a dropped paragraph reads as perfectly good prose, and deserves a failure message that
  says so by name.
- The fixture (0003) is a second artifact by construction.

## Guard

`tests/trust-forward-yy-content.test.ts` — "no narrative is truncated relative to its source block",
plus the fixture's word-level coverage assertions in both directions.
