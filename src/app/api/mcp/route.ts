import { NextRequest, NextResponse } from "next/server";
import { lookupRepairTicketAction, submitLeadAction } from "@/actions/leads";
import {
  AGENT_BASE_URL,
  getAgentLocations,
  getAgentWarrantyPolicy,
  mapStoreLocationToId,
  searchAgentRepairServices,
} from "@/lib/agentData";
import {
  checkBookingRateLimit,
  extractClientIp,
  validateBookingPayload,
} from "@/lib/agentSecurity";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id",
};

const MCP_TOOLS = [
  {
    name: "get_store_locations",
    description:
      "Get SmartFoneDoctor's active Philadelphia repair shop locations, street addresses, phone numbers, hours, and transit details.",
    inputSchema: {
      type: "object",
      properties: {
        neighborhood: {
          type: "string",
          description:
            "Optional Philadelphia neighborhood or ZIP code (e.g., West Philadelphia, University City, 19139, 19104).",
        },
      },
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: "search_repair_services",
    description:
      "Search SmartFoneDoctor Philadelphia device repair pricing estimates, turnaround times, warranty coverage, and service booking URLs.",
    inputSchema: {
      type: "object",
      properties: {
        device: {
          type: "string",
          description:
            "Device brand or model to repair (e.g., iPhone 16 Pro, Galaxy S25, PlayStation 5, MacBook Pro).",
        },
        issue: {
          type: "string",
          description:
            "Optional hardware issue or service type (e.g., screen repair, battery replacement, HDMI port, water damage).",
        },
      },
      required: ["device"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: "check_repair_status",
    description:
      "Look up live bench repair status for an existing SmartFoneDoctor ticket by Ticket ID and customer Last Name.",
    inputSchema: {
      type: "object",
      properties: {
        ticketId: {
          type: "string",
          description:
            "Repair ticket ID printed on receipt or confirmation text (e.g., SFD-10001 or SFD-84920).",
        },
        lastName: {
          type: "string",
          description: "Customer last name associated with the repair ticket (e.g., Smith).",
        },
      },
      required: ["ticketId", "lastName"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: "get_warranty_and_walkin_policy",
    description:
      "Get SmartFoneDoctor Philadelphia 90-day warranty terms, free diagnostic policy, walk-in hours, and zero data erasure guarantee.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  {
    name: "schedule_repair_appointment",
    description:
      "Submit a new device repair booking at SmartFoneDoctor Philadelphia and receive a confirmation ticket number.",
    inputSchema: {
      type: "object",
      properties: {
        customerName: {
          type: "string",
          description: "Customer full name for the repair ticket.",
        },
        phone: {
          type: "string",
          description: "Callback or SMS phone number (e.g., 215-555-0199).",
        },
        email: {
          type: "string",
          description: "Optional email address for repair updates.",
        },
        device: {
          type: "string",
          description: "Device make and model needing service (e.g., iPhone 16 Pro, PlayStation 5).",
        },
        issue: {
          type: "string",
          description:
            "Hardware problem description (e.g., cracked screen, HDMI port no signal, battery replacement).",
        },
        storeLocation: {
          type: "string",
          enum: ["52nd-st", "lancaster-4016", "lancaster-4060"],
          description:
            "Preferred Philadelphia branch: 52nd-st (33 S 52nd St), lancaster-4016 (4016 Lancaster Ave), or lancaster-4060 (4060 Lancaster Ave).",
        },
      },
      required: ["customerName", "phone", "device", "issue"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
] as const;

const MCP_RESOURCES = [
  {
    uri: "sfd://philadelphia/stores",
    name: "Philadelphia Store Locations",
    description: "Active SmartFoneDoctor Philadelphia repair shop addresses, hours, and transit info.",
    mimeType: "application/json",
  },
  {
    uri: "sfd://philadelphia/warranty-policy",
    name: "90-Day Warranty & Walk-In Policy",
    description: "Warranty terms, diagnostic policy, data privacy guarantee, and standard turnaround.",
    mimeType: "application/json",
  },
] as const;

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

function rpcOk(id: string | number | null | undefined, result: unknown) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function rpcErr(id: string | number | null | undefined, code: number, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

async function executeMcpTool(name: string, args: Record<string, unknown>, clientIp: string) {
  switch (name) {
    case "get_store_locations": {
      const neighborhood = typeof args.neighborhood === "string" ? args.neighborhood : undefined;
      return { data: await getAgentLocations(neighborhood), isError: false };
    }
    case "search_repair_services": {
      const device = typeof args.device === "string" ? args.device.trim() : "";
      const issue = typeof args.issue === "string" ? args.issue.trim() : undefined;
      if (!device) {
        return { data: { error: "Parameter 'device' is required." }, isError: true };
      }
      return { data: await searchAgentRepairServices(device, issue), isError: false };
    }
    case "check_repair_status": {
      const ticketId = typeof args.ticketId === "string" ? args.ticketId.trim() : "";
      const lastName = typeof args.lastName === "string" ? args.lastName.trim() : "";
      if (!ticketId || !lastName) {
        return { data: { error: "Parameters 'ticketId' and 'lastName' are required." }, isError: true };
      }
      const res = await lookupRepairTicketAction(ticketId, lastName);
      return { data: res, isError: !res.success };
    }
    case "get_warranty_and_walkin_policy": {
      return { data: getAgentWarrantyPolicy(), isError: false };
    }
    case "schedule_repair_appointment": {
      const customerName = typeof args.customerName === "string" ? args.customerName.trim() : "";
      const phone = typeof args.phone === "string" ? args.phone.trim() : "";
      const email = typeof args.email === "string" ? args.email.trim() : undefined;
      const device = typeof args.device === "string" ? args.device.trim() : "";
      const issue = typeof args.issue === "string" ? args.issue.trim() : "";
      if (!customerName || !phone || !device || !issue) {
        return {
          data: { error: "Parameters 'customerName', 'phone', 'device', and 'issue' are required." },
          isError: true,
        };
      }

      const validation = validateBookingPayload({ customerName, phone, email, device, issue });
      if (!validation.valid) {
        return { data: { error: validation.error }, isError: true };
      }

      const rateCheck = checkBookingRateLimit(`mcp:${clientIp}`, 5, 15 * 60 * 1000);
      if (!rateCheck.allowed) {
        return {
          data: {
            error: `Too many booking requests from this IP. Please retry in ${rateCheck.retryAfterSeconds}s or call (215) 598-2090.`,
            retryAfterSeconds: rateCheck.retryAfterSeconds,
          },
          isError: true,
        };
      }

      const res = await submitLeadAction({
        customerName,
        phone: validation.normalizedPhone || phone,
        email,
        device,
        issue,
        storeId: mapStoreLocationToId(args.storeLocation),
        source: "ChatGPT / AI",
        notes: "Booked via Remote MCP Server",
      });
      return { data: res, isError: !res.success };
    }
    default:
      return null;
  }
}

async function handleJsonRpc(msg: JsonRpcRequest, clientIp: string) {
  const method = msg.method || "";
  const params = msg.params || {};

  if (method === "notifications/initialized" || method.startsWith("notifications/")) {
    return null;
  }

  if (method === "initialize") {
    return rpcOk(msg.id, {
      protocolVersion: "2025-06-18",
      capabilities: {
        tools: { listChanged: false },
        resources: { listChanged: false },
      },
      serverInfo: {
        name: "smartfonedoctor-philadelphia-mcp",
        title: "SmartFoneDoctor Philadelphia Repair MCP",
        version: "1.0.0",
      },
    });
  }

  if (method === "ping") {
    return rpcOk(msg.id, {});
  }

  if (method === "tools/list") {
    return rpcOk(msg.id, { tools: MCP_TOOLS });
  }

  if (method === "tools/call") {
    const toolName = typeof params.name === "string" ? params.name : "";
    const rawArgs =
      params.arguments && typeof params.arguments === "object"
        ? (params.arguments as Record<string, unknown>)
        : {};
    const outcome = await executeMcpTool(toolName, rawArgs, clientIp);
    if (!outcome) {
      return rpcErr(msg.id, -32601, `Unknown tool: ${toolName}`);
    }
    return rpcOk(msg.id, {
      content: [{ type: "text", text: JSON.stringify(outcome.data, null, 2) }],
      structuredContent: outcome.data,
      isError: outcome.isError,
    });
  }

  if (method === "resources/list") {
    return rpcOk(msg.id, { resources: MCP_RESOURCES });
  }

  if (method === "resources/read") {
    const uri = typeof params.uri === "string" ? params.uri : "";
    if (uri === "sfd://philadelphia/stores") {
      const stores = await getAgentLocations();
      return rpcOk(msg.id, {
        contents: [{ uri, mimeType: "application/json", text: JSON.stringify(stores, null, 2) }],
      });
    }
    if (uri === "sfd://philadelphia/warranty-policy") {
      const policy = getAgentWarrantyPolicy();
      return rpcOk(msg.id, {
        contents: [{ uri, mimeType: "application/json", text: JSON.stringify(policy, null, 2) }],
      });
    }
    return rpcErr(msg.id, -32602, `Resource not found: ${uri}`);
  }

  return rpcErr(msg.id, -32601, `Method not found: ${method}`);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  // Per MCP Streamable HTTP spec, return 405 if a client requests an SSE stream on GET when unsupported.
  if (accept.includes("text/event-stream")) {
    return new NextResponse(
      JSON.stringify({
        error: "SSE streaming over GET is not enabled on this stateless MCP endpoint. Use POST JSON-RPC.",
      }),
      {
        status: 405,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json; charset=utf-8",
          Allow: "POST, OPTIONS",
        },
      }
    );
  }

  return NextResponse.json(
    {
      name: "smartfonedoctor-philadelphia-mcp",
      title: "SmartFoneDoctor Philadelphia Repair MCP Server",
      transport: "streamable-http",
      endpoint: `${AGENT_BASE_URL}/api/mcp`,
      protocolVersions: ["2025-06-18", "2025-03-26"],
      serverCard: `${AGENT_BASE_URL}/.well-known/mcp/server-card.json`,
      toolCount: MCP_TOOLS.length,
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = extractClientIp(req.headers);
    const body: unknown = await req.json();

    if (Array.isArray(body)) {
      const responses = (
        await Promise.all(body.map((item) => handleJsonRpc(item as JsonRpcRequest, clientIp)))
      ).filter((r) => r !== null);
      if (responses.length === 0) {
        return new NextResponse(null, { status: 202, headers: CORS_HEADERS });
      }
      return NextResponse.json(responses, { headers: CORS_HEADERS });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(rpcErr(null, -32600, "Invalid JSON-RPC request"), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const result = await handleJsonRpc(body as JsonRpcRequest, clientIp);
    if (result === null) {
      return new NextResponse(null, { status: 202, headers: CORS_HEADERS });
    }
    return NextResponse.json(result, { headers: CORS_HEADERS });
  } catch {
    return NextResponse.json(rpcErr(null, -32700, "Parse error"), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
}
