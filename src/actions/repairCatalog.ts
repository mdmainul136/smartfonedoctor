"use server";

// Admin actions for the repair catalog (devices and repair types) that the
// /repairs pages and the booking page read. Admin login required.

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { CATALOG_DEVICES_ID, CATALOG_REPAIRS_ID, getRepairCatalog } from "@/lib/repairCatalog";
import type { PSeoCustomMeta, PSeoDevice, PSeoIssue, RepairCatalog } from "@/lib/pSeoEngine";
import { sanitizeRepairTabsData } from "@/lib/repairTabDefaults";

function sanitizeCustomMeta(seo?: PSeoCustomMeta): PSeoCustomMeta | undefined {
  if (!seo) return undefined;
  const title = seo.title?.trim() || undefined;
  const description = seo.description?.trim() || undefined;
  const focusKeyword = seo.focusKeyword?.trim() || undefined;
  const keywords = seo.keywords?.map((k) => k.trim()).filter(Boolean);
  const canonicalUrl = seo.canonicalUrl?.trim() || undefined;
  const schemaType = seo.schemaType?.trim() || undefined;

  const clean: PSeoCustomMeta = {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(focusKeyword ? { focusKeyword } : {}),
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    ...(canonicalUrl ? { canonicalUrl } : {}),
    ...(schemaType ? { schemaType } : {}),
  };

  return Object.keys(clean).length > 0 ? clean : undefined;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATEGORIES = ["smartphone", "tablet", "computer", "console"];

type Result = { success: true } | { success: false; error: string };

export async function getRepairCatalogAction(): Promise<{ success: boolean; catalog?: RepairCatalog; error?: string }> {
  try {
    await requireAdmin();
    return { success: true, catalog: await getRepairCatalog() };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not load the catalog" };
  }
}

function checkCommon(items: { slug: string; name: string; category: string }[], what: string): string | null {
  const seen = new Set<string>();
  for (const it of items) {
    if (!it.name?.trim()) return `A ${what} has no name.`;
    if (!SLUG_RE.test(it.slug || "")) return `"${it.name}": the URL slug may only use a-z, 0-9 and single dashes.`;
    const key = `${it.category}:${it.slug}`;
    if (seen.has(key)) return `Two ${what}s in ${it.category} use the slug "${it.slug}". Slugs must be unique within each category.`;
    seen.add(key);
    if (!CATEGORIES.includes(it.category)) return `"${it.name}": pick a category.`;
  }
  return null;
}

async function save(id: string, data: unknown[]) {
  await prisma.taxonomyStore.upsert({
    where: { id },
    update: { data: data as Prisma.InputJsonValue },
    create: { id, data: data as Prisma.InputJsonValue },
  });
  // Every page built from the catalog.
  revalidatePath("/repairs", "layout");
  revalidatePath("/schedule-repair");
  revalidatePath("/admin/device-models");
  revalidatePath("/admin/repair-types");
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
  revalidatePath("/llms-full.txt");
}

export async function saveCatalogDevicesAction(devices: PSeoDevice[]): Promise<Result> {
  try {
    await requireAdmin();
    const problem = checkCommon(devices, "device");
    if (problem) return { success: false, error: problem };
    for (const d of devices) {
      if (!d.brand?.trim()) return { success: false, error: `"${d.name}": brand is required.` };
      if (!d.image?.trim()) return { success: false, error: `"${d.name}": add a photo.` };
    }
    const clean = devices.map((d) => {
      const seo = sanitizeCustomMeta(d.seo);
      const { seo: _dropSeo, ...rest } = d;
      void _dropSeo;
      return {
        ...rest,
        brandSlug: d.brandSlug?.trim() || d.brand.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        releaseYear: Number(d.releaseYear) || new Date().getFullYear(),
        ...(seo ? { seo } : {}),
        ...sanitizeRepairTabsData(d),
      };
    });
    await save(CATALOG_DEVICES_ID, clean);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not save devices" };
  }
}

export async function saveCatalogRepairsAction(issues: PSeoIssue[]): Promise<Result> {
  try {
    await requireAdmin();
    const problem = checkCommon(issues, "repair type");
    if (problem) return { success: false, error: problem };
    for (const i of issues) {
      if (!(Number(i.basePrice) > 0)) return { success: false, error: `"${i.name}": enter a starting price above 0.` };
      if (!(Number(i.oemPriceMultiplier) >= 1))
        return { success: false, error: `"${i.name}": the OEM price multiplier must be 1 or more.` };
    }
    const clean = issues.map((i) => {
      const seo = sanitizeCustomMeta(i.seo);
      const { seo: _dropSeo, ...rest } = i;
      void _dropSeo;
      return {
        ...rest,
        shortName: i.shortName?.trim() || i.name,
        basePrice: Number(i.basePrice),
        oemPriceMultiplier: Number(i.oemPriceMultiplier),
        turnaroundMinutes: Number(i.turnaroundMinutes) || 30,
        symptoms: (i.symptoms ?? []).filter((x) => x.trim()),
        toolsUsed: (i.toolsUsed ?? []).filter((x) => x.trim()),
        benchProcedures: (i.benchProcedures ?? []).filter((x) => x.title.trim() || x.desc.trim()),
        faqs: (i.faqs ?? []).filter((x) => x.question.trim() && x.answer.trim()),
        ...(seo ? { seo } : {}),
      };
    });
    await save(CATALOG_REPAIRS_ID, clean);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not save repair types" };
  }
}
