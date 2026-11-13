"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Calendar,
  MapPin,
  ChevronRight,
  ChevronDown,
  Star,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
  Activity,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import type { PSeoPageData } from "@/lib/pSeoEngine";

interface Props {
  data: PSeoPageData;
}

export default function DeviceIssueClient({ data }: Props) {
  const { device, issue, pricing, schemas, siblingRepairs, siblingDevices, relatedBlogGuides, neighborhoods } = data;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedTier, setSelectedTier] = useState<"aftermarket" | "oem">("aftermarket");

  return (
    <main className="bg-[#fafbfc] min-h-screen pb-20">
      {/* ── JSON-LD Structured Data for Google ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.localBusiness) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.faq) }} />

      {/* ── 1. BREADCRUMBS ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav aria-label="Breadcrumb" className="text-xs text-gray-500 font-normal">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li>
                <Link href="/" className="hover:text-[#00897b] transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">&gt;</li>
              <li>
                <Link href={`/repairs/${device.category}`} className="hover:text-[#00897b] transition-colors">
                  {device.categoryName}
                </Link>
              </li>
              <li className="text-gray-400">&gt;</li>
              <li>
                <Link href={`/repairs/${device.category}/${device.slug}`} className="hover:text-[#00897b] transition-colors">
                  {device.name}
                </Link>
              </li>
              <li className="text-gray-400">&gt;</li>
              <li className="text-gray-900 font-semibold truncate" aria-current="page">
                {issue.shortName}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── 2. HERO SECTION ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#00897b]/10 text-[#00897b] border border-[#00897b]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {device.brand} Specialist Service
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#00897b]" />
                  {pricing.turnaround}
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  90-Day Warranty
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1d1c1a] tracking-tight leading-tight">
                {device.name} <span className="text-[#00897b]">{issue.shortName}</span> in Philadelphia
              </h1>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                Certified bench technician repair for your {device.name}. We restore original display clarity, touch sensitivity, and battery performance using factory-grade parts at our Philadelphia repair shop.
              </p>

              {/* Price & Turnaround Box */}
              <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Estimated Cost
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-gray-900">
                      ${pricing.aftermarket}
                    </span>
                    <span className="text-xs text-gray-500">starting price</span>
                  </div>
                </div>

                <div className="h-10 w-px bg-gray-200 hidden sm:block" />

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Turnaround Time
                  </span>
                  <span className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-[#00897b]" />
                    {pricing.turnaround}
                  </span>
                </div>

                <div className="h-10 w-px bg-gray-200 hidden sm:block" />

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Shop Rating
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-gray-800 ml-1">4.9 / 5.0</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={`/schedule-repair?device=${device.category}&make=${encodeURIComponent(device.brand)}&model=${encodeURIComponent(device.name)}&issue=${encodeURIComponent(issue.slug)}`}
                  className="px-7 py-3.5 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white font-bold text-xs sm:text-sm tracking-wide uppercase transition shadow-md active:scale-95 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book This Repair Online</span>
                </Link>

                <a
                  href="tel:+12153871700"
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm tracking-wide transition border border-gray-300 shadow-2xs flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#00897b]" />
                  <span>Call (215) 387-1700</span>
                </a>
              </div>

              <p className="text-xs text-gray-400 flex items-center gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#00897b]" />
                Walk-ins welcome daily at 33 S 52nd St, Philadelphia, PA 19139
              </p>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-gray-900 group">
                <Image
                  src={device.image}
                  alt={`${device.name} ${issue.name}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4dd0e1] block mb-1">
                    Bench Certified Spec
                  </span>
                  <p className="text-sm font-semibold text-white/90">{device.specs}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── 3. MAIN BODY CONTENT WITH TWO COLUMNS ── */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-12">

            {/* A. Symptoms Checklist */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Common Symptoms of a Failing {device.name} {issue.shortName}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                If your device is exhibiting any of the issues below, our Philadelphia bench technicians can restore full hardware performance:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {issue.symptoms.map((symptom, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-800 leading-snug"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#00897b] shrink-0 mt-0.5" />
                    <span>{symptom}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* B. Transparent Dual-Tier Pricing Comparison */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#00897b] block mb-1">
                  Fair &amp; Transparent Upfront Pricing
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Choose Your Preferred Component Tier
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Tier 1: Premium Aftermarket */}
                <div
                  onClick={() => setSelectedTier("aftermarket")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    selectedTier === "aftermarket"
                      ? "border-[#00897b] bg-[#00897b]/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Standard Quality
                    </span>
                    <span className="text-xl font-black text-gray-900">
                      ${pricing.aftermarket}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">
                    Premium Aftermarket Grade
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    High quality replacement built to matching OEM specifications. Perfect balance of durability and value.
                  </p>
                  <ul className="text-xs space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00897b]" />
                      Full touchscreen response &amp; clarity
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00897b]" />
                      90-Day Parts &amp; Labor Warranty
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00897b]" />
                      Same-day 30-min turnaround
                    </li>
                  </ul>
                </div>

                {/* Tier 2: OEM Original */}
                <div
                  onClick={() => setSelectedTier("oem")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    selectedTier === "oem"
                      ? "border-[#00897b] bg-[#00897b]/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="absolute -top-2.5 right-4 bg-[#00897b] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                    Original Spec
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Original Grade
                    </span>
                    <span className="text-xl font-black text-gray-900">
                      ${pricing.oem}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">
                    Factory Genuine / OEM Grade
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    Original manufacturer display/component offering identical color gamut, TrueTone, and peak brightness.
                  </p>
                  <ul className="text-xs space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00897b]" />
                      Factory original brightness &amp; refresh rate
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00897b]" />
                      90-Day Extended Guarantee
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00897b]" />
                      TrueTone &amp; Face ID Calibration
                    </li>
                  </ul>
                </div>

              </div>

              <div className="text-center pt-2">
                <Link
                  href={`/schedule-repair?device=${encodeURIComponent(device.name)}&issue=${encodeURIComponent(issue.shortName)}&tier=${selectedTier}`}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#1d1c1a] hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95 gap-2"
                >
                  <span>Book with {selectedTier === "oem" ? "OEM Original ($" + pricing.oem + ")" : "Standard Grade ($" + pricing.aftermarket + ")"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>

            {/* C. Step-by-Step Bench Repair Process */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#00897b] block mb-1">
                  Certified Bench Procedure
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  How We Perform {device.name} {issue.shortName}
                </h2>
              </div>

              <div className="space-y-4">
                {issue.benchProcedures.map((proc, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#00897b] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{proc.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{proc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tools Used */}
              <div className="pt-4 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-500 mr-2">Bench Tools Used:</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {issue.toolsUsed.map((tool) => (
                    <span
                      key={tool}
                      className="text-[11px] bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-md"
                    >
                      🔧 {tool}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* D. Interactive FAQs */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions About {device.name} {issue.shortName}
              </h2>
              <div className="space-y-3">
                {issue.faqs.map((faq, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-gray-900 bg-gray-50/50 hover:bg-gray-100/50 transition-colors cursor-pointer"
                    >
                      <span>{faq.question.replace("smartphone", device.name)}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          openFaq === i ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openFaq === i && (
                      <div className="p-4 text-xs sm:text-sm text-gray-600 leading-relaxed bg-white border-t border-gray-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* E. Juicy Linking: Sibling Repairs on This Device */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#00897b]" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Other Popular Repairs for {device.name}
                </h2>
              </div>
              <p className="text-xs text-gray-500">
                Fix multiple problems in one visit and save. All repairs handled same-day at our Philadelphia bench:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {siblingRepairs.map((rep) => (
                  <Link
                    key={rep.url}
                    href={rep.url}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-[#00897b] hover:shadow-xs transition-all group bg-gray-50/40"
                  >
                    <div>
                      <span className="text-xs font-bold text-gray-900 group-hover:text-[#00897b] transition-colors block">
                        {rep.name}
                      </span>
                      <span className="text-[11px] text-gray-400">{rep.turnaround}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 bg-white border border-gray-200 px-2.5 py-1 rounded-md">
                      From ${rep.price}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* F. Juicy Linking: Other Devices with this same issue */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00897b]" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {issue.shortName} for Other Popular Devices
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {siblingDevices.map((dev) => (
                  <Link
                    key={dev.url}
                    href={dev.url}
                    className="p-3 rounded-xl border border-gray-200 hover:border-[#00897b] hover:shadow-xs transition-all text-center group bg-white"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-2 bg-gray-100">
                      <Image src={dev.image} alt={dev.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-xs font-bold text-gray-800 group-hover:text-[#00897b] transition-colors line-clamp-1">
                      {dev.name}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{issue.shortName}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* G. Juicy Linking: Related Blog Troubleshooting Guides */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#00897b]" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Related Hardware Guides &amp; Troubleshooting
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedBlogGuides.map((guide) => (
                  <Link
                    key={guide.url}
                    href={guide.url}
                    className="p-4 rounded-xl border border-gray-200 hover:border-[#00897b] hover:shadow-xs transition-all group bg-gray-50/50 flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-gray-900 group-hover:text-[#00897b] transition-colors line-clamp-2 mb-2">
                      {guide.title}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#00897b]" />
                      {guide.readTime}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar Column (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">
            
            {/* Quick Action Card */}
            <div className="bg-[#1d1c1a] text-white rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#4dd0e1]">
                  Express Drop-Off
                </span>
                <span className="text-xs font-bold text-emerald-400">Open Today</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white leading-snug">
                  Repair Your {device.name} Today
                </h3>
                <p className="text-xs text-gray-300 mt-1">
                  Walk in with no appointment needed, or schedule online to hold replacement parts.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Turnaround:</span>
                  <span className="font-bold text-white">{pricing.turnaround}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Warranty:</span>
                  <span className="font-bold text-white">90 Days Included</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">Diagnostics:</span>
                  <span className="font-bold text-emerald-400">Always Free</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href={`/schedule-repair?device=${device.category}&make=${encodeURIComponent(device.brand)}&model=${encodeURIComponent(device.name)}&issue=${encodeURIComponent(issue.slug)}`}
                  className="block w-full text-center px-4 py-3 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Schedule Appointment
                </Link>
                <a
                  href="tel:+12153871700"
                  className="block w-full text-center px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Call (215) 387-1700
                </a>
              </div>
            </div>

            {/* Philadelphia Store Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00897b]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Philadelphia Bench Location
                </h4>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-bold text-gray-900">SmartFoneDoctor Flagship</p>
                <p>33 S 52nd St, Philadelphia, PA 19139</p>
                <p className="text-gray-400">Right off Market-Frankford Line (52nd St Station)</p>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Mon–Sat: 10am–7pm</span>
                <span className="text-gray-500">Sun: 11am–5pm</span>
              </div>
              <a
                href="https://maps.google.com/?q=33+S+52nd+St+Philadelphia+PA+19139"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#00897b] hover:underline flex items-center gap-1 pt-1"
              >
                <span>Get Driving Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Quick Links & Customer Services */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Quick Navigation &amp; Help
              </span>
              <ul className="space-y-2 text-xs font-medium text-gray-700">
                <li>
                  <Link
                    href="/track"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 hover:text-[#00897b] transition-colors border border-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-[#00897b]" />
                      Track Ongoing Ticket
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/locations/i/book-repair"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 hover:text-[#00897b] transition-colors border border-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#00897b]" />
                      All 3 Store Locations
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/review"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 hover:text-[#00897b] transition-colors border border-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-[#00897b]" />
                      Customer Reviews (4.9★)
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 hover:text-[#00897b] transition-colors border border-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-[#00897b]" />
                      Hardware Repair FAQ
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Neighborhoods Served */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Serving Philadelphia Areas
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {neighborhoods.map((n) => (
                  <span
                    key={n}
                    className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </div>

      {/* ── 4. STICKY MOBILE BOOKING BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] font-bold uppercase text-gray-400 block">{device.name} {issue.shortName}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-gray-900">${pricing.aftermarket}</span>
            <span className="text-[10px] text-gray-500">• {pricing.turnaround}</span>
          </div>
        </div>
        <Link
          href={`/schedule-repair?device=${device.category}&make=${encodeURIComponent(device.brand)}&model=${encodeURIComponent(device.name)}&issue=${encodeURIComponent(issue.slug)}`}
          className="px-5 py-2.5 rounded-full bg-[#00897b] text-white text-xs font-bold uppercase tracking-wider active:scale-95 transition-transform"
        >
          Book Now
        </Link>
      </div>

    </main>
  );
}
