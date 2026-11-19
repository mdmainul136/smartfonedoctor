import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  MapPin,
  ShieldCheck,
  Clock,
  Award,
  Recycle,
  Star,
  Phone,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Wrench,
  Cpu,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import AboutMap, { StorePoint } from "@/components/about/AboutMap";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { getStoreBranchesAction } from "@/actions/settings";
import { getCmsPage } from "@/actions/cmsPages";
import { compilePageCss } from "@/puck/style/compilePage";
import { JsonLd, buildBreadcrumbSchema } from "@/lib/schema";

/**
 * Dynamic metadata generator for the About Us page.
 * Delivers full SEO, GEO signals (Philadelphia coordinates, postal code 19139),
 * OpenGraph 1200x630 featured image, and Twitter Summary Card.
 */
export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("/about");

  const title =
    page?.title ||
    "About SmartFoneDoctor | Philadelphia's Top-Rated Device Repair Specialists";
  const description =
    page?.metaDesc ||
    "Learn about SmartFoneDoctor: Philadelphia's trusted electronics repair center at 33 S 52nd St & Lancaster Ave. WISE-certified technicians, same-day repairs, 90-day warranty, and sustainable recycling.";
  const canonicalUrl = page?.canonicalUrl || "https://smartfonedoctor.com/about";
  const ogImage =
    page?.featuredImage ||
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=85";

  return {
    title,
    description,
    keywords:
      page?.keywords && page.keywords.length > 0
        ? page.keywords
        : [
          "About SmartFoneDoctor",
          "Phone repair Philadelphia",
          "Cell phone repair West Philadelphia",
          "Computer and MacBook repair Philly",
          "PS5 HDMI port repair Philadelphia",
          "WISE certified device technicians",
          "Electronics repair 19139",
          "Same day phone repair University City",
        ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "SmartFoneDoctor",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@smartfonedoctor",
    },
    other: {
      "geo.region": "US-PA",
      "geo.placename": "Philadelphia",
      "geo.position": "39.9575;-75.2263",
      ICBM: "39.9575, -75.2263",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AboutPage() {
  const [page, branchesRes] = await Promise.all([
    getCmsPage("/about"),
    getStoreBranchesAction(),
  ]);

  const branches = branchesRes?.success && branchesRes.data ? branchesRes.data : [];

  const mappedStores: StorePoint[] | undefined =
    branches.length > 0
      ? branches.map((b, idx) => ({
        id: typeof b.id === "number" ? b.id : idx + 1,
        name: b.name,
        badge: idx === 0 ? "Flagship HQ" : undefined,
        address: b.address,
        cityStateZip: b.cityStateZip || "Philadelphia, PA 19139",
        phone: b.phone,
        rating: 4.9,
        reviewsCount: idx === 0 ? 1524 : idx === 1 ? 880 : 940,
        category: "Cell phone store · Phone repair service",
        hours: b.businessHours || "Mon - Sat: 10:00 AM - 7:00 PM",
        lat: idx === 0 ? 39.9575 : idx === 1 ? 39.9628 : 39.9635,
        lng: idx === 0 ? -75.2263 : idx === 1 ? -75.2045 : -75.2062,
        gmbUrl:
          b.gmbUrl ||
          `https://maps.google.com/?q=${encodeURIComponent(
            b.address + ", " + (b.cityStateZip || "Philadelphia, PA")
          )}`,
      }))
      : undefined;

  // Compile pre-rendered CSS if Page Builder blocks are present
  const puckContent = (page?.puckData as { content?: unknown[] } | undefined)?.content;
  const compiledCss =
    page?.compiledCss ||
    (Array.isArray(puckContent) && puckContent.length > 0
      ? compilePageCss(puckContent)
      : "");

  // ─── Rich Structured Data (Breadcrumb + Multi-Entity AboutPage + AEO Knowledge Graph) ───
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ]);

  const featuredImgUrl =
    page?.featuredImage ||
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=85";

  const primaryStore = mappedStores?.[0] || {
    address: "33 S 52nd St, Fl 2nd",
    lat: 39.9575,
    lng: -75.2263,
  };

  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": "https://smartfonedoctor.com/about#webpage",
        url: "https://smartfonedoctor.com/about",
        name: page?.title || "About SmartFoneDoctor | Philadelphia's Top-Rated Device Repair Specialists",
        description:
          page?.metaDesc ||
          "Learn about SmartFoneDoctor: Philadelphia's leading electronics repair center, specializing in same-day smartphone, laptop, tablet, and game console repairs backed by a 90-day warranty.",
        inLanguage: "en-US",
        isPartOf: {
          "@type": "WebSite",
          "@id": "https://smartfonedoctor.com/#website",
          name: "SmartFoneDoctor",
          url: "https://smartfonedoctor.com",
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: featuredImgUrl,
        },
        mainEntity: {
          "@type": ["LocalBusiness", "ElectronicsStore"],
          "@id": "https://smartfonedoctor.com/#organization",
          name: "SmartFoneDoctor",
          alternateName: ["Smart Fone Doctor", "SmartFone Doctor Philadelphia"],
          url: "https://smartfonedoctor.com",
          logo: "https://smartfonedoctor.com/logo-png.jpg",
          image: featuredImgUrl,
          telephone: "+1-215-598-2090",
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: primaryStore.address,
            addressLocality: "Philadelphia",
            addressRegion: "PA",
            postalCode: "19139",
            addressCountry: "US",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: primaryStore.lat,
            longitude: primaryStore.lng,
          },
          areaServed: [
            { "@type": "City", name: "Philadelphia" },
            { "@type": "AdministrativeArea", name: "West Philadelphia" },
            { "@type": "AdministrativeArea", name: "University City" },
            { "@type": "AdministrativeArea", name: "Center City Philadelphia" },
          ],
          knowsAbout: [
            "iPhone Screen and OLED Replacement",
            "Samsung Galaxy AMOLED Repair",
            "MacBook Logic Board Micro-Soldering Diagnostics",
            "PlayStation 5 HDMI 2.1 Port Replacement",
            "Nintendo Switch USB-C and Charging Port Repair",
            "Ultrasonic Liquid Damage Decontamination",
            "WISE Certified Electronics Repair Protocols",
            "Sustainable Electronics Recycling and E-Waste Prevention",
          ],
          sameAs: [
            "https://share.google/gTlyWLewR88ToAdJQ",
            "https://maps.google.com/?q=33+S+52nd+St,+Philadelphia,+PA+19139",
            "https://www.facebook.com/smartfonedoctor",
            "https://www.yelp.com/biz/smart-fone-doctor-philadelphia",
          ],
        },
      },
    ],
  };

  return (
    <main className="bg-[#fcfcfc] min-h-screen text-[#1d1c1a]">
      {/* ── JSON-LD Structured Data for Search & AI Engines ── */}
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={aboutPageSchema} />

      {/* Pre-compiled CSS for Page Builder blocks (Zero Layout Shift) */}
      {compiledCss ? (
        <style
          id="pb-css-about"
          dangerouslySetInnerHTML={{ __html: compiledCss }}
        />
      ) : null}

      <CMSSectionRenderer slug="about" initialPage={page}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">

          {/* 1. Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="mb-4 text-[13px] text-neutral-500 font-normal"
          >
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li>
                <Link
                  href="/"
                  className="hover:text-sfd-teal transition-colors"
                >
                  Home
                </Link>
              </li>
              <li className="text-neutral-400">&gt;</li>
              <li
                className="text-neutral-800 font-semibold"
                aria-current="page"
              >
                About Us
              </li>
            </ol>
          </nav>

          {/* 2. Hero Banner Card */}
          <div className="relative w-full rounded-[24px] overflow-hidden bg-neutral-900 min-h-[400px] sm:min-h-[460px] flex items-center mb-8 shadow-sm">
            {/* Background Store Interior Image with Dark Gradient Overlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src={featuredImgUrl}
                alt="SmartFoneDoctor Cleanroom Repair Lab and Flagship Store"
                fill
                className="object-cover object-center opacity-45 brightness-90"
                priority
              />
              {/* Gradient overlay to ensure crisp contrast on the left side */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent"></div>
            </div>

            {/* Hero Content (Left side aligned) */}
            <div className="relative z-10 max-w-2xl p-6 sm:p-12 lg:p-16 text-white space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sfd-teal/20 backdrop-blur-md border border-sfd-teal/40 text-sfd-teal text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Locally Owned &amp; Operated in Philadelphia</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                SmartFoneDoctor
              </h1>

              <div className="text-base sm:text-lg font-semibold text-neutral-200 tracking-wide">
                So Much More Than Cell Phone Repair
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal max-w-xl">
                SmartFoneDoctor provides expert hardware diagnostics and precision repairs for smartphones, MacBooks, tablets, and gaming consoles—backed by verified local technicians you can trust. Our mission combines honest craftsmanship, right-to-repair sustainability, and dedicated community service.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/schedule-repair"
                  className="px-6 py-3 rounded-full bg-sfd-teal hover:bg-sfd-dark text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-2 active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book a Repair</span>
                </Link>
                <Link
                  href="/locations/i/book-repair"
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wider transition border border-white/20 flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Find a Store</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 3. High-Impact Trust & Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 text-center shadow-xs">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sfd-teal/10 text-sfd-teal mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                6+ Years
              </div>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                Serving West Philly Since 2018
              </p>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 text-center shadow-xs">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 mb-3">
                <Recycle className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                15,000+
              </div>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                Devices Saved from Landfills
              </p>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 text-center shadow-xs">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-500 mb-3">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                4.9 ★
              </div>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                1,500+ Local Reviews
              </p>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 text-center shadow-xs">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                WISE Lab
              </div>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                ESD-Safe Micro-Soldering
              </p>
            </div>
          </div>

          {/* 4. Alternating 4 Feature Blocks */}
          <div className="space-y-10 sm:space-y-14">

            {/* Block 1: Problem Solvers (Image Left, Card Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Image Column */}
              <div className="lg:col-span-6 relative min-h-[300px] sm:min-h-[360px] rounded-[22px] overflow-hidden shadow-xs">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
                  alt="Problem Solvers collaborating on hardware repair"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Card Column */}
              <div className="lg:col-span-6 bg-white border border-neutral-200/90 rounded-[22px] p-8 sm:p-10 flex flex-col justify-center shadow-xs">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sfd-teal mb-2">
                  <Award className="w-4 h-4" />
                  <span>Integrity &amp; Diagnostic Excellence</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1c1a] tracking-tight mb-4">
                  Problem Solvers
                </h2>
                <p className="text-xs sm:text-[13.5px] text-neutral-600 leading-relaxed">
                  At SmartFoneDoctor, we focus on technical accuracy, customer service, and continuous craftsmanship improvement. Our dedicated technicians build trust and strong community partnerships. We provide complete transparency—no predatory sales pitches or unnecessary part replacements—ensuring satisfied customers who consistently recommend us over competitors.
                </p>

                <div className="mt-6 pt-5 border-t border-neutral-100 flex flex-wrap gap-4 text-xs font-semibold text-neutral-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sfd-teal" /> Free Diagnostic Check
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sfd-teal" /> Upfront Written Estimates
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sfd-teal" /> OEM-Spec Components
                  </span>
                </div>
              </div>
            </div>

            {/* Block 2: We Are Growing / Global Footprint (Card Left, Interactive Map Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Card Column */}
              <div className="lg:col-span-6 bg-white border border-neutral-200/90 rounded-[22px] p-8 sm:p-10 flex flex-col justify-center order-2 lg:order-1 shadow-xs">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sfd-teal mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Philadelphia Footprint</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1c1a] tracking-tight mb-4">
                  We Are Expanding Locally &amp; Regionally
                </h2>
                <p className="text-xs sm:text-[13.5px] text-neutral-600 leading-relaxed mb-4">
                  Our goal is to be right on hand in every community we serve. From our flagship headquarters at 33 S 52nd St right off the Market-Frankford Line to our University City and Lancaster Ave branches, we deliver dependable same-day repairs to students, healthcare workers, and families throughout Philadelphia.
                </p>

                <div className="space-y-2 text-xs text-neutral-600 bg-neutral-50 rounded-xl p-4 border border-neutral-200/70">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-neutral-900 shrink-0">Flagship:</span>
                    <span>33 S 52nd St, Philadelphia, PA 19139 (Market-Frankford Line)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-neutral-900 shrink-0">Tech Hub:</span>
                    <span>4016 Lancaster Ave, Philadelphia, PA 19104 (Near Penn &amp; Drexel)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-neutral-900 shrink-0">Express:</span>
                    <span>4060 Lancaster Ave, Philadelphia, PA 19104 (Walk-in Bench)</span>
                  </div>
                </div>
              </div>

              {/* Graphic Column: Interactive Leaflet Map with 3 Store Pins */}
              <div className="lg:col-span-6 min-h-[440px] sm:min-h-[480px] flex flex-col order-1 lg:order-2">
                <AboutMap initialStores={mappedStores} />
              </div>
            </div>

            {/* Block 3: Going Green (Image Left, Card Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Image Column */}
              <div className="lg:col-span-6 relative min-h-[300px] sm:min-h-[360px] rounded-[22px] overflow-hidden shadow-xs">
                <Image
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80"
                  alt="Environmental sustainability and electronics recycling"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Card Column */}
              <div className="lg:col-span-6 bg-white border border-neutral-200/90 rounded-[22px] p-8 sm:p-10 flex flex-col justify-center shadow-xs">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">
                  <Recycle className="w-4 h-4" />
                  <span>Right to Repair &amp; Sustainability</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1c1a] tracking-tight mb-4">
                  Going Green
                </h2>
                <p className="text-xs sm:text-[13.5px] text-neutral-600 leading-relaxed">
                  As an organization with an unwavering commitment to environmental stewardship, we believe repair is recycling in its highest and most impactful form. By repairing devices, we extend their useful lifespan and keep heavy metals and hazardous lithium batteries out of Philadelphia landfills. We properly decommission and recycle all retired components in accordance with strict e-waste regulations.
                </p>
              </div>
            </div>

            {/* Block 4: Customer Focus (Card Left, Image Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Card Column */}
              <div className="lg:col-span-6 bg-white border border-neutral-200/90 rounded-[22px] p-8 sm:p-10 flex flex-col justify-center order-2 lg:order-1 shadow-xs">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sfd-teal mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>90-Day Comprehensive Warranty</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1c1a] tracking-tight mb-4">
                  Our Customers Are The Most Important To Us
                </h2>
                <p className="text-xs sm:text-[13.5px] text-neutral-600 leading-relaxed">
                  Our customers mean everything to us. Because of your trust, we invest continuously in state-of-the-art diagnostic stations, micro-soldering microscopes, and laser back glass separators. Our 90-day comprehensive warranty on all replacement parts and labor is proof of our stance on quality repairs and superior service.
                </p>
              </div>

              {/* Image Column */}
              <div className="lg:col-span-6 relative min-h-[300px] sm:min-h-[360px] rounded-[22px] overflow-hidden shadow-xs order-1 lg:order-2">
                <Image
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
                  alt="SmartFoneDoctor customer service front desk in Philadelphia"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

          </div>

          {/* 5. Bottom Conversion CTA Strip */}
          <div className="mt-16 rounded-[24px] bg-[#1d1c1a] text-white p-8 sm:p-10 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4dd0e1]">
                <Wrench className="w-4 h-4 text-sfd-teal" />
                <span>Visit a Store or Schedule Online</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Need Fast, Reliable Device Repair Today?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg">
                Stop by 33 S 52nd St or Lancaster Ave for immediate bench service, or schedule online to hold OEM-grade replacement parts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/schedule-repair"
                className="w-full sm:w-auto text-center px-6 py-3.5 rounded-full bg-[#c8102e] hover:bg-[#a00c24] text-white font-bold text-xs uppercase tracking-wider transition shadow-sm active:scale-95 flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Repair</span>
              </Link>
              <a
                href="tel:2155982090"
                className="w-full sm:w-auto text-center px-5 py-3.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition border border-neutral-700 flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>(215) 598-2090</span>
              </a>
            </div>
          </div>

        </div>
      </CMSSectionRenderer>

      {/* Global Footer */}
      <Footer />
    </main>
  );
}
