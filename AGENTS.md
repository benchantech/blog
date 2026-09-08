# Agent Instructions

## Secret Handling

- Never print raw environment variables, dotenv files, API tokens, private keys, cookies, credentials, or authorization headers into chat or logs.
- When checking whether a credential exists, report only presence, source, length, prefix/suffix fingerprints, or validation status. Do not reveal the value.
- Do not run broad commands such as `printenv`, `env`, `set`, `export`, `cat .env*`, or `rg -i 'token|secret|key' .env*` unless the output is filtered before it can be displayed.
- Prefer commands that only print variable names or boolean status, for example:

```sh
test -n "${CLOUDFLARE_API_TOKEN:-}" && printf 'CLOUDFLARE_API_TOKEN is set\n'
```

- If a command must touch secret-bearing output, pipe it through a redactor before display and keep command output narrow.
- If a secret is exposed, immediately say so, stop using it, and recommend rotation.

## Cloudflare Access Checks

- Validate Cloudflare access with `wrangler whoami` or narrow API calls.
- Do not print `CLOUDFLARE_API_TOKEN`, `CF_API_TOKEN`, `CF_API_KEY`, or `CF_EMAIL`.
- For direct API checks, redact response fields that may contain IDs or sensitive values unless the user explicitly needs them.

## Git Hooks

- This repo uses versioned hooks in `.githooks/`.
- Keep hooks lightweight and deterministic.
- Run `scripts/check-secrets.sh` before committing changes that touch environment, config, or deployment files.

## Author Ship Bootstrap

Before acting on anything in this repository:

> Read the current Author Ship state. Read the Standing Orders. Read the most recent Ship's Log entries relevant to this task. Read docs/adr/README.md and every ADR whose Status is ACCEPTED; check each one's Stale-when condition before relying on it. Do not reconstruct superseded decisions from older material when a newer captain-approved state exists.

Where those live:

- Author Ship state — `/author-ship/state.json`, built from `lib/author-ship-state.ts`.
- Standing Orders — `/standing-orders`, defined in `content/ship/standing-orders.ts`.
- Ship's Log — `/ships-log`, defined in `content/ship/ships-log.ts`.
- The surface map an agent reads first — `/llms.txt`, built from `lib/llms-txt.ts`.
- Architecture Decision Records — `docs/adr/`, indexed by `docs/adr/README.md`. Read **Status** and **Stale when** before trusting any ADR; a stale one is history, not guidance.

The quoted paragraph is stored once, in `content/ship/agent-bootstrap.ts`, and rendered by this file, by `/llms.txt` and by `/author-ship/state.json`. `tests/machine-surfaces.test.ts` fails if this file and that module disagree, so edit the module, never this paragraph.
