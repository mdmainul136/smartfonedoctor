import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "SmartFoneDoctor Philadelphia Agent Discovery API",
      version: "1.0.0",
      description:
        "Public read-only API for AI agents to discover Philadelphia repair store locations, device repair pricing, turnaround times, and knowledge indexes.",
      contact: {
        name: "SmartFoneDoctor Philadelphia",
        url: BASE_URL,
      },
    },
    servers: [{ url: BASE_URL, description: "Production" }],
    paths: {
      "/api/agent/catalog": {
        get: {
          operationId: "queryRepairCatalogOrLocations",
          summary: "Query Philadelphia repair services, estimates, or store locations",
          parameters: [
            {
              name: "type",
              in: "query",
              required: false,
              description: "Pass 'locations' to retrieve active Philadelphia store branches.",
              schema: { type: "string", enum: ["locations"] },
            },
            {
              name: "neighborhood",
              in: "query",
              required: false,
              description: "Filter store locations by Philadelphia neighborhood or ZIP (e.g. 19139, 19104, University City).",
              schema: { type: "string" },
            },
            {
              name: "device",
              in: "query",
              required: false,
              description: "Device brand or model (e.g. iPhone 16 Pro, Galaxy S25, PS5, MacBook).",
              schema: { type: "string" },
            },
            {
              name: "issue",
              in: "query",
              required: false,
              description: "Hardware issue (e.g. screen, battery, HDMI port, water damage).",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Structured repair service options or Philadelphia store locations.",
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
            },
          },
        },
      },
      "/llms.txt": {
        get: {
          operationId: "getLlmsIndex",
          summary: "Get SmartFoneDoctor llms.txt structured Markdown overview",
          responses: {
            "200": {
              description: "Markdown agent guidance index",
              content: { "text/plain": { schema: { type: "string" } } },
            },
          },
        },
      },
    },
  };

  return new NextResponse(JSON.stringify(spec, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/openapi+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
