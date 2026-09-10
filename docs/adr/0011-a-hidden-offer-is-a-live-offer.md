# 0011 — A hidden offer is a live offer

**Status:** ACCEPTED
**Decided:** 2026-09-10
**Supersedes:** the coupon mechanism recorded in 0009's staleness note
**Stale when:** a paid Developer Forward destination exists again, at which point
the superseded offer records in `content/developer-forward/copy.ts` need a new
ruling before anything renders them — not an un-commenting.

---

## Context

The 2026-09-10 AI-native pivot discontinued the paid Developer Forward offering.
`content/ai-native-company.ts` and `content/developer-forward/current-status.ts`
became the current record, and `/developer-forward` was rewritten to say, in its
own words, that there is **"no checkout, coupon, waitlist, or upgrade path."**

One screen did not get the message. The Developer Forward Lite completion
screen — the last thing a learner sees after committing seventeen judgments —
still read:

> **You earned your coupon.**
> It applies to Developer Forward on Studio. The link is yours — no account,
> nothing to sign up for.
> **Open your coupon →**

The link had been repointed from Studio to `/developer-forward`. So a learner
finished five cases, was told they had earned something, clicked, and landed on
a page telling them it did not exist.

## What the previous fix did

It hid it:

```tsx
<style>{`#developer-forward-lite-standalone [class*="coupon"] { display: none !important; }`}</style>
```

and a test was written to **require** that rule, alongside a stamp key
`couponTarget: "/developer-forward"` — encoding the offer as
present-but-invisible.

## Decision

**An offer that ships and is hidden is a live offer.** It is in the bundle, in
the DOM, in view-source, and one CSS regression away from the screen. Removing
the offer is the fix; hiding it is a description of the problem.

This repository already believed that. `tests/developer-forward-yy-reveal.test.ts`
asserts it for `RevealPanel` in almost these words — *"a rendered-then-hidden
panel is still in the served HTML and still readable from the inspector or the
accessibility tree. Hiding is not gating."* The same file, four tests apart,
required the opposite for the coupon.

So: the coupon block is gone at the source, `couponTarget` is deleted from
`ROUTES`, the hiding rule is deleted, and the completion screen closes on what
is actually true — the learner's record is theirs, Developer Forward continues
as an evidence surface, and `noUpgradeStatement` says there is no upgrade.
Verified in the built bundle: zero occurrences of "coupon" on the Lite route.

## Three things that made this hard to see, and what changed about each

**1. The hiding selector matched by substring.** `[class*="coupon"]` would have
hidden the honest replacement too, including the no-upgrade disclosure under it.
A fix that suppresses by name suppresses whatever is named next. The completion
block's classes are now `close*`, which describe what it is.

**2. The guard checked route files, not surfaces.**
`app/developer-forward-lite/page.tsx` is four lines that mount `<YYSandbox>`.
Every no-coupon assertion read that file and the Developer Forward page file,
and the offer lived in the sandbox. Every one of them passed the whole time.
**A route file is not a surface.** The scan now walks every component under
`app/` and `components/`.

**3. Superseded offer records sit one import away from a screen.** `FULL_OFFER`,
`LANDING_INCOMPLETE`, `LANDING_COMPLETE`, `TRUST_STRIP` and
`DEVELOPER_FORWARD_TEASER` all still describe a paid 90-day curriculum with a
Studio destination. They are preserved — the deletion contract keeps them, and
they are the evidence of what was offered and when — but the coupon block was
the last one still wired, and it took a day to notice. They are now banned from
every surface by test, with a banner in `copy.ts` saying so.

## What was NOT done

The records were not deleted. A discontinued offer is a fact about the company's
history and `tests/developer-forward-content.test.ts` still walks them for
forbidden public claims, so they cannot rot while they sit there. The rule is
about **rendering**, not existence.

## The pattern this is the third instance of

- 0003: a guard that can skip is not a guard.
- 0005: a claim about a guard must be executable.
- 0011: a guard that names a **location** — a file, a route, a class — stops
  guarding the moment its subject moves. Four tests in the same session failed
  for this reason while the thing they protected was intact, and this one passed
  while the thing it protected was broken. Assert the property.
