"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Monitor,
  Laptop,
  HardDrive,
  Cpu,
  ShieldCheck,
  Clock,
  Search,
  CheckCircle2,
  Wrench,
  Sparkles,
} from "lucide-react";
import Footer from "@/components/layout/Footer";

interface MacDeviceItem {
  id: string;
  title: string;
  specs: string;
  image: string;
  turnaround: string;
}

interface CommonIssueItem {
  id: string;
  title: string;
  description: string;
  image: string;
  turnaround: string;
}

const MAC_DEVICES: MacDeviceItem[] = [
  {
    id: "imac-pro",
    title: "iMac Pro",
    specs: "27-inch 5K Retina (Space Gray, Intel Xeon)",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • Diagnostics",
  },
  {
    id: "imac-24",
    title: "iMac 24\"",
    specs: "4.5K Retina Display (Apple Silicon M1, M3, M4)",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 60 Mins",
  },
  {
    id: "imac-27",
    title: "iMac 27\"",
    specs: "5K Retina Slim Aluminum Unibody All-in-One",
    image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=400&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • Hardware Fix",
  },
  {
    id: "macbook-pro",
    title: "MacBook Pro Series",
    specs: "14-inch & 16-inch M-Series, 13-inch Touch Bar",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 45 Mins",
  },
  {
    id: "macbook-air",
    title: "MacBook Air Series",
    specs: "13-inch & 15-inch Liquid Retina (M1/M2/M3)",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 45 Mins",
  },
  {
    id: "mac-mini",
    title: "Mac Mini & Studio",
    specs: "Compact Desktop Apple Silicon Powerhouses",
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • Diagnostics",
  },
];

const COMMON_MAC_ISSUES: CommonIssueItem[] = [
  {
    id: "screen",
    title: "Retina Screen & Glass Replacement",
    description: "Fix cracked glass, distorted vertical lines, black screen of death, or damaged LCD flex cables.",
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 60 Mins",
  },
  {
    id: "ssd",
    title: "High-Speed SSD Upgrade & Data Recovery",
    description: "Upgrade failing mechanical spinning hard drives or slow Fusion drives to blazing-fast NVMe SSDs with complete file transfer.",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 1–2 Hours",
  },
  {
    id: "logicboard",
    title: "Logic Board Micro-Soldering Repair",
    description: "Component-level repairs for no-power symptoms, blown capacitors, shorted GPU/CPU power rails, and backlight ICs.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80",
    turnaround: "1–3 Business Days",
  },
  {
    id: "liquid",
    title: "Liquid Spill Ultrasonic Cleaning",
    description: "Emergency board treatment to neutralize sticky coffee, water, and wine spills before corrosion permanently damages circuits.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80",
    turnaround: "Same-Day Assessment",
  },
  {
    id: "battery",
    title: "Battery & Trackpad Replacement",
    description: "Restore battery health alerts, remove dangerous swollen battery cells, and fix unresponsive or clicking trackpads.",
    image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 45 Mins",
  },
  {
    id: "thermal",
    title: "Overheating, Fan Noise & Thermal Paste",
    description: "Deep clean dust clogged heatsinks and apply premium Arctic thermal compound to eliminate thermal throttling and loud fan noise.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
    turnaround: "Same-Day • 30 Mins",
  },
];

