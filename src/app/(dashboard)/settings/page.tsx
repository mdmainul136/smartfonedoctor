"use client";

import { useState } from "react";
import { useStoreContext } from "@/lib/storeContext";
import { StoreLocation } from "@/lib/stores";
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
} from "lucide-react";

const EMPTY_STORE: Omit<StoreLocation, "id"> = {
  name: "",
  type: "Branch Location",
  address: "",
  cityStateZip: "Philadelphia, PA",
  phone: "",
  email: "",
  businessHours: "Mon - Sat: 10:00 AM - 7:00 PM",
  calendlyUrl: "",
  gmbUrl: "",
};

const SettingsPage = () => {
  const {
    stores,
    selectedStoreId,
    selectedStore,
    setSelectedStoreId,
    addStore,
    updateStore,
    deleteStore,
  } = useStoreContext();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<StoreLocation | null>(null);
  const [newStore, setNewStore] = useState<Omit<StoreLocation, "id">>(EMPTY_STORE);

  // Sync editForm with currently active store unless user is actively editing
  const currentEditStore =
    editForm?.id === selectedStoreId ? editForm : { ...selectedStore };

  const handleFieldChange = (field: keyof StoreLocation, value: string) => {
    setEditForm({ ...currentEditStore, [field]: value });
  };

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore(currentEditStore);
    setEditForm(null);
    setSavedNotice(`Changes saved for "${currentEditStore.name}"!`);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    const created: StoreLocation = {
      ...newStore,
      id: Date.now(),
    };
    addStore(created);
    setIsAddingNew(false);
    setNewStore(EMPTY_STORE);
    setSavedNotice(`"${created.name}" has been added!`);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleDeleteCurrent = (id: number) => {
    if (stores.length <= 1) {
      alert("You need to keep at least one store location.");
      return;
    }
    if (confirm("Are you sure you want to delete this store location?")) {
      deleteStore(id);
      setEditForm(null);
      setSavedNotice("Location removed successfully.");
      setTimeout(() => setSavedNotice(null), 3000);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col gap-4 max-w-7xl w-full mx-auto">
      {/* 1. RESPONSIVE HEADER (Awesome-Design standard) */}
      <div className="bg-lamaSky p-4 sm:py-5 sm:px-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs border border-teal-100/40">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
            Store Locations &amp; Integrations
          </h1>
          <p className="text-xs text-gray-600 mt-1 max-w-xl leading-relaxed text-pretty">
            Add or edit store branches, manage Calendly booking links, and configure Google Business Profile (GMB) listings.
          </p>
        </div>

        <div className="self-start sm:self-auto shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-white text-teal-800 px-3 py-1.5 rounded-full shadow-2xs tabular-nums border border-white/60">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" aria-hidden="true" />
          <span>{stores.length}&nbsp;Total Stores</span>
        </div>
      </div>

      {/* NOTIFICATION FEEDBACK */}
      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="font-medium">{savedNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedNotice(null)}
            className="font-bold text-emerald-600 hover:text-emerald-900 px-2 py-0.5 rounded cursor-pointer"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. MAIN RESPONSIVE 2-COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
        {/* LEFT COLUMN: LIST OF STORES */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl shadow-2xs border border-gray-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Branches ({stores.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAddingNew(true);
                setEditForm(null);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add Store</span>
            </button>
          </div>

          {/* STORE CARDS LIST */}
          <div className="flex flex-col gap-2.5 w-full">
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
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-150 border ${
                    isSelected
                      ? "bg-white border-teal-500 ring-2 ring-teal-500/15 shadow-sm"
                      : "bg-white hover:bg-gray-50/80 border-gray-100 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-gray-800 truncate">
                        {store.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" aria-hidden="true" />
                        <span className="truncate">
                          {store.address}, {store.cityStateZip.split(",")[0]}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                        isSelected
                          ? "bg-teal-50 text-teal-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {store.type}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" aria-hidden="true" />
                      <span>{store.phone}</span>
                    </span>
                    <span className="text-teal-600 font-medium">
                      {isSelected ? "● Editing" : "Click to edit →"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: RESPONSIVE FORM EDITOR */}
        <div className="w-full lg:w-2/3 bg-white p-4 sm:p-6 rounded-xl shadow-2xs border border-gray-100">
          {isAddingNew ? (
            /* ADD NEW STORE FORM */
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-5">
                <div>
                  <h2 className="text-base font-bold text-gray-800">Add New Store Location</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Fill in branch details and dedicated booking &amp; map links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-gray-500 hover:text-gray-800 font-medium px-3 py-1 bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateStore} className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold">Store / Branch Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. SmartFoneDoctor - South Philly"
                      value={newStore.name}
                      onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold">Branch Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Express Branch, Mall Kiosk"
                      value={newStore.type}
                      onChange={(e) => setNewStore({ ...newStore, type: e.target.value })}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="+1 (215) 555-…"
                      value={newStore.phone}
                      onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold">Branch Email Address *</label>
                    <input
                      type="email"
                      placeholder="branch@smartfonedoctor.com"
                      value={newStore.email}
                      onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold">Street Address *</label>
                    <input
                      type="text"
                      placeholder="1234 Main St"
                      value={newStore.address}
                      onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold">City, State, Zip *</label>
                    <input
                      type="text"
                      value={newStore.cityStateZip}
                      onChange={(e) => setNewStore({ ...newStore, cityStateZip: e.target.value })}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-gray-700 font-semibold">Operating Hours *</label>
                    <input
                      type="text"
                      value={newStore.businessHours}
                      onChange={(e) => setNewStore({ ...newStore, businessHours: e.target.value })}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>
                </div>

                {/* ONLINE LINKS */}
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-teal-600" aria-hidden="true" />
                    <span>Online Booking &amp; Local SEO Links</span>
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                      <span>Calendly Booking URL *</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://calendly.com/smartfonedoctor/…"
                      value={newStore.calendlyUrl}
                      onChange={(e) => setNewStore({ ...newStore, calendlyUrl: e.target.value })}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                      <span>Google Business Profile (GMB) URL *</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?cid=…"
                      value={newStore.gmbUrl}
                      onChange={(e) => setNewStore({ ...newStore, gmbUrl: e.target.value })}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    Save &amp; Create Branch
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* EDIT EXISTING SELECTED STORE FORM */
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-gray-100 mb-5 gap-2">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-800 truncate">
                    {currentEditStore.name}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Edit branch contact details, Calendly booking link, and Google Maps listing.
                  </p>
                </div>
                {stores.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCurrent(currentEditStore.id)}
                    className="self-start sm:self-auto inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer py-1 px-2 rounded hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Remove Store</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCurrent} className="flex flex-col gap-4 text-xs">
                {/* 1. STORE ADDRESS & CONTACT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold">Store / Branch Name</label>
                    <input
                      type="text"
                      value={currentEditStore.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold">Branch Tag / Label</label>
                    <input
                      type="text"
                      value={currentEditStore.type}
                      onChange={(e) => handleFieldChange("type", e.target.value)}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold">Phone Number</label>
                    <input
                      type="tel"
                      value={currentEditStore.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold">Branch Email Address</label>
                    <input
                      type="email"
                      value={currentEditStore.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold">Street Address</label>
                    <input
                      type="text"
                      value={currentEditStore.address}
                      onChange={(e) => handleFieldChange("address", e.target.value)}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold">City, State, Zip Code</label>
                    <input
                      type="text"
                      value={currentEditStore.cityStateZip}
                      onChange={(e) => handleFieldChange("cityStateZip", e.target.value)}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-gray-700 font-semibold">Operating Hours</label>
                    <input
                      type="text"
                      value={currentEditStore.businessHours}
                      onChange={(e) => handleFieldChange("businessHours", e.target.value)}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>
                </div>

                {/* 2. CALENDLY & GMB FOR THIS SPECIFIC STORE */}
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-teal-600" aria-hidden="true" />
                    <span>Calendly &amp; Google Business Profile (This Branch)</span>
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                        <span>Calendly Booking URL</span>
                      </span>
                      <span className="text-teal-600 text-[10px] font-semibold">(Direct to branch)</span>
                    </label>
                    <input
                      type="url"
                      value={currentEditStore.calendlyUrl}
                      onChange={(e) => handleFieldChange("calendlyUrl", e.target.value)}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-700 font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                        <span>Google Business Profile (GMB) URL</span>
                      </span>
                      <span className="text-teal-600 text-[10px] font-semibold">(Google Maps listing)</span>
                    </label>
                    <input
                      type="url"
                      value={currentEditStore.gmbUrl}
                      onChange={(e) => handleFieldChange("gmbUrl", e.target.value)}
                      className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-2xs transition-colors duration-150 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
