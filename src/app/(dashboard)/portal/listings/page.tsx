"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import {
  useListings,
  ListingStatus,
  SyncMode,
  DirectoryListing,
} from "@/lib/listingsContext";
import ListingsNav from "@/components/Dashboard/ListingsNav";
import {
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Plus,
  X,
  Search,
  Layers,
} from "lucide-react";

const STATUS_PILL: Record<
  ListingStatus,
  { className: string; label: string }
> = {
  Synced: {
    className: "bg-[#dcfae5] text-[#04250e]",
    label: "Synced",
  },
  Mismatch: {
    className: "bg-[#fffbeb] text-[#92400e] border border-[#fde68a]",
    label: "Mismatch",
  },
  Missing: {
    className: "bg-[#ffedea] text-[#831c1e]",
    label: "Missing",
  },
};

export default function ListingsPage() {
  const {
    stores,
    selectedStoreId,
    selectedStore,
    isAllStores,
  } = useStoreContext();
  const { directories, updateStoreEntry, auditAllNap } = useListings();
  const storeShortName = selectedStore.name.replace("SmartFoneDoctor - ", "");

  const [statusFilter, setStatusFilter] = useState<"All" | ListingStatus>("All");
  const [syncFilter, setSyncFilter] = useState<"All" | SyncMode>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [editingTarget, setEditingTarget] = useState<{
    dir: DirectoryListing;
    storeId: number;
  } | null>(null);
  const [editStatus, setEditStatus] = useState<ListingStatus>("Synced");
  const [editUrl, setEditUrl] = useState("");
  const [editIssue, setEditIssue] = useState("");

  // Metrics computed dynamically for either the active store or all 3 stores
  const metrics = useMemo(() => {
    const entries = isAllStores
      ? directories.flatMap((d) => stores.map((st) => d.stores[st.id]))
      : directories.map((d) => d.stores[selectedStoreId]);

    const total = entries.length;
    const synced = entries.filter((e) => e?.status === "Synced").length;
    const mismatch = entries.filter((e) => e?.status === "Mismatch").length;
    const missing = entries.filter((e) => e?.status === "Missing").length;
    const avgNap = total
      ? Math.round(
          entries.reduce((acc, e) => acc + (e?.napMatch ?? 0), 0) / total
        )
      : 0;
    const firstIssue = directories.find(
      (d) => d.stores[selectedStoreId]?.status === "Mismatch"
    );
    return { total, synced, mismatch, missing, avgNap, firstIssue };
  }, [directories, stores, isAllStores, selectedStoreId]);

  const visibleDirectories = useMemo(() => {
    return directories.filter((dir) => {
      if (
        searchQuery.trim() &&
        !dir.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !dir.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !dir.domain.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (syncFilter !== "All" && dir.syncMode !== syncFilter) {
        return false;
      }
      if (statusFilter !== "All") {
        if (!isAllStores) {
          return dir.stores[selectedStoreId]?.status === statusFilter;
        }
        return Object.values(dir.stores).some((s) => s.status === statusFilter);
      }
      return true;
    });
  }, [
    directories,
    searchQuery,
    syncFilter,
    statusFilter,
    isAllStores,
    selectedStoreId,
  ]);

  const copyText = (key: string, value: string) => {
    navigator.clipboard?.writeText(value);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const copyFullNap = () => {
    const block = `Business Name: Smart Fone Doctor\nAddress: ${selectedStore.address}, ${selectedStore.cityStateZip}\nPhone: ${selectedStore.phone}\nHours: ${selectedStore.businessHours}\nWebsite: https://smartfonedoctor.com`;
    copyText("all-nap", block);
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      auditAllNap(isAllStores ? undefined : selectedStoreId);
      setIsScanning(false);
    }, 650);
  };

  const openEditModal = (dir: DirectoryListing, storeId: number) => {
    const entry = dir.stores[storeId];
    setEditingTarget({ dir, storeId });
    setEditStatus(entry.status);
    setEditUrl(entry.url || dir.claimPortalUrl);
    setEditIssue(entry.issue || "");
  };

  const saveListingUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;
    const { dir, storeId } = editingTarget;
    const prev = dir.stores[storeId];
    const newNap =
      editStatus === "Synced" ? 100 : editStatus === "Mismatch" ? 78 : 0;

    updateStoreEntry(dir.id, storeId, {
      ...prev,
      status: editStatus,
      napMatch: newNap,
      url: editStatus === "Missing" ? "" : editUrl.trim(),
      lastSynced: "Today",
      issue: editStatus === "Synced" ? undefined : editIssue.trim() || undefined,
    });
    setEditingTarget(null);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-4 overflow-x-hidden">
      {/* 1. CANVAS TITLE ROW + UNDERLINE TABS */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#111111] tracking-[-0.02em] leading-tight">
              Directory listings
            </h1>
            <p className="text-[14px] text-[#5f6368] mt-1">
              {isAllStores ? (
                <>
                  {metrics.synced} of {metrics.total} store citations synced across{" "}
                  <span className="text-[#111111] font-medium">
                    all {stores.length} Philadelphia locations
                  </span>{" "}
                  · {metrics.mismatch} mismatches and {metrics.missing} unclaimed
                </>
              ) : (
                <>
                  {metrics.synced} of {metrics.total} directories synced for{" "}
                  <span className="text-[#111111] font-medium">{storeShortName}</span>
                  {metrics.firstIssue
                    ? ` · ${metrics.firstIssue.name}: ${metrics.firstIssue.stores[selectedStoreId]?.issue}`
                    : ` · ${metrics.missing} unclaimed citations`}
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRunScan}
              disabled={isScanning}
              className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#5f6368] ${
                  isScanning ? "animate-spin text-[#111111]" : ""
                }`}
                aria-hidden="true"
              />
              <span>{isScanning ? "Auditing…" : "Audit NAP"}</span>
            </button>

            <Link
              href="/portal/listings/catalog"
              className="h-[32px] px-3 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add directory</span>
            </Link>
          </div>
        </div>

        <ListingsNav />
      </div>

      {/* 2. DIVIDED KPI STRIP (1 container split by 1px hairlines, no duplicate filter underline) */}
      <div
        role="region"
        aria-label="Citation summary metrics"
        className="bg-white border border-[#e8e8e8] rounded-[8px] grid grid-cols-2 lg:grid-cols-4"
      >
        <div className="p-4 flex flex-col justify-between border-b lg:border-b-0 border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">
            NAP accuracy ({isAllStores ? "all 3 stores" : storeShortName})
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[28px] font-semibold text-[#111111] tabular-nums leading-none">
              {metrics.avgNap}%
            </span>
            <span className="text-[12px] text-[#5f6368] tabular-nums">
              {directories.length} directories
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">Synced listings</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {metrics.synced}
            </span>
            <span className="text-[12px] text-[#247b50] tabular-nums">
              /{metrics.total} verified
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">NAP mismatches</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {metrics.mismatch}
            </span>
            <span
              className={`text-[12px] ${
                metrics.mismatch > 0 ? "text-[#92400e]" : "text-[#5f6368]"
              }`}
            >
              {metrics.mismatch > 0 ? "hours or address drift" : "0 issues"}
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">Unclaimed listings</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {metrics.missing}
            </span>
            <span
              className={`text-[12px] ${
                metrics.missing > 0 ? "text-[#c4242a]" : "text-[#5f6368]"
              }`}
            >
              {metrics.missing > 0 ? "unclaimed" : "all claimed"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CANONICAL STORE NAP RECORD (Shown when a single store is active — no duplicate store pills) */}
      {!isAllStores && (
        <section
          aria-label="Canonical store NAP record"
          className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
        >
          <div className="px-4 py-2.5 border-b border-[#f2f2f2] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="font-medium text-[#111111]">
                Canonical store record
              </span>
              <span className="text-[#5f6368]">· {storeShortName}</span>
            </div>

            <button
              type="button"
              onClick={copyFullNap}
              className="h-[26px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] text-[#111111] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedField === "all-nap" ? (
                <>
                  <Check className="w-3 h-3 text-[#247b50]" aria-hidden="true" />
                  <span className="text-[#247b50]">Copied NAP block</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#6b6b6b]" aria-hidden="true" />
                  <span>Copy full NAP</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#f2f2f2] text-[13px]">
            <div className="px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[12px] text-[#5f6368]">Business name</div>
                <div className="text-[#111111] font-medium truncate mt-0.5">
                  Smart Fone Doctor
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyText("name", "Smart Fone Doctor")}
                aria-label="Copy business name"
                className="p-1 text-[#6b6b6b] hover:text-[#111111] cursor-pointer shrink-0"
              >
                {copiedField === "name" ? (
                  <Check className="w-3.5 h-3.5 text-[#247b50]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[12px] text-[#5f6368]">Street address</div>
                <div
                  className="text-[#111111] font-medium truncate mt-0.5"
                  title={`${selectedStore.address}, ${selectedStore.cityStateZip}`}
                >
                  {selectedStore.address}, {selectedStore.cityStateZip}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyText(
                    "address",
                    `${selectedStore.address}, ${selectedStore.cityStateZip}`
                  )
                }
                aria-label="Copy street address"
                className="p-1 text-[#6b6b6b] hover:text-[#111111] cursor-pointer shrink-0"
              >
                {copiedField === "address" ? (
                  <Check className="w-3.5 h-3.5 text-[#247b50]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[12px] text-[#5f6368]">Phone</div>
                <div className="text-[#111111] font-medium tabular-nums truncate mt-0.5">
                  {selectedStore.phone}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyText("phone", selectedStore.phone)}
                aria-label="Copy phone number"
                className="p-1 text-[#6b6b6b] hover:text-[#111111] cursor-pointer shrink-0"
              >
                {copiedField === "phone" ? (
                  <Check className="w-3.5 h-3.5 text-[#247b50]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[12px] text-[#5f6368]">Hours</div>
                <div
                  className="text-[#111111] font-medium truncate mt-0.5"
                  title={selectedStore.businessHours}
                >
                  {selectedStore.businessHours}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyText("hours", selectedStore.businessHours)}
                aria-label="Copy store hours"
                className="p-1 text-[#6b6b6b] hover:text-[#111111] cursor-pointer shrink-0"
              >
                {copiedField === "hours" ? (
                  <Check className="w-3.5 h-3.5 text-[#247b50]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. DIRECTORY LISTINGS TABLE / MATRIX */}
      <section
        aria-label="Mainstream directory listings"
        className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
      >
        {/* Filter bar */}
        <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["All", "Synced", "Mismatch", "Missing"] as const).map((st) => {
              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`h-[28px] px-2.5 rounded-[5px] text-[13px] transition-colors cursor-pointer ${
                    active
                      ? "bg-[#eeeeee] text-[#111111] font-medium"
                      : "text-[#5f6368] hover:text-[#111111]"
                  }`}
                >
                  {st}
                </button>
              );
            })}
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
                placeholder="Filter directories…"
                aria-label="Filter directories"
                className="h-[32px] w-48 sm:w-56 pl-8 pr-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] text-[#111111] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#111111]"
              />
            </div>

            <select
              aria-label="Filter by sync method"
              value={syncFilter}
              onChange={(e) => setSyncFilter(e.target.value as "All" | SyncMode)}
              className="h-[32px] px-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
            >
              <option value="All">All sync methods</option>
              <option value="Official API">Official API</option>
              <option value="Google Auto-Sync">Google auto-sync</option>
              <option value="DataForSEO Audit">DataForSEO audit</option>
              <option value="Manual Claim">Manual claim</option>
            </select>
          </div>
        </div>

        {!isAllStores ? (
          <>
            {/* Mobile & Tablet Rows (< lg) */}
            <div className="lg:hidden divide-y divide-[#f2f2f2]">
              {visibleDirectories.map((dir) => {
                const entry = dir.stores[selectedStoreId];
                const pill = STATUS_PILL[entry.status];
                return (
                  <div key={dir.id} className="px-4 py-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-medium text-[#111111] truncate">
                        {dir.name}
                      </span>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`h-[20px] px-2 rounded-[4px] inline-flex items-center text-[12px] font-medium ${pill.className}`}
                        >
                          {pill.label}
                        </span>
                        <span className="text-[13px] text-[#111111] tabular-nums w-9 text-right">
                          {entry.napMatch}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[12px] text-[#5f6368]">
                      <span className="truncate">
                        {dir.category} · {dir.syncMode} · DA {dir.authority}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {entry.url && (
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[12px] text-[#5f6368] hover:text-[#111111] inline-flex items-center gap-0.5"
                          >
                            <span>Live</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(dir, selectedStoreId)}
                          className="h-[26px] px-2 rounded-[4px] border border-[#d1d5db] bg-white text-[12px] font-medium text-[#111111] cursor-pointer"
                        >
                          {entry.status === "Missing"
                            ? "Claim"
                            : entry.status === "Mismatch"
                            ? "Fix NAP"
                            : "Manage"}
                        </button>
                      </div>
                    </div>

                    {entry.issue && (
                      <p className="text-[12px] text-[#92400e] mt-0.5">
                        {entry.issue}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (lg+): 5 balanced columns that always fit inside viewport */}
            <div className="hidden lg:block w-full">
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="h-[38px] border-b border-[#e5e7eb] text-[12px] font-normal text-[#5f6368]">
                    <th className="px-4 font-normal w-[28%]">Directory</th>
                    <th className="px-4 font-normal w-[20%]">Status &amp; sync</th>
                    <th className="px-4 font-normal w-[26%]">Discrepancy / audit note</th>
                    <th className="px-4 font-normal text-right w-[10%]">NAP &amp; rating</th>
                    <th className="px-4 font-normal text-right w-[16%]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f2f2] text-[14px]">
                  {visibleDirectories.map((dir) => {
                    const entry = dir.stores[selectedStoreId];
                    const pill = STATUS_PILL[entry.status];
                    return (
                      <tr
                        key={dir.id}
                        className="h-[58px] hover:bg-[#f9f9f9] transition-colors"
                      >
                        <td className="px-4 py-2 min-w-0">
                          <div className="font-medium text-[#111111] truncate">
                            {dir.name}
                          </div>
                          <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                            {dir.domain} · {dir.category} · DA {dir.authority}
                          </div>
                        </td>
                        <td className="px-4 py-2 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-[20px] px-2 rounded-[4px] inline-flex items-center text-[12px] font-medium whitespace-nowrap ${pill.className}`}
                            >
                              {pill.label}
                            </span>
                          </div>
                          <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                            {dir.syncMode}
                            {entry.lastSynced ? ` · ${entry.lastSynced}` : ""}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-[13px] min-w-0">
                          {entry.issue ? (
                            <span
                              className="text-[#92400e] line-clamp-2"
                              title={entry.issue}
                            >
                              {entry.issue}
                            </span>
                          ) : (
                            <span className="text-[#6b6b6b]">
                              Matches store record
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          <div className="font-medium text-[#111111]">
                            {entry.napMatch}%
                          </div>
                          <div className="text-[12px] text-[#5f6368]">
                            {entry.rating ? `${entry.rating.toFixed(1)} /5` : "—"}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-2.5">
                            {entry.url && (
                              <a
                                href={entry.url}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Open ${dir.name}`}
                                className="text-[13px] text-[#5f6368] hover:text-[#111111] inline-flex items-center gap-1"
                              >
                                <span>Live</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditModal(dir, selectedStoreId)}
                              className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] font-medium text-[#111111] transition-colors cursor-pointer"
                            >
                              {entry.status === "Missing"
                                ? "Claim"
                                : entry.status === "Mismatch"
                                ? "Fix NAP"
                                : "Manage"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* 3-Store Matrix View (Responsive cards on <lg, 4-col table-fixed on lg+) */
          <>
            <div className="lg:hidden divide-y divide-[#f2f2f2]">
              {visibleDirectories.map((dir) => (
                <div key={dir.id} className="p-4 flex flex-col gap-2.5">
                  <div>
                    <div className="text-[14px] font-medium text-[#111111]">
                      {dir.name}
                    </div>
                    <div className="text-[12px] text-[#5f6368]">
                      {dir.syncMode} · DA {dir.authority}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {stores.map((st) => {
                      const entry = dir.stores[st.id];
                      const pill = STATUS_PILL[entry.status];
                      return (
                        <div
                          key={st.id}
                          className="p-2.5 rounded-[6px] bg-[#f9f9f9] border border-[#e8e8e8] flex flex-col gap-1"
                        >
                          <span className="text-[12px] font-medium text-[#111111] truncate">
                            {st.name.replace("SmartFoneDoctor - ", "")}
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`h-[20px] px-2 rounded-[4px] inline-flex items-center text-[11px] font-medium ${pill.className}`}
                            >
                              {pill.label}
                            </span>
                            <span className="text-[12px] text-[#111111] tabular-nums">
                              {entry.napMatch}%
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEditModal(dir, st.id)}
                            className="text-left text-[12px] font-medium text-[#111111] hover:underline cursor-pointer mt-0.5"
                          >
                            {entry.status === "Missing"
                              ? "Claim →"
                              : entry.status === "Mismatch"
                              ? "Fix →"
                              : "Edit"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block w-full">
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="h-[42px] border-b border-[#e5e7eb] text-[12px] font-normal text-[#5f6368]">
                    <th className="px-4 font-normal w-[25%]">Directory</th>
                    {stores.map((st) => (
                      <th key={st.id} className="px-4 font-normal w-[25%]">
                        <span className="text-[#111111] font-medium truncate block">
                          {st.name.replace("SmartFoneDoctor - ", "")}
                        </span>
                        <span className="block text-[11px] text-[#6b6b6b] font-normal truncate">
                          {st.address}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f2f2] text-[13px]">
                  {visibleDirectories.map((dir) => (
                    <tr
                      key={dir.id}
                      className="hover:bg-[#f9f9f9] transition-colors"
                    >
                      <td className="px-4 py-3 align-top min-w-0">
                        <div className="font-medium text-[#111111] text-[14px] truncate">
                          {dir.name}
                        </div>
                        <div className="text-[12px] text-[#5f6368] mt-0.5 truncate">
                          {dir.syncMode} · DA {dir.authority}
                        </div>
                      </td>

                      {stores.map((st) => {
                        const entry = dir.stores[st.id];
                        const pill = STATUS_PILL[entry.status];
                        return (
                          <td key={st.id} className="px-4 py-3 align-top min-w-0">
                            <div className="flex flex-col items-start gap-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-[20px] px-2 rounded-[4px] inline-flex items-center text-[12px] font-medium ${pill.className}`}
                                >
                                  {pill.label}
                                </span>
                                <span className="text-[13px] text-[#111111] tabular-nums">
                                  {entry.napMatch}%
                                </span>
                              </div>

                              {entry.issue && (
                                <p className="text-[12px] text-[#92400e] leading-snug line-clamp-2">
                                  {entry.issue}
                                </p>
                              )}

                              <button
                                type="button"
                                onClick={() => openEditModal(dir, st.id)}
                                className="text-[12px] font-medium text-[#111111] hover:underline cursor-pointer mt-0.5"
                              >
                                {entry.status === "Missing"
                                  ? "Claim listing →"
                                  : entry.status === "Mismatch"
                                  ? "Fix mismatch →"
                                  : "Edit"}
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* MODAL: MANAGE / FIX / CLAIM LISTING */}
      {editingTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-listing-title"
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f2f2f2] flex items-center justify-between">
              <div>
                <h2
                  id="edit-listing-title"
                  className="text-[16px] font-semibold text-[#111111]"
                >
                  {editingTarget.dir.name}
                </h2>
                <p className="text-[12px] text-[#5f6368] mt-0.5">
                  {stores
                    .find((s) => s.id === editingTarget.storeId)
                    ?.name.replace("SmartFoneDoctor - ", "")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTarget(null)}
                aria-label="Close dialog"
                className="p-1 rounded-[5px] text-[#6b6b6b] hover:text-[#111111] hover:bg-[#f2f2f2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={saveListingUpdate}
              className="p-5 flex flex-col gap-4 text-[14px]"
            >
              <div className="p-3 rounded-[6px] bg-[#f9f9f9] border border-[#e8e8e8] flex flex-col gap-1 text-[13px]">
                <span className="text-[12px] text-[#5f6368]">
                  Canonical store NAP to match
                </span>
                <p className="font-medium text-[#111111]">Smart Fone Doctor</p>
                <p className="text-[#5f6368]">
                  {stores.find((s) => s.id === editingTarget.storeId)?.address},{" "}
                  {
                    stores.find((s) => s.id === editingTarget.storeId)
                      ?.cityStateZip
                  }
                </p>
                <p className="text-[#5f6368] tabular-nums">
                  {stores.find((s) => s.id === editingTarget.storeId)?.phone} ·{" "}
                  {
                    stores.find((s) => s.id === editingTarget.storeId)
                      ?.businessHours
                  }
                </p>
                <a
                  href={editingTarget.dir.claimPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[13px] text-[#111111] font-medium hover:underline"
                >
                  <span>Open {editingTarget.dir.name} portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#111111] mb-2">
                  Verification status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as ListingStatus)
                  }
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[14px] text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="Synced">Synced (100% NAP match)</option>
                  <option value="Mismatch">Mismatch (needs update)</option>
                  <option value="Missing">Missing / unclaimed</option>
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#111111] mb-2">
                  Public listing URL
                </label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] bg-white text-[14px] text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              {editStatus !== "Synced" && (
                <div>
                  <label className="block text-[14px] font-medium text-[#111111] mb-2">
                    Discrepancy note
                  </label>
                  <input
                    type="text"
                    value={editIssue}
                    onChange={(e) => setEditIssue(e.target.value)}
                    placeholder="e.g., Saturday closing time shows 6:00 PM"
                    className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] bg-white text-[14px] text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f2f2f2]">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-medium text-[#111111] hover:bg-[#f9f9f9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[32px] px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium cursor-pointer"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
