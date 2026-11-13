"use client";

import React from "react";
import { FeatureCard } from "./FeatureCard";

const issues = [
  { label: "iPhone Screen Repair",       href: "/repairs/smartphone/iphone-16-pro/screen-repair",       highlighted: true  },
  { label: "iPhone Battery Replacement", href: "/repairs/smartphone/iphone-16-pro/battery-replacement",  highlighted: true  },
  { label: "Galaxy AMOLED Repair",       href: "/repairs/smartphone/galaxy-s25/screen-repair",          highlighted: true  },
  { label: "Computer & Mac Repair",      href: "/repairs/computer/macbook-pro",                         highlighted: true  },
  { label: "PS5 HDMI Port Repair",       href: "/repairs/console/playstation-5/hdmi-port-replacement",  highlighted: false },
  { label: "Charging Port Repair",      href: "/repairs/smartphone/iphone-16-pro/charging-port-repair", highlighted: false },
  { label: "Water Damage Recovery",      href: "/repairs/smartphone/iphone-16-pro/water-damage-repair", highlighted: false },
  { label: "Back Glass Laser Repair",   href: "/repairs/smartphone/iphone-16-pro/back-glass-repair",   highlighted: false },
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
