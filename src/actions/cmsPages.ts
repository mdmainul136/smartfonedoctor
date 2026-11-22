"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { INITIAL_CMS_PAGES, type CMSPage } from "@/lib/cmsData";
import { Prisma } from "@prisma/client";
import { canPublish, requireAdmin, requirePublisher } from "@/lib/adminGuard";

/** Map a Postgres row to the client CMSPage type */
function rowToCmsPage(row: {
  id: string;
  slug: string;
  name: string;
  path: string;
  category: string;
  title: string;
  metaDesc: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroBadge: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  status: string;
  lastEdited: string;
  author: string;
  contentHtml: string | null;
  compiledCss: string | null;
  focusKeyword: string | null;
  keywords: string[];
  featuredImage: string | null;
  canonicalUrl: string | null;
  schemaType: string | null;
  custom: boolean;
  puckData: unknown;
  puckEditedAt: bigint | number | null;
  scheduledAt?: Date | null;
}): CMSPage {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    path: row.path,
    category: (row.category as CMSPage["category"]) || "Core",
    title: row.title,
    metaDesc: row.metaDesc,
    heroHeadline: row.heroHeadline,
    heroSubtitle: row.heroSubtitle,
    heroBadge: row.heroBadge,
    primaryCtaText: row.primaryCtaText,
    primaryCtaLink: row.primaryCtaLink,
    status: (row.status as CMSPage["status"]) || "Published",
    lastEdited: row.lastEdited,
    author: row.author,
    contentHtml: row.contentHtml ?? undefined,
    compiledCss: row.compiledCss ?? undefined,
    focusKeyword: row.focusKeyword ?? undefined,
    keywords: row.keywords,
    featuredImage: row.featuredImage ?? undefined,
    canonicalUrl: row.canonicalUrl ?? undefined,
    schemaType: row.schemaType ?? "LocalBusiness",
    custom: row.custom,
    puckData: (row.puckData as Record<string, unknown>) ?? undefined,
    puckEditedAt: row.puckEditedAt ? Number(row.puckEditedAt) : undefined,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : undefined,
  };
}

let lastPromotionCheck = 0;
/**
 * Scheduled publishing: pages whose time has come become Published. Runs before
 * pages are read (at most every 15 s), so no separate cron job is needed.
 */
async function promoteDueScheduledPages(): Promise<void> {
  const now = Date.now();
  if (now - lastPromotionCheck < 15_000) return;
  lastPromotionCheck = now;
  try {
    await prisma.cmsPage.updateMany({
      where: { status: "Scheduled", scheduledAt: { lte: new Date(now) } },
      data: { status: "Published", publishedAt: new Date(now), lastEdited: "Published on schedule" },
    });
  } catch (err) {
    console.error("[promoteDueScheduledPages]", err);
  }
}

/** Auto-seeds the initial CMS pages into PostgreSQL if empty */
async function ensureSeededPages(): Promise<void> {
  const count = await prisma.cmsPage.count();
  if (count > 0) return;

  for (const page of INITIAL_CMS_PAGES) {
    await prisma.cmsPage.create({
      data: {
        id: page.id,
        slug: page.slug,
        name: page.name,
        path: page.path,
        category: page.category,
        title: page.title,
        metaDesc: page.metaDesc || "",
        heroHeadline: page.heroHeadline || "",
        heroSubtitle: page.heroSubtitle || "",
        heroBadge: page.heroBadge || "",
        primaryCtaText: page.primaryCtaText || "",
        primaryCtaLink: page.primaryCtaLink || "",
        status: page.status,
        lastEdited: page.lastEdited || "Initial Seed",
        author: page.author || "System",
        contentHtml: page.contentHtml || null,
        compiledCss: page.compiledCss || null,
        focusKeyword: page.focusKeyword || null,
        keywords: page.keywords || [],
        featuredImage: page.featuredImage || null,
        canonicalUrl: page.canonicalUrl || null,
        schemaType: page.schemaType || "LocalBusiness",
        custom: !!page.custom,
        puckData: (page.puckData ?? Prisma.DbNull) as Prisma.InputJsonValue,
        puckEditedAt: page.puckEditedAt ? BigInt(page.puckEditedAt) : null,
      },
    });
  }
}

