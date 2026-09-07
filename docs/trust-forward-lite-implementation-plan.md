# Trust Forward Lite — End-to-End Implementation Plan

**Target branch:** the current branch (`main`). The facelift build ran on `bct-facelift-assimilation`; this work is specified against `main` as it stands at `ce8f84c`.
**Status of this document:** an implementation plan. It is not Ben doctrine, it stamps nothing, and it authors no learner-facing copy.
**Revision:** 7 — layer 08 (`..._LITE_GATES_RESOLVED_2026-09-07`) closes Q-D, Q-E and SC-TF6's URL authority, adopting revision 6's recommendations verbatim, and repairs the packaging defect revision 6 reported. **One correction is raised against it: its 41-reachable-variant launch target is stale and must be 43** (§3 GAP-10(ii)). Revision 6's note follows: layer 07 (`..._TRANSITIONS_COPY_RESOLVED_2026-09-07`) resolves **every** remaining Lite gate: SC-TF4/5/7/8, Q-A, Q-B and Q-C, plus the variant transition rules and Case 5 callbacks. Two new implementation findings are recorded against it (§3 GAP-10, §8.1). Revision 5's note follows: merges the handoff's own REV4 (which resolves SC-TF2/SC-TF3) and the new layers 05–06 (SHIP-16 reachability proof; Ben's SC-TF1 approval; the complete five-case source) into revision 4 of this document. The handoff's REV4 branched from REV3 and therefore does **not** contain revision 4's corrections; they are preserved here. Revision 4's own note follows, still accurate: adopts the handoff's REV3 in full, then applies four corrections found by re-checking REV3 against the source layers and the live repository: the R6/R7/R8 dependency is *not* dangling (§1.1 A5), the WYS-retirement requirement is *not* merely conditional (§5.3), the recovered 729 table has a headline-cardinality trap REV3 does not flag (§3 GAP-6), and REV3's removal of the origin mapping is restored in corrected form (§4.1).
**Execution rule:** source layers 01→02→03 remain product authority; this plan is implementation guidance only and may not silently promote recovered/draft material into Ben doctrine.
**Governing thesis, inherited from `docs/bct-facelift-assimilation-plan.md`:** order the build by irreversibility, not by visibility. The stamp, the ledger, the pointer engine and the telemetry allowlist are green before the first renderable case screen exists.

---

## 1. Sources

The current source authority is the consolidated handoff root that contains layers `01/`, `02/`, and `03/`. In this final ZIP, layer `04_reviewed-implementation-plan-2026-09-07/` adds reviewed implementation guidance and recovered verification evidence; it does not supersede product/content authority in layers 01–03.

| # | Path (within the handoff) | Role |
|---|---|---|
| 1 | `01_trust-forward-lite-codex-package/` | The Sep 6 base Lite package. 21 files. |
| 2 | `02_trust-forward-read-last-supersession-2026-09-06/` | The read-last supersession pack. Wins on conflict for *current behaviour*. |
| 3 | `03_codex-completion-handoff-2026-09-07/` | The audit / recovery layer. Escalations, recovered prior authoring, drafts, verification. |
| 4 | `04_reviewed-implementation-plan-2026-09-07/` | Plan review, recovered 729 narrative profiles, verification. Historical guidance where 05–06 resolve a conflict. |
| 5 | `05_ship16-reachability-resolution-2026-09-07/` | **Binding** resolution of SC-TF2/SC-TF3: dominant-posture aggregation plus an exhaustive 16/16 SHIP reachability proof. Supersedes every earlier candidate rule. |
| 6 | `06_full-five-case-authoring-extraction-2026-09-07/` | Ben's explicit SC-TF1 approval record, and the complete contiguous five-case prior-authoring source. |
| 7 | `07_transition-copy-import-telemetry-resolution-2026-09-07/` | **Ben-approved rulings, 2026-09-07.** Variant transitions, Case 5 callbacks, reflections, receipts, public copy, routes, WYS, telemetry, Lite→Full import, production version. |
| 8 | `08_final-lite-gates-resolution-2026-09-07/` | **Ben-approved rulings closing Q-D, Q-E and SC-TF6's URL authority.** Also repairs the stale root verifier. |

**Layer 07 was edited in place by the layer-08 handoff** — `variant-transition-rules.BEN_APPROVED.json` gained the Case 3 fallback and `routes-telemetry-wys.BEN_APPROVED.json` gained the four aggregate-scope keys. Both edits are correct and additive, and layer 08 restates them independently, so nothing is lost. But a `BEN_APPROVED` artifact that changes between handoffs is no longer a fixed provenance anchor: pin approved rulings by **content digest** in the stamp (§6.1 already does this) rather than by filename, and prefer superseding to editing. Worth one line back to the handoff author.

The newest folder also carries `CURRENT_IMPLEMENTATION_STATUS_2026-09-07.md`, which is the status overlay to read first.

**Integrity, checked not assumed.** The original `PACKAGE_INVENTORY_SHA256.json` remains the immutable integrity manifest for the 41 source files it lists (it intentionally excludes itself). The final ZIP adds layer 04 and a new root `FINAL_PACKAGE_INVENTORY_SHA256.json`. Do not rewrite the original manifest.

Both were executed rather than trusted. The current folder's manifest verifies clean at **80 entries — zero missing, zero mismatched** — and layers `01/`–`06/` are byte-identical to the previous handoff, so each folder adds a layer rather than revising source authority.

The verifier defect reported at revision 6 — `verify_final_package.py` crashing on the reshaped manifest — **is fixed in layer 08** and the bundled script now passes on its own package (86 files), matching an independent recomputation here.

Earlier folders: 67 files (previous), 53, 41 — all clean — so each new folder adds layers rather than revising source authority. The layer-06 verbatim source additionally carries its own `.sha256` sidecar, which matches. Layer 04's `trust-forward-lite-plan.REV2.original.md` is byte-identical to this document's own revision 2, confirming the audit reviewed the real prior text rather than a paraphrase of it.

### 1.1 Authority order

**A1 — Layer 03 beats layer 01 on implementation approach.** It is the newer artifact and it is explicitly an audit of the earlier package.
**A2 — Layer 02 beats layer 01 on current behaviour**, within its own stated scope.
**A3 — Product/content decisions in layer 01 remain locked.**
**A4 — The repository's shipped governance mechanisms beat all three packages on *how* content reaches a screen.** Layer 03's `repo_constraints/CURRENT_REPO_CONSTRAINTS.md` agrees, naming five of the nine mechanisms in §4 unprompted.
**A5 — The assimilation-plan dependency is live-repo, and it has been verified there.** REV3 correctly noted that `docs/bct-facelift-assimilation-plan.md` is not part of the handoff ZIP and told Codex to treat R6/R7/R8 as live-repository constraints "only if Codex finds and verifies them". **That check has now been run: the document exists in the target repository at `docs/bct-facelift-assimilation-plan.md` (1,796 lines), and §2 of it defines R1–R8 as stated.** The rules are therefore in force for this build, not undefined:

- **R6** — the user's constraints override every source.
- **R7** — where a source implies replacing or dropping an existing surface, ADD the new and KEEP the old, and state how both coexist in navigation.
- **R8** — a false public claim is fixed in architecture, never in copy.

R7 is the one that bites, and it is why §5.3 stays an open question rather than taking a default in either direction.

### 1.2 What layer 02 changes for Lite — three rules, restated by layer 03

`READ_ORDER_AND_AUTHORITY.md` narrows the supersession scope explicitly, which resolves an ambiguity in revision 1 of this plan:

1. **Corpus count.** Layer 02 set the current corpus at 42. **Layer 07 supersedes this for learner-facing copy:** the public Full bridge is *"30+ real cases drawn from Ben Chan's actual professional experience"*, with the note that cases may be anonymized or composited to protect clients, employers, colleagues and confidential details while preserving the decision pressure. **42 remains the internal canonical corpus authority; no public string says 42 or 39.** This resolves SC-TF7 in a way revision 5 did not anticipate — the answer was neither "say 42" nor "disclose coverage" but "say less, and say it accurately."
2. **Lite's JSON export is a deterministically validated input to Full onboarding.** This makes `EXPORT_SPEC.md` an interface contract (§6.9).
3. **Imported Lite material is evidence, never doctrine.**

And a fourth instruction that is a *fence*: **"Do not let Full-only Case 0, planner, pass-order, SRS, Coach, or Playbook rules mutate Lite."** The 1.76 MB 42-case corpus is Full's, Lite does not read it, and `CASE0_ONBOARDING_SUPERSESSION.json` governs Studio only.

### 1.3 What layer 03 adds

- **`BEN_ESCALATIONS_8.md`** — eight numbered stop gates, `SC-TF1`…`SC-TF8`. This plan adopts that numbering (§11), replacing revision 1's `Q-TF` numbering.
- **`recovered/fixed-answer-signal-map.recovered.json`** — categorical dimension signals for all 33 options. Closes the evidence half of GAP-2.
- **`recovered/55-variant-composition-spec.recovered.json`** — the 27 axis fragments. Closes GAP-3.
- **`drafts/33-receipt-phrases.MARKED_DRAFT.json`** — 33 factual receipts. Closes GAP-4 as draft.
- **`recovered/prior-lite-authoring-source-extract.txt`** — 636 lines of the original authoring source. Contains screen copy, option sub-descriptions and **three surfaces revision 1 did not plan for** (§3.5).
- **`verification/ship_729_recalculation_report.json`**, **`repo_constraints/`**, **`TRUST_FORWARD_PROVENANCE.md`**, **`IMPLEMENTATION_COMPLETION_PLAN.md`**, **`drafts/content-pin-manifest.DRAFT.json`**.
- **Layer 04 recovery:** `recovered/trust_forward_lite_729_profiles_SHIP_recalculated.csv` plus a one-to-one join report against the locked 729 SHIP table. This restores the missing 729 deterministic narrative profiles as recovered evidence.

