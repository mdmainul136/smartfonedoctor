"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Smartphone,
  Laptop,
  Tablet,
  Gamepad2,
  Wrench,
  Search,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import Footer from "@/components/layout/Footer";

interface CommonArticle {
  id: string;
  category: "smartphones" | "computers" | "tablets" | "consoles";
  title: string;
  description: string;
  image: string;
  targetLink: string;
}

const ISSUE_ARTICLES: CommonArticle[] = [
  {
    id: "art-1",
    category: "smartphones",
    title: "Cracked Glass Replacement",
    description:
      "A cracked screen is fixable and in most cases we can replace only the glass without changing your entire display assembly. Restores touch response and clarity.",
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500&auto=format&fit=crop&q=80",
    targetLink: "/common-issues/smartphone/cracked-glass-replacement",
  },
  {
    id: "art-2",
    category: "consoles",
    title: "HDMI Port Repair",
    description:
      "No picture, flickering video, or missing audio signal on your console? Bent or loose internal HDMI port pins are a very common issue on PS5 & Xbox.",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&auto=format&fit=crop&q=80",
    targetLink: "/common-issues/console/hdmi-port-repair",
  },
  {
    id: "art-3",
    category: "tablets",
    title: "Tablet Screen Damage (Glass Only)",
    description:
      "If the glass is cracked but the display works normally and touches, you only need top glass replacement. Saves money and keeps OEM colors intact.",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80",
    targetLink: "/common-issues/smartphone/cracked-glass-replacement",
  },
  {
    id: "art-4",
    category: "computers",
    title: "MacBook Pro Logic Board Replacement",
    description:
      "Troubleshooting no power, black screen, overheating, liquid spill damage, and step-by-step logic board replacement for Apple MacBook Pro laptops.",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80",
    targetLink: "/common-issues/computer/macbook-pro-logic-board-replacement",
  },
  {
    id: "art-5",
    category: "tablets",
    title: "Tablet Battery Replacement",
    description:
      "Sluggish performance, bloating, fast battery discharge and random device shutoffs mean you need a new tested high-capacity tablet battery.",
    image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500&auto=format&fit=crop&q=80",
    targetLink: "/common-issues/smartphone/battery-replacement",
  },
  {
    id: "art-6",
    category: "smartphones",
    title: "Charging Port Repair",
    description:
      "Device won't take charge, needs wiggling or cable disconnects? Port cleaning or micro-soldered replacement fixes slow and failed charging fast.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
    targetLink: "/common-issues/smartphone/charging-port-replacement",
  },
  {
    id: "art-7",
    category: "consoles",
    title: "Console Power Issues",
    description:
      "Console won't turn on, turns off randomly while gaming or beeps once and shuts down? Power supply and motherboard diagnostics available.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80",
    targetLink: "/repairs/console/playstation-repair",
  },
  {
    id: "art-8",
    category: "computers",
    title: "MacBook Pro Battery Replacement",
    description:
      "Service recommended alerts, reduced runtime, and thermal throttling means it's time for a battery refresh before cells swell and warp the trackpad.",
    image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500&auto=format&fit=crop&q=80",
    targetLink: "/repairs/computer/macbook-repair",
  },
  {
    id: "art-9",
    category: "consoles",
    title: "Disc Drive Issues",
    description:
      "Disc won't read, drive won't take or eject discs, or makes grinding clicking noises? Optical laser lens alignment and roller motor fixes restore gaming.",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80",
    targetLink: "/repairs/console/playstation-repair",
  },
  // Page 2 items
  {
    id: "art-10",
    category: "smartphones",
    title: "Water & Liquid Damage Recovery",
    description:
      "Submerged or splashed phone? Ultrasonic cleaning chambers and board drying remove toxic mineral corrosion before circuit lines permanently short out.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=80",
    targetLink: "/repairs/smartphone/iphone-repair",
  },
  {
    id: "art-11",
    category: "computers",
    title: "Slow Performance & Hard Drive Upgrade",
    description:
      "Spinning beach ball or endless boot times? Swapping your outdated HDD for an ultra-fast solid state drive (SSD) makes your computer 10x faster.",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=80",
    targetLink: "/repairs/computer/imac-repair",
  },
  {
    id: "art-12",
    category: "smartphones",
    title: "Camera Shaky & Lens Shattered",
    description:
      "Camera vibrating violently, unable to focus, or cracked camera glass? We replace outer sapphire glass and optical image stabilization sensors.",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&auto=format&fit=crop&q=80",
    targetLink: "/repairs/smartphone/iphone-repair",
  },
  {
    id: "art-13",
    category: "consoles",
    title: "Console Overheating & Fan Noise",
    description:
      "PS5 or Xbox warning that the console is too hot? Deep dust decontamination and liquid metal thermal repasting prevent irreversible APU damage.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
    targetLink: "/repairs/console/playstation-repair",
  },
  {
    id: "art-14",
    category: "tablets",
    title: "Bent iPad Frame & Enclosure Fix",
    description:
      "Tablets can easily bend inside backpacks. We straighten aluminum unibodies with precision clamps so replacement screens sit perfectly flush.",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&auto=format&fit=crop&q=80",
    targetLink: "/repairs/tablet/ipad-repair",
  },
  {
    id: "art-15",
    category: "computers",
    title: "Logic Board Micro-Soldering Fix",
    description:
      "When other repair shops say your computer is dead, our certified technicians repair board components, blown diodes, and damaged capacitors.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80",
    targetLink: "/repairs/computer/imac-repair",
  },
];

