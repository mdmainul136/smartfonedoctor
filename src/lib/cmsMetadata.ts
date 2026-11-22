import type { Metadata } from "next";
import { getCmsPage } from "@/actions/cmsPages";
import { brandTitle } from "@/lib/seoTitle";

/**
 * Page metadata from the CMS (Admin > Pages > SEO), on top of the page's coded
 * defaults. Only a published CMS row overrides; any empty field keeps the default.
 */
export async function withCmsMetadata(slug: string, base: Metadata): Promise<Metadata> {
  const page = await getCmsPage(slug);
  if (!page || page.status !== "Published") return base;

  const title = page.title?.trim() ? brandTitle(page.title.trim()) : base.title;
  const description = page.metaDesc?.trim() || base.description;
  const canonical = page.canonicalUrl?.trim() || base.alternates?.canonical;
  const ogTitle = page.title?.trim() || (base.openGraph?.title as string | undefined);
  const keywords = page.keywords?.length ? page.keywords : page.focusKeyword ? [page.focusKeyword] : base.keywords;

  return {
    ...base,
    title,
    description,
    keywords,
    alternates: { ...base.alternates, canonical },
    openGraph: {
      ...base.openGraph,
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(description ? { description } : {}),
      ...(page.featuredImage ? { images: [{ url: page.featuredImage, width: 1200, height: 630 }] } : {}),
    },
  };
}
