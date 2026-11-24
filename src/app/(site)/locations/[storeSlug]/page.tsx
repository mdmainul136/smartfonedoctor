import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Train,
  Car,
  Star,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import prisma from "@/lib/prisma";
import { brandTitle } from "@/lib/seoTitle";
import { JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/lib/schema";
import { GEO_STORES, getGeoStoreBySlug, toNeighborhoodSlug } from "@/lib/geoPages";
import { getRepairCatalog } from "@/lib/repairCatalog";
import { getPublicFeaturedReviewsAction } from "@/actions/reviews";
import { buildSocialMetadata } from "@/lib/seoSocial";

interface StoreLocationPageProps {
  params: Promise<{ storeSlug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

export function generateStaticParams() {
  return GEO_STORES.map((s) => ({ storeSlug: s.slug }));
}

export async function generateMetadata({ params }: StoreLocationPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = getGeoStoreBySlug(storeSlug);
  if (!store) return {};

  const candidate = `${store.shortName} Philly Repair | SmartFoneDoctor`;
  const title =
    candidate.length <= 60 ? candidate : `${store.shortName} | SmartFoneDoctor`;
  const description = `Visit ${store.streetAddress}, Philadelphia ${store.postalCode} (${store.hoursDisplay}). Walk-in phone, tablet, MacBook & console repair with a 90-day warranty.`.slice(
    0,
    160
  );

  return {
    title: brandTitle(title),
    description,
    alternates: {
      canonical: `/locations/${store.slug}`,
    },
    ...buildSocialMetadata({
      title,
      description,
      url: `/locations/${store.slug}`,
      image: store.heroImage,
      imageAlt: store.name,
      type: "website",
    }),
  };
}

export default async function DedicatedStoreLocationPage({
  params,
}: StoreLocationPageProps) {
  const { storeSlug } = await params;
  const store = getGeoStoreBySlug(storeSlug);
  if (!store) notFound();

  const [catalog, neighborhoods, featuredReviews] = await Promise.all([
    getRepairCatalog(),
    prisma.geoNeighborhood.findMany({
      where: { storeId: store.storeId },
      orderBy: { name: "asc" },
    }),
    getPublicFeaturedReviewsAction(),
  ]);

  const storeReviews = featuredReviews.filter((r) => r.storeId === store.storeId);
  const displayReviews = storeReviews.length > 0 ? storeReviews : featuredReviews.slice(0, 3);
  const topRepairs = catalog.issues.slice(0, 8);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Locations", url: "/locations/i/book-repair" },
    { name: store.shortName, url: `/locations/${store.slug}` },
  ]);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ElectronicsStore"],
    "@id": `${SITE_URL}/locations/${store.slug}#localbusiness`,
    name: store.name,
    url: `${SITE_URL}/locations/${store.slug}`,
    image: `${SITE_URL}/logo-png.jpg`,
    telephone: store.telephoneSchema,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: store.streetAddress,
      addressLocality: store.addressLocality,
      addressRegion: store.addressRegion,
      postalCode: store.postalCode,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: store.latitude,
      longitude: store.longitude,
    },
    hasMap: store.gmbUrl,
    areaServed: neighborhoods.map((n) => ({
      "@type": "AdministrativeArea",
      name: `${n.name}, Philadelphia, PA`,
    })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "19:00",
      },
    ],
  };

  const faqSchema = buildFaqSchema(store.faqs);
  const telHref = `tel:${store.phone.replace(/[^0-9+]/g, "")}`;

  return (
    <main className="bg-[#fcfcfc] min-h-screen text-[#1d1c1a]">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={localBusinessSchema} />
      <JsonLd data={faqSchema} />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 text-[12px] text-neutral-500">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-sfd-teal transition-colors">
                Home
              </Link>
            </li>
            <li>&gt;</li>
            <li>
              <Link href="/locations/i/book-repair" className="hover:text-sfd-teal transition-colors">
                Store Locations
              </Link>
            </li>
            <li>&gt;</li>
            <li className="text-neutral-800 font-medium" aria-current="page">
              {store.shortName}
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-neutral-200/90 rounded-[24px] p-6 sm:p-10 mb-10 shadow-xs">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sfd-teal/10 text-sfd-teal border border-sfd-teal/20 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              {store.badge}
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1d1c1a] leading-tight">
              {store.name}
            </h1>

            <div className="p-4 rounded-2xl bg-teal-50/70 border border-sfd-teal/20 text-xs sm:text-[13.5px] leading-relaxed text-[#1d1c1a]">
              <strong className="text-sfd-teal uppercase tracking-wider text-[10.5px] block mb-1">
                Quick Store Answer · Walk-Ins Welcome
              </strong>
              SmartFoneDoctor ({store.streetAddress}, Philadelphia, PA {store.postalCode}) is open{" "}
              {store.hoursDisplay}. Most phone screens and batteries are completed same-day in 25–45
              minutes with free upfront diagnostics and a 90-day parts and labor warranty. Call{" "}
              {store.phone} or walk in anytime.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-700 pt-1">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
                <MapPin className="w-4 h-4 text-sfd-teal shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1d1c1a]">Street Address</div>
                  <div>
                    {store.streetAddress}, {store.addressLocality}, {store.addressRegion}{" "}
                    {store.postalCode}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
                <Clock className="w-4 h-4 text-sfd-teal shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1d1c1a]">Store Hours</div>
                  <div>{store.hoursDisplay}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={`/schedule-repair?store=${store.storeId}`}
                className="px-6 py-3 rounded-full bg-sfd-teal hover:bg-sfd-tealDark text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                Book At This Store
              </Link>
              <a
                href={telHref}
                className="px-5 py-3 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-[#1d1c1a] font-bold text-xs inline-flex items-center gap-2 transition"
              >
                <Phone className="w-4 h-4 text-sfd-teal" />
                {store.phone}
              </a>
              <a
                href={store.gmbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs inline-flex items-center gap-1.5 transition"
              >
                <span>Google Maps Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100">
              <Image
                src={store.heroImage}
                alt={store.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
                priority
              />
            </div>
          </div>
        </section>

        {/* Specialties + Transit & Parking */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border border-neutral-200/90 rounded-[20px] p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sfd-teal" />
              On-Site Bench Specialties
            </h2>
            <ul className="space-y-2.5 text-sm text-neutral-700">
              {store.specialties.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sfd-teal shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-neutral-200/90 rounded-[20px] p-6 space-y-4">
            <h2 className="text-lg font-bold">Transit &amp; Parking Guide</h2>
            <div className="space-y-3 text-sm text-neutral-700">
              <div className="flex items-start gap-2.5">
                <Train className="w-4 h-4 text-sfd-teal shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-[#1d1c1a] block">Public Transit (SEPTA)</span>
                  <span>{store.transitNote}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Car className="w-4 h-4 text-sfd-teal shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-[#1d1c1a] block">Street Parking</span>
                  <span>{store.parkingNote}</span>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href={`/review/${store.reviewSlug}`}
                className="text-xs font-bold text-sfd-teal hover:underline inline-flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Leave or view reviews for {store.shortName}
              </Link>
            </div>
          </div>
        </section>

        {/* Nearby Neighborhoods & Campuses */}
        {neighborhoods.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-extrabold tracking-tight mb-4">
              Philadelphia Neighborhoods &amp; Campuses Served
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {neighborhoods.map((hood) => (
                <Link
                  key={hood.id}
                  href={`/locations/areas/${toNeighborhoodSlug(hood.name)}`}
                  className="bg-white border border-neutral-200/90 hover:border-sfd-teal rounded-2xl p-5 flex items-center justify-between gap-4 transition group"
                >
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-sfd-teal">
                      {hood.type} · {hood.radius} Radius
                    </div>
                    <h3 className="text-base font-bold text-[#1d1c1a] group-hover:text-sfd-teal transition-colors mt-0.5">
                      {hood.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      ZIPs: {hood.zipCodes.join(", ")} · {hood.keyLandmarks.join(" · ")}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-sfd-teal shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Repair Services Starting Prices */}
        <section className="mb-12">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-extrabold tracking-tight">
              Popular Repair Services at {store.shortName}
            </h2>
            <Link href="/repairs" className="text-xs font-bold text-sfd-teal hover:underline">
              Full Repair Directory →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topRepairs.map((rep) => {
              const sampleDevice = catalog.devices.find((d) => d.category === rep.category);
              const href = sampleDevice
                ? `/repairs/${rep.category}/${sampleDevice.slug}/${rep.slug}`
                : `/repairs/${rep.category}`;
              return (
                <Link
                  key={`${rep.category}:${rep.slug}`}
                  href={href}
                  className="bg-white border border-neutral-200/90 hover:border-sfd-teal rounded-2xl p-4 flex flex-col justify-between gap-2 transition"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {rep.category}
                    </span>
                    <div className="text-sm font-bold text-[#1d1c1a] mt-0.5">{rep.name}</div>
                  </div>
                  <div className="text-xs font-semibold text-sfd-teal pt-1">
                    From ${rep.basePrice} · {rep.turnaroundDisplay}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Reviews & FAQs */}
        {displayReviews.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-extrabold tracking-tight mb-4">
              Verified Customer Feedback
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayReviews.slice(0, 3).map((rev) => (
                <article
                  key={rev.id}
                  className="bg-white border border-neutral-200/90 rounded-2xl p-5 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[...Array(Math.min(5, Math.max(1, rev.rating)))].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-700 leading-relaxed">&ldquo;{rev.content}&rdquo;</p>
                  </div>
                  <div className="text-[11px] font-semibold text-neutral-500 pt-2 border-t border-neutral-100">
                    {rev.author} · {rev.device}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white border border-neutral-200/90 rounded-[20px] p-6 space-y-4">
          <h2 className="text-lg font-bold">Frequently Asked Questions — {store.shortName}</h2>
          <div className="divide-y divide-neutral-100">
            {store.faqs.map((f) => (
              <div key={f.question} className="py-3 first:pt-0 last:pb-0">
                <h3 className="text-sm font-bold text-[#1d1c1a]">{f.question}</h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
