/**
 * SmartFoneDoctor Unified Taxonomy & Content Architecture
 * Central Source of Truth connecting:
 * - Device Categories (Smartphones, Tablets, Game Consoles, Computers)
 * - Brands (Apple, Samsung, Google, Motorola, Sony, Microsoft, Nintendo, etc.)
 * - Device Models (iPhone 16 Pro, Galaxy S25, PS5, etc.)
 * - Service Categories & Common Issues (Screen, Battery, Port, Water, HDMI, etc.)
 * - Core & Utility Pages (About, Locations, FAQ, Track, Schedule, etc.)
 * - Knowledge Base / Blog Guides (Troubleshooting, Guides, Tips)
 */

export type TaxonomyType =
  | "category"
  | "brand"
  | "device"
  | "service"
  | "issue"
  | "page"
  | "blog";

export interface TaxonomyEntity {
  id: string;
  slug: string;
  title: string;
  type: TaxonomyType;
  categorySlug?: string;
  brandSlug?: string;
  url: string;
  badge?: string;
  description?: string;
}

// 1. DEVICE CATEGORIES
export interface DeviceCategory {
  id: string;
  slug: "smartphone" | "tablet" | "console" | "computer";
  name: string;
  pluralName: string;
  url: string;
  description: string;
  icon: string;
}

export const DEVICE_CATEGORIES: DeviceCategory[] = [
  {
    id: "cat-smartphones",
    slug: "smartphone",
    name: "Smartphone",
    pluralName: "Smartphones",
    url: "/repairs/smartphone",
    description: "Screen replacement, battery renewals, and charging port fixes for iOS and Android.",
    icon: "Smartphone",
  },
  {
    id: "cat-tablets",
    slug: "tablet",
    name: "Tablet",
    pluralName: "Tablets & iPads",
    url: "/repairs/tablet",
    description: "Digitizer glass repair, LCD assemblies, and battery replacements for iPad and Galaxy Tab.",
    icon: "Tablet",
  },
  {
    id: "cat-consoles",
    slug: "console",
    name: "Game Console",
    pluralName: "Gaming Consoles",
    url: "/repairs/console/playstation-repair",
    description: "Micro-soldering HDMI port replacement, fan repasting, and disc drive repairs.",
    icon: "Gamepad2",
  },
  {
    id: "cat-computers",
    slug: "computer",
    name: "Computer",
    pluralName: "Computers & Laptops",
    url: "/repairs/computer",
    description: "Retina screens, logic board diagnostics, keyboard repairs, and SSD upgrades.",
    icon: "Laptop",
  },
];

// 2. BRANDS
export interface BrandTaxonomy {
  id: string;
  slug: string;
  name: string;
  categorySlugs: ("smartphone" | "tablet" | "console" | "computer")[];
  tagline: string;
  url: string;
}

