"use client";

import React from "react";
import Script from "next/script";

export default function CookieYesIntegration() {
  const cookieYesKey = process.env.NEXT_PUBLIC_COOKIEYES_KEY;
  const cookiebotId = process.env.NEXT_PUBLIC_COOKIEBOT_ID;

  // 1. Official Cookiebot Integration
  if (cookiebotId) {
    return (
      <Script
        id="Cookiebot"
        src="https://consent.cookiebot.com/uc.js"
        data-cbid={cookiebotId}
        data-blockingmode="auto"
        type="text/javascript"
        strategy="beforeInteractive"
      />
    );
  }

  // 2. Official CookieYes Integration
  if (cookieYesKey) {
    return (
      <Script
        id="cookieyes"
        type="text/javascript"
        src={`https://cdn-cookieyes.com/client_data/${cookieYesKey}/script.js`}
        strategy="beforeInteractive"
      />
    );
  }

  // If neither key is provided in environment variables yet:
  return null;
}

