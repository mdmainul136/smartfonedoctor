// Read-only: lists CMS pages and store branches whose stored data mentions "Lifetime".
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const pages = await prisma.cmsPage.findMany();
  for (const p of pages) {
    const json = JSON.stringify(p);
    const hits = json.match(/[^"]{0,40}Lifetime[^"]{0,40}/g);
    if (hits) console.log(`cmsPage ${p.path ?? p.slug ?? p.id}:`, [...new Set(hits)].slice(0, 6));
  }
  const models = Object.keys(prisma).filter((k) => /branch|store/i.test(k) && !k.startsWith("$") && !k.startsWith("_"));
  for (const m of models) {
    const rows = await prisma[m].findMany();
    console.log(`${m}:`, rows.map((r) => r.name ?? r.title ?? r.id));
  }
} finally {
  await prisma.$disconnect();
}
