"use client";

import { useState } from "react";
import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import {
  Check,
  ExternalLink,
  Sparkles,
  Eye,
  Plus,
  Trash2,
  HelpCircle,
  Shield,
  Clock,
  MapPin,
  RotateCcw,
  Layout,
  Megaphone,
  Store,
  Smartphone,
  Tablet,
  Laptop,
  Gamepad2,
  Tag,
  Menu as MenuIcon,
  Search,
  Globe,
  DollarSign,
  ArrowRight,
  ChevronRight,
  Layers,
  Save,
  FileText,
  Sliders,
  Settings,
  AlertCircle,
  Copy,
} from "lucide-react";

// 1. DEDICATED SITE PAGES LIST (One-by-One Page Editing)
interface SitePageConfig {
  id: string;
  name: string;
  path: string;
  category: "Core" | "Repairs" | "Utility" | "Legal";
  title: string;
  metaDesc: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroBadge: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  status: "Published" | "Draft";
  lastEdited: string;
}

const INITIAL_PAGES: SitePageConfig[] = [
  {
    id: "home",
    name: "Homepage",
    path: "/",
    category: "Core",
    title: "Fast & Reliable Phone & Electronics Repair in Philadelphia",
    metaDesc: "Philadelphia's top-rated cell phone, iPhone, iPad, MacBook, and console repair shop. 30-minute screen and battery service with warranty.",
    heroHeadline: "Fast, reliable repairs that keep your tech working when it matters.",
    heroSubtitle: "Repair services for smartphones, tablets, computers and game consoles, backed by certified technicians and a 90-day free warranty.",
    heroBadge: "Philadelphia's Trusted Leader in",
    primaryCtaText: "Book your repair",
    primaryCtaLink: "/schedule-repair",
    status: "Published",
    lastEdited: "Today, 1:15 PM",
  },
  {
    id: "repairs-iphone",
    name: "iPhone Repair Page",
    path: "/repairs/iphone",
    category: "Repairs",
    title: "Express iPhone Screen & Battery Repair Philadelphia | Same Day",
    metaDesc: "Same-day cracked screen replacement, battery renewal, and back glass repair for iPhone 16 Pro down to iPhone 11 at 3 Philadelphia branches.",
    heroHeadline: "Philadelphia's Premier iPhone Screen & Battery Repair Experts.",
    heroSubtitle: "OEM-grade OLED displays, 30-minute battery replacements, and precision laser back glass repair backed by our 90-day guarantee.",
    heroBadge: "Certified Apple Repair Specialists",
    primaryCtaText: "Get iPhone Estimate",
    primaryCtaLink: "/schedule-repair?device=iphone",
    status: "Published",
    lastEdited: "Yesterday",
  },
  {
    id: "repairs-smartphone",
    name: "Samsung & Android Repair",
    path: "/repairs/smartphone",
    category: "Repairs",
    title: "Samsung Galaxy & Google Pixel Repair in Philadelphia",
    metaDesc: "Authorized repair for Samsung Galaxy S24/S23, Z Fold, and Google Pixel. AMOLED screen replacements, charging ports, and water damage.",
    heroHeadline: "Professional Samsung Galaxy & Android Smartphone Care.",
    heroSubtitle: "Genuine Samsung service packs, authentic Pixel displays, and charging port replacements done in under 45 minutes.",
    heroBadge: "Certified Android Technicians",
    primaryCtaText: "Fix My Samsung",
    primaryCtaLink: "/schedule-repair?device=samsung",
    status: "Published",
    lastEdited: "Nov 10",
  },
  {
    id: "repairs-ipad",
    name: "iPad & Tablet Repair",
    path: "/repairs/ipad",
    category: "Repairs",
    title: "iPad Pro, Air, & Mini Screen Repair in West Philadelphia",
    metaDesc: "Fast digitizer glass replacement, LCD repair, and charging dock restoration for iPad Pro, iPad Air, iPad Mini, and Galaxy Tabs.",
    heroHeadline: "Fast iPad Glass & Digitizer Replacement in Philadelphia.",
    heroSubtitle: "Restore your iPad or tablet to mint condition. Same-day repairs for schools, businesses, and everyday users.",
    heroBadge: "All iPad Generations Supported",
    primaryCtaText: "Book Tablet Service",
    primaryCtaLink: "/schedule-repair?device=ipad",
    status: "Published",
    lastEdited: "Nov 08",
  },
  {
    id: "repairs-mac",
    name: "MacBook & Laptop Repair",
    path: "/repairs/mac",
    category: "Repairs",
    title: "MacBook Pro, Air & PC Laptop Repair Philadelphia",
    metaDesc: "Retina screen replacements, keyboard repair, battery service, and liquid damage logic board diagnostics in Philadelphia.",
    heroHeadline: "Expert MacBook & PC Computer Repair in West Philly.",
    heroSubtitle: "Component-level motherboard repair, SSD upgrades, and battery replacements for MacBook Pro, MacBook Air, Dell, and HP laptops.",
    heroBadge: "Hardware & Logic Board Certified",
    primaryCtaText: "Request Laptop Diagnostic",
    primaryCtaLink: "/schedule-repair?device=laptop",
    status: "Published",
    lastEdited: "Nov 06",
  },
  {
    id: "repairs-computer",
    name: "Game Console & HDMI Repair",
    path: "/repairs/computer",
    category: "Repairs",
    title: "PS5, Xbox & Nintendo Switch HDMI Port Repair Philadelphia",
    metaDesc: "Micro-soldering HDMI port replacement, power supply diagnostics, and fan cleaning for PlayStation 5, Xbox Series X, and Switch.",
    heroHeadline: "Next-Gen Gaming Console Repair & Micro-Soldering.",
    heroSubtitle: "No signal on your TV? We specialize in precision micro-soldering HDMI port replacement for PS5, PS4, Xbox Series X/S, and Switch OLED.",
    heroBadge: "Micro-Soldering Lab On-Site",
    primaryCtaText: "Fix My Console",
    primaryCtaLink: "/schedule-repair?device=console",
    status: "Published",
    lastEdited: "Nov 04",
  },
  {
    id: "locations",
    name: "All Store Locations",
    path: "/locations",
    category: "Core",
    title: "Find Your Nearest SmartFoneDoctor Store | 3 Philly Branches",
    metaDesc: "Visit SmartFoneDoctor on 52nd St or Lancaster Ave. Walk-ins welcome Monday through Saturday with dedicated technician bench service.",
    heroHeadline: "3 Convenient Google-Verified Stores Across Philadelphia.",
    heroSubtitle: "Choose your nearest location below for instant walk-in directions, store hours, and direct shop technician phone lines.",
    heroBadge: "Philadelphia Neighborhood Hubs",
    primaryCtaText: "View Interactive Map",
    primaryCtaLink: "/locations#map",
    status: "Published",
    lastEdited: "Today",
  },
  {
    id: "about",
    name: "About Us",
    path: "/about",
    category: "Core",
    title: "About SmartFoneDoctor | Trusted Philadelphia Repair Specialists",
    metaDesc: "Learn about SmartFoneDoctor's mission, certified technicians, community commitment, and lifetime workmanship warranty.",
    heroHeadline: "Keeping Philadelphia Connected Since 2018.",
    heroSubtitle: "Locally owned, community focused, and dedicated to fast, transparent electronics repair that extends the lifespan of your devices.",
    heroBadge: "Locally Owned & Operated",
    primaryCtaText: "Meet the Team",
    primaryCtaLink: "/about#team",
    status: "Published",
    lastEdited: "Oct 28",
  },
  {
    id: "schedule-repair",
    name: "Book a Repair / Schedule",
    path: "/schedule-repair",
    category: "Utility",
    title: "Schedule Your Phone or Device Repair Online | Instant Estimate",
    metaDesc: "Book your repair appointment online for priority bench check-in. Free diagnostics, 90-day warranty, and fast turnaround.",
    heroHeadline: "Book Your Repair Online for Priority Bench Service.",
    heroSubtitle: "Select your device, describe the issue, and pick your preferred Philadelphia store. Walk-ins always welcome.",
    heroBadge: "Zero Waiting Time",
    primaryCtaText: "Start Booking Flow",
    primaryCtaLink: "#form",
    status: "Published",
    lastEdited: "Nov 11",
  },
  {
    id: "track",
    name: "Repair Status Tracking",
    path: "/track",
    category: "Utility",
    title: "Track Your Device Repair Status Live | SmartFoneDoctor",
    metaDesc: "Check real-time bench diagnostic, parts arrival, and ready-for-pickup status using your ticket number.",
    heroHeadline: "Check Live Repair Bench & Pickup Status.",
    heroSubtitle: "Enter your 4-digit ticket number or phone number to see real-time updates from our assigned bench technician.",
    heroBadge: "Live Customer Portal",
    primaryCtaText: "Check Ticket",
    primaryCtaLink: "#tracker",
    status: "Published",
    lastEdited: "Nov 02",
  },
  {
    id: "faq",
    name: "FAQ Page",
    path: "/faq",
    category: "Utility",
    title: "Frequently Asked Questions | SmartFoneDoctor Philadelphia",
    metaDesc: "Answers to common questions about pricing, repair times, 90-day warranty, data privacy, and walk-in policies.",
    heroHeadline: "Everything You Need to Know About Our Repair Service.",
    heroSubtitle: "Clear, upfront answers regarding parts quality, repair duration, warranty coverage, and data safety.",
    heroBadge: "Transparent Policies",
    primaryCtaText: "Browse Topics",
    primaryCtaLink: "#faqs",
    status: "Published",
    lastEdited: "Nov 01",
  },
];

