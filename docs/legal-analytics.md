# Legal and Analytics Notes

BenChanTech.com is owned and operated by Ben Chan Tech LLC.

- Contact: ben@benchantech.com
- Governing state: New York
- GA4 Measurement ID: `G-25PDJ8VRNT`
- Google Cloud project: `benchantech-272710`
- Vercel env: `NEXT_PUBLIC_GA_MEASUREMENT_ID`

GA4 is loaded with direct `gtag.js`, not Google Tag Manager. Consent Mode v2 defaults analytics storage to denied, and the first-party consent banner updates analytics storage only after the visitor allows analytics.

The local gcloud project is `benchantech-272710`, but the currently available gcloud credentials did not have GA Admin account-listing permission during setup. The known Benchantech GA4 web stream ID from the legacy site was reused.

## The second event source (added by the facelift branch)

`components/GoogleAnalytics.tsx` and `components/ConsentBanner.tsx` are unchanged — the Consent Mode v2 contract and the `bct_analytics_consent` state machine are byte-frozen. What is new is a **second source of events on top of them**: `lib/wys/telemetry.ts`, the Watch Your Step adapter. Leaving this file describing one event source would be exactly the code/doc drift the refresh exists to prevent.

The adapter is a refusal with a send path attached, not a wrapper. It is the only place in the shipped tree that pushes to `dataLayer`, and it drops an event unless every one of these holds:

1. `WYS_TELEMETRY_ENABLED` is true;
2. the event name is on the closed allowlist below;
3. every property key is on the closed property allowlist, and every value is inside its declared domain;
4. `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set;
5. `bct_analytics_consent === "granted"` — a browser that declined, or has not chosen, sends nothing at all.

Condition 5 is stricter than Consent Mode v2 on its own: ordinary GA4 page pings continue cookielessly while storage is denied, but no Watch Your Step event is emitted in that state. `/watch-your-step/data` renders a state line saying which of those three cases the reader is in.

### Event allowlist (WYS §19.4), closed

`wys_view` · `wys_start` · `wys_onboarding_complete` · `wys_source_period_start` · `wys_source_period_complete` · `wys_course_complete` · `wys_replay` · `wys_carry_reached` · `wys_transfer_check_complete` · `wys_data_manifest_view` · `wys_local_state_clear` · `wys_restart_course` · `wys_depth_interest`

`wys_view` and `wys_transfer_check_complete` stay on the list and are deliberately unfired in v0; `WYS_DECISION_USE` in the adapter records the decision each event serves, and `WYS_UNFIRED_IN_V0` derives the unfired set from it.

### Property allowlist (WYS §19.1A), closed

`lesson_index` · `source_period_id` · `content_version` · `route_type`

No learner answer, judgment, rulebook entry, posture choice, cadence, time budget or From Memory text may appear in a property, a path segment, a query parameter or a page title. `tests/no-private-state-in-urls.test.ts` enforces the URL half, which no adapter could police.

### Aggregate endpoint — NOT BUILT

`lib/wys/aggregate.ts` is the "disabled and documented" half required by WYS §19.2 and §30. `WYS_AGGREGATE_ENABLED` is `false`, `AGGREGATE_ENDPOINT` is `null`, and **no `app/api/wys/aggregate/route.ts` exists**. `wys_scenario_choice` and `wys_scenario_skip` are refused by name by `trackWys` so they can never reach GA4. Nothing on the site claims the counter runs: the approved sentence describing it lives behind `aggregateCounterSentence()` and is absent from the DOM while the flag is off.

## Browser storage

Two keys, both `localStorage`, neither a cookie, both listed on `/privacy` and `/cookies` from `lib/wys/browser-keys.ts`:

| Key | Written by | Holds | Cleared by "Clear this browser's data" |
|---|---|---|---|
| `wys:v1` | `lib/wys/local-state.ts` | onboarding choices, curriculum progress, kept judgments, the rulebook, deeper-practice interest, last course route | yes |
| `bct_analytics_consent` | `components/ConsentBanner.tsx` | whether analytics were allowed or declined on this device | no |

There is no server-side copy of either. The course has no database behind it, and `lib/db/client.ts` remains an unimported stub.

## Where the legal pages get their claims

Each of the six refreshed pages renders `CanonicalText` records rather than typing claims out: `content/claims.ts` (the nine shared claims), `content/legal.ts` (page-specific prose), and `content/watch-your-step/data.ts` (the clearing sentences, shared word-for-word with the Data page). `tests/legal-claims.test.ts` runs the forbidden-claims audit and checks each claim against the module that implements it. Update the record, not the page.
