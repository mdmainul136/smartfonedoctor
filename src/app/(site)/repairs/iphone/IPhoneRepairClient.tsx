"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Smartphone,
  Battery,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  Sparkles,
  ChevronRight,
  ArrowDown,
} from "lucide-react";
import Footer from "@/components/layout/Footer";

interface RepairServiceItem {
  id: string;
  title: string;
  category: "screen" | "battery" | "charging" | "camera" | "water" | "diagnostic";
  image: string;
  turnaround: string;
}

const REPAIR_SERVICES: RepairServiceItem[] = [
  {
    id: "diag-1",
    title: "Cell Phone General Diagnostic",
    category: "diagnostic",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80",
    turnaround: "Free • 15 Mins",
  },
  {
    id: "batt-1",
    title: "iPhone Battery Replacement",
    category: "battery",
    image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 30 Mins",
  },
  {
    id: "scrn-1",
    title: "Samsung Galaxy Screen Repair",
    category: "screen",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 45 Mins",
  },
  {
    id: "scrn-2",
    title: "iPhone 16 / 15 Screen Replacement",
    category: "screen",
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 45 Mins",
  },
  {
    id: "scrn-3",
    title: "iPhone Screen Repair Guide & Quote",
    category: "screen",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&auto=format&fit=crop&q=80",
    turnaround: "Instant Estimate",
  },
  {
    id: "wat-1",
    title: "Smartphone Water Damage Diagnostic",
    category: "water",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day Assessment",
  },
  {
    id: "scrn-4",
    title: "iPhone 14 / 13 Screen Replacement",
    category: "screen",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 45 Mins",
  },
  {
    id: "scrn-5",
    title: "Samsung Galaxy S24 / S23 Screen Fix",
    category: "screen",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 45 Mins",
  },
  {
    id: "chrg-1",
    title: "Headphone Jack & Audio Port Repair",
    category: "charging",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 30 Mins",
  },
  {
    id: "cam-1",
    title: "iPhone Camera Lens & Sensor Repair",
    category: "camera",
    image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 45 Mins",
  },
  {
    id: "cam-2",
    title: "Cell Phone Speaker & Mic Repair",
    category: "camera",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 30 Mins",
  },
  {
    id: "wat-2",
    title: "Phone Liquid Ultrasonic Cleaning",
    category: "water",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • Deep Clean",
  },
  {
    id: "wat-3",
    title: "Water Damaged Motherboard Repair",
    category: "water",
    image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=300&auto=format&fit=crop&q=80",
    turnaround: "1–2 Business Days",
  },
  {
    id: "cam-3",
    title: "Mobile Earpiece Speaker Replacement",
    category: "camera",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 30 Mins",
  },
  {
    id: "cam-4",
    title: "Rear Camera Lens Glass Repair",
    category: "camera",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 30 Mins",
  },
  {
    id: "chrg-2",
    title: "Power Button & Volume Key Repair",
    category: "charging",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 45 Mins",
  },
  {
    id: "chrg-3",
    title: "Home Button / Touch ID Repair",
    category: "charging",
    image: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 30 Mins",
  },
  {
    id: "cam-5",
    title: "Front Selfie Camera & Face ID Repair",
    category: "camera",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 45 Mins",
  },
  {
    id: "diag-2",
    title: "Emergency Data Recovery & Transfer",
    category: "diagnostic",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&auto=format&fit=crop&q=80",
    turnaround: "Secure File Extract",
  },
  {
    id: "scrn-6",
    title: "Cracked Back Glass Laser Fix",
    category: "screen",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 60 Mins",
  },
  {
    id: "chrg-4",
    title: "Lightning / USB-C Port Replacement",
    category: "charging",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 45 Mins",
  },
  {
    id: "chrg-5",
    title: "Antenna & 5G Cellular Signal Repair",
    category: "charging",
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 45 Mins",
  },
  {
    id: "batt-2",
    title: "Fast Battery Drain & Power IC Fix",
    category: "battery",
    image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • Micro-solder",
  },
  {
    id: "scrn-7",
    title: "Back Housing & Frame Alignment",
    category: "screen",
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=300&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 60 Mins",
  },
];

