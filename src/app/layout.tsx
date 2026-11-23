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

function resolveVerificationTokens(settings: Awaited<ReturnType<typeof getSeoSettings>>) {
  return {
    googleVerification:
      cleanVerificationToken(settings?.googleSiteVerification) ||
      cleanVerificationToken(process.env.GOOGLE_SITE_VERIFICATION) ||
      undefined,
    bingVerification:
      cleanVerificationToken(settings?.bingSiteVerification) ||
      cleanVerificationToken(process.env.BING_SITE_VERIFICATION) ||
      undefined,
    pinterestVerification:
      cleanVerificationToken(settings?.pinterestVerification) ||
      cleanVerificationToken(process.env.PINTEREST_SITE_VERIFICATION) ||
      undefined,
    facebookAppId:
      cleanVerificationToken(settings?.facebookAppId) ||
      cleanVerificationToken(process.env.FACEBOOK_APP_ID) ||
      undefined,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSeoSettings();

  const siteName = settings?.siteName || "SmartFoneDoctor";
  const titleSeparator = settings?.titleSeparator || "|";
  const titleDefault =
    settings?.defaultMetaTitle ||
    "Phone & Electronics Repair in Philadelphia | SmartFoneDoctor";
  const description =
    settings?.defaultMetaDescription ||
    "Fast phone & electronics repair in Philadelphia for iPhone, iPad, MacBook & consoles. 30-min screen & battery repair with warranty.";
  const ogImage = settings?.defaultOgImage || settings?.logoUrl || "/logo-png.jpg";
  const faviconUrl = settings?.faviconUrl || "/favicon.ico";
  const appleTouchIcon = settings?.appleTouchIcon || "/apple-touch-icon.png";
  const twitterHandle = settings?.twitterHandle || "@smartfonedoctor";

  // Webmaster verification tokens (PostgreSQL primary + .env fallback, auto-sanitized)
  const {
    googleVerification,
    bingVerification,
    pinterestVerification,
    facebookAppId,
  } = resolveVerificationTokens(settings);

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
  const faviconUrl = settings?.faviconUrl || "/favicon.ico";
  const appleTouchIcon = settings?.appleTouchIcon || "/apple-touch-icon.png";
  const {
    googleVerification,
    bingVerification,
    pinterestVerification,
    facebookAppId,
  } = resolveVerificationTokens(settings);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=window.location.pathname;if(p&&p.indexOf("//")!==-1){window.location.replace(p.replace(/\\/{2,}/g,"/")+window.location.search+window.location.hash);}}catch(e){}})();`,
          }}
        />
        <link rel="icon" href={faviconUrl} sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href={appleTouchIcon} />
        {googleVerification && (
          <meta name="google-site-verification" content={googleVerification} />
        )}
        {bingVerification && (
          <meta name="msvalidate.01" content={bingVerification} />
        )}
        {pinterestVerification && (
          <meta name="p:domain_verify" content={pinterestVerification} />
        )}
        {facebookAppId && (
          <meta property="fb:app_id" content={facebookAppId} />
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
