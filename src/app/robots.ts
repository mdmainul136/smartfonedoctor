import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { buildRobotsOutput } from "@/lib/seoCrawlerConfig";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let enableRobotsTxt = true;
  let enableAiBots = true;
  let enableAiTrainingBots = true;
  let enableSitemap = true;
  let robotsAllowPaths: string[] = [];
  let robotsDisallowPaths: string[] = ["/list/", "/profile/"];
  let robotsCustomRules: string | null = null;

  try {
    const settings = await prisma.siteSeoSettings.findUnique({
      where: { id: "global_seo_settings" },
      select: {
        enableRobotsTxt: true,
        enableAiBots: true,
        enableAiTrainingBots: true,
        enableSitemap: true,
        robotsAllowPaths: true,
        robotsDisallowPaths: true,
        robotsCustomRules: true,
      },
    });

    if (settings) {
      enableRobotsTxt = settings.enableRobotsTxt;
      enableAiBots = settings.enableAiBots;
      enableAiTrainingBots = settings.enableAiTrainingBots;
      enableSitemap = settings.enableSitemap;
      robotsAllowPaths = settings.robotsAllowPaths ?? [];
      robotsDisallowPaths = settings.robotsDisallowPaths ?? ["/list/", "/profile/"];
      robotsCustomRules = settings.robotsCustomRules ?? null;
    }
  } catch (error) {
    console.error("Failed to fetch robots SEO settings:", error);
  }

  return buildRobotsOutput(
    {
      enableRobotsTxt,
      enableAiBots,
      enableAiTrainingBots,
      enableSitemap,
      robotsAllowPaths,
      robotsDisallowPaths,
      robotsCustomRules,
    },
    BASE_URL
  ).metadataRobots;
}
