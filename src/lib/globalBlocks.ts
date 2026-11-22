// Server-side only: published global blocks (cms_pages rows in the "Global"
// category, edited in the page builder), keyed by slug.
import { cache } from "react";
import prisma from "@/lib/prisma";
import type { GlobalBlockMap } from "@/components/site/GlobalBlocks";

export const GLOBAL_CATEGORY = "Global";

async function load(includeDrafts: boolean): Promise<GlobalBlockMap> {
  try {
    const rows = await prisma.cmsPage.findMany({
      where: { category: GLOBAL_CATEGORY, ...(includeDrafts ? {} : { status: "Published" }) },
      select: { slug: true, name: true, puckData: true },
    });
    const map: GlobalBlockMap = {};
    for (const r of rows) {
      const content = (r.puckData as { content?: unknown[] } | null)?.content;
      map[r.slug] = { name: r.name, content: Array.isArray(content) ? content : [] };
    }
    return map;
  } catch (err) {
    console.error("[getGlobalBlockMap]", err);
    return {};
  }
}

/** Published global blocks, cached per request. */
export const getGlobalBlockMap = cache(() => load(false));
/** All global blocks incl. unpublished ones (editor canvas). */
export const getAllGlobalBlockMap = () => load(true);
