"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Globe,
  Eye,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Check,
  Trash2,
  Loader2,
} from "lucide-react";
import type { CMSPage } from "@/lib/cmsData";
import type { PuckPageData } from "@/puck/types";
import RankMathSeoSuite from "@/components/admin/RankMathSeoSuite";
import LivePageSeoCheck from "@/components/admin/LivePageSeoCheck";
import MediaModal, { type SelectedMediaPayload } from "@/components/admin/MediaModal";

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

type ContentSnapshot = {
  html: string;
  images: string[];
  words: number;
};

function countHtmlWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function extractHtmlFromRoot(root: Element | null): ContentSnapshot {
  if (!root) return { html: "", images: [], words: 0 };
  const clone = root.cloneNode(true) as Element;
  clone
    .querySelectorAll("script, style, noscript, [data-puck-overlay], [data-puck-action-bar], [data-builder-hide]")
    .forEach((n) => n.remove());

  const images: string[] = [];
  const seen = new Set<string>();
  clone.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src")?.trim();
    if (!src || src.includes("tile.openstreetmap.org") || src.startsWith("data:")) return;
    if (!seen.has(src)) {
      seen.add(src);
      images.push(src);
    }
  });

  const html = clone.innerHTML || "";
  const words = (clone.textContent || "").trim().split(/\s+/).filter(Boolean).length;
  return { html, images, words };
}

function readPuckCanvasSnapshot(): ContentSnapshot {
  if (typeof document === "undefined") return { html: "", images: [], words: 0 };
  const iframe = document.querySelector<HTMLIFrameElement>(
    'iframe#preview-frame, iframe[data-puck-preview]'
  );
  const iframeBody = iframe?.contentDocument?.body ?? null;
  if (iframeBody) {
    return extractHtmlFromRoot(iframeBody);
  }
  const inlinePreview = document.querySelector("[data-puck-preview]");
  return extractHtmlFromRoot(inlinePreview);
}

/**
 * Deeply walk Puck content tree (including nested zones) to extract all text, headings, links,
 * and image URLs for rich SEO analysis and image syncing.
 */
