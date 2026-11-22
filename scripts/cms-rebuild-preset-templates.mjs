// Rebuilds the 4 seeded preset templates, which used block types that no longer
// exist (HeroModern, ServicesGrid, FeatureGrid, CallToActionBanner) and were hidden
// in the builder. New content uses current blocks, taken from the old builder home
// (kept in the home page's History). Backs up the old rows first.
//   node scripts/cms-rebuild-preset-templates.mjs
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const prisma = new PrismaClient();
try {
  const home = await prisma.cmsPage.findUnique({ where: { slug: "home" } });
  const source = await prisma.pageBuilderRevision.findFirst({
    where: { pageId: home.id, label: { startsWith: "Old builder home" } },
  });
  if (!source) throw new Error("Old builder home revision not found");
  const block = (type) => {
    const b = source.data.content.find((c) => c.type === type);
    if (!b) throw new Error(`No ${type} in source`);
    return structuredClone(b);
  };

  const hero = block("HeroBlock");
  hero.props.id = "HeroBlock-preset";
  hero.props.ctaText = "Book a Same-Day Repair";

  const cta = block("CtaBannerBlock");
  cta.props.id = "CtaBannerBlock-preset";
  cta.props.heading = "Walk-ins welcome today";
  cta.props.subheading =
    "No appointment needed for most screen and battery repairs. Bring your device to any of our 3 Philadelphia stores.";
  cta.props.ctaText = "Book a repair";
  cta.props.ctaLink = "/schedule-repair";

  const services = block("ServicesGridBlock");
  services.props.id = "ServicesGridBlock-preset";

  const stats = block("StatsCounterRowBlock");
  stats.props.id = "StatsCounterRowBlock-preset";

  const NEW = {
    "Emergency Walk-In Notice Banner": { content: [cta], category: "CTA" },
    "Hero Section with Urgent Repair CTA": { content: [hero], category: "Hero" },
    "3-Column Device Service Cards": { content: [services], category: "Services" },
    "Store Trust & Guarantee Badges": { content: [stats], category: "Trust" },
  };

  const presets = await prisma.pageBuilderTemplate.findMany({ where: { isPreset: true } });
  writeFileSync(`scripts/backup-templates-${Date.now()}.json`, JSON.stringify(presets, null, 2));

  for (const [name, { content, category }] of Object.entries(NEW)) {
    const row = presets.find((t) => t.name === name);
    if (row) {
      await prisma.pageBuilderTemplate.update({ where: { id: row.id }, data: { content, category } });
      console.log(`updated  ${name}`);
    } else {
      await prisma.pageBuilderTemplate.create({ data: { name, content, category, isPreset: true } });
      console.log(`created  ${name}`);
    }
  }
} finally {
  await prisma.$disconnect();
}
