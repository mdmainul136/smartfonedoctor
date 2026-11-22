// Switches the home page to a builder layout made of the site's coded sections
// ("Site Section" blocks), so visitors keep the same design while admins can
// reorder, remove or add blocks in the builder.
// The old builder layout is saved as a revision first, so it can be restored
// from History in the editor. Rows are also backed up to a JSON file.
//   node scripts/cms-home-to-sections.mjs
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

// Keep in sync with HOME_SECTION_ORDER in src/plugins/repair-shop/siteSections.tsx
const ORDER = [
  "home-hero",
  "home-benefits",
  "home-common-issues",
  "home-reviews",
  "home-store-finder",
  "home-guarantees",
  "home-wise",
  "home-faq",
  "home-guides",
];

// Keep in sync with HERO_DEFAULTS in src/components/home/heroContent.ts
const HERO = {
  badge: "Philadelphia's Trusted Leader in",
  headline: "Fast, reliable repairs that keep your tech working when it matters.",
  subtitle:
    "Repair services for smartphones, tablets, computers and game consoles, backed by certified technicians and a 90-day free warranty.",
  ctaText: "Book your repair",
  ctaLink: "/schedule-repair",
  imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1280&q=80",
  imageAlt: "SmartFoneDoctor Philadelphia Repair Bench",
  statusText: "Already have a repair with us?",
  statusLinkText: "Check status",
  statusLink: "/repair-status",
};

const layout = {
  root: { props: {} },
  content: ORDER.map((section) => ({
    type: "SiteSectionBlock",
    props: {
      id: `SiteSectionBlock-${section}`,
      section,
      ...(section === "home-hero" ? { content: HERO } : {}),
      customCss: "",
    },
  })),
};

const prisma = new PrismaClient();
try {
  const home = await prisma.cmsPage.findUnique({ where: { slug: "home" } });
  if (!home) throw new Error("No home row");

  const bigintSafe = (_k, v) => (typeof v === "bigint" ? v.toString() : v);
  const backup = `scripts/backup-cmsPage-home-${Date.now()}.json`;
  writeFileSync(backup, JSON.stringify(home, bigintSafe, 2));
  console.log(`Backed up home row to ${backup}`);

  if (home.puckData) {
    await prisma.pageBuilderRevision.create({
      data: {
        pageId: home.id,
        data: home.puckData,
        label: "Old builder home (before coded sections)",
        author: "System",
        isPublished: true,
        blockCount: home.puckData.content?.length ?? 0,
      },
    });
  }

  await prisma.cmsPage.update({
    where: { id: home.id },
    data: {
      puckData: layout,
      compiledCss: null,
      puckEditedAt: BigInt(Date.now()),
      lastEdited: "Switched to builder (coded sections)",
    },
  });
  await prisma.pageBuilderRevision.create({
    data: {
      pageId: home.id,
      data: layout,
      label: "Home as coded sections",
      author: "System",
      isPublished: true,
      blockCount: layout.content.length,
    },
  });
  await prisma.pageBuilderDraft.deleteMany({ where: { pageId: home.id } });
  console.log(`Home now uses ${layout.content.length} Site Section blocks.`);
} finally {
  await prisma.$disconnect();
}
