"use client";

import React, { createContext, useContext, useState } from "react";
import { STORES, StoreLocation } from "./stores";

interface StoreContextType {
  stores: StoreLocation[];
  selectedStoreId: number;
  selectedStore: StoreLocation;
  isAllStores: boolean;
  setSelectedStoreId: (id: number) => void;
  setIsAllStores: (all: boolean) => void;
  addStore: (store: StoreLocation) => void;
  updateStore: (store: StoreLocation) => void;
  deleteStore: (id: number) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<StoreLocation[]>(STORES);
  const [selectedStoreId, setSelectedStoreIdState] = useState<number>(STORES[0].id);
  const [isAllStores, setIsAllStores] = useState<boolean>(false);

  const selectedStore =
    stores.find((s) => s.id === selectedStoreId) ?? stores[0];

  const setSelectedStoreId = (id: number) => {
    setSelectedStoreIdState(id);
    setIsAllStores(false);
  };

  const addStore = (store: StoreLocation) => {
    setStores((prev) => [...prev, store]);
    setSelectedStoreIdState(store.id);
    setIsAllStores(false);
  };

  const updateStore = (updated: StoreLocation) => {
    setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteStore = (id: number) => {
    setStores((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (selectedStoreId === id && remaining.length > 0) {
        setSelectedStoreIdState(remaining[0].id);
      }
      return remaining;
    });
  };

  return (
    <StoreContext.Provider
      value={{
        stores,
        selectedStoreId,
        selectedStore,
        isAllStores,
        setSelectedStoreId,
        setIsAllStores,
        addStore,
        updateStore,
        deleteStore,
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
