"use client";

import React from "react";
import Image from "next/image";
import {
  Layers,
  ShieldCheck,
  Smartphone,
  Zap,
  Award,

} from "lucide-react";
import { BENEFITS_DEFAULTS, pickList, pickText, type BenefitsProps } from "./sectionContent";

/** Card decoration by position (1st, 2nd, ...): icon, arch color, floating plus signs. */
const CARD_STYLES: {
  icon: React.ReactNode;
  badgeBg: string;
  plusColors: { color: string; position: string; size: string }[];
}[] = [
  {
    icon: <ShieldCheck className="w-4 h-4 text-amber-500" />,
    badgeBg: "bg-amber-100/70",
    plusColors: [
      { color: "text-sfd-tealDark", position: "top-4 right-5", size: "text-lg" },
      { color: "text-sfd-teal", position: "top-10 left-3", size: "text-sm" },
      { color: "text-amber-400", position: "bottom-8 left-4", size: "text-xs" },
    ],
  },
  {
    icon: <Smartphone className="w-4 h-4 text-sfd-teal" />,
    badgeBg: "bg-teal-100/70",
    plusColors: [
      { color: "text-sfd-teal", position: "top-3 right-6", size: "text-xl" },
      { color: "text-sfd-tealDark", position: "top-12 left-2", size: "text-lg" },
      { color: "text-blue-400", position: "bottom-12 right-2", size: "text-xs" },
    ],
  },
  {
    icon: <Zap className="w-4 h-4 text-blue-500" />,
    badgeBg: "bg-blue-100/60",
    plusColors: [
      { color: "text-amber-400", position: "top-5 right-4", size: "text-sm" },
      { color: "text-sfd-teal", position: "top-8 left-3", size: "text-lg" },
      { color: "text-sfd-tealDark", position: "bottom-6 left-5", size: "text-xs" },
    ],
  },
  {
    icon: <Award className="w-4 h-4 text-rose-500" />,
    badgeBg: "bg-rose-100/70",
    plusColors: [
      { color: "text-sfd-tealDark", position: "top-4 left-3", size: "text-lg" },
      { color: "text-blue-500", position: "top-8 right-5", size: "text-sm" },
      { color: "text-amber-400", position: "bottom-10 right-3", size: "text-xs" },
    ],
  },
];

export const Benefits = (props: BenefitsProps) => {
  const badge = pickText(props.badge, BENEFITS_DEFAULTS.badge);
  const heading = pickText(props.heading, BENEFITS_DEFAULTS.heading);
  const subtitle = pickText(props.subtitle, BENEFITS_DEFAULTS.subtitle);
  const cards = pickList(props.cards, BENEFITS_DEFAULTS.cards).map((card, i) => ({
    ...card,
    step: String(i + 1).padStart(2, "0"),
    ...CARD_STYLES[i % CARD_STYLES.length],
  }));

  return (
    <section id="benefits" className="bg-[#fcfcfc] py-16 px-4 sm:px-6 relative">
      <div className="max-w-[1265px] mx-auto flex flex-col items-center">

        {/* 1. Top Pill Badge: "Our Benefits" */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-200 bg-white text-neutral-700 text-xs font-semibold shadow-2xs mb-4">
          <Layers className="w-3.5 h-3.5 text-sfd-teal" />
          <span>{badge}</span>
        </div>

        {/* 2. Section Heading */}
        <div className="text-center max-w-2xl mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-normal tracking-tight text-neutral-900 leading-[1.18] mb-3">
            {heading}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 font-normal">
            {subtitle}
          </p>
        </div>

        {/* 3. Modern Unique 4-Card Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full justify-items-center">
                    {cards.map((card) => (
                        <div
                        key={card.step}
                        className="group bg-white rounded-2xl p-5 flex flex-col justify-between h-[420px] w-full max-w-[280px] lg:max-w-[275px] border border-neutral-200/70 shadow-sm hover:shadow-xl hover:shadow-neutral-200/60 hover:-translate-y-2 hover:border-sfd-teal/50 transition-all duration-300 select-none overflow-hidden relative"
                        >
                        {/* Subtle Top Teal Accent Line (visible on hover) */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-sfd-teal opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Card Header Content */}
                                <div>
                                    {/* Top Row: Mini Icon Badge + Watermark Step Number */}
                                    <div className="flex items-center justify-between mb-3">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 group-hover:bg-teal-50/80 transition-colors">
                                        {card.icon}
                                        <span className="text-[11px] font-bold text-neutral-700 group-hover:text-sfd-teal transition-colors">
                                        {card.stat}
                                        </span>
                                    </div>

                                    <span className="text-2xl font-black text-neutral-200 group-hover:text-sfd-teal/30 transition-colors font-mono">
                                        {card.step}
                                    </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-[17px] font-bold text-neutral-900 mb-2 leading-snug group-hover:text-sfd-teal transition-colors">
                                    {card.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-[12.5px] leading-[18px] text-neutral-600 font-normal">
                                    {card.description}
                                    </p>
                                </div>

                        {/* Bottom Visual: Arch Backdrop + Cutout Image + Floating Plus Crosses */}
                                <div className="relative w-full h-[180px] flex items-end justify-center mt-3 overflow-hidden">
                                    
                                    {/* Arch Background Shape (Scales on hover) */}
                                    <div
                                    className={`absolute bottom-0 w-[145px] h-[145px] rounded-t-full ${card.badgeBg} group-hover:scale-105 transition-transform duration-300 ease-out`}
                                    />

                                    {/* Floating Plus Icons (+) with subtle rotation on hover */}
                                    {card.plusColors.map((plus, index) => (
                                    <span
                                        key={index}
                                        className={`absolute ${plus.position} ${plus.color} ${plus.size} font-black pointer-events-none select-none group-hover:rotate-45 group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        +
                                    </span>
                                    ))}

                                    {/* Person / Phone Cutout Image with Zoom */}
                                    <div className="relative z-10 w-[150px] h-[165px] overflow-hidden rounded-b-xl flex items-end justify-center">
                                    <Image
                                        src={card.imageSrc}
                                        alt={card.title}
                                        width={220}
                                        height={220}
                                        className="w-full h-full object-cover object-top filter contrast-[1.03] group-hover:scale-105 transition-transform duration-300"
                                    />
                                    </div>

                        </div>

                        </div>
                    ))}
                </div>

      </div>
    </section>
  );
};