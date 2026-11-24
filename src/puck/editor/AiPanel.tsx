"use client";

import { useCallback, useEffect, useState } from "react";
import { useGetPuck } from "@puckeditor/core";
import { usePuckSelect } from "./puckStore";
import { Sparkles, X, Loader2, KeyRound, Wand2, Settings, RefreshCw } from "lucide-react";
import type { PuckPageData } from "@/puck/types";
import { BuilderLink, getBuilderHost, type AiSettings } from "../host";

const QUICK_PROMPTS = [
  "Create a high-converting iPhone screen repair landing page with Hero, 3-col Services Grid, FAQ, and CTA Banner",
  "Add a 3-column Benefits Grid highlighting 30-min turnaround, OEM parts, and 90-day warranty",
  "Add an FAQ section with 4 common phone & laptop repair questions",
  "Update the Hero headline to be punchier and add a Split Feature Banner below it",
];

export default function PuckAiPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  // Read on demand: these values are only needed when the user acts.
  const getPuck = useGetPuck();
  const dispatch = usePuckSelect((s) => s.dispatch);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"edit" | "generate">("edit");
  const [provider, setProvider] = useState<"gemini" | "openai">("gemini");
  const [storedSettings, setStoredSettings] = useState<AiSettings>({
    defaultProvider: "gemini",
    geminiApiKey: "",
    openaiApiKey: "",
  });
  const [customKey, setCustomKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [hasServerKey, setHasServerKey] = useState<boolean | null>(null);
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; displayName: string }>>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<string | null>(null);

  useEffect(() => {
    const saved = getBuilderHost().getAiSettings();
    setStoredSettings(saved);
    setProvider(saved.defaultProvider);

    fetch(getBuilderHost().aiEndpoint)
      .then(async (r) => {
        if (!r.ok) return { hasServerKey: false };
        const text = await r.text();
        return text ? JSON.parse(text) : { hasServerKey: false };
      })
      .then((info: { hasServerKey?: boolean; providers?: { gemini?: boolean; openai?: boolean } }) => {
        const serverReady = Boolean(info.hasServerKey);
        setHasServerKey(serverReady);
        const hasSettingsKey = Boolean(saved.geminiApiKey || saved.openaiApiKey);
        if (!serverReady && !hasSettingsKey) {
          setShowKeyInput(true);
        } else if (!saved.geminiApiKey && saved.openaiApiKey) {
          setProvider("openai");
        } else if (!hasSettingsKey && !info.providers?.gemini && info.providers?.openai) {
          setProvider("openai");
        }
      })
      .catch(() => setHasServerKey(false));
  }, []);

  const activeSettingsKey =
    provider === "gemini" ? storedSettings.geminiApiKey : storedSettings.openaiApiKey;
  const effectiveKey =
    customKey.trim() || (!hasServerKey ? activeSettingsKey || undefined : undefined);

  const loadModels = useCallback(
    async (signal?: AbortSignal) => {
      setLoadingModels(true);
      setModelsError(null);
      try {
        const res = await fetch(
          `${getBuilderHost().aiEndpoint}?models=1&provider=${encodeURIComponent(provider)}`,
          {
            headers: effectiveKey ? { "x-ai-api-key": effectiveKey } : undefined,
            signal,
          }
        );
        if (!res.ok) {
          setModelsError("Could not load live models");
          return;
        }
        const data = (await res.json()) as {
          models?: Array<{ id: string; displayName: string }>;
        };
        if (Array.isArray(data.models)) {
          setAvailableModels(data.models);
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setModelsError("Could not load live models");
        }
      } finally {
        if (!signal?.aborted) {
          setLoadingModels(false);
        }
      }
    },
    [provider, effectiveKey]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadModels(controller.signal);
    return () => controller.abort();
  }, [loadModels]);

  const handleRunAi = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setLastSummary(null);

    try {
      const res = await fetch(getBuilderHost().aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mode,
          provider,
          model: selectedModel || undefined,
          providerApiKey: effectiveKey,
          currentData:
            mode === "edit"
              ? (getPuck().appState.data as unknown as PuckPageData)
              : undefined,
        }),
      });

      const json = (await res.json()) as {
        data?: PuckPageData;
        summary?: string;
        provider?: string;
        model?: string;
        error?: string;
      };

      if (!res.ok || !json.data) {
        throw new Error(json.error || "Failed to generate Puck layout.");
      }

      dispatch({
        type: "setData",
        data: json.data,
      });

      setLastSummary(
        `${json.summary || "Updated canvas"} (${json.provider}/${json.model}) — press Undo anytime to revert.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const modelSelectorControl = (
    <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px]">
      <span className="font-semibold text-gray-500">Model:</span>
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="max-w-[210px] bg-transparent text-[11px] font-medium text-gray-800 focus:outline-none cursor-pointer"
        title={modelsError || "Select AI Model (loaded live from API)"}
      >
        <option value="">
          {loadingModels
            ? "Loading live models..."
            : availableModels.length > 0
            ? `Auto (${availableModels.length} live models)`
            : `Auto (${provider === "gemini" ? "Latest Flash" : "gpt-4o-mini"})`}
        </option>
        {availableModels.map((m) => (
          <option key={m.id} value={m.id}>
            {m.displayName} ({m.id})
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => loadModels()}
        disabled={loadingModels}
        title="Refresh available models from API"
        className="rounded p-0.5 text-gray-500 hover:bg-gray-100 hover:text-[#009691] disabled:opacity-50 cursor-pointer"
      >
        <RefreshCw className={`h-3 w-3 ${loadingModels ? "animate-spin" : ""}`} />
      </button>
    </div>
  );

  return (
    <div className="border-b border-teal-200 bg-gradient-to-r from-teal-50/90 via-white to-slate-50 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#009691] text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="text-xs font-bold text-gray-900">
              AI Page Assistant
            </div>
            <div className="text-[11px] text-gray-500">
              Generate or edit blocks directly on the canvas with Undo/Redo support.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {modelSelectorControl}

          <div className="flex items-center rounded-md border border-gray-200 bg-white p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`rounded px-2 py-0.5 font-semibold cursor-pointer ${
                mode === "edit"
                  ? "bg-[#009691] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Edit Current
            </button>
            <button
              type="button"
              onClick={() => setMode("generate")}
              className={`rounded px-2 py-0.5 font-semibold cursor-pointer ${
                mode === "generate"
                  ? "bg-[#009691] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Replace Page
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyInput((v) => !v)}
            className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            title="Configure API Provider / Key"
          >
            <KeyRound className="h-3 w-3 text-[#009691]" />
            <span>
              {activeSettingsKey
                ? "Settings Key Ready"
                : hasServerKey
                ? "Server Key Ready"
                : "API Key"}
            </span>
          </button>

{getBuilderHost().aiSettingsHref && (
                      <BuilderLink
              href={getBuilderHost().aiSettingsHref || ""}
            className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
            title="Manage AI keys in Settings"
          >
            <Settings className="h-3 w-3 text-gray-500" />
            <span>Settings</span>
          </BuilderLink>
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
            title="Close AI Panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showKeyInput && (
        <div className="mb-2.5 flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-white p-2 text-xs">
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value as "gemini" | "openai");
              setSelectedModel("");
              setAvailableModels([]);
            }}
            className="h-7 rounded border border-gray-300 bg-white px-2 text-xs font-medium text-gray-800"
          >
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI</option>
          </select>
          {modelSelectorControl}
          <input
            type="password"
            name="puck-ai-override-key"
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore="true"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            placeholder={
              activeSettingsKey || hasServerKey
                ? "Using Settings/Server key — paste here only to override"
                : `Paste your ${provider === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY"}`
            }
            className="h-7 flex-1 min-w-[220px] rounded border border-gray-300 px-2.5 text-xs text-gray-800 focus:border-[#009691] focus:outline-none"
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRunAi();
          }}
          placeholder="Describe the page or section you want to generate or edit..."
          className="h-9 flex-1 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-[#009691] focus:outline-none"
        />
        <button
          type="button"
          disabled={isLoading || !prompt.trim()}
          onClick={handleRunAi}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#009691] px-4 text-xs font-semibold text-white hover:bg-[#007f7b] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-3.5 w-3.5" />
              <span>Run AI</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setPrompt(q)}
            className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-gray-600 hover:border-[#009691] hover:text-[#007f7b] transition cursor-pointer"
          >
            {q.length > 52 ? `${q.slice(0, 52)}...` : q}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
          {error}
        </div>
      )}
      {lastSummary && (
        <div className="mt-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
          {lastSummary}
        </div>
      )}
    </div>
  );
}

