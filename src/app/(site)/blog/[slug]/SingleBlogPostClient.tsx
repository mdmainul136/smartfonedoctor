"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Share2,
  Check,
  MapPin,
  Star,
  Phone,
  ExternalLink,
  BookOpen,
  List,
  X,
  ChevronDown,
  Award,
} from "lucide-react";
import type { BlogArticle } from "@/lib/blogData";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface Props {
  article: BlogArticle;
  allArticles: BlogArticle[];
}

function extractTOC(html: string): TOCItem[] {
  if (typeof window === "undefined") return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  const headings = div.querySelectorAll("h2, h3");
  const items: TOCItem[] = [];
  headings.forEach((h, i) => {
    const id = h.id || `toc-heading-${i}`;
    h.id = id;
    items.push({
      id,
      text: h.textContent || "",
      level: h.tagName === "H2" ? 2 : 3,
    });
  });
  return items;
}

function injectHeadingIds(html: string): string {
  let idx = 0;
  return html.replace(/<(h[23])([^>]*)>/gi, (match, tag, attrs) => {
    if (/id=/.test(attrs)) return match;
    return `<${tag}${attrs} id="toc-heading-${idx++}">`;
  });
}

const PHILLY_NEIGHBORHOODS = [
  "Center City",
  "University City",
  "West Philadelphia",
  "Fishtown",
  "South Philly",
  "Kensington",
  "Germantown",
  "Chestnut Hill",
  "Manayunk",
  "Northern Liberties",
];

const CATEGORY_SERVICE_LINKS: Record<
  string,
  { label: string; url: string; badge?: string }[]
> = {
  "cat-iphone": [
    { label: "iPhone 16 Pro Screen Repair", url: "/repairs/smartphone/iphone-16-pro/screen-repair", badge: "20–30 min" },
    { label: "iPhone Battery Replacement", url: "/repairs/smartphone/iphone-16-pro/battery-replacement", badge: "From $69" },
    { label: "iPhone Back Glass Laser Fix", url: "/repairs/smartphone/iphone-16-pro/back-glass-repair", badge: "Laser Spec" },
    { label: "iPhone Charging Port Fix", url: "/repairs/smartphone/iphone-16-pro/charging-port-repair", badge: "Micro-Solder" },
  ],
  "cat-android": [
    { label: "Galaxy S25 AMOLED Screen Repair", url: "/repairs/smartphone/galaxy-s25/screen-repair", badge: "AMOLED 120Hz" },
    { label: "Galaxy Battery Replacement", url: "/repairs/smartphone/galaxy-s25/battery-replacement", badge: "OEM Grade" },
    { label: "Water Damage Recovery", url: "/repairs/smartphone/galaxy-s25/water-damage-repair", badge: "Ultrasonic" },
  ],
  "cat-consoles": [
    { label: "PS5 HDMI Port Replacement", url: "/repairs/console/playstation-5/hdmi-port-replacement", badge: "4K 120Hz" },
    { label: "PlayStation 5 Bench Service", url: "/repairs/console/playstation-5", badge: "Liquid Metal" },
    { label: "Nintendo Switch OLED Fix", url: "/repairs/console/nintendo-switch-oled", badge: "Joy-Con" },
  ],
  "cat-emergency": [
    { label: "Water Damage Ultrasonic Bath", url: "/repairs/smartphone/iphone-16-pro/water-damage-repair", badge: "Urgent" },
    { label: "Express Screen Replacement", url: "/repairs/smartphone/iphone-16-pro/screen-repair", badge: "30 Min" },
    { label: "Emergency Bench Diagnostics", url: "/schedule-repair", badge: "Free" },
  ],
};

