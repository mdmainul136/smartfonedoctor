import prisma from "@/lib/prisma";
import { GEO_STORES, getGeoStoreByCode } from "@/lib/geoPages";
import { getRepairCatalog } from "@/lib/repairCatalog";

export const AGENT_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

export function mapStoreLocationToId(location?: unknown): number {
  const val = String(location || "").toLowerCase();
  if (val.includes("4016")) return 2;
  if (val.includes("4060")) return 3;
  return 1;
}

export async function getAgentLocations(neighborhood?: string) {
  const query = (neighborhood || "").trim().toLowerCase();
  const dbLocations = await prisma.locations
    .findMany({ where: { is_active: true } })
    .catch(() => []);

  const locations =
    dbLocations.length > 0
      ? dbLocations.map((loc) => {
          const geo = getGeoStoreByCode(loc.store_code);
          return {
            storeId: geo?.storeId ?? 1,
            storeCode: loc.store_code,
            name: geo?.name || loc.name,
            address: `${loc.address}`,
            postalCode: geo?.postalCode || "19139",
            phone: loc.phone || geo?.phone || "+1 (215) 598-2090",
            hours: geo?.hoursDisplay || "Mon–Sat: 10:00 AM – 7:00 PM · Sun: Closed",
            walkInsWelcome: true,
            warrantyDays: 90,
            url: geo ? `${AGENT_BASE_URL}/locations/${geo.slug}` : `${AGENT_BASE_URL}/locations/i/book-repair`,
            bookingUrl: `${AGENT_BASE_URL}/schedule-repair`,
            transitNote: geo?.transitNote || "",
          };
        })
      : GEO_STORES.map((geo) => ({
          storeId: geo.storeId,
          storeCode: geo.storeCode,
          name: geo.name,
          address: `${geo.streetAddress}, ${geo.addressLocality}, ${geo.addressRegion} ${geo.postalCode}`,
          postalCode: geo.postalCode,
          phone: geo.phone,
          hours: geo.hoursDisplay,
          walkInsWelcome: true,
          warrantyDays: 90,
          url: `${AGENT_BASE_URL}/locations/${geo.slug}`,
          bookingUrl: `${AGENT_BASE_URL}/schedule-repair`,
          transitNote: geo.transitNote,
        }));

  const filtered = query
    ? locations.filter((l) =>
        `${l.name} ${l.address} ${l.postalCode} ${l.transitNote}`
          .toLowerCase()
          .includes(query)
      )
    : locations;

  return {
    success: true,
    city: "Philadelphia, PA",
    locations: filtered.length > 0 ? filtered : locations,
  };
}

export async function searchAgentRepairServices(device?: string, issue?: string) {
  const deviceQuery = (device || "").trim().toLowerCase();
  const issueQuery = (issue || "").trim().toLowerCase();
  const catalog = await getRepairCatalog();

  const matchedDevices = (
    deviceQuery
      ? catalog.devices.filter((d) =>
          `${d.name} ${d.brand} ${d.categoryName} ${d.slug}`
            .toLowerCase()
            .includes(deviceQuery)
        )
      : catalog.devices
  ).slice(0, 12);

  const matchedCategories = new Set(matchedDevices.map((d) => d.category));

  const matchedIssues = catalog.issues
    .filter((iss) => {
      if (matchedDevices.length > 0 && !matchedCategories.has(iss.category)) return false;
      if (!issueQuery) return true;
      return `${iss.name} ${iss.shortName} ${iss.slug}`.toLowerCase().includes(issueQuery);
    })
    .slice(0, 16);

  const services = matchedDevices.slice(0, 6).flatMap((dev) => {
    const devIssues = matchedIssues.filter((i) => i.category === dev.category).slice(0, 4);
    return devIssues.map((iss) => ({
      device: dev.name,
      brand: dev.brand,
      category: dev.categoryName,
      issue: iss.name,
      estimatedStartingPrice: `$${iss.basePrice}`,
      oemSpecPrice: `$${Math.round(iss.basePrice * iss.oemPriceMultiplier)}`,
      turnaround: iss.turnaroundDisplay,
      warranty: "90-day parts & labor",
      serviceUrl: `${AGENT_BASE_URL}/repairs/${dev.category}/${dev.slug}/${iss.slug}`,
      bookingUrl: `${AGENT_BASE_URL}/schedule-repair`,
    }));
  });

  return {
    success: true,
    query: { device: deviceQuery || null, issue: issueQuery || null },
    count: services.length,
    services,
    bookingUrl: `${AGENT_BASE_URL}/schedule-repair`,
    walkInPolicy:
      "Free diagnostics and walk-ins welcome Mon–Sat 10 AM – 7 PM at all 3 Philadelphia locations.",
  };
}

export function getAgentWarrantyPolicy() {
  return {
    success: true,
    brand: "SmartFoneDoctor Philadelphia",
    warrantyDays: 90,
    warrantyScope: "Parts and labor coverage on all completed display, battery, charging port, and micro-soldering repairs.",
    diagnosticsFee: "$0 (Free bench diagnostics before work begins)",
    walkInsWelcome: true,
    standardTurnaround: "20 to 45 minutes for standard screens and batteries; same-day to 24h for logic-board micro-soldering.",
    dataPrivacy: "Devices are repaired at hardware level with zero factory resets or customer data erasure.",
    hours: "Mon–Sat: 10:00 AM – 7:00 PM · Sun: Closed",
    phone: "+1 (215) 598-2090",
    warrantyUrl: `${AGENT_BASE_URL}/warranty`,
    bookingUrl: `${AGENT_BASE_URL}/schedule-repair`,
  };
}
