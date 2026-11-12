"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useListings, CATALOG_DIRECTORIES } from "@/lib/listingsContext";
import { useStoreContext } from "@/lib/storeContext";

export const LISTINGS_SUB_LINKS = [
  { label: "Active listings", href: "/admin/listings" },
  { label: "Missing & catalog", href: "/admin/listings/catalog" },
  { label: "API & auto-sync", href: "/admin/listings/api-sync" },
] as const;

export default function ListingsNav() {
  const pathname = usePathname();
  const { directories } = useListings();
  const { selectedStoreId } = useStoreContext();

  const missingForStoreCount = directories.filter(
    (d) => d.stores[selectedStoreId]?.status === "Missing"
  ).length;
  const untrackedCatalogCount = CATALOG_DIRECTORIES.filter(
    (c) => !directories.some((d) => d.id === c.id)
  ).length;

  const tabs = [
    {
      label: `Active listings (${directories.length})`,
      href: "/admin/listings",
      alertCount: 0,
    },
    {
      label: `Missing & catalog (+${untrackedCatalogCount})`,
      href: "/admin/listings/catalog",
      alertCount: missingForStoreCount,
      alertLabel: `${missingForStoreCount} unclaimed`,
    },
    {
      label: "API & auto-sync",
      href: "/admin/listings/api-sync",
      alertCount: 0,
    },
  ];

  return (
    <nav
      aria-label="Directory listings navigation"
      className="flex items-center gap-6 border-b border-[#e5e7eb] overflow-x-auto overflow-y-hidden no-scrollbar"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 inline-flex items-center gap-2 py-2.5 text-[13px] border-b-2 -mb-px transition-colors whitespace-nowrap ${
              isActive
                ? "border-[#111111] text-[#111111] font-medium"
                : "border-transparent text-[#5f6368] hover:text-[#111111]"
            }`}
          >
            <span>{tab.label}</span>
            {tab.alertCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-[4px] bg-[#ffedea] text-[#831c1e] text-[11px] font-medium tabular-nums">
                {tab.alertLabel}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
