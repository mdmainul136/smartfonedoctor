"use client";

import { useEffect, useState } from "react";
import { type Data } from "@puckeditor/core";
import { usePuckSelect } from "./puckStore";
import { History, RotateCcw, X } from "lucide-react";
import { useBuilderStorage, type BuilderRevision } from "../storage";
import { formatDateTime } from "./useAutosave";

function countBlocks(data: Data): number {
  return ((data.content || []) as unknown[]).length;
}

/** Published versions of the page, newest first, each one restorable. */
export default function HistoryPanel({
  onClose,
  refreshKey,
}: {
  onClose: () => void;
  /** Changes after every publish so the list reloads. */
  refreshKey: number;
}) {
  const dispatch = usePuckSelect((s) => s.dispatch);
  const { storage, documentId } = useBuilderStorage();
  const [revisions, setRevisions] = useState<BuilderRevision[] | null>(null);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    storage
      .listRevisions(documentId)
      .then((list) => alive && setRevisions(list))
      .catch(() => alive && setRevisions([]));
    return () => {
      alive = false;
    };
  }, [storage, documentId, refreshKey]);

  const restore = (rev: BuilderRevision) => {
    dispatch({ type: "setData", data: rev.data });
    setRestoredId(rev.id);
  };

  return (
    <aside className="flex w-[264px] shrink-0 flex-col border-l border-gray-200 bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
          <History className="h-3.5 w-3.5 text-[#009691]" />
          <span>Revision history</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Close history"
          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 text-xs">
        {revisions === null && <p className="p-2 text-gray-400">Loading...</p>}
        {revisions?.length === 0 && (
          <p className="p-2 leading-relaxed text-gray-500">
            No versions yet. Every time you publish, the page is saved here and can be restored.
          </p>
        )}
        <ul className="space-y-1">
          {revisions?.map((rev, i) => (
            <li
              key={rev.id}
              className="group flex items-center justify-between gap-2 rounded-md border border-transparent px-2 py-2 hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                  <span className="truncate">{formatDateTime(rev.createdAt)}</span>
                  {i === 0 && (
                    <span className="rounded bg-emerald-50 px-1 py-px text-[10px] font-semibold text-emerald-700">
                      Live
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-500">
                  {rev.label || "Published"}
                  {rev.author ? ` by ${rev.author}` : ""} · {countBlocks(rev.data)} sections
                </div>
              </div>
              <button
                type="button"
                onClick={() => restore(rev)}
                title="Load this version into the editor. Publish to make it live; Undo to go back."
                className="inline-flex shrink-0 items-center gap-1 rounded border border-gray-200 bg-white px-1.5 py-1 text-[11px] font-semibold text-gray-700 opacity-0 transition group-hover:opacity-100 hover:border-[#009691] hover:text-[#007f7b] cursor-pointer focus:opacity-100"
              >
                <RotateCcw className="h-3 w-3" />
                {restoredId === rev.id ? "Loaded" : "Restore"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {restoredId && (
        <p className="shrink-0 border-t border-gray-100 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-800">
          Version loaded into the editor. Publish to make it live, or press Undo to go back.
        </p>
      )}
    </aside>
  );
}
