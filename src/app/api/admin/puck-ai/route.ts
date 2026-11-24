import { NextRequest, NextResponse } from "next/server";
import { localPuckHandler, type LocalAiProvider } from "@/puck/ai/localPuckHandler";
import type { PuckPageData } from "@/puck/types";
import { getCurrentAdminAction } from "@/actions/auth";
import prisma from "@/lib/prisma";
import {
  listAvailableGeminiModels,
  listAvailableOpenAiModels,
  type AvailableAiModel,
} from "@/puck/ai/geminiModels";

async function readDbAiSettings() {
  return prisma.appSystemSettings
    .findUnique({
      where: { id: "global_config" },
      select: { geminiApiKey: true, openaiApiKey: true, defaultAiProvider: true },
    })
    .catch(() => null);
}

export async function GET(req: NextRequest) {
  const dbSettings = await readDbAiSettings();
  const dbGemini = dbSettings?.geminiApiKey?.trim() || "";
  const dbOpenAi = dbSettings?.openaiApiKey?.trim() || "";
  const envGemini = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
  const envOpenAi = process.env.OPENAI_API_KEY || "";

  const hasGemini = Boolean(dbGemini || envGemini);
  const hasOpenAi = Boolean(dbOpenAi || envOpenAi);

  const wantsModels = req.nextUrl.searchParams.get("models") === "1";
  if (!wantsModels) {
    return NextResponse.json({
      hasServerKey: hasGemini || hasOpenAi,
      providers: {
        gemini: hasGemini,
        openai: hasOpenAi,
      },
    });
  }

  if (!(await getCurrentAdminAction())) {
    return NextResponse.json({
      hasServerKey: hasGemini || hasOpenAi,
      providers: { gemini: hasGemini, openai: hasOpenAi },
      models: [] as AvailableAiModel[],
    });
  }

  const requestedProvider = req.nextUrl.searchParams.get("provider");
  const targetProvider: LocalAiProvider =
    requestedProvider === "openai"
      ? "openai"
      : requestedProvider === "gemini"
      ? "gemini"
      : dbSettings?.defaultAiProvider === "openai"
      ? "openai"
      : "gemini";

  const customKey = req.headers.get("x-ai-api-key")?.trim() || "";
  const apiKey =
    customKey ||
    (targetProvider === "openai" ? dbOpenAi || envOpenAi : dbGemini || envGemini);

  const models = apiKey
    ? targetProvider === "openai"
      ? await listAvailableOpenAiModels(apiKey)
      : await listAvailableGeminiModels(apiKey)
    : [];

  return NextResponse.json({
    hasServerKey: hasGemini || hasOpenAi,
    providers: {
      gemini: hasGemini,
      openai: hasOpenAi,
    },
    provider: targetProvider,
    models,
  });
}

export async function POST(req: NextRequest) {
  // Uses the server's AI keys: admins only.
  if (!(await getCurrentAdminAction())) {
    return NextResponse.json({ error: "Please sign in to the admin." }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      prompt?: string;
      currentData?: PuckPageData;
      mode?: "generate" | "edit";
      businessContext?: string;
      provider?: LocalAiProvider;
      model?: string;
      providerApiKey?: string;
    };

    let resolvedProvider = body.provider;
    let resolvedKey = body.providerApiKey?.trim() || undefined;

    if (!resolvedKey) {
      const dbSettings = await readDbAiSettings();
      const targetProvider =
        resolvedProvider ||
        (dbSettings?.defaultAiProvider === "openai" ? "openai" : "gemini");
      const dbKey =
        targetProvider === "openai"
          ? dbSettings?.openaiApiKey?.trim()
          : dbSettings?.geminiApiKey?.trim();
      if (dbKey) {
        resolvedKey = dbKey;
        resolvedProvider = targetProvider;
      }
    }

    const result = await localPuckHandler({
      prompt: body.prompt || "",
      currentData: body.currentData,
      mode: body.mode || "edit",
      businessContext: body.businessContext,
      provider: resolvedProvider,
      model: body.model,
      providerApiKey: resolvedKey,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to run local Puck AI handler.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

