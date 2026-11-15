import { PrismaClient, Prisma } from "@prisma/client";
import { DEFAULT_NAV_MENU } from "../../src/lib/navMenuData";

const prisma = new PrismaClient();

export async function seedNavigation() {
  console.log("🌱 [Seeder] Seeding Main Navigation & Header Menus...");

  await prisma.navMenu.upsert({
    where: { id: "default_header_menu" },
    update: {
      name: "Main Navigation",
      config: DEFAULT_NAV_MENU as unknown as Prisma.InputJsonValue,
    },
    create: {
      id: "default_header_menu",
      name: "Main Navigation",
      config: DEFAULT_NAV_MENU as unknown as Prisma.InputJsonValue,
    },
  });

  console.log("  ✓ Synced navigation: default_header_menu");
  console.log("✅ [Seeder] Navigation seeded successfully.");
}

// Allow independent CLI execution: npx tsx prisma/seeds/navigation.seed.ts
if (require.main === module) {
  seedNavigation()
    .catch((err) => {
      console.error("❌ Failed to seed Navigation:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
