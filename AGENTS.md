# Agent Instructions

## Read this first

Before acting in this repository, read:

1. `company/CONSTITUTION.md`
2. `company/CURRENT_STATE.md`
3. `docs/adr/README.md`
4. every ADR whose Status is `ACCEPTED`, checking its `Stale when` condition before relying on it

Then read the current Author Ship state, Standing Orders, and relevant Ship's Log entries when the task touches preserved governance/history surfaces. Do not reconstruct superseded decisions from older material when a newer captain-approved state exists.

## Core operating rule

The site is being rebuilt as the public surface of a $20/month AI-native company experiment.

ChatGPT Plus is the only required AI operating expense. Do not introduce a paid AI API, additional AI subscription, agent platform, vector database, AI CMS, or other recurring AI service as a required dependency for the core public site.

Prefer ordinary deterministic artifacts: TypeScript, React, CSS, JSON, Markdown, static metadata, static routes, local browser state, and existing Vercel/GitHub infrastructure.

If a task can be completed directly in ChatGPT and represented as ordinary code/content, do not route it to another AI tool merely because that tool exists.

## Authority

AI may execute autonomously inside delegated authority. AI may not expand its own authority.

Escalate only for consequential judgment, material ambiguity, irreversible external action, money or contract commitments, unsupported public claims, or conflicts with governing evidence.

Do not escalate routine implementation decisions.

## Preservation

Preserve existing indexed, harmless, or evidence-bearing surfaces by default. Do not delete or redirect a working canonical URL merely because a new homepage or information architecture is being built.

Developer Forward is no longer an active full paid offering. `/developer-forward` remains the canonical indexed developer-judgment evidence hub. `/developer-forward-lite` remains the free deterministic Lite experience. There is currently no coupon, checkout, or full-course destination.

## Provenance

AI may search, organize, synthesize, and pressure-test Ben's record. It may not manufacture Ben's experience, historical facts, present judgment, authorship, or source provenance.

Synthetic simulations must be labeled as simulations and must never be passed off as real cases.

History is append-only. Current interpretations may change; the historical record should not be silently rewritten.

## Secret Handling

- Never print raw environment variables, dotenv files, API tokens, private keys, cookies, credentials, or authorization headers into chat or logs.
- When checking whether a credential exists, report only presence, source, length, prefix/suffix fingerprints, or validation status.
- Do not run broad secret-dumping commands.
- If a secret is exposed, say so immediately, stop using it, and recommend rotation.

## Git Hooks and verification

- Keep hooks lightweight and deterministic.
- Run `scripts/check-secrets.sh` before committing changes that touch environment, config, or deployment files.
- Follow accepted ADRs governing verification, parser independence, scripted edits, and concurrent file ownership.

## Preserved Author Ship bootstrap locations

- Author Ship state — `/author-ship/state.json`, built from `lib/author-ship-state.ts`.
- Standing Orders — `/standing-orders`, defined in `content/ship/standing-orders.ts`.
- Ship's Log — `/ships-log`, defined in `content/ship/ships-log.ts`.
- Machine surface map — `/llms.txt`, built from `lib/llms-txt.ts`.
- Architecture Decision Records — `docs/adr/`.
