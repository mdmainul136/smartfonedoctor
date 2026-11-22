import type { Metadata, Viewport } from "next";
import prisma from "@/lib/prisma";
import { cleanVerificationToken } from "@/lib/seoSanitize";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

export const viewport: Viewport = {
  themeColor: "#009691",
  width: "device-width",
  initialScale: 1,
};

export const revalidate = 0; // Ensure live database SEO settings & verification tokens are never stuck on stale build cache

async function getSeoSettings() {
  try {
    return await prisma.siteSeoSettings.findUnique({
      where: { id: "global_seo_settings" },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSeoSettings();

  const siteName = settings?.siteName || "SmartFoneDoctor";
  const titleSeparator = settings?.titleSeparator || "|";
  const titleDefault =
    settings?.defaultMetaTitle ||
    "SmartFoneDoctor | Fast & Reliable Phone & Electronics Repair in Philadelphia";
  const description =
    settings?.defaultMetaDescription ||
    "Expert cell phone, iPhone, iPad, MacBook, computer, and gaming console repair in Philadelphia, PA. Fast 30-minute screen and battery replacement with warranty.";
  const ogImage = settings?.defaultOgImage || settings?.logoUrl || "/logo-png.jpg";
  const faviconUrl = settings?.faviconUrl || "/favicon.ico";
  const appleTouchIcon = settings?.appleTouchIcon || "/apple-touch-icon.png";
  const twitterHandle = settings?.twitterHandle || "@smartfonedoctor";

  // Webmaster verification tokens from PostgreSQL (auto-sanitized)
  const googleVerification = cleanVerificationToken(settings?.googleSiteVerification) || undefined;
  const bingVerification = cleanVerificationToken(settings?.bingSiteVerification) || undefined;
  const pinterestVerification = cleanVerificationToken(settings?.pinterestVerification) || undefined;
  const facebookAppId = cleanVerificationToken(settings?.facebookAppId) || undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: titleDefault,
      template: `%s ${titleSeparator} ${siteName}`,
    },
    description,
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
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: true,
      telephone: true,
    },
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: [
        { url: faviconUrl },
        { url: faviconUrl, sizes: "32x32" },
        { url: faviconUrl, sizes: "16x16" },
        { url: ogImage, type: "image/jpeg" },
      ],
      shortcut: faviconUrl,
      apple: appleTouchIcon || faviconUrl,
    },
    verification: {
      google: googleVerification,
      other: {
        ...(bingVerification ? { "msvalidate.01": bingVerification } : {}),
        ...(pinterestVerification ? { "p:domain_verify": pinterestVerification } : {}),
      },
    },
    other: {
      describedby: "/llms.txt",
      ...(facebookAppId ? { "fb:app_id": facebookAppId } : {}),
    },
    openGraph: {
      title: titleDefault,
      description,
      url: siteUrl,
      siteName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteName} Philadelphia`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
      creator: twitterHandle,
      images: [ogImage],
    },
    robots: {
      index: settings?.enableRobotsTxt !== false,
      follow: settings?.enableRobotsTxt !== false,
      googleBot: {
        index: settings?.enableRobotsTxt !== false,
        follow: settings?.enableRobotsTxt !== false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSeoSettings();

  const siteName = settings?.siteName || "SmartFoneDoctor";
  const logoUrl = settings?.logoUrl || "/logo-png.jpg";
  const contactPhone = settings?.contactPhone || "+1-215-598-2090";
  const streetAddress = settings?.streetAddress || "33 S 52nd St";
  const faviconUrl = settings?.faviconUrl || "/favicon.ico";
  const appleTouchIcon = settings?.appleTouchIcon || "/apple-touch-icon.png";

  const sameAs = [
    settings?.gmbUrl || "https://share.google/gTlyWLewR88ToAdJQ",
    settings?.facebookUrl || "https://facebook.com/smartfonedoctor",
    settings?.instagramUrl || "https://instagram.com/smartfonedoctor",
    settings?.youtubeUrl,
    settings?.linkedinUrl,
  ].filter(Boolean) as string[];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href={faviconUrl} sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href={appleTouchIcon} />
        {cleanVerificationToken(settings?.googleSiteVerification) && (
          <meta name="google-site-verification" content={cleanVerificationToken(settings?.googleSiteVerification)!} />
        )}
        {cleanVerificationToken(settings?.bingSiteVerification) && (
          <meta name="msvalidate.01" content={cleanVerificationToken(settings?.bingSiteVerification)!} />
        )}
        {cleanVerificationToken(settings?.pinterestVerification) && (
          <meta name="p:domain_verify" content={cleanVerificationToken(settings?.pinterestVerification)!} />
        )}
        {cleanVerificationToken(settings?.facebookAppId) && (
          <meta property="fb:app_id" content={cleanVerificationToken(settings?.facebookAppId)!} />
        )}
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
