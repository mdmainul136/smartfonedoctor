import type { ComponentData, Data } from "@puckeditor/core";

/** A published version of a page, kept so it can be restored. */
export type BuilderRevision = {
  id: string;
  createdAt: number;
  label?: string;
  /** Who published it, when the storage records that. */
  author?: string;
  data: Data;
};

/** An unpublished editing session, saved as the user works. */
export type BuilderDraft = {
  savedAt: number;
  data: Data;
};

/** A section or widget saved once and reused on any page. */
export type BuilderTemplate = {
  id: string;
  name: string;
  createdAt: number;
  /** Top-level blocks the template inserts, in order. */
  content: ComponentData[];
};

/**
 * Everything the builder persists on its own. The host decides where it lives:
 * the browser during UI work, a database later. Every method is async so a
 * network-backed adapter drops in without touching the editor.
 *
 * `documentId` is the host's stable id for the page being edited (its slug).
 */
export interface BuilderStorage {
  loadDraft(documentId: string): Promise<BuilderDraft | null>;
  saveDraft(documentId: string, data: Data): Promise<BuilderDraft>;
  clearDraft(documentId: string): Promise<void>;

  listRevisions(documentId: string): Promise<BuilderRevision[]>;
  addRevision(documentId: string, data: Data, label?: string): Promise<BuilderRevision>;

  listTemplates(): Promise<BuilderTemplate[]>;
  saveTemplate(name: string, content: ComponentData[]): Promise<BuilderTemplate>;
  deleteTemplate(id: string): Promise<void>;
}