export const BRANDS_TAXONOMY: BrandTaxonomy[] = [
  {
    id: "brand-apple",
    slug: "apple",
    name: "Apple",
    categorySlugs: ["smartphone", "tablet", "computer"],
    tagline: "All iPhone, iPad & Mac Models",
    url: "/repairs/iphone",
  },
  {
    id: "brand-samsung",
    slug: "samsung",
    name: "Samsung",
    categorySlugs: ["smartphone", "tablet"],
    tagline: "All Galaxy S, Z Fold & Tab Models",
    url: "/repairs/smartphone",
  },
  {
    id: "brand-google",
    slug: "google",
    name: "Google",
    categorySlugs: ["smartphone"],
    tagline: "All Pixel & Pixel Pro Models",
    url: "/repairs/smartphone",
  },
  {
    id: "brand-motorola",
    slug: "motorola",
    name: "Motorola",
    categorySlugs: ["smartphone"],
    tagline: "All Moto G, Edge & Razr Models",
    url: "/repairs/smartphone",
  },
  {
    id: "brand-sony",
    slug: "sony",
    name: "Sony PlayStation",
    categorySlugs: ["console"],
    tagline: "PS5, PS4 Pro & DualSense",
    url: "/repairs/console/playstation-repair",
  },
  {
    id: "brand-microsoft",
    slug: "microsoft",
    name: "Microsoft Xbox & Surface",
    categorySlugs: ["console", "tablet", "computer"],
    tagline: "Series X/S & Surface Pro",
    url: "/repairs/console/playstation-repair",
  },
  {
    id: "brand-nintendo",
    slug: "nintendo",
    name: "Nintendo",
    categorySlugs: ["console"],
    tagline: "Switch, OLED & Joy-Con Drift",
    url: "/repairs/console/playstation-repair",
  },
  {
    id: "brand-dell",
    slug: "dell",
    name: "Dell & Alienware",
    categorySlugs: ["computer"],
    tagline: "XPS, Inspiron & G-Series",
    url: "/repairs/computer",
  },
  {
    id: "brand-hp",
    slug: "hp",
    name: "HP",
    categorySlugs: ["computer"],
    tagline: "Spectre, Envy & Pavilion",
    url: "/repairs/computer",
  },
  {
    id: "brand-lenovo",
    slug: "lenovo",
    name: "Lenovo",
    categorySlugs: ["computer"],
    tagline: "ThinkPad, Yoga & Legion",
    url: "/repairs/computer",
  },
  {
    id: "brand-asus",
    slug: "asus",
    name: "Asus",
    categorySlugs: ["computer", "console"],
    tagline: "ROG, ZenBook & ROG Ally",
    url: "/repairs/computer",
  },
];

// 3. SERVICE CATEGORIES & COMMON ISSUES (Connected to /common-issues/[category]/[slug])
export interface ServiceIssueTaxonomy {
  id: string;
  slug: string;
  title: string;
  categorySlug: "smartphone" | "tablet" | "console" | "computer";
  url: string;
  startingPrice: number;
  turnaround: string;
  badge?: string;
}

export const SERVICE_ISSUES_TAXONOMY: ServiceIssueTaxonomy[] = [
  {
    id: "iss-screen",
    slug: "cracked-screen-repair",
    title: "Cracked Screen Repair",
    categorySlug: "smartphone",
    url: "/common-issues/smartphone/cracked-glass-replacement",
    startingPrice: 89,
    turnaround: "30 Mins",
    badge: "Most Common",
  },
  {
    id: "iss-battery",
    slug: "phone-battery-replacement",
    title: "Phone Battery Replacement",
    categorySlug: "smartphone",
    url: "/common-issues/smartphone/battery-depleting-quickly",
    startingPrice: 69,
    turnaround: "25 Mins",
    badge: "OEM Grade",
  },
  {
    id: "iss-port",
    slug: "charging-port-repair",
    title: "Charging Port Repair",
    categorySlug: "smartphone",
    url: "/common-issues/smartphone/charging-port-replacement",
    startingPrice: 79,
    turnaround: "30 Mins",
  },
  {
    id: "iss-water",
    slug: "water-damage-repair",
    title: "Water Damage Repair",
    categorySlug: "smartphone",
    url: "/common-issues/smartphone/water-damaged-phone-repair",
    startingPrice: 69,
    turnaround: "Same Day",
  },
  {
    id: "iss-backglass",
    slug: "back-glass-repair",
    title: "Back Glass Laser Repair",
    categorySlug: "smartphone",
    url: "/common-issues/smartphone/cracked-glass-replacement",
    startingPrice: 119,
    turnaround: "60 Mins",
  },
  {
    id: "iss-camera",
    slug: "camera-repair",
    title: "Camera & Lens Repair",
    categorySlug: "smartphone",
    url: "/repairs/smartphone",
    startingPrice: 89,
    turnaround: "45 Mins",
  },
  {
    id: "iss-audio",
    slug: "speaker-mic-repair",
    title: "Speaker & Mic Repair",
    categorySlug: "smartphone",
    url: "/repairs/smartphone",
    startingPrice: 69,
    turnaround: "30 Mins",
  },
  // Tablet
  {
    id: "iss-tab-digitizer",
    slug: "cracked-digitizer-glass",
    title: "Cracked Digitizer / Glass",
    categorySlug: "tablet",
    url: "/common-issues/tablet/broken-tablet-screen",
    startingPrice: 119,
    turnaround: "Same Day",
  },
  {
    id: "iss-tab-battery",
    slug: "tablet-battery-replacement",
    title: "Tablet Battery Replacement",
    categorySlug: "tablet",
    url: "/repairs/tablet",
    startingPrice: 89,
    turnaround: "45 Mins",
  },
  // Console
  {
    id: "iss-hdmi",
    slug: "hdmi-port-replacement",
    title: "HDMI Port Replacement",
    categorySlug: "console",
    url: "/repairs/console/playstation-repair",
    startingPrice: 139,
    turnaround: "Same Day",
    badge: "Micro-Soldered",
  },
  {
    id: "iss-overheat",
    slug: "overheating-fan-cleaning",
    title: "Overheating & Thermal Repaste",
    categorySlug: "console",
    url: "/repairs/console/playstation-repair",
    startingPrice: 79,
    turnaround: "45 Mins",
  },
  // Computer
  {
    id: "iss-laptop-screen",
    slug: "laptop-screen-replacement",
    title: "Laptop Screen Replacement",
    categorySlug: "computer",
    url: "/repairs/computer",
    startingPrice: 149,
    turnaround: "24-48 Hours",
  },
  {
    id: "iss-laptop-battery",
    slug: "laptop-battery-replacement",
    title: "Laptop Battery Replacement",
    categorySlug: "computer",
    url: "/repairs/computer",
    startingPrice: 99,
    turnaround: "Same Day",
  },
  {
    id: "iss-ssd-data",
    slug: "ssd-upgrade-data-recovery",
    title: "SSD Upgrade & Data Recovery",
    categorySlug: "computer",
    url: "/repairs/computer",
    startingPrice: 119,
    turnaround: "Same Day",
  },
];

