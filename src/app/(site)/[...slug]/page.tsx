import type { Metadata } from "next";
import CustomPage from "@/components/site/CustomPage";
import { getStoredCMSPages } from "@/lib/cmsData";

type PageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Dynamic metadata generator for custom CMS pages.
 * Delivers accurate server-side Title, Description, OpenGraph, Canonical, and Twitter cards.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = `/${slug.join("/")}`;
  const pages = getStoredCMSPages();
  const normalizedPath = path.toLowerCase().replace(/\/$/, "");

  const page = pages.find((p) => {
    const pPath = (p.path || "").toLowerCase().replace(/\/$/, "");
    return pPath === normalizedPath || p.slug === slug[slug.length - 1];
  });

  if (!page) {
    return {
      title: "Page Not Found | SmartFone Doctor",
      description: "The requested page could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const title = page.title || `${page.name} | SmartFone Doctor`;
  const description =
    page.metaDesc ||
    page.heroSubtitle ||
    "Professional phone, tablet, computer and electronics repair in Philadelphia.";
  const canonicalUrl = page.canonicalUrl || `https://smartfonedoctor.com${path}`;
  const ogImage = page.featuredImage || "/images/og-default.jpg";

  return {
    title,
    description,
    keywords: page.keywords?.length
      ? page.keywords
      : page.focusKeyword
      ? [page.focusKeyword]
      : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "SmartFone Doctor",
      type: "website",
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
    },
    robots: {
      index: page.status === "Published",
      follow: page.status === "Published",
    },
  };
}

/**
 * Pages created in Admin > Pages. Built-in pages have their own route folders,
 * which Next.js always prefers over this catch-all.
 */
export default async function CustomPageRoute({ params }: PageProps) {
  const { slug } = await params;
  return <CustomPage path={`/${slug.join("/")}`} />;
}
