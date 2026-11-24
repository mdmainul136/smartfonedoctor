import type { Metadata } from "next";
import { getCmsPage } from "@/actions/cmsPages";
import { brandTitle } from "@/lib/seoTitle";
import { buildSocialMetadata } from "@/lib/seoSocial";

function extractBaseTitle(title: Metadata["title"]): string {
  if (!title) return "SmartFoneDoctor";
  if (typeof title === "string") return title;
  if ("absolute" in title && title.absolute) return title.absolute;
  if ("default" in title && title.default) return title.default;
  return "SmartFoneDoctor";
}

function extractBaseImage(images: NonNullable<Metadata["openGraph"]>["images"]): string | undefined {
  if (!images) return undefined;
  const first = Array.isArray(images) ? images[0] : images;
  if (!first) return undefined;
  if (typeof first === "string") return first;
  if (first instanceof URL) return first.toString();
  if (typeof first === "object" && "url" in first) {
    return typeof first.url === "string" ? first.url : first.url.toString();
  }
  return undefined;
}

/**
 * Page metadata from the CMS (Admin > Pages > SEO), on top of the page's coded
 * defaults. Only a published CMS row overrides; any empty field keeps the default.
 * Always guarantees complete OpenGraph and Twitter cards.
 */
export async function withCmsMetadata(slug: string, base: Metadata): Promise<Metadata> {
  const page = await getCmsPage(slug);
  const activePage = page && page.status === "Published" ? page : null;

  const title = activePage?.title?.trim() ? brandTitle(activePage.title.trim()) : base.title;
  const description = activePage?.metaDesc?.trim() || base.description || "";
  const canonicalRaw = activePage?.canonicalUrl?.trim() || base.alternates?.canonical;
  const canonicalPath =
    typeof canonicalRaw === "string" && canonicalRaw
      ? canonicalRaw
      : slug.startsWith("/")
      ? slug
      : `/${slug}`;
  const ogTitle =
    activePage?.title?.trim() ||
    (typeof base.openGraph?.title === "string" ? base.openGraph.title : extractBaseTitle(base.title));
  const ogImage =
    activePage?.featuredImage?.trim() || extractBaseImage(base.openGraph?.images) || "/logo-png.jpg";
  const keywords = activePage?.keywords?.length
    ? activePage.keywords
    : activePage?.focusKeyword
    ? [activePage.focusKeyword]
    : base.keywords;

  const social = buildSocialMetadata({
    title: ogTitle,
    description,
    url: canonicalPath,
    image: ogImage,
    imageAlt: ogTitle,
    type: "website",
  });

  return {
    ...base,
    title,
    description,
    keywords,
    alternates: { ...base.alternates, canonical: canonicalRaw ?? canonicalPath },
    ...social,
  };
}
