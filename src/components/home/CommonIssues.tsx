"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { COMMON_ISSUES_DEFAULTS, pickList, pickText, type CommonIssuesProps } from "./sectionContent";

export function CommonIssues(props: CommonIssuesProps) {
  const d = COMMON_ISSUES_DEFAULTS;
  const issues = pickList(props.items, d.items);
  const linkHref = pickText(props.linkHref, d.linkHref);

  return (
    // page-level section — no distinct background (flows with page bg)
    <section className="bg-[#fcfcfc] px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">

      {/* cell_phone_middle_section: flex-col, justify-center, gap-24px, mt-30px, max-w-1100px */}
      <div className="max-w-[1100px] mx-auto flex flex-col justify-center gap-[24px] mt-[30px]">

        {/* Heading — ~36px tall at desktop */}
        <h2 className="text-[24px] sm:text-[26px] font-[550] text-[#1d1c1a] leading-[1.4] tracking-[-0.01em] m-0">
          {pickText(props.heading, d.heading)}
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
              key={`${issue.label}-${issue.href}`}
              label={issue.label}
              href={issue.href}
              highlighted={Boolean(issue.highlighted)}
            />
          ))}
        </div>

        {/* Explore All Services Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
          <span className="text-xs text-neutral-500 font-medium">
            {pickText(props.footerText, d.footerText)}
          </span>
          <Link
            href={linkHref}
            className="text-xs font-bold text-sfd-teal hover:underline inline-flex items-center gap-1 group"
          >
            <span>{pickText(props.linkText, d.linkText)}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
