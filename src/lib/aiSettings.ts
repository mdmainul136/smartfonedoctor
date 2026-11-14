export type AiProviderPreference = "gemini" | "openai";

export interface StoredAiSettings {
  defaultProvider: AiProviderPreference;
  geminiApiKey: string;
  openaiApiKey: string;
}

const AI_SETTINGS_STORAGE_KEY = "sfd_ai_settings_v1";

const DEFAULT_AI_SETTINGS: StoredAiSettings = {
  defaultProvider: "gemini",
  geminiApiKey: "",
  openaiApiKey: "",
};

export function getStoredAiSettings(): StoredAiSettings {
  if (typeof window === "undefined") return DEFAULT_AI_SETTINGS;
  try {
    const raw = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<StoredAiSettings>;
    return {
      defaultProvider: parsed.defaultProvider === "openai" ? "openai" : "gemini",
      geminiApiKey: typeof parsed.geminiApiKey === "string" ? parsed.geminiApiKey : "",
      openaiApiKey: typeof parsed.openaiApiKey === "string" ? parsed.openaiApiKey : "",
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export function saveStoredAiSettings(settings: StoredAiSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save AI settings", err);
  }
}
