"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminGuard";
import { Prisma, enum_leads_store, enum_leads_status, enum_leads_source } from "@prisma/client";
import {
  extractAttributionCookies,
  sendServerLeadConversion,
  sendServerLeadLifecycleEvent,
  type B2bLeadLifecycleEvent,
} from "@/lib/serverAnalytics";

export interface CreateLeadInput {
  customerName: string;
  phone: string;
  email?: string;
  device: string;
  issue: string;
  storeId?: number | string;
  source?: string;
  estValue?: number;
  notes?: string;
}

export interface AdminLead {
  id: number;
  name: string;
  device: string;
  issue: string;
  source: string;
  storeId: number;
  date: string;
  status: "New" | "Contacted" | "Confirmed" | "Completed" | "Lost / No Show";
  phone: string;
  email?: string;
  estValue: number;
  notes?: string;
}

/** Map storeId to Prisma enum */
function mapStoreToEnum(storeId?: number | string): enum_leads_store {
  if (storeId === 2 || storeId === "2" || storeId === "4016-lancaster") {
    return enum_leads_store.lancaster_4016;
  }
  if (storeId === 3 || storeId === "3" || storeId === "4060-lancaster") {
    return enum_leads_store.lancaster_4060;
  }
  return enum_leads_store.nd_st;
}

/** Map Prisma enum to storeId */
function mapEnumToStoreId(store: enum_leads_store): number {
  if (store === enum_leads_store.lancaster_4016) return 2;
  if (store === enum_leads_store.lancaster_4060) return 3;
  return 1;
}

/** Map UI status string to Prisma enum */
function mapStatusToEnum(status?: string): enum_leads_status {
  switch (status?.toLowerCase()) {
    case "contacted":
      return enum_leads_status.contacted;
    case "confirmed":
    case "scheduled":
      return enum_leads_status.scheduled;
    case "completed":
      return enum_leads_status.completed;
    case "lost":
    case "lost / no show":
      return enum_leads_status.lost;
    default:
      return enum_leads_status.new;
  }
}

/** Map Prisma enum to UI status */
function mapEnumToStatus(status?: enum_leads_status | null): AdminLead["status"] {
  switch (status) {
    case enum_leads_status.contacted:
      return "Contacted";
    case enum_leads_status.scheduled:
      return "Confirmed";
    case enum_leads_status.completed:
      return "Completed";
    case enum_leads_status.lost:
      return "Lost / No Show";
    default:
      return "New";
  }
}

/** Map UI source string to Prisma enum */
function mapSourceToEnum(source?: string): enum_leads_source {
  const s = source?.toLowerCase() || "";
  if (s.includes("map")) return enum_leads_source.google_maps;
  if (s.includes("search")) return enum_leads_source.google_search;
  if (s.includes("phone") || s.includes("call")) return enum_leads_source.phone_call;
  if (s.includes("walk")) return enum_leads_source.walk_in;
  if (s.includes("ai") || s.includes("chatgpt")) return enum_leads_source.ai;
  if (s.includes("yelp")) return enum_leads_source.yelp;
  if (s.includes("insta") || s.includes("face") || s.includes("social")) return enum_leads_source.social;
  return enum_leads_source.website_form;
}

/** Map Prisma enum to UI source */
function mapEnumToSource(source?: enum_leads_source | null): string {
  switch (source) {
    case enum_leads_source.google_maps:
      return "Google Maps";
    case enum_leads_source.google_search:
      return "Google Search";
    case enum_leads_source.phone_call:
      return "Phone Call";
    case enum_leads_source.walk_in:
      return "Walk-in";
    case enum_leads_source.ai:
      return "ChatGPT / AI";
    case enum_leads_source.yelp:
      return "Yelp";
    case enum_leads_source.social:
      return "Social Media";
    default:
      return "Website Form";
  }
}

const SEED_LEADS: CreateLeadInput[] = [
  { customerName: "Marcus Johnson", device: "iPhone 15 Pro", issue: "Cracked OLED Screen", source: "Google Maps", storeId: 1, estValue: 189, phone: "+1 (215) 555-1001", email: "marcus.j@example.com" },
  { customerName: "Aliyah Thompson", device: "Samsung Galaxy S23", issue: "Battery Replacement", source: "ChatGPT / AI", storeId: 2, estValue: 69, phone: "+1 (215) 555-1002", email: "aliyah.t@example.com" },
  { customerName: "David Kim", device: "iPhone 13", issue: "Water Damage Ultrasonic", source: "Google Search", storeId: 3, estValue: 110, phone: "+1 (610) 555-1003", email: "dkim@example.com" },
  { customerName: "Priya Patel", device: "Google Pixel 8", issue: "USB-C Charging Port", source: "Website Form", storeId: 1, estValue: 69, phone: "+1 (215) 555-1004", email: "priya.p@example.com" },
  { customerName: "James Williams", device: "iPhone 15", issue: "Back Glass Laser Repair", source: "Yelp", storeId: 2, estValue: 129, phone: "+1 (215) 555-1005", email: "jwilliams@example.com" },
  { customerName: "Sarah Chen", device: "Samsung Galaxy A54", issue: "Speaker & Earpiece", source: "Google Maps", storeId: 3, estValue: 59, phone: "+1 (610) 555-1006", email: "schen@example.com" },
  { customerName: "Robert Davis", device: "iPhone 12", issue: "Screen Replacement", source: "Social Media", storeId: 1, estValue: 139, phone: "+1 (215) 555-1007", email: "rdavis@example.com" },
  { customerName: "Antoine Vance", device: "PS5 Console", issue: "HDMI Port Micro-Soldering", source: "ChatGPT / AI", storeId: 1, estValue: 149, phone: "+1 (215) 555-1009", email: "avance@example.com" },
];

