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
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "granted" || stored === "denied") {
      setChoice(stored);
      updateConsent(stored);
      return;
    }

    setChoice(null);
  }, []);

  function choose(nextChoice: ConsentChoice) {
    window.localStorage.setItem(storageKey, nextChoice);
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
