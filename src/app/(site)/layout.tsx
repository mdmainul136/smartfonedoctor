import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import CookieYesIntegration from "@/components/compliance/CookieYesIntegration";
import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";
import UserWayWidget from "@/components/accessibility/UserWayWidget";
import GmbSchemaJsonLd from "@/components/seo/GmbSchemaJsonLd";
import { getMegaMenuAction, getNavMenuAction } from "@/actions/navMenu";
import { GlobalBlocksProvider } from "@/components/site/GlobalBlocks";
import { getGlobalBlockMap } from "@/lib/globalBlocks";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Header menus from the database (Admin > Navigation & Menus, Mega Menu Builder).
  const [navRes, megaRes, globalBlocks] = await Promise.all([getNavMenuAction(), getMegaMenuAction(), getGlobalBlockMap()]);
  return (
    <>
      <GmbSchemaJsonLd />
      <AnalyticsScripts />
      <TopBar topBar={navRes.menu.topBar} />
      <Navbar nav={navRes.menu} mega={megaRes.menu} />
      <div className="flex-1 flex flex-col">
        <GlobalBlocksProvider blocks={globalBlocks}>{children}</GlobalBlocksProvider>
      </div>
      <UserWayWidget />
      <CookieYesIntegration />
    </>
  );
}