/** Ensures initial sample leads are seeded if DB leads table is empty */
async function ensureSeededLeads(): Promise<void> {
  const count = await prisma.lead.count();
  if (count > 0) return;

  for (const s of SEED_LEADS) {
    await prisma.lead.create({
      data: {
        customer_name: s.customerName,
        phone: s.phone,
        email: s.email || null,
        device: s.device,
        issue: s.issue,
        store: mapStoreToEnum(s.storeId),
        status: enum_leads_status.new,
        source: mapSourceToEnum(s.source),
        est_value: s.estValue ? new Prisma.Decimal(s.estValue) : new Prisma.Decimal(99),
        notes: s.notes || null,
      },
    });
  }
}

/** Server Action: Submit a customer repair lead into PostgreSQL */
export async function submitLeadAction(input: CreateLeadInput): Promise<{
  success: boolean;
  leadId?: number;
  ticketNumber?: string;
  eventId?: string;
  error?: string;
}> {
  try {
    if (!input.customerName || !input.phone || !input.device || !input.issue) {
      return { success: false, error: "Missing required contact or device details" };
    }

    const attribution = await extractAttributionCookies();

    const created = await prisma.lead.create({
      data: {
        customer_name: input.customerName.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() || null,
        device: input.device.trim(),
        issue: input.issue.trim(),
        store: mapStoreToEnum(input.storeId),
        status: enum_leads_status.new,
        source: mapSourceToEnum(input.source),
        est_value: input.estValue ? new Prisma.Decimal(input.estValue) : new Prisma.Decimal(99),
        notes: input.notes || null,
        ga_client_id: attribution.gaClientId || null,
        meta_fbp: attribution.fbp || null,
        meta_fbc: attribution.fbc || null,
      },
    });

    revalidatePath("/admin/leads");

    const ticketNumber = `SFD-${10000 + created.id}`;
    const eventId = `lead-${ticketNumber}`;

    await sendServerLeadConversion({
      eventId,
      ticketNumber,
      device: created.device,
      issue: created.issue,
      value: Number(created.est_value ?? 99),
      email: created.email || undefined,
      phone: created.phone,
      customerName: created.customer_name,
    });

    return { success: true, leadId: created.id, ticketNumber, eventId };
  } catch (err) {
    console.error("[submitLeadAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to record repair request",
    };
  }
}

/** Server Action: Retrieve all leads from PostgreSQL */
export async function getLeadsAction(): Promise<{
  success: boolean;
  leads: AdminLead[];
  error?: string;
}> {
  try {
    // Leads hold customers' names and phone numbers: admin only.
    await requireAdmin();
    await ensureSeededLeads();

    const records = await prisma.lead.findMany({
      orderBy: { created_at: "desc" },
      take: 200,
    });

    const leads: AdminLead[] = records.map((r) => ({
      id: r.id,
      name: r.customer_name,
      device: r.device,
      issue: r.issue,
      source: mapEnumToSource(r.source),
      storeId: mapEnumToStoreId(r.store),
      date: r.created_at.toISOString().split("T")[0],
      status: mapEnumToStatus(r.status),
      phone: r.phone,
      email: r.email || undefined,
      estValue: r.est_value ? Number(r.est_value) : 99,
      notes: r.notes || undefined,
    }));

    return { success: true, leads };
  } catch (err) {
    console.error("[getLeadsAction] Error:", err);
    return {
      success: false,
      leads: [],
      error: err instanceof Error ? err.message : "Failed to load leads from database",
    };
  }
}

function mapLeadStatusToB2bEvent(
  status?: enum_leads_status | null
): B2bLeadLifecycleEvent | null {
  switch (status) {
    case enum_leads_status.contacted:
      return "qualify_lead";
    case enum_leads_status.scheduled:
      return "working_lead";
    case enum_leads_status.completed:
      return "close_convert_lead";
    case enum_leads_status.lost:
      return "close_unconvert_lead";
    default:
      return null;
  }
}

