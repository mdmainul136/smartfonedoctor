"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ShieldCheck,
  Clock,
  Wrench,
  Smartphone,
  MapPin,
  Tablet,
  Layers,
  Hammer,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import { STORES } from "@/lib/stores";

type TabKey = "brands" | "series" | "repairs";

interface SelectionItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
}

const img = (id: string, w = 480) =>
  `https://images.unsplash.com/${id}?w=${w}&auto=format&fit=crop&q=80`;

const BRANDS: SelectionItem[] = [
  {
    id: "ipad",
    title: "iPad Tablet Repair",
    subtitle: "iPad, iPad Air, iPad mini & iPad Pro",
    image: img("photo-1544244015-0df4b3ffc6b0"),
    href: "/repairs/tablet/ipad-repair",
  },
  {
    id: "samsung",
    title: "Samsung Tablet Repair",
    subtitle: "Galaxy Tab S, Tab A & Tab Active",
    image: img("photo-1561154464-82e9adf32764"),
    href: "/schedule-repair?device=Samsung%20Galaxy%20Tab",
  },
  {
    id: "google",
    title: "Google Tablet Repair",
    subtitle: "Pixel Tablet & Pixel Slate",
    image: img("photo-1527698266440-12104e498b76"),
    href: "/schedule-repair?device=Google%20Pixel%20Tablet",
  },
  {
    id: "microsoft",
    title: "Microsoft Tablet Repair",
    subtitle: "Surface Pro & Surface Go",
    image: img("photo-1589739900243-4b52cd9b104e"),
    href: "/schedule-repair?device=Microsoft%20Surface",
  },
];

const SERIES: SelectionItem[] = [
  { id: "ipad-pro", title: "iPad Pro", subtitle: "11\" & 13\" (M4), 12.9\"", image: img("photo-1561154464-82e9adf32764"), href: "/schedule-repair?model=iPad%20Pro" },
  { id: "ipad-air", title: "iPad Air", subtitle: "Air 11\" & 13\" (M2), Air 5, Air 4", image: img("photo-1544244015-0df4b3ffc6b0"), href: "/schedule-repair?model=iPad%20Air" },
  { id: "ipad-mini", title: "iPad mini", subtitle: "mini 7, mini 6, mini 5", image: img("photo-1589739900243-4b52cd9b104e"), href: "/schedule-repair?model=iPad%20mini" },
  { id: "galaxy-tab-s", title: "Galaxy Tab S", subtitle: "Tab S10, S9, S8 series", image: img("photo-1623126908029-58cb08a2b272"), href: "/schedule-repair?model=Galaxy%20Tab%20S" },
  { id: "galaxy-tab-a", title: "Galaxy Tab A", subtitle: "Tab A9, A8, A7 Lite", image: img("photo-1592899677977-9c10ca588bbd"), href: "/schedule-repair?model=Galaxy%20Tab%20A" },
  { id: "surface-pro", title: "Surface Pro", subtitle: "Surface Pro 11, 10, 9", image: img("photo-1588508065123-287b28e013da"), href: "/schedule-repair?model=Surface%20Pro" },
];

const REPAIRS: SelectionItem[] = [
  { id: "screen", title: "Screen & Glass Repair", subtitle: "Cracked glass, dead touch, LCD lines", image: img("photo-1565849904461-04a58ad377e0"), href: "/schedule-repair?issue=Tablet%20Screen%20Repair" },
  { id: "battery", title: "Battery Replacement", subtitle: "Fast drain, swelling, won't hold charge", image: img("photo-1588508065123-287b28e013da"), href: "/schedule-repair?issue=Tablet%20Battery%20Replacement" },
  { id: "port", title: "Charging Port Repair", subtitle: "Loose cable, slow or no charging", image: img("photo-1592899677977-9c10ca588bbd"), href: "/schedule-repair?issue=Tablet%20Charging%20Port" },
  { id: "water", title: "Water Damage Repair", subtitle: "Spills, corrosion, no power", image: img("photo-1550751827-4bd374c3f58b"), href: "/schedule-repair?issue=Tablet%20Water%20Damage" },
  { id: "frame", title: "Bent Frame Repair", subtitle: "Warped housing, lifting screen", image: img("photo-1592899677977-9c10ca588bbd"), href: "/schedule-repair?issue=Tablet%20Bent%20Frame" },
  { id: "audio", title: "Speaker & Mic Repair", subtitle: "Muffled, crackling or no sound", image: img("photo-1546435770-a3e426bf472b"), href: "/schedule-repair?issue=Tablet%20Speaker%20Repair" },
];

