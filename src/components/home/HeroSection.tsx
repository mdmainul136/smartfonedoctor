"use client";

import React from "react";
import Link from "next/link";
import { Wrench, ChevronRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-[#fcfcfc] pt-3 sm:pt-3 pb-8 px-3 sm:px-6">
      {/* 1. Main Rounded Hero Card (Exact 1265px max-width, 32px rounded corners) */}
      <div className="max-w-[1265px] mx-auto relative rounded-3xl sm:rounded-[32px] overflow-hidden shadow-sm min-h-[560px] lg:min-h-[540px] flex flex-col justify-between">
        
        {/* Background Image: Modern Tech Repair Shop */}
        <div
          className="absolute inset-0 bg-cover bg-center sm:bg-right bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=80')",
          }}
        />

        {/* Dark Gradient Overlay (Heavier on left side so white text pops) */}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/95 via-black/80 to-black/40 lg:to-transparent" />

        {/* Left Side Content */}
        <div className="relative z-10 max-w-2xl px-5 sm:px-12 lg:px-16  pt-7 sm:pt-12 text-white">
          
          {/* Top Pill Tag */}
          <div className="inline-block bg-white/25 text-[#fcfcfc] rounded-[60px] py-1 px-[13px] mb-3 sm:mb-[13px] min-h-6 leading-[24px] text-xs sm:text-sm font-[350] tracking-wide select-none">
            <span>Philadelphia&apos;s Trusted Leader in</span>
          </div>

          {/* Exact CPR Main Headline */}
          <h1 className="text-[28px] sm:text-[40px] lg:text-[48px] font-normal tracking-[-0.8px] sm:tracking-[-0.96px] leading-[1.2] sm:leading-[57.6px] text-[#fcfcfc] mt-3 sm:mt-4 mb-3 sm:mb-[9.6px] max-w-[525px]">
            Fast, reliable repairs that keep your tech working when it matters.
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-neutral-200/90 font-normal leading-relaxed max-w-lg mb-6 sm:mb-8">
            Repair services for smartphones, tablets, computers and game consoles, backed by certified technicians and a 90-day free warranty.
          </p>

          {/* Primary CTA Button */}
          <div>
            <Link
              href="/schedule-repair"
              className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 rounded-full bg-sfd-teal hover:bg-sfd-dark text-white font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Book your repair
            </Link>
          </div>
        </div>

      {/* Bottom Status Badge (Mobile: Full-width bottom bar; Desktop: Bottom-right floating badge) */}
        <div className="relative z-10 px-4 pb-4 sm:px-0 sm:pb-0 sm:absolute sm:bottom-[22px] sm:right-[22px]">
          <Link
            href="/track"
            className="flex items-center justify-between sm:justify-center gap-3 bg-[#2e2f33] hover:bg-[#25262a] border border-white/25 rounded-[52px] shadow-[0px_8px_5px_0px_rgba(0,0,0,0.2)] px-4 sm:px-5 py-2.5 sm:py-3 min-h-[50px] sm:h-[49.3px] w-full sm:w-auto sm:max-w-[424px] text-white transition-all cursor-pointer group select-none"
          >
            {/* Left Side: Wrench + Text */}
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 flex items-center justify-center text-white/90 shrink-0">
                <Wrench className="w-4 h-4 stroke-[2]" />
              </div>
              {/* Mobile text wraps into 2 lines cleanly, desktop single line */}
              <div className="text-[12px] sm:text-[14px] leading-tight sm:leading-[21.6px] text-white/95">
                <span className="block sm:inline">Already have a </span>
                <span className="block sm:inline">repair with us?</span>
              </div>
            </div>
            {/* Right Side: Check status Link */}
            <div className="font-bold underline text-white group-hover:text-sfd-teal text-[12px] sm:text-[14px] flex items-center shrink-0">
              <span>Check status</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
       
      </div>

       
    </section>
  );
}