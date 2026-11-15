import type { Metadata } from "next";
import { getCmsPageByPathAction } from "@/actions/cmsPages";
import { INITIAL_CMS_PAGES, getStoredCMSPages, type CMSPage } from "@/lib/cmsData";
import { compilePageCss } from "@/puck/style/compilePage";
import HomePageClient from "@/components/site/HomePageClient";

/** Look up Homepage from PostgreSQL with memory seed fallback */
async function resolveHomePage(): Promise<CMSPage | null> {
  // 1. Query PostgreSQL via Server Action
  try {
    const dbRes = await getCmsPageByPathAction("/");
    if (dbRes.success && dbRes.page) {
      return dbRes.page;
    }
  } catch (err) {
    console.warn("[resolveHomePage] DB query failed, falling back to seed:", err);
  }

  // 2. Fallback to seed data
  const pages = getStoredCMSPages();
  const found =
    pages.find((p) => p.slug === "home" || p.id === "home" || p.path === "/") ||
    INITIAL_CMS_PAGES.find((p) => p.slug === "home" || p.id === "home") ||
    null;

  return found;
}

/**
 * Dynamic metadata generator for the Homepage.
 * Pulls current Title, Meta Description, OpenGraph, Canonical, and Schema metadata.
 */
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolveHomePage();

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
    title,
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
  const page = await resolveHomePage();

  // If page has pre-compiled CSS, use it; otherwise JIT-compile from puckData content
  const puckContent = (page?.puckData as { content?: unknown[] } | undefined)?.content;
  const compiledCss =
    page?.compiledCss ||
    (Array.isArray(puckContent) && puckContent.length > 0
      ? compilePageCss(puckContent)
      : "");

  return (
    <>
      {compiledCss ? (
        <style
          id="pb-css-home"
          dangerouslySetInnerHTML={{ __html: compiledCss }}
        />
      ) : null}
      <HomePageClient initialPage={page} />
    </>
  );
}
