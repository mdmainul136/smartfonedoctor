"use client";

import { useState, useMemo, useEffect } from "react";
import { useStoreContext } from "@/lib/storeContext";
import { Plus, Search, X, Trash2 } from "lucide-react";

type ServiceCategory =
  | "Screen repair"
  | "Battery"
  | "Water damage"
  | "Charging & HDMI"
  | "Audio & camera"
  | "Other";

interface ServiceItem {
  id: number;
  name: string;
  category: ServiceCategory;
  estimatedTime: string;
  active: boolean;
  prices: {
    iphone: string;
    samsung: string;
    google: string;
    other: string;
  };
}

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 1,
    name: "OEM OLED / LCD Screen Replacement",
    category: "Screen repair",
    estimatedTime: "25–45 min",
    active: true,
    prices: {
      iphone: "$129–$299",
      samsung: "$99–$249",
      google: "$89–$179",
      other: "$59–$99",
    },
  },
  {
    id: 2,
    name: "Express Battery Replacement",
    category: "Battery",
    estimatedTime: "25–30 min",
    active: true,
    prices: {
      iphone: "$79",
      samsung: "$69",
      google: "$65",
      other: "$49",
    },
  },
  {
    id: 3,
    name: "Back Glass Laser Replacement",
    category: "Screen repair",
    estimatedTime: "45–60 min",
    active: true,
    prices: {
      iphone: "$99–$149",
      samsung: "$89–$129",
      google: "$75–$99",
      other: "$49–$79",
    },
  },
  {
    id: 4,
    name: "USB-C / Lightning Charging Port & PS5 HDMI",
    category: "Charging & HDMI",
    estimatedTime: "45–90 min",
    active: true,
    prices: {
      iphone: "$89",
      samsung: "$79",
      google: "$69",
      other: "$129 (PS5/Xbox)",
    },
  },
  {
    id: 5,
    name: "Speaker, Mic & Earpiece Repair",
    category: "Audio & camera",
    estimatedTime: "30–45 min",
    active: true,
    prices: {
      iphone: "$69",
      samsung: "$59",
      google: "$55",
      other: "$45",
    },
  },
  {
    id: 6,
    name: "Water Damage Ultrasonic Recovery",
    category: "Water damage",
    estimatedTime: "Same day",
    active: true,
    prices: {
      iphone: "$99–$199",
      samsung: "$89–$179",
      google: "$79–$149",
      other: "$59–$119",
    },
  },
  {
    id: 7,
    name: "Rear Camera & Sapphire Lens Replacement",
    category: "Audio & camera",
    estimatedTime: "30–45 min",
    active: true,
    prices: {
      iphone: "$59–$89",
      samsung: "$49–$79",
      google: "$49–$69",
      other: "$39–$59",
    },
  },
  {
    id: 8,
    name: "Carrier & Network Unlock",
    category: "Other",
    estimatedTime: "15 min",
    active: false,
    prices: {
      iphone: "$29–$49",
      samsung: "$19–$39",
      google: "$19–$29",
      other: "$19–$29",
    },
  },
];

const CATEGORIES: (ServiceCategory | "All")[] = [
  "All",
  "Screen repair",
  "Battery",
  "Charging & HDMI",
  "Water damage",
  "Audio & camera",
  "Other",
];

const EMPTY_FORM: Omit<ServiceItem, "id"> = {
  name: "",
  category: "Screen repair",
  estimatedTime: "30–45 min",
  active: true,
  prices: {
    iphone: "",
    samsung: "",
    google: "",
    other: "",
  },
};