/** Server Action: Fetch all CMS Pages from PostgreSQL */
export async function getCmsPagesAction(): Promise<{
  success: boolean;
  pages: CMSPage[];
  error?: string;
}> {
  try {
    await ensureSeededPages();
    await promoteDueScheduledPages();
    const rows = await prisma.cmsPage.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, pages: rows.map(rowToCmsPage) };
  } catch (err) {
    console.error("[getCmsPagesAction] Error:", err);
    return {
      success: false,
      pages: INITIAL_CMS_PAGES,
      error: err instanceof Error ? err.message : "Failed to load pages from database",
    };
  }
}

/** Server Action: Fetch a CMS Page by URL Path from PostgreSQL */
export async function getCmsPageByPathAction(path: string): Promise<{
  success: boolean;
  page: CMSPage | null;
  error?: string;
}> {
  try {
    const normalized = path.toLowerCase().replace(/\/$/, "");
    const row = await prisma.cmsPage.findFirst({
      where: {
        OR: [
          { path: normalized },
          { path: `${normalized}/` },
          { path: path },
        ],
      },
    });
    return { success: true, page: row ? rowToCmsPage(row) : null };
  } catch (err) {
    console.error("[getCmsPageByPathAction] Error:", err);
    return {
      success: false,
      page: null,
      error: err instanceof Error ? err.message : "Failed to find page",
    };
  }
}

/**
 * Standard server-side loader for CMS Pages.
 * Directly queries Prisma with zero client-side dependencies,
 * falling back cleanly to INITIAL_CMS_PAGES if not in DB.
 */
export async function getCmsPage(pathOrSlug: string): Promise<CMSPage | null> {
  const normalized = pathOrSlug.toLowerCase().replace(/\/$/, "") || "/";
  const defaultPage =
    INITIAL_CMS_PAGES.find((p) => {
      const pNorm = (p.path || "").toLowerCase().replace(/\/$/, "") || "/";
      return pNorm === normalized || p.slug.toLowerCase() === normalized;
    }) || null;

  try {
    await promoteDueScheduledPages();
    const row = await prisma.cmsPage.findFirst({
      where: {
        OR: [
          { path: normalized },
          { path: `${normalized}/` },
          { path: pathOrSlug },
          { slug: normalized },
        ],
      },
    });

    if (row) return rowToCmsPage(row);
  } catch {
    // Graceful fallback to default seed data if DB is temporarily unreachable
  }

  return defaultPage;
}

/**
 * Editor loader: the database row is the truth. If the page has no row yet
 * (a code page like /privacy), it is created from the seed so it can be edited.
 */
export async function getCmsPageForEditorAction(slug: string): Promise<{
  success: boolean;
  page: CMSPage | null;
  error?: string;
}> {
  try {
    await requireAdmin();
    const row = await prisma.cmsPage.findUnique({ where: { slug } });
    if (row) return { success: true, page: rowToCmsPage(row) };

    const seed = INITIAL_CMS_PAGES.find((p) => p.slug === slug);
    if (!seed) return { success: true, page: null };
    const created = await upsertCmsPageAction({ ...seed, lastEdited: "Created from template" });
    if (!created.success) throw new Error(created.error);
    return { success: true, page: created.page ?? seed };
  } catch (err) {
    console.error("[getCmsPageForEditorAction] Error:", err);
    return {
      success: false,
      page: null,
      error: err instanceof Error ? err.message : "Failed to load page",
    };
  }
}

