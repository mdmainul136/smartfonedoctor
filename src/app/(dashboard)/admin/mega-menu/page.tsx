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
      
      {/* 1. TOP HEADER & ACTION BAR (Clean Design System) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[#009691] shrink-0 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider text-[#009691] uppercase">Website Navigation</span>
                <span className="text-gray-300">•</span>
                <span className="text-[11px] text-gray-500 font-medium">Storefront Router</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Mega Menu Builder &amp; URL Router
              </h1>
              <p className="text-xs sm:text-[13px] text-gray-500 mt-0.5">
                Visual editor for customer storefront navigation. Every item automatically attaches to verified taxonomy routes.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Responsive, clean layout, zero clipping */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/admin/taxonomies"
            className="h-9 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
          >
            <FolderTree className="w-3.5 h-3.5 text-teal-600" />
            <span>Taxonomies</span>
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="h-9 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
            title="Reset to default menu items"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Reset Defaults</span>
          </button>

          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            <span>View Live Site</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-4 rounded-lg bg-[#009691] hover:bg-[#007e7a] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
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

      {/* 2. LIVE STOREFRONT PREVIEW WINDOW (Clean, pixel-perfect, unclipped) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        
        {/* Mock Browser Header Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            <span className="ml-2 text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#009691]" />
              Customer Front-End Mega Menu Preview
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-white px-2.5 py-0.5 rounded border border-gray-200 text-[10px] text-gray-500 font-mono">
              https://smartfonedoctor.com/ (Desktop Header)
            </div>
            <button
              type="button"
              onClick={() => setPreviewExpanded(!previewExpanded)}
              className="text-gray-500 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
              title={previewExpanded ? "Collapse preview" : "Expand preview"}
            >
              {previewExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* SIMULATED DESKTOP WEBSITE HEADER (Clean, well-spaced, never overlaps) */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-3">
            
            {/* Real Logo */}
            <div className="shrink-0 flex items-center">
              <Image
                src="/logo-png.jpg"
                alt="SmartFone Doctor Logo"
                width={130}
                height={38}
                priority
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </div>

            {/* Desktop Nav Items - Clean, responsive flex with proper gaps */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 overflow-x-auto scrollbar-none py-1 text-xs font-medium text-gray-800">
              {/* Active Repair button with Open Chevron */}
              <div className="shrink-0 px-3 py-1.5 border border-gray-900 bg-gray-900 text-white rounded-md flex items-center gap-1.5 font-bold shadow-xs">
                <span>Repair</span>
                <ChevronDown className="w-3.5 h-3.5 rotate-180 text-teal-300" />
              </div>

              <div className="shrink-0 flex items-center gap-1 text-gray-700 hover:text-[#009691] cursor-pointer px-1">
                <span>Services</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>

              <div className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-semibold flex items-center gap-1.5 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="whitespace-nowrap">Free Estimate</span>
              </div>

              <span className="shrink-0 text-gray-700 hover:text-[#009691] cursor-pointer px-1 hidden sm:inline whitespace-nowrap">
                Locations
              </span>

              <div className="shrink-0 px-2.5 py-1 rounded-full border border-teal-500/30 text-gray-800 font-semibold text-[11px] bg-teal-50/60 hidden md:flex items-center whitespace-nowrap">
                Track Status
              </div>

              <span className="shrink-0 text-gray-700 hover:text-[#009691] cursor-pointer px-1 hidden lg:inline whitespace-nowrap">
                About Us
              </span>
            </div>

            {/* Start Repair CTA - Fixed width, shrink-0, perfectly aligned */}
            <div className="shrink-0">
              <span className="px-3.5 py-1.5 sm:py-2 rounded-lg bg-[#009691] hover:bg-[#007e7a] text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-xs whitespace-nowrap inline-flex items-center">
                Start Repair
              </span>
            </div>
          </div>
        </div>

        {/* CPR STYLE FULL-WIDTH MEGA MENU BODY (Identical to screenshot) */}
        <div className="w-full bg-[#f5f5f5] border-t border-neutral-200 p-6 sm:p-8">
          <div className="max-w-[1350px] mx-auto">
            
            {/* Top Category Selector Row (Pills with chevron) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pb-5 border-b border-gray-200">
              {categoryKeys.map((key) => {
                const cat = config.categories[key];
                const isActive = activeCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategory(key)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-white text-gray-900 shadow-xs border border-gray-300 ring-1 ring-black/5"
                        : "text-gray-600 hover:bg-white/80 hover:text-gray-900 border border-transparent"
                    }`}
                  >
                    <span className={isActive ? "text-[#009691]" : "text-gray-400"}>
                      {renderCategoryIcon(key, "w-4 h-4")}
                    </span>
                    <span>{cat.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                );
              })}
            </div>

            {/* Inner Grid: Left 8 Columns (Devices, Issues, Brands) + Right 4 Columns (CTA Card) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pt-6">
              
              {/* LEFT 8 COLUMNS: 3 SUB-COLUMNS */}
              <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Col 1: Popular Devices */}
                <div className="md:pr-6 md:border-r border-gray-200 flex flex-col justify-between min-h-[340px]">
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900 mb-3.5 flex items-center justify-between">
                      <span>Popular Devices</span>
                      <span className="text-[11px] font-normal text-gray-400">Routes</span>
                    </h4>
                    <ul className="space-y-3 text-[13px] text-gray-600">
                      {currentCategory.popularDevices.map((device, i) => {
                        const resolvedUrl = getDeviceUrl(device, activeCategory);
                        return (
                          <li key={i} title={`Routes to: ${resolvedUrl}`}>
                            <Link
                              href={resolvedUrl}
                              className="hover:text-[#009691] hover:translate-x-0.5 transition-all block"
                            >
                              {device}
                            </Link>
                          </li>
                        );
                      })}
                      {currentCategory.popularDevices.length === 0 && (
                        <li className="text-gray-400 italic text-xs">No devices added yet.</li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-6 pt-3 border-t border-gray-100">
                    <Link
                      href={currentCategory.href}
                      className="inline-flex items-center gap-1 text-[13px] font-bold text-gray-900 hover:text-[#009691] cursor-pointer"
                    >
                      <span className="underline underline-offset-4">View All Devices</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Col 2: Common Issues */}
                <div className="md:px-6 md:border-r border-gray-200 flex flex-col justify-between min-h-[340px]">
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900 mb-3.5 flex items-center justify-between">
                      <span>Common Issues</span>
                      <span className="text-[11px] font-normal text-gray-400">Fixed</span>
                    </h4>
                    <ul className="space-y-3 text-[13px] text-gray-600">
                      {currentCategory.commonIssues.map((issue, i) => {
                        const resolvedUrl = getIssueUrl(issue, activeCategory);
                        return (
                          <li key={i} title={`Routes to: ${resolvedUrl}`}>
                            <Link
                              href={resolvedUrl}
                              className="hover:text-[#009691] hover:translate-x-0.5 transition-all block"
                            >
                              {issue}
                            </Link>
                          </li>
                        );
                      })}
                      {currentCategory.commonIssues.length === 0 && (
                        <li className="text-gray-400 italic text-xs">No issues added yet.</li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-6 pt-3 border-t border-gray-100">
                    <Link
                      href="/common-issues"
                      className="inline-flex items-center gap-1 text-[13px] font-bold text-gray-900 hover:text-[#009691] cursor-pointer"
                    >
                      <span className="underline underline-offset-4">View All Issues</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Col 3: By Brand */}
                <div className="md:pl-6 flex flex-col justify-between min-h-[340px]">
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900 mb-3.5 flex items-center justify-between">
                      <span>By Brand</span>
                      <span className="text-[11px] font-normal text-gray-400">OEM</span>
                    </h4>
                    <ul className="space-y-3.5">
                      {currentCategory.brands.map((brand, i) => {
                        const resolvedUrl = brand.href || getBrandUrl(brand.title, activeCategory);
                        return (
                          <li key={i} title={`Routes to: ${resolvedUrl}`}>
                            <Link
                              href={resolvedUrl}
                              className="flex items-center justify-between group cursor-pointer"
                            >
                              <div>
                                <p className="text-[13px] font-semibold text-gray-800 group-hover:text-[#009691] transition-colors">
                                  {brand.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {brand.subtitle}
                                </p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#009691] group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </li>
                        );
                      })}
                      {currentCategory.brands.length === 0 && (
                        <li className="text-gray-400 italic text-xs">No brands added yet.</li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-6 pt-3 border-t border-gray-100">
                    <Link
                      href={currentCategory.href}
                      className="inline-flex items-center justify-between w-full text-[13px] font-bold text-gray-900 hover:text-[#009691] cursor-pointer"
                    >
                      <span className="underline underline-offset-4">{currentCategory.allLinkText}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                    </Link>
                  </div>
                </div>

              </div>

              {/* RIGHT 4 COLUMNS: THE WHITE "Need your device fixed?" CTA CARD */}
              <div className="xl:col-span-4 flex flex-col">
                <div className="bg-white rounded-2xl p-6 sm:p-7 text-center shadow-xs border border-gray-200/80 flex flex-col items-center justify-center flex-1">
                  
                  {/* Circular Teal Pin Icon */}
                  <div className="w-12 h-12 rounded-full border border-teal-200 flex items-center justify-center text-[#009691] mb-3.5 bg-teal-50">
                    <MapPin className="w-5 h-5 text-[#009691]" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
                    {config.ctaCard.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-gray-600 max-w-[280px] mb-5 leading-relaxed">
                    {config.ctaCard.description}
                  </p>

                  <div className="w-full space-y-2.5">
                    <button
                      type="button"
                      className="block w-full py-2.5 px-4 rounded-lg bg-[#009691] hover:bg-[#007e7a] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs cursor-pointer active:scale-[0.99]"
                    >
                      {config.ctaCard.primaryBtnText}
                    </button>

                    <button
                      type="button"
                      className="block w-full py-2.5 px-4 rounded-lg border border-gray-300 hover:border-gray-900 text-gray-800 font-semibold text-xs bg-white hover:bg-gray-50 transition cursor-pointer"
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
      <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
        
        {/* Editor Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[#009691]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900">
                Menu Content Editor &amp; URL Resolver
              </h2>
              <p className="text-xs text-gray-500">Edit columns, popular devices, and verified route mappings.</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("columns")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "columns"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Columns &amp; Devices ({currentCategory.label})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cta")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "cta"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
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
              <span className="text-xs font-semibold text-gray-500 mr-1">
                Active Category:
              </span>
              {categoryKeys.map((key) => {
                const isSelected = activeCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategory(key)}
                    className={`h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#009691] text-white shadow-xs"
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
              <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    Popular Devices
                  </span>
                  <span className="text-[10px] font-semibold bg-gray-200/80 text-gray-700 px-2 py-0.5 rounded-full">
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
                      className="flex-1 h-8 px-2.5 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddDevice()}
                      className="h-8 px-3 rounded-lg bg-[#009691] hover:bg-[#007e7a] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {newDevice.trim() && (
                    <div className="text-[10px] text-teal-800 bg-teal-50 px-2 py-1 rounded-md border border-teal-200 flex items-center gap-1 font-mono truncate">
                      <Link2 className="w-3 h-3 shrink-0 text-teal-600" />
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
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-800 space-y-0.5 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate pr-2">{device}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDevice(idx)}
                            className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0 transition-colors"
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
              <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    Common Issues
                  </span>
                  <span className="text-[10px] font-semibold bg-gray-200/80 text-gray-700 px-2 py-0.5 rounded-full">
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
                      className="flex-1 h-8 px-2.5 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddIssue()}
                      className="h-8 px-3 rounded-lg bg-[#009691] hover:bg-[#007e7a] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {newIssue.trim() && (
                    <div className="text-[10px] text-teal-800 bg-teal-50 px-2 py-1 rounded-md border border-teal-200 flex items-center gap-1 font-mono truncate">
                      <Link2 className="w-3 h-3 shrink-0 text-teal-600" />
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
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-800 space-y-0.5 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate pr-2">{issue}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIssue(idx)}
                            className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0 transition-colors"
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
              <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">
                    By Brand
                  </span>
                  <span className="text-[10px] font-semibold bg-gray-200/80 text-gray-700 px-2 py-0.5 rounded-full">
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
                    className="w-full h-8 px-2.5 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newBrandSubtitle}
                      onChange={(e) => setNewBrandSubtitle(e.target.value)}
                      placeholder="Subtitle (e.g. PS5 & PS4 Models)"
                      className="flex-1 h-8 px-2.5 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddBrand()}
                      className="h-8 px-3 rounded-lg bg-[#009691] hover:bg-[#007e7a] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
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
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-800 space-y-0.5 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold block truncate">{brand.title}</span>
                            <span className="text-[10px] text-gray-500 block truncate">{brand.subtitle}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveBrand(idx)}
                            className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer shrink-0 transition-colors"
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
                <span className="text-xs font-semibold text-gray-600">
                  Bottom CTA Link Text:
                </span>
                <input
                  type="text"
                  value={currentCategory.allLinkText}
                  onChange={(e) => handleUpdateAllLinkText(e.target.value)}
                  className="h-8 px-3 rounded-lg border border-gray-300 text-xs w-64 bg-white focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
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
              <label className="text-xs font-semibold text-gray-700 block mb-1">
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
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
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
                className="w-full p-2.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
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
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
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
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="h-9 px-4 rounded-lg bg-[#009691] hover:bg-[#007e7a] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
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
