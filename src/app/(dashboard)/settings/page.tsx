"use client";

import { useEffect, useState, useTransition } from "react";
import { useStoreContext } from "@/lib/storeContext";
import { StoreLocation } from "@/lib/stores";
import {
  getAppSystemSettingsAction,
  updateAppSystemSettingsAction,
  AppSystemSettingsData,
} from "@/actions/settings";
import { saveStoredAiSettings } from "@/lib/aiSettings";
import {
  Plus,
  Trash2,
  MapPin,
  Phone,
  Clock,
  Building2,
  Calendar,
  Globe,
  CheckCircle2,
  Sparkles,
  KeyRound,
  AlertCircle,
  Loader2,
  Mail,
  ShieldCheck,
  Settings2,
  Sliders,
} from "lucide-react";

const EMPTY_STORE: Omit<StoreLocation, "id"> = {
  name: "",
  type: "Branch Location",
  address: "",
  cityStateZip: "Philadelphia, PA",
  phone: "+1 (215) 598-2090",
  email: "contact@smartfonedoctor.com",
  businessHours: "Mon - Sat: 10:00 AM - 7:00 PM",
  calendlyUrl: "",
  gmbUrl: "",
};

export default function SettingsPage() {
  const {
    stores,
    selectedStoreId,
    selectedStore,
    setSelectedStoreId,
    addStore,
    updateStore,
    deleteStore,
    isLoading: isStoresLoading,
  } = useStoreContext();

  const [activeTab, setActiveTab] = useState<"stores" | "ai" | "general">("stores");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Store Editor Form State
  const [editForm, setEditForm] = useState<StoreLocation | null>(null);
  const [newStore, setNewStore] = useState<Omit<StoreLocation, "id">>(EMPTY_STORE);

  // App & AI Settings DB State
  const [systemSettings, setSystemSettings] = useState<AppSystemSettingsData>({
    id: "global_config",
    siteName: "SmartFone Doctor",
    supportEmail: "support@smartfonedoctor.com",
    supportPhone: "+1 (215) 598-2090",
    headquarters: "33 S 52nd St, Philadelphia, PA 19139",
    currency: "USD",
    timezone: "America/New_York",
    defaultAiProvider: "gemini",
    geminiApiKey: "",
    openaiApiKey: "",
    emailNotifications: true,
    smsNotifications: true,
  });

  const [isPending, startTransition] = useTransition();

  const showNotification = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    if (type === "success") {
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  // Load system settings from PostgreSQL on mount
  useEffect(() => {
    getAppSystemSettingsAction().then((res) => {
      if (res.success && res.data) {
        setSystemSettings(res.data);
      }
    });
  }, []);

  // Sync editForm with currently active store unless user is actively editing
  const currentEditStore =
    editForm?.id === selectedStoreId ? editForm : { ...selectedStore };

  const handleFieldChange = (field: keyof StoreLocation, value: string) => {
    setEditForm({ ...currentEditStore, [field]: value });
  };

  // 1. Save Existing Store to PostgreSQL
  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const ok = await updateStore(currentEditStore);
      if (ok) {
        setEditForm(null);
        showNotification("success", `Store branch "${currentEditStore.name}" updated in PostgreSQL!`);
      } else {
        showNotification("error", "Failed to update store branch. Please try again.");
      }
    });
  };

  // 2. Create New Store in PostgreSQL
  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const created = await addStore(newStore);
      if (created) {
        setIsAddingNew(false);
        setNewStore(EMPTY_STORE);
        showNotification("success", `New branch "${created.name}" created in PostgreSQL!`);
      } else {
        showNotification("error", "Failed to create store location.");
      }
    });
  };

  // 3. Delete Store from PostgreSQL
  const handleDeleteCurrent = (id: number) => {
    if (stores.length <= 1) {
      showNotification("error", "Cannot remove the last remaining store location. At least one location is required.");
      return;
    }
    if (confirm("Are you sure you want to permanently delete this branch from the database?")) {
      startTransition(async () => {
        const ok = await deleteStore(id);
        if (ok) {
          setEditForm(null);
          showNotification("success", "Location removed from database.");
        } else {
          showNotification("error", "Failed to delete store location.");
        }
      });
    }
  };

  // 4. Save AI & System Settings to PostgreSQL
  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await updateAppSystemSettingsAction({
        siteName: systemSettings.siteName,
        supportEmail: systemSettings.supportEmail,
        supportPhone: systemSettings.supportPhone,
        headquarters: systemSettings.headquarters,
        currency: systemSettings.currency,
        timezone: systemSettings.timezone,
        defaultAiProvider: systemSettings.defaultAiProvider,
        geminiApiKey: systemSettings.geminiApiKey,
        openaiApiKey: systemSettings.openaiApiKey,
        emailNotifications: systemSettings.emailNotifications,
        smsNotifications: systemSettings.smsNotifications,
      });

      if (res.success && res.data) {
        setSystemSettings(res.data);
        // Also keep client localStorage in sync for instant client-side assistant use
        saveStoredAiSettings({
          defaultProvider: (res.data.defaultAiProvider as "gemini" | "openai") || "gemini",
          geminiApiKey: res.data.geminiApiKey || "",
          openaiApiKey: res.data.openaiApiKey || "",
        });
        showNotification("success", "System & AI settings saved to PostgreSQL!");
      } else {
        showNotification("error", res.error || "Failed to save settings.");
      }
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto antialiased">
      {/* 1. HEADER (Shadcn Clean) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
              Settings &amp; Integrations
            </h1>
            <span className="text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 px-2 py-0.5 rounded-md">
              PostgreSQL DB-First
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manage Philadelphia retail store branches, AI Page Builder API keys, and platform operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-8 px-3 rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-700 inline-flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{stores.length} Active Stores</span>
          </span>
        </div>
      </div>

      {/* FEEDBACK NOTIFICATION ALERTS */}
      {feedback && (
        <div
          role="alert"
          className={`p-3.5 rounded-lg border text-xs sm:text-sm flex items-center justify-between animate-in fade-in duration-150 ${
            feedback.type === "success"
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              : "bg-red-50/70 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-zinc-400 hover:text-zinc-700 px-2 py-0.5 text-base leading-none cursor-pointer"
            aria-label="Dismiss alert"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. TAB NAVIGATION (Shadcn Tabs) */}
      <div className="flex items-center gap-1 border-b border-zinc-200 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("stores")}
          className={`h-9 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "stores"
              ? "border-zinc-950 text-zinc-950 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Store Branches ({stores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`h-9 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "ai"
              ? "border-zinc-950 text-zinc-950 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Engine &amp; Keys</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`h-9 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "general"
              ? "border-zinc-950 text-zinc-950 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>General Operations</span>
        </button>
      </div>

      {/* 3. TAB 1: STORE BRANCHES & LOCATIONS */}
      {activeTab === "stores" && (
        <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
          {/* LEFT: STORE CARDS LIST */}
          <div className="w-full lg:w-1/3 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3.5 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
                Branches List
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(true);
                  setEditForm(null);
                }}
                className="h-7 px-2.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Branch</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 w-full">
              {stores.map((store) => {
                const isSelected = store.id === selectedStoreId && !isAddingNew;
                return (
                  <div
                    key={store.id}
                    onClick={() => {
                      setSelectedStoreId(store.id);
                      setIsAddingNew(false);
                      setEditForm(null);
                    }}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? "border-zinc-950 bg-white shadow-xs ring-1 ring-zinc-950"
                        : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-zinc-900 truncate">
                          {store.name}
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">
                            {store.address}, {store.cityStateZip.split(",")[0]}
                          </span>
                        </p>
                      </div>
                      <span className="text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 px-1.5 py-0.5 rounded shrink-0">
                        {store.type}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="inline-flex items-center gap-1 text-zinc-500">
                        <Phone className="w-3 h-3 text-zinc-400" />
                        <span>{store.phone}</span>
                      </span>
                      <span className="font-medium text-zinc-900">
                        {isSelected ? "● Editing" : "Select →"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: STORE FORM EDITOR */}
          <div className="w-full lg:w-2/3 rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs">
            {isAddingNew ? (
              /* ADD NEW STORE FORM */
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900">Add New Store Location</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Create and persist a new physical branch in PostgreSQL.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="h-8 px-3 rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleCreateStore} className="flex flex-col gap-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Store / Branch Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SmartFoneDoctor - South Philly"
                        value={newStore.name}
                        onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Branch Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. Express Branch, Mall Kiosk"
                        value={newStore.type}
                        onChange={(e) => setNewStore({ ...newStore, type: e.target.value })}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (215) 555-0100"
                        value={newStore.phone}
                        onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Branch Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="branch@smartfonedoctor.com"
                        value={newStore.email}
                        onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Street Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="1234 Market St"
                        value={newStore.address}
                        onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">City, State, Zip *</label>
                      <input
                        type="text"
                        required
                        value={newStore.cityStateZip}
                        onChange={(e) => setNewStore({ ...newStore, cityStateZip: e.target.value })}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-medium text-zinc-900">Operating Hours *</label>
                      <input
                        type="text"
                        required
                        value={newStore.businessHours}
                        onChange={(e) => setNewStore({ ...newStore, businessHours: e.target.value })}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex flex-col gap-3">
                    <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Online Booking &amp; Google Maps URLs</span>
                    </span>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Calendly Booking URL</label>
                      <input
                        type="url"
                        placeholder="https://calendly.com/smartfonedoctor/..."
                        value={newStore.calendlyUrl}
                        onChange={(e) => setNewStore({ ...newStore, calendlyUrl: e.target.value })}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Google Business Profile (GMB) URL</label>
                      <input
                        type="url"
                        placeholder="https://maps.google.com/?cid=..."
                        value={newStore.gmbUrl}
                        onChange={(e) => setNewStore({ ...newStore, gmbUrl: e.target.value })}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="h-9 px-4 rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="h-9 rounded-md bg-zinc-950 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                    >
                      {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save &amp; Create Branch</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* EDIT EXISTING SELECTED STORE FORM */
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 mb-5 gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900 truncate">
                      {currentEditStore.name}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Edit branch contact details and synchronized booking coordinates.
                    </p>
                  </div>
                  {stores.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCurrent(currentEditStore.id)}
                      disabled={isPending}
                      className="h-8 px-2.5 rounded-md border border-red-200 bg-white hover:bg-red-50 text-red-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Store</span>
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveCurrent} className="flex flex-col gap-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Store / Branch Name</label>
                      <input
                        type="text"
                        required
                        value={currentEditStore.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Branch Tag / Label</label>
                      <input
                        type="text"
                        value={currentEditStore.type}
                        onChange={(e) => handleFieldChange("type", e.target.value)}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={currentEditStore.phone}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Branch Email</label>
                      <input
                        type="email"
                        required
                        value={currentEditStore.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Street Address</label>
                      <input
                        type="text"
                        required
                        value={currentEditStore.address}
                        onChange={(e) => handleFieldChange("address", e.target.value)}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">City, State, Zip</label>
                      <input
                        type="text"
                        required
                        value={currentEditStore.cityStateZip}
                        onChange={(e) => handleFieldChange("cityStateZip", e.target.value)}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-medium text-zinc-900">Operating Hours</label>
                      <input
                        type="text"
                        required
                        value={currentEditStore.businessHours}
                        onChange={(e) => handleFieldChange("businessHours", e.target.value)}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex flex-col gap-3">
                    <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Online Booking &amp; Local SEO Links</span>
                    </span>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Calendly Booking URL</label>
                      <input
                        type="url"
                        value={currentEditStore.calendlyUrl}
                        onChange={(e) => handleFieldChange("calendlyUrl", e.target.value)}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-zinc-900">Google Business Profile (GMB) URL</label>
                      <input
                        type="url"
                        value={currentEditStore.gmbUrl}
                        onChange={(e) => handleFieldChange("gmbUrl", e.target.value)}
                        className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-100">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="h-9 rounded-md bg-zinc-950 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                    >
                      {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Save Changes to Database</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB 2: AI ENGINE & API KEYS */}
      {activeTab === "ai" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs max-w-3xl">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-950" />
                <span>AI Page Builder Keys &amp; Model Engine</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Saved directly in PostgreSQL database. The Puck Studio AI assistant uses these for automated section generation.
              </p>
            </div>
            <span className="text-[11px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <KeyRound className="w-3 h-3" />
              <span>DB Persisted</span>
            </span>
          </div>

          <form onSubmit={handleSaveSystemSettings} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-900">Default AI Provider</label>
              <select
                value={systemSettings.defaultAiProvider}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    defaultAiProvider: e.target.value,
                  }))
                }
                className="h-9 rounded-md border border-zinc-200 bg-transparent px-3 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
              >
                <option value="gemini">Google Gemini 2.5 Flash (Recommended - Native Multimodal)</option>
                <option value="openai">OpenAI GPT-4o Mini (High Speed)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-900">Google Gemini API Key</label>
              <input
                type="password"
                value={systemSettings.geminiApiKey || ""}
                onChange={(e) =>
                  setSystemSettings((prev) => ({ ...prev, geminiApiKey: e.target.value }))
                }
                placeholder="AIzaSy..."
                className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
              />
              <span className="text-[11px] text-zinc-400">
                Used for generating Hero sections, FAQ content, and dynamic Puck blocks.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-900">OpenAI API Key</label>
              <input
                type="password"
                value={systemSettings.openaiApiKey || ""}
                onChange={(e) =>
                  setSystemSettings((prev) => ({ ...prev, openaiApiKey: e.target.value }))
                }
                placeholder="sk-proj-..."
                className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
              />
              <span className="text-[11px] text-zinc-400">
                Optional alternative provider for Page Builder content generation.
              </span>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-100">
              <button
                type="submit"
                disabled={isPending}
                className="h-9 rounded-md bg-zinc-950 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save AI Keys to PostgreSQL</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. TAB 3: GENERAL OPERATIONS */}
      {activeTab === "general" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs max-w-3xl">
          <div className="border-b border-zinc-100 pb-4 mb-5">
            <h2 className="text-base font-semibold text-zinc-900">General Operations &amp; Company Data</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Global organization parameters and dispatch notifications.
            </p>
          </div>

          <form onSubmit={handleSaveSystemSettings} className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-900">Legal Company / Business Name</label>
                <input
                  type="text"
                  value={systemSettings.siteName}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, siteName: e.target.value }))
                  }
                  className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-900">Central Support Phone</label>
                <input
                  type="tel"
                  value={systemSettings.supportPhone}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, supportPhone: e.target.value }))
                  }
                  className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-900">Central Support Email</label>
                <input
                  type="email"
                  value={systemSettings.supportEmail}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, supportEmail: e.target.value }))
                  }
                  className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-900">Timezone</label>
                <input
                  type="text"
                  value={systemSettings.timezone}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, timezone: e.target.value }))
                  }
                  className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-900">Headquarters Address</label>
              <input
                type="text"
                value={systemSettings.headquarters}
                onChange={(e) =>
                  setSystemSettings((prev) => ({ ...prev, headquarters: e.target.value }))
                }
                className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
              />
            </div>

            <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-900">Notification Channels</span>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={systemSettings.emailNotifications}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      emailNotifications: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950"
                />
                <span className="text-xs text-zinc-700">
                  Send email notifications when new customer repair leads arrive
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={systemSettings.smsNotifications}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      smsNotifications: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950"
                />
                <span className="text-xs text-zinc-700">
                  Send SMS alerts to on-duty technician for urgent walk-in queue
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-100">
              <button
                type="submit"
                disabled={isPending}
                className="h-9 rounded-md bg-zinc-950 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Operations Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
