import React from "react";
import type { Metadata } from "next";
import { StoreLocator } from "@/components/locator/StoreLocator";
import { WiseCertification } from "@/components/home/WiseCertification";
import { FaqSection } from "@/components/home/FaqSection";
import Footer from "@/components/layout/Footer";
import { STORES } from "@/lib/stores";
import { getStoreBranchesAction } from "@/actions/settings";
import { MapStore } from "@/components/locator/InteractiveMap";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildMultiStoreSchema,
} from "@/lib/schema";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";

export const metadata: Metadata = {
  title: "Book a Repair | SmartFoneDoctor Store Locator",
  description:
    "Find your nearest SmartFoneDoctor store and book a fast, certified repair for your iPhone, smartphone, tablet, laptop, or gaming console.",
};

export const revalidate = 60;

export default async function BookRepairPage() {
  const branchesRes = await getStoreBranchesAction();
  const dbBranches =
    branchesRes.success && branchesRes.data && branchesRes.data.length > 0
      ? branchesRes.data
      : STORES;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Store Locations", url: "/locations/i/book-repair" },
  ]);

  const multiStoreSchema = buildMultiStoreSchema(dbBranches);

  const mapStores: MapStore[] = dbBranches.map((b) => ({
    id: b.id,
    name: b.name,
    hours: b.businessHours || "Open today 10:00 am - 7:00 pm",
    address: b.address,
    cityStateZip: b.cityStateZip,
    phone: b.phone,
    lat: b.id === 1 ? 39.9575 : b.id === 2 ? 39.9628 : 39.9634,
    lng: b.id === 1 ? -75.2263 : b.id === 2 ? -75.2045 : -75.2058,
    gmbPlaceId: b.id === 1 ? "ChIJ_sfd_philly_33s52nd" : `ChIJ_sfd_store_${b.id}`,
    gmbRating: 4.9,
    gmbReviewsCount: b.id === 1 ? 1524 : b.id === 2 ? 880 : 940,
    gmbUrl: b.gmbUrl,
  }));

  return (
    <main className="bg-[#fcfcfc] min-h-screen">
      {/* ── JSON-LD Structured Data ── */}
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={multiStoreSchema} />

      <CMSSectionRenderer slug="locations">
        {/* 1. Store Locator with Search & Map (Dynamic PostgreSQL Stores) */}
        <StoreLocator initialStores={mapStores} />

        {/* 2. The SmartFoneDoctor Difference - WISE Certified Technicians */}
        <WiseCertification />

        {/* 3. Frequently Asked Questions */}
        <FaqSection />
      </CMSSectionRenderer>

      {/* 4. Footer */}
      <Footer />
    </main>
  );
}
