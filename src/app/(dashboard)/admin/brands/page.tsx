"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  X,
  Copy,
  ChevronRight,
  Sparkles,
  Smartphone,
  Layers,
} from "lucide-react";
import {
  BrandTaxonomy,
  DEVICE_CATEGORIES,
  getStoredBrands,
  saveStoredBrands,
} from "@/lib/taxonomy";
import { getTaxonomyAction, saveTaxonomyAction } from "@/actions/taxonomy";

function getBrandBadgeInfo(slug: string, name: string) {
  const s = slug.toLowerCase();
  if (s.includes("apple")) {
    return { bg: "bg-neutral-900 text-white border-neutral-800", initial: "" };
  }
  if (s.includes("samsung")) {
    return { bg: "bg-blue-600 text-white border-blue-500", initial: "S" };
  }
  if (s.includes("google")) {
    return { bg: "bg-emerald-600 text-white border-emerald-500", initial: "G" };
  }
  if (s.includes("sony") || s.includes("playstation")) {
    return { bg: "bg-indigo-600 text-white border-indigo-500", initial: "PS" };
  }
  if (s.includes("microsoft") || s.includes("xbox")) {
    return { bg: "bg-teal-700 text-white border-teal-600", initial: "XB" };
  }
  if (s.includes("nintendo")) {
    return { bg: "bg-rose-600 text-white border-rose-500", initial: "N" };
  }
  if (s.includes("motorola")) {
    return { bg: "bg-sky-600 text-white border-sky-500", initial: "M" };
  }
  return {
    bg: "bg-[#009691] text-white border-[#007f7b]",
    initial: name.slice(0, 2).toUpperCase(),
  };
}

