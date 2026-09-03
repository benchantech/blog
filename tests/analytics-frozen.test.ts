import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Analytics freeze (plan Phase 0, user constraint 4).
 *
 * The current GA4 + Consent Mode v2 implementation is preserved UNCHANGED;
 * Watch Your Step telemetry layers on top of it. §10 lists "GA4 measurement ID,
 * stream, consent defaults and ad_* denials are unchanged" as a hard gate but
 * names no file, and tests/preserved-surfaces.test.ts is scoped to routes,
 * redirects and hrefs.
 *
 * components/GoogleAnalytics.tsx is a plain string template, so a one-character
 * edit to `analytics_storage: 'denied'`, or a dropped `ad_user_data` line,
 * produces no test failure, no type error and no build failure. These are
 * literal-presence assertions read with node:fs — cheap, and they make the
 * constraint mechanical instead of aspirational.
 *
 * If a later phase makes one of these fail, the fix is to revert the edit, not
 * to relax the assertion.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readComponent(name: string): string {
  return readFileSync(path.join(repoRoot, "components", name), "utf8");
}

const googleAnalytics = readComponent("GoogleAnalytics.tsx");
const consentBanner = readComponent("ConsentBanner.tsx");

test("the GA4 measurement gate is unchanged", () => {
  for (const literal of [
    "process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID",
    "if (!measurementId) return null;",
    "https://www.googletagmanager.com/gtag/js?id=${measurementId}",
    'id="ga4-init"',
    'strategy="afterInteractive"'
  ]) {
    assert.ok(googleAnalytics.includes(literal), `GoogleAnalytics.tsx lost: ${literal}`);
  }
});

test("Consent Mode v2 defaults are unchanged", () => {
  for (const literal of [
    "gtag('consent', 'default'",
    "analytics_storage: 'denied'",
    "ad_storage: 'denied'",
    "ad_user_data: 'denied'",
    "ad_personalization: 'denied'",
    "wait_for_update: 500"
  ]) {
    assert.ok(googleAnalytics.includes(literal), `GoogleAnalytics.tsx lost the consent default: ${literal}`);
  }
});

test("the ad_* denials and redaction settings are unchanged", () => {
  for (const literal of [
    "ads_data_redaction",
    "gtag('set', 'ads_data_redaction', true);",
    "anonymize_ip: true",
    "send_page_view: true",
    "allow_google_signals: false",
    "allow_ad_personalization_signals: false"
  ]) {
    assert.ok(googleAnalytics.includes(literal), `GoogleAnalytics.tsx lost: ${literal}`);
  }
});

test("the consent storage key is unchanged", () => {
  assert.ok(
    consentBanner.includes('const storageKey = "bct_analytics_consent";'),
    "ConsentBanner.tsx lost the bct_analytics_consent storage key"
  );
});

test("the consent button labels are unchanged", () => {
  // These are approved on-screen strings; the banner is a visual-only restyle.
  assert.ok(consentBanner.includes("Decline"), "ConsentBanner.tsx lost the Decline label");
  assert.ok(consentBanner.includes("Allow analytics"), "ConsentBanner.tsx lost the Allow analytics label");
});

test("the consent update keeps its hardcoded ad_* denials and render guard", () => {
  for (const literal of [
    '"consent", "update"',
    'ad_storage: "denied"',
    'ad_user_data: "denied"',
    'ad_personalization: "denied"',
    "analytics_storage: choice",
    "process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID"
  ]) {
    assert.ok(consentBanner.includes(literal), `ConsentBanner.tsx lost: ${literal}`);
  }
});

test("GoogleAnalytics.tsx renders no markup of its own", () => {
  // It is byte-frozen precisely because every edit risks the Consent Mode v2
  // contract; the restyle must never reach into it.
  assert.ok(!googleAnalytics.includes("className"), "GoogleAnalytics.tsx must carry no styling");
});
