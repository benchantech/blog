# 0001 — YY Method case grammar replaces SHIP scoring

**Status:** ACCEPTED
**Decided:** 2026-09-08
**Supersedes:** the SHIP architecture shipped in commits `47a0cb9` and `fe04361`
**Stale when:** a Ben ruling reinstates numeric scoring on Trust Forward Lite's required path, or
the YY Method doctrine at <https://yymethod.com/work> supersedes v2.3 in a way that changes the five
stages.

---

## Context

Trust Forward Lite originally scored five fictional cases through six ternary dimensions into a
four-bit SHIP code: a 729-state lattice, 465 of them reachable, 138 recovered signal tags, 33
options. It was built, verified against its own source tables, and committed.

The `YY_REDO_V1` rewrite (2026-09-08) replaced it. The cases became **Ben's real professional
history**, and the addendum removed SHIP from the required path explicitly — along with the six
dimensions, the 0/.5/1 lattice, the 729-state model, and the 33-option instrument — while forbidding
"inventing replacement numeric weights."

## Decision

Trust Forward Lite implements the **YY Method™** literally, not by reference:

> **CAPTURE → WHY → WHY-NOT → COMMIT → TIMESTAMP**

as the shape of every checkpoint, the stored record, the export, and the tests. Not reduced to
`question` / `answer` / `feedback`.

Scoring is replaced by **evidence**, in two layers:

- a **receipt** per committed choice — *situation → observable choice/action, nothing else*;
- a **resonance** only where **two independent checkpoints** carry the same observable pattern.

> One point is evidence. Two independent points can become a pattern.
> One tuning fork sounds; two tuning forks resonate.

Replay never creates independence: the same checkpoint answered twice is one fork struck twice.

## Why

A score answers a question the product should not answer. "How close are you to Ben?" makes Ben an
answer key, and the addendum is explicit that neither Ben THEN nor Ben NOW is one. Evidence a
learner can audit back to two specific checkpoints is a different claim, and a defensible one.

**THEN and NOW never merge.** Their *difference* is the evidence — judgment legitimately changes
when tools, economics, experience or responsibility change. Merging them would delete the finding.

## Consequences

- ~200 tests and half the domain layer (`scoring`, `aggregation`, `signals`, `narrative`,
  `profiles`, the variant system) become unused. They are **archived in place, never deleted** — the
  repo's deletion contract forbids removal, and the addendum permits archiving.
- The provenance vocabulary widened: `YYProvenance` has five values, finer than `ContentOrigin`,
  because "recovered prior authoring" and "written during implementation" must not collapse.
- A tag carried by only one checkpoint can never resonate. That is **signal about the instrument,
  not a defect** — and specifically, it must never be fixed by merging tags until something lights
  up. `tests/trust-forward-yy-content.test.ts` pins the single-checkpoint set so a change is visible.

## Guard

`tests/trust-forward-yy-content.test.ts` — 15 tests: five cases, seventeen checkpoints, 68 choices,
both Ben judgments each; the resonance threshold; and the declared single-checkpoint tag set.
