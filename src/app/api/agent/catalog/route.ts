import { NextRequest, NextResponse } from "next/server";
import { getAgentLocations, searchAgentRepairServices } from "@/lib/agentData";

export const dynamic = "force-dynamic";

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
    const neighborhood = req.nextUrl.searchParams.get("neighborhood") || undefined;
    const device = req.nextUrl.searchParams.get("device") || undefined;
    const issue = req.nextUrl.searchParams.get("issue") || undefined;

    if (type === "locations") {
      const data = await getAgentLocations(neighborhood);
      return NextResponse.json(data, { headers: CORS_HEADERS });
    }

    const data = await searchAgentRepairServices(device, issue);
    return NextResponse.json(data, { headers: CORS_HEADERS });
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