export default function SingleBlogPostClient({ article, allArticles }: Props) {
  const [copied, setCopied] = useState(false);
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [processedHtml, setProcessedHtml] = useState<string>("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (article.contentHtml) {
      const injected = injectHeadingIds(article.contentHtml);
      setProcessedHtml(injected);
      const items = extractTOC(injected);
      setTocItems(items);
    } else if (article.sections && article.sections.length > 0) {
      const items = article.sections.map((sec, i) => ({
        id: `toc-heading-${i}`,
        text: sec.heading,
        level: 2,
      }));
      setTocItems(items);
    }
  }, [article]);

  useEffect(() => {
    if (!tocItems.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-20% 0% -70% 0%", threshold: 0 }
    );
    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tocItems, processedHtml]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id && a.categoryId === article.categoryId)
    .slice(0, 3);

  const serviceLinks =
    CATEGORY_SERVICE_LINKS[article.categoryId] ||
    CATEGORY_SERVICE_LINKS["cat-iphone"];

  // Technical guide specifications table
  const guideSpecifications = [
    { label: "Hardware Topic", value: article.title },
    { label: "Category", value: article.categoryName },
    { label: "Diagnostic Assessment", value: "$0.00 (100% Free at our Philadelphia Bench)" },
    { label: "Average Repair Time", value: article.readTime.includes("min") ? "20 – 45 Minutes (Same-Day Express)" : "Same-Day Service" },
    { label: "Component Grade", value: "OEM Original & Premium Grade-A+ Certified Parts" },
    { label: "Warranty Guarantee", value: "90-Day Comprehensive Parts & Labor Warranty" },
    { label: "Data Safety Policy", value: "Zero Data Wipe Guarantee (Photos, apps & credentials kept safe)" },
    { label: "Bench Technicians", value: "WISE Level 2 & IPC-A-610 Master Certified Techs" },
    { label: "Philadelphia Flagship", value: "33 S 52nd St, Philadelphia, PA 19139 (West Philly)" },
    { label: "Walk-in Policy", value: "Walk-ins Welcome Daily – No Appointment Required" },
  ];

  // Tailored Guide FAQs
  const guideFaqs = [
    {
      question: `How quickly can SmartFoneDoctor resolve this issue in Philadelphia?`,
      answer: `Most repairs related to ${article.title.toLowerCase()} are completed within 20 to 45 minutes on our repair bench at 33 S 52nd St. We keep all popular replacement displays, high-cycle batteries, and charging ports in stock for same-day walk-in service.`,
    },
    {
      question: "Do I need to book an appointment or can I just walk in?",
      answer: "No appointment is needed! Walk-ins are welcome daily at our West Philadelphia flagship (33 S 52nd St) and our Lancaster Ave stores. Booking online reserves replacement parts and secures priority bench time.",
    },
    {
      question: "Will my photos, messages, or apps be erased during the repair?",
      answer: "No. Our technicians work directly on hardware modules without factory-resetting or erasing storage. Your personal data remains 100% untouched and confidential.",
    },
    {
      question: "What warranty do you offer on repairs?",
      answer: "Every completed repair includes our comprehensive 90-day parts and labor warranty against manufacturer defects and touchscreen or component unresponsiveness.",
    },
    {
      question: "Where are your Philadelphia stores located?",
      answer: "Our flagship repair shop is at 33 S 52nd St, Philadelphia, PA 19139 (right by the 52nd St Market-Frankford Line station). We also serve customers at 4016 Lancaster Ave and 4060 Lancaster Ave in University City.",
    },
  ];

  return (
    <article className="min-h-screen bg-[#fafbfc] pb-20">
      
      {/* ── 1. ARTICLE HEADER ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto space-y-5">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-black">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link href="/blog" className="hover:text-black">Blog & Guides</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-sfd-teal font-medium truncate">{article.categoryName}</span>
          </nav>

          {/* Category Tag */}
          <span className="bg-sfd-teal/10 text-sfd-teal border border-sfd-teal/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
            {article.categoryName}
          </span>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1d1c1a] tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            {article.excerpt}
          </p>

          {/* Meta Bar */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#1d1c1a] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {article.author.avatar || article.author.name.slice(0, 2)}
              </span>
              <div>
                <span className="text-sm font-bold text-gray-900 block leading-tight">{article.author.name}</span>
                <span className="text-xs text-gray-500 block">{article.author.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {article.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sfd-teal" />
                {article.readTime}
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={handleShare}
                className="h-[30px] px-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5 text-sfd-teal" /><span className="text-sfd-teal">Copied!</span></>
                ) : (
                  <><Share2 className="w-3.5 h-3.5" /><span>Share</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. FEATURED IMAGE ───────────────────────────────────────────── */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 mt-8">
        <div className="rounded-2xl overflow-hidden shadow-md aspect-video bg-gray-100 border border-gray-200">
          <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* ── 3. TWO-COLUMN LAYOUT: Article + Sticky Sidebar ──────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-10 lg:flex lg:gap-10 lg:items-start">

        {/* ── ARTICLE BODY (left / main) ─────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-10">

          {/* A. Technical Specification Table (E-Commerce Style pSEO) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sfd-teal" />
                  <span>Technical Diagnostics &amp; Repair Specification</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Laboratory benchmark guidelines for this hardware repair
                </p>
              </div>
              <span className="text-[11px] font-bold text-sfd-teal uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-gray-200">
                Verified Lab Spec
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {guideSpecifications.map((spec, idx) => (
                    <tr
                      key={spec.label}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                    >
                      <th
                        scope="row"
                        className="py-3 px-6 text-xs font-bold text-gray-700 w-1/3 sm:w-1/4 border-b border-gray-100"
                      >
                        {spec.label}
                      </th>
                      <td className="py-3 px-6 text-xs sm:text-sm text-gray-900 border-b border-gray-100 font-medium">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Related Repair Services — Juicy Internal Linking Widget */}
          <section className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/60 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-sfd-teal" />
              <span className="text-xs font-bold uppercase tracking-widest text-sfd-teal">
                Related Repair Services
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Philadelphia&apos;s trusted same-day repair shop — serving {PHILLY_NEIGHBORHOODS.slice(0, 4).join(", ")} & more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {serviceLinks.map((link) => (
                <Link
                  key={link.url + link.label}
                  href={link.url}
                  className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-teal-200 hover:border-sfd-teal hover:shadow-md transition-all group text-sm font-semibold text-gray-900"
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-sfd-teal group-hover:translate-x-0.5 transition-transform" />
                    {link.label}
                  </span>
                  {link.badge && (
                    <span className="text-[10px] font-bold bg-sfd-teal/10 text-sfd-teal px-2 py-0.5 rounded-full border border-sfd-teal/20">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Link
                href="/repairs"
                className="text-xs text-sfd-teal font-bold hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> View all repair services
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/schedule-repair" className="text-xs text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                <Phone className="w-3 h-3" /> Book online
              </Link>
            </div>
          </section>

          {/* Main Rich HTML Content */}
          <div
            ref={contentRef}
            className="sfd-article-prose space-y-4 text-base text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={processedHtml ? { __html: processedHtml } : undefined}
          >
            {!processedHtml &&
              article.sections.map((sec, idx) => (
                <section key={sec.id || idx} id={`toc-heading-${idx}`} className="space-y-4 scroll-mt-24">
                  {sec.heading && (
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1d1c1a] tracking-tight">
                      {sec.heading}
                    </h2>
                  )}
                  <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">{sec.body}</p>
                  {sec.calloutType && sec.calloutText && (
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        sec.calloutType === "warning"
                          ? "bg-red-50 border-red-200 text-red-900"
                          : sec.calloutType === "tip"
                          ? "bg-teal-50 border-teal-200 text-teal-950"
                          : "bg-blue-50 border-blue-200 text-blue-950"
                      }`}
                    >
                      <div className="text-sm leading-relaxed">
                        <span className="font-bold uppercase tracking-wider text-[11px] block mb-0.5 opacity-80">
                          Technician {sec.calloutType}
                        </span>
                        {sec.calloutText}
                      </div>
                    </div>
                  )}
                </section>
              ))}
          </div>

          {/* Connected Service CTA Banner */}
          {article.connectedService && (
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#1d1c1a] to-[#2e2a25] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold text-teal-200 tracking-wider block">
                  Professional Philadelphia Service
                </span>
                <h3 className="text-xl sm:text-2xl font-bold">{article.connectedService.title}</h3>
                <p className="text-sm text-neutral-300">
                  Certified technician bench service · 90-day warranty · Same-day turnaround
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0 space-y-2">
                <span className="text-2xl font-black text-teal-200 block">
                  {article.connectedService.price}
                </span>
                <Link
                  href={article.connectedService.bookingUrl}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-sfd-teal hover:bg-sfd-tealDark text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  Book This Repair <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          )}

          {/* Why Choose SmartFoneDoctor in Philadelphia */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-widest text-sfd-teal block mb-1">
              Philadelphia&apos;s Independent Repair Authority
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight mb-3">
              Why Choose SmartFoneDoctor in Philadelphia?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
              Located in West Philadelphia at 33 S 52nd St, SmartFoneDoctor has been the premier 
              hardware repair bench for University City students, local hospital staff, and neighborhood families. 
              All diagnostics and repairs are performed in-house on our ESD-safe benches with genuine OEM-spec components.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                <div className="text-xl font-black text-gray-900">5,000+</div>
                <div className="text-[11px] text-gray-500 font-medium mt-0.5">Local Repairs</div>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                <div className="text-xl font-black text-gray-900">4.9 ★</div>
                <div className="text-[11px] text-gray-500 font-medium mt-0.5">Google Rating</div>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                <div className="text-xl font-black text-gray-900">3 Stores</div>
                <div className="text-[11px] text-gray-500 font-medium mt-0.5">Walk-In Locations</div>
              </div>
            </div>
          </div>

          {/* Interactive FAQs Accordion */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-sfd-teal block mb-1">
                  Got Questions?
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Frequently Asked Questions
                </h3>
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                {guideFaqs.length} Answers
              </span>
            </div>

            <div className="space-y-3 mt-6">
              {guideFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm text-gray-900 bg-gray-50/60 hover:bg-gray-100/70 transition-colors cursor-pointer"
                    >
                      <span className="pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 sm:p-5 text-xs sm:text-sm text-gray-700 leading-relaxed bg-white border-t border-gray-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="pt-6 border-t border-gray-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 mr-2">Tags:</span>
              {article.tags.map((tag) => (
                <span key={tag} className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Neighborhood Geo Tags — local SEO */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3.5 h-3.5 text-sfd-teal" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Serving Philadelphia Neighborhoods</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              SmartFoneDoctor provides same-day device repair to customers from{" "}
              {PHILLY_NEIGHBORHOODS.join(", ")} and surrounding areas.{" "}
              <Link href="/locations" className="text-sfd-teal font-semibold hover:underline">
                Find our locations →
              </Link>
            </p>
          </div>

          {/* Author Bio */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-xs flex items-start gap-4">
            <span className="w-12 h-12 rounded-full bg-sfd-teal text-white text-base font-bold flex items-center justify-center shrink-0">
              {article.author.avatar || article.author.name.slice(0, 2)}
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">Written by {article.author.name}</span>
                <ShieldCheck className="w-4 h-4 text-sfd-teal" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {article.author.role} at SmartFoneDoctor Philadelphia. Specializing in component-level PCB
                micro-soldering, OLED display assemblies, and lithium battery calibration.
              </p>
              <div className="flex items-center gap-1 pt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs text-gray-500 ml-1">Verified Tech Expert</span>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="pt-6 border-t border-gray-200 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sfd-teal" />
                <h2 className="text-base font-bold text-gray-900">Related Guides</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/blog/${rel.slug}`}
                    className="group rounded-xl overflow-hidden border border-gray-200 hover:border-sfd-teal/40 hover:shadow-md transition-all bg-white"
                  >
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={rel.featuredImage}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <span className="text-[10px] font-bold text-sfd-teal uppercase tracking-wider">
                        {rel.categoryName}
                      </span>
                      <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2">
                        {rel.title}
                      </p>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {rel.readTime}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to Blog */}
          <div className="pt-6 text-center">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-sfd-teal hover:underline">
              ← Back to All Guides &amp; Insights
            </Link>
          </div>

        </div>

        {/* ── SIDEBAR (right / sticky) ───────────────────────────── */}
        <aside className="hidden lg:block w-72 shrink-0 space-y-6 sticky top-24">
          
          {/* Table of Contents */}
          {tocItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                <List className="w-3.5 h-3.5" /> On this page
              </p>
              <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`block text-xs leading-snug transition-all py-1 border-l-2 pl-3 ${
                      item.level === 3 ? "ml-3" : ""
                    } ${
                      activeId === item.id
                        ? "border-sfd-teal text-sfd-teal font-semibold"
                        : "border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400"
                    }`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Express Drop-Off Box */}
          <div className="bg-[#1d1c1a] text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>WISE Certified Lab</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-white leading-snug">
                Need Help With This Repair?
              </h4>
              <p className="text-xs text-neutral-300 mt-1">
                Walk into our Philadelphia repair lab or schedule online for priority intake.
              </p>
            </div>
            <div className="space-y-1.5 text-xs text-neutral-400 pt-1">
              <div className="flex justify-between">
                <span>Diagnostics:</span>
                <span className="font-bold text-emerald-400">100% Free</span>
              </div>
              <div className="flex justify-between">
                <span>Turnaround:</span>
                <span className="font-bold text-white">20–45 Mins</span>
              </div>
              <div className="flex justify-between">
                <span>Warranty:</span>
                <span className="font-bold text-white">90 Days</span>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Link
                href="/schedule-repair"
                className="block w-full text-center py-2.5 rounded-xl bg-sfd-teal hover:bg-sfd-tealDark text-white text-xs font-bold uppercase tracking-wider transition shadow-xs"
              >
                Schedule Appointment
              </Link>
              <a
                href="tel:+12155982090"
                className="block w-full text-center py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition"
              >
                Call (215) 598-2090
              </a>
            </div>
          </div>

        </aside>

      </div>
    </article>
  );
}
