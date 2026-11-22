// Server-side: which builder layout a dynamic page uses (WordPress-style).
import { getCmsPage } from "@/actions/cmsPages";
import { templateSlug } from "@/lib/cmsTemplates";
import type { CMSPage } from "@/lib/cmsData";

/** A published CMS page that has a builder layout. */
export function usableLayout(page: CMSPage | null): page is CMSPage {
  const blocks = (page?.puckData as { content?: unknown[] } | undefined)?.content;
  return Boolean(page && page.status === "Published" && Array.isArray(blocks) && blocks.length > 0);
}

/** This URL's own published page, else the type's template, else null (built-in design). */
export async function pickLayout(path: string, type: string): Promise<{ page: CMSPage } | null> {
  const [override, template] = await Promise.all([getCmsPage(path), getCmsPage(templateSlug(type))]);
  const page =
    usableLayout(override) && override.category !== "Template" ? override : usableLayout(template) ? template : null;
  if (!page) return null;
  return { page };
}
