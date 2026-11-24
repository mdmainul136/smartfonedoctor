import type { Metadata } from "next";
import { brandTitle } from "@/lib/seoTitle";
import { getCmsPage } from "@/actions/cmsPages";
import { getPublicFeaturedReviewsAction } from "@/actions/reviews";
import type { ReviewContent } from "@/components/home/sectionContent";
import HomePageClient from "@/components/site/HomePageClient";
import prisma from "@/lib/prisma";
import { normalizeTwitterHandle } from "@/lib/siteBrand";

const OPTIMIZED_HOME_TITLE =
  "Phone & Electronics Repair in Philadelphia | SmartFoneDoctor";
const OPTIMIZED_HOME_DESC =
  "Fast phone & electronics repair in Philadelphia for iPhone, iPad, MacBook & consoles. 30-min screen & battery repair with warranty.";
const LEGACY_HOME_TITLES = new Set([
  "Fast & Reliable Phone & Electronics Repair in Philadelphia",
  "SmartFoneDoctor | Fast & Reliable Phone & Electronics Repair in Philadelphia",
]);
const LEGACY_HOME_DESC =
  "Philadelphia's top-rated cell phone, iPhone, iPad, MacBook, and console repair shop. 30-minute screen and battery service with warranty.";

/**
 * Dynamic metadata generator for the Homepage.
 * Pulls current Title, Meta Description, OpenGraph, Canonical, and Schema metadata.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [page, seoSettings] = await Promise.all([
    getCmsPage("/"),
    prisma.siteSeoSettings
      .findUnique({
        where: { id: "global_seo_settings" },
        select: { twitterHandle: true, defaultOgImage: true, siteName: true },
      })
      .catch(() => null),
  ]);

  const rawTitle = page?.title?.trim() || "";
  const title =
    !rawTitle || LEGACY_HOME_TITLES.has(rawTitle) ? OPTIMIZED_HOME_TITLE : rawTitle;
  const rawDesc = page?.metaDesc?.trim() || "";
  const description =
    !rawDesc || rawDesc === LEGACY_HOME_DESC
      ? OPTIMIZED_HOME_DESC
      : rawDesc;
  const canonicalUrl = page?.canonicalUrl || "https://smartfonedoctor.com/";
  const ogImage =
    page?.featuredImage?.trim() ||
    seoSettings?.defaultOgImage?.trim() ||
    "/logo-png.jpg";
  const twitterHandle =
    normalizeTwitterHandle(seoSettings?.twitterHandle) || "@smartfonedoctor";
  const siteName = seoSettings?.siteName?.trim() || "SmartFoneDoctor";

  return {
    title: brandTitle(title),
    description,
    keywords: page?.keywords?.length
      ? page.keywords
      : page?.focusKeyword
      ? [page.focusKeyword]
      : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
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
      site: twitterHandle,
      creator: twitterHandle,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Server-rendered Homepage with pre-compiled Puck CSS injection.
 * Ensures zero Layout Shift (CLS) and zero FOUC for both Puck designs and custom layouts.
 */
export default async function HomePage() {
  const [page, featuredReviews] = await Promise.all([
    getCmsPage("/"),
    getPublicFeaturedReviewsAction(),
  ]);

  const initialReviews: ReviewContent[] = featuredReviews.map((r) => ({
    author: r.author,
    location: r.location,
    device: r.device,
    content: r.content,
    rating: r.rating,
  }));

  // Widget Design styles are rendered next to each widget (styleRender.tsx).
  return <HomePageClient initialPage={page} initialReviews={initialReviews} />;
}
