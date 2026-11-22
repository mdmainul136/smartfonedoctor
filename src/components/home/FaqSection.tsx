"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { FAQ_DEFAULTS, pickList, pickText, type FaqSectionProps } from "./sectionContent";

export interface FaqItem {
  question: string;
  answer: string;
}

/** Built-in home FAQs (also used for the page's FAQ schema when nothing is edited). */
export const HOMEPAGE_FAQS: FaqItem[] = FAQ_DEFAULTS.items;

/** The questions a Home FAQ section shows: its edited list, or the built-in one. */
export function homeFaqItems(props?: FaqSectionProps): FaqItem[] {
  return pickList(props?.items, FAQ_DEFAULTS.items).filter((f) => f.question && f.answer);
}

export function FaqSection(props: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const faqs = homeFaqItems(props);
  const half = Math.ceil(faqs.length / 2);
  const FAQS_COL1 = faqs.slice(0, half);
  const FAQS_COL2 = faqs.slice(half);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1100px] mx-auto">

        {/* Heading */}
        <h2 className="text-[22px] sm:text-[26px] font-[550] text-[#1d1c1a] text-center mb-8 sm:mb-10 tracking-tight">
          {pickText(props.heading, FAQ_DEFAULTS.heading)}
        </h2>

        {/* 2-Column Accordion Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

          {/* Left Column */}
          <div className="flex flex-col gap-3">
            {FAQS_COL1.map((faq, idx) => {
              const key = `col1-${idx}`;
              const isOpen = openIndex === key;
              return (
                <div
                  key={key}
                  className="rounded-[10px] overflow-hidden bg-[#242634] text-white shadow-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 hover:bg-[#2b2d3d] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[13.5px] sm:text-[14px] font-normal leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-white shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-[13px] text-neutral-300 leading-relaxed border-t border-neutral-700/60 bg-[#1c1e2a]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-3">
            {FAQS_COL2.map((faq, idx) => {
              const key = `col2-${idx}`;
              const isOpen = openIndex === key;
              return (
                <div
                  key={key}
                  className="rounded-[10px] overflow-hidden bg-[#242634] text-white shadow-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 hover:bg-[#2b2d3d] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[13.5px] sm:text-[14px] font-normal leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-white shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-[13px] text-neutral-300 leading-relaxed border-t border-neutral-700/60 bg-[#1c1e2a]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* View All FAQs CTA */}
        <div className="text-center mt-10">
          <Link
            href={pickText(props.buttonLink, FAQ_DEFAULTS.buttonLink)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition border border-neutral-200/80"
          >
            <span>{pickText(props.buttonText, FAQ_DEFAULTS.buttonText)}</span>
            <ArrowRight className="w-3.5 h-3.5 text-sfd-teal" />
          </Link>
        </div>

      </div>
    </section>
  );
}

