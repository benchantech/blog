# 0009 — Renaming a product renames its URLs, not its evidence

**Status:** ACCEPTED
**Decided:** 2026-09-09
**Stale when:** the Studio destination moves off
`https://studio.com/benchanviolin/trust-forward`, or enough time has passed that no
browser plausibly still holds a ledger under the pre-rebrand storage key — at which
point the fallback in `lib/developer-forward/yy/records.ts` should be deleted.

---

## Context

Ben: *"we need a serious rebrand: change everything deeply from Trust Forward to Developer
Forward"*, then, unprompted: *"this includes urls and do not need to permalink old ones."*

A rename that touches 99 files and six directories is mostly mechanical. What is not mechanical is
deciding where the rename **stops**, because several of the strings carrying the old name are not
the product's name at all — they are addresses of things outside this repo, or handles on data a
learner already owns.

## Decision

**Renamed:** every route (`/trust-forward` → `/developer-forward`, `/trust-forward-lite` →
`/developer-forward-lite`, `/tf` → `/df`), every directory and file, every identifier
(`TRUST_FORWARD_*`, `trustForward*`, `TrustForward*`), every learner-facing sentence, both
localStorage keys, and all seventeen analytics events (`tf_*` → `df_*`).

**Not renamed, and each for a reason that is not sentiment:**

1. **`https://studio.com/benchanviolin/trust-forward`.** Studio owns that URL. Renaming it here
   would not rename it there; it would 404 the paid CTA on every screen that carries it.
2. **Handoff artifact filenames** — `TRUST_FORWARD_PROVENANCE.md`,
   `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md`, the layer folders, and
   `trust_forward_lite_729_profiles_SHIP_recalculated.csv`. These name real files on disk under
   `bct-facelift/`. A provenance record that cites a filename which does not exist is worse than
   one that cites an old name.

The sweep caught both of these classes automatically by protecting the literals before replacing
and restoring them afterward. It also caught two it should not have, which is the useful part of
this record: `tf_full_trust_forward_clicked` was left half-renamed to
`tf_full_developer_forward_clicked`, and the CSV fixture name was rewritten. **A half-renamed
identifier is worse than either end** — the first was resolved by renaming all seventeen events
rather than reverting one, the second by restoring the filename.

## No permalinks, and what that costs

The old URLs 404. That was explicit, and it is worth writing down that it was: `/trust-forward`
had been the canonical public node since layer 07's routes ruling, it is in the deployed sitemap,
and anything already linking to it breaks. The instruction was unambiguous and the cost is Ben's
to accept.

## The ledger is not renamed away

Both localStorage keys moved with the brand, which would have orphaned every run already in a
learner's browser. `readYYLedger` therefore falls back to `benchantech:trust-forward-lite:yy`
when nothing exists under the new key, and the next write lands under the new name.

This is not general politeness about user data. **The YY ledger's entire epistemic claim is that a
judgment committed before the reveal is never overwritten by anything that happens afterward.**
Dropping those records because the product changed its name would be that claim failing in the
most literal way available. The fallback is read-only, self-limiting — once a run has been written
under the new key the old one is never consulted again — and deleting it is this ADR's staleness
condition.

The SHIP-era `:state` key got no fallback: it is read by `LandingCompletion`, which
`docs/adr` already records as dead code under the YY runtime.

## The deletion contract had to be amended, and the amendment is a shape

`scripts/check-no-deletions.sh` forbids renames precisely because a rename breaks a URL. This
rebrand breaks URLs deliberately, so the gate had to be opened — but not by listing the seventy-six
paths, because a list is a place to hide an unrelated rename.

A rename now passes only if replacing `trust-forward` with `developer-forward` in the old path
yields the new path **exactly**. Anything else still fails: a file renamed for another reason, or a
rebrand rename that also moves a file to a different directory. Verified by renaming
`app/neon/page.tsx` and confirming the gate refused it.

## What this costs in analytics

Renaming `tf_*` to `df_*` splits the GA4 history: no report will span the rename, and any saved
report or exploration keyed to the old names stops returning data. That is a real cost with no
brand benefit — event names are not user-facing — and the alternative was keeping a prefix that
abbreviates a product that no longer exists next to a suffix that names the one that does. Reported
rather than absorbed.