const TABS: { key: TabKey; label: string; icon: React.ElementType; items: SelectionItem[] }[] = [
  { key: "brands", label: "Brands", icon: Tablet, items: BRANDS },
  { key: "series", label: "Popular Series", icon: Layers, items: SERIES },
  { key: "repairs", label: "Common Repairs", icon: Hammer, items: REPAIRS },
];

const PLATFORMS = [
  {
    title: "iPad Repair",
    image: img("photo-1544244015-0df4b3ffc6b0", 800),
    body: "We repair every iPad generation, from the standard iPad to iPad Air, mini and Pro. Screens, batteries, ports and logic board faults are handled at our bench with tested parts.",
    href: "/repairs/tablet/ipad-repair",
  },
  {
    title: "Android Tablet Repair",
    image: img("photo-1623126908029-58cb08a2b272", 800),
    body: "Samsung Galaxy Tab, Google Pixel Tablet, Lenovo and more. Cracked screens, weak batteries and charging problems are fixed fast so your tablet is ready for work or play again.",
    href: "/schedule-repair?device=Android%20Tablet",
  },
  {
    title: "Microsoft Surface Repair",
    image: img("photo-1589739900243-4b52cd9b104e", 800),
    body: "Surface Pro and Surface Go repairs, including screen, battery and charging issues. We get your work device running again with minimal downtime.",
    href: "/schedule-repair?device=Microsoft%20Surface",
  },
];

const STORE_POINTS = [
  { icon: Clock, text: "Same-day repair on most screens and batteries" },
  { icon: Wrench, text: "WISE-certified technicians at every bench" },
  { icon: Smartphone, text: "Phones, tablets, computers and game consoles" },
  { icon: MapPin, text: `${STORES.length} locations across West Philly & University City` },
];

