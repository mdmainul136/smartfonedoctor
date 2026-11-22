// Phase 7.2: plain wording in saved layouts (backup written first).
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";
const prisma = new PrismaClient();
const R = [
  ["Philadelphia's Trusted Leader in", "Phone & computer repair in Philadelphia"],
  ["Expert Solutions for Your Everyday Tech", "Why customers choose us"],
  ["Trusted smartphone, tablet, laptop & console servicing with high-grade components.", "Phone, tablet, laptop and console repairs with quality parts and a 90-day warranty."],
  ["our curated collection of pristine, fully tested, and sanitized", "our fully tested and cleaned"],
  ["models in pristine condition.", "models in very good condition."],
];
const rows = await prisma.cmsPage.findMany({ where: { slug: { in: ["home", "faq"] } } });
const backup = `scripts/backup-plain-copy-${Date.now()}.json`;
writeFileSync(backup, JSON.stringify(rows.map(({ id, slug, puckData }) => ({ id, slug, puckData })), null, 1));
for (const r of rows) {
  let s = JSON.stringify(r.puckData);
  let n = 0;
  for (const [a, b] of R) {
    const parts = s.split(JSON.stringify(a).slice(1, -1));
    n += parts.length - 1;
    s = parts.join(JSON.stringify(b).slice(1, -1));
  }
  if (n) await prisma.cmsPage.update({ where: { id: r.id }, data: { puckData: JSON.parse(s) } });
  console.log(r.slug, n);
}
console.log("backup:", backup);
await prisma.$disconnect();
