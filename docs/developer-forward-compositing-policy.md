# Developer Forward Lite — case compositing policy

**Authorized by:** Ben Chan, 2026-09-08, in session.
**Scope:** the five YY Method cases in `YY_REDO_V1`.
**Status:** governing. This is the record that makes compositing legitimate rather than a violation.

---

## Why this record exists

`TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md` §29 forbids Codex from
inventing Ben historical facts or creating alternate histories. Compositing a
case walks up to that line. What makes it lawful is not inference — it is an
explicit authorization from Ben, recorded where a reader can find it.

The authorization, in Ben's words:

> "only the pieces that name something concrete, otherwise the logic must stay
> intact especially the decision flow and reasoning so the user actually gets
> that benefit entirely while clients cannot identify the cases i put in there"

It is consistent with the confidentiality rule already approved on 2026-09-07:

> "Cases may be anonymized or composited where necessary to protect clients,
> employers, colleagues, confidential information, or identifying details while
> preserving the underlying decision pressure."

And with the provenance model, which already defines `BEN AUTHORED` as covering
"lived/**composite** facts supplied by Ben." Compositing is a declared category,
not a workaround.

---

## The seam

The YY grammar separates cleanly, and the whole policy is this table:

| Layer | Identifying? | Treatment |
|---|---|---|
| CAPTURE / NEXT CAPTURE narrative | yes — setting, tech, org shape | **composite** |
| Choices A–D | no — action logic | **preserve exactly** |
| Ben THEN + its reasoning | no — a fact about Ben's judgment | **preserve exactly** |
| Ben NOW + its reasoning | no — a fact about Ben's judgment | **preserve exactly** |
| Conditions around alternatives | no — conditional reasoning | **preserve exactly** |
| REFLECT prompt | no | **preserve exactly** |

**This keeps THEN/NOW true.** Ben really chose C; Ben really would now choose A
because AI collapses the cost of investigation. Those are facts about his
judgment, not about a client, and they survive compositing intact. The product's
epistemic claim is undamaged — which is the entire point of cutting here and
nowhere else.

---

## What counts as "naming something concrete"

Measured across the 17 narrative blocks: **18 spans**, in five classes. Case 4
contains none and is composited not at all.

| Class | Instances | Rule |
|---|---|---|
| Named technology (`PHP`, `React`) | 2 | Replace with a capability description. "an older server-side language", "a modern front-end framework". The DECISION never depends on which language it was; it depends on the system being old, inherited and load-bearing. |
| Industry / vertical (`SaaS`) | 1 | Generalize only where it narrows the field. A platform serving external clients is the load-bearing fact. |
| Datable / org-position markers (`a decade ago`, `before I joined`) | 2 | Replace with relative framing — "long before I took it over". Removes the timeline fingerprint, keeps "inherited, not built by me", which is what makes the risk real. |
| Concrete quantities (`24-48 hours`, `55 columns`, `10%`, `20%`) | 5 | **Preserve the magnitude and the ratio; blur the literal figure.** "roughly fifty columns, a bit over a quarter of them financially load-bearing" carries the same decision pressure as "55 of which 15" without being a fingerprint. |
| Party references (`the client`, `my client`, `external client`) | 8 | **Leave alone.** These are role words, not identifiers. Replacing them buys no protection and costs readability. |

So ~10 spans actually change. Eight stay.

---

## Two hard constraints on the compositing itself

**1. Never composite into MORE specificity than the original.** Invented precise
detail reads as more real than vague detail, and a newly invented specific could
accidentally describe some *other* real client. A composited span may be as
specific as its source, never more, and no new number, name, place or date may
be introduced.

**2. Decision pressure is preserved or the composite is wrong.** "55 columns of
which 15 were financially load-bearing" is doing teaching work: it is what makes
the permission problem concrete instead of abstract. A composite that smooths it
to "many columns, some sensitive" has removed the case. Composite *which
company*; keep *the shape of the problem*.

---

## How it is enforced

- Per-field provenance: narrative carries `ben_authored_composite`, decision
  logic carries `ben_authored`. The distinction is data, not a claim in a
  comment.
- A test asserts **no checkpoint's choices, Ben THEN, Ben NOW, or conditions are
  ever marked composite** — if the decision layer is ever composited, the build
  fails.
- A test asserts every composited narrative still resolves to a checkpoint whose
  decision layer is byte-identical to the source document.
- The five classes above are the complete list. A span outside them is not
  composited without a new authorization.