// 4. DEVICE MODELS TAXONOMY (Popular devices linked in mega menu)
export interface DeviceModelTaxonomy {
  id: string;
  name: string;
  categorySlug: "smartphone" | "tablet" | "console" | "computer";
  brandSlug: string;
  url: string;
  isPopular: boolean;
}

export const DEVICE_MODELS_TAXONOMY: DeviceModelTaxonomy[] = [
  // Smartphones
  { id: "dev-ip16pro", name: "iPhone 16 Pro Repair", categorySlug: "smartphone", brandSlug: "apple", url: "/schedule-repair?device=iPhone-16-Pro", isPopular: true },
  { id: "dev-ip15", name: "iPhone 15 Repair", categorySlug: "smartphone", brandSlug: "apple", url: "/schedule-repair?device=iPhone-15", isPopular: true },
  { id: "dev-ip14", name: "iPhone 14 Repair", categorySlug: "smartphone", brandSlug: "apple", url: "/schedule-repair?device=iPhone-14", isPopular: true },
  { id: "dev-ip13", name: "iPhone 13 Repair", categorySlug: "smartphone", brandSlug: "apple", url: "/schedule-repair?device=iPhone-13", isPopular: true },
  { id: "dev-s25", name: "Galaxy S25 Repair", categorySlug: "smartphone", brandSlug: "samsung", url: "/schedule-repair?device=Galaxy-S25", isPopular: true },
  { id: "dev-px9", name: "Google Pixel 9 Repair", categorySlug: "smartphone", brandSlug: "google", url: "/schedule-repair?device=Pixel-9", isPopular: true },

  // Tablets
  { id: "dev-ipad-pro", name: 'iPad Pro 12.9" Repair', categorySlug: "tablet", brandSlug: "apple", url: "/schedule-repair?device=iPad-Pro-12.9", isPopular: true },
  { id: "dev-ipad-air5", name: "iPad Air 5 Repair", categorySlug: "tablet", brandSlug: "apple", url: "/schedule-repair?device=iPad-Air-5", isPopular: true },
  { id: "dev-ipad-10", name: "iPad 10th Gen Repair", categorySlug: "tablet", brandSlug: "apple", url: "/schedule-repair?device=iPad-10th-Gen", isPopular: true },
  { id: "dev-tab-s9", name: "Galaxy Tab S9 Repair", categorySlug: "tablet", brandSlug: "samsung", url: "/schedule-repair?device=Galaxy-Tab-S9", isPopular: true },
  { id: "dev-surface9", name: "Surface Pro 9 Repair", categorySlug: "tablet", brandSlug: "microsoft", url: "/schedule-repair?device=Surface-Pro-9", isPopular: true },

  // Consoles
  { id: "dev-ps5", name: "PlayStation 5 Repair", categorySlug: "console", brandSlug: "sony", url: "/schedule-repair?device=PlayStation-5", isPopular: true },
  { id: "dev-ps4", name: "PlayStation 4 Pro Repair", categorySlug: "console", brandSlug: "sony", url: "/schedule-repair?device=PlayStation-4-Pro", isPopular: true },
  { id: "dev-xbox-x", name: "Xbox Series X Repair", categorySlug: "console", brandSlug: "microsoft", url: "/schedule-repair?device=Xbox-Series-X", isPopular: true },
  { id: "dev-switch-oled", name: "Nintendo Switch OLED", categorySlug: "console", brandSlug: "nintendo", url: "/schedule-repair?device=Nintendo-Switch-OLED", isPopular: true },
  { id: "dev-steamdeck", name: "Steam Deck Repair", categorySlug: "console", brandSlug: "asus", url: "/schedule-repair?device=Steam-Deck", isPopular: true },

  // Computers
  { id: "dev-macbook-pro", name: 'MacBook Pro 14"/16" Repair', categorySlug: "computer", brandSlug: "apple", url: "/schedule-repair?device=MacBook-Pro", isPopular: true },
  { id: "dev-macbook-air", name: "MacBook Air M2/M3", categorySlug: "computer", brandSlug: "apple", url: "/schedule-repair?device=MacBook-Air", isPopular: true },
  { id: "dev-dell-xps", name: "Dell XPS & Inspiron", categorySlug: "computer", brandSlug: "dell", url: "/schedule-repair?device=Dell-XPS", isPopular: true },
  { id: "dev-hp-envy", name: "HP Pavilion & Envy", categorySlug: "computer", brandSlug: "hp", url: "/schedule-repair?device=HP-Envy", isPopular: true },
  { id: "dev-lenovo-thinkpad", name: "Lenovo ThinkPad Repair", categorySlug: "computer", brandSlug: "lenovo", url: "/schedule-repair?device=Lenovo-ThinkPad", isPopular: true },
  { id: "dev-asus-rog", name: "Asus ROG & ZenBook", categorySlug: "computer", brandSlug: "asus", url: "/schedule-repair?device=Asus-ROG", isPopular: true },
];

