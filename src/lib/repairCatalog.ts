// Server-side only. The repair catalog (devices + repair types) that the repair
// pages, the repairs hub and the booking page read. Stored in the database
// (taxonomy_store rows below) and edited in Admin; seeded from the built-in
// catalog in src/lib/pSeoEngine.ts the first time it is read.

import { cache } from "react";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { CODE_CATALOG, type PSeoDevice, type PSeoIssue, type RepairCatalog } from "@/lib/pSeoEngine";

export const CATALOG_DEVICES_ID = "catalog-devices";
export const CATALOG_REPAIRS_ID = "catalog-repairs";

async function readOrSeed<T>(id: string, seed: T[]): Promise<T[]> {
  const row = await prisma.taxonomyStore.findUnique({ where: { id } });
  if (row && Array.isArray(row.data) && row.data.length > 0) return row.data as unknown as T[];
  await prisma.taxonomyStore.upsert({
    where: { id },
    update: { data: seed as unknown as Prisma.InputJsonValue },
    create: { id, data: seed as unknown as Prisma.InputJsonValue },
  });
  return seed;
}

/**
 * The live repair catalog. Cached per request, so a page and its metadata share
 * one read. Falls back to the built-in catalog if the database can't be reached.
 */
export const getRepairCatalog = cache(async (): Promise<RepairCatalog> => {
  try {
    const [devices, issues] = await Promise.all([
      readOrSeed<PSeoDevice>(CATALOG_DEVICES_ID, CODE_CATALOG.devices),
      readOrSeed<PSeoIssue>(CATALOG_REPAIRS_ID, CODE_CATALOG.issues),
    ]);
    return { devices, issues };
  } catch (err) {
    console.error("[getRepairCatalog] using built-in catalog:", err);
    return CODE_CATALOG;
  }
});