function extractPuckContentDetails(puckData?: PuckPageData): {
  html: string;
  images: string[];
} {
  const topBlocks = Array.isArray(puckData?.content) ? puckData.content : [];
  const zoneBlocks = puckData?.zones
    ? Object.values(puckData.zones).flatMap((z) => (Array.isArray(z) ? z : []))
    : [];
  const blocks = [...topBlocks, ...zoneBlocks];
  if (blocks.length === 0) {
    return { html: "", images: [] };
  }

  const parts: string[] = [];
  const images = new Set<string>();

  const isImageUrl = (val: unknown): val is string => {
    if (typeof val !== "string") return false;
    const v = val.trim();
    return (
      (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/") || v.startsWith("./")) &&
      /\.(jpg|jpeg|png|webp|avif|svg)(\?.*)?$/i.test(v)
    );
  };

  const walkProps = (props: Record<string, unknown>, blockType?: string) => {
    if (!props || typeof props !== "object") return;

    // Headings & Text
    if (typeof props.heading === "string" && props.heading) {
      const tag = blockType === "HeroBlock" ? "h1" : "h2";
      parts.push(`<${tag}>${props.heading}</${tag}>`);
    }
    if (typeof props.headline === "string" && props.headline) {
      parts.push(`<h2>${props.headline}</h2>`);
    }
    if (typeof props.title === "string" && props.title) {
      const tag = blockType === "HeroBlock" ? "h1" : "h2";
      parts.push(`<${tag}>${props.title}</${tag}>`);
    }
    if (typeof props.subheading === "string" && props.subheading) {
      parts.push(`<p>${props.subheading}</p>`);
    }
    if (typeof props.subtitle === "string" && props.subtitle) {
      parts.push(`<p>${props.subtitle}</p>`);
    }
    if (typeof props.text === "string" && props.text) {
      const tag =
        blockType === "HeadingBlock" ? (typeof props.tag === "string" ? props.tag : "h2") : "p";
      parts.push(`<${tag}>${props.text}</${tag}>`);
    }
    if (typeof props.body === "string" && props.body) {
      parts.push(`<p>${props.body}</p>`);
    }
    if (typeof props.content === "string" && props.content) {
      parts.push(props.content);
    }
    if (typeof props.badgeText === "string" && props.badgeText) {
      parts.push(`<span>${props.badgeText}</span>`);
    }
    if (typeof props.bodyHtml === "string" && props.bodyHtml) {
      parts.push(props.bodyHtml);
    }
    if (typeof props.html === "string" && props.html) {
      parts.push(props.html);
    }

    // CTA links & buttons
    if (typeof props.ctaLink === "string" && props.ctaLink) {
      const label = typeof props.ctaText === "string" ? props.ctaText : "Click Here";
      parts.push(`<a href="${props.ctaLink}">${label}</a>`);
    }
    if (typeof props.ctaHref === "string" && props.ctaHref) {
      const label = typeof props.ctaText === "string" ? props.ctaText : "Click Here";
      parts.push(`<a href="${props.ctaHref}">${label}</a>`);
    }
    if (typeof props.buttonLink === "string" && props.buttonLink) {
      const label = typeof props.buttonText === "string" ? props.buttonText : "Learn More";
      parts.push(`<a href="${props.buttonLink}">${label}</a>`);
    }
    if (typeof props.buttonHref === "string" && props.buttonHref) {
      const label = typeof props.buttonText === "string" ? props.buttonText : "Learn More";
      parts.push(`<a href="${props.buttonHref}">${label}</a>`);
    }
    if (typeof props.href === "string" && props.href) {
      const label = typeof props.label === "string" ? props.label : "Link";
      parts.push(`<a href="${props.href}">${label}</a>`);
    }
    if (typeof props.link === "string" && props.link) {
      parts.push(`<a href="${props.link}">Link</a>`);
    }

    // Images
    if (typeof props.src === "string" && isImageUrl(props.src)) {
      images.add(props.src);
      const alt = typeof props.alt === "string" ? props.alt : "SmartFoneDoctor Philadelphia";
      parts.push(`<img src="${props.src}" alt="${alt}" />`);
    }
    if (typeof props.image === "string" && isImageUrl(props.image)) {
      images.add(props.image);
      parts.push(`<img src="${props.image}" alt="Repair service" />`);
    }
    if (typeof props.bgImage === "string" && isImageUrl(props.bgImage)) {
      images.add(props.bgImage);
      parts.push(`<img src="${props.bgImage}" alt="Background image" />`);
    }

    // Nested arrays (items, steps, features, tabs, cards, faqs, etc.)
    for (const key of Object.keys(props)) {
      const val = props[key];
      if (Array.isArray(val)) {
        for (const item of val) {
          if (item && typeof item === "object") {
            const itemRec = item as Record<string, unknown>;
            if (typeof itemRec.title === "string" && itemRec.title) {
              parts.push(`<h3>${itemRec.title}</h3>`);
            }
            if (typeof itemRec.heading === "string" && itemRec.heading) {
              parts.push(`<h3>${itemRec.heading}</h3>`);
            }
            if (typeof itemRec.question === "string" && itemRec.question) {
              parts.push(`<h3>${itemRec.question}</h3>`);
            }
            if (typeof itemRec.name === "string" && itemRec.name) {
              parts.push(`<h4>${itemRec.name}</h4>`);
            }
            if (typeof itemRec.description === "string" && itemRec.description) {
              parts.push(`<p>${itemRec.description}</p>`);
            }
            if (typeof itemRec.answer === "string" && itemRec.answer) {
              parts.push(`<p>${itemRec.answer}</p>`);
            }
            if (typeof itemRec.quote === "string" && itemRec.quote) {
              parts.push(`<blockquote>${itemRec.quote}</blockquote>`);
            }
            if (typeof itemRec.subtext === "string" && itemRec.subtext) {
              parts.push(`<p>${itemRec.subtext}</p>`);
            }
            if (typeof itemRec.badge === "string" && itemRec.badge) {
              parts.push(`<span>${itemRec.badge}</span>`);
            }
            if (typeof itemRec.image === "string" && isImageUrl(itemRec.image)) {
              images.add(itemRec.image);
              parts.push(`<img src="${itemRec.image}" alt="${itemRec.title || "Image"}" />`);
            }
            if (typeof itemRec.avatar === "string" && isImageUrl(itemRec.avatar)) {
              images.add(itemRec.avatar);
              parts.push(`<img src="${itemRec.avatar}" alt="Avatar" />`);
            }
            if (typeof itemRec.link === "string" && itemRec.link) {
              parts.push(`<a href="${itemRec.link}">${itemRec.title || "Link"}</a>`);
            }
            if (typeof itemRec.href === "string" && itemRec.href) {
              parts.push(`<a href="${itemRec.href}">${itemRec.title || "Link"}</a>`);
            }
            if (typeof itemRec.url === "string" && itemRec.url) {
              parts.push(`<a href="${itemRec.url}">Link</a>`);
            }
          }
        }
      }
    }
  };

  for (const block of blocks) {
    const props = (block?.props || {}) as Record<string, unknown>;
    walkProps(props, block.type);
  }

  return {
    html: parts.join("\n"),
    images: Array.from(images),
  };
}

export default function PageSeoPanel({
  page,
  livePuckData,
  onChangeField,
  compact = false,
}: {
  page: CMSPage;
  livePuckData?: PuckPageData;
  onChangeField: (field: keyof CMSPage, value: unknown) => void;
  compact?: boolean;
}) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [seoAiNotice, setSeoAiNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [canvasSnapshot, setCanvasSnapshot] = useState<ContentSnapshot>({
    html: "",
    images: [],
    words: 0,
  });
  const [fetchedSnapshot, setFetchedSnapshot] = useState<ContentSnapshot>({
    html: "",
    images: [],
    words: 0,
  });

  // Extract fallback HTML and images from Puck editor state
  const extracted = useMemo(() => {
    return extractPuckContentDetails(
      livePuckData || (page.puckData as unknown as PuckPageData | undefined)
    );
  }, [livePuckData, page.puckData]);

  // Live DOM snapshot from Puck preview iframe (captures coded SiteSectionBlock + nested zones)
  useEffect(() => {
    const updateFromCanvas = () => {
      const snap = readPuckCanvasSnapshot();
      if (snap.words > 0) {
        setCanvasSnapshot(snap);
      }
    };
    const fast = window.setTimeout(updateFromCanvas, 300);
    const settled = window.setTimeout(updateFromCanvas, 900);
    return () => {
      window.clearTimeout(fast);
      window.clearTimeout(settled);
    };
  }, [livePuckData, page.slug]);

  // Live SSR page HTML snapshot when editing in PageSeoPanel (or before Puck canvas mounts)
  useEffect(() => {
    if (page.category === "Template" || !page.path) return;
    let alive = true;
    const url = page.status === "Published" ? page.path : `/preview/${page.slug}`;
    fetch(url, { cache: "no-store" })
      .then((res) => (res.ok ? res.text() : ""))
      .then((raw) => {
        if (!alive || !raw) return;
        const doc = new DOMParser().parseFromString(raw, "text/html");
        const snap = extractHtmlFromRoot(doc.querySelector("main") ?? doc.body);
        if (snap.words > 0) {
          setFetchedSnapshot(snap);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [page.category, page.path, page.slug, page.status, page.lastEdited]);

  const { liveContentHtml, resolvedImages } = useMemo(() => {
    const fallbackHtml = extracted.html || page.contentHtml || page.heroSubtitle || "";
    const fallbackWords = countHtmlWords(fallbackHtml);

    let html = fallbackHtml;
    let snapImages: string[] = [];

    if (canvasSnapshot.words >= 40) {
      html = canvasSnapshot.html;
      snapImages = canvasSnapshot.images;
    } else if (fetchedSnapshot.words > fallbackWords) {
      html = fetchedSnapshot.html;
      snapImages = fetchedSnapshot.images;
    }

    return {
      liveContentHtml: html,
      resolvedImages: Array.from(new Set([...snapImages, ...extracted.images])),
    };
  }, [canvasSnapshot, fetchedSnapshot, extracted.html, extracted.images, page.contentHtml, page.heroSubtitle]);

  const handleAiAutoFillSeo = async () => {
    if (isGeneratingSeo) return;
    setIsGeneratingSeo(true);
    setSeoAiNotice(null);
    try {
      const res = await fetch("/api/admin/seo-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageType: "page",
          path: page.path,
          name: page.name,
          currentTitle: page.title,
          currentDescription: page.metaDesc,
          currentFocusKeyword: page.focusKeyword,
          contentText: liveContentHtml,
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        seo?: {
          focusKeyword: string;
          title: string;
          metaDesc: string;
          keywords: string[];
          schemaType: string;
        };
        model?: string;
        error?: string;
      };
      if (!res.ok || !json.seo) {
        setSeoAiNotice({ tone: "err", text: json.error || "AI SEO generation failed." });
        return;
      }
      onChangeField("focusKeyword", json.seo.focusKeyword);
      onChangeField("title", json.seo.title);
      onChangeField("metaDesc", json.seo.metaDesc);
      onChangeField("keywords", json.seo.keywords);
      if (json.seo.schemaType) {
        onChangeField("schemaType", json.seo.schemaType);
      }
      setSeoAiNotice({
        tone: "ok",
        text: `Auto-filled via ${json.model || "AI"} — click Save/Publish to apply.`,
      });
    } catch {
      setSeoAiNotice({ tone: "err", text: "Network error contacting AI SEO endpoint." });
    } finally {
      setIsGeneratingSeo(false);
    }
  };

  // Direct file upload handler
  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", page.title || "SmartFoneDoctor Philadelphia");
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (data.success && data.item?.url) {
          onChangeField("featuredImage", data.item.url);
        }
      }
    } catch (err) {
      console.error("Direct upload failed:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={
        compact ? "flex flex-col gap-3" : "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
      }
    >
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
          onChangeField("featuredImage", payload.url);
          setIsMediaModalOpen(false);
        }}
        title="Select Featured & Social Share Card Image"
        selectButtonText="Set as Social Thumbnail"
        initialSelectedUrl={page.featuredImage}
      />

      {/* RankMath Live SEO Analyzer */}
      <div className={compact ? "order-2" : "lg:col-span-7"}>
        <div className="mb-3 bg-white border border-[#e8e8e8] rounded-[10px] p-3.5 shadow-2xs flex flex-col gap-2">
          <h3 className="text-[12px] font-bold text-[#111111] uppercase tracking-wider">Live page check</h3>
          <LivePageSeoCheck
            path={page.path}
            slug={page.slug}
            isPublished={page.status === "Published"}
            isTemplate={page.category === "Template"}
            focusKeyword={page.focusKeyword}
          />
        </div>
        <RankMathSeoSuite
          title={page.title}
          slug={page.slug}
          excerpt={page.metaDesc}
          contentHtml={liveContentHtml}
          focusKeyword={page.focusKeyword || ""}
          featuredImage={page.featuredImage}
          canonicalUrl={page.canonicalUrl || `https://smartfonedoctor.com${page.path}`}
          schemaType={page.schemaType}
          pageImages={resolvedImages}
          compact={compact}
          onKeywordChange={(kw) => onChangeField("focusKeyword", kw)}
          onSchemaChange={(schema) => onChangeField("schemaType", schema)}
          onFeaturedImageChange={(url) => onChangeField("featuredImage", url)}
        />
      </div>

      {/* Status + Google Search Listing & Media Studio */}
      <div
        className={compact ? "order-1 flex flex-col gap-3" : "lg:col-span-5 flex flex-col gap-4"}
      >
        {/* Status & Visibility */}
        <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-3.5 shadow-2xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#f2f2f2]">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#009691]" />
              <h3 className="text-[12px] font-bold text-[#111111] uppercase tracking-wider">
                Status &amp; Publishing
              </h3>
            </div>
            <span className="text-[10px] text-gray-400">{page.lastEdited}</span>
          </div>

          <div className="flex items-center justify-between gap-2 text-[12px]">
            <span className="text-gray-600 font-medium">Visibility</span>
            <select
              value={page.status}
              onChange={(e) => onChangeField("status", e.target.value)}
              className="h-[30px] px-2 rounded-[5px] border border-gray-300 bg-white text-[12px] font-medium text-[#111111] focus:outline-none focus:border-[#009691]"
            >
              <option value="Published">Published (Public)</option>
              <option value="Draft">Draft (Hidden)</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-2 text-[12px]">
            <span className="text-gray-600 font-medium">URL Path</span>
            <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-700 truncate">
              {page.path}
            </span>
          </div>
        </div>

        {/* Google Search Listing */}
        <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-3.5 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#f2f2f2]">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#009691]" />
              <h3 className="text-[12px] font-bold text-[#111111] uppercase tracking-wider">
                Google Search Listing
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAiAutoFillSeo}
              disabled={isGeneratingSeo}
              className="h-[26px] px-2.5 rounded-[5px] bg-[#009691] hover:bg-[#007f7b] disabled:opacity-60 text-white text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
              title="Generate Focus Keyword, Title, Meta Description, Keywords & Schema with AI"
            >
              {isGeneratingSeo ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              <span>{isGeneratingSeo ? "Generating..." : "AI Auto-Fill"}</span>
            </button>
          </div>

          {seoAiNotice && (
            <div
              className={`rounded-[5px] px-2.5 py-1.5 text-[11px] font-medium border ${
                seoAiNotice.tone === "ok"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {seoAiNotice.text}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-gray-700">SEO Page Title</label>
              <span
                className={`text-[10px] font-mono ${
                  page.title.length > 60 ? "text-amber-600 font-bold" : "text-gray-400"
                }`}
              >
                {page.title.length}/60
              </span>
            </div>
            <input
              type="text"
              value={page.title}
              onChange={(e) => onChangeField("title", e.target.value)}
              className="w-full h-[32px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] text-[#111111] focus:outline-none focus:border-[#009691]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-gray-700">Meta Description</label>
              <span
                className={`text-[10px] font-mono ${
                  page.metaDesc.length > 160 ? "text-amber-600 font-bold" : "text-gray-400"
                }`}
              >
                {page.metaDesc.length}/160
              </span>
            </div>
            <textarea
              rows={3}
              value={page.metaDesc}
              onChange={(e) => onChangeField("metaDesc", e.target.value)}
              className="w-full p-2 rounded-[5px] border border-gray-300 text-[12px] text-[#111111] leading-relaxed focus:outline-none focus:border-[#009691]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              Focus Target Keyword
            </label>
            <input
              type="text"
              value={page.focusKeyword || ""}
              onChange={(e) => onChangeField("focusKeyword", e.target.value)}
              placeholder="e.g. About SmartFoneDoctor Philadelphia"
              className="w-full h-[32px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] text-[#009691] font-semibold focus:outline-none focus:border-[#009691]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              Secondary Keywords (Comma separated)
            </label>
            <input
              type="text"
              value={(page.keywords || []).join(", ")}
              onChange={(e) =>
                onChangeField(
                  "keywords",
                  e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean)
                )
              }
              placeholder="e.g. screen repair, battery fix, 19139"
              className="w-full h-[32px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] text-[#111111] focus:outline-none focus:border-[#009691]"
            />
          </div>

          {/* ── FEATURED & SOCIAL SHARE CARD IMAGE STUDIO ── */}
          <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#009691]" />
                <span>Featured / Social Share Image</span>
              </label>
              <span className="text-[10px] text-gray-400 font-mono">1200×630</span>
            </div>

            {/* Thumbnail Preview Card */}
            <div className="relative rounded-lg border border-gray-300 overflow-hidden bg-gray-900 aspect-[1.91/1] max-h-44 group">
              {page.featuredImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={page.featuredImage}
                    alt="Social card preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMediaModalOpen(true)}
                      className="px-2.5 py-1 rounded bg-white text-gray-900 text-[11px] font-semibold shadow hover:bg-gray-50 cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeField("featuredImage", "")}
                      className="px-2 py-1 rounded bg-red-600 text-white text-[11px] font-semibold shadow hover:bg-red-700 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div
                  onClick={() => setIsMediaModalOpen(true)}
                  className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1.5 cursor-pointer hover:bg-gray-800 transition"
                >
                  <ImageIcon className="w-7 h-7 opacity-40" />
                  <span className="font-medium text-[11px]">No Thumbnail Selected</span>
                  <span className="text-[10px] text-gray-500">
                    Click to pick from Media Library or upload
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="flex-1 h-[30px] px-2 rounded-[5px] border border-gray-300 bg-white hover:bg-gray-50 text-[11px] font-semibold text-gray-700 inline-flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#009691]" />
                <span>Media Library</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 h-[30px] px-2 rounded-[5px] bg-[#009691] hover:bg-[#007f7b] text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{isUploading ? "Uploading..." : "Upload File"}</span>
              </button>

              {extracted.images.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChangeField("featuredImage", extracted.images[0])}
                  className="h-[30px] px-2.5 rounded-[5px] border border-teal-200 bg-teal-50 hover:bg-teal-100 text-[#009691] text-[11px] font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                  title="Copy hero / page image to social thumbnail"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sync Hero</span>
                </button>
              )}
            </div>

            {/* Detected Page Images Quick-Pick */}
            {extracted.images.length > 0 && (
              <div className="p-2 rounded-md bg-gray-50 border border-gray-200 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Images on this Page (Click to select):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {extracted.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onChangeField("featuredImage", imgUrl)}
                      className={`relative w-11 h-10 rounded border overflow-hidden shrink-0 transition-all cursor-pointer ${
                        page.featuredImage === imgUrl
                          ? "border-[#009691] ring-2 ring-[#009691]/30"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      title="Set as social card thumbnail"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt="Detected" className="w-full h-full object-cover" />
                      {page.featuredImage === imgUrl && (
                        <div className="absolute inset-0 bg-[#009691]/40 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Repair Presets */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Quick Shop Presets:
              </span>
              <div className="grid grid-cols-2 gap-1">
                {PRESET_REPAIR_IMAGES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => onChangeField("featuredImage", preset.url)}
                    className={`px-2 py-1 rounded text-left text-[11px] font-medium border transition cursor-pointer truncate ${
                      page.featuredImage === preset.url
                        ? "border-[#009691] bg-teal-50 text-[#009691] font-bold"
                        : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                    }`}
                    title={preset.desc}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Image URL */}
            <div>
              <label className="block text-[10px] text-gray-500 font-medium mb-1">
                Image URL (OpenGraph / Twitter)
              </label>
              <input
                type="text"
                value={page.featuredImage || ""}
                onChange={(e) => onChangeField("featuredImage", e.target.value)}
                placeholder="https://... or /uploads/..."
                className="w-full h-[30px] px-2.5 rounded-[5px] border border-gray-300 text-[11px] font-mono text-gray-700 focus:outline-none focus:border-[#009691]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">
              Canonical URL (Optional override)
            </label>
            <input
              type="text"
              value={page.canonicalUrl || ""}
              onChange={(e) => onChangeField("canonicalUrl", e.target.value)}
              placeholder={`https://smartfonedoctor.com${page.path}`}
              className="w-full h-[32px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] text-[#111111] focus:outline-none focus:border-[#009691]"
            />
          </div>

          {/* Live Google SERP Preview */}
          <div className="p-2.5 rounded-[6px] bg-[#f9fafb] border border-gray-200">
            <div className="text-[10px] text-gray-500 font-mono truncate">
              smartfonedoctor.com{page.path}
            </div>
            <div className="text-[13px] text-[#1a0dab] font-medium leading-snug line-clamp-1 mt-0.5">
              {page.title}
            </div>
            <div className="text-[11px] text-[#4d5156] leading-relaxed line-clamp-2 mt-1">
              {page.metaDesc}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
