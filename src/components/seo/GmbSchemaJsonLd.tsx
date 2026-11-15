import prisma from "@/lib/prisma";

export default async function GmbSchemaJsonLd() {
  try {
    const [locations, entity, settings] = await Promise.all([
      prisma.locations.findMany({ where: { is_active: true } }),
      prisma.knowledgeGraphEntity.findUnique({ where: { id: "sfd_knowledge_entity" } }),
      prisma.siteSeoSettings.findUnique({ where: { id: "global_seo_settings" } }),
    ]);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";
    const siteName = settings?.siteName || "SmartFoneDoctor";

    const departments = locations.map((loc) => {
      const zipMatch = loc.address.match(/\b\d{5}\b/);
      const zip = zipMatch ? zipMatch[0] : "19139";

      return {
        "@type": "MobilePhoneRepairShop",
        "@id": `${siteUrl}/locations#${loc.store_code.replace(/_/g, "-")}`,
        name: loc.name,
        url: `${siteUrl}/locations`,
        telephone: loc.phone || "+1-215-598-2090",
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: loc.address,
          addressLocality: "Philadelphia",
          addressRegion: "PA",
          postalCode: zip,
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 39.9572,
          longitude: -75.2267,
        },
        hasMap: loc.google_maps_url || "https://maps.google.com/?cid=15243892090",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "10:00",
            closes: "19:30",
          },
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: loc.google_rating ? Number(loc.google_rating).toFixed(1) : "4.9",
          reviewCount: loc.total_reviews ? String(loc.total_reviews) : "1520",
          bestRating: "5",
          worstRating: "1",
        },
      };
    });

    const schemaGraph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["ElectronicsRepairShop", "MobilePhoneRepairShop"],
          "@id": `${siteUrl}/#organization`,
          name: siteName,
          legalName: entity?.legalName || "SmartFoneDoctor LLC",
          url: siteUrl,
          logo: `${siteUrl}/logo-png.jpg`,
          image: `${siteUrl}/logo-png.jpg`,
          telephone: "+1-215-598-2090",
          priceRange: "$$",
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
          sameAs: entity?.sameAsUrls || [
            "https://maps.google.com/?cid=15243892090",
            "https://www.yelp.com/biz/smart-fone-doctor-philadelphia",
            "https://www.bbb.org/us/pa/philadelphia/profile/cell-phone-repair/smartfonedoctor",
            "https://facebook.com/smartfonedoctorphilly",
            "https://www.wikidata.org/wiki/Q115862892",
          ],
          hasMap: "https://maps.google.com/?cid=15243892090",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "1524",
            bestRating: "5",
            worstRating: "1",
          },
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
