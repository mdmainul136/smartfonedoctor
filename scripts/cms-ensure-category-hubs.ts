// Creates (or revives) the 4 category hub pages /repairs/<category> in Admin > Pages,
// each with the "Repairs: category hub" block filled with that category's text.
// Archived rows on those paths are reused (their old layout is kept in History).
// Rows are backed up first. Pages that already have the hub block are left alone.
//   npx tsx scripts/cms-ensure-category-hubs.ts
import { writeFileSync } from "node:fs";
import { PrismaClient, Prisma } from "@prisma/client";
import { HUB_CATEGORIES, HUB_DEFAULTS } from "../src/components/repairs/categoryHubContent";

const prisma = new PrismaClient();

async function main() {
  const backup: unknown[] = [];
  for (const category of HUB_CATEGORIES) {
    const d = HUB_DEFAULTS[category];
    const path = `/repairs/${category}`;
    const { name: _n, seoTitle, seoDescription, ...content } = d;
    void _n;
    const puckData = {
      root: { props: {} },
      content: [
        {
          type: "SiteSectionBlock",
          props: { id: `SiteSectionBlock-hub-${category}`, section: "repair-category-hub", content, customCss: "" },
        },
      ],
    };

    const existing = await prisma.cmsPage.findFirst({ where: { path } });
    if (existing && JSON.stringify(existing.puckData ?? "").includes("repair-category-hub")) {
      console.log(`exists   ${path}`);
      continue;
    }
    const data = {
      name: `${d.name} (hub)`,
      category: "Repairs",
      title: seoTitle,
      metaDesc: seoDescription,
      status: "Published",
      lastEdited: "Category hub created",
      author: "System",
      schemaType: "WebPage",
      custom: false,
      puckData: puckData as Prisma.InputJsonValue,
      puckEditedAt: BigInt(Date.now()),
    };
    let pageId: string;
    if (existing) {
      backup.push({ ...existing, puckEditedAt: existing.puckEditedAt?.toString() ?? null });
      if (existing.puckData) {
        await prisma.pageBuilderRevision.create({
          data: {
            pageId: existing.id,
            data: existing.puckData as Prisma.InputJsonValue,
            label: "Old layout (before category hub)",
            author: "System",
            isPublished: false,
            blockCount: (existing.puckData as { content?: unknown[] }).content?.length ?? 0,
          },
        });
      }
      await prisma.cmsPage.update({ where: { id: existing.id }, data });
      pageId = existing.id;
      console.log(`revived  ${path} (was ${existing.status}, slug ${existing.slug})`);
    } else {
      const row = await prisma.cmsPage.create({ data: { ...data, slug: `repairs-${category}`, path } });
      pageId = row.id;
      console.log(`created  ${path}`);
    }
    await prisma.pageBuilderRevision.create({
      data: {
        pageId,
        data: puckData as Prisma.InputJsonValue,
        label: "Category hub",
        author: "System",
        isPublished: true,
        blockCount: 1,
      },
    });
  }
  if (backup.length) {
    const file = `scripts/backup-cmsPage-hubs-${Date.now()}.json`;
    writeFileSync(file, JSON.stringify(backup, null, 2));
    console.log(`Backed up ${backup.length} row(s) to ${file}`);
  }
}

main().finally(() => prisma.$disconnect());
