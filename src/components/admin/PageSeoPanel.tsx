"use client";

import React, { useMemo } from "react";
import { Globe, Eye } from "lucide-react";
import type { CMSPage } from "@/lib/cmsData";
import type { PuckPageData } from "@/puck/types";
import RankMathSeoSuite from "@/components/admin/RankMathSeoSuite";

function extractPuckContentHtml(puckData?: PuckPageData): string {
  const blocks = puckData?.content;
  if (!Array.isArray(blocks) || blocks.length === 0) return "";

  const parts: string[] = [];
  for (const block of blocks) {
    const props = (block?.props || {}) as Record<string, unknown>;
    if (block.type === "HeadingBlock" && typeof props.text === "string" && props.text) {
      const tag = typeof props.tag === "string" ? props.tag : "h2";
      parts.push(`<${tag}>${props.text}</${tag}>`);
    }
    if (block.type === "ParagraphBlock" && typeof props.text === "string" && props.text) {
      parts.push(`<p>${props.text}</p>`);
    }
    if (typeof props.heading === "string" && props.heading) {
      const tag = block.type === "HeroBlock" ? "h1" : "h2";
      parts.push(`<${tag}>${props.heading}</${tag}>`);
    }
    if (typeof props.subheading === "string" && props.subheading) {
      parts.push(`<p>${props.subheading}</p>`);
    }
    if (typeof props.bodyHtml === "string" && props.bodyHtml) {
      parts.push(props.bodyHtml);
    }
    if (Array.isArray(props.items)) {
      for (const item of props.items) {
        if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          if (typeof rec.title === "string" && rec.title) {
            parts.push(`<h3>${rec.title}</h3>`);
          }
          if (typeof rec.description === "string" && rec.description) {
            parts.push(`<p>${rec.description}</p>`);
          }
        }
      }
    }
  }
  return parts.join("\n");
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
  const liveContentHtml = useMemo(() => {
    const fromPuck = extractPuckContentHtml(
      livePuckData || (page.puckData as unknown as PuckPageData | undefined)
    );
    return fromPuck || page.contentHtml || page.heroSubtitle || "";
  }, [livePuckData, page.puckData, page.contentHtml, page.heroSubtitle]);

  return (
    <div className={compact ? "flex flex-col gap-3" : "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"}>
      {/* RankMath Live SEO Analyzer */}
      <div className={compact ? "order-2" : "lg:col-span-7"}>
        <RankMathSeoSuite
          title={page.title}
          slug={page.slug}
          excerpt={page.metaDesc}
          contentHtml={liveContentHtml}
          focusKeyword={page.focusKeyword || ""}
          compact={compact}
          onKeywordChange={(kw) => onChangeField("focusKeyword", kw)}
        />
      </div>

      {/* Status + Google Search Listing */}
      <div className={compact ? "order-1 flex flex-col gap-3" : "lg:col-span-5 flex flex-col gap-4"}>
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
          <div className="flex items-center gap-1.5 pb-2 border-b border-[#f2f2f2]">
            <Globe className="w-3.5 h-3.5 text-[#009691]" />
            <h3 className="text-[12px] font-bold text-[#111111] uppercase tracking-wider">
              Google Search Listing
            </h3>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-gray-700">SEO Page Title</label>
              <span
                className={`text-[10px] font-mono ${
                  page.title.length > 60 ? "text-amber-600" : "text-gray-400"
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
                  page.metaDesc.length > 160 ? "text-amber-600" : "text-gray-400"
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
              placeholder="e.g. phone repair philadelphia"
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
