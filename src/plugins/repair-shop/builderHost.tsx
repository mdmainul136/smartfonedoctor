"use client";

import "./siteHost";
import MediaModal from "@/components/admin/MediaModal";
import { getStoredAiSettings } from "@/lib/aiSettings";
import { getBuilderHost, setBuilderHost, type MediaPickerProps } from "@/puck/host";
import { SITE_SECTIONS } from "./siteSections";

/**
 * Editor additions on top of the public site host (siteHost.tsx): the media
 * library, the AI keys from Settings and the site sections with their editable
 * fields. Imported by the admin page editor only.
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
  MediaPicker: SiteMediaPicker,
  getAiSettings: getStoredAiSettings,
  aiEndpoint: "/api/admin/puck-ai",
  aiSettingsHref: "/settings",
  widgets: { ...getBuilderHost().widgets, sections: SITE_SECTIONS },
});
