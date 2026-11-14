import type { ComponentData, Data } from "@puckeditor/core";
import type { BuilderDraft, BuilderRevision, BuilderStorage, BuilderTemplate } from "./types";

const MAX_REVISIONS = 20;

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Writes and reports failure (quota full, private mode) instead of throwing. */
function write(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Browser storage for the UI/UX phase. Keys are namespaced with `prefix` so
 * several builders (or several sites) can share one browser.
 */
export function createLocalStorageBuilderStorage(prefix = "pb"): BuilderStorage {
  const draftKey = (doc: string) => `${prefix}:draft:${doc}`;
  const revisionsKey = (doc: string) => `${prefix}:revisions:${doc}`;
  const templatesKey = `${prefix}:templates`;

  return {
    async loadDraft(doc) {
      return read<BuilderDraft | null>(draftKey(doc), null);
    },
    async saveDraft(doc, data) {
      const draft: BuilderDraft = { savedAt: Date.now(), data };
      if (!write(draftKey(doc), draft)) throw new Error("Browser storage is full");
      return draft;
    },
    async clearDraft(doc) {
      if (typeof window !== "undefined") window.localStorage.removeItem(draftKey(doc));
    },

    async listRevisions(doc) {
      return read<BuilderRevision[]>(revisionsKey(doc), []);
    },
    async addRevision(doc, data: Data, label) {
      const revision: BuilderRevision = { id: newId(), createdAt: Date.now(), label, data };
      let list = [revision, ...read<BuilderRevision[]>(revisionsKey(doc), [])].slice(0, MAX_REVISIONS);
      // Out of room: keep dropping the oldest until it fits.
      while (!write(revisionsKey(doc), list) && list.length > 1) list = list.slice(0, -1);
      return revision;
    },

    async listTemplates() {
      return read<BuilderTemplate[]>(templatesKey, []);
    },
    async saveTemplate(name, content: ComponentData[]) {
      const template: BuilderTemplate = { id: newId(), name, createdAt: Date.now(), content };
      if (!write(templatesKey, [template, ...read<BuilderTemplate[]>(templatesKey, [])])) {
        throw new Error("Browser storage is full");
      }
      return template;
    },
    async deleteTemplate(id) {
      write(
        templatesKey,
        read<BuilderTemplate[]>(templatesKey, []).filter((t) => t.id !== id)
      );
    },
  };
}
