import { PrismaClient } from "@prisma/client";
import { seedTaxonomies } from "./seeds/taxonomies.seed";
import { seedNavigation } from "./seeds/navigation.seed";
import { seedCmsPages } from "./seeds/cmsPages.seed";
import { seedPageBuilder } from "./seeds/pageBuilder.seed";
import { seedSeoMetadata } from "./seeds/seo.seed";
import { seedGeoAeo } from "./seeds/geoAeo.seed";
import { seedThirdPartyApis } from "./seeds/thirdPartyApis.seed";
import { seedBlog } from "./seeds/blog.seed";
import { seedServicesAndLocations } from "./seeds/services.seed";
import { seedLeads } from "./seeds/leads.seed";
import { seedAdminUsers } from "./seeds/admin.seed";

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
      case "geo":
      case "aeo":
      case "geoaeo":
        await seedGeoAeo();
        break;
      case "apis":
      case "connectors":
      case "citations":
        await seedThirdPartyApis();
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
      case "admin":
      case "auth":
      case "users":
        await seedAdminUsers();
        break;
      default:
        console.error(`❌ Unknown seed target: "${target}". Valid targets: taxonomies, navigation, cms, builder, seo, geo, apis, blog, services, leads, admin`);
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

    // 7. AEO (Answer Engine) & GEO (Generative Engine) Knowledge Graph
    await seedGeoAeo();
    console.log("");

    // 8. Third-Party APIs (Google Business Profile, Yelp Fusion, Apple Connect, Meta Graph)
    await seedThirdPartyApis();
    console.log("");

    // 9. Locations and FAQs
    await seedServicesAndLocations();
    console.log("");

    // 10. Repair leads & customer intake tickets
    await seedLeads();
    console.log("");

    // 11. Admin Users & Authentication Profiles
    await seedAdminUsers();
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
