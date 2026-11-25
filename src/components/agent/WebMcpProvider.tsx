"use client";

import { useEffect } from "react";
import { lookupRepairTicketAction, submitLeadAction } from "@/actions/leads";
import { GEO_STORES } from "@/lib/geoPages";
import type { WebMcpToolDefinition } from "@/types/webmcp";

function mapStoreLocationToId(location?: unknown): number {
  const val = String(location || "").toLowerCase();
  if (val.includes("4016")) return 2;
  if (val.includes("4060")) return 3;
  return 1;
}

/**
 * Registers clean imperative WebMCP tools when the browser exposes `navigator.modelContext`
 * or `document.modelContext` (e.g., Chrome WebMCP / Lighthouse Agentic Browsing audit).
 */
export default function WebMcpProvider() {
  useEffect(() => {
    const mc =
      (typeof navigator !== "undefined" ? navigator.modelContext : undefined) ??
      (typeof document !== "undefined" ? document.modelContext : undefined);

    if (!mc || typeof mc.registerTool !== "function") {
      return;
    }

    const tools: WebMcpToolDefinition[] = [
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
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const q = typeof input.neighborhood === "string" ? input.neighborhood.trim() : "";
          try {
            const params = new URLSearchParams({ type: "locations" });
            if (q) params.set("neighborhood", q);
            const res = await fetch(`/api/agent/catalog?${params.toString()}`);
            if (res.ok) return await res.json();
          } catch {
            // Fall back to canonical static store profiles below.
          }
          return {
            success: true,
            city: "Philadelphia, PA",
            locations: GEO_STORES.map((s) => ({
              storeId: s.storeId,
              name: s.name,
              address: `${s.streetAddress}, ${s.addressLocality}, ${s.addressRegion} ${s.postalCode}`,
              phone: s.phone,
              hours: s.hoursDisplay,
              url: `/locations/${s.slug}`,
              bookingUrl: "/schedule-repair",
            })),
          };
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
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const device = typeof input.device === "string" ? input.device.trim() : "";
          const issue = typeof input.issue === "string" ? input.issue.trim() : "";
          const params = new URLSearchParams();
          if (device) params.set("device", device);
          if (issue) params.set("issue", issue);
          const res = await fetch(`/api/agent/catalog?${params.toString()}`);
          if (!res.ok) {
            return { success: false, error: "Failed to search repair catalog." };
          }
          return await res.json();
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
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const ticketId = typeof input.ticketId === "string" ? input.ticketId.trim() : "";
          const lastName = typeof input.lastName === "string" ? input.lastName.trim() : "";
          if (!ticketId || !lastName) {
            return { success: false, error: "Both ticketId and lastName are required." };
          }
          return await lookupRepairTicketAction(ticketId, lastName);
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
        annotations: { readOnlyHint: false },
        execute: async (input) => {
          const customerName =
            typeof input.customerName === "string" ? input.customerName.trim() : "";
          const phone = typeof input.phone === "string" ? input.phone.trim() : "";
          const email = typeof input.email === "string" ? input.email.trim() : undefined;
          const device = typeof input.device === "string" ? input.device.trim() : "";
          const issue = typeof input.issue === "string" ? input.issue.trim() : "";

          if (!customerName || !phone || !device || !issue) {
            return {
              success: false,
              error: "customerName, phone, device, and issue are required.",
            };
          }

          return await submitLeadAction({
            customerName,
            phone,
            email,
            device,
            issue,
            storeId: mapStoreLocationToId(input.storeLocation),
            source: "ChatGPT / AI",
            notes: "Booked via WebMCP agent tool",
          });
        },
      },
    ];

    const registeredNames: string[] = [];
    for (const tool of tools) {
      try {
        mc.registerTool(tool);
        registeredNames.push(tool.name);
      } catch (err) {
        console.warn(`[WebMCP] Skipping tool "${tool.name}":`, err);
      }
    }

    return () => {
      if (typeof mc.unregisterTool !== "function") return;
      for (const name of registeredNames) {
        try {
          mc.unregisterTool(name);
        } catch {
          // Ignore cleanup errors if context was already torn down.
        }
      }
    };
  }, []);

  return null;
}
