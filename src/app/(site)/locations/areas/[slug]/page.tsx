import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import prisma from "@/lib/prisma";
import { brandTitle } from "@/lib/seoTitle";
import { JsonLd, buildBreadcrumbSchema } from "@/lib/schema";
import { getGeoStoreById, toNeighborhoodSlug } from "@/lib/geoPages";
import { getRepairCatalog } from "@/lib/repairCatalog";
import { buildSocialMetadata } from "@/lib/seoSocial";

interface AreaPageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

export async function generateStaticParams() {
  try {
    const hoods = await prisma.geoNeighborhood.findMany({ select: { name: true } });
    return hoods.map((h) => ({ slug: toNeighborhoodSlug(h.name) }));
  } catch {
    return [];
  }
}

async function resolveNeighborhood(slug: string) {
  const hoods = await prisma.geoNeighborhood.findMany({ orderBy: { storeId: "asc" } });
  return hoods.find((h) => toNeighborhoodSlug(h.name) === slug) ?? null;
}

export async function generateMetadata({ params }: AreaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hood = await resolveNeighborhood(slug);
  if (!hood) return {};

  const store = getGeoStoreById(hood.storeId);
  const full = `${hood.name} Phone Repair | SmartFoneDoctor`;
  const shortHood = hood.name.split(" (")[0];
  const compact = `${shortHood} Device Repair | SmartFoneDoctor`;
  const fallback = `Phone Repair Near ${hood.zipCodes[0] || "West Philly"} | SmartFoneDoctor`;
  const title =
    full.length <= 60 ? full : compact.length <= 60 ? compact : fallback;

  const description = `Same-day phone, tablet, laptop & console repair serving ${hood.name} (${hood.zipCodes.join(
    ", "
  )}). Closest bench: ${store.streetAddress}, Philadelphia. 90-day warranty.`.slice(0, 152);

  return {
    title: brandTitle(title),
    description,
    alternates: {
      canonical: `/locations/areas/${slug}`,
    },
    ...buildSocialMetadata({
      title,
      description,
      url: `/locations/areas/${slug}`,
      image: store.heroImage,
      imageAlt: `${hood.name} Device Repair`,
      type: "website",
    }),
  };
}

