import React from "react";
import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { getCmsPage } from "@/actions/cmsPages";
import { brandTitle } from "@/lib/seoTitle";
import { WarrantySection } from "@/components/site/WarrantySection";
import { withCmsMetadata } from "@/lib/cmsMetadata";

// Coded defaults; title, description and canonical can be changed in Admin > Pages > SEO.
const baseMetadata: Metadata = {
  title: brandTitle("Repair Warranty | 90-Day Parts & Labor Guarantee | SmartFoneDoctor"),
  description:
    "Every SmartFoneDoctor repair includes a 90-day warranty on parts and labor. HDMI port repairs carry a 6-month warranty. See what's covered and how to make a claim.",
  alternates: { canonical: "/warranty" },
};

export async function generateMetadata(): Promise<Metadata> {
  return withCmsMetadata("warranty", baseMetadata);
}

export default async function WarrantyPage() {
  const cmsPage = await getCmsPage("warranty");

  return (
    <main className="bg-[#FAF8F5] min-h-screen text-[#111827]">
      <CMSSectionRenderer slug="warranty" initialPage={cmsPage}>
        {/* Built-in version; the page's builder layout (Warranty page section) replaces it. */}
        <WarrantySection />
      </CMSSectionRenderer>
      <Footer />
    </main>
  );
}
