"use client";

import React from "react";
import { ListingsProvider } from "@/lib/listingsContext";

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return <ListingsProvider>{children}</ListingsProvider>;
}

