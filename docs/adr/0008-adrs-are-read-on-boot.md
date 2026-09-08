# 0008 — ADRs are read on boot, by every agent

**Status:** ACCEPTED
**Decided:** 2026-09-08
**Stale when:** the boot instruction in `content/ship/agent-bootstrap.ts` stops naming
`docs/adr/README.md`, or a harness arrives that loads decision records natively.

---

## Context

Seven ADRs were written in one session because the same class of failure recurred: **a stated
guarantee that nothing executed.** Writing them changes nothing on its own. Agents boot into this
repository, act, and leave; a decision made in one session is invisible to the next unless the boot
path names it.

**An ADR nobody opens is indistinguishable from an ADR never written** — which is precisely the
failure [0005](0005-claims-about-guards-must-be-executable.md) is about, applied one level up.

## Decision

Reading the ADRs is part of the boot instruction, in three places, from **one definition**.

**1. `content/ship/agent-bootstrap.ts`** gains a fifth sentence:

> Read `docs/adr/README.md` and every ADR whose Status is ACCEPTED; check each one's Stale-when
> condition before relying on it.

That module already renders into `AGENTS.md`, `/llms.txt` and `/author-ship/state.json`, and
`tests/machine-surfaces.test.ts` fails if any of them drifts. **Codex reads `AGENTS.md`**, so
adding the sentence to the module covers Codex, Claude, and any agent reading the machine surfaces
— without a second copy anywhere.

**2. A `SessionStart` hook** (`.claude/settings.json` → `scripts/adr-boot.sh`) prints the register
at the start of every Claude Code session: title, Status, Decided, Stale-when. It covers the case
`AGENTS.md` cannot — an agent that starts work without reading it.

**3. A `PostToolUse` hook** (`scripts/adr-typecheck-guard.sh`) runs `tsc` after any write to
`content/`, `lib/` or `tests/`, enforcing [0006](0006-scripted-edits-to-governed-content.md).

## Why Status and Stale-when, and not the whole ADR

An agent that follows stale guidance confidently is worse than one that follows none. The boot
surface prints the two fields that decide whether an ADR is *guidance* or *history*; the body is
read on demand. This is the fourth bootstrap sentence — "do not reconstruct superseded decisions
from older material" — applied to the repo's own records.

## A drift this caught immediately

`historicalSnapshotInstruction()` returned `agentBootstrap.lines[3]` — a positional reference to the
last sentence. Inserting the ADR sentence before it silently repointed it at the wrong line. It now
indexes from the end, and `tests/machine-surfaces.test.ts` asserts it. A four-line change to a
constant array, and a positional index made it a content bug.

## Consequences

- The bootstrap is five sentences. Four are the packet's, verbatim; **the fifth is this repo's own**
  and is marked as such in the module, because packet-derived material and repo-authored material
  must not blur (`origin: "EXTERNAL_SOURCE"` covers the first four).
- The hooks report and never block. A hook that blocks a mid-refactor typecheck gets disabled within
  a day; being unmissable is enough.

## Guard

- `tests/machine-surfaces.test.ts` — `AGENTS.md` must contain the module's text verbatim, and the
  boot text must still name `docs/adr/README.md`.
- `tests/adr-register.test.ts` — every ADR file is indexed, every index row has a file, and every
  ADR carries all four required fields.
