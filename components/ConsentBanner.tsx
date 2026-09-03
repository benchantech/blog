"use client";

import { useEffect, useState } from "react";

type ConsentChoice = "granted" | "denied";

const storageKey = "bct_analytics_consent";

declare global {
  interface Window {
    gtag?: (command: "consent", action: "update", params: Record<string, string>) => void;
  }
}

function updateConsent(choice: ConsentChoice) {
  window.gtag?.("consent", "update", {
    analytics_storage: choice,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
}

export function ConsentBanner() {
  const [choice, setChoice] = useState<ConsentChoice | null | "unknown">("unknown");

  useEffect(() => {
    // Hardened in Phase 2 (plan §7.3): iOS Safari private browsing and
    // block-all-cookies throw on localStorage access. Behaviour is otherwise
    // unchanged - a throw is read as no stored choice.
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(storageKey);
    } catch {
      stored = null;
    }
    if (stored === "granted" || stored === "denied") {
      setChoice(stored);
      updateConsent(stored);
      return;
    }

    setChoice(null);
  }, []);

  function choose(nextChoice: ConsentChoice) {
    try {
      window.localStorage.setItem(storageKey, nextChoice);
    } catch {
      // Storage blocked. The choice still applies to this page view; it just
      // cannot be remembered, so the banner returns on the next visit.
    }
    updateConsent(nextChoice);
    setChoice(nextChoice);
  }

  if (choice !== null || !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return null;

  return (
    <section className="consent-banner" aria-label="Analytics cookie notice">
      <p>BenChanTech uses Google Analytics to understand aggregate site use. Analytics cookies are optional.</p>
      <div>
        <button type="button" onClick={() => choose("denied")}>
          Decline
        </button>
        <button type="button" onClick={() => choose("granted")}>
          Allow analytics
        </button>
      </div>
    </section>
  );
}
