"use client";

import { useMemo, useState } from "react";
import { Globe, RotateCcw, Sparkles } from "lucide-react";
import LivePageSeoCheck from "@/components/admin/LivePageSeoCheck";
import RankMathSeoSuite from "@/components/admin/RankMathSeoSuite";
import { areaCls, inputCls } from "./CatalogShell";

export interface CatalogSeoValue {
  title?: string;
  description?: string;
  focusKeyword?: string;
  keywords?: string[];
  canonicalUrl?: string;
  schemaType?: string;
}

export interface CatalogSeoDefaults {
  title: string;
  description: string;
  focusKeyword: string;
  keywords: string[];
  canonicalUrl: string;
  schemaType?: string;
}

export interface CatalogSeoResolvedPreview {
  title: string;
  description: string;
  focusKeyword: string;
  canonicalUrl: string;
  sampleLabel?: string;
}

export interface CatalogSeoEditorProps {
  value: CatalogSeoValue;
  defaults: CatalogSeoDefaults;
  resolvedPreview?: CatalogSeoResolvedPreview;
  templateTokens?: { token: string; label: string }[];
  contentHtml: string;
  livePath: string | null;
  /** Path without leading slash, matching RankMathSeoSuite SERP preview. */
  urlSlug: string;
  featuredImage?: string;
  onFeaturedImageChange?: (url: string) => void;
  onChange: (next: CatalogSeoValue) => void;
  allowResetToAuto?: boolean;
  heading?: string;
}

function pillTone(len: number, minGood: number, maxGood: number, minWarn = 1, maxWarn = maxGood + 15) {
  if (len >= minGood && len <= maxGood) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (len >= minWarn && len <= maxWarn) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-red-50 text-red-700 border-red-200";
}

/**
 * Unified RankMath-style SEO editor, SERP snippet preview, content checker,
 * and live rendered page audit for Common Issues, Device Models, and Repair Types.
 */