// 2. SERVICES & PRICING ENGINE DATA (Brand, Category, Price Tags)
interface ServiceItem {
  id: string;
  name: string;
  category: "smartphone" | "tablet" | "computer" | "console";
  brand: string;
  model: string;
  retailPrice: number;
  costPrice: number;
  turnaroundTag: string;
  warrantyTag: string;
  stockStatus: "In Stock" | "Low Stock" | "24h Order";
  isPopular: boolean;
}

const INITIAL_SERVICES_CATALOG: ServiceItem[] = [
  {
    id: "srv-1",
    name: "OEM OLED Screen Replacement",
    category: "smartphone",
    brand: "Apple",
    model: "iPhone 15 Pro",
    retailPrice: 219,
    costPrice: 78,
    turnaroundTag: "30 Mins",
    warrantyTag: "90-Day Free Warranty",
    stockStatus: "In Stock",
    isPopular: true,
  },
  {
    id: "srv-2",
    name: "Authentic Battery Replacement",
    category: "smartphone",
    brand: "Apple",
    model: "iPhone 14 / 13",
    retailPrice: 79,
    costPrice: 22,
    turnaroundTag: "25 Mins",
    warrantyTag: "90-Day Free Warranty",
    stockStatus: "In Stock",
    isPopular: true,
  },
  {
    id: "srv-3",
    name: "Laser Back Glass Renewal",
    category: "smartphone",
    brand: "Apple",
    model: "iPhone 15 / 14 Series",
    retailPrice: 129,
    costPrice: 35,
    turnaroundTag: "60 Mins",
    warrantyTag: "Lifetime Workmanship",
    stockStatus: "In Stock",
    isPopular: false,
  },
  {
    id: "srv-4",
    name: "Dynamic AMOLED 2X Display",
    category: "smartphone",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    retailPrice: 249,
    costPrice: 95,
    turnaroundTag: "45 Mins",
    warrantyTag: "90-Day Free Warranty",
    stockStatus: "In Stock",
    isPopular: true,
  },
  {
    id: "srv-5",
    name: "USB-C Port Sub-Board Replacement",
    category: "smartphone",
    brand: "Google",
    model: "Pixel 8 / 7 Pro",
    retailPrice: 79,
    costPrice: 20,
    turnaroundTag: "30 Mins",
    warrantyTag: "90-Day Free Warranty",
    stockStatus: "In Stock",
    isPopular: false,
  },
  {
    id: "srv-6",
    name: "Liquid Damage Ultrasonic Clean",
    category: "smartphone",
    brand: "All Brands",
    model: "Universal Phone Diagnostics",
    retailPrice: 69,
    costPrice: 10,
    turnaroundTag: "Same Day",
    warrantyTag: "Bench Certified",
    stockStatus: "In Stock",
    isPopular: true,
  },
  {
    id: "srv-7",
    name: "Digitizer Glass + LCD Assembly",
    category: "tablet",
    brand: "Apple",
    model: "iPad Pro 12.9 (5th Gen)",
    retailPrice: 229,
    costPrice: 85,
    turnaroundTag: "Same Day",
    warrantyTag: "90-Day Free Warranty",
    stockStatus: "In Stock",
    isPopular: true,
  },
  {
    id: "srv-8",
    name: "Retina Display OEM Assembly",
    category: "computer",
    brand: "Apple",
    model: "MacBook Pro 14 (M1/M2/M3)",
    retailPrice: 389,
    costPrice: 160,
    turnaroundTag: "24-48 Hours",
    warrantyTag: "90-Day Free Warranty",
    stockStatus: "24h Order",
    isPopular: false,
  },
  {
    id: "srv-9",
    name: "HDMI Port Micro-Soldering Replacement",
    category: "console",
    brand: "Sony",
    model: "PlayStation 5 (Disc & Digital)",
    retailPrice: 149,
    costPrice: 18,
    turnaroundTag: "Same Day",
    warrantyTag: "6-Month HDMI Warranty",
    stockStatus: "In Stock",
    isPopular: true,
  },
  {
    id: "srv-10",
    name: "Internal Thermal Fan & Liquid Metal Repaste",
    category: "console",
    brand: "Sony",
    model: "PS5 Overheating Fix",
    retailPrice: 79,
    costPrice: 12,
    turnaroundTag: "45 Mins",
    warrantyTag: "Bench Certified",
    stockStatus: "In Stock",
    isPopular: false,
  },
];

