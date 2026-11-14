import type { PuckPageData } from "@/puck/types";

export type LocalAiProvider = "gemini" | "openai";

export interface LocalPuckAiOptions {
  prompt: string;
  currentData?: PuckPageData;
  mode?: "generate" | "edit";
  businessContext?: string;
  provider?: LocalAiProvider;
  model?: string;
  providerApiKey?: string;
}

export interface LocalPuckAiResult {
  data: PuckPageData;
  summary: string;
  provider: LocalAiProvider;
  model: string;
}

const DEFAULT_BUSINESS_CONTEXT = `
Business: SmartFone Doctor (Philadelphia, PA)
Services: Smartphone (iPhone, Samsung), Tablet (iPad), Laptop (MacBook), and Game Console (PS5, Xbox, Switch) repair & micro-soldering.
Key Selling Points: 30-minute express screen & battery service, OEM-grade parts, 90-day warranty, walk-in or online booking (/schedule-repair).
Brand Palette: Primary Teal #009691, Dark Slate #0f172a, Light Surface #f8fafc, White #ffffff.
`.trim();

const PUCK_SCHEMA_PROMPT = `
You are a deterministic Puck page-builder JSON generator.
Output ONLY a valid JSON object with this exact top-level shape:
{
  "summary": "Short 1-sentence description of what you built or changed",
  "data": {
    "root": { "props": {} },
    "content": [ ...blocks ]
  }
}

Allowed block "type" values and their exact "props" schemas:
1. "HeroBlock":
   props: {
     "id": "HeroBlock-<unique>",
     "badgeText": string,
     "heading": string,
     "subheading": string,
     "ctaText": string,
     "ctaLink": string,
     "bgColor": hex string (default "#0f172a"),
     "textColor": hex string (default "#ffffff"),
     "accentColor": hex string (default "#009691"),
     "badgeBg": string (default "rgba(0, 150, 145, 0.18)"),
     "badgeColor": hex string (default "#5eead4"),
     "padding": string (default "56px 36px"),
     "align": "left" | "center",
     "customCss": ""
   }
2. "ServicesGridBlock":
   props: {
     "id": "ServicesGridBlock-<unique>",
     "variant": "services_grid" | "benefits",
     "heading": string,
     "subheading": string,
     "displayLayout": "grid" | "flex",
     "gridColumns": number (1..6),
     "flexDirection": "row" | "column",
     "flexWrap": "wrap" | "nowrap",
     "justifyContent": "flex-start" | "center" | "space-between" | "flex-end",
     "alignItems": "stretch" | "flex-start" | "center" | "flex-end",
     "gap": string (e.g. "16px"),
     "bgColor": hex string,
     "textColor": hex string,
     "cardBgColor": hex string,
     "cardBorderColor": hex string,
     "accentColor": hex string (default "#009691"),
     "padding": string (default "48px 32px"),
     "align": "left" | "center",
     "borderRadius": string (default "10px"),
     "customCss": "",
     "items": [
       {
         "title": string,
         "description": string,
         "badge": string,
         "price": string,
         "icon": "None"|"Shield"|"Clock"|"Zap"|"Wrench"|"Sparkles"|"Star"|"Check"|"CheckCircle2",
         "link": string,
         "linkText": string,
         "highlight": boolean,
         "colSpan": "1"|"2"|"3"|"full",
         "rowSpan": "1"|"2"
       }
     ]
   }
3. "SplitBannerBlock":
   props: {
     "id": "SplitBannerBlock-<unique>",
     "heading": string,
     "subheading": string,
     "ctaText": string,
     "ctaLink": string,
     "bgColor": hex string,
     "textColor": hex string,
     "cardBgColor": hex string,
     "cardBorderColor": hex string,
     "accentColor": hex string,
     "padding": string,
     "borderRadius": string,
     "customCss": "",
     "items": [{ "badge": string, "title": string, "description": string, "icon": "Shield"|"Clock"|"Zap"|"Wrench"|"Sparkles"|"Star"|"Check"|"CheckCircle2"|"None" }]
   }
4. "FaqBlock":
   props: {
     "id": "FaqBlock-<unique>",
     "heading": string,
     "subheading": string,
     "displayLayout": "grid" | "flex",
     "gridColumns": number (1..3),
     "gap": string (e.g. "12px"),
     "bgColor": hex string,
     "textColor": hex string,
     "cardBgColor": hex string,
     "cardBorderColor": hex string,
     "accentColor": hex string,
     "padding": string,
     "align": "left" | "center",
     "borderRadius": string,
     "customCss": "",
     "items": [{ "title": string, "description": string, "colSpan": "1"|"2"|"full" }]
   }
5. "CtaBannerBlock":
   props: {
     "id": "CtaBannerBlock-<unique>",
     "heading": string,
     "subheading": string,
     "ctaText": string,
     "ctaLink": string,
     "bgColor": hex string,
     "textColor": hex string,
     "accentColor": hex string,
     "padding": string,
     "align": "left" | "center",
     "customCss": ""
   }
6. "RichTextBlock":
   props: {
     "id": "RichTextBlock-<unique>",
     "heading": string,
     "subheading": string,
     "bodyHtml": string (valid HTML paragraph/list markup),
     "bgColor": hex string,
     "textColor": hex string,
     "padding": string,
     "align": "left" | "center",
     "customCss": ""
   }

Rules:
- Always include a unique "id" inside every block's "props".
- Never invent component types outside the 6 types listed above.
- Output raw JSON only, no markdown fences.
`.trim();

