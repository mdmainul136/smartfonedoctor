"use client";

import React, { useState, useMemo } from "react";
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
  Sparkles,
} from "lucide-react";

export interface RankMathSeoProps {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  focusKeyword: string;
  featuredImage?: string;
  canonicalUrl?: string;
  onKeywordChange?: (keyword: string) => void;
  onSchemaChange?: (schemaType: string) => void;
}

interface SeoCheck {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  warning?: boolean;
  scoreWeight: number;
}

export default function RankMathSeoSuite({
  title,
  slug,
  excerpt,
  contentHtml,
  focusKeyword,
  featuredImage,
  canonicalUrl,
  onKeywordChange,
  onSchemaChange,
}: RankMathSeoProps) {
  const [activeTab, setActiveTab] = useState<"general" | "social" | "schema">("general");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [socialPlatform, setSocialPlatform] = useState<"facebook" | "twitter">("facebook");
  const [schemaType, setSchemaType] = useState<string>("TechArticle");

  // Helper: strip HTML to get clean text
  const plainText = useMemo(() => {
    if (!contentHtml) return "";
    return contentHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }, [contentHtml]);

  // Word count & calculations
  const wordCount = useMemo(() => {
    if (!plainText) return 0;
    return plainText.split(/\s+/).filter(Boolean).length;
  }, [plainText]);

  const cleanKeyword = focusKeyword ? focusKeyword.trim().toLowerCase() : "";

  // ─── 1. BASIC SEO CHECKS ───────────────────────────────────────────────
  const basicChecks: SeoCheck[] = useMemo(() => {
    if (!cleanKeyword) {
      return [
        {
          id: "no-kw",
          label: "Add a Focus Keyword",
          description: "Enter a focus keyword to run the live SEO checklist audit.",
          passed: false,
          scoreWeight: 0,
        },
      ];
    }

    const titleLower = (title || "").toLowerCase();
    const slugLower = (slug || "").toLowerCase();
    const excerptLower = (excerpt || "").toLowerCase();

    // First 10% of plain text
    const firstTenPercentLength = Math.max(100, Math.floor(plainText.length * 0.1));
    const firstTenPercent = plainText.slice(0, firstTenPercentLength).toLowerCase();

    return [
      {
        id: "kw-in-title",
        label: "Focus Keyword in Title",
        description: titleLower.includes(cleanKeyword)
          ? `Focus keyword "${cleanKeyword}" appears in SEO title.`
          : `Focus keyword "${cleanKeyword}" was not found in the article title.`,
        passed: titleLower.includes(cleanKeyword),
        scoreWeight: 20,
      },
      {
        id: "kw-in-slug",
        label: "Focus Keyword in URL Slug",
        description: slugLower.includes(cleanKeyword.replace(/\s+/g, "-")) || slugLower.includes(cleanKeyword)
          ? `URL slug contains "${cleanKeyword}".`
          : `URL slug does not include the focus keyword.`,
        passed: slugLower.includes(cleanKeyword.replace(/\s+/g, "-")) || slugLower.includes(cleanKeyword),
        scoreWeight: 15,
      },
      {
        id: "kw-in-excerpt",
        label: "Focus Keyword in Meta Description",
        description: excerptLower.includes(cleanKeyword)
          ? `Meta description contains "${cleanKeyword}".`
          : `Meta description is missing the focus keyword.`,
        passed: excerptLower.includes(cleanKeyword),
        scoreWeight: 15,
      },
      {
        id: "kw-in-intro",
        label: "Focus Keyword in First 10% of Content",
        description: firstTenPercent.includes(cleanKeyword)
          ? `Keyword appears early in the opening paragraphs.`
          : `Consider placing the focus keyword in the introductory paragraph.`,
        passed: firstTenPercent.includes(cleanKeyword),
        scoreWeight: 15,
      },
      {
        id: "content-length",
        label: `Content Length (${wordCount} words)`,
        description:
          wordCount >= 600
            ? `Great job! Content has ${wordCount} words (minimum recommended is 600).`
            : `Content is ${wordCount} words. Aim for at least 600 words for competitive search rank.`,
        passed: wordCount >= 600,
        warning: wordCount >= 300 && wordCount < 600,
        scoreWeight: 15,
      },
    ];
  }, [cleanKeyword, title, slug, excerpt, plainText, wordCount]);

  // ─── 2. ADDITIONAL & ADVANCED SEO CHECKS ─────────────────────────────────
  const additionalChecks: SeoCheck[] = useMemo(() => {
    if (!cleanKeyword) return [];

    // Check headings H2/H3 for keyword
    const headingMatches = (contentHtml.match(/<h[23][^>]*>(.*?)<\/h[23]>/gi) || []).join(" ").toLowerCase();
    const kwInHeadings = headingMatches.includes(cleanKeyword);

    // Keyword density calculation
    const regex = new RegExp(`\\b${cleanKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    const occurrences = (plainText.match(regex) || []).length;
    const density = wordCount > 0 ? (occurrences / wordCount) * 100 : 0;
    const optimalDensity = density >= 0.8 && density <= 2.5;

    // Image alt check
    const imgMatches = contentHtml.match(/<img[^>]+alt=["']([^"']*)["'][^>]*>/gi) || [];
    const hasImages = (contentHtml.match(/<img/gi) || []).length > 0;
    const hasAlt = imgMatches.length > 0;
    const imgAltHasKw = imgMatches.some((img) => img.toLowerCase().includes(cleanKeyword));

    // Links check
    const internalLinks = (contentHtml.match(/href=["'](\/|https?:\/\/smartfonedoctor)/gi) || []).length;
    const externalLinks = (contentHtml.match(/href=["']https?:\/\/(?!smartfonedoctor)/gi) || []).length;

    return [
      {
        id: "kw-in-headings",
        label: "Keyword in Subheadings (H2/H3)",
        description: kwInHeadings
          ? `Found "${cleanKeyword}" inside H2/H3 subheadings.`
          : `Include your focus keyword in at least one H2 or H3 subheading.`,
        passed: kwInHeadings,
        scoreWeight: 10,
      },
      {
        id: "kw-density",
        label: `Keyword Density (${density.toFixed(1)}%)`,
        description: optimalDensity
          ? `Keyword appears ${occurrences} times (${density.toFixed(1)}%). Optimal range is 0.8% - 2.5%.`
          : density > 2.5
          ? `Keyword density (${density.toFixed(1)}%) is too high. Avoid keyword stuffing.`
          : `Keyword density (${density.toFixed(1)}%) is low. Mention "${cleanKeyword}" naturally a few more times.`,
        passed: optimalDensity,
        warning: density > 0 && !optimalDensity,
        scoreWeight: 5,
      },
      {
        id: "img-alt",
        label: "Image Alt Tags",
        description: hasImages
          ? imgAltHasKw
            ? `Found images with focus keyword in the alt attribute.`
            : `Images exist, but none include the focus keyword in their alt attribute.`
          : `No images detected in body. Add images or diagrams to improve engagement.`,
        passed: hasImages && imgAltHasKw,
        warning: hasImages && !imgAltHasKw,
        scoreWeight: 5,
      },
      {
        id: "internal-links",
        label: `Internal Links (${internalLinks} found)`,
        description:
          internalLinks >= 2
            ? `Good internal linking structure (${internalLinks} links to services or guides).`
            : `Add at least 2 internal links to related repair services or pSEO device pages.`,
        passed: internalLinks >= 2,
        warning: internalLinks === 1,
        scoreWeight: 5,
      },
      {
        id: "external-links",
        label: `External Authority Links (${externalLinks} found)`,
        description:
          externalLinks >= 1
            ? `Found ${externalLinks} external reference links.`
            : `Add a link to an official source (e.g. Apple Support, iFixit, FCC).`,
        passed: externalLinks >= 1,
        warning: externalLinks === 0,
        scoreWeight: 5,
      },
    ];
  }, [cleanKeyword, contentHtml, plainText, wordCount]);

  // Total Score Calculation (0 to 100)
  const totalScore = useMemo(() => {
    if (!cleanKeyword) return 25; // Base default without keyword
    const allChecks = [...basicChecks, ...additionalChecks];
    const totalPoints = allChecks.reduce((acc, c) => acc + (c.passed ? c.scoreWeight : c.warning ? c.scoreWeight * 0.5 : 0), 0);
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
      {/* ── HEADER & SCORE METER ── */}
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Circular Score Gauge */}
          <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 border-4 border-gray-200 shadow-inner shrink-0">
            <span className={`text-base font-black ${scoreTextColor}`}>
              {totalScore}
            </span>
            <span className="text-[9px] text-gray-400 absolute -bottom-1 font-bold">/100</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#00897b]" />
                RankMath SEO Analyzer
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scoreBadgeColor}`}>
                {totalScore >= 80 ? "Great" : totalScore >= 50 ? "Fair" : "Poor"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Live algorithmic checklist for Google top-ranking results
            </p>
          </div>
        </div>

        {/* Focus Keyword Input in Header */}
        <div className="w-full sm:w-72">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
            Focus Keyword
          </label>
          <input
            type="text"
            value={focusKeyword}
            onChange={(e) => onKeywordChange && onKeywordChange(e.target.value)}
            placeholder="e.g. replace iphone battery"
            className="w-full h-[32px] px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#00897b] focus:ring-1 focus:ring-[#00897b]"
          />
        </div>
      </div>

      {/* ── TABS (General / Social / Schema) ── */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50/50 px-4">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "general"
              ? "border-[#00897b] text-[#00897b]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>SEO Checklist &amp; SERP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "social"
              ? "border-[#00897b] text-[#00897b]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Share Card</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schema")}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "schema"
              ? "border-[#00897b] text-[#00897b]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Schema Structured Data</span>
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="p-5 space-y-6">
        
        {/* TAB 1: GENERAL SEO & SERP */}
        {activeTab === "general" && (
          <div className="space-y-6">
            
            {/* Google SERP Preview Card with Device Switcher */}
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  Google SERP Snippet Preview
                </span>
                
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 ${
                      previewDevice === "desktop" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <Laptop className="w-3 h-3" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 ${
                      previewDevice === "mobile" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <Smartphone className="w-3 h-3" /> Mobile
                  </button>
                </div>
              </div>

              {/* Snippet box */}
              <div className={`p-4 rounded-xl bg-white border border-gray-200 space-y-1 shadow-2xs ${
                previewDevice === "mobile" ? "max-w-sm mx-auto" : "w-full"
              }`}>
                <div className="text-[11px] text-gray-500 font-mono truncate">
                  https://smartfonedoctor.com &gt; blog &gt; {slug || "your-article-slug"}
                </div>
                <div className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                  {title || "Article Headline Title Goes Here"}
                </div>
                <div className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                  {excerpt || "Add an informative excerpt or meta description summarizing your guide to attract clicks on Google search results..."}
                </div>
              </div>
            </div>

            {/* Checklists: Two Columns (Basic vs Additional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Basic SEO */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                  Basic SEO Checks
                </span>
                <div className="space-y-2">
                  {basicChecks.map((check) => (
                    <div
                      key={check.id}
                      className="p-3 rounded-xl border border-gray-200 bg-white flex items-start gap-2.5 text-xs shadow-2xs"
                    >
                      {check.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : check.warning ? (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block leading-snug">{check.label}</span>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{check.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Additional SEO */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
                  Additional &amp; Content Checks
                </span>
                <div className="space-y-2">
                  {additionalChecks.map((check) => (
                    <div
                      key={check.id}
                      className="p-3 rounded-xl border border-gray-200 bg-white flex items-start gap-2.5 text-xs shadow-2xs"
                    >
                      {check.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : check.warning ? (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold text-gray-900 block leading-snug">{check.label}</span>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{check.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: SOCIAL SHARE PREVIEW */}
        {activeTab === "social" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">OpenGraph &amp; Social Card Preview</span>
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSocialPlatform("facebook")}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    socialPlatform === "facebook" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
                  }`}
                >
                  Facebook / LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => setSocialPlatform("twitter")}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    socialPlatform === "twitter" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
                  }`}
                >
                  Twitter / X Card
                </button>
              </div>
            </div>

            {/* Social Card Mockup */}
            <div className="max-w-lg mx-auto rounded-xl border border-gray-300 overflow-hidden bg-white shadow-sm">
              <div className="aspect-21/9 bg-gray-900 relative">
                {featuredImage ? (
                  <img src={featuredImage} alt="Social preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                    No Featured Image Selected
                  </div>
                )}
              </div>
              <div className="p-4 space-y-1 bg-gray-50/70 border-t border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-400">SMARTFONEDOCTOR.COM</span>
                <p className="text-sm font-bold text-gray-900 line-clamp-1">{title || "Article Title"}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{excerpt || "Description will show here on social shares..."}</p>
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
                className="w-full sm:w-72 h-[34px] px-3 rounded-lg border border-gray-300 text-xs font-semibold bg-white focus:outline-none focus:border-[#00897b]"
              >
                <option value="TechArticle">TechArticle (Repair Guides &amp; Diagnostics)</option>
                <option value="Article">Standard Article / Blog Post</option>
                <option value="HowTo">HowTo Guide (Step-by-step instructions)</option>
                <option value="FAQPage">FAQ Page (Troubleshooting Q&amp;A)</option>
              </select>
            </div>

            {/* Schema JSON-LD Preview */}
            <div className="rounded-xl bg-gray-900 text-emerald-400 p-4 font-mono text-[11px] overflow-x-auto leading-relaxed border border-gray-800">
              <pre>{JSON.stringify(
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
              )}</pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