export default async function NeighborhoodGeoPage({ params }: AreaPageProps) {
  const { slug } = await params;
  const hood = await resolveNeighborhood(slug);
  if (!hood) notFound();

  const [store, catalog, siblingHoods] = await Promise.all([
    Promise.resolve(getGeoStoreById(hood.storeId)),
    getRepairCatalog(),
    prisma.geoNeighborhood.findMany({ orderBy: { storeId: "asc" } }),
  ]);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Locations", url: "/locations/i/book-repair" },
    { name: store.shortName, url: `/locations/${store.slug}` },
    { name: hood.name, url: `/locations/areas/${slug}` },
  ]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: `Electronics & Smartphone Repair in ${hood.name}`,
    provider: {
      "@type": ["LocalBusiness", "ElectronicsStore"],
      "@id": `${SITE_URL}/locations/${store.slug}#localbusiness`,
      name: store.name,
      telephone: store.telephoneSchema,
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
    },
    areaServed: [
      hood.name,
      ...hood.zipCodes.map((z) => `Philadelphia, PA ${z}`),
      ...hood.keyLandmarks,
    ],
  };

  const categories = [
    { key: "smartphone", label: "Smartphone Repair", sub: "iPhone, Samsung Galaxy & Pixel screens, batteries & ports" },
    { key: "tablet", label: "Tablet & iPad Repair", sub: "iPad Pro/Air digitizers, batteries & USB-C port fixes" },
    { key: "computer", label: "Computer & MacBook Repair", sub: "Retina screens, laptop batteries & spill recovery" },
    { key: "console", label: "Game Console Repair", sub: "PS5, Xbox & Nintendo Switch HDMI micro-soldering & fans" },
  ] as const;

  const telHref = `tel:${store.phone.replace(/[^0-9+]/g, "")}`;

  return (
    <main className="bg-[#fcfcfc] min-h-screen text-[#1d1c1a]">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={serviceSchema} />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <nav aria-label="Breadcrumb" className="mb-4 text-[12px] text-neutral-500">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-sfd-teal transition-colors">
                Home
              </Link>
            </li>
            <li>&gt;</li>
            <li>
              <Link href={`/locations/${store.slug}`} className="hover:text-sfd-teal transition-colors">
                {store.shortName}
              </Link>
            </li>
            <li>&gt;</li>
            <li className="text-neutral-800 font-medium" aria-current="page">
              {hood.name}
            </li>
          </ol>
        </nav>

        <section className="bg-white border border-neutral-200/90 rounded-[24px] p-6 sm:p-10 mb-10 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sfd-teal/10 text-sfd-teal border border-sfd-teal/20 text-xs font-bold uppercase tracking-wider">
              {hood.type} · {hood.radius} Service Radius
            </span>
            <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-medium border border-neutral-200">
              ZIP Codes: {hood.zipCodes.join(", ")}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1d1c1a] leading-tight">
            Same-Day Phone &amp; Device Repair Near{" "}
            <span className="text-sfd-teal">{hood.name}</span>
          </h1>

          <div className="p-4 rounded-2xl bg-teal-50/70 border border-sfd-teal/20 text-xs sm:text-[13.5px] leading-relaxed text-[#1d1c1a]">
            <strong className="text-sfd-teal uppercase tracking-wider text-[10.5px] block mb-1">
              Quick Area Answer · Philadelphia {hood.zipCodes.join(" / ")}
            </strong>
            Customers near {hood.name} ({hood.keyLandmarks.join(", ")}) are served directly by{" "}
            {store.name} at {store.streetAddress}, Philadelphia, PA {store.postalCode} ({store.hoursDisplay}).
            Walk in for free diagnostics, 25–45 minute screen and battery swaps, or micro-soldering with
            a 90-day warranty.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-700">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
              <div className="font-bold text-[#1d1c1a] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sfd-teal" />
                Closest Branch
              </div>
              <div>{store.streetAddress}</div>
              <div className="text-neutral-500">Philadelphia, PA {store.postalCode}</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
              <div className="font-bold text-[#1d1c1a] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sfd-teal" />
                Hours &amp; Walk-Ins
              </div>
              <div>{store.hoursDisplay}</div>
              <div className="text-neutral-500">Free diagnostic estimate</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
              <div className="font-bold text-[#1d1c1a] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sfd-teal" />
                Nearby Landmarks
              </div>
              <div>{hood.keyLandmarks.join(" · ")}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={`/schedule-repair?store=${store.storeId}`}
              className="px-6 py-3 rounded-full bg-sfd-teal hover:bg-sfd-tealDark text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              Book Repair Near {hood.name.split(" ")[0]}
            </Link>
            <Link
              href={`/locations/${store.slug}`}
              className="px-5 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#1d1c1a] font-bold text-xs inline-flex items-center gap-1.5 transition"
            >
              <span>View Store Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href={telHref}
              className="px-5 py-3 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300 text-[#1d1c1a] font-bold text-xs inline-flex items-center gap-2 transition"
            >
              <Phone className="w-4 h-4 text-sfd-teal" />
              {store.phone}
            </a>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-xl font-extrabold tracking-tight mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-sfd-teal" />
            Devices Repaired for {hood.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const issuesCount = catalog.issues.filter((i) => i.category === cat.key).length;
              const minPrice = Math.min(
                ...catalog.issues.filter((i) => i.category === cat.key).map((i) => i.basePrice),
                69
              );
              return (
                <Link
                  key={cat.key}
                  href={`/repairs/${cat.key}`}
                  className="bg-white border border-neutral-200/90 hover:border-sfd-teal rounded-2xl p-5 flex flex-col justify-between gap-3 transition"
                >
                  <div>
                    <h3 className="text-base font-bold text-[#1d1c1a]">{cat.label}</h3>
                    <p className="text-xs text-neutral-600 mt-1">{cat.sub}</p>
                  </div>
                  <div className="text-xs font-semibold text-sfd-teal flex items-center justify-between">
                    <span>From ${minPrice} · {issuesCount} services</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Other Neighborhoods */}
        <section className="bg-white border border-neutral-200/90 rounded-[20px] p-6">
          <h2 className="text-lg font-bold mb-3">Other West Philadelphia Areas We Serve</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {siblingHoods
              .filter((s) => s.id !== hood.id)
              .map((s) => (
                <Link
                  key={s.id}
                  href={`/locations/areas/${toNeighborhoodSlug(s.name)}`}
                  className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 hover:bg-teal-50/60 border border-neutral-200/70 text-xs font-semibold text-[#1d1c1a] transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-sfd-teal shrink-0" />
                  <span>{s.name} ({s.zipCodes.join(", ")})</span>
                </Link>
              ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
