"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import {
  Type,
  SunMedium,
  Link as LinkIcon,
  RotateCcw,
  X,
  Sparkles,
  Volume2,
} from "lucide-react";

export default function UserWayWidget() {
  const userwayAccount = process.env.NEXT_PUBLIC_USERWAY_ACCOUNT_ID;
  const [isOpen, setIsOpen] = useState(false);

  // Accessibility States
  const [textSize, setTextSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [stopAnimations, setStopAnimations] = useState(false);

  // Apply classes to documentElement
  useEffect(() => {
    const root = document.documentElement;

    // Text Size
    root.classList.remove("text-size-large", "text-size-xlarge");
    if (textSize === "large") root.classList.add("text-size-large");
    if (textSize === "xlarge") root.classList.add("text-size-xlarge");

    // Contrast
    if (highContrast) {
      root.classList.add("sfd-high-contrast");
    } else {
      root.classList.remove("sfd-high-contrast");
    }

    // Highlight Links
    if (highlightLinks) {
      root.classList.add("sfd-highlight-links");
    } else {
      root.classList.remove("sfd-highlight-links");
    }

    // Dyslexic Font
    if (dyslexicFont) {
      root.classList.add("sfd-dyslexic-font");
    } else {
      root.classList.remove("sfd-dyslexic-font");
    }

    // Pause Animations
    if (stopAnimations) {
      root.classList.add("sfd-no-animations");
    } else {
      root.classList.remove("sfd-no-animations");
    }
  }, [textSize, highContrast, highlightLinks, dyslexicFont, stopAnimations]);

  const handleReset = () => {
    setTextSize("normal");
    setHighContrast(false);
    setHighlightLinks(false);
    setDyslexicFont(false);
    setStopAnimations(false);
  };

  return (
    <>
      {/* Official UserWay Script if account ID is set */}
      {userwayAccount && (
        <Script
          src={`https://cdn.userway.org/widget.js?account=${userwayAccount}`}
          strategy="lazyOnload"
        />
      )}

      {/* Built-in Floating UserWay Blue Badge (Identical to CPR Screen) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility Menu"
        title="Accessibility Tools"
        className="fixed bottom-5 left-5 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0072b2] hover:bg-[#005a8e] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ring-2 ring-white/80"
      >
        {/* Universal Accessibility Figure SVG */}
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 sm:w-7 sm:h-7"
          aria-hidden="true"
        >
          <circle cx="12" cy="4.5" r="2.2" />
          <path d="M12 8c-3.1 0-5.7.9-7.5 2.1l1.1 1.8c1.3-.9 3.5-1.6 6.4-1.6 2.9 0 5.1.7 6.4 1.6l1.1-1.8C17.7 8.9 15.1 8 12 8z" />
          <path d="M10.5 11.5v6.5l-2.2 4.5 1.8.9 2.4-4.8 1 0 2.4 4.8 1.8-.9-2.2-4.5v-6.5h-5z" />
        </svg>
      </button>

      {/* Accessibility Interactive Panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 sm:left-6 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white text-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 p-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0072b2]"></span>
              <h4 className="text-sm font-bold text-neutral-900">Accessibility Menu</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-2.5">
            {/* Text Size Control */}
            <div className="p-2.5 rounded-xl bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <Type className="w-4 h-4 text-[#0072b2]" />
                <span>Text Size</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTextSize("normal")}
                  className={`px-2 py-0.5 text-xs rounded ${
                    textSize === "normal"
                      ? "bg-[#0072b2] text-white font-bold"
                      : "bg-white text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setTextSize("large")}
                  className={`px-2 py-0.5 text-xs rounded ${
                    textSize === "large"
                      ? "bg-[#0072b2] text-white font-bold"
                      : "bg-white text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  A+
                </button>
                <button
                  onClick={() => setTextSize("xlarge")}
                  className={`px-2 py-0.5 text-xs rounded ${
                    textSize === "xlarge"
                      ? "bg-[#0072b2] text-white font-bold"
                      : "bg-white text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  A++
                </button>
              </div>
            </div>

            {/* High Contrast Toggle */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition cursor-pointer ${
                highContrast
                  ? "bg-[#0072b2] text-white"
                  : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <SunMedium className="w-4 h-4" />
                <span>High Contrast Mode</span>
              </div>
              <span>{highContrast ? "ON" : "OFF"}</span>
            </button>

            {/* Highlight Links */}
            <button
              onClick={() => setHighlightLinks(!highlightLinks)}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition cursor-pointer ${
                highlightLinks
                  ? "bg-[#0072b2] text-white"
                  : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                <span>Highlight Links</span>
              </div>
              <span>{highlightLinks ? "ON" : "OFF"}</span>
            </button>

            {/* Dyslexia Friendly */}
            <button
              onClick={() => setDyslexicFont(!dyslexicFont)}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition cursor-pointer ${
                dyslexicFont
                  ? "bg-[#0072b2] text-white"
                  : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Dyslexia Friendly Font</span>
              </div>
              <span>{dyslexicFont ? "ON" : "OFF"}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
            <button
              onClick={handleReset}
              className="text-neutral-500 hover:text-red-600 flex items-center gap-1 font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
            <span className="text-[10px] text-neutral-400">UserWay Compatible</span>
          </div>
        </div>
      )}
    </>
  );
}

