"use client";

import React, { Suspense } from "react";
import Footer from "@/components/layout/Footer";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import ScheduleRepairWizard from "@/components/booking/ScheduleRepairWizard";

export default function ScheduleRepairPage() {
  return (
    <main>
      <CMSSectionRenderer slug="schedule-repair">
        <Suspense fallback={<div className="p-10 text-center">Loading repair request...</div>}>
          <ScheduleRepairWizard />
        </Suspense>
      </CMSSectionRenderer>
      <Footer />
    </main>
  );
}
