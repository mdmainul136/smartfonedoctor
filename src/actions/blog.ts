"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { INITIAL_BLOG_ARTICLES, type BlogArticle } from "@/lib/blogData";

/** Convert a database row to the typed BlogArticle model */
function rowToBlogArticle(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  author: string;
  status: string;
  featuredImage: string | null;
  focusKeyword: string | null;
  schemaType: string | null;
  articleData: unknown;
  createdAt: Date;
  updatedAt: Date;
}): BlogArticle {
  const data = (row.articleData as Record<string, unknown>) || {};

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || (data.excerpt as string) || "",
    categoryId: (data.categoryId as string) || "cat-iphone",
    categoryName: row.category || (data.categoryName as string) || "Hardware Guides",
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : ["Repair", "Guide"],
    featuredImage: row.featuredImage || (data.featuredImage as string) || "/images/blog/default.jpg",
    author: (data.author as BlogArticle["author"]) || {
      name: row.author,
      role: "Lead Hardware Diagnostic Technician",
    },
    publishedAt: (data.publishedAt as string) || row.createdAt.toISOString().split("T")[0],
    readTime: (data.readTime as string) || "4 min read",
    status: (row.status as BlogArticle["status"]) || "Published",
    contentHtml: row.content,
    sections: Array.isArray(data.sections) ? (data.sections as BlogArticle["sections"]) : [],
    seo: (data.seo as BlogArticle["seo"]) || {
      metaTitle: row.title,
      metaDescription: row.excerpt || "",
      focusKeyword: row.focusKeyword || undefined,
    },
    connectedService: data.connectedService as BlogArticle["connectedService"] | undefined,
  };
}

/** Ensure initial seed blog articles exist in PostgreSQL */
async function ensureSeededBlogArticles(): Promise<void> {
  const count = await prisma.blogPost.count();
  if (count > 0) return;

  for (const art of INITIAL_BLOG_ARTICLES) {
    await prisma.blogPost.create({
      data: {
        id: art.id,
        slug: art.slug,
        title: art.title,
        excerpt: art.excerpt,
        content: art.contentHtml || "",
        category: art.categoryName,
        author: art.author.name,
        status: art.status,
        featuredImage: art.featuredImage,
        focusKeyword: art.seo?.focusKeyword || null,
        schemaType: "TechArticle",
        articleData: art as unknown as Prisma.InputJsonValue,
      },
    });
  }
}

/** Server Action: Get all blog posts from PostgreSQL */
export async function getBlogPostsAction(): Promise<{
  success: boolean;
  articles: BlogArticle[];
  error?: string;
}> {
  try {
    await ensureSeededBlogArticles();

    const rows = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      articles: rows.map(rowToBlogArticle),
    };
  } catch (err) {
    console.error("[getBlogPostsAction] Error:", err);
    return {
      success: false,
      articles: INITIAL_BLOG_ARTICLES,
      error: err instanceof Error ? err.message : "Failed to load blog posts",
    };
  }
}

/** Server Action: Get a single blog post by slug from PostgreSQL */
export async function getBlogPostBySlugAction(slug: string): Promise<{
  success: boolean;
  article: BlogArticle | null;
  error?: string;
}> {
  try {
    await ensureSeededBlogArticles();

    const row = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (row) {
      return { success: true, article: rowToBlogArticle(row) };
    }

    const fallback = INITIAL_BLOG_ARTICLES.find((a) => a.slug === slug) || null;
    return { success: true, article: fallback };
  } catch (err) {
    console.error("[getBlogPostBySlugAction] Error:", err);
    const fallback = INITIAL_BLOG_ARTICLES.find((a) => a.slug === slug) || null;
    return {
      success: false,
      article: fallback,
      error: err instanceof Error ? err.message : "Failed to load blog post",
    };
  }
}

/** Server Action: Upsert a blog post in PostgreSQL */
export async function upsertBlogPostAction(article: BlogArticle): Promise<{
  success: boolean;
  article?: BlogArticle;
  error?: string;
}> {
  try {
    const data = {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt || "",
      content: article.contentHtml || "",
      category: article.categoryName || "Hardware Guides",
      author: article.author?.name || "Certified Technician",
      status: article.status,
      featuredImage: article.featuredImage || null,
      focusKeyword: article.seo?.focusKeyword || null,
      schemaType: "TechArticle",
      articleData: article as unknown as Prisma.InputJsonValue,
    };

    const saved = await prisma.blogPost.upsert({
      where: { slug: article.slug },
      update: data,
      create: {
        id: article.id,
        ...data,
      },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${article.slug}`);
    revalidatePath("/admin/blog");

    return { success: true, article: rowToBlogArticle(saved) };
  } catch (err) {
    console.error("[upsertBlogPostAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save blog post to database",
    };
  }
}

/** Server Action: Delete a blog post from PostgreSQL */
export async function deleteBlogPostAction(idOrSlug: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!post) {
      return { success: false, error: "Blog post not found" };
    }

    await prisma.blogPost.delete({
      where: { id: post.id },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/admin/blog");

    return { success: true };
  } catch (err) {
    console.error("[deleteBlogPostAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete blog post",
    };
  }
}