/** Server Action: Upsert a CMS Page in PostgreSQL */
export async function upsertCmsPageAction(page: CMSPage): Promise<{
  success: boolean;
  page?: CMSPage;
  error?: string;
}> {
  try {
    const admin = await requireAdmin();
    // Editors save drafts only: anything live, going live, or site-wide needs an admin.
    if (!canPublish(admin.role)) {
      const existing = await prisma.cmsPage.findUnique({ where: { slug: page.slug }, select: { status: true } });
      const live = (s?: string | null) => s === "Published" || s === "Scheduled";
      if (live(page.status) || live(existing?.status) || page.category === "Template" || page.category === "Global") {
        return {
          success: false,
          error: "Only an admin can publish or change a live page, template or global block. Your edits are kept as a draft for an admin to review.",
        };
      }
    }
    const data = {
      slug: page.slug,
      name: page.name,
      path: page.path,
      category: page.category,
      title: page.title,
      metaDesc: page.metaDesc || "",
      heroHeadline: page.heroHeadline || "",
      heroSubtitle: page.heroSubtitle || "",
      heroBadge: page.heroBadge || "",
      primaryCtaText: page.primaryCtaText || "",
      primaryCtaLink: page.primaryCtaLink || "",
      status: page.status,
      lastEdited: page.lastEdited || "Just now",
      author: admin.name || page.author || "Admin",
      contentHtml: page.contentHtml || null,
      compiledCss: page.compiledCss || null,
      focusKeyword: page.focusKeyword || null,
      keywords: page.keywords || [],
      featuredImage: page.featuredImage || null,
      canonicalUrl: page.canonicalUrl || null,
      schemaType: page.schemaType || "LocalBusiness",
      custom: !!page.custom,
      puckData: (page.puckData ?? Prisma.DbNull) as Prisma.InputJsonValue,
      puckEditedAt: page.puckEditedAt ? BigInt(page.puckEditedAt) : null,
      scheduledAt: page.status === "Scheduled" && page.scheduledAt ? new Date(page.scheduledAt) : null,
      ...(page.status === "Published" ? { publishedAt: new Date() } : {}),
    };
    if (page.status === "Scheduled" && !(data.scheduledAt && data.scheduledAt.getTime() > Date.now())) {
      return { success: false, error: "Pick a future date and time to schedule this page." };
    }

    const saved = await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: data,
      create: {
        id: page.id,
        ...data,
      },
    });

    revalidatePath("/");
    revalidatePath(page.path);
    revalidatePath("/admin/pages");
    // A type template is used by many URLs: refresh every page of its type.
    // A global block appears on any page: refresh the whole site.
    if (page.category === "Global") revalidatePath("/", "layout");
    if (page.category === "Template") {
      const type = page.slug.replace(/^template-/, "");
      if (type === "blog-post") revalidatePath("/blog", "layout");
      if (type.startsWith("repair-")) revalidatePath("/repairs", "layout");
      if (type === "common-issue") revalidatePath("/common-issues", "layout");
    }

    return { success: true, page: rowToCmsPage(saved) };
  } catch (err) {
    console.error("[upsertCmsPageAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save page to database",
    };
  }
}

/** Server Action: Delete a CMS Page from PostgreSQL */
export async function deleteCmsPageAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await requirePublisher();
    const page = await prisma.cmsPage.findUnique({ where: { id } });
    if (!page) {
      return { success: false, error: "Page not found" };
    }

    await prisma.cmsPage.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath(page.path);
    revalidatePath("/admin/pages");

    return { success: true };
  } catch (err) {
    console.error("[deleteCmsPageAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete page",
    };
  }
}

/** Server Action: Duplicate a CMS Page in PostgreSQL */
export async function duplicateCmsPageAction(id: string): Promise<{
  success: boolean;
  page?: CMSPage;
  error?: string;
}> {
  try {
    await requireAdmin();
    const source = await prisma.cmsPage.findUnique({ where: { id } });
    if (!source) {
      return { success: false, error: "Original page not found" };
    }

    const uniqueSuffix = Math.random().toString(36).substring(2, 6);
    const newSlug = `${source.slug}-copy-${uniqueSuffix}`;
    const newPath = `${source.path.replace(/\/$/, "")}-copy-${uniqueSuffix}`;

    const created = await prisma.cmsPage.create({
      data: {
        slug: newSlug,
        name: `${source.name} (Copy)`,
        path: newPath,
        category: source.category,
        title: `${source.title} (Copy)`,
        metaDesc: source.metaDesc,
        heroHeadline: source.heroHeadline,
        heroSubtitle: source.heroSubtitle,
        heroBadge: source.heroBadge,
        primaryCtaText: source.primaryCtaText,
        primaryCtaLink: source.primaryCtaLink,
        status: "Draft",
        lastEdited: "Just now",
        author: source.author,
        contentHtml: source.contentHtml,
        focusKeyword: source.focusKeyword,
        keywords: source.keywords,
        featuredImage: source.featuredImage,
        canonicalUrl: source.canonicalUrl,
        schemaType: source.schemaType,
        custom: true,
        puckData: (source.puckData ?? Prisma.DbNull) as Prisma.InputJsonValue,
        puckEditedAt: null,
      },
    });

    revalidatePath("/admin/pages");

    return { success: true, page: rowToCmsPage(created) };
  } catch (err) {
    console.error("[duplicateCmsPageAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to duplicate page",
    };
  }
}
