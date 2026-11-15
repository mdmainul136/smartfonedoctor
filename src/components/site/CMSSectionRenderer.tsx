"use client";

import "@/plugins/repair-shop/builderHost";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Render } from "@puckeditor/core";
import { puckConfig } from "@/puck/config";
import { withStyleEngine } from "@/puck/style";
import type { PuckPageData } from "@/puck/types";
import {
  CMSPage,
  PageSection,
  PageSectionItem,
  PageSectionStyle,
  PageSectionStyleBase,
  HeroStyleBase,
  HeroStyle,
  getStoredCMSPages,
  INITIAL_CMS_PAGES,
} from "@/lib/cmsData";
import { scopeCustomCss } from "@/lib/cmsCustomCss";
import {
  Shield,
  Clock,
  Zap,
  Wrench,
  Sparkles,
  Star,
  CheckCircle2,
  Check,
  ChevronDown,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

import { RenderItemIcon } from "@/puck/components/shared";

export interface CMSSectionRendererProps {
  slug: string;
  initialPage?: CMSPage | null;
  children?: React.ReactNode;
  defaultChildren?: React.ReactNode;
  fallbackHero?: React.ReactNode;
}

/**
 * Builds per-device override CSS (tablet / mobile) for a section, following the
 * file's scoped-<style> media-query convention. Only overridden properties are
 * emitted; all declarations use !important to beat the inline base styles.
 */
function buildSectionResponsiveCss(sec: PageSection): string {
  const resp = sec.style?.responsive;
  if (!resp?.tablet && !resp?.mobile) return "";
  const sel = `#sfd-section-${sec.id}`;

  const sectionDecls = (o?: Partial<PageSectionStyleBase>): string => {
    if (!o) return "";
    const d: string[] = [];
    if (o.bgColor) d.push(`background-color: ${o.bgColor} !important;`);
    if (o.textColor) d.push(`color: ${o.textColor} !important;`);
    if (o.padding) d.push(`padding: ${o.padding} !important;`);
    if (o.align) d.push(`text-align: ${o.align} !important;`);
    return d.join(" ");
  };

  const containerDecls = (o?: Partial<PageSectionStyleBase>): string => {
    if (!o) return "";
    const d: string[] = [];
    if (o.gap) d.push(`gap: ${o.gap} !important;`);
    if (o.gridTemplateColumns) {
      d.push(`grid-template-columns: ${o.gridTemplateColumns} !important;`);
    } else if (o.gridColumns) {
      d.push(`grid-template-columns: repeat(${o.gridColumns}, minmax(0, 1fr)) !important;`);
    }
    if (o.flexDirection) d.push(`flex-direction: ${o.flexDirection} !important;`);
    if (o.flexWrap) d.push(`flex-wrap: ${o.flexWrap} !important;`);
    if (o.justifyContent) d.push(`justify-content: ${o.justifyContent} !important;`);
    if (o.alignItems) d.push(`align-items: ${o.alignItems} !important;`);
    return d.join(" ");
  };

  const cardDecls = (o?: Partial<PageSectionStyleBase>): string => {
    if (!o) return "";
    const d: string[] = [];
    if (o.cardBgColor) d.push(`background-color: ${o.cardBgColor} !important;`);
    if (o.cardBorderColor) d.push(`border-color: ${o.cardBorderColor} !important;`);
    if (o.borderRadius) d.push(`border-radius: ${o.borderRadius} !important;`);
    return d.join(" ");
  };

  const block = (o?: Partial<PageSectionStyleBase>): string => {
    if (!o) return "";
    let out = "";
    const s = sectionDecls(o);
    if (s) out += `${sel} { ${s} }\n`;
    const c = containerDecls(o);
    if (c) out += `${sel} .sfd-dynamic-grid, ${sel} .sfd-dynamic-flex { ${c} }\n`;
    const k = cardDecls(o);
    if (k) out += `${sel} [id^="sfd-item-"] { ${k} }\n`;
    return out;
  };

  const tabletCss = block(resp.tablet);
  const mobileCss = block(resp.mobile);
  let css = "";
  if (tabletCss) css += `@media (max-width: 1024px) {\n${tabletCss}}\n`;
  // Emitted after tablet so mobile wins when both match (desktop -> tablet -> mobile cascade).
  if (mobileCss) css += `@media (max-width: 640px) {\n${mobileCss}}\n`;
  return css;
}

function buildHeroResponsiveCss(heroStyle: HeroStyle): string {
  const resp = heroStyle.responsive;
  if (!resp?.tablet && !resp?.mobile) return "";
  const sel = "#sfd-section-hero";
  const decls = (o?: Partial<HeroStyleBase>): string => {
    if (!o) return "";
    const d: string[] = [];
    if (o.bgColor) d.push(`background-color: ${o.bgColor} !important;`);
    if (o.textColor) d.push(`color: ${o.textColor} !important;`);
    if (o.padding) d.push(`padding: ${o.padding} !important;`);
    if (o.align) d.push(`text-align: ${o.align} !important;`);
    if (o.accentColor) d.push(`--sfd-accent: ${o.accentColor};`);
    return d.join(" ");
  };
  let css = "";
  const t = decls(resp.tablet);
  if (t) css += `@media (max-width: 1024px) {\n${sel} { ${t} }\n}\n`;
  const m = decls(resp.mobile);
  if (m) css += `@media (max-width: 640px) {\n${sel} { ${m} }\n}\n`;
  return css;
}

function CMSFaqAccordionItem({
  item,
  st,
  sec,
}: {
  item: PageSectionItem;
  st: PageSectionStyle;
  sec: PageSection;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: st.cardBgColor || "#ffffff",
    borderColor: st.cardBorderColor || "#e5e7eb",
    borderRadius: st.borderRadius || "10px",
  };

  const isFlex = sec.style?.displayLayout === "flex";
  if (isFlex) {
    cardStyle.flex = "1 1 280px";
  } else {
    if (item.colSpan === "full") {
      cardStyle.gridColumn = "1 / -1";
    } else if (item.colSpan && item.colSpan > 1) {
      cardStyle.gridColumn = `span ${item.colSpan}`;
    }
    if (item.rowSpan && item.rowSpan > 1) {
      cardStyle.gridRow = `span ${item.rowSpan}`;
    }
  }

  return (
    <div
      id={`sfd-item-${item.id}`}
      style={cardStyle}
      className="p-4 sm:p-5 border transition-all duration-200 hover:shadow-xs cursor-pointer select-none"
      onClick={() => setIsOpen((prev) => !prev)}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
          {item.title}
        </h3>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#009691]" : "text-gray-400"
          }`}
        />
      </div>
      {isOpen && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs sm:text-sm opacity-85 leading-relaxed text-gray-700">
          {item.description}
        </div>
      )}
    </div>
  );
}

export default function CMSSectionRenderer({
  slug,
  initialPage,
  children,
  defaultChildren,
  fallbackHero,
}: CMSSectionRendererProps) {
  const [mounted, setMounted] = useState(false);
  const [cmsPage, setCmsPage] = useState<CMSPage | null>(initialPage ?? null);

  useEffect(() => {
    const loadPage = () => {
      try {
        const pages = getStoredCMSPages();
        const found = pages.find(
          (p) =>
            p.slug === slug ||
            p.id === slug ||
            (slug === "home" && (p.slug === "home" || p.id === "home"))
        );
        if (found) {
          setCmsPage(found);
        }
      } catch (err) {
        console.error("Error loading CMS page for slug:", slug, err);
      }
    };

    if (!initialPage) {
      loadPage();
    }
    setMounted(true);

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith("sfd_cms_pages")) {
        loadPage();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("sfd-cms-pages-updated", loadPage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("sfd-cms-pages-updated", loadPage);
    };
  }, [slug, initialPage]);

  const fallbackContent = children ?? defaultChildren;

  // If this page has Puck data, render directly with the shared Puck config
  const puckContent = (cmsPage?.puckData as { content?: unknown[] } | undefined)?.content;
  if (cmsPage?.puckData && Array.isArray(puckContent) && puckContent.length > 0) {
    return (
      <div className="sfd-cms-rendered-page w-full">
        <Render config={withStyleEngine(puckConfig)} data={cmsPage.puckData as unknown as PuckPageData} />
      </div>
    );
  }

  // Hydration safety: during SSR and before mount, render default children without layout flash
  if (!mounted && !initialPage) {
    return <>{fallbackContent}</>;
  }

  // Check if custom sections or custom page structure exist in storage
  const hasCustomSections = Boolean(
    cmsPage && cmsPage.sections && cmsPage.sections.length > 0
  );

  if (!hasCustomSections) {
    return <>{fallbackContent}</>;
  }

  const defaultSeedPage = INITIAL_CMS_PAGES.find(
    (p) => p.slug === slug || p.id === slug
  );

  const hasCustomHero = Boolean(
    cmsPage?.heroStyle?.customCss ||
      cmsPage?.heroStyle?.bgColor ||
      cmsPage?.heroStyle?.accentColor ||
      cmsPage?.heroStyle?.padding ||
      cmsPage?.heroStyle?.align ||
      (defaultSeedPage &&
        cmsPage?.heroHeadline &&
        cmsPage.heroHeadline !== defaultSeedPage.heroHeadline)
  );

  const heroStyle: HeroStyle = cmsPage?.heroStyle || {
    bgColor: "#0f172a",
    textColor: "#ffffff",
    accentColor: "#009691",
    badgeBg: "rgba(0, 150, 145, 0.18)",
    badgeColor: "#5eead4",
    padding: "56px 36px",
    align: "left",
  };

  const getContainerStyle = (sec: PageSection): React.CSSProperties => {
    const isFlex = sec.style?.displayLayout === "flex";
    const gap = sec.style?.gap || "16px";

    if (isFlex) {
      return {
        display: "flex",
        flexDirection: sec.style?.flexDirection || "row",
        flexWrap: sec.style?.flexWrap || "wrap",
        justifyContent: sec.style?.justifyContent || "flex-start",
        alignItems: sec.style?.alignItems || "stretch",
        gap,
      };
    }

    // Grid layout
    const cols = sec.style?.gridColumns || (sec.columns as number) || 3;
    return {
      display: "grid",
      gridTemplateColumns:
        sec.style?.gridTemplateColumns || `repeat(${cols}, minmax(0, 1fr))`,
      gap,
    };
  };

  const getItemCardStyle = (
    item: PageSectionItem,
    st: PageSectionStyle,
    sec: PageSection
  ): React.CSSProperties => {
    const style: React.CSSProperties = {
      backgroundColor: st.cardBgColor || "#f9fafb",
      borderColor: st.cardBorderColor || "#e5e7eb",
      borderRadius: st.borderRadius || "10px",
    };

    const isFlex = sec.style?.displayLayout === "flex";
    if (isFlex) {
      style.flex = "1 1 240px";
    } else {
      // Grid item spans
      if (item.colSpan === "full") {
        style.gridColumn = "1 / -1";
      } else if (item.colSpan && item.colSpan > 1) {
        style.gridColumn = `span ${item.colSpan}`;
      }
      if (item.rowSpan && item.rowSpan > 1) {
        style.gridRow = `span ${item.rowSpan}`;
      }
    }

    return style;
  };

  return (
    <div className="sfd-cms-rendered-page w-full">
      {/* 1. HERO BANNER */}
      {fallbackHero && !hasCustomHero ? (
        fallbackHero
      ) : cmsPage?.heroHeadline ? (
        <section
          id="sfd-section-hero"
          style={{
            backgroundColor: heroStyle.bgColor || "#0f172a",
            color: heroStyle.textColor || "#ffffff",
            padding: heroStyle.padding || "56px 36px",
            textAlign: heroStyle.align || "left",
          }}
          className="relative transition-all"
        >
          {heroStyle.customCss && (
            <style
              dangerouslySetInnerHTML={{
                __html: scopeCustomCss(heroStyle.customCss, "hero"),
              }}
            />
          )}
          {buildHeroResponsiveCss(heroStyle) && (
            <style
              dangerouslySetInnerHTML={{
                __html: buildHeroResponsiveCss(heroStyle),
              }}
            />
          )}

          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            {cmsPage.heroBadge && (
              <div className="inline-block mb-3">
                <span
                  style={{
                    backgroundColor:
                      heroStyle.badgeBg || "rgba(0, 150, 145, 0.18)",
                    color: heroStyle.badgeColor || "#5eead4",
                  }}
                  className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block"
                >
                  {cmsPage.heroBadge}
                </span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-tight">
              {cmsPage.heroHeadline}
            </h1>

            {cmsPage.heroSubtitle && (
              <p
                className="text-sm sm:text-base opacity-90 max-w-2xl mb-8 leading-relaxed"
                style={{
                  marginLeft: heroStyle.align === "center" ? "auto" : undefined,
                  marginRight: heroStyle.align === "center" ? "auto" : undefined,
                }}
              >
                {cmsPage.heroSubtitle}
              </p>
            )}

            {cmsPage.primaryCtaText && (
              <div>
                <Link
                  href={cmsPage.primaryCtaLink || "/schedule-repair"}
                  style={{
                    backgroundColor: heroStyle.accentColor || "#009691",
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-white font-bold text-sm shadow-lg hover:brightness-110 transition active:scale-95"
                >
                  <span>{cmsPage.primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* 2. DYNAMIC SECTIONS */}
      {cmsPage?.sections?.map((sec) => {
        const st: PageSectionStyle = sec.style || {};
        const isFlex = st.displayLayout === "flex";
        const desktopCols = st.gridColumns || (sec.columns as number) || 3;

        return (
          <section
            key={sec.id}
            id={`sfd-section-${sec.id}`}
            style={{
              backgroundColor: st.bgColor || "#ffffff",
              color: st.textColor || "#111827",
              padding: st.padding || "48px 32px",
              textAlign: st.align || "left",
            }}
            className="relative transition-all"
          >
            {/* Scoped Custom CSS */}
            {(sec.style?.customCss || sec.customCss) && (
              <style
                dangerouslySetInnerHTML={{
                  __html: scopeCustomCss(
                    sec.style?.customCss || sec.customCss || "",
                    sec.id
                  ),
                }}
              />
            )}

            {/* Responsive Collapse Rules for CSS Grid & Flex */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @media (max-width: 640px) {
                    #sfd-section-${sec.id} .sfd-dynamic-grid {
                      grid-template-columns: 1fr !important;
                    }
                    #sfd-section-${sec.id} .sfd-dynamic-flex {
                      flex-direction: column !important;
                    }
                  }
                  @media (min-width: 641px) and (max-width: 1024px) {
                    #sfd-section-${sec.id} .sfd-dynamic-grid {
                      grid-template-columns: repeat(${Math.min(
                        desktopCols,
                        2
                      )}, minmax(0, 1fr)) !important;
                    }
                  }
                `,
              }}
            />

            {/* Per-Device (Responsive) Style Overrides */}
            {buildSectionResponsiveCss(sec) && (
              <style
                dangerouslySetInnerHTML={{
                  __html: buildSectionResponsiveCss(sec),
                }}
              />
            )}

            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              {/* Section Header */}
              {sec.heading && (
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                  {sec.heading}
                </h2>
              )}

              {sec.subheading && (
                <p
                  className="text-sm opacity-75 mb-8 max-w-2xl leading-relaxed"
                  style={{
                    marginLeft: st.align === "center" ? "auto" : undefined,
                    marginRight: st.align === "center" ? "auto" : undefined,
                  }}
                >
                  {sec.subheading}
                </p>
              )}

              {/* TEMPLATE 1: SERVICES GRID / BENEFITS */}
              {(sec.type === "services_grid" || sec.type === "benefits") && (
                <div
                  style={getContainerStyle(sec)}
                  className={`w-full text-left ${
                    isFlex ? "sfd-dynamic-flex" : "sfd-dynamic-grid"
                  }`}
                >
                  {(sec.items || []).map((item) => {
                    const cardStyle = getItemCardStyle(item, st, sec);
                    return (
                      <div
                        key={item.id}
                        id={`sfd-item-${item.id}`}
                        style={cardStyle}
                        className={`p-5 border relative transition-all duration-200 hover:shadow-md ${
                          item.highlight ? "ring-2 ring-[#009691] shadow-md" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            {item.icon && (
                              <div
                                style={{
                                  backgroundColor: `${st.accentColor || "#009691"}15`,
                                  color: st.accentColor || "#009691",
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              >
                                <RenderItemIcon name={item.icon} className="w-4 h-4" />
                              </div>
                            )}
                            {item.badge && (
                              <span
                                style={{
                                  backgroundColor: `${st.accentColor || "#009691"}15`,
                                  color: st.accentColor || "#009691",
                                }}
                                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.price && (
                            <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                              {item.price}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold mb-1.5 text-gray-900">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm opacity-75 leading-relaxed text-gray-600">
                          {item.description}
                        </p>

                        {(item.link || item.linkText) && (
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <Link
                              href={item.link || "/schedule-repair"}
                              style={{ color: st.accentColor || "#009691" }}
                              className="text-xs font-bold hover:underline inline-flex items-center gap-1 group"
                            >
                              <span>{item.linkText || "Learn More"}</span>
                              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TEMPLATE 2: SPLIT FEATURE BANNER */}
              {sec.type === "split_banner" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {sec.heading}
                    </h3>
                    {sec.subheading && (
                      <p className="text-sm opacity-80 leading-relaxed max-w-lg">
                        {sec.subheading}
                      </p>
                    )}
                    {sec.ctaText && (
                      <div>
                        <Link
                          href={sec.ctaLink || "/schedule-repair"}
                          style={{
                            backgroundColor: st.accentColor || "#009691",
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-xs sm:text-sm font-bold shadow hover:brightness-110 transition active:scale-95"
                        >
                          <span>{sec.ctaText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {(sec.items || []).map((item) => (
                      <div
                        key={item.id}
                        id={`sfd-item-${item.id}`}
                        style={{
                          backgroundColor: st.cardBgColor || "#f8fafc",
                          borderColor: st.cardBorderColor || "#e2e8f0",
                          borderRadius: st.borderRadius || "12px",
                        }}
                        className="p-5 border shadow-2xs"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          {item.icon && (
                            <div
                              style={{ color: st.accentColor || "#009691" }}
                              className="shrink-0"
                            >
                              <RenderItemIcon name={item.icon} className="w-4 h-4" />
                            </div>
                          )}
                          {item.badge && (
                            <span
                              style={{ color: st.accentColor || "#009691" }}
                              className="text-[10px] font-bold uppercase tracking-wider block"
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold mb-1 text-gray-900">
                          {item.title}
                        </h4>
                        <p className="text-xs opacity-75 leading-relaxed text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TEMPLATE 3: FAQ ACCORDION */}
              {sec.type === "faq" && (
                <div
                  style={getContainerStyle(sec)}
                  className={`w-full max-w-3xl text-left ${
                    isFlex ? "sfd-dynamic-flex" : "sfd-dynamic-grid"
                  }`}
                >
                  {(sec.items || []).map((faq) => (
                    <CMSFaqAccordionItem
                      key={faq.id}
                      item={faq}
                      st={st}
                      sec={sec}
                    />
                  ))}
                </div>
              )}

              {/* TEMPLATE 4: CTA BANNER */}
              {sec.type === "cta_banner" && (
                <div className="mt-6 flex justify-center">
                  <Link
                    href={sec.ctaLink || "/schedule-repair"}
                    style={{
                      backgroundColor: st.accentColor || "#009691",
                    }}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-white text-sm font-bold shadow-md hover:brightness-110 transition active:scale-95"
                  >
                    <span>{sec.ctaText || "Schedule Repair Now"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* TEMPLATE 5: RICHTEXT BLOCK */}
              {sec.type === "richtext" && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sec.bodyHtml || "",
                  }}
                  className="sfd-content prose max-w-none text-sm leading-relaxed"
                />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
