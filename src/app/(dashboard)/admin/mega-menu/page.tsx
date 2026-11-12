"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Smartphone,
  Tablet,
  Gamepad2,
  Laptop,
  Check,
  Eye,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
} from "lucide-react";

type CategoryKey = "smartphones" | "tablet" | "consoles" | "computers";

interface MegaCategoryData {
  key: CategoryKey;
  label: string;
  iconName: string;
  href: string;
  allLinkText: string;
  popularDevices: string[];
  commonIssues: string[];
  brands: { title: string; subtitle: string; href?: string }[];
}

const INITIAL_MEGA_MENU: Record<CategoryKey, MegaCategoryData> = {
  smartphones: {
    key: "smartphones",
    label: "Smartphones",
    iconName: "Smartphone",
    href: "/repairs/smartphone",
    allLinkText: "All Smartphone Repairs",
    popularDevices: [
      "iPhone 16 Pro Repair",
      "iPhone 15 Repair",
      "iPhone 14 Repair",
      "iPhone 13 Repair",
      "Galaxy S25 Repair",
      "Google Pixel 9 Repair",
    ],
    commonIssues: [
      "Cracked Screen Repair",
      "Phone Battery Replacement",
      "Charging Port Repair",
      "Water Damage Repair",
      "Back Glass Laser Repair",
      "Camera & Lens Repair",
      "Speaker & Mic Fix",
    ],
    brands: [
      { title: "Apple Repair", subtitle: "All Apple Models" },
      { title: "Samsung Repair", subtitle: "All Samsung Models" },
      { title: "Google Repair", subtitle: "All Google Models" },
      { title: "Motorola Repair", subtitle: "All Motorola Models" },
    ],
  },
  tablet: {
    key: "tablet",
    label: "Tablets & iPads",
    iconName: "Tablet",
    href: "/repairs/tablet",
    allLinkText: "All Tablet Repairs",
    popularDevices: [
      "iPad Pro 12.9\" Repair",
      "iPad Air 5 Repair",
      "iPad 10th Gen Repair",
      "iPad Mini 6 Repair",
      "Galaxy Tab S9 Repair",
      "Surface Pro 9 Repair",
    ],
    commonIssues: [
      "Cracked Digitizer / Glass",
      "Tablet Battery Replacement",
      "Charging Port Repair",
      "LCD Display Replacement",
      "Water Damage Diagnostics",
      "Power & Volume Button Fix",
      "Headphone Jack / Audio Fix",
    ],
    brands: [
      { title: "Apple iPad Repair", subtitle: "All iPad Models" },
      { title: "Samsung Tab Repair", subtitle: "All Galaxy Tab Models" },
      { title: "Microsoft Surface", subtitle: "All Surface Models" },
      { title: "Amazon Fire Tablet", subtitle: "All Kindle Fire Models" },
    ],
  },
  consoles: {
    key: "consoles",
    label: "Game Consoles",
    iconName: "Gamepad2",
    href: "/repairs/computer",
    allLinkText: "All Game Console Repairs",
    popularDevices: [
      "PlayStation 5 Repair",
      "PlayStation 4 Pro Repair",
      "Xbox Series X Repair",
      "Xbox Series S Repair",
      "Nintendo Switch OLED",
      "Steam Deck Repair",
    ],
    commonIssues: [
      "HDMI Port Micro-Soldering",
      "Overheating & Fan Repaste",
      "Disc Drive Replacement",
      "No Power / Power Supply Fix",
      "Joy-Con Drift Fix",
      "Software & OS Recovery",
      "Internal Storage Upgrade",
    ],
    brands: [
      { title: "Sony PlayStation", subtitle: "PS5 & PS4 Models" },
      { title: "Microsoft Xbox", subtitle: "Series X/S & One" },
      { title: "Nintendo Repair", subtitle: "Switch, OLED & Lite" },
      { title: "Handheld Consoles", subtitle: "Steam Deck & ROG Ally" },
    ],
  },
  computers: {
    key: "computers",
    label: "Computers & MacBooks",
    iconName: "Laptop",
    href: "/repairs/mac",
    allLinkText: "All Computer & Laptop Repairs",
    popularDevices: [
      "MacBook Pro 14\"/16\" Repair",
      "MacBook Air M2/M3",
      "Dell XPS & Inspiron",
      "HP Pavilion & Envy",
      "Lenovo ThinkPad Repair",
      "Asus ROG & ZenBook",
    ],
    commonIssues: [
      "Laptop Screen Replacement",
      "Battery Replacement",
      "Keyboard & Trackpad Fix",
      "SSD Upgrade & Data Recovery",
      "Liquid Spill Cleanup",
      "Fan Cleaning & Thermal Paste",
      "Virus Removal & OS Install",
    ],
    brands: [
      { title: "Apple MacBook Repair", subtitle: "Pro, Air & iMac" },
      { title: "Dell Laptop Repair", subtitle: "XPS, Latitude, Inspiron" },
      { title: "HP Laptop Repair", subtitle: "Envy, Pavilion, Spectre" },
      { title: "Lenovo & ThinkPad", subtitle: "Yoga, Carbon, Legion" },
    ],
  },
};

