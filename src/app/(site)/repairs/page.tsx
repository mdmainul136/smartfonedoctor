import React from "react";
import { brandTitle } from "@/lib/seoTitle";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Smartphone,
  Tablet,
  Laptop,
  Gamepad2,
  Wrench,
  Clock,
  ShieldCheck,
  Star,
  MapPin,
  ChevronRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { PSEO_DEVICES, PSEO_ISSUES, PHILLY_LOCAL_AREAS } from "@/lib/pSeoEngine";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildMultiStoreSchema,
  STORES,
} from "@/lib/schema";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { getTaxonomyAction } from "@/actions/taxonomy";
import { getBlogPostsAction } from "@/actions/blog";
import { getStoreBranchesAction } from "@/actions/settings";
import type { DeviceModelTaxonomy, ServiceIssueTaxonomy } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: brandTitle("Professional Device Repair in Philadelphia | Same-Day Service | SmartFoneDoctor"),
  description:
    "Expert walk-in repair services for iPhones, Samsung Galaxy, iPads, MacBooks, and Game Consoles in Philadelphia. 30-min screen replacements, battery repairs, and 90-day warranty.",
  keywords: [
    "Phone repair Philadelphia",
    "iPhone repair 19139",
    "iPad screen replacement",
    "PS5 HDMI port repair",
    "MacBook repair Philly",
    "Same day device repair",
  ],
};

const CATEGORIES = [
  {
    id: "smartphone",
    name: "Smartphone Repair",
    desc: "iPhone, Samsung Galaxy, Google Pixel & Motorola",
    icon: Smartphone,
    url: "/repairs/smartphone/iphone-16-pro",
    badge: "Most Popular",
    color: "from-teal-600 to-emerald-700",
  },
  {
    id: "tablet",
    name: "Tablet & iPad Repair",
    desc: "iPad Pro, iPad Air, Galaxy Tab & Surface Pro",
    icon: Tablet,
    url: "/repairs/tablet/ipad-pro-12-9",
    badge: "Same-Day Glass",
    color: "from-blue-600 to-indigo-700",
  },
  {
    id: "computer",
    name: "Computer & Mac Repair",
    desc: "MacBook Pro, MacBook Air, iMac, Dell XPS & ThinkPad",
    icon: Laptop,
    url: "/repairs/computer/macbook-pro",
    badge: "Chip-Level",
    color: "from-purple-600 to-indigo-800",
  },
  {
    id: "console",
    name: "Game Console Repair",
    desc: "PS5, PS4 Pro, Xbox Series X & Nintendo Switch",
    icon: Gamepad2,
    url: "/repairs/console/playstation-5",
    badge: "HDMI & Liquid Metal",
    color: "from-amber-600 to-orange-700",
  },
];

