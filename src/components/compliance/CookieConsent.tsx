"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Cookie, Settings, Check, X } from "lucide-react";

export interface ConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const STORAGE_KEY = "sfd_cookie_consent_v1";

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<ConsentSettings>({
    necessary: true,
    analytics: true,
    marketing: true,
    timestamp: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setConsent(parsed);
        applyConsent(parsed);
      } else {
        // Show banner after short delay for better UX
        const timer = setTimeout(() => setIsOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const applyConsent = (currentConsent: ConsentSettings) => {
    if (typeof window !== "undefined") {
      // Dispatch custom event for Analytics scripts & GTM
      window.dispatchEvent(
        new CustomEvent("sfd_consent_updated", { detail: currentConsent })
      );

      // Google Consent Mode v2 support
      const win = window as unknown as { gtag?: (...args: unknown[]) => void };
      if (typeof win.gtag === "function") {
        win.gtag("consent", "update", {
          analytics_storage: currentConsent.analytics ? "granted" : "denied",
          ad_storage: currentConsent.marketing ? "granted" : "denied",
          ad_user_data: currentConsent.marketing ? "granted" : "denied",
          ad_personalization: currentConsent.marketing ? "granted" : "denied",
        });
      }
    }
  };

  const handleAcceptAll = () => {
    const updated: ConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    saveAndApply(updated);
  };

  const handleRejectNonEssential = () => {
    const updated: ConsentSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    saveAndApply(updated);
  };

  const handleSavePreferences = () => {
    const updated: ConsentSettings = {
      ...consent,
      necessary: true,
      timestamp: new Date().toISOString(),
    };
    saveAndApply(updated);
    setShowPreferences(false);
  };

  const saveAndApply = (updated: ConsentSettings) => {
    setConsent(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    applyConsent(updated);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Re-Open Badge (Subtle in bottom-right corner) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Cookie & Privacy Settings"
          aria-label="Manage Cookie Preferences"
          className="fixed bottom-5 right-5 z-40 bg-white/90 hover:bg-white text-neutral-700 hover:text-sfd-teal p-2.5 rounded-full shadow-md border border-neutral-200 transition-all hover:scale-105 active:scale-95 group flex items-center gap-1.5"
        >
          <Cookie className="w-4 h-4 text-sfd-teal group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-medium hidden sm:inline-block pr-1 text-neutral-600">
            Cookie Settings
          </span>
        </button>
      )}

      {/* Main Cookie Consent Banner (CookieYes / Cookiebot Style) */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5 flex justify-center animate-in fade-in slide-in-from-bottom duration-300">
          <div className="w-full max-w-4xl bg-white text-[#1d1c1a] rounded-2xl shadow-2xl border border-neutral-200 p-5 sm:p-6 backdrop-blur-md">
            {!showPreferences ? (
              /* Banner View */
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                <div className="flex items-start gap-3.5 max-w-2xl">
                  <div className="w-10 h-10 rounded-xl bg-sfd-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Cookie className="w-5 h-5 text-sfd-teal" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#1d1c1a] flex items-center gap-2">
                      We value your privacy
                      <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                        Cookie Policy
                      </span>
                    </h3>
                    <p className="text-xs sm:text-[13px] text-neutral-600 mt-1 leading-relaxed">
                      SmartFoneDoctor uses cookies and tracking technologies (Google Analytics,
                      Meta Pixel, Microsoft Clarity) to optimize site performance, analyze audience traffic,
                      and deliver personalized repair services and ads. You can customize your preferences anytime.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end">
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-neutral-700 hover:text-sfd-teal bg-neutral-100 hover:bg-neutral-200 transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Customize
                  </button>
                  <button
                    onClick={handleRejectNonEssential}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition active:scale-95"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-sfd-teal hover:bg-[#007f7a] shadow-xs transition active:scale-95"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              /* Detailed Preferences Modal View */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-sfd-teal" />
                    <h3 className="text-base font-bold text-[#1d1c1a]">
                      Customize Cookie & Tracking Preferences
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Necessary Cookies */}
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-neutral-900">Essential & Core</span>
                      <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        Always Active
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Required for store locator maps, session security, and multi-step booking forms.
                    </p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-white">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-neutral-900">Analytics & Insights</span>
                      <input
                        type="checkbox"
                        checked={consent.analytics}
                        onChange={(e) =>
                          setConsent({ ...consent, analytics: e.target.checked })
                        }
                        className="w-4 h-4 accent-sfd-teal cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Google Analytics GA4 and Microsoft Clarity to understand visitor journeys and fix glitches.
                    </p>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-white">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-neutral-900">Marketing & Ads</span>
                      <input
                        type="checkbox"
                        checked={consent.marketing}
                        onChange={(e) =>
                          setConsent({ ...consent, marketing: e.target.checked })
                        }
                        className="w-4 h-4 accent-sfd-teal cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Meta (Facebook) Pixel & Google Ads to provide relevant discounts and repair specials.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="text-xs text-neutral-500 hover:text-neutral-800 underline font-medium"
                  >
                    Back to overview
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRejectNonEssential}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition"
                    >
                      Reject All Optional
                    </button>
                    <button
                      onClick={handleSavePreferences}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-sfd-teal hover:bg-[#007f7a] transition flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save My Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

