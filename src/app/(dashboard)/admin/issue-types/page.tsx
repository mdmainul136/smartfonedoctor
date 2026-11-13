"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  X,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  ServiceIssueTaxonomy,
  getStoredIssues,
  saveStoredIssues,
} from "@/lib/taxonomy";

export default function IssueTypesCRUDPage() {
  const [issues, setIssues] = useState<ServiceIssueTaxonomy[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<ServiceIssueTaxonomy | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ServiceIssueTaxonomy>>({
    title: "",
    slug: "",
    categorySlug: "smartphone",
    startingPrice: 79,
    turnaround: "30 Mins",
    badge: "",
    url: "",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIssues(getStoredIssues());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenAdd = () => {
    setEditingIssue(null);
    setFormData({
      title: "",
      slug: "",
      categorySlug: "smartphone",
      startingPrice: 79,
      turnaround: "30 Mins",
      badge: "",
      url: "/common-issues/smartphone/",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (issue: ServiceIssueTaxonomy) => {
    setEditingIssue(issue);
    setFormData({ ...issue });
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug,
      url: `/common-issues/${prev.categorySlug || "smartphone"}/${slug}`,
    }));
  };

  const handleCategoryChange = (cat: "smartphone" | "tablet" | "console" | "computer") => {
    setFormData((prev) => ({
      ...prev,
      categorySlug: cat,
      url: `/common-issues/${cat}/${prev.slug || ""}`,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    let updated: ServiceIssueTaxonomy[];
    if (editingIssue) {
      updated = issues.map((i) =>
        i.id === editingIssue.id ? ({ ...i, ...formData } as ServiceIssueTaxonomy) : i
      );
      showToast(`Updated "${formData.title}"`);
    } else {
      const newIssue: ServiceIssueTaxonomy = {
        id: `iss-${Date.now()}`,
        title: formData.title || "",
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
        categorySlug: (formData.categorySlug as any) || "smartphone",
        startingPrice: Number(formData.startingPrice) || 79,
        turnaround: formData.turnaround || "Same Day",
        badge: formData.badge || undefined,
        url: formData.url || `/common-issues/${formData.categorySlug || "smartphone"}`,
      };
      updated = [...issues, newIssue];
      showToast(`Added issue "${formData.title}"`);
    }

    setIssues(updated);
    saveStoredIssues(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const updated = issues.filter((i) => i.id !== id);
      setIssues(updated);
      saveStoredIssues(updated);
      showToast(`Deleted "${title}"`);
    }
  };

  const filtered = issues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || i.categorySlug === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1d1c1a] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#00897b]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span>Website CMS</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Issue Types</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            Common Issue Types &amp; Diagnostics
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage repair issues (Cracked Screens, Batteries, Charging Ports, Water Damage, HDMI) and diagnostic guide routes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/taxonomies"
            className="h-[36px] px-3.5 rounded-[6px] border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Taxonomy Overview</span>
          </Link>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-[36px] px-4 rounded-[6px] bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Issue Type</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search issues by name (e.g. Screen, HDMI)..."
              className="w-full h-[34px] pl-9 pr-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-[34px] px-3 rounded-[5px] border border-gray-300 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#00897b]"
          >
            <option value="all">All Categories</option>
            <option value="smartphone">Smartphones</option>
            <option value="tablet">Tablets</option>
            <option value="console">Consoles</option>
            <option value="computer">Computers</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-black">{filtered.length}</span> issue types
        </div>
      </div>

      {/* Issue Types Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9fafb] text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Issue Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Starting Price</th>
                <th className="py-3 px-4">Turnaround</th>
                <th className="py-3 px-4">Canonical Public URL</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                        <Wrench className="w-3.5 h-3.5" />
                      </span>
                      <span>{issue.title}</span>
                      {issue.badge && (
                        <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded font-normal">
                          {issue.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-600 uppercase text-[10px]">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                      {issue.categorySlug}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#00897b]">
                    From ${issue.startingPrice}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {issue.turnaround}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#00897b]">
                    <Link
                      href={issue.url}
                      target="_blank"
                      className="hover:underline inline-flex items-center gap-1"
                    >
                      <span>{issue.url}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(issue)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-black cursor-pointer"
                        title="Edit issue"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(issue.id, issue.title)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
                        title="Delete issue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-xs">
                    No issue types found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT ISSUE TYPE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-sm text-[#111111]">
                {editingIssue ? "Edit Issue Type" : "Add Issue Type"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Cracked Screen Repair, Water Damage"
                  className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Device Category *
                  </label>
                  <select
                    value={formData.categorySlug || "smartphone"}
                    onChange={(e) => handleCategoryChange(e.target.value as any)}
                    className="w-full h-[36px] px-2.5 rounded-[5px] border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#00897b]"
                  >
                    <option value="smartphone">Smartphone</option>
                    <option value="tablet">Tablet</option>
                    <option value="console">Game Console</option>
                    <option value="computer">Computer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Starting Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.startingPrice || ""}
                    onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                    placeholder="89"
                    className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Turnaround Time
                  </label>
                  <input
                    type="text"
                    value={formData.turnaround || ""}
                    onChange={(e) => setFormData({ ...formData, turnaround: e.target.value })}
                    placeholder="e.g. 30 Mins, Same Day"
                    className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Highlight Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge || ""}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. OEM Grade, Most Common"
                    className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Canonical Route / Diagnostic Guide URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.url || ""}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="/common-issues/smartphone/cracked-glass-replacement"
                  className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs font-mono focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-[34px] px-3.5 rounded-[5px] border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[34px] px-4 rounded-[5px] bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-semibold"
                >
                  {editingIssue ? "Save Changes" : "Create Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
