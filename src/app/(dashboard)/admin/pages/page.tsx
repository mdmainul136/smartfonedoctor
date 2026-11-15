"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  INITIAL_CMS_PAGES,
  CMSPage,
  getStoredCMSPages,
  saveStoredCMSPages,
  createCustomPage,
  pathFromName,
  validatePagePath,
} from "@/lib/cmsData";
import {
  getCmsPagesAction,
  upsertCmsPageAction,
  deleteCmsPageAction,
} from "@/actions/cmsPages";
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
  custom: boolean;
};

export default function PagesListPage() {
  const [pages, setPages] = useState<CMSPage[]>(INITIAL_CMS_PAGES);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const router = useRouter();
  const [form, setForm] = useState<PageForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial immediate render from cache
    setPages(getStoredCMSPages());

    // 2. Sync live with PostgreSQL via Server Action
    getCmsPagesAction().then((res) => {
      if (res.success && res.pages && res.pages.length > 0) {
        setPages(res.pages);
        saveStoredCMSPages(res.pages);
      }
    }).catch(console.error);
  }, []);

  /** Saves the list to local cache and synchronizes with PostgreSQL */
  const persist = (next: CMSPage[], targetPage?: CMSPage, deletedId?: string): boolean => {
    saveStoredCMSPages(next);
    setPages(next);

    if (targetPage) {
      upsertCmsPageAction(targetPage).catch((err) => {
        console.error("Failed to sync page to PostgreSQL:", err);
      });
    }

    if (deletedId) {
      deleteCmsPageAction(deletedId).catch((err) => {
        console.error("Failed to delete page from PostgreSQL:", err);
      });
    }

    return true;
  };

  const openAdd = () => {
    setFormError(null);
    setForm({ name: "", path: "/", pathTouched: false, title: "", category: "Core", status: "Draft", custom: true });
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
      custom: Boolean(page.custom),
    });
  };

  const submitForm = () => {
    if (!form) return;
    const name = form.name.trim();
    if (!name) return setFormError("Give the page a name.");
    const current = getStoredCMSPages();

    if (!form.id) {
      const problem = validatePagePath(form.path, current);
      if (problem) return setFormError(problem);
      const page = createCustomPage(name, form.path, form.category);
      if (current.some((p) => p.slug === page.slug)) return setFormError("Another page already uses that address.");
      if (form.title.trim()) page.title = form.title.trim();
      if (!persist([...current, page], page)) return;
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
      ...(form.custom ? { path: form.path } : {}),
      lastEdited: "Just now",
    };
    const next = current.map((p) => (p.id === form.id ? updatedPage : p));
    if (persist(next, updatedPage)) setForm(null);
  };

  const duplicatePage = (page: CMSPage) => {
    const current = getStoredCMSPages();
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
    persist([...current, dupItem], dupItem);
  };

  const deletePage = (page: CMSPage) => {
    if (!page.custom) return;
    if (!window.confirm(`Delete "${page.name}" (${page.path})? This cannot be undone.`)) return;
    persist(getStoredCMSPages().filter((p) => p.id !== page.id), undefined, page.id);
  };

  const filteredPages = pages.filter((page) => {
    const matchCategory = filterCategory === "all" || page.category === filterCategory;
    const matchSearch =
      page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

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
            Manage, edit content, and optimize SEO for all public customer website pages
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

      {/* 3. SHOPIFY / STRAPI STYLE DATA TABLE */}
      <div className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
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
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Draft</span>
                    </span>
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
                    {page.custom ? (
                      <button
                        type="button"
                        onClick={() => deletePage(page)}
                        className="p-1.5 rounded-[4px] hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="p-1.5 text-gray-300" title="Built-in page: it cannot be deleted">
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
            No pages match your search or filter.
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
                  </select>
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

