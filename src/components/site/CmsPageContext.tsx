"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CMSPage } from "@/lib/cmsData";

/**
 * Hands a server-loaded CMS page to a client page component. Used by routes whose
 * page.tsx is a client component: their server layout loads the page from Prisma
 * and wraps the route in this provider, and CMSSectionRenderer picks it up.
 */
const CmsPageContext = createContext<CMSPage | null>(null);

export function CmsPageProvider({ page, children }: { page: CMSPage | null; children: ReactNode }) {
  return <CmsPageContext.Provider value={page}>{children}</CmsPageContext.Provider>;
}

export function useProvidedCmsPage(): CMSPage | null {
  return useContext(CmsPageContext);
}
