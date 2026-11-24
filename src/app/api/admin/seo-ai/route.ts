import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentAdminAction } from "@/actions/auth";
import {
  GEMINI_FLASH_FALLBACKS,
  discoverGeminiFlashModels,
  isGeminiModelUnavailableStatus,
  shouldFallbackGeminiModel,
} from "@/puck/ai/geminiModels";

export interface SeoAiRequestPayload {
  pageType?: "page" | "blog" | "common-issue" | "device-model" | "repair-type" | "global";
  path?: string;
  name?: string;
  currentTitle?: string;
  currentDescription?: string;
  currentFocusKeyword?: string;
  contentText?: string;
  templateTokens?: string[];
}

export interface SeoAiGeneratedResult {
  focusKeyword: string;
  title: string;
  metaDesc: string;
  keywords: string[];
  schemaType: string;
}

const VALID_SCHEMAS = new Set([
  "WebPage",
  "Service",
  "TechArticle",
  "Article",
  "FAQPage",
  "LocalBusiness",
  "AboutPage",
]);

function clampAtWord(text: string, maxLen: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  if (/\{[a-z_]+\}/i.test(clean)) return clean;
  const sliced = clean.slice(0, maxLen + 1);
  const lastSpace = sliced.lastIndexOf(" ");
  if (lastSpace >= Math.floor(maxLen * 0.6)) {
    return sliced.slice(0, lastSpace).replace(/[\s|,\-–—:]+$/, "").trim();
  }
  return clean.slice(0, maxLen).trim();
}

function parseJsonObject(raw: string): Record<string, unknown> {
  const stripped = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(stripped) as Record<string, unknown>;
  } catch {
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(stripped.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new Error("AI did not return valid SEO JSON.");
  }
}

async function runGeminiSeoJson(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; model: string }> {
  const queue: string[] = [...GEMINI_FLASH_FALLBACKS];
  const tried = new Set<string>();
  let lastError = "Gemini API request failed.";
  const maxAttempts = 4;
  let attempts = 0;

  for (let i = 0; i < queue.length && attempts < maxAttempts; i++) {
    const model = queue[i];
    if (tried.has(model)) continue;
    tried.add(model);
    attempts++;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.35,
          },
        }),
      }
    );

    if (res.ok) {
      const json = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini returned an empty SEO response.");
      return { text, model };
    }

    const errText = await res.text();
    lastError = `Gemini API error (${res.status}): ${errText.slice(0, 220)}`;
    if (!shouldFallbackGeminiModel(res.status, errText)) {
      throw new Error(lastError);
    }

    if (isGeminiModelUnavailableStatus(res.status, errText) && i === queue.length - 1) {
      const discovered = await discoverGeminiFlashModels(apiKey);
      for (const m of discovered) {
        if (!tried.has(m)) queue.push(m);
      }
    }
  }

  throw new Error(lastError);
}

async function runOpenAiSeoJson(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; model: string }> {
  const model = "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText.slice(0, 220)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned an empty SEO response.");
  return { text, model };
}

export async function POST(req: NextRequest) {
  if (!(await getCurrentAdminAction())) {
    return NextResponse.json({ error: "Please sign in to the admin." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as SeoAiRequestPayload;
    const settings = await prisma.appSystemSettings
      .findUnique({
        where: { id: "global_config" },
        select: { geminiApiKey: true, openaiApiKey: true, defaultAiProvider: true },
      })
      .catch(() => null);

    const geminiKey =
      settings?.geminiApiKey?.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      "";
    const openaiKey = settings?.openaiApiKey?.trim() || process.env.OPENAI_API_KEY || "";

    if (!geminiKey && !openaiKey) {
      return NextResponse.json(
        { error: "No AI API key configured. Add a Gemini or OpenAI key in Settings." },
        { status: 400 }
      );
    }

    const preferOpenAi = settings?.defaultAiProvider === "openai" && Boolean(openaiKey);
    const strippedContent = (body.contentText || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3200);

    const tokensHint = body.templateTokens?.length
      ? `Preserve appropriate dynamic template tokens (${body.templateTokens.join(", ")}) inside title, metaDesc, and focusKeyword.`
      : "";

    const systemPrompt = `You are a senior Technical SEO & Local Search strategist for SmartFoneDoctor (cell phone, iPhone, iPad, MacBook, laptop, and game console repair in Philadelphia, PA — 30-min repairs, OEM-grade parts, 90-day warranty).
Return ONLY a single valid JSON object with exact keys:
{
  "focusKeyword": "2-5 word high-intent keyword matching page topic & URL",
  "title": "45-60 char SEO title containing focusKeyword (max 60 chars strictly)",
  "metaDesc": "130-155 char compelling meta description containing focusKeyword + Philadelphia trust signals & CTA (max 160 chars strictly)",
  "keywords": ["5 to 7 relevant secondary & local keywords"],
  "schemaType": "WebPage | Service | TechArticle | Article | FAQPage | LocalBusiness | AboutPage"
}
Rules:
- Avoid repeating the word "repair" excessively; balance with natural alternatives like "fix", "replacement", "service".
- ${tokensHint || "Use concrete Philadelphia local trust signals (same-day, 90-day warranty, walk-ins welcome)."}`;

    const userPrompt = [
      `Page Type: ${body.pageType || "page"}`,
      body.path ? `URL Path: ${body.path}` : "",
      body.name ? `Page / Item Name: ${body.name}` : "",
      body.currentFocusKeyword ? `Existing Focus Keyword: ${body.currentFocusKeyword}` : "",
      body.currentTitle ? `Existing Title: ${body.currentTitle}` : "",
      body.currentDescription ? `Existing Description: ${body.currentDescription}` : "",
      strippedContent ? `Page Content Excerpt:\n${strippedContent}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const aiRes =
      preferOpenAi || !geminiKey
        ? await runOpenAiSeoJson(openaiKey, systemPrompt, userPrompt)
        : await runGeminiSeoJson(geminiKey, systemPrompt, userPrompt);

    const parsed = parseJsonObject(aiRes.text);
    const focusKeyword = String(parsed.focusKeyword || body.currentFocusKeyword || body.name || "Phone Repair Philadelphia")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 70);
    const rawTitle = String(parsed.title || body.currentTitle || `${focusKeyword} | SmartFoneDoctor`);
    const rawDesc = String(parsed.metaDesc || body.currentDescription || "");
    const title = clampAtWord(rawTitle, 60);
    const metaDesc = clampAtWord(rawDesc, 160);

    const rawKeywords = Array.isArray(parsed.keywords)
      ? parsed.keywords
      : typeof parsed.keywords === "string"
      ? parsed.keywords.split(",")
      : [];
    const keywords = Array.from(
      new Set(
        rawKeywords
          .map((k) => String(k).trim())
          .filter(Boolean)
      )
    ).slice(0, 8);

    const rawSchema = String(parsed.schemaType || "").trim();
    const schemaType = VALID_SCHEMAS.has(rawSchema)
      ? rawSchema
      : body.pageType === "blog" || body.pageType === "common-issue"
      ? "TechArticle"
      : "WebPage";

    const seo: SeoAiGeneratedResult = {
      focusKeyword,
      title,
      metaDesc,
      keywords,
      schemaType,
    };

    return NextResponse.json({
      success: true,
      seo,
      provider: preferOpenAi || !geminiKey ? "openai" : "gemini",
      model: aiRes.model,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate SEO metadata.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
