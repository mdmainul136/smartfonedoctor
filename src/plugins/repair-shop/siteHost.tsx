"use client";

import NextLink from "next/link";
import RepairTrackerWidget from "@/components/site/RepairTrackerWidget";
import ScheduleRepairWizard from "@/components/booking/ScheduleRepairWizard";
import { setBuilderHost } from "@/puck/host";
import { SITE_SECTIONS } from "@/puck/render/generated/siteSections.render";
import { GlobalBlockView, getGlobalBlockOptions } from "@/components/site/GlobalBlocks";

/**
 * What the public site needs to render builder pages: Next.js links, the app
 * widgets and the coded site sections. No editor code (media library, AI,
 * field definitions); the admin editor adds those in builderHost.tsx.
 */
setBuilderHost({
  Link: NextLink,
  widgets: {
    RepairTracker: RepairTrackerWidget,
    BookingWizard: ScheduleRepairWizard,
    sections: SITE_SECTIONS,
    GlobalBlock: GlobalBlockView,
    getGlobalBlockOptions,
  },
});
