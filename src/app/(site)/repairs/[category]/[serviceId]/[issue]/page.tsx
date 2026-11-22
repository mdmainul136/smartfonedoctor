import React from "react";
import { brandTitle } from "@/lib/seoTitle";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildPSeoPageData,
} from "@/lib/pSeoEngine";
import { getRepairCatalog } from "@/lib/repairCatalog";
import DeviceIssueClient from "./DeviceIssueClient";
import Footer from "@/components/layout/Footer";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { RouteDataProvider } from "@/components/site/RouteDataContext";
import { pickLayout } from "@/lib/pickLayout";


interface PageProps {
  params: Promise<{
    category: string;
    serviceId: string;
    issue: string;
  }>;
}

// Pre-render top combinations for speed and instant search indexation
export async function generateStaticParams() {
  const params: { category: string; serviceId: string; issue: string }[] = [];

  // Top devices x issues
  const { devices, issues } = await getRepairCatalog();
  const topDevices = devices.slice(0, 8);
  const topIssues = issues.slice(0, 4);

  for (const dev of topDevices) {
    for (const iss of topIssues) {
      if (iss.category === dev.category) {
        params.push({
          category: dev.category,
          serviceId: dev.slug,
          issue: iss.slug,
        });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, serviceId, issue } = await params;
  const data = buildPSeoPageData(category, serviceId, issue, await getRepairCatalog());

  if (!data) {
    return {
      title: brandTitle("Repair Service Not Found | SmartFoneDoctor"),
    };
  }

  return {
    title: brandTitle(data.seo.title),
    description: data.seo.metaDescription,
    keywords: data.seo.focusKeywords,
    alternates: {
      canonical: data.seo.canonicalUrl,
    },
    openGraph: {
      title: data.seo.title,
      description: data.seo.metaDescription,
      images: [
        {
          url: data.device.image,
          width: 1200,
          height: 630,
          alt: `${data.device.name} ${data.issue.name}`,
        },
      ],
      type: "article",
    },
  };
}

export default async function DeviceIssueServicePage({ params }: PageProps) {
  const { category, serviceId, issue } = await params;
  const data = buildPSeoPageData(category, serviceId, issue, await getRepairCatalog());

  if (!data) {
    notFound();
  }

  // Layout from Admin > Pages > Templates > "Template: Repair page" (or this URL's own page).
  const layout = await pickLayout(`/repairs/${category}/${serviceId}/${issue}`, "repair-issue");
  const { schemas } = data;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.localBusiness) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.howTo) }} />
      {layout ? (
        <>
          <RouteDataProvider value={{ type: "repair-issue", data: { page: data } }}>
            <CMSSectionRenderer slug={layout.page.slug} initialPage={layout.page} />
          </RouteDataProvider>
        </>
      ) : (
        <DeviceIssueClient data={data} />
      )}
      {/* These pages had no footer before; every page now gets the site footer. */}
      <Footer />
    </>
  );
}
