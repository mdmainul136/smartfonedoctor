import React, { Suspense } from "react";
import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import ScheduleRepairWizard, { WizardStore } from "@/components/booking/ScheduleRepairWizard";
import { getStoreBranchesAction } from "@/actions/settings";

export const metadata: Metadata = {
  title: "Schedule a Repair | SmartFoneDoctor Philadelphia",
  description:
    "Schedule your phone, tablet, computer, or gaming console repair online. Instant quote, certified technicians, and reserved bench time at our Philadelphia locations.",
};

export default async function ScheduleRepairPage() {
  const branchesRes = await getStoreBranchesAction();
  const branches = branchesRes?.success && branchesRes.data ? branchesRes.data : [];

  const initialStores: WizardStore[] | undefined =
    branches.length > 0
      ? branches.map((b, idx) => ({
          id: typeof b.id === "number" ? b.id : idx + 1,
          name: b.name,
          address: `${b.address}, ${b.cityStateZip || "Philadelphia, PA 19139"}, United States`,
          phone: b.phone.replace(/[^0-9]/g, ""),
          displayPhone: b.phone,
        }))
      : undefined;

  return (
    <main>
      <CMSSectionRenderer slug="schedule-repair">
        <Suspense fallback={<div className="p-10 text-center text-neutral-500 text-sm">Loading repair request...</div>}>
          <ScheduleRepairWizard initialStores={initialStores} />
        </Suspense>
      </CMSSectionRenderer>
      <Footer />
    </main>
  );
}
