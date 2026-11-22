// One-off (4.7): gives Privacy, Terms and Accessibility a builder layout made of
// one "Legal / text page" block holding their current text, so it is editable.
// Usage: node scripts/cms-legal-to-blocks.mjs <props.json>   (backup written first)
import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync } from "node:fs";

const prisma = new PrismaClient();
const props = JSON.parse(readFileSync(process.argv[2], "utf8"));
const slugs = Object.keys(props);
const rows = await prisma.cmsPage.findMany({ where: { slug: { in: slugs } } });
if (rows.length !== slugs.length) throw new Error(`expected ${slugs.length} rows, found ${rows.length}`);
const backup = `scripts/backup-legal-pages-${Date.now()}.json`;
writeFileSync(backup, JSON.stringify(rows.map(({ id, slug, puckData, compiledCss }) => ({ id, slug, puckData, compiledCss })), null, 1));
console.log("backup:", backup);
for (const row of rows) {
  const old = row.puckData?.content;
  if (Array.isArray(old) && old.length) throw new Error(`${row.slug} already has a layout; not overwriting`);
  const data = { root: { props: {} }, content: [{ type: "LegalDocumentBlock", props: { id: `LegalDocumentBlock-${row.slug}`, ...props[row.slug] } }] };
  await prisma.cmsPage.update({ where: { id: row.id }, data: { puckData: data, lastEdited: "Converted to builder blocks" } });
  console.log("updated", row.slug, row.status);
}
await prisma.$disconnect();
