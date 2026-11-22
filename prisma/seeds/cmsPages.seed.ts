import { PrismaClient, Prisma } from "@prisma/client";
import { INITIAL_CMS_PAGES } from "../../src/lib/cmsData";
import { compilePageCss } from "../../src/puck/style/compilePage";

const prisma = new PrismaClient();

const PUBLISHED_SEO_DEFAULTS: Record<
  string,
  { title?: string; metaDesc?: string; featuredImage?: string }
> = {
  home: {
    featuredImage:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&auto=format&fit=crop&q=80",
  },
  repairs: {
    title: "Same-Day Device Repair Philadelphia | SmartFoneDoctor",
    metaDesc:
      "Walk-in repair in Philadelphia for iPhone, Samsung, iPad, MacBook & game consoles. 30-minute screen replacements, battery service, and a 90-day warranty.",
    featuredImage:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&auto=format&fit=crop&q=80",
  },
  "repairs-smartphone": {
    title: "Phone Repair in Philadelphia | iPhone, Samsung & Pixel",
    metaDesc:
      "Same-day phone repair in Philadelphia for iPhone, Samsung Galaxy & Google Pixel. Screen, battery, charging port, back glass & water damage with 90-day warranty.",
    featuredImage:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&auto=format&fit=crop&q=80",
  },
  "repairs-tablet": {
    title: "iPad & Tablet Repair in Philadelphia | SmartFoneDoctor",
    metaDesc:
      "Fast tablet repair in Philadelphia for iPad, Galaxy Tab, Pixel Tablet & Surface. Screen, battery, charging port and water damage with a 90-day warranty.",
    featuredImage:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&auto=format&fit=crop&q=80",
  },
  "repairs-computer": {
    title: "Computer & MacBook Repair Philadelphia | SmartFoneDoctor",
    metaDesc:
      "MacBook, iMac and Windows laptop repair in Philadelphia. Screens, batteries, keyboards, liquid damage and SSD upgrades with free diagnostics & 90-day warranty.",
    featuredImage:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80",
  },
  "repairs-console": {
    title: "Game Console Repair Philadelphia | PS5, Xbox & Switch",
    featuredImage:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&auto=format&fit=crop&q=80",
  },
  "schedule-repair": {
    title: "Schedule Device Repair Online | SmartFoneDoctor Philly",
    featuredImage:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&auto=format&fit=crop&q=80",
  },
  review: {
    title: "Customer Reviews & Ratings | SmartFoneDoctor Philly",
    metaDesc:
      "Read 420+ verified 5-star customer reviews across our 3 Philadelphia repair centers (52nd St & Lancaster Ave). Rate your visit or book a same-day repair.",
    featuredImage:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&auto=format&fit=crop&q=80",
  },
  faq: {
    metaDesc:
      "Answers to common questions about phone, tablet, computer and console repairs, 90-day warranty coverage, turnaround times, and pricing at SmartFoneDoctor.",
    featuredImage:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&auto=format&fit=crop&q=80",
  },
  warranty: {
    title: "90-Day Repair Warranty & Guarantee | SmartFoneDoctor",
    metaDesc:
      "Every SmartFoneDoctor repair includes a 90-day parts and labor warranty (6 months on HDMI port replacements). See what is covered and how to claim.",
    featuredImage:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&auto=format&fit=crop&q=80",
  },
  "locations-book-repair": {
    featuredImage:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&auto=format&fit=crop&q=80",
  },
  track: {
    featuredImage:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&auto=format&fit=crop&q=80",
  },
  about: {
    title: "About SmartFoneDoctor | Philadelphia Repair Specialists",
    featuredImage:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&auto=format&fit=crop&q=80",
  },
  privacy: {
    featuredImage:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80",
  },
  terms: {
    featuredImage:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80",
  },
  accessibility: {
    featuredImage:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80",
  },
  "supply-chain": {
    featuredImage:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&auto=format&fit=crop&q=80",
  },
};

const FALLBACK_OG_IMAGE =
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&auto=format&fit=crop&q=80";

export async function seedCmsPages() {
  console.log("🌱 [Seeder] Seeding CMS Pages (non-destructive SEO & Puck CSS sync)...");

  for (const page of INITIAL_CMS_PAGES) {
    const seoOverride = PUBLISHED_SEO_DEFAULTS[page.slug];
    const cleanTitle = seoOverride?.title || page.title;
    const cleanMetaDesc = seoOverride?.metaDesc || page.metaDesc || "";
    const cleanFeaturedImage = seoOverride?.featuredImage || page.featuredImage || FALLBACK_OG_IMAGE;

    const existing = await prisma.cmsPage.findUnique({ where: { slug: page.slug } });
    if (!existing) {
      const puckContent = (page.puckData as { content?: unknown[] } | undefined)?.content;
      const compiledCss =
        page.compiledCss ||
        (Array.isArray(puckContent) && puckContent.length > 0 ? compilePageCss(puckContent) : null);

      await prisma.cmsPage.create({
        data: {
          id: page.id,
          slug: page.slug,
          name: page.name,
          path: page.path,
          category: page.category,
          title: cleanTitle,
          metaDesc: cleanMetaDesc,
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
          featuredImage: cleanFeaturedImage,
          canonicalUrl: page.canonicalUrl || null,
          schemaType: page.schemaType || "LocalBusiness",
          custom: !!page.custom,
          puckData: (page.puckData ?? Prisma.DbNull) as Prisma.InputJsonValue,
          puckEditedAt: page.puckEditedAt ? BigInt(page.puckEditedAt) : null,
        },
      });
      console.log(`  ➕ Created page: "${page.name}" (${page.path})`);
    } else {
      // Preserve live Puck layouts & custom content; only repair oversized SEO/missing OG images
      const patch: Prisma.CmsPageUpdateInput = {};
      if (!existing.featuredImage?.trim()) patch.featuredImage = cleanFeaturedImage;
      if (existing.title && existing.title.length > 60 && cleanTitle.length <= 60) {
        patch.title = cleanTitle;
      }
      if ((!existing.metaDesc?.trim() || existing.metaDesc.length > 160) && cleanMetaDesc) {
        patch.metaDesc = cleanMetaDesc;
      }
      if (Object.keys(patch).length > 0) {
        await prisma.cmsPage.update({ where: { id: existing.id }, data: patch });
        console.log(`  🔄 Updated SEO/OG on existing page: "${page.name}"`);
      } else {
        console.log(`  ✓ Verified page: "${page.name}" (preserved live layout & SEO)`);
      }
    }
  }

  // Ensure any published hub/warranty pages created outside INITIAL_CMS_PAGES also meet SEO limits & OG image
  const allPublished = await prisma.cmsPage.findMany({
    where: { status: "Published", NOT: [{ category: "Template" }, { category: "Global" }] },
  });
  for (const row of allPublished) {
    const def = PUBLISHED_SEO_DEFAULTS[row.slug];
    const patch: Prisma.CmsPageUpdateInput = {};
    if (!row.featuredImage?.trim()) patch.featuredImage = def?.featuredImage || FALLBACK_OG_IMAGE;
    if (row.title && row.title.length > 60 && def?.title) patch.title = def.title;
    if ((!row.metaDesc?.trim() || row.metaDesc.length > 160) && def?.metaDesc) patch.metaDesc = def.metaDesc;
    if (Object.keys(patch).length > 0) {
      await prisma.cmsPage.update({ where: { id: row.id }, data: patch });
      console.log(`  🔄 Applied SEO/OG patch to published page: "${row.slug}"`);
    }
  }

  console.log("✅ [Seeder] CMS Pages seeded & verified successfully.");
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
