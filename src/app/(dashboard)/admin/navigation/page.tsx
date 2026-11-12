"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  ChevronDown,
  Layers,
  Check,
  Megaphone,
  Smartphone,
  Tablet,
  Laptop,
  Gamepad2,
  ArrowRight,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
  subItems?: { label: string; href: string; badge?: string }[];
}

export default function NavigationBuilderPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // TopBar State
  const [topBarEnabled, setTopBarEnabled] = useState(true);
  const [topBarNotice, setTopBarNotice] = useState(
    "Philadelphia's Trusted Device Repair Experts · Walk-ins Welcome Mon–Sat"
  );
  const [topBarPromo, setTopBarPromo] = useState(
    "Free Glass Screen Protector with any Screen Repair"
  );
  const [topBarPhone, setTopBarPhone] = useState("+1 (215) 598-2090");

  // Header Nav Menu Items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "m-repairs",
      label: "Repair Devices (Mega-Menu)",
      href: "/repairs",
      subItems: [
        { label: "iPhone Screen & Battery", href: "/repairs/iphone", badge: "30 Min" },
        { label: "Samsung Galaxy & Pixel", href: "/repairs/smartphone", badge: "OEM Parts" },
        { label: "iPad & Tablet Repair", href: "/repairs/ipad" },
        { label: "MacBook & Laptop Service", href: "/repairs/mac" },
        { label: "PS5 & Console HDMI Micro-Soldering", href: "/repairs/computer", badge: "Specialty" },
      ],
    },
    { id: "m-estimate", label: "Free Estimate", href: "/schedule-repair", badge: "Free" },
    { id: "m-locations", label: "Locations", href: "/locations" },
    { id: "m-track", label: "Track Status", href: "/track", badge: "Live" },
    { id: "m-about", label: "About Us", href: "/about" },
  ]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedToast("Header navigation and top promotional banner updated!");
      setTimeout(() => setSavedToast(null), 3500);
    }, 500);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5 overflow-x-hidden">
      {/* 1. TOP HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8e8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] sm:text-[24px] font-bold text-[#111111] tracking-[-0.02em]">
              Navigation &amp; Menus
            </h1>
          </div>
          <p className="text-[13px] text-[#5f6368] mt-0.5">
            Configure header mega-menus, top promotional banners, and customer action links
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="h-[34px] px-3.5 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-gray-50 text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>Live Site</span>
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
            <span>{isSaving ? "Saving..." : "Save Navigation"}</span>
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

      {/* 2. SECTION 1: TOPBAR PROMO & ANNOUNCEMENT */}
      <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#009691]" />
            <h2 className="text-[15px] font-bold text-[#111111]">
              Top Green Announcement &amp; Promotion Bar
            </h2>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={topBarEnabled}
              onChange={(e) => setTopBarEnabled(e.target.checked)}
              className="w-4 h-4 text-[#009691] rounded accent-[#009691]"
            />
            <span className={`text-[12px] font-bold ${topBarEnabled ? "text-emerald-700" : "text-gray-400"}`}>
              {topBarEnabled ? "Enabled (Visible)" : "Disabled (Hidden)"}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[12px] font-medium text-[#111111] mb-1">
              Store Schedule &amp; Walk-In Notice
            </label>
            <input
              type="text"
              value={topBarNotice}
              onChange={(e) => setTopBarNotice(e.target.value)}
              className="w-full h-[36px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] focus:outline-none focus:border-[#009691]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#111111] mb-1">
              Store Hotline Phone
            </label>
            <input
              type="text"
              value={topBarPhone}
              onChange={(e) => setTopBarPhone(e.target.value)}
              className="w-full h-[36px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] focus:outline-none focus:border-[#009691]"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[12px] font-medium text-[#111111] mb-1">
              Promotional Offer Badge (White Pill on Green Bar)
            </label>
            <input
              type="text"
              value={topBarPromo}
              onChange={(e) => setTopBarPromo(e.target.value)}
              className="w-full h-[36px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-medium text-[#009691] focus:outline-none focus:border-[#009691]"
            />
          </div>
        </div>

        {/* Live TopBar Mini Preview */}
        {topBarEnabled && (
          <div className="mt-2 bg-[#009691] text-white py-2 px-4 rounded-[6px] text-[12px] flex items-center justify-between gap-3 shadow-inner">
            <span className="truncate">{topBarNotice}</span>
            <div className="flex items-center gap-3 shrink-0">
              <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold">
                {topBarPromo}
              </span>
              <span className="font-semibold">{topBarPhone}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. SECTION 2: HEADER NAVIGATION TREE (WORDPRESS / SHOPIFY PATTERN) */}
      <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-5 shadow-2xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
          <div className="flex items-center gap-2">
            <Menu className="w-4 h-4 text-[#009691]" />
            <h2 className="text-[15px] font-bold text-[#111111]">
              Primary Header Navigation Tree
            </h2>
          </div>
          <span className="text-[12px] text-gray-500">
            {menuItems.length} Top-Level Items
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {menuItems.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-[8px] border border-[#e5e7eb] bg-[#fafafa] flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1">
                  <span className="w-6 h-6 rounded-full bg-[#111111] text-white text-[11px] font-bold flex items-center justify-center font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const updated = [...menuItems];
                      updated[idx].label = e.target.value;
                      setMenuItems(updated);
                    }}
                    className="h-[34px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#009691] flex-1 max-w-[280px]"
                  />
                  <input
                    type="text"
                    value={item.href}
                    onChange={(e) => {
                      const updated = [...menuItems];
                      updated[idx].href = e.target.value;
                      setMenuItems(updated);
                    }}
                    className="h-[34px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white text-[12px] font-mono text-gray-600 focus:outline-none focus:border-[#009691] flex-1 max-w-[240px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {item.subItems ? (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      Mega-Dropdown ({item.subItems.length} Links)
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                      Single Link
                    </span>
                  )}
                </div>
              </div>

              {/* Sub-menu tree if mega-menu */}
              {item.subItems && (
                <div className="pl-6 border-l-2 border-[#009691] flex flex-col gap-2 mt-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Dropdown Sub-Links:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {item.subItems.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-2.5 rounded-[6px] bg-white border border-gray-200 shadow-2xs flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[12px] font-semibold text-[#111111] block">
                            {sub.label}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono block">
                            {sub.href}
                          </span>
                        </div>
                        {sub.badge && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.5 rounded">
                            {sub.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
