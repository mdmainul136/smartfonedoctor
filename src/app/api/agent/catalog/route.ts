import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRepairCatalog } from "@/lib/repairCatalog";
import { GEO_STORES, getGeoStoreByCode } from "@/lib/geoPages";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=300",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type")?.trim().toLowerCase() || "";
    const neighborhood = req.nextUrl.searchParams.get("neighborhood")?.trim().toLowerCase() || "";
    const deviceQuery = req.nextUrl.searchParams.get("device")?.trim().toLowerCase() || "";
    const issueQuery = req.nextUrl.searchParams.get("issue")?.trim().toLowerCase() || "";

    if (type === "locations") {
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
                url: geo ? `${BASE_URL}/locations/${geo.slug}` : `${BASE_URL}/locations/i/book-repair`,
                bookingUrl: `${BASE_URL}/schedule-repair`,
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
              url: `${BASE_URL}/locations/${geo.slug}`,
              bookingUrl: `${BASE_URL}/schedule-repair`,
              transitNote: geo.transitNote,
            }));

      const filtered = neighborhood
        ? locations.filter((l) =>
            `${l.name} ${l.address} ${l.postalCode} ${l.transitNote}`
              .toLowerCase()
              .includes(neighborhood)
          )
        : locations;

      return NextResponse.json(
        {
          success: true,
          city: "Philadelphia, PA",
          locations: filtered.length > 0 ? filtered : locations,
        },
        { headers: CORS_HEADERS }
      );
    }

    const catalog = await getRepairCatalog();

    const matchedDevices = (
      deviceQuery
        ? catalog.devices.filter((d) =>
            `${d.name} ${d.brand} ${d.categoryName} ${d.slug}`.toLowerCase().includes(deviceQuery)
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
        serviceUrl: `${BASE_URL}/repairs/${dev.category}/${dev.slug}/${iss.slug}`,
        bookingUrl: `${BASE_URL}/schedule-repair`,
      }));
    });

    return NextResponse.json(
      {
        success: true,
        query: { device: deviceQuery || null, issue: issueQuery || null },
        count: services.length,
        services,
        bookingUrl: `${BASE_URL}/schedule-repair`,
        walkInPolicy: "Free diagnostics and walk-ins welcome Mon–Sat 10 AM – 7 PM at all 3 Philadelphia locations.",
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to query repair catalog",
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
