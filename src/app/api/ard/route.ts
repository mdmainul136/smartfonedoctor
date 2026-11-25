import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";
const DOMAIN_HOST = (() => {
  try {
    return new URL(BASE_URL).hostname;
  } catch {
    return "smartfonedoctor.com";
  }
})();

/**
 * Agentic Resource Discovery (ARD v0.91) catalog manifest.
 * Exposed publicly at `/.well-known/ard.json` via next.config.mjs rewrite.
 */
export async function GET() {
  const manifest = {
    specVersion: "0.91",
    entries: [
      {
        identifier: `urn:air:${DOMAIN_HOST}:mcp:repair-concierge`,
        displayName: "SmartFoneDoctor Philadelphia Remote MCP Server",
        type: "application/mcp-server-card+json",
        version: "1.0.0",
        url: `${BASE_URL}/.well-known/mcp/server-card.json`,
        description:
          "Streamable HTTP Model Context Protocol server exposing live store lookup, repair pricing search, ticket status checking, warranty policy, and appointment booking tools.",
        representativeQueries: [
          "connect to SmartFoneDoctor MCP tools for Philadelphia device repair",
          "book an iPhone or PS5 repair via SmartFoneDoctor MCP",
        ],
      },
      {
        identifier: `urn:air:${DOMAIN_HOST}:agent:repair-concierge`,
        displayName: "SmartFoneDoctor Philadelphia A2A Repair Concierge Agent",
        type: "application/a2a-agent-card+json",
        version: "1.0.0",
        url: `${BASE_URL}/.well-known/agent-card.json`,
        description:
          "Agent2Agent (A2A v1.0) concierge answering natural-language repair pricing, Philadelphia location, turnaround, and 90-day warranty requests.",
        representativeQueries: [
          "talk to SmartFoneDoctor agent about PS5 HDMI repair turnaround",
          "ask SmartFoneDoctor Philadelphia agent for store hours near UPenn",
        ],
      },
      {
        identifier: `urn:air:${DOMAIN_HOST}:api:repair-services`,
        displayName: "SmartFoneDoctor Philadelphia Repair & Locations API",
        type: "application/openapi+json",
        version: "1.0.0",
        url: `${BASE_URL}/api/openapi.json`,
        description:
          "OpenAPI 3.1.0 specification for querying smartphone, tablet, MacBook, and console repair estimates and Philadelphia walk-in store locations.",
        representativeQueries: [
          "find iPhone screen repair prices in Philadelphia",
          "where is SmartFoneDoctor located in West Philadelphia",
        ],
      },
      {
        identifier: `urn:air:${DOMAIN_HOST}:docs:llms-index`,
        displayName: "SmartFoneDoctor AI Knowledge Index (llms.txt)",
        type: "text/markdown",
        version: "1.0.0",
        url: `${BASE_URL}/llms.txt`,
        description:
          "Concise machine-readable index of SmartFoneDoctor Philadelphia repair services, store addresses, hours, warranties, and AEO ground-truth answers.",
        representativeQueries: [
          "SmartFoneDoctor Philadelphia store hours and warranty",
          "what devices does SmartFoneDoctor repair",
        ],
      },
      {
        identifier: `urn:air:${DOMAIN_HOST}:docs:llms-full`,
        displayName: "SmartFoneDoctor Full Markdown Catalog (llms-full.txt)",
        type: "text/markdown",
        version: "1.0.0",
        url: `${BASE_URL}/llms-full.txt`,
        description:
          "Complete Markdown catalog of devices, repair procedures, common issues, and Philadelphia neighborhood coverage.",
        representativeQueries: [
          "complete list of phone and console repairs at SmartFoneDoctor",
          "SmartFoneDoctor Philadelphia neighborhood service areas",
        ],
      },
    ],
  };

  return new NextResponse(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
