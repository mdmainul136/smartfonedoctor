"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { getStoredCMSPages, type CMSPage } from "@/lib/cmsData";
import { Eye, AlertTriangle } from "lucide-react";

/** Renders a page created in the CMS admin, looked up by its URL path. */
export default function CustomPage({ path }: { path: string }) {
  // undefined = still looking, null = no such page.
  const [page, setPage] = useState<CMSPage | null | undefined>(undefined);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const checkPreview =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("preview") === "true";
    setIsPreview(checkPreview);

    const load = () => {
      const normalized = path.toLowerCase().replace(/\/$/, "");
      const found = getStoredCMSPages().find((p) => {
        const pPath = (p.path || "").toLowerCase().replace(/\/$/, "");
        const pathMatch = pPath === normalized;
        const isAllowed = p.status === "Published" || checkPreview;
        return pathMatch && isAllowed;
      });
      setPage(found || null);
    };

    load();
    window.addEventListener("sfd-cms-pages-updated", load);
    return () => window.removeEventListener("sfd-cms-pages-updated", load);
  }, [path]);

  useEffect(() => {
    if (page?.title) {
      document.title = page.title;
    }
  }, [page]);

  const schemaJson = useMemo(() => {
    if (!page) return null;
    const baseType = page.schemaType || "LocalBusiness";
    return {
      "@context": "https://schema.org",
      "@type": baseType,
      name: page.title || page.name,
      headline: page.title || page.name,
      description: page.metaDesc || page.heroSubtitle,
      url: page.canonicalUrl || `https://smartfonedoctor.com${page.path}`,
      image: page.featuredImage || undefined,
      ...(baseType === "LocalBusiness"
        ? {
            address: {
              "@type": "PostalAddress",
              streetAddress: "33 S 52nd St",
              addressLocality: "Philadelphia",
              addressRegion: "PA",
              postalCode: "19139",
              addressCountry: "US",
            },
            telephone: "+1-215-555-0199",
            priceRange: "$$",
          }
        : {
            author: {
              "@type": "Person",
              name: page.author || "Certified Hardware Technician",
            },
            publisher: {
              "@type": "LocalBusiness",
              name: "SmartFoneDoctor Philadelphia",
            },
          }),
    };
  }, [page]);

  if (page === undefined) return <main className="min-h-screen bg-[#fcfcfc]" />;

  if (page === null) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-[#fcfcfc] px-4 text-center">
        <h1 className="text-3xl font-bold text-[#111111]">Page not found</h1>
        <p className="text-sm text-gray-600">There is no published page at {path}.</p>
        <Link
          href="/"
          className="rounded-md bg-[#009691] px-4 py-2 text-sm font-semibold text-white hover:bg-[#007f7b]"
        >
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcfc]">
      {/* Schema.org Structured Data */}
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      )}

      {/* Draft Preview Bar */}
      {isPreview && page.status === "Draft" && (
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-900 shadow-xs">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-amber-700" />
            <span>
              <strong>Draft Preview Mode:</strong> This page is currently unpublished.
            </span>
          </div>
          <Link
            href={`/admin/pages`}
            className="flex items-center gap-1 rounded bg-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-900 hover:bg-amber-300 transition"
          >
            Edit in CMS
          </Link>
        </div>
      )}

      <CMSSectionRenderer slug={page.slug} />
      <Footer />
    </main>
  );
}
