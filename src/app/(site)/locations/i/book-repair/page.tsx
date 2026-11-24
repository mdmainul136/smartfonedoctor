import React from "react";
import { brandTitle } from "@/lib/seoTitle";
import type { Metadata } from "next";
import { StoreLocator } from "@/components/locator/StoreLocator";
import { WiseCertification } from "@/components/home/WiseCertification";
import { FaqSection } from "@/components/home/FaqSection";
import Footer from "@/components/layout/Footer";
import { getCmsPage } from "@/actions/cmsPages";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { RouteDataProvider } from "@/components/site/RouteDataContext";
import { usableLayout } from "@/lib/pickLayout";
import { getLocationStores } from "@/lib/locationStores";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildMultiStoreSchema,
} from "@/lib/schema";
import { buildSocialMetadata } from "@/lib/seoSocial";

const locatorTitle = "Book a Repair | SmartFoneDoctor Store Locator";
const locatorDesc =
  "Find your nearest SmartFoneDoctor store and book a fast, certified repair for your iPhone, smartphone, tablet, laptop, or gaming console.";

export const metadata: Metadata = {
  title: brandTitle(locatorTitle),
  description: locatorDesc,
  alternates: { canonical: "/locations/i/book-repair" },
  ...buildSocialMetadata({
    title: locatorTitle,
    description: locatorDesc,
    url: "/locations/i/book-repair",
    type: "website",
  }),
};

export const revalidate = 60;

export default async function BookRepairPage() {
  const cmsPage = await getCmsPage("/locations/i/book-repair");
  const { branches: dbBranches, mapStores } = await getLocationStores();

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Store Locations", url: "/locations/i/book-repair" },
  ]);
  const multiStoreSchema = buildMultiStoreSchema(dbBranches);

  return (
    <main className="bg-[#fcfcfc] min-h-screen">
      {/* ── JSON-LD Structured Data ── */}
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={multiStoreSchema} />

      {/* Layout from Admin > Pages ("Store Locations", /locations/i/book-repair), else the built-in one. */}
      {usableLayout(cmsPage) ? (
        <RouteDataProvider value={{ type: "locations", data: { stores: mapStores } }}>
          <CMSSectionRenderer slug={cmsPage.slug} initialPage={cmsPage} />
        </RouteDataProvider>
      ) : (
        <>
      {/* 1. Store Locator with Search & Map (Dynamic PostgreSQL Stores) */}
      <StoreLocator initialStores={mapStores} />

      {/* 2. The SmartFoneDoctor Difference - WISE Certified Technicians */}
      <WiseCertification />

      {/* 3. Frequently Asked Questions */}
      <FaqSection />
        </>
      )}

      {/* 4. Footer */}
      <Footer />
    </main>
  );
}
