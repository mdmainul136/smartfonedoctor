import { NextResponse } from "next/server";
import { AGENT_BASE_URL } from "@/lib/agentData";

export const dynamic = "force-dynamic";

/**
 * MCP Server Card (SEP-2127 static metadata) served at `/.well-known/mcp/server-card.json`.
 */
export async function GET() {
  const card = {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: "com.smartfonedoctor/repair-concierge",
    title: "SmartFoneDoctor Philadelphia Repair MCP Server",
    version: "1.0.0",
    description:
      "Remote Model Context Protocol server for SmartFoneDoctor Philadelphia — query same-day phone, MacBook, and console repair pricing, store locations, live ticket status, and book appointments.",
    remotes: [
      {
        type: "streamable-http",
        url: `${AGENT_BASE_URL}/api/mcp`,
        supportedProtocolVersions: ["2025-06-18", "2025-03-26"],
      },
    ],
  };

  return new NextResponse(JSON.stringify(card, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/mcp-server-card+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
