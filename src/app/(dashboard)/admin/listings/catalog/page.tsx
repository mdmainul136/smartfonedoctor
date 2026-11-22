"use client";

import { useState, useMemo } from "react";
import { useStoreContext } from "@/lib/storeContext";
import {
  useListings,
  CATALOG_DIRECTORIES,
  CatalogDirectoryItem,
  DirectoryTier,
  SyncMode,
} from "@/lib/listingsContext";
import ListingsNav from "@/components/Dashboard/ListingsNav";
import {
  Plus,
  Check,
  ExternalLink,
  Copy,
  Search,
  X,
  Layers,
  Globe,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function ListingsCatalogPage() {
  const { stores, selectedStoreId, setSelectedStoreId, selectedStore } =
    useStoreContext();
  const {
    directories,
    updateStoreEntry,
    addFromCatalog,
    addCustomDirectory,
  } = useListings();

  const storeShortName = selectedStore.name.replace("SmartFoneDoctor - ", "");

  const [tierFilter, setTierFilter] = useState<"All" | DirectoryTier>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedNap, setCopiedNap] = useState(false);

  // Custom directory modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [customCategory, setCustomCategory] = useState("Citation directory");
  const [customSyncMode, setCustomSyncMode] = useState<SyncMode>("Manual Claim");
  const [customPortalUrl, setCustomPortalUrl] = useState("");

  const missingInActiveList = useMemo(() => {
    return directories.filter(
      (d) => d.stores[selectedStoreId]?.status === "Missing"
    );
  }, [directories, selectedStoreId]);

  const filteredCatalog = useMemo(() => {
    return CATALOG_DIRECTORIES.filter((item) => {
      if (tierFilter !== "All" && item.tier !== tierFilter) return false;
      if (
        searchQuery.trim() &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.domain.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [tierFilter, searchQuery]);

  const copyStoreNap = () => {
    const block = `Business Name: Smart Fone Doctor\nAddress: ${selectedStore.address}, ${selectedStore.cityStateZip}\nPhone: ${selectedStore.phone}\nHours: ${selectedStore.businessHours}\nWebsite: https://smartfonedoctor.com`;
    navigator.clipboard?.writeText(block);
    setCopiedNap(true);
    setTimeout(() => setCopiedNap(false), 1800);
  };

  const handleAddCatalogItem = (
    item: CatalogDirectoryItem,
    markSynced: boolean
  ) => {
    addFromCatalog(item, [1, 2, 3], markSynced ? "Synced" : "Missing");
  };

  const handleQuickClaimActive = (dirId: string, portalUrl: string) => {
    copyStoreNap();
    updateStoreEntry(dirId, selectedStoreId, {
      status: "Synced",
      napMatch: 100,
      rating: null,
      url: portalUrl,
      lastSynced: "Today",
      issue: undefined,
    });
  };

  const handleAddCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const cleanDomain =
      customDomain.trim() ||
      customName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
    const portal = customPortalUrl.trim() || `https://${cleanDomain}`;

    addCustomDirectory({
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      domain: cleanDomain,
      category: customCategory.trim() || "Local directory",
      tier: "Tier 2 (Major Citations)",
      authority: 75,
      syncMode: customSyncMode,
      claimPortalUrl: portal,
      stores: {
        1: {
          status: "Missing",
          napMatch: 0,
          rating: null,
          url: "",
          lastSynced: "Today",
          issue: "Added manually — ready to submit NAP",
        },
        2: {
          status: "Missing",
          napMatch: 0,
          rating: null,
          url: "",
          lastSynced: "Today",
          issue: "Added manually — ready to submit NAP",
        },
        3: {
          status: "Missing",
          napMatch: 0,
          rating: null,
          url: "",
          lastSynced: "Today",
          issue: "Added manually — ready to submit NAP",
        },
      },
    });

    setCustomName("");
    setCustomDomain("");
    setCustomPortalUrl("");
    setShowCustomModal(false);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-6 flex flex-col gap-6 overflow-x-hidden antialiased">
      {/* 1. MATERIAL 3 HERO HEADER (Brand Teal & Elevated Surface) */}
      <div className="rounded-3xl bg-white p-5 sm:p-7 border border-teal-100/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#009691] text-white flex items-center justify-center shadow-md shadow-[#009691]/25 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                Directory catalog
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-100/80 text-[#009691] text-[11px] font-semibold px-2.5 py-0.5">
                {storeShortName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              {missingInActiveList.length} unclaimed listings · {CATALOG_DIRECTORIES.length} mainstream US directories feeding local AI visibility
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={copyStoreNap}
            className="h-9 px-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedNap ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#009691]" />
                <span className="text-[#009691]">Copied Store NAP</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy {storeShortName} NAP</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="h-9 px-4 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm shadow-[#009691]/25 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Custom directory</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Links */}
      <ListingsNav />

      {/* Material 3 Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Unclaimed for Location</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
              {missingInActiveList.length}
            </span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              in active queue
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Active Claimed Citations</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
              {directories.length}
            </span>
            <span className="text-xs font-semibold text-[#009691] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
              live &amp; verified
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Mainstream Directory Catalog</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
              {CATALOG_DIRECTORIES.length}
            </span>
            <span className="text-xs font-semibold text-[#009691] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
              high-DA sources
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Core Authority Score</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-[#009691] leading-none">
              DA 100
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              Tier 1 Maps
            </span>
          </div>
        </div>
      </div>

      {/* 2. UNCLAIMED CITATIONS QUEUE FOR SELECTED STORE (Material 3 Layered Surface) */}
      <section
        aria-label="Unclaimed citations queue"
        className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
      >
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Unclaimed listings in active list ({missingInActiveList.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">· {storeShortName}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Opening a portal automatically copies the canonical store NAP to your clipboard
          </span>
        </div>

        {missingInActiveList.length === 0 ? (
          <div className="px-5 py-8 text-center text-xs sm:text-sm text-slate-500 font-medium bg-slate-50/30">
            All tracked directories are claimed for {storeShortName}. Add more mainstream citations from the catalog below to boost AI visibility.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {missingInActiveList.map((dir) => {
              const entry = dir.stores[selectedStoreId];
              return (
                <div
                  key={dir.id}
                  className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {dir.name}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {dir.domain} · {dir.syncMode}
                      </span>
                    </div>
                    {entry.issue && (
                      <p className="text-xs font-medium text-rose-700 mt-0.5">
                        {entry.issue}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold tabular-nums">
                      DA {dir.authority}
                    </span>
                    <a
                      href={dir.claimPortalUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={copyStoreNap}
                      className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#009691] inline-flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <span>Open portal</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickClaimActive(dir.id, dir.claimPortalUrl)
                      }
                      className="h-8 px-3.5 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold inline-flex items-center gap-1 shadow-xs shadow-[#009691]/20 transition-all cursor-pointer"
                    >
                      <span>Mark claimed</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. MAINSTREAM DIRECTORY CATALOG TABLE (Material 3 Surface & Brand Accents) */}
      <section
        aria-label="Mainstream US directory catalog"
        className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Mainstream Directory Catalog ({filteredCatalog.length})
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Directories where the business is not listed yet
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search BBB, Foursquare, Angi…"
                aria-label="Search catalog"
                className="h-9 w-48 sm:w-56 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691] shadow-2xs"
              />
            </div>

            <select
              aria-label="Filter by authority tier"
              value={tierFilter}
              onChange={(e) =>
                setTierFilter(e.target.value as "All" | DirectoryTier)
              }
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691] shadow-2xs"
            >
              <option value="All">All tiers</option>
              <option value="Tier 1 (Core Maps & Reviews)">
                Tier 1 · Core maps &amp; reviews
              </option>
              <option value="Tier 2 (Major Citations)">
                Tier 2 · Major citations
              </option>
              <option value="Tier 3 (Local & Niche)">
                Tier 3 · Local &amp; niche
              </option>
            </select>
          </div>
        </div>

        {/* Mobile & Tablet Rows (< lg) */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredCatalog.map((item) => {
            const alreadyAdded = directories.some((d) => d.id === item.id);
            return (
              <div key={item.id} className="p-4 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {item.domain} · {item.category} · {item.syncMode} · DA {item.authority}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  {alreadyAdded ? (
                    <span className="h-7 px-3 rounded-full bg-teal-50 text-[#009691] border border-teal-200/60 text-xs font-semibold inline-flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>In active list</span>
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAddCatalogItem(item, false)}
                        className="h-8 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-[#009691] cursor-pointer shadow-xs transition-colors"
                      >
                        + Add to queue
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddCatalogItem(item, true)}
                        className="h-8 px-3.5 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold shadow-xs shadow-[#009691]/20 cursor-pointer transition-all"
                      >
                        Add &amp; sync
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table (lg+): 4 balanced columns */}
        <div className="hidden lg:block w-full">
          <table className="w-full table-fixed text-left border-collapse">
            <thead>
              <tr className="h-10 border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-600">
                <th className="px-5 font-semibold w-[28%]">Directory &amp; category</th>
                <th className="px-4 font-semibold w-[18%]">Sync &amp; authority</th>
                <th className="px-4 font-semibold w-[32%]">Role in AI Visibility</th>
                <th className="px-5 font-semibold text-right w-[22%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px]">
              {filteredCatalog.map((item) => {
                const alreadyAdded = directories.some((d) => d.id === item.id);
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-3.5 min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {item.domain} · {item.category}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {item.syncMode}
                      </div>
                      <div className="text-xs text-slate-500 tabular-nums font-mono mt-0.5">
                        DA {item.authority}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 min-w-0 font-medium">
                      <span className="line-clamp-2" title={item.description}>
                        {item.description}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {alreadyAdded ? (
                        <span className="h-7 px-3 rounded-full bg-teal-50 text-[#009691] border border-teal-200/60 text-xs font-semibold inline-flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>In active list</span>
                        </span>
                      ) : (
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddCatalogItem(item, false)}
                            className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#009691] transition-colors cursor-pointer shadow-xs"
                          >
                            + Add to queue
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddCatalogItem(item, true)}
                            className="h-8 px-3.5 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold shadow-xs shadow-[#009691]/20 transition-all cursor-pointer"
                          >
                            Add &amp; sync
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL: ADD CUSTOM DIRECTORY (Material 3 Dialog) */}
      {showCustomModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-dir-title"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2
                  id="custom-dir-title"
                  className="text-base font-bold text-slate-900"
                >
                  Add Custom Directory
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Adds citation tracking across all 3 Philadelphia locations
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                aria-label="Close dialog"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleAddCustomSubmit}
              className="p-6 flex flex-col gap-4 text-xs sm:text-[13px]"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Directory name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., RepairPal, Philly Inquirer Directory"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="repairpal.com"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Local citation"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sync method
                </label>
                <select
                  value={customSyncMode}
                  onChange={(e) =>
                    setCustomSyncMode(e.target.value as SyncMode)
                  }
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                >
                  <option value="Manual Claim">Manual claim</option>
                  <option value="DataForSEO Audit">DataForSEO audit</option>
                  <option value="Official API">Official API</option>
                  <option value="Google Auto-Sync">Google auto-sync</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Claim portal URL
                </label>
                <input
                  type="url"
                  value={customPortalUrl}
                  onChange={(e) => setCustomPortalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold cursor-pointer shadow-xs shadow-[#009691]/20 transition-all"
                >
                  Add directory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
