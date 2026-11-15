import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const INITIAL_STORE_BRANCHES = [
  {
    name: "SmartFoneDoctor - 33 S 52nd St (West Philly)",
    type: "Flagship HQ",
    address: "33 S 52nd St, Fl 2nd",
    cityStateZip: "Philadelphia, PA 19139",
    phone: "+1 (215) 598-2090",
    email: "philly52@smartfonedoctor.com",
    businessHours: "Mon - Sat: 10:00 AM - 7:00 PM",
    calendlyUrl: "https://calendly.com/smartfonedoctor/philly-flagship",
    gmbUrl: "https://share.google/gTlyWLewR88ToAdJQ",
    order: 1,
    isActive: true,
  },
  {
    name: "SmartFoneDoctor - 4016 Lancaster Ave",
    type: "University City Branch",
    address: "4016 Lancaster Ave",
    cityStateZip: "Philadelphia, PA 19104",
    phone: "+1 (215) 598-2090",
    email: "lancaster4016@smartfonedoctor.com",
    businessHours: "Mon - Sat: 10:00 AM - 7:00 PM",
    calendlyUrl: "https://calendly.com/smartfonedoctor/lancaster-4016",
    gmbUrl: "https://maps.google.com/?q=4016+Lancaster+Ave,+Philadelphia,+PA+19104",
    order: 2,
    isActive: true,
  },
  {
    name: "SmartFoneDoctor - 4060 Lancaster Ave",
    type: "Lancaster Express",
    address: "4060 Lancaster Ave",
    cityStateZip: "Philadelphia, PA 19104",
    phone: "+1 (215) 598-2090",
    email: "lancaster4060@smartfonedoctor.com",
    businessHours: "Mon - Sat: 10:00 AM - 7:00 PM",
    calendlyUrl: "https://calendly.com/smartfonedoctor/lancaster-4060",
    gmbUrl: "https://maps.google.com/?q=4060+Lancaster+Ave,+Philadelphia,+PA+19104",
    order: 3,
    isActive: true,
  },
];

export async function seedSettings() {
  console.log("🌱 [Seeder] Seeding Store Branches & Global App Settings...");

  // 1. Seed Store Branches
  for (const branch of INITIAL_STORE_BRANCHES) {
    const existing = await prisma.storeBranch.findFirst({
      where: { name: branch.name },
    });

    if (!existing) {
      await prisma.storeBranch.create({
        data: branch,
      });
      console.log(`   ➕ Created Store Branch: "${branch.name}" [${branch.type}]`);
    } else {
      await prisma.storeBranch.update({
        where: { id: existing.id },
        data: branch,
      });
      console.log(`   🔄 Updated Store Branch: "${branch.name}"`);
    }
  }

  // 2. Seed Global App & AI Settings
  const existingConfig = await prisma.appSystemSettings.findUnique({
    where: { id: "global_config" },
  });

  if (!existingConfig) {
    await prisma.appSystemSettings.create({
      data: {
        id: "global_config",
        siteName: "SmartFone Doctor",
        supportEmail: "support@smartfonedoctor.com",
        supportPhone: "+1 (215) 598-2090",
        headquarters: "33 S 52nd St, Philadelphia, PA 19139",
        currency: "USD",
        timezone: "America/New_York",
        defaultAiProvider: "gemini",
        geminiApiKey: process.env.GEMINI_API_KEY || "",
        openaiApiKey: process.env.OPENAI_API_KEY || "",
        emailNotifications: true,
        smsNotifications: true,
      },
    });
    console.log("   ➕ Created Global AppSystemSettings (AI keys & business config)");
  } else {
    await prisma.appSystemSettings.update({
      where: { id: "global_config" },
      data: {
        siteName: "SmartFone Doctor",
        supportEmail: "support@smartfonedoctor.com",
        supportPhone: "+1 (215) 598-2090",
        headquarters: "33 S 52nd St, Philadelphia, PA 19139",
      },
    });
    console.log("   🔄 Verified Global AppSystemSettings");
  }

  console.log("✅ [Seeder] Settings seeded successfully.");
}

if (require.main === module) {
  seedSettings()
    .catch((e) => {
      console.error("❌ Failed to seed Settings:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
