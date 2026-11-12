"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS_COL1: FaqItem[] = [
  {
    question: "How do I book a repair at a SmartFoneDoctor store?",
    answer:
      "You can book an appointment directly through our online store locator by selecting your nearest location and choosing 'Book Repair'. You can also call your local store or walk in anytime during business hours for same-day service.",
  },
  {
    question: "What kinds of devices do you repair?",
    answer:
      "We repair all major smartphone models (Apple iPhone, Samsung Galaxy, Google Pixel, Motorola), iPads and tablets, MacBooks, Windows laptops, desktop computers, gaming consoles (PlayStation, Xbox, Nintendo), and smartwatches.",
  },
  {
    question: "How much will my repair cost?",
    answer:
      "Pricing depends on the specific device model and type of repair needed. We provide a completely free diagnostic inspection and upfront estimate before any work begins, so you know the exact cost with no surprise fees.",
  },
];

const FAQS_COL2: FaqItem[] = [
  {
    question: "How long will my repair take?",
    answer:
      "Most standard smartphone repairs, such as cracked screen replacements and battery swaps, are completed in under 45 minutes to 1 hour. Tablet, laptop, and console repairs are usually completed same-day or within 24 to 48 hours.",
  },
  {
    question: "Does SmartFoneDoctor use certified parts?",
    answer:
      "Yes, we exclusively utilize OEM-grade and certified premium replacement parts that meet strict industry quality and safety specifications. All parts installed by our WISE Certified technicians include our limited warranty.",
  },
  {
    question: "Do you sell Certified Pre-Owned (CPO) devices?",
    answer:
      "Yes! Many of our SmartFoneDoctor locations carry a wide selection of fully inspected, cleaned, and tested Certified Pre-Owned smartphones, tablets, and laptops. Each device comes backed with a warranty for your peace of mind.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1100px] mx-auto">

        {/* Heading */}
        <h2 className="text-[22px] sm:text-[26px] font-[550] text-[#1d1c1a] text-center mb-8 sm:mb-10 tracking-tight">
          Frequently Asked Questions about SmartFoneDoctor
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

      </div>
    </section>
  );
}

