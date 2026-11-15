"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  Clock,
  Zap,
  Wrench,
  Hammer,
  Sparkles,
  Star,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Award,
  ThumbsUp,
  Heart,
  Trophy,
  BadgePercent,
  Lock,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Tv,
  Gamepad2,
  Headphones,
  Battery,
  BatteryCharging,
  Cpu,
  HardDrive,
  Wifi,
  Bluetooth,
  Camera,
  Mic,
  Volume2,
  Speaker,
  Usb,
  Settings,
  Sliders,
  Activity,
  FileText,
  Layers,
  LayoutGrid,
  Recycle,
  Leaf,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  Navigation,
  Calendar,
  CalendarCheck,
  Store,
  Building,
  ShoppingBag,
  ShoppingCart,
  Truck,
  CreditCard,
  DollarSign,
  Globe,
  Search,
  HelpCircle,
  Info,
  AlertCircle,
  ExternalLink,
  Share2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  User,
  Users,
} from "lucide-react";
import { scopeCustomCss } from "../core/customCss";
import type {
  BlockVisibility,
  PuckFaqItem,
  PuckIconName,
  ResponsiveDeviceOverride,
  ResponsiveOverrides,
} from "@/puck/types";

export const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  // Trust & Badges
  Shield,
  ShieldCheck,
  Award,
  Star,
  Sparkles,
  ThumbsUp,
  Check,
  CheckCircle2,
  Heart,
  Trophy,
  BadgePercent,
  Lock,

  // Devices & Tech
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Tv,
  Gamepad2,
  Headphones,
  Battery,
  BatteryCharging,
  Cpu,
  HardDrive,
  Wifi,
  Bluetooth,
  Camera,
  Mic,
  Volume2,
  Speaker,
  Usb,

  // Repair, Tools & Diagnostics
  Wrench,
  Hammer,
  Zap,
  Clock,
  Settings,
  Sliders,
  Activity,
  FileText,
  Layers,
  LayoutGrid,
  Recycle,
  Leaf,

  // Business & Contact
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  Navigation,
  Calendar,
  CalendarCheck,
  Store,
  Building,
  ShoppingBag,
  ShoppingCart,
  Truck,
  CreditCard,
  DollarSign,
  Globe,
  Search,
  HelpCircle,
  Info,
  AlertCircle,

  // Arrows, User & Actions
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Share2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  User,
  Users,
};

export interface IconOptionItem {
  label: string;
  value: PuckIconName;
  category: "All" | "Trust & Badges" | "Devices & Tech" | "Repair & Tools" | "Business & Contact" | "Arrows & Actions";
}

