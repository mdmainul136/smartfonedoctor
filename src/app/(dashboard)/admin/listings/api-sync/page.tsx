"use client";

import { useEffect, useState, useCallback } from "react";
import { useStoreContext } from "@/lib/storeContext";
import { useListings, ApiConnector } from "@/lib/listingsContext";
import { getApiSyncLogsAction } from "@/actions/thirdPartyApis";
import ListingsNav from "@/components/Dashboard/ListingsNav";
import {
  ExternalLink,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  KeyRound,
  Activity,
} from "lucide-react";

interface SyncLogItem {
  id: string;
  connectorId: string;
  connectorName: string;
  action: string;
  status: string;
  itemsSynced: number;
  message: string | null;
  createdAt: string;
}

interface BannerState {
  tone: "success" | "warning" | "error";
  text: string;
}

export default function ListingsApiSyncPage() {
  const { stores } = useStoreContext();
  const { connectors, isLoading, pullFromApi, toggleConnector } = useListings();

  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>([]);

  const [activeConnector, setActiveConnector] = useState<ApiConnector | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [accountLabelInput, setAccountLabelInput] = useState("");
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const loadSyncLogs = useCallback(async () => {
    const res = await getApiSyncLogsAction();
    if (res.success && Array.isArray(res.logs)) {
      setSyncLogs(res.logs as SyncLogItem[]);
    }
  }, []);

  useEffect(() => {
    void loadSyncLogs();
  }, [loadSyncLogs]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthState = params.get("oauth");
    const oauthErr = params.get("oauth_error");
    if (oauthState === "connected") {
      setBanner({
        tone: "success",
        text: "Google Business Profile OAuth 2.0 connected and token saved to PostgreSQL.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (oauthErr) {
      setBanner({
        tone: "error",
        text: `Google OAuth error: ${oauthErr}`,
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const connectedCount = connectors.filter((c) => c.connected).length;
  const oauthConnectors = connectors.filter((c) => c.authType === "OAuth 2.0");
  const oauthConnectedCount = oauthConnectors.filter((c) => c.connected).length;
  const apiKeyConnectors = connectors.filter((c) => c.authType === "API Key");
  const apiKeyConnectedCount = apiKeyConnectors.filter((c) => c.connected).length;
  const successLogsCount = syncLogs.filter(
    (l) => l.status.toLowerCase() === "success"
  ).length;
  const alertLogsCount = syncLogs.length - successLogsCount;

  const handlePullSingle = async (conn: ApiConnector) => {
    setSyncingId(conn.id);
    const res = await pullFromApi(conn.id);
    await loadSyncLogs();
    setSyncingId(null);

    if (res.success) {
      setBanner({
        tone: "success",
        text: res.message || `Synced ${conn.name} via live API.`,
      });
    } else if (res.needsApiKey) {
      setBanner({
        tone: "warning",
        text:
          res.error ||
          `No credentials configured for ${conn.name}. Click Configure to add a real API key or OAuth token.`,
      });
    } else {
      setBanner({
        tone: "error",
        text: res.error || `Live API pull failed for ${conn.name}.`,
      });
    }
  };

  const handlePullAll = async () => {
    const readyConnectors = connectors.filter((c) => c.connected);
    if (readyConnectors.length === 0) {
      setBanner({
        tone: "warning",
        text: "No API providers are configured yet. Click Configure on a provider to save a real API key or OAuth token before pulling.",
      });
      return;
    }

    setSyncingAll(true);
    let succeeded = 0;
    let failed = 0;
    let lastError = "";

    for (const c of readyConnectors) {
      const res = await pullFromApi(c.id);
      if (res.success) succeeded += 1;
      else {
        failed += 1;
        lastError = res.error || lastError;
      }
    }

    await loadSyncLogs();
    setSyncingAll(false);

    if (failed === 0) {
      setBanner({
        tone: "success",
        text: `Pulled live data from ${succeeded} configured API provider(s).`,
      });
    } else {
      setBanner({
        tone: succeeded > 0 ? "warning" : "error",
        text: `Pulled ${succeeded} provider(s); ${failed} failed${
          lastError ? `: ${lastError}` : "."
        }`,
      });
    }
  };

  const openConfigModal = (conn: ApiConnector) => {
    setActiveConnector(conn);
    setAccountLabelInput(conn.connected ? conn.accountLabel : "");
    setApiKeyInput("");
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConnector) return;
    setIsSavingConfig(true);

    const cleanKey = apiKeyInput.trim() || undefined;
    const cleanLabel = accountLabelInput.trim() || undefined;
    const saveRes = await toggleConnector(activeConnector.id, cleanLabel, cleanKey, true);

    if (!saveRes.success) {
      setIsSavingConfig(false);
      setBanner({
        tone: "warning",
        text: saveRes.error || `Enter a valid API key or token for ${activeConnector.name}.`,
      });
      return;
    }

    const pullRes = await pullFromApi(activeConnector.id);
    await loadSyncLogs();
    setIsSavingConfig(false);
    const targetName = activeConnector.name;
    setActiveConnector(null);

    if (pullRes.success) {
      setBanner({
        tone: "success",
        text:
          pullRes.message ||
          `${targetName} credentials saved and live data pulled from API.`,
      });
    } else {
      setBanner({
        tone: "warning",
        text: `Credentials saved for ${targetName}, but live verification returned: ${
          pullRes.error || "API error"
        }`,
      });
    }
  };

  const handleDisconnect = async () => {
    if (!activeConnector) return;
    setIsSavingConfig(true);
    const name = activeConnector.name;
    await toggleConnector(activeConnector.id, undefined, undefined, false);
    await loadSyncLogs();
    setIsSavingConfig(false);
    setActiveConnector(null);
    setBanner({
      tone: "warning",
      text: `Disconnected and cleared saved credentials for ${name}.`,
    });
  };

  const bannerClasses =
    banner?.tone === "success"
      ? "bg-[#dcfae5] text-[#04250e] border border-[#bbf7d0]"
      : banner?.tone === "warning"
      ? "bg-[#fffbeb] text-[#92400e] border border-[#fde68a]"
      : "bg-[#ffedea] text-[#831c1e] border border-[#fecaca]";

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
              {isLoading
                ? "Loading live connector status from PostgreSQL…"
                : connectedCount === 0
                ? `0 of ${connectors.length} providers configured · Add a real API key or OAuth token to enable live syncing`
                : `${connectedCount} of ${connectors.length} providers configured with live credentials · Scoped to ${stores.length} Philadelphia locations`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handlePullAll()}
            disabled={syncingAll || isLoading}
            className="h-[32px] self-start sm:self-auto shrink-0 px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${syncingAll ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>{syncingAll ? "Pulling live APIs…" : "Pull connected APIs"}</span>
          </button>
        </div>

        <ListingsNav />
      </div>

      {banner && (
        <div
          role="status"
          className={`${bannerClasses} rounded-[6px] px-4 py-2.5 flex items-center justify-between gap-3 text-[13px]`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {banner.tone !== "success" && (
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span className="font-medium">{banner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            aria-label="Dismiss notice"
            className="p-0.5 hover:opacity-75 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. DIVIDED SUMMARY STRIP (Real DB counts only) */}
      <div className="bg-white border border-[#e8e8e8] rounded-[8px] grid grid-cols-2 lg:grid-cols-4">
        <div className="p-3.5 sm:p-4 flex flex-col justify-between border-b lg:border-b-0 border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">Configured APIs</span>
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
          <span className="text-[12px] text-[#5f6368]">OAuth providers</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[22px] sm:text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {oauthConnectedCount}
            </span>
            <span className="text-[12px] text-[#5f6368] truncate tabular-nums">
              /{oauthConnectors.length} connected
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 flex flex-col justify-between border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">API key providers</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[22px] sm:text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {apiKeyConnectedCount}
            </span>
            <span className="text-[12px] text-[#5f6368] truncate tabular-nums">
              /{apiKeyConnectors.length} configured
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">Recorded sync logs</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[22px] sm:text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {syncLogs.length}
            </span>
            <span className="text-[12px] text-[#5f6368] truncate tabular-nums">
              {syncLogs.length === 0
                ? "no runs yet"
                : `${successLogsCount} ok · ${alertLogsCount} alert(s)`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. API CONNECTORS LIST / TABLE */}
      <section
        aria-label="API connectors and directory sync"
        className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-[#111111]">
            Directory API connectors ({connectors.length})
          </h2>
          <span className="text-[12px] text-[#5f6368]">
            Scoped to {stores.length} Philadelphia locations
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
                    {conn.connected ? "Connected" : "Not configured"}
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
                      onClick={() => void handlePullSingle(conn)}
                      disabled={isSyncing}
                      className="h-[28px] px-2.5 rounded-[5px] bg-[#1d1f20] text-white text-[13px] font-medium cursor-pointer disabled:opacity-60"
                    >
                      {isSyncing ? "Pulling…" : "Pull"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table (lg+) */}
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
                          className={`h-[20px] px-2 rounded-[4px] inline-flex items-center gap-1 text-[12px] font-medium whitespace-nowrap ${
                            conn.connected
                              ? "bg-[#dcfae5] text-[#04250e]"
                              : "bg-[#fffbeb] text-[#92400e] border border-[#fde68a]"
                          }`}
                        >
                          <span>{conn.connected ? "Connected" : "Not configured"}</span>
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
                          onClick={() => void handlePullSingle(conn)}
                          disabled={isSyncing}
                          className="h-[28px] px-2.5 rounded-[5px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
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

      {/* 4. REAL SYNC LOGS FROM POSTGRESQL (api_sync_logs) */}
      <section
        aria-label="Recent live API sync history"
        className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#5f6368]" aria-hidden="true" />
            <h2 className="text-[15px] font-semibold text-[#111111]">
              Live API Sync History
            </h2>
          </div>
          <span className="text-[12px] text-[#5f6368]">
            Real HTTP &amp; configuration log ({syncLogs.length})
          </span>
        </div>

        {syncLogs.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-[#5f6368]">
            No API sync runs recorded yet. Configure a provider above and click{" "}
            <strong className="text-[#111111]">Pull</strong> to verify live API responses.
          </div>
        ) : (
          <div className="divide-y divide-[#f2f2f2]">
            {syncLogs.slice(0, 12).map((log) => (
              <div
                key={log.id}
                className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[13px]"
              >
                <div className="min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[#111111]">
                      {log.connectorName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                      {log.action}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        log.status.toLowerCase() === "success"
                          ? "bg-[#dcfae5] text-[#04250e]"
                          : log.status.toLowerCase() === "warning"
                          ? "bg-[#fffbeb] text-[#92400e]"
                          : "bg-[#ffedea] text-[#831c1e]"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#5f6368] truncate">
                    {log.message || "—"}
                  </p>
                </div>
                <div className="text-[12px] text-[#6b6b6b] tabular-nums shrink-0 sm:text-right">
                  <div>{log.itemsSynced} item(s)</div>
                  <div>{new Date(log.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL: CONFIGURE REAL API CREDENTIALS */}
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
                  {activeConnector.provider} · {activeConnector.authType} ·{" "}
                  {activeConnector.endpointDoc}
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
              onSubmit={(e) => void handleSaveConfig(e)}
              className="p-5 flex flex-col gap-4 text-[14px]"
            >
              <div className="flex items-center justify-between gap-2 rounded-[6px] px-3 py-2 text-[12px] bg-[#f9f9f9] border border-[#e8e8e8]">
                <span className="inline-flex items-center gap-1.5 text-[#5f6368]">
                  <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                  Credential status:
                </span>
                <span
                  className={`font-medium ${
                    activeConnector.hasCredentials ? "text-[#247b50]" : "text-[#92400e]"
                  }`}
                >
                  {activeConnector.hasCredentials
                    ? `Saved (${activeConnector.credentialSource})`
                    : "Not configured yet"}
                </span>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#111111] mb-1.5">
                  Account label / identifier
                </label>
                <input
                  type="text"
                  value={accountLabelInput}
                  onChange={(e) => setAccountLabelInput(e.target.value)}
                  placeholder="e.g. SmartFoneDoctor Philly Production Key"
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] bg-white text-[14px] text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#111111] mb-1.5">
                  {activeConnector.id === "dataforseo-scanner"
                    ? "DataForSEO credentials (login:password or Base64 token)"
                    : activeConnector.authType === "OAuth 2.0"
                    ? "OAuth 2.0 access token / Places API key"
                    : "API key / bearer secret"}
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={
                    activeConnector.hasCredentials
                      ? "Leave blank to keep existing key, or paste new key to replace"
                      : activeConnector.id === "dataforseo-scanner"
                      ? "email@domain.com:api_password"
                      : "Paste real API key or OAuth token"
                  }
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] bg-white text-[14px] text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                />
                {activeConnector.id === "google-gbp" && (
                  <div className="mt-2.5 flex items-center justify-between gap-2 rounded-[6px] bg-teal-50/60 border border-teal-200/80 px-3 py-2 text-[12px]">
                    <span className="text-[#111111]">
                      Or authorize one-click Google Business Profile write access:
                    </span>
                    <a
                      href="/api/admin/google-oauth?action=connect"
                      className="inline-flex items-center gap-1 font-semibold text-sfd-teal hover:underline shrink-0"
                    >
                      <span>Connect OAuth</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-[6px] bg-[#f9f9f9] border border-[#e8e8e8] flex flex-col gap-2 text-[13px]">
                <span className="text-[12px] text-[#5f6368]">
                  Target store locations ({stores.length} branches)
                </span>
                {stores.map((st, idx) => {
                  const matched = activeConnector.locationsMatched > idx;
                  return (
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
                      <span
                        className={`inline-flex items-center gap-1 text-[12px] shrink-0 ${
                          matched ? "text-[#247b50] font-medium" : "text-[#6b6b6b]"
                        }`}
                      >
                        {matched && <Check className="w-3.5 h-3.5" />}
                        {matched ? "Matched" : "Pending pull"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f2f2f2]">
                {activeConnector.connected || activeConnector.hasCredentials ? (
                  <button
                    type="button"
                    disabled={isSavingConfig}
                    onClick={() => void handleDisconnect()}
                    className="h-[32px] px-3 rounded-[6px] border border-[#ffedea] bg-[#ffedea] text-[#831c1e] text-[13px] font-medium cursor-pointer disabled:opacity-60"
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
                    disabled={isSavingConfig}
                    className="h-[32px] px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium cursor-pointer disabled:opacity-60"
                  >
                    {isSavingConfig ? "Verifying…" : "Save & pull live"}
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