// 3. NAVIGATION & MENUS MANAGER DATA
interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  highlightPill?: string;
  hasDropdown: boolean;
  subItems?: { label: string; href: string; badge?: string }[];
}

const INITIAL_NAV_ITEMS: NavMenuItem[] = [
  {
    id: "nav-repairs",
    label: "Repair Devices",
    href: "/repairs",
    hasDropdown: true,
    subItems: [
      { label: "iPhone Screen & Battery", href: "/repairs/iphone", badge: "30 Min" },
      { label: "Samsung Galaxy & Android", href: "/repairs/smartphone", badge: "OEM Parts" },
      { label: "iPad & Tablet Repair", href: "/repairs/ipad" },
      { label: "MacBook & Laptop Service", href: "/repairs/mac" },
      { label: "PS5 & Console HDMI Soldering", href: "/repairs/computer", badge: "Specialty" },
    ],
  },
  {
    id: "nav-estimate",
    label: "Free Instant Estimate",
    href: "/schedule-repair",
    highlightPill: "Free",
    hasDropdown: false,
  },
  {
    id: "nav-locations",
    label: "Locations & Hours",
    href: "/locations",
    hasDropdown: false,
  },
  {
    id: "nav-track",
    label: "Track Repair Status",
    href: "/track",
    highlightPill: "Live",
    hasDropdown: false,
  },
  {
    id: "nav-about",
    label: "About Us",
    href: "/about",
    hasDropdown: false,
  },
];

