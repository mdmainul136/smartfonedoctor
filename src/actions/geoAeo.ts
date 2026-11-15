"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
 * Fetch all AEO Brand Truth Guardrails
 */
export async function getAeoBrandGuardrailsAction() {
  try {
    const guardrails = await prisma.aeoBrandGuardrail.findMany({
      orderBy: { createdAt: "asc" },
    });
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
      return { success: true, guardrail: updated };
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
      return { success: true, guardrail: created };
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
 * Fetch all Simulated AEO Prompts
 */
export async function getAeoSimulatedPromptsAction() {
  try {
    const prompts = await prisma.aeoSimulatedPrompt.findMany({
      orderBy: { createdAt: "asc" },
    });
    return { success: true, prompts };
  } catch (err: unknown) {
    console.error("Failed to fetch simulated prompts:", err);
    return { success: false, prompts: [] };
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
