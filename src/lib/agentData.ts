import prisma from "@/lib/prisma";
import { GEO_STORES, getGeoStoreByCode } from "@/lib/geoPages";
import { getRepairCatalog } from "@/lib/repairCatalog";

export const AGENT_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

export type PublicStoreCode = "52nd-st" | "lancaster-4016" | "lancaster-4060";

/** Normalizes internal Prisma enum values (e.g. `nd_st`) to canonical public store codes matching booking enums. */
export function normalizePublicStoreCode(rawCode?: string | null): PublicStoreCode {
  const val = String(rawCode || "").trim().toLowerCase();
  if (val.includes("4016")) return "lancaster-4016";
  if (val.includes("4060")) return "lancaster-4060";
  return "52nd-st";
}

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
            storeCode: normalizePublicStoreCode(loc.store_code),
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
          storeCode: normalizePublicStoreCode(geo.storeCode),
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

const DEVICE_QUERY_ALIASES: Record<string, string> = {
  ps5: "playstation 5",
  ps4: "playstation 4",
  mbp: "macbook pro",
  mba: "macbook air",
  xbx: "xbox series x",
  xbsx: "xbox series x",
  switch: "nintendo switch",
};

const QUERY_FILLER_TOKENS = new Set([
  "repair",
  "fix",
  "replacement",
  "service",
  "philadelphia",
  "philly",
  "screen",
  "battery",
  "hdmi",
  "port",
  "charging",
]);

function normalizeDeviceQueryVariants(raw: string): string[] {
  const clean = raw.trim().toLowerCase();
  if (!clean) return [];
  const expanded = clean
    .split(/\s+/)
    .map((tok) => DEVICE_QUERY_ALIASES[tok] || tok)
    .join(" ");
  return Array.from(new Set([clean, expanded]));
}

export async function searchAgentRepairServices(device?: string, issue?: string) {
  const deviceQuery = (device || "").trim().toLowerCase();
  const issueQuery = (issue || "").trim().toLowerCase();
  const catalog = await getRepairCatalog();

  const deviceVariants = normalizeDeviceQueryVariants(deviceQuery);
  const deviceTokens = deviceVariants
    .flatMap((v) => v.split(/\s+/))
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !QUERY_FILLER_TOKENS.has(t));

  const matchedDevices = (
    deviceQuery
      ? catalog.devices.filter((d) => {
          const hay = `${d.name} ${d.brand} ${d.categoryName} ${d.slug}`.toLowerCase();
          if (deviceVariants.some((v) => hay.includes(v))) return true;
          return deviceTokens.length > 0 && deviceTokens.every((t) => hay.includes(t));
        })
      : catalog.devices
  ).slice(0, 12);

  const matchedCategories = new Set(matchedDevices.map((d) => d.category));
  const issueTokens = issueQuery
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  const matchedIssues = catalog.issues
    .filter((iss) => {
      if (matchedDevices.length > 0 && !matchedCategories.has(iss.category)) return false;
      if (!issueQuery) return true;
      const hay = `${iss.name} ${iss.shortName} ${iss.slug} ${iss.symptoms.join(" ")}`.toLowerCase();
      if (hay.includes(issueQuery)) return true;
      return issueTokens.length > 0 && issueTokens.some((t) => hay.includes(t));
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
