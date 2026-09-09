# Architecture Decision Records

**Format authority:** [YY Method™ v2.3](https://yymethod.com/work) — the professional
lineage this repository's decision practice follows. Case-level structure follows
[home.yymethod.com](https://home.yymethod.com), where a case is a container for ADRs and each ADR
carries its own freshness boundary.

## How to read these

Every ADR carries four fields that decide whether a future session should trust it:

| Field | Meaning |
|---|---|
| **Status** | `ACCEPTED` · `SUPERSEDED by NNNN` · `OPEN` (decision not yet made) · `REJECTED` (kept, not deleted) |
| **Decided** | ISO date. What was true when the decision was made. |
| **Stale when** | The condition that makes this ADR wrong. If it has happened, stop trusting the ADR and open a new one. This is the field that matters most to a future session. |
| **Supersedes / Superseded by** | Cross-references. A superseded ADR is never deleted — the registry audits itself by preserving what it stopped believing. |

A future session should read **Status** and **Stale when** before reading anything else. An ADR whose
staleness condition has been met is history, not guidance.

## Index

| # | Title | Status | Decided | Stale when |
|---|---|---|---|---|
| [0001](0001-yy-method-case-grammar-replaces-ship.md) | YY Method case grammar replaces SHIP scoring | ACCEPTED | 2026-09-08 | A ruling reinstates numeric scoring on Lite's required path |
| [0002](0002-composite-the-setting-never-the-decision.md) | Composite the setting, never the decision | ACCEPTED | 2026-09-08 | Ben withdraws compositing authorization, or the cases stop being real |
| [0003](0003-a-guard-that-can-skip-is-not-a-guard.md) | A guard that can skip is not a guard | ACCEPTED | 2026-09-08 | The suite gains a real CI runner with enforced skip reporting |
| [0004](0004-a-verifier-may-not-share-a-parser.md) | A verifier may not share a parser with what it verifies | ACCEPTED | 2026-09-08 | Content stops being derived from an external document |
| [0005](0005-claims-about-guards-must-be-executable.md) | A comment that names a guard must be executable | ACCEPTED | 2026-09-08 | Never — this one is expected to outlive the product |
| [0006](0006-scripted-edits-to-governed-content.md) | Scripted edits to governed content | ACCEPTED | 2026-09-08 | Structured (AST/codemod) editing replaces regex editing |
| [0007](0007-concurrent-agent-file-ownership.md) | Concurrent agents own files exclusively | ACCEPTED | 2026-09-08 | The harness gains real file locking |
| [0008](0008-adrs-are-read-on-boot.md) | ADRs are read on boot, by every agent | ACCEPTED | 2026-09-08 | The boot instruction stops naming `docs/adr/README.md` |
| [0009](0009-the-developer-forward-rebrand.md) | Renaming a product renames its URLs, not its evidence | ACCEPTED | 2026-09-09 | The Studio destination moves, or no browser still holds a pre-rebrand ledger |

## Origin

ADRs 0003–0008 were written after a single session (2026-09-07/08) in which the same class of
failure recurred: **a stated guarantee that nothing executed.** Each of those ADRs exists because a
specific mistake was made, is named in the ADR, and now has a mechanical check behind it. They are
deliberately about process rather than product, because the product decisions turned out to be the
easy half.

[0008](0008-adrs-are-read-on-boot.md) is the one that makes the rest matter: it puts reading this
register into the boot instruction that `AGENTS.md`, `/llms.txt` and `/author-ship/state.json` all
render from one definition, so Codex and Claude both receive it, plus a `SessionStart` hook for
agents that start work without reading `AGENTS.md`. An ADR nobody opens is indistinguishable from an
ADR never written.
