import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Eye } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentAdminAction } from "@/actions/auth";
import { getCmsPage } from "@/actions/cmsPages";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { RouteDataProvider, type RouteData } from "@/components/site/RouteDataContext";
import { getBlogPostsAction } from "@/actions/blog";
import { getRepairCatalog } from "@/lib/repairCatalog";
import { repairTemplateSample } from "@/lib/repairTemplateSamples";
import { getCommonIssues } from "@/lib/commonIssuesStore";
import { getRelatedIssues } from "@/data/commonIssuesData";
import { routeDataForPath, typeOfPath } from "@/lib/themeTypes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Draft preview | SmartFoneDoctor" },
  robots: { index: false, follow: false },
};

/**
 * Admin-only preview of a page's unpublished draft (the builder autosaves it).
 * With no draft it shows the live builder layout. Nothing here is public.
 */
export default async function DraftPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await getCurrentAdminAction())) redirect(`/sign-in?next=/preview/${slug}`);

  const page = await getCmsPage(slug);
  if (!page) notFound();

  const draft = await prisma.pageBuilderDraft.findFirst({ where: { page: { slug } } });
  const data = (draft?.data ?? page.puckData) as { content?: unknown[] } | undefined;
  const hasLayout = Array.isArray(data?.content) && data!.content!.length > 0;

  // A type template previews with a sample record (the newest blog post).
  let sample: RouteData | null = null;
  if (page.category === "Template" && slug === "template-blog-post") {
    const res = await getBlogPostsAction();
    const articles = res?.success ? res.articles : [];
    if (articles[0]) sample = { type: "blog-post", data: { article: articles[0], allArticles: articles } };
  }
  // Device / repair templates preview with the newest device (and its first repair).
  if (page.category === "Template" && (slug === "template-repair-device" || slug === "template-repair-issue")) {
    sample = repairTemplateSample(slug.replace(/^template-/, ""), await getRepairCatalog())?.data ?? null;
  }
  // The common-issue template previews with the first article.
  if (page.category === "Template" && slug === "template-common-issue") {
    const issues = await getCommonIssues();
    if (issues[0]) sample = { type: "common-issue", data: { issue: issues[0], related: getRelatedIssues(issues[0].slug, issues) } };
  }
  // A custom layout of one page previews with that page's own record.
  if (page.category !== "Template" && (typeOfPath(page.path) || page.path === "/locations/i/book-repair")) {
    sample = await routeDataForPath(page.path);
  }
  // A category hub previews with its category's catalog entries.
  const hub = /^\/repairs\/(smartphone|tablet|computer|console)$/.exec(page.path)?.[1];
  if (hub) {
    const catalog = await getRepairCatalog();
    sample = {
      type: "repair-category",
      data: {
        category: hub,
        devices: catalog.devices.filter((d) => d.category === hub),
        repairs: catalog.issues.filter((i) => i.category === hub),
      },
    };
  }

  return (
    <>
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-900">
        <span className="inline-flex items-center gap-2">
          <Eye className="h-4 w-4" />
          {draft ? (
            <span>
              <strong>Draft preview</strong> of {page.name}, autosaved {draft.savedAt.toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" })}. Not live yet.
            </span>
          ) : (
            <span>
              <strong>No unpublished changes.</strong> This is the live version of {page.name}.
            </span>
          )}
        </span>
        <span className="flex gap-2">
          <Link href={`/admin/pages/${slug}`} className="rounded bg-amber-200 px-2 py-0.5 font-semibold hover:bg-amber-300">
            Back to editor
          </Link>
          <Link href={page.path} className="rounded border border-amber-300 px-2 py-0.5 font-semibold hover:bg-amber-100">
            Live page
          </Link>
        </span>
      </div>


      {hasLayout ? (
        // custom: true so the home page shows its builder layout here too.
        <RouteDataProvider value={sample}>
          <CMSSectionRenderer slug={slug} initialPage={{ ...page, puckData: data as Record<string, unknown>, custom: true, status: "Published" }} />
        </RouteDataProvider>
      ) : (
        <main className="mx-auto max-w-xl px-4 py-20 text-center text-sm text-gray-600">
          This page has no builder layout yet, so visitors see its built-in design. Open it in the editor to build one.
        </main>
      )}
    </>
  );
}
