# 0003 — A guard that can skip is not a guard

**Status:** ACCEPTED
**Decided:** 2026-09-08
**Stale when:** the repo gains a CI runner that fails the build on any skipped test, at which point
this ADR's fixture requirement can relax to "source comparison only".

---

## Context — the mistake

`tests/trust-forward-yy-content.test.ts` compares shipped case text against a canonical source
document living at an **absolute path outside the repo**. When the file is missing, the checks call
`t.skip`.

A review repointed that path. The result:

```
ℹ pass 7   ℹ fail 0   ℹ skipped 4      ← green
```

Green, with the guarantee entirely absent. Meanwhile five case files stated flatly that an
unapproved change *"fails the build."* **On any machine but Ben's, it did not.**

This is the same class as commit `39f9803` ("checks that were green while what they guarded was
false") — one step worse, because an absent check cannot even go red.

## Decision

**Any guard whose evidence can be missing must have a second form that always runs.**

Concretely: `content/trust-forward/yy/text-fixture.json` holds the SHA-256 of all 133 learner-facing
strings, generated while the source *was* present and full verification passed. It needs no external
file.

The two claims are deliberately different strengths:

- **Source comparison** — "this matches Ben's document." Strongest; requires the document.
- **Fixture comparison** — "this has not drifted since it was verified." Weaker; always runs.

There is now **no configuration in which nothing checks the text.**

Verified: with the source absent *and* the text tampered, the fixture catches it.

## Corollary — never write a skip that reads as a pass

A `t.skip` must say what was **not** verified, in its message. A skipped guard is a hole; the log
should name the hole.

## Guard / hook

- The fixture test is unconditional and asserts coverage in both directions — unknown text fails,
  and an orphaned fixture entry fails (a fixture row with nothing to check is a check that quietly
  stopped running).
- **Recommended hook, not yet installed:** `.githooks/pre-commit` currently runs only
  `scripts/check-secrets.sh`. It should also run `npm test` and fail on `skipped > 0` unless the
  skip is explicitly allow-listed. `npm run build` does not run tests at all, so the commit hook is
  the only place this can be enforced today.
