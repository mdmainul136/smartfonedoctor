"use client";

import "@/plugins/repair-shop/builderHost";
import { useMemo } from "react";
import type { Config, Data } from "@puckeditor/core";
import { Globe, RotateCcw } from "lucide-react";
import type { CMSPage } from "@/lib/cmsData";
import { puckConfig } from "@/puck/config";
import type { PuckPageData } from "@/puck/types";
import { cmsPageToPuckData } from "@/plugins/repair-shop/migrateCmsPageToPuck";
import BuilderEditor, { type BuilderPanel } from "@/puck/editor/BuilderEditor";
import PageSeoPanel from "@/components/admin/PageSeoPanel";
import type { BuilderKit } from "@/puck/kit";

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
    <BuilderEditor
      config={puckConfig as unknown as Config}
      data={initialData as unknown as Data}
      editorKey={`${page.slug}-${editorNonce}`}
      documentId={page.slug}
      kit={SMARTFONE_KIT}
      title={page.name}
      subtitle={page.path}
      status={page.status}
      previewHref={page.path}
      onExit={onExit}
      onPublish={(data) => onPublishData(data as unknown as PuckPageData)}
      panels={panels}
      headerActions={
        onResetTemplate ? (
          <button
            type="button"
            onClick={onResetTemplate}
            title="Reload the default template layout for this page"
            className="hidden h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 cursor-pointer lg:inline-flex"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Reset</span>
          </button>
        ) : null
      }
    />
  );
}
