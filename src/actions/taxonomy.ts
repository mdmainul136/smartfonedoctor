"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/adminGuard";
import {
  DEVICE_CATEGORIES,
  BRANDS_TAXONOMY,
  SERVICE_ISSUES_TAXONOMY,
  DEVICE_MODELS_TAXONOMY,
  type DeviceCategory,
  type BrandTaxonomy,
  type ServiceIssueTaxonomy,
  type DeviceModelTaxonomy,
} from "@/lib/taxonomy";
import { INITIAL_BLOG_CATEGORIES } from "@/lib/blogData";

export type TaxonomyType = "categories" | "brands" | "issues" | "models" | "blog-categories";

function getDefaultTaxonomy(type: TaxonomyType): unknown[] {
  switch (type) {
    case "categories":
      return DEVICE_CATEGORIES;
    case "brands":
      return BRANDS_TAXONOMY;
    case "issues":
      return SERVICE_ISSUES_TAXONOMY;
    case "models":
      return DEVICE_MODELS_TAXONOMY;
    case "blog-categories":
      return INITIAL_BLOG_CATEGORIES;
  }
}

/** Ensure initial seed taxonomies exist in PostgreSQL */
async function ensureSeededTaxonomy(type: TaxonomyType): Promise<void> {
  const existing = await prisma.taxonomyStore.findUnique({
    where: { id: type },
  });
  if (existing) return;

  const defaultData = getDefaultTaxonomy(type);
  await prisma.taxonomyStore.create({
    data: {
      id: type,
      data: defaultData as unknown as Prisma.InputJsonValue,
    },
  });
}

/** Server Action: Get taxonomy list from PostgreSQL */
export async function getTaxonomyAction<T>(type: TaxonomyType): Promise<{
  success: boolean;
  data: T[];
  error?: string;
}> {
  try {
    await ensureSeededTaxonomy(type);

    const row = await prisma.taxonomyStore.findUnique({
      where: { id: type },
    });

    if (row && Array.isArray(row.data)) {
      return { success: true, data: row.data as T[] };
    }

    return { success: true, data: getDefaultTaxonomy(type) as T[] };
  } catch (err) {
    console.error(`[getTaxonomyAction:${type}] Error:`, err);
    return {
      success: false,
      data: getDefaultTaxonomy(type) as T[],
      error: err instanceof Error ? err.message : `Failed to load ${type} taxonomy`,
    };
  }
}

/** Server Action: Save taxonomy list to PostgreSQL */
export async function saveTaxonomyAction<T>(
  type: TaxonomyType,
  items: T[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await prisma.taxonomyStore.upsert({
      where: { id: type },
      update: {
        data: items as unknown as Prisma.InputJsonValue,
      },
      create: {
        id: type,
        data: items as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/admin/taxonomies");
    revalidatePath(`/admin/${type}`);
    revalidatePath("/repairs");
    revalidatePath("/common-issues");
    if (type === "blog-categories") revalidatePath("/blog", "layout");

    return { success: true };
  } catch (err) {
    console.error(`[saveTaxonomyAction:${type}] Error:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : `Failed to save ${type} taxonomy`,
    };
  }
}
