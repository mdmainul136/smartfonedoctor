"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { DEFAULT_NAV_MENU, type NavMenuConfig } from "@/lib/navMenuData";
import { DEFAULT_MEGA_MENU_CONFIG, type MegaMenuConfig } from "@/lib/megaMenuData";
import { Prisma } from "@prisma/client";
import { requireAdmin, requirePublisher } from "@/lib/adminGuard";

const MENU_DOC_ID = "default_header_menu";
const MEGA_MENU_DOC_ID = "mega_menu";

/** Server Action: Fetch Navigation Menu from PostgreSQL */
export async function getNavMenuAction(): Promise<{
  success: boolean;
  menu: NavMenuConfig;
  error?: string;
}> {
  try {
    const existing = await prisma.navMenu.findUnique({
      where: { id: MENU_DOC_ID },
    });

    if (existing && existing.config) {
      return {
        success: true,
        menu: existing.config as unknown as NavMenuConfig,
      };
    }

    // Auto-seed default navigation menu if not found
    await prisma.navMenu.upsert({
      where: { id: MENU_DOC_ID },
      update: {},
      create: {
        id: MENU_DOC_ID,
        name: "Main Header Navigation",
        config: DEFAULT_NAV_MENU as unknown as Prisma.InputJsonValue,
      },
    });

    return { success: true, menu: DEFAULT_NAV_MENU };
  } catch (err) {
    console.error("[getNavMenuAction] Error:", err);
    return {
      success: false,
      menu: DEFAULT_NAV_MENU,
      error: err instanceof Error ? err.message : "Failed to load navigation menu",
    };
  }
}

/** Server Action: Save Navigation Menu into PostgreSQL */
export async function saveNavMenuAction(config: NavMenuConfig): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await requirePublisher();
    await prisma.navMenu.upsert({
      where: { id: MENU_DOC_ID },
      update: {
        config: config as unknown as Prisma.InputJsonValue,
      },
      create: {
        id: MENU_DOC_ID,
        name: "Main Header Navigation",
        config: config as unknown as Prisma.InputJsonValue,
      },
    });

    // Revalidate whole site header
    revalidatePath("/", "layout");

    return { success: true };
  } catch (err) {
    console.error("[saveNavMenuAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save navigation menu",
    };
  }
}

/** Server Action: the Repair mega menu (devices, issues, brands per category). */
export async function getMegaMenuAction(): Promise<{
  success: boolean;
  menu: MegaMenuConfig;
  /** False while nothing was ever saved (visitors see the built-in menu). */
  saved?: boolean;
  error?: string;
}> {
  try {
    const row = await prisma.navMenu.findUnique({ where: { id: MEGA_MENU_DOC_ID } });
    if (row?.config) return { success: true, saved: true, menu: row.config as unknown as MegaMenuConfig };
    return { success: true, saved: false, menu: DEFAULT_MEGA_MENU_CONFIG };
  } catch (err) {
    console.error("[getMegaMenuAction] Error:", err);
    return {
      success: false,
      menu: DEFAULT_MEGA_MENU_CONFIG,
      error: err instanceof Error ? err.message : "Failed to load mega menu",
    };
  }
}

/** Server Action: save the Repair mega menu (admin only). Every page's header updates. */
export async function saveMegaMenuAction(config: MegaMenuConfig): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePublisher();
    if (!config?.categories) return { success: false, error: "The mega menu has no categories." };
    await prisma.navMenu.upsert({
      where: { id: MEGA_MENU_DOC_ID },
      update: { config: config as unknown as Prisma.InputJsonValue },
      create: { id: MEGA_MENU_DOC_ID, name: "Repair Mega Menu", config: config as unknown as Prisma.InputJsonValue },
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("[saveMegaMenuAction] Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to save mega menu" };
  }
}
