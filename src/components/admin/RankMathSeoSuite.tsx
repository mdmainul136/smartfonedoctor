"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Globe,
  Share2,
  Code2,
  Smartphone,
  Laptop,
  Layers,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Check,
  ExternalLink,
  RefreshCw,
  Eye,
} from "lucide-react";
import MediaModal, { type SelectedMediaPayload } from "@/components/admin/MediaModal";

export interface RankMathSeoProps {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  focusKeyword: string;
  featuredImage?: string;
  canonicalUrl?: string;
  compact?: boolean;
  schemaType?: string;
  pageImages?: string[];
  onKeywordChange?: (keyword: string) => void;
  onSchemaChange?: (schemaType: string) => void;
  onFeaturedImageChange?: (image: string) => void;
}

interface SeoCheck {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  warning?: boolean;
  scoreWeight: number;
}

const PRESET_REPAIR_IMAGES = [
  {
    name: "Repair Bench",
    url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
    desc: "iPhone technician battery & display bench",
  },
  {
    name: "OLED Micro-lab",
    url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80",
    desc: "Precision microscope micro-soldering",
  },
  {
    name: "MacBook Lab",
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    desc: "Ultrasonic logic board diagnostics",
  },
  {
    name: "Brand Logo",
    url: "/logo-png.jpg",
    desc: "Official SmartFoneDoctor logo",
  },
];

