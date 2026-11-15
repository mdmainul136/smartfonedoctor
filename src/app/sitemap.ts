import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const revalidate = 3600; // Revalidate dynamic sitemap every 1 hour

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const addedUrls = new Set<string>();

  try {
    // 1. Fetch CMS Pages from PostgreSQL with attached SEO Metadata
    const pages = await prisma.cmsPage.findMany({
      where: { status: "Published" },
      include: { seo: true },
      orderBy: { updatedAt: "desc" },
    });

    for (const page of pages) {
      // Skip if explicitly marked as noindex or omitted from sitemap
      if (page.seo?.robotsIndex === false || page.seo?.includeInSitemap === false) {
        continue;
      }

      const rawPath = page.path === "/" ? "" : page.path;
      const url = page.seo?.canonicalUrl || `${BASE_URL}${rawPath}`;
      if (addedUrls.has(url)) continue;
      addedUrls.add(url);

      const priority = page.seo?.sitemapPriority
        ? Number(page.seo.sitemapPriority)
        : page.path === "/"
        ? 1.0
        : 0.8;

      const changeFrequency = (page.seo?.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"]) || (page.path === "/" ? "daily" : "weekly");

      entries.push({
        url,
        lastModified: page.updatedAt,
        changeFrequency,
        priority,
      });
    }

    // 2. Fetch Blog Posts from PostgreSQL with attached SEO Metadata
    const posts = await prisma.blogPost.findMany({
      include: { seo: true },
      orderBy: { updatedAt: "desc" },
    });

    for (const post of posts) {
      if (post.seo?.robotsIndex === false || post.seo?.includeInSitemap === false) {
        continue;
      }

      const url = post.seo?.canonicalUrl || `${BASE_URL}/blog/${post.slug}`;
      if (addedUrls.has(url)) continue;
      addedUrls.add(url);

      entries.push({
        url,
        lastModified: post.updatedAt,
        changeFrequency: (post.seo?.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"]) || "monthly",
        priority: post.seo?.sitemapPriority ? Number(post.seo.sitemapPriority) : 0.7,
      });
    }

    // 3. Ensure Core Hub & Flow Pages are present
    const CORE_ROUTES = [
      { path: "/repairs", priority: 0.9, freq: "weekly" as const },
      { path: "/locations", priority: 0.9, freq: "weekly" as const },
      { path: "/schedule-repair", priority: 0.9, freq: "weekly" as const },
      { path: "/repair-status", priority: 0.8, freq: "daily" as const },
      { path: "/blog", priority: 0.9, freq: "daily" as const },
      { path: "/reviews", priority: 0.8, freq: "weekly" as const },
      { path: "/faq", priority: 0.8, freq: "weekly" as const },
      { path: "/about", priority: 0.7, freq: "monthly" as const },
    ];

    for (const route of CORE_ROUTES) {
      const url = `${BASE_URL}${route.path}`;
      if (!addedUrls.has(url)) {
        addedUrls.add(url);
        entries.push({
          url,
          lastModified: new Date(),
          changeFrequency: route.freq,
          priority: route.priority,
        });
      }
    }
  } catch (error) {
    console.error("Failed to generate dynamic sitemap:", error);
    // Safe fallback so sitemap never returns 500 error to search engines
    entries.push({
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    });
  }

  return entries;
}
