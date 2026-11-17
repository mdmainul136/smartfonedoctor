"use client";

import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface Review {
  id: number;
  author: string;
  location: string;
  rating: number;
  date: string;
  content: string;
  device: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    author: "Marcus Thorne",
    location: "Center City, Philadelphia",
    rating: 5,
    date: "Verified Google Review",
    device: "iPhone 15 Pro Screen Replacement",
    content:
      "Shattered my screen dropping it on Market St. Walked into their 52nd St shop, they had the OLED part in stock, and had it fully restored in 35 minutes with TrueTone working. Honest pricing and zero hidden fees.",
  },
  {
    id: 2,
    author: "Elena Rostova",
    location: "University City, Philadelphia",
    rating: 5,
    date: "Verified Google Review",
    device: "MacBook Pro Liquid Spill Recovery",
    content:
      "Apple told me my water-damaged MacBook motherboard was a total loss and wanted $1,200. SmartFoneDoctor's technicians did ultrasonic cleaning and micro-soldered two resistors. Works perfectly and saved all my university thesis files!",
  },
  {
    id: 3,
    author: "David K. Campbell",
    location: "West Philadelphia",
    rating: 5,
    date: "Verified Google Review",
    device: "PS5 HDMI Port Replacement",
    content:
      "Brought my son's PlayStation 5 in with a bent HDMI port. The technician showed me the board repair under their digital microscope before pickup. Completed same-day and backed by a 90-day warranty. Real craftsmen.",
  },
  {
    id: 4,
    author: "Sarah Jenkins",
    location: "Fishtown, Philadelphia",
    rating: 5,
    date: "Verified Google Review",
    device: "Samsung Galaxy S24 Battery & Back Glass",
    content:
      "Fastest repair service in Philly! Battery was swelling and back glass was cracked. Replaced both in under an hour while I waited. Clean, air-conditioned customer lounge and super friendly staff.",
  },
];

export function ReviewsSection() {
  const [startIndex, setStartIndex] = useState(0);

  const prev = () => {
    setStartIndex((curr) => (curr === 0 ? REVIEWS.length - 3 : curr - 1));
  };

  const next = () => {
    setStartIndex((curr) => (curr >= REVIEWS.length - 3 ? 0 : curr + 1));
  };

  const visibleReviews = REVIEWS.slice(startIndex, startIndex + 3);
  if (visibleReviews.length < 3) {
    visibleReviews.push(...REVIEWS.slice(0, 3 - visibleReviews.length));
  }

  return (
    <section className="bg-[#fcfcfc] py-8 sm:py-12 px-3 sm:px-6">
      <div className="max-w-[1265px] mx-auto bg-[#1c2333] text-white rounded-3xl sm:rounded-[32px] p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-lg">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 relative z-10">
          <div>
            <div className="inline-block bg-white/10 text-neutral-200 rounded-full py-1 px-3 text-xs font-medium tracking-wide mb-2 select-none">
              <span>Customer Reviews</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-white tracking-tight">
              See Why Customers Trust Us
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1">
              Over 2,400+ verified 5-star Google reviews across our Philadelphia stores.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={prev}
              aria-label="Previous review"
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next review"
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {visibleReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white text-neutral-900 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-[13px] text-neutral-700 leading-relaxed font-normal mb-4">
                  &ldquo;{rev.content}&rdquo;
                </p>
              </div>

              {/* Reviewer Details */}
              <div className="pt-3 border-t border-neutral-100 flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">
                    {rev.author}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500">
                  {rev.location} · {rev.device}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