export default function BrandsCRUDPage() {
  const [brands, setBrands] = useState<BrandTaxonomy[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandTaxonomy | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<BrandTaxonomy>>({
    name: "",
    slug: "",
    categorySlugs: ["smartphone"],
    tagline: "",
    url: "",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setBrands(getStoredBrands());

    let mounted = true;
    getTaxonomyAction<BrandTaxonomy>("brands")
      .then((res) => {
        if (mounted && res.success && res.data.length > 0) {
          setBrands(res.data);
          saveStoredBrands(res.data);
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
    setEditingBrand(null);
    setFormData({
      name: "",
      slug: "",
      categorySlugs: ["smartphone"],
      tagline: "",
      url: "/repairs/",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: BrandTaxonomy) => {
    setEditingBrand(brand);
    setFormData({ ...brand });
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
      slug,
      url: `/repairs/${slug}`,
    }));
  };

  const toggleCategorySlug = (cat: "smartphone" | "tablet" | "console" | "computer") => {
    const current = formData.categorySlugs || [];
    const exists = current.includes(cat);
    const updated = exists ? current.filter((c) => c !== cat) : [...current, cat];
    setFormData((prev) => ({
      ...prev,
      categorySlugs: updated.length > 0 ? updated : ["smartphone"],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    let updated: BrandTaxonomy[];
    if (editingBrand) {
      updated = brands.map((b) =>
        b.id === editingBrand.id ? ({ ...b, ...formData } as BrandTaxonomy) : b
      );
      showToast(`Updated "${formData.name}"`);
    } else {
      const newBrand: BrandTaxonomy = {
        id: `brand-${Date.now()}`,
        name: formData.name || "",
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        categorySlugs: formData.categorySlugs || ["smartphone"],
        tagline: formData.tagline || `Certified ${formData.name} Hardware Repair`,
        url: formData.url || `/repairs/${formData.slug}`,
      };
      updated = [...brands, newBrand];
      showToast(`Added brand "${formData.name}"`);
    }

    setBrands(updated);
    saveStoredBrands(updated);
    setIsModalOpen(false);

    saveTaxonomyAction("brands", updated).catch(console.error);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete brand "${name}"?`)) {
      const updated = brands.filter((b) => b.id !== id);
      setBrands(updated);
      saveStoredBrands(updated);
      showToast(`Deleted "${name}"`);
      await saveTaxonomyAction("brands", updated).catch(console.error);
    }
  };

  const filtered = brands.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.tagline.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || b.categorySlugs.includes(categoryFilter as any);
    return matchesSearch && matchesCategory;
  });

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
            <span className="text-gray-900 font-semibold">Brands</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            Hardware Brands &amp; OEMs
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage device manufacturers (Apple, Samsung, Google, Sony, Microsoft, Nintendo) and their landing hub URLs.
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
            <span>Add Brand</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS (Clean Bento Style) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Active Hardware Brands
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 block">
              {brands.length} Brands
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Mapped to public hubs</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#009691] shrink-0">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Tier 1 Flags
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 block">
              Apple &amp; Samsung
            </span>
            <span className="text-[11px] text-gray-500 font-medium">Same-day 30-min express bench</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Console &amp; Gaming
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 block">
              Sony &amp; Nintendo
            </span>
            <span className="text-[11px] text-purple-600 font-medium">Micro-soldering &amp; HDMI</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Warranty Standard
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#009691] mt-0.5 block">
              90-Day Guarantee
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">OEM calibration certified</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#e8e8e8] shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands by name, model or tagline..."
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

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {[
              { id: "all", label: "All Brands" },
              { id: "smartphone", label: "Smartphones" },
              { id: "tablet", label: "Tablets" },
              { id: "console", label: "Consoles" },
              { id: "computer", label: "Computers" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`h-[30px] px-2.5 rounded-[5px] text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === tab.id
                    ? "bg-[#009691] text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500 font-medium shrink-0">
          Showing <span className="font-bold text-gray-900">{filtered.length}</span> of{" "}
          <span className="font-bold text-gray-900">{brands.length}</span> brands
        </div>
      </div>

      {/* ── ELEVATED BRANDS TABLE ── */}
      <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9fafb] text-gray-500 font-bold uppercase tracking-wider border-b border-[#e8e8e8] text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Brand Name</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Supported Platforms</th>
                <th className="py-3.5 px-4">Tagline / Positioning</th>
                <th className="py-3.5 px-4">Public Landing URL</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f2]">
              {filtered.map((brand) => {
                const badgeInfo = getBrandBadgeInfo(brand.slug, brand.name);

                return (
                  <tr
                    key={brand.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    {/* Brand Name + Unique Color Badge */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-lg ${badgeInfo.bg} border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs transition-transform group-hover:scale-105`}
                        >
                          {badgeInfo.initial}
                        </span>
                        <div>
                          <span className="font-bold text-gray-900 text-[13px] group-hover:text-[#009691] transition-colors block">
                            {brand.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ID: {brand.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-[4px] border border-gray-200">
                        {brand.slug}
                      </span>
                    </td>

                    {/* Supported Categories */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {brand.categorySlugs.map((cat) => (
                          <span
                            key={cat}
                            className="text-[10px] uppercase font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Tagline */}
                    <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate text-[11px]">
                      {brand.tagline}
                    </td>

                    {/* Public URL */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-[5px] border border-gray-200 max-w-xs">
                        <span className="font-mono text-[11px] text-gray-600 truncate">
                          {brand.url}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`https://smartfonedoctor.com${brand.url}`)}
                          className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                          title="Copy full URL"
                        >
                          {copiedUrl === `https://smartfonedoctor.com${brand.url}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <Link
                          href={brand.url}
                          target="_blank"
                          className="text-gray-400 hover:text-[#009691] p-0.5"
                          title="Open live brand page"
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
                          onClick={() => handleOpenEdit(brand)}
                          className="p-1.5 rounded-[5px] hover:bg-teal-50 text-gray-500 hover:text-[#009691] transition cursor-pointer"
                          title="Edit brand"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(brand.id, brand.name)}
                          className="p-1.5 rounded-[5px] hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete brand"
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
                    No brands found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: ADD / EDIT BRAND ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/60">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-teal-50 border border-teal-200 text-[#009691] flex items-center justify-center">
                  <Tag className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  {editingBrand ? "Edit Hardware Brand" : "Add Hardware Brand"}
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
                    Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Apple"
                    className="w-full h-[34px] px-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. apple"
                    className="w-full h-[34px] px-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Connected Platforms (Select All That Apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["smartphone", "tablet", "console", "computer"] as const).map((cat) => {
                    const checked = (formData.categorySlugs || []).includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategorySlug(cat)}
                        className={`h-[32px] px-2 rounded-[6px] border text-xs font-semibold capitalize transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          checked
                            ? "bg-teal-50 border-[#009691] text-[#009691]"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {checked && <Check className="w-3.5 h-3.5" />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Tagline / Overview
                </label>
                <input
                  type="text"
                  value={formData.tagline || ""}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. All iPhone, iPad & Mac Models"
                  className="w-full h-[34px] px-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                />
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
                  {editingBrand ? "Save Changes" : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
