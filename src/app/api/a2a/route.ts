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
    name?: string;
    contextId?: string;
    message?: {
      messageId?: string;
      contextId?: string;
      taskId?: string;
      parts?: A2aPart[];
    };
  };
}

interface StoredA2aTask {
  id: string;
  contextId: string;
  timestamp: string;
  summaryText: string;
  structuredData: unknown;
  createdAtMs: number;
}

const TASK_STORE = new Map<string, StoredA2aTask>();
const MAX_STORED_TASKS = 500;
const TASK_TTL_MS = 60 * 60 * 1000;

function saveTask(task: StoredA2aTask) {
  const now = Date.now();
  if (TASK_STORE.size >= MAX_STORED_TASKS) {
    const cutoff = now - TASK_TTL_MS;
    for (const [key, item] of TASK_STORE.entries()) {
      if (item.createdAtMs < cutoff) TASK_STORE.delete(key);
    }
    if (TASK_STORE.size >= MAX_STORED_TASKS) {
      const oldestKey = TASK_STORE.keys().next().value;
      if (oldestKey) TASK_STORE.delete(oldestKey);
    }
  }
  TASK_STORE.set(task.id, task);
}

function getTask(rawId: string): StoredA2aTask | null {
  const cleanId = rawId.trim().replace(/^tasks\//i, "");
  if (!cleanId) return null;
  const found = TASK_STORE.get(cleanId);
  if (!found) return null;
  if (Date.now() - found.createdAtMs > TASK_TTL_MS) {
    TASK_STORE.delete(cleanId);
    return null;
  }
  return found;
}

function formatTaskForVersion(task: StoredA2aTask, isV1: boolean) {
  if (isV1) {
    return {
      id: task.id,
      contextId: task.contextId,
      status: {
        state: "TASK_STATE_COMPLETED",
        timestamp: task.timestamp,
        message: {
          messageId: `${task.id}-msg`,
          role: "ROLE_AGENT",
          parts: [{ text: task.summaryText }],
        },
      },
      artifacts: [
        {
          artifactId: `${task.id}-response`,
          parts: [{ text: task.summaryText }, { data: task.structuredData }],
        },
      ],
    };
  }

  return {
    id: task.id,
    contextId: task.contextId,
    status: {
      state: "completed",
      timestamp: task.timestamp,
      message: {
        messageId: `${task.id}-msg`,
        role: "agent",
        parts: [{ kind: "text", text: task.summaryText }],
      },
    },
    artifacts: [
      {
        artifactId: `${task.id}-response`,
        parts: [
          { kind: "text", text: task.summaryText },
          { kind: "data", data: task.structuredData },
        ],
      },
    ],
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
      supportedMethods: ["SendMessage", "GetTask", "message/send", "tasks/send", "tasks/get"],
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as A2aRequest;
    const method = body?.method || "";

    const isSendV1 = method === "SendMessage";
    const isSendV03 = method === "message/send" || method === "tasks/send";
    const isGetV1 = method === "GetTask";
    const isGetV03 = method === "tasks/get";

    if (isGetV1 || isGetV03) {
      const requestedId =
        (typeof body.params?.id === "string" && body.params.id) ||
        (typeof body.params?.name === "string" && body.params.name) ||
        "";
      const stored = getTask(requestedId);
      if (!stored) {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: body?.id ?? null,
            error: { code: -32001, message: `Task not found: ${requestedId || "(empty)"}` },
          },
          { status: 200, headers: CORS_HEADERS }
        );
      }

      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: body?.id ?? null,
          result: formatTaskForVersion(stored, isGetV1),
        },
        { headers: CORS_HEADERS }
      );
    }

    if (!isSendV1 && !isSendV03) {
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
    const { device, issue } = detectDeviceAndIssue(prompt);
    const isPricingOrRepairAsk =
      Boolean(device || issue) ||
      /\b(price|cost|how much|estimate|repair|fix|replace|screen|battery|hdmi|charging|water)\b/i.test(
        lower
      );
    const isLocationAsk =
      /\b(location|locations|store|stores|address|hours|open|close|where|directions|52nd|lancaster|drexel|upenn|closest)\b/i.test(
        lower
      );

    let summaryText = "";
    let structuredData: unknown = null;

    if (isLocationAsk && !isPricingOrRepairAsk) {
      const locs = await getAgentLocations();
      structuredData = locs;
      summaryText = `SmartFoneDoctor operates 3 Philadelphia walk-in repair shops (Mon–Sat 10 AM – 7 PM): ${locs.locations
        .map((l) => `${l.name} — ${l.address} (${l.phone})`)
        .join("; ")}. Book online at ${AGENT_BASE_URL}/schedule-repair.`;
    } else if (
      !isPricingOrRepairAsk &&
      /\b(warranty|guarantee|data|erase|wipe|diagnostic|appointment|walk-in|walk in)\b/i.test(lower)
    ) {
      const policy = getAgentWarrantyPolicy();
      structuredData = policy;
      summaryText = `${policy.brand}: ${policy.warrantyDays}-day parts & labor warranty, ${policy.diagnosticsFee}, ${policy.dataPrivacy} Walk-ins welcome ${policy.hours}.`;
    } else {
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

    const nowMs = Date.now();
    const taskId =
      body.params?.id ||
      body.params?.message?.taskId ||
      `sfd-task-${nowMs}-${Math.random().toString(36).slice(2, 7)}`;
    const contextId =
      body.params?.contextId || body.params?.message?.contextId || `sfd-ctx-${nowMs}`;

    const storedTask: StoredA2aTask = {
      id: taskId,
      contextId,
      timestamp: new Date(nowMs).toISOString(),
      summaryText,
      structuredData,
      createdAtMs: nowMs,
    };
    saveTask(storedTask);

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: body.id ?? null,
        result: formatTaskForVersion(storedTask, isSendV1),
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
