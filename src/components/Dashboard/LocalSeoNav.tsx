"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Megaphone, Sparkles } from "lucide-react";

export const LOCAL_SEO_LINKS = [
  { label: "Overview", href: "/admin/local-seo", icon: BarChart3 },
  { label: "Posts & offers", href: "/admin/local-seo/posts", icon: Megaphone },
  { label: "Search & AI visibility", href: "/admin/listings/ai-visibility", icon: Sparkles },
] as const;

export default function LocalSeoNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="GMB and Local SEO navigation"
      className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-2xs"
    >
      {LOCAL_SEO_LINKS.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap ${
              isActive
                ? "bg-white text-[#009691] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-[#009691]" : "text-slate-400"}`} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
