import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const revalidate = 3600; // 1 hour dynamic revalidation

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let enableAiBots = true;

  try {
    const settings = await prisma.siteSeoSettings.findUnique({
      where: { id: "global_seo_settings" },
      select: { enableAiBots: true, enableRobotsTxt: true },
    });

    if (settings && settings.enableAiBots !== undefined) {
      enableAiBots = settings.enableAiBots;
    }
  } catch (error) {
    console.error("Failed to fetch robots SEO settings:", error);
  }

  const aiRules: MetadataRoute.Robots["rules"] = enableAiBots
    ? [
        {
          userAgent: [
            "GPTBot",
            "ChatGPT-User",
            "PerplexityBot",
            "ClaudeBot",
            "Claude-Web",
            "Google-Extended",
            "Applebot-Extended",
          ],
          allow: ["/", "/blog", "/repairs", "/locations"],
          disallow: ["/admin/", "/api/admin/", "/list/"],
        },
      ]
    : [
        {
          userAgent: [
            "GPTBot",
            "ChatGPT-User",
            "PerplexityBot",
            "ClaudeBot",
            "Claude-Web",
            "Google-Extended",
            "Applebot-Extended",
          ],
          disallow: ["/"],
        },
      ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/admin/", "/list/"],
      },
      ...aiRules,
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
