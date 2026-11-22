"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CMSPage,
  builderLayoutStatus,
  createCustomPage,
  pathFromName,
  validatePagePath,
} from "@/lib/cmsData";
import {
  getCmsPagesAction,
  upsertCmsPageAction,
  deleteCmsPageAction,
} from "@/actions/cmsPages";
import { getCurrentAdminAction } from "@/actions/auth";
import { canPublish } from "@/lib/roles";
import {
  FileText,
  Search,
  Plus,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Pencil,
  Copy,
  Trash2,
  Settings2,
  Lock,
  X,
} from "lucide-react";

const CATEGORIES: CMSPage["category"][] = ["Core", "Repairs", "Utility", "Legal"];

type PageForm = {
  /** Set when editing an existing page; empty when adding one. */
  id?: string;
  name: string;
  path: string;
  /** False until the user types an address themselves, so it follows the name. */
  pathTouched: boolean;
  title: string;
  category: CMSPage["category"];
  status: CMSPage["status"];
  /** Local date-time (yyyy-mm-ddThh:mm) for a Scheduled page. */
  scheduledLocal: string;
  custom: boolean;
};

/** ISO → value for <input type="datetime-local"> (the admin's own time zone). */
function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PagesListPage() {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Bulk actions: ids of the checked rows.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  // Editors (non-admin roles) save drafts only; the server enforces this too.
  const [isPublisher, setIsPublisher] = useState(true);
  useEffect(() => {
    getCurrentAdminAction()
      .then((a) => setIsPublisher(canPublish(a?.role)))
      .catch(() => undefined);
  }, []);

  const router = useRouter();
  const [form, setForm] = useState<PageForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // The database is the only source of truth for the page list.
  useEffect(() => {
    getCmsPagesAction()
      .then((res) => {
        if (res.success) setPages(res.pages);
        else setListError(`Could not load pages from the database: ${res.error ?? "unknown error"}`);
      })
      .catch((err: unknown) => setListError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  /** Writes to the database first; the list only changes when the write succeeded. */
  const persist = async (next: CMSPage[], targetPage?: CMSPage, deletedId?: string): Promise<boolean> => {
    setListError(null);
    try {
      if (targetPage) {
        const res = await upsertCmsPageAction(targetPage);
        if (!res.success) throw new Error(res.error);
        if (res.page) next = next.map((p) => (p.slug === targetPage.slug ? res.page! : p));
      }
      if (deletedId) {
        const res = await deleteCmsPageAction(deletedId);
        if (!res.success) throw new Error(res.error);
      }
    } catch (err) {
      setListError(`Not saved: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
    setPages(next);
    return true;
  };

  const openAdd = () => {
    setFormError(null);
    setForm({ name: "", path: "/", pathTouched: false, title: "", category: "Core", status: "Draft", scheduledLocal: "", custom: true });
  };

  const openSettings = (page: CMSPage) => {
    setFormError(null);
    setForm({
      id: page.id,
      name: page.name,
      path: page.path,
      pathTouched: true,
      title: page.title,
      category: page.category,
      status: page.status,
      scheduledLocal: toLocalInput(page.scheduledAt),
      custom: Boolean(page.custom),
    });
  };

  const submitForm = async () => {
    if (!form) return;
    const name = form.name.trim();
    if (!name) return setFormError("Give the page a name.");
    const current = pages;

    if (!form.id) {
      const problem = validatePagePath(form.path, current);
      if (problem) return setFormError(problem);
      const page = createCustomPage(name, form.path, form.category);
      if (current.some((p) => p.slug === page.slug)) return setFormError("Another page already uses that address.");
      if (form.title.trim()) page.title = form.title.trim();
      if (!(await persist([...current, page], page))) return;
      setForm(null);
      router.push(`/admin/pages/${page.slug}`);
      return;
    }

    // Built-in pages keep their address: it is fixed by the site's code.
    if (form.custom) {
      const problem = validatePagePath(form.path, current, form.id);
      if (problem) return setFormError(problem);
    }
    const target = current.find((p) => p.id === form.id);
    if (!target) return;
    const updatedPage: CMSPage = {
      ...target,
      name,
      title: form.title.trim() || target.title,
      category: form.category,
      status: form.status,
      scheduledAt: form.status === "Scheduled" && form.scheduledLocal ? new Date(form.scheduledLocal).toISOString() : undefined,
      ...(form.custom ? { path: form.path } : {}),
      lastEdited: "Just now",
    };
    const next = current.map((p) => (p.id === form.id ? updatedPage : p));
    if (await persist(next, updatedPage)) setForm(null);
  };

  const duplicatePage = (page: CMSPage) => {
    const current = pages;
    let n = 2;
    let path = `${page.path === "/" ? "/home" : page.path}-copy`;
    while (validatePagePath(path, current) || current.some((p) => p.slug === path.slice(1).replace(/\//g, "-"))) {
      path = `${page.path === "/" ? "/home" : page.path}-copy-${n++}`;
      if (n > 50) return;
    }
    const copy = createCustomPage(`${page.name} (copy)`, path, page.category);
    const dupItem: CMSPage = {
      ...page,
      id: copy.id,
      slug: copy.slug,
      path,
      name: copy.name,
      status: "Draft",
      lastEdited: "Just now",
      puckEditedAt: Date.now(),
      custom: true,
    };
    void persist([...current, dupItem], dupItem);
  };

  const deletePage = (page: CMSPage) => {
    if (!page.custom) return;
    if (!window.confirm(`Delete "${page.name}" (${page.path})? This cannot be undone.`)) return;
    void persist(pages.filter((p) => p.id !== page.id), undefined, page.id);
  };

  const filteredPages = pages.filter((page) => {
    const matchCategory = filterCategory === "all" || page.category === filterCategory;
    const matchSearch =
      page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  }).sort((a, b) => Number(a.status === "Archived") - Number(b.status === "Archived"));

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allShownSelected = filteredPages.length > 0 && filteredPages.every((p) => selected.has(p.id));
  const toggleAllShown = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of filteredPages) {
        if (allShownSelected) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });

  /** Sets one status on every checked page, one save at a time (same checks as a single save). */
  const bulkSetStatus = async (status: "Published" | "Draft") => {
    const targets = pages.filter((p) => selected.has(p.id) && p.status !== status);
    if (targets.length === 0) return setSelected(new Set());
    const verb = status === "Published" ? "Publish" : "Move to draft";
    if (!window.confirm(`${verb}: ${targets.length} page(s)?`)) return;
    setBulkBusy(true);
    setListError(null);
    let next = pages;
    const failed: string[] = [];
    for (const page of targets) {
      try {
        const res = await upsertCmsPageAction({ ...page, status, scheduledAt: undefined });
        if (!res.success) throw new Error(res.error);
        const saved = res.page ?? { ...page, status };
        next = next.map((p) => (p.id === page.id ? saved : p));
      } catch (err) {
        failed.push(`${page.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    setPages(next);
    setBulkBusy(false);
    setSelected(new Set());
    if (failed.length) setListError(`Not saved: ${failed.join("; ")}`);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5 overflow-x-hidden">
      {/* 1. TOP TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8e8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] sm:text-[24px] font-bold text-[#111111] tracking-[-0.02em]">
              Pages
            </h1>
            <span className="text-[12px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              {pages.length} total
            </span>
          </div>
          <p className="text-[13px] text-[#5f6368] mt-0.5">
            Every page on the website: edit content, SEO and publishing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="h-[34px] px-3.5 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
          </Link>

          <button
            type="button"
            onClick={openAdd}
            className="h-[34px] px-3.5 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add page</span>
          </button>
        </div>
      </div>

      {listError && (
        <div role="alert" className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-800">
          {listError}
        </div>
      )}

      {/* 2. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white border border-[#e8e8e8] rounded-[8px] p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Pages" },
            { id: "Core", label: "Core Site" },
            { id: "Repairs", label: "Repair Services" },
            { id: "Utility", label: "Utility & Booking" },
            { id: "Legal", label: "Legal" },
            { id: "Template", label: "Templates" },
            { id: "Global", label: "Global blocks" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`h-[30px] px-3 rounded-[5px] text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterCategory === cat.id
                  ? "bg-[#111111] text-white font-semibold"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter pages by title or /path..."
            className="w-full h-[32px] pl-8 pr-3 rounded-[6px] border border-[#d1d5db] bg-white text-[12px] focus:outline-none focus:border-[#009691]"
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-[8px] border border-[#009691]/30 bg-[#009691]/5 px-3 py-2 text-[12px]">
          <span className="font-semibold text-[#111111]">{selected.size} selected</span>
          {!isPublisher && <span className="text-gray-600">Only an admin can publish or unpublish pages.</span>}
          {isPublisher && (<>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => void bulkSetStatus("Published")}
            className="h-[28px] px-3 rounded-[5px] bg-[#009691] hover:bg-[#007f7b] text-white font-semibold disabled:opacity-50 cursor-pointer"
          >
            Publish
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => void bulkSetStatus("Draft")}
            className="h-[28px] px-3 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-gray-50 font-medium disabled:opacity-50 cursor-pointer"
          >
            Move to draft
          </button>
          </>)}
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => setSelected(new Set())}
            className="h-[28px] px-2 text-gray-600 hover:text-[#111111] cursor-pointer"
          >
            Clear
          </button>
          {bulkBusy && <span className="text-gray-500">Saving…</span>}
        </div>
      )}

      {/* 3. SHOPIFY / STRAPI STYLE DATA TABLE */}
      <div className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3 pl-4 pr-0 w-[32px]">
                <input
                  type="checkbox"
                  aria-label="Select all shown pages"
                  checked={allShownSelected}
                  onChange={toggleAllShown}
                  className="accent-[#009691] cursor-pointer"
                />
              </th>
              <th className="py-3 px-4">Page Title &amp; Path</th>
              <th className="py-3 px-4 hidden md:table-cell">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 hidden lg:table-cell">Last Modified</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f2f2f2] text-[13px]">
            {filteredPages.map((page) => (
              <tr
                key={page.id}
                className="hover:bg-[#f9fafb] transition-colors group"
              >
                <td className="py-3 pl-4 pr-0 align-top">
                  <input
                    type="checkbox"
                    aria-label={`Select ${page.name}`}
                    checked={selected.has(page.id)}
                    onChange={() => toggleRow(page.id)}
                    className="accent-[#009691] cursor-pointer mt-0.5"
                  />
                </td>
                {/* Title & Route */}
                <td className="py-3 px-4">
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0 group-hover:text-[#009691] transition-colors" />
                    <div className="min-w-0">
                      <Link
                        href={`/admin/pages/${page.slug}`}
                        className="font-semibold text-[#111111] hover:text-[#009691] transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{page.name}</span>
                      </Link>
                      <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                        {page.path}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-4 hidden md:table-cell">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      page.category === "Repairs"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : page.category === "Core"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {page.category}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  {page.status === "Published" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Published</span>
                    </span>
                  ) : page.status === "Scheduled" ? (
                    <span
                      title={builderLayoutStatus(page).note}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200"
                    >
                      <Clock className="w-3 h-3 text-sky-600" />
                      <span>Scheduled</span>
                    </span>
                  ) : page.status === "Archived" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                      <span>Archived</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Draft</span>
                    </span>
                  )}
                  {page.status === "Published" && builderLayoutStatus(page).note && (!builderLayoutStatus(page).live || page.category === "Template") && (
                    <div className="mt-1 max-w-[190px] text-[10.5px] leading-snug text-gray-500">
                      {builderLayoutStatus(page).note}
                    </div>
                  )}
                </td>

                {/* Last Modified */}
                <td className="py-3 px-4 hidden lg:table-cell text-[12px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{page.lastEdited}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">by {page.author}</span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={page.path}
                      target="_blank"
                      className="p-1.5 rounded-[4px] hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
                      title="View live page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => openSettings(page)}
                      className="p-1.5 rounded-[4px] hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
                      title="Page settings"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicatePage(page)}
                      className="p-1.5 rounded-[4px] hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
                      title="Duplicate as a new draft"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {page.custom && isPublisher ? (
                      <button
                        type="button"
                        onClick={() => deletePage(page)}
                        className="p-1.5 rounded-[4px] hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span
                        className="p-1.5 text-gray-300"
                        title={page.custom ? "Only an admin can delete pages" : "Built-in page: it cannot be deleted"}
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <Link
                      href={`/admin/pages/${page.slug}`}
                      className="h-[28px] px-2.5 rounded-[5px] bg-white border border-[#d1d5db] hover:border-[#111111] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <Pencil className="w-3 h-3 text-gray-500" />
                      <span>Edit</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPages.length === 0 && (
          <div className="py-12 text-center text-gray-500 text-[13px]">
            {loading ? "Loading pages from the database…" : "No pages match your search or filter."}
          </div>
        )}
      </div>

      {/* ADD PAGE / PAGE SETTINGS */}
      {form && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={() => setForm(null)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              submitForm();
            }}
            className="w-full max-w-md rounded-[10px] bg-white p-5 shadow-xl flex flex-col gap-3.5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#111111]">{form.id ? "Page settings" : "Add page"}</h2>
              <button type="button" onClick={() => setForm(null)} className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer" title="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="flex flex-col gap-1 text-[12px] font-semibold text-gray-700">
              Page name
              <input
                autoFocus
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({ ...form, name, path: form.pathTouched ? form.path : pathFromName(name) });
                }}
                placeholder="Summer offer"
                className="h-[34px] rounded-[6px] border border-[#d1d5db] px-2.5 text-[13px] font-normal focus:outline-none focus:border-[#009691]"
              />
            </label>

            <label className="flex flex-col gap-1 text-[12px] font-semibold text-gray-700">
              Address (URL)
              <input
                value={form.path}
                disabled={!form.custom}
                onChange={(e) => setForm({ ...form, path: e.target.value.toLowerCase(), pathTouched: true })}
                placeholder="/summer-offer"
                className="h-[34px] rounded-[6px] border border-[#d1d5db] px-2.5 text-[13px] font-mono font-normal focus:outline-none focus:border-[#009691] disabled:bg-gray-50 disabled:text-gray-500"
              />
              {!form.custom && (
                <span className="text-[11px] font-normal text-gray-500">Built-in page: its address is fixed.</span>
              )}
            </label>

            <label className="flex flex-col gap-1 text-[12px] font-semibold text-gray-700">
              Browser title (SEO)
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={form.name ? `${form.name} | SmartFoneDoctor` : "Shown in the browser tab and in Google"}
                className="h-[34px] rounded-[6px] border border-[#d1d5db] px-2.5 text-[13px] font-normal focus:outline-none focus:border-[#009691]"
              />
            </label>

            <div className="flex gap-3">
              <label className="flex flex-1 flex-col gap-1 text-[12px] font-semibold text-gray-700">
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as CMSPage["category"] })}
                  className="h-[34px] rounded-[6px] border border-[#d1d5db] px-2 text-[13px] font-normal focus:outline-none focus:border-[#009691]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              {form.id && (
                <label className="flex flex-1 flex-col gap-1 text-[12px] font-semibold text-gray-700">
                  Status
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as CMSPage["status"] })}
                    className="h-[34px] rounded-[6px] border border-[#d1d5db] px-2 text-[13px] font-normal focus:outline-none focus:border-[#009691]"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Archived">Archived</option>
                  </select>
                </label>
              )}
              {form.id && form.status === "Scheduled" && (
                <label className="flex flex-1 flex-col gap-1 text-[12px] font-semibold text-gray-700">
                  Goes live at
                  <input
                    type="datetime-local"
                    value={form.scheduledLocal}
                    onChange={(e) => setForm({ ...form, scheduledLocal: e.target.value })}
                    className="h-[34px] rounded-[6px] border border-[#d1d5db] px-2 text-[13px] font-normal focus:outline-none focus:border-[#009691]"
                  />
                </label>
              )}
            </div>

            {formError && <p className="text-[12px] font-medium text-red-600">{formError}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="h-[34px] px-3.5 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-medium text-[#111111] hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[34px] px-3.5 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-[13px] font-semibold cursor-pointer"
              >
                {form.id ? "Save" : "Create and open editor"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

