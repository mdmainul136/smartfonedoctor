"use server";

// Admin actions for the common-issue articles (/common-issues/<category>/<slug>).
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { COMMON_ISSUES_STORE_ID, getCommonIssues } from "@/lib/commonIssuesStore";
import type { CommonIssueDetail } from "@/data/commonIssuesData";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATEGORIES = ["smartphone", "tablet", "computer", "console"];
const CATEGORY_NAME: Record<string, string> = { smartphone: "Smartphone", tablet: "Tablet", computer: "Computer", console: "Game Console" };

export async function getCommonIssuesAdminAction(): Promise<{ success: boolean; issues?: CommonIssueDetail[]; error?: string }> {
  try {
    await requireAdmin();
    return { success: true, issues: await getCommonIssues() };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not load common issues" };
  }
}

export async function saveCommonIssuesAction(issues: CommonIssueDetail[]): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const seen = new Set<string>();
    for (const i of issues) {
      if (!i.title?.trim()) return { success: false, error: "An article has no title." };
      if (!SLUG_RE.test(i.slug || "")) return { success: false, error: `"${i.title}": the URL slug may only use a-z, 0-9 and single dashes.` };
      if (seen.has(i.slug)) return { success: false, error: `Two articles use the slug "${i.slug}". Slugs must be unique.` };
      seen.add(i.slug);
      if (!CATEGORIES.includes(i.category)) return { success: false, error: `"${i.title}": pick a category.` };
      if (!i.image?.trim()) return { success: false, error: `"${i.title}": add a photo.` };
      if (!i.sections?.some((s) => s.heading.trim())) return { success: false, error: `"${i.title}": add at least one section.` };
    }
    const clean = issues.map((i) => ({
      ...i,
      categoryName: CATEGORY_NAME[i.category],
      sections: i.sections
        .filter((s) => s.heading.trim() || s.paragraphs.some((p) => p.trim()))
        .map((s) => ({
          ...s,
          paragraphs: s.paragraphs.map((p) => p.trim()).filter(Boolean),
          listItems: s.listItems?.map((x) => x.trim()).filter(Boolean),
        })),
      relatedSlugs: (i.relatedSlugs ?? []).filter((r) => r !== i.slug && seen.has(r)),
      seo: {
        title: i.seo?.title?.trim() || `${i.title} | SmartFoneDoctor`,
        description: i.seo?.description?.trim() || i.leadText,
        keywords: (i.seo?.keywords ?? []).map((k) => k.trim()).filter(Boolean),
      },
    }));
    await prisma.taxonomyStore.upsert({
      where: { id: COMMON_ISSUES_STORE_ID },
      update: { data: clean as unknown as Prisma.InputJsonValue },
      create: { id: COMMON_ISSUES_STORE_ID, data: clean as unknown as Prisma.InputJsonValue },
    });
    revalidatePath("/common-issues", "layout");
    revalidatePath("/admin/common-issues");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Could not save common issues" };
  }
}
