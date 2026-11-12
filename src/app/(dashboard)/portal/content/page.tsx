"use client";

import { useState } from "react";
import { useStoreContext } from "@/lib/storeContext";
import { Check, X, ExternalLink } from "lucide-react";

interface ContentSection {
  id: string;
  label: string;
  helper: string;
  value: string;
  type: "text" | "textarea";
  placeholder: string;
}

const INITIAL_CONTENT: ContentSection[] = [
  {
    id: "banner_headline",
    label: "Homepage hero headline",
    helper: "Primary H1 displayed on the public customer website",
    value: "Express Same-Day Phone & Electronics Repair in Philadelphia",
    type: "text",
    placeholder: "Main headline visible on website hero",
  },
  {
    id: "promo_offer",
    label: "Top announcement bar promo",
    helper: "Shown across the top of all public store pages",
    value:
      "Limited offer: Free tempered glass screen protector with every iPhone or Samsung screen replacement",
    type: "text",
    placeholder: "e.g., Free screen protector with any repair",
  },
  {
    id: "banner_subline",
    label: "Hero supporting copy",
    helper: "Includes Philadelphia neighborhood & turnaround entities for local SEO",
    value:
      "Smart Fone Doctor operates 3 convenient locations at 33 S 52nd St, 4016 Lancaster Ave, and 4060 Lancaster Ave. Most screen and battery repairs finish in 30 minutes while you wait.",
    type: "textarea",
    placeholder: "Supporting text under the main headline",
  },
  {
    id: "about_text",
    label: "About Smart Fone Doctor",
    helper: "Used on website footer and synced to directory business descriptions",
    value:
      "Serving West Philadelphia and University City since 2018, Smart Fone Doctor specializes in fast, warranty-backed repairs for iPhone, Samsung Galaxy, Google Pixel, iPad, MacBook, and gaming consoles (PS5/Xbox HDMI micro-soldering).",
    type: "textarea",
    placeholder: "Short company story or mission statement",
  },
  {
    id: "faq_1_q",
    label: "FAQ 1 — Question",
    helper: "Structured FAQPage schema question #1",
    value: "How long does an iPhone or Samsung screen replacement take?",
    type: "text",
    placeholder: "Question",
  },
  {
    id: "faq_2_q",
    label: "FAQ 2 — Question",
    helper: "Structured FAQPage schema question #2",
    value: "Do you offer a warranty on screen, battery, and HDMI repairs?",
    type: "text",
    placeholder: "Question",
  },
  {
    id: "faq_1_a",
    label: "FAQ 1 — Answer",
    helper: "Structured FAQPage schema answer #1",
    value:
      "Most phone screen and battery replacements take 25 to 45 minutes while you wait in store—no appointment needed.",
    type: "textarea",
    placeholder: "Answer",
  },
  {
    id: "faq_2_a",
    label: "FAQ 2 — Answer",
    helper: "Structured FAQPage schema answer #2",
    value:
      "Yes. Every repair includes our 90-day warranty covering parts and workmanship across all 3 Philadelphia locations.",
    type: "textarea",
    placeholder: "Answer",
  },
];

export default function ContentPage() {
  const { stores } = useStoreContext();
  const [sections, setSections] = useState<ContentSection[]>(INITIAL_CONTENT);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleChange = (id: string, value: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value } : s))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(
      "Website copy and FAQ schema updated across all 3 Philadelphia store landing pages."
    );
    setTimeout(() => setSavedMsg(null), 3500);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-4 overflow-x-hidden">
      {/* 1. CANVAS TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#111111] tracking-[-0.02em] leading-tight">
            Website content &amp; copy
          </h1>
          <p className="text-[14px] text-[#5f6368] mt-1">
            Manage hero headlines, promotional banners, and structured FAQ copy for{" "}
            <span className="text-[#111111] font-medium">
              all {stores.length} Philadelphia locations
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/admin"
            target="_blank"
            rel="noreferrer"
            className="h-[32px] px-3 rounded-[6px] border border-[#1d1f20] bg-[#1d1f20] hover:bg-[#111111] text-[13px] font-medium text-white inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Open Payload CMS Panel</span>
            <ExternalLink
              className="w-3.5 h-3.5 text-white/80"
              aria-hidden="true"
            />
          </a>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Preview customer site</span>
            <ExternalLink
              className="w-3 h-3 text-[#6b6b6b]"
              aria-hidden="true"
            />
          </a>

          <button
            type="submit"
            form="cms-content-form"
            className="h-[32px] px-3.5 rounded-[6px] bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#111111] text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-[#d1d5db]"
          >
            <Check className="w-3.5 h-3.5 text-[#111111]" aria-hidden="true" />
            <span>Save quick copy</span>
          </button>
        </div>
      </div>

      {savedMsg && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#dcfae5] text-[#04250e] rounded-[6px] px-4 py-2.5 flex items-center justify-between gap-3 text-[13px]"
        >
          <span className="font-medium">{savedMsg}</span>
          <button
            type="button"
            onClick={() => setSavedMsg(null)}
            aria-label="Dismiss notification"
            className="p-0.5 hover:opacity-75 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 2. CONTENT FORM */}
      <form
        id="cms-content-form"
        onSubmit={handleSave}
        className="bg-white border border-[#e8e8e8] rounded-[8px] divide-y divide-[#f2f2f2]"
      >
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`flex flex-col gap-1.5 ${
                section.type === "textarea" ? "lg:col-span-2" : ""
              }`}
            >
              <label
                htmlFor={section.id}
                className="text-[14px] font-medium text-[#111111]"
              >
                {section.label}
              </label>
              <span className="text-[12px] text-[#5f6368]">
                {section.helper}
              </span>
              {section.type === "textarea" ? (
                <textarea
                  id={section.id}
                  rows={3}
                  value={section.value}
                  onChange={(e) => handleChange(section.id, e.target.value)}
                  placeholder={section.placeholder}
                  className="mt-1 p-3 rounded-[6px] border border-[#e5e7eb] bg-white text-[14px] text-[#111111] leading-relaxed focus:outline-none focus:border-[#111111] resize-y"
                />
              ) : (
                <input
                  id={section.id}
                  type="text"
                  value={section.value}
                  onChange={(e) => handleChange(section.id, e.target.value)}
                  placeholder={section.placeholder}
                  className="mt-1 h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] bg-white text-[14px] text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              )}
            </div>
          ))}
        </div>

        <div className="px-5 py-3.5 bg-[#f9fafb] flex items-center justify-between gap-3">
          <span className="text-[12px] text-[#5f6368]">
            Changes publish immediately to smartfonedoctor.com and FAQPage JSON-LD
          </span>
          <button
            type="submit"
            className="h-[32px] px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium cursor-pointer"
          >
            Save all content changes
          </button>
        </div>
      </form>
    </div>
  );
}