export default function MacRepairClient() {
  const [viewMode, setViewMode] = useState<"devices" | "issues">("devices");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDevices = MAC_DEVICES.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specs.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIssues = COMMON_MAC_ISSUES.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.description.toLowerCase().includes(searchQuery.toLowerCase())
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
              <span className="text-neutral-500">Computer Repair</span>
            </li>
            <li>&gt;</li>
            <li>
              <span className="text-neutral-500">All-in-One Computer Repair</span>
            </li>
            <li>&gt;</li>
            <li className="text-neutral-700 font-medium" aria-current="page">
              iMac Series
            </li>
          </ol>
        </nav>

        {/* 2. Hero Banner Card */}
        <div className="relative w-full rounded-[24px] overflow-hidden bg-neutral-900 min-h-[380px] sm:min-h-[440px] flex items-center mb-14 sm:mb-16 shadow-sm">
          {/* Background Image: Logic board repair in gloves */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=85"
              alt="iMac Computer Repair Technician"
              fill
              className="object-cover object-center opacity-40 brightness-75"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl p-6 sm:p-10 lg:p-14 text-white">
            <span className="inline-block px-3 py-1 rounded-full border border-white/30 text-[11px] font-semibold tracking-wider uppercase mb-4 backdrop-blur-xs">
              Computer Repair
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight sm:leading-snug">
              iMac Repair: Screens, Hard Drives, Slow Performance &amp; More
            </h1>
            <p className="mt-3.5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
              SmartFoneDoctor repair experts repair iMac and iMac Pro, whether it&apos;s screen damage,
              a hard drive failure, an upgrade or a slowdown. Our expert technicians back every repair
              with a limited warranty. Get a free repair estimate today.
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/schedule-repair"
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
                Select your Mac model or common hardware problem to get an exact quote and schedule fast service.
              </p>
            </div>

            {/* Toggle between Devices and Common Issues */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setViewMode("devices")}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "devices"
                    ? "bg-black text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Devices</span>
              </button>
              <button
                onClick={() => setViewMode("issues")}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "issues"
                    ? "bg-black text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Common Issues</span>
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
              placeholder="Search Mac model or issue..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-neutral-200 text-xs focus:outline-none focus:border-sfd-teal focus:ring-1 focus:ring-sfd-teal"
            />
          </div>

          {/* Devices Grid View */}
          {viewMode === "devices" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDevices.map((item) => (
                <Link
                  key={item.id}
                  href={`/schedule-repair?device=computer&model=${encodeURIComponent(item.title)}`}
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-white border border-neutral-200 hover:border-sfd-teal/50 hover:shadow-lg transition-all duration-200"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-50 shrink-0 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-neutral-900 group-hover:text-sfd-teal transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-snug">
                      {item.specs}
                    </p>
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
            /* Common Issues View */
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
                        Book repair &gt;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 4. Genuine Parts Banners Side-by-Side */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 sm:mb-20">
          {/* Samsung Parts Banner */}
          <div className="rounded-3xl p-8 sm:p-10 bg-[#eef3f7] border border-blue-100 flex flex-col justify-between relative overflow-hidden">
            <div className="max-w-md z-10">
              <span className="inline-block px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider mb-4">
                Service You Can Trust
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                Samsung parts you can depend on.
              </h3>
              <p className="mt-2 text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                As a trusted service provider, SmartFoneDoctor proudly offers genuine OEM SSDs, memory,
                and display components for select Samsung devices and high-end workstations.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm font-black tracking-widest text-neutral-900">
                  SAMSUNG
                </span>
                <span className="text-neutral-400">|</span>
                <span className="text-xs text-neutral-600 font-medium">Certified Memory &amp; Storage</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-200/60 z-10">
              <Link
                href="/schedule-repair"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
              >
                Book Computer Repair &gt;
              </Link>
            </div>
          </div>

          {/* Apple Genuine Parts Banner */}
          <div className="rounded-3xl p-8 sm:p-10 bg-[#121316] text-white flex flex-col justify-between relative overflow-hidden shadow-md">
            <div className="max-w-md z-10">
              <span className="inline-block px-2.5 py-1 rounded bg-[#009691] text-white text-[10px] font-bold uppercase tracking-wider mb-4">
                Available at SFD
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Apple® Genuine Parts
              </h3>
              <p className="mt-2 text-xs sm:text-[13px] text-neutral-300 leading-relaxed">
                SmartFoneDoctor uses genuine Apple parts along with trusted diagnostics and repair processes
                to service select Mac computers, iMacs, and MacBooks with safety, quality, and peak reliability.
              </p>
              <div className="mt-6 flex items-center gap-2 text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-sfd-teal" />
                <span className="text-xs font-medium">Apple Certified Workmanship</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 z-10">
              <Link
                href="/schedule-repair"
                className="text-xs font-bold text-sfd-teal hover:underline inline-flex items-center gap-1"
              >
                Book Mac Repair &gt;
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
              Visit our Philadelphia repair store for professional iMac, MacBook, and PC services. Walk in anytime or book online.
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
              Find a SFD Store
            </Link>
          </div>
        </section>
      </div>

      {/* Global Footer */}
      <Footer />
    </main>
  );
}