export default function IPhoneRepairClient() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredServices = REPAIR_SERVICES.filter((svc) => {
    const matchesCategory =
      activeCategory === "all" ? true : svc.category === activeCategory;
    const matchesSearch = svc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="bg-[#fcfcfc] min-h-screen">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* 1. Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-[12px] text-neutral-500 font-normal">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-sfd-teal transition-colors">
                Home
              </Link>
            </li>
            <li>&gt;</li>
            <li>
              <Link href="/schedule-repair" className="hover:text-sfd-teal transition-colors">
                Smartphone Repair
              </Link>
            </li>
            <li>&gt;</li>
            <li className="text-neutral-700 font-medium" aria-current="page">
              iPhone Repair
            </li>
          </ol>
        </nav>

        {/* 2. CPR Style Hero Banner Card */}
        <div className="relative w-full rounded-[24px] overflow-hidden bg-neutral-900 min-h-[380px] sm:min-h-[440px] flex items-center mb-14 sm:mb-16 shadow-sm">
          {/* Background Technician Image with Gradient */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1600&auto=format&fit=crop&q=85"
              alt="iPhone Repair Technician"
              fill
              className="object-cover object-center opacity-45 brightness-75"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl p-6 sm:p-10 lg:p-14 text-white">
            <span className="inline-block px-3 py-1 rounded-full border border-white/30 text-[11px] font-semibold tracking-wider uppercase mb-4 backdrop-blur-xs">
              Smartphone Repair
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight sm:leading-snug">
              iPhone Repair: Screens, Batteries & More for Every Model, Fixed Same Day
            </h1>
            <p className="mt-3.5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
              From cracked screens and worn-out batteries, SmartFoneDoctor repair experts fix
              every model—from older favorites to the newest flagship devices. Most repairs are
              done in 45 minutes or less, backed by our warranty on parts and labor. Walk into your
              local SmartFoneDoctor store or book an appointment online today.
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/schedule-repair"
                className="px-6 py-3 rounded-full bg-[#c8102e] hover:bg-[#a00c24] text-white font-bold text-xs sm:text-sm tracking-wide uppercase transition shadow-md active:scale-95"
              >
                Book Repair
              </Link>
              <a
                href="#services-selection"
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition flex items-center gap-2 border border-white/20"
              >
                <span>Already know what you need? Find it below</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* 3. Explore Our Repair Selection and Book Your Consultation */}
        <section id="services-selection" className="mb-16 sm:mb-20 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-3 border-b border-neutral-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1d1c1a] tracking-tight">
                Explore our repair selection and book your consultation.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Select a specific service below to schedule your prioritized repair at any of our 3 locations.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/schedule-repair"
                className="px-4 py-2 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-semibold tracking-wide transition shadow-xs"
              >
                Book a repair
              </Link>
            </div>
          </div>

          {/* Filter Chips & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
              {[
                { label: "All Repairs", key: "all" },
                { label: "Screen", key: "screen" },
                { label: "Battery", key: "battery" },
                { label: "Charging & Ports", key: "charging" },
                { label: "Camera & Mic", key: "camera" },
                { label: "Water Damage", key: "water" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === tab.key
                      ? "bg-sfd-teal text-white shadow-xs"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search repair service..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs focus:outline-none focus:border-sfd-teal focus:ring-1 focus:ring-sfd-teal"
              />
            </div>
          </div>

          {/* 3-Column Grid of 24 Repair Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredServices.map((svc) => (
              <Link
                key={svc.id}
                href={`/schedule-repair?service=${encodeURIComponent(svc.title)}`}
                className="group flex items-center gap-3 p-3 rounded-2xl bg-white border border-neutral-200 hover:border-sfd-teal/40 hover:shadow-md transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                  <Image
                    src={svc.image}
                    alt={svc.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Card Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-[13px] font-bold text-neutral-900 group-hover:text-sfd-teal transition-colors truncate">
                    {svc.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-neutral-500">
                    <Clock className="w-3 h-3 text-sfd-teal" />
                    <span>{svc.turnaround}</span>
                  </div>
                  <span className="inline-flex items-center text-[11px] font-semibold text-[#c8102e] group-hover:underline mt-1">
                    Learn more &gt;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Three Column Feature Cards (Screen, Battery, Pricing) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 sm:mb-20">
          {/* Card 1: Screen Replacement */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col">
            <div className="relative h-48 w-full bg-neutral-900">
              <Image
                src="https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80"
                alt="Screen Replacement"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1d1c1a] mb-2">
                  Screen Replacement
                </h3>
                <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                  A cracked or unresponsive screen doesn&apos;t mean your phone is finished. At
                  SmartFoneDoctor, our certified technicians replace damaged OLED, LCD, and glass panels
                  using OEM-grade assemblies. We preserve True Tone, 120Hz ProMotion refresh rate,
                  and crisp touch digitizer response—usually in under 45 minutes.
                </p>
              </div>
              <Link
                href="/schedule-repair?issue=screen"
                className="mt-4 text-xs font-bold text-sfd-teal hover:underline inline-flex items-center gap-1"
              >
                Schedule screen repair &gt;
              </Link>
            </div>
          </div>

          {/* Card 2: Battery Replacement */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col">
            <div className="relative h-48 w-full bg-neutral-900">
              <Image
                src="https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80"
                alt="Battery Replacement"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1d1c1a] mb-2">
                  Battery Replacement
                </h3>
                <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                  If your phone shuts down unexpectedly, drains rapidly from 50% to zero, or feels sluggish,
                  your lithium battery has aged past its useful cycle lifespan. We install brand-new,
                  tested high-capacity batteries that restore all-day battery life in just 30 minutes.
                </p>
              </div>
              <Link
                href="/schedule-repair?issue=battery"
                className="mt-4 text-xs font-bold text-sfd-teal hover:underline inline-flex items-center gap-1"
              >
                Schedule battery replacement &gt;
              </Link>
            </div>
          </div>

          {/* Card 3: How Much Will It Cost? */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col">
            <div className="relative h-48 w-full bg-neutral-900">
              <Image
                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&auto=format&fit=crop&q=80"
                alt="Repair Pricing Consultation"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1d1c1a] mb-2">
                  How much will it cost?
                </h3>
                <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                  At SmartFoneDoctor, we believe in 100% transparent pricing. Every repair starts with a
                  free multi-point diagnostic check and an exact upfront quote before any work begins.
                  No surprise fees, no hidden labor costs. If we cannot fix your device, you owe us nothing.
                </p>
              </div>
              <Link
                href="/locations/i/book-repair"
                className="mt-4 text-xs font-bold text-sfd-teal hover:underline inline-flex items-center gap-1"
              >
                Get free store estimate &gt;
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Genuine Parts Banners (Samsung & Apple Side-by-Side) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 sm:mb-20">
          {/* Samsung Banner */}
          <div className="rounded-3xl p-8 sm:p-10 bg-[#eef3f7] border border-blue-100 flex flex-col justify-between relative overflow-hidden">
            <div className="max-w-md z-10">
              <span className="inline-block px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider mb-4">
                Genuine OEM Quality
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                Samsung parts you can depend on
              </h3>
              <p className="mt-2 text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                We service Samsung Galaxy S-Series, Z Fold, Z Flip, and Note devices with premium
                OEM AMOLED displays, high-efficiency batteries, and factory-tested water seals.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm font-black tracking-widest text-neutral-900">
                  SAMSUNG
                </span>
                <span className="text-neutral-400">|</span>
                <span className="text-xs text-neutral-600 font-medium">Galaxy Certified Service</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-200/60 z-10">
              <Link
                href="/schedule-repair"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
              >
                Book Samsung Galaxy Repair &gt;
              </Link>
            </div>
          </div>

          {/* Apple Banner */}
          <div className="rounded-3xl p-8 sm:p-10 bg-[#121316] text-white flex flex-col justify-between relative overflow-hidden shadow-md">
            <div className="max-w-md z-10">
              <span className="inline-block px-2.5 py-1 rounded bg-[#009691] text-white text-[10px] font-bold uppercase tracking-wider mb-4">
                Available at SFD
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Apple® Genuine Parts &amp; Service
              </h3>
              <p className="mt-2 text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                Restore your iPhone with factory-spec original parts. Enjoy peace of mind knowing your
                Face ID, True Tone display calibration, and battery health telemetry remain 100% functional
                and error-free.
              </p>
              <div className="mt-6 flex items-center gap-2 text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-sfd-teal" />
                <span className="text-xs font-medium">Lifetime Workmanship Guarantee</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 z-10">
              <Link
                href="/schedule-repair"
                className="text-xs font-bold text-sfd-teal hover:underline inline-flex items-center gap-1"
              >
                Book Apple iPhone Repair &gt;
              </Link>
            </div>
          </div>
        </section>

        {/* 6. Bottom Call to Action Banner */}
        <section className="w-full rounded-2xl sm:rounded-3xl bg-[#1d1c1a] text-white p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md mb-8">
          <div>
            <h3 className="text-lg sm:text-2xl font-bold tracking-tight">
              Get Your Device Repaired Today!
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Visit our flagship store at 33 S 52nd St, Philadelphia or schedule an appointment online to skip the wait.
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

