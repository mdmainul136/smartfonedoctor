import { PrismaClient, Prisma } from "@prisma/client";
import {
  INITIAL_API_CONNECTORS,
  INITIAL_DIRECTORIES,
  createUnverifiedStores,
  type StoreListingEntry,
} from "../../src/lib/listingsData";

const prisma = new PrismaClient();

const LEGACY_MOCK_ACCOUNT_LABELS = new Set([
  "smartfonedoctor.philly@gmail.com (3 locations)",
  "Fusion Key ••••94A2 (3 Philly stores matched)",
  "Smart Fone Doctor Business Portfolio",
  "Not connected (1 of 3 locations claimed manually)",
  "Linked to Google Business Profile OAuth",
  "Domain: smartfonedoctor.com",
  "Scanner Active · Audits 30+ directories weekly",
]);

const LEGACY_SAMPLE_LOG_MESSAGES = [
  "Synced 3 verified locations with Google Maps CID: 15243892090",
  "Fetched 3 business matching profiles; 1 hours mismatch noted for Store #3",
  "Audited 22 secondary directories; detected 2 NAP floor designation mismatches",
  "Store #1 claimed on Apple Business Connect; Store #2 and #3 pending manual verification",
];

const LEGACY_MOCK_LAST_SYNCED = new Set([
  "10 mins ago",
  "1 hour ago",
  "30 mins ago",
  "2 hours ago",
  "3 hours ago",
  "Yesterday",
  "2 days ago",
  "3 days ago",
  "5 days ago",
]);

const LEGACY_MOCK_ISSUES = new Set([
  "Saturday closing time shows 6:00 PM instead of 7:00 PM",
  "Phone number formatted without primary local area code match",
  "Location not claimed on Apple Business Connect",
  "Enable 'Import from Google Business Profile' in Bing Places",
  "Website URL points to generic root instead of location page",
  "Address missing 'Fl 2nd' floor designation",
  "Unclaimed directory listing on YP.com",
  "Profile not submitted yet",
  "Not listed for this branch",
  "Store name written as 'Smart Fone Dr' instead of 'Smart Fone Doctor'",
]);

function isLegacyMockDirectoryStores(rawStores: Prisma.JsonValue): boolean {
  if (!rawStores || typeof rawStores !== "object" || Array.isArray(rawStores)) {
    return true;
  }
  const entries = Object.values(rawStores as Record<string, unknown>);
  if (entries.length === 0) return true;

  // Never touch directories that contain real live-synced entries
  const hasRealLiveEntry = entries.some((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const synced = String((entry as { lastSynced?: unknown }).lastSynced || "");
    return synced.startsWith("Live ") || synced.includes("202");
  });
  if (hasRealLiveEntry) return false;

  return entries.some((entry) => {
    if (!entry || typeof entry !== "object") return true;
    const e = entry as Omit<Partial<StoreListingEntry>, "status"> & {
      status?: string;
      checkedAt?: unknown;
    };
    if (e.status === "unchecked") return true;
    if (e.lastSynced && LEGACY_MOCK_LAST_SYNCED.has(e.lastSynced)) return true;
    if (e.issue && LEGACY_MOCK_ISSUES.has(e.issue)) return true;
    if (e.lastSynced === "Today" && e.url?.includes("bing.com/maps")) return true;
    return false;
  });
}

export async function seedThirdPartyApis() {
  console.log("🌱 [Seeder] Syncing Third-Party API Connectors & Directory Listings (non-destructive)...");

  // 1. Seed API Connectors cleanly (never overwrite real credentials or synced state)
  for (const conn of INITIAL_API_CONNECTORS) {
    const existing = await prisma.apiConnector.findUnique({ where: { id: conn.id } });
    if (!existing) {
      await prisma.apiConnector.create({
        data: {
          id: conn.id,
          name: conn.name,
          provider: conn.provider,
          capability: conn.capability,
          authType: conn.authType,
          connected: false,
          accountLabel: "Not configured",
          lastPulled: "Never",
          endpointDoc: conn.endpointDoc,
          locationsMatched: 0,
          directoriesCovered: conn.directoriesCovered,
        },
      });
      console.log(`  ✓ Created API Connector: "${conn.name}" (${conn.id})`);
    } else {
      const hasStoredSecret =
        Boolean(existing.apiKeyEncrypted?.trim()) ||
        Boolean(existing.apiSecretEncrypted?.trim());

      // Reset legacy hardcoded mock defaults ONLY when no real token/key is stored
      if (
        !hasStoredSecret &&
        (LEGACY_MOCK_ACCOUNT_LABELS.has(existing.accountLabel || "") ||
          (existing.connected && existing.locationsMatched > 0 && existing.lastPulled !== "Never"))
      ) {
        await prisma.apiConnector.update({
          where: { id: existing.id },
          data: {
            connected: false,
            accountLabel: "Not configured",
            lastPulled: "Never",
            locationsMatched: 0,
          },
        });
        console.log(`  ✓ Reset unconfigured legacy mock state for "${conn.name}"`);
      }
    }
  }

  // 2. Seed Directory Listings non-destructively & clean legacy mock rows
  for (const dir of INITIAL_DIRECTORIES) {
    const existing = await prisma.directoryListing.findUnique({ where: { id: dir.id } });
    if (!existing) {
      await prisma.directoryListing.create({
        data: {
          id: dir.id,
          name: dir.name,
          domain: dir.domain,
          tier: dir.tier,
          category: dir.category,
          syncMode: dir.syncMode,
          apiProviderId: dir.apiProviderId || null,
          portalUrl: dir.claimPortalUrl,
          stores: createUnverifiedStores() as unknown as Prisma.InputJsonValue,
          overallNapMatch: 0,
        },
      });
      console.log(`  ✓ Created Directory: "${dir.name}" [${dir.tier}]`);
    } else {
      const patch: Prisma.DirectoryListingUpdateInput = {};
      if (!existing.apiProviderId && dir.apiProviderId) {
        patch.apiProviderId = dir.apiProviderId;
      }
      if (isLegacyMockDirectoryStores(existing.stores)) {
        patch.stores = createUnverifiedStores() as unknown as Prisma.InputJsonValue;
        patch.overallNapMatch = 0;
      }
      if (Object.keys(patch).length > 0) {
        await prisma.directoryListing.update({
          where: { id: existing.id },
          data: patch,
        });
        console.log(`  ✓ Normalized Directory: "${dir.name}"`);
      }
    }
  }

  // 3. Remove legacy hardcoded sample sync logs (never insert fake logs)
  const deletedLogs = await prisma.apiSyncLog.deleteMany({
    where: {
      message: { in: LEGACY_SAMPLE_LOG_MESSAGES },
    },
  });
  if (deletedLogs.count > 0) {
    console.log(`  ✓ Removed ${deletedLogs.count} legacy sample API sync audit log(s)`);
  }

  console.log("✅ [Seeder] Third-Party APIs & Directory Listings synced safely.");
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
