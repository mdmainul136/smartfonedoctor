// Creates the "Store Locations" page (/locations/i/book-repair) in Admin > Pages:
// store finder + WISE + FAQ blocks, so it looks as before and is editable.
//   node scripts/cms-ensure-locations-page.mjs
import { PrismaClient } from "@prisma/client";

const path = "/locations/i/book-repair";
const block = (id, section) => ({ type: "SiteSectionBlock", props: { id: `SiteSectionBlock-${id}`, section, customCss: "" } });
const puckData = {
  root: { props: {} },
  content: [block("locations-finder", "locations-finder"), block("locations-wise", "home-wise"), block("locations-faq", "home-faq")],
};

const prisma = new PrismaClient();
try {
  const existing = await prisma.cmsPage.findFirst({ where: { path } });
  if (existing) {
    console.log(`exists   ${path} (${existing.slug})`);
  } else {
    const row = await prisma.cmsPage.create({
      data: {
        slug: "locations-book-repair",
        path,
        name: "Store Locations",
        category: "Core",
        title: "Book a Repair | SmartFoneDoctor Store Locator",
        metaDesc:
          "Find your nearest SmartFoneDoctor store and book a fast, certified repair for your iPhone, smartphone, tablet, laptop, or gaming console.",
        status: "Published",
        lastEdited: "Created",
        author: "System",
        schemaType: "WebPage",
        custom: false,
        puckData,
        puckEditedAt: BigInt(Date.now()),
      },
    });
    await prisma.pageBuilderRevision.create({
      data: { pageId: row.id, data: puckData, label: "Store locations page", author: "System", isPublished: true, blockCount: 3 },
    });
    console.log(`created  ${path}`);
  }
} finally {
  await prisma.$disconnect();
}
