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
      className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap ${
              isActive
                ? "bg-white text-[#009691] shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span>{tab.label}</span>
            {tab.alertCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold tabular-nums">
                {tab.alertLabel}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
