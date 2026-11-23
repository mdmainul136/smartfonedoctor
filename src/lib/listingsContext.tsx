"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  INITIAL_DIRECTORIES,
  INITIAL_API_CONNECTORS,
  CATALOG_DIRECTORIES,
  type ListingStatus,
  type SyncMode,
  type DirectoryTier,
  type StoreListingEntry,
  type DirectoryListing,
  type CatalogDirectoryItem,
  type ApiConnector,
} from "./listingsData";
import {
  getApiConnectorsAction,
  getDirectoryListingsAction,
  upsertDirectoryListingAction,
  toggleConnectorStatusAction,
  triggerApiPullAction,
  auditAllDirectoriesNapAction,
} from "@/actions/thirdPartyApis";

export {
  INITIAL_DIRECTORIES,
  INITIAL_API_CONNECTORS,
  CATALOG_DIRECTORIES,
  type ListingStatus,
  type SyncMode,
  type DirectoryTier,
  type StoreListingEntry,
  type DirectoryListing,
  type CatalogDirectoryItem,
  type ApiConnector,
};

export interface ListingsActionResult {
  success: boolean;
  needsApiKey?: boolean;
  liveSynced?: boolean;
  newReviewsAdded?: number;
  message?: string;
  error?: string;
  connector?: ApiConnector;
}

interface ListingsContextValue {
  directories: DirectoryListing[];
  connectors: ApiConnector[];
  isLoading: boolean;
  refreshListings: () => Promise<void>;
  updateStoreEntry: (dirId: string, storeId: number, entry: StoreListingEntry) => void;
  addFromCatalog: (
    item: CatalogDirectoryItem,
    targetStoreIds: number[],
    initialStatus?: ListingStatus
  ) => void;
  addCustomDirectory: (dir: DirectoryListing) => void;
  pullFromApi: (connectorId: string) => Promise<ListingsActionResult>;
  toggleConnector: (
    connectorId: string,
    accountLabel?: string,
    apiKey?: string,
    forceConnected?: boolean
  ) => Promise<ListingsActionResult>;
  auditAllNap: (storeId?: number) => Promise<ListingsActionResult>;
}

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [directories, setDirectories] = useState<DirectoryListing[]>([]);
  const [connectors, setConnectors] = useState<ApiConnector[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshListings = useCallback(async () => {
    try {
      const [dirsRes, connsRes] = await Promise.all([
        getDirectoryListingsAction(),
        getApiConnectorsAction(),
      ]);
      if (dirsRes.success) {
        setDirectories(dirsRes.directories);
      }
      if (connsRes.success) {
        setConnectors(connsRes.connectors);
      }
    } catch {
      // Keep existing state on transient error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshListings();
  }, [refreshListings]);

  const updateStoreEntry = (dirId: string, storeId: number, entry: StoreListingEntry) => {
    let updatedDir: DirectoryListing | undefined;
    const next = directories.map((d) => {
      if (d.id !== dirId) return d;
      updatedDir = {
        ...d,
        stores: {
          ...d.stores,
          [storeId]: entry,
        },
      };
      return updatedDir;
    });
    setDirectories(next);
    if (updatedDir) {
      void upsertDirectoryListingAction(updatedDir);
    }
  };

  const addFromCatalog = (
    item: CatalogDirectoryItem,
    targetStoreIds: number[],
    initialStatus: ListingStatus = "Missing"
  ) => {
    const nowLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const existing = directories.find((d) => d.id === item.id);
    if (existing) {
      const updatedStores = { ...existing.stores };
      targetStoreIds.forEach((sid) => {
        if (!updatedStores[sid]) {
          updatedStores[sid] = {
            status: initialStatus,
            napMatch: initialStatus === "Synced" ? 100 : 0,
            rating: null,
            url: initialStatus === "Synced" ? item.claimPortalUrl : "",
            lastSynced: initialStatus === "Synced" ? `Added (${nowLabel})` : "Never",
            issue:
              initialStatus === "Missing"
                ? `Added from catalog — claim ${item.name} profile`
                : undefined,
          };
        }
      });
      const updatedDir: DirectoryListing = { ...existing, stores: updatedStores };
      setDirectories(directories.map((d) => (d.id === item.id ? updatedDir : d)));
      void upsertDirectoryListingAction(updatedDir);
      return;
    }

    const storesMap: Record<number, StoreListingEntry> = {};
    [1, 2, 3].forEach((sid) => {
      const active = targetStoreIds.includes(sid) && initialStatus === "Synced";
      storesMap[sid] = {
        status: targetStoreIds.includes(sid) ? initialStatus : "Missing",
        napMatch: active ? 100 : 0,
        rating: null,
        url: active ? item.claimPortalUrl : "",
        lastSynced: active ? `Added (${nowLabel})` : "Never",
        issue:
          !active ? `Added from catalog — claim ${item.name} profile` : undefined,
      };
    });

    const newDir: DirectoryListing = {
      id: item.id,
      name: item.name,
      domain: item.domain,
      category: item.category,
      tier: item.tier,
      authority: item.authority,
      syncMode: item.syncMode,
      claimPortalUrl: item.claimPortalUrl,
      apiProviderId: item.syncMode === "DataForSEO Audit" ? "dataforseo-scanner" : undefined,
      stores: storesMap,
    };

    setDirectories([newDir, ...directories]);
    void upsertDirectoryListingAction(newDir);
  };

  const addCustomDirectory = (dir: DirectoryListing) => {
    setDirectories([dir, ...directories]);
    void upsertDirectoryListingAction(dir);
  };

  const pullFromApi = async (connectorId: string): Promise<ListingsActionResult> => {
    const res = await triggerApiPullAction(connectorId);
    await refreshListings();
    return {
      success: res.success,
      needsApiKey: res.needsApiKey,
      liveSynced: res.liveSynced,
      newReviewsAdded: res.newReviewsAdded,
      error: res.error,
      warning: res.warningMessage,
      connector: res.connector,
      message: res.success
        ? `Live API pull completed for ${res.connector?.name || connectorId} (${res.connector?.locationsMatched ?? 0} location(s) matched).`
        : res.error,
    } as ListingsActionResult;
  };

  const toggleConnector = async (
    connectorId: string,
    accountLabel?: string,
    apiKey?: string,
    forceConnected?: boolean
  ): Promise<ListingsActionResult> => {
    const existing = connectors.find((c) => c.id === connectorId);
    const nextConnected =
      forceConnected !== undefined
        ? forceConnected
        : existing
        ? !existing.connected
        : true;

    const res = await toggleConnectorStatusAction({
      id: connectorId,
      connected: nextConnected,
      accountLabel,
      apiKey,
    });

    await refreshListings();

    return {
      success: Boolean(res.success),
      needsApiKey: (res as { needsApiKey?: boolean }).needsApiKey,
      error: res.error,
      connector: res.connector,
    };
  };

  const auditAllNap = async (storeId?: number): Promise<ListingsActionResult> => {
    const res = await auditAllDirectoriesNapAction(storeId);
    await refreshListings();
    return {
      success: res.success,
      message: res.message,
      error: res.error,
    };
  };

  return (
    <ListingsContext.Provider
      value={{
        directories,
        connectors,
        isLoading,
        refreshListings,
        updateStoreEntry,
        addFromCatalog,
        addCustomDirectory,
        pullFromApi,
        toggleConnector,
        auditAllNap,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) {
    throw new Error("useListings must be used within a ListingsProvider");
  }
  return ctx;
}
