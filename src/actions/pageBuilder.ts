"use server";

// Database storage for the page builder: autosaved drafts, published revisions
// and saved templates. Pages are addressed by slug (the builder's documentId).
// Every action needs a signed-in admin.

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

const MAX_REVISIONS_PER_PAGE = 50;

type Json = Record<string, unknown>;

export type DraftDTO = { savedAt: number; data: Json; author: string | null };
export type RevisionDTO = {
  id: string;
  createdAt: number;
  label: string | null;
  author: string | null;
  blockCount: number;
  data: Json;
};
export type TemplateDTO = { id: string; name: string; createdAt: number; isPreset: boolean; content: unknown[] };

async function pageIdForSlug(slug: string): Promise<string> {
  const page = await prisma.cmsPage.findUnique({ where: { slug }, select: { id: true } });
  if (!page) throw new Error(`Page "${slug}" is not in the database.`);
  return page.id;
}

const blockCount = (data: Json) => (Array.isArray(data.content) ? data.content.length : 0);

// ---------- Drafts ----------

export async function loadDraftAction(slug: string): Promise<DraftDTO | null> {
  await requireAdmin();
  const pageId = await pageIdForSlug(slug);
  const row = await prisma.pageBuilderDraft.findUnique({ where: { pageId } });
  return row ? { savedAt: row.savedAt.getTime(), data: row.data as Json, author: row.author } : null;
}

export async function saveDraftAction(slug: string, data: Json): Promise<DraftDTO> {
  const admin = await requireAdmin();
  const pageId = await pageIdForSlug(slug);
  const json = data as Prisma.InputJsonValue;
  const row = await prisma.pageBuilderDraft.upsert({
    where: { pageId },
    update: { data: json, author: admin.name },
    create: { pageId, data: json, author: admin.name },
  });
  return { savedAt: row.savedAt.getTime(), data, author: row.author };
}

export async function clearDraftAction(slug: string): Promise<void> {
  await requireAdmin();
  const pageId = await pageIdForSlug(slug);
  await prisma.pageBuilderDraft.deleteMany({ where: { pageId } });
}

// ---------- Revisions ----------

export async function listRevisionsAction(slug: string): Promise<RevisionDTO[]> {
  await requireAdmin();
  const pageId = await pageIdForSlug(slug);
  const rows = await prisma.pageBuilderRevision.findMany({
    where: { pageId },
    orderBy: { createdAt: "desc" },
    take: MAX_REVISIONS_PER_PAGE,
  });
  return rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.getTime(),
    label: r.label,
    author: r.author,
    blockCount: r.blockCount,
    data: r.data as Json,
  }));
}

export async function addRevisionAction(slug: string, data: Json, label?: string): Promise<RevisionDTO> {
  const admin = await requireAdmin();
  const pageId = await pageIdForSlug(slug);
  const row = await prisma.pageBuilderRevision.create({
    data: {
      pageId,
      data: data as Prisma.InputJsonValue,
      label: label ?? null,
      author: admin.name,
      isPublished: true,
      blockCount: blockCount(data),
    },
  });

  // Keep the newest MAX_REVISIONS_PER_PAGE versions.
  const old = await prisma.pageBuilderRevision.findMany({
    where: { pageId },
    orderBy: { createdAt: "desc" },
    skip: MAX_REVISIONS_PER_PAGE,
    select: { id: true },
  });
  if (old.length) await prisma.pageBuilderRevision.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });

  return {
    id: row.id,
    createdAt: row.createdAt.getTime(),
    label: row.label,
    author: row.author,
    blockCount: row.blockCount,
    data,
  };
}

// ---------- Templates ----------

export async function listTemplatesAction(): Promise<TemplateDTO[]> {
  await requireAdmin();
  const rows = await prisma.pageBuilderTemplate.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((t) => ({
    id: t.id,
    name: t.name,
    createdAt: t.createdAt.getTime(),
    isPreset: t.isPreset,
    content: Array.isArray(t.content) ? (t.content as unknown[]) : [],
  }));
}

export async function saveTemplateAction(name: string, content: unknown[]): Promise<TemplateDTO> {
  await requireAdmin();
  const row = await prisma.pageBuilderTemplate.create({
    data: { name, content: content as Prisma.InputJsonValue, category: "Saved", isPreset: false },
  });
  return { id: row.id, name: row.name, createdAt: row.createdAt.getTime(), isPreset: false, content };
}

export async function deleteTemplateAction(id: string): Promise<void> {
  await requireAdmin();
  // System presets stay; only templates people saved can be deleted.
  await prisma.pageBuilderTemplate.deleteMany({ where: { id, isPreset: false } });
}
