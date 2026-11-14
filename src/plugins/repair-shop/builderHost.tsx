"use client";

import NextLink from "next/link";
import MediaModal from "@/components/admin/MediaModal";
import RepairTrackerWidget from "@/components/site/RepairTrackerWidget";
import ScheduleRepairWizard from "@/components/booking/ScheduleRepairWizard";
import { getStoredAiSettings } from "@/lib/aiSettings";
import { setBuilderHost, type MediaPickerProps } from "@/puck/host";

/**
 * Plugs SmartFone Doctor's app into the page builder: Next.js links, the media
 * library and the AI keys from Settings. Imported once by every place that
 * renders builder pages (the admin editor and the public site).
 */

function SiteMediaPicker({ isOpen, onClose, onSelect, initialUrl }: MediaPickerProps) {
  return (
    <MediaModal
      isOpen={isOpen}
      onClose={onClose}
      initialSelectedUrl={initialUrl}
      onSelect={(payload) => onSelect(payload.url)}
    />
  );
}

setBuilderHost({
  Link: NextLink,
  MediaPicker: SiteMediaPicker,
  getAiSettings: getStoredAiSettings,
  aiEndpoint: "/api/admin/puck-ai",
  aiSettingsHref: "/settings",
  widgets: {
    RepairTracker: RepairTrackerWidget,
    BookingWizard: ScheduleRepairWizard,
  },
});
