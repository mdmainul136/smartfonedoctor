"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  category: "General" | "Warranty" | "Pricing";
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Fetch all FAQs from PostgreSQL database
 */
export async function getFaqsAction(category?: string): Promise<ActionResponse<FaqItem[]>> {
  try {
    const whereClause: any = {};
    if (category && category !== "All") {
      whereClause.category = category;
    }

    const items = await prisma.faqs.findMany({
      where: whereClause,
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });

    const sanitized: FaqItem[] = items.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: (f.category as "General" | "Warranty" | "Pricing") || "General",
      order: f.order ? Number(f.order) : 0,
      createdAt: f.created_at?.toISOString(),
      updatedAt: f.updated_at?.toISOString(),
    }));

    return {
      success: true,
      data: sanitized,
    };
  } catch (error) {
    console.error("getFaqsAction error:", error);
    return {
      success: false,
      error: "Failed to retrieve FAQs from database.",
      data: [],
    };
  }
}

/**
 * Create a new FAQ in PostgreSQL
 */
export async function createFaqAction(data: {
  question: string;
  answer: string;
  category?: "General" | "Warranty" | "Pricing";
  order?: number;
}): Promise<ActionResponse<FaqItem>> {
  try {
    if (!data.question?.trim() || !data.answer?.trim()) {
      return {
        success: false,
        error: "Question and answer are required.",
      };
    }

    const count = await prisma.faqs.count();

    const created = await prisma.faqs.create({
      data: {
        question: data.question.trim(),
        answer: data.answer.trim(),
        category: data.category || "General",
        order: data.order ?? count + 1,
      },
    });

    revalidatePath("/faq");
    return {
      success: true,
      data: {
        id: created.id,
        question: created.question,
        answer: created.answer,
        category: (created.category as "General" | "Warranty" | "Pricing") || "General",
        order: created.order ? Number(created.order) : 0,
        createdAt: created.created_at.toISOString(),
        updatedAt: created.updated_at.toISOString(),
      },
      message: "FAQ created successfully.",
    };
  } catch (error) {
    console.error("createFaqAction error:", error);
    return {
      success: false,
      error: "Failed to create FAQ.",
    };
  }
}

/**
 * Update an existing FAQ
 */
export async function updateFaqAction(
  id: number,
  data: Partial<{
    question: string;
    answer: string;
    category: "General" | "Warranty" | "Pricing";
    order: number;
  }>
): Promise<ActionResponse<FaqItem>> {
  try {
    const updated = await prisma.faqs.update({
      where: { id },
      data: {
        ...(data.question ? { question: data.question.trim() } : {}),
        ...(data.answer ? { answer: data.answer.trim() } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.order !== undefined ? { order: data.order } : {}),
        updated_at: new Date(),
      },
    });

    revalidatePath("/faq");
    return {
      success: true,
      data: {
        id: updated.id,
        question: updated.question,
        answer: updated.answer,
        category: (updated.category as "General" | "Warranty" | "Pricing") || "General",
        order: updated.order ? Number(updated.order) : 0,
        createdAt: updated.created_at.toISOString(),
        updatedAt: updated.updated_at.toISOString(),
      },
      message: "FAQ updated successfully.",
    };
  } catch (error) {
    console.error("updateFaqAction error:", error);
    return {
      success: false,
      error: "Failed to update FAQ.",
    };
  }
}

/**
 * Delete a FAQ
 */
export async function deleteFaqAction(id: number): Promise<ActionResponse<{ id: number }>> {
  try {
    await prisma.faqs.delete({
      where: { id },
    });

    revalidatePath("/faq");
    return {
      success: true,
      data: { id },
      message: "FAQ deleted successfully.",
    };
  } catch (error) {
    console.error("deleteFaqAction error:", error);
    return {
      success: false,
      error: "Failed to delete FAQ.",
    };
  }
}
