"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Calendar,
  ArrowLeft,
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
} from "lucide-react";
import { BlogArticle, getStoredBlogArticles } from "@/lib/blogData";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// ─── Utility: parse TOC from HTML string ────────────────────────────────────
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

// ─── Utility: inject IDs into rendered HTML headings ────────────────────────
function injectHeadingIds(html: string): string {
  let idx = 0;
  return html.replace(/<(h[23])([^>]*)>/gi, (match, tag, attrs) => {
    if (/id=/.test(attrs)) return match;
    return `<${tag}${attrs} id="toc-heading-${idx++}">`;
  });
}

// ─── Neighborhood geo tags (boosts local SEO) ────────────────────────────────
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

// ─── Related services per blog category ─────────────────────────────────────
const CATEGORY_SERVICE_LINKS: Record<
  string,
  { label: string; url: string; badge?: string }[]
> = {
  "cat-iphone": [
    { label: "iPhone 16 Pro Screen Repair", url: "/repairs/smartphone/iphone-16-pro/screen-repair", badge: "20–30 min" },
    {
      label: "iPhone Battery Replacement",
      url: "/repairs/smartphone/iphone-16-pro/battery-replacement",
      badge: "From $69",
    },
    { label: "iPhone Back Glass Laser Fix", url: "/repairs/smartphone/iphone-16-pro/back-glass-repair", badge: "Laser Spec" },
    { label: "iPhone Charging Port Fix", url: "/repairs/smartphone/iphone-16-pro/charging-port-repair", badge: "Micro-Solder" },
  ],
  "cat-android": [
    {
      label: "Galaxy S25 AMOLED Screen Repair",
      url: "/repairs/smartphone/galaxy-s25/screen-repair",
      badge: "AMOLED 120Hz",
    },
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

// ─── Sticky TOC sidebar component ───────────────────────────────────────────
function TableOfContents({
  items,
  activeId,
}: {
  items: TOCItem[];
  activeId: string;
}) {
  if (!items.length) return null;
  return (
    <nav className="space-y-1">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
        <List className="w-3.5 h-3.5" /> On this page
      </p>
      {items.map((item) => (
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
              ? "border-[#00897b] text-[#00897b] font-semibold"
              : "border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400"
          }`}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}

// ─── Mobile TOC drawer ───────────────────────────────────────────────────────
function MobileTOC({
  items,
  activeId,
}: {
  items: TOCItem[];
  activeId: string;
}) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 bg-[#00897b] text-white rounded-full px-4 py-2.5 text-xs font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
      >
        <List className="w-4 h-4" /> Contents
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end">
          <div className="bg-white w-full rounded-t-2xl px-5 py-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-sm text-gray-900">Table of Contents</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <nav className="space-y-1">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    setTimeout(() => {
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 200);
                  }}
                  className={`block text-sm py-2 border-l-2 pl-3 ${
                    item.level === 3 ? "ml-3 text-xs" : ""
                  } ${
                    activeId === item.id
                      ? "border-[#00897b] text-[#00897b] font-semibold"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SingleBlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = use(params);
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [copied, setCopied] = useState(false);
  const [allArticles, setAllArticles] = useState<BlogArticle[]>([]);
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [processedHtml, setProcessedHtml] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = getStoredBlogArticles();
    setAllArticles(list);
    const found = list.find((a) => a.slug === resolvedParams.slug);
    if (found) {
      setArticle(found);
      if (found.contentHtml) {
        const injected = injectHeadingIds(found.contentHtml);
        setProcessedHtml(injected);
        const items = extractTOC(injected);
        setTocItems(items);
      } else {
        // Build TOC from sections
        const items = found.sections.map((sec, i) => ({
          id: `toc-heading-${i}`,
          text: sec.heading,
          level: 2,
        }));
        setTocItems(items);
      }
    }
  }, [resolvedParams.slug]);

  // ── Intersection Observer for active TOC heading ─────────────────────────
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

  if (!article && allArticles.length > 0) return notFound();
  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Loading guide...
      </div>
    );
  }

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

  // ── JSON-LD Structured Data ───────────────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://smartfonedoctor.com" },
      { "@type": "ListItem", position: 2, name: "Guides & Blog", item: "https://smartfonedoctor.com/blog" },
      { "@type": "ListItem", position: 3, name: article.categoryName, item: `https://smartfonedoctor.com/blog?cat=${article.categoryId}` },
      { "@type": "ListItem", position: 4, name: article.title, item: `https://smartfonedoctor.com/blog/${article.slug}` },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.seo.metaTitle || article.title,
    description: article.seo.metaDescription || article.excerpt,
    image: article.featuredImage,
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author.name,
      jobTitle: article.author.role,
    },
    publisher: {
      "@type": "LocalBusiness",
      name: "SmartFoneDoctor Philadelphia",
      logo: { "@type": "ImageObject", url: "https://smartfonedoctor.com/logo-png.jpg" },
      address: {
        "@type": "PostalAddress",
        streetAddress: "33 S 52nd St",
        addressLocality: "Philadelphia",
        addressRegion: "PA",
        postalCode: "19139",
        addressCountry: "US",
      },
      telephone: "+12153344567",
    },
    keywords: article.tags.join(", "),
    articleSection: article.categoryName,
    ...(article.seo.canonicalUrl ? { url: `https://smartfonedoctor.com${article.seo.canonicalUrl}` } : {}),
  };

  const faqSchema = article.sections.some((s) => s.calloutText)
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.sections
          .filter((s) => s.calloutText && s.heading)
          .slice(0, 5)
          .map((s) => ({
            "@type": "Question",
            name: s.heading,
            acceptedAnswer: {
              "@type": "Answer",
              text: s.calloutText || s.body.slice(0, 300),
            },
          })),
      }
    : null;

  return (
    <article className="min-h-screen bg-[#fafbfc] pb-20">
      {/* JSON-LD Scripts */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      {/* ── 1. ARTICLE HEADER ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto space-y-5">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-black">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link href="/blog" className="hover:text-black">Blog & Guides</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[#00897b] font-medium truncate">{article.categoryName}</span>
          </nav>

          {/* Category Tag */}
          <span className="bg-[#00897b]/10 text-[#00897b] border border-[#00897b]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
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
                <Clock className="w-3.5 h-3.5 text-[#00897b]" />
                {article.readTime}
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={handleShare}
                className="h-[30px] px-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5 text-[#00897b]" /><span className="text-[#00897b]">Copied!</span></>
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

          {/* Related Repair Services — Juicy Internal Linking Widget */}
          <section className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/60 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-[#00897b]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#00897b]">
                Related Repair Services
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Philadelphia's trusted same-day repair shop — serving {PHILLY_NEIGHBORHOODS.slice(0, 4).join(", ")} & more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {serviceLinks.map((link) => (
                <Link
                  key={link.url + link.label}
                  href={link.url}
                  className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-teal-200 hover:border-[#00897b] hover:shadow-md transition-all group text-sm font-semibold text-gray-900"
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-[#00897b] group-hover:translate-x-0.5 transition-transform" />
                    {link.label}
                  </span>
                  {link.badge && (
                    <span className="text-[10px] font-bold bg-[#00897b]/10 text-[#00897b] px-2 py-0.5 rounded-full border border-[#00897b]/20">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Link
                href="/repairs"
                className="text-xs text-[#00897b] font-bold hover:underline flex items-center gap-1"
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
            {/* Fallback: render sections if no contentHtml */}
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
                <span className="text-xs uppercase font-bold text-[#4dd0e1] tracking-wider block">
                  Professional Philadelphia Service
                </span>
                <h3 className="text-xl sm:text-2xl font-bold">{article.connectedService.title}</h3>
                <p className="text-sm text-neutral-300">
                  Certified technician bench service · 90-day warranty · Same-day turnaround
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0 space-y-2">
                <span className="text-2xl font-black text-[#4dd0e1] block">
                  {article.connectedService.price}
                </span>
                <Link
                  href={article.connectedService.bookingUrl}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  Book This Repair <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          )}

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
              <MapPin className="w-3.5 h-3.5 text-[#00897b]" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Serving Philadelphia Neighborhoods</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              SmartFoneDoctor provides same-day device repair to customers from{" "}
              {PHILLY_NEIGHBORHOODS.join(", ")} and surrounding areas.{" "}
              <Link href="/locations" className="text-[#00897b] font-semibold hover:underline">
                Find our locations →
              </Link>
            </p>
          </div>

          {/* Author Bio */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-xs flex items-start gap-4">
            <span className="w-12 h-12 rounded-full bg-[#00897b] text-white text-base font-bold flex items-center justify-center shrink-0">
              {article.author.avatar || article.author.name.slice(0, 2)}
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">Written by {article.author.name}</span>
                <ShieldCheck className="w-4 h-4 text-[#00897b]" />
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
                <BookOpen className="w-4 h-4 text-[#00897b]" />
                <h2 className="text-base font-bold text-gray-900">Related Guides</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/blog/${rel.slug}`}
                    className="group rounded-xl overflow-hidden border border-gray-200 hover:border-[#00897b]/40 hover:shadow-md transition-all bg-white"
                  >
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={rel.featuredImage}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <span className="text-[10px] font-bold text-[#00897b] uppercase tracking-wider">
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
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[#00897b] hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to All Guides & Articles
            </Link>
          </div>
        </div>

        {/* ── STICKY SIDEBAR (desktop) ───────────────────────────── */}
        <aside className="hidden lg:block w-[260px] shrink-0 sticky top-24 self-start space-y-6">

          {/* Table of Contents */}
          {tocItems.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <TableOfContents items={tocItems} activeId={activeId} />
            </div>
          )}

          {/* Sidebar CTA */}
          <div className="rounded-2xl bg-[#1d1c1a] text-white p-5 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4dd0e1]">
              Same-Day Repair
            </span>
            <p className="text-sm font-bold leading-snug">Need a repair now? We're open 7 days a week.</p>
            <div className="space-y-2 pt-1">
              <Link
                href="/schedule-repair"
                className="block w-full text-center px-4 py-2.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Book a Repair
              </Link>
              <Link
                href="/track"
                className="block w-full text-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Track My Repair
              </Link>
            </div>
            <div className="pt-2 border-t border-white/10">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                📍 33 S 52nd St · Lancaster Ave · Philadelphia, PA
              </p>
            </div>
          </div>

          {/* Ratings Badge */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center space-y-2">
            <div className="flex justify-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm font-black text-gray-900">4.9 / 5.0</p>
            <p className="text-xs text-gray-500">Based on 400+ Google Reviews</p>
            <Link
              href="/review/smartfonedoctor-philly"
              className="text-[11px] font-bold text-[#00897b] hover:underline block"
            >
              Read customer stories →
            </Link>
          </div>

          {/* Neighborhoods */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-[#00897b]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">We Serve</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PHILLY_NEIGHBORHOODS.map((n) => (
                <span key={n} className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {n}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── 4. MOBILE TOC BUTTON ───────────────────────────────────────── */}
      <MobileTOC items={tocItems} activeId={activeId} />

      {/* ── 5. MOBILE STICKY BOOKING BAR ───────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-xl">
        <div className="flex-1 min-w-0">
          {article.connectedService ? (
            <>
              <p className="text-xs font-bold text-gray-900 truncate">{article.connectedService.title}</p>
              <p className="text-xs text-[#00897b] font-black">{article.connectedService.price}</p>
            </>
          ) : (
            <p className="text-xs font-bold text-gray-900">Same-day repair in Philadelphia</p>
          )}
        </div>
        <Link
          href={article.connectedService?.bookingUrl || "/schedule-repair"}
          className="shrink-0 px-5 py-2.5 rounded-full bg-[#00897b] text-white text-xs font-bold uppercase tracking-wider active:scale-95 transition-transform"
        >
          Book Repair
        </Link>
      </div>
    </article>
  );
}
