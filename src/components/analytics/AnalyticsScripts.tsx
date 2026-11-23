"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  cleanClarityId,
  cleanGa4Id,
  cleanGtmId,
  cleanMetaPixelId,
  trackClickAction,
  trackFaqExpand,
  trackPageView,
  trackScrollDepth,
  trackSiteSearch,
  trackViewContent,
  type AnalyticsTrackingConfig,
} from "@/lib/analyticsDataLayer";

function isExcludedAdminPath(path: string): boolean {
  return (
    path.startsWith("/admin") ||
    path.startsWith("/profile") ||
    path.startsWith("/settings") ||
    path.startsWith("/sign-in")
  );
}

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function AnalyticsScripts({
  config,
}: {
  config?: AnalyticsTrackingConfig;
}) {
  const pathname = usePathname();
  const hasTrackedInitialRef = useRef(false);

  const gtmId =
    cleanGtmId(config?.gtmContainerId) ||
    cleanGtmId(process.env.NEXT_PUBLIC_GTM_ID);
  const gaId =
    cleanGa4Id(config?.ga4MeasurementId) ||
    cleanGa4Id(process.env.NEXT_PUBLIC_GA4_ID);
  const pixelId =
    cleanMetaPixelId(config?.metaPixelId) ||
    cleanMetaPixelId(process.env.NEXT_PUBLIC_META_PIXEL_ID);
  const clarityId =
    cleanClarityId(config?.clarityProjectId) ||
    cleanClarityId(process.env.NEXT_PUBLIC_CLARITY_ID);

  const enableDataLayer = config?.enableDataLayer !== false;
  const enableDebugEvents = Boolean(config?.enableDebugEvents);

  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
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

    const handleConsentUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ConsentState>;
      if (customEvent.detail) {
        const nextMarketing = Boolean(customEvent.detail.marketing);
        setConsent({
          necessary: true,
          analytics: Boolean(customEvent.detail.analytics),
          marketing: nextMarketing,
        });
        const win = window as unknown as { fbq?: (...args: unknown[]) => void };
        if (typeof win.fbq === "function") {
          win.fbq("consent", nextMarketing ? "grant" : "revoke");
        }
      }
    };

    window.addEventListener("sfd_consent_updated", handleConsentUpdate);
    return () => {
      window.removeEventListener("sfd_consent_updated", handleConsentUpdate);
    };
  }, []);

  // Sync runtime flags used by pushDataLayerEvent() & trackMetaEvent()
  useEffect(() => {
    const win = window as unknown as {
      __SFD_DL_ENABLED__?: boolean;
      __SFD_DL_DEBUG__?: boolean;
      __SFD_HAS_GTM__?: boolean;
      __SFD_HAS_GA4__?: boolean;
    };
    win.__SFD_DL_ENABLED__ = enableDataLayer;
    win.__SFD_DL_DEBUG__ = enableDebugEvents;
    win.__SFD_HAS_GTM__ = Boolean(gtmId);
    win.__SFD_HAS_GA4__ = Boolean(gaId);
  }, [enableDataLayer, enableDebugEvents, gtmId, gaId]);

  // Track initial + SPA route navigations & content views across DataLayer, GA4 & Meta Pixel
  useEffect(() => {
    if (!enableDataLayer || !pathname || isExcludedAdminPath(pathname)) return;

    const isSpaNavigation = hasTrackedInitialRef.current;
    hasTrackedInitialRef.current = true;

    trackPageView(pathname, { sendMetaPageView: isSpaNavigation });
    trackViewContent(pathname);
  }, [pathname, enableDataLayer]);

  // Track scroll depth milestones (50% & 90%) once per public page route
  useEffect(() => {
    if (!enableDataLayer || !pathname || isExcludedAdminPath(pathname)) return;

    const reached = new Set<number>();
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((window.scrollY / docHeight) * 100);
      if (pct >= 50 && !reached.has(50)) {
        reached.add(50);
        trackScrollDepth(50, pathname);
      }
      if (pct >= 90 && !reached.has(90)) {
        reached.add(90);
        trackScrollDepth(90, pathname);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, enableDataLayer]);

  // Delegated click listener for high-intent customer actions + FAQ opens
  useEffect(() => {
    if (!enableDataLayer) return;

    const handleFaqCaptureClick = (e: MouseEvent) => {
      const pagePath = window.location.pathname;
      if (isExcludedAdminPath(pagePath)) return;
      const target = e.target as Element | null;
      if (!target) return;

      const summary = target.closest?.("details:not([open]) > summary") as HTMLElement | null;
      if (summary) {
        trackFaqExpand(summary.textContent || "", pagePath);
        return;
      }

      const faqBtn = target.closest?.(
        'button[data-faq-trigger], button[aria-expanded="false"]'
      ) as HTMLButtonElement | null;
      if (!faqBtn || faqBtn.closest("header, nav")) return;

      const text = (faqBtn.textContent || "").trim();
      if (
        faqBtn.getAttribute("aria-expanded") === "false" &&
        (faqBtn.hasAttribute("data-faq-trigger") || text.endsWith("?"))
      ) {
        trackFaqExpand(text, pagePath);
      }
    };

    let searchTimer: ReturnType<typeof setTimeout> | null = null;
    let lastSearchKey = "";

    const handleSearchInput = (e: Event) => {
      const pagePath = window.location.pathname;
      if (isExcludedAdminPath(pagePath)) return;
      const input = e.target as HTMLInputElement | null;
      if (!input || input.tagName !== "INPUT") return;
      if (
        !input.matches(
          'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]'
        )
      ) {
        return;
      }

      const term = input.value.trim();
      if (searchTimer) clearTimeout(searchTimer);
      if (term.length < 3) return;

      searchTimer = setTimeout(() => {
        const key = `${pagePath}:${term.toLowerCase()}`;
        if (key === lastSearchKey) return;
        lastSearchKey = key;
        trackSiteSearch(term, pagePath);
      }, 900);
    };

    const handleClick = (e: MouseEvent) => {
      const pagePath = window.location.pathname;
      if (isExcludedAdminPath(pagePath)) return;
      const target = e.target as Element | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = (anchor.getAttribute("href") || "").trim();
      if (!href) return;

      const linkText = (
        anchor.textContent ||
        anchor.getAttribute("aria-label") ||
        anchor.title ||
        ""
      )
        .trim()
        .slice(0, 80);

      if (href.startsWith("tel:")) {
        trackClickAction("phone_click", {
          link_url: href,
          link_text: linkText,
          page_path: pagePath,
        });
      } else if (href.startsWith("mailto:")) {
        trackClickAction("email_click", {
          link_url: href,
          link_text: linkText,
          page_path: pagePath,
        });
      } else if (
        href.includes("maps.google.") ||
        href.includes("google.com/maps") ||
        href.includes("share.google")
      ) {
        trackClickAction("directions_click", {
          link_url: href,
          link_text: linkText,
          page_path: pagePath,
        });
      } else if (href.startsWith("/schedule-repair")) {
        trackClickAction("booking_cta_click", {
          link_url: href,
          link_text: linkText,
          page_path: pagePath,
        });
      }
    };

    document.addEventListener("click", handleFaqCaptureClick, true);
    document.addEventListener("input", handleSearchInput, true);
    document.addEventListener("click", handleClick);
    return () => {
      if (searchTimer) clearTimeout(searchTimer);
      document.removeEventListener("click", handleFaqCaptureClick, true);
      document.removeEventListener("input", handleSearchInput, true);
      document.removeEventListener("click", handleClick);
    };
  }, [enableDataLayer]);

  return (
    <>
      {/* 1. Google Consent Mode v2 Default Setup */}
      <Script id="google-consent-mode" strategy="afterInteractive">
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

      {/* 2. Google Tag Manager (GTM) + <noscript> fallback */}
      {gtmId && (
        <>
          <Script id="gtm-loader" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
          <noscript>
            <iframe
              title="Google Tag Manager"
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* 3. Google Analytics 4 (GA4) — send_page_view:false prevents duplicate hits with trackPageView() */}
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
                send_page_view: false
              });
            `}
          </Script>
        </>
      )}

      {/* 4. Meta (Facebook) Pixel + <noscript> fallback */}
      {pixelId && consent.marketing && (
        <>
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
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
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
