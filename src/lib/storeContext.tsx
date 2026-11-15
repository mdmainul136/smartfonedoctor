"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { STORES, StoreLocation } from "./stores";
import {
  getStoreBranchesAction,
  createStoreBranchAction,
  updateStoreBranchAction,
  deleteStoreBranchAction,
  StoreBranchData,
} from "@/actions/settings";

interface StoreContextType {
  stores: StoreLocation[];
  selectedStoreId: number;
  selectedStore: StoreLocation;
  isAllStores: boolean;
  isLoading: boolean;
  setSelectedStoreId: (id: number) => void;
  setIsAllStores: (all: boolean) => void;
  addStore: (store: Omit<StoreLocation, "id">) => Promise<StoreLocation | null>;
  updateStore: (store: StoreLocation) => Promise<boolean>;
  deleteStore: (id: number) => Promise<boolean>;
  reloadStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({
  children,
  initialStores,
}: {
  children: React.ReactNode;
  initialStores?: StoreLocation[];
}) {
  const [stores, setStores] = useState<StoreLocation[]>(
    initialStores && initialStores.length > 0 ? initialStores : STORES
  );
  const [selectedStoreId, setSelectedStoreIdState] = useState<number>(
    stores[0]?.id ?? 1
  );
  const [isAllStores, setIsAllStores] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load live store branches from PostgreSQL on mount
  const reloadStores = async () => {
    try {
      setIsLoading(true);
      const res = await getStoreBranchesAction();
      if (res.success && res.data && res.data.length > 0) {
        setStores(res.data);
        // Ensure selectedStoreId is valid
        if (!res.data.some((s) => s.id === selectedStoreId)) {
          setSelectedStoreIdState(res.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load stores from database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    reloadStores();
  }, []);

  const selectedStore =
    stores.find((s) => s.id === selectedStoreId) ?? stores[0] ?? STORES[0];

  const setSelectedStoreId = (id: number) => {
    setSelectedStoreIdState(id);
    setIsAllStores(false);
  };

  const addStore = async (storeData: Omit<StoreLocation, "id">): Promise<StoreLocation | null> => {
    try {
      const res = await createStoreBranchAction(storeData);
      if (res.success && res.data) {
        setStores((prev) => [...prev, res.data!]);
        setSelectedStoreIdState(res.data.id);
        setIsAllStores(false);
        return res.data;
      }
      return null;
    } catch (err) {
      console.error("Failed to create store in database:", err);
      return null;
    }
  };

  const updateStore = async (updated: StoreLocation): Promise<boolean> => {
    try {
      // Optimistic update
      setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      const res = await updateStoreBranchAction(updated.id, updated);
      return res.success;
    } catch (err) {
      console.error("Failed to update store in database:", err);
      return false;
    }
  };

  const deleteStore = async (id: number): Promise<boolean> => {
    try {
      const res = await deleteStoreBranchAction(id);
      if (res.success) {
        setStores((prev) => {
          const remaining = prev.filter((s) => s.id !== id);
          if (selectedStoreId === id && remaining.length > 0) {
            setSelectedStoreIdState(remaining[0].id);
          }
          return remaining;
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete store from database:", err);
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        stores,
        selectedStoreId,
        selectedStore,
        isAllStores,
        isLoading,
        setSelectedStoreId,
        setIsAllStores,
        addStore,
        updateStore,
        deleteStore,
        reloadStores,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  const ctx = useContext(StoreContext);
  if (!ctx)
    throw new Error("useStoreContext must be used within StoreProvider");
  return ctx;
}
