"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INITIAL_CMS_PAGES, CMSPage } from "@/lib/cmsData";
import { getCmsPageForEditorAction, upsertCmsPageAction } from "@/actions/cmsPages";
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Check,
  Globe,
  PenTool,
  RotateCcw,
  LayoutTemplate,
} from "lucide-react";
import PageSeoPanel from "@/components/admin/PageSeoPanel";
import PuckPageEditor from "@/components/admin/PuckPageEditor";
import type { PuckPageData } from "@/puck/types";

export default function DedicatedPageEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);

  const seedPage = INITIAL_CMS_PAGES.find((p) => p.slug === slug) ?? null;

  const [page, setPage] = useState<CMSPage | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"visual" | "seo">("visual");
  // Bumped whenever the builder must reload from `page` (DB page loaded, template reset).
  const [editorNonce, setEditorNonce] = useState(0);

  // The database is the source of truth for the editor.
  useEffect(() => {
    let cancelled = false;
    getCmsPageForEditorAction(slug).then((res) => {
      if (cancelled) return;
      if (!res.success) {
        setLoadError(res.error ?? "Could not load this page.");
        return;
      }
      if (!res.page) {
        setLoadError(`No page with slug "${slug}" exists.`);
        return;
      }
      setPage(res.page);
      setEditorNonce((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleUpdate = (field: keyof CMSPage, value: any) => {
    setPage((prev) => (prev ? { ...prev, [field]: value, lastEdited: "Just now" } : prev));
  };

  /** Writes the page to the database and reports the real result. */
  const persist = async (next: CMSPage, successMsg: string): Promise<boolean> => {
    setErrorToast(null);
    const res = await upsertCmsPageAction(next).catch((err: unknown) => ({
      success: false as const,
      error: err instanceof Error ? err.message : String(err),
      page: undefined,
    }));
    if (!res.success) {
      setErrorToast(`Not saved: ${res.error ?? "unknown error"}`);
      return false;
    }
    if (res.page) setPage(res.page);
    setSavedToast(successMsg);
    setTimeout(() => setSavedToast(null), 3500);
    return true;
  };

  const handleSave = async () => {
    if (!page) return;
    setIsSaving(true);
    await persist({ ...page, lastEdited: "Just now" }, `Changes & SEO metadata saved for "${page.name}".`);
    setIsSaving(false);
  };

  const handlePuckPublish = async (data: PuckPageData) => {
    if (!page) return;
    const updatedPage: CMSPage = {
      ...page,
      puckData: data as unknown as Record<string, unknown>,
      // Design styles render next to each widget; no page-level CSS copy is stored.
      compiledCss: undefined,
      puckEditedAt: Date.now(),
      // Publishing in the builder puts a draft page live, unless it is scheduled
      // for later: then the layout is saved and the page still goes live on time.
      status:
        page.status === "Scheduled" && page.scheduledAt && new Date(page.scheduledAt).getTime() > Date.now()
          ? "Scheduled"
          : "Published",
      lastEdited: "Just now",
    };
    // Throwing tells the builder the publish failed: it then keeps the page
    // marked unpublished and does not record a revision.
    const ok = await persist(
      updatedPage,
      updatedPage.status === "Scheduled"
        ? `Saved. "${updatedPage.name}" goes live ${new Date(updatedPage.scheduledAt as string).toLocaleString()}.`
        : `"${updatedPage.name}" is published.`
    );
    if (!ok) throw new Error("The page could not be saved to the database.");
  };

  const handleResetToTemplate = () => {
    const seed = seedPage;
    if (!page || !seed || !seed.puckData) return;
    if (confirm(`Reset "${page.name}" to the official default template layout? Any unsaved edits will be replaced.`)) {
      const updatedPage: CMSPage = {
        ...page,
        puckData: seed.puckData,
        // Back to the seed: future template updates apply to this page again.
        puckEditedAt: undefined,
        lastEdited: "Just now",
      };
      // Only the editor is reset; nothing goes live until Publish.
      setPage(updatedPage);
      setEditorNonce((n) => n + 1);
      setSavedToast(`Reset "${updatedPage.name}" to the template. Publish to make it live.`);
      setTimeout(() => setSavedToast(null), 3500);
    }
  };

  if (!page) {
    return (
      <div className="flex-1 w-full px-6 py-10">
        {loadError ? (
          <div className="max-w-xl rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            <p className="font-semibold">Could not open the editor</p>
            <p className="mt-1">{loadError}</p>
            <Link href="/admin/pages" className="mt-3 inline-block font-semibold underline">
              Back to pages
            </Link>
          </div>
        ) : (
          <p className="text-[13px] text-gray-500">Loading page from the database…</p>
        )}
      </div>
    );
  }

  return (
    <div data-builder-host className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5 overflow-x-hidden">
      {/* 1. TOP BREADCRUMB & ACTION BAR */}
      <div data-builder-hide className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8e8]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-1.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
            title="Back to Pages List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500 font-medium">Pages /</span>
              <h1 className="text-[18px] sm:text-[20px] font-bold text-[#111111]">
                {page.name}
              </h1>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {page.status}
              </span>
            </div>
            <div className="text-[11px] font-mono text-gray-400 mt-0.5">
              URL: {page.path}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Elementor Mode Switcher */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-[6px] border border-gray-200 text-[12px]">
            <button
              type="button"
              onClick={() => setEditorMode("visual")}
              className={`px-3 py-1 rounded-[5px] font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
                editorMode === "visual"
                  ? "bg-white text-[#009691] shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Edit with Builder</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("seo")}
              className={`px-3 py-1 rounded-[5px] font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
                editorMode === "seo"
                  ? "bg-white text-[#111111] shadow-2xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>SEO &amp; Settings</span>
            </button>
          </div>

          <Link
            href={page.path}
            target="_blank"
            className="h-[34px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-gray-50 text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>Preview Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
          </Link>

          <button
            type="button"
            onClick={handleResetToTemplate}
            className="h-[34px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-gray-50 text-[12px] font-medium text-gray-700 inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Reload official template layout for this page"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Reset Template</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-[34px] px-4 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-[13px] font-semibold inline-flex items-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? "Saving..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {savedToast && (
        <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[1000] w-[min(92vw,520px)] bg-[#dcfae5] border border-[#86efac] text-[#065f46] rounded-[8px] px-4 py-3 flex items-center justify-between gap-3 text-[13px] shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#059669] shrink-0" />
            <span className="font-semibold">{savedToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedToast(null)}
            className="text-[#065f46] hover:text-black font-semibold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorToast && (
        <div role="alert" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[1001] w-[min(92vw,520px)] bg-red-50 border border-red-200 text-red-800 rounded-[8px] px-4 py-3 flex items-center justify-between gap-3 text-[13px] shadow-lg">
          <span className="font-semibold">{errorToast}</span>
          <button
            type="button"
            onClick={() => setErrorToast(null)}
            className="text-red-800 hover:text-black font-semibold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. PUCK VISUAL ON-PAGE EDITOR vs SEO SETTINGS */}
      {editorMode === "visual" ? (
        <PuckPageEditor
          page={page}
          editorNonce={editorNonce}
          onPublishData={handlePuckPublish}
          onUpdatePageField={handleUpdate}
          onExit={() => setEditorMode("seo")}
          onResetTemplate={handleResetToTemplate}
        />
      ) : (
        <PageSeoPanel page={page} onChangeField={handleUpdate} />
      )}
    </div>
  );
}