export const ICON_OPTIONS: IconOptionItem[] = [
  { label: "None", value: "None", category: "All" },

  // Trust & Badges
  { label: "Shield", value: "Shield", category: "Trust & Badges" },
  { label: "Shield Check", value: "ShieldCheck", category: "Trust & Badges" },
  { label: "Award", value: "Award", category: "Trust & Badges" },
  { label: "Star", value: "Star", category: "Trust & Badges" },
  { label: "Sparkles", value: "Sparkles", category: "Trust & Badges" },
  { label: "Thumbs Up", value: "ThumbsUp", category: "Trust & Badges" },
  { label: "Check", value: "Check", category: "Trust & Badges" },
  { label: "Check Circle", value: "CheckCircle2", category: "Trust & Badges" },
  { label: "Heart", value: "Heart", category: "Trust & Badges" },
  { label: "Trophy", value: "Trophy", category: "Trust & Badges" },
  { label: "Badge Percent", value: "BadgePercent", category: "Trust & Badges" },
  { label: "Lock", value: "Lock", category: "Trust & Badges" },

  // Devices & Tech
  { label: "Smartphone", value: "Smartphone", category: "Devices & Tech" },
  { label: "Tablet", value: "Tablet", category: "Devices & Tech" },
  { label: "Laptop", value: "Laptop", category: "Devices & Tech" },
  { label: "Monitor", value: "Monitor", category: "Devices & Tech" },
  { label: "TV", value: "Tv", category: "Devices & Tech" },
  { label: "Gamepad", value: "Gamepad2", category: "Devices & Tech" },
  { label: "Headphones", value: "Headphones", category: "Devices & Tech" },
  { label: "Battery", value: "Battery", category: "Devices & Tech" },
  { label: "Battery Charging", value: "BatteryCharging", category: "Devices & Tech" },
  { label: "CPU / Chip", value: "Cpu", category: "Devices & Tech" },
  { label: "Hard Drive", value: "HardDrive", category: "Devices & Tech" },
  { label: "WiFi", value: "Wifi", category: "Devices & Tech" },
  { label: "Bluetooth", value: "Bluetooth", category: "Devices & Tech" },
  { label: "Camera", value: "Camera", category: "Devices & Tech" },
  { label: "Microphone", value: "Mic", category: "Devices & Tech" },
  { label: "Volume", value: "Volume2", category: "Devices & Tech" },
  { label: "Speaker", value: "Speaker", category: "Devices & Tech" },
  { label: "USB", value: "Usb", category: "Devices & Tech" },

  // Repair & Tools
  { label: "Wrench", value: "Wrench", category: "Repair & Tools" },
  { label: "Hammer", value: "Hammer", category: "Repair & Tools" },
  { label: "Zap / Lightning", value: "Zap", category: "Repair & Tools" },
  { label: "Clock", value: "Clock", category: "Repair & Tools" },
  { label: "Settings", value: "Settings", category: "Repair & Tools" },
  { label: "Sliders", value: "Sliders", category: "Repair & Tools" },
  { label: "Activity", value: "Activity", category: "Repair & Tools" },
  { label: "File Text", value: "FileText", category: "Repair & Tools" },
  { label: "Layers", value: "Layers", category: "Repair & Tools" },
  { label: "Layout Grid", value: "LayoutGrid", category: "Repair & Tools" },
  { label: "Recycle", value: "Recycle", category: "Repair & Tools" },
  { label: "Leaf", value: "Leaf", category: "Repair & Tools" },

  // Business & Contact
  { label: "Phone", value: "Phone", category: "Business & Contact" },
  { label: "Phone Call", value: "PhoneCall", category: "Business & Contact" },
  { label: "Mail", value: "Mail", category: "Business & Contact" },
  { label: "Map Pin", value: "MapPin", category: "Business & Contact" },
  { label: "Navigation", value: "Navigation", category: "Business & Contact" },
  { label: "Calendar", value: "Calendar", category: "Business & Contact" },
  { label: "Calendar Check", value: "CalendarCheck", category: "Business & Contact" },
  { label: "Store", value: "Store", category: "Business & Contact" },
  { label: "Building", value: "Building", category: "Business & Contact" },
  { label: "Shopping Bag", value: "ShoppingBag", category: "Business & Contact" },
  { label: "Shopping Cart", value: "ShoppingCart", category: "Business & Contact" },
  { label: "Delivery Truck", value: "Truck", category: "Business & Contact" },
  { label: "Credit Card", value: "CreditCard", category: "Business & Contact" },
  { label: "Dollar Sign", value: "DollarSign", category: "Business & Contact" },
  { label: "Globe", value: "Globe", category: "Business & Contact" },
  { label: "Search", value: "Search", category: "Business & Contact" },
  { label: "Help Circle", value: "HelpCircle", category: "Business & Contact" },
  { label: "Info", value: "Info", category: "Business & Contact" },
  { label: "Alert Circle", value: "AlertCircle", category: "Business & Contact" },

  // Arrows & Actions
  { label: "Arrow Right", value: "ArrowRight", category: "Arrows & Actions" },
  { label: "Arrow Left", value: "ArrowLeft", category: "Arrows & Actions" },
  { label: "Arrow Up", value: "ArrowUp", category: "Arrows & Actions" },
  { label: "Arrow Down", value: "ArrowDown", category: "Arrows & Actions" },
  { label: "Chevron Right", value: "ChevronRight", category: "Arrows & Actions" },
  { label: "Chevron Left", value: "ChevronLeft", category: "Arrows & Actions" },
  { label: "Chevron Down", value: "ChevronDown", category: "Arrows & Actions" },
  { label: "External Link", value: "ExternalLink", category: "Arrows & Actions" },
  { label: "Share", value: "Share2", category: "Arrows & Actions" },
  { label: "Copy", value: "Copy", category: "Arrows & Actions" },
  { label: "Download", value: "Download", category: "Arrows & Actions" },
  { label: "Upload", value: "Upload", category: "Arrows & Actions" },
  { label: "Refresh", value: "RefreshCw", category: "Arrows & Actions" },
  { label: "User", value: "User", category: "Arrows & Actions" },
  { label: "Users Team", value: "Users", category: "Arrows & Actions" },
];

export function RenderItemIcon({
  name,
  className = "w-4 h-4",
  style,
  size,
}: {
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number | string;
}) {
  if (!name || name === "None") return null;
  const Component = ICON_MAP[name];
  if (!Component) return null;

  const mergedStyle: React.CSSProperties = {
    ...(size ? { width: `${size}px`, height: `${size}px` } : {}),
    ...style,
  };

  return <Component className={className} style={mergedStyle} />;
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


