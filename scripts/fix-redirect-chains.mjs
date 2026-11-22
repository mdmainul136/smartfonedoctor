// Points redirect rules whose target itself redirects straight at the final page
// (one hop instead of two). Backs up the rules it changes.
//   node scripts/fix-redirect-chains.mjs [baseUrl]
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:3000";
const prisma = new PrismaClient();
try {
  const rules = await prisma.urlRedirect.findMany({ where: { isActive: true } });
  const changed = [];
  for (const rule of rules) {
    if (!rule.targetUrl.startsWith("/")) continue;
    let target = rule.targetUrl;
    for (let hop = 0; hop < 5; hop++) {
      const r = await fetch(BASE + target, { redirect: "manual" });
      const loc = r.headers.get("location");
      if (![301, 302, 307, 308].includes(r.status) || !loc) break;
      target = loc.replace(BASE, "");
    }
    if (target !== rule.targetUrl) {
      changed.push({ id: rule.id, sourceUrl: rule.sourceUrl, oldTarget: rule.targetUrl, newTarget: target });
      await prisma.urlRedirect.update({ where: { id: rule.id }, data: { targetUrl: target } });
      console.log(`${rule.sourceUrl}: ${rule.targetUrl} -> ${target}`);
    }
  }
  const file = `scripts/backup-redirect-chains-${Date.now()}.json`;
  writeFileSync(file, JSON.stringify(changed, null, 2));
  console.log(`${changed.length} rule(s) updated; previous targets saved to ${file}`);
} finally {
  await prisma.$disconnect();
}
