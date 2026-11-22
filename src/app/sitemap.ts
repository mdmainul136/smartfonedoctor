import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { listTypeUrls } from "@/lib/themeTypes";
import { GEO_STORES, toNeighborhoodSlug } from "@/lib/geoPages";

export const dynamic = "force-dynamic"; // Generate dynamically from live DB so docker build never caches a 1-URL fallback
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

/**
 * Every indexable page, from the database: CMS pages (incl. category hubs),
 * published blog posts, and the device, repair and common-issue pages built
 * from the catalog. Templates, drafts, redirecting URLs and redirect sources are
 * left out, so every URL listed answers 200.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const added = new Set<string>();
  const add = (path: string, priority: number, changeFrequency: Freq, lastModified?: Date, canonical?: string | null) => {
    const own = `${BASE_URL}${path === "/" ? "" : path}`;
    // A stored canonical is used only when it names this same page (some rows still
    // point at old redirecting addresses such as /track).
    const url = canonical && canonical.replace(/\/+$/, "") === own.replace(/\/+$/, "") ? canonical : own;
    if (added.has(url)) return;
    added.add(url);
    entries.push({ url, priority, changeFrequency, ...(lastModified ? { lastModified } : {}) });
  };

  try {
    const seoSettings = await prisma.siteSeoSettings.findUnique({
      where: { id: "global_seo_settings" },
      select: { enableSitemap: true },
    });
    if (seoSettings && seoSettings.enableSitemap === false) return [];

    // URLs that redirect: active DB redirect rules and the code's alias routes.
    const redirectRules = await prisma.urlRedirect.findMany({ where: { isActive: true }, select: { sourceUrl: true } });
    const skip = new Set<string>([
      ...redirectRules.map((r) => r.sourceUrl),
      "/track",
      "/locations",
      "/repairs/iphone",
      "/repairs/ipad",
      "/repairs/mac",
      "/california-supply-chain-act",
    ]);
    // CMS rows whose path is an alias of the real page.
    const ALIAS: Record<string, string> = { "/track": "/repair-status" };

    // 1. Core pages that are always there.
    add("/", 1.0, "daily");
    for (const p of ["/repairs", "/schedule-repair"]) add(p, 0.9, "weekly");
    add("/blog", 0.8, "daily");
    for (const path of ["/repair-status", "/review", "/faq", "/common-issues", "/warranty", "/locations/i/book-repair"]) add(path, 0.7, "weekly");
    for (const geo of GEO_STORES) add(`/locations/${geo.slug}`, 0.9, "weekly");
    const neighborhoods = await prisma.geoNeighborhood.findMany({ select: { name: true, updatedAt: true } });
    for (const hood of neighborhoods) add(`/locations/areas/${toNeighborhoodSlug(hood.name)}`, 0.8, "weekly", hood.updatedAt);
    add("/about", 0.6, "monthly");

    // 2. Published CMS pages (incl. category hubs and legal pages); not templates.
    const pages = await prisma.cmsPage.findMany({
      where: { status: "Published", NOT: [{ category: "Template" }, { category: "Global" }] },
      include: { seo: true },
      orderBy: { updatedAt: "desc" },
    });
    for (const page of pages) {
      if (page.seo?.robotsIndex === false || page.seo?.includeInSitemap === false) continue;
      const path = ALIAS[page.path] ?? page.path;
      if (skip.has(path) || path.startsWith("/_templates/")) continue;
      const isHub = /^\/repairs\/(smartphone|tablet|computer|console)$/.test(path);
      add(
        path,
        page.seo?.sitemapPriority ? Number(page.seo.sitemapPriority) : path === "/" ? 1.0 : isHub ? 0.9 : 0.6,
        (page.seo?.changeFrequency as Freq) || (isHub ? "weekly" : "monthly"),
        page.updatedAt,
        page.seo?.canonicalUrl
      );
    }

    // 3. Published blog posts.
    const posts = await prisma.blogPost.findMany({
      where: { status: "Published" },
      include: { seo: true },
      orderBy: { updatedAt: "desc" },
    });
    for (const post of posts) {
      if (post.seo?.robotsIndex === false || post.seo?.includeInSitemap === false) continue;
      add(
        `/blog/${post.slug}`,
        post.seo?.sitemapPriority ? Number(post.seo.sitemapPriority) : 0.7,
        (post.seo?.changeFrequency as Freq) || "monthly",
        post.updatedAt,
        post.seo?.canonicalUrl
      );
    }

    // 4. Catalog pages: devices (and service pages), device × repair, common issues.
    const stores = await prisma.taxonomyStore.findMany({
      where: { id: { in: ["catalog-devices", "catalog-repairs", "common-issues"] } },
      select: { id: true, updatedAt: true },
    });
    const updated = (id: string) => stores.find((s) => s.id === id)?.updatedAt;
    for (const path of await listTypeUrls("repair-device")) if (!skip.has(path)) add(path, 0.8, "weekly", updated("catalog-devices"));
    for (const path of await listTypeUrls("repair-issue")) if (!skip.has(path)) add(path, 0.7, "weekly", updated("catalog-repairs"));
    for (const path of await listTypeUrls("common-issue")) if (!skip.has(path)) add(path, 0.6, "monthly", updated("common-issues"));
  } catch (error) {
    console.error("Failed to generate dynamic sitemap:", error);
    if (!entries.length) entries.push({ url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 });
  }

  return entries;
}
