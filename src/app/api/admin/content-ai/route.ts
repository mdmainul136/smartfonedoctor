import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentAdminAction } from "@/actions/auth";
import {
  GEMINI_FLASH_FALLBACKS,
  discoverGeminiFlashModels,
  isGeminiModelUnavailableStatus,
  shouldFallbackGeminiModel,
} from "@/puck/ai/geminiModels";

export type ContentAiMode =
  | "full_article"
  | "aeo_capsule"
  | "geo_local"
  | "pseo_links"
  | "comparison_table"
  | "faq_block"
  | "seo_optimize"
  | "expand"
  | "polish"
  | "grammar"
  | "shorten"
  | "cta"
  | "custom";

export interface ContentAiArticleContext {
  title?: string;
  slug?: string;
  category?: string;
  focusKeyword?: string;
  excerpt?: string;
  existingHtml?: string;
}

export interface ContentAiRequestPayload {
  mode?: ContentAiMode;
  selectedText?: string;
  customPrompt?: string;
  context?: ContentAiArticleContext;
}

const VALID_MODES = new Set<ContentAiMode>([
  "full_article",
  "aeo_capsule",
  "geo_local",
  "pseo_links",
  "comparison_table",
  "faq_block",
  "seo_optimize",
  "expand",
  "polish",
  "grammar",
  "shorten",
  "cta",
  "custom",
]);

const VERIFIED_INTERNAL_LINKS = [
  "/repairs",
  "/repairs/smartphone",
  "/repairs/smartphone/iphone-16-pro/screen-repair",
  "/repairs/smartphone/iphone-16-pro/battery-replacement",
  "/repairs/smartphone/iphone-16-pro/charging-port-repair",
  "/repairs/smartphone/iphone-16-pro/back-glass-repair",
  "/repairs/smartphone/iphone-16-pro/water-damage-repair",
  "/repairs/smartphone/galaxy-s25/screen-repair",
  "/repairs/smartphone/galaxy-s25/battery-replacement",
  "/repairs/console",
  "/repairs/console/playstation-5",
  "/repairs/console/playstation-5/hdmi-port-replacement",
  "/repairs/console/xbox-series-x",
  "/repairs/console/nintendo-switch-oled",
  "/repairs/computer",
  "/repairs/tablet",
  "/common-issues",
  "/schedule-repair",
  "/repair-status",
  "/warranty",
  "/locations/west-philadelphia-52nd-st",
  "/locations/lancaster-ave-4016",
  "/locations/lancaster-ave-4060",
  "/locations/i/book-repair",
];

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
    throw new Error("AI did not return valid structured JSON content.");
  }
}

