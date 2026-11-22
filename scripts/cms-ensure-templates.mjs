// Creates the type templates (Admin > Pages > Templates) that don't exist yet.
// Each starts with the built-in data block(s), so pages look exactly as before
// until someone edits the template in the builder. Existing templates are untouched.
//   node scripts/cms-ensure-templates.mjs
import { PrismaClient } from "@prisma/client";

const section = (id, s) => ({ type: "SiteSectionBlock", props: { id: `SiteSectionBlock-${id}`, section: s, customCss: "" } });

const TEMPLATES = [
  {
    slug: "template-blog-post",
    name: "Template: Blog post",
    path: "/_templates/blog-post",
    title: "Blog post template",
    metaDesc: "Layout used by every blog post. SEO titles stay per post (Admin > Blog).",
    puckData: { root: { props: {} }, content: [section("blog-article", "blog-article")] },
  },
  {
    slug: "template-repair-device",
    name: "Template: Device page",
    path: "/_templates/repair-device",
    title: "Device page template",
    metaDesc: "Layout used by every device page (/repairs/<category>/<device>). Titles stay per device.",
    puckData: { root: { props: {} }, content: [section("device-page", "device-page")] },
  },
  {
    slug: "template-repair-issue",
    name: "Template: Repair page",
    path: "/_templates/repair-issue",
    title: "Repair page template",
    metaDesc: "Layout used by every repair page (/repairs/<category>/<device>/<repair>). Titles stay per page.",
    puckData: { root: { props: {} }, content: [section("repair-page", "repair-page")] },
  },
  {
    slug: "template-common-issue",
    name: "Template: Common issue",
    path: "/_templates/common-issue",
    title: "Common issue template",
    metaDesc: "Layout used by every common-issue article (/common-issues/<category>/<slug>). Titles stay per article.",
    puckData: { root: { props: {} }, content: [section("common-issue-article", "common-issue-article")] },
  },
];

const prisma = new PrismaClient();
try {
  for (const t of TEMPLATES) {
    const exists = await prisma.cmsPage.findUnique({ where: { slug: t.slug } });
    if (exists) {
      console.log(`exists   ${t.slug}`);
      continue;
    }
    const row = await prisma.cmsPage.create({
      data: {
        ...t,
        category: "Template",
        status: "Published",
        lastEdited: "Created",
        author: "System",
        schemaType: "WebPage",
        custom: false,
        puckEditedAt: BigInt(Date.now()),
      },
    });
    await prisma.pageBuilderRevision.create({
      data: { pageId: row.id, data: t.puckData, label: "Initial template", author: "System", isPublished: true, blockCount: t.puckData.content.length },
    });
    console.log(`created  ${t.slug}`);
  }
} finally {
  await prisma.$disconnect();
}
