import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const PRESET_TEMPLATES = [
  {
    id: "tpl_hero_repair_cta",
    name: "Hero Section with Urgent Repair CTA",
    category: "Hero",
    description: "High-converting header with repair badges, emergency walk-in pill, and dual CTA buttons.",
    thumbnailUrl: "/templates/hero-repair.png",
    isPreset: true,
    content: [
      {
        type: "HeroModern",
        props: {
          id: "hero-1",
          badge: "Philadelphia's #1 Rated Tech Repair",
          headline: "Fast, Reliable Repairs When You Need It Most",
          subtitle: "Walk in today to any of our 3 locations or book an appointment for priority bench service.",
          primaryButtonText: "Schedule Repair",
          primaryButtonLink: "/schedule-repair",
          secondaryButtonText: "Call (215) 598-2090",
          secondaryButtonLink: "tel:+12155982090",
        },
      },
    ],
  },
  {
    id: "tpl_device_grid_3col",
    name: "3-Column Device Service Cards",
    category: "Services",
    description: "Responsive 3-column layout highlighting smartphone, tablet, and game console repairs.",
    thumbnailUrl: "/templates/services-grid.png",
    isPreset: true,
    content: [
      {
        type: "ServicesGrid",
        props: {
          id: "services-grid-1",
          heading: "Expert Repair Services for Every Device",
          subtitle: "Genuine parts, skilled micro-soldering technicians, and 90-day warranties on all repairs.",
        },
      },
    ],
  },
  {
    id: "tpl_trust_badges_bar",
    name: "Store Trust & Guarantee Badges",
    category: "Trust",
    description: "4-column guarantee banner with 90-day warranty, 30-min turnaround, and OEM parts assurance.",
    thumbnailUrl: "/templates/trust-bar.png",
    isPreset: true,
    content: [
      {
        type: "FeatureGrid",
        props: {
          id: "trust-features-1",
          sectionTitle: "Why Philadelphians Choose SmartFoneDoctor",
        },
      },
    ],
  },
  {
    id: "tpl_emergency_walkin_banner",
    name: "Emergency Walk-In Notice Banner",
    category: "CTA",
    description: "High-contrast alert banner with direct phone link and store hours.",
    thumbnailUrl: "/templates/emergency-banner.png",
    isPreset: true,
    content: [
      {
        type: "CallToActionBanner",
        props: {
          id: "cta-banner-1",
          headline: "Cracked screen or dead battery? Walk in right now!",
          subtext: "No appointment needed. 33 S 52nd St, 4016 Lancaster Ave, and 4060 Lancaster Ave open 6 days a week.",
          buttonText: "Get Immediate Directions",
          buttonLink: "/locations",
        },
      },
    ],
  },
];

const GLOBAL_BLOCKS = [
  {
    id: "gb_emergency_alert",
    name: "Emergency Walk-In Alert Banner",
    identifier: "global-emergency-banner",
    category: "Alerts",
    blockType: "CallToActionBanner",
    content: {
      type: "CallToActionBanner",
      props: {
        headline: "Same-Day Screen & Battery Replacements Under 45 Mins",
        subtext: "Walk into any of our 3 Philadelphia locations today.",
        buttonText: "Find Nearest Store",
        buttonLink: "/locations",
      },
    },
  },
  {
    id: "gb_trust_pills",
    name: "Global Trust & Certification Badges",
    identifier: "global-trust-pills",
    category: "Trust",
    blockType: "FeatureGrid",
    content: {
      type: "FeatureGrid",
      props: {
        sectionTitle: "Certified Tech Repairs with 90-Day Comprehensive Warranty",
      },
    },
  },
];

export async function seedPageBuilder() {
  console.log("🌱 [Seeder] Seeding Page Builder Presets, Templates & Revisions...");

  // 1. Seed Templates
  for (const tpl of PRESET_TEMPLATES) {
    await prisma.pageBuilderTemplate.upsert({
      where: { id: tpl.id },
      update: {
        name: tpl.name,
        category: tpl.category,
        description: tpl.description,
        thumbnailUrl: tpl.thumbnailUrl,
        content: tpl.content as unknown as Prisma.InputJsonValue,
        isPreset: tpl.isPreset,
      },
      create: {
        id: tpl.id,
        name: tpl.name,
        category: tpl.category,
        description: tpl.description,
        thumbnailUrl: tpl.thumbnailUrl,
        content: tpl.content as unknown as Prisma.InputJsonValue,
        isPreset: tpl.isPreset,
      },
    });
    console.log(`  ✓ Synced builder template: "${tpl.name}" [${tpl.category}]`);
  }

  // 2. Seed Global Blocks
  for (const gb of GLOBAL_BLOCKS) {
    await prisma.pageBuilderGlobalBlock.upsert({
      where: { identifier: gb.identifier },
      update: {
        name: gb.name,
        category: gb.category,
        blockType: gb.blockType,
        content: gb.content as unknown as Prisma.InputJsonValue,
      },
      create: {
        id: gb.id,
        name: gb.name,
        identifier: gb.identifier,
        category: gb.category,
        blockType: gb.blockType,
        content: gb.content as unknown as Prisma.InputJsonValue,
      },
    });
    console.log(`  ✓ Synced global block: "${gb.name}" (${gb.identifier})`);
  }

  // 3. Seed Initial Revisions for core pages if none exist
  const pages = await prisma.cmsPage.findMany({ select: { id: true, slug: true, name: true, puckData: true } });
  for (const p of pages) {
    const revCount = await prisma.pageBuilderRevision.count({ where: { pageId: p.id } });
    if (revCount === 0 && p.puckData) {
      await prisma.pageBuilderRevision.create({
        data: {
          pageId: p.id,
          label: "Initial Release (v1.0)",
          data: p.puckData as Prisma.InputJsonValue,
          isPublished: true,
          blockCount: Array.isArray((p.puckData as { content?: unknown[] })?.content)
            ? ((p.puckData as { content?: unknown[] }).content?.length ?? 0)
            : 0,
        },
      });
      console.log(`  ✓ Created initial revision snapshot for "${p.name}"`);
    }
  }

  console.log("✅ [Seeder] Page Builder seeded successfully.");
}

// Allow independent CLI execution: npx tsx prisma/seeds/pageBuilder.seed.ts
if (require.main === module) {
  seedPageBuilder()
    .catch((err) => {
      console.error("❌ Failed to seed Page Builder:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
