"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { GUARANTEES_DEFAULTS, pickText, type GuaranteeCard, type GuaranteesProps } from "./sectionContent";

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

export function GuaranteesBento(props: GuaranteesProps) {
  // Four fixed slots (two white cards, then two image cards); each field falls back on its own.
  const card = (i: number): GuaranteeCard => {
    const fallback = GUARANTEES_DEFAULTS.cards[i];
    const given = props.cards?.[i];
    return {
      tag: pickText(given?.tag, fallback.tag),
      title: pickText(given?.title, fallback.title),
      text: pickText(given?.text, fallback.text),
      linkText: pickText(given?.linkText, fallback.linkText),
      linkHref: pickText(given?.linkHref, fallback.linkHref),
      image: pickText(given?.image, fallback.image),
    };
  };
  const [c1, c2, c3, c4] = [card(0), card(1), card(2), card(3)];

  return (
    <section className="bg-[#fcfcfc] py-8 sm:py-12 px-3 sm:px-6">
      <div className="max-w-[1265px] mx-auto flex flex-col gap-6">
        
        {/* Top 2 Cards: Warranty & Pre-Owned Devices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Warranty */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-sfd-teal/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sfd-teal bg-teal-50 px-3 py-1 rounded-full">
                {c1.tag}
              </span>
              <span className="text-xl font-black text-rose-600 select-none">+</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 leading-tight">
                {c1.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                {c1.text}
              </p>
            </div>

            <div>
              <Link
                href={c1.linkHref}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 group-hover:text-sfd-teal transition-colors border border-neutral-300 rounded-full px-4 py-2 hover:border-sfd-teal"
              >
                <span>{c1.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Certified Pre-Owned */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-sfd-teal/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                {c2.tag}
              </span>
              <span className="text-xl font-black text-rose-600 select-none">+</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 leading-tight">
                {c2.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                {c2.text}
              </p>
            </div>

            <div>
              <Link
                href={c2.linkHref}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 group-hover:text-sfd-teal transition-colors border border-neutral-300 rounded-full px-4 py-2 hover:border-sfd-teal"
              >
                <span>{c2.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom 2 Cards: Android & Apple Devices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 3: Samsung & Android Care */}
          <div className="bg-[#eef2f6] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-neutral-200/60 overflow-hidden group">
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-3 py-1 rounded-full inline-block mb-3">
                {c3.tag}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 leading-tight">
                {c3.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
                {c3.text}
              </p>
              <Link
                href={c3.linkHref}
                className="text-xs font-bold text-neutral-900 hover:text-sfd-teal inline-flex items-center gap-1 underline underline-offset-4"
              >
                <span>{c3.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="relative w-40 h-44 sm:w-44 sm:h-48 shrink-0 overflow-hidden rounded-2xl">
              <Image
                src={c3.image}
                alt={c3.title}
                fill
                sizes="(max-width: 640px) 160px, 176px"
                unoptimized={!canOptimize(c3.image)}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Card 4: Apple & Genuine Parts */}
          <div className="bg-[#1c2333] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-neutral-800 overflow-hidden group">
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 bg-teal-900/60 px-3 py-1 rounded-full inline-block mb-3">
                {c4.tag}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                {c4.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4">
                {c4.text}
              </p>
              <Link
                href={c4.linkHref}
                className="text-xs font-bold text-teal-300 hover:text-white inline-flex items-center gap-1 underline underline-offset-4"
              >
                <span>{c4.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="relative w-40 h-44 sm:w-44 sm:h-48 shrink-0 overflow-hidden rounded-2xl">
              <Image
                src={c4.image}
                alt={c4.title}
                fill
                sizes="(max-width: 640px) 160px, 176px"
                unoptimized={!canOptimize(c4.image)}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
