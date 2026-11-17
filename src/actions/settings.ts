"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export interface StoreBranchData {
  id: number;
  name: string;
  type: string;
  address: string;
  cityStateZip: string;
  phone: string;
  email: string;
  businessHours: string;
  calendlyUrl: string;
  gmbUrl: string;
  isActive: boolean;
  order: number;
}

export interface AppSystemSettingsData {
  id: string;
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  headquarters: string;
  currency: string;
  timezone: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  faviconUrl?: string | null;
  defaultAiProvider: string;
  geminiApiKey: string | null;
  openaiApiKey: string | null;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Fetch all store branches from PostgreSQL
 */
export async function getStoreBranchesAction(): Promise<ActionResponse<StoreBranchData[]>> {
  try {
    const branches = await prisma.storeBranch.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });

    return {
      success: true,
      data: branches,
    };
  } catch (error) {
    console.error("getStoreBranchesAction error:", error);
    return {
      success: false,
      error: "Failed to retrieve store branches from database.",
    };
  }
}

/**
 * Create a new Store Branch in PostgreSQL
 */
export async function createStoreBranchAction(
  data: Omit<StoreBranchData, "id" | "isActive" | "order">
): Promise<ActionResponse<StoreBranchData>> {
  try {
    if (!data.name?.trim() || !data.address?.trim() || !data.phone?.trim()) {
      return {
        success: false,
        error: "Store name, address, and phone number are required.",
      };
    }

    const count = await prisma.storeBranch.count();

    const created = await prisma.storeBranch.create({
      data: {
        name: data.name.trim(),
        type: data.type?.trim() || "Branch Location",
        address: data.address.trim(),
        cityStateZip: data.cityStateZip?.trim() || "Philadelphia, PA",
        phone: data.phone.trim(),
        email: data.email?.trim() || "contact@smartfonedoctor.com",
        businessHours: data.businessHours?.trim() || "Mon - Sat: 10:00 AM - 7:00 PM",
        calendlyUrl: data.calendlyUrl?.trim() || "",
        gmbUrl: data.gmbUrl?.trim() || "",
        order: count + 1,
        isActive: true,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/admin");

    return {
      success: true,
      data: created,
      message: `Store branch "${created.name}" created successfully!`,
    };
  } catch (error) {
    console.error("createStoreBranchAction error:", error);
    return {
      success: false,
      error: "Database error creating store branch.",
    };
  }
}

/**
 * Update an existing Store Branch in PostgreSQL
 */
export async function updateStoreBranchAction(
  id: number,
  data: Partial<Omit<StoreBranchData, "id">>
): Promise<ActionResponse<StoreBranchData>> {
  try {
    const existing = await prisma.storeBranch.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Store branch not found." };
    }

    const updated = await prisma.storeBranch.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.type !== undefined ? { type: data.type.trim() } : {}),
        ...(data.address ? { address: data.address.trim() } : {}),
        ...(data.cityStateZip ? { cityStateZip: data.cityStateZip.trim() } : {}),
        ...(data.phone ? { phone: data.phone.trim() } : {}),
        ...(data.email ? { email: data.email.trim() } : {}),
        ...(data.businessHours ? { businessHours: data.businessHours.trim() } : {}),
        ...(data.calendlyUrl !== undefined ? { calendlyUrl: data.calendlyUrl.trim() } : {}),
        ...(data.gmbUrl !== undefined ? { gmbUrl: data.gmbUrl.trim() } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    revalidatePath("/settings");
    revalidatePath("/admin");

    return {
      success: true,
      data: updated,
      message: `Store branch "${updated.name}" updated successfully!`,
    };
  } catch (error) {
    console.error("updateStoreBranchAction error:", error);
    return {
      success: false,
      error: "Failed to update store branch.",
    };
  }
}

/**
 * Delete a Store Branch from PostgreSQL
 */
export async function deleteStoreBranchAction(id: number): Promise<ActionResponse> {
  try {
    const count = await prisma.storeBranch.count({ where: { isActive: true } });
    if (count <= 1) {
      return {
        success: false,
        error: "Cannot delete the last remaining store location. At least one location is required.",
      };
    }

    await prisma.storeBranch.delete({
      where: { id },
    });

    revalidatePath("/settings");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Store branch removed from database.",
    };
  } catch (error) {
    console.error("deleteStoreBranchAction error:", error);
    return {
      success: false,
      error: "Failed to delete store branch.",
    };
  }
}

/**
 * Get Global Application & AI Settings from PostgreSQL
 */
export async function getAppSystemSettingsAction(): Promise<ActionResponse<AppSystemSettingsData>> {
  try {
    let settings = await prisma.appSystemSettings.findUnique({
      where: { id: "global_config" },
    });

    if (!settings) {
      settings = await prisma.appSystemSettings.create({
        data: {
          id: "global_config",
          siteName: "SmartFone Doctor",
          supportEmail: "support@smartfonedoctor.com",
          supportPhone: "+1 (215) 598-2090",
          headquarters: "33 S 52nd St, Philadelphia, PA 19139",
          currency: "USD",
          timezone: "America/New_York",
          defaultAiProvider: "gemini",
          emailNotifications: true,
          smsNotifications: true,
        },
      });
    }

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error("getAppSystemSettingsAction error:", error);
    return {
      success: false,
      error: "Failed to load system settings from database.",
    };
  }
}

/**
 * Update Global Application & AI Settings in PostgreSQL
 */
export async function updateAppSystemSettingsAction(
  data: Partial<Omit<AppSystemSettingsData, "id">>
): Promise<ActionResponse<AppSystemSettingsData>> {
  try {
    const updated = await prisma.appSystemSettings.upsert({
      where: { id: "global_config" },
      create: {
        id: "global_config",
        siteName: data.siteName || "SmartFone Doctor",
        supportEmail: data.supportEmail || "support@smartfonedoctor.com",
        supportPhone: data.supportPhone || "+1 (215) 598-2090",
        headquarters: data.headquarters || "33 S 52nd St, Philadelphia, PA 19139",
        currency: data.currency || "USD",
        timezone: data.timezone || "America/New_York",
        logoUrl: data.logoUrl || "/logo-png.jpg",
        logoDarkUrl: data.logoDarkUrl || "/logo-transparent.png",
        faviconUrl: data.faviconUrl || "/favicon.ico",
        defaultAiProvider: data.defaultAiProvider || "gemini",
        geminiApiKey: data.geminiApiKey || null,
        openaiApiKey: data.openaiApiKey || null,
        emailNotifications: data.emailNotifications ?? true,
        smsNotifications: data.smsNotifications ?? false,
      },
      update: {
        ...(data.siteName ? { siteName: data.siteName.trim() } : {}),
        ...(data.supportEmail ? { supportEmail: data.supportEmail.trim() } : {}),
        ...(data.supportPhone ? { supportPhone: data.supportPhone.trim() } : {}),
        ...(data.headquarters ? { headquarters: data.headquarters.trim() } : {}),
        ...(data.currency ? { currency: data.currency.trim() } : {}),
        ...(data.timezone ? { timezone: data.timezone.trim() } : {}),
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl?.trim() || null } : {}),
        ...(data.logoDarkUrl !== undefined ? { logoDarkUrl: data.logoDarkUrl?.trim() || null } : {}),
        ...(data.faviconUrl !== undefined ? { faviconUrl: data.faviconUrl?.trim() || null } : {}),
        ...(data.defaultAiProvider ? { defaultAiProvider: data.defaultAiProvider } : {}),
        ...(data.geminiApiKey !== undefined ? { geminiApiKey: data.geminiApiKey?.trim() || null } : {}),
        ...(data.openaiApiKey !== undefined ? { openaiApiKey: data.openaiApiKey?.trim() || null } : {}),
        ...(data.emailNotifications !== undefined ? { emailNotifications: data.emailNotifications } : {}),
        ...(data.smsNotifications !== undefined ? { smsNotifications: data.smsNotifications } : {}),
      },
    });

    revalidatePath("/settings");

    return {
      success: true,
      data: updated,
      message: "Application and AI settings saved to PostgreSQL!",
    };
  } catch (error) {
    console.error("updateAppSystemSettingsAction error:", error);
    return {
      success: false,
      error: "Failed to save system settings.",
    };
  }
}
