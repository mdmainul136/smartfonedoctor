import { PrismaClient, Prisma } from "@prisma/client";
import { INITIAL_API_CONNECTORS, INITIAL_DIRECTORIES } from "../../src/lib/listingsContext";

const prisma = new PrismaClient();

export async function seedThirdPartyApis() {
  console.log("🌱 [Seeder] Seeding Third-Party API Connectors & Directory Listings...");

  // 1. Seed API Connectors
  for (const conn of INITIAL_API_CONNECTORS) {
    await prisma.apiConnector.upsert({
      where: { id: conn.id },
      update: {
        name: conn.name,
        provider: conn.provider,
        capability: conn.capability,
        authType: conn.authType,
        connected: conn.connected,
        accountLabel: conn.accountLabel,
        lastPulled: conn.lastPulled,
        endpointDoc: conn.endpointDoc,
        locationsMatched: conn.locationsMatched,
        directoriesCovered: conn.directoriesCovered,
      },
      create: {
        id: conn.id,
        name: conn.name,
        provider: conn.provider,
        capability: conn.capability,
        authType: conn.authType,
        connected: conn.connected,
        accountLabel: conn.accountLabel,
        lastPulled: conn.lastPulled,
        endpointDoc: conn.endpointDoc,
        locationsMatched: conn.locationsMatched,
        directoriesCovered: conn.directoriesCovered,
      },
    });
    console.log(`  ✓ Synced API Connector: "${conn.name}" (${conn.id}) [${conn.authType}]`);
  }

  // 2. Seed Directory Listings
  for (const dir of INITIAL_DIRECTORIES) {
    await prisma.directoryListing.upsert({
      where: { id: dir.id },
      update: {
        name: dir.name,
        domain: dir.domain,
        tier: dir.tier,
        category: dir.category,
        syncMode: dir.syncMode,
        apiProviderId: dir.apiProviderId || null,
        portalUrl: dir.claimPortalUrl,
        stores: dir.stores as unknown as Prisma.InputJsonValue,
        overallNapMatch: dir.authority || 95,
      },
      create: {
        id: dir.id,
        name: dir.name,
        domain: dir.domain,
        tier: dir.tier,
        category: dir.category,
        syncMode: dir.syncMode,
        apiProviderId: dir.apiProviderId || null,
        portalUrl: dir.claimPortalUrl,
        stores: dir.stores as unknown as Prisma.InputJsonValue,
        overallNapMatch: dir.authority || 95,
      },
    });
    console.log(`  ✓ Synced Directory: "${dir.name}" [${dir.tier}]`);
  }

  // 3. Seed Sample Sync Logs
  const sampleLogs = [
    {
      connectorId: "google-gbp",
      action: "PULL_LOCATIONS",
      status: "Success",
      itemsSynced: 3,
      message: "Synced 3 verified locations with Google Maps CID: 15243892090",
    },
    {
      connectorId: "yelp-fusion",
      action: "NAP_VERIFICATION",
      status: "Success",
      itemsSynced: 3,
      message: "Fetched 3 business matching profiles; 1 hours mismatch noted for Store #3",
    },
    {
      connectorId: "apple-connect",
      action: "APPLE_MAPS_SYNC",
      status: "Warning",
      itemsSynced: 1,
      message: "Store #1 claimed on Apple Business Connect; Store #2 and #3 pending manual verification",
    },
  ];

  for (const log of sampleLogs) {
    await prisma.apiSyncLog.create({
      data: log,
    });
  }
  console.log(`  ✓ Created ${sampleLogs.length} recent API sync audit logs`);

  console.log("✅ [Seeder] Third-Party APIs & Directory Listings seeded successfully.");
}

// Allow independent CLI execution: npx tsx prisma/seeds/thirdPartyApis.seed.ts
if (require.main === module) {
  seedThirdPartyApis()
    .catch((err) => {
      console.error("❌ Failed to seed Third-Party APIs:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
