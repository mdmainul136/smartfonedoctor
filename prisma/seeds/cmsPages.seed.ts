import { PrismaClient, Prisma } from "@prisma/client";
import { INITIAL_CMS_PAGES } from "../../src/lib/cmsData";
import { compilePageCss } from "../../src/puck/style/compilePage";

const prisma = new PrismaClient();

export async function seedCmsPages() {
  console.log("🌱 [Seeder] Seeding CMS Pages & Pre-compiled Puck CSS...");

  for (const page of INITIAL_CMS_PAGES) {
    const puckContent = (page.puckData as { content?: unknown[] } | undefined)?.content;
    const compiledCss =
      page.compiledCss ||
      (Array.isArray(puckContent) && puckContent.length > 0
        ? compilePageCss(puckContent)
        : null);

    const data = {
      slug: page.slug,
      name: page.name,
      path: page.path,
      category: page.category,
      title: page.title,
      metaDesc: page.metaDesc || "",
      heroHeadline: page.heroHeadline || "",
      heroSubtitle: page.heroSubtitle || "",
      heroBadge: page.heroBadge || "",
      primaryCtaText: page.primaryCtaText || "",
      primaryCtaLink: page.primaryCtaLink || "",
      status: page.status,
      lastEdited: page.lastEdited || "Initial Seed",
      author: page.author || "System",
      contentHtml: page.contentHtml || null,
      compiledCss,
      focusKeyword: page.focusKeyword || null,
      keywords: page.keywords || [],
      featuredImage: page.featuredImage || null,
      canonicalUrl: page.canonicalUrl || null,
      schemaType: page.schemaType || "LocalBusiness",
      custom: !!page.custom,
      puckData: (page.puckData ?? Prisma.DbNull) as Prisma.InputJsonValue,
      puckEditedAt: page.puckEditedAt ? BigInt(page.puckEditedAt) : null,
    };

    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: data,
      create: {
        id: page.id,
        ...data,
      },
    });

    console.log(`  ✓ Synced page: "${page.name}" (${page.path}) [CSS: ${compiledCss ? `${compiledCss.length} bytes` : "None"}]`);
  }

  console.log("✅ [Seeder] CMS Pages seeded successfully.");
}

// Allow independent CLI execution: npx tsx prisma/seeds/cmsPages.seed.ts
if (require.main === module) {
  seedCmsPages()
    .catch((err) => {
      console.error("❌ Failed to seed CMS Pages:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
