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
  Layers,
  Settings2,
  Sliders,
  ExternalLink,
  Store,
  ChevronRight,
  Image as ImageIcon,
  BarChart3,
} from "lucide-react";
import MediaModal, { type SelectedMediaPayload } from "@/components/admin/MediaModal";

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

  const [activeTab, setActiveTab] = useState<"stores" | "ai" | "analytics" | "general">("stores");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Store Editor Form State
  const [editForm, setEditForm] = useState<StoreLocation | null>(null);
  const [newStore, setNewStore] = useState<Omit<StoreLocation, "id">>(EMPTY_STORE);

  // App & AI Settings State
  const [mediaFieldTarget, setMediaFieldTarget] = useState<"logoUrl" | "faviconUrl" | null>(null);
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
    gtmContainerId: "",
    ga4MeasurementId: "",
    metaPixelId: "",
    clarityProjectId: "",
    metaCapiAccessToken: "",
    metaTestEventCode: "",
    ga4ApiSecret: "",
    enableDataLayer: true,
    enableDebugEvents: false,
  });

  const [isPending, startTransition] = useTransition();

  const showNotification = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    if (type === "success") {
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  // Load system settings on mount
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

  // 1. Save Existing Store
  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const ok = await updateStore(currentEditStore);
      if (ok) {
        setEditForm(null);
        showNotification("success", `Store branch "${currentEditStore.name}" updated successfully!`);
      } else {
        showNotification("error", "Failed to update store branch. Please try again.");
      }
    });
  };

  // 2. Create New Store
  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const created = await addStore(newStore);
      if (created) {
        setIsAddingNew(false);
        setNewStore(EMPTY_STORE);
        showNotification("success", `New branch "${created.name}" created successfully!`);
      } else {
        showNotification("error", "Failed to create store location.");
      }
    });
  };

  // 3. Delete Store
  const handleDeleteCurrent = (id: number) => {
    if (stores.length <= 1) {
      showNotification("error", "Cannot remove the last remaining store location. At least one location is required.");
      return;
    }
    if (confirm("Are you sure you want to remove this store location?")) {
      startTransition(async () => {
        const ok = await deleteStore(id);
        if (ok) {
          setEditForm(null);
          showNotification("success", "Store location removed successfully.");
        } else {
          showNotification("error", "Failed to remove store location.");
        }
      });
    }
  };

  // 4. Save AI & System Settings
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
        logoUrl: systemSettings.logoUrl,
        faviconUrl: systemSettings.faviconUrl,
        defaultAiProvider: systemSettings.defaultAiProvider,
        geminiApiKey: systemSettings.geminiApiKey,
        openaiApiKey: systemSettings.openaiApiKey,
        emailNotifications: systemSettings.emailNotifications,
        smsNotifications: systemSettings.smsNotifications,
        gtmContainerId: systemSettings.gtmContainerId,
        ga4MeasurementId: systemSettings.ga4MeasurementId,
        metaPixelId: systemSettings.metaPixelId,
        clarityProjectId: systemSettings.clarityProjectId,
        metaCapiAccessToken: systemSettings.metaCapiAccessToken,
        metaTestEventCode: systemSettings.metaTestEventCode,
        ga4ApiSecret: systemSettings.ga4ApiSecret,
        enableDataLayer: systemSettings.enableDataLayer,
        enableDebugEvents: systemSettings.enableDebugEvents,
      });

      if (res.success && res.data) {
        setSystemSettings(res.data);
        saveStoredAiSettings({
          defaultProvider: (res.data.defaultAiProvider as "gemini" | "openai") || "gemini",
          geminiApiKey: res.data.geminiApiKey || "",
          openaiApiKey: res.data.openaiApiKey || "",
        });
        showNotification("success", "Settings and AI configuration saved successfully!");
      } else {
        showNotification("error", res.error || "Failed to save settings.");
      }
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto antialiased">
      {/* 1. MATERIAL 3 HERO APP BAR / HEADER (Brand Teal & Slate Theme) */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-teal-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#009691] text-white flex items-center justify-center shadow-md shadow-[#009691]/25 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                Store locations &amp; integrations
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Store addresses, opening hours and booking links.
              </p>
            </div>
          </div>
        </div>

        {/* MATERIAL ASSIST CHIPS (Clean Business Metrics, No DB Jargon) */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200/80 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#009691]" />
            <span>Operational · Verified</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#009691] px-4 py-1.5 text-xs font-semibold text-white shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>{stores.length} Retail Stores</span>
          </span>
        </div>
      </div>

      {/* FEEDBACK SNACKBAR */}
      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
              : "bg-red-50/90 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="font-medium leading-relaxed">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 px-2 py-0.5 text-lg font-bold leading-none cursor-pointer"
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. MATERIAL 3 SEGMENTED BUTTONS / TABS */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl inline-flex gap-1.5 self-start border border-slate-200/60 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("stores")}
          className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "stores"
              ? "bg-white text-[#009691] shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Branch Locations ({stores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "ai"
              ? "bg-white text-[#009691] shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#009691]" />
          <span>AI keys</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "analytics"
              ? "bg-white text-[#009691] shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#009691]" />
          <span>Analytics &amp; Tag Manager</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "general"
              ? "bg-white text-[#009691] shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>General Operations</span>
        </button>
      </div>

      {/* 3. TAB 1: STORE BRANCHES & LOCATIONS */}
      {activeTab === "stores" && (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* LEFT: STORE CARDS LIST */}
          <div className="w-full lg:w-1/3 flex flex-col gap-3.5 shrink-0">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Branches ({stores.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(true);
                  setEditForm(null);
                }}
                className="h-8 px-3.5 rounded-full bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Store</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 w-full">
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
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? "border-[#009691] bg-teal-50/40 shadow-xs ring-2 ring-[#009691]/15"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {store.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#009691] shrink-0" />
                          <span className="truncate">
                            {store.address}, {store.cityStateZip.split(",")[0]}
                          </span>
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 border ${
                        isSelected
                          ? "bg-[#009691] text-white border-transparent"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {store.type}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{store.phone}</span>
                      </span>
                      <span className={`font-semibold flex items-center gap-1 ${
                        isSelected ? "text-[#009691]" : "text-slate-500"
                      }`}>
                        <span>{isSelected ? "Editing" : "Select"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: STORE FORM EDITOR (Material Elevated Surface) */}
          <div className="w-full lg:w-2/3 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            {isAddingNew ? (
              /* ADD NEW STORE FORM */
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">Add New Store Location</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter location address, operating hours, and customer contact details.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="h-8 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleCreateStore} className="flex flex-col gap-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Store / Branch Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SmartFoneDoctor - South Philly"
                        value={newStore.name}
                        onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Branch Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. Express Branch, Mall Kiosk"
                        value={newStore.type}
                        onChange={(e) => setNewStore({ ...newStore, type: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (215) 555-0100"
                        value={newStore.phone}
                        onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Branch Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="branch@smartfonedoctor.com"
                        value={newStore.email}
                        onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Street Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="1234 Market St"
                        value={newStore.address}
                        onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">City, State, Zip *</label>
                      <input
                        type="text"
                        required
                        value={newStore.cityStateZip}
                        onChange={(e) => setNewStore({ ...newStore, cityStateZip: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">Operating Hours *</label>
                      <input
                        type="text"
                        required
                        value={newStore.businessHours}
                        onChange={(e) => setNewStore({ ...newStore, businessHours: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-100 flex flex-col gap-3.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#009691]" />
                      <span>Online Booking &amp; Google Maps URLs</span>
                    </span>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Calendly Booking URL</label>
                      <input
                        type="url"
                        placeholder="https://calendly.com/smartfonedoctor/..."
                        value={newStore.calendlyUrl}
                        onChange={(e) => setNewStore({ ...newStore, calendlyUrl: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Google Business Profile (GMB) URL</label>
                      <input
                        type="url"
                        placeholder="https://maps.google.com/?cid=..."
                        value={newStore.gmbUrl}
                        onChange={(e) => setNewStore({ ...newStore, gmbUrl: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="h-10 rounded-xl bg-[#009691] hover:bg-[#007f7b] px-6 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#009691]/25 transition-all focus:outline-none focus:ring-2 focus:ring-teal-600/40 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                    >
                      {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Save &amp; Create Branch</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* EDIT EXISTING SELECTED STORE FORM */
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      {currentEditStore.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Edit branch contact details and synchronized booking coordinates.
                    </p>
                  </div>
                  {stores.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCurrent(currentEditStore.id)}
                      disabled={isPending}
                      className="h-9 px-3.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Store</span>
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveCurrent} className="flex flex-col gap-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Store / Branch Name</label>
                      <input
                        type="text"
                        required
                        value={currentEditStore.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Branch Tag / Label</label>
                      <input
                        type="text"
                        value={currentEditStore.type}
                        onChange={(e) => handleFieldChange("type", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={currentEditStore.phone}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Branch Email Address</label>
                      <input
                        type="email"
                        required
                        value={currentEditStore.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Street Address</label>
                      <input
                        type="text"
                        required
                        value={currentEditStore.address}
                        onChange={(e) => handleFieldChange("address", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">City, State, Zip</label>
                      <input
                        type="text"
                        required
                        value={currentEditStore.cityStateZip}
                        onChange={(e) => handleFieldChange("cityStateZip", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">Operating Hours</label>
                      <input
                        type="text"
                        required
                        value={currentEditStore.businessHours}
                        onChange={(e) => handleFieldChange("businessHours", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-100 flex flex-col gap-3.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#009691]" />
                      <span>Online Booking &amp; Local SEO Links</span>
                    </span>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Calendly Booking URL</label>
                      <input
                        type="url"
                        value={currentEditStore.calendlyUrl}
                        onChange={(e) => handleFieldChange("calendlyUrl", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700">Google Business Profile (GMB) URL</label>
                      <input
                        type="url"
                        value={currentEditStore.gmbUrl}
                        onChange={(e) => handleFieldChange("gmbUrl", e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="h-10 rounded-xl bg-[#009691] hover:bg-[#007f7b] px-6 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#009691]/25 transition-all focus:outline-none focus:ring-2 focus:ring-teal-600/40 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                    >
                      {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Save Changes</span>
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
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#009691]" />
                <span>AI keys for the page builder</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your API keys for the AI assistant to generate repair content and landing pages.
              </p>
            </div>
            <span className="text-xs font-semibold bg-teal-50 text-[#009691] border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>API Credentials</span>
            </span>
          </div>

          <form onSubmit={handleSaveSystemSettings} className="flex flex-col gap-4 text-xs sm:text-sm">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Default AI Provider</label>
              <select
                value={systemSettings.defaultAiProvider}
                onChange={(e) =>
                  setSystemSettings((prev) => ({
                    ...prev,
                    defaultAiProvider: e.target.value,
                  }))
                }
                className="h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              >
                <option value="gemini">Google Gemini Flash (Recommended - Auto Latest)</option>
                <option value="openai">OpenAI GPT-4o Mini (High Speed)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Google Gemini API Key</label>
              <input
                type="password"
                value={systemSettings.geminiApiKey || ""}
                onChange={(e) =>
                  setSystemSettings((prev) => ({ ...prev, geminiApiKey: e.target.value }))
                }
                placeholder="AIzaSy..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
              <span className="text-[11px] text-slate-400">
                Used for generating Hero sections, FAQ content, and dynamic Puck blocks.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">OpenAI API Key</label>
              <input
                type="password"
                value={systemSettings.openaiApiKey || ""}
                onChange={(e) =>
                  setSystemSettings((prev) => ({ ...prev, openaiApiKey: e.target.value }))
                }
                placeholder="sk-proj-..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
              <span className="text-[11px] text-slate-400">
                Optional alternative provider for Page Builder content generation.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
              <button
                type="submit"
                disabled={isPending}
                className="h-10 rounded-xl bg-[#009691] hover:bg-[#007f7b] px-6 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#009691]/25 transition-all focus:outline-none focus:ring-2 focus:ring-teal-600/40 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save AI Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4B. TAB: ANALYTICS, TAG MANAGER & DATALAYER */}
      {activeTab === "analytics" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs max-w-3xl">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Google Tag Manager, GA4 &amp; DataLayer
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Stored in PostgreSQL and injected across all public pages with Consent Mode v2 and live event tracking.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
              <span
                className={`px-2.5 py-1 rounded-full border ${
                  systemSettings.gtmContainerId?.trim()
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                GTM {systemSettings.gtmContainerId?.trim() ? "On" : "Off"}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full border ${
                  systemSettings.ga4MeasurementId?.trim()
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                GA4 {systemSettings.ga4MeasurementId?.trim() ? "On" : "Off"}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full border ${
                  systemSettings.metaPixelId?.trim()
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                Pixel {systemSettings.metaPixelId?.trim() ? "On" : "Off"}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full border ${
                  systemSettings.metaCapiAccessToken?.trim()
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                CAPI {systemSettings.metaCapiAccessToken?.trim() ? "On" : "Off"}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full border ${
                  systemSettings.clarityProjectId?.trim()
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                Clarity {systemSettings.clarityProjectId?.trim() ? "On" : "Off"}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full border ${
                  systemSettings.enableDataLayer !== false
                    ? "bg-teal-50 text-[#009691] border-teal-200"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                DataLayer {systemSettings.enableDataLayer !== false ? "Active" : "Paused"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveSystemSettings} className="flex flex-col gap-5 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Google Tag Manager (GTM Container ID)
                </label>
                <input
                  type="text"
                  value={systemSettings.gtmContainerId || ""}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, gtmContainerId: e.target.value }))
                  }
                  placeholder="GTM-XXXXXXX"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 font-mono text-xs text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
                <span className="text-[11px] text-slate-500">
                  Loads GTM container + &lt;noscript&gt; fallback across all public pages.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Google Analytics 4 (Measurement ID)
                </label>
                <input
                  type="text"
                  value={systemSettings.ga4MeasurementId || ""}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, ga4MeasurementId: e.target.value }))
                  }
                  placeholder="G-XXXXXXXXXX"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 font-mono text-xs text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
                <span className="text-[11px] text-slate-500">
                  If GA4 is already configured inside your GTM container, leave blank to prevent duplicate pageviews.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Meta (Facebook) Pixel ID
                </label>
                <input
                  type="text"
                  value={systemSettings.metaPixelId || ""}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, metaPixelId: e.target.value }))
                  }
                  placeholder="123456789012345"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 font-mono text-xs text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Microsoft Clarity Project ID
                </label>
                <input
                  type="text"
                  value={systemSettings.clarityProjectId || ""}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, clarityProjectId: e.target.value }))
                  }
                  placeholder="abc123def4"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 font-mono text-xs text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-900">DataLayer Event Controls</span>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={systemSettings.enableDataLayer !== false}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      enableDataLayer: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#009691] focus:ring-[#009691]"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Enable structured window.dataLayer event tracking
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(systemSettings.enableDebugEvents)}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      enableDebugEvents: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#009691] focus:ring-[#009691]"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Log dataLayer events in browser console for QA
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Server-Side Conversions API (Optional — Ad-Blocker Proof)
                </span>
                <span className="text-[11px] text-slate-500">
                  Fires verified server-side Lead conversions directly from PostgreSQL lead submission with event_id deduplication.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Meta Conversions API Access Token (CAPI)
                  </label>
                  <input
                    type="password"
                    value={systemSettings.metaCapiAccessToken || ""}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        metaCapiAccessToken: e.target.value,
                      }))
                    }
                    placeholder="EAA..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 font-mono text-xs text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Meta CAPI Test Event Code
                  </label>
                  <input
                    type="text"
                    value={systemSettings.metaTestEventCode || ""}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        metaTestEventCode: e.target.value,
                      }))
                    }
                    placeholder="TEST12345"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 font-mono text-xs text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    GA4 Measurement Protocol API Secret
                  </label>
                  <input
                    type="password"
                    value={systemSettings.ga4ApiSecret || ""}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        ga4ApiSecret: e.target.value,
                      }))
                    }
                    placeholder="Optional server-side GA4 secret"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 font-mono text-xs text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 block">
                Auto-Tracked Funnel Events (GA4 / GTM DataLayer ↔ Meta Pixel &amp; CAPI)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] font-mono text-slate-700">
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">page_view ↔ PageView</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">view_item ↔ ViewContent</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">select_device / select_model (Step 1–2)</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">add_to_cart ↔ AddToCart (Step 3)</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">begin_checkout ↔ InitiateCheckout (Step 4)</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">generate_lead ↔ Lead + Schedule + CAPI</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">phone_click / email_click ↔ Contact</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">directions_click ↔ FindLocation</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">booking_cta_click ↔ Schedule</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">search ↔ Search</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">select_repair_tier / track_repair_status</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">scroll_depth (50%, 90%) / faq_expand</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">qualify_lead / working_lead (CRM Status)</div>
                <div className="bg-white rounded-lg border border-teal-100 px-2.5 py-1.5">close_convert_lead ↔ Purchase / close_unconvert_lead</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isPending}
                className="h-10 rounded-xl bg-[#009691] hover:bg-[#007f7b] px-6 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#009691]/25 transition-all focus:outline-none focus:ring-2 focus:ring-teal-600/40 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Analytics &amp; Tag Manager</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. TAB 3: GENERAL OPERATIONS */}
      {activeTab === "general" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs max-w-3xl">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">General Operations &amp; Company Data</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Global organization parameters and dispatch notifications.
            </p>
          </div>

          <form onSubmit={handleSaveSystemSettings} className="flex flex-col gap-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Legal Company / Business Name</label>
                <input
                  type="text"
                  value={systemSettings.siteName}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, siteName: e.target.value }))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Central Support Phone</label>
                <input
                  type="tel"
                  value={systemSettings.supportPhone}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, supportPhone: e.target.value }))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Central Support Email</label>
                <input
                  type="email"
                  value={systemSettings.supportEmail}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, supportEmail: e.target.value }))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Timezone</label>
                <input
                  type="text"
                  value={systemSettings.timezone}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({ ...prev, timezone: e.target.value }))
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Headquarters Address</label>
              <input
                type="text"
                value={systemSettings.headquarters}
                onChange={(e) =>
                  setSystemSettings((prev) => ({ ...prev, headquarters: e.target.value }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Brand Logo URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={systemSettings.logoUrl || ""}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({ ...prev, logoUrl: e.target.value }))
                    }
                    placeholder="/logo-png.jpg"
                    className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaFieldTarget("logoUrl")}
                    className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Choose from Media Library"
                  >
                    <ImageIcon className="w-4 h-4 text-[#009691]" />
                    <span className="hidden sm:inline">Media Library</span>
                  </button>
                  {systemSettings.logoUrl && (
                    <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={systemSettings.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Browser Favicon URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={systemSettings.faviconUrl || ""}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({ ...prev, faviconUrl: e.target.value }))
                    }
                    placeholder="/favicon.ico"
                    className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-[#009691] focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaFieldTarget("faviconUrl")}
                    className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Choose from Media Library"
                  >
                    <ImageIcon className="w-4 h-4 text-[#009691]" />
                    <span className="hidden sm:inline">Media Library</span>
                  </button>
                  {systemSettings.faviconUrl && (
                    <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={systemSettings.faviconUrl} alt="Favicon Preview" className="w-5 h-5 object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-900">Notification Channels</span>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={systemSettings.emailNotifications}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      emailNotifications: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#009691] focus:ring-[#009691]"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Send email notifications when new customer repair leads arrive
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={systemSettings.smsNotifications}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      smsNotifications: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#009691] focus:ring-[#009691]"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Send SMS alerts to on-duty technician for urgent walk-in queue
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
              <button
                type="submit"
                disabled={isPending}
                className="h-10 rounded-xl bg-[#009691] hover:bg-[#007f7b] px-6 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#009691]/25 transition-all focus:outline-none focus:ring-2 focus:ring-teal-600/40 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Operations Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Media Management Library Modal */}
      <MediaModal
        isOpen={mediaFieldTarget !== null}
        onClose={() => setMediaFieldTarget(null)}
        onSelect={(payload: SelectedMediaPayload) => {
          if (mediaFieldTarget) {
            setSystemSettings((prev) => ({ ...prev, [mediaFieldTarget]: payload.url }));
          }
          setMediaFieldTarget(null);
        }}
        title={`Select ${mediaFieldTarget === "logoUrl" ? "Brand Logo Asset" : "Browser Favicon Asset"}`}
        selectButtonText="Use This Asset"
        initialSelectedUrl={mediaFieldTarget ? systemSettings[mediaFieldTarget] || "" : ""}
      />
    </div>
  );
}
