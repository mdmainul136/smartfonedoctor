"use client";

import { useEffect, useState } from "react";
import { type ComponentData } from "@puckeditor/core";
import { usePuckSelect } from "./puckStore";
import { Bookmark, BookmarkPlus, Plus, Trash2 } from "lucide-react";
import { useBuilderStorage, type BuilderTemplate } from "../storage";
import { cloneWithNewIds } from "../core/tree";
import { formatDateTime } from "./useAutosave";

/**
 * Saved sections the user can drop into any page. Templates are saved from the
 * right-click menu on the canvas ("Save as template") or here for the whole page.
 */
export default function TemplatesPanel() {
  const puckData = usePuckSelect((s) => s.appState.data);
  const dispatch = usePuckSelect((s) => s.dispatch);
  const config = usePuckSelect((s) => s.config);
  const { storage } = useBuilderStorage();
  const [templates, setTemplates] = useState<BuilderTemplate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastInserted, setLastInserted] = useState<string | null>(null);

  const reload = () =>
    storage
      .listTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]));

  useEffect(() => {
    void reload();
    // Reload whenever the canvas saves a template from its context menu.
    const onSaved = () => void reload();
    window.addEventListener("pb:templates-changed", onSaved);
    return () => window.removeEventListener("pb:templates-changed", onSaved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storage]);

  const content = (puckData.content || []) as ComponentData[];

  const insert = (template: BuilderTemplate) => {
    dispatch({
      type: "setData",
      data: {
        ...puckData,
        content: [...content, ...template.content.map(cloneWithNewIds)],
      },
    });
    setLastInserted(template.id);
    window.setTimeout(() => setLastInserted(null), 1800);
  };

  const remove = async (template: BuilderTemplate) => {
    if (!window.confirm(`Delete the template "${template.name}"? Pages already using it keep their copy.`)) return;
    await storage.deleteTemplate(template.id);
    void reload();
  };

  const savePage = async () => {
    if (content.length === 0) return;
    const name = window.prompt("Name this page template", "Full page");
    if (!name?.trim()) return;
    try {
      await storage.saveTemplate(name.trim(), content);
      setError(null);
      void reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the template");
    }
  };

  const labelOf = (type: string) =>
    (config.components as Record<string, { label?: string }>)[type]?.label || type;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-gray-100 p-3">
        <button
          type="button"
          onClick={() => void savePage()}
          disabled={content.length === 0}
          className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#009691]/50 bg-[#009691]/5 text-xs font-semibold text-[#007f7b] transition hover:bg-[#009691]/10 disabled:opacity-40 cursor-pointer disabled:cursor-default"
        >
          <BookmarkPlus className="h-3.5 w-3.5" />
          <span>Save this page as a template</span>
        </button>
        <p className="mt-2 text-[11px] leading-snug text-gray-500">
          To save one section, right-click it on the canvas and choose Save as template.
        </p>
        {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {templates === null && <p className="text-xs text-gray-400">Loading...</p>}
        {templates?.length === 0 && (
          <div className="rounded-lg border border-gray-200 p-4 text-center">
            <Bookmark className="mx-auto h-5 w-5 text-gray-300" />
            <p className="mt-2 text-xs font-semibold text-gray-700">No saved templates yet</p>
            <p className="mt-1 text-[11px] leading-snug text-gray-500">
              Build a section once, save it, and reuse it on any page.
            </p>
          </div>
        )}
        <ul className="space-y-2">
          {templates?.map((t) => (
            <li key={t.id} className="group rounded-lg border border-gray-200 bg-white p-2.5 hover:border-[#009691]/60">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-gray-800">{t.name}</div>
                  <div className="truncate text-[11px] text-gray-500">
                    {t.content.length === 1
                      ? labelOf(t.content[0].type)
                      : `${t.content.length} sections`}{" "}
                    · {formatDateTime(t.createdAt)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(t)}
                  title="Delete template"
                  className="rounded p-1 text-gray-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 cursor-pointer focus:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => insert(t)}
                className="mt-2 flex h-7 w-full items-center justify-center gap-1 rounded-md bg-gray-50 text-[11px] font-semibold text-gray-700 transition hover:bg-[#009691] hover:text-white cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                {lastInserted === t.id ? "Added to the end of the page" : "Insert at end of page"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