export default function ContentEditorPage() {
  const { stores } = useStoreContext();
  const [mainMode, setMainMode] = useState<"pages" | "services" | "menus" | "seo">("pages");
  
  // Pages Manager State
  const [pages, setPages] = useState<SitePageConfig[]>(INITIAL_PAGES);
  const [selectedPageId, setSelectedPageId] = useState<string>("home");
  const [searchPage, setSearchPage] = useState("");

  // Services & Pricing State
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES_CATALOG);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchService, setSearchService] = useState("");
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  // New Service Form State
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState<ServiceItem["category"]>("smartphone");
  const [newServiceBrand, setNewServiceBrand] = useState("Apple");
  const [newServiceModel, setNewServiceModel] = useState("");
  const [newServiceRetail, setNewServiceRetail] = useState(129);
  const [newServiceCost, setNewServiceCost] = useState(40);
  const [newServiceTurnaround, setNewServiceTurnaround] = useState("30 Mins");
  const [newServiceWarranty, setNewServiceWarranty] = useState("90-Day Free Warranty");

  // Menus Manager State
  const [navItems, setNavItems] = useState<NavMenuItem[]>(INITIAL_NAV_ITEMS);

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const selectedPage = pages.find((p) => p.id === selectedPageId) || pages[0];

  const handleUpdatePage = (field: keyof SitePageConfig, val: string) => {
    setPages(
      pages.map((p) => (p.id === selectedPageId ? { ...p, [field]: val, lastEdited: "Just now" } : p))
    );
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedToast("All CMS changes (Pages, Pricing Tags, and Menus) published to live site!");
      setTimeout(() => setSavedToast(null), 4000);
    }, 600);
  };

  const filteredPages = pages.filter(
    (p) =>
      p.name.toLowerCase().includes(searchPage.toLowerCase()) ||
      p.path.toLowerCase().includes(searchPage.toLowerCase())
  );

  const filteredServices = services.filter((s) => {
    const matchCategory = filterCategory === "all" || s.category === filterCategory;
    const matchSearch =
      s.name.toLowerCase().includes(searchService.toLowerCase()) ||
      s.model.toLowerCase().includes(searchService.toLowerCase()) ||
      s.brand.toLowerCase().includes(searchService.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ServiceItem = {
      id: `srv-${Date.now()}`,
      name: newServiceName || "Repair Service",
      category: newServiceCategory,
      brand: newServiceBrand,
      model: newServiceModel || "Universal Model",
      retailPrice: Number(newServiceRetail),
      costPrice: Number(newServiceCost),
      turnaroundTag: newServiceTurnaround,
      warrantyTag: newServiceWarranty,
      stockStatus: "In Stock",
      isPopular: false,
    };
    setServices([created, ...services]);
    setShowAddServiceModal(false);
    setSavedToast(`Added new pricing card for "${created.name}"`);
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5 overflow-x-hidden">
      {/* 1. TOP HEADER & MAIN NAVIGATION MODE CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#e8e8e8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#009691] animate-pulse" />
            <h1 className="text-[22px] sm:text-[24px] font-bold text-[#111111] tracking-[-0.02em]">
              Central CMS &amp; Content Management Suite
            </h1>
          </div>
          <p className="text-[13px] text-[#5f6368] mt-0.5">
            Dedicated multi-page editor, category &amp; brand pricing engine, and header/footer navigation manager
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="h-[34px] px-3.5 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#5f6368]" />
          </Link>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="h-[34px] px-4 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-[13px] font-semibold inline-flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? "Publishing..." : "Publish All Changes"}</span>
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

      {/* 2. CMS MODE SWITCHER TABS */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb] overflow-x-auto no-scrollbar pb-px">
        {[
          { id: "pages", label: "Pages Manager (1-by-1 Editor)", icon: FileText, badge: `${pages.length} Pages` },
          { id: "services", label: "Services, Brands & Price Tags", icon: Tag, badge: `${services.length} Rates` },
          { id: "menus", label: "Menus & Mega-Dropdowns", icon: MenuIcon },
          { id: "seo", label: "LocalBusiness SEO & Schema", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = mainMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setMainMode(tab.id as any)}
              className={`h-[40px] px-4 rounded-t-[6px] text-[13px] font-medium inline-flex items-center gap-2.5 whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                isActive
                  ? "border-[#009691] text-[#009691] bg-white font-bold"
                  : "border-transparent text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f4f6]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#009691]" : "text-[#9ca3af]"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#009691]/10 text-[#009691]" : "bg-gray-100 text-gray-500"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* MODE 1: DEDICATED ONE-BY-ONE PAGE EDITOR                 */}
      {/* ======================================================== */}
      {mainMode === "pages" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 4 COLS: PAGE DIRECTORY LIST */}
          <div className="lg:col-span-4 bg-white border border-[#e8e8e8] rounded-[10px] p-4 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#f2f2f2]">
              <div>
                <h2 className="text-[14px] font-bold text-[#111111]">Site Pages Directory</h2>
                <p className="text-[11px] text-[#5f6368]">Select a page to edit its content &amp; SEO</p>
              </div>
              <span className="text-[11px] font-semibold text-[#009691] bg-[#009691]/10 px-2 py-0.5 rounded-full">
                {filteredPages.length} Active
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchPage}
                onChange={(e) => setSearchPage(e.target.value)}
                placeholder="Search page by name or /slug..."
                className="w-full h-[32px] pl-8 pr-3 rounded-[6px] border border-[#d1d5db] bg-white text-[12px] focus:outline-none focus:border-[#009691]"
              />
            </div>

            {/* Page List */}
            <div className="flex flex-col gap-1 max-h-[560px] overflow-y-auto no-scrollbar pr-1">
              {filteredPages.map((page) => {
                const isSelected = selectedPageId === page.id;
                return (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPageId(page.id)}
                    className={`text-left p-2.5 rounded-[6px] transition-all flex items-start justify-between gap-2 border cursor-pointer ${
                      isSelected
                        ? "bg-[#e6f7f6] border-[#009691] text-[#009691] shadow-2xs"
                        : "bg-white border-transparent hover:bg-[#f9fafb] text-[#111111]"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold truncate flex items-center gap-1.5">
                        <span>{page.name}</span>
                        {page.category === "Repairs" && (
                          <span className="text-[9px] bg-purple-50 text-purple-700 px-1 rounded font-bold">
                            Repair
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                        {page.path}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                        {page.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT 8 COLS: DEDICATED PAGE CONTENT & SEO EDITOR */}
          <div className="lg:col-span-8 bg-white border border-[#e8e8e8] rounded-[10px] p-5 shadow-2xs flex flex-col gap-5">
            
            {/* Page Header Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f2f2f2]">
              <div>
                <span className="text-[11px] font-bold text-[#009691] uppercase tracking-wider">
                  Editing: {selectedPage.category} Page
                </span>
                <h2 className="text-[18px] font-bold text-[#111111]">{selectedPage.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {selectedPage.path}
                  </span>
                  <Link
                    href={selectedPage.path}
                    target="_blank"
                    className="text-[12px] text-[#009691] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View on site</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveAll}
                className="h-[32px] px-3.5 rounded-[6px] bg-[#009691] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 shadow-2xs hover:bg-[#007f7b] cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Page Content</span>
              </button>
            </div>

            {/* Section 1: Hero Section for this Page */}
            <div className="flex flex-col gap-3 p-4 rounded-[8px] bg-[#fafafa] border border-[#e5e7eb]">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#111111] flex items-center gap-1.5">
                  <Layout className="w-4 h-4 text-[#009691]" />
                  <span>Page Hero &amp; Banner Copy</span>
                </span>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#111111] mb-1">
                  Top Eyebrow / Pill Badge
                </label>
                <input
                  type="text"
                  value={selectedPage.heroBadge}
                  onChange={(e) => handleUpdatePage("heroBadge", e.target.value)}
                  className="w-full h-[36px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#111111] mb-1">
                  Main Headline (H1)
                </label>
                <input
                  type="text"
                  value={selectedPage.heroHeadline}
                  onChange={(e) => handleUpdatePage("heroHeadline", e.target.value)}
                  className="w-full h-[36px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-semibold focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#111111] mb-1">
                  Supporting Subtitle / Paragraph
                </label>
                <textarea
                  rows={3}
                  value={selectedPage.heroSubtitle}
                  onChange={(e) => handleUpdatePage("heroSubtitle", e.target.value)}
                  className="w-full p-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] leading-relaxed focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#111111] mb-1">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={selectedPage.primaryCtaText}
                    onChange={(e) => handleUpdatePage("primaryCtaText", e.target.value)}
                    className="w-full h-[34px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[12px] focus:outline-none focus:border-[#009691]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#111111] mb-1">
                    Primary CTA Target URL
                  </label>
                  <input
                    type="text"
                    value={selectedPage.primaryCtaLink}
                    onChange={(e) => handleUpdatePage("primaryCtaLink", e.target.value)}
                    className="w-full h-[34px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[12px] focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: SEO Meta & Google Search Snippet Preview */}
            <div className="flex flex-col gap-3 p-4 rounded-[8px] bg-[#fafafa] border border-[#e5e7eb]">
              <span className="text-[13px] font-bold text-[#111111] flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#009691]" />
                <span>Google Search Engine Optimization (SEO &amp; SERP)</span>
              </span>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] font-medium text-[#111111]">
                    Page Title Tag (&lt;title&gt;)
                  </label>
                  <span className="text-[11px] text-gray-500">
                    {selectedPage.title.length}/60 chars (Optimal)
                  </span>
                </div>
                <input
                  type="text"
                  value={selectedPage.title}
                  onChange={(e) => handleUpdatePage("title", e.target.value)}
                  className="w-full h-[36px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-medium focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] font-medium text-[#111111]">
                    Meta Description Tag
                  </label>
                  <span className="text-[11px] text-gray-500">
                    {selectedPage.metaDesc.length}/160 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={selectedPage.metaDesc}
                  onChange={(e) => handleUpdatePage("metaDesc", e.target.value)}
                  className="w-full p-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] leading-relaxed focus:outline-none focus:border-[#009691]"
                />
              </div>

              {/* LIVE GOOGLE SERP PREVIEW BOX */}
              <div className="mt-2 p-3.5 rounded-[6px] bg-white border border-gray-200 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Google Search Result Preview
                </span>
                <div className="text-[11px] text-gray-600 flex items-center gap-1 truncate font-mono">
                  <span>https://smartfonedoctor.com{selectedPage.path}</span>
                </div>
                <div className="text-[16px] text-[#1a0dab] font-medium leading-snug line-clamp-1 hover:underline cursor-pointer mt-0.5">
                  {selectedPage.title}
                </div>
                <div className="text-[12px] text-[#4d5156] leading-relaxed line-clamp-2 mt-1">
                  {selectedPage.metaDesc}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: SERVICES, BRANDS & PRICE TAGS ENGINE             */}
      {/* ======================================================== */}
      {mainMode === "services" && (
        <div className="flex flex-col gap-5">
          
          {/* Filter Bar & Add Service Button */}
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "all", label: "All Devices" },
                { id: "smartphone", label: "📱 Smartphones" },
                { id: "tablet", label: "📟 Tablets & iPads" },
                { id: "computer", label: "💻 Computers & Laptops" },
                { id: "console", label: "🎮 Gaming Consoles" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterCategory(c.id)}
                  className={`h-[32px] px-3 rounded-[6px] text-[12px] font-medium transition-colors cursor-pointer border ${
                    filterCategory === c.id
                      ? "bg-[#009691] text-white border-[#009691] font-semibold"
                      : "bg-[#f9fafb] text-[#5f6368] border-[#e5e7eb] hover:text-[#111111]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                  placeholder="Filter by model, service, or brand..."
                  className="h-[32px] pl-8 pr-3 rounded-[6px] border border-[#d1d5db] bg-white text-[12px] focus:outline-none focus:border-[#009691]"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAddServiceModal(true)}
                className="h-[32px] px-3.5 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Repair Rate</span>
              </button>
            </div>
          </div>

          {/* PRICING & SERVICE CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredServices.map((item) => {
              const margin = Math.round(((item.retailPrice - item.costPrice) / item.retailPrice) * 100);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#e8e8e8] rounded-[10px] p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-3 relative"
                >
                  <div>
                    {/* Brand & Stock Status Row */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-[#009691] uppercase tracking-wider bg-[#009691]/10 px-2 py-0.5 rounded">
                        {item.brand} · {item.model}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          item.stockStatus === "In Stock"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.stockStatus}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-bold text-[#111111] leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  {/* PRICE TAGS ROW */}
                  <div className="bg-[#f9fafb] p-3 rounded-[8px] border border-[#f2f2f2] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-medium uppercase block">Retail Customer Price</span>
                      <div className="text-[20px] font-bold text-[#111111] tracking-tight">
                        ${item.retailPrice}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 font-medium uppercase block">Parts Cost / Margin</span>
                      <div className="text-[13px] font-semibold text-gray-700">
                        ${item.costPrice}{" "}
                        <span className="text-emerald-600 font-bold">({margin}% margin)</span>
                      </div>
                    </div>
                  </div>

                  {/* TAGS (Turnaround & Warranty) */}
                  <div className="flex items-center gap-2 text-[11px] flex-wrap">
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-[4px] font-medium">
                      <Clock className="w-3 h-3 text-[#009691]" />
                      <span>{item.turnaroundTag}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-[4px] font-medium">
                      <Shield className="w-3 h-3 text-[#009691]" />
                      <span>{item.warrantyTag}</span>
                    </span>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="pt-2 border-t border-[#f2f2f2] flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">ID: {item.id}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteService(item.id)}
                        className="text-gray-400 hover:text-red-600 text-xs p-1 cursor-pointer transition-colors"
                        title="Remove Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 3: MENUS & MEGA-DROPDOWNS MANAGER                   */}
      {/* ======================================================== */}
      {mainMode === "menus" && (
        <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-5 shadow-2xs flex flex-col gap-5">
          <div className="pb-3 border-b border-[#f2f2f2] flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-[#111111]">Header &amp; Mega-Menu Architecture</h2>
              <p className="text-[12px] text-[#5f6368]">
                Configure navigation links, device dropdowns, and header call-to-action buttons
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveAll}
              className="h-[32px] px-3.5 rounded-[6px] bg-[#009691] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 shadow-2xs hover:bg-[#007f7b] cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Menu Tree</span>
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {navItems.map((item, idx) => (
              <div key={item.id} className="p-4 rounded-[8px] border border-[#e5e7eb] bg-[#fafafa] flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#111111] text-white text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const updated = [...navItems];
                        updated[idx].label = e.target.value;
                        setNavItems(updated);
                      }}
                      className="h-[34px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#009691]"
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => {
                        const updated = [...navItems];
                        updated[idx].href = e.target.value;
                        setNavItems(updated);
                      }}
                      className="h-[34px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white text-[12px] font-mono text-gray-600 focus:outline-none focus:border-[#009691]"
                    />
                  </div>

                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${item.hasDropdown ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"}`}>
                    {item.hasDropdown ? "Mega-Dropdown" : "Direct Link"}
                  </span>
                </div>

                {/* Sub-menu items (if dropdown) */}
                {item.subItems && (
                  <div className="pl-6 border-l-2 border-[#009691] flex flex-col gap-2 mt-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Dropdown Sub-Menu Links:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {item.subItems.map((sub, sIdx) => (
                        <div key={sIdx} className="p-2.5 rounded-[6px] bg-white border border-gray-200 shadow-2xs flex items-center justify-between">
                          <div>
                            <span className="text-[12px] font-medium text-[#111111] block">{sub.label}</span>
                            <span className="text-[10px] text-gray-400 font-mono block">{sub.href}</span>
                          </div>
                          {sub.badge && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1 rounded">
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
      )}

      {/* ======================================================== */}
      {/* MODE 4: LOCALBUSINESS SEO & SCHEMA.ORG                   */}
      {/* ======================================================== */}
      {mainMode === "seo" && (
        <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-5 shadow-2xs flex flex-col gap-5">
          <div className="pb-3 border-b border-[#f2f2f2]">
            <h2 className="text-[16px] font-bold text-[#111111]">Philadelphia LocalBusiness Schema.org SEO</h2>
            <p className="text-[12px] text-[#5f6368]">
              Automated structured data feed injected into Google Search Console &amp; Google Maps
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {stores.map((s) => (
              <div key={s.id} className="p-4 rounded-[8px] border border-[#e5e7eb] bg-[#fafafa] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#111111]">{s.name}</span>
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    Store #{s.id}
                  </span>
                </div>
                <p className="text-[12px] text-gray-600">{s.address}, Philadelphia, PA</p>
                <div className="text-[11px] text-gray-500 font-mono mt-2 bg-white p-2 rounded border border-gray-200">
                  <div>@type: "LocalBusiness"</div>
                  <div>telephone: "{s.phone}"</div>
                  <div>priceRange: "$$"</div>
                  <div>aggregateRating: 4.9 (1,524 Reviews)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW REPAIR RATE */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] border border-gray-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-[16px] font-bold text-[#111111]">Add New Repair Service Card</h3>
              <button
                type="button"
                onClick={() => setShowAddServiceModal(false)}
                className="text-gray-400 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateService} className="flex flex-col gap-3.5 text-[13px]">
              <div>
                <label className="block font-medium mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="e.g. Laser Back Glass Replacement"
                  className="w-full h-[36px] px-3 rounded-[6px] border border-gray-300 focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Category</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value as any)}
                    className="w-full h-[36px] px-2.5 rounded-[6px] border border-gray-300 focus:outline-none focus:border-[#009691]"
                  >
                    <option value="smartphone">Smartphone</option>
                    <option value="tablet">Tablet / iPad</option>
                    <option value="computer">MacBook / PC</option>
                    <option value="console">Game Console</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={newServiceBrand}
                    onChange={(e) => setNewServiceBrand(e.target.value)}
                    placeholder="e.g. Apple, Samsung, Sony"
                    className="w-full h-[36px] px-3 rounded-[6px] border border-gray-300 focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Device Model(s)</label>
                <input
                  type="text"
                  required
                  value={newServiceModel}
                  onChange={(e) => setNewServiceModel(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro, PS5, iPad Pro"
                  className="w-full h-[36px] px-3 rounded-[6px] border border-gray-300 focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Customer Retail Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newServiceRetail}
                    onChange={(e) => setNewServiceRetail(Number(e.target.value))}
                    className="w-full h-[36px] px-3 rounded-[6px] border border-gray-300 focus:outline-none focus:border-[#009691]"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Internal Parts Cost ($)</label>
                  <input
                    type="number"
                    required
                    value={newServiceCost}
                    onChange={(e) => setNewServiceCost(Number(e.target.value))}
                    className="w-full h-[36px] px-3 rounded-[6px] border border-gray-300 focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Turnaround Tag</label>
                  <input
                    type="text"
                    value={newServiceTurnaround}
                    onChange={(e) => setNewServiceTurnaround(e.target.value)}
                    placeholder="e.g. 30 Mins, Same Day"
                    className="w-full h-[36px] px-3 rounded-[6px] border border-gray-300 focus:outline-none focus:border-[#009691]"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Warranty Tag</label>
                  <input
                    type="text"
                    value={newServiceWarranty}
                    onChange={(e) => setNewServiceWarranty(e.target.value)}
                    placeholder="e.g. 90-Day Free Warranty"
                    className="w-full h-[36px] px-3 rounded-[6px] border border-gray-300 focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="h-[34px] px-4 rounded-[6px] border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[34px] px-4 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white font-semibold cursor-pointer shadow-sm"
                >
                  Save Repair Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
