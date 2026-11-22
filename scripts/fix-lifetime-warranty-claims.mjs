// One-off content fix: CMS pages seeded with a "Lifetime Limited" warranty label,
// but the shop's real warranty is 90 days. Backs up affected rows before writing.
//   node scripts/fix-lifetime-warranty-claims.mjs
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const FROM = "Lifetime Limited";
const TO = "90-Day Free";
const prisma = new PrismaClient();

try {
  const pages = await prisma.cmsPage.findMany();
  const affected = pages.filter((p) => JSON.stringify(p).includes(FROM));
  const backup = `scripts/backup-cmsPage-lifetime-${Date.now()}.json`;
  writeFileSync(backup, JSON.stringify(affected, null, 2));
  console.log(`Backed up ${affected.length} rows to ${backup}`);

  for (const page of affected) {
    const data = {};
    for (const [key, value] of Object.entries(page)) {
      if (value === null || typeof value === "number" || typeof value === "boolean" || value instanceof Date) continue;
      const json = JSON.stringify(value);
      if (!json.includes(FROM)) continue;
      data[key] = JSON.parse(json.split(FROM).join(TO));
    }
    await prisma.cmsPage.update({ where: { id: page.id }, data });
    console.log(`Updated ${page.path ?? page.id}: ${Object.keys(data).join(", ")}`);
  }
} finally {
  await prisma.$disconnect();
}