export default function CatalogSeoEditor({
  value,
  defaults,
  resolvedPreview,
  templateTokens,
  contentHtml,
  livePath,
  urlSlug,
  featuredImage,
  onFeaturedImageChange,
  onChange,
  allowResetToAuto = false,
  heading = "SEO, Meta Tags & Live Content Checker",
}: CatalogSeoEditorProps) {
  const [keywordsText, setKeywordsText] = useState(() => (value.keywords ?? []).join(", "));

  const effectiveTitle = (resolvedPreview?.title ?? (value.title?.trim() || defaults.title)).trim();
  const effectiveDescription = (
    resolvedPreview?.description ?? (value.description?.trim() || defaults.description)
  ).trim();
  const effectiveFocusKeyword = (
    resolvedPreview?.focusKeyword ?? (value.focusKeyword?.trim() || defaults.focusKeyword)
  ).trim();
  const effectiveCanonical = (
    resolvedPreview?.canonicalUrl ?? (value.canonicalUrl?.trim() || defaults.canonicalUrl)
  ).trim();
  const effectiveSchema = value.schemaType?.trim() || defaults.schemaType || "TechArticle";

  const wordCount = useMemo(() => {
    const plain = contentHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  }, [contentHtml]);

  const hasCustomOverrides = Boolean(
    value.title?.trim() ||
      value.description?.trim() ||
      value.focusKeyword?.trim() ||
      (value.keywords && value.keywords.length > 0) ||
      value.canonicalUrl?.trim() ||
      value.schemaType?.trim()
  );

  const fullCanonicalUrl = effectiveCanonical.startsWith("http")
    ? effectiveCanonical
    : `https://smartfonedoctor.com${effectiveCanonical.startsWith("/") ? effectiveCanonical : `/${effectiveCanonical}`}`;

  const handleResetToAuto = () => {
    setKeywordsText("");
    onChange({});
  };

  return (
    <div className="sm:col-span-2 rounded-[8px] border border-[#d1d5db] bg-white overflow-hidden">
      {/* Header Bar */}
      <div className="px-3.5 py-2.5 bg-gray-50 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Globe className="w-4 h-4 text-sfd-teal shrink-0" />
          <span className="text-[12.5px] font-bold text-gray-900">{heading}</span>
          <span
            className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${
              hasCustomOverrides
                ? "bg-teal-50 text-sfd-teal border border-teal-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            {hasCustomOverrides ? "Custom" : "Auto pSEO"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded border text-[10.5px] font-semibold ${pillTone(
              effectiveTitle.length,
              30,
              60,
              1,
              65
            )}`}
          >
            Title {effectiveTitle.length}/60
          </span>
          <span
            className={`px-2 py-0.5 rounded border text-[10.5px] font-semibold ${pillTone(
              effectiveDescription.length,
              120,
              160,
              60,
              175
            )}`}
          >
            Meta {effectiveDescription.length}/160
          </span>
          <span
            className={`px-2 py-0.5 rounded border text-[10.5px] font-semibold ${
              wordCount >= 500
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : wordCount >= 250
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {wordCount} words
          </span>

          {allowResetToAuto && hasCustomOverrides && (
            <button
              type="button"
              onClick={handleResetToAuto}
              className="ml-1 px-2 py-0.5 rounded border border-gray-300 bg-white hover:bg-gray-100 text-[11px] font-semibold text-gray-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset to Auto
            </button>
          )}
        </div>
      </div>

      <div className="p-3.5 space-y-4">
        {/* Optional pSEO Template Tokens Bar */}
        {templateTokens && templateTokens.length > 0 && (
          <div className="rounded-[6px] border border-teal-100 bg-teal-50/40 p-2.5 space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="font-semibold text-teal-900 inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-sfd-teal" />
                Dynamic pSEO Tokens (click to append to SEO title)
              </span>
              {resolvedPreview?.sampleLabel && (
                <span className="text-gray-600 font-medium">
                  Previewing with: <strong className="text-gray-900">{resolvedPreview.sampleLabel}</strong>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {templateTokens.map((tok) => (
                <button
                  key={tok.token}
                  type="button"
                  onClick={() => {
                    const currentTitle = value.title ?? "";
                    const nextTitle = currentTitle
                      ? `${currentTitle.trimEnd()} ${tok.token}`
                      : tok.token;
                    onChange({ ...value, title: nextTitle });
                  }}
                  title={`Insert ${tok.label}`}
                  className="px-2 py-0.5 rounded bg-white border border-teal-200 hover:border-sfd-teal text-[11px] font-mono text-teal-800 cursor-pointer"
                >
                  {tok.token}
                </button>
              ))}
            </div>
            <p className="text-[10.5px] text-gray-500">
              Leave fields blank to use automatic smart pSEO titles, descriptions, and keywords for each device.
            </p>
          </div>
        )}

        {/* SEO Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[12px] font-semibold text-gray-700">
                Focus Target Keyword
              </label>
              {!value.focusKeyword?.trim() && defaults.focusKeyword && (
                <button
                  type="button"
                  onClick={() => onChange({ ...value, focusKeyword: defaults.focusKeyword })}
                  className="text-[11px] font-semibold text-sfd-teal hover:underline cursor-pointer"
                >
                  Use suggested
                </button>
              )}
            </div>
            <input
              value={value.focusKeyword ?? ""}
              onChange={(e) => onChange({ ...value, focusKeyword: e.target.value })}
              placeholder={defaults.focusKeyword || "e.g. Charging Port Replacement"}
              className={`${inputCls} font-semibold text-sfd-teal`}
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[12px] font-semibold text-gray-700">
                SEO Meta Title
              </label>
              <span
                className={`text-[10.5px] font-mono ${
                  effectiveTitle.length > 60 ? "text-amber-600 font-bold" : "text-gray-400"
                }`}
              >
                {effectiveTitle.length}/60
              </span>
            </div>
            <input
              value={value.title ?? ""}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              placeholder={defaults.title}
              className={inputCls}
            />
            {resolvedPreview && value.title?.trim() && resolvedPreview.title !== value.title.trim() && (
              <span className="text-[11px] text-gray-500">
                Resolved ({resolvedPreview.sampleLabel ?? "sample"}):{" "}
                <span className="font-medium text-gray-800">{resolvedPreview.title}</span>
              </span>
            )}
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[12px] font-semibold text-gray-700">
                SEO Meta Description
              </label>
              <span
                className={`text-[10.5px] font-mono ${
                  effectiveDescription.length > 160 ? "text-amber-600 font-bold" : "text-gray-400"
                }`}
              >
                {effectiveDescription.length}/160
              </span>
            </div>
            <textarea
              rows={2}
              value={value.description ?? ""}
              onChange={(e) => onChange({ ...value, description: e.target.value })}
              placeholder={defaults.description}
              className={areaCls}
            />
            {resolvedPreview &&
              value.description?.trim() &&
              resolvedPreview.description !== value.description.trim() && (
                <span className="text-[11px] text-gray-500">
                  Resolved ({resolvedPreview.sampleLabel ?? "sample"}):{" "}
                  <span className="font-medium text-gray-800">{resolvedPreview.description}</span>
                </span>
              )}
          </div>

          <label className="flex flex-col gap-1 text-[12px] font-semibold text-gray-700">
            Secondary Keywords (comma separated)
            <input
              value={keywordsText}
              onChange={(e) => {
                const raw = e.target.value;
                setKeywordsText(raw);
                onChange({
                  ...value,
                  keywords: raw
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                });
              }}
              placeholder={defaults.keywords.join(", ") || "iphone repair, philadelphia"}
              className={inputCls}
            />
          </label>

          <label className="flex flex-col gap-1 text-[12px] font-semibold text-gray-700">
            Canonical URL (optional)
            <input
              value={value.canonicalUrl ?? ""}
              onChange={(e) => onChange({ ...value, canonicalUrl: e.target.value })}
              placeholder={defaults.canonicalUrl}
              className={`${inputCls} font-mono text-[12px]`}
            />
          </label>
        </div>

        {/* Live Rendered Page Audit (same as Pages editor) */}
        {livePath && (
          <div className="rounded-[8px] border border-[#e5e7eb] bg-gray-50/40 p-3 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">
              Live Page HTML Check ({livePath})
            </span>
            <LivePageSeoCheck
              key={livePath}
              path={livePath}
              slug={urlSlug}
              isPublished={true}
              isTemplate={false}
              focusKeyword={effectiveFocusKeyword}
            />
          </div>
        )}

        {/* RankMath Live Content SEO Analyzer + SERP / Social / Schema */}
        <RankMathSeoSuite
          title={effectiveTitle}
          slug={urlSlug}
          excerpt={effectiveDescription}
          contentHtml={contentHtml}
          focusKeyword={effectiveFocusKeyword}
          featuredImage={featuredImage}
          canonicalUrl={fullCanonicalUrl}
          schemaType={effectiveSchema}
          compact={true}
          onKeywordChange={(kw) => onChange({ ...value, focusKeyword: kw })}
          onSchemaChange={(st) => onChange({ ...value, schemaType: st })}
          onFeaturedImageChange={onFeaturedImageChange}
        />
      </div>
    </div>
  );
}