export default function ServicesAndPricingPage() {
  const { selectedStore, isAllStores } = useStoreContext();
  const storeShortName = isAllStores
    ? "All 3 Philadelphia locations"
    : selectedStore.name.replace("SmartFoneDoctor - ", "");

  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [activeTab, setActiveTab] = useState<"catalog" | "matrix">("catalog");
  const [selectedCategory, setSelectedCategory] = useState<
    ServiceCategory | "All"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingService, setDeletingService] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState<Omit<ServiceItem, "id">>(EMPTY_FORM);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowForm(false);
        setEditingId(null);
        setDeletingService(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const notify = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const handleDeleteService = (id: number) => {
    const svc = services.find((s) => s.id === id);
    setServices((prev) => prev.filter((s) => s.id !== id));
    notify(`Deleted ${svc?.name ?? "service"} from catalog.`);
    setDeletingService(null);
    setShowForm(false);
    setEditingId(null);
  };

  const handleToggle = (id: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const handleEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      category: service.category,
      estimatedTime: service.estimatedTime,
      active: service.active,
      prices: { ...service.prices },
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingId ? { ...s, ...form, id: editingId } : s
        )
      );
      notify("Service & rates updated across store catalog.");
    } else {
      const created: ServiceItem = {
        ...form,
        id: Date.now(),
      };
      setServices((prev) => [...prev, created]);
      notify("New repair service added to store catalog.");
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCategory =
        selectedCategory === "All" || s.category === selectedCategory;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const activeCount = services.filter((s) => s.active).length;

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-4 overflow-x-hidden">
      {/* 1. CANVAS TITLE ROW + UNDERLINE TABS */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#111111] tracking-[-0.02em] leading-tight">
              Services &amp; pricing
            </h1>
            <p className="text-[14px] text-[#5f6368] mt-1">
              {activeCount} of {services.length} repair services active for{" "}
              <span className="text-[#111111] font-medium">
                {storeShortName}
              </span>{" "}
              · Synced with website quote widget &amp; Google Business services
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm(EMPTY_FORM);
            }}
            className="h-[32px] self-start sm:self-auto shrink-0 px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add repair service</span>
          </button>
        </div>

        {/* Underline Tabs */}
        <nav
          aria-label="Service catalog views"
          className="border-b border-[#e5e7eb]"
        >
          <ul className="flex items-center gap-6">
            <li>
              <button
                type="button"
                onClick={() => setActiveTab("catalog")}
                className={`inline-flex items-center py-2.5 text-[14px] border-b-2 -mb-px transition-colors cursor-pointer ${
                  activeTab === "catalog"
                    ? "border-[#111111] text-[#111111] font-medium"
                    : "border-transparent text-[#5f6368] hover:text-[#111111]"
                }`}
              >
                Service catalog &amp; turnaround ({services.length})
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`inline-flex items-center py-2.5 text-[14px] border-b-2 -mb-px transition-colors cursor-pointer ${
                  activeTab === "matrix"
                    ? "border-[#111111] text-[#111111] font-medium"
                    : "border-transparent text-[#5f6368] hover:text-[#111111]"
                }`}
              >
                Device brand price matrix
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {savedMsg && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#dcfae5] text-[#04250e] rounded-[6px] px-4 py-2.5 flex items-center justify-between gap-3 text-[13px]"
        >
          <span className="font-medium">{savedMsg}</span>
          <button
            type="button"
            onClick={() => setSavedMsg(null)}
            aria-label="Dismiss notification"
            className="p-0.5 hover:opacity-75 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 2. SERVICES TABLE / MATRIX CONTAINER */}
      <section
        aria-label="Repair services list"
        className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
      >
        {/* Filter bar */}
        <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-[28px] px-2.5 rounded-[5px] text-[13px] transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#eeeeee] text-[#111111] font-medium"
                      : "text-[#5f6368] hover:text-[#111111]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search
              className="w-3.5 h-3.5 text-[#6b6b6b] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Search repair services"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services…"
              className="h-[32px] w-full sm:w-56 pl-8 pr-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] text-[#111111] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#111111]"
            />
          </div>
        </div>

        {/* Mobile & Tablet Rows (< lg) */}
        <div className="lg:hidden divide-y divide-[#f2f2f2]">
          {filteredServices.map((svc) => (
            <div key={svc.id} className="p-4 flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-[#111111] truncate">
                    {svc.name}
                  </div>
                  <div className="text-[12px] text-[#5f6368]">
                    {svc.category} · Turnaround: {svc.estimatedTime}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(svc.id)}
                  className={`h-[22px] px-2 rounded-[4px] inline-flex items-center text-[12px] font-medium cursor-pointer shrink-0 ${
                    svc.active
                      ? "bg-[#dcfae5] text-[#04250e]"
                      : "bg-[#eeeeee] text-[#5f6368]"
                  }`}
                >
                  {svc.active ? "Active" : "Paused"}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                <div className="p-2 rounded-[5px] bg-[#f9f9f9] border border-[#e8e8e8]">
                  <span className="text-[#5f6368] block">Apple iPhone</span>
                  <span className="font-medium text-[#111111] tabular-nums">
                    {svc.prices.iphone}
                  </span>
                </div>
                <div className="p-2 rounded-[5px] bg-[#f9f9f9] border border-[#e8e8e8]">
                  <span className="text-[#5f6368] block">Samsung Galaxy</span>
                  <span className="font-medium text-[#111111] tabular-nums">
                    {svc.prices.samsung}
                  </span>
                </div>
                <div className="p-2 rounded-[5px] bg-[#f9f9f9] border border-[#e8e8e8]">
                  <span className="text-[#5f6368] block">Google Pixel</span>
                  <span className="font-medium text-[#111111] tabular-nums">
                    {svc.prices.google}
                  </span>
                </div>
                <div className="p-2 rounded-[5px] bg-[#f9f9f9] border border-[#e8e8e8]">
                  <span className="text-[#5f6368] block">Console / Other</span>
                  <span className="font-medium text-[#111111] tabular-nums">
                    {svc.prices.other}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => handleEdit(svc)}
                  className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] cursor-pointer"
                >
                  Edit rates
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingService(svc)}
                  aria-label={`Delete ${svc.name}`}
                  className="h-[28px] w-[28px] rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#fee2e2] inline-flex items-center justify-center text-[#5f6368] hover:text-[#dc2626] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table (lg+): 5 balanced table-fixed columns */}
        <div className="hidden lg:block w-full">
          {activeTab === "catalog" ? (
            <table className="w-full table-fixed text-left border-collapse">
              <thead>
                <tr className="h-[38px] border-b border-[#e5e7eb] text-[12px] font-normal text-[#5f6368]">
                  <th className="px-4 font-normal w-[30%]">
                    Service &amp; category
                  </th>
                  <th className="px-4 font-normal w-[14%]">Turnaround</th>
                  <th className="px-4 font-normal w-[32%]">
                    Benchmark device pricing
                  </th>
                  <th className="px-4 font-normal w-[12%]">Status</th>
                  <th className="px-4 font-normal text-right w-[12%]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f2f2] text-[14px]">
                {filteredServices.map((svc) => (
                  <tr
                    key={svc.id}
                    className="h-[58px] hover:bg-[#f9f9f9] transition-colors"
                  >
                    <td className="px-4 py-2 min-w-0">
                      <div className="font-medium text-[#111111] truncate">
                        {svc.name}
                      </div>
                      <div className="text-[12px] text-[#5f6368]">
                        {svc.category}
                      </div>
                    </td>

                    <td className="px-4 py-2 text-[13px] text-[#5f6368] tabular-nums">
                      {svc.estimatedTime}
                    </td>

                    <td className="px-4 py-2 text-[12px] text-[#5f6368] tabular-nums truncate">
                      <span className="text-[#111111] font-medium">
                        iPhone:
                      </span>{" "}
                      {svc.prices.iphone} ·{" "}
                      <span className="text-[#111111] font-medium">
                        Samsung:
                      </span>{" "}
                      {svc.prices.samsung} ·{" "}
                      <span className="text-[#111111] font-medium">
                        Pixel:
                      </span>{" "}
                      {svc.prices.google}
                    </td>

                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(svc.id)}
                        className={`h-[22px] px-2 rounded-[4px] inline-flex items-center text-[12px] font-medium cursor-pointer ${
                          svc.active
                            ? "bg-[#dcfae5] text-[#04250e]"
                            : "bg-[#eeeeee] text-[#5f6368]"
                        }`}
                      >
                        {svc.active ? "Active" : "Paused"}
                      </button>
                    </td>

                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleEdit(svc)}
                          className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] font-medium text-[#111111] cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingService(svc)}
                          aria-label={`Delete ${svc.name}`}
                          className="h-[28px] w-[28px] rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#fee2e2] inline-flex items-center justify-center text-[#5f6368] hover:text-[#dc2626] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full table-fixed text-left border-collapse">
              <thead>
                <tr className="h-[38px] border-b border-[#e5e7eb] text-[12px] font-normal text-[#5f6368]">
                  <th className="px-4 font-normal w-[30%]">Repair service</th>
                  <th className="px-4 font-normal w-[15%]">Apple iPhone</th>
                  <th className="px-4 font-normal w-[15%]">Samsung Galaxy</th>
                  <th className="px-4 font-normal w-[15%]">Google Pixel</th>
                  <th className="px-4 font-normal w-[15%]">Console / Other</th>
                  <th className="px-4 font-normal text-right w-[10%]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f2f2] text-[14px]">
                {filteredServices.map((svc) => (
                  <tr
                    key={svc.id}
                    className="h-[54px] hover:bg-[#f9f9f9] transition-colors"
                  >
                    <td className="px-4 py-2 font-medium text-[#111111] truncate">
                      {svc.name}
                    </td>
                    <td className="px-4 py-2 text-[13px] text-[#111111] font-medium tabular-nums">
                      {svc.prices.iphone}
                    </td>
                    <td className="px-4 py-2 text-[13px] text-[#5f6368] tabular-nums">
                      {svc.prices.samsung}
                    </td>
                    <td className="px-4 py-2 text-[13px] text-[#5f6368] tabular-nums">
                      {svc.prices.google}
                    </td>
                    <td className="px-4 py-2 text-[13px] text-[#5f6368] tabular-nums">
                      {svc.prices.other}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleEdit(svc)}
                          className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] font-medium text-[#111111] cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingService(svc)}
                          aria-label={`Delete ${svc.name}`}
                          className="h-[28px] w-[28px] rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#fee2e2] inline-flex items-center justify-center text-[#5f6368] hover:text-[#dc2626] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 3. ADD / EDIT SERVICE MODAL */}
      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
        >
          <div className="w-full max-w-xl bg-white rounded-[8px] border border-[#e5e7eb] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f2f2f2] flex items-center justify-between">
              <div>
                <h2
                  id="service-modal-title"
                  className="text-[16px] font-semibold text-[#111111]"
                >
                  {editingId
                    ? "Edit repair service & pricing"
                    : "Add repair service & pricing"}
                </h2>
                <p className="text-[12px] text-[#5f6368] mt-0.5">
                  Updates website quote calculator and store service menu
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                aria-label="Close dialog"
                className="p-1 rounded-[5px] text-[#6b6b6b] hover:text-[#111111] hover:bg-[#f2f2f2] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 flex flex-col gap-4 text-[14px]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label
                    htmlFor="svc-name"
                    className="block text-[13px] font-medium text-[#111111] mb-1.5"
                  >
                    Service name
                  </label>
                  <input
                    id="svc-name"
                    type="text"
                    placeholder="e.g., Screen Replacement"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="svc-cat"
                    className="block text-[13px] font-medium text-[#111111] mb-1.5"
                  >
                    Category
                  </label>
                  <select
                    id="svc-cat"
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as ServiceCategory,
                      })
                    }
                    className="w-full h-[38px] px-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="svc-time"
                    className="block text-[13px] font-medium text-[#111111] mb-1.5"
                  >
                    Turnaround time
                  </label>
                  <input
                    id="svc-time"
                    type="text"
                    placeholder="e.g., 30–45 min"
                    value={form.estimatedTime}
                    onChange={(e) =>
                      setForm({ ...form, estimatedTime: e.target.value })
                    }
                    className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#f2f2f2]">
                <span className="block text-[13px] font-medium text-[#111111] mb-2">
                  Benchmark device pricing
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label
                      htmlFor="price-iphone"
                      className="block text-[12px] text-[#5f6368] mb-1"
                    >
                      Apple iPhone
                    </label>
                    <input
                      id="price-iphone"
                      type="text"
                      placeholder="$129–$299"
                      value={form.prices.iphone}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          prices: { ...form.prices, iphone: e.target.value },
                        })
                      }
                      className="w-full h-[36px] px-2.5 rounded-[6px] border border-[#e5e7eb] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="price-samsung"
                      className="block text-[12px] text-[#5f6368] mb-1"
                    >
                      Samsung Galaxy
                    </label>
                    <input
                      id="price-samsung"
                      type="text"
                      placeholder="$99–$249"
                      value={form.prices.samsung}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          prices: { ...form.prices, samsung: e.target.value },
                        })
                      }
                      className="w-full h-[36px] px-2.5 rounded-[6px] border border-[#e5e7eb] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="price-google"
                      className="block text-[12px] text-[#5f6368] mb-1"
                    >
                      Google Pixel
                    </label>
                    <input
                      id="price-google"
                      type="text"
                      placeholder="$89–$179"
                      value={form.prices.google}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          prices: { ...form.prices, google: e.target.value },
                        })
                      }
                      className="w-full h-[36px] px-2.5 rounded-[6px] border border-[#e5e7eb] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="price-other"
                      className="block text-[12px] text-[#5f6368] mb-1"
                    >
                      Console / Other
                    </label>
                    <input
                      id="price-other"
                      type="text"
                      placeholder="$59–$129"
                      value={form.prices.other}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          prices: { ...form.prices, other: e.target.value },
                        })
                      }
                      className="w-full h-[36px] px-2.5 rounded-[6px] border border-[#e5e7eb] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f2f2f2]">
                {editingId ? (
                  <button
                    type="button"
                    onClick={() => {
                      const svc = services.find((s) => s.id === editingId);
                      if (svc) setDeletingService(svc);
                    }}
                    className="h-[32px] px-3 rounded-[6px] border border-[#fca5a5] text-[#dc2626] hover:bg-[#fee2e2] text-[13px] font-medium cursor-pointer transition-colors"
                  >
                    Delete service
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-medium text-[#111111] hover:bg-[#f9f9f9] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-[32px] px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium cursor-pointer"
                  >
                    {editingId ? "Save changes" : "Add service"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DELETE SERVICE CONFIRMATION MODAL */}
      {deletingService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-service-title"
        >
          <div className="w-full max-w-sm bg-white rounded-[8px] border border-[#e5e7eb] shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-5 flex flex-col gap-3">
            <h2
              id="delete-service-title"
              className="text-[15px] font-semibold text-[#111111]"
            >
              Delete repair service?
            </h2>
            <p className="text-[13px] text-[#5f6368] leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="text-[#111111] font-semibold">
                {deletingService.name}
              </strong>{" "}
              from the active catalog? This will remove it from website quote
              widgets and Google Business profile sync.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f2f2f2]">
              <button
                type="button"
                onClick={() => setDeletingService(null)}
                className="h-[30px] px-3 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteService(deletingService.id)}
                className="h-[30px] px-3 rounded-[5px] bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[12px] font-medium cursor-pointer"
              >
                Delete service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
