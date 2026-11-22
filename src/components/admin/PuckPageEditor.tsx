"use client";

import "@/plugins/repair-shop/builderHost";
import { useEffect, useMemo, useState } from "react";
import type { Config, Data } from "@puckeditor/core";
import { Eye, Globe, RotateCcw } from "lucide-react";
import { builderLayoutStatus, type CMSPage } from "@/lib/cmsData";
import { puckConfig } from "@/puck/config";
import type { PuckPageData } from "@/puck/types";
import { cmsPageToPuckData } from "@/plugins/repair-shop/migrateCmsPageToPuck";
import BuilderEditor, { type BuilderPanel } from "@/puck/editor/BuilderEditor";
import PageSeoPanel from "@/components/admin/PageSeoPanel";
import type { BuilderKit } from "@/puck/kit";
import { createDbBuilderStorage } from "@/plugins/repair-shop/dbBuilderStorage";
import { RouteDataProvider, type RouteData } from "@/components/site/RouteDataContext";
import { getBlogPostsAction } from "@/actions/blog";
import { getRepairCatalogAction } from "@/actions/repairCatalog";
import { getCommonIssuesAdminAction } from "@/actions/commonIssues";
import { getRouteDataForPathAction } from "@/actions/theme";
import { getGlobalBlocksAdminAction } from "@/actions/globalBlocks";
import { GlobalBlocksProvider, setGlobalBlockOptions, type GlobalBlockMap } from "@/components/site/GlobalBlocks";
import { getRelatedIssues } from "@/data/commonIssuesData";

import { repairTemplateSample } from "@/lib/repairTemplateSamples";

const HUB_PATH = /^\/repairs\/(smartphone|tablet|computer|console)$/;
/** One page of a templated type (a custom layout): its editor shows that exact page's record. */
const TYPED_PAGE_PATH = /^\/(blog\/[^/]+|common-issues\/[^/]+\/[^/]+|repairs\/[^/]+\/[^/]+(\/[^/]+)?|locations\/i\/book-repair)$/;

/**
 * Loads a sample record for a type template, so its data blocks show real
 * content in the canvas (the newest blog post for the blog template).
 */
async function loadSampleRecord(templateType: string): Promise<RouteData | null> {
  if (templateType === "repair-device" || templateType === "repair-issue") {
    const res = await getRepairCatalogAction();
    return res.catalog ? repairTemplateSample(templateType, res.catalog)?.data ?? null : null;
  }
  if (templateType === "common-issue") {
    const res = await getCommonIssuesAdminAction();
    const issue = res.issues?.[0];
    return issue ? { type: "common-issue", data: { issue, related: getRelatedIssues(issue.slug, res.issues) } } : null;
  }
  if (templateType === "blog-post") {
    const res = await getBlogPostsAction();
    const articles = res?.success && res.articles?.length ? res.articles : [];
    return articles[0] ? { type: "blog-post", data: { article: articles[0], allArticles: articles } } : null;
  }
  return null;
}

/** Drafts, revisions and templates live in Postgres, shared by every admin. */
const dbStorage = createDbBuilderStorage();

/** SmartFone Doctor brand colors, offered first in every color picker. */
const SMARTFONE_KIT: BuilderKit = {
  colors: [
    { name: "Brand teal", value: "#009691" },
    { name: "Teal light", value: "#14b8a6" },
    { name: "Brand red", value: "#b31924" },
    { name: "Brand dark", value: "#1d1c1a" },
    { name: "Navy", value: "#0f172a" },
    { name: "Text", value: "#111827" },
    { name: "Border", value: "#e5e7eb" },
    { name: "Light", value: "#f8fafc" },
  ],
};

/**
 * SmartFone Doctor's wiring for the page builder: maps a CMS page to builder
 * data and plugs the SEO panel in as an extra tab. Everything project-specific
 * lives here, not inside src/puck.
 */