// 5. CORE PAGES
export interface CorePageTaxonomy {
  id: string;
  slug: string;
  title: string;
  url: string;
  category: "Core" | "Utility" | "Legal";
}

export const CORE_PAGES_TAXONOMY: CorePageTaxonomy[] = [
  { id: "page-home", slug: "home", title: "Homepage", url: "/", category: "Core" },
  { id: "page-about", slug: "about", title: "About Us", url: "/about", category: "Core" },
  { id: "page-locations", slug: "locations", title: "Store Locations", url: "/locations", category: "Core" },
  { id: "page-schedule", slug: "schedule-repair", title: "Schedule Repair Flow", url: "/schedule-repair", category: "Utility" },
  { id: "page-track", slug: "track", title: "Track Status", url: "/track", category: "Utility" },
  { id: "page-faq", slug: "faq", title: "Frequently Asked Questions", url: "/faq", category: "Utility" },
  { id: "page-common-issues", slug: "common-issues", title: "Common Issues & Troubleshooting Guides", url: "/common-issues", category: "Core" },
  { id: "page-terms", slug: "terms", title: "Terms of Service", url: "/terms", category: "Legal" },
  { id: "page-privacy", slug: "privacy", title: "Privacy Policy", url: "/privacy", category: "Legal" },
];