/** Strips unsafe executable HTML while preserving rich semantic blog classes. */
function sanitizeGeneratedHtml(raw: string): string {
  return raw
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<\/?(html|head|body)[^>]*>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\b(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
    .replace(/<h1(\b[^>]*)>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>")
    .trim();
}

async function runGeminiContentJson(
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
        signal: AbortSignal.timeout(45000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.45,
          },
        }),
      }
    );

    if (res.ok) {
      const json = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini returned an empty content response.");
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

async function runOpenAiContentJson(
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
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({
      model,
      temperature: 0.45,
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
  if (!text) throw new Error("OpenAI returned an empty content response.");
  return { text, model };
}

function getModeDirective(mode: ContentAiMode, focusKw: string): string {
  switch (mode) {
    case "full_article":
      return `Write a complete, publish-ready 950–1,300 word technical repair guide optimized for SEO + AEO + GEO + pSEO (targeting 90+ on RankMath).
Required exact structure (using H2/H3, NEVER H1):
1. AEO Quick Answer Capsule at the very top:
   <div class="sfd-callout sfd-callout-tip"><div class="sfd-callout-body"><div class="sfd-callout-title">Quick Answer</div><p>45–60 word direct, fact-dense answer containing the exact focus keyword "${focusKw}" for Google AI Overviews, ChatGPT &amp; Perplexity citations.</p></div></div>
2. Diagnostic Symptoms & Root Causes: An <h2> containing "${focusKw}" (or its core terms), concise technical paragraph(s), and a scannable <ul> of hardware failure symptoms & component causes.
3. Step-by-Step Professional Bench Repair Process: An <h2> + ordered list (<ol>) describing real ESD-safe bench diagnostics, disassembly/cleaning/micro-soldering or assembly replacement, and post-repair testing specific to this exact device and issue.
4. Topic-Specific Technical Comparison Table: An <h2> + <table class="sfd-comparison-table"><thead><tr><th>...</th><th>...</th><th>...</th></tr></thead><tbody>...4-5 realistic comparison rows...</tbody></table> comparing realistic options (e.g., OEM-Spec Replacement vs Standard Aftermarket, or HDMI Port vs Retimer IC vs Display/Cable diagnostics when applicable).
5. GEO Philadelphia Authority & pSEO Internal Links Section: An <h2> mentioning Philadelphia + West Philly (33 S 52nd St) & University City (4016 & 4060 Lancaster Ave, near UPenn/Drexel/19139/19104), walk-in turnaround, free diagnostics, zero data loss, 90-day warranty, and 3–4 natural contextual <a href="..."> links ONLY from the Verified Internal Links whitelist (including <a href="/schedule-repair">schedule a repair</a> or <a href="/locations/west-philadelphia-52nd-st">West Philadelphia flagship</a>).
6. AEO Frequently Asked Questions: <h2>Frequently Asked Questions</h2> followed by 4–5 topic-specific FAQ items formatted strictly as:
   <details class="sfd-faq-accordion"><summary class="sfd-faq-summary">Concise question?</summary><div class="sfd-faq-answer">Direct 2–3 sentence answer.</div></details>
Target natural focus keyword density of 1.0%–2.2% without stuffing.`;

    case "aeo_capsule":
      return `Generate an AEO (Answer Engine Optimization) Quick Answer block ready to sit at the top of the article for Google AI Overviews, ChatGPT, and Perplexity citations:
- <div class="sfd-callout sfd-callout-tip"><div class="sfd-callout-body"><div class="sfd-callout-title">Quick Answer</div><p>45–60 word direct, authoritative answer mentioning "${focusKw}" and clear repair facts.</p></div></div>
- Follow with <h3>Key Technical Takeaways</h3> and a concise 3-bullet <ul>.`;

    case "geo_local":
      return `Generate a hyper-local GEO Philadelphia Trust & Walk-In Service section strictly relevant to the article topic:
- Use an <h2> referencing the device/service in Philadelphia, PA.
- Mention our West Philadelphia flagship (33 S 52nd St, Philadelphia, PA 19139 near the 52nd St Market-Frankford El) and University City locations (4016 & 4060 Lancaster Ave, PA 19104 serving UPenn, Drexel, Penn Presbyterian, Center City, Overbrook, and Cobbs Creek).
- Highlight same-day service, free bench diagnostics, OEM-grade components, 90-day warranty, zero data wipe, and include 2 relevant <a href="..."> internal links from the verified whitelist (e.g. <a href="/locations/west-philadelphia-52nd-st">33 S 52nd St</a> and <a href="/schedule-repair">book same-day bench service</a>).`;

    case "pseo_links":
      return `Generate a contextual pSEO Internal Link & Next-Step section for this exact article topic:
- Start with <h2>Related Philadelphia Repair Services &amp; Guides</h2> and a short intro paragraph.
- Output a clean <ul> of 4–5 topic-relevant verified internal links (<a href="/verified-path">descriptive anchor text</a>) with 1-sentence value descriptions per link, plus a <a href="/schedule-repair">Book Same-Day Repair</a> CTA link. ONLY use paths from the Verified Internal Links whitelist.`;

    case "comparison_table":
      return `Generate an interactive technical comparison block specific to the exact device/issue in this article:
- Include a descriptive <h2> and a <table class="sfd-comparison-table"> with <thead> and <tbody> containing 4–6 concise, factual rows (e.g. failure diagnosis, repair tier, turnaround, warranty, and quality comparison).`;

    case "faq_block":
      return `Generate an AEO + FAQPage JSON-LD compatible FAQ section with 4–5 topic-specific user questions:
- Start with <h2>Frequently Asked Questions</h2>.
- Wrap each Q&A strictly in:
  <details class="sfd-faq-accordion"><summary class="sfd-faq-summary">Real customer question?</summary><div class="sfd-faq-answer">Direct 2–3 sentence technician answer mentioning Philadelphia walk-in service or real technical facts when helpful.</div></details>`;

    case "seo_optimize":
      return `Rewrite and upgrade the provided text (or existing section) for SEO + AEO + GEO + pSEO without drifting off-topic:
- Preserve the user's meaning while adding entity clarity, naturally integrating "${focusKw}", improving readability (short paragraphs/bullets), weaving in 1–2 relevant internal links from the verified whitelist if helpful, and reinforcing SmartFoneDoctor Philadelphia trust signals.`;

    case "expand":
      return `Expand the provided text (or current topic) into a detailed, authoritative technician section with clear <h3> subheadings, hardware diagnostics, and a structured checklist/steps list relevant ONLY to this article's device and issue.`;

    case "polish":
      return `Polish the provided text for clarity, authority, active voice, and customer trust while staying 100% focused on the article topic.`;

    case "grammar":
      return `Fix grammar, punctuation, spelling, awkward phrasing, and formatting in the provided text while preserving the exact HTML meaning and tags.`;

    case "shorten":
      return `Condense the provided text (or article excerpt) into crisp, high-impact bulleted Key Takeaways inside clean semantic HTML (<div class="sfd-callout sfd-callout-note">...<ul>...</ul>...</div>).`;

    case "cta":
      return `Write a high-converting SmartFoneDoctor Philadelphia repair booking callout (<div class="sfd-callout sfd-callout-tip">...</div>) tailored strictly to this article's repair topic, mentioning 33 S 52nd St & Lancaster Ave walk-ins, 90-day warranty, phone (215) 598-2090, and linking to <a href="/schedule-repair">Schedule Same-Day Repair</a>.`;

    case "custom":
      return `Follow the user's Custom Prompt closely while producing clean, accurate, on-topic semantic HTML for SmartFoneDoctor Philadelphia.`;
  }
}

export async function POST(req: NextRequest) {
  if (!(await getCurrentAdminAction())) {
    return NextResponse.json({ error: "Please sign in to the admin." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as ContentAiRequestPayload;
    const mode: ContentAiMode =
      body.mode && VALID_MODES.has(body.mode) ? body.mode : "full_article";

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
    const ctx = body.context || {};
    const topicTitle = ctx.title?.trim() || body.selectedText?.trim().slice(0, 80) || "Device Hardware Repair Guide";
    const focusKw =
      ctx.focusKeyword?.trim() ||
      topicTitle
        .replace(/\|.*$/, "")
        .replace(/[:–—].*$/, "")
        .trim()
        .slice(0, 60);

    const existingPlain = (ctx.existingHtml || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2200);

    const systemPrompt = `You are SmartFoneDoctor's Principal Hardware Repair Technical Writer and Search Strategist (SEO, AEO, GEO, and pSEO) in Philadelphia, PA.

BRAND & LOCAL ENTITY FACTS (GEO):
- Business: SmartFoneDoctor Philadelphia
- Stores: West Philadelphia Flagship at 33 S 52nd St, Philadelphia, PA 19139 (near 52nd St Market-Frankford El); University City stores at 4016 Lancaster Ave and 4060 Lancaster Ave, Philadelphia, PA 19104.
- Service Areas: West Philadelphia, University City (UPenn, Drexel, Penn Presbyterian), Center City, South Philly, Fishtown, Germantown, Overbrook, Cobbs Creek.
- Trust Guarantees: Free bench diagnostics, 20–45 minute standard repairs (same-day/24h for micro-soldering), OEM-spec parts, zero data erasure, 90-day parts & labor warranty. Phone: (215) 598-2090.

VERIFIED INTERNAL LINKS WHITELIST (NEVER invent URLs outside this list):
${VERIFIED_INTERNAL_LINKS.join("\n")}

STRICT ACCURACY & FORMATTING RULES:
1. Stay 100% locked onto the article's exact device & problem ("${topicTitle}" / category "${ctx.category || "Hardware Repair"}"). NEVER copy unrelated device text (e.g., never talk about iPhone screens/batteries inside a PS5 HDMI guide).
2. Return ONLY a single valid JSON object with exact shape:
{
  "html": "<clean semantic HTML fragment ready for RichTextEditor>",
  "suggestedExcerpt": "1-2 sentence compelling lead summary (120-155 chars)",
  "suggestedFocusKeyword": "2-5 word focus keyword matching title & URL",
  "suggestedTags": ["3 to 5 concise topic tags"],
  "estimatedReadTime": "X min read"
}
3. Inside "html", use ONLY semantic HTML tags (<p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <a>, <table>, <thead>, <tbody>, <tr>, <th>, <td>, <div>, <details>, <summary>, <blockquote>). NEVER emit <h1>, <script>, <style>, <html>, or <body>.`;

    const userPrompt = [
      `WRITING MODE: ${mode}`,
      `MODE INSTRUCTIONS:\n${getModeDirective(mode, focusKw)}`,
      `ARTICLE CONTEXT:`,
      `- Title: ${topicTitle}`,
      ctx.slug ? `- URL Slug: /blog/${ctx.slug}` : "",
      ctx.category ? `- Category: ${ctx.category}` : "",
      `- Focus Keyword: ${focusKw}`,
      ctx.excerpt ? `- Existing Excerpt: ${ctx.excerpt}` : "",
      body.selectedText?.trim() ? `\nSELECTED / INPUT TEXT:\n${body.selectedText.trim()}` : "",
      !body.selectedText?.trim() && existingPlain
        ? `\nEXISTING ARTICLE CONTEXT EXCERPT:\n${existingPlain}`
        : "",
      body.customPrompt?.trim() ? `\nCUSTOM USER DIRECTIVE:\n${body.customPrompt.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const aiRes =
      preferOpenAi || !geminiKey
        ? await runOpenAiContentJson(openaiKey, systemPrompt, userPrompt)
        : await runGeminiContentJson(geminiKey, systemPrompt, userPrompt);

    const parsed = parseJsonObject(aiRes.text);
    const rawHtml = typeof parsed.html === "string" ? parsed.html : "";
    const html = sanitizeGeneratedHtml(rawHtml);

    if (!html) {
      throw new Error("AI generated empty HTML content. Please try again.");
    }

    const rawTags = Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [];
    const tags = Array.from(
      new Set(rawTags.map((t) => String(t).trim()).filter(Boolean))
    ).slice(0, 6);

    return NextResponse.json({
      success: true,
      html,
      meta: {
        excerpt: typeof parsed.suggestedExcerpt === "string" ? parsed.suggestedExcerpt.trim() : undefined,
        focusKeyword:
          typeof parsed.suggestedFocusKeyword === "string"
            ? parsed.suggestedFocusKeyword.trim()
            : undefined,
        tags: tags.length > 0 ? tags : undefined,
        readTime:
          typeof parsed.estimatedReadTime === "string"
            ? parsed.estimatedReadTime.trim()
            : undefined,
      },
      provider: preferOpenAi || !geminiKey ? "openai" : "gemini",
      model: aiRes.model,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate AI content.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
