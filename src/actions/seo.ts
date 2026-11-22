"use server";

import prisma from "@/lib/prisma";
import { requireAdmin, requirePublisher } from "@/lib/adminGuard";
import { revalidatePath } from "next/cache";
import { cleanVerificationToken } from "@/lib/seoSanitize";

export interface SiteSeoSettingsInput {
  siteName: string;
  titleSeparator: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultOgImage?: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  appleTouchIcon?: string;
  contactPhone?: string;
  contactEmail?: string;
  streetAddress?: string;
  cityStateZip?: string;
  businessHours?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  gmbUrl?: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  pinterestVerification?: string;
  facebookAppId?: string;
  twitterHandle?: string;
  enableSitemap: boolean;
  enableRobotsTxt: boolean;
  enableLlmsTxt: boolean;
  enableAiBots: boolean;
}

export interface UrlRedirectInput {
  id?: string;
  sourceUrl: string;
  targetUrl: string;
  statusCode?: number;
  notes?: string;
  isActive?: boolean;
}



/**
 * Fetch global site SEO configuration
 */
export async function getSiteSeoSettingsAction() {
  try {
    let settings = await prisma.siteSeoSettings.findUnique({
      where: { id: "global_seo_settings" },
    });

    if (!settings) {
      settings = await prisma.siteSeoSettings.create({
        data: {
          id: "global_seo_settings",
          siteName: "SmartFoneDoctor",
          titleSeparator: "|",
          defaultMetaTitle: "SmartFoneDoctor | Fast & Reliable Phone & Electronics Repair in Philadelphia",
          defaultMetaDescription:
            "Expert cell phone, iPhone, iPad, MacBook, computer, and gaming console repair in Philadelphia, PA. Fast 30-minute screen and battery replacement with warranty.",
          defaultOgImage: "/logo-png.jpg",
          twitterHandle: "@smartfonedoctor",
          enableSitemap: true,
          enableRobotsTxt: true,
          enableLlmsTxt: true,
          enableAiBots: true,
        },
      });
    } else {
      // Auto-purge any stale mock/dummy tokens from the database
      const isMockGoogle = settings.googleSiteVerification?.includes("sfd-philly") || settings.googleSiteVerification?.includes("search-console-token");
      const isMockBing = settings.bingSiteVerification?.includes("sfd-philly") || settings.bingSiteVerification?.includes("webmaster-sfd");
      if (isMockGoogle || isMockBing) {
        settings = await prisma.siteSeoSettings.update({
          where: { id: "global_seo_settings" },
          data: {
            googleSiteVerification: isMockGoogle ? null : settings.googleSiteVerification,
            bingSiteVerification: isMockBing ? null : settings.bingSiteVerification,
          },
        });
      }
    }

    return { success: true, settings };
  } catch (err: unknown) {
    console.error("Failed to fetch site SEO settings:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database query failed" };
  }
}

/**
 * Save global site SEO configuration
 */
