"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Wrench,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Briefcase,
  Layers,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import type { CommonIssueDetail } from "@/data/commonIssuesData";

interface Props {
  issue: CommonIssueDetail;
  relatedIssues: CommonIssueDetail[];
}

export default function IssueArticleClient({ issue, relatedIssues }: Props) {
  return (
    <main className="bg-[#fcfcfc] min-h-screen">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16">
        
        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-[12.5px] text-neutral-500 font-normal">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-sfd-teal transition-colors">
                Home
              </Link>
            </li>
            <li className="text-neutral-400">&gt;</li>
            <li>
              <Link href="/common-issues" className="hover:text-sfd-teal transition-colors">
                Common Issues
              </Link>
            </li>
            <li className="text-neutral-400">&gt;</li>
            <li>
              <span className="text-neutral-500">{issue.categoryName}</span>
            </li>
            <li className="text-neutral-400">&gt;</li>
            <li className="text-neutral-800 font-medium truncate max-w-[240px] sm:max-w-none" aria-current="page">
              {issue.title}
            </li>
          </ol>
        </nav>

        {/* 2. Main Page Title matching CPR Screenshot */}
        <h1 className="text-[26px] sm:text-[34px] lg:text-[40px] font-bold text-[#1d1c1a] tracking-tight leading-[1.2] mb-6 sm:mb-8">
          {issue.title}
        </h1>

        {/* 3. Main 2-Column Content Layout (Article + Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 items-start">
          
          {/* Left Column: Article Content (8 cols) */}
          <article className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Featured Hero Image */}
            <div className="relative w-full h-[260px] sm:h-[400px] lg:h-[440px] rounded-2xl overflow-hidden bg-neutral-100 shadow-sm border border-neutral-200/90">
              <Image
                src={issue.image}
                alt={issue.title}
                fill
                className="object-cover object-center"
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
              />
            </div>

            {/* Lead Intro Paragraph with Brand Grounding */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/90 text-neutral-800 text-[14px] sm:text-[15px] leading-relaxed">
              <p>
                {issue.leadText}
              </p>
            </div>

            {/* Dynamic Article Sections */}
            <div className="space-y-8 mt-2">
              {issue.sections.map((sec, idx) => (
                <div key={idx} className="space-y-3.5">
                  <h2 className="text-[18px] sm:text-[22px] font-bold text-[#1d1c1a] tracking-tight leading-snug">
                    {sec.heading}
                  </h2>

                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-[13.5px] sm:text-[14.5px] text-neutral-600 leading-relaxed font-normal">
                      {p}
                    </p>
                  ))}

                  {/* Render Ordered or Unordered Lists */}
                  {sec.listItems && sec.listItems.length > 0 && (
                    <div className="mt-4 pt-1">
                      {sec.ordered ? (
                        /* Sequential Steps (Numbered CPR Style) */
                        <ol className="space-y-3">
                          {sec.listItems.map((item, itemIdx) => {
                            const [stepTitle, ...rest] = item.split(": ");
                            const stepBody = rest.join(": ");

                            return (
                              <li
                                key={itemIdx}
                                className="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-xl bg-neutral-50/60 border border-neutral-200/70 text-[13.5px] text-neutral-700 leading-relaxed"
                              >
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1d1c1a] text-white text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                                  {itemIdx + 1}
                                </span>
                                <div>
                                  {stepBody ? (
                                    <>
                                      <strong className="text-neutral-900 font-semibold">{stepTitle}: </strong>
                                      <span>{stepBody}</span>
                                    </>
                                  ) : (
                                    <span>{item}</span>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      ) : (
                        /* Bulleted Checklist (Tools & Pre-reqs) */
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {sec.listItems.map((item, itemIdx) => (
                            <li
                              key={itemIdx}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-neutral-200 text-[13px] text-neutral-700 shadow-2xs"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* In-Article Immediate Action Card */}
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-neutral-900 to-[#1d1c1a] text-white border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold tracking-wide uppercase">
                  <span>Free Diagnosis</span>
                </div>
                <h3 className="text-[16px] sm:text-[18px] font-bold text-white">
                  Need expert diagnosis on this issue?
                </h3>
                <p className="text-[12.5px] text-neutral-300 max-w-md">
                  Stop by any of our 3 Philadelphia stores for a comprehensive bench inspection with zero obligation.
                </p>
              </div>

              <Link
                href="/schedule-repair"
                className="px-6 py-3 rounded-full bg-[#c8102e] hover:bg-[#a60d26] text-white text-[13px] font-bold tracking-wide transition shadow-sm whitespace-nowrap active:scale-95 cursor-pointer shrink-0"
              >
                Book Free Diagnosis →
              </Link>
            </div>

          </article>

          {/* Right Column: Other Issues Sidebar (4 cols) */}
          <aside className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-[20px] border border-neutral-200/90 p-5 sm:p-6 shadow-sm">
              
              {/* Header matching CPR */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-neutral-200">
                <h3 className="text-[14px] font-bold text-[#1d1c1a] uppercase tracking-wider">
                  Other Issues
                </h3>
                <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-[#c8102e] font-bold text-sm">
                  +
                </span>
              </div>

              {/* Related Items List */}
              <div className="space-y-3.5">
                {relatedIssues.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/common-issues/${rel.category}/${rel.slug}`}
                    className="group flex items-center gap-3.5 p-2 rounded-xl hover:bg-neutral-50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                      <Image
                        src={rel.image}
                        alt={rel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-neutral-900 group-hover:text-sfd-teal transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                      <span className="inline-flex items-center text-[11.5px] font-bold text-[#c8102e] group-hover:underline mt-1">
                        Read more &gt;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* View All Common Issues Button */}
              <div className="mt-5 pt-4 border-t border-neutral-100">
                <Link
                  href="/common-issues"
                  className="block w-full py-2.5 rounded-full border border-neutral-300 hover:border-sfd-dark text-neutral-800 hover:text-sfd-dark text-center font-bold text-[12.5px] transition cursor-pointer"
                >
                  View All Common Issues →
                </Link>
              </div>

            </div>
          </aside>

        </div>

        {/* 4. Full-Width CTA Banner matching CPR Screenshot */}
        <section className="w-full rounded-2xl sm:rounded-[24px] bg-[#1d1c1a] text-white p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md mb-12">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-[20px] sm:text-[26px] font-bold tracking-tight">
              Get Your Device Repaired Today
            </h3>
            <p className="text-[13px] sm:text-[14px] text-neutral-300 max-w-2xl leading-relaxed">
              Visit your nearest SmartFoneDoctor location for professional device repair services. Walk in anytime or book an appointment online to get started.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link
              href="/locations/i/book-repair"
              className="inline-block w-full md:w-auto text-center px-8 py-3.5 rounded-full bg-[#c8102e] hover:bg-[#a60d26] text-white font-bold text-[13.5px] tracking-wide transition shadow-sm active:scale-95 cursor-pointer"
            >
              Find a Store
            </Link>
          </div>
        </section>

        {/* 5. Two Promotional Cards Side-by-Side matching CPR Screenshot */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
          
          {/* Card 1: Looking for a career? */}
          <div className="bg-white rounded-[24px] border border-neutral-200/90 overflow-hidden shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="p-6 sm:p-8 space-y-2.5">
              <h3 className="text-[20px] sm:text-[22px] font-bold text-[#1d1c1a] tracking-tight">
                Looking for a career?
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-neutral-600 leading-relaxed">
                Join the SmartFoneDoctor team and become a certified repair technician. Comprehensive hands-on training, competitive pay, and advancement opportunities.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-block px-6 py-2.5 rounded-full bg-[#1d1c1a] hover:bg-neutral-800 text-white text-[12.5px] font-bold tracking-wide transition cursor-pointer"
                >
                  Learn More
                </Link>
              </div>
            </div>
            
            {/* Image: Tech Lab / Repair Store */}
            <div className="relative h-52 sm:h-60 w-full bg-neutral-100 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
                alt="SmartFoneDoctor technician lab and repair station"
                fill
                className="object-cover group-hover:scale-102 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Card 2: In need of IT for education? */}
          <div className="bg-white rounded-[24px] border border-neutral-200/90 overflow-hidden shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="p-6 sm:p-8 space-y-2.5">
              <h3 className="text-[20px] sm:text-[22px] font-bold text-[#1d1c1a] tracking-tight">
                In need of IT for education?
              </h3>
              <p className="text-[13px] sm:text-[13.5px] text-neutral-600 leading-relaxed">
                Fast, cost-effective repair solutions and dedicated device fleet maintenance for school districts, universities, teachers, and students.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-block px-6 py-2.5 rounded-full bg-[#1d1c1a] hover:bg-neutral-800 text-white text-[12.5px] font-bold tracking-wide transition cursor-pointer"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Image: Classroom / Student with Tech */}
            <div className="relative h-52 sm:h-60 w-full bg-neutral-100 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80"
                alt="Students using laptops and tech devices in education"
                fill
                className="object-cover group-hover:scale-102 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

        </section>

      </div>

      {/* Global Footer */}
      <Footer />
    </main>
  );
}
