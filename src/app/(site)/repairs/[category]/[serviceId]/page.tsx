import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllServicesCMS, getServiceCMS } from "@/data/servicesData";
import ServiceDetailClient from "./ServiceDetailClient";

interface PageProps {
  params: Promise<{
    category: string;
    serviceId: string;
  }>;
}

export async function generateStaticParams() {
  const allServices = getAllServicesCMS();
  return allServices.map((svc) => ({
    category: svc.categoryId,
    serviceId: svc.serviceId,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, serviceId } = await params;
  const service = getServiceCMS(category, serviceId);

  if (!service) {
    return {
      title: "Service Not Found | SmartFoneDoctor",
    };
  }

  return {
    title: service.seo.title,
    description: service.seo.description,
    keywords: service.seo.keywords,
    openGraph: {
      title: `${service.serviceName} | SmartFoneDoctor Philadelphia`,
      description: service.seo.description,
      images: [service.heroImage],
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { category, serviceId } = await params;
  const service = getServiceCMS(category, serviceId);

  if (!service) {
    notFound();
  }

  return <ServiceDetailClient service={service} />;
}

