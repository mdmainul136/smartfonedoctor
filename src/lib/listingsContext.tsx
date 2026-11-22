"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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

interface ListingsContextValue {
  directories: DirectoryListing[];
  connectors: ApiConnector[];
  updateStoreEntry: (dirId: string, storeId: number, entry: StoreListingEntry) => void;
  addFromCatalog: (
    item: CatalogDirectoryItem,
    targetStoreIds: number[],
    initialStatus?: ListingStatus
  ) => void;
  addCustomDirectory: (dir: DirectoryListing) => void;
  pullFromApi: (connectorId: string) => void;
  toggleConnector: (
    connectorId: string,
    accountLabel?: string,
    apiKey?: string,
    forceConnected?: boolean
  ) => void;
  auditAllNap: (storeId?: number) => void;
}

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [directories, setDirectories] = useState<DirectoryListing[]>(INITIAL_DIRECTORIES);
  const [connectors, setConnectors] = useState<ApiConnector[]>(INITIAL_API_CONNECTORS);

  useEffect(() => {
    let active = true;
    void Promise.all([getDirectoryListingsAction(), getApiConnectorsAction()])
      .then(([dirsRes, connsRes]) => {
        if (!active) return;
        if (dirsRes.success && dirsRes.directories.length > 0) {
          setDirectories(dirsRes.directories);
        }
        if (connsRes.success && connsRes.connectors.length > 0) {
          setConnectors(connsRes.connectors);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

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
            lastSynced: "Just added",
            issue:
              initialStatus === "Missing"
                ? `Added from catalog — ready to claim on ${item.name}`
                : undefined,
          };
        }
      });
      const updatedDir: DirectoryListing = { ...existing, stores: updatedStores };
      setDirectories(directories.map((d) => (d.id === item.id ? updatedDir : d)));
      void upsertDirectoryListingAction(updatedDir);
      return;
    }

    const storesMap: Record<number, StoreListingEntry> = {
      1: {
        status: targetStoreIds.includes(1) ? initialStatus : "Missing",
        napMatch: targetStoreIds.includes(1) && initialStatus === "Synced" ? 100 : 0,
        rating: null,
        url: targetStoreIds.includes(1) && initialStatus === "Synced" ? item.claimPortalUrl : "",
        lastSynced: "Just added",
        issue:
          initialStatus === "Missing"
            ? `Added from catalog — claim ${item.name} profile`
            : undefined,
      },
      2: {
        status: targetStoreIds.includes(2) ? initialStatus : "Missing",
        napMatch: targetStoreIds.includes(2) && initialStatus === "Synced" ? 100 : 0,
        rating: null,
        url: targetStoreIds.includes(2) && initialStatus === "Synced" ? item.claimPortalUrl : "",
        lastSynced: "Just added",
        issue:
          initialStatus === "Missing"
            ? `Added from catalog — claim ${item.name} profile`
            : undefined,
      },
      3: {
        status: targetStoreIds.includes(3) ? initialStatus : "Missing",
        napMatch: targetStoreIds.includes(3) && initialStatus === "Synced" ? 100 : 0,
        rating: null,
        url: targetStoreIds.includes(3) && initialStatus === "Synced" ? item.claimPortalUrl : "",
        lastSynced: "Just added",
        issue:
          initialStatus === "Missing"
            ? `Added from catalog — claim ${item.name} profile`
            : undefined,
      },
    };

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

  const pullFromApi = (connectorId: string) => {
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === connectorId
          ? { ...c, connected: true, lastPulled: "Just now", locationsMatched: 3 }
          : c
      )
    );

    setDirectories((prevDirs) =>
      prevDirs.map((d) => {
        if (d.apiProviderId !== connectorId) return d;
        const updatedStores: Record<number, StoreListingEntry> = {};
        [1, 2, 3].forEach((sid) => {
          const prev = d.stores[sid];
          if (
            connectorId === "google-gbp" ||
            connectorId === "facebook-graph" ||
            connectorId === "bing-sync" ||
            connectorId === "apple-connect"
          ) {
            updatedStores[sid] = {
              ...prev,
              status: "Synced",
              napMatch: 100,
              url: prev.url || d.claimPortalUrl,
              lastSynced: "Just now via API",
              issue: undefined,
            };
          } else {
            updatedStores[sid] = {
              ...prev,
              lastSynced: "Just now via API",
            };
          }
        });
        return { ...d, stores: updatedStores };
      })
    );

    void triggerApiPullAction(connectorId)
      .then(() => getDirectoryListingsAction())
      .then((res) => {
        if (res.success && res.directories.length > 0) {
          setDirectories(res.directories);
        }
      })
      .catch(() => {});
  };

  const toggleConnector = (
    connectorId: string,
    accountLabel?: string,
    apiKey?: string,
    forceConnected?: boolean
  ) => {
    const existing = connectors.find((c) => c.id === connectorId);
    const nextConnected =
      forceConnected !== undefined
        ? forceConnected
        : existing
        ? !existing.connected
        : true;

    setConnectors((prev) =>
      prev.map((c) => {
        if (c.id !== connectorId) return c;
        return {
          ...c,
          connected: nextConnected,
          lastPulled: nextConnected ? "Just connected" : "Disconnected",
          accountLabel:
            accountLabel ||
            (nextConnected ? c.accountLabel || "Connected via API Token" : "Not connected"),
        };
      })
    );

    void toggleConnectorStatusAction({
      id: connectorId,
      connected: nextConnected,
      accountLabel,
      apiKey,
    });
  };

  const auditAllNap = (storeId?: number) => {
    setDirectories((prev) =>
      prev.map((d) => {
        const updatedStores = { ...d.stores };
        [1, 2, 3].forEach((sid) => {
          if (!storeId || storeId === sid) {
            updatedStores[sid] = {
              ...updatedStores[sid],
              lastSynced: "Scanned just now",
            };
          }
        });
        return { ...d, stores: updatedStores };
      })
    );
    void auditAllDirectoriesNapAction(storeId);
  };

  return (
    <ListingsContext.Provider
      value={{
        directories,
        connectors,
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
