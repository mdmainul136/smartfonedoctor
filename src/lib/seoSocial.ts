import type { Metadata } from "next";
import { SITE_URL } from "@/lib/schema";

export interface SocialMetadataInput {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
  siteName?: string;
  twitterHandle?: string;
  publishedTime?: string;
  authors?: string[];
}

export function toAbsoluteUrl(urlOrPath: string): string {
  const clean = urlOrPath.trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  const normalized = clean.startsWith("/") ? clean : `/${clean}`;
  return `${SITE_URL.replace(/\/+$/, "")}${normalized}`;
}

export function buildSocialMetadata(
  input: SocialMetadataInput
): Pick<Metadata, "openGraph" | "twitter"> {
  const siteName = input.siteName || "SmartFoneDoctor";
  const twitterHandle = input.twitterHandle || "@smartfonedoctor";
  const absoluteUrl = toAbsoluteUrl(input.url);
  const imageUrl = input.image?.trim() || "/logo-png.jpg";
  const imageAlt = input.imageAlt || input.title;
  const type = input.type || "website";

  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          title: input.title,
          description: input.description,
          url: absoluteUrl,
          siteName,
          type: "article",
          locale: "en_US",
          ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
          ...(input.authors?.length ? { authors: input.authors } : {}),
          images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
        }
      : {
          title: input.title,
          description: input.description,
          url: absoluteUrl,
          siteName,
          type: "website",
          locale: "en_US",
          images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }],
        };

  return {
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      site: twitterHandle,
      creator: twitterHandle,
      images: [imageUrl],
    },
  };
}
