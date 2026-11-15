import { PrismaClient, Prisma } from "@prisma/client";
import {
  DEVICE_CATEGORIES,
  BRANDS_TAXONOMY,
  SERVICE_ISSUES_TAXONOMY,
  DEVICE_MODELS_TAXONOMY,
} from "../../src/lib/taxonomy";

const prisma = new PrismaClient();

export async function seedTaxonomies() {
  console.log("🌱 [Seeder] Seeding Taxonomy Stores (Brands, Categories, Issues, Models)...");

  const entries = [
    { id: "categories", label: "Device Categories", data: DEVICE_CATEGORIES },
    { id: "brands", label: "Hardware Brands", data: BRANDS_TAXONOMY },
    { id: "issues", label: "Service Issue Types", data: SERVICE_ISSUES_TAXONOMY },
    { id: "models", label: "Device Models", data: DEVICE_MODELS_TAXONOMY },
  ];

  for (const entry of entries) {
    await prisma.taxonomyStore.upsert({
      where: { id: entry.id },
      update: {
        data: entry.data as unknown as Prisma.InputJsonValue,
      },
      create: {
        id: entry.id,
        data: entry.data as unknown as Prisma.InputJsonValue,
      },
    });

    console.log(`  ✓ Synced taxonomy: ${entry.label} (${entry.data.length} items)`);
  }

  console.log("✅ [Seeder] Taxonomies seeded successfully.");
}

// Allow independent CLI execution: npx tsx prisma/seeds/taxonomies.seed.ts
if (require.main === module) {
  seedTaxonomies()
    .catch((err) => {
      console.error("❌ Failed to seed Taxonomies:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
