import fs from "fs";
import path from "path";
import readline from "readline";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/authCrypto";

// Import all seeds
import { seedTaxonomies } from "../prisma/seeds/taxonomies.seed";
import { seedNavigation } from "../prisma/seeds/navigation.seed";
import { seedCmsPages } from "../prisma/seeds/cmsPages.seed";
import { seedPageBuilder } from "../prisma/seeds/pageBuilder.seed";
import { seedBlog } from "../prisma/seeds/blog.seed";
import { seedSeoMetadata } from "../prisma/seeds/seo.seed";
import { seedGeoAeo } from "../prisma/seeds/geoAeo.seed";
import { seedThirdPartyApis } from "../prisma/seeds/thirdPartyApis.seed";
import { seedServicesAndLocations } from "../prisma/seeds/services.seed";
import { seedLeads } from "../prisma/seeds/leads.seed";
import { seedSettings } from "../prisma/seeds/settings.seed";

const prisma = new PrismaClient();
const LOCK_FILE_PATH = path.join(process.cwd(), ".installed");

function prompt(query: string, defaultValue: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${query} (${defaultValue}): `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function main() {
  console.log("\n============================================================");
  console.log("🛠️  SmartFone Doctor — One-Time Automated Installer & Seeder");
  console.log("============================================================\n");

  const args = process.argv.slice(2);
  const isAuto = args.includes("--auto") || args.includes("-y") || args.includes("--yes");
  const isForce = args.includes("--force");

  // 1. One-Time Installation Lock Check
  if (fs.existsSync(LOCK_FILE_PATH) && !isForce) {
    console.warn("⚠️  [NOTICE] The application has ALREADY been installed and locked!");
    console.warn(`   Lockfile detected at: ${LOCK_FILE_PATH}`);
    try {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE_PATH, "utf8"));
      console.warn(`   Installed on: ${lockData.installedAt || "Unknown"}`);
      console.warn(`   Super Admin: ${lockData.adminEmail || "Configured"}`);
    } catch {
      // ignore JSON parse error
    }
    console.log("\n💡 To re-run the installer and overwrite data, pass the --force flag:");
    console.log("   npm run setup -- --force\n");
    process.exit(0);
  }

  // Parse CLI flags or prompt for credentials
  const emailArg = args.find((a) => a.startsWith("--email="))?.split("=")[1];
  const passArg = args.find((a) => a.startsWith("--password="))?.split("=")[1];
  const nameArg = args.find((a) => a.startsWith("--name="))?.split("=")[1];

  let adminName = nameArg || "Dr. Mike";
  let adminEmail = emailArg || "admin@smartfonedoctor.com";
  let adminPass = passArg || "admin123456";

  if (!isAuto && (!emailArg || !passArg || !nameArg)) {
    console.log("📝 Please configure your Super Administrator credentials:\n");
    adminName = await prompt("Enter Super Admin Name", adminName);
    adminEmail = await prompt("Enter Super Admin Email", adminEmail);
    adminPass = await prompt("Enter Super Admin Password", adminPass);
    console.log("");
  }

  // 2. Database Connection Test
  console.log("📡 [Step 1/5] Testing PostgreSQL Connection...");
  try {
    await prisma.$connect();
    console.log("   ✅ Database connection established successfully.\n");
  } catch (err: unknown) {
    const error = err as Error;
    console.error("   ❌ Failed to connect to PostgreSQL:", error.message);
    console.error("   Please verify DATABASE_URL in your .env file.");
    process.exit(1);
  }

  // 3. Sync Database Tables (Prisma DB Push)
  console.log("🗄️  [Step 2/5] Synchronizing PostgreSQL Database Schema...");
  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    console.log("   ✅ Database tables synchronized.\n");
  } catch (err: unknown) {
    const error = err as Error;
    console.error("   ⚠️ Warning during schema sync (continuing with seeds):", error.message);
  }

  // 4. Run All Domain Data Seeds
  console.log("📦 [Step 3/5] Running Complete Master Data Seeds...");
  console.log("------------------------------------------------------------");

  console.log("🌱 1. Seeding Device & Issue Taxonomies...");
  await seedTaxonomies();

  console.log("🌱 2. Seeding Navigation & Mega Menu Structure...");
  await seedNavigation();

  console.log("🌱 3. Seeding CMS Landing Pages with Compiled Puck CSS...");
  await seedCmsPages();

  console.log("🌱 4. Seeding Puck Visual Page Builder Templates...");
  await seedPageBuilder();

  console.log("🌱 5. Seeding Technical Blog Articles & Guides...");
  await seedBlog();

  console.log("🌱 6. Seeding Search Engine Optimization (SEO) Metadata...");
  await seedSeoMetadata();

  console.log("🌱 7. Seeding GEO / AEO Local Knowledge Graph...");
  await seedGeoAeo();

  console.log("🌱 8. Seeding Third-Party Connectors & Local Citations...");
  await seedThirdPartyApis();

  console.log("🌱 9. Seeding Repair Services, Store Locations & FAQs...");
  await seedServicesAndLocations();

  console.log("🌱 10. Seeding Sample Repair Leads & Bookings...");
  await seedLeads();

  console.log("🌱 11. Seeding Store Branches & System Settings...");
  await seedSettings();

  console.log("------------------------------------------------------------");
  console.log("   ✅ All 11 domain datasets seeded successfully.\n");

  // 5. Create or Update Super Administrator User
  console.log("👤 [Step 4/5] Creating Primary Super Administrator...");
  const passwordHash = hashPassword(adminPass);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail.toLowerCase().trim() },
    update: {
      name: adminName,
      passwordHash,
      role: "super_admin",
      isActive: true,
      department: "Executive Management & Flagship Ops",
    },
    create: {
      name: adminName,
      email: adminEmail.toLowerCase().trim(),
      passwordHash,
      role: "super_admin",
      phone: "+1 (215) 555-0100",
      avatarUrl: "/avatar.png",
      address: "33 S 52nd St, Philadelphia, PA 19139",
      bio: "SmartFoneDoctor Flagship Store Admin & Head of Technical Operations.",
      department: "Executive Management & Flagship Ops",
      twoFactorEnabled: false,
      isActive: true,
    },
  });

  console.log(`   ✅ Super Admin created: ${admin.name} (${admin.email})\n`);

  // 6. Write One-Time Installation Lock
  console.log("🔒 [Step 5/5] Writing One-Time Installation Lock...");
  const lockData = {
    installedAt: new Date().toISOString(),
    version: "1.0.0",
    adminEmail: admin.email,
    adminName: admin.name,
    status: "locked",
    platform: "SmartFoneDoctor OS",
  };

  fs.writeFileSync(LOCK_FILE_PATH, JSON.stringify(lockData, null, 2), "utf8");
  console.log(`   ✅ Installation locked: ${LOCK_FILE_PATH}\n`);

  // Final Success Summary Banner
  console.log("============================================================");
  console.log("🎉 INSTALLATION & AUTOMATION SETUP COMPLETE!");
  console.log("============================================================");
  console.log(`🌐 Public Website:     http://localhost:3000/`);
  console.log(`🔐 Admin Sign-In:      http://localhost:3000/sign-in`);
  console.log(`📊 Admin Dashboard:    http://localhost:3000/admin`);
  console.log("------------------------------------------------------------");
  console.log(`🔑 Admin Email:        ${admin.email}`);
  console.log(`🔑 Admin Password:     ${adminPass}`);
  console.log(`🛡️  Role:               Super Administrator`);
  console.log("============================================================\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Fatal Error during automated installation:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
