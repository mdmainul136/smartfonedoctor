"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const LOCAL_SEO_LINKS = [
  { label: "Overview", href: "/admin/local-seo" },
  { label: "Posts & offers", href: "/admin/local-seo/posts" },
] as const;

export default function LocalSeoNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="GMB and Local SEO navigation"
      className="flex items-center gap-6 border-b border-[#e5e7eb] overflow-x-auto overflow-y-hidden no-scrollbar"
    >
      {LOCAL_SEO_LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 py-2.5 text-[13px] border-b-2 -mb-px transition-colors whitespace-nowrap ${
              isActive
                ? "border-[#111111] text-[#111111] font-medium"
                : "border-transparent text-[#5f6368] hover:text-[#111111]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
