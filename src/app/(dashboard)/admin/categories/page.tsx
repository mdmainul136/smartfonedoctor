"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  X,
  Smartphone,
  Tablet,
  Gamepad2,
  Laptop,
  Copy,
  ChevronRight,
  Layers,
} from "lucide-react";
import {
  DeviceCategory,
} from "@/lib/taxonomy";
import { getTaxonomyAction, saveTaxonomyAction } from "@/actions/taxonomy";

function getCategoryIconInfo(slug: string) {
  switch (slug) {
    case "smartphone":
      return {
        icon: Smartphone,
        color: "text-sky-700",
        bg: "bg-sky-50",
        border: "border-sky-200/70",
      };
    case "tablet":
      return {
        icon: Tablet,
        color: "text-indigo-700",
        bg: "bg-indigo-50",
        border: "border-indigo-200/70",
      };
    case "console":
      return {
        icon: Gamepad2,
        color: "text-purple-700",
        bg: "bg-purple-50",
        border: "border-purple-200/70",
      };
    case "computer":
      return {
        icon: Laptop,
        color: "text-slate-700",
        bg: "bg-slate-100",
        border: "border-slate-200/70",
      };
    default:
      return {
        icon: FolderTree,
        color: "text-[#009691]",
        bg: "bg-teal-50",
        border: "border-teal-200/70",
      };
  }
}

export default function CategoriesCRUDPage() {
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DeviceCategory | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<DeviceCategory>>({
    name: "",
    pluralName: "",
    slug: "smartphone",
    url: "",
    description: "",
    icon: "Smartphone",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getTaxonomyAction<DeviceCategory>("categories")
      .then((res) => {
        if (mounted && res.success && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(console.error);

    return () => {
      mounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      pluralName: "",
      slug: "smartphone",
      url: "/repairs/",
      description: "",
      icon: "Smartphone",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: DeviceCategory) => {
    setEditingCategory(cat);
    setFormData({ ...cat });
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({
      ...prev,
      name: val,
      pluralName: prev.pluralName || `${val}s`,
      url: `/repairs/${slug}`,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    let updated: DeviceCategory[];
    if (editingCategory) {
      updated = categories.map((c) =>
        c.id === editingCategory.id ? ({ ...c, ...formData } as DeviceCategory) : c
      );
      showToast(`Updated "${formData.name}"`);
    } else {
      const newCat: DeviceCategory = {
        id: `cat-${Date.now()}`,
        name: formData.name || "",
        pluralName: formData.pluralName || `${formData.name}s`,
        slug: (formData.slug as any) || "smartphone",
        url: formData.url || `/repairs/${formData.slug}`,
        description: formData.description || "",
        icon: formData.icon || "FolderTree",
      };
      updated = [...categories, newCat];
      showToast(`Added category "${formData.name}"`);
    }

    // The database is the only copy: the list changes only when the save worked.
    const res = await saveTaxonomyAction("categories", updated).catch((err: unknown) => ({ success: false, error: String(err) }));
    if (!res.success) return showToast(`Not saved: ${res.error ?? "unknown error"}`);
    setCategories(updated);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      const updated = categories.filter((c) => c.id !== id);
      const res = await saveTaxonomyAction("categories", updated).catch((err: unknown) => ({ success: false, error: String(err) }));
      if (!res.success) return showToast(`Not deleted: ${res.error ?? "unknown error"}`);
      setCategories(updated);
      showToast(`Deleted "${name}"`);
    }
  };

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.pluralName.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#009691]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e8e8e8]">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/admin" className="hover:text-gray-900 transition-colors">
              Website CMS
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-900 font-semibold">Categories</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            Device categories
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Phones, tablets, consoles and computers. Each has its own repair hub page.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/taxonomies"
            className="h-[34px] px-3.5 rounded-[6px] border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Taxonomy Overview</span>
          </Link>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-[34px] px-4 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & STATS BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#e8e8e8] shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name, plural title or slug..."
            className="w-full h-[34px] pl-9 pr-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{filtered.length}</span> of{" "}
          <span className="font-bold text-gray-900">{categories.length}</span> categories
        </div>
      </div>

      {/* ── ELEVATED CATEGORIES TABLE ── */}
      <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9fafb] text-gray-500 font-bold uppercase tracking-wider border-b border-[#e8e8e8] text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Plural Title</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Public URL</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f2]">
              {filtered.map((cat) => {
                const iconInfo = getCategoryIconInfo(cat.slug);
                const IconComponent = iconInfo.icon;

                return (
                  <tr
                    key={cat.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    {/* Category Name + Distinct Icon */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-lg ${iconInfo.bg} border ${iconInfo.border} ${iconInfo.color} flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="font-bold text-gray-900 text-[13px] group-hover:text-[#009691] transition-colors block">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ID: {cat.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Plural Title */}
                    <td className="py-3.5 px-4 font-semibold text-gray-800 text-[12px]">
                      {cat.pluralName}
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-[4px] border border-gray-200">
                        {cat.slug}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-gray-500 max-w-sm truncate text-[11px] leading-relaxed">
                      {cat.description || "—"}
                    </td>

                    {/* Public URL */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-[5px] border border-gray-200 max-w-xs">
                        <span className="font-mono text-[11px] text-gray-600 truncate">
                          {cat.url}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`https://smartfonedoctor.com${cat.url}`)}
                          className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                          title="Copy full URL"
                        >
                          {copiedUrl === `https://smartfonedoctor.com${cat.url}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <Link
                          href={cat.url}
                          target="_blank"
                          className="text-gray-400 hover:text-[#009691] p-0.5"
                          title="Open live category hub"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-[5px] hover:bg-teal-50 text-gray-500 hover:text-[#009691] transition cursor-pointer"
                          title="Edit category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 rounded-[5px] hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                    No categories found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: ADD / EDIT CATEGORY ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/60">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-teal-50 border border-teal-200 text-[#009691] flex items-center justify-center">
                  <FolderTree className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  {editingCategory ? "Edit Category" : "Add Device Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Category Name (Singular)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Smartphone"
                    className="w-full h-[34px] px-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Plural Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.pluralName || ""}
                    onChange={(e) => setFormData({ ...formData, pluralName: e.target.value })}
                    placeholder="e.g. Smartphones"
                    className="w-full h-[34px] px-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Slug ID
                  </label>
                  <select
                    value={formData.slug || "smartphone"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value as any,
                        url: `/repairs/${e.target.value}`,
                      })
                    }
                    className="w-full h-[34px] px-2.5 rounded-[6px] border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#009691]"
                  >
                    <option value="smartphone">smartphone</option>
                    <option value="tablet">tablet</option>
                    <option value="console">console</option>
                    <option value="computer">computer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Icon Symbol
                  </label>
                  <input
                    type="text"
                    value={formData.icon || "Smartphone"}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g. Smartphone, Tablet, Gamepad2"
                    className="w-full h-[34px] px-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Public Canonical URL
                </label>
                <input
                  type="text"
                  value={formData.url || ""}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full h-[34px] px-3 rounded-[6px] border border-gray-300 text-xs font-mono text-gray-600 focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of repair offerings for this hardware category..."
                  className="w-full p-2.5 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#009691] leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-[34px] px-3.5 rounded-[6px] border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[34px] px-4 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
