# Ben Chan Tech — Current State

**Date:** 2026-09-10
**Branch:** `ai-native-company`

## Current experiment

Ben Chan Tech is being rebuilt as an AI-native company under a hard operating constraint: one $20/month ChatGPT Plus subscription is the only required AI workforce expense.

The company should use ChatGPT as the primary cognitive and editorial workforce, GitHub as durable state and publication substrate, and deterministic web artifacts as the default public runtime.

## Current public positioning

Ben Chan Tech is the live operating experiment.

The central question is how much real company work can move from human execution to AI execution while human judgment, provenance, authorship, and accountability remain intact.

## Developer Forward

- Full Developer Forward offering: discontinued for now.
- Developer Forward Lite: remains public, free, deterministic, no account, no runtime AI.
- `/developer-forward`: remains canonical and should continue accumulating search/AEO/GEO value as the developer-judgment evidence hub.
- `/developer-forward-lite`: remains the working Lite experience.
- No coupon, paid upgrade, checkout, or active full-course destination is currently promised.
- A future Developer Forward course may be published in a traditional course format such as Coursera or a similar platform, but no destination is selected.

## Preserve by default

Existing indexed, harmless, or evidence-bearing surfaces should remain reachable and canonical unless there is a specific reason to retire or redirect them.

Priority preservation includes:

- `/developer-forward`
- `/developer-forward-lite`
- `/neon`
- `/studio` while harmless and useful as historical/reviewer surface
- legal/disclosure routes
- sitemap and robots
- `llms.txt`
- canonical-surface registry
- Ben Chan / Ben Chan Tech professional evidence, including the controlled `/upwork` route
- links to YY Method, BenChanViolin, YY & Me, and Resonant Patterns
- historical source and governance artifacts in the repository

## Current build direction

1. Reframe the homepage around the $20 AI-native company experiment.
2. Keep Developer Forward as an indexed evidence surface rather than an active paid product.
3. Keep Lite working without a coupon or upgrade promise.
4. Preserve harmless legacy surfaces where they can continue accumulating value.
5. Expand later into self-contained answer surfaces backed by real cases and current experiments.
6. Avoid adding any paid AI runtime dependency.

## Current implementation status on this branch

- New AI-native mission content added.
- New homepage framing added while keeping Developer Forward, Lite, Neon, Upwork/professional evidence, YY Method, YY & Me, Resonant Patterns, and reviewer routes reachable.
- Root metadata updated for the AI-native company experiment.
- Developer Forward changed from an active full-product sales surface to an indexed evidence hub with its existing answer-first FAQ retained.
- Developer Forward Lite remains the working deterministic experience and no longer exposes a paid upgrade/coupon surface.
- `/df` no longer points to Studio; it resolves to `/developer-forward` until a real future course destination exists.
- Legacy full/coupon route fields resolve internally to `/developer-forward` for compatibility with archived code rather than an external checkout.
- Company constitution and ADR 0010 added.
- Agent bootstrap now reads the company constitution/current state before product-era governance.
- `/llms.txt` now states the current company mission, $20 constraint, and canonical homepage before listing the preserved surface map.
- Preservation tests were rebased from the superseded 2026-09-04 homepage/Studio-offer assumptions to the current load-bearing surface rules.

## Verification boundary

The GitHub connector can inspect and mutate the repository but does not execute the Next.js runtime. A real `npm test`, TypeScript/build run, and browser render remain required before merge or production deployment. Those runtime checks are an implementation-verification step, not a reason to change the $20 operating architecture.
