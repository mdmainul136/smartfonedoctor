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
      <AnalyticsScripts />
      <TopBar />
      <Navbar />
      <div className="flex-1 flex flex-col">{children}</div>
      <UserWayWidget />
      <CookieYesIntegration />
    </>
  );
}
