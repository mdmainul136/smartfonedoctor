import type { Metadata } from "next";

const BRAND_RE = /smart\s*fone\s*doctor/i;

/**
 * Root layout applies a "%s | <siteName>" title template (configured in Admin > SEO).
 * Titles that already contain the brand would end up with it twice, so those are
 * marked `absolute` to skip the template. Titles without the brand still get it.
 */
export function brandTitle(title: string | null | undefined): Metadata["title"] {
  if (!title) return undefined;
  return BRAND_RE.test(title) ? { absolute: title } : title;
}
