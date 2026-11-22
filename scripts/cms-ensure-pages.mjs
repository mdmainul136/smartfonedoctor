// Creates a cms_pages row for built-in pages that have none yet, so they show up
// in Admin > Pages and can be edited. Existing rows are never touched.
// Rows start with no Puck layout, so the page keeps its coded design until
// someone publishes a layout in the builder.
//   node scripts/cms-ensure-pages.mjs
import { PrismaClient } from "@prisma/client";

const PAGES = [
  {
    slug: "warranty",
    name: "Warranty",
    path: "/warranty",
    category: "Legal",
    title: "Repair Warranty | SmartFoneDoctor",
    metaDesc:
      "Every SmartFoneDoctor repair includes a 90-day warranty on parts and labor. See what's covered and how to make a claim.",
  },
  {
    slug: "privacy",
    name: "Privacy Policy",
    path: "/privacy",
    category: "Legal",
    title: "Privacy Policy | SmartFoneDoctor",
    metaDesc: "How SmartFoneDoctor collects, uses and protects your personal information and device data.",
  },
  {
    slug: "terms",
    name: "Terms of Use",
    path: "/terms",
    category: "Legal",
    title: "Terms of Use | SmartFoneDoctor",
    metaDesc: "The terms that apply when you use the SmartFoneDoctor website and repair services.",
  },
  {
    slug: "accessibility",
    name: "Accessibility Statement",
    path: "/accessibility",
    category: "Legal",
    title: "Accessibility Statement | SmartFoneDoctor",
    metaDesc: "SmartFoneDoctor's commitment to an accessible website and how to reach us if something doesn't work for you.",
  },
  {
    slug: "supply-chain",
    name: "Supply Chain",
    path: "/supply-chain",
    category: "Legal",
    title: "Supply Chain & Responsible Sourcing | SmartFoneDoctor",
    metaDesc:
      "How SmartFoneDoctor sources repair parts: supplier standards, ethical labor, and our California supply chain statement.",
  },
];

const prisma = new PrismaClient();
try {
  for (const page of PAGES) {
    const existing = await prisma.cmsPage.findFirst({
      where: { OR: [{ slug: page.slug }, { path: page.path }] },
    });
    if (existing) {
      console.log(`exists   ${page.path}`);
      continue;
    }
    await prisma.cmsPage.create({
      data: {
        ...page,
        status: "Published",
        lastEdited: "Added to CMS",
        author: "System",
        schemaType: "WebPage",
        custom: false,
      },
    });
    console.log(`created  ${page.path}`);
  }
} finally {
  await prisma.$disconnect();
}
