"use client";

import React, { useState } from "react";
import { CMSPage, PageSection, PageSectionItem, HeroStyle } from "@/lib/cmsData";
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Layout,
  Grid,
  ShieldCheck,
  HelpCircle,
  Megaphone,
  Type,
  Sliders,
  AlignLeft,
  AlignCenter,
  Columns,
  Sparkles,
  CheckCircle2,
  MousePointerClick,
} from "lucide-react";

interface ElementorPageBuilderProps {
  page: CMSPage;
  viewport: "desktop" | "tablet" | "mobile";
  onChangePage: (updated: CMSPage) => void;
}

export function getDefaultSectionsForPage(page: CMSPage): PageSection[] {
  if (page.sections && page.sections.length > 0) return page.sections;

  const sections: PageSection[] = [
    {
      id: "sec-services",
      type: "services_grid",
      label: "Services & Repair Grid",
      heading: `Popular ${page.name} Solutions`,
      subheading: "Click any title, price, or description directly on this page to edit it.",
      columns: 3,
      items: [
        {
          id: "item-1",
          badge: "30 Mins",
          title: "Screen & Display Replacement",
          price: "From $89",
          description: "OEM-grade glass and OLED assembly with TrueTone calibration and 90-day warranty.",
        },
        {
          id: "item-2",
          badge: "20 Mins",
          title: "High-Capacity Battery Renewal",
          price: "From $59",
          description: "Zero-cycle brand new cell installation to restore all-day battery health.",
        },
        {
          id: "item-3",
          badge: "Same Day",
          title: "Charging Port & Micro-Soldering",
          price: "From $69",
          description: "Precision dock cleaning, IC chip repair, and fast-charge restoration.",
        },
      ],
      style: {
        bgColor: "#ffffff",
        textColor: "#111827",
        cardBgColor: "#f9fafb",
        cardBorderColor: "#e5e7eb",
        accentColor: "#009691",
        padding: "48px 32px",
        align: "center",
        borderRadius: "12px",
      },
    },
    {
      id: "sec-benefits",
      type: "benefits",
      label: "Trust & Benefits Strip",
      heading: "Why Philadelphia Trusts SmartFone Doctor",
      subheading: "Fast turnaround, transparent pricing, and certified bench technicians.",
      columns: 3,
      items: [
        {
          id: "ben-1",
          badge: "Warranty",
          title: "90-Day Parts & Labor Guarantee",
          description: "Every repair is backed by our hassle-free warranty across all 3 Philly stores.",
        },
        {
          id: "ben-2",
          badge: "Speed",
          title: "Most Repairs Under 30 Mins",
          description: "Walk-in express service while you wait — no appointment required.",
        },
        {
          id: "ben-3",
          badge: "Quality",
          title: "OEM-Grade Tested Parts",
          description: "Each component is bench-tested before and after installation.",
        },
      ],
      style: {
        bgColor: "#f8fafc",
        textColor: "#0f172a",
        cardBgColor: "#ffffff",
        cardBorderColor: "#e2e8f0",
        accentColor: "#009691",
        padding: "44px 32px",
        align: "left",
        borderRadius: "10px",
      },
    },
  ];

  if (page.contentHtml && page.contentHtml.trim()) {
    sections.push({
      id: "sec-body",
      type: "richtext",
      label: "Page Body Content",
      heading: "Detailed Service Information",
      bodyHtml: page.contentHtml,
      style: {
        bgColor: "#ffffff",
        textColor: "#374151",
        padding: "40px 32px",
        align: "left",
      },
    });
  }

  sections.push(
    {
      id: "sec-faq",
      type: "faq",
      label: "FAQ Accordion",
      heading: "Frequently Asked Questions",
      subheading: "Common questions about turnaround time, parts, and warranty.",
      items: [
        {
          id: "faq-1",
          title: "Do I need an appointment before visiting?",
          description: "No appointment is required! Walk-ins are welcome at all 3 Philadelphia locations, or you can book online for priority bench service.",
        },
        {
          id: "faq-2",
          title: "Will my data be safe during the repair?",
          description: "Yes. Hardware repairs like screen, battery, and port replacements do not erase your photos, apps, or personal data.",
        },
      ],
      style: {
        bgColor: "#ffffff",
        textColor: "#111827",
        cardBgColor: "#fafafa",
        cardBorderColor: "#e5e7eb",
        accentColor: "#009691",
        padding: "44px 32px",
        align: "left",
        borderRadius: "10px",
      },
    },
    {
      id: "sec-cta",
      type: "cta_banner",
      label: "Bottom CTA Banner",
      heading: "Ready to get your device fixed today?",
      subheading: "Visit any of our 3 Philadelphia shops or lock in your repair estimate online in 30 seconds.",
      ctaText: "Schedule Repair Now",
      ctaLink: "/schedule-repair",
      style: {
        bgColor: "#0f172a",
        textColor: "#ffffff",
        accentColor: "#009691",
        padding: "48px 32px",
        align: "center",
        borderRadius: "14px",
      },
    }
  );

  return sections;
}

