"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { DEFAULT_NAV_MENU, type NavMenuConfig } from "@/lib/navMenuData";
import { Prisma } from "@prisma/client";

const MENU_DOC_ID = "default_header_menu";

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