export default function TabletRepairClient() {
  const [tab, setTab] = useState<TabKey>("brands");
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <main className="bg-[#FAF8F5] min-h-screen text-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-neutral-600">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="underline underline-offset-2 hover:text-[#111827]">Home</Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li aria-current="page" className="text-[#111827]">Tablet Repair</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-[#111827] min-h-[420px] sm:min-h-[480px] flex items-end sm:items-center">
          <Image
            src={img("photo-1544244015-0df4b3ffc6b0", 1600)}
            alt="Technician repairing a tablet"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-right opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/85 to-[#111827]/10" />

          <div className="relative z-10 w-full max-w-2xl p-6 sm:p-12 text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-3 py-1 text-[13px]">
              <Tablet className="w-3.5 h-3.5" />
              Tablet Repair
            </span>
            <h1 className="mt-5 text-3xl sm:text-5xl font-semibold leading-[1.1]">
              Tablet Repair for iPad, Samsung Galaxy Tab &amp; Surface
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-neutral-300">
              Cracked iPad screen, a Galaxy Tab that won&apos;t charge or a Surface battery that dies by
              noon. SmartFoneDoctor fixes every major tablet brand with tested parts, most repairs
              the same day, and every repair is backed by our 90-day warranty. Stop by any of our
              Philadelphia stores for a free estimate.
            </p>
          </div>
        </section>

        {/* Actions bar under hero */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Link
            href="/schedule-repair?device=Tablet"
            className="inline-flex items-center justify-center rounded-md bg-sfd-teal px-6 py-3 text-sm font-semibold text-white hover:bg-sfd-tealDark transition-colors"
          >
            Book Repair
          </Link>
          <Link
            href="/repair-status"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#D6CDB8] bg-white px-5 py-3 text-sm text-[#374151] hover:border-[#111827] transition-colors"
          >
            Already have a repair with us?
            <span className="font-semibold text-[#111827] underline underline-offset-2">Check status</span>
          </Link>
        </div>

        {/* Selection */}
        <section className="mt-16 sm:mt-24" aria-labelledby="selection-heading">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 id="selection-heading" className="max-w-xl text-3xl sm:text-4xl font-semibold leading-tight">
              Explore our tablet repair selection and book your visit.
            </h2>

            <div role="tablist" aria-label="Browse tablet repairs" className="flex flex-wrap gap-2">
              {TABS.map((t) => {
                const Icon = t.icon;
                const selected = t.key === tab;
                return (
                  <button
                    key={t.key}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls="selection-panel"
                    onClick={() => setTab(t.key)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                      selected
                        ? "border-[#111827] bg-[#111827] text-white"
                        : "border-[#D6CDB8] bg-white text-[#374151] hover:border-[#111827]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id="selection-panel"
            role="tabpanel"
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {active.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-center gap-4 rounded-xl border border-[#E5DEC9] bg-white p-4 hover:border-[#111827] transition-colors"
              >
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-[#F3EDE4]">
                  <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-0.5 text-[13px] text-neutral-600 line-clamp-1">{item.subtitle}</p>
                  <span className="mt-2 inline-flex items-center gap-0.5 text-[13px] font-semibold text-[#111827] group-hover:text-sfd-teal">
                    Learn more <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Platforms */}
        <section className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Tablet platforms we repair">
          {PLATFORMS.map((p) => (
            <article key={p.title} className="flex flex-col rounded-xl bg-[#F3EDE4] p-4">
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#E5DEC9]">
                <Image src={p.image} alt={p.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-neutral-700">{p.body}</p>
              <Link
                href={p.href}
                className="mt-4 inline-flex items-center gap-0.5 text-sm font-semibold text-[#111827] hover:text-sfd-teal"
              >
                Book {p.title.replace(" Repair", "")} repair <ChevronRight className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </section>

        {/* Warranty */}
        <section className="mt-16 sm:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="relative min-h-[260px] overflow-hidden rounded-xl bg-[#E5DEC9]">
            <Image
              src={img("photo-1611532736597-de2d4265fba3", 1000)}
              alt="Technician checking a repaired tablet"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-[#E5DEC9] bg-white p-6 sm:p-10">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#D6CDB8] px-3 py-1 text-[13px] text-[#374151]">
              <ShieldCheck className="w-3.5 h-3.5" />
              90-Day Warranty
            </span>
            <h2 className="mt-4 text-3xl font-semibold">We stand behind every repair</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
              Every tablet repair comes with a 90-day warranty on parts and workmanship. If a part we
              installed fails or the repair doesn&apos;t hold up, bring it back and we&apos;ll fix it at no cost.
            </p>
            <Link
              href="/faq"
              className="mt-6 inline-flex w-fit items-center rounded-md border border-[#111827] px-5 py-2.5 text-sm font-semibold hover:bg-[#111827] hover:text-white transition-colors"
            >
              Learn more about our warranty
            </Link>
          </div>
        </section>

        {/* Find a store */}
        <section className="mt-16 sm:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-2xl bg-[#F3EDE4] p-6 sm:p-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">
              Your tablet fix is closer than you think
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">
              Walk in or book ahead at one of our Philadelphia stores. From cracked screens to charging
              problems, our technicians will get your tablet working again.
            </p>
            <ul className="mt-6 space-y-3">
              {STORE_POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[15px]">
                  <Icon className="w-5 h-5 shrink-0 text-sfd-teal" />
                  {text}
                </li>
              ))}
            </ul>
            <Link
              href="/locations/i/book-repair"
              className="mt-8 inline-flex items-center justify-center rounded-md bg-sfd-teal px-6 py-3 text-sm font-semibold text-white hover:bg-sfd-tealDark transition-colors"
            >
              Find my store
            </Link>
          </div>

          <ul className="space-y-3 self-center">
            {STORES.map((s) => (
              <li key={s.id} className="rounded-xl border border-[#E5DEC9] bg-white p-5">
                <p className="text-[13px] text-neutral-600">{s.type}</p>
                <p className="mt-0.5 font-semibold">{s.address}</p>
                <p className="text-[14px] text-neutral-700">{s.cityStateZip}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                  <span className="text-neutral-600">{s.businessHours}</span>
                  <a
                    href={s.gmbUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline underline-offset-2 hover:text-sfd-teal"
                  >
                    Directions
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
    </main>
  );
}
