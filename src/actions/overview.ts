"use server";

// Admin home: a real overview of the website from the database (no invented numbers).
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export type SiteOverview = {
  pages: { published: number; drafts: number; scheduled: number };
  posts: { published: number; drafts: number };
  leads: { open: number; total: number };
  redirects: number;
  recentEdits: { slug: string; name: string; path: string; status: string; category: string; updatedAt: string; author: string }[];
  scheduled: { slug: string; name: string; path: string; scheduledAt: string }[];
  recentLeads: { id: number; device: string; issue: string; status: string; source: string; createdAt: string }[];
  attention: { kind: string; label: string; href: string }[];
};

// Rows that are not visitor pages.
const NOT_A_PAGE = { NOT: [{ category: "Template" }, { category: "Global" }] };

export async function getSiteOverviewAction(): Promise<{ success: boolean; overview?: SiteOverview; error?: string }> {
  try {
    await requireAdmin();
    const [byStatus, posts, leadsByStatus, redirects, recent, scheduled, recentLeads, seoRows] = await Promise.all([
      prisma.cmsPage.groupBy({ by: ["status"], where: NOT_A_PAGE, _count: true }),
      prisma.blogPost.groupBy({ by: ["status"], _count: true }),
      prisma.lead.groupBy({ by: ["status"], _count: true }),
      prisma.urlRedirect.count({ where: { isActive: true } }),
      prisma.cmsPage.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { slug: true, name: true, path: true, status: true, category: true, updatedAt: true, author: true },
      }),
      prisma.cmsPage.findMany({
        where: { status: "Scheduled" },
        orderBy: { scheduledAt: "asc" },
        select: { slug: true, name: true, path: true, scheduledAt: true },
      }),
      prisma.lead.findMany({
        orderBy: { created_at: "desc" },
        take: 5,
        select: { id: true, device: true, issue: true, status: true, source: true, created_at: true },
      }),
      prisma.cmsPage.findMany({
        where: { status: "Published", ...NOT_A_PAGE },
        select: { slug: true, name: true, title: true, metaDesc: true },
      }),
    ]);

    const count = (rows: { status: string | null; _count: number }[], s: string) =>
      rows.filter((r) => r.status === s).reduce((n, r) => n + r._count, 0);
    const leadTotal = leadsByStatus.reduce((n, r) => n + r._count, 0);
    const leadOpen = leadsByStatus
      .filter((r) => r.status === "new" || r.status === "contacted" || r.status === "scheduled")
      .reduce((n, r) => n + r._count, 0);

    // Simple SEO checks on live pages (the same limits as the SEO panel).
    const attention: SiteOverview["attention"] = [];
    for (const p of seoRows) {
      if (!p.metaDesc?.trim()) attention.push({ kind: "SEO", label: `${p.name}: no meta description`, href: `/admin/pages/${p.slug}` });
      else if (p.metaDesc.length > 160) attention.push({ kind: "SEO", label: `${p.name}: meta description over 160 characters`, href: `/admin/pages/${p.slug}` });
      if (p.title && p.title.length > 60) attention.push({ kind: "SEO", label: `${p.name}: title over 60 characters`, href: `/admin/pages/${p.slug}` });
    }
    const draftPosts = count(posts, "Draft");
    if (draftPosts) attention.push({ kind: "Blog", label: `${draftPosts} blog post(s) still in draft`, href: "/admin/blog" });

    return {
      success: true,
      overview: {
        pages: { published: count(byStatus, "Published"), drafts: count(byStatus, "Draft"), scheduled: count(byStatus, "Scheduled") },
        posts: { published: count(posts, "Published"), drafts: draftPosts },
        leads: { open: leadOpen, total: leadTotal },
        redirects,
        recentEdits: recent.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() })),
        scheduled: scheduled.map((r) => ({ ...r, scheduledAt: r.scheduledAt?.toISOString() ?? "" })),
        recentLeads: recentLeads.map((l) => ({
          id: l.id,
          device: l.device,
          issue: l.issue,
          status: l.status ?? "new",
          source: l.source === "ai" ? "AI search" : (l.source ?? "").replace(/[_-]/g, " "),
          createdAt: l.created_at.toISOString(),
        })),
        attention,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not load the overview" };
  }
}
