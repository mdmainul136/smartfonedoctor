// Server-side only. The common-issue articles (/common-issues/<category>/<slug>),
// stored in the database (taxonomy_store row below) and edited in Admin > Common
// Issues; seeded from src/lib/data/commonIssuesData.ts the first time it is read.

import { cache } from "react";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { COMMON_ISSUES_CMS, type CommonIssueDetail } from "@/data/commonIssuesData";

export const COMMON_ISSUES_STORE_ID = "common-issues";

/** Live list, cached per request. Falls back to the built-in list if the database is down. */
export const getCommonIssues = cache(async (): Promise<CommonIssueDetail[]> => {
  try {
    const row = await prisma.taxonomyStore.findUnique({ where: { id: COMMON_ISSUES_STORE_ID } });
    if (row && Array.isArray(row.data) && row.data.length > 0) return row.data as unknown as CommonIssueDetail[];
    await prisma.taxonomyStore.upsert({
      where: { id: COMMON_ISSUES_STORE_ID },
      update: { data: COMMON_ISSUES_CMS as unknown as Prisma.InputJsonValue },
      create: { id: COMMON_ISSUES_STORE_ID, data: COMMON_ISSUES_CMS as unknown as Prisma.InputJsonValue },
    });
    return COMMON_ISSUES_CMS;
  } catch (err) {
    console.error("[getCommonIssues] using built-in list:", err);
    return COMMON_ISSUES_CMS;
  }
});