Layer 03's own framing of what remains open is the correct one and this plan adopts it verbatim: *"Codex may implement all surrounding deterministic machinery… Codex must not invent either policy."*

---

## 2. Verified facts

- I independently recomputed all 729 rows of `ship_729_states.csv` from the SHIP weight vectors in `ROUTING_AND_SCORING.md`: **every `ship_code` and every percentage reproduces to 0.1%, zero mismatches, 16 distinct codes**, per-code counts matching `ship_16_profiles.csv`.
- Layer 03's `verification/ship_729_recalculation_report.json` reports the same result with the same per-code counts (79, 43, 34, 45, 47, 51, 50, 29, 56, 47, 29, 45, 40, 34, 43, 57). **Two independent recomputations agree.** The terminal SHIP calculation is complete and portable.
- The 33-option signal map is **vocabulary-clean**: 138 signal tags, every one of the form `dimension:level` with a level drawn from that dimension's own declared triple. Zero invalid tags.
- All 33 receipt phrases are present (11 decisions × 3), uniformly `origin: implementation-authored`, `status: MARKED_DRAFT`, `renderGate: SC-TF1`.
- The 27 axis fragments compose exactly 1 + 9 + 9 + 9 + 27 = **55 variants**.

---

## 3. Gap status after layer 03

Revision 1 identified four gaps. Layer 03 closes two, refines one into something considerably more interesting, and the recovered source extract opens four more.

### GAP-1 — The stamp still pins no case content — **OPEN**

`config/trust-forward-lite.v1.json` pins version numbers, experience flags, storage settings, the full SHIP model and routes. It pins **no** case text, variants, transitions, option metadata or receipts. `VERSIONING.md` requires all of those to be pinned.

Layer 03 agrees and supplies `drafts/content-pin-manifest.DRAFT.json`, which pins the three new content artifacts **by SHA-256** rather than by value:

```
fixed-answer-signal-map.recovered.json      3ca9cc2b…c5fa38
55-variant-composition-spec.recovered.json  76d509bc…56c2b0
33-receipt-phrases.MARKED_DRAFT.json        e1d6875a…cf735c
```

It is explicitly `DRAFT_NOT_PRODUCTION_STAMP`. **Resolution:** the production stamp pins governed content **by value** in `content/trust-forward/stamp/`, and additionally records the three layer-03 source digests **plus the layer-04 recovered 729-narrative digest** so derivation from the handoff stays checkable. Both, not either. Gated on **SC-TF4**.

### GAP-2 — Answer→dimension aggregation — **CLOSED by layer 05**

Revision 1 inferred a one-decision-one-dimension mapping from the option triples in `CASES.md`. **That inference is superseded.** The recovered map is far richer: each option emits *multiple* categorical signals across several dimensions at once. My revision-1 table should be disregarded.

Signal coverage, computed from the recovered map — `ABC` means all three options carry a signal for that dimension, a subset means only those options do:

| Decision | ambiguity | verification | promise | risk | ownership | trust |
|---|---|---|---|---|---|---|
| C1D1 | ABC | C | AB | AC | — | ABC |
| C1D2 | BC | C | ABC | ABC | — | ABC |
| C2D1 | **B** | BC | ABC | ABC | — | ABC |
| C2D2 | ABC | BC | ABC | ABC | — | ABC |
| C3D1 | — | ABC | ABC | ABC | — | ABC |
| C3D2 | BC | ABC | — | ABC | — | ABC |
| C4D1 | — | BC | — | ABC | ABC | ABC |
| C4D2 | C | ABC | ABC | ABC | ABC | ABC |
| C5D1 | ABC | ABC | ABC | ABC | ABC | ABC |
| C5D2 | ABC | ABC | ABC | ABC | ABC | ABC |
| C5D3 | — | — | — | — | — | ABC |

Three findings that bear directly on Ben's decision:

**(a) Coverage is very uneven.** `trust` is carried by all 11 decisions with full A/B/C coverage. `risk` by 10 (9 full), `verification` by 10 (5 full), `promise` by 8 (7 full), `ambiguity` by 8 but only **4** full. **`ownership` is carried by just 4 decisions, all of them in Cases 4 and 5** — and `ownership` is 0.65 of the H axis. So the Handoff bit is decided almost entirely by the back half of the run. That is defensible for a product whose progression is ACT→…→TAKE THE WHEEL, but it should be a decision.

**(b) Partial coverage is not the same as a zero.** Where a dimension is tagged on only one or two of a decision's options, the untagged options emit *nothing* — they are not a low reading. Any aggregation rule must combine **present tags only**, never impute a default. A rule that treats absence as `0` would silently drag `ambiguity` and `ownership` downward across the whole population.

**(c) A live implementation trap: 9 of the 138 tags are non-monotonic.** Option position does **not** always equal level index. `C2D1` is deliberately inverted on three dimensions at once — "Tell them now" (A) carries `promise:qualify`, `risk:stage`, `trust:stewardship`, while "Resolve the uncertainty first" (C) carries `promise:commit`, `trust:task`. `C1D1/C`, `C3D2/B` and `C2D1/B` are likewise off-diagonal. **The level must be read from the tag, never derived from the option's A/B/C position.** A test asserts this against all 138 tags, because the naive implementation passes casual review and is wrong on nine of them.

**Resolution — layer 05, binding.** Policy `TF-LITE-AGGREGATION-DOMINANT-POSTURE-LATER-TIEBREAK-v1`:

1. For each dimension, collect only the **present** signal tags on the active completed path and map their postures to `0 / 0.5 / 1`.
2. The posture with the greatest count becomes the terminal dimension state.
3. On a tie, scan active decisions **latest → earliest** and take the most recent present signal among the tied winners.
4. Absence is no evidence — never `0`, never filled, never inferred.
5. Posture comes from the tag, never from A/B/C position.
6. Then apply the unchanged SHIP weights and the strict `> 0.5` threshold.

It is a categorical plurality, not an average — the source records named postures, not measurements, so averaging would invent a middle posture out of split high/low evidence.

**Revision 4's candidate rule was tested and rejected, and this is the strongest argument for having gated it rather than shipping it.** Exhaustive enumeration of all `3^11 = 177,147` complete answer sequences gives:

| Rule | SHIP codes reached | Terminal states reached |
|---|---|---|
| Dominant posture + later tie-break (**locked**) | **16 / 16** | 465 |
| Mean present tags, snap to ternary (*rejected*) | 11 / 16 | 91 |

**Independently re-verified for this revision** by enumerating all 177,147 sequences directly from the recovered signal map and the layer-05 policy, without using the handoff's script: 16/16 codes, 465 terminal states, rarest SHIP reachable by **691** sequences, most common by **49,785** — every figure in `SHIP16_REACHABILITY_PROOF.json` reproduced exactly, and mean-and-snap independently confirmed at 11/16.

Findings (a)–(c) above are not obsolete under the locked rule; they are how to read it. (c) is now a correctness requirement — the reducer must read postures from tags. (a) means `ownership`'s plurality is decided by four decisions in Cases 4–5, which under a plurality rule makes the H axis genuinely back-loaded. (b) is rule 4, verbatim.

**SC-TF2 and SC-TF3 are closed.** This resolution changes dimension aggregation and therefore participates in the next production restamp under **SC-TF4**.

### GAP-3 — 55 variants have no text — **CLOSED (pending approval)**

`55-variant-composition-spec.recovered.json` supplies all 27 axis fragments, and independently arrives at the same architecture revision 1 proposed: *"5 base setups + 27 axis fragments; deterministic composition, not 55 independently authored scenarios."*

Axis ids are stable and usable as `variantId` tuple components: `AMB_UNRESOLVED|AMB_PARTIAL|AMB_BOUNDED`, `RELIANCE_LOW|CONDITIONAL|HIGH`, `VERIFY_TRUST|SAMPLE|PROVE`, `RISK_MOVE|STAGE|PROTECT`, `OWN_TRANSFER|SHARE|RETAIN`, `TRUST_TASK|RELATIONSHIP|STEWARDSHIP`, `PROMISE_COMMIT|QUALIFY|RENEGOTIATE`.

One constraint carried forward verbatim into the module's doc comment, because it is the whole reason this composition is safe: **"Variant composition describes fictional world conditions only; it must never infer learner traits."**

### GAP-4 — 33 receipt phrases — **CLOSED as draft, one field short**

All 33 supplied, all four schema fields present on every one, all `MARKED_DRAFT`. The rules block is right and becomes a test: *factual fixed-choice receipt only; never infer motive; never derive from reflection.*

**Residual:** `ROUTING_AND_SCORING.md` requires each receipt to carry a **receipt strength** for the final sort. **No supplied receipt has a strength field.** The sort therefore degrades to: absolute contribution to the public SHIP axes → later case → stable stamp order. That is still a total ordering and still deterministic, so the product works; it simply drops one of the four declared sort keys. Recorded as a deviation (§12) and folded into **SC-TF5**.

### GAP-5 — Three surfaces the packages never specified — **NEW**

The recovered source extract contains three learner-facing surfaces that appear in **none** of `CASES.md`, `UX_COPY.md` or `INSTALLATION.md`, and that revision 1 therefore did not plan for. They are not decoration — they are the product's conversion argument.

