"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminGuard";

export interface GeoNeighborhoodInput {
  id?: string;
  storeId: number;
  name: string;
  type: string;
  radius: string;
  zipCodes: string[];
  keyLandmarks: string[];
  status?: string;
}

export interface BrandGuardrailInput {
  id?: string;
  topic: string;
  claim: string;
  canonicalAnswer: string;
  sourcesVerified: string[];
  status?: string;
}

/**
 * Fetch all GEO Neighborhoods
 */
export async function getGeoNeighborhoodsAction(storeId?: number) {
  try {
    const where = storeId ? { storeId } : {};
    const neighborhoods = await prisma.geoNeighborhood.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });
    return { success: true, neighborhoods };
  } catch (err: unknown) {
    console.error("Failed to fetch geo neighborhoods:", err);
    return { success: false, neighborhoods: [], error: err instanceof Error ? err.message : "Database error" };
  }
}

/**
 * Upsert a GEO Neighborhood
 */
export async function upsertGeoNeighborhoodAction(input: GeoNeighborhoodInput) {
  try {
    await requireAdmin();
    if (input.id) {
      const updated = await prisma.geoNeighborhood.update({
        where: { id: input.id },
        data: {
          storeId: input.storeId,
          name: input.name,
          type: input.type,
          radius: input.radius,
          zipCodes: input.zipCodes,
          keyLandmarks: input.keyLandmarks,
          status: input.status || "Indexed",
        },
      });
      revalidatePath("/admin/listings/ai-visibility");
      revalidatePath("/llms.txt");
      return { success: true, neighborhood: updated };
    } else {
      const created = await prisma.geoNeighborhood.create({
        data: {
          storeId: input.storeId,
          name: input.name,
          type: input.type,
          radius: input.radius,
          zipCodes: input.zipCodes,
          keyLandmarks: input.keyLandmarks,
          status: input.status || "Indexed",
        },
      });
      revalidatePath("/admin/listings/ai-visibility");
      revalidatePath("/llms.txt");
      return { success: true, neighborhood: created };
    }
  } catch (err: unknown) {
    console.error("Failed to upsert geo neighborhood:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database mutation failed" };
  }
}

/**
 * Delete a GEO Neighborhood
 */
export async function deleteGeoNeighborhoodAction(id: string) {
  try {
    await requireAdmin();
    await prisma.geoNeighborhood.delete({ where: { id } });
    revalidatePath("/admin/listings/ai-visibility");
    revalidatePath("/llms.txt");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete geo neighborhood:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database delete failed" };
  }
}

/**
 * Helper to ensure plain objects cross the Server-Action boundary (stripping Decimal & Date prototypes)
 */
function serializeGuardrail<T extends { confidenceScore?: unknown }>(item: T): T & { confidenceScore: number | null } {
  if (!item) return item as T & { confidenceScore: number | null };
  return {
    ...item,
    confidenceScore: item.confidenceScore != null ? Number(item.confidenceScore) : 1.0,
  };
}

/**
 * Fetch all AEO Brand Truth Guardrails
 */
export async function getAeoBrandGuardrailsAction() {
  try {
    const rawGuardrails = await prisma.aeoBrandGuardrail.findMany({
      orderBy: { createdAt: "asc" },
    });
    const guardrails = rawGuardrails.map(serializeGuardrail);
    return { success: true, guardrails };
  } catch (err: unknown) {
    console.error("Failed to fetch AEO guardrails:", err);
    return { success: false, guardrails: [], error: err instanceof Error ? err.message : "Database error" };
  }
}

/**
 * Upsert an AEO Brand Truth Guardrail
 */
