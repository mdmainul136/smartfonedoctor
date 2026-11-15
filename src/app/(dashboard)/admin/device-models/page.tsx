"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  Tablet,
  Gamepad2,
  Laptop,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  X,
  Star,
  Copy,
  ChevronRight,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  DeviceModelTaxonomy,
  BRANDS_TAXONOMY,
  DEVICE_CATEGORIES,
  getStoredModels,
  saveStoredModels,
} from "@/lib/taxonomy";
import { getTaxonomyAction, saveTaxonomyAction } from "@/actions/taxonomy";

function getDeviceModelIcon(categorySlug: string) {
  switch (categorySlug) {
    case "tablet":
      return { icon: Tablet, bg: "bg-indigo-50", color: "text-indigo-700", border: "border-indigo-200/70" };
    case "console":
      return { icon: Gamepad2, bg: "bg-purple-50", color: "text-purple-700", border: "border-purple-200/70" };
    case "computer":
      return { icon: Laptop, bg: "bg-slate-100", color: "text-slate-700", border: "border-slate-200/70" };
    default:
      return { icon: Smartphone, bg: "bg-sky-50", color: "text-sky-700", border: "border-sky-200/70" };
  }
}

export default function DeviceModelsCRUDPage() {
  const [models, setModels] = useState<DeviceModelTaxonomy[]>([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [onlyPopular, setOnlyPopular] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<DeviceModelTaxonomy | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

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

    let mounted = true;
    getTaxonomyAction<DeviceModelTaxonomy>("models")
      .then((res) => {
        if (mounted && res.success && res.data.length > 0) {
          setModels(res.data);
          saveStoredModels(res.data);
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
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({
      ...prev,
      name: val,
      url: `/schedule-repair?device=${slug}`,
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
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newModel: DeviceModelTaxonomy = {
        id: `mod-${Date.now()}`,
        name: formData.name || "",
        categorySlug: (formData.categorySlug as any) || "smartphone",
        brandSlug: formData.brandSlug || "apple",
        url: formData.url || `/schedule-repair?device=${slug}`,
        isPopular: formData.isPopular ?? false,
      };
      updated = [...models, newModel];
      showToast(`Added device "${formData.name}"`);
    }

    setModels(updated);
    saveStoredModels(updated);
    setIsModalOpen(false);

    saveTaxonomyAction("models", updated).catch(console.error);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete model "${name}"?`)) {
      const updated = models.filter((m) => m.id !== id);
      setModels(updated);
      saveStoredModels(updated);
      showToast(`Deleted "${name}"`);
      await saveTaxonomyAction("models", updated).catch(console.error);
    }
  };

  const filtered = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.brandSlug.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = brandFilter === "all" || m.brandSlug === brandFilter;
    const matchesCategory = categoryFilter === "all" || m.categorySlug === categoryFilter;
    const matchesPopular = !onlyPopular || m.isPopular;
    return matchesSearch && matchesBrand && matchesCategory && matchesPopular;
  });

  const popularCount = models.filter((m) => m.isPopular).length;
  const uniqueBrands = Array.from(new Set(models.map((m) => m.brandSlug))).sort();

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
            <span className="text-gray-900 font-semibold">Device Models</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            Supported Device Models
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage supported individual hardware models (iPhones, Galaxy, Pixels, iPads, PS5, MacBooks) and booking links.
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
            <span>Add Device Model</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS (Clean Bento Style) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Catalog Models
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 block">
              {models.length} Devices
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Mapped to repair wizards</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#009691] shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Popular Flagships
            </span>
            <span className="text-xl sm:text-2xl font-bold text-amber-600 mt-0.5 block">
              {popularCount} Models
            </span>
            <span className="text-[11px] text-gray-500 font-medium">Featured in quick intake</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Brands Supported
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 block">
              {uniqueBrands.length} OEMs
            </span>
            <span className="text-[11px] text-indigo-600 font-medium">Apple, Samsung, Google &amp; more</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Booking Ready
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#009691] mt-0.5 block">
              100% Active
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Live schedule repair URLs</span>
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
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models (e.g. iPhone 16, S25, PS5)..."
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

          {/* Brand Filter Dropdown */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="h-[34px] px-2.5 rounded-[6px] border border-gray-300 text-xs bg-white text-gray-700 capitalize focus:outline-none focus:border-[#009691]"
          >
            <option value="all">All Brands</option>
            {uniqueBrands.map((b) => (
              <option key={b} value={b} className="capitalize">
                {b}
              </option>
            ))}
          </select>

          {/* Category Filter Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-[34px] px-2.5 rounded-[6px] border border-gray-300 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#009691]"
          >
            <option value="all">All Platforms</option>
            <option value="smartphone">Smartphones</option>
            <option value="tablet">Tablets</option>
            <option value="console">Consoles</option>
            <option value="computer">Computers</option>
          </select>

          {/* Popular Only Pill */}
          <button
            type="button"
            onClick={() => setOnlyPopular(!onlyPopular)}
            className={`h-[34px] px-3 rounded-[6px] text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer border ${
              onlyPopular
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyPopular ? "fill-amber-500 text-amber-500" : ""}`} />
            <span>Popular Only</span>
          </button>
        </div>

        <div className="text-xs text-gray-500 font-medium shrink-0">
          Showing <span className="font-bold text-gray-900">{filtered.length}</span> of{" "}
          <span className="font-bold text-gray-900">{models.length}</span> models
        </div>
      </div>

      {/* ── ELEVATED DEVICE MODELS TABLE ── */}
      <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9fafb] text-gray-500 font-bold uppercase tracking-wider border-b border-[#e8e8e8] text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Device Model</th>
                <th className="py-3.5 px-4">Platform</th>
                <th className="py-3.5 px-4">Manufacturer</th>
                <th className="py-3.5 px-4">Popularity</th>
                <th className="py-3.5 px-4">Booking URL Route</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f2]">
              {filtered.map((model) => {
                const iconInfo = getDeviceModelIcon(model.categorySlug);
                const IconComponent = iconInfo.icon;

                return (
                  <tr
                    key={model.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    {/* Model Name + Distinct Icon */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-lg ${iconInfo.bg} border ${iconInfo.border} ${iconInfo.color} flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-[13px] group-hover:text-[#009691] transition-colors">
                              {model.name}
                            </span>
                            {model.isPopular && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                                <Star className="w-3 h-3 fill-amber-500" />
                                <span>Popular</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ID: {model.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Platform */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                        {model.categorySlug}
                      </span>
                    </td>

                    {/* Manufacturer */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-800 text-[12px] capitalize">
                        {model.brandSlug}
                      </span>
                    </td>

                    {/* Popularity */}
                    <td className="py-3.5 px-4">
                      {model.isPopular ? (
                        <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Intake Flagship</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Standard Catalog</span>
                      )}
                    </td>

                    {/* Booking URL */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-[5px] border border-gray-200 max-w-xs">
                        <span className="font-mono text-[11px] text-gray-600 truncate">
                          {model.url}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`https://smartfonedoctor.com${model.url}`)}
                          className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                          title="Copy full booking URL"
                        >
                          {copiedUrl === `https://smartfonedoctor.com${model.url}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <Link
                          href={model.url}
                          target="_blank"
                          className="text-gray-400 hover:text-[#009691] p-0.5"
                          title="Test booking link"
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
                          onClick={() => handleOpenEdit(model)}
                          className="p-1.5 rounded-[5px] hover:bg-teal-50 text-gray-500 hover:text-[#009691] transition cursor-pointer"
                          title="Edit device model"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(model.id, model.name)}
                          className="p-1.5 rounded-[5px] hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete device model"
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
                    No device models found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: ADD / EDIT DEVICE MODEL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/60">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-teal-50 border border-teal-200 text-[#009691] flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  {editingModel ? "Edit Device Model" : "Add Device Model"}
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
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Device Model Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. iPhone 16 Pro Max"
                  className="w-full h-[34px] px-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Platform Category
                  </label>
                  <select
                    value={formData.categorySlug || "smartphone"}
                    onChange={(e) =>
                      setFormData({ ...formData, categorySlug: e.target.value as any })
                    }
                    className="w-full h-[34px] px-2.5 rounded-[6px] border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#009691]"
                  >
                    <option value="smartphone">Smartphones</option>
                    <option value="tablet">Tablets</option>
                    <option value="console">Consoles</option>
                    <option value="computer">Computers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Manufacturer / Brand
                  </label>
                  <select
                    value={formData.brandSlug || "apple"}
                    onChange={(e) => setFormData({ ...formData, brandSlug: e.target.value })}
                    className="w-full h-[34px] px-2.5 rounded-[6px] border border-gray-300 text-xs bg-white capitalize focus:outline-none focus:border-[#009691]"
                  >
                    {uniqueBrands.map((b) => (
                      <option key={b} value={b} className="capitalize">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Direct Booking / pSEO URL
                </label>
                <input
                  type="text"
                  value={formData.url || ""}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full h-[34px] px-3 rounded-[6px] border border-gray-300 text-xs font-mono text-gray-600 focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isPopular ?? false}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 rounded text-[#009691] focus:ring-[#009691]"
                  />
                  <span className="text-xs font-semibold text-gray-800">
                    Feature as Popular Flagship (Shows golden star badge in quick intake wizard)
                  </span>
                </label>
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
                  {editingModel ? "Save Changes" : "Create Device Model"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
