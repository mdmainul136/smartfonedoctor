import { PrismaClient } from "@prisma/client";
import { seedTaxonomies } from "./seeds/taxonomies.seed";
import { seedNavigation } from "./seeds/navigation.seed";
import { seedCmsPages } from "./seeds/cmsPages.seed";
import { seedPageBuilder } from "./seeds/pageBuilder.seed";
import { seedSeoMetadata } from "./seeds/seo.seed";
import { seedBlog } from "./seeds/blog.seed";
import { seedServicesAndLocations } from "./seeds/services.seed";
import { seedLeads } from "./seeds/leads.seed";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const onlyFlag = args.find((arg) => arg.startsWith("--only="));
  const target = onlyFlag ? onlyFlag.split("=")[1].toLowerCase() : null;

  console.log("=================================================");
  console.log("🚀 [SmartFone Doctor] Master Database Seeder");
  console.log("=================================================");

  if (target) {
    console.log(`🎯 Targeting single domain: "${target}"\n`);
    switch (target) {
      case "taxonomies":
      case "taxonomy":
        await seedTaxonomies();
        break;
      case "navigation":
      case "nav":
        await seedNavigation();
        break;
      case "cms":
      case "cmspages":
      case "pages":
        await seedCmsPages();
        break;
      case "builder":
      case "pagebuilder":
      case "puck":
        await seedPageBuilder();
        break;
      case "seo":
      case "metadata":
        await seedSeoMetadata();
        break;
      case "blog":
      case "posts":
        await seedBlog();
        break;
      case "services":
      case "locations":
      case "faqs":
        await seedServicesAndLocations();
        break;
      case "leads":
        await seedLeads();
        break;
      default:
        console.error(`❌ Unknown seed target: "${target}". Valid targets: taxonomies, navigation, cms, builder, seo, blog, services, leads`);
        process.exit(1);
    }
  } else {
    console.log("📦 Running full database initialization sequence...\n");
    // 1. Core device & repair taxonomy models
    await seedTaxonomies();
    console.log("");

    // 2. Navigation & menu configuration
    await seedNavigation();
    console.log("");

    // 3. CMS landing & category pages with pre-compiled Puck CSS
    await seedCmsPages();
    console.log("");

    // 4. Page Builder templates, global blocks & revision snapshots
    await seedPageBuilder();
    console.log("");

    // 5. Technical repair guides & blog posts
    await seedBlog();
    console.log("");

    // 6. Pluggable SEO Metadata Engine
    await seedSeoMetadata();
    console.log("");

    // 7. Locations and FAQs
    await seedServicesAndLocations();
    console.log("");

    // 8. Repair leads & customer intake tickets
    await seedLeads();
  }

  console.log("\n=================================================");
  console.log("✨ All database seed operations completed cleanly!");
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("❌ Fatal Error during master seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
