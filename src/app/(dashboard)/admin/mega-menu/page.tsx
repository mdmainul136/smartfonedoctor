"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  Tablet,
  Gamepad2,
  Laptop,
  Check,
  Eye,
  ChevronRight,
  ChevronDown,
  Trash2,
  Plus,
  RotateCcw,
  Sparkles,
  Layers,
  MapPin,
  ExternalLink,
  Save,
  Sliders,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  CategoryKey,
  MegaCategoryData,
  MegaMenuConfig,
  DEFAULT_MEGA_MENU_CONFIG,
  getStoredMegaMenu,
  saveStoredMegaMenu,
} from "@/lib/megaMenuData";

export default function MegaMenuBuilderPage() {
  const [config, setConfig] = useState<MegaMenuConfig>(DEFAULT_MEGA_MENU_CONFIG);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("smartphones");
  const [activeTab, setActiveTab] = useState<"columns" | "cta">("columns");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  // Form input states for adding items
  const [newDevice, setNewDevice] = useState("");
  const [newIssue, setNewIssue] = useState("");
  const [newBrandTitle, setNewBrandTitle] = useState("");
  const [newBrandSubtitle, setNewBrandSubtitle] = useState("");

  // Load stored config on mount
  useEffect(() => {
    const stored = getStoredMegaMenu();
    setConfig(stored);
  }, []);

  const currentCategory = config.categories[activeCategory];

  // Save changes
  const handleSave = () => {
    saveStoredMegaMenu(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Reset to original defaults
  const handleReset = () => {
    if (confirm("Reset mega menu to official default settings?")) {
      setConfig(DEFAULT_MEGA_MENU_CONFIG);
      saveStoredMegaMenu(DEFAULT_MEGA_MENU_CONFIG);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  // Add Popular Device
  const handleAddDevice = () => {
    if (!newDevice.trim()) return;
    setConfig((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [activeCategory]: {
          ...prev.categories[activeCategory],
          popularDevices: [...prev.categories[activeCategory].popularDevices, newDevice.trim()],
        },
      },
    }));
    setNewDevice("");
  };

  // Remove Popular Device
  const handleRemoveDevice = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [activeCategory]: {
          ...prev.categories[activeCategory],
          popularDevices: prev.categories[activeCategory].popularDevices.filter((_, i) => i !== index),
        },
      },
    }));
  };

  // Add Common Issue
  const handleAddIssue = () => {
    if (!newIssue.trim()) return;
    setConfig((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [activeCategory]: {
          ...prev.categories[activeCategory],
          commonIssues: [...prev.categories[activeCategory].commonIssues, newIssue.trim()],
        },
      },
    }));
    setNewIssue("");
  };

  // Remove Common Issue
  const handleRemoveIssue = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [activeCategory]: {
          ...prev.categories[activeCategory],
          commonIssues: prev.categories[activeCategory].commonIssues.filter((_, i) => i !== index),
        },
      },
    }));
  };

  // Add Brand
  const handleAddBrand = () => {
    if (!newBrandTitle.trim()) return;
    setConfig((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [activeCategory]: {
          ...prev.categories[activeCategory],
          brands: [
            ...prev.categories[activeCategory].brands,
            {
              title: newBrandTitle.trim(),
              subtitle: newBrandSubtitle.trim() || `All ${newBrandTitle.trim()} Models`,
            },
          ],
        },
      },
    }));
    setNewBrandTitle("");
    setNewBrandSubtitle("");
  };

  // Remove Brand
  const handleRemoveBrand = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [activeCategory]: {
          ...prev.categories[activeCategory],
          brands: prev.categories[activeCategory].brands.filter((_, i) => i !== index),
        },
      },
    }));
  };

  // Update All Link Text
  const handleUpdateAllLinkText = (text: string) => {
    setConfig((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [activeCategory]: {
          ...prev.categories[activeCategory],
          allLinkText: text,
        },
      },
    }));
  };

  // Helper to render icons
  const renderCategoryIcon = (key: CategoryKey, className = "w-5 h-5") => {
    switch (key) {
      case "smartphones":
        return <Smartphone className={className} />;
      case "tablet":
        return <Tablet className={className} />;
      case "consoles":
        return <Gamepad2 className={className} />;
      case "computers":
        return <Laptop className={className} />;
    }
  };

  const categoryKeys: CategoryKey[] = ["smartphones", "tablet", "consoles", "computers"];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto space-y-6">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-[#e8e8e8]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                Mega Menu Builder
              </h1>
              <p className="text-[13px] text-[#6b6b6b]">
                Visual editor for the customer storefront navigation. Live synchronized with <span className="font-semibold text-neutral-800">smartfonedoctor.com</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="h-[36px] px-3 rounded-[6px] border border-gray-300 bg-white hover:bg-gray-50 text-[13px] font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to default menu items"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="h-[36px] px-3 rounded-[6px] border border-gray-300 bg-white hover:bg-gray-50 text-[13px] font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            className="h-[36px] px-4 rounded-[6px] bg-[#00897b] hover:bg-[#00796b] text-white text-[13px] font-semibold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Saved &amp; Published!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save &amp; Publish Menu</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. LIVE STOREFRONT PREVIEW WINDOW (Pixel-perfect mirror of user's uploaded screenshot) */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
        
        {/* Mock Browser Header Bar */}
        <div className="bg-[#f0f2f5] border-b border-gray-300 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
            <span className="ml-2 text-[12px] font-semibold text-gray-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#00897b]" />
              Customer Live Front-End Mega Menu Preview
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-white px-3 py-1 rounded-md border border-gray-200 text-[11px] text-gray-500 font-mono">
              https://smartfonedoctor.com/ (Desktop Header)
            </div>
            <button
              type="button"
              onClick={() => setPreviewExpanded(!previewExpanded)}
              className="text-gray-600 hover:text-black p-1"
              title={previewExpanded ? "Collapse preview" : "Expand preview"}
            >
              {previewExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* SIMULATED DESKTOP WEBSITE HEADER */}
        <div className="bg-white border-b border-neutral-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col leading-none">
              <span className="text-[18px] font-black tracking-tighter text-[#1d1c1a]">
                SMART <span className="text-[#00897b]">FONE</span> DOCTOR
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-gray-400 uppercase">
                Philadelphia Repair Bench
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-5 text-[14px] font-medium text-[#1d1c1a]">
            {/* Active Repair button with Open Chevron */}
            <div className="px-3.5 py-1.5 rounded border border-[#1d1c1a] bg-white flex items-center gap-1.5 font-semibold text-[#1d1c1a]">
              <span>Repair</span>
              <ChevronDown className="w-4 h-4 rotate-180 text-[#00897b]" />
            </div>

            <div className="flex items-center gap-1 text-gray-700 hover:text-[#00897b] cursor-pointer">
              <span>Repairs &amp; Services</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>

            <div className="px-3 py-1 rounded-full bg-[#00897b]/10 text-[#00897b] font-semibold flex items-center gap-1.5 text-[13px]">
              <span className="w-2 h-2 rounded-full bg-[#00897b] animate-pulse" />
              <span>Free Estimate</span>
            </div>

            <span className="text-gray-700 hover:text-[#00897b] cursor-pointer">Locations</span>

            <div className="px-3 py-1 rounded-full border border-[#00897b] text-[#1d1c1a] font-semibold text-[13px] bg-[#00897b]/10">
              Track Status
            </div>

            <span className="text-gray-700 hover:text-[#00897b] cursor-pointer">About Us</span>
          </div>

          {/* Start Repair CTA */}
          <div className="hidden lg:block">
            <span className="px-4 py-2 rounded bg-[#00897b] text-white font-bold text-[12px] uppercase tracking-wider">
              START REPAIR
            </span>
          </div>
        </div>

        {/* CPR STYLE FULL-WIDTH MEGA MENU BODY (Identical to screenshot) */}
        <div className="w-full bg-[#f5f5f5] border-t border-neutral-200 p-6 sm:p-8">
          <div className="max-w-[1350px] mx-auto">
            
            {/* Top Category Selector Row (Pills with chevron) */}
            <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-neutral-200">
              {categoryKeys.map((key) => {
                const cat = config.categories[key];
                const isActive = activeCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategory(key)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-white text-[#1d1c1a] shadow-xs font-bold border border-neutral-200/80"
                        : "text-neutral-600 hover:bg-white/70 hover:text-[#1d1c1a]"
                    }`}
                  >
                    <span className={isActive ? "text-[#00897b]" : "text-neutral-500"}>
                      {renderCategoryIcon(key, "w-5 h-5")}
                    </span>
                    <span>{cat.label}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </button>
                );
              })}
            </div>

            {/* Inner Grid: Left 8 Columns (Devices, Issues, Brands) + Right 4 Columns (CTA Card) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-6">
              
              {/* LEFT 8 COLUMNS: 3 SUB-COLUMNS */}
              <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Col 1: Popular Devices */}
                <div className="md:pr-6 md:border-r border-neutral-200 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[15px] font-bold text-[#1d1c1a] mb-4">
                      Popular Devices
                    </h4>
                    <ul className="space-y-3.5 text-[14px] text-neutral-600">
                      {currentCategory.popularDevices.map((device, i) => (
                        <li key={i} className="hover:text-[#00897b] transition-colors cursor-pointer">
                          {device}
                        </li>
                      ))}
                      {currentCategory.popularDevices.length === 0 && (
                        <li className="text-gray-400 italic text-[13px]">No devices added yet.</li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-6">
                    <span className="inline-flex items-center gap-1 text-[14px] font-bold text-[#1d1c1a] underline hover:text-[#00897b] cursor-pointer">
                      <span>View All</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Col 2: Common Issues */}
                <div className="md:px-6 md:border-r border-neutral-200 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[15px] font-bold text-[#1d1c1a] mb-4">
                      Common Issues
                    </h4>
                    <ul className="space-y-3.5 text-[14px] text-neutral-600">
                      {currentCategory.commonIssues.map((issue, i) => (
                        <li key={i} className="hover:text-[#00897b] transition-colors cursor-pointer">
                          {issue}
                        </li>
                      ))}
                      {currentCategory.commonIssues.length === 0 && (
                        <li className="text-gray-400 italic text-[13px]">No issues added yet.</li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-6">
                    <span className="inline-flex items-center gap-1 text-[14px] font-bold text-[#1d1c1a] underline hover:text-[#00897b] cursor-pointer">
                      <span>View All</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Col 3: By Brand */}
                <div className="md:pl-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[15px] font-bold text-[#1d1c1a] mb-4">
                      By Brand
                    </h4>
                    <ul className="space-y-4">
                      {currentCategory.brands.map((brand, i) => (
                        <li key={i} className="flex items-center justify-between group cursor-pointer">
                          <div>
                            <p className="text-[14px] font-medium text-neutral-800 group-hover:text-[#00897b] transition-colors">
                              {brand.title}
                            </p>
                            <p className="text-[13px] text-neutral-500">
                              {brand.subtitle}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#00897b] group-hover:translate-x-0.5 transition-transform" />
                        </li>
                      ))}
                      {currentCategory.brands.length === 0 && (
                        <li className="text-gray-400 italic text-[13px]">No brands added yet.</li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <span className="inline-flex items-center justify-between w-full text-[14px] font-bold text-[#1d1c1a] underline hover:text-[#00897b] cursor-pointer">
                      <span>{currentCategory.allLinkText}</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

              </div>

              {/* RIGHT 4 COLUMNS: THE WHITE "Need your device fixed?" CTA CARD */}
              <div className="xl:col-span-4 flex flex-col">
                <div className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-xs border border-neutral-100 flex flex-col items-center justify-center flex-1">
                  
                  {/* Circular Teal Pin Icon */}
                  <div className="w-12 h-12 rounded-full border-2 border-[#00897b]/40 flex items-center justify-center text-[#00897b] mb-4">
                    <MapPin className="w-6 h-6" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-normal text-[#1d1c1a] leading-tight mb-3">
                    {config.ctaCard.title}
                  </h3>

                  <p className="text-sm text-neutral-600 max-w-xs mb-6 leading-relaxed">
                    {config.ctaCard.description}
                  </p>

                  <div className="w-full space-y-3">
                    <button
                      type="button"
                      className="block w-full py-3.5 px-6 rounded-full bg-[#00897b] hover:opacity-90 text-white font-bold text-sm transition shadow-sm cursor-pointer"
                    >
                      {config.ctaCard.primaryBtnText}
                    </button>

                    <button
                      type="button"
                      className="block w-full py-3.5 px-6 rounded-full border border-neutral-400 hover:border-[#1d1c1a] text-[#1d1c1a] font-bold text-sm bg-white hover:bg-neutral-50 transition cursor-pointer"
                    >
                      {config.ctaCard.secondaryBtnText}
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* 3. EDITOR CONTROL PANEL (Applying /awesome-design high-productivity layout) */}
      <div className="bg-white border border-[#e8e8e8] rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
        
        {/* Editor Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#00897b]" />
            <h2 className="text-base font-bold text-[#111111]">
              Menu Content Editor
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-[#f4f5f7] p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("columns")}
              className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors cursor-pointer ${
                activeTab === "columns"
                  ? "bg-white text-[#111111] shadow-2xs"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Columns &amp; Devices ({currentCategory.label})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cta")}
              className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors cursor-pointer ${
                activeTab === "cta"
                  ? "bg-white text-[#111111] shadow-2xs"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Right CTA Card Settings
            </button>
          </div>
        </div>

        {/* TAB 1: 3-COLUMN REPAIR ITEM EDITORS */}
        {activeTab === "columns" && (
          <div className="space-y-6">
            
            {/* Category Selector Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold text-gray-500 mr-2">
                Active Category:
              </span>
              {categoryKeys.map((key) => {
                const isSelected = activeCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategory(key)}
                    className={`h-[32px] px-3 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#00897b] text-white shadow-xs"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {renderCategoryIcon(key, "w-3.5 h-3.5")}
                    <span>{config.categories[key].label}</span>
                  </button>
                );
              })}
            </div>

            {/* 3 Columns Edit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* 1. Popular Devices Editor */}
              <div className="bg-[#f9fafb] border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#111111]">
                    Popular Devices
                  </span>
                  <span className="text-[11px] font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    {currentCategory.popularDevices.length} items
                  </span>
                </div>

                {/* Add new device input */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newDevice}
                    onChange={(e) => setNewDevice(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddDevice()}
                    placeholder="e.g. iPhone 16 Plus Repair"
                    className="flex-1 h-[32px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] bg-white focus:outline-none focus:border-[#00897b]"
                  />
                  <button
                    type="button"
                    onClick={handleAddDevice}
                    className="h-[32px] px-2.5 rounded-[5px] bg-[#00897b] hover:bg-[#00796b] text-white text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* List */}
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                  {currentCategory.popularDevices.map((device, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-[5px] bg-white border border-gray-200 flex items-center justify-between text-[12px] text-gray-800"
                    >
                      <span className="truncate pr-2">{device}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDevice(idx)}
                        className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer"
                        title="Remove device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Common Issues Editor */}
              <div className="bg-[#f9fafb] border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#111111]">
                    Common Issues
                  </span>
                  <span className="text-[11px] font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    {currentCategory.commonIssues.length} items
                  </span>
                </div>

                {/* Add new issue input */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddIssue()}
                    placeholder="e.g. HDMI Port Fix"
                    className="flex-1 h-[32px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] bg-white focus:outline-none focus:border-[#00897b]"
                  />
                  <button
                    type="button"
                    onClick={handleAddIssue}
                    className="h-[32px] px-2.5 rounded-[5px] bg-[#00897b] hover:bg-[#00796b] text-white text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* List */}
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                  {currentCategory.commonIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-[5px] bg-white border border-gray-200 flex items-center justify-between text-[12px] text-gray-800"
                    >
                      <span className="truncate pr-2">{issue}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIssue(idx)}
                        className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer"
                        title="Remove issue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. By Brand Editor */}
              <div className="bg-[#f9fafb] border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#111111]">
                    By Brand
                  </span>
                  <span className="text-[11px] font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    {currentCategory.brands.length} brands
                  </span>
                </div>

                {/* Add new brand input */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newBrandTitle}
                    onChange={(e) => setNewBrandTitle(e.target.value)}
                    placeholder="Brand Title (e.g. Sony PlayStation)"
                    className="w-full h-[32px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] bg-white focus:outline-none focus:border-[#00897b]"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newBrandSubtitle}
                      onChange={(e) => setNewBrandSubtitle(e.target.value)}
                      placeholder="Subtitle (e.g. PS5 & PS4 Models)"
                      className="flex-1 h-[32px] px-2.5 rounded-[5px] border border-gray-300 text-[12px] bg-white focus:outline-none focus:border-[#00897b]"
                    />
                    <button
                      type="button"
                      onClick={handleAddBrand}
                      className="h-[32px] px-2.5 rounded-[5px] bg-[#00897b] hover:bg-[#00796b] text-white text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {currentCategory.brands.map((brand, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-[5px] bg-white border border-gray-200 flex items-center justify-between text-[12px] text-gray-800"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold block truncate">{brand.title}</span>
                        <span className="text-[10px] text-gray-500 block truncate">{brand.subtitle}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBrand(idx)}
                        className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer"
                        title="Remove brand"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Row: Category Footer Link Text */}
            <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-gray-600">
                  Bottom CTA Link Text:
                </span>
                <input
                  type="text"
                  value={currentCategory.allLinkText}
                  onChange={(e) => handleUpdateAllLinkText(e.target.value)}
                  className="h-[32px] px-3 rounded-[5px] border border-gray-300 text-[12px] w-64 bg-white focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <span className="text-[11px] text-gray-400">
                ⚡ Any changes made above immediately reflect in the Live Storefront Preview above.
              </span>
            </div>

          </div>
        )}

        {/* TAB 2: RIGHT CTA CARD EDITOR */}
        {activeTab === "cta" && (
          <div className="max-w-2xl space-y-4">
            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-1">
                Headline / Title
              </label>
              <input
                type="text"
                value={config.ctaCard.title}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    ctaCard: { ...prev.ctaCard, title: e.target.value },
                  }))
                }
                className="w-full h-[36px] px-3 rounded-[6px] border border-gray-300 text-[13px] focus:outline-none focus:border-[#00897b]"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-1">
                Description / Subtitle
              </label>
              <textarea
                rows={2}
                value={config.ctaCard.description}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    ctaCard: { ...prev.ctaCard, description: e.target.value },
                  }))
                }
                className="w-full p-2.5 rounded-[6px] border border-gray-300 text-[13px] focus:outline-none focus:border-[#00897b]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-gray-700 block mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={config.ctaCard.primaryBtnText}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ctaCard: { ...prev.ctaCard, primaryBtnText: e.target.value },
                    }))
                  }
                  className="w-full h-[36px] px-3 rounded-[6px] border border-gray-300 text-[13px] focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-gray-700 block mb-1">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={config.ctaCard.secondaryBtnText}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      ctaCard: { ...prev.ctaCard, secondaryBtnText: e.target.value },
                    }))
                  }
                  className="w-full h-[36px] px-3 rounded-[6px] border border-gray-300 text-[13px] focus:outline-none focus:border-[#00897b]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="h-[36px] px-4 rounded-[6px] bg-[#00897b] hover:bg-[#00796b] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save CTA Changes</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
