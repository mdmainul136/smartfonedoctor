"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, ExternalLink, Plus, Search, Trash2 } from "lucide-react";

export const CATEGORY_OPTIONS = [
  { value: "smartphone", label: "Smartphone" },
  { value: "tablet", label: "Tablet" },
  { value: "computer", label: "Computer" },
  { value: "console", label: "Console" },
];

export const inputCls =
  "h-[34px] w-full rounded-[6px] border border-[#d1d5db] bg-white px-2.5 text-[13px] focus:outline-none focus:border-sfd-teal";
export const areaCls =
  "w-full rounded-[6px] border border-[#d1d5db] bg-white px-2.5 py-2 text-[13px] leading-relaxed focus:outline-none focus:border-sfd-teal";
export const labelCls = "flex flex-col gap-1 text-[12px] font-semibold text-gray-700";

export const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type Item = { slug: string; category: string; name?: string };

/**
 * List on the left, edit form on the right, one Save button for the whole list.
 * Used by the Devices and Repair types editors.
 */
export function CatalogShell<T extends Item>({
  title,
  description,
  items,
  savedSlugs,
  dirty,
  saving,
  message,
  onAdd,
  onDelete,
  onSave,
  renderRow,
  renderForm,
  viewHref,
  addLabel,
  getName = (item) => item.name ?? "",
  getKey = (item) => item.slug,
}: {
  title: string;
  description: string;
  items: T[];
  /** Keys that exist on the live site (their URLs are fixed). */
  savedSlugs: Set<string>;
  dirty: boolean;
  saving: boolean;
  message: { kind: "ok" | "error"; text: string } | null;
  onAdd: () => T;
  onDelete: (index: number) => void;
  onSave: () => void;
  renderRow: (item: T) => ReactNode;
  renderForm: (item: T, index: number, isNew: boolean) => ReactNode;
  viewHref: (item: T) => string | null;
  addLabel: string;
  /** Display name of an item (default: its `name`). */
  getName?: (item: T) => string;
  /** Unique lookup key matching savedSlugs (default: `item.slug`). */
  getKey?: (item: T) => string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<number>(0);

  const visible = useMemo(
    () =>
      items
        .map((item, index) => ({ item, index }))
        .filter(
          ({ item }) =>
            (category === "all" || item.category === category) &&
            (getName(item) + " " + item.slug).toLowerCase().includes(query.toLowerCase())
        ),
    [items, query, category, getName]
  );

  const current = items[selected];
  const isNew = current ? !savedSlugs.has(getKey(current)) : false;
  const href = current && !isNew ? viewHref(current) : null;

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8e8]">
        <div>
          <h1 className="text-[22px] font-bold text-[#111111] tracking-[-0.02em]">{title}</h1>
          <p className="text-[12.5px] text-gray-500 mt-0.5 max-w-2xl">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-[12px] font-semibold text-amber-700">Unsaved changes</span>}
          <button
            type="button"
            onClick={() => {
              onAdd();
              setSelected(items.length);
              setQuery("");
              setCategory("all");
            }}
            className="h-[34px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-gray-50 text-[12px] font-semibold text-gray-800 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {addLabel}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving}
            className="h-[34px] px-4 rounded-[6px] bg-sfd-teal hover:bg-sfd-tealDark text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            <Check className="w-3.5 h-3.5" />
            {saving ? "Saving…" : "Save & publish"}
          </button>
        </div>
      </div>

      {message && (
        <div
          role={message.kind === "error" ? "alert" : "status"}
          className={`rounded-[8px] border px-4 py-2.5 text-[13px] font-medium ${
            message.kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 items-start">
        <div className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden">
          <div className="p-2.5 border-b border-[#eee] flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className={`${inputCls} pl-8`}
              />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputCls} w-[120px]`}>
              <option value="all">All</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <ul className="max-h-[70vh] overflow-y-auto divide-y divide-[#f1f1f1]">
            {visible.map(({ item, index }) => (
              <li key={`${item.slug}-${index}`}>
                <button
                  type="button"
                  onClick={() => setSelected(index)}
                  className={`w-full text-left px-3 py-2.5 text-[13px] cursor-pointer ${
                    index === selected ? "bg-teal-50" : "hover:bg-gray-50"
                  }`}
                >
                  {renderRow(item)}
                  {!savedSlugs.has(getKey(item)) && (
                    <span className="ml-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">NEW</span>
                  )}
                </button>
              </li>
            ))}
            {visible.length === 0 && <li className="px-3 py-6 text-center text-[12px] text-gray-500">Nothing matches.</li>}
          </ul>
        </div>

        {current ? (
          <div className="bg-white border border-[#e8e8e8] rounded-[8px] p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[16px] font-bold text-gray-900">{getName(current) || "Untitled"}</h2>
              <div className="flex items-center gap-2">
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 px-2.5 rounded-[6px] border border-[#d1d5db] text-[12px] font-semibold text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50"
                  >
                    View page <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const warn = isNew
                      ? `Remove "${getName(current)}"?`
                      : `Delete "${getName(current)}"? Its pages on the site will stop working (404) after you save. Old links and Google results to them will break.`;
                    if (!window.confirm(warn)) return;
                    onDelete(selected);
                    setSelected(Math.max(0, selected - 1));
                  }}
                  className="h-8 px-2.5 rounded-[6px] border border-red-200 text-[12px] font-semibold text-red-700 inline-flex items-center gap-1.5 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
            {renderForm(current, selected, isNew)}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-[#ddd] rounded-[8px] p-10 text-center text-[13px] text-gray-500">
            Nothing here yet.
          </div>
        )}
      </div>
    </div>
  );
}

/** Edit a list of strings, one per line. */
export function LinesField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
}) {
  return (
    <label className={labelCls}>
      <span>
        {label} <span className="font-normal text-gray-400">(one per line)</span>
      </span>
      <textarea
        rows={Math.max(3, value.length + 1)}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        className={areaCls}
      />
      {hint && <span className="font-normal text-[11px] text-gray-400">{hint}</span>}
    </label>
  );
}

/** Edit a list of two-field items (title/description, question/answer). */
export function PairsField<K1 extends string, K2 extends string>({
  label,
  value,
  onChange,
  k1,
  k2,
  l1,
  l2,
}: {
  label: string;
  value: Record<K1 | K2, string>[];
  onChange: (v: Record<K1 | K2, string>[]) => void;
  k1: K1;
  k2: K2;
  l1: string;
  l2: string;
}) {
  const set = (i: number, k: K1 | K2, v: string) => onChange(value.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  return (
    <div className={labelCls}>
      <span>{label}</span>
      <div className="flex flex-col gap-2">
        {value.map((row, i) => (
          <div key={i} className="rounded-[6px] border border-[#e5e7eb] p-2.5 flex flex-col gap-1.5 bg-gray-50/50">
            <input value={row[k1]} onChange={(e) => set(i, k1, e.target.value)} placeholder={l1} className={inputCls} />
            <textarea
              value={row[k2]}
              onChange={(e) => set(i, k2, e.target.value)}
              placeholder={l2}
              rows={2}
              className={areaCls}
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="self-end text-[11px] font-semibold text-red-700 hover:underline cursor-pointer"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...value, { [k1]: "", [k2]: "" } as Record<K1 | K2, string>])}
          className="self-start text-[12px] font-semibold text-sfd-teal hover:underline cursor-pointer"
        >
          + Add
        </button>
      </div>
    </div>
  );
}
