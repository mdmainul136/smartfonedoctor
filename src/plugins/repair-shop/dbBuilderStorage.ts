import type { ComponentData, Data } from "@puckeditor/core";
import type { BuilderStorage, BuilderTemplate } from "@/puck/storage";
import { puckConfig } from "@/puck/config";
import {
  addRevisionAction,
  clearDraftAction,
  deleteTemplateAction,
  listRevisionsAction,
  listTemplatesAction,
  loadDraftAction,
  saveDraftAction,
  saveTemplateAction,
} from "@/actions/pageBuilder";

type Json = Record<string, unknown>;

/** True when every block in the template is a widget this site still has. */
function usesKnownBlocks(content: unknown[]): boolean {
  const known = puckConfig.components as Record<string, unknown>;
  return content.every((block) => {
    const type = (block as { type?: string })?.type;
    return Boolean(type && type in known);
  });
}

/**
 * Builder storage backed by Postgres (via server actions): drafts autosave to
 * page_builder_drafts, each publish adds a page_builder_revisions row, and
 * saved sections live in page_builder_templates. Works across browsers and users.
 */
export function createDbBuilderStorage(): BuilderStorage {
  return {
    async loadDraft(doc) {
      const draft = await loadDraftAction(doc);
      return draft ? { savedAt: draft.savedAt, data: draft.data as unknown as Data } : null;
    },
    async saveDraft(doc, data) {
      const draft = await saveDraftAction(doc, data as unknown as Json);
      return { savedAt: draft.savedAt, data };
    },
    async clearDraft(doc) {
      await clearDraftAction(doc);
    },

    async listRevisions(doc) {
      const rows = await listRevisionsAction(doc);
      return rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        label: r.label ?? undefined,
        author: r.author ?? undefined,
        data: r.data as unknown as Data,
      }));
    },
    async addRevision(doc, data, label) {
      const r = await addRevisionAction(doc, data as unknown as Json, label);
      return { id: r.id, createdAt: r.createdAt, label: r.label ?? undefined, author: r.author ?? undefined, data };
    },

    async listTemplates() {
      const rows = await listTemplatesAction();
      return rows
        .filter((t) => usesKnownBlocks(t.content))
        .map<BuilderTemplate>((t) => ({
          id: t.id,
          name: t.name,
          createdAt: t.createdAt,
          content: t.content as ComponentData[],
        }));
    },
    async saveTemplate(name, content) {
      const t = await saveTemplateAction(name, content as unknown[]);
      return { id: t.id, name: t.name, createdAt: t.createdAt, content };
    },
    async deleteTemplate(id) {
      await deleteTemplateAction(id);
    },
  };
}