export default function CommonIssuesClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  // Filter items
  const filteredArticles = ISSUE_ARTICLES.filter((art) => {
    const matchesCat =
      selectedCategory === "all" ? true : art.category === selectedCategory;
    const matchesQuery =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArticles = filteredArticles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleCategorySelect = (catKey: string) => {
    setSelectedCategory(catKey);
    setCurrentPage(1);
    const element = document.getElementById("browse-category-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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
            <li className="text-neutral-700 font-medium" aria-current="page">
              Common Issues
            </li>
          </ol>
        </nav>

        {/* 2. Hero Banner Card */}
        <div className="relative w-full rounded-[24px] overflow-hidden bg-neutral-900 min-h-[380px] sm:min-h-[440px] flex items-center mb-16 shadow-sm">
          {/* Background image: Hand holding phone with cracked glass */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1600&auto=format&fit=crop&q=85"
              alt="Cracked Phone and Electronics"
              fill
              className="object-cover object-center opacity-45 brightness-75"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl p-6 sm:p-10 lg:p-14 text-white">
            <span className="inline-block px-3 py-1 rounded-full border border-white/30 text-[11px] font-semibold tracking-wider uppercase mb-4 backdrop-blur-xs">
              Common Issues
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight sm:leading-snug">
              What&apos;s Wrong With Your Phone, Computer, Tablet or Console?
            </h1>
            <p className="mt-3.5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
              Cracked screens, dead batteries, water damage, charging problems and game consoles
              that won&apos;t display or power on. Find your issue below, learn what&apos;s causing it,
              and get it fixed at one of SmartFoneDoctor&apos;s 3 Philadelphia locations with most repairs
              completed the same day.
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/locations/i/book-repair"
                className="px-6 py-3 rounded-full bg-[#c8102e] hover:bg-[#a00c24] text-white font-bold text-xs sm:text-sm tracking-wide uppercase transition shadow-md active:scale-95"
              >
                Find a Store Near Me
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

        {/* 3. Most Common General Issues Section */}
        <section className="mb-20 text-center">
          {/* Header Motif */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1d1c1a] tracking-tight">
              Most Common General Issues
            </h2>
            <div className="flex items-center gap-0.5">
              <span className="text-[#c8102e] text-lg font-bold">+</span>
              <span className="text-[#009691] text-sm font-bold -mt-1">+</span>
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Whether your device has a cracked screen, water damage, won&apos;t charge, or experiencing
            display problems, we have diagnostics for your problem below. Click on your issue to learn
            what&apos;s wrong and make a reservation with us to spend less time waiting at our store.
          </p>

          {/* 4 Category Issue Cards (Horizontal Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            {/* Card 1: Smartphones */}
            <div className="rounded-3xl p-6 bg-[#fdeeee] border border-rose-100 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4 bg-white/40 flex items-center justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80"
                    alt="Smartphone Common Issues"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Smartphones
                </span>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mt-1">
                  Common Issues on Smartphones
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Screens, batteries, charging ports, water damage
                </p>
              </div>
              <button
                onClick={() => handleCategorySelect("smartphones")}
                className="mt-6 w-full py-2.5 rounded-full border border-neutral-400 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white text-xs font-semibold text-neutral-800 transition cursor-pointer text-center"
              >
                Read More
              </button>
            </div>

            {/* Card 2: Computers */}
            <div className="rounded-3xl p-6 bg-[#fae8e8] border border-red-100 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4 bg-white/40 flex items-center justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80"
                    alt="Computer Common Issues"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Computers
                </span>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mt-1">
                  Common Issues on Computers
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Displays, batteries, SSD storage drives, liquid spills
                </p>
              </div>
              <button
                onClick={() => handleCategorySelect("computers")}
                className="mt-6 w-full py-2.5 rounded-full border border-neutral-400 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white text-xs font-semibold text-neutral-800 transition cursor-pointer text-center"
              >
                Read More
              </button>
            </div>

            {/* Card 3: Tablets */}
            <div className="rounded-3xl p-6 bg-[#eaf3f8] border border-sky-100 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4 bg-white/40 flex items-center justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&auto=format&fit=crop&q=80"
                    alt="Tablet Common Issues"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Tablets
                </span>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mt-1">
                  Common Issues on Tablets
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Cracked glass, cameras, USB-C ports, bent enclosures
                </p>
              </div>
              <button
                onClick={() => handleCategorySelect("tablets")}
                className="mt-6 w-full py-2.5 rounded-full border border-neutral-400 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white text-xs font-semibold text-neutral-800 transition cursor-pointer text-center"
              >
                Read More
              </button>
            </div>

            {/* Card 4: Game Consoles (Dark Card) */}
            <div className="rounded-3xl p-6 bg-[#1a1c22] text-white border border-neutral-800 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-4 bg-neutral-800/60 flex items-center justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&auto=format&fit=crop&q=80"
                    alt="Console Common Issues"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Consoles
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                  Common Issues on Game Consoles
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  No video, power faults, disc drives, overheating
                </p>
              </div>
              <button
                onClick={() => handleCategorySelect("consoles")}
                className="mt-6 w-full py-2.5 rounded-full border border-neutral-600 hover:border-white hover:bg-white hover:text-neutral-900 text-xs font-semibold text-white transition cursor-pointer text-center"
              >
                Read More
              </button>
            </div>
          </div>
        </section>

        {/* 4. Browse Issues by Category Section */}
        <section id="browse-category-section" className="mb-20 scroll-mt-24">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-3 border-b border-neutral-200">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1d1c1a] tracking-tight">
              Browse Issues by category
            </h2>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {[
                { label: "Current Issues", key: "all" },
                { label: "Smartphones", key: "smartphones" },
                { label: "Computers", key: "computers" },
                { label: "Tablets", key: "tablets" },
                { label: "Game Consoles", key: "consoles" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setSelectedCategory(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === tab.key
                      ? "bg-black text-white shadow-xs"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Issue Cards 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentArticles.map((art) => (
              <div
                key={art.id}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-44 bg-neutral-100 overflow-hidden">
                    <Image
                      src={art.image}
                      alt={art.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 line-clamp-1">
                      {art.title}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-2 line-clamp-3 leading-relaxed">
                      {art.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={art.targetLink}
                    className="inline-flex items-center text-xs font-bold text-[#c8102e] hover:underline"
                  >
                    Read Full Article &gt;
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-[#c8102e] text-white shadow-xs"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {currentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-xs font-bold flex items-center justify-center transition cursor-pointer"
                >
                  &gt;
                </button>
              )}
            </div>
          )}
        </section>

        {/* 5. "We Fix Game Consoles Too" Callout Card */}
        <section className="rounded-3xl bg-[#dbe5ee] p-6 sm:p-10 mb-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="inline-block px-2.5 py-1 rounded bg-white text-neutral-800 text-[10px] font-bold uppercase tracking-wider mb-3">
              Console Repairs
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              We Fix Game Consoles Too
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              PlayStation, Xbox and Nintendo — not just phones. If your console won&apos;t display,
              won&apos;t power on, or won&apos;t read discs, bring it into your local store for a quick diagnostic.
            </p>

            {/* Quick Symptom Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
              {[
                "No video output",
                "Won't power on",
                "Disc drive failure",
                "Storage errors",
              ].map((symptom, i) => (
                <div
                  key={i}
                  className="bg-white/80 rounded-xl p-2.5 text-center text-xs font-semibold text-neutral-800 border border-white"
                >
                  {symptom}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link
                href="/repairs/console/playstation-repair"
                className="px-5 py-2.5 rounded-full bg-[#c8102e] hover:bg-[#a00c24] text-white text-xs font-bold uppercase tracking-wide transition shadow-xs"
              >
                See All Console Issues
              </Link>
              <Link
                href="/locations/i/book-repair"
                className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-semibold border border-neutral-300 transition"
              >
                Find a Store Near Me
              </Link>
            </div>
          </div>

          {/* Console & Controller Image */}
          <div className="relative w-72 h-64 sm:w-80 sm:h-72 shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80"
              alt="PlayStation & Xbox Console"
              fill
              className="object-contain"
            />
          </div>
        </section>

        {/* 6. Thin Trust Bar */}
        <section className="w-full rounded-2xl bg-[#1d1c1a] text-white py-3 px-4 mb-16 text-center text-[11px] sm:text-xs font-medium tracking-wide flex flex-wrap items-center justify-around gap-2 shadow-xs">
          <div className="flex items-center gap-1.5 text-neutral-200">
            <span className="text-[#009691] font-bold">✓</span> Most Repairs Same Day
          </div>
          <div className="flex items-center gap-1.5 text-neutral-200">
            <span className="text-[#009691] font-bold">✓</span> Free Diagnostics &amp; Estimates
          </div>
          <div className="flex items-center gap-1.5 text-neutral-200">
            <span className="text-[#009691] font-bold">✓</span> Limited Lifetime Warranty
          </div>
          <div className="flex items-center gap-1.5 text-neutral-200">
            <span className="text-[#009691] font-bold">✓</span> 3 Philadelphia Locations
          </div>
        </section>

        {/* 7. "Can't find your issue?" Consultation Card */}
        <section className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-2 mb-8">
          <div className="relative h-64 lg:h-auto w-full bg-neutral-900">
            <Image
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
              alt="SmartFoneDoctor Store Front"
              fill
              className="object-cover"
            />
          </div>

          <div className="p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sfd-teal bg-sfd-teal/10 px-2.5 py-0.5 rounded-full">
                  Find a SFD store near you
                </span>
                <span className="text-red-500 font-bold">+</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                Can&apos;t find your issue?
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Phone, computer, tablet or game console — bring your device into a SmartFoneDoctor store
                for a free diagnostic. Our specialized technicians can diagnose complex problems and offer
                an exact solution before performing any repair. Free repair estimates with no obligation.
              </p>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <Link
                href="/locations/i/book-repair"
                className="px-6 py-3 rounded-full bg-[#c8102e] hover:bg-[#a00c24] text-white text-xs font-bold uppercase tracking-wide transition shadow-xs"
              >
                Find a Store
              </Link>
              <Link
                href="/schedule-repair"
                className="px-6 py-3 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold border border-neutral-300 transition"
              >
                Book a Repair
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Global Footer */}
      <Footer />
    </main>
  );
}