export async function upsertAeoBrandGuardrailAction(input: BrandGuardrailInput) {
  try {
    await requireAdmin();
    if (input.id) {
      const updated = await prisma.aeoBrandGuardrail.update({
        where: { id: input.id },
        data: {
          topic: input.topic,
          claim: input.claim,
          canonicalAnswer: input.canonicalAnswer,
          sourcesVerified: input.sourcesVerified,
          status: input.status || "Published to llms.txt",
        },
      });
      revalidatePath("/admin/listings/ai-visibility");
      revalidatePath("/llms.txt");
      return { success: true, guardrail: serializeGuardrail(updated) };
    } else {
      const created = await prisma.aeoBrandGuardrail.create({
        data: {
          topic: input.topic,
          claim: input.claim,
          canonicalAnswer: input.canonicalAnswer,
          sourcesVerified: input.sourcesVerified,
          status: input.status || "Published to llms.txt",
        },
      });
      revalidatePath("/admin/listings/ai-visibility");
      revalidatePath("/llms.txt");
      return { success: true, guardrail: serializeGuardrail(created) };
    }
  } catch (err: unknown) {
    console.error("Failed to upsert AEO guardrail:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database mutation failed" };
  }
}

/**
 * Delete an AEO Brand Truth Guardrail
 */
export async function deleteAeoBrandGuardrailAction(id: string) {
  try {
    await requireAdmin();
    await prisma.aeoBrandGuardrail.delete({ where: { id } });
    revalidatePath("/admin/listings/ai-visibility");
    revalidatePath("/llms.txt");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete AEO guardrail:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database delete failed" };
  }
}

/**
 * Fetch all Tracked AEO Prompts
 */
export async function getAeoSimulatedPromptsAction() {
  try {
    const prompts = await prisma.aeoSimulatedPrompt.findMany({
      orderBy: { createdAt: "asc" },
    });
    return { success: true, prompts };
  } catch (err: unknown) {
    console.error("Failed to fetch tracked prompts:", err);
    return { success: false, prompts: [] };
  }
}

export interface SimulatedPromptInput {
  id?: string;
  queryTemplate: string;
  intent: string;
  category: string;
  expectedCitation?: string;
  verifiedStatus?: string;
  storeId?: number;
}

/**
 * Upsert a tracked AEO prompt
 */
export async function upsertAeoSimulatedPromptAction(input: SimulatedPromptInput) {
  try {
    await requireAdmin();
    if (input.id) {
      const updated = await prisma.aeoSimulatedPrompt.update({
        where: { id: input.id },
        data: {
          queryTemplate: input.queryTemplate,
          intent: input.intent,
          category: input.category,
          expectedCitation: input.expectedCitation || "SmartFoneDoctor",
          verifiedStatus: input.verifiedStatus || "Not Probed",
          storeId: input.storeId || 1,
        },
      });
      revalidatePath("/admin/listings/ai-visibility");
      return { success: true, prompt: updated };
    } else {
      const created = await prisma.aeoSimulatedPrompt.create({
        data: {
          queryTemplate: input.queryTemplate,
          intent: input.intent,
          category: input.category,
          expectedCitation: input.expectedCitation || "SmartFoneDoctor",
          verifiedStatus: input.verifiedStatus || "Not Probed",
          storeId: input.storeId || 1,
        },
      });
      revalidatePath("/admin/listings/ai-visibility");
      return { success: true, prompt: created };
    }
  } catch (err: unknown) {
    console.error("Failed to upsert prompt:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database mutation failed" };
  }
}

/**
 * Delete a tracked AEO prompt
 */
export async function deleteAeoSimulatedPromptAction(id: string) {
  try {
    await requireAdmin();
    await prisma.aeoSimulatedPrompt.delete({ where: { id } });
    revalidatePath("/admin/listings/ai-visibility");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete prompt:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database delete failed" };
  }
}

/**
 * Fetch Knowledge Graph Entity (Wikidata & Google KG IDs)
 */
export async function getKnowledgeGraphEntityAction() {
  try {
    const entity = await prisma.knowledgeGraphEntity.findUnique({
      where: { id: "sfd_knowledge_entity" },
    });
    return { success: true, entity };
  } catch (err: unknown) {
    console.error("Failed to fetch knowledge graph entity:", err);
    return { success: false, entity: null };
  }
}

export interface KnowledgeGraphInput {
  wikidataId?: string;
  googleKnowledgeGraphId?: string;
  sameAsUrls?: string[];
  primaryTopic?: string;
  jurisdiction?: string;
}

/**
 * Update Knowledge Graph Entity (Wikidata & Google KG IDs — never injects placeholder IDs)
 */
