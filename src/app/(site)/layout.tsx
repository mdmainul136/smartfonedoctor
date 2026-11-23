import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import CookieYesIntegration from "@/components/compliance/CookieYesIntegration";
import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";
import UserWayWidget from "@/components/accessibility/UserWayWidget";
import GmbSchemaJsonLd from "@/components/seo/GmbSchemaJsonLd";
import { getMegaMenuAction, getNavMenuAction } from "@/actions/navMenu";
import { GlobalBlocksProvider } from "@/components/site/GlobalBlocks";
import { getGlobalBlockMap } from "@/lib/globalBlocks";
import prisma from "@/lib/prisma";
import {
  DEFAULT_SITE_BRAND,
  SiteBrandProvider,
  type SiteBrandSettings,
} from "@/components/site/SiteBrandContext";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Header menus, global brand SEO settings, and analytics tracking loaded on the server from DB.
  const [navRes, megaRes, globalBlocks, seoSettings, analyticsSettings] = await Promise.all([
    getNavMenuAction(),
    getMegaMenuAction(),
    getGlobalBlockMap(),
    prisma.siteSeoSettings
      .findUnique({ where: { id: "global_seo_settings" } })
      .catch(() => null),
    prisma.appSystemSettings
      .findUnique({
        where: { id: "global_config" },
        select: {
          gtmContainerId: true,
          ga4MeasurementId: true,
          metaPixelId: true,
          clarityProjectId: true,
          enableDataLayer: true,
          enableDebugEvents: true,
        },
      })
      .catch(() => null),
  ]);

  const brand: SiteBrandSettings = {
    siteName: seoSettings?.siteName ?? DEFAULT_SITE_BRAND.siteName,
    twitterHandle: seoSettings?.twitterHandle ?? DEFAULT_SITE_BRAND.twitterHandle,
    facebookUrl: seoSettings?.facebookUrl ?? DEFAULT_SITE_BRAND.facebookUrl,
    instagramUrl: seoSettings?.instagramUrl ?? DEFAULT_SITE_BRAND.instagramUrl,
    youtubeUrl: seoSettings?.youtubeUrl ?? DEFAULT_SITE_BRAND.youtubeUrl,
    googleMapsUrl: seoSettings?.gmbUrl ?? DEFAULT_SITE_BRAND.googleMapsUrl,
    contactEmail: seoSettings?.contactEmail ?? DEFAULT_SITE_BRAND.contactEmail,
    contactPhone: seoSettings?.contactPhone ?? DEFAULT_SITE_BRAND.contactPhone,
    streetAddress: seoSettings?.streetAddress ?? DEFAULT_SITE_BRAND.streetAddress,
    cityStateZip: seoSettings?.cityStateZip ?? DEFAULT_SITE_BRAND.cityStateZip,
    businessHours: seoSettings?.businessHours ?? DEFAULT_SITE_BRAND.businessHours,
  };

  return (
    <SiteBrandProvider value={brand}>
      <GmbSchemaJsonLd />
      <AnalyticsScripts config={analyticsSettings ?? undefined} />
      <TopBar topBar={navRes.menu.topBar} />
      <Navbar nav={navRes.menu} mega={megaRes.menu} />
      <div className="flex-1 flex flex-col">
        <GlobalBlocksProvider blocks={globalBlocks}>{children}</GlobalBlocksProvider>
      </div>
      <UserWayWidget />
      <CookieYesIntegration />
    </SiteBrandProvider>
  );
}