export default function PuckPageEditor({
  page,
  editorNonce,
  onPublishData,
  onUpdatePageField,
  onExit,
  onResetTemplate,
}: {
  page: CMSPage;
  /** Bump to reload the editor from `page` (after a reset or a fresh load). */
  editorNonce: number;
  onPublishData: (data: PuckPageData) => void;
  onUpdatePageField: (field: keyof CMSPage, value: unknown) => void;
  onExit?: () => void;
  onResetTemplate?: () => void;
}) {
  // Recomputed only when the editor is meant to reload, so typing in the SEO
  // tab or publishing never throws away the current editing session.
  const initialData = useMemo(
    () => cmsPageToPuckData(page),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page.slug, editorNonce]
  );

  // Type templates (slug "template-<type>") preview with a sample record.
  const templateType = page.category === "Template" ? page.slug.replace(/^template-/, "") : null;
  // Category hub pages (/repairs/<category>) preview with that category's catalog entries.
  const hubCategory = HUB_PATH.exec(page.path)?.[1] ?? null;
  const [sample, setSample] = useState<RouteData | null>(null);
  // Global blocks for the canvas and the "Global block" widget's picker.
  const [globals, setGlobals] = useState<GlobalBlockMap>({});
  useEffect(() => {
    getGlobalBlocksAdminAction()
      .then((map) => {
        // A global block can't insert itself.
        const own = page.category === "Global" ? page.slug : null;
        setGlobalBlockOptions(
          Object.entries(map)
            .filter(([slug]) => slug !== own)
            .map(([slug, g]) => ({ label: g.name, value: slug }))
        );
        setGlobals(map);
      })
      .catch(() => undefined);
  }, [page.category, page.slug]);
  useEffect(() => {
    let alive = true;
    if (templateType) {
      loadSampleRecord(templateType)
        .then((r) => alive && setSample(r))
        .catch(() => undefined);
    } else if (page.category !== "Template" && TYPED_PAGE_PATH.test(page.path)) {
      getRouteDataForPathAction(page.path)
        .then((r) => alive && setSample(r))
        .catch(() => undefined);
    } else if (hubCategory) {
      getRepairCatalogAction()
        .then((res) => {
          if (!alive || !res.catalog) return;
          setSample({
            type: "repair-category",
            data: {
              category: hubCategory,
              devices: res.catalog.devices.filter((d) => d.category === hubCategory),
              repairs: res.catalog.issues.filter((i) => i.category === hubCategory),
            },
          });
        })
        .catch(() => undefined);
    }
    return () => {
      alive = false;
    };
  }, [templateType, hubCategory, page.category, page.path]);

  const panels: BuilderPanel[] = [
    {
      id: "seo",
      label: "SEO",
      icon: Globe,
      width: 380,
      render: (data) => (
        <PageSeoPanel
          page={page}
          livePuckData={data as unknown as PuckPageData}
          onChangeField={onUpdatePageField}
          compact
        />
      ),
    },
  ];

  return (
    <GlobalBlocksProvider blocks={globals}>
    <RouteDataProvider value={sample}>
    <BuilderEditor
      config={puckConfig as unknown as Config}
      data={initialData as unknown as Data}
      editorKey={`${page.slug}-${editorNonce}`}
      documentId={page.slug}
      storage={dbStorage}
      kit={SMARTFONE_KIT}
      title={page.name}
      subtitle={
        builderLayoutStatus(page).live ? page.path : `${page.path} · ${builderLayoutStatus(page).note}`
      }
      status={page.status}
      previewHref={
        // A template is not a URL: "View page" opens the sample record's page instead.
        templateType === "blog-post" && sample
          ? `/blog/${(sample.data.article as { slug: string }).slug}`
          : templateType === "repair-device" && sample
            ? `/repairs/${(sample.data.service as { categoryId: string }).categoryId}/${(sample.data.service as { serviceId: string }).serviceId}`
            : templateType === "repair-issue" && sample
              ? (sample.data.page as { seo: { canonicalUrl: string } }).seo.canonicalUrl
              : templateType === "common-issue" && sample
                ? `/common-issues/${(sample.data.issue as { category: string }).category}/${(sample.data.issue as { slug: string }).slug}`
                : templateType
            ? undefined
            : page.path
      }
      onExit={onExit}
      onPublish={(data) => onPublishData(data as unknown as PuckPageData)}
      panels={panels}
      headerActions={
        <>
        <a
          href={`/preview/${page.slug}`}
          target="_blank"
          rel="noreferrer"
          title="Open your unpublished changes in a new tab (only admins can see it)"
          className="hidden h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 lg:inline-flex"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Preview draft</span>
        </a>
        {onResetTemplate ? (
          <button
            type="button"
            onClick={onResetTemplate}
            title="Reload the default template layout for this page"
            className="hidden h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 cursor-pointer lg:inline-flex"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Reset</span>
          </button>
        ) : null}
        </>
      }
    />
    </RouteDataProvider>
    </GlobalBlocksProvider>
  );
}
