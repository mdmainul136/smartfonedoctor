"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function AnalyticsScripts() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-SFD9842";
  const gaId = process.env.NEXT_PUBLIC_GA4_ID || "G-SFDPHILLY1";
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "123456789012345";
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID || "sfdclarity01";

  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    // Read initial consent from localStorage if available
    try {
      const saved = localStorage.getItem("sfd_cookie_consent_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        setConsent({
          necessary: true,
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
        });
      }
    } catch {
      // ignore
    }

    // Listen for real-time consent updates from CookieConsent banner
    const handleConsentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ConsentState>;
      if (customEvent.detail) {
        setConsent({
          necessary: true,
          analytics: Boolean(customEvent.detail.analytics),
          marketing: Boolean(customEvent.detail.marketing),
        });
      }
    };

    window.addEventListener("sfd_consent_updated", handleConsentUpdate);
    return () => {
      window.removeEventListener("sfd_consent_updated", handleConsentUpdate);
    };
  }, []);

  return (
    <>
      {/* 1. Google Consent Mode v2 Default Setup */}
      <Script id="google-consent-mode" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'analytics_storage': '${consent.analytics ? "granted" : "denied"}',
            'ad_storage': '${consent.marketing ? "granted" : "denied"}',
            'ad_user_data': '${consent.marketing ? "granted" : "denied"}',
            'ad_personalization': '${consent.marketing ? "granted" : "denied"}',
            'wait_for_update': 500
          });
        `}
      </Script>

      {/* 2. Google Tag Manager (GTM) */}
      {gtmId && (
        <Script id="gtm-loader" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      )}

      {/* 3. Google Analytics 4 (GA4) */}
      {gaId && consent.analytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
                send_page_view: true
              });
            `}
          </Script>
        </>
      )}

      {/* 4. Meta (Facebook) Pixel */}
      {pixelId && consent.marketing && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* 5. Microsoft Clarity (Session Recordings & Heatmaps) */}
      {clarityId && consent.analytics && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
        </Script>
      )}
    </>
  );
}

