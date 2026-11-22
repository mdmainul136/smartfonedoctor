// Copies each built-in page's current live <title> and meta description into its
// cms_pages row, so pages can read SEO from the CMS without changing what Google sees.
// Needs the dev server. Backs up the rows it changes.
//   node scripts/cms-sync-seo-from-live.mjs [baseUrl]
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:3000";
// slug → live URL
const PAGES = {
  faq: "/faq",
  privacy: "/privacy",
  terms: "/terms",
  accessibility: "/accessibility",
  repairs: "/repairs",
  review: "/review",
  warranty: "/warranty",
  "supply-chain": "/supply-chain",
  track: "/repair-status",
};

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const prisma = new PrismaClient();
try {
  const backup = [];
  for (const [slug, url] of Object.entries(PAGES)) {
    const html = await (await fetch(BASE + url)).text();
    const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
    const metaDesc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
    if (!title || !metaDesc) {
      console.log(`skip     ${slug}: could not read live title/description`);
      continue;
    }
    const row = await prisma.cmsPage.findUnique({ where: { slug } });
    if (!row) {
      console.log(`skip     ${slug}: no cms_pages row`);
      continue;
    }
    if (row.title === title && row.metaDesc === metaDesc) {
      console.log(`same     ${slug}`);
      continue;
    }
    backup.push({ slug, title: row.title, metaDesc: row.metaDesc });
    await prisma.cmsPage.update({ where: { slug }, data: { title, metaDesc } });
    console.log(`updated  ${slug}: ${title}`);
  }
  const file = `scripts/backup-cmsPage-seo-${Date.now()}.json`;
  writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`Previous values saved to ${file}`);
} finally {
  await prisma.$disconnect();
}
