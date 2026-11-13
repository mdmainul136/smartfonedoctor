import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildPSeoPageData,
  PSEO_DEVICES,
  PSEO_ISSUES,
} from "@/lib/pSeoEngine";
import DeviceIssueClient from "./DeviceIssueClient";

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
  const topDevices = PSEO_DEVICES.slice(0, 8);
  const topIssues = PSEO_ISSUES.slice(0, 4);

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
  const data = buildPSeoPageData(category, serviceId, issue);

  if (!data) {
    return {
      title: "Repair Service Not Found | SmartFoneDoctor",
    };
  }

  return {
    title: data.seo.title,
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
  const data = buildPSeoPageData(category, serviceId, issue);

  if (!data) {
    notFound();
  }

  return <DeviceIssueClient data={data} />;
}