export async function updateKnowledgeGraphEntityAction(input: KnowledgeGraphInput) {
  try {
    await requireAdmin();
    const cleanWikidata = input.wikidataId?.trim() || null;
    const cleanGoogleKg = input.googleKnowledgeGraphId?.trim() || null;

    const updated = await prisma.knowledgeGraphEntity.upsert({
      where: { id: "sfd_knowledge_entity" },
      update: {
        wikidataId: cleanWikidata,
        googleKnowledgeGraphId: cleanGoogleKg,
        sameAsUrls: input.sameAsUrls,
        ...(input.primaryTopic ? { primaryTopic: input.primaryTopic } : {}),
        ...(input.jurisdiction ? { jurisdiction: input.jurisdiction } : {}),
      },
      create: {
        id: "sfd_knowledge_entity",
        wikidataId: cleanWikidata,
        googleKnowledgeGraphId: cleanGoogleKg,
        sameAsUrls: input.sameAsUrls || [],
        primaryTopic: input.primaryTopic || "Consumer Electronics Repair Service",
        jurisdiction: input.jurisdiction || "Philadelphia, Pennsylvania, United States",
      },
    });
    revalidatePath("/admin/listings/ai-visibility");
    revalidatePath("/llms.txt");
    return { success: true, entity: updated };
  } catch (err: unknown) {
    console.error("Failed to update knowledge graph entity:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export interface LiveVisibilityAuditResult {
  success: boolean;
  checkedAt: string;
  siteUrl: string;
  robots: {
    ok: boolean;
    status: number;
    allowedBots: string[];
    content: string;
  };
  sitemap: {
    ok: boolean;
    status: number;
    urlCount: number;
  };
  llmsTxt: {
    ok: boolean;
    status: number;
    bytes: number;
    content: string;
  };
  llmsFullTxt: {
    ok: boolean;
    status: number;
    bytes: number;
  };
  schema: {
    ok: boolean;
    homepageStatus: number;
    locationPageStatus: number;
    types: string[];
    sameAsCount: number;
    sampleJsonLd: string;
  };
  aiProviders: {
    geminiConfigured: boolean;
    openaiConfigured: boolean;
    defaultProvider: string;
  };
  dbCounts: {
    neighborhoods: number;
    guardrails: number;
    gmbPosts: number;
    sameAsUrlsCount: number;
    hasWikidataId: boolean;
    hasGoogleKgId: boolean;
  };
  error?: string;
}

const KNOWN_AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "Google-Extended",
  "Applebot-Extended",
  "PerplexityBot",
  "ClaudeBot",
];

function extractJsonLdBlocks(html: string): {
  types: string[];
  sameAsCount: number;
  sampleJsonLd: string;
} {
  const types = new Set<string>();
  let sameAsCount = 0;
  let sampleJsonLd = "";

  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  const inspectNode = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(inspectNode);
      return;
    }
    const obj = node as Record<string, unknown>;
    const rawType = obj["@type"];
    if (typeof rawType === "string") types.add(rawType);
    else if (Array.isArray(rawType)) {
      rawType.forEach((t) => typeof t === "string" && types.add(t));
    }
    if (Array.isArray(obj.sameAs)) {
      sameAsCount = Math.max(sameAsCount, obj.sameAs.length);
    }
    if (Array.isArray(obj["@graph"])) {
      obj["@graph"].forEach(inspectNode);
    }
  };

  while ((match = scriptRegex.exec(html)) !== null) {
    const rawJson = match[1]?.trim();
    if (!rawJson) continue;
    try {
      const parsed = JSON.parse(rawJson);
      inspectNode(parsed);
      if (!sampleJsonLd && (rawJson.includes("LocalBusiness") || rawJson.includes("ElectronicsStore"))) {
        sampleJsonLd = JSON.stringify(parsed, null, 2);
      }
    } catch {
      // Skip malformed JSON-LD block
    }
  }

  return { types: Array.from(types), sameAsCount, sampleJsonLd };
}

async function fetchLiveText(url: string): Promise<{ ok: boolean; status: number; text: string }> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
      headers: { "User-Agent": "SmartFoneDoctor-LiveAudit/1.0" },
    });
    const text = res.ok ? await res.text() : "";
    return { ok: res.ok, status: res.status, text };
  } catch {
    return { ok: false, status: 0, text: "" };
  }
}

