// Replaces links that go through a redirect (/repairs/iphone, /ipad, /mac) with
// the page they land on, in saved CMS layouts and the saved header menus.
// Backs up every row it changes.   node scripts/cms-fix-redirect-links.mjs
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";

const MAP = {
  "/repairs/iphone": "/repairs/smartphone/iphone-repair",
  "/repairs/ipad": "/repairs/tablet/ipad-repair",
  "/repairs/mac": "/repairs/computer/imac-repair",
};
const fix = (json) => {
  let out = json;
  for (const [from, to] of Object.entries(MAP)) out = out.split(`"${from}"`).join(`"${to}"`);
  return out;
};

const prisma = new PrismaClient();
try {
  const backup = { cmsPages: [], navMenus: [] };
  for (const page of await prisma.cmsPage.findMany({ where: { status: { not: "Archived" } } })) {
    if (!page.puckData) continue;
    const before = JSON.stringify(page.puckData);
    const after = fix(before);
    if (after === before) continue;
    backup.cmsPages.push({ slug: page.slug, puckData: page.puckData });
    await prisma.cmsPage.update({ where: { id: page.id }, data: { puckData: JSON.parse(after) } });
    console.log(`page ${page.path}: fixed`);
  }
  for (const menu of await prisma.navMenu.findMany()) {
    const before = JSON.stringify(menu.config);
    const after = fix(before);
    if (after === before) continue;
    backup.navMenus.push({ id: menu.id, config: menu.config });
    await prisma.navMenu.update({ where: { id: menu.id }, data: { config: JSON.parse(after) } });
    console.log(`menu ${menu.id}: fixed`);
  }
  const file = `scripts/backup-redirect-links-${Date.now()}.json`;
  writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`Backed up ${backup.cmsPages.length} page(s), ${backup.navMenus.length} menu(s) to ${file}`);
} finally {
  await prisma.$disconnect();
}
