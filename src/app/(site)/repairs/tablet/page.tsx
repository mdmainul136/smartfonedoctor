import type { Metadata } from "next";
import TabletRepairClient from "./TabletRepairClient";

export const metadata: Metadata = {
  title: "Tablet Repair in Philadelphia | iPad, Galaxy Tab & Surface",
  description:
    "Fast tablet repair in Philadelphia for iPad, Samsung Galaxy Tab, Google Pixel Tablet and Microsoft Surface. Screen, battery, charging port and water damage repairs with a 90-day warranty.",
  alternates: { canonical: "/repairs/tablet" },
};

export default function TabletRepairPage() {
  return <TabletRepairClient />;
}
