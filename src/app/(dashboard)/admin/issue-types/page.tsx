"use client";

import { useState, useEffect, useRef } from "react";
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
  Smartphone,
  BatteryCharging,
  Zap,
  Droplets,
  Camera,
  Tv,
  Wind,
  Volume2,
  Disc,
  Cpu,
  Copy,
  Sparkles,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Code2,
  Layers,
} from "lucide-react";
import {
  ServiceIssueTaxonomy,
  getStoredIssues,
  saveStoredIssues,
} from "@/lib/taxonomy";
import { getTaxonomyAction, saveTaxonomyAction } from "@/actions/taxonomy";
import MediaModal, { type SelectedMediaPayload } from "@/components/admin/MediaModal";

const AVAILABLE_ICONS = [
  { id: "Smartphone", label: "Screen / Display", icon: Smartphone },
  { id: "BatteryCharging", label: "Battery", icon: BatteryCharging },
  { id: "Zap", label: "Charging Port", icon: Zap },
  { id: "Droplets", label: "Water Damage", icon: Droplets },
  { id: "Camera", label: "Camera & Lens", icon: Camera },
  { id: "Tv", label: "HDMI Port / Console", icon: Tv },
  { id: "Volume2", label: "Speaker / Mic", icon: Volume2 },
  { id: "Wind", label: "Fan / Thermal", icon: Wind },
  { id: "Disc", label: "Disc Drive", icon: Disc },
  { id: "Cpu", label: "Logic Board", icon: Cpu },
  { id: "Layers", label: "Back Glass", icon: Layers },
  { id: "Wrench", label: "General Hardware", icon: Wrench },
];

/**
 * Return contextual icon and subtle pastel theme per issue type
 */
function getIssueIconInfo(slug: string, title: string, customIcon?: string) {
  const chosen = customIcon || "";
  const s = `${chosen} ${slug} ${title}`.toLowerCase();

  if (s.includes("battery")) {
    return {
      icon: BatteryCharging,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200/70",
    };
  }
  if (
    s.includes("screen") ||
    s.includes("digitizer") ||
    s.includes("glass") ||
    s.includes("display")
  ) {
    return {
      icon: Smartphone,
      color: "text-sky-700",
      bg: "bg-sky-50",
      border: "border-sky-200/70",
    };
  }
  if (s.includes("port") || s.includes("charging") || s.includes("charge") || s.includes("zap")) {
    return {
      icon: Zap,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200/70",
    };
  }
  if (s.includes("water") || s.includes("liquid") || s.includes("corrosion") || s.includes("droplets")) {
    return {
      icon: Droplets,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200/70",
    };
  }
  if (s.includes("camera") || s.includes("lens")) {
    return {
      icon: Camera,
      color: "text-purple-700",
      bg: "bg-purple-50",
      border: "border-purple-200/70",
    };
  }
  if (
    s.includes("hdmi") ||
    s.includes("console") ||
    s.includes("ps5") ||
    s.includes("xbox") ||
    s.includes("tv")
  ) {
    return {
      icon: Tv,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
      border: "border-indigo-200/70",
    };
  }
  if (s.includes("fan") || s.includes("overheating") || s.includes("thermal") || s.includes("wind")) {
    return {
      icon: Wind,
      color: "text-teal-700",
      bg: "bg-teal-50",
      border: "border-teal-200/70",
    };
  }
  if (s.includes("audio") || s.includes("speaker") || s.includes("mic") || s.includes("volume")) {
    return {
      icon: Volume2,
      color: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-200/70",
    };
  }
  if (s.includes("disc") || s.includes("drive")) {
    return {
      icon: Disc,
      color: "text-violet-700",
      bg: "bg-violet-50",
      border: "border-violet-200/70",
    };
  }
  if (s.includes("board") || s.includes("logic") || s.includes("chip") || s.includes("clean") || s.includes("cpu")) {
    return {
      icon: Cpu,
      color: "text-[#009691]",
      bg: "bg-teal-50",
      border: "border-teal-200/70",
    };
  }
  if (s.includes("backglass") || s.includes("laser") || s.includes("layers")) {
    return {
      icon: Layers,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
      border: "border-indigo-200/70",
    };
  }
  return {
    icon: Wrench,
    color: "text-gray-700",
    bg: "bg-gray-100",
    border: "border-gray-200",
  };
}

function getCategoryBadge(cat: string) {
  switch (cat) {
    case "smartphone":
      return { label: "Smartphone", bg: "bg-sky-50 text-sky-700 border-sky-200/60" };
    case "tablet":
      return { label: "Tablet", bg: "bg-indigo-50 text-indigo-700 border-indigo-200/60" };
    case "console":
      return { label: "Console", bg: "bg-purple-50 text-purple-700 border-purple-200/60" };
    case "computer":
      return { label: "Computer", bg: "bg-slate-100 text-slate-700 border-slate-200/60" };
    default:
      return { label: cat, bg: "bg-gray-100 text-gray-700 border-gray-200" };
  }
}

