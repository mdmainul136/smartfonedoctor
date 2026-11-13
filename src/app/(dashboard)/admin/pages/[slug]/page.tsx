"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INITIAL_CMS_PAGES, CMSPage, getStoredCMSPages, saveStoredCMSPages } from "@/lib/cmsData";
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Check,
  Globe,
  Layout,
  Plus,
  Trash2,
  Clock,
  Shield,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  ChevronDown,
  Info,
  PenTool,
} from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import RankMathSeoSuite from "@/components/admin/RankMathSeoSuite";

export default function DedicatedPageEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);

  const initialPage =
    INITIAL_CMS_PAGES.find((p) => p.slug === slug) ||
    INITIAL_CMS_PAGES[0];

  const [page, setPage] = useState<CMSPage>(initialPage);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  useEffect(() => {
    const list = getStoredCMSPages();
    const found = list.find((p) => p.slug === slug);
    if (found) {
      setPage(found);
    }
  }, [slug]);

  const handleUpdate = (field: keyof CMSPage, value: any) => {
    setPage((prev) => ({ ...prev, [field]: value, lastEdited: "Just now" }));
  };

  const handleSave = () => {
    setIsSaving(true);
    const allPages = getStoredCMSPages();
    const updated = allPages.map((p) =>
      p.id === page.id || p.slug === page.slug
        ? { ...page, lastEdited: "Just now" }
        : p
    );
    saveStoredCMSPages(updated);

    setTimeout(() => {
      setIsSaving(false);
      setSavedToast(`Changes & SEO metadata published for "${page.name}"!`);
      setTimeout(() => setSavedToast(null), 3500);
    }, 400);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5 overflow-x-hidden">
      {/* 1. TOP BREADCRUMB & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8e8]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-1.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
            title="Back to Pages List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500 font-medium">Pages /</span>
              <h1 className="text-[18px] sm:text-[20px] font-bold text-[#111111]">
                {page.name}
              </h1>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {page.status}
              </span>
            </div>
            <div className="text-[11px] font-mono text-gray-400 mt-0.5">
              URL: {page.path}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={page.path}
            target="_blank"
            className="h-[34px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-gray-50 text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>Preview Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-[34px] px-4 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-[13px] font-semibold inline-flex items-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? "Saving..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {savedToast && (
        <div className="bg-[#dcfae5] border border-[#86efac] text-[#065f46] rounded-[8px] px-4 py-3 flex items-center justify-between gap-3 text-[13px] shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#059669] shrink-0" />
            <span className="font-semibold">{savedToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedToast(null)}
            className="text-[#065f46] hover:text-black font-semibold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. DEDICATED TWO-COLUMN WORKSPACE (CANVAS ON LEFT, INSPECTOR ON RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: VISUAL CONTENT CANVAS (7.5 cols on LG) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* BLOCK 1: HERO & MAIN BANNER */}
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-5 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#009691]" />
                <h2 className="text-[15px] font-bold text-[#111111]">Hero Section &amp; Banner</h2>
              </div>
              <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
                Component: HeroBlock
              </span>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111111] mb-1">
                Top Eyebrow Pill / Badge
              </label>
              <input
                type="text"
                value={page.heroBadge}
                onChange={(e) => handleUpdate("heroBadge", e.target.value)}
                placeholder="e.g. Philadelphia's Trusted Leader in"
                className="w-full h-[36px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] focus:outline-none focus:border-[#009691]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111111] mb-1">
                Main Headline (H1) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={page.heroHeadline}
                onChange={(e) => handleUpdate("heroHeadline", e.target.value)}
                className="w-full h-[38px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[14px] font-bold text-[#111111] focus:outline-none focus:border-[#009691]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111111] mb-1">
                Supporting Subtitle
              </label>
              <textarea
                rows={3}
                value={page.heroSubtitle}
                onChange={(e) => handleUpdate("heroSubtitle", e.target.value)}
                className="w-full p-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] leading-relaxed text-[#111111] focus:outline-none focus:border-[#009691]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[12px] font-medium text-[#111111] mb-1">
                  Primary CTA Button Text
                </label>
                <input
                  type="text"
                  value={page.primaryCtaText}
                  onChange={(e) => handleUpdate("primaryCtaText", e.target.value)}
                  className="w-full h-[34px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[12px] focus:outline-none focus:border-[#009691]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#111111] mb-1">
                  Primary Button Target URL
                </label>
                <input
                  type="text"
                  value={page.primaryCtaLink}
                  onChange={(e) => handleUpdate("primaryCtaLink", e.target.value)}
                  className="w-full h-[34px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[12px] focus:outline-none focus:border-[#009691]"
                />
              </div>
            </div>
          </div>

          {/* BLOCK 2: RICH TEXT WRITING CANVAS */}
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-5 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#009691]" />
                <h2 className="text-[15px] font-bold text-[#111111]">Page Body &amp; Rich Content</h2>
              </div>
              <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-semibold">
                WYSIWYG &amp; Slash Commands
              </span>
            </div>

            <p className="text-[11px] text-gray-400">
              Format full rich text content, troubleshooting steps, and policy terms. Use the <strong className="text-teal-700 font-semibold">+ Add Block</strong> button or type <strong className="font-mono text-gray-700">/</strong> for instant diagnostic blocks, tools, and tables.
            </p>

            <RichTextEditor
              value={page.contentHtml || ""}
              onChange={(html) => handleUpdate("contentHtml", html)}
              placeholder="Write or format full rich text content, policy guidelines, or service descriptions for this page..."
              minHeight="380px"
            />
          </div>

          {/* BLOCK 3: RANKMATH LIVE SEO ANALYSIS SUITE */}
          <RankMathSeoSuite
            title={page.title}
            slug={page.slug}
            excerpt={page.metaDesc}
            contentHtml={page.contentHtml || ""}
            focusKeyword={page.focusKeyword || ""}
            canonicalUrl={page.path}
            onKeywordChange={(kw) => handleUpdate("focusKeyword", kw)}
          />

          {/* BLOCK 4: PAGE BLOCKS ARCHITECTURE */}
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-5 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#009691]" />
                <h2 className="text-[15px] font-bold text-[#111111]">Page Layout Blocks</h2>
              </div>
              <span className="text-[11px] text-gray-500">
                Drag &amp; Drop Reorderable
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { name: "Hero Section", type: "hero", status: "Active", desc: "Top headline and repair booking CTA" },
                { name: "Common Issues & Diagnosing Grid", type: "services", status: "Active", desc: "Cards showing screen, battery, water damage" },
                { name: "Why Choose Us / Benefits", type: "benefits", status: "Active", desc: "30-Min turnaround, 90-Day warranty" },
                { name: "Store Locator & Interactive Map", type: "locator", status: "Active", desc: "Interactive map for all 3 locations" },
                { name: "FAQ Accordion & Schema", type: "faq", status: "Active", desc: "Accordion questions feeding Google rich snippets" },
              ].map((block, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-[8px] border border-[#e5e7eb] bg-[#fdfdfd] hover:bg-white flex items-center justify-between gap-3 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-gray-100 text-gray-600 text-[11px] font-bold flex items-center justify-center font-mono">
                      {i + 1}
                    </span>
                    <div>
                      <span className="text-[13px] font-bold text-[#111111] block">
                        {block.name}
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        {block.desc}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {block.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INSPECTOR SIDEBAR (4.5 cols on LG - Sanity/Shopify Pattern) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* INSPECTOR CARD 1: PUBLICATION STATUS & URL SLUG */}
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-4 shadow-2xs flex flex-col gap-3">
            <span className="text-[12px] font-bold text-[#111111] uppercase tracking-wider block border-b border-[#f2f2f2] pb-2">
              Status &amp; Publishing
            </span>

            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-gray-700">Visibility</span>
              <select
                value={page.status}
                onChange={(e) => handleUpdate("status", e.target.value)}
                className="h-[30px] px-2 rounded-[5px] border border-gray-300 text-[12px] font-semibold text-[#111111] bg-white focus:outline-none"
              >
                <option value="Published">Published (Public)</option>
                <option value="Draft">Draft (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                URL Path
              </label>
              <input
                type="text"
                value={page.path}
                onChange={(e) => handleUpdate("path", e.target.value)}
                className="w-full h-[32px] px-2.5 rounded-[5px] border border-gray-300 bg-gray-50 text-[12px] font-mono text-gray-700 focus:outline-none focus:bg-white"
              />
            </div>

            <div className="pt-2 border-t border-[#f2f2f2] text-[11px] text-gray-400">
              Last saved: {page.lastEdited} by {page.author}
            </div>
          </div>

          {/* INSPECTOR CARD 2: SEARCH ENGINE LISTING (SEO INSPECTOR) */}
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-4 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#f2f2f2] pb-2">
              <span className="text-[12px] font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#009691]" />
                <span>Google Search Listing</span>
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-gray-700">SEO Page Title</label>
                <span className={`text-[10px] font-mono ${page.title.length > 60 ? "text-amber-600 font-bold" : "text-gray-400"}`}>
                  {page.title.length}/60
                </span>
              </div>
              <input
                type="text"
                value={page.title}
                onChange={(e) => handleUpdate("title", e.target.value)}
                className="w-full h-[34px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] text-[#111111] focus:outline-none focus:border-[#009691]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-gray-700">Meta Description</label>
                <span className={`text-[10px] font-mono ${page.metaDesc.length > 160 ? "text-amber-600 font-bold" : "text-gray-400"}`}>
                  {page.metaDesc.length}/160
                </span>
              </div>
              <textarea
                rows={3}
                value={page.metaDesc}
                onChange={(e) => handleUpdate("metaDesc", e.target.value)}
                className="w-full p-2.5 rounded-[5px] border border-gray-300 text-[12px] text-[#111111] leading-relaxed focus:outline-none focus:border-[#009691]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Focus Target Keyword
              </label>
              <input
                type="text"
                value={page.focusKeyword || ""}
                onChange={(e) => handleUpdate("focusKeyword", e.target.value)}
                placeholder="e.g. phone repair philadelphia"
                className="w-full h-[34px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] text-[#009691] font-semibold focus:outline-none focus:border-[#009691]"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Powers the live RankMath SEO checklist score.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Secondary Target Keywords (Comma separated)
              </label>
              <input
                type="text"
                value={(page.keywords || []).join(", ")}
                onChange={(e) =>
                  handleUpdate(
                    "keywords",
                    e.target.value
                      .split(",")
                      .map((k) => k.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="e.g. screen repair, battery fix, 19139"
                className="w-full h-[34px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] text-[#111111] focus:outline-none focus:border-[#009691]"
              />
            </div>

            {/* LIVE GOOGLE SERP PREVIEW BOX */}
            <div className="p-3 rounded-[6px] bg-[#f9fafb] border border-gray-200">
              <div className="text-[10px] text-gray-500 font-mono truncate">
                smartfonedoctor.com{page.path}
              </div>
              <div className="text-[14px] text-[#1a0dab] font-medium leading-snug line-clamp-1 hover:underline cursor-pointer mt-0.5">
                {page.title}
              </div>
              <div className="text-[11px] text-[#4d5156] leading-relaxed line-clamp-2 mt-1">
                {page.metaDesc}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

