"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  X,
  Star,
} from "lucide-react";
import {
  DeviceModelTaxonomy,
  BRANDS_TAXONOMY,
  DEVICE_CATEGORIES,
  getStoredModels,
  saveStoredModels,
} from "@/lib/taxonomy";

export default function DeviceModelsCRUDPage() {
  const [models, setModels] = useState<DeviceModelTaxonomy[]>([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<DeviceModelTaxonomy | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<DeviceModelTaxonomy>>({
    name: "",
    categorySlug: "smartphone",
    brandSlug: "apple",
    url: "",
    isPopular: true,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setModels(getStoredModels());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenAdd = () => {
    setEditingModel(null);
    setFormData({
      name: "",
      categorySlug: "smartphone",
      brandSlug: "apple",
      url: "/schedule-repair?device=",
      isPopular: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (model: DeviceModelTaxonomy) => {
    setEditingModel(model);
    setFormData({ ...model });
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    const encoded = encodeURIComponent(val.trim().replace(/\s+/g, "-"));
    setFormData((prev) => ({
      ...prev,
      name: val,
      url: `/schedule-repair?device=${encoded}`,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    let updated: DeviceModelTaxonomy[];
    if (editingModel) {
      updated = models.map((m) =>
        m.id === editingModel.id ? ({ ...m, ...formData } as DeviceModelTaxonomy) : m
      );
      showToast(`Updated "${formData.name}"`);
    } else {
      const newModel: DeviceModelTaxonomy = {
        id: `dev-${Date.now()}`,
        name: formData.name || "",
        categorySlug: (formData.categorySlug as any) || "smartphone",
        brandSlug: formData.brandSlug || "apple",
        url: formData.url || `/schedule-repair?device=${encodeURIComponent(formData.name)}`,
        isPopular: !!formData.isPopular,
      };
      updated = [...models, newModel];
      showToast(`Added device "${formData.name}"`);
    }

    setModels(updated);
    saveStoredModels(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete model "${name}"?`)) {
      const updated = models.filter((m) => m.id !== id);
      setModels(updated);
      saveStoredModels(updated);
      showToast(`Deleted "${name}"`);
    }
  };

  const filtered = models.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = brandFilter === "all" || m.brandSlug === brandFilter;
    const matchesCat = categoryFilter === "all" || m.categorySlug === categoryFilter;
    return matchesSearch && matchesBrand && matchesCat;
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
            <span className="text-gray-900 font-medium">Device Models</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            Device Models Directory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage supported device models (iPhone 16 Pro, Galaxy S25, PS5, Surface Pro) linked to booking flow.
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
            <span>Add Device Model</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models (e.g. iPhone, S24, PS5)..."
              className="w-full h-[34px] pl-9 pr-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
            />
          </div>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="h-[34px] px-3 rounded-[5px] border border-gray-300 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#00897b]"
          >
            <option value="all">All Brands</option>
            {BRANDS_TAXONOMY.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>

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
          Showing <span className="font-bold text-black">{filtered.length}</span> models
        </div>
      </div>

      {/* Models Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9fafb] text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Device Model</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Priority / Popular</th>
                <th className="py-3 px-4">Direct Booking URL</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded bg-teal-50 border border-teal-200 text-[#00897b] flex items-center justify-center font-bold">
                        <Smartphone className="w-3.5 h-3.5" />
                      </span>
                      <span>{model.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-600 uppercase text-[10px]">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                      {model.categorySlug}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-700 capitalize">
                    {model.brandSlug}
                  </td>
                  <td className="py-3.5 px-4">
                    {model.isPopular ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>Most Popular</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">Standard</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#00897b]">
                    <Link
                      href={model.url}
                      target="_blank"
                      className="hover:underline inline-flex items-center gap-1"
                    >
                      <span>{model.url}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(model)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-black cursor-pointer"
                        title="Edit model"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(model.id, model.name)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
                        title="Delete model"
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
                    No device models found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT MODEL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-sm text-[#111111]">
                {editingModel ? "Edit Device Model" : "Add Device Model"}
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
                  Device Model Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. iPhone 16 Pro Repair, PS5 Slim"
                  className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categorySlug || "smartphone"}
                    onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value as any })}
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
                    Brand *
                  </label>
                  <select
                    value={formData.brandSlug || "apple"}
                    onChange={(e) => setFormData({ ...formData, brandSlug: e.target.value })}
                    className="w-full h-[36px] px-2.5 rounded-[5px] border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#00897b]"
                  >
                    {BRANDS_TAXONOMY.map((b) => (
                      <option key={b.slug} value={b.slug}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Booking Flow Direct URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.url || ""}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="/schedule-repair?device=iPhone-16-Pro"
                  className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs font-mono focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded text-[#00897b]"
                  />
                  <span>Mark as Most Popular (Highlighted in Mega Menu)</span>
                </label>
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
                  {editingModel ? "Save Changes" : "Create Model"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

