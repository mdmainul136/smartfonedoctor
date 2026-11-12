"use client";

import { useState } from "react";
import { useStoreContext } from "@/lib/storeContext";
import { useListings, ApiConnector } from "@/lib/listingsContext";
import ListingsNav from "@/components/Dashboard/ListingsNav";
import { RefreshCw, X, Check } from "lucide-react";

export default function ListingsApiSyncPage() {
  const { stores } = useStoreContext();
  const { connectors, pullFromApi, toggleConnector } = useListings();

  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [lastSyncedBanner, setLastSyncedBanner] = useState<string | null>(null);

  const [activeConnector, setActiveConnector] = useState<ApiConnector | null>(
    null
  );
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [accountLabelInput, setAccountLabelInput] = useState("");

  const connectedCount = connectors.filter((c) => c.connected).length;

  const handlePullSingle = (conn: ApiConnector) => {
    setSyncingId(conn.id);
    setTimeout(() => {
      pullFromApi(conn.id);
      setSyncingId(null);
      setLastSyncedBanner(
        `Synced ${conn.name} across all 3 Philadelphia locations.`
      );
    }, 600);
  };

  const handlePullAll = () => {
    setSyncingAll(true);
    setTimeout(() => {
      connectors
        .filter((c) => c.connected)
        .forEach((c) => pullFromApi(c.id));
      setSyncingAll(false);
      setLastSyncedBanner(
        "All connected APIs pulled and updated active directory listings."
      );
    }, 800);
  };

  const openConfigModal = (conn: ApiConnector) => {
    setActiveConnector(conn);
    setAccountLabelInput(conn.accountLabel);
    setApiKeyInput("••••••••••••••••••••••••••••••••");
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConnector) return;
    if (!activeConnector.connected) {
      toggleConnector(
        activeConnector.id,
        accountLabelInput.trim() || "Connected via API token"
      );
    }
    pullFromApi(activeConnector.id);
    setLastSyncedBanner(
      `${activeConnector.name} credentials saved and all 3 Philadelphia store locations synced.`
    );
    setActiveConnector(null);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-4 overflow-x-hidden">
      {/* 1. CANVAS TITLE ROW + UNDERLINE TABS */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#111111] tracking-[-0.02em] leading-tight">
              API &amp; automated citation sync
            </h1>
            <p className="text-[14px] text-[#5f6368] mt-1">
              {connectedCount} of {connectors.length} providers connected · Apple Business Connect requires OAuth setup for 2 Lancaster Ave branches
            </p>
          </div>

          <button
            type="button"
            onClick={handlePullAll}
            disabled={syncingAll}
            className="h-[32px] self-start sm:self-auto shrink-0 px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${syncingAll ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>{syncingAll ? "Pulling APIs…" : "Pull all APIs"}</span>
          </button>
        </div>

        <ListingsNav />
      </div>

      {lastSyncedBanner && (
        <div className="bg-[#dcfae5] text-[#04250e] rounded-[6px] px-4 py-2.5 flex items-center justify-between gap-3 text-[13px]">
          <span className="font-medium">{lastSyncedBanner}</span>
          <button
            type="button"
            onClick={() => setLastSyncedBanner(null)}
            aria-label="Dismiss notice"
            className="p-0.5 hover:opacity-75 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. DIVIDED SUMMARY STRIP (2x2 on mobile/tablet, 4-col on lg+) */}
      <div className="bg-white border border-[#e8e8e8] rounded-[8px] grid grid-cols-2 lg:grid-cols-4">
        <div className="p-3.5 sm:p-4 flex flex-col justify-between border-b lg:border-b-0 border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">Connected APIs</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[24px] sm:text-[28px] font-semibold text-[#111111] tabular-nums leading-none">
              {connectedCount}
            </span>
            <span className="text-[12px] sm:text-[13px] text-[#5f6368] tabular-nums">
              /{connectors.length} active
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">Bi-directional OAuth</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[22px] sm:text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              3
            </span>
            <span className="text-[12px] text-[#5f6368] truncate">
              Google, Meta, Apple
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 flex flex-col justify-between border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">Read-only pull APIs</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[22px] sm:text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              2
            </span>
            <span className="text-[12px] text-[#5f6368] truncate">
              Yelp Fusion, Trustpilot
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">Citation audit crawler</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[22px] sm:text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              30+
            </span>
            <span className="text-[12px] text-[#5f6368] truncate">
              via DataForSEO
            </span>
          </div>
        </div>
      </div>

      {/* 3. API CONNECTORS LIST / TABLE (5 columns on lg+ that always fit 100% of width, stacked rows below lg) */}
      <section
        aria-label="API connectors and directory sync"
        className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-[#111111]">
            Directory API connectors ({connectors.length})
          </h2>
          <span className="text-[12px] text-[#5f6368]">
            Scoped to 3 Philadelphia locations
          </span>
        </div>

        {/* Mobile & Tablet Rows (< lg) */}
        <div className="lg:hidden divide-y divide-[#f2f2f2]">
          {connectors.map((conn) => {
            const isSyncing = syncingId === conn.id;
            return (
              <div key={conn.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-[#111111] truncate">
                      {conn.name}
                    </div>
                    <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                      {conn.accountLabel}
                    </div>
                  </div>
                  <span
                    className={`h-[20px] px-2 rounded-[4px] inline-flex items-center text-[12px] font-medium shrink-0 ${
                      conn.connected
                        ? "bg-[#dcfae5] text-[#04250e]"
                        : "bg-[#fffbeb] text-[#92400e] border border-[#fde68a]"
                    }`}
                  >
                    {conn.connected ? "Connected" : "Setup needed"}
                  </span>
                </div>

                <div className="text-[12px] text-[#5f6368]">
                  {conn.capability} · Covers {conn.directoriesCovered.join(", ")}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[12px] text-[#6b6b6b] tabular-nums">
                    {conn.locationsMatched}/{stores.length} stores · Last pull: {conn.lastPulled}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openConfigModal(conn)}
                      className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white text-[13px] text-[#111111] cursor-pointer"
                    >
                      Configure
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePullSingle(conn)}
                      disabled={isSyncing}
                      className="h-[28px] px-2.5 rounded-[5px] bg-[#1d1f20] text-white text-[13px] font-medium cursor-pointer"
                    >
                      {isSyncing ? "Pulling…" : "Pull"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table (lg+): 5 balanced columns — never clips right-most Action column */}
        <div className="hidden lg:block w-full">
          <table className="w-full table-fixed text-left border-collapse">
            <thead>
              <tr className="h-[38px] border-b border-[#e5e7eb] text-[12px] font-normal text-[#5f6368]">
                <th className="px-4 font-normal w-[32%]">Provider &amp; account</th>
                <th className="px-4 font-normal w-[24%]">Sync mode &amp; coverage</th>
                <th className="px-4 font-normal w-[16%]">Status &amp; recency</th>
                <th className="px-4 font-normal text-right w-[10%]">Stores</th>
                <th className="px-4 font-normal text-right w-[18%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f2] text-[14px]">
              {connectors.map((conn) => {
                const isSyncing = syncingId === conn.id;
                return (
                  <tr
                    key={conn.id}
                    className="h-[64px] hover:bg-[#f9f9f9] transition-colors"
                  >
                    <td className="px-4 py-2.5 min-w-0">
                      <div className="font-medium text-[#111111] truncate">
                        {conn.name}
                      </div>
                      <div
                        className="text-[12px] text-[#5f6368] truncate mt-0.5"
                        title={conn.accountLabel}
                      >
                        {conn.accountLabel}
                      </div>
                    </td>

                    <td className="px-4 py-2.5 min-w-0">
                      <div className="text-[13px] text-[#111111] truncate">
                        {conn.capability}
                      </div>
                      <div
                        className="text-[12px] text-[#5f6368] truncate mt-0.5"
                        title={conn.directoriesCovered.join(", ")}
                      >
                        {conn.directoriesCovered.join(", ")}
                      </div>
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex flex-col items-start gap-0.5">
                        <span
                          className={`h-[20px] px-2 rounded-[4px] inline-flex items-center text-[12px] font-medium whitespace-nowrap ${
                            conn.connected
                              ? "bg-[#dcfae5] text-[#04250e]"
                              : "bg-[#fffbeb] text-[#92400e] border border-[#fde68a]"
                          }`}
                        >
                          {conn.connected ? "Connected" : "Setup needed"}
                        </span>
                        <span className="text-[12px] text-[#6b6b6b] truncate">
                          {conn.lastPulled}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-2.5 text-right tabular-nums text-[13px] text-[#111111]">
                      {conn.locationsMatched}
                      <span className="text-[#6b6b6b]">/{stores.length}</span>
                    </td>

                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openConfigModal(conn)}
                          className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] text-[#111111] transition-colors cursor-pointer"
                        >
                          Configure
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePullSingle(conn)}
                          disabled={isSyncing}
                          className="h-[28px] px-2.5 rounded-[5px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${
                              isSyncing ? "animate-spin" : ""
                            }`}
                          />
                          <span>{isSyncing ? "Pulling…" : "Pull"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL: CONFIGURE API CREDENTIALS & STORE LOCATION MAPPING */}
      {activeConnector && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="api-config-title"
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#e5e7eb] rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f2f2f2] flex items-center justify-between">
              <div>
                <h2
                  id="api-config-title"
                  className="text-[16px] font-semibold text-[#111111]"
                >
                  {activeConnector.name}
                </h2>
                <p className="text-[12px] text-[#5f6368] mt-0.5">
                  {activeConnector.provider} · {activeConnector.authType} · {activeConnector.endpointDoc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveConnector(null)}
                aria-label="Close dialog"
                className="p-1 rounded-[5px] text-[#6b6b6b] hover:text-[#111111] hover:bg-[#f2f2f2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveConfig}
              className="p-5 flex flex-col gap-4 text-[14px]"
            >
              <div>
                <label className="block text-[14px] font-medium text-[#111111] mb-2">
                  Account label / identifier
                </label>
                <input
                  type="text"
                  value={accountLabelInput}
                  onChange={(e) => setAccountLabelInput(e.target.value)}
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] bg-white text-[14px] text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#111111] mb-2">
                  {activeConnector.authType === "OAuth 2.0"
                    ? "OAuth 2.0 refresh token"
                    : "API key / bearer secret"}
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] bg-white text-[14px] text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="p-3.5 rounded-[6px] bg-[#f9f9f9] border border-[#e8e8e8] flex flex-col gap-2 text-[13px]">
                <span className="text-[12px] text-[#5f6368]">
                  Philadelphia store location IDs ({stores.length} branches)
                </span>
                {stores.map((st, idx) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 py-1 border-b last:border-b-0 border-[#eaeaea]"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-[#111111] truncate">
                        {st.name.replace("SmartFoneDoctor - ", "")}
                      </div>
                      <div className="text-[12px] text-[#5f6368] truncate">
                        {st.address}, {st.cityStateZip}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 font-mono text-[12px] text-[#111111] shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#247b50]" />
                      loc_phl_0{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f2f2f2]">
                {activeConnector.connected ? (
                  <button
                    type="button"
                    onClick={() => {
                      toggleConnector(activeConnector.id);
                      setActiveConnector(null);
                    }}
                    className="h-[32px] px-3 rounded-[6px] border border-[#ffedea] bg-[#ffedea] text-[#831c1e] text-[13px] font-medium cursor-pointer"
                  >
                    Disconnect
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveConnector(null)}
                    className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-medium text-[#111111] hover:bg-[#f9f9f9] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-[32px] px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium cursor-pointer"
                  >
                    Save &amp; pull locations
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
