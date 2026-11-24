"use client";

import React, { createContext, useContext } from "react";
import {
  DEFAULT_SITE_BRAND,
  normalizeTwitterHandle,
  twitterHandleToUrl,
  type SiteBrandSettings,
} from "@/lib/siteBrand";

export {
  DEFAULT_SITE_BRAND,
  normalizeTwitterHandle,
  twitterHandleToUrl,
  type SiteBrandSettings,
};

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
