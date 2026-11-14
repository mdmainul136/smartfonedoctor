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

  const mountedRef = useRef(true);
  // Each save gets a number; only the newest one may update the status, so a
  // slow earlier save cannot report "saved" over a later failure (or vice versa).
  const saveSeqRef = useRef(0);
  // True while an edit is waiting for the debounce timer.
  const unsavedRef = useRef(false);
  const canSaveRef = useRef(false);
  canSaveRef.current = checkedDraft && !pendingDraft;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const saveNow = useCallback(
    (snapshot: Data) => {
      unsavedRef.current = false;
      const seq = ++saveSeqRef.current;
      return storage
        .saveDraft(documentId, snapshot)
        .then((draft) => {
          if (!mountedRef.current || seq !== saveSeqRef.current) return;
          setSavedAt(draft.savedAt);
          setStatus("saved");
        })
        .catch(() => {
          if (mountedRef.current && seq === saveSeqRef.current) setStatus("error");
        });
    },
    [storage, documentId],
  );

  // While the restore question is open, autosave waits so it cannot overwrite
  // the old draft before the user decides.
  useEffect(() => {
    if (!checkedDraft || pendingDraft || !dirty) return;
    unsavedRef.current = true;
    setStatus("saving");
    const timer = window.setTimeout(() => void saveNow(data), AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [data, dirty, checkedDraft, pendingDraft, saveNow]);

  // Closing the tab or leaving the editor inside the debounce window must not
  // lose the last edit: write it straight away.
  useEffect(() => {
    const flush = () => {
      if (unsavedRef.current && canSaveRef.current) void saveNow(dataRef.current);
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [saveNow]);

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
    // Invalidate any save still in flight so it cannot re-mark the page as a draft.
    saveSeqRef.current++;
    unsavedRef.current = false;
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
