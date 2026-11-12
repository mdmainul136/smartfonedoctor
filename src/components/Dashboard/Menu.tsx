"use client";

import { useState, useEffect } from "react";
import { role } from "@/lib/data";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Wrench,
  MapPin,
  Globe,
  Sparkles,
  Star,
  FileText,
  Layers,
  User,
  Settings,
  LogOut,
  ChevronDown,
  LucideIcon,
} from "lucide-react";
import { LOCAL_SEO_LINKS } from "./LocalSeoNav";
import { LISTINGS_SUB_LINKS } from "./ListingsNav";

type MenuLink = {
  icon: LucideIcon;
  label: string;
  href: string;
  visible: string[];
  children?: readonly { label: string; href: string }[];
};

const menuItems: { title: string; items: MenuLink[] }[] = [
  {
    title: "Store Operations",
    items: [
      {
        icon: LayoutDashboard,
        label: "Overview",
        href: "/admin",
        visible: ["admin", "teacher"],
      },
      {
        icon: CalendarCheck,
        label: "Leads & bookings",
        href: "/admin/leads",
        visible: ["admin", "teacher"],
      },
      {
        icon: Star,
        label: "Reviews & reputation",
        href: "/admin/reviews",
        visible: ["admin", "teacher"],
      },
    ],
  },
  {
    title: "Website CMS",
    items: [
      {
        icon: FileText,
        label: "Pages & SEO",
        href: "/admin/pages",
        visible: ["admin"],
      },
      {
        icon: Layers,
        label: "Mega Menu Builder",
        href: "/admin/mega-menu",
        visible: ["admin"],
      },
      {
        icon: Wrench,
        label: "Services & Pricing",
        href: "/admin/services",
        visible: ["admin", "teacher"],
      },
      {
        icon: Globe,
        label: "Navigation & Menus",
        href: "/admin/navigation",
        visible: ["admin"],
      },
      {
        icon: Sparkles,
        label: "Google Schema & SEO",
        href: "/admin/seo",
        visible: ["admin"],
      },
    ],
  },
  {
    title: "Growth & Visibility",
    items: [
      {
        icon: MapPin,
        label: "GMB & Local SEO",
        href: "/admin/local-seo",
        visible: ["admin", "teacher"],
        children: LOCAL_SEO_LINKS,
      },
      {
        icon: Globe,
        label: "Directory listings",
        href: "/admin/listings",
        visible: ["admin", "teacher"],
        children: LISTINGS_SUB_LINKS,
      },
      {
        icon: Sparkles,
        label: "Search & AI visibility",
        href: "/admin/listings/ai-visibility",
        visible: ["admin", "teacher"],
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        icon: User,
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher"],
      },
      {
        icon: Settings,
        label: "Settings",
        href: "/settings",
        visible: ["admin", "teacher"],
      },
      {
        icon: LogOut,
        label: "Sign out",
        href: "/logout",
        visible: ["admin", "teacher"],
      },
    ],
  },
];

const Menu = () => {
  const pathname = usePathname();
  const inListings = LISTINGS_SUB_LINKS.some((l) => pathname === l.href);
  const inLocalSeo = LOCAL_SEO_LINKS.some((l) => pathname === l.href);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "GMB & Local SEO": inLocalSeo,
    "Directory listings": inListings || true,
  });

  useEffect(() => {
    if (inListings) {
      setOpenGroups((prev) => ({ ...prev, "Directory listings": true }));
    } else if (inLocalSeo) {
      setOpenGroups((prev) => ({ ...prev, "GMB & Local SEO": true }));
    }
  }, [inListings, inLocalSeo]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav aria-label="Main navigation" className="mt-4 flex flex-col gap-5">
      {menuItems.map((section) => (
        <div className="flex flex-col gap-0.5" key={section.title}>
          <span className="hidden lg:block px-2 pb-1.5 text-[12px] font-normal text-[#6b6b6b]">
            {section.title}
          </span>

          {section.items
            .filter((item) => item.visible.includes(role))
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (!item.children) {
                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    title={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={`h-[34px] flex items-center justify-center lg:justify-start gap-2.5 px-2 rounded-[6px] text-[13px] transition-colors ${
                      isActive
                        ? "bg-[#eeeeee] text-[#111111] font-medium"
                        : "text-[#5f6368] hover:bg-[#eeeeee]/60 hover:text-[#111111]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#111111]" : "text-[#6b6b6b]"
                      }`}
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                    <span className="hidden lg:block truncate">{item.label}</span>
                  </Link>
                );
              }

              const groupActive = item.children.some((c) => pathname === c.href);
              const isOpen = !!openGroups[item.label];

              return (
                <div key={item.label} className="flex flex-col">
                  {/* Collapsed rail link for <lg */}
                  <Link
                    href={item.href}
                    title={item.label}
                    aria-label={item.label}
                    className={`lg:hidden h-[34px] flex items-center justify-center px-2 rounded-[6px] transition-colors ${
                      groupActive
                        ? "bg-[#eeeeee] text-[#111111]"
                        : "text-[#5f6368] hover:bg-[#eeeeee]/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                  </Link>

                  {/* Expandable button for lg+ */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    aria-expanded={isOpen}
                    className={`hidden lg:flex h-[34px] items-center gap-2.5 px-2 rounded-[6px] text-[13px] transition-colors text-left cursor-pointer ${
                      groupActive
                        ? "text-[#111111] font-medium"
                        : "text-[#5f6368] hover:bg-[#eeeeee]/60 hover:text-[#111111]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        groupActive ? "text-[#111111]" : "text-[#6b6b6b]"
                      }`}
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#6b6b6b] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <ul className="hidden lg:flex flex-col ml-[17px] pl-2.5 border-l border-[#e5e7eb] mt-0.5 mb-1 gap-0.5">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              aria-current={childActive ? "page" : undefined}
                              className={`h-[30px] flex items-center px-2 rounded-[5px] text-[13px] transition-colors ${
                                childActive
                                  ? "bg-[#eeeeee] text-[#111111] font-medium"
                                  : "text-[#5f6368] hover:text-[#111111] hover:bg-[#eeeeee]/50"
                              }`}
                            >
                              <span className="truncate">{child.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
        </div>
      ))}
    </nav>
  );
};

export default Menu;
