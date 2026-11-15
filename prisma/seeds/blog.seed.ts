import { PrismaClient, Prisma } from "@prisma/client";
import { INITIAL_BLOG_ARTICLES } from "../../src/lib/blogData";

const prisma = new PrismaClient();

export async function seedBlog() {
  console.log("🌱 [Seeder] Seeding Blog Posts & Technical Repair Guides...");

  for (const art of INITIAL_BLOG_ARTICLES) {
    const data = {
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
    };

    await prisma.blogPost.upsert({
      where: { slug: art.slug },
      update: data,
      create: {
        id: art.id,
        ...data,
      },
    });

    console.log(`  ✓ Synced article: "${art.title}" (/blog/${art.slug})`);
  }

  console.log("✅ [Seeder] Blog posts seeded successfully.");
}

// Allow independent CLI execution: npx tsx prisma/seeds/blog.seed.ts
if (require.main === module) {
  seedBlog()
    .catch((err) => {
      console.error("❌ Failed to seed Blog:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
