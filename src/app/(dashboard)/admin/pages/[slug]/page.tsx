"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INITIAL_CMS_PAGES, CMSPage, getStoredCMSPages, saveStoredCMSPages } from "@/lib/cmsData";
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Check,
  Globe,
  Sparkles,
  PenTool,
  RotateCcw,
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

  const initialPage =
    INITIAL_CMS_PAGES.find((p) => p.slug === slug) ||
    INITIAL_CMS_PAGES[0];

  const [page, setPage] = useState<CMSPage>(initialPage);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"visual" | "seo">("visual");
  // Bumped whenever the builder must reload from `page` (stored page loaded, template reset).
  const [editorNonce, setEditorNonce] = useState(0);

  useEffect(() => {
    const list = getStoredCMSPages();
    const found = list.find((p) => p.slug === slug);
    if (found) {
      setPage(found);
      setEditorNonce((n) => n + 1);
    }
  }, [slug]);

  const handleUpdate = (field: keyof CMSPage, value: any) => {
    setPage((prev) => ({ ...prev, [field]: value, lastEdited: "Just now" }));
  };

  const handleSave = () => {
    setIsSaving(true);
    const allPages = getStoredCMSPages();
    const updated = allPages.map((p) =>
      p.id === page.id || p.slug === page.slug
        ? { ...page, lastEdited: "Just now" }
        : p
    );
    saveStoredCMSPages(updated);

    setTimeout(() => {
      setIsSaving(false);
      setSavedToast(`Changes & SEO metadata published for "${page.name}"!`);
      setTimeout(() => setSavedToast(null), 3500);
    }, 400);
  };

  const handlePuckPublish = (data: PuckPageData) => {
    const updatedPage: CMSPage = {
      ...page,
      puckData: data as unknown as Record<string, unknown>,
      puckEditedAt: Date.now(),
      lastEdited: "Just now",
    };
    setPage(updatedPage);
    const allPages = getStoredCMSPages();
    const updated = allPages.map((p) =>
      p.id === updatedPage.id || p.slug === updatedPage.slug ? updatedPage : p
    );
    if (!saveStoredCMSPages(updated)) {
      // Throwing makes the builder keep the page marked unpublished.
      setSavedToast("Could not save: browser storage is full. Delete unused media or templates and publish again.");
      setTimeout(() => setSavedToast(null), 6000);
      throw new Error("Browser storage is full");
    }
    setSavedToast(`Puck layout published for "${updatedPage.name}"!`);
    setTimeout(() => setSavedToast(null), 3500);
  };

  const handleResetToTemplate = () => {
    const seed = INITIAL_CMS_PAGES.find((p) => p.slug === slug || p.id === page.id);
    if (!seed || !seed.puckData) return;
    if (confirm(`Reset "${page.name}" to the official default template layout? Any unsaved edits will be replaced.`)) {
      const updatedPage: CMSPage = {
        ...page,
        puckData: seed.puckData,
        // Back to the seed: future template updates apply to this page again.
        puckEditedAt: undefined,
        lastEdited: "Just now",
      };
      setPage(updatedPage);
      setEditorNonce((n) => n + 1);
      const allPages = getStoredCMSPages();
      const updated = allPages.map((p) =>
        p.id === updatedPage.id || p.slug === updatedPage.slug ? updatedPage : p
      );
      saveStoredCMSPages(updated);
      setSavedToast(`Reset "${updatedPage.name}" to default template layout!`);
      setTimeout(() => setSavedToast(null), 3500);
    }
  };

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
              <Sparkles className="w-3.5 h-3.5" />
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
        <div data-builder-hide className="bg-[#dcfae5] border border-[#86efac] text-[#065f46] rounded-[8px] px-4 py-3 flex items-center justify-between gap-3 text-[13px] shadow-sm animate-in fade-in">
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
