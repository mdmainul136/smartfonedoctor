"use server";

// Theme Builder (Admin): page types, their templates, the URLs they serve, and
// per-URL custom layouts. All actions need an admin login.

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin, requirePublisher } from "@/lib/adminGuard";
import { templateSlug } from "@/lib/cmsTemplates";
import { THEME_TYPES, listTypeUrls, routeDataForPath, typeOfPath, type ThemeType } from "@/lib/themeTypes";
import type { RouteData } from "@/components/site/RouteDataContext";

export type ThemeOverview = {
  types: {
    type: ThemeType;
    label: string;
    description: string;
    pattern: string;
    template: { slug: string; exists: boolean; status: string | null; blocks: number };
    urlCount: number;
    sampleUrls: string[];
    allUrls: string[];
    custom: { slug: string; path: string; status: string; lastEdited: string }[];
  }[];
  hubs: { slug: string; path: string; name: string; status: string }[];
};

const blockCount = (data: unknown) => {
  const content = (data as { content?: unknown[] } | null)?.content;
  return Array.isArray(content) ? content.length : 0;
};

export async function getThemeOverviewAction(): Promise<{ success: boolean; overview?: ThemeOverview; error?: string }> {
  try {
    await requireAdmin();
    const pages = await prisma.cmsPage.findMany({
      select: { slug: true, path: true, name: true, status: true, category: true, lastEdited: true, puckData: true },
    });
    const types: ThemeOverview["types"] = [];
    for (const t of THEME_TYPES) {
      const tpl = pages.find((p) => p.slug === templateSlug(t.type));
      const urls = await listTypeUrls(t.type);
      types.push({
        ...t,
        template: {
          slug: templateSlug(t.type),
          exists: Boolean(tpl),
          status: tpl?.status ?? null,
          blocks: tpl ? blockCount(tpl.puckData) : 0,
        },
        urlCount: urls.length,
        sampleUrls: urls.slice(0, 5),
        allUrls: urls,
        custom: pages
          .filter((p) => p.category !== "Template" && typeOfPath(p.path) === t.type)
          .map((p) => ({ slug: p.slug, path: p.path, status: p.status, lastEdited: p.lastEdited })),
      });
    }
    const hubs = pages
      .filter((p) => /^\/repairs\/(smartphone|tablet|computer|console)$/.test(p.path))
      .map((p) => ({ slug: p.slug, path: p.path, name: p.name, status: p.status }))
      .sort((a, b) => a.path.localeCompare(b.path));
    return { success: true, overview: { types, hubs } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not load the theme overview" };
  }
}

/**
 * Gives one URL its own layout: a Draft page starting as a copy of its type's
 * template. It goes live when published in the editor.
 */
export async function createCustomLayoutAction(path: string): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    const admin = await requirePublisher();
    const type = typeOfPath(path);
    if (!type) return { success: false, error: "This address is not a page that uses a template." };
    if (!(await listTypeUrls(type)).includes(path)) return { success: false, error: `${path} is not a live page.` };

    const existing = await prisma.cmsPage.findFirst({ where: { path } });
    if (existing) return { success: true, slug: existing.slug };

    const template = await prisma.cmsPage.findUnique({ where: { slug: templateSlug(type) } });
    const slug = `custom${path.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`.replace(/-+$/, "");
    const row = await prisma.cmsPage.create({
      data: {
        slug,
        path,
        name: `${path} (custom layout)`,
        category: type === "blog-post" ? "Core" : "Repairs",
        title: path,
        metaDesc: "Custom layout for one page. Title and description still come from the page's own record.",
        status: "Draft",
        lastEdited: "Custom layout created",
        author: admin.name || "Admin",
        schemaType: "WebPage",
        custom: false,
        puckData: (template?.puckData ?? { root: { props: {} }, content: [] }) as Prisma.InputJsonValue,
      },
    });
    revalidatePath("/admin/theme-builder");
    return { success: true, slug: row.slug };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not create the custom layout" };
  }
}

/** Removes one URL's custom layout; the page goes back to its type's template. */
export async function removeCustomLayoutAction(slug: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePublisher();
    const page = await prisma.cmsPage.findUnique({ where: { slug } });
    if (!page || page.category === "Template" || !typeOfPath(page.path)) {
      return { success: false, error: "Only custom layouts of single pages can be removed here." };
    }
    await prisma.cmsPage.delete({ where: { id: page.id } });
    revalidatePath(page.path);
    revalidatePath("/admin/theme-builder");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not remove the custom layout" };
  }
}

/** The record a page at `path` shows, for the editor canvas and preview. */
export async function getRouteDataForPathAction(path: string): Promise<RouteData | null> {
  await requireAdmin();
  return routeDataForPath(path);
}
