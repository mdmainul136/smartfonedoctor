import prisma from "@/lib/prisma";
import { getGeoStoreByCode } from "@/lib/geoPages";
import { twitterHandleToUrl } from "@/lib/siteBrand";

function toAbsoluteImageUrl(siteUrl: string, raw?: string | null): string {
  const clean = (raw ?? "").trim();
  if (!clean) return `${siteUrl}/logo-png.jpg`;
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  return `${siteUrl}${clean.startsWith("/") ? clean : `/${clean}`}`;
}

export default async function GmbSchemaJsonLd() {
  try {
    const [locations, entity, settings] = await Promise.all([
      prisma.locations.findMany({ where: { is_active: true } }),
      prisma.knowledgeGraphEntity.findUnique({ where: { id: "sfd_knowledge_entity" } }),
      prisma.siteSeoSettings.findUnique({ where: { id: "global_seo_settings" } }),
    ]);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";
    const siteName = settings?.siteName || "SmartFoneDoctor";
    const brandLogoUrl = toAbsoluteImageUrl(siteUrl, settings?.logoUrl);

    const departments = locations.map((loc) => {
      const geo = getGeoStoreByCode(loc.store_code);
      const zipMatch = loc.address.match(/\b\d{5}\b/);
      const zip = geo?.postalCode || (zipMatch ? zipMatch[0] : "19139");
      const storeUrl = geo
        ? `${siteUrl}/locations/${geo.slug}`
        : `${siteUrl}/locations/i/book-repair`;

      return {
        "@type": ["LocalBusiness", "ElectronicsStore"],
        "@id": `${siteUrl}/locations#${loc.store_code.replace(/_/g, "-")}`,
        name: geo?.name || loc.name,
        url: storeUrl,
        image: toAbsoluteImageUrl(siteUrl, geo?.heroImage || settings?.logoUrl),
        telephone: loc.phone || "+1-215-598-2090",
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: geo?.streetAddress || loc.address,
          addressLocality: "Philadelphia",
          addressRegion: "PA",
          postalCode: zip,
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: geo?.latitude ?? 39.9576,
          longitude: geo?.longitude ?? -75.2268,
        },
        hasMap: loc.google_maps_url || geo?.gmbUrl || "https://maps.google.com/?cid=15243892090",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "10:00",
            closes: "19:00",
          },
        ],
      };
    });

    const baseSameAs = (
      entity?.sameAsUrls || [
        "https://maps.google.com/?cid=15243892090",
        "https://www.yelp.com/biz/smart-fone-doctor-philadelphia",
        "https://www.bbb.org/us/pa/philadelphia/profile/cell-phone-repair/smartfonedoctor",
        "https://facebook.com/smartfonedoctorphilly",
      ]
    ).filter((u) => !u.includes("wikidata.org/wiki/Q115862892"));

    const socialSameAs = [
      settings?.facebookUrl?.trim(),
      settings?.instagramUrl?.trim(),
      settings?.youtubeUrl?.trim(),
      twitterHandleToUrl(settings?.twitterHandle),
      settings?.gmbUrl?.trim(),
    ].filter(Boolean) as string[];

    const filteredSameAs = Array.from(new Set([...baseSameAs, ...socialSameAs]));
    const mainMapUrl = settings?.gmbUrl?.trim() || "https://maps.google.com/?cid=15243892090";
    const mainPhone = settings?.contactPhone?.trim() || "+1-215-598-2090";

    const hqZipMatch = settings?.cityStateZip?.match(/\b\d{5}\b/);

    const schemaGraph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["LocalBusiness", "ElectronicsStore"],
          "@id": `${siteUrl}/#localbusiness`,
          name: siteName,
          legalName: entity?.legalName || "SmartFoneDoctor LLC",
          url: siteUrl,
          logo: brandLogoUrl,
          image: brandLogoUrl,
          telephone: mainPhone,
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: settings?.streetAddress?.trim() || "33 S 52nd St, Fl 2nd",
            addressLocality: "Philadelphia",
            addressRegion: "PA",
            postalCode: hqZipMatch ? hqZipMatch[0] : "19139",
            addressCountry: "US",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 39.9576,
            longitude: -75.2268,
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "10:00",
              closes: "19:00",
            },
          ],
          currenciesAccepted: "USD",
          paymentAccepted: "Cash, Credit Card, Debit Card, Apple Pay, Google Pay, Contactless",
          areaServed: [
            "West Philadelphia, PA",
            "University City, PA",
            "Drexel University",
            "University of Pennsylvania",
            "Philadelphia County, PA",
            "19139",
            "19104",
            "19143",
          ],
          sameAs: filteredSameAs,
          hasMap: mainMapUrl,
          department: departments,
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Electronic Device Repair Services",
            itemListElement: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "iPhone Screen & OLED Replacement",
                  description: "Same-day 25–45 minute cracked screen replacement with 90-day warranty",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Smartphone Battery Health Restoration",
                  description: "OEM-grade battery replacement restoring 100% capacity in 30 minutes",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Game Console HDMI Micro-Soldering",
                  description: "PS5, Xbox Series X, and Nintendo Switch precision HDMI port repair",
                },
              },
            ],
          },
        },
      ],
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />
    );
  } catch (error) {
    console.error("Failed to render GmbSchemaJsonLd:", error);
    return null;
  }
}
