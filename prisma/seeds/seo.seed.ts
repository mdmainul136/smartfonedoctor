import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedSeoMetadata() {
  console.log("🌱 [Seeder] Seeding Plugin-Style SEO Metadata for Pages & Blog Posts...");

  // 1. Seed SEO Metadata for CMS Pages
  const pages = await prisma.cmsPage.findMany();
  for (const page of pages) {
    const metaTitle = page.title || `${page.name} | SmartFoneDoctor`;
    const metaDesc = page.metaDesc || page.heroSubtitle || "Professional electronics repair services in Philadelphia, PA.";
    const canonical = page.canonicalUrl || `https://smartfonedoctor.com${page.path === "/" ? "" : page.path}`;

    await prisma.seoMetadata.upsert({
      where: { pageId: page.id },
      update: {
        metaTitle,
        metaDescription: metaDesc,
        focusKeyword: page.focusKeyword,
        keywords: page.keywords,
        canonicalUrl: canonical,
        ogTitle: metaTitle,
        ogDescription: metaDesc,
        ogImage: page.featuredImage || "/logo-png.jpg",
        twitterCard: "summary_large_image",
        schemaType: page.schemaType || "LocalBusiness",
        robotsIndex: true,
        robotsFollow: true,
        score: 94,
        sitemapPriority: new Prisma.Decimal(page.path === "/" ? 1.0 : 0.8),
        changeFrequency: page.path === "/" ? "daily" : "weekly",
      },
      create: {
        pageId: page.id,
        metaTitle,
        metaDescription: metaDesc,
        focusKeyword: page.focusKeyword,
        keywords: page.keywords,
        canonicalUrl: canonical,
        ogTitle: metaTitle,
        ogDescription: metaDesc,
        ogImage: page.featuredImage || "/logo-png.jpg",
        twitterCard: "summary_large_image",
        schemaType: page.schemaType || "LocalBusiness",
        robotsIndex: true,
        robotsFollow: true,
        score: 94,
        sitemapPriority: new Prisma.Decimal(page.path === "/" ? 1.0 : 0.8),
        changeFrequency: page.path === "/" ? "daily" : "weekly",
      },
    });
    console.log(`  ✓ Synced SEO plugin metadata for page: "${page.name}" (${canonical})`);
  }

  // 2. Seed SEO Metadata for Blog Posts
  const posts = await prisma.blogPost.findMany();
  for (const post of posts) {
    const metaTitle = `${post.title} | SmartFoneDoctor Repair Guides`;
    const metaDesc = post.excerpt || "Comprehensive step-by-step troubleshooting and repair guide.";
    const canonical = `https://smartfonedoctor.com/blog/${post.slug}`;

    await prisma.seoMetadata.upsert({
      where: { postId: post.id },
      update: {
        metaTitle,
        metaDescription: metaDesc,
        focusKeyword: post.focusKeyword,
        canonicalUrl: canonical,
        ogTitle: metaTitle,
        ogDescription: metaDesc,
        ogImage: post.featuredImage || "/logo-png.jpg",
        twitterCard: "summary_large_image",
        schemaType: "TechArticle",
        robotsIndex: true,
        robotsFollow: true,
        score: 91,
        sitemapPriority: new Prisma.Decimal(0.7),
        changeFrequency: "monthly",
      },
      create: {
        postId: post.id,
        metaTitle,
        metaDescription: metaDesc,
        focusKeyword: post.focusKeyword,
        canonicalUrl: canonical,
        ogTitle: metaTitle,
        ogDescription: metaDesc,
        ogImage: post.featuredImage || "/logo-png.jpg",
        twitterCard: "summary_large_image",
        schemaType: "TechArticle",
        robotsIndex: true,
        robotsFollow: true,
        score: 91,
        sitemapPriority: new Prisma.Decimal(0.7),
        changeFrequency: "monthly",
      },
    });
    console.log(`  ✓ Synced SEO plugin metadata for blog post: "${post.title}"`);
  }

  console.log("✅ [Seeder] SEO Metadata seeded successfully.");
}

// Allow independent CLI execution: npx tsx prisma/seeds/seo.seed.ts
if (require.main === module) {
  seedSeoMetadata()
    .catch((err) => {
      console.error("❌ Failed to seed SEO metadata:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
