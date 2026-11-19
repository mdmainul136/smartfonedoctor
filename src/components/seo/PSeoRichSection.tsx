"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Clock,
  ShieldCheck,
  Check,
  Award,
  ChevronDown,
  ArrowRight,
  Cpu,
} from "lucide-react";

export interface SpecificationRow {
  label: string;
  value: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface KeyFeatureItem {
  title: string;
  desc: string;
}

export interface RelatedLinkItem {
  name: string;
  url: string;
  price?: string;
  badge?: string;
}

export interface PSeoRichSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  specifications: SpecificationRow[];
  keyFeatures?: KeyFeatureItem[];
  faqs: FaqItem[];
  whyChooseHeadline?: string;
  whyChooseText?: string;
  stats?: { value: string; label: string }[];
  popularLinksTitle?: string;
  popularLinks?: RelatedLinkItem[];
  bookingUrl?: string;
  bookingCtaText?: string;
  schemaData?: Record<string, unknown>;
  secondarySchemaData?: Record<string, unknown>;
}

export default function PSeoRichSection({
  title,
  subtitle,
  badge = "Philadelphia Repair Bench Spec",
  specifications,
  keyFeatures,
  faqs,
  whyChooseHeadline = "Why Choose SmartFoneDoctor in Philadelphia?",
  whyChooseText = "Located at 33 S 52nd St in West Philadelphia, SmartFoneDoctor has been the trusted hardware repair bench for University City students, local families, and city businesses for years. We perform all repairs on-site at our own ESD-safe benches using OEM-grade components, providing instant turnaround with zero data loss.",
  stats = [
    { value: "5,000+", label: "Local Philly Repairs" },
    { value: "4.9 ★", label: "Customer Rating" },
    { value: "3 Stores", label: "Walk-In Locations" },
  ],
  popularLinksTitle = "Check More Philadelphia Hardware Repairs",
  popularLinks = [
    { name: "iPhone 16 Pro Screen Repair", url: "/repairs/smartphone/iphone-16-pro/screen-repair", price: "From $119" },
    { name: "iPhone Battery Replacement", url: "/repairs/smartphone/iphone-16-pro/battery-replacement", price: "From $69" },
    { name: 'iPad Pro 12.9" Glass Fix', url: "/repairs/tablet/ipad-pro-12-9/screen-repair", price: "From $149" },
    { name: "Samsung Galaxy S25 Screen", url: "/repairs/smartphone/galaxy-s25/screen-repair", price: "From $139" },
    { name: "MacBook Pro Retina & Battery", url: "/repairs/computer/macbook-pro", price: "From $169" },
    { name: "PS5 HDMI Port Micro-Solder", url: "/repairs/console/playstation-5/hdmi-port-replacement", price: "From $119" },
    { name: "Water Damage Ultrasonic Bath", url: "/blog/what-to-do-water-damaged-phone", price: "Free Diagnostic" },
    { name: "Charging Port Replacement", url: "/common-issues/smartphone/charging-port-replacement", price: "From $69" },
  ],
  bookingUrl = "/schedule-repair",
  bookingCtaText = "Book This Repair Online",
  schemaData,
  secondarySchemaData,
}: PSeoRichSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "why" | "faqs">("specs");

  // Schema.org FAQPage structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <section className="border-t border-neutral-200/90 bg-white text-neutral-800 pt-12 pb-20">
      {/* ── JSON-LD Structured Data for Search Engine Rich Snippets ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      {secondarySchemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(secondarySchemaData) }}
        />
      )}

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── HEADER & PILL NAVIGATION TABS (Matching E-Commerce Layout) ── */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-sfd-teal/10 text-sfd-teal border border-sfd-teal/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {badge}
            </span>
            <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-medium border border-neutral-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sfd-teal" />
              Same-Day 20–45 Min Turnaround
            </span>
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              90-Day Warranty Included
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1c1a] tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-neutral-600 mt-2 max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-neutral-200 pb-3 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("specs")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "specs"
                  ? "bg-sfd-teal text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Specification Table
            </button>
            {keyFeatures && keyFeatures.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("features")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "features"
                    ? "bg-sfd-teal text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Key Features
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab("why")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "why"
                  ? "bg-sfd-teal text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Why Choose Us
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faqs")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "faqs"
                  ? "bg-sfd-teal text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Hardware FAQs ({faqs.length})
            </button>
          </div>
        </div>

        {/* ── 1. TECHNICAL SPECIFICATIONS TABLE (E-Commerce Table Layout) ── */}
        <div className="space-y-10">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sfd-teal" />
                  <span>Technical Bench Specification</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Verified hardware benchmarks and laboratory standards
                </p>
              </div>
              <span className="text-[11px] font-bold text-sfd-teal uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-neutral-200">
                Verified Spec
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {specifications.map((spec, idx) => (
                    <tr
                      key={spec.label}
                      className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50/60"}
                    >
                      <th
                        scope="row"
                        className="py-3 px-6 text-xs font-bold text-neutral-700 w-1/3 sm:w-1/4 border-b border-neutral-200/70"
                      >
                        {spec.label}
                      </th>
                      <td className="py-3 px-6 text-xs sm:text-sm text-neutral-900 border-b border-neutral-200/70 font-medium">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 2. KEY FEATURES & CAPABILITIES ── */}
          {keyFeatures && keyFeatures.length > 0 && (
            <div className="bg-[#fafbfc] rounded-2xl border border-neutral-200 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-sfd-teal" />
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                  Key Repair Features &amp; Laboratory Standards
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mb-6">
                All repairs performed by certified master technicians at our Philadelphia repair benches:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {keyFeatures.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-sfd-teal/10 text-sfd-teal flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed pl-8">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 3. WHY CHOOSE SMARTFONEDOCTOR IN PHILADELPHIA ── */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-sfd-teal block">
                  Philadelphia&apos;s Independent Repair Authority
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                  {whyChooseHeadline}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {whyChooseText}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {stats.map((st, i) => (
                    <div key={i} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                      <div className="text-2xl font-black text-neutral-900">{st.value}</div>
                      <div className="text-xs text-neutral-500 mt-1 font-medium">{st.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#1d1c1a] text-white p-6 rounded-2xl space-y-4 shadow-md">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>WISE Certified Shop</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  Visit Our West Philly Flagship
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  33 S 52nd St, Philadelphia, PA 19139<br />
                  Right by 52nd St Market-Frankford Subway Station.
                </p>
                <div className="pt-2 border-t border-neutral-700/60 flex items-center justify-between text-xs text-neutral-400">
                  <span>Mon–Sat: 10am–7pm</span>
                  <span>Sun: 11am–5pm</span>
                </div>
                <div className="space-y-2 pt-1">
                  <Link
                    href={bookingUrl}
                    className="block w-full text-center py-2.5 rounded-xl bg-sfd-teal hover:bg-[#007f7b] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs"
                  >
                    {bookingCtaText}
                  </Link>
                  <a
                    href="tel:+12155982090"
                    className="block w-full text-center py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition"
                  >
                    Call (215) 598-2090
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. FREQUENTLY ASKED QUESTIONS (ACCORDION) ── */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-sfd-teal block mb-1">
                  Got Questions? We Have Answers
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                  Frequently Asked Questions
                </h3>
              </div>
              <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
                {faqs.length} Answers
              </span>
            </div>

            <div className="space-y-3 mt-6">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-neutral-200 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm text-neutral-900 bg-neutral-50/60 hover:bg-neutral-100/70 transition-colors cursor-pointer"
                    >
                      <span className="pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 sm:p-5 text-xs sm:text-sm text-neutral-700 leading-relaxed bg-white border-t border-neutral-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 5. CHECK MORE POPULAR REPAIRS (INTERNAL LINKING FOR PSEO) ── */}
          {popularLinks && popularLinks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                    {popularLinksTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    All device models and hardware issues supported with express walk-in service in Philadelphia:
                  </p>
                </div>
                <Link
                  href="/repairs"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-sfd-teal hover:text-[#007b77] hover:underline shrink-0"
                >
                  <span>View All Repairs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {popularLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.url}
                    className="group block p-3.5 rounded-lg border border-neutral-200 bg-white hover:border-sfd-teal hover:bg-neutral-50/70 transition-all shadow-2xs hover:shadow-xs"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-sfd-teal transition-colors block truncate">
                      {item.name}
                    </span>
                    <div className="flex items-center justify-between mt-2 pt-1 text-xs">
                      <span className="font-semibold text-neutral-600">
                        {item.price || "Available"}
                      </span>
                      <span className="text-neutral-400 group-hover:text-sfd-teal font-medium transition-colors">
                        View &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
