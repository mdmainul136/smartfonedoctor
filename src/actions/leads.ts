"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateLeadInput {
  customerName: string;
  phone: string;
  email?: string;
  device: string;
  issue: string;
  notes?: string;
}

/** Server Action: Submit a customer repair lead into PostgreSQL */
export async function submitLeadAction(input: CreateLeadInput): Promise<{
  success: boolean;
  leadId?: number;
  error?: string;
}> {
  try {
    if (!input.customerName || !input.phone || !input.device || !input.issue) {
      return { success: false, error: "Missing required contact or device details" };
    }

    const created = await prisma.lead.create({
      data: {
        customer_name: input.customerName,
        phone: input.phone,
        email: input.email || null,
        device: input.device,
        issue: input.issue,
        notes: input.notes || null,
      },
    });

    revalidatePath("/admin/leads");

    return { success: true, leadId: created.id };
  } catch (err) {
    console.error("[submitLeadAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to record repair request",
    };
  }
}

/** Server Action: Retrieve recent leads from PostgreSQL */
export async function getLeadsAction(): Promise<{
  success: boolean;
  leads: Array<{
    id: number;
    customerName: string;
    phone: string;
    email: string | null;
    device: string;
    issue: string;
    status: string;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    const records = await prisma.lead.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
    });

    return {
      success: true,
      leads: records.map((r) => ({
        id: r.id,
        customerName: r.customer_name,
        phone: r.phone,
        email: r.email,
        device: r.device,
        issue: r.issue,
        status: r.status || "new",
        createdAt: r.created_at,
      })),
    };
  } catch (err) {
    console.error("[getLeadsAction] Error:", err);
    return {
      success: false,
      leads: [],
      error: err instanceof Error ? err.message : "Failed to load leads",
    };
  }
}
