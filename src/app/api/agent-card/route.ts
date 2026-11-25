import { NextResponse } from "next/server";
import { AGENT_BASE_URL } from "@/lib/agentData";

export const dynamic = "force-dynamic";

/**
 * A2A v1.0 Agent Card exposed at `/.well-known/agent-card.json` and `/.well-known/agent.json`.
 */
export async function GET() {
  const agentCard = {
    name: "SmartFoneDoctor Philadelphia Repair Concierge",
    description:
      "Autonomous repair service concierge for SmartFoneDoctor in Philadelphia, PA. Provides real-time device repair pricing, turnaround times, store locations, warranty details, and ticket status lookup.",
    version: "1.0.0",
    url: `${AGENT_BASE_URL}/api/a2a`,
    provider: {
      organization: "SmartFoneDoctor Philadelphia",
      url: AGENT_BASE_URL,
    },
    supportedInterfaces: [
      {
        url: `${AGENT_BASE_URL}/api/a2a`,
        protocolBinding: "JSONRPC",
        protocolVersion: "1.0",
      },
    ],
    capabilities: {
      streaming: false,
      pushNotifications: false,
      extendedAgentCard: false,
    },
    defaultInputModes: ["text/plain", "application/json"],
    defaultOutputModes: ["text/plain", "application/json"],
    skills: [
      {
        id: "repair_pricing_search",
        name: "Device Repair Pricing & Turnaround Search",
        description:
          "Searches SmartFoneDoctor's live catalog for iPhone, Samsung Galaxy, iPad, MacBook, and PS5/Xbox/Switch repair estimates and repair URLs.",
        tags: ["repair", "iphone", "ps5", "macbook", "pricing", "philadelphia"],
        examples: [
          "How much does PS5 HDMI port repair cost in Philadelphia?",
          "Estimate iPhone 16 Pro screen replacement turnaround",
        ],
      },
      {
        id: "philadelphia_store_locator",
        name: "Philadelphia Store Locator",
        description:
          "Returns SmartFoneDoctor's active West Philadelphia and University City branch addresses, phone numbers, hours, and transit info.",
        tags: ["locations", "west-philadelphia", "university-city", "19139", "19104"],
        examples: [
          "Where is the nearest SmartFoneDoctor near Drexel or UPenn?",
          "What are the hours for 33 S 52nd St?",
        ],
      },
      {
        id: "warranty_and_walkin_info",
        name: "90-Day Warranty & Diagnostic Policy",
        description:
          "Provides verified terms on free diagnostics, zero data wipe, and the 90-day parts & labor warranty.",
        tags: ["warranty", "diagnostics", "walk-in", "privacy"],
        examples: [
          "Do I need an appointment or can I walk in?",
          "Will my phone data be erased during screen repair?",
        ],
      },
      {
        id: "ticket_status_and_booking",
        name: "Repair Ticket Lookup & Appointment Intake",
        description:
          "Directs or processes customer ticket status checks and repair intake bookings via WebMCP and MCP tools.",
        tags: ["booking", "status", "ticket", "appointment"],
        examples: [
          "Check status for ticket SFD-10001",
          "Schedule a walk-in battery replacement",
        ],
      },
    ],
  };

  return new NextResponse(JSON.stringify(agentCard, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/a2a-agent-card+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
