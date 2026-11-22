"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveTaxonomyAction } from "@/actions/taxonomy";
import type { BlogCategoryTaxonomy } from "@/lib/blogData";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Blog categories (stored in the database). Shown on /blog as filters and
 * picked in the article editor. A category that articles use can't be removed.
 */
export default function BlogCategoriesManager({
  categories,
  usedBy,
  onSaved,
}: {
  categories: BlogCategoryTaxonomy[];
  /** Number of articles per category id. */
  usedBy: Record<string, number>;
  onSaved: (next: BlogCategoryTaxonomy[]) => void;
}) {
  const [rows, setRows] = useState<BlogCategoryTaxonomy[]>(categories);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dirty = JSON.stringify(rows) !== JSON.stringify(categories);

  const update = (i: number, patch: Partial<BlogCategoryTaxonomy>) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const add = () =>
    setRows((prev) => [...prev, { id: `cat-${Date.now().toString(36)}`, slug: "", name: "", description: "" }]);

  const save = async () => {
    const clean = rows.map((r) => ({ ...r, name: r.name.trim(), slug: slugify(r.slug || r.name), description: r.description.trim() }));
    if (clean.some((r) => !r.name)) return setMessage("Every category needs a name.");
    const slugs = clean.map((r) => r.slug);
    if (new Set(slugs).size !== slugs.length) return setMessage("Two categories have the same slug.");
    setBusy(true);
    const res = await saveTaxonomyAction("blog-categories", clean);
    setBusy(false);
    if (!res.success) return setMessage(`Not saved: ${res.error ?? "unknown error"}`);
    setRows(clean);
    onSaved(clean);
    setMessage("Categories saved.");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Categories</h2>
          <p className="text-xs text-gray-500">Shown as filters on /blog and picked in the article editor.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={add}
            className="h-[30px] px-3 rounded-[5px] border border-gray-300 text-xs font-medium inline-flex items-center gap-1 hover:bg-gray-50 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
          <button
            type="button"
            disabled={!dirty || busy}
            onClick={() => void save()}
            className="h-[30px] px-3 rounded-[5px] bg-[#00897b] text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
          >
            {busy ? "Saving…" : "Save categories"}
          </button>
        </div>
      </div>
      {message && <p className="text-xs text-gray-700">{message}</p>}
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => {
          const used = usedBy[r.id] ?? 0;
          return (
            <div key={r.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_auto] gap-2 items-center">
              <input
                value={r.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Name"
                aria-label="Category name"
                className="h-[32px] px-2 rounded-[5px] border border-gray-300 text-xs"
              />
              <input
                value={r.slug}
                onChange={(e) => update(i, { slug: e.target.value })}
                placeholder="slug (from name)"
                aria-label="Category slug"
                className="h-[32px] px-2 rounded-[5px] border border-gray-300 text-xs font-mono"
              />
              <input
                value={r.description}
                onChange={(e) => update(i, { description: e.target.value })}
                placeholder="Short description"
                aria-label="Category description"
                className="h-[32px] px-2 rounded-[5px] border border-gray-300 text-xs"
              />
              <button
                type="button"
                disabled={used > 0}
                onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                title={used > 0 ? `${used} article(s) use this category` : "Remove category"}
                className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
