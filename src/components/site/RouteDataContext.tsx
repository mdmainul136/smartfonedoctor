"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * The record a dynamic page is showing (a blog post, a device, an issue...).
 * Type templates are built once in the page builder; their data blocks read the
 * current record from here, like a WordPress theme template reads the post.
 */
export type RouteData = { type: string; data: Record<string, unknown> };

const RouteDataContext = createContext<RouteData | null>(null);

export function RouteDataProvider({ value, children }: { value: RouteData | null; children: ReactNode }) {
  return <RouteDataContext.Provider value={value}>{children}</RouteDataContext.Provider>;
}

/** The current record, or null outside a dynamic page (or before the editor picked a sample). */
export function useRouteData<T = Record<string, unknown>>(type: string): T | null {
  const value = useContext(RouteDataContext);
  return value && value.type === type ? (value.data as T) : null;
}
