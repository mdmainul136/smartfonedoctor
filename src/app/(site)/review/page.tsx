import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Star,
  MapPin,
  Phone,
  ShieldCheck,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import { STORES } from "@/lib/stores";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildMultiStoreSchema,
} from "@/lib/schema";

export const metadata: Metadata = {
  title: "Customer Reviews & Store Ratings | SmartFoneDoctor Philadelphia",
  description:
    "Read 420+ verified 5-star customer reviews across our 3 Philadelphia repair centers (52nd St Flagship, 4016 Lancaster Ave, and 4060 Lancaster Express). Rate your technician or book a repair.",
};

const STORE_SLUG_MAP: Record<number, string> = {
  1: "phl-01",
  2: "phl-02",
  3: "phl-03",
};

const STORE_HIGHLIGHTS: Record<
  number,
  {
    rating: string;
    reviewsCount: number;
    badge: string;
    description: string;
    topRepairs: string[];
  }
> = {
  1: {
    rating: "4.9",
    reviewsCount: 260,
    badge: "West Philadelphia Flagship HQ",
    description:
      "Right off the Market-Frankford 52nd St Station. Full micro-soldering lab, laser back glass station, and high-volume same-day bench.",
    topRepairs: [
      "iPhone 16 / 15 Screen Repair",
      "PS5 HDMI 2.1 Micro-Soldering",
      "Samsung AMOLED Replacement",
    ],
  },
  2: {
    rating: "4.9",
    reviewsCount: 95,
    badge: "University City Tech Hub",
    description:
      "Serving Penn and Drexel students, healthcare professionals, and West Philly residents with express 20-minute screen & battery fixes.",
    topRepairs: [
      "MacBook Pro Logic Board Diagnostics",
      "iPad Liquid Retina Screen",
      "iPhone Battery Health Calibration",
    ],
  },
  3: {
    rating: "4.8",
    reviewsCount: 65,
    badge: "Lancaster Express Branch",
    description:
      "Express intake bench specializing in rapid walk-in charging dock replacements, water damage ultrasonic recovery, and accessories.",
    topRepairs: [
      "USB-C Charging Dock Replacement",
      "Water Damage Decontamination",
      "Nintendo Switch & Console Care",
    ],
  },
};

const FEATURED_REVIEWS = [
  {
    author: "Marcus T.",
    store: "Flagship HQ (33 S 52nd St)",
    date: "November 2026",
    device: "PlayStation 5",
    rating: 5,
    text: "My PS5 had the dreaded HDMI no signal issue after being knocked over. Dropped it off at 52nd St, and the tech micro-soldered a reinforced port same day. Tested 4K 120Hz on their bench before I left. Incredible service!",
  },
  {
    author: "Elena R.",
    store: "University City (4016 Lancaster)",
    date: "November 2026",
    device: "iPhone 15 Pro",
    rating: 5,
    text: "Cracked my iPhone screen right before class at Penn. They had a genuine grade OLED screen replaced in 25 minutes flat, and TrueTone / FaceID still work 100%. Super professional and fair price.",
  },
  {
    author: "Darnell K.",
    store: "Lancaster Express (4060 Lancaster)",
    date: "October 2026",
    device: "Samsung Galaxy S24 Ultra",
    rating: 5,
    text: "Phone wouldn't charge at all and showed moisture detected. Technician cleaned the port under microscope and replaced the flex cable within 40 minutes. 90-day warranty gives huge peace of mind.",
  },
];