1. **Opening callbacks.** Each case after the first opens by resurfacing the learner's exact prior choice: *"Last time, when the request became less clear, you chose to: [exact Case 1 choice]. Now you're the one holding incomplete information."* The extract's instruction is two words: **"No interpretation."**
2. **Case close screens.** Each case ends on `Decision preserved.` plus a verbatim replay of that case's own selections and, if present, the learner's own reflection text — followed by a visually secondary **gated teaser card** carrying the five full-product teasers from `CASES.md` with real copy and CTAs (`See full Trust Forward →`, `Build my living Playbook →`, `Test the other side →`).
3. **Cross-case surfaces at Case 3 and Case 4 close.** Case 3 surfaces the first factual cross-case pattern (*"Three decisions, preserved…"*) under the line *"Those are facts about your selections. Lite isn't deciding whether they form a principle."* Case 4 surfaces an exact contrast between two of the learner's own choices, under `CASES.md`'s boundary sentence.

All three are **derived views over the active path** and inherit the pointer engine's discipline exactly: active answers only, never inactive history, and they must disappear when the active path becomes incomplete — the same rule the SHIP result obeys. They are added to Phase 8/9 (§10).

### GAP-6 — 729 narrative profiles — **ARTIFACT RECOVERED; PUBLIC AUTHORITY STILL GATED**

The recovered extract says the final reveal shows *"the appropriate one of the **729 approved narrative profiles**"*. Revision 2 treated the artifact as missing. Layer 04 now includes the earlier `trust_forward_lite_729_profiles_SHIP_recalculated.csv`.

Verification is exact: the artifact contains **729 unique terminal tuples and 729 distinct deterministic narratives**; every tuple joins one-to-one to `ship_729_states.csv`; every SHIP code and all four displayed percentages match with zero mismatches. Therefore Codex must **not synthesize 729 narratives from scratch** and must not collapse the reveal to only 16 generic bodies merely because the consolidated source package omitted this earlier artifact.

Authority remains separate from existence: the recovered CSV is **recovered prior artifact evidence**, not automatically Ben-canonical merely because the source extract used the word “approved.” Public rendering still follows SC-TF1/current repository content-status rules. The 16 SHIP profile bodies remain the code-level SHIP profile layer; the recovered 729 narrative is the terminal-state deterministic summary layer.

**Independently re-verified for this revision:** 729 rows, 729 unique terminal tuples, 729 unique `deterministic_narrative` values, one-to-one join to `ship_729_states.csv` with **zero mismatches on `SHIP_code` and on all four percentages** — and the SHIP codes additionally recomputed from the raw weights rather than read from either CSV. The narrative is a six-clause composition over the terminal state, closed by its own boundary sentence ("This summary is assembled only from fixed choices…").

**Usage boundary:** import only the exact terminal tuple, `profile_id`, `deterministic_narrative`, and verified SHIP fields needed for parity. Do not automatically surface the recovered CSV's `market_copy`, `strongest_upsell`, or variant-family columns; those are older adjacent artifacts and must defer to the current package/supersession copy.

**One trap layer 04 does not name.** Column cardinality across the 729 rows is wildly uneven: `deterministic_narrative` and `profile_id` are 729-valued, but **`profile_headline` has only 3 distinct values** (243 rows each — "Delivery-first / Trust-aware / Stewardship-oriented developer judgment", keyed to the `trust` dimension alone), `market_copy` has 27, and `strongest_upsell` is a **single constant string**. `profile_headline` is *not* on layer 04's safe-field list, and a reader who assumes per-state uniqueness because the narrative has it would ship a three-way generic title as if it were a terminal-state result. Use the narrative; leave the headline alone unless Ben rules otherwise. (Supporting detail: `case2_variant_family` carries nine values `C2-AR`…`C2-IT`, a 3×3 ambiguity×reliance family naming that corroborates the composition architecture in GAP-3.)

### GAP-3b — The variant transition rules — **RESOLVED by layer 07**

Revision 5 flagged this as the single biggest hole: every layer supplied the fragment *text* and none supplied the rule that *selects* one. `variant-transition-rules.BEN_APPROVED.json` closes it.

**Governing rule:** each case's world-state variant represents the learner's **accumulated posture immediately before that case**, computed with the same `TF-LITE-AGGREGATION-DOMINANT-POSTURE-LATER-TIEBREAK-v1` reducer used for scoring.

| Case | Axis 1 | Axis 2 | Axis 3 | Computed over |
|---|---|---|---|---|
| 2 | ambiguity | **reliance** (from `trust`) | — | Case 1 |
| 3 | verification | risk | — | Cases 1–2 |
| 4 | ownership = **SHARE, fixed** | trust | — | Cases 1–3 |
| 5 | promise | risk | ownership | Cases 1–4 |

Case 4's ownership axis — which revision 5 proved underivable, since `ownership` is first carried at C4D1 — is patched with an explicitly approved neutral: *"Case 4's otherwise-unavailable ownership axis uses neutral SHARE until delegation has actually been encountered."* That is the right shape of fix: a named, approved constant rather than an inferred proxy. The ruling is equally explicit that it is the **only** such exception — *"Missing signal is never imputed except Case 4 ownership's explicitly approved SHARE neutral starting condition."*

### GAP-10 — Two consequences of the transition rule that layer 07 does not state — **NEW**

Both computed here by enumerating the rule over every reachable prefix.

**(i) Case 3's `verification` axis is undefined on 4 of its 81 prefixes (4.9%), and no neutral covers it.**

