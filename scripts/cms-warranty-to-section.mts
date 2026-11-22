// One-off (4.7): Warranty gets a builder layout made of the "Warranty page" site
// section, with today's text stored in it so every line is editable.
// Usage: npx tsx scripts/cms-warranty-to-section.mts   (backup written first)
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "node:fs";
import { WARRANTY_DEFAULTS } from "../src/components/site/warrantyContent";

const prisma = new PrismaClient();
const row = await prisma.cmsPage.findUnique({ where: { slug: "warranty" } });
if (!row) throw new Error("no warranty row");
const old = (row.puckData as { content?: unknown[] } | null)?.content;
if (Array.isArray(old) && old.length) throw new Error("warranty already has a layout; not overwriting");
const backup = `scripts/backup-warranty-${Date.now()}.json`;
writeFileSync(backup, JSON.stringify({ id: row.id, puckData: row.puckData }, null, 1));
await prisma.cmsPage.update({
  where: { id: row.id },
  data: {
    puckData: {
      root: { props: {} },
      content: [
        { type: "SiteSectionBlock", props: { id: "SiteSectionBlock-warranty", section: "warranty-page", content: { ...WARRANTY_DEFAULTS }, customCss: "" } },
      ],
    },
    lastEdited: "Converted to builder blocks",
  },
});
console.log("backup:", backup, "| warranty status:", row.status);
await prisma.$disconnect();
