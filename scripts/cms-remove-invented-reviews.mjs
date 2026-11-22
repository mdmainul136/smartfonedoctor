// Phase 7.2 (owner decision 2026-11-22): remove invented customer reviews from
// saved layouts. Home: its reviews section keeps its settings but no reviews (it
// hides itself until real ones are added). About / Review: the testimonial walls
// made of invented "Google Review" quotes are removed. Backup written first.
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const prisma = new PrismaClient();
const rows = await prisma.cmsPage.findMany({ where: { slug: { in: ["home", "about", "review"] } } });
const backup = `scripts/backup-invented-reviews-${Date.now()}.json`;
writeFileSync(backup, JSON.stringify(rows.map(({ id, slug, puckData }) => ({ id, slug, puckData })), null, 1));
const REMOVE = new Set(["TestimonialBlock-about-reviews", "TestimonialBlock-review-wall"]);
for (const row of rows) {
  const data = structuredClone(row.puckData);
  let changed = 0;
  data.content = data.content.filter((b) => (REMOVE.has(b.props?.id) ? (changed++, false) : true));
  for (const b of data.content) {
    if (b.type === "SiteSectionBlock" && b.props.section === "home-reviews") {
      b.props.content = { ...(b.props.content ?? {}), reviews: [], subtitle: "" };
      changed++;
    }
  }
  if (changed) {
    await prisma.cmsPage.update({ where: { id: row.id }, data: { puckData: data } });
    console.log("updated", row.slug, changed);
  }
}
console.log("backup:", backup);
await prisma.$disconnect();