`verification` is carried before Case 3 only by C1D1/**C**, C1D2/**C**, C2D1/**B,C** and C2D2/**B,C**. So a learner who picks C1D1 ∈ {A,B}, C1D2 ∈ {A,B}, C2D1 = A and C2D2 = A arrives at Case 3 with **no verification evidence at all** — 2 × 2 × 1 × 1 = exactly 4 prefixes. These are not exotic paths; they are the consistently fast-moving learner, which is a persona the product explicitly serves.

This is the *same class of hole* as Case 4's ownership, caught and patched there but not here, and the "never impute" rule forbids inventing a value. **Escalation Q-D:** Case 3 needs its own approved neutral — `VERIFY_TRUST` is the natural analogue to Case 4's SHARE, since these learners have demonstrably done no verification — or an explicit statement that the axis falls back to the case's base scenario. **Until answered, this is an undefined-behaviour path in the product**, so Phase 7 fails closed on it rather than picking a value.

**(ii) Only **43** of the 55 authored variants are reachable — and layer 08 locks the wrong number.**

Layer 08 resolves Q-D with a `VERIFY_TRUST` fallback for Case 3, then in the same layer sets the launch requirement: *"Test all 41 reachable variants."* **41 was revision 6's figure, computed before that fallback existed.** Recomputing with the approved fallback in force:

| Case | Authored | Reachable | Why |
|---|---|---|---|
| 1 | 1 | 1 | — |
| 2 | 9 | **5** | ambiguity and reliance both derive from Case 1's two decisions, so they are correlated — e.g. (act, stewardship) cannot occur |
| 3 | 9 | **7** | 5 by evidence, **+2 created by the Q-D fallback** |
| 4 | 9 | **3** | ownership is fixed at SHARE by ruling, so only the trust axis varies |
| 5 | 27 | **27** | fully reachable |
| **Total** | **55** | **43** | 12 dead, not 14 |

The two extra states are `VERIFY_TRUST × RISK_MOVE` and `VERIFY_TRUST × RISK_STAGE`. Neither is reachable from verification evidence; both exist solely because the fallback fires. They are produced by exactly four Case-3 prefixes (`C1D1,C1D2,C2D1,C2D2` = `AAAA`, `ABAA`, `BAAA`, `BBAA`).

**Why this matters more than a two-count discrepancy.** Testing "all 41" would leave those two variants untested — and they are precisely the paths belonging to the consistently fast-moving learner, the persona whose existence forced Q-D in the first place. They are the newest, least-exercised branch in the whole instrument, reachable only through a fallback added minutes earlier. Leaving them out of launch verification would omit the two variants most likely to be wrong. **The launch target is 43, and the four fallback prefixes get their own named test.**

The 3×3 matrices were authored as if the axes were independent; they are not, because both axes of a case are derived from the same answers. Fourteen authored fragment combinations can therefore never be shown. That may be entirely acceptable — the same reasoning layer 05 applied to 465-of-729 terminal states — but it must be a decision, not a discovery, and it makes revision 5's launch-gate line *"all 55 variant combinations render deterministically"* unmeetable as written. It is corrected to 41 in §15, with the composition still proven exhaustively.

### GAP-7 — Axis key naming disagreement — **RESOLVED FOR IMPLEMENTATION**

Case 2's second world-state axis is `reliance` in the newer recovered composition spec and `trust` in the older source extract; the fragment text is otherwise the same. Use **`reliance`** as the variant-axis key.

Layer 07 confirms both keys directly: *"Case 2 axis name is `reliance`; Case 4 is `ownership × trust`."* The residual below is therefore settled in favour of the composition spec, as recommended.

**The residual, found in layer 06 and unflagged there.** `LEARNER_FACING_RENDER_EXTRACTION_GUIDE.md` describes Case 4 as a "3×3 ownership/**reliance** world-state construction", while the layer-03 composition spec keys Case 4's axes `ownership` and `trust`. Case 4's fragment text is the trust ladder (`TRUST_TASK` / `TRUST_RELATIONSHIP` / `TRUST_STEWARDSHIP`), so the composition spec is the accurate one and the guide's wording looks like carry-over from the Case 2 rename. Pin Case 4 as `ownership` × `trust` and Case 2 as `ambiguity` × `reliance`. Cosmetic today, permanent once a learner's `variantId` is stored — settle it in Phase 7 with the rest of the axis keys. This is an implementation identifier, not the six-dimension `trust` construct, and the newer composition spec is the more specific recovery artifact. Pin it before any learner dataset exists and never silently rename it afterward.

### GAP-8 — `CASES.md` is a synopsis, not the copy source — **NEW, closed by layer 06**

`FINAL_CODEX_START_HERE.md` is blunt about it: *"Do not implement the learner experience from the terse 133-line layer-01 `CASES.md` alone."* The complete contiguous prior-authoring source is `06_.../FULL_FIVE_CASES_ALL_TEXT_OPTIONS_VERBATIM.md` — 691 lines carrying every screen, every A/B/C option **with its sub-description**, the variant construction, the callbacks, the closes, Case 5's AI completion sequence and the full reveal. Layer 03's earlier extract is a near-subset (64 lines are new here).

Two handling rules, both from `LEARNER_FACING_RENDER_EXTRACTION_GUIDE.md`:

- **Do not shorten options to the `CASES.md` paraphrases.** "Ask one question before starting" is the label; the source also supplies "Ask which records they actually expect the export to contain." Both ship.
- **Not everything in the file is UI copy.** It interleaves authoring annotations — `Why this is first`, `Signals`, `Case N variant selector`, `Do not issue judgment`, `No interpretation`, `Soft, visually secondary`, `Suggested copy`, and some stray source filenames from the working transcript. Those are implementation guidance. Phase 6 extracts learner-facing strings deliberately, record by record; it does not bulk-import the file.

**One current-only correction:** the verbatim source's final upsell says `39 real, scar-bearing cases`. Layer 02 supersedes that to **42**. Correct it in the render layer; **never edit the provenance file**.

### GAP-9 — Three more reveal surfaces — **NEW**

The full source shows the final reveal is four blocks, not one. Beyond the SHIP result and receipts already planned:

1. **"What you actually wrote"** — every reflection replayed verbatim, case by case, with **no synthesis at all**. The source is explicit that this is the point: it "visually demonstrates the giant unused signal sitting right in front of them." It is the product's honest limitation used as the argument for Full.
2. **"A professional version you can keep"** — a short professional self-description, **template-generated from the terminal state, not AI-generated**, offered alongside Copy / Download Markdown / Download JSON.
3. **The closing upsell** — "This was the deterministic version," then an eight-item list of what Lite *could not* do (interpret what you wrote, notice an unencoded contradiction, construct the strongest WHY-NOT, retrieve the best real case, …), then the 42-case line and **"My decisions are evidence. They are not your answer key."**

**Both conflicts below are now RESOLVED by layer 07** (recorded as raised, since the resolutions differ from what was proposed).

**(i) RESOLVED — the claim is dropped, not corrected.** "729 possible profiles" does not ship; the approved descriptor is *"Five fictional cases. A fixed decision system. Six dimensions of judgment."* Original finding below, kept as the record of why.

**(i-original) "729 possible profiles" is not true under the locked rule.** The closing upsell copy reads *"Five fictional cases. A fixed decision tree. 729 possible profiles."* Layer 05's own proof — which I reproduced — shows only **465 of the 729 terminal states are reachable**. The 729 figure describes the theoretical scoring space, not the product. R8 (verified live, §1.1) says a false public claim is fixed in architecture, never in copy, so the options are: say 465, say "729 possible profiles, 465 reachable in Lite", drop the number, or change the aggregation so all 729 are reachable. **This is a new escalation, Q-C.** It matters more than it looks: the number appears in the conversion pitch, and it is checkable by anyone who reads the proof.

**(ii) RESOLVED — neither source is used.** The professional summary is **newly authored** under an approved market direction, explicitly `market_research_informed_not_recovered_prior_authoring`. The recovered `market_copy` column is not adopted, and the 3-valued `profile_headline` is **dropped from v1.1** — confirming revision 4's headline finding. The authoritative profile body remains the recovered 729 deterministic narrative. The approved semantic wedge: *"Developer judgment for AI-assisted engineering: what to trust, what to verify, what to delegate, what to promise, and when to take the wheel back."* SEO rule attached: personalized local summaries are **not** the crawlable surface — answer-first landing/FAQ content is. Original finding below.

**(ii-original) `market_copy` has two contradictory instructions.** Layer 04's usage boundary says do **not** automatically adopt the recovered CSV's `market_copy` column; layer 06 shows "A professional version you can keep" is a designed learner-facing surface that the column plainly feeds. Note also that `market_copy` has only **27 distinct values** across 729 rows, so it is far coarser than the narrative. Resolve under SC-TF5 alongside the other reveal copy; until then, ship the reveal without block 2.

---

## 4. Repository reality — the nine mechanisms every new surface must satisfy

Layer 03's `CURRENT_REPO_CONSTRAINTS.md` independently names five of these. All nine are executed, not aspirational.

1. **Deletion contract.** `scripts/check-no-deletions.sh` fails on any deleted *or renamed* file vs `main`; `tests/preserved-surfaces.test.ts` shells out to it. **No Watch Your Step file may be deleted.**
2. **Route roster parity.** `tests/machine-surfaces.test.ts` asserts every `page.tsx` under `app/` appears in `content/canonical-surfaces.ts` and vice versa.
3. **No raw prose in JSX.** `tests/canonical-text.test.ts` fails on any string or JSX text node of ≥12 words in `app/` or `components/`, outside a 16-file frozen list that "may never grow". **All Lite copy lives in `content/`.**
4. **Registry completeness.** The eight governance build checks run only over four explicitly imported arrays. A content module not reachable from them escapes every check silently.
5. **Bundle provenance.** `scripts/check-bundle-provenance.mjs` reads `.next/static/**/*.js` after the build and fails if ≥5-word prose from a `blocked` record appears in a client chunk. Lite is a client-side sandbox, so this is the gate that makes §3.1 load-bearing rather than theoretical.
6. **Analytics freeze.** `components/GoogleAnalytics.tsx` is byte-frozen by `tests/analytics-frozen.test.ts`. Lite telemetry layers on top.
7. **`send_page_view: true` means the URL is telemetry.** `tests/no-private-state-in-urls.test.ts` exists for exactly this. **Lite is one static route with zero learner state in path, query, hash or title.**
8. **Governance strings are data.** `tests/governance-strings.test.ts` greps `app/` and `components/` for approval literals.
9. **CSS Module accounting.** `tests/class-contract.test.ts` asserts `modulesChecked === 59`.

Also: **zero runtime dependencies beyond `next`/`react`/`react-dom`**, and the test runner (`node --import tsx --test tests/*.test.ts`) **cannot load a `.css` specifier**. Every load-bearing Lite module is pure TypeScript — no React, no JSX, no CSS import.

### 4.1 The gate that decides whether Lite can ship at all — SC-TF1

`lib/content-status.ts` ships `RENDER_MARKED_DRAFT = false`. A non-Ben-origin record at `draft` resolves to `blocked`, and `lib/wys/content-gate.ts` empties `text` on a blocked record. That is why the entire Watch Your Step curriculum is invisible today.

Only the **33 receipt phrases** are explicitly stamped `implementation-authored` / `MARKED_DRAFT` / `renderGate: SC-TF1`. The fixed-answer signal map and 27 variant fragments are labeled as **recovered prior-authoring evidence**, and the GAP-5 callbacks/close surfaces are also recovered from the prior authoring extract. Do not relabel recovered material as `AI_SYNTHESIS` merely because it entered the package through layer 03.

SC-TF1 is a **public-render authority gate**; SC-TF2/SC-TF3 were the separate **scoring-authority gates** and are now closed by layer 05.

**SC-TF1 is now partly approved.** `06_.../SC_TF1_APPROVAL_RECORD_2026-09-07.md` records Ben's explicit approval, on 2026-09-07, of three recovered learner-facing categories:

1. the **27 world-state/scenario fragments** that compose the 55 variants;
2. the recovered **opening callbacks, case-close surfaces, and cross-case factual replay/contrast surfaces**;
3. the recovered **729 deterministic terminal summaries**.

Two limits on that approval, both explicit and both load-bearing:

- **The 33 implementation-authored receipt phrases are excluded.** They remain under SC-TF5.
- **It does not authorise a global bypass.** "Do not weaken or flip the global `RENDER_MARKED_DRAFT` constant." Approval is encoded per record, at the Trust Forward content/stamp level, through the repository's normal status mechanism — which is precisely what §7's registry and the `constructed-case` surface kind exist to make possible.

And a caution the status overlay adds, which matters because layer 06 also ships far more text than was reviewed: *"The source extraction itself includes previously unseen rich wording beyond the specific categories reviewed immediately before extraction. Do not silently convert `recovered_prior_authoring` into `ben_canonical` merely because it is now available in one file."*

Do **not** automatically mark package-sourced scenario/profile copy `published` or claim Ben authorship unless the live repository's approval metadata or an explicit governing artifact supports that status. Preserve the package's narrower factual claim: Lite scenarios are constructed and must not be presented as Ben's lived cases. If content status is unresolved, fail closed rather than laundering provenance through a convenient enum.

**Revision 2 got the origin split wrong and REV3 was right to strike it**; it is restored here in corrected form, because Phase 6 cannot register a record without choosing fields for it. Four buckets, not two, and the middle two are the ones REV2 collapsed:

| Material | Source layer | Six-way authority field (§7) | Repo `ContentOrigin` | Gate |
|---|---|---|---|---|
| 5 base scenarios, 11 decision option sets, teasers, boundary copy, 16 SHIP profile bodies | 01 (package) | `ben_canonical` **only if** the live repo's approval metadata supports it; otherwise not | `FICTIONAL_AUTHORED` | SC-TF1 |
| 27 variant fragments, GAP-5 callbacks and close surfaces, 729 terminal narratives | 03/04 (**recovered prior authoring**) | `recovered_prior_authoring` | `FICTIONAL_AUTHORED` — **never `AI_SYNTHESIS`** | **SC-TF1 APPROVED 2026-09-07** — promote per record |
| 138 signal tags | 03 (**recovered prior authoring**) | `recovered_prior_authoring` | n/a — never rendered | SC-TF2/3 **resolved** by layer 05 |
| Previously unseen wording in the layer-06 full extraction | 06 (**recovered prior authoring**) | `recovered_prior_authoring` | `FICTIONAL_AUTHORED` | **not covered by the 2026-09-07 approval** — review before render |
| 33 receipt phrases | 03 (**implementation-authored**) | `implementation_authored_marked_draft` | `AI_SYNTHESIS` | SC-TF1 **and** SC-TF5 |
| Reflection text, handle | learner | `learner_authored_verbatim` | `LEARNER_OWNED` | never rendered publicly, never scored |

The distinction in rows two and three is the whole of REV3's correction #1 and it is load-bearing: relabelling recovered prior authoring as implementation-authored would understate its provenance, and relabelling implementation-authored receipts as recovered would overstate theirs. Neither error is visible on screen.

---

## 5. Route surgery

### 5.1 Routes added

| URL | File | Kind |
|---|---|---|
| `/trust-forward` | `app/trust-forward/page.tsx` | Server component. Landing. |
| `/trust-forward-lite` | `app/trust-forward-lite/page.tsx` | Server shell + one client island. |
| `/tf` | `next.config.ts` redirect | External, `permanent: false`. |

`TRUST_FORWARD_PROVENANCE.md` pins both canonical pointers: Lite origin `https://benchantech.com/trust-forward`, Full target `https://studio.com/benchanviolin/trust-forward` — the latter explicitly *"requires SC-TF6 confirmation"*. It is the one external link neither this repo nor the package can verify.

`TRUST_FORWARD_PROVENANCE.md` adds an architectural invariant worth quoting into the code: *"Ordinary edits, refactors, migrations, copying, generation, cleanup, and deduplication must preserve the pointer to the canonical Trust Forward Studio app and the Lite origin."* Both URLs therefore live once, in `content/trust-forward/`, and `tests/preserved-surfaces.test.ts` pins both literals.

### 5.2 Tests that must change, deliberately

- `preserved-surfaces` — `occurrences(config, "source:") === redirects.length` (currently 5); add new redirects to the array in the same edit.
- `preserved-surfaces` — "no internal href written in the chrome is dead" once the chrome links to the new routes.
- `machine-surfaces` — both new pages registered in `content/canonical-surfaces.ts`; group-label count 6 → 7.
- `canonical-text` — `PRESERVED_SURFACES.length === 16` **stays 16**. New Lite surfaces are not exempt from the raw-prose rule.
- `class-contract` — `modulesChecked` 59 → N.
- `wys-local-state` — third browser key.

### 5.3 The Watch Your Step retirement — SC-TF-adjacent, unchanged from revision 1

Layer 03 endorses revision 1's approach directly: *"use the existing constant/registry pattern and preserve `permanent: false` redirects in the retired-surfaces register rather than deleting files."*

- `content/watch-your-step/config.ts` → `WYS_NAV_RETIRED = true`.
- `content/nav.ts` filters `shipNav` / `lessonZeroCta` through it. **The literals stay in the file**, so the preserved-surfaces assertions keep passing and the flip is one character either way.
- `content/canonical-surfaces.ts` → `RETIRED_SURFACES`: routes with a `page.tsx` on disk that a redirect shadows. `machine-surfaces` subtracts that set, plus a **new assertion that every retired route has a matching redirect `source` in `next.config.ts`** — a route cannot be quietly retired without being quietly redirected.
- `next.config.ts` → `{ source: "/watch-your-step", destination: "/", permanent: false }`, and retarget `/watch-your-step/:path+` to `/`. **`permanent: false` throughout** — a 308 is cached indefinitely and is the only genuinely hard-to-reverse action in this plan.

**REV3's reading of this needs one correction.** REV3 concluded that retirement is merely conditional, citing layer 03's phrasing "If WYS must leave navigation". That is accurate about layer 03 — but layer 03 is a *repo-constraints* note about **how** to retire without breaking the deletion contract, not a product decision about **whether**. The whether sits in layer 01, which is a source layer with product authority, and it is imperative there:

- `README.md`: "Remove Watch Your Step from navigation and redirect legacy Watch Your Step entry routes to `/`."
- `CURRENT_SITE_INTEGRATION_NOTES.md`, under **"Required edits"**: "2. remove Watch Your Step from main/footer navigation; 3. redirect legacy Watch Your Step entry routes to `/`."

`FINAL_READ_ORDER_AND_AUTHORITY.md` is explicit that layer 04 "does not override source-layer product authority", so a layer-04 review cannot downgrade a layer-01 required edit to optional.

Against that, R7 (verified live, §1.1) says add the new and keep the old — and REV3's practical instinct is right that Lite's *functionality* needs none of this.

**So the honest position is neither REV2's default-to-retire nor REV3's default-to-leave: this is a real conflict between a layer-01 required edit and R7, and it goes to Ben as Q-A with no default taken.** Implement nothing here until it is answered. If retirement is approved, use the mechanism above (flag + register + `permanent: false`, zero deletions). If it is declined, leave WYS untouched and record the layer-01 deviation.

### 5.4 What `/trust-forward` renders

Two states, both decided **locally**:

- **No local completion:** compact explanation, dominant CTA to `/trust-forward-lite`, the 15–30 minute line, what completion reveals, and the full offer underneath including the 42-case sentence.
- **Local completion present:** `Lite complete`, `Reopen Lite result`, prominent CTA to `/tf`.

The page is otherwise static and prerendered; the completion check is a client island that reads `localStorage` in an effect and server-renders the incomplete state. `PRIVACY_ANALYTICS.md`: *"`/trust-forward` may inspect local completion to change its own UI, but do not emit completion as a learner identity attribute."* No completion property joins any event.

---

## 6. Architecture

Eleven pure-TypeScript modules under `lib/trust-forward/`, one content tree under `content/trust-forward/`, one client island plus presentational components under `components/trust-forward/`. UI consumes derived selectors; no domain logic in a component.

### 6.1 `stamp.ts`

Loads `content/trust-forward/stamp/v1.ts` — a TypeScript module, not a fetched JSON, so the type system polices its shape. Seeded from `config/trust-forward-lite.v1.json` **key-for-key** and extended per GAP-1 with `cases`, `variants` (composition rules + axis fragments), `decisions`, `options` (signal tags + receipts), `transitions`, `aggregation` and `sourceDigests` (the three layer-03 content SHA-256s plus the recovered 729-narrative SHA-256 from layer 04).

Stamps are additive files. `v1.ts` is never edited once a learner could have pinned it. Each field group carries a doc comment naming the `VERSIONING.md` restamp trigger that governs it.

### 6.2 `storage.ts`

Key `benchantech:trust-forward-lite:state`. Every browser-touching function guarded on `typeof window` and wrapped in `try/catch`, returning a valid empty state on failure — **iOS Safari in private browsing throws on `localStorage` access**, and iPhone Safari at ~390 CSS px is the primary QA target. `TEST_PLAN.md` requires a rendered pre-start failure explanation, not a thrown error.

Minimisation is enforced **in the serializer**, as `lib/wys/local-state.ts` does it. The two deliberate exceptions — reflection text and handle — are declared learner-owned free text that must round-trip intact; what keeps them off the wire is the telemetry allowlist, not the serializer.

### 6.3 `ledger.ts`

Ports `reference-ts/ledger.ts`. Sequence strictly increases; `eventId` unique; events never mutated. Local timestamp carries a **numeric UTC offset only** — no timezone name. New session after 6h inactivity; session ids never transmitted. One hardening: `crypto.randomUUID()` needs a secure context and is missing in some older mobile browsers — fall back to `getRandomValues`, never `Math.random()`.

### 6.4 `pointers.ts`

- `latestExactAnswers(ledger)` → map keyed `variantId::decisionId`, latest `sequence` wins.
- `resolveActivePath(stamp, answers)` → walks cases in order, computes each variant tuple from stamped transitions over **upstream active answers only**.
- An answer scores only if its exact tuple is on the active path. Inactive history stays in the ledger and the export, and never scores or renders.
- Variant change → restore the latest prior answer for the *new* tuple if one exists; otherwise the decision is unanswered.
- Any unanswered active required decision → **SHIP result and both exports absent**, not greyed out. Restored the instant the path completes.
- Changed scenario → `This scenario changed because of an earlier edit.`
- The GAP-5 callback, close and cross-case surfaces read from this same active-path selector and disappear with it.

### 6.5 `signals.ts` + `aggregation.ts` + `scoring.ts`

Three modules. Layer 05 closes the seam between the second and third; it is no longer an unresolved boundary.

- **`signals.ts`** — the 138 tags, keyed `(decisionId, optionId)`. Levels are read **from the tag**, never from option position (§3, finding c). A test asserts all 138 against the dimension vocabularies and asserts the 9 known non-monotonic tags are preserved exactly, so a "tidying" refactor that re-derives levels from position fails loudly.
- **`aggregation.ts`** — implements the locked layer-05 policy: plurality over present tags, latest-active tie-break, absence never imputed. The policy id is stamped alongside the content so a future change is a restamp rather than a silent behaviour swap. A test reproduces the 177,147-sequence enumeration and asserts 16/16 codes, 465 terminal states and a 691-sequence floor for the rarest code — which makes any accidental reversion to averaging fail loudly.
- **`scoring.ts`** — ported verbatim from `reference-ts/scoring.ts`, verified against all 729 rows. Threshold is `lean > 0.5 ? 1 : 0`. **Never `>=`.** `TEST_PLAN.md` pins 49.9→0, 50.0→0, 50.1→1, 100→1.

Display: exact lean to 0.1%, graphical bar to 10%, bars neutral and two-ended. The extract's rule is explicit and becomes a code comment: **`task → relationship → stewardship`, not `bad → okay → good`.**

`data/ship_729_states.csv` ships as a **test fixture, not runtime data**.

### 6.6 `profiles.ts`

Lookup the 16 SHIP-level profile metadata from `stamp.ship.profiles[bits]`. Separately lookup the recovered **729-state deterministic narrative** by the exact terminal six-dimension tuple; do not regenerate it. Never renders `You are SHIP-0111.` `SHIP_PROFILES.md`'s "New Game Plus" metaphor is an internal design note that **must never reach public UI**; a test greps the built output. Public use of the recovered 729 narrative remains content-status gated under SC-TF1.

### 6.7 `receipts.ts`

Every active fixed answer yields its stamped phrase and contribution. Sorted by absolute contribution to the public SHIP axes → later case → stable stamp order (strength omitted, §3 GAP-4). Total ordering, so identical datasets produce byte-identical receipt lists. **Never derived from reflections** — asserted by a test that feeds reflection text through and diffs the output.

### 6.8 `session.ts`, `multitab.ts`

6-hour rollover. `BroadcastChannel` with `storage`-event fallback, concurrent-tab warning, ledger as source of truth, conflicts broken on timestamp then `eventId` lexical order.

### 6.9 `exports.ts` — and the Full import contract

Unlocked only when Case 5 is reached, every active required decision is answered, and a SHIP result exists.

**Markdown** in `EXPORT_SPEC.md`'s exact 13-part order, ending with a machine-readable version manifest block. **JSON** with `schemaVersion`, `exportedAtLocal`, `versionManifest`, `current`, `ledger` — full ledger including superseded events.

**Interface reconciliation.** `LITE_TO_FULL_IMPORT_SUPERSESSION.json` requires `requireRecognizedLiteProduct`, but it does **not specify which JSON field encodes product identity**. `EXPORT_SPEC.md` likewise omits an identity field. The final handoff therefore includes an **interface proposal**, not a silently authoritative schema change: top-level `product: "trust-forward-lite"` is the preferred encoding unless the actual Full importer recognizes identity through another existing field.

Lite tests should validate a **local mirror of the five fail-closed conditions**. They cannot prove that Studio's external Full importer accepts the exact field shape. End-to-end acceptance by the real Full onboarding is a release verification item under SC-TF6/interface QA, not something the Lite repository can claim from a unit test alone.

Downloads use `Blob` + object URL + `<a download>`, revoked after click. No server round trip, no share link, no upload. Clipboard summary shows a checkbox list *before* copy; clipboard-unavailable falls back to a selectable text surface.

### 6.10 The client island

One `"use client"` component, `components/trust-forward/LiteSandbox.tsx`, mounted by the server page. Everything under it is presentational and takes derived props. Keeps the route prerendered, keeps the server render identical for a first visitor and a crawler, and keeps learner state out of the RSC payload.

---

## 7. Content model

```
content/trust-forward/
  index.ts        registry — trustForwardRegistry, …CanonicalRecords, …ContentObjects
  stamp/v1.ts     the immutable stamp (§6.1)
  cases.ts        5 base scenarios, 11 decisions, 33 options + sub-descriptions
  variants.ts     27 axis fragments, axis ids, composition rules
  signals.ts      138 signal tags
  receipts.ts     33 phrases
  surfaces.ts     GAP-5: callbacks, case closes, cross-case surfaces, 5 teaser cards
  profiles.ts     16 SHIP-level profile bodies + recovered 729 terminal-state narratives
  copy.ts         UX_COPY.md strings + the final-reveal copy
  landing.ts      /trust-forward copy, both states
  version.ts      TF_CONTENT_VERSION
  types.ts
```

Every record is an `AnyCanonicalText` or carries `{ id, status, origin }`. `content/trust-forward/index.ts` is added to the `canonicalRecords` and `contentObjects` arrays in `tests/canonical-text.test.ts` **in the same commit**, plus a "every module under `content/trust-forward` is registered or declared record-free" test mirroring the two that exist for WYS and ship.

**A new surface kind.** `fictional-scenario`'s labels all say "authored for Watch Your Step". Add `SurfaceKind = "constructed-case"`:

| Origin | Label |
|---|---|
| `FICTIONAL_AUTHORED` | *Constructed developer scenario — authored for Trust Forward Lite* |
| `AI_SYNTHESIS` | reuse *Drafted during implementation — not Ben's words* |
| `IMPLEMENTATION_PLACEHOLDER` | reuse *Implementation placeholder — not Ben's words* |

The first is a new claim about authorship, so it joins `NEW_PROVENANCE_LABELS` and Ben's stamp list. Adding a surface kind needs a new `case` in `policyForCanonicalText` and a bump to `SURFACE_KINDS` assertions — both compile-enforced.

**`TRUST_FORWARD_PROVENANCE.md`'s six-way distinction is encoded as a required field on every Lite record**, because it is finer than the repo's `ContentOrigin` enum and layer 03 makes it an invariant:

```
ben_canonical | recovered_prior_authoring | implementation_authored_marked_draft
learner_authored_verbatim | deterministic_derived | full_coach_provisional
```

*"Never relabel implementation-authored copy as Ben-authored merely because it was generated to fill a package gap."* A test asserts no record carries `ben_canonical` while `approvalState.stamp` is null.

**Source refs.** `content/source-refs.ts` gains a `package` kind with one entry per handoff document, each locator naming file **and SHA-256** from `PACKAGE_INVENTORY_SHA256.json`. The 42-case sentence cites the supersession pack *and* the validation sidecar digest `68528ec8…f9d1`.

**The shared info marker.** One component. Tap/click always works; hover only enhances; keyboard accessible; Escape and outside-click close; **no hover-only content anywhere**. Built on `<details>`/`<summary>` semantics, matching `SiteHeader`'s existing no-client-JS disclosure.

---

## 8. Analytics

New adapter `lib/trust-forward/telemetry.ts`, structurally identical to `lib/wys/telemetry.ts`: a refusal first, a sender second.

**17 events** from `reference-ts/analytics.ts`, `tf_`-prefixed on the wire so the two products never collide in one GA4 stream. `PRIVACY_ANALYTICS.md`'s "route viewed" gets **no adapter event** — the frozen `send_page_view: true` already covers it and a second would double-count.

**Closed property allowlist with value domains:**

| Key | Domain |
|---|---|
| `case_number` | integer 1–5 |
| `decision_number` | integer 1–3 |
| `from_case_number` | integer 1–5 |
| `app_version` | `/^[0-9][0-9a-z.-]{0,31}$/` |

snake_case only, no mapping shim. Props rebuilt key-by-key from the allowlist, never spread. Fails closed in production, loud in development. Emits by pushing an `arguments`-shaped entry to `window.dataLayer` after `ga4-init`'s `config` marker appears, buffering ≤32 events on a bounded poll.

**Never transmitted, and asserted:** option ids or text, variant ids or axis states, SHIP code or percentages, reflections, handle, ledger, drafts, local timestamps, session ids, completion-as-identity.

**GA4 Enhanced Measurement** (form-interaction and site-search sub-events) is on by default in the property UI and invisible from this repo. Layer 07 rules that it must **not** be changed merely to launch Trust Forward — instead, audit it and **disclose the actual configuration**. So Q-B becomes a disclosure obligation on the privacy/Data surface, not a settings change.

### 8.1 The one layer-07 ruling that collides with the repository — **NEW**

Layer 07 approves a genuinely new capability:

> "Anonymous aggregate A/B/C counts per decision are approved through the **existing first-party aggregate mechanism**. Persist aggregate counters, not learner event histories. No visitor/session/user identifier on aggregate choices."

The privacy shape is impeccable — counters, not histories; no identifiers; and it is explicitly separate from the allowlisted GA4 events. The problem is the premise: **that existing mechanism does not exist in a working state.**

- `lib/wys/aggregate.ts` is present but **disabled** — `WYS_AGGREGATE_ENABLED = false` in `content/watch-your-step/config.ts`.
- It was disabled deliberately and for a documented reason: WYS §30 says build the counter *"only if the repo already has a suitable database/persistence layer."* `lib/db/client.ts` is a two-line stub whose only function throws, nothing imports it, and there is no `pg`, `@vercel/postgres`, `@neondatabase/serverless` or `@vercel/kv` in `node_modules`.
- There is therefore **no endpoint and no store** behind the "existing first-party counter".

So implementing this ruling means building first-party persistence — a database, an ingest endpoint, and a schema — which is a materially larger piece of work than everything else in this plan and adds the repo's first backend dependency. It also reopens a question the repo already settled once, in the other direction.

**Recommendation, and it keeps the ruling intact rather than declining it:** ship Lite v1.1.0 with the aggregate counter **built but disabled**, exactly as WYS's is, behind `TF_AGGREGATE_ENABLED = false`. The event shape, the no-identifier rule and the counters-not-histories rule are all implemented and tested; nothing is transmitted because there is nowhere to transmit to. Enabling it becomes a separate, scoped piece of work once a persistence layer exists. Tracked as **Q-E**, and the honest disclosure meanwhile is that Lite sends no aggregate choice data at all.

---

## 9. Legal, privacy and machine surfaces

- `lib/wys/browser-keys.ts` gains a third `BROWSER_KEYS` row for `benchantech:trust-forward-lite:state`, `clearedByWysClear: false`. Because `/privacy`, `/cookies` and the Data page all render `BrowserKeyList` from this one registry, **the legal pages update themselves** — the property that registry's header promises, exercised for the first time by a third key.
- Confirm `wysOwnedKeys()` still filters on `WYS_KEY_PREFIX` so neither product's clear sweeps the other's data.
- `content/canonical-surfaces.ts` gains both pages under a new `"trust-forward"` group (label `Trust Forward`), which updates `/llms.txt`, `/author-ship/state.json` and `/sitemap.xml` for free. `/tf` is a redirect, therefore **not** a surface.
- `docs/legal-analytics.md` gains the 17 events and 4 properties.

---

## 10. Phase plan

Each phase ends green — `npm run lint && npx tsc --noEmit && npm test` — before the next begins.

| Phase | Work | Exit condition |
|---|---|---|
| **0** | Baseline: capture `npm test`; run `check-no-deletions.sh`; re-verify the 41-file SHA manifest; record the counts this plan changes (redirects 5, CSS modules 59, surface groups 6, preserved surfaces 16). | Baseline in `docs/trust-forward-baseline.md`. |
| **1** | Provenance: `constructed-case` surface kind + labels, the six-way authority field, `NEW_PROVENANCE_LABELS`, package source refs with digests. | Label totality green; no record claims `ben_canonical`. |
| **2** | `lib/trust-forward/{types,storage,ledger,session}.ts`. Pure TS. | Serializer refuses undeclared keys; sequence/uniqueness/immutability proven; 6h rollover; storage-throws returns valid empty state. |
| **3** | `telemetry.ts` + allowlist tests with a `DO_NOT_SEND_TF_TEST` canary. | 17 events, 4 domains, snake_case only, fails closed, buffer/flush proven. `analytics-frozen` still green. |
| **4** | Stamp scaffold: existing five key groups preserved byte-for-byte. | `versionManifest` identical to the package JSON; 729-row fixture green. |
| **5** | `signals.ts` + `aggregation.ts` (locked layer-05 policy) + `scoring.ts` + `profiles.ts` + `receipts.ts` + `pointers.ts` against a synthetic stamp. | All 138 tags validate; the 9 non-monotonic tags preserved; **the 177,147-sequence enumeration reproduces 16/16 codes, 465 states and the 691 floor**; the four threshold cases pass; `TEST_PLAN.md`'s pointer-restoration sequence passes end to end. |
| **6** | Content, extracted record-by-record from the layer-06 verbatim source (**not** from `CASES.md`, and not bulk-imported): 5 bases, 11 decisions, 33 options **with sub-descriptions**, 27 approved fragments, 138 signal tags, 33 marked-draft receipts, 16 SHIP profiles, 729 approved narratives, GAP-5 and GAP-9 surfaces, all `UX_COPY.md` strings. Registry wired into `canonical-text.test.ts`. | Every record governed, sourced, non-duplicate; registry-completeness green; **approved categories render, receipts stay blocked under SC-TF5, and a test proves both**; no authoring annotation reaches a learner-facing record; "39" never renders. |
| **7** | Stamp completion: fold Phase 6 content in by value + record source digests; pin Case 2 world-state axis key as `reliance`; transitions become executable. | All 55 variant tuples enumerate; every decision reachable; no orphan option; no axis-key collision. |
| **8** | UI shell: `/trust-forward-lite`, `LiteSandbox`, intro, `Case n of 5`, decision screens, info marker, hidden future titles, **opening callbacks**. | Renders 320/375/390/430px; no hover-only disclosure; no learner state in URL or title. |
| **9** | **Case close screens, cross-case surfaces, teaser cards** (GAP-5); reflections; optional handle after Case 1; Settings — and **no** `Start latest version` in Settings. | Close surfaces disappear when the active path breaks; skip / always-skip / re-enable / draft autosave across reload; reflections provably never affect route, receipts or SHIP. |
| **10** | Final result: observed-pattern label, SHIP code, profile, special ability, four neutral two-ended bars, 0.1% / 10%, synthesis, disclaimer, collapsed `Why this result?` + `See full`, `Continue to full Trust Forward` → `/tf`, `Reopen your decisions`, two-step `Start over`. | Never `You are SHIP-…`; no "New Game Plus"; result absent whenever the path is incomplete. |
| **11** | Exports: 13-part Markdown, JSON with `product` identity, clipboard checkbox summary, unavailable-clipboard fallback. | All five Full-import gates pass against a golden export; full ledger including superseded events. |
| **12** | Multi-tab: BroadcastChannel + storage fallback, warning, tie-breaks. | No sequence duplication under a simulated two-tab interleave. |
| **13** | `/trust-forward` landing (both states), chrome, canonical surfaces, legal surfaces, browser-key row. Apply WYS retirement flag/redirect/register changes **only once Q-A is answered**; until then leave WYS untouched and ship Lite alongside it. | Roster↔disk parity green; no dead chrome link; both legal pages name the third key with no hand edit. |
| **14** | Validation and launch gate. | §14. |

**What the two rulings change about scheduling.** With SC-TF2/SC-TF3 resolved and SC-TF1 approved for the three recovered categories, phases 0–13 no longer produce a blank product: the scenarios, callbacks, closes, cross-case surfaces and the terminal narrative all render. What remains withheld at the end of phase 13 is narrower and specific — the 33 receipts behind `Why this result?` (SC-TF5), the professional-version block (GAP-9(ii)), and any layer-06 wording outside the reviewed categories. That is a shippable product with one collapsed section missing, rather than an empty shell.

---

## 11. Escalations — layer 03's eight, plus two

Adopting `BEN_ESCALATIONS_8.md`'s numbering. **Codex may prepare code around these. It may not decide them by inference.**

1. **SC-TF1 — APPROVED IN PART, 2026-09-07.** Ben approved the 27 fragments, the callbacks/closes/cross-case surfaces, and the 729 terminal narratives. Encode per record; **do not flip `RENDER_MARKED_DRAFT`**. Still open within SC-TF1: previously unseen wording in the layer-06 full extraction, which the approval explicitly does not cover.
2. **SC-TF2 — RESOLVED by layer 05.** Dominant categorical posture over present tags; latest active present signal breaks only a tied plurality. Mean-and-snap is rejected: it leaves 5 of 16 SHIP codes unreachable. Independently reproduced (§3 GAP-2).
3. **SC-TF3 — RESOLVED by layer 05.** Preserve C2D1 exactly as recovered: only option B carries ambiguity, and the non-monotonic promise/trust tags stay. Reachability succeeds without touching them, so there is no reason to rewrite recovered evidence.
4. **SC-TF4 — RESOLVED.** Production version is **v1.1.0**; v1.0.0 stays as immutable historical provenance.
5. **SC-TF5 — RESOLVED.** Receipts are governed by an approved *rule* rather than approved strings: the invariant is **"Situation → observable choice/action. Nothing else."** — no inferred intention, praise, judgment label, doctrine, or "because" explanation. Provenance is `implementation_authored_under_ben_approved_rule`, never Ben-verbatim and never recovered prior authoring. **Receipt strength is explicitly dropped**, which closes GAP-4's rider: highlight sort is SHIP contribution → later case → stable authored order. All **11** decision receipts are preserved in the export in case/decision order; the profile may highlight a subset but may never delete or substitute the underlying trail.
6. **SC-TF6 — Studio canonical URL.** Confirm `https://studio.com/benchanviolin/trust-forward` before release.
7. **SC-TF7 — RESOLVED.** Public Full bridge is **"30+ real cases drawn from Ben Chan's actual professional experience"**, with anonymization/compositing disclosed. Internal corpus authority stays 42. No public string claims 42 or 39.
8. **SC-TF8 — RESOLVED.** `/trust-forward` is the canonical public route, `/trust-forward-lite` is retained as a public alternate, `/tf` is retained as a convenience redirect. Learner state never appears in path, query or hash. Telemetry inherits the existing BenChanTech boundary rather than changing site-wide policy — see §8.1 for the one part of this that conflicts with the repository.

Two more this plan adds, neither in layer 03:

- **Q-A — RESOLVED.** Watch Your Step is removed from navigation and public discovery; its source is **preserved as a non-public stub and not deleted**; old public entry routes redirect to the homepage with **non-permanent** redirects. That is exactly the `WYS_NAV_RETIRED` + `RETIRED_SURFACES` + `permanent: false` mechanism §5.3 specifies, and it honours both the layer-01 required edit and the deletion contract.
- **Q-B — RESOLVED as a disclosure duty rather than a config change.** *"Do not change BenChanTech GA4 Enhanced Measurement configuration merely to launch Trust Forward; audit/disclose the actual configuration."* So the console check still happens, but its output goes into the Data/privacy disclosure rather than into a settings change.
- **Q-C — RESOLVED.** Do **not** market Lite as "729 possible profiles". Approved public descriptor: **"Five fictional cases. A fixed decision system. Six dimensions of judgment."** Technical and export documentation *may* state the real figures — 729 theoretical terminal states, 465 reachable under the locked aggregation, all 16 SHIP patterns reachable. The claim was removed rather than corrected, which is the cleanest available answer under R8.
- **Q-D — RESOLVED.** Case 3 uses **`VERIFY_TRUST`** when the accumulated pre-Case-3 state carries no verification evidence — a named neutral, never an inferred learner posture, and any real evidence wins. With Case 4's `SHARE` these are the **only two** approved missing-evidence exceptions. Consequence to carry: it adds two reachable Case-3 variants, so the launch target is 43, not 41.
- **Q-E — RESOLVED.** Build the anonymous per-decision A/B/C adapter; production ships `TF_AGGREGATE_ENABLED = false`; nothing transmits while disabled; **do not add the repository's first backend merely to activate it.** Future enablement is separate scoped work and must preserve counts only — no histories, no identifiers.

---

## 12. Deviations register

For `docs/facelift-unapproved.md`.

1. **Proposed `product` field in the JSON export.** `requireRecognizedLiteProduct` requires recognizable identity but does not define the field. Use `product: "trust-forward-lite"` only if the real Full importer contract accepts it; otherwise adapt the proposal without weakening fail-closed recognition.
2. **The stamp is extended, not merely shipped**, and pins content **by value plus source digest**, where layer 03's draft manifest pins by digest alone.
3. **Variants are composed, not enumerated** — confirmed by the recovered composition spec.
4. **A new `constructed-case` surface kind** — the existing labels name Watch Your Step.
5. **A six-way provenance authority field beyond `ContentOrigin`**, per `TRUST_FORWARD_PROVENANCE.md`.
6. **`route viewed` fires no adapter event** — covered by the frozen `send_page_view: true`.
7. **Events are `tf_`-prefixed** — two products, one GA4 stream.
8. **729-state CSV ships as a test fixture, not runtime data.**
9. **`crypto.randomUUID()` has a `getRandomValues` fallback** — not in the reference implementation; required for older mobile Safari.
10. **Receipt sort drops the strength key** (GAP-4). Still a total ordering; still deterministic.
11. **Case 2's second variant axis is keyed `reliance`**, resolving the older extract/newer composition-spec naming disagreement before any stored learner state exists.
12. **729 terminal narratives are recovered, not regenerated.** Layer 04 restores the prior 729-profile artifact and verifies exact tuple/SHIP/percentage parity.
13. **`profile_headline` is not used.** It is 3-valued across 729 rows and is absent from layer 04's safe-field list; the reveal uses `deterministic_narrative` plus the 16 SHIP-level bodies.
14. **A layer-01 required edit is left unimplemented pending Q-A** (WYS navigation removal). Recorded here so the omission is deliberate and visible rather than silent.
15. **Aggregation is a categorical plurality, not an average**, per the locked layer-05 policy. The rejected averaging rule is recorded because its failure mode — 5 unreachable SHIP codes — is invisible without exhaustive enumeration.
16. **465 of 729 terminal states are reachable.** Accepted by layer 05 on the grounds that all 16 public SHIP patterns remain reachable. It becomes a copy problem only where a public string counts profiles (Q-C).
17. **Case copy comes from the layer-06 verbatim source, not `CASES.md`**, extracted record-by-record so authoring annotations never become UI text.
18. **The reveal's "professional version" block is deferred** pending the `market_copy` contradiction in GAP-9(ii).

---

## 13. What this plan does *not* do

Stated so nobody has to infer it:

- It does not implement Case 0, the Unified Planner, pass order, SRS, Coach, STORM or the Playbook. Those are Full-on-Studio, and `READ_ORDER_AND_AUTHORITY.md` forbids letting them mutate Lite.
- It does not read the 42-case canonical corpus. Lite's only relationship to it is one marketing number.
- It does not decide SC-TF1 or SC-TF2 by inference, and it ships fail-closed boundaries rather than defaults for both.
- It does not flip `RENDER_MARKED_DRAFT`.
- It does not delete or rename a single file.

---

## 14. Validation

```
npm run lint
npx tsc --noEmit
npm test
npm run build          # includes check-bundle-provenance.mjs
sh scripts/check-no-deletions.sh
```

**New test files:**

| File | Covers |
|---|---|
| `tests/trust-forward-ledger.test.ts` | sequence, uniqueness, immutability, 6h rollover, no timezone name, storage-throws path |
| `tests/trust-forward-pointers.test.ts` | `TEST_PLAN.md` restoration sequence; same-variant retention; inactive answers never score; completeness gating of result, exports **and the GAP-5 surfaces** |
| `tests/trust-forward-signals.test.ts` | all 138 tags valid; the 9 non-monotonic tags preserved exactly; **no level derived from option position** |
| `tests/trust-forward-scoring.test.ts` | all 729 rows vs the CSV; the four threshold cases; 16 profile counts; **aggregation fails closed while SC-TF2 is unresolved**; reflections and handle never affect the result |
| `tests/trust-forward-telemetry.test.ts` | 17 events, 4 domains, canary refusal, snake_case only, buffer/flush, fails closed |
| `tests/trust-forward-content.test.ts` | registry completeness, source-ref + digest resolution, provenance labels, six-way authority field, **public render fails closed while SC-TF1 is unresolved**, no "New Game Plus", no `You are SHIP-` |
| `tests/trust-forward-export.test.ts` | 13-part Markdown order, JSON shape, local mirror of all five Full-import validation conditions, full ledger with superseded events |

**The privacy network test, honestly scoped.** `TEST_PLAN.md` asks for a request spy. This repo has **no browser test harness**, and Playwright would be its first such dependency. So the guarantee is three checks that are actually available, with the residual gap stated rather than papered over:

1. A static check that no module under `lib/trust-forward/` or `app/trust-forward*/` references `fetch`, `XMLHttpRequest`, `navigator.sendBeacon` or `WebSocket` — including `telemetry.ts`, which pushes to `dataLayer` and needs none of them.
2. Unit tests driving every allowlist refusal path with canary values.
3. Extending `tests/no-private-state-in-urls.test.ts`'s mechanism over the new route tree: no dynamic segment, no `searchParams` read.

**What that does not cover:** what GA4's own script does after `dataLayer` receives an event. That is Q-B — DevTools on a staging deploy, not a unit test.

**Manual QA**, on device: 320 / 375 / 390 / 430px. Info markers by touch. Popovers fit. Touch targets adequate. Long option labels wrap. Reload restores the active path. Browser back cannot corrupt the ledger. Private-browsing Safari shows the pre-start storage explanation, not a blank screen.

---

## 15. Launch gate

Layer 03's "definition of complete", reconciled with this repo's gates. Do not deploy until every line is true.

- [ ] **SC-TF1** — the three approved recovered categories are promoted per record through the normal content path, `RENDER_MARKED_DRAFT` is untouched, and no unreviewed layer-06 wording renders.
- [ ] **SC-TF2 / SC-TF3** — resolved by layer 05; the stamped policy id is `TF-LITE-AGGREGATION-DOMINANT-POSTURE-LATER-TIEBREAK-v1` and the build reproduces 16/16 reachability from the enumeration test.
- [ ] **Q-C** — no public string claims a profile count; the approved descriptor ships instead.
- [ ] **Q-E** — the aggregate adapter is implemented and ships with `TF_AGGREGATE_ENABLED = false`; a test proves zero network activity while disabled.
- [ ] **SC-TF4** — the stamp ships as **v1.1.0**; v1.0.0 is retained as historical provenance.
- [ ] **SC-TF5** — receipts satisfy the approved invariant, carry no strength field, and all 11 appear in the export in case/decision order.
- [ ] **SC-TF6** — URL authority is resolved (`https://studio.com/benchanviolin/trust-forward`). The remaining Lite-export → Full-import smoke test is an **external compatibility check to run once the Full importer exists**, not a Ben ruling and not a Lite blocker.
- [ ] **SC-TF7** — public copy says "30+ real cases…"; no public string says 42 or 39.
- [ ] **SC-TF8** answered; final route/redirect shape accepted as telemetry.
- [ ] **Q-A** — WYS is out of navigation and discovery, its source is preserved as a non-public stub, and every old entry route redirects to `/` with `permanent: false` and a matching entry in the retired register.
- [ ] **Q-B** checked in the GA4 console.
- [ ] Every public scenario string pinned to the deployed stamp or an immutable content hash.
- [ ] All **43 reachable** variant combinations render deterministically from approved modules — including the two that exist only via the Q-D fallback — and the 12 unreachable authored combinations are preserved as authored source, never deleted (§3 GAP-10(ii)).
- [ ] **Q-D** — the `VERIFY_TRUST` fallback is implemented, fires only on absent evidence, and a named test covers the four prefixes (`AAAA`, `ABAA`, `BAAA`, `BBAA`) that trigger it.
- [ ] No authoring annotation from the layer-06 source (`Signals`, `Suggested copy`, `No interpretation`, stray filenames) appears in any learner-facing record.
- [ ] The historical `39` never renders; public copy says **42**; the provenance file is unedited.
- [ ] The recovered 729 terminal narratives join one-to-one to the exact terminal state; no runtime-generated substitute is used, and no 3-valued `profile_headline` is rendered as a terminal-state title.
- [ ] 729-state SHIP table reproduces exactly.
- [ ] Invalid or incomplete paths yield no SHIP and no export.
- [ ] Lite JSON passes the local fail-closed import-contract validator, is treated as evidence never doctrine, and a real Full-on-Studio import smoke test accepts the final identity/schema shape before release.
- [ ] All five commands in §14 green; `check-bundle-provenance.mjs` reports zero leaks on a real build.
- [ ] Zero files deleted or renamed.
- [ ] Both legal pages name the third browser key, with no hand edit to either page.
- [ ] No public string reads `You are SHIP-…`; "New Game Plus" appears nowhere in the built output.