export default async function RepairsHubPage() {
  const [modelsRes, issuesRes, blogsRes, branchesRes] = await Promise.all([
    getTaxonomyAction<DeviceModelTaxonomy>("models"),
    getTaxonomyAction<ServiceIssueTaxonomy>("issues"),
    getBlogPostsAction(),
    getStoreBranchesAction(),
  ]);

  const activeStores =
    branchesRes.success && branchesRes.data && branchesRes.data.length > 0
      ? branchesRes.data.map((b, idx) => ({
          id: typeof b.id === "number" ? b.id : idx + 1,
          name: b.name,
          type: b.type || (idx === 0 ? "Flagship HQ" : "Branch"),
          address: b.address,
          cityStateZip: b.cityStateZip || "Philadelphia, PA 19139",
          phone: b.phone,
          email: b.email || "contact@smartfonedoctor.com",
          businessHours: b.businessHours || "Mon - Sat: 10:00 AM - 7:00 PM",
          calendlyUrl: b.calendlyUrl || "https://calendly.com/smartfonedoctor",
          gmbUrl:
            b.gmbUrl ||
            `https://maps.google.com/?q=${encodeURIComponent(
              b.address + ", " + (b.cityStateZip || "Philadelphia, PA")
            )}`,
        }))
      : STORES;

  const popularDevices =
    modelsRes.success && modelsRes.data && modelsRes.data.length > 0
      ? modelsRes.data.slice(0, 8).map((m) => ({
          name: m.name,
          slug: m.url ? m.url.split("/").pop() || m.id : m.id,
          category: m.categorySlug,
          specs: `${m.brandSlug?.toUpperCase() || "OEM"} · Diagnostic Ready`,
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80",
        }))
      : PSEO_DEVICES.slice(0, 8);

  const coreIssues =
    issuesRes.success && issuesRes.data && issuesRes.data.length > 0
      ? issuesRes.data.slice(0, 6).map((iss) => ({
          slug: iss.slug,
          name: iss.title,
          category: iss.categorySlug,
          turnaroundDisplay: iss.turnaround || "20–30 min",
          basePrice: iss.startingPrice || 69,
          symptoms: [iss.badge || "Precision hardware replacement with 90-day warranty."],
        }))
      : PSEO_ISSUES.slice(0, 6);

  const recentGuides =
    blogsRes.success && blogsRes.articles && blogsRes.articles.length > 0
      ? blogsRes.articles.slice(0, 2)
      : null;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Repair Directory", url: "/repairs" },
  ]);
  const storeSchema = buildMultiStoreSchema(activeStores);

  return (
    <main className="bg-[#fafbfc] min-h-screen pb-20">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={storeSchema} />

      <CMSSectionRenderer slug="repairs">
        {/* 1. HERO HEADER */}
        <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sfd-teal/10 text-sfd-teal border border-sfd-teal/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Philadelphia&apos;s Top-Rated Repair Bench
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1d1c1a] tracking-tight max-w-3xl mx-auto">
            Professional Device Repair Services in Philadelphia
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Fast, certified same-day hardware repairs with 90-day parts &amp; labor guarantee. Walk into 33 S 52nd St or book online for immediate bench priority.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-gray-700">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sfd-teal" /> Most Repairs in 20–30 Mins
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sfd-teal" /> 90-Day Comprehensive Warranty
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.9/5 Rating (400+ Reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">

        {/* 2. DEVICE CATEGORY CARDS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Select Your Device Category
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Choose your hardware category below to browse specific models and service pricing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={cat.url}
                  className="group relative p-6 rounded-2xl bg-white border border-gray-200 hover:border-sfd-teal hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-800 group-hover:bg-sfd-teal group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold bg-sfd-teal/10 text-sfd-teal px-2.5 py-1 rounded-full border border-sfd-teal/20">
                        {cat.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 group-hover:text-sfd-teal transition-colors mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-sfd-teal">
                    <span>Browse Models &amp; Pricing</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 3. POPULAR FLAGSHIP DEVICE MODELS */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Popular Device Repairs
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Direct access to same-day repair pricing for Philadelphia&apos;s most repaired models.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {popularDevices.map((dev) => (
              <Link
                key={dev.slug}
                href={`/repairs/${dev.category}/${dev.slug}`}
                className="group p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-sfd-teal hover:shadow-md transition-all text-center flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-gray-50">
                  <Image
                    src={dev.image}
                    alt={dev.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 group-hover:text-sfd-teal transition-colors block line-clamp-1">
                    {dev.name}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">{dev.specs.split("·")[0]}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] font-bold text-sfd-teal flex items-center justify-center gap-1">
                  <span>View Services</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. COMMON HARDWARE ISSUES MATRIX */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Common Hardware Problems We Fix Every Day
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Click any issue below to view diagnostic symptoms, turnaround times, and pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreIssues.map((iss) => (
              <Link
                key={iss.slug}
                href={`/repairs/${iss.category}/iphone-16-pro/${iss.slug}`}
                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-sfd-teal hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sfd-teal">
                      {iss.turnaroundDisplay}
                    </span>
                    <span className="text-xs font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">
                      From ${iss.basePrice}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-sfd-teal transition-colors mb-1.5">
                    {iss.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {iss.symptoms[0]}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-bold text-gray-800 flex items-center justify-between">
                  <span>See Symptoms &amp; Pricing</span>
                  <ChevronRight className="w-4 h-4 text-sfd-teal group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. DIAGNOSTIC BLOG GUIDES & ARTICLES */}
        <section className="rounded-3xl bg-gradient-to-br from-gray-900 to-[#1d1c1a] text-white p-8 sm:p-12 space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-200 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Bench Technician Knowledge Base
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              Device Troubleshooting Guides &amp; Repair Tips
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Read our in-depth guides written by certified Philadelphia bench technicians on battery maintenance, water damage first aid, and logic board diagnostics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {recentGuides ? (
              recentGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/blog/${guide.slug}`}
                  className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-teal-200 uppercase tracking-wider block mb-1">
                      {guide.categoryName || "Repair Guide"}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-teal-200 transition-colors leading-snug">
                      {guide.title}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {guide.readTime || "4 min read"} →
                  </span>
                </Link>
              ))
            ) : (
              <>
                <Link
                  href="/blog/iphone-battery-health-guide"
                  className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-teal-200 uppercase tracking-wider block mb-1">
                      iPhone Repair Guide
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-teal-200 transition-colors leading-snug">
                      When to Replace Your iPhone Battery: Signs, Cycles &amp; Peak Performance
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 4 min read →
                  </span>
                </Link>

                <Link
                  href="/blog/what-to-do-water-damaged-phone"
                  className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-teal-200 uppercase tracking-wider block mb-1">
                      Emergency First Aid
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-teal-200 transition-colors leading-snug">
                      Dropped Phone in Water? 4 Critical Steps Before Bringing It to the Shop
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 5 min read →
                  </span>
                </Link>
              </>
            )}
          </div>

          <div className="pt-2">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-200 hover:underline"
            >
              <span>Explore all technician repair guides &amp; articles</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 6. NEIGHBORHOODS LOCAL SEO */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sfd-teal" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Serving the Greater Philadelphia Metro Area
            </h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            SmartFoneDoctor provides same-day repair walk-ins and express courier service to customers in{" "}
            {PHILLY_LOCAL_AREAS.join(", ")} and surrounding counties. Walk in at 33 S 52nd St or book online for guaranteed turnaround.
          </p>
        </section>

      </div>
      </CMSSectionRenderer>
    </main>
  );
}
