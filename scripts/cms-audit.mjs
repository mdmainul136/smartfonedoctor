// Read-only audit: what the CMS database holds for each page.
//   node scripts/cms-audit.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const pages = await prisma.cmsPage.findMany({ orderBy: { path: "asc" } });
  const rows = pages.map((p) => {
    const content = p.puckData?.content ?? [];
    const types = [...new Set(content.map((b) => b.type))];
    return {
      path: p.path,
      slug: p.slug,
      status: p.status,
      blocks: content.length,
      blockTypes: types.join(","),
      css: p.compiledCss ? p.compiledCss.length : 0,
      meta: p.metaDesc ? "y" : "-",
    };
  });
  console.table(rows);
  for (const [label, model] of [
    ["revisions", prisma.pageBuilderRevision],
    ["drafts", prisma.pageBuilderDraft],
    ["templates", prisma.pageBuilderTemplate],
    ["globalBlocks", prisma.pageBuilderGlobalBlock],
    ["assets", prisma.pageBuilderAsset],
    ["seoMetadata", prisma.seoMetadata],
    ["adminUsers", prisma.adminUser],
  ]) {
    console.log(label, await model.count());
  }
} finally {
  await prisma.$disconnect();
}
