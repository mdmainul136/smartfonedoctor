import { NextRequest, NextResponse } from "next/server";
import { localPuckHandler, type LocalAiProvider } from "@/puck/ai/localPuckHandler";
import type { PuckPageData } from "@/puck/types";
import { getCurrentAdminAction } from "@/actions/auth";

export async function GET() {
  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
  );
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  return NextResponse.json({
    hasServerKey: hasGemini || hasOpenAi,
    providers: {
      gemini: hasGemini,
      openai: hasOpenAi,
    },
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

    const result = await localPuckHandler({
      prompt: body.prompt || "",
      currentData: body.currentData,
      mode: body.mode || "edit",
      businessContext: body.businessContext,
      provider: body.provider,
      model: body.model,
      providerApiKey: body.providerApiKey,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to run local Puck AI handler.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

