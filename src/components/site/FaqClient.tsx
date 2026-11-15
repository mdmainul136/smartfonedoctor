"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, Calendar, MapPin, Wrench, Search } from "lucide-react";
import type { FaqItem } from "@/actions/faqs";

interface FaqClientProps {
  initialFaqs: FaqItem[];
}

export default function FaqClient({ initialFaqs }: FaqClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIndexes, setOpenIndexes] = useState<{ [key: number]: boolean }>({ 0: true });

  const categories = ["All", "General", "Warranty", "Pricing"];

  const filteredFaqs = initialFaqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "All" || faq.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index: number) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      {/* Search & Category Filter Bar */}
      <div className="max-w-[1000px] mx-auto mb-8 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. screen repair, warranty, water damage, price)..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-sfd-teal focus:ring-2 focus:ring-sfd-teal/20 transition-all shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="text-xs text-neutral-400 ml-auto hidden sm:inline">
            Showing {filteredFaqs.length} of {initialFaqs.length} questions
          </span>
        </div>
      </div>

      {/* Accordion List */}
      <div className="max-w-[1000px] mx-auto space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200 text-neutral-500 text-sm">
            No questions found matching your search.
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = !!openIndexes[index];

            return (
              <div
                key={faq.id || faq.question}
                className="rounded-[14px] border border-neutral-200/90 bg-white overflow-hidden shadow-xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between px-6 py-4 sm:py-4.5 text-left gap-4 hover:bg-neutral-50/70 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-600">
                      {faq.category}
                    </span>
                    <span className="text-[14px] sm:text-[15px] font-normal text-neutral-800 leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-sfd-teal" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-4.5 pt-2 text-[13px] sm:text-[13.5px] text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
