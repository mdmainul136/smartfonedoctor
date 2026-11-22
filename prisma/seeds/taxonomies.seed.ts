import { PrismaClient, Prisma } from "@prisma/client";
import {
  DEVICE_CATEGORIES,
  BRANDS_TAXONOMY,
  SERVICE_ISSUES_TAXONOMY,
  DEVICE_MODELS_TAXONOMY,
} from "../../src/lib/taxonomy";
import { CODE_CATALOG } from "../../src/lib/pSeoEngine";
import { COMMON_ISSUES_CMS } from "../../src/lib/data/commonIssuesData";

const prisma = new PrismaClient();

async function mergeMissingByKey<T extends { category: string; slug: string }>(
  id: string,
  label: string,
  defaults: T[]
) {
  const row = await prisma.taxonomyStore.findUnique({ where: { id } });
  const cur = Array.isArray(row?.data) ? (row.data as unknown as T[]) : [];
  const have = new Set(cur.map((item) => `${item.category}:${item.slug}`));
  const missing = defaults.filter((item) => !have.has(`${item.category}:${item.slug}`));
  const next = cur.length > 0 ? [...cur, ...missing] : defaults;

  if (cur.length === 0 || missing.length > 0) {
    await prisma.taxonomyStore.upsert({
      where: { id },
      update: { data: next as unknown as Prisma.InputJsonValue },
      create: { id, data: next as unknown as Prisma.InputJsonValue },
    });
  }
  console.log(`  ✓ Synced catalog store "${label}": ${next.length} items (+${missing.length} added)`);
}

export async function seedTaxonomies() {
  console.log("🌱 [Seeder] Seeding Taxonomy Stores (Brands, Categories, Issues, Models & Repair Catalog)...");

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

  // Idempotently merge pSEO repair catalog & common issues without overwriting existing admin edits
  await mergeMissingByKey("catalog-devices", "Catalog Devices", CODE_CATALOG.devices);
  await mergeMissingByKey("catalog-repairs", "Catalog Repairs", CODE_CATALOG.issues);
  await mergeMissingByKey("common-issues", "Common Issues", COMMON_ISSUES_CMS);

  console.log("✅ [Seeder] Taxonomies & Repair Catalog seeded successfully.");
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
