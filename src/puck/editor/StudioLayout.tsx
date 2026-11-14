"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Puck, usePuck, type Data } from "@puckeditor/core";
import {
  ArrowLeft,
  Bookmark,
  Check,
  CloudOff,
  ExternalLink,
  History,
  LayoutGrid,
  Layers,
  Maximize2,
  Monitor,
  MousePointerClick,
  Pencil,
  Plus,
  Redo2,
  Save,
  Search,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Tablet,
  Undo2,
  X,
} from "lucide-react";
import AiPanel from "./AiPanel";
import StructurePicker from "./StructurePicker";
import HistoryPanel from "./HistoryPanel";
import TemplatesPanel from "./TemplatesPanel";
import { formatDateTime, formatTime, useAutosave } from "./useAutosave";
import { useBuilderStorage } from "../storage";

/**
 * An extra tab in the left panel supplied by the host app (for example an SEO
 * panel). The builder knows nothing about what it renders.
 */
export type BuilderPanel = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Width of the left panel while this tab is open, in px. */
  width?: number;
  render: (data: Data) => ReactNode;
};

export type StudioLayoutProps = {
  title: string;
  subtitle?: string;
  status?: string;
  onPublish: (data: Data) => void | Promise<void>;
  /** Shown as a back arrow at the top left. */
  onExit?: () => void;
  /** Opens the live page in a new tab. */
  previewHref?: string;
  /** Extra buttons from the host, placed before Publish. */
  headerActions?: ReactNode;
  panels?: BuilderPanel[];
  enableAi?: boolean;
};

const VIEWPORT_BUTTONS = [
  { label: "Desktop", width: 1280 as const, icon: Monitor },
  { label: "Tablet", width: 768 as const, icon: Tablet },
  { label: "Mobile", width: 375 as const, icon: Smartphone },
  { label: "Full width", width: "100%" as const, icon: Maximize2 },
];

const BASE_PANEL_WIDTH = 308;

const iconButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-35 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default";

const pillButton = (active: boolean) =>
  `inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition cursor-pointer ${
    active
      ? "border-[#009691] bg-[#009691]/10 text-[#007f7b]"
      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
  }`;

