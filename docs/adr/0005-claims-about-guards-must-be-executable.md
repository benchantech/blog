# 0005 — A comment that names a guard must be executable

**Status:** ACCEPTED
**Decided:** 2026-09-08
**Stale when:** never expected. This one should outlive the product.

---

## Context — the mistake

`docs/trust-forward-compositing-policy.md` stated that two tests enforced the compositing seam.
`lib/trust-forward/yy/types.ts` named the file:

> "`tests/trust-forward-yy-content.test.ts` fails the build if a choice, a THEN, a NOW or a
> condition is ever marked composite."

All five case files repeated the claim.

**The file did not exist.** Six documents asserted a guard that had never been written.
`DECISION_LAYER_PROVENANCES` was exported with zero call sites. The seam was correct by hand,
unguarded, and *documented as guarded* — which is worse than undocumented, because it stops anyone
looking.

Adjacent instances the same session:

- The seven new YY modules were **imported by nothing** — orphaned from the build and from
  `npm test` entirely.
- A case file's header claimed "no block in this case contains a named technology." False of the
  source; true only of the shipped text *because a paragraph had been silently dropped* (see
  [0004](0004-a-verifier-may-not-share-a-parser.md)). The comment was accidentally describing a bug.
- A registry entry named `content/trust-forward/yy/types.ts`, which lives in `lib/`, not `content/`.

## Decision

**A comment that names a guard is a claim, and claims are checked.**

1. Every test file cited by name in a comment **must exist**.
2. A module claiming to be governed elsewhere must be **actually referenced** by the file it names.
   `tests/trust-forward-content.test.ts` now enforces this for the YY subtree — it caught
   `evidence-tags.ts` claiming coverage that did not exist, which is how that module got real tests.
3. A registry entry naming a file that does not exist **fails**.
4. Prefer a comment that states the *mechanism* over one that states the *outcome*. "Fails the
   build" was false off Ben's machine; "the fixture check runs unconditionally" is verifiable.

## Guard / hook

- Delegation check: live, in `tests/trust-forward-content.test.ts`.
- Registry-file existence: live (it caught the `types.ts` mistake within a minute).
- **Recommended hook, not yet installed:** a repo-wide test that greps `app/`, `lib/`, `content/`,
  `components/`, `docs/` and `tests/` for `tests/[a-z0-9-]+\.test\.ts` and asserts each named file
  exists. That single check would have caught this class immediately and costs ~15 lines.
