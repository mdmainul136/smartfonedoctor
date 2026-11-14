"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { scopeCustomCss } from "@/lib/cmsCustomCss";
import type {
  BlockVisibility,
  PuckFaqItem,
  PuckIconName,
  ResponsiveDeviceOverride,
  ResponsiveOverrides,
} from "@/puck/types";

export const ICON_OPTIONS: { label: string; value: PuckIconName }[] = [
  { label: "None", value: "None" },
  { label: "Shield", value: "Shield" },
  { label: "Clock", value: "Clock" },
  { label: "Zap", value: "Zap" },
  { label: "Wrench", value: "Wrench" },
  { label: "Sparkles", value: "Sparkles" },
  { label: "Star", value: "Star" },
  { label: "Check", value: "Check" },
  { label: "CheckCircle2", value: "CheckCircle2" },
];

export function RenderItemIcon({
  name,
  className = "w-4 h-4",
}: {
  name?: string;
  className?: string;
}) {
  if (!name || name === "None") return null;
  switch (name) {
    case "Shield":
      return <Shield className={className} />;
    case "Clock":
      return <Clock className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Wrench":
      return <Wrench className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "Star":
      return <Star className={className} />;
    case "Check":
      return <Check className={className} />;
    case "CheckCircle2":
      return <CheckCircle2 className={className} />;
    default:
      return null;
  }
}

export function sanitizeSectionId(raw?: string, fallback = "puck-block"): string {
  return (raw || fallback).replace(/[^a-zA-Z0-9_-]/g, "");
}

function buildDeviceCssBlock(
  sel: string,
  o?: ResponsiveDeviceOverride,
  containerSelector = `${sel} .sfd-dynamic-grid, ${sel} .sfd-dynamic-flex`
): string {
  if (!o) return "";
  const secDecls: string[] = [];
  if (o.bgColor) secDecls.push(`background-color: ${o.bgColor} !important;`);
  if (o.textColor) secDecls.push(`color: ${o.textColor} !important;`);
  if (o.padding) secDecls.push(`padding: ${o.padding} !important;`);
  if (o.align) secDecls.push(`text-align: ${o.align} !important;`);

  const layoutDecls: string[] = [];
  if (o.gridColumns) {
    const cols = Math.min(6, Math.max(1, Number(o.gridColumns) || 1));
    layoutDecls.push(`grid-template-columns: repeat(${cols}, minmax(0, 1fr)) !important;`);
  }
  if (o.gap) layoutDecls.push(`gap: ${o.gap} !important;`);
  if (o.flexDirection) layoutDecls.push(`flex-direction: ${o.flexDirection} !important;`);

  let out = "";
  if (secDecls.length > 0) out += `${sel} { ${secDecls.join(" ")} }\n`;
  if (layoutDecls.length > 0) out += `${containerSelector} { ${layoutDecls.join(" ")} }\n`;
  return out;
}

export function buildResponsiveMediaCss(
  safeId: string,
  responsive?: ResponsiveOverrides,
  containerSelector?: string
): string {
  if (!responsive?.tablet && !responsive?.mobile) return "";
  const sel = `#sfd-section-${safeId}`;
  let css = "";
  const tablet = buildDeviceCssBlock(sel, responsive.tablet, containerSelector);
  const mobile = buildDeviceCssBlock(sel, responsive.mobile, containerSelector);
  if (tablet) css += `@media (max-width: 1024px) {\n${tablet}}\n`;
  if (mobile) css += `@media (max-width: 640px) {\n${mobile}}\n`;
  return css;
}

export function SectionWrapper({
  id,
  bgColor,
  textColor,
  padding,
  align,
  customCss,
  responsive,
  responsiveGridCols,
  visibility,
  children,
}: {
  id?: string;
  bgColor?: string;
  textColor?: string;
  padding?: string;
  align?: "left" | "center";
  customCss?: string;
  responsive?: ResponsiveOverrides;
  responsiveGridCols?: number;
  visibility?: BlockVisibility;
  children: React.ReactNode;
}) {
  const safeId = sanitizeSectionId(id);
  const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
  const responsiveCss = buildResponsiveMediaCss(safeId, responsive);
  const visibilityCss = buildVisibilityCss(safeId, visibility);

  return (
    <section
      id={`sfd-section-${safeId}`}
      style={{
        backgroundColor: bgColor || "#ffffff",
        color: textColor || "#111827",
        padding: padding || "48px 32px",
        textAlign: align || "left",
      }}
      className="relative transition-all w-full"
    >
      {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
      {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
      {responsiveGridCols && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (max-width: 640px) {
                #sfd-section-${safeId} .sfd-dynamic-grid {
                  grid-template-columns: 1fr !important;
                }
                #sfd-section-${safeId} .sfd-dynamic-flex {
                  flex-direction: column !important;
                }
              }
              @media (min-width: 641px) and (max-width: 1024px) {
                #sfd-section-${safeId} .sfd-dynamic-grid {
                  grid-template-columns: repeat(${Math.min(
                    responsiveGridCols,
                    2
                  )}, minmax(0, 1fr)) !important;
                }
              }
            `,
          }}
        />
      )}
      {responsiveCss && <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function buildContainerLayoutStyle(opts: {
  displayLayout: "grid" | "flex";
  gridColumns?: number;
  flexDirection?: "row" | "column";
  flexWrap?: "wrap" | "nowrap";
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
}): React.CSSProperties {
  const gap = opts.gap || "16px";
  if (opts.displayLayout === "flex") {
    return {
      display: "flex",
      flexDirection: opts.flexDirection || "row",
      flexWrap: opts.flexWrap || "wrap",
      justifyContent: opts.justifyContent || "flex-start",
      alignItems: opts.alignItems || "stretch",
      gap,
    };
  }
  const cols = Math.min(6, Math.max(1, Number(opts.gridColumns) || 3));
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gap,
  };
}

export function FaqAccordionCard({
  item,
  displayLayout,
  cardBgColor,
  cardBorderColor,
  borderRadius,
  accentColor,
}: {
  item: PuckFaqItem;
  displayLayout: "grid" | "flex";
  cardBgColor: string;
  cardBorderColor: string;
  borderRadius: string;
  accentColor: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: cardBgColor || "#ffffff",
    borderColor: cardBorderColor || "#e5e7eb",
    borderRadius: borderRadius || "10px",
  };

  if (displayLayout === "flex") {
    cardStyle.flex = "1 1 280px";
  } else if (item.colSpan === "full") {
    cardStyle.gridColumn = "1 / -1";
  } else if (item.colSpan === "2") {
    cardStyle.gridColumn = "span 2";
  }

  return (
    <div
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
          style={{ color: isOpen ? accentColor || "#009691" : undefined }}
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "text-gray-400"
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

export function buildVisibilityCss(
  safeId: string,
  visibility?: BlockVisibility
): string {
  if (!visibility) return "";
  const rules: string[] = [];
  if (visibility.hideOnMobile) {
    rules.push(`@media (max-width: 639px) { #sfd-section-${safeId} { display: none !important; } }`);
  }
  if (visibility.hideOnTablet) {
    rules.push(`@media (min-width: 640px) and (max-width: 1023px) { #sfd-section-${safeId} { display: none !important; } }`);
  }
  if (visibility.hideOnDesktop) {
    rules.push(`@media (min-width: 1024px) { #sfd-section-${safeId} { display: none !important; } }`);
  }
  return rules.join("\n");
}