export default function ReviewHubPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Customer Reviews", url: "/review" },
  ]);

  const multiStoreSchema = buildMultiStoreSchema(STORES);

  return (
    <main className="bg-[#fcfcfc] min-h-screen text-[#1d1c1a]">
      {/* ── JSON-LD Structured Data ── */}
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={multiStoreSchema} />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {/* 1. Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 text-[12px] text-neutral-500 font-normal"
        >
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-sfd-teal transition-colors">
                Home
              </Link>
            </li>
            <li>&gt;</li>
            <li className="text-neutral-700 font-medium" aria-current="page">
              Customer Reviews &amp; Branch Ratings
            </li>
          </ol>
        </nav>

        {/* 2. Hero Header Banner */}
        <div className="relative w-full rounded-[24px] overflow-hidden bg-neutral-900 min-h-[320px] sm:min-h-[380px] flex items-center mb-12 shadow-sm text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/90 to-neutral-800/60 z-0" />

          <div className="relative z-10 max-w-2xl p-6 sm:p-10 lg:p-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sfd-teal/20 border border-sfd-teal/40 text-[#4dd0e1] text-xs font-semibold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Verified Customer Satisfaction</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Philadelphia&apos;s Top-Rated{" "}
              <span className="text-sfd-teal">Hardware Repair</span> Benches
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
              Over 420+ verified 5-star reviews across our 3 Philadelphia store
              locations. Select your branch below to share your experience, leave
              a Google review, or book your next bench service.
            </p>

            {/* Overall Rating Pill Box */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="font-bold text-sm text-white">4.9 / 5.0</span>
                <span className="text-xs text-neutral-300">
                  (420+ Local Reviews)
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>WISE Certified Technicians • 90-Day Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Three Store Branch Selection Cards */}
        <section className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d1c1a]">
              Choose Your Store Location
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2">
              Tap a store branch below to launch the verified customer review
              portal or read local neighborhood feedback:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STORES.map((store) => {
              const slug = STORE_SLUG_MAP[store.id] || `phl-0${store.id}`;
              const highlight = STORE_HIGHLIGHTS[store.id];

              return (
                <div
                  key={store.id}
                  className="bg-white border border-neutral-200/90 rounded-[20px] p-6 shadow-xs flex flex-col justify-between hover:border-sfd-teal hover:shadow-md transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    {/* Badge & Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sfd-teal/10 text-sfd-teal border border-sfd-teal/20">
                        {highlight.badge}
                      </span>
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-neutral-900">
                          {highlight.rating}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          ({highlight.reviewsCount})
                        </span>
                      </div>
                    </div>

                    {/* Store Title */}
                    <div>
                      <h3 className="text-lg font-bold text-[#1d1c1a] group-hover:text-sfd-teal transition-colors">
                        {store.name}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                        {highlight.description}
                      </p>
                    </div>

                    {/* Address & Phone */}
                    <div className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                        <span>
                          {store.address}, {store.cityStateZip}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                        <a
                          href={`tel:${store.phone.replace(/[^0-9+]/g, "")}`}
                          className="hover:text-sfd-teal font-medium"
                        >
                          {store.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span>{store.businessHours}</span>
                      </div>
                    </div>

                    {/* Popular Services at this Store */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                        Frequently Reviewed Repairs
                      </span>
                      <ul className="space-y-1 text-xs text-neutral-700">
                        {highlight.topRepairs.map((rep) => (
                          <li key={rep} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sfd-teal shrink-0" />
                            <span>{rep}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 mt-6 border-t border-neutral-100 space-y-2">
                    <Link
                      href={`/review/${slug}`}
                      className="w-full py-3 px-4 rounded-xl bg-sfd-teal hover:bg-sfd-dark text-white font-bold text-xs uppercase tracking-wider text-center transition-colors shadow-xs flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Review This Store (QR Portal)</span>
                    </Link>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={store.gmbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium text-[11px] text-center transition flex items-center justify-center gap-1"
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="w-3 h-3 text-neutral-500" />
                      </a>
                      <Link
                        href={`/schedule-repair?store=${store.id}`}
                        className="py-2 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium text-[11px] text-center transition flex items-center justify-center gap-1"
                      >
                        <span>Book Bench</span>
                        <Calendar className="w-3 h-3 text-neutral-500" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Customer Testimonials Grid */}
        <section className="mb-16 bg-white rounded-[24px] border border-neutral-200/90 p-8 sm:p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sfd-teal block mb-1">
                Real Customer Feedback
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1c1a] tracking-tight">
                Recent Verified Bench Reviews
              </h2>
            </div>
            <Link
              href="/schedule-repair"
              className="text-xs font-bold text-sfd-teal hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Book Your Own Repair</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_REVIEWS.map((rev, i) => (
              <div
                key={i}
                className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[...Array(rev.rating)].map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {rev.date}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed italic">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900 block">
                      {rev.author}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {rev.store}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold bg-white border border-neutral-200 px-2 py-0.5 rounded text-neutral-600">
                    {rev.device}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Conversion Banner */}
        <section className="rounded-[24px] bg-[#1d1c1a] text-white p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4dd0e1]">
              <Sparkles className="w-4 h-4" />
              <span>Free Diagnostic Inspection • Zero Risk</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Ready to Experience 5-Star Hardware Service?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              Walk in to any of our 3 Philadelphia locations today or schedule
              online to reserve replacement parts and priority bench time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/schedule-repair"
              className="w-full sm:w-auto text-center px-6 py-3.5 rounded-full bg-[#c8102e] hover:bg-[#a00c24] text-white font-bold text-xs uppercase tracking-wider transition shadow-sm active:scale-95"
            >
              Book Repair Online
            </Link>
            <Link
              href="/locations/i/book-repair"
              className="w-full sm:w-auto text-center px-6 py-3.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition border border-neutral-700"
            >
              View All Locations
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
