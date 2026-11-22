/**
 * Header menu, header button and top bar, edited in Admin > Navigation & Menus.
 * Kept in the browser for now, the same way as the mega menu (megaMenuData.ts).
 */

export type NavItemType = "link" | "dropdown" | "mega";
export type NavItemStyle = "plain" | "pill" | "outline";

export interface NavSubItem {
  id: string;
  label: string;
  href: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** link: plain link. dropdown: opens `children`. mega: opens the mega menu (Admin > Mega Menu Builder). */
  type: NavItemType;
  /** plain: text. pill: filled highlight with a live dot. outline: outlined highlight. */
  style: NavItemStyle;
  hidden?: boolean;
  children?: NavSubItem[];
}

export interface NavMenuConfig {
  items: NavItem[];
  cta: { enabled: boolean; label: string; href: string };
  topBar: { enabled: boolean; tagline: string; phoneLabel: string; phone: string };
}

export const DEFAULT_NAV_MENU: NavMenuConfig = {
  items: [
    { id: "nav-repair", label: "Repair", href: "/repairs", type: "mega", style: "plain" },
    {
      id: "nav-services",
      label: "Repairs & Services",
      href: "/repairs/iphone",
      type: "dropdown",
      style: "plain",
      children: [
        { id: "sub-iphone", label: "iPhone Repair", href: "/repairs/smartphone/iphone-repair" },
        { id: "sub-ipad", label: "iPad & Tablet Repair", href: "/repairs/tablet/ipad-repair" },
        { id: "sub-imac", label: "iMac & Computer Repair", href: "/repairs/computer/imac-repair" },
        { id: "sub-console", label: "Game Console Repair", href: "/repairs/console/playstation-repair" },
        { id: "sub-issues", label: "All Common Issues →", href: "/common-issues" },
      ],
    },
    { id: "nav-estimate", label: "Free Estimate", href: "/schedule-repair", type: "link", style: "pill" },
    { id: "nav-locations", label: "Locations", href: "/locations/i/book-repair", type: "link", style: "plain" },
    { id: "nav-track", label: "Track Status", href: "/track", type: "link", style: "outline" },
    { id: "nav-about", label: "About Us", href: "/about", type: "link", style: "plain" },
  ],
  cta: { enabled: true, label: "Start Repair", href: "/locations/i/book-repair" },
  topBar: {
    enabled: true,
    tagline: "Philadelphia's Trusted Device Repair Experts",
    phoneLabel: "Text:",
    phone: "(215) 598-2090",
  },
};

export const NAV_MENU_EVENT = "sfd-nav-menu-updated";

export const newNavId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** A link counts as current for its whole section: /about also covers /about/team. */
export function isNavItemActive(href: string, pathname: string | null | undefined): boolean {
  if (!pathname || !href.startsWith("/")) return false;
  if (href === "/") return pathname === "/";
  const section = `/${href.split("/")[1]}`;
  return pathname === section || pathname.startsWith(`${section}/`);
}

/** "(215) 598-2090" -> "tel:+12155982090" (US numbers get +1). */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "#";
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}
