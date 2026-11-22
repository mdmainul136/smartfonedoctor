// Writes each home Site Section's built-in content into the home layout, so the
// builder shows real values on load. Only fills sections that have no content yet.
//   npx tsx scripts/cms-home-store-section-content.ts
import { PrismaClient } from "@prisma/client";
import {
  BENEFITS_DEFAULTS,
  COMMON_ISSUES_DEFAULTS,
  FAQ_DEFAULTS,
  GUARANTEES_DEFAULTS,
  GUIDES_DEFAULTS,
  REVIEWS_DEFAULTS,
  STORE_FINDER_DEFAULTS,
  WISE_DEFAULTS,
} from "../src/components/home/sectionContent";

const DEFAULTS: Record<string, unknown> = {
  "home-benefits": BENEFITS_DEFAULTS,
  "home-common-issues": COMMON_ISSUES_DEFAULTS,
  "home-reviews": REVIEWS_DEFAULTS,
  "home-store-finder": STORE_FINDER_DEFAULTS,
  "home-guarantees": GUARANTEES_DEFAULTS,
  "home-wise": WISE_DEFAULTS,
  "home-faq": FAQ_DEFAULTS,
  "home-guides": GUIDES_DEFAULTS,
};

const prisma = new PrismaClient();
async function main() {
  const home = await prisma.cmsPage.findUnique({ where: { slug: "home" } });
  const data = home?.puckData as { content: { type: string; props: Record<string, unknown> }[] } | null;
  if (!home || !data) throw new Error("No home layout");
  let filled = 0;
  for (const block of data.content) {
    const section = block.props.section as string;
    if (block.type === "SiteSectionBlock" && DEFAULTS[section] && !block.props.content) {
      block.props.content = DEFAULTS[section];
      filled++;
    }
  }
  await prisma.cmsPage.update({ where: { id: home.id }, data: { puckData: data as object } });
  console.log(`Filled content for ${filled} sections.`);
}
main().finally(() => prisma.$disconnect());
