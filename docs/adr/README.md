# Architecture Decision Records

**Format authority:** [YY Method™ v2.3](https://yymethod.com/work) — the professional lineage this repository's decision practice follows. Case-level structure follows [home.yymethod.com](https://home.yymethod.com), where a case is a container for ADRs and each ADR carries its own freshness boundary.

## How to read these

Every ADR carries four fields that decide whether a future session should trust it:

| Field | Meaning |
|---|---|
| **Status** | `ACCEPTED` · `SUPERSEDED by NNNN` · `OPEN` · `REJECTED` |
| **Decided** | ISO date. What was true when the decision was made. |
| **Stale when** | The condition that makes this ADR wrong. If it has happened, stop trusting the ADR and open a new one. |
| **Supersedes / Superseded by** | Cross-references. A superseded ADR is never deleted. |

Read **Status** and **Stale when** before relying on any ADR. An ADR whose staleness condition has been met is history, not guidance.

## Index

| # | Title | Status | Decided | Stale when |
|---|---|---|---|---|
| [0001](0001-yy-method-case-grammar-replaces-ship.md) | YY Method case grammar replaces SHIP scoring | ACCEPTED | 2026-09-08 | A ruling reinstates numeric scoring on Lite's required path |
| [0002](0002-composite-the-setting-never-the-decision.md) | Composite the setting, never the decision | ACCEPTED | 2026-09-08 | Ben withdraws compositing authorization, or the cases stop being real |
| [0003](0003-a-guard-that-can-skip-is-not-a-guard.md) | A guard that can skip is not a guard | ACCEPTED | 2026-09-08 | The suite gains a real CI runner with enforced skip reporting |
| [0004](0004-a-verifier-may-not-share-a-parser.md) | A verifier may not share a parser with what it verifies | ACCEPTED | 2026-09-08 | Content stops being derived from an external document |
| [0005](0005-claims-about-guards-must-be-executable.md) | A comment that names a guard must be executable | ACCEPTED | 2026-09-08 | Never — expected to outlive the product |
| [0006](0006-scripted-edits-to-governed-content.md) | Scripted edits to governed content | ACCEPTED | 2026-09-08 | Structured editing replaces regex editing |
| [0007](0007-concurrent-agent-file-ownership.md) | Concurrent agents own files exclusively | ACCEPTED | 2026-09-08 | The harness gains real file locking |
| [0008](0008-adrs-are-read-on-boot.md) | ADRs are read on boot, by every agent | ACCEPTED | 2026-09-08 | The boot instruction stops naming `docs/adr/README.md` |
| [0009](0009-the-developer-forward-rebrand.md) | Renaming a product renames its URLs, not its evidence | ACCEPTED | 2026-09-09 | The Studio destination moves, or the pre-rebrand fallback can retire |
| [0010](0010-ai-native-company-20-dollar-constraint.md) | The company runs inside the $20 AI operating constraint | ACCEPTED | 2026-09-10 | The $20 rule changes, a new full Developer Forward destination is selected, or the active paid offer returns |

## Current reading rule

ADR 0010 supersedes the **active-offer and homepage/product-entry assumptions** carried by earlier Developer Forward decisions. It does not erase their historical evidence, case grammar, compositing, verification, or provenance rules.

The current company mission and operating constraint are also stated in `company/CONSTITUTION.md` and `company/CURRENT_STATE.md`; agents read those before interpreting older product-specific records.
