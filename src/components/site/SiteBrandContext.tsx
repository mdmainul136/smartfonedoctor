"use client";

import React, { createContext, useContext } from "react";

export interface SiteBrandSettings {
  siteName: string;
  twitterHandle: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  googleMapsUrl: string;
  contactEmail: string;
  contactPhone: string;
  streetAddress: string;
  cityStateZip: string;
  businessHours: string;
}

export const DEFAULT_SITE_BRAND: SiteBrandSettings = {
  siteName: "SmartFoneDoctor",
  twitterHandle: "@smartfonedoctor",
  facebookUrl: "https://facebook.com/smartfonedoctor",
  instagramUrl: "https://instagram.com/smartfonedoctor",
  youtubeUrl: "",
  googleMapsUrl: "https://share.google/gTlyWLewR88ToAdJQ",
  contactEmail: "contact@smartfonedoctor.com",
  contactPhone: "+1 (215) 598-2090",
  streetAddress: "33 S 52nd St",
  cityStateZip: "Philadelphia, PA 19139",
  businessHours: "Mon–Sat: 10:00 AM – 7:00 PM",
};

/** Converts an @handle or URL into a clean X/Twitter profile URL. */
export function twitterHandleToUrl(handle?: string | null): string | null {
  const raw = (handle ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const clean = raw.replace(/^@+/, "");
  return clean ? `https://x.com/${clean}` : null;
}

/** Normalizes a Twitter/X handle or profile URL to `@handle` for meta tags. */
export function normalizeTwitterHandle(raw?: string | null): string | undefined {
  const value = (raw ?? "").trim();
  if (!value) return undefined;
  const urlMatch = value.match(/(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/i);
  if (urlMatch?.[1]) return `@${urlMatch[1]}`;
  return value.startsWith("@") ? value : `@${value}`;
}

const SiteBrandContext = createContext<SiteBrandSettings>(DEFAULT_SITE_BRAND);

export function SiteBrandProvider({
  value,
  children,
}: {
  value: SiteBrandSettings;
  children: React.ReactNode;
}) {
  return (
    <SiteBrandContext.Provider value={value}>{children}</SiteBrandContext.Provider>
  );
}

export function useSiteBrand(): SiteBrandSettings {
  return useContext(SiteBrandContext);
}
