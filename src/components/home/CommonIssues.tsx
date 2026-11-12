"use client";

import React from "react";
import { FeatureCard } from "./FeatureCard";

const issues = [
  { label: "Phone Screen Repair",       href: "/repairs/iphone",                                  highlighted: true  },
  { label: "Phone Battery Replacement", href: "/common-issues/smartphone/battery-replacement",      highlighted: true  },
  { label: "Tablet Repair",             href: "/repairs/tablet",                                  highlighted: true  },
  { label: "Computer & Laptop Repair",  href: "/repairs/computer",                                highlighted: true  },
  { label: "Game Console Repair",       href: "/repairs/console/playstation-repair",              highlighted: false },
  { label: "Charging Port Repair",      href: "/common-issues/smartphone/charging-port-replacement", highlighted: false },
  { label: "Water Damage Repair",       href: "/common-issues",                                   highlighted: false },
  { label: "Back Glass Repair",         href: "/common-issues/smartphone/cracked-glass-replacement", highlighted: false },
];

export function CommonIssues() {
  return (
    // page-level section — no distinct background (flows with page bg)
    <section className="bg-[#fcfcfc] px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">

      {/* cell_phone_middle_section: flex-col, justify-center, gap-24px, mt-30px, max-w-1100px */}
      <div className="max-w-[1100px] mx-auto flex flex-col justify-center gap-[24px] mt-[30px]">

        {/* Heading — ~36px tall at desktop */}
        <h2 className="text-[24px] sm:text-[26px] font-[550] text-[#1d1c1a] leading-[1.4] tracking-[-0.01em] m-0">
          Common Issues We Fix Every Day
        </h2>

        {/* section-12-2: grid 4×263px cols, 2×64px rows, gap-16px */}
        {/* Desktop: exact 1100px; Tablet: 2-col; Mobile: 1-col */}
        <div
          className="
            grid gap-[16px] w-full
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-[263px_263px_263px_263px]
            cursor-pointer
          "
        >
          {issues.map((issue) => (
            <FeatureCard
              key={issue.label}
              label={issue.label}
              href={issue.href}
              highlighted={issue.highlighted}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
