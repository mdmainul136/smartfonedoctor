import type { Metadata } from "next";
import { brandTitle } from "@/lib/seoTitle";
import { getCmsPage } from "@/actions/cmsPages";
import { CmsPageProvider } from "@/components/site/CmsPageContext";
import { withCmsMetadata } from "@/lib/cmsMetadata";

// page.tsx is a client component, so its metadata and CMS data live here.
// Coded defaults; title, description and canonical can be changed in Admin > Pages > SEO.
const baseMetadata: Metadata = {
  title: brandTitle("Supply Chain & Responsible Sourcing | SmartFoneDoctor"),
  description:
    "How SmartFoneDoctor sources repair parts: supplier standards, ethical labor, and our California Transparency in Supply Chains Act statement.",
  alternates: { canonical: "/supply-chain" },
};

export async function generateMetadata(): Promise<Metadata> {
  return withCmsMetadata("supply-chain", baseMetadata);
}

export default async function SupplyChainLayout({ children }: { children: React.ReactNode }) {
  const cmsPage = await getCmsPage("supply-chain");
  return <CmsPageProvider page={cmsPage}>{children}</CmsPageProvider>;
}
