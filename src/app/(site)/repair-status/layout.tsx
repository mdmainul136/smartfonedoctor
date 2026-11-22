import type { Metadata } from "next";
import { brandTitle } from "@/lib/seoTitle";
import { getCmsPage } from "@/actions/cmsPages";
import { CmsPageProvider } from "@/components/site/CmsPageContext";
import { withCmsMetadata } from "@/lib/cmsMetadata";

// page.tsx is a client component, so its metadata lives here.
// Coded defaults; title, description and canonical can be changed in Admin > Pages > SEO.
const baseMetadata: Metadata = {
  title: brandTitle("Check Repair Status | SmartFoneDoctor"),
  description:
    "Track your SmartFoneDoctor repair with your ticket ID. See where your phone, tablet, computer or console is on the bench and when it's ready for pickup.",
  alternates: { canonical: "/repair-status" },
};

export async function generateMetadata(): Promise<Metadata> {
  return withCmsMetadata("track", baseMetadata);
}

export default async function RepairStatusLayout({ children }: { children: React.ReactNode }) {
  // The page is a client component; it gets its CMS content (slug "track") from here.
  const cmsPage = await getCmsPage("track");
  return <CmsPageProvider page={cmsPage}>{children}</CmsPageProvider>;
}
