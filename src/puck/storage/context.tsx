"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { BuilderStorage } from "./types";

type BuilderStorageValue = { storage: BuilderStorage; documentId: string };

const BuilderStorageContext = createContext<BuilderStorageValue | null>(null);

export function BuilderStorageProvider({
  storage,
  documentId,
  children,
}: BuilderStorageValue & { children: ReactNode }) {
  return (
    <BuilderStorageContext.Provider value={{ storage, documentId }}>
      {children}
    </BuilderStorageContext.Provider>
  );
}

/** Storage and page id for the open editor. Only valid inside BuilderEditor. */
export function useBuilderStorage(): BuilderStorageValue {
  const value = useContext(BuilderStorageContext);
  if (!value) throw new Error("useBuilderStorage must be used inside BuilderEditor");
  return value;
}

/** Same as useBuilderStorage, but null outside the editor instead of throwing. */
export function useOptionalBuilderStorage(): BuilderStorageValue | null {
  return useContext(BuilderStorageContext);
}