/**
 * Perform real live HTTP probes against smartfonedoctor.com and read live PostgreSQL configuration.
 */
export async function runLiveVisibilityAuditAction(): Promise<LiveVisibilityAuditResult> {
  try {
    await requireAdmin();
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com").replace(
      /\/$/,
      ""
    );

    const [
      robotsRes,
      sitemapRes,
      llmsRes,
      llmsFullRes,
      homeRes,
      locRes,
      neighborhoods,
      guardrails,
      gmbPosts,
      kgEntity,
      settings,
    ] = await Promise.all([
      fetchLiveText(`${siteUrl}/robots.txt`),
      fetchLiveText(`${siteUrl}/sitemap.xml`),
      fetchLiveText(`${siteUrl}/llms.txt`),
      fetchLiveText(`${siteUrl}/llms-full.txt`),
      fetchLiveText(`${siteUrl}/`),
      fetchLiveText(`${siteUrl}/locations/west-philadelphia-52nd-st`),
      prisma.geoNeighborhood.count(),
      prisma.aeoBrandGuardrail.count(),
      prisma.gmbPost.count(),
      prisma.knowledgeGraphEntity.findUnique({ where: { id: "sfd_knowledge_entity" } }),
      prisma.appSystemSettings.findUnique({ where: { id: "global_config" } }),
    ]);

    const allowedBots = robotsRes.ok
      ? KNOWN_AI_BOTS.filter((bot) => {
          const idx = robotsRes.text.indexOf(bot);
          if (idx === -1) return robotsRes.text.includes("User-agent: *") && !robotsRes.text.includes(`Disallow: /\n`);
          const slice = robotsRes.text.slice(idx, idx + 120);
          return !slice.includes("Disallow: /");
        })
      : [];

    const urlMatches = sitemapRes.ok ? sitemapRes.text.match(/<url>/gi) : null;
    const urlCount = urlMatches ? urlMatches.length : 0;

    const homeSchema = homeRes.ok ? extractJsonLdBlocks(homeRes.text) : { types: [], sameAsCount: 0, sampleJsonLd: "" };
    const locSchema = locRes.ok ? extractJsonLdBlocks(locRes.text) : { types: [], sameAsCount: 0, sampleJsonLd: "" };
    const combinedTypes = Array.from(new Set([...homeSchema.types, ...locSchema.types]));

    const geminiConfigured = Boolean(
      settings?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY?.trim()
    );
    const openaiConfigured = Boolean(
      settings?.openaiApiKey?.trim() || process.env.OPENAI_API_KEY?.trim()
    );

    return {
      success: true,
      checkedAt: new Date().toISOString(),
      siteUrl,
      robots: {
        ok: robotsRes.ok,
        status: robotsRes.status,
        allowedBots,
        content: robotsRes.text,
      },
      sitemap: {
        ok: sitemapRes.ok,
        status: sitemapRes.status,
        urlCount,
      },
      llmsTxt: {
        ok: llmsRes.ok,
        status: llmsRes.status,
        bytes: Buffer.byteLength(llmsRes.text, "utf8"),
        content: llmsRes.text,
      },
      llmsFullTxt: {
        ok: llmsFullRes.ok,
        status: llmsFullRes.status,
        bytes: Buffer.byteLength(llmsFullRes.text, "utf8"),
      },
      schema: {
        ok: combinedTypes.length > 0,
        homepageStatus: homeRes.status,
        locationPageStatus: locRes.status,
        types: combinedTypes,
        sameAsCount: Math.max(homeSchema.sameAsCount, locSchema.sameAsCount),
        sampleJsonLd: locSchema.sampleJsonLd || homeSchema.sampleJsonLd,
      },
      aiProviders: {
        geminiConfigured,
        openaiConfigured,
        defaultProvider: settings?.defaultAiProvider || "gemini",
      },
      dbCounts: {
        neighborhoods,
        guardrails,
        gmbPosts,
        sameAsUrlsCount: kgEntity?.sameAsUrls?.length ?? 0,
        hasWikidataId: Boolean(kgEntity?.wikidataId?.trim()),
        hasGoogleKgId: Boolean(kgEntity?.googleKnowledgeGraphId?.trim()),
      },
    };
  } catch (err: unknown) {
    console.error("runLiveVisibilityAuditAction failed:", err);
    return {
      success: false,
      checkedAt: new Date().toISOString(),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com",
      robots: { ok: false, status: 0, allowedBots: [], content: "" },
      sitemap: { ok: false, status: 0, urlCount: 0 },
      llmsTxt: { ok: false, status: 0, bytes: 0, content: "" },
      llmsFullTxt: { ok: false, status: 0, bytes: 0 },
      schema: { ok: false, homepageStatus: 0, locationPageStatus: 0, types: [], sameAsCount: 0, sampleJsonLd: "" },
      aiProviders: { geminiConfigured: false, openaiConfigured: false, defaultProvider: "gemini" },
      dbCounts: {
        neighborhoods: 0,
        guardrails: 0,
        gmbPosts: 0,
        sameAsUrlsCount: 0,
        hasWikidataId: false,
        hasGoogleKgId: false,
      },
      error: err instanceof Error ? err.message : "Live visibility audit failed",
    };
  }
}