export default function IssueTypesCRUDPage() {
  const [issues, setIssues] = useState<ServiceIssueTaxonomy[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<ServiceIssueTaxonomy | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Media Modal & File upload
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ServiceIssueTaxonomy>>({
    title: "",
    slug: "",
    categorySlug: "smartphone",
    startingPrice: 79,
    turnaround: "30 Mins",
    badge: "",
    icon: "Smartphone",
    image: "",
    description: "",
    url: "",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIssues(getStoredIssues());

    let mounted = true;
    getTaxonomyAction<ServiceIssueTaxonomy>("issues")
      .then((res) => {
        if (mounted && res.success && res.data.length > 0) {
          setIssues(res.data);
          saveStoredIssues(res.data);
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
    setEditingIssue(null);
    setFormData({
      title: "",
      slug: "",
      categorySlug: "smartphone",
      startingPrice: 79,
      turnaround: "30 Mins",
      badge: "",
      icon: "Smartphone",
      image: "",
      description: "",
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
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
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

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", formData.title || "Issue repair diagram");
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.item?.url) {
          setFormData((prev) => ({ ...prev, image: data.item.url }));
          showToast("Image uploaded successfully!");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
        icon: formData.icon || "Wrench",
        image: formData.image || undefined,
        description: formData.description || undefined,
        url: formData.url || `/common-issues/${formData.categorySlug || "smartphone"}`,
      };
      updated = [...issues, newIssue];
      showToast(`Added issue "${formData.title}"`);
    }

    setIssues(updated);
    saveStoredIssues(updated);
    setIsModalOpen(false);

    saveTaxonomyAction("issues", updated).catch(console.error);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const updated = issues.filter((i) => i.id !== id);
      setIssues(updated);
      saveStoredIssues(updated);
      showToast(`Deleted "${title}"`);
      await saveTaxonomyAction("issues", updated).catch(console.error);
    }
  };

  const filtered = issues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || i.categorySlug === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const minPrice = issues.length > 0 ? Math.min(...issues.map((i) => i.startingPrice)) : 69;
  const categoriesCount = new Set(issues.map((i) => i.categorySlug)).size;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Hidden file input for direct upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleDirectUpload}
        className="hidden"
      />

      {/* Media Management Modal */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(payload: SelectedMediaPayload) => {
          setFormData((prev) => ({ ...prev, image: payload.url }));
          setIsMediaModalOpen(false);
        }}
        title="Select Issue Diagram or Component Photo"
        selectButtonText="Use as Issue Image"
        initialSelectedUrl={formData.image}
      />

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
            <span className="text-gray-900 font-semibold">Issue Types</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            Common Issue Types &amp; Diagnostics
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage repair issues with customized icons, component diagrams, pricing, and Schema.org RepairService metadata.
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
            <span>Add Issue Type</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS (Clean Bento Style) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Active Issue Types
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 block">
              {issues.length} Issues
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Mapped to public routes</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#009691] shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Starting Repair Rate
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#009691] mt-0.5 block">
              From ${minPrice}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">OEM parts &amp; 90-day warranty</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Average Turnaround
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 block">
              25 - 45 Mins
            </span>
            <span className="text-[11px] text-gray-500 font-medium">Same-day walk-in bench</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Schema.org Coverage
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 block">
              100% Valid
            </span>
            <span className="text-[11px] text-indigo-600 font-medium">RepairService JSON-LD injected</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Code2 className="w-5 h-5" />
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
              placeholder="Search issues by name (e.g. Screen, Battery, HDMI)..."
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
              { id: "all", label: "All" },
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
          <span className="font-bold text-gray-900">{issues.length}</span> issue types
        </div>
      </div>

      {/* ── ELEVATED ISSUE TYPES TABLE ── */}
      <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9fafb] text-gray-500 font-bold uppercase tracking-wider border-b border-[#e8e8e8] text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Issue Name &amp; Visual</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Starting Price</th>
                <th className="py-3.5 px-4">Turnaround</th>
                <th className="py-3.5 px-4">Public URL Route</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f2]">
              {filtered.map((issue) => {
                const iconInfo = getIssueIconInfo(issue.slug, issue.title, issue.icon);
                const IconComponent = iconInfo.icon;
                const catBadge = getCategoryBadge(issue.categorySlug);

                return (
                  <tr
                    key={issue.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    {/* Issue Name + Icon + Optional Diagram Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {issue.image ? (
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                            <img
                              src={issue.image}
                              alt={issue.title}
                              className="w-full h-full object-cover"
                            />
                            <span
                              className={`absolute bottom-0 right-0 w-4 h-4 rounded-tl ${iconInfo.bg} ${iconInfo.color} flex items-center justify-center text-[9px]`}
                            >
                              <IconComponent className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`w-8 h-8 rounded-lg ${iconInfo.bg} border ${iconInfo.border} ${iconInfo.color} flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </span>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-[13px] group-hover:text-[#009691] transition-colors">
                              {issue.title}
                            </span>
                            {issue.badge && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full font-semibold">
                                {issue.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                            <span className="font-mono">{issue.slug}</span>
                            <span>•</span>
                            <span className="text-teal-600 font-medium">Schema.org Service</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${catBadge.bg}`}
                      >
                        {catBadge.label}
                      </span>
                    </td>

                    {/* Starting Price */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#009691] text-[13px]">
                        From ${issue.startingPrice}
                      </span>
                    </td>

                    {/* Turnaround */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-gray-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{issue.turnaround}</span>
                      </span>
                    </td>

                    {/* Public URL with Copy button */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-[5px] border border-gray-200 max-w-xs group/link">
                        <span className="font-mono text-[11px] text-gray-600 truncate">
                          {issue.url}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`https://smartfonedoctor.com${issue.url}`)}
                          className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                          title="Copy full URL"
                        >
                          {copiedUrl === `https://smartfonedoctor.com${issue.url}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <Link
                          href={issue.url}
                          target="_blank"
                          className="text-gray-400 hover:text-[#009691] p-0.5"
                          title="Open live route"
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
                          onClick={() => handleOpenEdit(issue)}
                          className="p-1.5 rounded-[5px] hover:bg-teal-50 text-gray-500 hover:text-[#009691] transition cursor-pointer"
                          title="Edit issue"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(issue.id, issue.title)}
                          className="p-1.5 rounded-[5px] hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete issue"
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
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wrench className="w-8 h-8 opacity-30 text-gray-400" />
                      <span className="font-medium text-gray-600">No issue types found</span>
                      <span className="text-[11px] text-gray-400">
                        Try adjusting your search query or category filter.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: ADD / EDIT ISSUE TYPE WITH ICON & IMAGE PICKER ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150 my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/60">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-teal-50 border border-teal-200 text-[#009691] flex items-center justify-center">
                  <Wrench className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {editingIssue ? "Edit Issue Type" : "Add New Issue Type"}
                  </h3>
                  <span className="text-[10px] text-gray-400">
                    Configures website intake wizard &amp; Schema.org RepairService
                  </span>
                </div>
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
            <form onSubmit={handleSave} className="p-4 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Cracked Screen Repair"
                  className="w-full h-[34px] px-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                />
              </div>

              {/* 1. SELECT ISSUE ICON */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Issue Icon Symbol</span>
                  <span className="text-[10px] font-normal text-gray-400">
                    Used in Booking Flow &amp; Service Lists
                  </span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {AVAILABLE_ICONS.map((item) => {
                    const ItemIcon = item.icon;
                    const isSelected = (formData.icon || "Wrench") === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: item.id })}
                        className={`p-2 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                          isSelected
                            ? "border-[#009691] bg-teal-50/70 text-[#009691] ring-1 ring-[#009691]"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <ItemIcon className="w-4 h-4 shrink-0" />
                        <span className="text-[11px] font-semibold truncate leading-tight">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. COMPONENT DIAGRAM / IMAGE PICKER */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    Issue Diagram / Photo (Optional)
                  </label>
                  <span className="text-[10px] text-teal-600 font-semibold">
                    Injected into Schema.org
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {formData.image ? (
                    <div className="relative w-12 h-12 rounded-lg border border-gray-300 overflow-hidden shrink-0 group">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null}

                  <div className="flex-1 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsMediaModalOpen(true)}
                      className="h-[32px] px-2.5 rounded-[5px] border border-gray-300 bg-white hover:bg-gray-50 text-[11px] font-semibold text-gray-700 inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#009691]" />
                      <span>Media Library</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="h-[32px] px-2.5 rounded-[5px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? "Uploading..." : "Upload File"}</span>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.image || ""}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Or enter direct URL: https://... or /uploads/..."
                  className="w-full h-[30px] px-2.5 rounded-[5px] border border-gray-300 text-[11px] font-mono text-gray-600 focus:outline-none focus:border-[#009691] mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categorySlug || "smartphone"}
                    onChange={(e) => handleCategoryChange(e.target.value as any)}
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
                    Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge || ""}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Most Common"
                    className="w-full h-[34px] px-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Starting Price ($)
                  </label>
                  <input
                    type="number"
                    value={formData.startingPrice ?? 79}
                    onChange={(e) =>
                      setFormData({ ...formData, startingPrice: Number(e.target.value) })
                    }
                    className="w-full h-[34px] px-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Turnaround Time
                  </label>
                  <input
                    type="text"
                    value={formData.turnaround || "30 Mins"}
                    onChange={(e) => setFormData({ ...formData, turnaround: e.target.value })}
                    placeholder="e.g. 30 Mins or Same Day"
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

              {/* Schema.org Live Validation Snippet */}
              <div className="p-2.5 rounded-lg bg-gray-900 text-emerald-400 font-mono text-[10px] leading-relaxed border border-gray-800">
                <span className="text-gray-400 block mb-0.5">// Schema.org JSON-LD Service Object:</span>
                <div>{`"@type": "Service", "serviceType": "${formData.title || "Repair Service"}",`}</div>
                <div>{`"image": "${formData.image || "https://smartfonedoctor.com/logo-png.jpg"}",`}</div>
                <div>{`"offers": { "@type": "Offer", "price": "${formData.startingPrice || 69}", "priceCurrency": "USD" }`}</div>
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
                  {editingIssue ? "Save Changes" : "Create Issue Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
