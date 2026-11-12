import type { Metadata, Viewport } from "next";
import "./globals.css";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import CookieYesIntegration from "@/components/compliance/CookieYesIntegration";
import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";
import UserWayWidget from "@/components/accessibility/UserWayWidget";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

export const viewport: Viewport = {
  themeColor: "#009691",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SmartFoneDoctor | Fast & Reliable Phone & Electronics Repair in Philadelphia",
    template: "%s | SmartFoneDoctor",
  },
  description:
    "Expert cell phone, iPhone, iPad, MacBook, computer, and gaming console repair in Philadelphia, PA. Fast 30-minute screen and battery replacement with warranty.",
  keywords: [
    "Phone Repair Philadelphia",
    "iPhone Repair 19139",
    "Cell Phone Repair 52nd St",
    "Screen Replacement Philadelphia",
    "iPad Repair",
    "MacBook Repair Philadelphia",
    "Console Repair",
    "Samsung Repair Philadelphia",
    "SmartFoneDoctor",
    "Fast Phone Repair with Warranty",
  ],
  authors: [{ name: "SmartFoneDoctor" }],
  creator: "SmartFoneDoctor",
  publisher: "SmartFoneDoctor",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SmartFoneDoctor | Fast & Professional Electronics Repair",
    description:
      "Expert cell phone, tablet, and computer repair in Philadelphia. Same-day screen replacement, battery service, and lifetime workmanship warranty.",
    url: siteUrl,
    siteName: "SmartFoneDoctor",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo-png.jpg",
        width: 1200,
        height: 630,
        alt: "SmartFoneDoctor Philadelphia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartFoneDoctor | Fast & Reliable Phone Repair",
    description:
      "Cracked screen? Battery draining? We fix smartphones, iPads, MacBooks, and consoles in under 45 minutes in Philadelphia.",
    images: ["/logo-png.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// JSON-LD Structured Data for LocalBusiness SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "SmartFoneDoctor (Smartphone Doctor)",
  image: `${siteUrl}/logo-png.jpg`,
  telephone: "+1-215-598-2090",
  url: siteUrl,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "33 S 52nd St",
    addressLocality: "Philadelphia",
    addressRegion: "PA",
    postalCode: "19139",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 39.9572,
    longitude: -75.2267,
  },
  department: [
    {
      "@type": "LocalBusiness",
      name: "Smart Fone Doctor - 4016 Lancaster",
      telephone: "+1-215-598-2090",
      address: {
        "@type": "PostalAddress",
        streetAddress: "4016 Lancaster Ave",
        addressLocality: "Philadelphia",
        addressRegion: "PA",
        postalCode: "19104",
        addressCountry: "US",
      },
    },
    {
      "@type": "LocalBusiness",
      name: "Smart FoneDoctor - 4060 Lancaster",
      telephone: "+1-215-598-2090",
      address: {
        "@type": "PostalAddress",
        streetAddress: "4060 Lancaster Ave",
        addressLocality: "Philadelphia",
        addressRegion: "PA",
        postalCode: "19104",
        addressCountry: "US",
      },
    },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "19:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "1524",
    bestRating: "5",
    worstRating: "1",
  },
  sameAs: [
    "https://share.google/gTlyWLewR88ToAdJQ",
    "https://facebook.com",
    "https://instagram.com",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Repair Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "iPhone Screen Repair",
          description: "Same-day cracked screen replacement with OEM-grade display",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Phone Battery Replacement",
          description: "New lithium-ion battery replacement in 30 minutes",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Console & Computer Repair",
          description: "HDMI port repair, SSD upgrades, and liquid damage diagnostic",
        },
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Schema.org LocalBusiness Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col antialiased bg-[#fcfcfc] text-neutral-900"
      >
        {children}
      </body>
    </html>
  );
}