const ALLOWED_TYPES = new Set([
  "HeroBlock",
  "ServicesGridBlock",
  "SplitBannerBlock",
  "FaqBlock",
  "CtaBannerBlock",
  "RichTextBlock",
  "ContainerBlock",
  "FeatureCard",
]);

function extractJsonObject(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  const stripped = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(stripped) as Record<string, unknown>;
}

function normalizePuckData(rawData: unknown): PuckPageData {
  const candidate = (rawData || {}) as {
    root?: { props?: Record<string, unknown> };
    content?: Array<{ type?: string; props?: Record<string, unknown> }>;
  };

  const content = Array.isArray(candidate.content)
    ? candidate.content
        .filter((b) => b && typeof b.type === "string" && ALLOWED_TYPES.has(b.type))
        .map((b, idx) => ({
          type: b.type as PuckPageData["content"][number]["type"],
          props: {
            ...(b.props || {}),
            id:
              typeof b.props?.id === "string" && b.props.id.trim()
                ? b.props.id
                : `${b.type}-ai-${Date.now()}-${idx}`,
          },
        }))
    : [];

  return {
    root: { props: candidate.root?.props || {} },
    content: content as PuckPageData["content"],
  };
}

function resolveProviderAndKey(opts: LocalPuckAiOptions): {
  provider: LocalAiProvider;
  apiKey: string;
  model: string;
} {
  const requested = opts.provider;
  const geminiKey =
    (requested === "gemini" ? opts.providerApiKey : undefined) ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    "";
  const openaiKey =
    (requested === "openai" ? opts.providerApiKey : undefined) ||
    process.env.OPENAI_API_KEY ||
    "";

  if (requested === "openai" && openaiKey) {
    return {
      provider: "openai",
      apiKey: openaiKey,
      model: opts.model || "gpt-4o-mini",
    };
  }
  if (requested === "gemini" && geminiKey) {
    return {
      provider: "gemini",
      apiKey: geminiKey,
      model: opts.model || "gemini-2.5-flash",
    };
  }
  if (geminiKey) {
    return {
      provider: "gemini",
      apiKey: geminiKey,
      model: opts.model || "gemini-2.5-flash",
    };
  }
  if (openaiKey) {
    return {
      provider: "openai",
      apiKey: openaiKey,
      model: opts.model || "gpt-4o-mini",
    };
  }
  if (opts.providerApiKey?.trim()) {
    const isSk = opts.providerApiKey.trim().startsWith("sk-");
    return {
      provider: isSk ? "openai" : "gemini",
      apiKey: opts.providerApiKey.trim(),
      model: opts.model || (isSk ? "gpt-4o-mini" : "gemini-2.5-flash"),
    };
  }

  throw new Error(
    "No AI API key found. Set GEMINI_API_KEY or OPENAI_API_KEY in .env.local (or enter your own key in the AI panel)."
  );
}

async function callGeminiJson(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 240)}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

async function callOpenAiJson(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText.slice(0, 240)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned an empty response.");
  return text;
}

/**
 * Self-hosted Puck AI wrapper (no Puck Cloud / no paid Puck plan required).
 * Routes directly to Gemini or OpenAI using your own API key.
 */
export async function localPuckHandler(
  opts: LocalPuckAiOptions
): Promise<LocalPuckAiResult> {
  if (!opts.prompt || !opts.prompt.trim()) {
    throw new Error("Prompt is required.");
  }

  const { provider, apiKey, model } = resolveProviderAndKey(opts);
  const systemPrompt = `${PUCK_SCHEMA_PROMPT}\n\nBusiness Context:\n${
    opts.businessContext || DEFAULT_BUSINESS_CONTEXT
  }`;

  const userPrompt =
    opts.mode === "edit" && opts.currentData
      ? `Task: Modify or extend the existing Puck page JSON below according to the user's request. Preserve existing blocks unless asked to change them.\n\nCurrent Puck JSON:\n${JSON.stringify(
          opts.currentData
        )}\n\nUser Request:\n${opts.prompt}`
      : `Task: Generate a complete, conversion-focused Puck page JSON for the user's request.\n\nUser Request:\n${opts.prompt}`;

  const rawText =
    provider === "openai"
      ? await callOpenAiJson(apiKey, model, systemPrompt, userPrompt)
      : await callGeminiJson(apiKey, model, systemPrompt, userPrompt);

  const parsed = extractJsonObject(rawText);
  const normalized = normalizePuckData(parsed.data ?? parsed);

  if (normalized.content.length === 0) {
    throw new Error("AI returned 0 valid Puck blocks. Please refine your prompt.");
  }

  return {
    data: normalized,
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary
        : `Generated ${normalized.content.length} Puck blocks.`,
    provider,
    model,
  };
}