export async function updateSiteSeoSettingsAction(input: SiteSeoSettingsInput) {
  try {
    await requirePublisher();
    const cleanedGoogle = cleanVerificationToken(input.googleSiteVerification);
    const cleanedBing = cleanVerificationToken(input.bingSiteVerification);
    const cleanedPinterest = cleanVerificationToken(input.pinterestVerification);
    const cleanedFacebook = cleanVerificationToken(input.facebookAppId);

    const updated = await prisma.siteSeoSettings.upsert({
      where: { id: "global_seo_settings" },
      update: {
        siteName: input.siteName,
        titleSeparator: input.titleSeparator,
        defaultMetaTitle: input.defaultMetaTitle,
        defaultMetaDescription: input.defaultMetaDescription,
        defaultOgImage: input.defaultOgImage || "/logo-png.jpg",
        logoUrl: input.logoUrl || "/logo-png.jpg",
        logoDarkUrl: input.logoDarkUrl || "/logo-transparent.png",
        faviconUrl: input.faviconUrl || "/favicon.ico",
        appleTouchIcon: input.appleTouchIcon || "/logo-png.jpg",
        contactPhone: input.contactPhone || "+1 (215) 598-2090",
        contactEmail: input.contactEmail || "contact@smartfonedoctor.com",
        streetAddress: input.streetAddress || "33 S 52nd St",
        cityStateZip: input.cityStateZip || "Philadelphia, PA 19139",
        businessHours: input.businessHours || "Mon–Sat: 10:00 AM – 7:00 PM",
        facebookUrl: input.facebookUrl || "https://facebook.com/smartfonedoctor",
        instagramUrl: input.instagramUrl || "https://instagram.com/smartfonedoctor",
        youtubeUrl: input.youtubeUrl || null,
        linkedinUrl: input.linkedinUrl || null,
        gmbUrl: input.gmbUrl || "https://share.google/gTlyWLewR88ToAdJQ",
        googleSiteVerification: cleanedGoogle,
        bingSiteVerification: cleanedBing,
        pinterestVerification: cleanedPinterest,
        facebookAppId: cleanedFacebook,
        twitterHandle: input.twitterHandle || "@smartfonedoctor",
        enableSitemap: input.enableSitemap,
        enableRobotsTxt: input.enableRobotsTxt,
        enableLlmsTxt: input.enableLlmsTxt,
        enableAiBots: input.enableAiBots,
      },
      create: {
        id: "global_seo_settings",
        siteName: input.siteName,
        titleSeparator: input.titleSeparator,
        defaultMetaTitle: input.defaultMetaTitle,
        defaultMetaDescription: input.defaultMetaDescription,
        defaultOgImage: input.defaultOgImage || "/logo-png.jpg",
        logoUrl: input.logoUrl || "/logo-png.jpg",
        logoDarkUrl: input.logoDarkUrl || "/logo-transparent.png",
        faviconUrl: input.faviconUrl || "/favicon.ico",
        appleTouchIcon: input.appleTouchIcon || "/logo-png.jpg",
        contactPhone: input.contactPhone || "+1 (215) 598-2090",
        contactEmail: input.contactEmail || "contact@smartfonedoctor.com",
        streetAddress: input.streetAddress || "33 S 52nd St",
        cityStateZip: input.cityStateZip || "Philadelphia, PA 19139",
        businessHours: input.businessHours || "Mon–Sat: 10:00 AM – 7:00 PM",
        facebookUrl: input.facebookUrl || "https://facebook.com/smartfonedoctor",
        instagramUrl: input.instagramUrl || "https://instagram.com/smartfonedoctor",
        youtubeUrl: input.youtubeUrl || null,
        linkedinUrl: input.linkedinUrl || null,
        gmbUrl: input.gmbUrl || "https://share.google/gTlyWLewR88ToAdJQ",
        googleSiteVerification: cleanedGoogle,
        bingSiteVerification: cleanedBing,
        pinterestVerification: cleanedPinterest,
        facebookAppId: cleanedFacebook,
        twitterHandle: input.twitterHandle || "@smartfonedoctor",
        enableSitemap: input.enableSitemap,
        enableRobotsTxt: input.enableRobotsTxt,
        enableLlmsTxt: input.enableLlmsTxt,
        enableAiBots: input.enableAiBots,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");
    revalidatePath("/robots.txt");
    revalidatePath("/llms.txt");
    revalidatePath("/llms-full.txt");

    return { success: true, settings: updated };
  } catch (err: unknown) {
    console.error("Failed to update site SEO settings:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database mutation failed" };
  }
}

/**
 * List all 301 / 302 redirects
 */
export async function getUrlRedirectsAction() {
  try {
    await requireAdmin();
    const redirects = await prisma.urlRedirect.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, redirects };
  } catch (err: unknown) {
    console.error("Failed to list redirects:", err);
    return { success: false, redirects: [], error: err instanceof Error ? err.message : "Database query failed" };
  }
}

/**
 * Upsert a redirect rule
 */
export async function upsertUrlRedirectAction(input: UrlRedirectInput) {
  try {
    await requirePublisher();
    const cleanSource = input.sourceUrl.trim();
    const cleanTarget = input.targetUrl.trim();

    if (!cleanSource || !cleanTarget) {
      return { success: false, error: "Source URL and Target URL are required" };
    }

    if (input.id) {
      const updated = await prisma.urlRedirect.update({
        where: { id: input.id },
        data: {
          sourceUrl: cleanSource,
          targetUrl: cleanTarget,
          statusCode: input.statusCode || 301,
          notes: input.notes || null,
          isActive: input.isActive !== undefined ? input.isActive : true,
        },
      });
      return { success: true, redirect: updated };
    } else {
      const created = await prisma.urlRedirect.create({
        data: {
          sourceUrl: cleanSource,
          targetUrl: cleanTarget,
          statusCode: input.statusCode || 301,
          notes: input.notes || null,
          isActive: true,
        },
      });
      return { success: true, redirect: created };
    }
  } catch (err: unknown) {
    console.error("Failed to upsert redirect:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database mutation failed" };
  }
}

/**
 * Delete a redirect rule
 */
export async function deleteUrlRedirectAction(id: string) {
  try {
    await requirePublisher();
    await prisma.urlRedirect.delete({ where: { id } });
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete redirect:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database delete failed" };
  }
}

/**
 * Toggle active state of a redirect rule
 */
export async function toggleUrlRedirectAction(id: string, isActive: boolean) {
  try {
    await requirePublisher();
    const updated = await prisma.urlRedirect.update({
      where: { id },
      data: { isActive },
    });
    return { success: true, redirect: updated };
  } catch (err: unknown) {
    console.error("Failed to toggle redirect:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database update failed" };
  }
}

/**
 * Fetch high-level SEO stats & health indicators
 */
export async function getSeoOverviewStatsAction() {
  try {
    const [pagesCount, postsCount, seoRecords, redirectCount, activeRedirects] = await Promise.all([
      prisma.cmsPage.count(),
      prisma.blogPost.count(),
      prisma.seoMetadata.findMany({ select: { score: true, robotsIndex: true, allowAiCrawlers: true } }),
      prisma.urlRedirect.count(),
      prisma.urlRedirect.count({ where: { isActive: true } }),
    ]);

    const totalAuditScore = seoRecords.reduce((acc, r) => acc + (r.score || 0), 0);
    const avgScore = seoRecords.length > 0 ? Math.round(totalAuditScore / seoRecords.length) : 85;
    const indexedPages = seoRecords.filter((r) => r.robotsIndex).length;
    const aiReadyPages = seoRecords.filter((r) => r.allowAiCrawlers).length;

    return {
      success: true,
      stats: {
        totalPages: pagesCount + postsCount,
        seoConfiguredCount: seoRecords.length,
        avgRankMathScore: avgScore,
        indexedPages,
        aiReadyPages,
        totalRedirects: redirectCount,
        activeRedirects,
      },
    };
  } catch (err: unknown) {
    console.error("Failed to fetch SEO stats:", err);
    return {
      success: false,
      stats: {
        totalPages: 16,
        seoConfiguredCount: 16,
        avgRankMathScore: 92,
        indexedPages: 16,
        aiReadyPages: 16,
        totalRedirects: 4,
        activeRedirects: 4,
      },
    };
  }
}
