// One-off CMS data fixes found by scripts/cms-content-audit.mjs (Nov 2026):
//  - old brand colors stored in builder blocks → brand teal #00807A
//  - About meta description claimed a lifetime warranty → 90-day
//  - device-hub and /locations rows whose URLs are code redirects → Archived
//    (kept, not deleted; archived pages are never shown to visitors)
// Backs up every row it changes first.
//   node scripts/cms-fix-content-2026-11.mjs
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const COLOR_MAP = { "#009691": "#00807A", "#c8102e": "#00807A", "#C8102E": "#00807A" };
const ARCHIVE = ["repairs-iphone", "repairs-ipad", "repairs-mac", "repairs-computer", "repairs-smartphone", "locations"];

const prisma = new PrismaClient();
try {
  const pages = await prisma.cmsPage.findMany();
  const changes = [];

  for (const page of pages) {
    const data = {};
    if (page.puckData) {
      let json = JSON.stringify(page.puckData);
      for (const [from, to] of Object.entries(COLOR_MAP)) json = json.split(`"${from}"`).join(`"${to}"`);
      if (json !== JSON.stringify(page.puckData)) data.puckData = JSON.parse(json);
    }
    if (/lifetime/i.test(page.metaDesc)) {
      data.metaDesc = page.metaDesc.replace(/lifetime workmanship warranty/i, "90-day parts and labor warranty");
    }
    if (ARCHIVE.includes(page.slug) && page.status !== "Archived") {
      data.status = "Archived";
      data.lastEdited = "Archived: URL redirects to a built-in page";
    }
    if (Object.keys(data).length) changes.push({ page, data });
  }

  const backup = `scripts/backup-cmsPage-content-fix-${Date.now()}.json`;
  const bigintSafe = (_k, v) => (typeof v === "bigint" ? v.toString() : v);
  writeFileSync(backup, JSON.stringify(changes.map((c) => c.page), bigintSafe, 2));
  console.log(`Backed up ${changes.length} rows to ${backup}`);

  for (const { page, data } of changes) {
    await prisma.cmsPage.update({ where: { id: page.id }, data });
    console.log(`${page.path.padEnd(22)} ${Object.keys(data).join(", ")}`);
  }
} finally {
  await prisma.$disconnect();
}
