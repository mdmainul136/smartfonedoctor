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
      aria-label="Google Business Profile navigation"
      className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto no-scrollbar"
    >
      {LOCAL_SEO_LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              isActive
                ? "border-[#009691] text-[#009691]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}