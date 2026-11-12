import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import CookieYesIntegration from "@/components/compliance/CookieYesIntegration";
import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";
import UserWayWidget from "@/components/accessibility/UserWayWidget";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Tracking Scripts (GTM, GA4, Meta Pixel, Microsoft Clarity) */}
      <AnalyticsScripts />

      {/* Global Header */}
      <TopBar />
      <Navbar />

      {/* Main Public Page Content */}
      <div className="flex-1 flex flex-col">{children}</div>

      {/* UserWay Accessibility Floating Widget (Bottom-Left) */}
      <UserWayWidget />

      {/* Official CookieYes / Cookiebot Integration */}
      <CookieYesIntegration />
    </>
  );
}

