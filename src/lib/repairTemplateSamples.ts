// Sample records for previewing the device / repair templates in the editor and
// /preview: the newest device and its first repair type. Client and server safe.
import { buildDeviceModelCMS, buildPSeoPageData, type RepairCatalog } from "@/lib/pSeoEngine";
import type { RouteData } from "@/components/site/RouteDataContext";

export function repairTemplateSample(type: string, catalog: RepairCatalog): { data: RouteData; href: string } | null {
  const devices = [...catalog.devices].sort((a, b) => b.releaseYear - a.releaseYear);
  if (type === "repair-device") {
    const d = devices[0];
    const service = d ? buildDeviceModelCMS(d.category, d.slug, catalog) : null;
    return service && d ? { data: { type, data: { service } }, href: `/repairs/${d.category}/${d.slug}` } : null;
  }
  if (type === "repair-issue") {
    for (const issue of catalog.issues) {
      const d = devices.find((x) => x.category === issue.category);
      if (!d) continue;
      const page = buildPSeoPageData(d.category, d.slug, issue.slug, catalog);
      if (page) return { data: { type, data: { page } }, href: `/repairs/${d.category}/${d.slug}/${issue.slug}` };
    }
  }
  return null;
}
