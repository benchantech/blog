# 0006 — Scripted edits to governed content

**Status:** ACCEPTED
**Decided:** 2026-09-08
**Stale when:** structured editing (AST codemod) replaces regex editing for content modules.

---

## Context — the mistakes

Three separate corruptions in one session, all from scripted regex edits to TypeScript content:

1. **An over-greedy `[^;]*;`** matched to a semicolon *inside a string literal*, leaving
   `export const TODO_... = null; none may be written here.";` — a syntax error that took the whole
   test file down.
2. **A comment rewrite consumed the closing `*/`**, swallowing `const CASE_ID = "case-2";` into the
   comment. Six `Cannot find name 'CASE_ID'` errors.
3. **A replace ran against wrapped string literals** and silently matched nothing — the span was
   split across `"..." + "..."`, so `PHP` and `SaaS` reported "done" while both were untouched. The
   verification that followed used the same naive extractor and agreed. (See
   [0004](0004-a-verifier-may-not-share-a-parser.md).)

Each was caught, but only because `tsc` ran immediately afterwards. Two of the three produced no
test failure at all — they produced *parse* failures, which look nothing like the thing you were
checking for.

## Decision

**A scripted edit to `content/` or `lib/` is not complete until `npx tsc --noEmit` has run.** Not at
the end of the batch — immediately, before the next edit.

And:

1. **Anchor on structure, not on punctuation.** Match a declaration or a full block; never `[^;]*;`
   or `.*` across a literal.
2. **Assert the match count.** A replace that changes 0 occurrences must fail loudly, not report
   success. Every scripted edit in this session that silently no-opped was a replace that assumed
   it had matched.
3. **Decode before substituting.** Content strings are line-wrapped across concatenated literals;
   a substring may not exist contiguously in the file even though it exists in the value. Decode
   the literal, substitute in the value, re-emit.
4. **Never edit a file another agent is writing.** See [0007](0007-concurrent-agent-file-ownership.md).

## Guard / hook

**Recommended hook, not yet installed** — a `PostToolUse` hook in `.claude/settings.json` matching
`Write|Edit` on `content/**` and `lib/**` that runs `npx tsc --noEmit` and surfaces failures
immediately. This is the highest-value unbuilt guard in this list: it converts a class of silent
corruption into an instant, unmissable error, and all three mistakes above would have been caught at
the moment they happened rather than several steps later.