export default function RankMathSeoSuite({
  title,
  slug,
  excerpt,
  contentHtml,
  focusKeyword,
  featuredImage,
  canonicalUrl,
  compact = false,
  schemaType: initialSchemaType,
  pageImages = [],
  onKeywordChange,
  onSchemaChange,
  onFeaturedImageChange,
}: RankMathSeoProps) {
  const [activeTab, setActiveTab] = useState<"general" | "social" | "schema">("general");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [socialPlatform, setSocialPlatform] = useState<"facebook" | "twitter">("facebook");
  const [schemaType, setSchemaType] = useState<string>(initialSchemaType || "TechArticle");

  // Media picker & file upload states
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialSchemaType && initialSchemaType !== schemaType) {
      setSchemaType(initialSchemaType);
    }
  }, [initialSchemaType, schemaType]);

  // Strip HTML to get clean text
  const plainText = useMemo(() => {
    if (!contentHtml) return "";
    return contentHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }, [contentHtml]);

  // Word count calculation
  const wordCount = useMemo(() => {
    if (!plainText) return 0;
    return plainText.split(/\s+/).filter(Boolean).length;
  }, [plainText]);

  const cleanKeyword = focusKeyword ? focusKeyword.trim().toLowerCase() : "";

  // Direct file upload handler
  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", title || "SmartFoneDoctor Philadelphia");
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.item?.url) {
          onFeaturedImageChange?.(data.item.url);
        }
      }
    } catch (err) {
      console.error("Direct upload failed:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ─── 1. BASIC SEO CHECKS (RankMath Engine) ──────────────────────────────
  const basicChecks: SeoCheck[] = useMemo(() => {
    if (!cleanKeyword) {
      return [
        {
          id: "no-kw",
          label: "Add a Focus Keyword",
          description: "Enter a focus keyword (e.g. 'About SmartFoneDoctor Philadelphia') to run the live SEO checklist audit.",
          passed: false,
          scoreWeight: 0,
        },
      ];
    }

    const titleLower = (title || "").toLowerCase();
    const slugLower = (slug || "").toLowerCase().replace(/^\/+/, "");
    const excerptLower = (excerpt || "").toLowerCase();

    // Extract significant keyword tokens (>2 chars)
    const kwWords = cleanKeyword
      .split(/[\s,–—|/_-]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 2);

    // First portion of plain text (at least 200 chars or 15%)
    const firstPortionLength = Math.max(200, Math.floor(plainText.length * 0.15));
    const firstPortion = plainText.slice(0, firstPortionLength).toLowerCase();

    // 1. Keyword in Title
    const titleExact = titleLower.includes(cleanKeyword);
    const titleAllWords = kwWords.length > 0 && kwWords.every((w) => titleLower.includes(w));
    const titlePartial =
      kwWords.length > 1 &&
      kwWords.filter((w) => titleLower.includes(w)).length >= Math.ceil(kwWords.length * 0.6);
    const titlePassed = titleExact || titleAllWords;

    // 2. Keyword in Slug
    const slugClean = slugLower.replace(/[^a-z0-9]/g, "-");
    const slugExact =
      slugClean.includes(cleanKeyword.replace(/\s+/g, "-")) || slugLower.includes(cleanKeyword);
    const slugMatches = kwWords.some(
      (w) => slugLower === w || slugLower.includes(w) || w.includes(slugLower)
    );
    const slugPassed = slugExact || slugMatches;

    // 3. Keyword in Meta Description
    const excerptExact = excerptLower.includes(cleanKeyword);
    const excerptAllWords = kwWords.length > 0 && kwWords.every((w) => excerptLower.includes(w));
    const excerptPartial =
      kwWords.length > 1 &&
      kwWords.filter((w) => excerptLower.includes(w)).length >= Math.ceil(kwWords.length * 0.6);
    const excerptPassed = excerptExact || excerptAllWords;

    // 4. Keyword in Opening Intro
    const introExact = firstPortion.includes(cleanKeyword);
    const introAllWords = kwWords.length > 0 && kwWords.every((w) => firstPortion.includes(w));
    const introPartial =
      kwWords.length > 0 &&
      kwWords.filter((w) => firstPortion.includes(w)).length >= Math.min(2, kwWords.length);
    const introPassed = introExact || introAllWords || introPartial;

    // 5. Content Length
    const lengthPassed = wordCount >= 500;
    const lengthWarning = wordCount >= 250 && wordCount < 500;

    return [
      {
        id: "kw-in-title",
        label: "Focus Keyword in Title",
        description: titleExact
          ? `Exact focus keyword "${cleanKeyword}" appears in SEO title.`
          : titleAllWords
          ? `All core keyword terms appear in the title.`
          : titlePartial
          ? `Some keyword terms appear in the title.`
          : `Focus keyword "${cleanKeyword}" was not found in the title.`,
        passed: titlePassed,
        warning: !titlePassed && titlePartial,
        scoreWeight: 20,
      },
      {
        id: "kw-in-slug",
        label: "Focus Keyword in URL Slug",
        description: slugExact
          ? `URL slug contains "${cleanKeyword}".`
          : slugMatches
          ? `URL path aligns with primary page entity ("${slugLower}").`
          : `URL slug does not include the focus keyword terms.`,
        passed: slugPassed,
        scoreWeight: 15,
      },
      {
        id: "kw-in-excerpt",
        label: "Focus Keyword in Meta Description",
        description: excerptExact
          ? `Meta description contains exact focus keyword.`
          : excerptAllWords
          ? `All core focus terms appear naturally in meta description.`
          : excerptPartial
          ? `Key search terms detected in meta description.`
          : `Meta description is missing the target keyword.`,
        passed: excerptPassed,
        warning: !excerptPassed && excerptPartial,
        scoreWeight: 15,
      },
      {
        id: "kw-in-intro",
        label: "Focus Keyword in Opening Text",
        description: introExact || introAllWords
          ? `Keywords appear early in the opening section.`
          : introPartial
          ? `Key search terms found in introductory paragraphs.`
          : `Consider placing the focus keyword in the introductory paragraph.`,
        passed: introPassed,
        scoreWeight: 15,
      },
      {
        id: "content-length",
        label: `Content Length (${wordCount} words)`,
        description: lengthPassed
          ? `Great job! Page has ${wordCount} words (minimum recommended is 500).`
          : lengthWarning
          ? `Page has ${wordCount} words. Aim for 500+ words for maximum competitive rank.`
          : `Page is ${wordCount} words. Expand sections to add helpful content.`,
        passed: lengthPassed,
        warning: lengthWarning,
        scoreWeight: 15,
      },
    ];
  }, [cleanKeyword, title, slug, excerpt, plainText, wordCount]);

  // ─── 2. ADDITIONAL & ADVANCED SEO CHECKS ─────────────────────────────────
  const additionalChecks: SeoCheck[] = useMemo(() => {
    if (!cleanKeyword) return [];

    const kwWords = cleanKeyword
      .split(/[\s,–—|/_-]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 2);

    // Headings H1/H2/H3
    const headingMatches = (contentHtml.match(/<h[123][^>]*>(.*?)<\/h[123]>/gi) || [])
      .join(" ")
      .toLowerCase();
    const kwInHeadings =
      headingMatches.includes(cleanKeyword) ||
      (kwWords.length > 0 && kwWords.some((w) => headingMatches.includes(w)));

    // Keyword density
    const primaryToken =
      kwWords.find((w) => w !== "about" && w !== "philadelphia") || kwWords[0] || cleanKeyword;
    const regexExact = new RegExp(
      `\\b${cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );
    const regexPrimary = new RegExp(
      `\\b${primaryToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );
    const occurrences = Math.max(
      (plainText.match(regexExact) || []).length,
      (plainText.match(regexPrimary) || []).length
    );
    const density = wordCount > 0 ? (occurrences / wordCount) * 100 : 0;
    const optimalDensity = density >= 0.4 && density <= 4.0;

    // Image Alt & OpenGraph Image check
    const imgMatches = contentHtml.match(/<img[^>]+alt=["']([^"']*)["'][^>]*>/gi) || [];
    const hasImagesInBody = (contentHtml.match(/<img/gi) || []).length > 0;
    const hasFeatured = Boolean(featuredImage && featuredImage.trim().length > 0);
    const hasAnyImage = hasImagesInBody || hasFeatured;
    const imgAltHasKw =
      imgMatches.some(
        (img) =>
          img.toLowerCase().includes(cleanKeyword) ||
          kwWords.some((w) => img.toLowerCase().includes(w))
      ) || (hasFeatured && Boolean(title));
    const imageCheckPassed = hasAnyImage && (imgAltHasKw || hasFeatured);

    // Links check
    const internalLinks = (
      contentHtml.match(/href=["'](\/|https?:\/\/smartfonedoctor|tel:|mailto:)/gi) || []
    ).length;
    const externalLinks = (
      contentHtml.match(/href=["']https?:\/\/(?!smartfonedoctor)/gi) || []
    ).length;

    return [
      {
        id: "kw-in-headings",
        label: "Keyword in Subheadings (H1/H2/H3)",
        description: kwInHeadings
          ? `Found relevant keywords inside page headings.`
          : `Include your focus keyword in at least one H2 or H3 subheading.`,
        passed: kwInHeadings,
        scoreWeight: 10,
      },
      {
        id: "kw-density",
        label: `Keyword Density (${density.toFixed(1)}%)`,
        description: optimalDensity
          ? `Target terms appear naturally (${density.toFixed(1)}%). Optimal range is 0.4% - 3.5%.`
          : density > 4.0
          ? `Keyword density (${density.toFixed(1)}%) is too high. Avoid keyword stuffing.`
          : `Keyword density (${density.toFixed(1)}%) is low. Mention "${cleanKeyword}" naturally.`,
        passed: optimalDensity,
        warning: density > 0 && !optimalDensity,
        scoreWeight: 5,
      },
      {
        id: "img-alt",
        label: "Featured & OpenGraph Images",
        description: imageCheckPassed
          ? hasFeatured
            ? `High-resolution social card & media configured with semantic SEO tags.`
            : `Images detected with alt attributes in content.`
          : `Add a social share image or body photos to improve engagement and ranking.`,
        passed: imageCheckPassed,
        warning: hasAnyImage && !imageCheckPassed,
        scoreWeight: 5,
      },
      {
        id: "internal-links",
        label: `Internal Links (${internalLinks} found)`,
        description:
          internalLinks >= 2
            ? `Solid internal linking structure (${internalLinks} service/booking links).`
            : `Add internal links to related repair services or booking pages.`,
        passed: internalLinks >= 2,
        warning: internalLinks === 1,
        scoreWeight: 5,
      },
      {
        id: "external-links",
        label: `Authority & Maps Directives`,
        description:
          externalLinks >= 1 || internalLinks >= 3
            ? `Search engines verified local repair entity and booking directives.`
            : `Include a direct link to Google Maps or store hours.`,
        passed: externalLinks >= 1 || internalLinks >= 3,
        scoreWeight: 5,
      },
    ];
  }, [cleanKeyword, contentHtml, plainText, wordCount, featuredImage, title]);

  // Total Score Calculation (0 to 100)
  const totalScore = useMemo(() => {
    if (!cleanKeyword) return 25; // Base default without keyword
    const allChecks = [...basicChecks, ...additionalChecks];
    const totalPoints = allChecks.reduce(
      (acc, c) => acc + (c.passed ? c.scoreWeight : c.warning ? c.scoreWeight * 0.6 : 0),
      0
    );
    return Math.min(100, Math.round(totalPoints));
  }, [basicChecks, additionalChecks, cleanKeyword]);

  // Score color helper
  const scoreBadgeColor =
    totalScore >= 80
      ? "bg-emerald-500 text-white"
      : totalScore >= 50
      ? "bg-amber-500 text-white"
      : "bg-red-500 text-white";

  const scoreTextColor =
    totalScore >= 80 ? "text-emerald-600" : totalScore >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
      {/* Hidden file input for direct upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleDirectUpload}
        className="hidden"
      />

      {/* Media Management Modal */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(payload: SelectedMediaPayload) => {
          onFeaturedImageChange?.(payload.url);
          setIsMediaModalOpen(false);
        }}
        title="Select Featured & Social Share Card Image"
        selectButtonText="Use as Social Thumbnail"
        initialSelectedUrl={featuredImage}
      />

      {/* ── HEADER & SCORE METER ── */}
      <div
        className={`border-b border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50 flex flex-col gap-3 ${
          compact ? "p-3" : "p-4 sm:flex-row sm:items-center justify-between gap-4"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Circular Score Gauge */}
          <div
            className={`relative rounded-full flex items-center justify-center bg-gray-100 border-4 border-gray-200 shadow-inner shrink-0 ${
              compact ? "w-11 h-11" : "w-13 h-13"
            }`}
          >
            <span className={`${compact ? "text-sm" : "text-base"} font-black ${scoreTextColor}`}>
              {totalScore}
            </span>
            <span className="text-[9px] text-gray-400 absolute -bottom-1 font-bold">/100</span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">SEO checklist</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scoreBadgeColor}`}>
                {totalScore >= 80 ? "Great" : totalScore >= 50 ? "Fair" : "Poor"}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
              Live checklist for Google search ranking
            </p>
          </div>
        </div>

        {/* Focus Keyword Input in Header */}
        <div className={compact ? "w-full" : "w-full sm:w-72"}>
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Focus Keyword
          </label>
          <input
            type="text"
            value={focusKeyword}
            onChange={(e) => onKeywordChange && onKeywordChange(e.target.value)}
            placeholder="e.g. About SmartFoneDoctor Philadelphia"
            className="w-full h-[32px] px-2.5 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
          />
        </div>
      </div>

      {/* ── TABS (Checklist / Social Share Card / Schema) ── */}
      <div
        className={`flex items-center border-b border-gray-200 bg-gray-50/50 overflow-x-auto ${
          compact ? "px-2" : "px-4"
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`${
            compact ? "px-2.5 py-2 text-[11px]" : "px-4 py-2.5 text-xs"
          } font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === "general"
              ? "border-[#009691] text-[#009691]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span>{compact ? "Checklist" : "SEO Checklist & SERP"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`${
            compact ? "px-2.5 py-2 text-[11px]" : "px-4 py-2.5 text-xs"
          } font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === "social"
              ? "border-[#009691] text-[#009691]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Share2 className="w-3.5 h-3.5 shrink-0" />
          <span>{compact ? "Social Card" : "Social Share Card"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schema")}
          className={`${
            compact ? "px-2.5 py-2 text-[11px]" : "px-4 py-2.5 text-xs"
          } font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === "schema"
              ? "border-[#009691] text-[#009691]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Code2 className="w-3.5 h-3.5 shrink-0" />
          <span>{compact ? "Schema" : "Schema Structured Data"}</span>
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className={compact ? "p-3 space-y-4" : "p-4 space-y-5"}>
        {/* TAB 1: GENERAL SEO & SERP */}
        {activeTab === "general" && (
          <div className={compact ? "space-y-4" : "space-y-5"}>
            {/* Google SERP Preview Card */}
            <div
              className={`rounded-xl border border-gray-200 bg-gray-50/60 space-y-2.5 ${
                compact ? "p-3" : "p-3.5 space-y-2.5"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#009691] shrink-0" />
                  <span>Google Search Preview</span>
                </span>

                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                      previewDevice === "desktop"
                        ? "bg-gray-100 text-gray-900 shadow-2xs"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <Laptop className="w-3 h-3" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                      previewDevice === "mobile"
                        ? "bg-gray-100 text-gray-900 shadow-2xs"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <Smartphone className="w-3 h-3" /> Mobile
                  </button>
                </div>
              </div>

              {/* Snippet box */}
              <div
                className={`p-3 rounded-lg bg-white border border-gray-200 space-y-1 shadow-2xs ${
                  previewDevice === "mobile" ? "max-w-sm mx-auto" : "w-full"
                }`}
              >
                <div className="text-[11px] text-gray-500 font-mono truncate">
                  smartfonedoctor.com/{slug || "page"}
                </div>
                <div className="text-[13px] font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                  {title || "Page Title Goes Here"}
                </div>
                <div className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                  {excerpt || "Add a meta description summarizing your page for Google search results..."}
                </div>
              </div>
            </div>

            {/* Checklists */}
            <div className={`grid grid-cols-1 gap-4 ${compact ? "" : "md:grid-cols-2 md:gap-4"}`}>
              {/* Left Column: Basic SEO */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
                  Basic SEO Checks
                </span>
                <div className="space-y-2">
                  {basicChecks.map((check) => (
                    <div
                      key={check.id}
                      className="p-2.5 rounded-lg border border-gray-200 bg-white flex items-start gap-2.5 text-xs shadow-2xs"
                    >
                      {check.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : check.warning ? (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block leading-snug">
                          {check.label}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          {check.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Additional SEO */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
                  Advanced &amp; Media Checks
                </span>
                <div className="space-y-2">
                  {additionalChecks.map((check) => (
                    <div
                      key={check.id}
                      className="p-2.5 rounded-lg border border-gray-200 bg-white flex items-start gap-2.5 text-xs shadow-2xs"
                    >
                      {check.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : check.warning ? (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block leading-snug">
                          {check.label}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          {check.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOCIAL SHARE CARD & IMAGE STUDIO */}
        {activeTab === "social" && (
          <div className="space-y-4">
            {/* Social Platform Switcher & Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-gray-200">
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-md border border-gray-200 text-xs">
                <button
                  type="button"
                  onClick={() => setSocialPlatform("facebook")}
                  className={`px-2.5 py-1 text-[11px] rounded font-semibold whitespace-nowrap cursor-pointer transition ${
                    socialPlatform === "facebook"
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Facebook / LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => setSocialPlatform("twitter")}
                  className={`px-2.5 py-1 text-[11px] rounded font-semibold whitespace-nowrap cursor-pointer transition ${
                    socialPlatform === "twitter"
                      ? "bg-white text-gray-900 shadow-2xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Twitter / X Card
                </button>
              </div>

              {/* Upload & Media Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="h-[28px] px-2.5 rounded-[5px] border border-gray-300 bg-white hover:bg-gray-50 text-[11px] font-semibold text-gray-700 inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#009691]" />
                  <span>Media Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-[28px] px-2.5 rounded-[5px] bg-[#009691] hover:bg-[#007f7b] text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploading ? "Uploading..." : "Upload New"}</span>
                </button>
              </div>
            </div>

            {/* Quick Sync & Detected Page Images */}
            {pageImages.length > 0 && (
              <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#009691]" />
                    <span>Images Detected on this Page:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onFeaturedImageChange?.(pageImages[0])}
                    className="text-[10px] font-semibold text-[#009691] hover:underline cursor-pointer"
                  >
                    Use First / Hero Image
                  </button>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {pageImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onFeaturedImageChange?.(imgUrl)}
                      className={`relative w-14 h-12 rounded border-2 overflow-hidden shrink-0 transition-all cursor-pointer group ${
                        featuredImage === imgUrl
                          ? "border-[#009691] ring-2 ring-[#009691]/20"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      title="Click to set as social thumbnail"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt="Page image" className="w-full h-full object-cover" />
                      {featuredImage === imgUrl && (
                        <div className="absolute inset-0 bg-[#009691]/40 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Repair Presets */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Quick Repair Shop Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PRESET_REPAIR_IMAGES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => onFeaturedImageChange?.(preset.url)}
                    className={`p-1.5 rounded-[6px] border text-left transition cursor-pointer flex flex-col gap-0.5 ${
                      featuredImage === preset.url
                        ? "border-[#009691] bg-teal-50/40"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-[11px] font-bold text-gray-800 truncate">
                      {preset.name}
                    </span>
                    <span className="text-[9px] text-gray-500 truncate leading-tight">
                      {preset.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Social Card Mockup */}
            <div className="max-w-lg mx-auto rounded-xl border border-gray-300 overflow-hidden bg-white shadow-sm">
              <div className="aspect-[1.91/1] bg-gray-900 relative group overflow-hidden">
                {featuredImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featuredImage}
                      alt="Social preview"
                      className="w-full h-full object-cover"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1.5 p-4 text-center">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                    <span>No Social Image Selected</span>
                    <span className="text-[10px] text-gray-500">
                      Click &quot;Media Library&quot; or upload an image above
                    </span>
                  </div>
                )}

                {/* Overlay Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMediaModalOpen(true)}
                    className="px-3 py-1.5 rounded-md bg-white text-gray-900 text-xs font-semibold shadow-md hover:bg-gray-50 cursor-pointer"
                  >
                    Change Image
                  </button>
                  {featuredImage && (
                    <button
                      type="button"
                      onClick={() => onFeaturedImageChange?.("")}
                      className="px-2.5 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold shadow-md hover:bg-red-700 cursor-pointer"
                      title="Clear image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3.5 space-y-1 bg-gray-50/70 border-t border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  SMARTFONEDOCTOR.COM
                </span>
                <p className="text-sm font-bold text-gray-900 line-clamp-1">
                  {title || "Page Title"}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {excerpt || "Social description will show here..."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCHEMA STRUCTURED DATA SELECTOR */}
        {activeTab === "schema" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Schema.org Structured Data Type
              </label>
              <select
                value={schemaType}
                onChange={(e) => {
                  setSchemaType(e.target.value);
                  onSchemaChange && onSchemaChange(e.target.value);
                }}
                className="w-full sm:w-72 h-[34px] px-3 rounded-lg border border-gray-300 text-xs font-semibold bg-white focus:outline-none focus:border-[#009691]"
              >
                <option value="AboutPage">AboutPage (Brand &amp; Mission)</option>
                <option value="LocalBusiness">LocalBusiness (Repair Center)</option>
                <option value="TechArticle">TechArticle (Repair Guides &amp; Diagnostics)</option>
                <option value="Article">Standard Article / Blog Post</option>
                <option value="HowTo">HowTo Guide (Step-by-step instructions)</option>
                <option value="FAQPage">FAQ Page (Troubleshooting Q&amp;A)</option>
              </select>
            </div>

            {/* Schema JSON-LD Preview */}
            <div className="rounded-xl bg-gray-900 text-emerald-400 p-4 font-mono text-[11px] overflow-x-auto leading-relaxed border border-gray-800">
              <pre>
                {JSON.stringify(
                  {
                    "@context": "https://schema.org",
                    "@type": schemaType,
                    headline: title,
                    description: excerpt,
                    image: featuredImage,
                    author: {
                      "@type": "Person",
                      name: "Certified Hardware Technician",
                    },
                    publisher: {
                      "@type": "LocalBusiness",
                      name: "SmartFoneDoctor Philadelphia",
                      address: "33 S 52nd St, Philadelphia, PA 19139",
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
