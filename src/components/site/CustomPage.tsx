"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { getStoredCMSPages, type CMSPage } from "@/lib/cmsData";

/** Renders a page made in the admin, looked up by its URL path. */
export default function CustomPage({ path }: { path: string }) {
  // undefined = still looking, null = no such page.
  const [page, setPage] = useState<CMSPage | null | undefined>(undefined);

  useEffect(() => {
    const load = () => {
      const found = getStoredCMSPages().find((p) => p.custom && p.path === path && p.status === "Published");
      setPage(found || null);
    };
    load();
    window.addEventListener("sfd-cms-pages-updated", load);
    return () => window.removeEventListener("sfd-cms-pages-updated", load);
  }, [path]);

  useEffect(() => {
    if (page?.title) document.title = page.title;
  }, [page]);

  if (page === undefined) return <main className="min-h-screen bg-[#fcfcfc]" />;

  if (page === null) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-[#fcfcfc] px-4 text-center">
        <h1 className="text-3xl font-bold text-[#111111]">Page not found</h1>
        <p className="text-sm text-gray-600">There is no page at {path}.</p>
        <Link href="/" className="rounded-md bg-[#009691] px-4 py-2 text-sm font-semibold text-white hover:bg-[#007f7b]">
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcfc]">
      <CMSSectionRenderer slug={page.slug} />
      <Footer />
    </main>
  );
}
