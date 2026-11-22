"use client";

import { StoreLocator } from "@/components/locator/StoreLocator";
import type { MapStore } from "@/components/locator/InteractiveMap";
import { useRouteData } from "@/components/site/RouteDataContext";

export type LocationsRouteData = { stores: MapStore[] };

/** Data block: the store finder with map (stores from Settings), as the page's H1 section. */
export function LocationsSection({ title, subtitle }: { title?: string; subtitle?: string }) {
  const data = useRouteData<LocationsRouteData>("locations");
  return (
    <StoreLocator
      initialStores={data?.stores}
      title={title && title.trim() ? title : undefined}
      subtitle={subtitle && subtitle.trim() ? subtitle : undefined}
    />
  );
}
