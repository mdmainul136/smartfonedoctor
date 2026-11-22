"use server";

// Global blocks (Admin > Theme Builder): content edited once in the page builder
// and shown on every page that inserts the "Global block" widget. Admin only.
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin, requirePublisher } from "@/lib/adminGuard";
import { GLOBAL_CATEGORY, getAllGlobalBlockMap } from "@/lib/globalBlocks";
import type { GlobalBlockMap } from "@/components/site/GlobalBlocks";

/** All global blocks incl. unpublished ones, for the editor canvas and picker. */
export async function getGlobalBlocksAdminAction(): Promise<GlobalBlockMap> {
  await requireAdmin();
  return getAllGlobalBlockMap();
}

export async function listGlobalBlocksAction(): Promise<
  { slug: string; name: string; status: string; blocks: number; usedOn: string[] }[]
> {
  await requireAdmin();
  const [globals, pages] = await Promise.all([
    prisma.cmsPage.findMany({ where: { category: GLOBAL_CATEGORY }, orderBy: { name: "asc" } }),
    prisma.cmsPage.findMany({ where: { NOT: { category: GLOBAL_CATEGORY } }, select: { path: true, puckData: true } }),
  ]);
  return globals.map((g) => ({
    slug: g.slug,
    name: g.name,
    status: g.status,
    blocks: ((g.puckData as { content?: unknown[] } | null)?.content ?? []).length,
    // Pages and templates whose layout inserts this global block.
    usedOn: pages.filter((p) => JSON.stringify(p.puckData ?? "").includes(`"block":"${g.slug}"`)).map((p) => p.path),
  }));
}

export async function createGlobalBlockAction(name: string): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    const admin = await requirePublisher();
    const clean = name.trim();
    if (!clean) return { success: false, error: "Give the global block a name." };
    const base = `global-${clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    let slug = base;
    for (let n = 2; await prisma.cmsPage.findUnique({ where: { slug } }); n++) slug = `${base}-${n}`;
    await prisma.cmsPage.create({
      data: {
        slug,
        path: `/_global/${slug.replace(/^global-/, "")}`,
        name: clean,
        category: GLOBAL_CATEGORY,
        title: clean,
        metaDesc: "Global block: edit once, shown on every page that inserts it.",
        status: "Published",
        lastEdited: "Created",
        author: admin.name || "Admin",
        schemaType: "WebPage",
        custom: false,
        puckData: { root: { props: {} }, content: [] } as Prisma.InputJsonValue,
      },
    });
    revalidatePath("/admin/theme-builder");
    return { success: true, slug };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not create the global block" };
  }
}