export default function StudioLayout({
  title,
  subtitle,
  status,
  onPublish,
  onExit,
  previewHref,
  headerActions,
  panels = [],
  enableAi = true,
}: StudioLayoutProps) {
  const { appState, dispatch, selectedItem, history, config } = usePuck();

  const [leftMode, setLeftMode] = useState<string>("widgets");
  const [widgetSearch, setWidgetSearch] = useState("");
  const [showAi, setShowAi] = useState(false);
  // Right-hand panel: the Navigator tree or the revision history, one at a time.
  const [rightPanel, setRightPanel] = useState<"navigator" | "history" | null>(null);
  const showNavigator = rightPanel === "navigator";
  const showHistory = rightPanel === "history";
  const toggleRight = (panel: "navigator" | "history") =>
    setRightPanel((current) => (current === panel ? null : panel));
  const [historyKey, setHistoryKey] = useState(0);
  const [showAddSection, setShowAddSection] = useState(false);
  const [savedIndex, setSavedIndex] = useState<number>(history.index);
  const [justPublished, setJustPublished] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const widgetsRef = useRef<HTMLDivElement | null>(null);

  const content = (appState.data?.content || []) as unknown[];
  const isEmpty = content.length === 0;
  const isDirty = history.index !== savedIndex;
  const isInteractive = appState.ui.previewMode === "interactive";
  const currentWidth = appState.ui.viewports.current.width;
  const selectedId = (selectedItem?.props as { id?: string } | undefined)?.id;
  const selectedLabel = selectedItem
    ? (config.components as Record<string, { label?: string }>)[selectedItem.type]?.label ||
      selectedItem.type
    : null;
  const activePanel = panels.find((p) => p.id === leftMode);

  const { storage, documentId } = useBuilderStorage();
  const autosave = useAutosave({
    data: appState.data as Data,
    dirty: isDirty,
    storage,
    documentId,
  });

  const restoreDraft = () => {
    const draft = autosave.takeDraft();
    if (draft) dispatch({ type: "setData", data: draft.data });
  };
  const panelWidth = activePanel?.width || BASE_PANEL_WIDTH;

  // Elementor behaviour: selecting an element opens its settings in the left
  // panel; clearing the selection returns to the widget list.
  useEffect(() => {
    if (selectedId) {
      setLeftMode("edit");
    } else {
      setLeftMode((mode) => (mode === "edit" ? "widgets" : mode));
    }
  }, [selectedId]);

  // Widget search: hide tiles (and whole categories) that do not match.
  useEffect(() => {
    const root = widgetsRef.current;
    if (!root || leftMode !== "widgets") return;
    const q = widgetSearch.trim().toLowerCase();
    root.querySelectorAll<HTMLElement>("[class*='_ComponentList_']").forEach((group) => {
      let visible = 0;
      group.querySelectorAll<HTMLElement>("[class^='_Drawer_'] > div").forEach((item) => {
        const match = !q || (item.textContent || "").toLowerCase().includes(q);
        item.style.display = match ? "" : "none";
        if (match) visible += 1;
      });
      group.style.display = visible === 0 ? "none" : "";
    });
  }, [widgetSearch, leftMode]);

  const publish = async () => {
    const data = appState.data as Data;
    try {
      await onPublish(data);
      setPublishError(null);
    } catch (e) {
      // The host could not save: keep the page marked unpublished and say so.
      setPublishError(e instanceof Error ? e.message : "Publish failed");
      return;
    }
    // Keep the published version so it can be restored from History.
    await storage.addRevision(documentId, data).catch(() => undefined);
    autosave.markPublished();
    setHistoryKey((k) => k + 1);
    setSavedIndex(history.index);
    setJustPublished(true);
    window.setTimeout(() => setJustPublished(false), 2200);
  };
  const publishRef = useRef(publish);
  publishRef.current = publish;

  // Ctrl/Cmd+S publishes; the page scroll is locked while the studio is open.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void publishRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Warn before closing the tab with unpublished changes.
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const setViewportWidth = (width: number | "100%") => {
    dispatch({
      type: "setUi",
      ui: {
        viewports: {
          ...appState.ui.viewports,
          current: { width, height: "auto" },
        },
      },
    });
  };

  const clearSelection = () => {
    dispatch({ type: "setUi", ui: { itemSelector: null } });
  };

  const leftTabs: Array<{ id: string; label: string; icon: ComponentType<{ className?: string }> }> = [
    { id: "widgets", label: "Widgets", icon: LayoutGrid },
    { id: "templates", label: "Templates", icon: Bookmark },
    { id: "edit", label: selectedItem ? "Edit" : "Page", icon: SlidersHorizontal },
    ...panels.map((p) => ({ id: p.id, label: p.label, icon: p.icon })),
  ];

  return (
    <div className="pb-studio fixed inset-0 z-[200] flex flex-col bg-slate-100 text-gray-900">
      {/* Top bar */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {onExit && (
            <button type="button" onClick={onExit} title="Exit builder" className={iconButton}>
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-bold">{title}</span>
              {status && (
                <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-px text-[10px] font-semibold text-emerald-700 sm:inline">
                  {status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 truncate text-[10.5px] leading-tight text-gray-400">
              {subtitle && <span className="truncate font-mono">{subtitle}</span>}
              {autosave.status === "saving" && <span>· Saving draft...</span>}
              {autosave.status === "saved" && autosave.savedAt && (
                <span title="Unpublished changes are kept in a draft">
                  · Draft saved {formatTime(autosave.savedAt)}
                </span>
              )}
              {autosave.status === "error" && (
                <span className="inline-flex items-center gap-1 text-red-500" title="Publish to keep your changes">
                  <CloudOff className="h-3 w-3" /> Draft not saved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Device preview */}
        <div className="hidden items-center rounded-md border border-gray-200 bg-gray-50 p-0.5 md:flex">
          {VIEWPORT_BUTTONS.map((vp) => {
            const Icon = vp.icon;
            const active = currentWidth === vp.width;
            return (
              <button
                key={vp.label}
                type="button"
                onClick={() => setViewportWidth(vp.width)}
                title={typeof vp.width === "number" ? `${vp.label} (${vp.width}px)` : vp.label}
                className={`inline-flex h-7 w-8 items-center justify-center rounded transition cursor-pointer ${
                  active ? "bg-white text-[#009691] shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 items-center justify-end gap-1.5">
          <button type="button" disabled={!history.hasPast} onClick={() => history.back()} title="Undo (Ctrl+Z)" className={iconButton}>
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" disabled={!history.hasFuture} onClick={() => history.forward()} title="Redo (Ctrl+Shift+Z)" className={iconButton}>
            <Redo2 className="h-4 w-4" />
          </button>

          <span className="mx-1 hidden h-5 w-px bg-gray-200 lg:block" />

          <button
            type="button"
            onClick={() =>
              dispatch({ type: "setUi", ui: { previewMode: isInteractive ? "edit" : "interactive" } })
            }
            title={
              isInteractive
                ? "Back to editing (select and drag blocks)"
                : "Interact with the page (test links, tabs, accordions)"
            }
            className={`hidden lg:inline-flex ${
              isInteractive
                ? "h-8 items-center gap-1.5 rounded-md border border-amber-400 bg-amber-50 px-2.5 text-xs font-semibold text-amber-800 cursor-pointer"
                : pillButton(false)
            }`}
          >
            {isInteractive ? <MousePointerClick className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            <span>{isInteractive ? "Interacting" : "Editing"}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleRight("history")}
            title="Revision history: every published version of this page"
            className={pillButton(showHistory)}
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">History</span>
          </button>

          <button
            type="button"
            onClick={() => toggleRight("navigator")}
            title="Navigator: every section and widget on the page"
            className={pillButton(showNavigator)}
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Navigator</span>
          </button>

          {enableAi && (
            <button type="button" onClick={() => setShowAi((v) => !v)} title="AI assistant" className={pillButton(showAi)}>
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">AI</span>
            </button>
          )}

          {headerActions}

          {previewHref && (
            <a href={previewHref} target="_blank" rel="noreferrer" title="Open the live page in a new tab" className={pillButton(false)}>
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">View page</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => void publish()}
            title="Publish (Ctrl+S)"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#009691] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#007f7b] cursor-pointer"
          >
            {justPublished ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span>{justPublished ? "Published" : "Publish"}</span>
            {isDirty && !justPublished && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" title="Unpublished changes" />
            )}
          </button>
        </div>
      </header>

      {publishError && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800">
          <span>Not published: {publishError}. Your changes are still in the editor.</span>
          <button
            type="button"
            onClick={() => setPublishError(null)}
            title="Dismiss"
            className="rounded p-1 text-red-500 hover:bg-red-100 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {autosave.pendingDraft && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
          <span>
            You have unpublished changes from {formatDateTime(autosave.pendingDraft.savedAt)}.
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="h-7 rounded-md bg-amber-600 px-2.5 font-semibold text-white hover:bg-amber-700 cursor-pointer"
            >
              Restore draft
            </button>
            <button
              type="button"
              onClick={autosave.discardDraft}
              className="h-7 rounded-md border border-amber-300 bg-white px-2.5 font-semibold text-amber-800 hover:bg-amber-100 cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {enableAi && showAi && <AiPanel onClose={() => setShowAi(false)} />}

      {/* Workspace */}
      <div className="flex min-h-0 flex-1">
        {/* Left panel: widgets, element settings, host panels */}
        <aside
          className="flex shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-150"
          style={{ width: panelWidth }}
        >
          <div className="flex shrink-0 border-b border-gray-200">
            {leftTabs.map((tab) => {
              const Icon = tab.icon;
              const active = leftMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLeftMode(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "border-[#009691] text-[#007f7b]"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Widgets stay mounted so drag sources and search state survive tab switches */}
          <div className={leftMode === "widgets" ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
            <div className="shrink-0 space-y-2 border-b border-gray-100 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={widgetSearch}
                  onChange={(e) => setWidgetSearch(e.target.value)}
                  placeholder="Search widgets..."
                  className="h-8 w-full rounded-md border border-gray-200 bg-gray-50 pl-8 pr-7 text-xs text-gray-800 focus:border-[#009691] focus:bg-white focus:outline-none"
                />
                {widgetSearch && (
                  <button
                    type="button"
                    onClick={() => setWidgetSearch("")}
                    title="Clear search"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowAddSection(true)}
                className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#009691]/50 bg-[#009691]/5 text-xs font-semibold text-[#007f7b] transition hover:bg-[#009691]/10 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add section</span>
              </button>
            </div>
            <div ref={widgetsRef} className="pb-widgets min-h-0 flex-1 overflow-y-auto p-3">
              <Puck.Components />
            </div>
          </div>

          {leftMode === "templates" && <TemplatesPanel />}

          {leftMode === "edit" && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
                <span className="truncate text-xs font-bold text-gray-800">
                  {selectedLabel ? `Edit ${selectedLabel}` : "Page settings"}
                </span>
                {selectedItem && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    title="Deselect and go back to widgets"
                    className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="pb-fields min-h-0 flex-1 overflow-y-auto">
                <Puck.Fields />
              </div>
            </div>
          )}

          {activePanel && (
            <div className="min-h-0 flex-1 overflow-y-auto p-3">{activePanel.render(appState.data as Data)}</div>
          )}
        </aside>

        {/* Canvas */}
        <main className="relative flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
            <Puck.Preview />
          </div>

          {isEmpty && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              <div className="pointer-events-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-lg">
                <div className="text-sm font-bold">This page is empty</div>
                <p className="mt-1 text-xs text-gray-500">
                  Start with a section layout, let AI draft the page, or drag any widget from the left.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSection(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#009691] px-3.5 text-xs font-semibold text-white hover:bg-[#007f7b] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add section</span>
                  </button>
                  {enableAi && (
                    <button
                      type="button"
                      onClick={() => setShowAi(true)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#009691]" />
                      <span>Generate with AI</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Navigator */}
        {showNavigator && (
          <aside className="flex w-[264px] shrink-0 flex-col border-l border-gray-200 bg-white">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                <Layers className="h-3.5 w-3.5 text-[#009691]" />
                <span>Navigator</span>
              </div>
              <button
                type="button"
                onClick={() => setRightPanel(null)}
                title="Close navigator"
                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2 text-xs">
              <Puck.Outline />
            </div>
          </aside>
        )}

        {showHistory && <HistoryPanel onClose={() => setRightPanel(null)} refreshKey={historyKey} />}
      </div>

      {/* Add section dialog */}
      {showAddSection && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 p-4"
          onMouseDown={() => setShowAddSection(false)}
        >
          <div className="w-full max-w-2xl" onMouseDown={(e) => e.stopPropagation()}>
            <StructurePicker
              inline
              title="Add a section to the end of the page"
              targetIndex={content.length}
              onClose={() => setShowAddSection(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
