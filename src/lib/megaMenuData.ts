import { resolveTaxonomyUrl } from "./taxonomy";

export type CategoryKey = "smartphones" | "tablet" | "consoles" | "computers";

export interface BrandItem {
  title: string;
  subtitle: string;
  href?: string;
}

export interface MegaCategoryData {
  key: CategoryKey;
  label: string;
  iconType: "Smartphone" | "Tablet" | "Gamepad2" | "Laptop";
  popularDevices: string[];
  commonIssues: string[];
  brands: BrandItem[];
  allLinkText: string;
  href: string;
}

export interface MegaMenuCtaCard {
  title: string;
  description: string;
  primaryBtnText: string;
  primaryBtnHref: string;
  secondaryBtnText: string;
  secondaryBtnHref: string;
}

export interface MegaMenuConfig {
  categories: Record<CategoryKey, MegaCategoryData>;
  ctaCard: MegaMenuCtaCard;
}

export const DEFAULT_MEGA_MENU_CONFIG: MegaMenuConfig = {
  ctaCard: {
    title: "Need your device fixed?",
    description:
      "Find your device, see repair options and book your nearest SmartFone Doctor location.",
    primaryBtnText: "Book a Repair",
    primaryBtnHref: "/schedule-repair",
    secondaryBtnText: "Find a Store Near You",
    secondaryBtnHref: "/locations/i/book-repair",
  },
  categories: {
    smartphones: {
      key: "smartphones",
      label: "Smartphones",
      iconType: "Smartphone",
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
        "Back Glass Repair",
        "Camera Repair",
        "Speaker & Mic Repair",
      ],
      brands: [
        { title: "Apple Repair", subtitle: "All Apple Models" },
        { title: "Samsung Repair", subtitle: "All Samsung Models" },
        { title: "Google Repair", subtitle: "All Google Models" },
        { title: "Motorola Repair", subtitle: "All Motorola Models" },
      ],
      allLinkText: "All Smartphone Repairs",
      href: "/repairs/smartphone",
    },
    tablet: {
      key: "tablet",
      label: "Tablets",
      iconType: "Tablet",
      popularDevices: [
        'iPad Pro 12.9" Repair',
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
        "Headphone Jack / Audio Repair",
      ],
      brands: [
        { title: "Apple iPad Repair", subtitle: "All iPad Models" },
        { title: "Samsung Tab Repair", subtitle: "All Galaxy Tab Models" },
        { title: "Microsoft Surface", subtitle: "All Surface Models" },
        { title: "Amazon Fire Tablet", subtitle: "All Kindle Fire Models" },
      ],
      allLinkText: "All Tablet Repairs",
      href: "/repairs/tablet",
    },
    consoles: {
      key: "consoles",
      label: "Game Console",
      iconType: "Gamepad2",
      popularDevices: [
        "PlayStation 5 Repair",
        "PlayStation 4 Pro Repair",
        "Xbox Series X Repair",
        "Xbox Series S Repair",
        "Nintendo Switch OLED",
        "Steam Deck Repair",
      ],
      commonIssues: [
        "HDMI Port Replacement",
        "Overheating & Fan Cleaning",
        "Disc Drive Repair",
        "No Power / Power Supply",
        "Joy-Con Drift Repair",
        "Software & OS Recovery",
        "Controller Port / Jack Repair",
      ],
      brands: [
        { title: "Sony PlayStation", subtitle: "PS5 & PS4 Models" },
        { title: "Microsoft Xbox", subtitle: "Series X/S & One" },
        { title: "Nintendo Repair", subtitle: "Switch, OLED & Lite" },
        { title: "Valve & Handhelds", subtitle: "Steam Deck & ROG Ally" },
      ],
      allLinkText: "All Game Console Repairs",
      href: "/repairs/console/playstation-repair",
    },
    computers: {
      key: "computers",
      label: "Computers",
      iconType: "Laptop",
      popularDevices: [
        'MacBook Pro 14"/16" Repair',
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
        "Virus Removal & OS Reinstall",
      ],
      brands: [
        { title: "Apple Mac Repair", subtitle: "MacBook & iMac Models" },
        { title: "Windows Laptop Repair", subtitle: "Dell, HP, Lenovo, Asus" },
        { title: "Desktop & PC Custom", subtitle: "Gaming & Workstation PCs" },
        { title: "Chromebook Repair", subtitle: "All Chromebook Models" },
      ],
      allLinkText: "All Computer Repairs",
      href: "/repairs/computer",
    },
  },
};

const STORAGE_KEY = "sfd_mega_menu_config_v2";

export function getStoredMegaMenu(): MegaMenuConfig {
  if (typeof window === "undefined") {
    return DEFAULT_MEGA_MENU_CONFIG;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.categories && parsed?.ctaCard) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse mega menu from localStorage", e);
  }
  return DEFAULT_MEGA_MENU_CONFIG;
}

export function saveStoredMegaMenu(config: MegaMenuConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event("sfd-mega-menu-updated"));
  } catch (e) {
    console.error("Failed to save mega menu to localStorage", e);
  }
}

/**
 * Connected URL Resolvers
 */
export function getCategoryTaxonomySlug(key: CategoryKey): "smartphone" | "tablet" | "console" | "computer" {
  switch (key) {
    case "smartphones":
      return "smartphone";
    case "consoles":
      return "console";
    case "computers":
      return "computer";
    case "tablet":
      return "tablet";
  }
}

export function getDeviceUrl(name: string, category: CategoryKey): string {
  const catSlug = getCategoryTaxonomySlug(category);
  return resolveTaxonomyUrl("device", name, catSlug);
}

export function getIssueUrl(title: string, category: CategoryKey): string {
  const catSlug = getCategoryTaxonomySlug(category);
  return resolveTaxonomyUrl("issue", title, catSlug);
}

export function getBrandUrl(title: string, category: CategoryKey): string {
  const catSlug = getCategoryTaxonomySlug(category);
  return resolveTaxonomyUrl("brand", title, catSlug);
}
