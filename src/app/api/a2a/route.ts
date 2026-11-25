import { NextRequest, NextResponse } from "next/server";
import {
  AGENT_BASE_URL,
  getAgentLocations,
  getAgentWarrantyPolicy,
  searchAgentRepairServices,
} from "@/lib/agentData";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface A2aPart {
  kind?: string;
  type?: string;
  text?: string;
}

interface A2aRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: {
    id?: string;
    message?: {
      parts?: A2aPart[];
    };
  };
}

function extractUserText(parts?: A2aPart[]): string {
  if (!Array.isArray(parts)) return "";
  return parts
    .map((p) => (typeof p.text === "string" ? p.text : ""))
    .join(" ")
    .trim();
}

function detectDeviceAndIssue(query: string): { device: string; issue: string } {
  const q = query.toLowerCase();
  const deviceHints = [
    "iphone 16",
    "iphone 15",
    "iphone 14",
    "iphone",
    "samsung",
    "galaxy",
    "pixel",
    "ipad",
    "macbook",
    "ps5",
    "playstation",
    "xbox",
    "switch",
  ];
  const issueHints = [
    "hdmi",
    "screen",
    "battery",
    "charging",
    "back glass",
    "water",
    "liquid",
    "speaker",
  ];

  const device = deviceHints.find((d) => q.includes(d)) || "";
  const issue = issueHints.find((i) => q.includes(i)) || "";
  return { device, issue };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json(
    {
      name: "SmartFoneDoctor Philadelphia A2A Endpoint",
      protocol: "A2A",
      version: "1.0",
      agentCard: `${AGENT_BASE_URL}/.well-known/agent-card.json`,
      supportedMethods: ["message/send", "tasks/send"],
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as A2aRequest;
    const method = body?.method || "";

    if (method !== "message/send" && method !== "tasks/send") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: body?.id ?? null,
          error: { code: -32601, message: `Unsupported A2A method: ${method}` },
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const prompt = extractUserText(body.params?.message?.parts);
    const lower = prompt.toLowerCase();

    let summaryText = "";
    let structuredData: unknown = null;

    if (/\b(location|store|address|hour|where|philly|philadelphia|52nd|lancaster|drexel|upenn)\b/i.test(lower)) {
      const locs = await getAgentLocations();
      structuredData = locs;
      summaryText = `SmartFoneDoctor operates 3 Philadelphia walk-in repair shops (Mon–Sat 10 AM – 7 PM): ${locs.locations
        .map((l) => `${l.name} — ${l.address} (${l.phone})`)
        .join("; ")}. Book online at ${AGENT_BASE_URL}/schedule-repair.`;
    } else if (/\b(warranty|guarantee|data|erase|wipe|diagnostic|appointment|walk-in|walk in)\b/i.test(lower)) {
      const policy = getAgentWarrantyPolicy();
      structuredData = policy;
      summaryText = `${policy.brand}: ${policy.warrantyDays}-day parts & labor warranty, ${policy.diagnosticsFee}, ${policy.dataPrivacy} Walk-ins welcome ${policy.hours}.`;
    } else {
      const { device, issue } = detectDeviceAndIssue(prompt);
      const catalogRes = await searchAgentRepairServices(device || undefined, issue || undefined);
      structuredData = catalogRes;
      const top = catalogRes.services.slice(0, 4);
      summaryText =
        top.length > 0
          ? `Found ${catalogRes.count} repair options at SmartFoneDoctor Philadelphia: ${top
              .map((s) => `${s.device} ${s.issue} (from ${s.estimatedStartingPrice}, ${s.turnaround})`)
              .join("; ")}. Book at ${AGENT_BASE_URL}/schedule-repair.`
          : `SmartFoneDoctor Philadelphia repairs iPhones, Samsung Galaxy, iPads, MacBooks, and PS5/Xbox/Switch consoles with 90-day warranties. View all services at ${AGENT_BASE_URL}/repairs or book at ${AGENT_BASE_URL}/schedule-repair.`;
    }

    const taskId = body.params?.id || `sfd-task-${Date.now()}`;
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: body.id ?? null,
        result: {
          id: taskId,
          status: {
            state: "completed",
            timestamp: new Date().toISOString(),
          },
          artifacts: [
            {
              artifactId: `${taskId}-response`,
              parts: [
                { kind: "text", text: summaryText },
                { kind: "data", data: structuredData },
              ],
            },
          ],
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Invalid JSON-RPC payload" },
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}
