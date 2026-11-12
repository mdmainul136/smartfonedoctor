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
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-4 overflow-x-hidden">
      {/* 1. CANVAS TITLE ROW + UNDERLINE TABS */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#111111] tracking-[-0.02em] leading-tight">
              Missing citations &amp; directory catalog
            </h1>
            <p className="text-[14px] text-[#5f6368] mt-1">
              {missingInActiveList.length} unclaimed listings for{" "}
              <span className="text-[#111111] font-medium">{storeShortName}</span>{" "}
              · {CATALOG_DIRECTORIES.length} mainstream US directories available to add
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={copyStoreNap}
              className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedNap ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#247b50]" />
                  <span className="text-[#247b50]">Copied NAP</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#6b6b6b]" />
                  <span>Copy {storeShortName} NAP</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              className="h-[32px] px-3 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Custom directory</span>
            </button>
          </div>
        </div>

        <ListingsNav />
      </div>

      {/* 2. UNCLAIMED CITATIONS QUEUE FOR SELECTED STORE (Scoped via top-bar location switcher) */}
      <section
        aria-label="Unclaimed citations queue"
        className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-[#111111]">
              Unclaimed listings in active list ({missingInActiveList.length})
            </h2>
            <span className="text-[13px] text-[#5f6368]">· {storeShortName}</span>
          </div>
          <span className="text-[12px] text-[#5f6368]">
            Opening a portal copies the canonical store NAP to your clipboard
          </span>
        </div>

        {missingInActiveList.length === 0 ? (
          <div className="px-4 py-6 text-[13px] text-[#5f6368]">
            All tracked directories are claimed for {storeShortName}. Add more mainstream citations from the catalog below.
          </div>
        ) : (
          <div className="divide-y divide-[#f2f2f2]">
            {missingInActiveList.map((dir) => {
              const entry = dir.stores[selectedStoreId];
              return (
                <div
                  key={dir.id}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f9f9f9] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-[#111111]">
                        {dir.name}
                      </span>
                      <span className="text-[12px] text-[#5f6368]">
                        {dir.domain} · {dir.syncMode}
                      </span>
                    </div>
                    {entry.issue && (
                      <p className="text-[13px] text-[#831c1e] mt-0.5">
                        {entry.issue}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[12px] text-[#5f6368] tabular-nums">
                      DA {dir.authority}
                    </span>
                    <a
                      href={dir.claimPortalUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={copyStoreNap}
                      className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] text-[#111111] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Open portal</span>
                      <ExternalLink className="w-3 h-3 text-[#6b6b6b]" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickClaimActive(dir.id, dir.claimPortalUrl)
                      }
                      className="h-[28px] px-2.5 rounded-[5px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
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

      {/* 3. MAINSTREAM DIRECTORY CATALOG TABLE */}
      <section
        aria-label="Mainstream US directory catalog"
        className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-[#111111]">
              Mainstream directory catalog ({filteredCatalog.length})
            </h2>
            <p className="text-[12px] text-[#5f6368]">
              Add high-authority national and Philadelphia citations across all 3 stores
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 text-[#6b6b6b] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search BBB, Foursquare, Angi…"
                aria-label="Search catalog"
                className="h-[32px] w-48 sm:w-56 pl-8 pr-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] text-[#111111] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#111111]"
              />
            </div>

            <select
              aria-label="Filter by authority tier"
              value={tierFilter}
              onChange={(e) =>
                setTierFilter(e.target.value as "All" | DirectoryTier)
              }
              className="h-[32px] px-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
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
        <div className="lg:hidden divide-y divide-[#f2f2f2]">
          {filteredCatalog.map((item) => {
            const alreadyAdded = directories.some((d) => d.id === item.id);
            return (
              <div key={item.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-[#111111] truncate">
                      {item.name}
                    </div>
                    <div className="text-[12px] text-[#5f6368] truncate">
                      {item.domain} · {item.category} · {item.syncMode} · DA {item.authority}
                    </div>
                  </div>
                </div>
                <p className="text-[12px] text-[#5f6368]">{item.description}</p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  {alreadyAdded ? (
                    <span className="h-[22px] px-2 rounded-[4px] bg-[#dcfae5] text-[#04250e] text-[12px] font-medium inline-flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>In active list</span>
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAddCatalogItem(item, false)}
                        className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white text-[13px] font-medium text-[#111111] cursor-pointer"
                      >
                        + Add to queue
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddCatalogItem(item, true)}
                        className="h-[28px] px-2.5 rounded-[5px] bg-[#1d1f20] text-white text-[13px] font-medium cursor-pointer"
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

        {/* Desktop Table (lg+): 4 balanced columns — never clips right-most Action buttons */}
        <div className="hidden lg:block w-full">
          <table className="w-full table-fixed text-left border-collapse">
            <thead>
              <tr className="h-[38px] border-b border-[#e5e7eb] text-[12px] font-normal text-[#5f6368]">
                <th className="px-4 font-normal w-[28%]">Directory &amp; category</th>
                <th className="px-4 font-normal w-[18%]">Sync &amp; authority</th>
                <th className="px-4 font-normal w-[32%]">Role in local SEO</th>
                <th className="px-4 font-normal text-right w-[22%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f2] text-[14px]">
              {filteredCatalog.map((item) => {
                const alreadyAdded = directories.some((d) => d.id === item.id);
                return (
                  <tr
                    key={item.id}
                    className="h-[58px] hover:bg-[#f9f9f9] transition-colors"
                  >
                    <td className="px-4 py-2.5 min-w-0">
                      <div className="font-medium text-[#111111] truncate">
                        {item.name}
                      </div>
                      <div className="text-[12px] text-[#5f6368] truncate">
                        {item.domain} · {item.category}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 min-w-0">
                      <div className="text-[13px] text-[#111111] truncate">
                        {item.syncMode}
                      </div>
                      <div className="text-[12px] text-[#5f6368] tabular-nums">
                        DA {item.authority}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-[#5f6368] min-w-0">
                      <span className="line-clamp-2" title={item.description}>
                        {item.description}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      {alreadyAdded ? (
                        <span className="h-[22px] px-2 rounded-[4px] bg-[#dcfae5] text-[#04250e] text-[12px] font-medium inline-flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>In active list</span>
                        </span>
                      ) : (
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddCatalogItem(item, false)}
                            className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] font-medium text-[#111111] transition-colors cursor-pointer"
                          >
                            + Add to queue
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddCatalogItem(item, true)}
                            className="h-[28px] px-2.5 rounded-[5px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium transition-colors cursor-pointer"
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

      {/* MODAL: ADD CUSTOM DIRECTORY */}
      {showCustomModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-dir-title"
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f2f2f2] flex items-center justify-between">
              <div>
                <h2
                  id="custom-dir-title"
                  className="text-[16px] font-semibold text-[#111111]"
                >
                  Add custom directory
                </h2>
                <p className="text-[12px] text-[#5f6368] mt-0.5">
                  Adds citation tracking across all 3 Philadelphia locations
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                aria-label="Close dialog"
                className="p-1 rounded-[5px] text-[#6b6b6b] hover:text-[#111111] hover:bg-[#f2f2f2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleAddCustomSubmit}
              className="p-5 flex flex-col gap-4 text-[14px]"
            >
              <div>
                <label className="block text-[14px] font-medium text-[#111111] mb-2">
                  Directory name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., RepairPal, Philly Inquirer Directory"
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] bg-white text-[14px] text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[14px] font-medium text-[#111111] mb-2">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="repairpal.com"
                    className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] bg-white text-[14px] text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#111111] mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Local citation"
                    className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] bg-white text-[14px] text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#111111] mb-2">
                  Sync method
                </label>
                <select
                  value={customSyncMode}
                  onChange={(e) =>
                    setCustomSyncMode(e.target.value as SyncMode)
                  }
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[14px] text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="Manual Claim">Manual claim</option>
                  <option value="DataForSEO Audit">DataForSEO audit</option>
                  <option value="Official API">Official API</option>
                  <option value="Google Auto-Sync">Google auto-sync</option>
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#111111] mb-2">
                  Claim portal URL
                </label>
                <input
                  type="url"
                  value={customPortalUrl}
                  onChange={(e) => setCustomPortalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] bg-white text-[14px] text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f2f2f2]">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-medium text-[#111111] hover:bg-[#f9f9f9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[32px] px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium cursor-pointer"
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
