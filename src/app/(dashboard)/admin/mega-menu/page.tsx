"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  FolderTree,
  Link2,
} from "lucide-react";
import {
  CategoryKey,
  MegaCategoryData,
  MegaMenuConfig,
  DEFAULT_MEGA_MENU_CONFIG,
  getStoredMegaMenu,
  saveStoredMegaMenu,
  getDeviceUrl,
  getIssueUrl,
  getBrandUrl,
} from "@/lib/megaMenuData";
import {
  resolveTaxonomyUrl,
  getAllLinkableEntities,
  DEVICE_MODELS_TAXONOMY,
  SERVICE_ISSUES_TAXONOMY,
  BRANDS_TAXONOMY,
} from "@/lib/taxonomy";

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
  const handleAddDevice = (customName?: string) => {
    const nameToAdd = (customName || newDevice).trim();
    if (!nameToAdd) return;
    setConfig((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [activeCategory]: {
          ...prev.categories[activeCategory],
          popularDevices: [...prev.categories[activeCategory].popularDevices, nameToAdd],
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
  const handleAddIssue = (customTitle?: string) => {
    const titleToAdd = (customTitle || newIssue).trim();
    if (!titleToAdd) return;
    setConfig((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [activeCategory]: {
          ...prev.categories[activeCategory],
          commonIssues: [...prev.categories[activeCategory].commonIssues, titleToAdd],
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
  const handleAddBrand = (customBrand?: { title: string; subtitle: string }) => {
    const title = (customBrand?.title || newBrandTitle).trim();
    const subtitle = (customBrand?.subtitle || newBrandSubtitle).trim() || `All ${title} Models`;
    if (!title) return;

    setConfig((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [activeCategory]: {
          ...prev.categories[activeCategory],
          brands: [
            ...prev.categories[activeCategory].brands,
            { title, subtitle },
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
                Mega Menu Builder &amp; URL Router
              </h1>
              <p className="text-[13px] text-[#6b6b6b]">
                Visual editor for customer storefront navigation. Every item automatically attaches to verified taxonomy routes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/taxonomies"
            className="h-[36px] px-3 rounded-[6px] border border-gray-300 bg-white hover:bg-gray-50 text-[13px] font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <FolderTree className="w-3.5 h-3.5 text-indigo-600" />
            <span>Manage Taxonomies</span>
          </Link>

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

        {/* SIMULATED DESKTOP WEBSITE HEADER (1:1 with user's front-end navbar) */}
        <div className="bg-white border-b border-neutral-200 px-4 sm:px-8 py-3 flex items-center justify-between">
          
          {/* Real Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/logo-png.jpg"
              alt="SmartFone Doctor Logo"
              width={160}
              height={50}
              priority
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-[14px] font-medium text-[#1d1c1a]">
            {/* Active Repair button with Open Chevron */}
            <div className="px-3.5 py-1.5 border border-[#1d1c1a] bg-white flex items-center gap-1.5 font-semibold text-[#1d1c1a]">
              <span>Repair</span>
              <ChevronDown className="w-4 h-4 rotate-180 text-neutral-600" />
            </div>

            <div className="flex items-center gap-1 text-neutral-800 hover:text-[#00897b] cursor-pointer">
              <span>Repairs &amp; Services</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </div>

            <div className="px-3 py-1 rounded-full bg-[#ccfbf1] text-[#0f766e] font-semibold flex items-center gap-1.5 text-[13px]">
              <span className="w-2 h-2 rounded-full bg-[#0d9488]" />
              <span>Free Estimate</span>
            </div>

            <span className="text-neutral-800 hover:text-[#00897b] cursor-pointer">Locations</span>

            <div className="px-3.5 py-1 rounded-full border border-[#0d9488] text-[#1d1c1a] font-semibold text-[13px] bg-[#99f6e4]/30 shadow-xs">
              Track Status
            </div>

            <span className="text-neutral-800 hover:text-[#00897b] cursor-pointer">About Us</span>
          </div>

          {/* Start Repair CTA */}
          <div className="hidden lg:block">
            <span className="px-5 py-2.5 rounded bg-[#00897b] text-white font-bold text-[13px] uppercase tracking-wider shadow-xs">
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
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-[14px] font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-white text-[#1d1c1a] shadow-xs font-bold border border-neutral-300"
                        : "text-neutral-600 hover:bg-white/70 hover:text-[#1d1c1a]"
                    }`}
                  >
                    <span className={isActive ? "text-[#00897b]" : "text-neutral-500"}>
                      {renderCategoryIcon(key, "w-4 h-4")}
                    </span>
                    <span>{cat.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                );
              })}
            </div>

            {/* Inner Grid: Left 8 Columns (Devices, Issues, Brands) + Right 4 Columns (CTA Card) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-6">
              
              {/* LEFT 8 COLUMNS: 3 SUB-COLUMNS */}
              <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Col 1: Popular Devices */}
                <div className="md:pr-6 md:border-r border-neutral-200 flex flex-col justify-between min-h-[340px]">
                  <div>
                    <h4 className="text-[15px] font-bold text-[#1d1c1a] mb-4">
                      Popular Devices
                    </h4>
                    <ul className="space-y-3.5 text-[14px] text-neutral-600">
                      {currentCategory.popularDevices.map((device, i) => {
                        const resolvedUrl = getDeviceUrl(device, activeCategory);
                        return (
                          <li key={i} title={`Routes to: ${resolvedUrl}`}>
                            <Link
                              href={resolvedUrl}
                              className="hover:text-[#00897b] transition-colors block"
                            >
                              {device}
                            </Link>
                          </li>
                        );
                      })}
                      {currentCategory.popularDevices.length === 0 && (
                        <li className="text-gray-400 italic text-[13px]">No devices added yet.</li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Link
                      href={currentCategory.href}
                      className="inline-flex items-center gap-1 text-[14px] font-bold text-[#1d1c1a] underline underline-offset-4 hover:text-[#00897b] cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Col 2: Common Issues */}
                <div className="md:px-6 md:border-r border-neutral-200 flex flex-col justify-between min-h-[340px]">
                  <div>
                    <h4 className="text-[15px] font-bold text-[#1d1c1a] mb-4">
                      Common Issues
                    </h4>
                    <ul className="space-y-3.5 text-[14px] text-neutral-600">
                      {currentCategory.commonIssues.map((issue, i) => {
                        const resolvedUrl = getIssueUrl(issue, activeCategory);
                        return (
                          <li key={i} title={`Routes to: ${resolvedUrl}`}>
                            <Link
                              href={resolvedUrl}
                              className="hover:text-[#00897b] transition-colors block"
                            >
                              {issue}
                            </Link>
                          </li>
                        );
                      })}
                      {currentCategory.commonIssues.length === 0 && (
                        <li className="text-gray-400 italic text-[13px]">No issues added yet.</li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/common-issues"
                      className="inline-flex items-center gap-1 text-[14px] font-bold text-[#1d1c1a] underline underline-offset-4 hover:text-[#00897b] cursor-pointer"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Col 3: By Brand */}
                <div className="md:pl-6 flex flex-col justify-between min-h-[340px]">
                  <div>
                    <h4 className="text-[15px] font-bold text-[#1d1c1a] mb-4">
                      By Brand
                    </h4>
                    <ul className="space-y-4">
                      {currentCategory.brands.map((brand, i) => {
                        const resolvedUrl = brand.href || getBrandUrl(brand.title, activeCategory);
                        return (
                          <li key={i} title={`Routes to: ${resolvedUrl}`}>
                            <Link
                              href={resolvedUrl}
                              className="flex items-center justify-between group cursor-pointer"
                            >
                              <div>
                                <p className="text-[14px] font-medium text-neutral-800 group-hover:text-[#00897b] transition-colors">
                                  {brand.title}
                                </p>
                                <p className="text-[13px] text-neutral-500">
                                  {brand.subtitle}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#00897b] group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </li>
                        );
                      })}
                      {currentCategory.brands.length === 0 && (
                        <li className="text-gray-400 italic text-[13px]">No brands added yet.</li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <Link
                      href={currentCategory.href}
                      className="inline-flex items-center justify-between w-full text-[14px] font-bold text-[#1d1c1a] hover:text-[#00897b] cursor-pointer"
                    >
                      <span className="underline underline-offset-4">{currentCategory.allLinkText}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    </Link>
                  </div>
                </div>

              </div>

              {/* RIGHT 4 COLUMNS: THE WHITE "Need your device fixed?" CTA CARD */}
              <div className="xl:col-span-4 flex flex-col">
                <div className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-xs border border-neutral-100 flex flex-col items-center justify-center flex-1">
                  
                  {/* Circular Teal Pin Icon */}
                  <div className="w-12 h-12 rounded-full border border-[#00897b]/40 flex items-center justify-center text-[#00897b] mb-4 bg-teal-50/40">
                    <MapPin className="w-5 h-5 text-[#00897b]" />
                  </div>

                  <h3 className="text-2xl sm:text-[28px] font-normal text-[#1d1c1a] leading-tight mb-3">
                    {config.ctaCard.title}
                  </h3>

                  <p className="text-sm text-neutral-600 max-w-[280px] mb-6 leading-relaxed">
                    {config.ctaCard.description}
                  </p>

                  <div className="w-full space-y-3">
                    <button
                      type="button"
                      className="block w-full py-3.5 px-6 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white font-bold text-sm transition shadow-xs cursor-pointer"
                    >
                      {config.ctaCard.primaryBtnText}
                    </button>

                    <button
                      type="button"
                      className="block w-full py-3.5 px-6 rounded-full border border-neutral-700 hover:border-black text-[#1d1c1a] font-bold text-sm bg-white hover:bg-neutral-50 transition cursor-pointer"
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

      {/* 3. EDITOR CONTROL PANEL WITH TAXONOMY PICKER & LIVE URL RESOLUTION */}
      <div className="bg-white border border-[#e8e8e8] rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
        
        {/* Editor Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#00897b]" />
            <h2 className="text-base font-bold text-[#111111]">
              Menu Content Editor &amp; URL Resolver
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

                {/* Add new device input with live resolved URL feedback */}
                <div className="space-y-1.5">
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
                      onClick={() => handleAddDevice()}
                      className="h-[32px] px-2.5 rounded-[5px] bg-[#00897b] hover:bg-[#00796b] text-white text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {newDevice.trim() && (
                    <div className="text-[10px] text-teal-800 bg-teal-50 px-2 py-1 rounded border border-teal-200 flex items-center gap-1 font-mono truncate">
                      <Link2 className="w-3 h-3 shrink-0" />
                      <span>URL ➜ {getDeviceUrl(newDevice, activeCategory)}</span>
                    </div>
                  )}
                </div>

                {/* List with live URL badge */}
                <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                  {currentCategory.popularDevices.map((device, idx) => {
                    const devUrl = getDeviceUrl(device, activeCategory);
                    return (
                      <div
                        key={idx}
                        className="px-2.5 py-1.5 rounded-[5px] bg-white border border-gray-200 text-[12px] text-gray-800 space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate pr-2">{device}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDevice(idx)}
                            className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                            title="Remove device"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono truncate">
                          <span>➜</span>
                          <span className="truncate">{devUrl}</span>
                        </div>
                      </div>
                    );
                  })}
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
                <div className="space-y-1.5">
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
                      onClick={() => handleAddIssue()}
                      className="h-[32px] px-2.5 rounded-[5px] bg-[#00897b] hover:bg-[#00796b] text-white text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {newIssue.trim() && (
                    <div className="text-[10px] text-teal-800 bg-teal-50 px-2 py-1 rounded border border-teal-200 flex items-center gap-1 font-mono truncate">
                      <Link2 className="w-3 h-3 shrink-0" />
                      <span>URL ➜ {getIssueUrl(newIssue, activeCategory)}</span>
                    </div>
                  )}
                </div>

                {/* List with live URL badge */}
                <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                  {currentCategory.commonIssues.map((issue, idx) => {
                    const issUrl = getIssueUrl(issue, activeCategory);
                    return (
                      <div
                        key={idx}
                        className="px-2.5 py-1.5 rounded-[5px] bg-white border border-gray-200 text-[12px] text-gray-800 space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate pr-2">{issue}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIssue(idx)}
                            className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                            title="Remove issue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono truncate">
                          <span>➜</span>
                          <span className="truncate">{issUrl}</span>
                        </div>
                      </div>
                    );
                  })}
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
                      onClick={() => handleAddBrand()}
                      className="h-[32px] px-2.5 rounded-[5px] bg-[#00897b] hover:bg-[#00796b] text-white text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* List with live URL badge */}
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {currentCategory.brands.map((brand, idx) => {
                    const brUrl = brand.href || getBrandUrl(brand.title, activeCategory);
                    return (
                      <div
                        key={idx}
                        className="px-2.5 py-1.5 rounded-[5px] bg-white border border-gray-200 text-[12px] text-gray-800 space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold block truncate">{brand.title}</span>
                            <span className="text-[10px] text-gray-500 block truncate">{brand.subtitle}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveBrand(idx)}
                            className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0"
                            title="Remove brand"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono truncate">
                          <span>➜</span>
                          <span className="truncate">{brUrl}</span>
                        </div>
                      </div>
                    );
                  })}
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
                ⚡ Any changes made above immediately reflect in the Live Storefront Preview and customer click paths.
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
