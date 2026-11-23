import React from "react";
import { brandTitle } from "@/lib/seoTitle";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllServicesCMS, getServiceCMS } from "@/data/servicesData";
import { buildDeviceModelCMS } from "@/lib/pSeoEngine";
import { getRepairCatalog } from "@/lib/repairCatalog";
import ServiceDetailClient from "./ServiceDetailClient";
import Footer from "@/components/layout/Footer";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { RouteDataProvider } from "@/components/site/RouteDataContext";
import { pickLayout } from "@/lib/pickLayout";


interface PageProps {
  params: Promise<{
    category: string;
    serviceId: string;
  }>;
}

export async function generateStaticParams() {
  const allServices = getAllServicesCMS();
  const staticParams = allServices.map((svc) => ({
    category: svc.categoryId,
    serviceId: svc.serviceId,
  }));

  // Also include top dynamic devices
  const { devices } = await getRepairCatalog();
  const deviceParams = devices.map((d) => ({
    category: d.category,
    serviceId: d.slug,
  }));

  return [...staticParams, ...deviceParams];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, serviceId } = await params;
  const service = getServiceCMS(category, serviceId) || buildDeviceModelCMS(category, serviceId, await getRepairCatalog());

  if (!service) {
    return {
      title: brandTitle("Service Not Found | SmartFoneDoctor"),
    };
  }

  const keywords = Array.from(
    new Set([service.seo.focusKeyword, ...(service.seo.keywords ?? [])].map((k) => k?.trim()).filter(Boolean) as string[])
  );

  return {
    title: brandTitle(service.seo.title),
    description: service.seo.description,
    keywords,
    alternates: {
      canonical: service.seo.canonicalUrl?.trim() || `/repairs/${category}/${serviceId}`,
    },
    openGraph: {
      title: service.seo.title || `${service.serviceName} | SmartFoneDoctor Philadelphia`,
      description: service.seo.description,
      images: [service.heroImage],
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { category, serviceId } = await params;
  const service = getServiceCMS(category, serviceId) || buildDeviceModelCMS(category, serviceId, await getRepairCatalog());

  if (!service) {
    notFound();
  }

  // Layout from Admin > Pages > Templates > "Template: Device page" (or this URL's own page).
  const layout = await pickLayout(`/repairs/${category}/${serviceId}`, "repair-device");
  if (!layout) return <ServiceDetailClient service={service} />;
  return (
    <>
      <RouteDataProvider value={{ type: "repair-device", data: { service } }}>
        <CMSSectionRenderer slug={layout.page.slug} initialPage={layout.page} />
      </RouteDataProvider>
      <Footer />
    </>
  );
}
