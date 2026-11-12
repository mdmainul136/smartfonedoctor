"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  Search,
  Monitor,
  Wrench,
  ArrowDown,
  ArrowRight,
  Smartphone,
  Tablet,
  Laptop,
  Gamepad2,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import type { ServiceCMSData } from "@/data/servicesData";

interface Props {
  service: ServiceCMSData;
}

export default function ServiceDetailClient({ service }: Props) {
  const [viewMode, setViewMode] = useState<"models" | "issues">("models");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = service.models.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.specs && item.specs.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredIssues = service.commonIssues.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="bg-[#fcfcfc] min-h-screen">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-[12px] text-neutral-500 font-normal">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-sfd-teal transition-colors">
                Home
              </Link>
            </li>
            <li>&gt;</li>
            <li>
              <Link
                href={`/repairs/${service.categoryId}`}
                className="hover:text-sfd-teal transition-colors"
              >
                {service.categoryName}
              </Link>
            </li>
            <li>&gt;</li>
            <li className="text-neutral-700 font-medium" aria-current="page">
              {service.serviceName}
            </li>
          </ol>
        </nav>

        {/* 2. Hero Banner Card */}
        <div className="relative w-full rounded-[24px] overflow-hidden bg-neutral-900 min-h-[380px] sm:min-h-[440px] flex items-center mb-14 sm:mb-16 shadow-sm">
          {/* Background Technician Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={service.heroImage}
              alt={service.serviceName}
              fill
              className="object-cover object-center opacity-40 brightness-75"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl p-6 sm:p-10 lg:p-14 text-white">
            <span className="inline-block px-3 py-1 rounded-full border border-white/30 text-[11px] font-semibold tracking-wider uppercase mb-4 backdrop-blur-xs">
              {service.tag}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight sm:leading-snug">
              {service.heroTitle}
            </h1>
            <p className="mt-3.5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
              {service.heroSubtitle}
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/schedule-repair?service=${encodeURIComponent(service.serviceName)}`}
                className="px-6 py-3 rounded-full bg-[#c8102e] hover:bg-[#a00c24] text-white font-bold text-xs sm:text-sm tracking-wide uppercase transition shadow-md active:scale-95"
              >
                Book Repair
              </Link>
              <Link
                href="/repair-status"
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition flex items-center gap-2 border border-white/20"
              >
                <span>Already have a repair with us? Check status &gt;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Explore Selection Section */}
        <section className="mb-16 sm:mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-3 border-b border-neutral-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1d1c1a] tracking-tight">
                Explore our repair selection and book your consultation.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Select your model or common hardware problem below to schedule immediate drop-off or pickup.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setViewMode("models")}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${
                  viewMode === "models"
                    ? "bg-black text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {service.modelsLabel}
              </button>
              <button
                onClick={() => setViewMode("issues")}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${
                  viewMode === "issues"
                    ? "bg-black text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                Common Issues
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72 mb-6">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model or issue..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-neutral-200 text-xs focus:outline-none focus:border-sfd-teal focus:ring-1 focus:ring-sfd-teal"
            />
          </div>

          {/* View Mode 1: Device Models */}
          {viewMode === "models" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredModels.map((item) => (
                <Link
                  key={item.id}
                  href={`/schedule-repair?model=${encodeURIComponent(item.title)}`}
                  className="group flex flex-col justify-between p-4 rounded-2xl bg-white border border-neutral-200 hover:border-sfd-teal/50 hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-neutral-50 mb-3 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 group-hover:text-sfd-teal transition-colors">
                      {item.title}
                    </h3>
                    {item.specs && (
                      <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                        {item.specs}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
                      <span className="text-[11px] text-neutral-400">{item.turnaround}</span>
                      <span className="text-xs font-semibold text-[#c8102e] group-hover:underline">
                        Learn more &gt;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* View Mode 2: Common Issues */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIssues.map((item) => (
                <Link
                  key={item.id}
                  href={`/schedule-repair?issue=${encodeURIComponent(item.title)}`}
                  className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-neutral-200 hover:border-sfd-teal/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-[13px] font-bold text-neutral-900 group-hover:text-sfd-teal transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-neutral-400">{item.turnaround}</span>
                      <span className="text-xs font-semibold text-[#c8102e] group-hover:underline">
                        Book fix &gt;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Optional 3-Column Feature Cards */}
        {service.featureCards && service.featureCards.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 sm:mb-20">
            {service.featureCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col"
              >
                <div className="relative h-48 w-full bg-neutral-900">
                  <Image src={card.image} alt={card.title} fill className="object-cover" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1d1c1a] mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  <Link
                    href="/schedule-repair"
                    className="mt-4 text-xs font-bold text-sfd-teal hover:underline inline-flex items-center gap-1"
                  >
                    {card.linkText}
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* 4. Side-by-Side Genuine Parts Banners */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 sm:mb-20">
          {/* Samsung Banner */}
          <div className="rounded-3xl p-8 sm:p-10 bg-[#eef3f7] border border-blue-100 flex flex-col justify-between relative overflow-hidden">
            <div className="max-w-md z-10">
              <span className="inline-block px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider mb-4">
                {service.partnerBanners.samsung.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                {service.partnerBanners.samsung.title}
              </h3>
              <p className="mt-2 text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                {service.partnerBanners.samsung.description}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm font-black tracking-widest text-neutral-900">
                  SAMSUNG
                </span>
                <span className="text-neutral-400">|</span>
                <span className="text-xs text-neutral-600 font-medium">
                  {service.partnerBanners.samsung.tag}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-200/60 z-10">
              <Link
                href="/schedule-repair"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
              >
                Book Repair Consultation &gt;
              </Link>
            </div>
          </div>

          {/* Apple Banner */}
          <div className="rounded-3xl p-8 sm:p-10 bg-[#121316] text-white flex flex-col justify-between relative overflow-hidden shadow-md">
            <div className="max-w-md z-10">
              <span className="inline-block px-2.5 py-1 rounded bg-[#009691] text-white text-[10px] font-bold uppercase tracking-wider mb-4">
                {service.partnerBanners.apple.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                {service.partnerBanners.apple.title}
              </h3>
              <p className="mt-2 text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                {service.partnerBanners.apple.description}
              </p>
              <div className="mt-6 flex items-center gap-2 text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-sfd-teal" />
                <span className="text-xs font-medium">
                  {service.partnerBanners.apple.guarantee}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 z-10">
              <Link
                href="/schedule-repair"
                className="text-xs font-bold text-sfd-teal hover:underline inline-flex items-center gap-1"
              >
                Schedule Certified Service &gt;
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Bottom Call to Action Banner */}
        <section className="w-full rounded-2xl sm:rounded-3xl bg-[#1d1c1a] text-white p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md mb-8">
          <div>
            <h3 className="text-lg sm:text-2xl font-bold tracking-tight">
              Get Your Device Repaired Today!
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Visit our Philadelphia store at 33 S 52nd St or schedule online to skip the queue.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/schedule-repair"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-[#c8102e] hover:bg-[#a00c24] text-white font-bold text-xs sm:text-sm uppercase tracking-wide transition shadow-xs active:scale-95"
            >
              Book Repair Now
            </Link>
            <Link
              href="/locations/i/book-repair"
              className="w-full sm:w-auto text-center px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs sm:text-sm transition"
            >
              Find Store
            </Link>
          </div>
        </section>
      </div>

      {/* Global Footer */}
      <Footer />
    </main>
  );
}