export interface LiveAiProbeResult {
  success: boolean;
  needsApiKey?: boolean;
  engine: string;
  isLiveApi: boolean;
  cited: boolean;
  citationRank: string;
  confidenceScore: number;
  generatedAnswer: string;
  sourcesReferenced: string[];
  matchedTopic?: string;
  verifiedAt: string;
  error?: string;
}

function detectBrandMention(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("smartfonedoctor") ||
    lower.includes("smart fone doctor") ||
    lower.includes("smartfonedoctor.com") ||
    lower.includes("33 s 52nd") ||
    lower.includes("4016 lancaster") ||
    lower.includes("4060 lancaster")
  );
}

/**
 * Run a real live AI Visibility Probe against Google Gemini or OpenAI APIs.
 * Never returns simulated citations when API keys are missing or calls fail.
 */
export async function probeLiveAiVisibilityAction(
  promptQuery: string,
  _storeId: number = 1,
  promptRecordId?: string
): Promise<LiveAiProbeResult> {
  const nowStr = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  try {
    await requireAdmin();
    const settings = await prisma.appSystemSettings.findUnique({
      where: { id: "global_config" },
    });

    const geminiKey =
      settings?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
    const openaiKey =
      settings?.openaiApiKey?.trim() || process.env.OPENAI_API_KEY?.trim();

    if (!geminiKey && !openaiKey) {
      return {
        success: false,
        needsApiKey: true,
        engine: "Not Configured",
        isLiveApi: false,
        cited: false,
        citationRank: "API Key Required",
        confidenceScore: 0,
        generatedAnswer: "",
        sourcesReferenced: [],
        verifiedAt: nowStr,
        error:
          "No live AI API key is configured. Add GEMINI_API_KEY or OPENAI_API_KEY in Admin Settings (or .env) to run real AI visibility probes.",
      };
    }

    const preferOpenAi =
      settings?.defaultAiProvider === "openai" && Boolean(openaiKey);
    const searchPrompt = `Answer this customer search query about phone, computer, or console repair in Philadelphia, PA concisely (under 100 words), recommending real businesses you find or know:\n\n"${promptQuery}"`;

    if (!preferOpenAi && geminiKey) {
      let lastGeminiError = "";
      for (const model of ["gemini-2.5-flash", "gemini-2.0-flash"]) {
        for (const useSearchTool of [true, false]) {
          const payload: Record<string, unknown> = {
            contents: [{ role: "user", parts: [{ text: searchPrompt }] }],
            generationConfig: { maxOutputTokens: 260, temperature: 0.2 },
          };
          if (useSearchTool) {
            payload.tools = [{ google_search: {} }];
          }

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
              geminiKey
            )}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              cache: "no-store",
              signal: AbortSignal.timeout(12000),
            }
          ).catch(() => null);

          if (!response) {
            lastGeminiError = `Network error reaching Gemini API (${model})`;
            continue;
          }

          const data = (await response.json().catch(() => ({}))) as {
            error?: { message?: string };
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
              groundingMetadata?: {
                groundingChunks?: Array<{ web?: { title?: string; uri?: string } }>;
              };
            }>;
          };

          if (!response.ok) {
            lastGeminiError = data.error?.message || `Gemini HTTP ${response.status}`;
            continue;
          }

          const text =
            data.candidates?.[0]?.content?.parts
              ?.map((p) => p.text || "")
              .join(" ")
              .trim() || "";

          if (!text) continue;

          const cited = detectBrandMention(text);
          const groundingSources = (
            data.candidates?.[0]?.groundingMetadata?.groundingChunks || []
          )
            .map((c) => c.web?.title || c.web?.uri)
            .filter((s): s is string => Boolean(s));

          const engineLabel = `${model} (${
            useSearchTool && groundingSources.length > 0
              ? "Live Search Grounding"
              : "Live API"
          })`;

          if (promptRecordId) {
            await prisma.aeoSimulatedPrompt
              .update({
                where: { id: promptRecordId },
                data: {
                  verifiedStatus: cited ? "Cited" : "Not Cited",
                  expectedCitation: `Live API (${engineLabel})`,
                },
              })
              .catch(() => {});
          }

          return {
            success: true,
            engine: engineLabel,
            isLiveApi: true,
            cited,
            citationRank: cited ? "Cited in Live Response" : "Not Cited",
            confidenceScore: cited ? 1 : 0,
            generatedAnswer: text,
            sourcesReferenced: groundingSources,
            verifiedAt: nowStr,
          };
        }
      }

      if (!openaiKey) {
        return {
          success: false,
          engine: "Google Gemini API",
          isLiveApi: false,
          cited: false,
          citationRank: "API Error",
          confidenceScore: 0,
          generatedAnswer: "",
          sourcesReferenced: [],
          verifiedAt: nowStr,
          error: lastGeminiError || "Live Gemini API probe failed.",
        };
      }
    }

    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: searchPrompt }],
          max_tokens: 240,
          temperature: 0.2,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      });

      const json = (await res.json().catch(() => ({}))) as {
        error?: { message?: string };
        choices?: Array<{ message?: { content?: string } }>;
      };

      if (!res.ok) {
        return {
          success: false,
          engine: "OpenAI GPT-4o-mini",
          isLiveApi: false,
          cited: false,
          citationRank: "API Error",
          confidenceScore: 0,
          generatedAnswer: "",
          sourcesReferenced: [],
          verifiedAt: nowStr,
          error: json.error?.message || `OpenAI HTTP ${res.status}`,
        };
      }

      const text = json.choices?.[0]?.message?.content?.trim() || "";
      const cited = detectBrandMention(text);
      const engineLabel = "OpenAI GPT-4o-mini (Live API)";

      if (promptRecordId) {
        await prisma.aeoSimulatedPrompt
          .update({
            where: { id: promptRecordId },
            data: {
              verifiedStatus: cited ? "Cited" : "Not Cited",
              expectedCitation: `Live API (${engineLabel})`,
            },
          })
          .catch(() => {});
      }

      return {
        success: true,
        engine: engineLabel,
        isLiveApi: true,
        cited,
        citationRank: cited ? "Cited in Live Response" : "Not Cited",
        confidenceScore: cited ? 1 : 0,
        generatedAnswer: text,
        sourcesReferenced: [],
        verifiedAt: nowStr,
      };
    }

    return {
      success: false,
      needsApiKey: true,
      engine: "Not Configured",
      isLiveApi: false,
      cited: false,
      citationRank: "API Key Required",
      confidenceScore: 0,
      generatedAnswer: "",
      sourcesReferenced: [],
      verifiedAt: nowStr,
      error: "No usable Gemini or OpenAI response received.",
    };
  } catch (err: unknown) {
    console.error("AI visibility probe error:", err);
    return {
      success: false,
      engine: "Live AI Probe",
      isLiveApi: false,
      cited: false,
      citationRank: "Error",
      confidenceScore: 0,
      generatedAnswer: "",
      sourcesReferenced: [],
      verifiedAt: nowStr,
      error: err instanceof Error ? err.message : "Failed to run AI visibility probe",
    };
  }
}
