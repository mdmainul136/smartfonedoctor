"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Data } from "@puckeditor/core";
import type { BuilderDraft, BuilderStorage } from "../storage";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 1200;

/**
 * Keeps an unpublished draft of the page in storage while the user edits, and
 * offers back a draft left over from an earlier session.
 */
export function useAutosave({
  data,
  dirty,
  storage,
  documentId,
}: {
  data: Data;
  dirty: boolean;
  storage: BuilderStorage;
  documentId: string;
}) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pendingDraft, setPendingDraft] = useState<BuilderDraft | null>(null);
  const [checkedDraft, setCheckedDraft] = useState(false);
  // Latest editor data, so the draft check compares against what is on screen
  // (after a hot reload the editor may already hold the draft's changes).
  const dataRef = useRef(data);
  dataRef.current = data;

  // A draft that differs from what the editor opened with is from an earlier
  // session the user never published.
  useEffect(() => {
    let alive = true;
    storage
      .loadDraft(documentId)
      .then((draft) => {
        if (alive && draft && JSON.stringify(draft.data) !== JSON.stringify(dataRef.current)) {
          setPendingDraft(draft);
        }
      })
      .catch(() => undefined)
      .finally(() => alive && setCheckedDraft(true));
    return () => {
      alive = false;
    };
  }, [storage, documentId]);

  // While the restore question is open, autosave waits so it cannot overwrite
  // the old draft before the user decides.
  useEffect(() => {
    if (!checkedDraft || pendingDraft || !dirty) return;
    setStatus("saving");
    const timer = window.setTimeout(() => {
      storage
        .saveDraft(documentId, data)
        .then((draft) => {
          setSavedAt(draft.savedAt);
          setStatus("saved");
        })
        .catch(() => setStatus("error"));
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [data, dirty, checkedDraft, pendingDraft, storage, documentId]);

  const takeDraft = useCallback(() => {
    const draft = pendingDraft;
    setPendingDraft(null);
    return draft;
  }, [pendingDraft]);

  const discardDraft = useCallback(() => {
    setPendingDraft(null);
    void storage.clearDraft(documentId);
  }, [storage, documentId]);

  /** Call after a successful publish: the draft is now the live page. */
  const markPublished = useCallback(() => {
    setStatus("idle");
    setSavedAt(null);
    void storage.clearDraft(documentId);
  }, [storage, documentId]);

  return { status, savedAt, pendingDraft, takeDraft, discardDraft, markPublished };
}

export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDateTime(ms: number): string {
  const d = new Date(ms);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? `Today, ${formatTime(ms)}`
    : d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
