import type { Metadata } from "next";
import { brandTitle } from "@/lib/seoTitle";
import { getCmsPage } from "@/actions/cmsPages";
import { getPublicFeaturedReviewsAction } from "@/actions/reviews";
import type { ReviewContent } from "@/components/home/sectionContent";
import HomePageClient from "@/components/site/HomePageClient";

/**
 * Dynamic metadata generator for the Homepage.
 * Pulls current Title, Meta Description, OpenGraph, Canonical, and Schema metadata.
 */
export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("/");

  const title =
    page?.title ||
    "SmartFoneDoctor | Fast & Reliable Phone & Electronics Repair in Philadelphia";
  const description =
    page?.metaDesc ||
    page?.heroSubtitle ||
    "Expert cell phone, iPhone, iPad, MacBook, computer, and gaming console repair in Philadelphia, PA. Fast 30-minute screen and battery replacement with warranty.";
  const canonicalUrl = page?.canonicalUrl || "https://smartfonedoctor.com/";
  const ogImage = page?.featuredImage || "/logo-png.jpg";

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
      siteName: "SmartFoneDoctor",
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
