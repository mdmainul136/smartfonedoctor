"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Wrench, ChevronRight } from "lucide-react";
import { HERO_DEFAULTS, type HeroSectionProps } from "./heroContent";

// next/image can only resize images from these hosts (next.config.mjs) or local files.
const OPTIMIZED_HOSTS = ["images.unsplash.com", "plus.unsplash.com", "images.pexels.com"];
function canOptimize(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    return OPTIMIZED_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

/** Empty strings from the builder fall back to the default text. */
const pick = (value: string | undefined, fallback: string) => (value && value.trim() ? value : fallback);

export default function HeroSection(props: HeroSectionProps) {
  const badge = pick(props.badge, HERO_DEFAULTS.badge);
  const headline = pick(props.headline, HERO_DEFAULTS.headline);
  const subtitle = pick(props.subtitle, HERO_DEFAULTS.subtitle);
  const ctaText = pick(props.ctaText, HERO_DEFAULTS.ctaText);
  const ctaLink = pick(props.ctaLink, HERO_DEFAULTS.ctaLink);
  const imageUrl = pick(props.imageUrl, HERO_DEFAULTS.imageUrl);
  const imageAlt = pick(props.imageAlt, HERO_DEFAULTS.imageAlt);
  const statusText = pick(props.statusText, HERO_DEFAULTS.statusText);
  const statusLinkText = pick(props.statusLinkText, HERO_DEFAULTS.statusLinkText);
  const statusLink = pick(props.statusLink, HERO_DEFAULTS.statusLink);

  return (
    <section className="bg-[#fcfcfc] pt-3 sm:pt-3 pb-8 px-3 sm:px-6">
      {/* 1. Main Rounded Hero Card (Exact 1265px max-width, 32px rounded corners) */}
      <div className="max-w-[1265px] mx-auto relative rounded-3xl sm:rounded-[32px] overflow-hidden shadow-sm min-h-[560px] lg:min-h-[540px] flex flex-col justify-between">
        
        {/* Background Image: Optimized LCP Next/Image with priority */}
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          fetchPriority="high"
          unoptimized={!canOptimize(imageUrl)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1265px"
          className="object-cover object-center sm:object-right"
        />

        {/* Dark Gradient Overlay (Heavier on left side so white text pops) */}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/95 via-black/80 to-black/40 lg:to-transparent" />

        {/* Left Side Content */}
        <div className="relative z-10 max-w-2xl px-5 sm:px-12 lg:px-16  pt-7 sm:pt-12 text-white">
          
          {/* Top Pill Tag */}
          <div className="inline-block bg-white/25 text-[#fcfcfc] rounded-[60px] py-1 px-[13px] mb-3 sm:mb-[13px] min-h-6 leading-[24px] text-xs sm:text-sm font-[350] tracking-wide select-none">
            <span>{badge}</span>
          </div>

          {/* Exact CPR Main Headline */}
          <h1 className="text-[28px] sm:text-[40px] lg:text-[48px] font-normal tracking-[-0.8px] sm:tracking-[-0.96px] leading-[1.2] sm:leading-[57.6px] text-[#fcfcfc] mt-3 sm:mt-4 mb-3 sm:mb-[9.6px] max-w-[525px]">
            {headline}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-neutral-200/90 font-normal leading-relaxed max-w-lg mb-6 sm:mb-8">
            {subtitle}
          </p>

          {/* Primary CTA Button */}
          <div>
            <Link
              href={ctaLink}
              className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 rounded-full bg-sfd-teal hover:bg-sfd-dark text-white font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {ctaText}
            </Link>
          </div>
        </div>

      {/* Bottom Status Badge (Mobile: Full-width bottom bar; Desktop: Bottom-right floating badge) */}
        <div className="relative z-10 px-4 pb-4 sm:px-0 sm:pb-0 sm:absolute sm:bottom-[22px] sm:right-[22px]">
          <Link
            href={statusLink}
            className="flex items-center justify-between sm:justify-center gap-3 bg-[#2e2f33] hover:bg-[#25262a] border border-white/25 rounded-[52px] shadow-[0px_8px_5px_0px_rgba(0,0,0,0.2)] px-4 sm:px-5 py-2.5 sm:py-3 min-h-[50px] sm:h-[49.3px] w-full sm:w-auto sm:max-w-[424px] text-white transition-all cursor-pointer group select-none"
          >
            {/* Left Side: Wrench + Text */}
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 flex items-center justify-center text-white/90 shrink-0">
                <Wrench className="w-4 h-4 stroke-[2]" />
              </div>
              {/* Mobile text wraps into 2 lines cleanly, desktop single line */}
              <div className="max-w-[150px] sm:max-w-none text-balance text-[12px] sm:text-[14px] leading-tight sm:leading-[21.6px] text-white/95">
                {statusText}
              </div>
            </div>
            {/* Right Side: Check status Link */}
            <div className="font-bold underline text-white group-hover:text-sfd-teal text-[12px] sm:text-[14px] flex items-center shrink-0">
              <span>{statusLinkText}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
       
      </div>

       
    </section>
  );
}