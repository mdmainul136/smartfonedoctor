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
  Filter,
} from "lucide-react";
import {
  BrandTaxonomy,
  DEVICE_CATEGORIES,
  getStoredBrands,
  saveStoredBrands,
} from "@/lib/taxonomy";

export default function BrandsCRUDPage() {
  const [brands, setBrands] = useState<BrandTaxonomy[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandTaxonomy | null>(null);

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
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setFormData({
      name: "",
      slug: "",
      categorySlugs: ["smartphone"],
      tagline: "",
      url: "/repairs/smartphone",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: BrandTaxonomy) => {
    setEditingBrand(brand);
    setFormData({ ...brand });
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug,
      tagline: prev.tagline ? prev.tagline : `All ${val} Models`,
      url: `/repairs/${slug}`,
    }));
  };

  const handleToggleCategory = (catSlug: "smartphone" | "tablet" | "console" | "computer") => {
    const current = formData.categorySlugs || [];
    if (current.includes(catSlug)) {
      setFormData({
        ...formData,
        categorySlugs: current.filter((s) => s !== catSlug),
      });
    } else {
      setFormData({
        ...formData,
        categorySlugs: [...current, catSlug],
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    let updated: BrandTaxonomy[];
    if (editingBrand) {
      updated = brands.map((b) =>
        b.id === editingBrand.id ? ({ ...b, ...formData } as BrandTaxonomy) : b
      );
      showToast(`Updated "${formData.name}" successfully`);
    } else {
      const newBrand: BrandTaxonomy = {
        id: `brand-${Date.now()}`,
        name: formData.name || "",
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        categorySlugs: (formData.categorySlugs as any) || ["smartphone"],
        tagline: formData.tagline || `All ${formData.name} Models`,
        url: formData.url || `/repairs/${formData.name.toLowerCase()}`,
      };
      updated = [...brands, newBrand];
      showToast(`Added brand "${formData.name}"`);
    }

    setBrands(updated);
    saveStoredBrands(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete brand "${name}"?`)) {
      const updated = brands.filter((b) => b.id !== id);
      setBrands(updated);
      saveStoredBrands(updated);
      showToast(`Deleted "${name}"`);
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
            <span className="text-gray-900 font-medium">Brands</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            Hardware Brands
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage device manufacturers (Apple, Samsung, Google, Sony, Microsoft, etc.) and their brand hubs.
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
            <span>Add Brand</span>
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
              placeholder="Search brands by name, model or tagline..."
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
          Showing <span className="font-bold text-black">{filtered.length}</span> brands
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9fafb] text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Brand Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Connected Categories</th>
                <th className="py-3 px-4">Tagline / Models Supported</th>
                <th className="py-3 px-4">Canonical Public URL</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                        {brand.name.slice(0, 1)}
                      </span>
                      <span>{brand.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                      {brand.slug}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {brand.categorySlugs.map((cat) => (
                        <span
                          key={cat}
                          className="text-[10px] uppercase font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">
                    {brand.tagline}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#00897b]">
                    <Link
                      href={brand.url}
                      target="_blank"
                      className="hover:underline inline-flex items-center gap-1"
                    >
                      <span>{brand.url}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(brand)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-black cursor-pointer"
                        title="Edit brand"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(brand.id, brand.name)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
                        title="Delete brand"
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
                    No brands found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT BRAND */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-sm text-[#111111]">
                {editingBrand ? "Edit Brand" : "Add Hardware Brand"}
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
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Apple, Samsung, OnePlus"
                  className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Supported Categories *
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {(["smartphone", "tablet", "console", "computer"] as const).map((cat) => {
                    const isChecked = formData.categorySlugs?.includes(cat);
                    return (
                      <label
                        key={cat}
                        className={`p-2 rounded border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                          isChecked
                            ? "border-[#00897b] bg-teal-50/50 text-[#00897b] font-semibold"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCategory(cat)}
                          className="rounded text-[#00897b]"
                        />
                        <span className="capitalize">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Tagline / Supported Models Description
                </label>
                <input
                  type="text"
                  value={formData.tagline || ""}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. All iPhone, iPad & Mac Models"
                  className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Canonical Brand Hub URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.url || ""}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="/repairs/iphone"
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
