import React from "react";
import type { Metadata } from "next";
import { StoreLocator } from "@/components/locator/StoreLocator";
import { WiseCertification } from "@/components/home/WiseCertification";
import { FaqSection } from "@/components/home/FaqSection";
import Footer from "@/components/layout/Footer";
import { STORES } from "@/lib/stores";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildMultiStoreSchema,
} from "@/lib/schema";

export const metadata: Metadata = {
  title: "Book a Repair | SmartFoneDoctor Store Locator",
  description:
    "Find your nearest SmartFoneDoctor store and book a fast, certified repair for your iPhone, smartphone, tablet, laptop, or gaming console.",
};

export default function BookRepairPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Store Locations", url: "/locations/i/book-repair" },
  ]);

  const multiStoreSchema = buildMultiStoreSchema(STORES);

  return (
    <main className="bg-[#fcfcfc] min-h-screen">
      {/* ── JSON-LD Structured Data ── */}
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={multiStoreSchema} />

      {/* 1. Store Locator with Search & Map */}
      <StoreLocator />

      {/* 2. The SmartFoneDoctor Difference - WISE Certified Technicians */}
      <WiseCertification />

      {/* 3. Frequently Asked Questions */}
      <FaqSection />

      {/* 4. Footer */}
      <Footer />
    </main>
  );
}


