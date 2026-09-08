# 0007 — Concurrent agents own files exclusively

**Status:** ACCEPTED
**Decided:** 2026-09-08
**Stale when:** the harness provides real file locking or worktree isolation per agent.

---

## Context — the mistake

While a workflow's agents were mid-write, the orchestrator edited the same files twice:

- **An import cycle.** `copy.ts` and `surfaces.ts` were being written concurrently. The orchestrator
  "fixed" a duplicate-prose finding by making `surfaces.ts` import from `copy.ts` — while the agent
  was independently reversing that dependency. Result: a genuine cycle, `TS7022 implicitly has type
  'any' because it does not have a type annotation and is referenced directly or indirectly in its
  own initializer`, plus imports of symbols that no longer existed.
- **A stale patch.** A revert was written against a version of `surfaces.ts` that the agent replaced
  seconds later, so the patch landed at a stale offset.

Both cost more time than the findings they were chasing. The agents' final versions were correct;
the orchestrator's edits were the corruption.

A third, milder instance: a reviewer noted odd 8- and 6-space indentation inside a 2-space object
literal in `case-2.ts` — "exactly the trace a comment insertion leaves in surrounding code."

## Decision

**A file assigned to a running agent is owned by that agent until the workflow reports complete.**

1. The orchestrator does not edit an agent-owned file. Not to fix a lint, not to resolve a finding,
   not "quickly".
2. Findings against in-flight files are **queued**, not applied — reconcile after the workflow lands.
3. Workflow prompts state file ownership explicitly ("YOUR FILES: … Write ONLY your assigned
   files"), and that assignment is the ownership boundary.
4. Where genuinely concurrent mutation is required, use `isolation: 'worktree'` rather than
   coordinating by hope.

## Consequences

The orchestrator's useful work during a running workflow is: **read-only verification**, planning,
and editing files no agent owns. That is a real constraint and it is worth accepting — this session
lost more to racing agents than to any product decision.

## Guard / hook

Procedural; no mechanical check exists. **Recommended, unbuilt:** a `PreToolUse` hook on
`Write|Edit` that consults a lockfile written at workflow launch listing agent-owned paths, and
blocks with a message naming the owning agent. The harness already surfaces workflow state, so the
lockfile is the only missing piece.