// 6. BLOG / GUIDES POSTS
export interface BlogPostTaxonomy {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  url: string;
  date: string;
  readTime: string;
  excerpt: string;
}

export const BLOG_POSTS_TAXONOMY: BlogPostTaxonomy[] = [
  {
    id: "post-1",
    slug: "iphone-battery-health-guide",
    title: "When to Replace Your iPhone Battery: Signs, Cycles & Peak Performance",
    categorySlug: "smartphone",
    categoryName: "iPhone Repair Guide",
    url: "/common-issues/smartphone/battery-depleting-quickly",
    date: "Nov 10, 2026",
    readTime: "4 min read",
    excerpt: "Learn how to read your iOS Maximum Capacity score and know when throttling begins.",
  },
  {
    id: "post-2",
    slug: "what-to-do-water-damaged-phone",
    title: "Dropped Phone in Water? 4 Critical Steps Before Bringing It to the Shop",
    categorySlug: "smartphone",
    categoryName: "Emergency Care",
    url: "/common-issues/smartphone/water-damaged-phone-repair",
    date: "Nov 08, 2026",
    readTime: "5 min read",
    excerpt: "Why the rice trick causes corrosion, and how ultrasonic cleaning saves motherboards.",
  },
  {
    id: "post-3",
    slug: "ps5-hdmi-port-no-signal-fix",
    title: "PS5 White Light of Death or No Signal: HDMI Port vs Encoder IC",
    categorySlug: "console",
    categoryName: "Console Diagnostics",
    url: "/repairs/console/playstation-repair",
    date: "Nov 05, 2026",
    readTime: "6 min read",
    excerpt: "How micro-soldering repairs PlayStation 5 HDMI ports with zero motherboard warpage.",
  },
];

/**
 * SMART URL RESOLVER
 * Resolves any item name or taxonomy item into its valid canonical URL
 */
export function resolveTaxonomyUrl(
  type: TaxonomyType,
  nameOrSlug: string,
  categorySlug?: string
): string {
  const clean = nameOrSlug.trim().toLowerCase();

  // 1. Check exact match in Device Models
  const modelMatch = DEVICE_MODELS_TAXONOMY.find(
    (m) => m.name.toLowerCase() === clean || m.id.toLowerCase() === clean
  );
  if (modelMatch) return modelMatch.url;

  // 2. Check exact match in Service Issues
  const issueMatch = SERVICE_ISSUES_TAXONOMY.find(
    (i) => i.title.toLowerCase() === clean || i.slug.toLowerCase() === clean
  );
  if (issueMatch) return issueMatch.url;

  // 3. Check exact match in Brands
  const brandMatch = BRANDS_TAXONOMY.find(
    (b) => b.name.toLowerCase() === clean || b.slug.toLowerCase() === clean
  );
  if (brandMatch) return brandMatch.url;

  // 4. Check exact match in Core Pages
  const pageMatch = CORE_PAGES_TAXONOMY.find(
    (p) => p.title.toLowerCase() === clean || p.slug.toLowerCase() === clean
  );
  if (pageMatch) return pageMatch.url;

  // 5. Automatic Semantic Fallback Generation
  const slugified = clean
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (categorySlug) {
    if (clean.includes("repair") || clean.includes("fix") || clean.includes("replacement")) {
      return `/schedule-repair?device=${encodeURIComponent(nameOrSlug.trim())}`;
    }
    return `/repairs/${categorySlug}/${slugified}`;
  }

  return `/schedule-repair?item=${encodeURIComponent(nameOrSlug.trim())}`;
}

/**
 * Returns a grouped searchable list of all linkable entities in the system
 */
