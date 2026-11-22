"use client";

import React, { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { REVIEWS_DEFAULTS, pickList, pickText, type ReviewContent, type ReviewsProps } from "./sectionContent";
import { getPublicFeaturedReviewsAction } from "@/actions/reviews";
import { useRouteData } from "@/components/site/RouteDataContext";

export function ReviewsSection(props: ReviewsProps) {
  const d = REVIEWS_DEFAULTS;
  const homeData = useRouteData<{ featuredReviews?: ReviewContent[] }>("home");
  const ssrReviews = homeData?.featuredReviews ?? [];
  const [dbReviews, setDbReviews] = useState<ReviewContent[]>(ssrReviews);
  const hasExplicitProps = Array.isArray(props.reviews) && props.reviews.length > 0;
  const hasSsrReviews = ssrReviews.length > 0;

  useEffect(() => {
    if (hasExplicitProps || hasSsrReviews) return;
    let active = true;
    getPublicFeaturedReviewsAction()
      .then((rows) => {
        if (!active || !rows.length) return;
        setDbReviews(
          rows.map((r) => ({
            author: r.author,
            location: r.location,
            device: r.device,
            content: r.content,
            rating: r.rating,
          }))
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [hasExplicitProps, hasSsrReviews]);

  const REVIEWS = pickList(props.reviews, dbReviews.length > 0 ? dbReviews : d.reviews);
  const [startIndex, setStartIndex] = useState(0);
  // Arrows only when there are more reviews than fit on screen (3).
  const canPage = REVIEWS.length > 3;
  const lastStart = Math.max(0, REVIEWS.length - 3);

  const prev = () => {
    setStartIndex((curr) => (curr === 0 ? lastStart : curr - 1));
  };

  const next = () => {
    setStartIndex((curr) => (curr >= lastStart ? 0 : curr + 1));
  };

  const visibleReviews = REVIEWS.slice(Math.min(startIndex, lastStart), Math.min(startIndex, lastStart) + 3);

  // Only real reviews are shown; with none entered the section stays hidden.
  if (REVIEWS.length === 0) return null;

  return (
    <section className="bg-[#fcfcfc] py-8 sm:py-12 px-3 sm:px-6">
      <div className="max-w-[1265px] mx-auto bg-[#1c2333] text-white rounded-3xl sm:rounded-[32px] p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-lg">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 relative z-10">
          <div>
            <div className="inline-block bg-white/10 text-neutral-200 rounded-full py-1 px-3 text-xs font-medium tracking-wide mb-2 select-none">
              <span>{pickText(props.badge, d.badge)}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-white tracking-tight">
              {pickText(props.heading, d.heading)}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1">
              {pickText(props.subtitle, d.subtitle)}
            </p>
          </div>

          {/* Navigation Controls */}
          {canPage && (
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
          )}
        </div>

        {/* 3 Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          {visibleReviews.map((rev, i) => (
            <div
              key={`${rev.author}-${i}`}
              className="bg-white text-neutral-900 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(Math.min(5, Math.max(1, Number(rev.rating) || 5)))].map((_, i) => (
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
                <span className="text-xs font-bold text-neutral-900">{rev.author}</span>
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
