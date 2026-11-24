export const DEFAULT_GEMINI_FLASH_MODEL = "gemini-3.8-flash";

export const GEMINI_FLASH_FALLBACKS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.0-flash",
  "gemini-2.5-flash",
] as const;

export interface AvailableAiModel {
  id: string;
  displayName: string;
  provider: "gemini" | "openai";
}

export function isGeminiModelUnavailableStatus(status: number, bodyText: string): boolean {
  if (status === 404) return true;
  if (status === 400) {
    const lower = bodyText.toLowerCase();
    return (
      lower.includes("not found") ||
      lower.includes("no longer available") ||
      lower.includes("not supported for generatecontent")
    );
  }
  return false;
}

/**
 * Returns true when an API failure is model-specific or transient capacity-related
 * (404/400 deprecated, 503 high demand, 429 rate-limit, 500/502/504 gateway errors)
 * so the router automatically fails over to the next active Gemini model.
 */
export function shouldFallbackGeminiModel(status: number, bodyText: string): boolean {
  if (isGeminiModelUnavailableStatus(status, bodyText)) return true;
  return status === 503 || status === 429 || status === 500 || status === 502 || status === 504;
}

function parseGeminiVersion(modelId: string): number {
  const m = modelId.match(/gemini-(\d+(?:\.\d+)?)/i);
  return m ? parseFloat(m[1]) : 0;
}

/**
 * Fetches ALL text-generation Gemini models active for the given API key (`v1beta/models`),
 * sorted newest version first with Flash preferred over Pro at equal version.
 */
export async function listAvailableGeminiModels(apiKey: string): Promise<AvailableAiModel[]> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?pageSize=100&key=${encodeURIComponent(
        apiKey
      )}`,
      { signal: AbortSignal.timeout(6000), cache: "no-store" }
    );
    if (!res.ok) return [];

    const data = (await res.json()) as {
      models?: Array<{
        name?: string;
        displayName?: string;
        supportedGenerationMethods?: string[];
      }>;
    };

    const seen = new Set<string>();
    const list: AvailableAiModel[] = [];

    for (const m of data.models ?? []) {
      const rawName = m.name ?? "";
      const supportsGenerate = (m.supportedGenerationMethods ?? []).includes("generateContent");
      if (!supportsGenerate) continue;
      if (!/^models\/gemini-/i.test(rawName)) continue;
      if (
        /(audio|tts|image|imagen|veo|video|live|embedding|aqa|robotics|computer-use|vision-only|deep-research)/i.test(
          rawName
        )
      ) {
        continue;
      }
      const id = rawName.replace(/^models\//, "").trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      list.push({
        id,
        displayName: (m.displayName || id).trim(),
        provider: "gemini",
      });
    }

    list.sort((a, b) => {
      const vDiff = parseGeminiVersion(b.id) - parseGeminiVersion(a.id);
      if (vDiff !== 0) return vDiff;
      const rank = (id: string) =>
        (/flash/i.test(id) ? 0 : 10) +
        (/lite/i.test(id) ? 2 : 0) +
        (/preview|exp/i.test(id) ? 4 : 0);
      return rank(a.id) - rank(b.id);
    });

    return list;
  } catch {
    return [];
  }
}

/** Fetches active chat-capable OpenAI models for the given API key. */
export async function listAvailableOpenAiModels(apiKey: string): Promise<AvailableAiModel[]> {
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!res.ok) return [];

    const json = (await res.json()) as { data?: Array<{ id?: string }> };
    const seen = new Set<string>();
    const list: AvailableAiModel[] = [];

    for (const item of json.data ?? []) {
      const id = (item.id ?? "").trim();
      if (!id || seen.has(id)) continue;
      if (!/^(gpt-5|gpt-4\.1|gpt-4o|o3|o4-mini)/i.test(id)) continue;
      if (/(audio|realtime|transcribe|tts|search|image|instruct|moderation|embedding)/i.test(id)) {
        continue;
      }
      seen.add(id);
      list.push({ id, displayName: id, provider: "openai" });
    }

    list.sort((a, b) => b.id.localeCompare(a.id));
    return list;
  } catch {
    return [];
  }
}

/**
 * Discovers active Gemini text models supporting `generateContent` for the given API key
 * so deprecated hardcoded model strings automatically self-heal against Google's API lifecycle.
 */
export async function discoverGeminiFlashModels(apiKey: string): Promise<string[]> {
  const models = await listAvailableGeminiModels(apiKey);
  const flashFirst = [
    ...models.filter((m) => /flash/i.test(m.id)),
    ...models.filter((m) => !/flash/i.test(m.id)),
  ];
  return flashFirst.map((m) => m.id);
}