export function getAllLinkableEntities(): {
  group: string;
  items: { label: string; url: string; badge?: string }[];
}[] {
  return [
    {
      group: "Core Site Pages",
      items: CORE_PAGES_TAXONOMY.map((p) => ({
        label: p.title,
        url: p.url,
        badge: p.category,
      })),
    },
    {
      group: "Device Categories",
      items: DEVICE_CATEGORIES.map((c) => ({
        label: `${c.pluralName} Hub`,
        url: c.url,
        badge: "Category Hub",
      })),
    },
    {
      group: "Hardware Brands",
      items: BRANDS_TAXONOMY.map((b) => ({
        label: `${b.name} (${b.tagline})`,
        url: b.url,
        badge: "Brand Hub",
      })),
    },
    {
      group: "Common Issues & Fix Guides",
      items: SERVICE_ISSUES_TAXONOMY.map((s) => ({
        label: `${s.title} (${s.categorySlug})`,
        url: s.url,
        badge: `From $${s.startingPrice}`,
      })),
    },
    {
      group: "Popular Device Models",
      items: DEVICE_MODELS_TAXONOMY.map((m) => ({
        label: m.name,
        url: m.url,
        badge: m.brandSlug.toUpperCase(),
      })),
    },
    {
      group: "Blog & Repair Articles",
      items: BLOG_POSTS_TAXONOMY.map((bp) => ({
        label: bp.title,
        url: bp.url,
        badge: bp.categoryName,
      })),
    },
  ];
}

// LocalStorage Persistence Helpers for CRUD
export function getStoredCategories(): DeviceCategory[] {
  if (typeof window === "undefined") return DEVICE_CATEGORIES;
  try {
    const raw = localStorage.getItem("sfd_tax_categories");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEVICE_CATEGORIES;
}

export function saveStoredCategories(cats: DeviceCategory[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("sfd_tax_categories", JSON.stringify(cats));
  window.dispatchEvent(new Event("sfd-taxonomies-updated"));
}

export function getStoredBrands(): BrandTaxonomy[] {
  if (typeof window === "undefined") return BRANDS_TAXONOMY;
  try {
    const raw = localStorage.getItem("sfd_tax_brands");
    if (raw) return JSON.parse(raw);
  } catch {}
  return BRANDS_TAXONOMY;
}

export function saveStoredBrands(brands: BrandTaxonomy[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("sfd_tax_brands", JSON.stringify(brands));
  window.dispatchEvent(new Event("sfd-taxonomies-updated"));
}

export function getStoredIssues(): ServiceIssueTaxonomy[] {
  if (typeof window === "undefined") return SERVICE_ISSUES_TAXONOMY;
  try {
    const raw = localStorage.getItem("sfd_tax_issues");
    if (raw) return JSON.parse(raw);
  } catch {}
  return SERVICE_ISSUES_TAXONOMY;
}

export function saveStoredIssues(issues: ServiceIssueTaxonomy[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("sfd_tax_issues", JSON.stringify(issues));
  window.dispatchEvent(new Event("sfd-taxonomies-updated"));
}

export function getStoredModels(): DeviceModelTaxonomy[] {
  if (typeof window === "undefined") return DEVICE_MODELS_TAXONOMY;
  try {
    const raw = localStorage.getItem("sfd_tax_models");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEVICE_MODELS_TAXONOMY;
}

export function saveStoredModels(models: DeviceModelTaxonomy[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("sfd_tax_models", JSON.stringify(models));
  window.dispatchEvent(new Event("sfd-taxonomies-updated"));
}

export function getStoredBlogs(): BlogPostTaxonomy[] {
  if (typeof window === "undefined") return BLOG_POSTS_TAXONOMY;
  try {
    const raw = localStorage.getItem("sfd_tax_blogs");
    if (raw) return JSON.parse(raw);
  } catch {}
  return BLOG_POSTS_TAXONOMY;
}

export function saveStoredBlogs(blogs: BlogPostTaxonomy[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("sfd_tax_blogs", JSON.stringify(blogs));
  window.dispatchEvent(new Event("sfd-taxonomies-updated"));
}