const WIDGET_LIBRARY: {
  type: PageSection["type"];
  title: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  { type: "services_grid", title: "Services / Price Grid", desc: "Cards with title, price & badge", icon: Grid },
  { type: "benefits", title: "Benefits / Trust Strip", desc: "3 or 4 column value highlights", icon: ShieldCheck },
  { type: "split_banner", title: "Split Feature Banner", desc: "2-col text & highlight box", icon: Columns },
  { type: "faq", title: "FAQ Accordion", desc: "Expandable Q&A items", icon: HelpCircle },
  { type: "cta_banner", title: "CTA Conversion Banner", desc: "Headline + action button", icon: Megaphone },
  { type: "richtext", title: "Freeform Text Block", desc: "Editable heading & paragraphs", icon: Type },
];

export default function ElementorPageBuilder({
  page,
  viewport,
  onChangePage,
}: ElementorPageBuilderProps) {
  const sections = getDefaultSectionsForPage(page);
  const heroStyle: HeroStyle = page.heroStyle || {
    bgColor: "#0f172a",
    textColor: "#ffffff",
    accentColor: "#009691",
    badgeBg: "rgba(0, 150, 145, 0.18)",
    badgeColor: "#5eead4",
    padding: "56px 36px",
    align: "left",
  };

  const [sidebarTab, setSidebarTab] = useState<"elements" | "style">("elements");
  const [selectedId, setSelectedId] = useState<"hero" | string>("hero");

  const selectedSection = selectedId === "hero" ? null : sections.find((s) => s.id === selectedId) || null;

  const updateSections = (nextSections: PageSection[]) => {
    onChangePage({
      ...page,
      sections: nextSections,
      lastEdited: "Just now",
    });
  };

  const selectSection = (id: "hero" | string) => {
    setSelectedId(id);
    setSidebarTab("style");
  };

  const updateHeroStyle = (patch: Partial<HeroStyle>) => {
    onChangePage({
      ...page,
      heroStyle: { ...heroStyle, ...patch },
      lastEdited: "Just now",
    });
  };

  const updateSection = (id: string, patch: Partial<PageSection>) => {
    updateSections(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const updateSectionStyle = (id: string, stylePatch: Partial<NonNullable<PageSection["style"]>>) => {
    updateSections(
      sections.map((s) =>
        s.id === id ? { ...s, style: { ...(s.style || {}), ...stylePatch } } : s
      )
    );
  };

  const updateSectionItem = (secId: string, itemId: string, patch: Partial<PageSectionItem>) => {
    updateSections(
      sections.map((s) => {
        if (s.id !== secId || !s.items) return s;
        return {
          ...s,
          items: s.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
        };
      })
    );
  };

  const addSectionItem = (secId: string) => {
    updateSections(
      sections.map((s) => {
        if (s.id !== secId) return s;
        const newItem: PageSectionItem =
          s.type === "faq"
            ? {
                id: `faq-${Date.now()}`,
                title: "New Question — Click to edit",
                description: "Click here to write a clear answer for your customers.",
              }
            : {
                id: `item-${Date.now()}`,
                badge: "Express",
                title: "New Service / Feature",
                price: s.type === "services_grid" ? "From $49" : undefined,
                description: "Click to edit this description directly on the page.",
              };
        return { ...s, items: [...(s.items || []), newItem] };
      })
    );
  };

  const removeSectionItem = (secId: string, itemId: string) => {
    updateSections(
      sections.map((s) => {
        if (s.id !== secId || !s.items) return s;
        return { ...s, items: s.items.filter((i) => i.id !== itemId) };
      })
    );
  };

  const addWidget = (type: PageSection["type"]) => {
    const id = `sec-${Date.now()}`;
    const baseStyle = {
      bgColor: "#ffffff",
      textColor: "#111827",
      cardBgColor: "#f9fafb",
      cardBorderColor: "#e5e7eb",
      accentColor: "#009691",
      padding: "44px 32px",
      align: "left" as const,
      borderRadius: "10px",
    };

    let newSec: PageSection;
    if (type === "services_grid") {
      newSec = {
        id,
        type,
        label: "Services Grid",
        heading: "Repair Services & Pricing",
        subheading: "Click directly on any text to customize.",
        columns: 3,
        items: [
          { id: `${id}-1`, badge: "30 Mins", title: "Screen Replacement", price: "From $89", description: "OEM-grade display calibration." },
          { id: `${id}-2`, badge: "20 Mins", title: "Battery Service", price: "From $59", description: "Brand new 0-cycle battery." },
          { id: `${id}-3`, badge: "Same Day", title: "Charging Port", price: "From $69", description: "Fast charge & data pin repair." },
        ],
        style: { ...baseStyle, align: "center" },
      };
    } else if (type === "benefits") {
      newSec = {
        id,
        type,
        label: "Benefits Strip",
        heading: "Why Choose Us",
        columns: 3,
        items: [
          { id: `${id}-1`, badge: "90-Day", title: "Full Warranty", description: "Peace of mind on parts & labor." },
          { id: `${id}-2`, badge: "Certified", title: "Expert Technicians", description: "Micro-soldering & OEM calibration." },
          { id: `${id}-3`, badge: "Local", title: "3 Philly Locations", description: "Walk-ins welcome 7 days a week." },
        ],
        style: { ...baseStyle, bgColor: "#f8fafc" },
      };
    } else if (type === "split_banner") {
      newSec = {
        id,
        type,
        label: "Split Feature Banner",
        heading: "Same-Day Micro-Soldering & Diagnostics",
        subheading: "Bring your device to our Philadelphia bench for a free 15-minute diagnostic check.",
        ctaText: "Book Diagnostic",
        ctaLink: "/schedule-repair",
        items: [
          { id: `${id}-1`, badge: "Bench Spec", title: "Zero Data Loss Guarantee", description: "We preserve your photos, contacts, and settings throughout every repair." },
        ],
        style: baseStyle,
      };
    } else if (type === "faq") {
      newSec = {
        id,
        type,
        label: "FAQ Accordion",
        heading: "Frequently Asked Questions",
        items: [
          { id: `${id}-1`, title: "How long does a typical repair take?", description: "Most screen and battery replacements take 20–30 minutes while you wait." },
        ],
        style: baseStyle,
      };
    } else if (type === "cta_banner") {
      newSec = {
        id,
        type,
        label: "CTA Banner",
        heading: "Need Your Device Fixed Today?",
        subheading: "Lock in your repair quote online or walk into any SmartFone Doctor store.",
        ctaText: "Get Instant Quote",
        ctaLink: "/schedule-repair",
        style: { ...baseStyle, bgColor: "#0f172a", textColor: "#ffffff", align: "center" },
      };
    } else {
      newSec = {
        id,
        type: "richtext",
        label: "Freeform Text Block",
        heading: "Custom Section Title",
        bodyHtml: "<p>Click directly here to write or edit paragraphs, guidelines, or service details just like a live document.</p>",
        style: baseStyle,
      };
    }

    updateSections([...sections, newSec]);
    setSelectedId(id);
    setSidebarTab("style");
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    updateSections(next);
  };

  const duplicateSection = (index: number) => {
    const src = sections[index];
    const clone: PageSection = {
      ...JSON.parse(JSON.stringify(src)),
      id: `sec-${Date.now()}`,
      label: `${src.label} (Copy)`,
    };
    const next = [...sections];
    next.splice(index + 1, 0, clone);
    updateSections(next);
    setSelectedId(clone.id);
  };

  const deleteSection = (id: string) => {
    updateSections(sections.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId("hero");
  };

  const viewportWidthClass =
    viewport === "mobile"
      ? "max-w-[390px] mx-auto shadow-2xl border border-gray-300 rounded-2xl overflow-hidden"
      : viewport === "tablet"
      ? "max-w-[768px] mx-auto shadow-xl border border-gray-300 rounded-xl overflow-hidden"
      : "w-full shadow-lg border border-gray-200 rounded-xl overflow-hidden";

  return (
    <div className="flex flex-col lg:flex-row bg-[#eef1f4] border border-gray-200 rounded-xl overflow-hidden min-h-[760px]">
      {/* LEFT ELEMENTOR INSPECTOR SIDEBAR */}
      <aside className="w-full lg:w-[320px] bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col shrink-0 select-none">
        {/* Sidebar Tabs */}
        <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => setSidebarTab("elements")}
            className={`py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
              sidebarTab === "elements"
                ? "border-[#009691] text-[#009691] bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Elements</span>
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab("style")}
            className={`py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
              sidebarTab === "style"
                ? "border-[#009691] text-[#009691] bg-white"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit &amp; Style</span>
          </button>
        </div>

        {/* Sidebar Body */}
        <div className="p-4 overflow-y-auto flex-1 max-h-[780px] space-y-5">
          {sidebarTab === "elements" ? (
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Click to Add Section to Page
              </div>
              <div className="grid grid-cols-1 gap-2">
                {WIDGET_LIBRARY.map((w) => {
                  const Icon = w.icon;
                  return (
                    <button
                      key={w.type}
                      type="button"
                      onClick={() => addWidget(w.type)}
                      className="p-3 rounded-lg border border-gray-200 hover:border-[#009691] hover:bg-teal-50/40 text-left flex items-center gap-3 transition group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-md bg-gray-100 group-hover:bg-[#009691] group-hover:text-white text-gray-600 flex items-center justify-center transition shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900">{w.title}</div>
                        <div className="text-[10px] text-gray-500 truncate">{w.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Page Navigator ({sections.length + 1})
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => selectSection("hero")}
                    className={`w-full px-2.5 py-1.5 rounded text-left text-xs font-medium flex items-center justify-between cursor-pointer ${
                      selectedId === "hero" ? "bg-teal-50 text-[#009691] font-bold" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>1. Hero Banner</span>
                    <Layout className="w-3 h-3 opacity-60" />
                  </button>
                  {sections.map((sec, idx) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => selectSection(sec.id)}
                      className={`w-full px-2.5 py-1.5 rounded text-left text-xs font-medium flex items-center justify-between cursor-pointer ${
                        selectedId === sec.id ? "bg-teal-50 text-[#009691] font-bold" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="truncate">{idx + 2}. {sec.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedId === "hero" ? (
            /* HERO SECTION INSPECTOR */
            <div className="space-y-4">
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#009691]">Editing Section</div>
                <div className="text-xs font-bold text-gray-900 mt-0.5">Hero Banner (Click text on page to edit)</div>
              </div>

              {/* Alignment */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1.5">Alignment</label>
                <div className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => updateHeroStyle({ align: "left" })}
                    className={`py-1 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                      heroStyle.align !== "center" ? "bg-white text-[#009691] shadow-2xs" : "text-gray-600"
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" /> Left
                  </button>
                  <button
                    type="button"
                    onClick={() => updateHeroStyle({ align: "center" })}
                    className={`py-1 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                      heroStyle.align === "center" ? "bg-white text-[#009691] shadow-2xs" : "text-gray-600"
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" /> Center
                  </button>
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">Background Color</label>
                  <input
                    type="color"
                    value={heroStyle.bgColor || "#0f172a"}
                    onChange={(e) => updateHeroStyle({ bgColor: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {["#0f172a", "#111827", "#1e293b", "#004d40", "#ffffff", "#f8fafc"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        updateHeroStyle({
                          bgColor: c,
                          textColor: c === "#ffffff" || c === "#f8fafc" ? "#111827" : "#ffffff",
                        })
                      }
                      className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs font-medium text-gray-700">Text Color</label>
                  <input
                    type="color"
                    value={heroStyle.textColor || "#ffffff"}
                    onChange={(e) => updateHeroStyle({ textColor: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs font-medium text-gray-700">Button Accent Color</label>
                  <input
                    type="color"
                    value={heroStyle.accentColor || "#009691"}
                    onChange={(e) => updateHeroStyle({ accentColor: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                  />
                </div>
              </div>

              {/* Padding */}
              <div className="pt-2 border-t border-gray-100">
                <label className="text-[11px] font-bold text-gray-700 block mb-1.5">Section Padding</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: "Compact", val: "32px 24px" },
                    { label: "Normal", val: "56px 36px" },
                    { label: "Spacious", val: "80px 40px" },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => updateHeroStyle({ padding: p.val })}
                      className="py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 text-[11px] font-medium cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA Link */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="text-[11px] font-bold text-gray-700 block">CTA Button Link URL</label>
                <input
                  type="text"
                  value={page.primaryCtaLink}
                  onChange={(e) => onChangePage({ ...page, primaryCtaLink: e.target.value })}
                  className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs font-mono"
                />
              </div>
            </div>
          ) : selectedSection ? (
            /* SELECTED SECTION INSPECTOR */
            <div className="space-y-4">
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#009691]">Editing Section</div>
                  <div className="text-xs font-bold text-gray-900 mt-0.5">{selectedSection.label}</div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteSection(selectedSection.id)}
                  className="p-1.5 rounded bg-white hover:bg-red-50 text-red-600 border border-red-200 cursor-pointer"
                  title="Delete Section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Alignment */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1.5">Alignment</label>
                <div className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => updateSectionStyle(selectedSection.id, { align: "left" })}
                    className={`py-1 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                      selectedSection.style?.align !== "center" ? "bg-white text-[#009691] shadow-2xs" : "text-gray-600"
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" /> Left
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSectionStyle(selectedSection.id, { align: "center" })}
                    className={`py-1 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                      selectedSection.style?.align === "center" ? "bg-white text-[#009691] shadow-2xs" : "text-gray-600"
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" /> Center
                  </button>
                </div>
              </div>

              {/* Grid Columns */}
              {(selectedSection.type === "services_grid" || selectedSection.type === "benefits") && (
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1.5">Columns</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([2, 3, 4] as const).map((cols) => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => updateSection(selectedSection.id, { columns: cols })}
                        className={`py-1 rounded border text-xs font-semibold cursor-pointer ${
                          (selectedSection.columns || 3) === cols
                            ? "border-[#009691] bg-teal-50 text-[#009691]"
                            : "border-gray-200 bg-white text-gray-700"
                        }`}
                      >
                        {cols} Cols
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Item Button */}
              {(selectedSection.type === "services_grid" || selectedSection.type === "benefits" || selectedSection.type === "faq") && (
                <button
                  type="button"
                  onClick={() => addSectionItem(selectedSection.id)}
                  className="w-full py-2 rounded-lg bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{selectedSection.type === "faq" ? "Add FAQ Question" : "Add Card Item"}</span>
                </button>
              )}

              {/* Colors */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">Section Background</label>
                  <input
                    type="color"
                    value={selectedSection.style?.bgColor || "#ffffff"}
                    onChange={(e) => updateSectionStyle(selectedSection.id, { bgColor: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {["#ffffff", "#f8fafc", "#f0fdfa", "#fffbeb", "#0f172a", "#111827"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        updateSectionStyle(selectedSection.id, {
                          bgColor: c,
                          textColor: c === "#0f172a" || c === "#111827" ? "#ffffff" : "#111827",
                        })
                      }
                      className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs font-medium text-gray-700">Text Color</label>
                  <input
                    type="color"
                    value={selectedSection.style?.textColor || "#111827"}
                    onChange={(e) => updateSectionStyle(selectedSection.id, { textColor: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                  />
                </div>

                {(selectedSection.type === "services_grid" || selectedSection.type === "benefits" || selectedSection.type === "faq") && (
                  <>
                    <div className="flex items-center justify-between pt-1">
                      <label className="text-xs font-medium text-gray-700">Card Background</label>
                      <input
                        type="color"
                        value={selectedSection.style?.cardBgColor || "#f9fafb"}
                        onChange={(e) => updateSectionStyle(selectedSection.id, { cardBgColor: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <label className="text-xs font-medium text-gray-700">Card Border</label>
                      <input
                        type="color"
                        value={selectedSection.style?.cardBorderColor || "#e5e7eb"}
                        onChange={(e) => updateSectionStyle(selectedSection.id, { cardBorderColor: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs font-medium text-gray-700">Accent / Badge Color</label>
                  <input
                    type="color"
                    value={selectedSection.style?.accentColor || "#009691"}
                    onChange={(e) => updateSectionStyle(selectedSection.id, { accentColor: e.target.value })}
                    className="w-7 h-7 rounded cursor-pointer border border-gray-200"
                  />
                </div>
              </div>

              {/* Padding & Radius */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="text-[11px] font-bold text-gray-700 block">Section Padding</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: "Compact", val: "24px 20px" },
                    { label: "Normal", val: "44px 32px" },
                    { label: "Spacious", val: "68px 40px" },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => updateSectionStyle(selectedSection.id, { padding: p.val })}
                      className="py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 text-[11px] font-medium cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {(selectedSection.type === "cta_banner" || selectedSection.type === "split_banner") && (
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-700 block">Button Target URL</label>
                  <input
                    type="text"
                    value={selectedSection.ctaLink || "/schedule-repair"}
                    onChange={(e) => updateSection(selectedSection.id, { ctaLink: e.target.value })}
                    className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs font-mono"
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </aside>

      {/* RIGHT LIVE ON-PAGE VISUAL CANVAS */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 overflow-y-auto max-h-[840px]">
        <div className="mb-3 flex items-center justify-between text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <MousePointerClick className="w-3.5 h-3.5 text-[#009691]" />
            Click any headline, badge, card, or paragraph directly on the page to edit it live
          </span>
          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200">
            {viewport.toUpperCase()} CANVAS
          </span>
        </div>

        <div className={`bg-white transition-all duration-200 ${viewportWidthClass}`}>
          {/* 1. LIVE EDITABLE HERO SECTION */}
          <section
            onClick={() => selectSection("hero")}
            style={{
              backgroundColor: heroStyle.bgColor || "#0f172a",
              color: heroStyle.textColor || "#ffffff",
              padding: heroStyle.padding || "56px 36px",
              textAlign: heroStyle.align === "center" ? "center" : "left",
            }}
            className={`relative group cursor-pointer transition-all ${
              selectedId === "hero"
                ? "ring-2 ring-[#009691] ring-inset"
                : "hover:ring-2 hover:ring-[#009691]/40 hover:ring-inset"
            }`}
          >
            {/* Elementor Section Pill */}
            <div
              className={`absolute top-2 left-1/2 -translate-x-1/2 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#009691] text-white shadow transition-opacity ${
                selectedId === "hero" ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              Hero Section
            </div>

            <div className={`max-w-4xl ${heroStyle.align === "center" ? "mx-auto" : ""}`}>
              {/* Editable Eyebrow Badge */}
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onChangePage({ ...page, heroBadge: e.currentTarget.textContent || "" })}
                style={{
                  backgroundColor: heroStyle.badgeBg || "rgba(0, 150, 145, 0.18)",
                  color: heroStyle.badgeColor || "#5eead4",
                }}
                className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-4 outline-none focus:ring-2 focus:ring-white/40"
              >
                {page.heroBadge}
              </div>

              {/* Editable H1 Headline */}
              <h1
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onChangePage({ ...page, heroHeadline: e.currentTarget.textContent || "" })}
                className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4 outline-none focus:ring-2 focus:ring-white/30 rounded px-1 -mx-1"
              >
                {page.heroHeadline}
              </h1>

              {/* Editable Subtitle */}
              <p
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onChangePage({ ...page, heroSubtitle: e.currentTarget.textContent || "" })}
                className="text-sm sm:text-base opacity-85 leading-relaxed mb-6 max-w-2xl outline-none focus:ring-2 focus:ring-white/30 rounded px-1 -mx-1"
                style={{ marginLeft: heroStyle.align === "center" ? "auto" : undefined, marginRight: heroStyle.align === "center" ? "auto" : undefined }}
              >
                {page.heroSubtitle}
              </p>

              {/* Editable CTA Button */}
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onChangePage({ ...page, primaryCtaText: e.currentTarget.textContent || "" })}
                style={{ backgroundColor: heroStyle.accentColor || "#009691" }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-bold shadow-md outline-none focus:ring-2 focus:ring-white"
              >
                {page.primaryCtaText}
              </div>
            </div>
          </section>

          {/* 2. DYNAMIC ON-PAGE EDITABLE SECTIONS */}
          {sections.map((sec, idx) => {
            const isSelected = selectedId === sec.id;
            const st = sec.style || {};
            const colClass =
              viewport === "mobile"
                ? "grid-cols-1"
                : sec.columns === 2
                ? "grid-cols-1 md:grid-cols-2"
                : sec.columns === 4
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1 md:grid-cols-3";

            return (
              <section
                key={sec.id}
                onClick={(e) => {
                  e.stopPropagation();
                  selectSection(sec.id);
                }}
                style={{
                  backgroundColor: st.bgColor || "#ffffff",
                  color: st.textColor || "#111827",
                  padding: st.padding || "44px 32px",
                  textAlign: st.align === "center" ? "center" : "left",
                }}
                className={`relative group border-t border-gray-100 transition-all ${
                  isSelected
                    ? "ring-2 ring-[#009691] ring-inset"
                    : "hover:ring-2 hover:ring-[#009691]/40 hover:ring-inset"
                }`}
              >
                {/* Floating Elementor Section Controls */}
                <div
                  className={`absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-[#009691] text-white px-2 py-0.5 rounded-full shadow-md text-[10px] font-bold transition-opacity ${
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <span className="px-1">{sec.label}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveSection(idx, -1); }}
                    className="p-0.5 hover:bg-white/20 rounded cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveSection(idx, 1); }}
                    className="p-0.5 hover:bg-white/20 rounded cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); duplicateSection(idx); }}
                    className="p-0.5 hover:bg-white/20 rounded cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }}
                    className="p-0.5 hover:bg-red-500 rounded cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="max-w-5xl mx-auto">
                  {/* Section Heading & Subheading */}
                  <h2
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateSection(sec.id, { heading: e.currentTarget.textContent || "" })}
                    className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2 outline-none focus:ring-2 focus:ring-[#009691]/40 rounded px-1 -mx-1"
                  >
                    {sec.heading}
                  </h2>

                  {sec.subheading !== undefined && (
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateSection(sec.id, { subheading: e.currentTarget.textContent || "" })}
                      className="text-sm opacity-75 mb-6 max-w-2xl outline-none focus:ring-2 focus:ring-[#009691]/40 rounded px-1 -mx-1"
                      style={{ marginLeft: st.align === "center" ? "auto" : undefined, marginRight: st.align === "center" ? "auto" : undefined }}
                    >
                      {sec.subheading}
                    </p>
                  )}

                  {/* TYPE: SERVICES GRID / BENEFITS */}
                  {(sec.type === "services_grid" || sec.type === "benefits") && (
                    <div className={`grid ${colClass} gap-4 text-left`}>
                      {(sec.items || []).map((item) => (
                        <div
                          key={item.id}
                          style={{
                            backgroundColor: st.cardBgColor || "#f9fafb",
                            borderColor: st.cardBorderColor || "#e5e7eb",
                            borderRadius: st.borderRadius || "10px",
                          }}
                          className="p-5 border relative group/card transition-shadow hover:shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSectionItem(sec.id, item.id);
                            }}
                            className="absolute top-2 right-2 p-1 rounded bg-white/90 text-gray-400 hover:text-red-600 opacity-0 group-hover/card:opacity-100 border border-gray-200 transition cursor-pointer"
                            title="Remove Card"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            {item.badge !== undefined && (
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updateSectionItem(sec.id, item.id, { badge: e.currentTarget.textContent || "" })}
                                style={{
                                  backgroundColor: `${st.accentColor || "#009691"}15`,
                                  color: st.accentColor || "#009691",
                                }}
                                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full outline-none"
                              >
                                {item.badge}
                              </span>
                            )}
                            {item.price !== undefined && (
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updateSectionItem(sec.id, item.id, { price: e.currentTarget.textContent || "" })}
                                className="text-xs font-extrabold text-gray-900 outline-none"
                              >
                                {item.price}
                              </span>
                            )}
                          </div>

                          <h3
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateSectionItem(sec.id, item.id, { title: e.currentTarget.textContent || "" })}
                            className="text-base font-bold mb-1.5 outline-none focus:ring-1 focus:ring-[#009691] rounded"
                          >
                            {item.title}
                          </h3>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateSectionItem(sec.id, item.id, { description: e.currentTarget.textContent || "" })}
                            className="text-xs opacity-75 leading-relaxed outline-none focus:ring-1 focus:ring-[#009691] rounded"
                          >
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TYPE: SPLIT FEATURE BANNER */}
                  {sec.type === "split_banner" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-left mt-2">
                      <div className="space-y-4">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateSection(sec.id, { ctaText: e.currentTarget.textContent || "" })}
                          style={{ backgroundColor: st.accentColor || "#009691" }}
                          className="inline-flex items-center px-5 py-2.5 rounded-lg text-white text-xs font-bold shadow cursor-text outline-none"
                        >
                          {sec.ctaText || "Book Diagnostic"}
                        </div>
                      </div>
                      {(sec.items || []).slice(0, 1).map((item) => (
                        <div
                          key={item.id}
                          style={{
                            backgroundColor: st.cardBgColor || "#f8fafc",
                            borderColor: st.cardBorderColor || "#e2e8f0",
                            borderRadius: st.borderRadius || "12px",
                          }}
                          className="p-5 border"
                        >
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateSectionItem(sec.id, item.id, { badge: e.currentTarget.textContent || "" })}
                            style={{ color: st.accentColor || "#009691" }}
                            className="text-[10px] font-bold uppercase tracking-wider block mb-1 outline-none"
                          >
                            {item.badge || "Bench Guarantee"}
                          </span>
                          <h4
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateSectionItem(sec.id, item.id, { title: e.currentTarget.textContent || "" })}
                            className="text-sm font-bold mb-1 outline-none"
                          >
                            {item.title}
                          </h4>
                          <p
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateSectionItem(sec.id, item.id, { description: e.currentTarget.textContent || "" })}
                            className="text-xs opacity-75 leading-relaxed outline-none"
                          >
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TYPE: FAQ ACCORDION */}
                  {sec.type === "faq" && (
                    <div className="space-y-3 text-left max-w-3xl">
                      {(sec.items || []).map((faq) => (
                        <div
                          key={faq.id}
                          style={{
                            backgroundColor: st.cardBgColor || "#fafafa",
                            borderColor: st.cardBorderColor || "#e5e7eb",
                            borderRadius: st.borderRadius || "10px",
                          }}
                          className="p-4 border relative group/faq"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSectionItem(sec.id, faq.id);
                            }}
                            className="absolute top-3 right-3 p-1 rounded bg-white text-gray-400 hover:text-red-600 opacity-0 group-hover/faq:opacity-100 border border-gray-200 transition cursor-pointer"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateSectionItem(sec.id, faq.id, { title: e.currentTarget.textContent || "" })}
                            className="text-sm font-bold mb-1.5 pr-6 outline-none focus:ring-1 focus:ring-[#009691] rounded"
                          >
                            {faq.title}
                          </div>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateSectionItem(sec.id, faq.id, { description: e.currentTarget.textContent || "" })}
                            className="text-xs opacity-80 leading-relaxed outline-none focus:ring-1 focus:ring-[#009691] rounded"
                          >
                            {faq.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TYPE: CTA BANNER */}
                  {sec.type === "cta_banner" && (
                    <div className="mt-4">
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => updateSection(sec.id, { ctaText: e.currentTarget.textContent || "" })}
                        style={{ backgroundColor: st.accentColor || "#009691" }}
                        className="inline-flex items-center px-6 py-3 rounded-lg text-white text-sm font-bold shadow-md outline-none focus:ring-2 focus:ring-white"
                      >
                        {sec.ctaText || "Schedule Repair Now"}
                      </div>
                    </div>
                  )}

                  {/* TYPE: FREEFORM RICHTEXT */}
                  {sec.type === "richtext" && (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateSection(sec.id, { bodyHtml: e.currentTarget.innerHTML })}
                      dangerouslySetInnerHTML={{ __html: sec.bodyHtml || "<p>Click here to edit content...</p>" }}
                      className="sfd-editor-content text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[#009691]/30 rounded p-2 -m-2"
                    />
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