/** Server Action: Update lead status or details in PostgreSQL */
export async function updateLeadAction(
  id: number,
  updates: {
    status?: string;
    estValue?: number;
    notes?: string;
    storeId?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Leads hold customers' names and phone numbers: admin only.
    await requireAdmin();
    const existing = await prisma.lead.findUnique({
      where: { id },
      select: { status: true },
    });

    const data: Prisma.LeadUpdateInput = {};
    if (updates.status) data.status = mapStatusToEnum(updates.status);
    if (updates.estValue !== undefined) data.est_value = new Prisma.Decimal(updates.estValue);
    if (updates.notes !== undefined) data.notes = updates.notes;
    if (updates.storeId !== undefined) data.store = mapStoreToEnum(updates.storeId);

    const updated = await prisma.lead.update({
      where: { id },
      data,
    });

    if (updates.status && updated.status !== existing?.status) {
      const lifecycleEvent = mapLeadStatusToB2bEvent(updated.status);
      if (lifecycleEvent) {
        await sendServerLeadLifecycleEvent({
          eventName: lifecycleEvent,
          ticketNumber: `SFD-${10000 + updated.id}`,
          leadStatus: mapEnumToStatus(updated.status),
          device: updated.device,
          issue: updated.issue,
          value: Number(updated.est_value ?? 99),
          email: updated.email || undefined,
          phone: updated.phone,
          customerName: updated.customer_name,
          reason: updated.notes?.trim() || undefined,
          gaClientId: updated.ga_client_id || undefined,
          fbp: updated.meta_fbp || undefined,
          fbc: updated.meta_fbc || undefined,
        });
      }
    }

    revalidatePath("/admin/leads");
    return { success: true };
  } catch (err) {
    console.error("[updateLeadAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update lead",
    };
  }
}

/** Server Action: Delete lead from PostgreSQL */
export async function deleteLeadAction(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // Leads hold customers' names and phone numbers: admin only.
    await requireAdmin();
    await prisma.lead.delete({
      where: { id },
    });

    revalidatePath("/admin/leads");
    return { success: true };
  } catch (err) {
    console.error("[deleteLeadAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete lead",
    };
  }
}

/** Server Action: Lookup repair ticket by ticket number (e.g. SFD-10001) or phone number */
export async function lookupRepairTicketAction(
  query: string,
  lastNameOrPhone?: string
): Promise<{
  success: boolean;
  ticket?: {
    ticketNumber: string;
    customerName: string;
    device: string;
    issue: string;
    status: string;
    store: string;
    estValue: number;
    createdAt: string;
  };
  error?: string;
}> {
  try {
    const cleanQuery = query.trim();
    let numericId: number | null = null;

    if (cleanQuery.toUpperCase().startsWith("SFD-")) {
      const parsed = parseInt(cleanQuery.slice(4), 10);
      if (!isNaN(parsed)) {
        numericId = parsed > 10000 ? parsed - 10000 : parsed;
      }
    } else if (/^\d+$/.test(cleanQuery)) {
      const parsed = parseInt(cleanQuery, 10);
      if (!isNaN(parsed)) {
        numericId = parsed > 10000 ? parsed - 10000 : parsed;
      }
    }

    const whereConditions: Prisma.LeadWhereInput[] = [];

    if (numericId !== null) {
      whereConditions.push({ id: numericId });
    }

    // Also match by phone number
    const phoneDigits = cleanQuery.replace(/\D/g, "");
    if (phoneDigits.length >= 7) {
      whereConditions.push({ phone: { contains: phoneDigits } });
    }

    if (whereConditions.length === 0) {
      return { success: false, error: "Please enter a valid ticket number (e.g. SFD-10001) or 10-digit phone number." };
    }

    const lead = await prisma.lead.findFirst({
      where: { OR: whereConditions },
      orderBy: { created_at: "desc" },
    });

    if (!lead) {
      return { success: false, error: "No repair ticket found matching that information." };
    }

    // Verify last name or phone if provided
    if (lastNameOrPhone) {
      const verify = lastNameOrPhone.trim().toLowerCase();
      const leadName = lead.customer_name.toLowerCase();
      const leadPhone = lead.phone.replace(/\D/g, "");
      const verifyDigits = verify.replace(/\D/g, "");

      const matchesName = leadName.includes(verify);
      const matchesPhone = verifyDigits.length >= 4 && leadPhone.includes(verifyDigits);

      if (!matchesName && !matchesPhone) {
        return { success: false, error: "Verification failed. Name or phone does not match ticket records." };
      }
    }

    const storeNames: Record<enum_leads_store, string> = {
      [enum_leads_store.nd_st]: "33 S 52nd St (Flagship HQ)",
      [enum_leads_store.lancaster_4016]: "4016 Lancaster Ave",
      [enum_leads_store.lancaster_4060]: "4060 Lancaster Ave",
    };

    // Privacy-safe masked customer name (e.g. "Marcus Johnson" -> "Marcus J.")
    const nameParts = lead.customer_name.trim().split(/\s+/);
    const maskedName =
      nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0].toUpperCase()}.`
        : nameParts[0];

    return {
      success: true,
      ticket: {
        ticketNumber: `SFD-${10000 + lead.id}`,
        customerName: maskedName,
        device: lead.device,
        issue: lead.issue,
        status: mapEnumToStatus(lead.status),
        store: storeNames[lead.store] || "Philadelphia Store",
        estValue: lead.est_value ? Number(lead.est_value) : 99,
        createdAt: lead.created_at.toISOString().split("T")[0],
      },
    };
  } catch (err) {
    console.error("[lookupRepairTicketAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Database error looking up repair ticket",
    };
  }
}
