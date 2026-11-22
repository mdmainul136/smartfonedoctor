import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const revalidate = 3600; // 1 hour dynamic revalidation

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let enableRobotsTxt = true;
  let enableAiBots = true;
  let enableSitemap = true;

  try {
    const settings = await prisma.siteSeoSettings.findUnique({
      where: { id: "global_seo_settings" },
      select: {
        enableRobotsTxt: true,
        enableAiBots: true,
        enableSitemap: true,
      },
    });

    if (settings) {
      if (settings.enableRobotsTxt !== undefined) enableRobotsTxt = settings.enableRobotsTxt;
      if (settings.enableAiBots !== undefined) enableAiBots = settings.enableAiBots;
      if (settings.enableSitemap !== undefined) enableSitemap = settings.enableSitemap;
    }
  } catch (error) {
    console.error("Failed to fetch robots SEO settings:", error);
  }

  // If search engine crawling is globally disabled by admin
  if (!enableRobotsTxt) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
      ...(enableSitemap ? { sitemap: `${BASE_URL}/sitemap.xml` } : {}),
      host: BASE_URL,
    };
  }

  const aiBots = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Perplexity-User",
    "ClaudeBot",
    "Claude-Web",
    "Google-Extended",
    "Applebot-Extended",
    "Amazonbot",
    "CCBot",
    "anthropic-ai",
  ];

  const aiRules: MetadataRoute.Robots["rules"] = enableAiBots
    ? [
        {
          userAgent: aiBots,
          allow: [
            "/",
            "/blog",
            "/repairs",
            "/common-issues",
            "/locations",
            "/schedule-repair",
            "/repair-status",
            "/review",
            "/warranty",
            "/faq",
            "/about",
            "/llms.txt",
            "/llms-full.txt",
          ],
          disallow: ["/admin/", "/api/admin/", "/list/", "/profile/"],
        },
      ]
    : [
        {
          userAgent: aiBots,
          disallow: ["/"],
        },
      ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/admin/", "/list/", "/profile/"],
      },
      ...aiRules,
    ],
    ...(enableSitemap ? { sitemap: `${BASE_URL}/sitemap.xml` } : {}),
    host: BASE_URL,
  };
}
