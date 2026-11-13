import React from "react";
import { STORES } from "./stores";

export { STORES };
export const SITE_URL = "https://smartfonedoctor.com";

export interface StoreInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  lat?: number;
  lng?: number;
  cityStateZip?: string;
  gmbUrl?: string;
  businessHours?: string;
  type?: string;
}

export interface SchemaServiceOptions {
  name: string;
  category?: string;
  description: string;
  price?: string | number;
  priceAftermarket?: number;
  priceOem?: number;
  url: string;
  turnaround?: string;
  providerStoreId?: number;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ArticleInfo {
  title: string;
  excerpt?: string;
  slug: string;
  publishedAt?: string;
  updatedAt?: string;
  coverImage?: string;
  author?: {
    name: string;
    role?: string;
    avatar?: string;
  };
}

const PHILLY_SERVICE_AREAS = [
  "West Philadelphia (52nd St)",
  "University City (Penn / Drexel)",
  "Center City Philadelphia",
  "Fishtown & Northern Liberties",
  "South Philadelphia",
  "Kensington",
  "Upper Darby & Delco",
  "Overbrook & Wynnefield",
  "Germantown & Mount Airy",
  "Cobbs Creek",
];

const STORE_COORDINATES: Record<number, { lat: number; lng: number; street: string; zip: string }> = {
  1: { lat: 39.9576, lng: -75.2268, street: "33 S 52nd St, Fl 2nd", zip: "19139" },
  2: { lat: 39.9634, lng: -75.2038, street: "4016 Lancaster Ave", zip: "19104" },
  3: { lat: 39.964, lng: -75.2045, street: "4060 Lancaster Ave", zip: "19104" },
};

function ensureAbsoluteUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * 1. WebSite Schema (SearchAction Sitelinks)
 */
export function buildWebSiteSchema(
  url = SITE_URL,
  name = "SmartFoneDoctor"
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: ensureAbsoluteUrl(url),
    name,
    description:
      "Philadelphia's premier hardware repair bench for smartphones, tablets, computers, and game consoles.",
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "SmartFoneDoctor",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-png.jpg`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/repairs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * 2. BreadcrumbList Schema
 */
export function buildBreadcrumbSchema(
  items: BreadcrumbItem[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: ensureAbsoluteUrl(item.url),
    })),
  };
}

/**
 * 3. LocalBusiness Schema for a single store
 */
export function buildLocalBusinessSchema(
  store: StoreInfo
): Record<string, unknown> {
  const coords = STORE_COORDINATES[store.id] || {
    lat: store.lat ?? 39.9576,
    lng: store.lng ?? -75.2268,
    street: store.address || "33 S 52nd St, Fl 2nd",
    zip: "19139",
  };

  const storeSlug = `phl-0${store.id}`;

  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ElectronicsStore"],
    "@id": `${SITE_URL}/#store-${storeSlug}`,
    name: store.name,
    url: `${SITE_URL}/locations/i/book-repair`,
    telephone: store.phone || "+1 (215) 598-2090",
    image: `${SITE_URL}/logo-png.jpg`,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: coords.street,
      addressLocality: "Philadelphia",
      addressRegion: "PA",
      postalCode: coords.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: coords.lat,
      longitude: coords.lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "420",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

/**
 * 4. MultiStore Schema (Array of stores wrapped in @graph)
 */
export function buildMultiStoreSchema(
  stores: StoreInfo[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": stores.map((s) => buildLocalBusinessSchema(s)),
  };
}

/**
 * 5. Service Schema with single or dual-tier offers
 */
export function buildServiceSchema(
  options: SchemaServiceOptions
): Record<string, unknown> {
  const storeId = options.providerStoreId || 1;
  const storeSlug = `phl-0${storeId}`;

  const offers: Record<string, unknown>[] = [];

  const basePriceNum =
    typeof options.price === "number"
      ? options.price
      : typeof options.price === "string"
      ? parseFloat(options.price.replace(/[^0-9.]/g, ""))
      : undefined;

  const aftermarketPrice = options.priceAftermarket ?? basePriceNum;
  const oemPrice = options.priceOem;

  if (aftermarketPrice !== undefined && !isNaN(aftermarketPrice)) {
    offers.push({
      "@type": "Offer",
      name: "Standard OEM-Grade Component Replacement",
      price: aftermarketPrice.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      validFrom: "2026-01-01",
      warranty: {
        "@type": "WarrantyPromise",
        durationOfWarranty: {
          "@type": "QuantitativeValue",
          value: 90,
          unitCode: "DAY",
        },
        warrantyScope: "90-Day Parts & Labor Warranty",
      },
    });
  }

  if (oemPrice !== undefined && !isNaN(oemPrice)) {
    offers.push({
      "@type": "Offer",
      name: "Premium Original Manufacturer (OEM) Assembly",
      price: oemPrice.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      validFrom: "2026-01-01",
      warranty: {
        "@type": "WarrantyPromise",
        durationOfWarranty: {
          "@type": "QuantitativeValue",
          value: 90,
          unitCode: "DAY",
        },
        warrantyScope: "90-Day Parts & Labor Warranty",
      },
    });
  }

  // Fallback single offer if no explicit prices passed
  if (offers.length === 0) {
    offers.push({
      "@type": "Offer",
      name: `${options.name} Repair Service`,
      price: "69.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      validFrom: "2026-01-01",
      warranty: {
        "@type": "WarrantyPromise",
        durationOfWarranty: {
          "@type": "QuantitativeValue",
          value: 90,
          unitCode: "DAY",
        },
        warrantyScope: "90-Day Parts & Labor Warranty",
      },
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: options.name,
    category: options.category || "Electronics Repair Service",
    description: options.description,
    provider: {
      "@type": ["LocalBusiness", "ElectronicsStore"],
      "@id": `${SITE_URL}/#store-${storeSlug}`,
      name: "SmartFoneDoctor",
      url: SITE_URL,
    },
    areaServed: PHILLY_SERVICE_AREAS.map((area) => ({
      "@type": "AdministrativeArea",
      name: area,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${options.name} Repair Options`,
      itemListElement: offers,
    },
  };
}

/**
 * 6. FAQPage Schema
 */
export function buildFaqSchema(faqs: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * 7. Article & BlogPosting Schema
 */
export function buildArticleSchema(
  article: ArticleInfo,
  schemaType = "TechArticle"
): Record<string, unknown> {
  const published = article.publishedAt || "2026-11-10T12:00:00Z";
  const updated = article.updatedAt || published;
  const canonicalUrl = ensureAbsoluteUrl(`/blog/${article.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: article.title,
    description: article.excerpt || article.title,
    image: article.coverImage || `${SITE_URL}/logo-png.jpg`,
    datePublished: published,
    dateModified: updated,
    proficiencyLevel: "Beginner to Intermediate",
    mainEntityOfPage: canonicalUrl,
    author: {
      "@type": "Person",
      name: article.author?.name || "Dr. Mike",
      jobTitle: article.author?.role || "Lead Hardware Technician & Founder",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "SmartFoneDoctor",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-png.jpg`,
      },
    },
  };
}

/**
 * 8. CollectionPage Schema for Blog Hub
 */
export function buildCollectionPageSchema(
  name: string,
  description: string,
  url = `${SITE_URL}/blog`
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: ensureAbsoluteUrl(url),
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "SmartFoneDoctor",
    },
  };
}

/**
 * Universal JSON-LD React Component
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[] | string;
}) {
  const jsonString =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);

  return React.createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: jsonString },
  });
}
