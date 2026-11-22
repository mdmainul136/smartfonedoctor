"use client";

import { usePathname } from "next/navigation";

/**
 * Admin screens that are still mock-ups: their numbers, reviews, listings and
 * "synced" states are built-in examples, not data from Google, Yelp or other
 * services. Shown so nobody acts on them as if they were real.
 */
const SAMPLE_PAGES: string[] = [];

export default function SampleDataNotice() {
  const path = usePathname() ?? "";
  if (!SAMPLE_PAGES.some((p) => path === p || path.startsWith(`${p}/`))) return null;
  return (
    <div
      role="note"
      className="mx-4 sm:mx-6 mt-4 rounded-[8px] border border-[#f2d59b] bg-[#fff8e6] px-4 py-2.5 text-[13px] text-[#5c4300]"
    >
      <strong className="font-semibold">Sample data.</strong> This screen is not connected to Google, Yelp or other
      services yet. The numbers, reviews and sync states below are examples, not your real data.
    </div>
  );
}