export default function MegaMenuBuilderPage() {
  const [megaMenu, setMegaMenu] = useState(INITIAL_MEGA_MENU);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("smartphones");
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // New item inputs
  const [newDevice, setNewDevice] = useState("");
  const [newIssue, setNewIssue] = useState("");
  const [newBrandTitle, setNewBrandTitle] = useState("");
  const [newBrandSubtitle, setNewBrandSubtitle] = useState("");

  const current = megaMenu[activeCategory];

  const handleUpdateField = (field: keyof MegaCategoryData, value: any) => {
    setMegaMenu((prev) => ({
      ...prev,
      [activeCategory]: {
        ...prev[activeCategory],
        [field]: value,
      },
    }));
  };

  // Add handlers
  const handleAddDevice = () => {
    if (!newDevice.trim()) return;
    handleUpdateField("popularDevices", [...current.popularDevices, newDevice.trim()]);
    setNewDevice("");
  };

  const handleDeleteDevice = (index: number) => {
    const updated = [...current.popularDevices];
    updated.splice(index, 1);
    handleUpdateField("popularDevices", updated);
  };

  const handleAddIssue = () => {
    if (!newIssue.trim()) return;
    handleUpdateField("commonIssues", [...current.commonIssues, newIssue.trim()]);
    setNewIssue("");
  };

  const handleDeleteIssue = (index: number) => {
    const updated = [...current.commonIssues];
    updated.splice(index, 1);
    handleUpdateField("commonIssues", updated);
  };

  const handleAddBrand = () => {
    if (!newBrandTitle.trim()) return;
    handleUpdateField("brands", [
      ...current.brands,
      { title: newBrandTitle.trim(), subtitle: newBrandSubtitle.trim() || "All Models" },
    ]);
    setNewBrandTitle("");
    setNewBrandSubtitle("");
  };

  const handleDeleteBrand = (index: number) => {
    const updated = [...current.brands];
    updated.splice(index, 1);
    handleUpdateField("brands", updated);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedToast(`Mega-Menu configuration published to customer website!`);
      setTimeout(() => setSavedToast(null), 3500);
    }, 500);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5 overflow-x-hidden">
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8e8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] sm:text-[24px] font-bold text-[#111111] tracking-[-0.02em]">
              Mega Menu Builder
            </h1>
            <span className="text-[11px] font-semibold text-[#009691] bg-[#009691]/10 px-2 py-0.5 rounded-full">
              Live Site Navigation
            </span>
          </div>
          <p className="text-[13px] text-[#5f6368] mt-0.5">
            Configure popular devices, common issues, and brand cards displayed inside the public website's &quot;Repair&quot; mega-dropdown
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="h-[34px] px-3.5 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-gray-50 text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>Preview on Site</span>
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
            <span>{isSaving ? "Publishing..." : "Publish Mega Menu"}</span>
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

      {/* 2. CATEGORY SWITCHER TABS */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb] overflow-x-auto no-scrollbar pb-px">
        {[
          { id: "smartphones", label: "📱 Smartphones", count: megaMenu.smartphones.popularDevices.length },
          { id: "tablet", label: "📟 Tablets & iPads", count: megaMenu.tablet.popularDevices.length },
          { id: "consoles", label: "🎮 Game Consoles", count: megaMenu.consoles.popularDevices.length },
          { id: "computers", label: "💻 Computers & MacBooks", count: megaMenu.computers.popularDevices.length },
        ].map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as CategoryKey)}
              className={`h-[40px] px-4 rounded-t-[6px] text-[13px] font-medium inline-flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                isActive
                  ? "border-[#009691] text-[#009691] bg-white font-bold"
                  : "border-transparent text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f4f6]"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#009691]/10 text-[#009691]" : "bg-gray-100 text-gray-500"}`}>
                {tab.count} Devices
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE (SPLIT: 3 COLUMNS EDITOR ON LEFT, REAL-TIME MEGA MENU PREVIEW ON RIGHT) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: MEGA MENU COLUMN EDITORS (7 COLS on XL) */}
        <div className="xl:col-span-7 flex flex-col gap-5">
          
          {/* CATEGORY BASIC SETTINGS */}
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-4 shadow-2xs flex flex-col gap-3">
            <span className="text-[12px] font-bold text-[#111111] uppercase tracking-wider block border-b border-[#f2f2f2] pb-2">
              Category Header &amp; Link Target
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Category Display Name
                </label>
                <input
                  type="text"
                  value={current.label}
                  onChange={(e) => handleUpdateField("label", e.target.value)}
                  className="w-full h-[34px] px-2.5 rounded-[5px] border border-gray-300 text-[13px] font-semibold focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={current.href}
                  onChange={(e) => handleUpdateField("href", e.target.value)}
                  className="w-full h-[34px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] font-mono text-gray-700 focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Bottom CTA Button Label
                </label>
                <input
                  type="text"
                  value={current.allLinkText}
                  onChange={(e) => handleUpdateField("allLinkText", e.target.value)}
                  className="w-full h-[34px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] focus:outline-none focus:border-[#009691]"
                />
              </div>
            </div>
          </div>

          {/* COLUMN 1: POPULAR DEVICES */}
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-4 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#f2f2f2]">
              <span className="text-[13px] font-bold text-[#111111]">
                Column 1: Popular Devices ({current.popularDevices.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newDevice}
                onChange={(e) => setNewDevice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDevice()}
                placeholder="e.g. iPhone 16 Plus Repair..."
                className="flex-1 h-[32px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] focus:outline-none focus:border-[#009691]"
              />
              <button
                type="button"
                onClick={handleAddDevice}
                className="h-[32px] px-3 rounded-[5px] bg-[#009691] hover:bg-[#007f7b] text-white text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              {current.popularDevices.map((dev, i) => (
                <div
                  key={i}
                  className="bg-[#f9fafb] border border-gray-200 rounded-[5px] px-2.5 py-1 text-[12px] flex items-center gap-2"
                >
                  <span className="font-medium text-[#111111]">{dev}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteDevice(i)}
                    className="text-gray-400 hover:text-red-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: COMMON ISSUES */}
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-4 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#f2f2f2]">
              <span className="text-[13px] font-bold text-[#111111]">
                Column 2: Common Issues &amp; Services ({current.commonIssues.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newIssue}
                onChange={(e) => setNewIssue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddIssue()}
                placeholder="e.g. Broken Camera Glass..."
                className="flex-1 h-[32px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] focus:outline-none focus:border-[#009691]"
              />
              <button
                type="button"
                onClick={handleAddIssue}
                className="h-[32px] px-3 rounded-[5px] bg-[#009691] hover:bg-[#007f7b] text-white text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              {current.commonIssues.map((issue, i) => (
                <div
                  key={i}
                  className="bg-[#f9fafb] border border-gray-200 rounded-[5px] px-2.5 py-1 text-[12px] flex items-center gap-2"
                >
                  <span className="font-medium text-[#111111]">{issue}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteIssue(i)}
                    className="text-gray-400 hover:text-red-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 3: BRANDS */}
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-4 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#f2f2f2]">
              <span className="text-[13px] font-bold text-[#111111]">
                Column 3: Brand Cards ({current.brands.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newBrandTitle}
                onChange={(e) => setNewBrandTitle(e.target.value)}
                placeholder="Brand Title (e.g. Apple Repair)"
                className="h-[32px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] focus:outline-none focus:border-[#009691]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newBrandSubtitle}
                  onChange={(e) => setNewBrandSubtitle(e.target.value)}
                  placeholder="Subtitle (e.g. All iPhone Models)"
                  className="flex-1 h-[32px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] focus:outline-none focus:border-[#009691]"
                />
                <button
                  type="button"
                  onClick={handleAddBrand}
                  className="h-[32px] px-3 rounded-[5px] bg-[#009691] hover:bg-[#007f7b] text-white text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {current.brands.map((b, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-[6px] bg-[#f9fafb] border border-gray-200 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[12px] font-semibold text-[#111111] block">
                      {b.title}
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      {b.subtitle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteBrand(i)}
                    className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: REAL-TIME SIMULATED MEGA MENU FLYOUT (5 COLS on XL) */}
        <div className="xl:col-span-5 sticky top-16 flex flex-col gap-3">
          
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#009691]" />
              <span className="text-[13px] font-bold text-[#111111]">
                Live Mega-Menu Flyout Preview
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#009691] bg-[#009691]/10 px-2 py-0.5 rounded">
              Active: {current.label}
            </span>
          </div>

          {/* SIMULATED DESKTOP NAVBAR & FLYOUT */}
          <div className="bg-white border border-gray-300 rounded-[10px] overflow-hidden shadow-lg">
            
            {/* Header tab strip */}
            <div className="bg-[#1a1a1a] text-white p-3 flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#009691] text-white text-[9px] font-bold flex items-center justify-center">
                  SF
                </span>
                <span className="font-bold">SmartFoneDoctor Navbar</span>
              </div>
              <span className="bg-[#009691] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {current.label} Menu Open
              </span>
            </div>

            {/* Simulated 3-Column Mega Menu Container */}
            <div className="p-4 bg-white text-[12px] flex flex-col gap-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Col 1: Popular Devices */}
                <div className="flex flex-col gap-1.5 border-r border-gray-100 pr-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Popular Devices
                  </span>
                  {current.popularDevices.slice(0, 6).map((d, i) => (
                    <div
                      key={i}
                      className="text-[#111111] hover:text-[#009691] py-0.5 truncate cursor-pointer font-medium"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Col 2: Common Issues */}
                <div className="flex flex-col gap-1.5 border-r border-gray-100 pr-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Common Issues
                  </span>
                  {current.commonIssues.slice(0, 6).map((iss, i) => (
                    <div
                      key={i}
                      className="text-[#111111] hover:text-[#009691] py-0.5 truncate cursor-pointer font-medium"
                    >
                      {iss}
                    </div>
                  ))}
                </div>

                {/* Col 3: Brands */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                    Select Brand
                  </span>
                  {current.brands.slice(0, 3).map((b, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-gray-50 border border-gray-200 hover:border-[#009691] cursor-pointer"
                    >
                      <span className="font-bold text-[#111111] block text-[11px] truncate">{b.title}</span>
                      <span className="text-[10px] text-gray-500 block truncate">{b.subtitle}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Bottom bar of Mega Menu */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  3 Convenient Philadelphia Locations
                </span>
                <span className="text-[12px] font-bold text-[#009691] inline-flex items-center gap-1 cursor-pointer hover:underline">
                  <span>{current.allLinkText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>

          </div>

          <p className="text-[11px] text-center text-gray-400">
            ⚡ Updates instantaneously as you add or remove items on the left.
          </p>

        </div>

      </div>
    </div>
  );
}
